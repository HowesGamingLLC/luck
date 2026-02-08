import { GameEngine, GameEngineConfig, GameType } from "../services/GameRegistry";
import { rngService } from "../services/RNGService";
import { payoutService } from "../services/PayoutService";
import { webSocketService } from "../services/WebSocketService";
import { getSupabaseAdmin } from "../lib/supabase";
import { EventEmitter } from "events";

export interface ProgressiveJackpotConfig extends GameEngineConfig {
  jackpotIncrement: number;
  minJackpot: number;
  maxJackpot: number;
  resetThreshold: number;
}

/**
 * Progressive Jackpot Engine: Linked prize pools that grow with each entry
 * Prize pool accumulates and resets when a winner is selected
 */
export class ProgressiveJackpotEngine extends EventEmitter implements GameEngine {
  gameId: string;
  gameType: GameType = "progressive_jackpot";
  config: ProgressiveJackpotConfig;
  private supabase: any = null;
  private currentJackpot = 0;

  private getSupabase() {
    if (!this.supabase) {
      this.supabase = getSupabaseAdmin();
    }
    return this.supabase;
  }

  constructor(gameId: string, config: GameEngineConfig) {
    super();
    this.gameId = gameId;
    this.config = config as ProgressiveJackpotConfig;
    this.currentJackpot = (this.config as ProgressiveJackpotConfig).minJackpot || 10000;
  }

  /**
   * Create a new progressive jackpot round
   */
  async createRound(): Promise<string> {
    const supabase = this.getSupabase();
    const now = new Date();

    const { data, error } = await supabase
      .from("game_rounds")
      .insert({
        game_id: this.gameId,
        status: "registering",
        starts_at: now.toISOString(),
        draw_time: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24h later
        server_seed: rngService.generateServerSeed(),
        prize_pool_gc: this.currentJackpot,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create round: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Validate entry for progressive jackpot
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
   * Process entry and increment jackpot
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

    // Increment jackpot
    const newJackpot = this.currentJackpot + this.config.jackpotIncrement;
    this.currentJackpot =
      newJackpot > this.config.maxJackpot
        ? this.config.maxJackpot
        : newJackpot;

    // Update round with new jackpot
    await supabase
      .from("game_rounds")
      .update({ prize_pool_gc: this.currentJackpot })
      .eq("id", roundId);

    // Broadcast jackpot update
    webSocketService.broadcastRoundStatus(
      this.gameId,
      roundId,
      "registering",
      round.entry_count + 1,
      this.currentJackpot
    );

    return entry.id;
  }

  /**
   * Execute draw for progressive jackpot
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

    // Get all entries
    const { data: entries, error: entriesError } = await supabase
      .from("game_entries")
      .select("*")
      .eq("round_id", roundId)
      .eq("status", "active");

    if (entriesError || !entries || entries.length === 0) {
      return { success: false, reason: "no_entries" };
    }

    // Select winner using RNG
    const rngResult = await rngService.executeRNG(
      this.gameId,
      roundId,
      entries[0].client_seed,
      entries.length,
      false
    );

    const winnerIndex = rngResult.value;
    const winner = entries[winnerIndex];

    // Create result
    const { data: result } = await supabase
      .from("game_results")
      .insert({
        round_id: roundId,
        game_id: this.gameId,
        drawn_number_or_result: { winner_id: winner.user_id },
        is_provably_fair: true,
        verification_code: `jackpot_${roundId}`,
      })
      .select()
      .single();

    // Process payout with entire jackpot
    if (result) {
      await payoutService.processPayout(roundId, result.id, {
        userId: winner.user_id,
        entryId: winner.id,
        winType: "jackpot_winner",
        prizeTier: 1,
        payoutAmountGc: this.currentJackpot,
        payoutAmountSc: 0,
      });

      // Mark winner entry
      await supabase
        .from("game_entries")
        .update({ status: "won" })
        .eq("id", winner.id);

      // Mark loser entries
      for (const entry of entries) {
        if (entry.id !== winner.id) {
          await supabase
            .from("game_entries")
            .update({ status: "lost" })
            .eq("id", entry.id);
        }
      }

      // Broadcast winner
      webSocketService.broadcastWinnerAnnounced(
        this.gameId,
        roundId,
        winner.user_id,
        this.currentJackpot,
        "gc"
      );

      // Send personal notification
      webSocketService.sendUserNotification(winner.user_id, {
        type: "jackpot_winner",
        gameId: this.gameId,
        jackpotAmount: this.currentJackpot,
        message: `🎉 You won the progressive jackpot of ${this.currentJackpot} GC!`,
      });

      // Reset jackpot
      this.currentJackpot = this.config.minJackpot;
    }

    return {
      success: true,
      roundId,
      winner: winner.user_id,
      jackpotAmount: this.currentJackpot,
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
      currentJackpot: this.currentJackpot,
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

    const { count: uniquePlayers } = await supabase
      .from("game_entries")
      .select("user_id", { count: "exact" })
      .eq("round_id", roundId);

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
      uniquePlayers: uniquePlayers || 0,
      currentJackpot: this.currentJackpot,
      totalPayout,
    };
  }
}
