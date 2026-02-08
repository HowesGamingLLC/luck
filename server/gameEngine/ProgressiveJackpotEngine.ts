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
export class ProgressiveJackpotEngine
  extends EventEmitter
  implements GameEngine
{
  gameId: string;
  gameType: GameType = "progressive_jackpot";
  config: ProgressiveJackpotConfig;
  private currentJackpot = 0;

  constructor(gameId: string, config: GameEngineConfig) {
    super();
    this.gameId = gameId;
    this.config = config as ProgressiveJackpotConfig;
    this.currentJackpot =
      (this.config as ProgressiveJackpotConfig).minJackpot || 10000;
  }

  /**
   * Create a new progressive jackpot round
   */
  async createRound(): Promise<string> {
    const now = new Date();

    const round = await roundsQueries.create({
      game_id: this.gameId,
      status: "registering",
      start_time: now,
      draw_time: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      server_seed: rngService.generateServerSeed(),
      prize_pool_gc: this.currentJackpot,
    });

    return round.id;
  }

  /**
   * Validate entry for progressive jackpot
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
   * Process entry and increment jackpot
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

    // Create entry
    const entry = await entriesQueries.create({
      round_id: roundId,
      user_id: userId,
      status: "active",
      entry_cost: entryCost,
      currency_type: currencyType,
      client_seed: clientSeed,
    });

    // Increment jackpot
    const newJackpot = this.currentJackpot + this.config.jackpotIncrement;
    this.currentJackpot =
      newJackpot > this.config.maxJackpot ? this.config.maxJackpot : newJackpot;

    // Update round with new jackpot
    await roundsQueries.update(roundId, { prize_pool_gc: this.currentJackpot });

    // Broadcast jackpot update
    const entryCount = await entriesQueries.countByRoundId(roundId);
    webSocketService.broadcastRoundStatus(
      this.gameId,
      roundId,
      "registering",
      entryCount,
      this.currentJackpot,
    );

    return entry.id;
  }

  /**
   * Execute draw for progressive jackpot
   */
  async drawRound(roundId: string): Promise<any> {
    const round = await roundsQueries.getById(roundId);

    if (!round) {
      throw new Error("Round not found");
    }

    // Get all entries
    const entries = await entriesQueries.getByRoundId(roundId, "active");

    if (!entries || entries.length === 0) {
      return { success: false, reason: "no_entries" };
    }

    // Select winner using RNG
    const rngResult = await rngService.executeRNG(
      this.gameId,
      roundId,
      entries[0].client_seed || "default",
      entries.length,
      false,
    );

    const winnerIndex = rngResult.value;
    const winner = entries[winnerIndex];

    // Create result
    const result = await resultsQueries.create({
      round_id: roundId,
      user_id: winner.user_id,
      outcome: "won",
      payout_amount_gc: this.currentJackpot,
      payout_amount_sc: 0,
      verification_code: `jackpot_${roundId}`,
    });

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
      await entriesQueries.update(winner.id, { status: "won" });

      // Mark loser entries
      for (const entry of entries) {
        if (entry.id !== winner.id) {
          await entriesQueries.update(entry.id, { status: "lost" });
        }
      }

      // Broadcast winner
      webSocketService.broadcastWinnerAnnounced(
        this.gameId,
        roundId,
        winner.user_id,
        this.currentJackpot,
        "gc",
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
   * Cancel round
   */
  async cancelRound(roundId: string): Promise<void> {
    await roundsQueries.update(roundId, { status: "cancelled" });

    const entries = await entriesQueries.getByRoundId(roundId);
    for (const entry of entries) {
      await entriesQueries.update(entry.id, { status: "cancelled" });
    }
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
      currentJackpot: this.currentJackpot,
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

    // Get unique player count
    const uniquePlayersResult = await query(
      `SELECT DISTINCT user_id FROM game_entries WHERE round_id = $1`,
      [roundId],
    );
    const uniquePlayers = uniquePlayersResult.rows.length;

    const payouts = await payoutsQueries.getByRoundId(roundId);
    const totalPayout = payouts.reduce(
      (sum, p) => sum + ((p.payout_amount_gc || 0) + (p.payout_amount_sc || 0)),
      0,
    );

    return {
      totalEntries,
      uniquePlayers,
      currentJackpot: this.currentJackpot,
      totalPayout,
    };
  }
}
