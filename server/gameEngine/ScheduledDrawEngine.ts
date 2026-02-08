import { GameEngine, GameEngineConfig, GameType } from "../services/GameRegistry";
import { rngService } from "../services/RNGService";
import { payoutService } from "../services/PayoutService";
import { webSocketService } from "../services/WebSocketService";
import { getSupabaseAdmin } from "../lib/supabase";
import { EventEmitter } from "events";

export interface ScheduledDrawConfig extends GameEngineConfig {
  scheduleType: "hourly" | "daily" | "weekly";
  drawTimeOfDay?: string; // HH:MM format
  baseJackpot: number;
  maxWinners: number;
}

/**
 * Scheduled Draw Engine: Live countdown draws with fixed times
 * Accepts entries until a scheduled time, then executes draw
 */
export class ScheduledDrawEngine extends EventEmitter implements GameEngine {
  gameId: string;
  gameType: GameType = "scheduled_draw";
  config: ScheduledDrawConfig;
  private supabase: any = null;
  private drawSchedule: NodeJS.Timeout | null = null;

  private getSupabase() {
    if (!this.supabase) {
      this.supabase = getSupabaseAdmin();
    }
    return this.supabase;
  }

  constructor(gameId: string, config: GameEngineConfig) {
    super();
    this.gameId = gameId;
    this.config = config as ScheduledDrawConfig;
    this.scheduleAutomaticDraw();
  }

  /**
   * Schedule automatic draw based on schedule type
   */
  private scheduleAutomaticDraw(): void {
    // In production, use a proper scheduler like node-cron or agenda
    // For now, use a simple interval for demonstration
    const scheduleMs =
      this.config.scheduleType === "hourly"
        ? 60 * 60 * 1000 // 1 hour
        : this.config.scheduleType === "daily"
          ? 24 * 60 * 60 * 1000 // 24 hours
          : 7 * 24 * 60 * 60 * 1000; // 7 days

    this.drawSchedule = setInterval(() => {
      // Auto-execute draw for expired rounds
      this.executeScheduledDraw();
    }, scheduleMs);
  }

  /**
   * Execute scheduled draw for expired rounds
   */
  private async executeScheduledDraw(): Promise<void> {
    const supabase = this.getSupabase();

    // Find expired rounds
    const { data: expiredRounds } = await supabase
      .from("game_rounds")
      .select("id")
      .eq("game_id", this.gameId)
      .eq("status", "registering")
      .lte("draw_time", new Date().toISOString());

    if (expiredRounds && expiredRounds.length > 0) {
      for (const round of expiredRounds) {
        try {
          await this.drawRound(round.id);
        } catch (error) {
          console.error(`Failed to draw round ${round.id}:`, error);
        }
      }
    }
  }

  /**
   * Create a new scheduled draw round
   */
  async createRound(): Promise<string> {
    const supabase = this.getSupabase();
    const now = new Date();

    // Calculate next draw time based on schedule
    let drawTime = new Date(now);
    if (this.config.scheduleType === "hourly") {
      drawTime.setHours(drawTime.getHours() + 1);
    } else if (this.config.scheduleType === "daily") {
      drawTime.setDate(drawTime.getDate() + 1);
    } else {
      drawTime.setDate(drawTime.getDate() + 7);
    }

    const { data, error } = await supabase
      .from("game_rounds")
      .insert({
        game_id: this.gameId,
        status: "registering",
        starts_at: now.toISOString(),
        draw_time: drawTime.toISOString(),
        server_seed: rngService.generateServerSeed(),
        prize_pool_gc: this.config.baseJackpot,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create round: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Validate entry for scheduled draw
   */
  async validateEntry(
    userId: string,
    entryData: any,
  ): Promise<{ valid: boolean; error?: string }> {
    const currencyType = entryData.currencyType || "GC";

    const supabase = this.getSupabase();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("gold_coins, sweep_coins")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return { valid: false, error: "User not found" };
    }

    const balance =
      currencyType === "GC" ? profile.gold_coins : profile.sweep_coins;
    const entryCost =
      currencyType === "GC" ? this.config.entryFeeGc : this.config.entryFeeSc;

    if (balance < entryCost) {
      return { valid: false, error: "Insufficient balance" };
    }

    return { valid: true };
  }

  /**
   * Process entry for scheduled draw
   */
  async processEntry(
    userId: string,
    roundId: string,
    entryData: any,
  ): Promise<string> {
    const supabase = this.getSupabase();
    const clientSeed = entryData.clientSeed;
    const currencyType = entryData.currencyType || "GC";

    const entryCost =
      currencyType === "GC" ? this.config.entryFeeGc : this.config.entryFeeSc;

    // Get round
    const { data: round, error: roundError } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (roundError || !round) {
      throw new Error("Round not found");
    }

    if (round.status !== "registering") {
      throw new Error("Round is not accepting entries");
    }

    // Create entry
    const clientSeedHash = rngService.hashSeed(clientSeed);
    const { data: entry, error: entryError } = await supabase
      .from("game_entries")
      .insert({
        round_id: roundId,
        game_id: this.gameId,
        user_id: userId,
        currency_type: currencyType,
        entry_cost: entryCost,
        client_seed: clientSeed,
        client_seed_hash: clientSeedHash,
        status: "active",
      })
      .select()
      .single();

    if (entryError) {
      throw new Error(`Failed to create entry: ${entryError.message}`);
    }

    // Broadcast entry submitted
    webSocketService.broadcastEntrySubmitted(this.gameId, roundId, {
      entryId: entry.id,
      userId,
      entryCost,
      timestamp: new Date().toISOString(),
    });

    return entry.id;
  }

  /**
   * Execute draw for scheduled time
   */
  async drawRound(roundId: string): Promise<any> {
    const supabase = this.getSupabase();

    const { data: round, error: roundError } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (roundError || !round) {
      throw new Error("Round not found");
    }

    if (round.status !== "registering") {
      return { success: false, reason: "invalid_status" };
    }

    // Get all entries
    const { data: entries, error: entriesError } = await supabase
      .from("game_entries")
      .select("*")
      .eq("round_id", roundId)
      .eq("status", "active");

    if (entriesError || !entries || entries.length === 0) {
      return { success: false, reason: "no_entries" };
    }

    // Update round status to drawing
    await supabase
      .from("game_rounds")
      .update({ status: "drawing" })
      .eq("id", roundId);

    // Select winners
    const winnerCount = Math.min(
      this.config.maxWinners || 3,
      Math.floor(entries.length / 10) || 1
    );
    const winners = [];

    for (let i = 0; i < winnerCount; i++) {
      const rngResult = await rngService.executeRNG(
        this.gameId,
        roundId,
        entries[0].client_seed,
        entries.length,
        false
      );

      const winner = entries[rngResult.value];
      winners.push(winner);
    }

    // Create result
    const { data: result } = await supabase
      .from("game_results")
      .insert({
        round_id: roundId,
        game_id: this.gameId,
        drawn_number_or_result: { winners: winners.map((w) => w.user_id) },
        is_provably_fair: true,
        verification_code: `scheduled_${roundId}`,
      })
      .select()
      .single();

    // Calculate prize per winner
    const prizePerWinner = Math.floor(round.prize_pool_gc / winners.length);

    // Process payouts for winners
    const payoutPromises = winners.map((winner) =>
      payoutService.processPayout(roundId, result.id, {
        userId: winner.user_id,
        entryId: winner.id,
        winType: "scheduled_draw_winner",
        prizeTier: 1,
        payoutAmountGc: prizePerWinner,
        payoutAmountSc: 0,
      })
    );

    await Promise.all(payoutPromises);

    // Mark winners
    for (const winner of winners) {
      await supabase
        .from("game_entries")
        .update({ status: "won" })
        .eq("id", winner.id);

      // Broadcast individual winner
      webSocketService.broadcastWinnerAnnounced(
        this.gameId,
        roundId,
        winner.user_id,
        prizePerWinner,
        "gc"
      );
    }

    // Mark losers
    for (const entry of entries) {
      if (!winners.find((w) => w.id === entry.id)) {
        await supabase
          .from("game_entries")
          .update({ status: "lost" })
          .eq("id", entry.id);
      }
    }

    // Update round status to completed
    await supabase
      .from("game_rounds")
      .update({ status: "completed" })
      .eq("id", roundId);

    return {
      success: true,
      roundId,
      winners: winners.map((w) => w.user_id),
      prizePerWinner,
    };
  }

  /**
   * Get winners
   */
  async getWinners(
    roundId: string,
  ): Promise<Array<{ userId: string; prizeAmount: number; prizeType: string }>> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from("game_payouts")
      .select("user_id, payout_amount_gc, payout_amount_sc, win_type")
      .eq("round_id", roundId)
      .eq("status", "completed");

    if (error || !data) {
      return [];
    }

    return data.map((payout) => ({
      userId: payout.user_id,
      prizeAmount: payout.payout_amount_gc + payout.payout_amount_sc,
      prizeType: payout.win_type,
    }));
  }

  /**
   * Cancel round
   */
  async cancelRound(roundId: string): Promise<void> {
    const supabase = this.getSupabase();

    await supabase
      .from("game_rounds")
      .update({ status: "cancelled" })
      .eq("id", roundId);

    await supabase
      .from("game_entries")
      .update({ status: "cancelled" })
      .eq("round_id", roundId);

    // Broadcast cancellation
    webSocketService.broadcastRoundCancelled(this.gameId, roundId, "Round cancelled");
  }

  /**
   * Get round status
   */
  async getRoundStatus(roundId: string): Promise<any> {
    const supabase = this.getSupabase();
    const { data: round, error } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (error || !round) {
      return null;
    }

    const { count: entryCount } = await supabase
      .from("game_entries")
      .select("*", { count: "exact" })
      .eq("round_id", roundId);

    return {
      ...round,
      entryCount: entryCount || 0,
    };
  }

  /**
   * Get player entries
   */
  async getPlayerEntries(userId: string, roundId: string): Promise<any[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from("game_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("round_id", roundId)
      .order("created_at", { ascending: false });

    return (data || []).map((entry) => ({
      id: entry.id,
      status: entry.status,
      entryCost: entry.entry_cost,
      currencyType: entry.currency_type,
      createdAt: entry.created_at,
    }));
  }

  /**
   * Get round statistics
   */
  async getRoundStats(roundId: string): Promise<any> {
    const supabase = this.getSupabase();

    const { count: totalEntries } = await supabase
      .from("game_entries")
      .select("*", { count: "exact" })
      .eq("round_id", roundId);

    const { count: winCount } = await supabase
      .from("game_entries")
      .select("*", { count: "exact" })
      .eq("round_id", roundId)
      .eq("status", "won");

    const { data: payouts } = await supabase
      .from("game_payouts")
      .select("payout_amount_gc, payout_amount_sc")
      .eq("round_id", roundId)
      .eq("status", "completed");

    const totalPayout = payouts
      ?.reduce(
        (sum, p) => sum + (p.payout_amount_gc + p.payout_amount_sc),
        0
      ) || 0;

    return {
      totalEntries: totalEntries || 0,
      wins: winCount || 0,
      winRate: totalEntries ? ((winCount || 0) / totalEntries) * 100 : 0,
      totalPayout,
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.drawSchedule) {
      clearInterval(this.drawSchedule);
    }
  }
}
