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

/**
 * Instant Win Engine: Spin-based games with immediate results
 * Games like slots, scratches, spins with instant outcome determination
 */
export class InstantWinEngine implements GameEngine {
  gameId: string;
  gameType: GameType = "instant_win";
  config: GameEngineConfig;

  constructor(gameId: string, config: GameEngineConfig) {
    this.gameId = gameId;
    this.config = config;
  }

  /**
   * Create a new instant-win "round" (actually a single spin session)
   */
  async createRound(): Promise<string> {
    const now = new Date();

    // For instant win games, a "round" is just a session
    const round = await roundsQueries.create({
      game_id: this.gameId,
      status: "registering",
      start_time: now,
      draw_time: now,
      server_seed: rngService.generateServerSeed(),
    });

    return round.id;
  }

  /**
   * Validate entry for instant win game
   */
  async validateEntry(
    userId: string,
    entryData: any,
  ): Promise<{ valid: boolean; error?: string }> {
    const clientSeed = entryData.clientSeed;
    const currencyType = entryData.currencyType || "GC";

    if (!clientSeed) {
      return { valid: false, error: "Client seed required" };
    }

    // Get user profile
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
   * Process instant win spin with immediate result
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

    // Get round for server seed
    const round = await roundsQueries.getById(roundId);

    if (!round) {
      throw new Error("Round not found");
    }

    // Create entry record
    const entry = await entriesQueries.create({
      round_id: roundId,
      user_id: userId,
      status: "active",
      entry_cost: entryCost,
      currency_type: currencyType,
      client_seed: clientSeed,
    });

    // Execute RNG immediately for instant result
    const rngResult = await rngService.executeRNG(
      this.gameId,
      roundId,
      clientSeed,
      100, // 1-100 for win probability
      false,
    );

    // Determine win based on RTP percentage
    const winThreshold = this.config.rtpPercentage || 85;
    const isWin = rngResult.value <= winThreshold;

    let prizeGc = 0;
    let prizeSc = 0;

    if (isWin) {
      // Calculate prize based on entry cost and multiplier
      const winMultiplier = 2.5; // 2.5x return
      if (currencyType === "GC") {
        prizeGc = Math.floor(entryCost * winMultiplier);
      } else {
        prizeSc = Math.floor(entryCost * winMultiplier);
      }

      // Create result record
      const result = await resultsQueries.create({
        round_id: roundId,
        user_id: userId,
        outcome: "win",
        payout_amount_gc: prizeGc,
        payout_amount_sc: prizeSc,
        verification_code: `instant_${roundId}_${entry.id}`,
      });

      if (result) {
        // Process payout immediately
        await payoutService.processPayout(roundId, result.id, {
          userId,
          entryId: entry.id,
          winType: "instant_win",
          prizeTier: 1,
          payoutAmountGc: prizeGc,
          payoutAmountSc: prizeSc,
        });

        // Mark entry as won
        await entriesQueries.update(entry.id, { status: "won" });

        // Broadcast win via WebSocket
        webSocketService.broadcastWinnerAnnounced(
          this.gameId,
          roundId,
          userId,
          prizeGc + prizeSc,
          prizeGc > 0 ? "gc" : "sc",
        );

        webSocketService.sendUserNotification(userId, {
          type: "instant_win",
          gameId: this.gameId,
          prizeGc,
          prizeSc,
          message: `Congrats! You won ${prizeGc || prizeSc} ${currencyType}!`,
        });
      }
    } else {
      // Loss - mark entry as lost
      const result = await resultsQueries.create({
        round_id: roundId,
        user_id: userId,
        outcome: "loss",
        payout_amount_gc: 0,
        payout_amount_sc: 0,
        verification_code: `instant_${roundId}_${entry.id}`,
      });

      if (result) {
        await entriesQueries.update(entry.id, { status: "lost" });
      }
    }

    return entry.id;
  }

  /**
   * Not used for instant win (results are immediate)
   */
  async drawRound(): Promise<any> {
    return { success: true, message: "Instant win results already processed" };
  }

  /**
   * Get winners from a session
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
      prizeType: payout.win_type || "instant_win",
    }));
  }

  /**
   * Cancel round and refund entries
   */
  async cancelRound(roundId: string): Promise<void> {
    // Update round status
    await roundsQueries.update(roundId, { status: "cancelled" });

    // Mark entries as cancelled
    const entries = await entriesQueries.getByRoundId(roundId);
    for (const entry of entries) {
      await entriesQueries.update(entry.id, { status: "cancelled" });
    }

    // TODO: Process refunds
  }

  /**
   * Get round status
   */
  async getRoundStatus(roundId: string): Promise<any> {
    const round = await roundsQueries.getById(roundId);

    if (!round) {
      return null;
    }

    // Get stats
    const entryCount = await entriesQueries.countByRoundId(roundId);

    return {
      ...round,
      entryCount,
    };
  }

  /**
   * Get player entries for a round
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
    const entriesResult = await entriesQueries.getByRoundId(roundId);
    const totalEntries = entriesResult.length;
    const winCount = entriesResult.filter((e) => e.status === "won").length;

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
}
