import { GameEngine, GameEngineConfig } from "../services/GameRegistry";
import { rngService } from "../services/RNGService";
import { payoutService } from "../services/PayoutService";
import { entryValidationService } from "../services/EntryValidationService";
import { webSocketService } from "../services/WebSocketService";
import { getSupabaseAdmin } from "../lib/supabase";
import { EventEmitter } from "events";

export interface PooledDrawConfig extends GameEngineConfig {
  poolDrawIntervalMinutes: number;
  maxPoolEntries: number;
  baseJackpotGc: number;
  baseJackpotSc: number;
  winnerCount: number;
  drawSchedule?: string; // cron-like schedule
}

export interface DrawRoundData {
  roundId: string;
  status: "pending" | "registering" | "live" | "drawing" | "completed" | "cancelled";
  totalEntries: number;
  uniquePlayers: number;
  prizePoolGc: number;
  prizePoolSc: number;
  nextDrawTime: Date;
  winners: Array<{
    userId: string;
    entryId: string;
    prizeGc: number;
    prizeSc: number;
  }>;
}

/**
 * Pooled Draw Engine: Timed lottery-style games where entries accumulate
 * until a scheduled draw time, then winners are selected randomly
 * 
 * Example: "Daily Jackpot at 8 PM - Win from accumulated prize pool"
 */
export class PooledDrawEngine extends EventEmitter implements GameEngine {
  gameId: string;
  config: PooledDrawConfig;
  private supabase: any = null;
  private currentRound: DrawRoundData | null = null;
  private drawTimer: NodeJS.Timeout | null = null;

  private getSupabase() {
    if (!this.supabase) {
      this.supabase = getSupabaseAdmin();
    }
    return this.supabase;
  }

  constructor(gameId: string, config: GameEngineConfig) {
    super();
    this.gameId = gameId;
    this.config = config as PooledDrawConfig;
    this.initializeRound();
  }

  /**
   * Initialize a new draw round
   */
  async createRound(): Promise<string> {
    const supabase = this.getSupabase();
    const now = new Date();
    const nextDraw = new Date(
      now.getTime() + (this.config.poolDrawIntervalMinutes || 60) * 60 * 1000,
    );

    // Generate server seed at round creation
    const serverSeed = rngService.generateServerSeed();
    const serverSeedHash = rngService.hashSeed(serverSeed);

    // Create round in database
    const { data, error } = await supabase
      .from("game_rounds")
      .insert({
        game_id: this.gameId,
        config_id: "default", // TODO: use actual config ID
        round_number: Math.floor(Date.now() / (this.config.poolDrawIntervalMinutes || 60) / 60 / 1000),
        status: "registering",
        starts_at: now.toISOString(),
        draw_time: nextDraw.toISOString(),
        server_seed: serverSeed,
        server_seed_hash: serverSeedHash,
        client_seed_required: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create round: ${error.message}`);
    }

    const roundId = data.id;

    // Initialize round state
    this.currentRound = {
      roundId,
      status: "registering",
      totalEntries: 0,
      uniquePlayers: 0,
      prizePoolGc: this.config.baseJackpotGc || 0,
      prizePoolSc: this.config.baseJackpotSc || 0,
      nextDrawTime: nextDraw,
      winners: [],
    };

    // Schedule draw
    this.scheduleDraw(roundId, nextDraw);

    this.emit("roundCreated", { roundId, nextDrawTime: nextDraw });
    return roundId;
  }

  /**
   * Validate and process entry
   */
  async validateEntry(
    userId: string,
    entryData: {
      clientSeed: string;
      roundId: string;
      currencyType: "GC" | "SC";
    },
  ): Promise<{ valid: boolean; error?: string }> {
    // Validate client seed format
    if (!rngService.validateClientSeed(entryData.clientSeed)) {
      return { valid: false, error: "Invalid client seed format" };
    }

    // Get user balance
    const balance = await entryValidationService.getUserBalance(userId);

    // Get current round config
    const entryAmount =
      entryData.currencyType === "GC"
        ? this.config.entryFeeGc
        : this.config.entryFeeSc;

    // Validate entry
    const validation = await entryValidationService.validateEntry(
      userId,
      this.gameId,
      entryData.roundId,
      entryAmount,
      entryData.currencyType,
      balance,
      this.config.maxEntriesPerUser,
    );

    return validation;
  }

  /**
   * Process entry into game
   */
  async processEntry(
    userId: string,
    roundId: string,
    entryData: any,
  ): Promise<string> {
    const clientSeed = entryData.clientSeed;
    const currencyType = entryData.currencyType || "GC";

    const entryAmount =
      currencyType === "GC"
        ? this.config.entryFeeGc
        : this.config.entryFeeSc;

    // Hash client seed
    const clientSeedHash = rngService.hashSeed(clientSeed);

    // Create entry record
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from("game_entries")
      .insert({
        round_id: roundId,
        game_id: this.gameId,
        user_id: userId,
        currency_type: entryData.currencyType,
        entry_cost: entryAmount,
        client_seed: entryData.clientSeed,
        client_seed_hash: clientSeedHash,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create entry: ${error.message}`);
    }

    const entryId = data.id;

    // Deduct balance
    // TODO: Implement actual balance deduction

    // Update round stats
    if (this.currentRound?.roundId === entryData.roundId) {
      this.currentRound.totalEntries++;
      this.currentRound.prizePoolGc += entryAmount;
    }

    this.emit("entryProcessed", { entryId, userId, roundId: entryData.roundId });
    return entryId;
  }

  /**
   * Execute draw and select winners
   */
  async drawRound(roundId: string): Promise<any> {
    const supabase = this.getSupabase();
    const round = this.currentRound;
    if (!round || round.roundId !== roundId) {
      throw new Error("Round not found");
    }

    if (round.totalEntries === 0) {
      // No entries - cancel and refund
      await this.cancelRound(roundId);
      return { success: false, reason: "no_entries" };
    }

    round.status = "drawing";

    // Get all entries for this round
    const { data: entries, error: entriesError } = await supabase
      .from("game_entries")
      .select("*")
      .eq("round_id", roundId)
      .eq("status", "active");

    if (entriesError || !entries || entries.length === 0) {
      round.status = "completed";
      return { success: false, reason: "no_entries" };
    }

    // Execute RNG for each winner position
    const winnerCount = Math.min(
      this.config.winnerCount || 1,
      entries.length,
    );

    const winnerIndices = new Set<number>();

    for (let i = 0; i < winnerCount; i++) {
      // Get server seed from round
      const { data: roundData } = await supabase
        .from("game_rounds")
        .select("server_seed")
        .eq("id", roundId)
        .single();

      if (!roundData?.server_seed) {
        throw new Error("Server seed not found");
      }

      // Get any client seed from an entry
      const firstEntry = entries[0];

      // Execute RNG
      const rngResult = await rngService.executeRNG(
        this.gameId,
        roundId,
        firstEntry.client_seed || "default",
        entries.length,
        false, // Don't auto-log yet
      );

      const winnerIndex = rngResult.value;

      // Ensure unique winners
      if (!winnerIndices.has(winnerIndex)) {
        winnerIndices.add(winnerIndex);

        const winner = entries[winnerIndex];
        round.winners.push({
          userId: winner.user_id,
          entryId: winner.id,
          prizeGc: round.prizePoolGc / winnerCount,
          prizeSc: round.prizePoolSc / winnerCount,
        });
      }
    }

    // Create result record
    const { data: resultData } = await supabase
      .from("game_results")
      .insert({
        round_id: roundId,
        game_id: this.gameId,
        server_seed_used: "", // TODO
        drawn_number_or_result: { winners: round.winners },
        is_provably_fair: true,
        verification_code: "pending",
      })
      .select()
      .single();

    const resultId = resultData?.id;

    // Process payouts
    const payouts = round.winners.map((winner) => ({
      userId: winner.userId,
      entryId: winner.entryId,
      winType: "jackpot_winner",
      prizeTier: 1,
      payoutAmountGc: winner.prizeGc,
      payoutAmountSc: winner.prizeSc,
    }));

    if (resultId) {
      await payoutService.processRoundPayouts(roundId, resultId, payouts);
    }

    // Mark winning entries and broadcast winner announcements
    for (const winner of round.winners) {
      await supabase
        .from("game_entries")
        .update({ status: "won" })
        .eq("id", winner.entryId);

      // Broadcast individual winner announcement via WebSocket
      webSocketService.broadcastWinnerAnnounced(
        this.gameId,
        roundId,
        winner.userId,
        winner.prizeGc + winner.prizeSc, // Total prize value
        winner.prizeGc > 0 ? "gc_and_sc" : "sc"
      );

      // Send personal notification to winner
      webSocketService.sendUserNotification(winner.userId, {
        type: "you_won",
        gameId: this.gameId,
        roundId,
        prizeGc: winner.prizeGc,
        prizeSc: winner.prizeSc,
        message: `Congratulations! You won ${winner.prizeGc} GC and ${winner.prizeSc} SC!`,
      });
    }

    round.status = "completed";

    this.emit("roundDrawn", {
      roundId,
      winners: round.winners,
      totalEntries: round.totalEntries,
    });

    return {
      success: true,
      roundId,
      winnerCount: round.winners.length,
      winners: round.winners,
    };
  }

  /**
   * Get winners for a round
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
   * Cancel a round
   */
  async cancelRound(roundId: string): Promise<void> {
    const supabase = this.getSupabase();
    // Refund all entries
    const { data: entries } = await supabase
      .from("game_entries")
      .select("*")
      .eq("round_id", roundId)
      .eq("status", "active");

    // TODO: Process refunds

    // Mark entries as cancelled
    await supabase
      .from("game_entries")
      .update({ status: "cancelled" })
      .eq("round_id", roundId);

    // Mark round as cancelled
    await supabase
      .from("game_rounds")
      .update({ status: "cancelled" })
      .eq("id", roundId);

    if (this.currentRound?.roundId === roundId) {
      this.currentRound.status = "cancelled";
    }

    this.emit("roundCancelled", { roundId });
  }

  /**
   * Get round status
   */
  async getRoundStatus(roundId: string): Promise<any> {
    const supabase = this.getSupabase();
    const { data } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    return data;
  }

  /**
   * Get player entries for a round
   */
  async getPlayerEntries(userId: string, roundId: string): Promise<any[]> {
    const supabase = this.getSupabase();
    const { data } = await supabase
      .from("game_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("round_id", roundId);

    return data || [];
  }

  /**
   * Get round statistics
   */
  async getRoundStats(roundId: string): Promise<any> {
    const supabase = this.getSupabase();
    const { data: round } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    const { count: entryCount } = await supabase
      .from("game_entries")
      .select("*", { count: "exact" })
      .eq("round_id", roundId)
      .eq("status", "active");

    return {
      ...round,
      activeEntries: entryCount,
    };
  }

  /**
   * Schedule draw execution
   */
  private scheduleDraw(roundId: string, drawTime: Date): void {
    const delay = drawTime.getTime() - Date.now();

    if (delay > 0) {
      this.drawTimer = setTimeout(async () => {
        try {
          await this.drawRound(roundId);
        } catch (error) {
          console.error("Draw execution failed:", error);
          this.emit("drawError", { roundId, error });
        }
      }, delay);
    }
  }

  /**
   * Initialize a new round
   */
  private async initializeRound(): Promise<void> {
    try {
      await this.createRound();
    } catch (error) {
      console.error("Failed to initialize round:", error);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.drawTimer) {
      clearTimeout(this.drawTimer);
    }
  }
}
