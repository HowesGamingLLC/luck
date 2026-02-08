import { GameEngine, GameEngineConfig } from "../services/GameRegistry";
import { rngService } from "../services/RNGService";
import { payoutService } from "../services/PayoutService";
import { entryValidationService } from "../services/EntryValidationService";
import { webSocketService } from "../services/WebSocketService";
import { query } from "../lib/db";
import {
  roundsQueries,
  entriesQueries,
  resultsQueries,
  payoutsQueries,
} from "../lib/db-queries";
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
  status:
    | "pending"
    | "registering"
    | "live"
    | "drawing"
    | "completed"
    | "cancelled";
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
  gameType: "pooled_draw" = "pooled_draw";
  config: PooledDrawConfig;
  private currentRound: DrawRoundData | null = null;
  private drawTimer: NodeJS.Timeout | null = null;

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
    const now = new Date();
    const nextDraw = new Date(
      now.getTime() + (this.config.poolDrawIntervalMinutes || 60) * 60 * 1000,
    );

    // Generate server seed at round creation
    const serverSeed = rngService.generateServerSeed();

    // Create round in database
    const round = await roundsQueries.create({
      game_id: this.gameId,
      status: "registering",
      start_time: now,
      draw_time: nextDraw,
      server_seed: serverSeed,
      prize_pool_gc: this.config.baseJackpotGc || 0,
      prize_pool_sc: this.config.baseJackpotSc || 0,
    });

    const roundId = round.id;

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
      currencyType === "GC" ? this.config.entryFeeGc : this.config.entryFeeSc;

    // Create entry record
    const entry = await entriesQueries.create({
      round_id: roundId,
      user_id: userId,
      status: "active",
      entry_cost: entryAmount,
      currency_type: currencyType,
      client_seed: clientSeed,
    });

    const entryId = entry.id;

    // Deduct balance
    // TODO: Implement actual balance deduction

    // Update round stats
    if (this.currentRound?.roundId === roundId) {
      this.currentRound.totalEntries++;
      this.currentRound.prizePoolGc += entryAmount;
    }

    this.emit("entryProcessed", {
      entryId,
      userId,
      roundId: roundId,
    });
    return entryId;
  }

  /**
   * Execute draw and select winners
   */
  async drawRound(roundId: string): Promise<any> {
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
    const entries = await entriesQueries.getByRoundId(roundId, "active");

    if (!entries || entries.length === 0) {
      round.status = "completed";
      return { success: false, reason: "no_entries" };
    }

    // Get round for server seed
    const roundData = await roundsQueries.getById(roundId);
    if (!roundData?.server_seed) {
      throw new Error("Server seed not found");
    }

    // Execute RNG for each winner position
    const winnerCount = Math.min(this.config.winnerCount || 1, entries.length);
    const winnerIndices = new Set<number>();

    for (let i = 0; i < winnerCount; i++) {
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
    const result = await resultsQueries.create({
      round_id: roundId,
      user_id: round.winners[0]?.userId || "system",
      outcome: "drawn",
      payout_amount_gc: round.prizePoolGc,
      payout_amount_sc: round.prizePoolSc,
      verification_code: "pending",
    });

    // Process payouts
    const payouts = round.winners.map((winner) => ({
      userId: winner.userId,
      entryId: winner.entryId,
      winType: "jackpot_winner",
      prizeTier: 1,
      payoutAmountGc: winner.prizeGc,
      payoutAmountSc: winner.prizeSc,
    }));

    if (result) {
      await payoutService.processRoundPayouts(roundId, result.id, payouts);
    }

    // Mark winning entries and broadcast winner announcements
    for (const winner of round.winners) {
      await entriesQueries.update(winner.entryId, { status: "won" });

      // Broadcast individual winner announcement via WebSocket
      webSocketService.broadcastWinnerAnnounced(
        this.gameId,
        roundId,
        winner.userId,
        winner.prizeGc + winner.prizeSc, // Total prize value
        winner.prizeGc > 0 ? "gc_and_sc" : "sc",
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
  ): Promise<
    Array<{ userId: string; prizeAmount: number; prizeType: string }>
  > {
    const payouts = await payoutsQueries.getByRoundId(roundId);

    return payouts.map((payout) => ({
      userId: payout.user_id,
      prizeAmount:
        (payout.payout_amount_gc || 0) + (payout.payout_amount_sc || 0),
      prizeType: payout.win_type || "jackpot",
    }));
  }

  /**
   * Cancel a round
   */
  async cancelRound(roundId: string): Promise<void> {
    // Get all entries
    const entries = await entriesQueries.getByRoundId(roundId, "active");

    // TODO: Process refunds for all entries

    // Mark entries as cancelled
    for (const entry of entries) {
      await entriesQueries.update(entry.id, { status: "cancelled" });
    }

    // Mark round as cancelled
    await roundsQueries.update(roundId, { status: "cancelled" });

    if (this.currentRound?.roundId === roundId) {
      this.currentRound.status = "cancelled";
    }

    this.emit("roundCancelled", { roundId });
  }

  /**
   * Get round status
   */
  async getRoundStatus(roundId: string): Promise<any> {
    return await roundsQueries.getById(roundId);
  }

  /**
   * Get player entries for a round
   */
  async getPlayerEntries(userId: string, roundId: string): Promise<any[]> {
    return await query(
      `SELECT * FROM game_entries WHERE user_id = $1 AND round_id = $2`,
      [userId, roundId],
    ).then((result) => result.rows);
  }

  /**
   * Get round statistics
   */
  async getRoundStats(roundId: string): Promise<any> {
    const round = await roundsQueries.getById(roundId);
    const entryCount = await entriesQueries.countByRoundId(roundId, "active");

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
