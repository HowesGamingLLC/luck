import {
  GameEngine,
  GameEngineConfig,
  GameType,
} from "../services/GameRegistry";
import { rngService } from "../services/RNGService";
import { payoutService } from "../services/PayoutService";
import { webSocketService } from "../services/WebSocketService";
import { query } from "../lib/db";
import {
  roundsQueries,
  entriesQueries,
  resultsQueries,
  payoutsQueries,
} from "../lib/db-queries";
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
  private drawSchedule: NodeJS.Timeout | null = null;

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
    // Find expired rounds
    const result = await query(
      `SELECT id FROM game_rounds WHERE game_id = $1 AND status = 'registering' AND draw_time <= NOW()`,
      [this.gameId],
    );

    const expiredRounds = result.rows || [];

    if (expiredRounds.length > 0) {
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

    const round = await roundsQueries.create({
      game_id: this.gameId,
      status: "registering",
      start_time: now,
      draw_time: drawTime,
      server_seed: rngService.generateServerSeed(),
      prize_pool_gc: this.config.baseJackpot,
    });

    return round.id;
  }

  /**
   * Validate entry for scheduled draw
   */
  async validateEntry(
    userId: string,
    entryData: any,
  ): Promise<{ valid: boolean; error?: string }> {
    const currencyType = entryData.currencyType || "GC";

    const result = await query(
      `SELECT gold_coins_balance, sweep_coins_balance FROM profiles WHERE user_id = $1`,
      [userId],
    );

    const profile = result.rows[0];

    if (!profile) {
      return { valid: false, error: "User not found" };
    }

    const balance =
      currencyType === "GC"
        ? profile.gold_coins_balance
        : profile.sweep_coins_balance;
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
    const clientSeed = entryData.clientSeed;
    const currencyType = entryData.currencyType || "GC";

    const entryCost =
      currencyType === "GC" ? this.config.entryFeeGc : this.config.entryFeeSc;

    // Get round
    const round = await roundsQueries.getById(roundId);

    if (!round) {
      throw new Error("Round not found");
    }

    if (round.status !== "registering") {
      throw new Error("Round is not accepting entries");
    }

    // Create entry
    const entry = await entriesQueries.create({
      round_id: roundId,
      user_id: userId,
      status: "active",
      entry_cost: entryCost,
      currency_type: currencyType,
      client_seed: clientSeed,
    });

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
    const round = await roundsQueries.getById(roundId);

    if (!round) {
      throw new Error("Round not found");
    }

    if (round.status !== "registering") {
      return { success: false, reason: "invalid_status" };
    }

    // Get all entries
    const entries = await entriesQueries.getByRoundId(roundId, "active");

    if (!entries || entries.length === 0) {
      return { success: false, reason: "no_entries" };
    }

    // Update round status to drawing
    await roundsQueries.update(roundId, { status: "drawing" });

    // Select winners
    const winnerCount = Math.min(
      this.config.maxWinners || 3,
      Math.floor(entries.length / 10) || 1,
    );
    const winners = [];

    for (let i = 0; i < winnerCount; i++) {
      const rngResult = await rngService.executeRNG(
        this.gameId,
        roundId,
        entries[0].client_seed || "default",
        entries.length,
        false,
      );

      const winner = entries[rngResult.value];
      winners.push(winner);
    }

    // Create result
    const result = await resultsQueries.create({
      round_id: roundId,
      user_id: winners[0]?.user_id || "system",
      outcome: "drawn",
      payout_amount_gc: round.prize_pool_gc || 0,
      payout_amount_sc: 0,
      verification_code: `scheduled_${roundId}`,
    });

    // Calculate prize per winner
    const prizePerWinner = Math.floor(
      (round.prize_pool_gc || 0) / winners.length,
    );

    // Process payouts for winners
    const payoutPromises = winners.map((winner) =>
      payoutService.processPayout(roundId, result.id, {
        userId: winner.user_id,
        entryId: winner.id,
        winType: "scheduled_draw_winner",
        prizeTier: 1,
        payoutAmountGc: prizePerWinner,
        payoutAmountSc: 0,
      }),
    );

    await Promise.all(payoutPromises);

    // Mark winners
    for (const winner of winners) {
      await entriesQueries.update(winner.id, { status: "won" });

      // Broadcast individual winner
      webSocketService.broadcastWinnerAnnounced(
        this.gameId,
        roundId,
        winner.user_id,
        prizePerWinner,
        "gc",
      );
    }

    // Mark losers
    for (const entry of entries) {
      if (!winners.find((w) => w.id === entry.id)) {
        await entriesQueries.update(entry.id, { status: "lost" });
      }
    }

    // Update round status to completed
    await roundsQueries.update(roundId, { status: "completed" });

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
  ): Promise<
    Array<{ userId: string; prizeAmount: number; prizeType: string }>
  > {
    const payouts = await payoutsQueries.getByRoundId(roundId);

    return payouts.map((payout) => ({
      userId: payout.user_id,
      prizeAmount:
        (payout.payout_amount_gc || 0) + (payout.payout_amount_sc || 0),
      prizeType: payout.win_type || "scheduled_draw",
    }));
  }

  /**
   * Cancel round
   */
  async cancelRound(roundId: string): Promise<void> {
    await roundsQueries.update(roundId, { status: "cancelled" });

    const entries = await entriesQueries.getByRoundId(roundId);
    for (const entry of entries) {
      await entriesQueries.update(entry.id, { status: "cancelled" });
    }

    // Broadcast cancellation
    webSocketService.broadcastRoundCancelled(
      this.gameId,
      roundId,
      "Round cancelled",
    );
  }

  /**
   * Get round status
   */
  async getRoundStatus(roundId: string): Promise<any> {
    const round = await roundsQueries.getById(roundId);

    if (!round) {
      return null;
    }

    const entryCount = await entriesQueries.countByRoundId(roundId);

    return {
      ...round,
      entryCount,
    };
  }

  /**
   * Get player entries
   */
  async getPlayerEntries(userId: string, roundId: string): Promise<any[]> {
    const entries = await query(
      `SELECT * FROM game_entries WHERE user_id = $1 AND round_id = $2 ORDER BY created_at DESC`,
      [userId, roundId],
    ).then((result) => result.rows);

    return (entries || []).map((entry) => ({
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
    const entries = await entriesQueries.getByRoundId(roundId);
    const totalEntries = entries.length;
    const winCount = entries.filter((e) => e.status === "won").length;

    const payouts = await payoutsQueries.getByRoundId(roundId);
    const totalPayout = payouts.reduce(
      (sum, p) => sum + ((p.payout_amount_gc || 0) + (p.payout_amount_sc || 0)),
      0,
    );

    return {
      totalEntries,
      wins: winCount,
      winRate: totalEntries ? (winCount / totalEntries) * 100 : 0,
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
