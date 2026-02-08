import { transaction, query } from "../lib/db";
import { payoutsQueries, roundsQueries, balanceQueries } from "../lib/db-queries";
import { webSocketService } from "./WebSocketService";
import { PoolClient } from "pg";

export interface Payout {
  userId: string;
  entryId?: string;
  winType: string;
  prizeTier: number;
  payoutAmountGc: number;
  payoutAmountSc: number;
}

export interface PayoutResult {
  payoutId: string;
  userId: string;
  totalGc: number;
  totalSc: number;
  status: "completed" | "failed" | "partial";
  error?: string;
  transactionIds: string[];
}

/**
 * Payout Service: Handles atomic prize distribution
 * - ACID-compliant transactions
 * - Balance updates
 * - Rollback safety
 * - Transaction tracking
 */
export class PayoutService {
  /**
   * Process payouts for a round
   * Uses database transaction for atomicity
   */
  async processRoundPayouts(
    roundId: string,
    resultId: string,
    payouts: Payout[],
  ): Promise<PayoutResult[]> {
    const results: PayoutResult[] = [];

    for (const payout of payouts) {
      const result = await this.processPayout(roundId, resultId, payout);
      results.push(result);
    }

    return results;
  }

  /**
   * Process a single payout atomically
   */
  async processPayout(
    roundId: string,
    resultId: string,
    payout: Payout,
  ): Promise<PayoutResult> {
    try {
      const payoutId = this.generatePayoutId();
      const transactionIds: string[] = [];

      return await transaction(async (client: PoolClient) => {
        // Create payout record
        const payoutResult = await client.query(
          `INSERT INTO game_payouts (id, round_id, user_id, payout_amount_gc, payout_amount_sc, win_type, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'processing')
           RETURNING id`,
          [
            payoutId,
            roundId,
            payout.userId,
            payout.payoutAmountGc,
            payout.payoutAmountSc,
            payout.winType,
          ],
        );

        if (!payoutResult.rows[0]) {
          return {
            payoutId,
            userId: payout.userId,
            totalGc: 0,
            totalSc: 0,
            status: "failed",
            error: "Failed to create payout record",
            transactionIds: [],
          };
        }

        // Process GC payout if applicable
        if (payout.payoutAmountGc > 0) {
          const gcTxId = await this.updateBalanceInTransaction(
            client,
            payout.userId,
            "gold_coins_balance",
            payout.payoutAmountGc,
            "win",
            `Payout from round ${roundId}`,
          );

          if (gcTxId) {
            transactionIds.push(gcTxId);
          } else {
            throw new Error("Failed to process GC payout");
          }
        }

        // Process SC payout if applicable
        if (payout.payoutAmountSc > 0) {
          const scTxId = await this.updateBalanceInTransaction(
            client,
            payout.userId,
            "sweep_coins_balance",
            payout.payoutAmountSc,
            "win",
            `Sweepstakes payout from round ${roundId}`,
          );

          if (scTxId) {
            transactionIds.push(scTxId);
          } else {
            throw new Error("Failed to process SC payout");
          }
        }

        // Update payout status to completed
        await client.query(
          `UPDATE game_payouts SET status = 'processed', updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1`,
          [payoutId],
        );

        // Get game ID from round for WebSocket broadcasting
        const roundResult = await client.query(
          `SELECT game_id FROM game_rounds WHERE id = $1`,
          [roundId],
        );

        const round = roundResult.rows[0];

        // Broadcast payout processed event via WebSocket
        if (round) {
          webSocketService.broadcastPayoutProcessed(
            payout.userId,
            round.game_id,
            roundId,
            payout.payoutAmountGc + payout.payoutAmountSc,
            payout.payoutAmountGc > 0 ? "mixed" : "sc",
          );
        }

        return {
          payoutId,
          userId: payout.userId,
          totalGc: payout.payoutAmountGc,
          totalSc: payout.payoutAmountSc,
          status: "completed",
          transactionIds,
        };
      });
    } catch (error) {
      return {
        payoutId: "",
        userId: payout.userId,
        totalGc: 0,
        totalSc: 0,
        status: "failed",
        error: `Payout processing error: ${(error as Error).message}`,
        transactionIds: [],
      };
    }
  }

  /**
   * Update user balance atomically within a transaction
   */
  private async updateBalanceInTransaction(
    client: PoolClient,
    userId: string,
    balanceField: "gold_coins_balance" | "sweep_coins_balance",
    amount: number,
    type: "win" | "wager" | "refund" | "rollback" | "bonus",
    description: string,
  ): Promise<string | null> {
    try {
      // Update profile balance
      await client.query(
        `UPDATE profiles SET ${balanceField} = ${balanceField} + $1, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $2`,
        [amount, userId],
      );

      // Create transaction record
      const txId = this.generateTransactionId();
      const currency = balanceField === "gold_coins_balance" ? "GC" : "SC";

      await client.query(
        `INSERT INTO balance_transactions (id, user_id, type, amount_gc, amount_sc, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          txId,
          userId,
          type,
          currency === "GC" ? amount : 0,
          currency === "SC" ? amount : 0,
          description,
        ],
      );

      return txId;
    } catch (error) {
      console.error("Balance update failed:", error);
      return null;
    }
  }

  /**
   * Get pending payouts for a round
   */
  async getPendingPayouts(roundId: string): Promise<any[]> {
    try {
      const result = await query(
        `SELECT * FROM game_payouts WHERE round_id = $1 AND status = 'pending'
         ORDER BY created_at ASC`,
        [roundId],
      );

      return result.rows || [];
    } catch (error) {
      console.error("Failed to fetch pending payouts:", error);
      return [];
    }
  }

  /**
   * Retry failed payouts
   */
  async retryFailedPayouts(roundId: string): Promise<PayoutResult[]> {
    try {
      const result = await query(
        `SELECT * FROM game_payouts WHERE round_id = $1 AND status = 'failed'`,
        [roundId],
      );

      const failedPayouts = result.rows || [];
      const results: PayoutResult[] = [];

      for (const payout of failedPayouts) {
        const result = await this.processPayout(roundId, payout.round_id, {
          userId: payout.user_id,
          entryId: payout.entry_id,
          winType: payout.win_type,
          prizeTier: payout.prize_tier || 1,
          payoutAmountGc: payout.payout_amount_gc,
          payoutAmountSc: payout.payout_amount_sc,
        });

        results.push(result);
      }

      return results;
    } catch (error) {
      console.error("Retry failed payouts error:", error);
      return [];
    }
  }

  /**
   * Calculate payout distribution for winners
   */
  calculatePayoutDistribution(
    totalPrizePoolGc: number,
    totalPrizePoolSc: number,
    winners: Array<{ userId: string; prizeMultiplier: number }>,
  ): Payout[] {
    const totalMultiplier = winners.reduce(
      (sum, w) => sum + w.prizeMultiplier,
      0,
    );

    return winners.map((winner) => ({
      userId: winner.userId,
      winType: "jackpot_share",
      prizeTier: 1,
      payoutAmountGc:
        (totalPrizePoolGc * winner.prizeMultiplier) / totalMultiplier,
      payoutAmountSc:
        (totalPrizePoolSc * winner.prizeMultiplier) / totalMultiplier,
    }));
  }

  /**
   * Generate unique payout ID
   */
  private generatePayoutId(): string {
    return `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get payout statistics for analytics
   */
  async getPayoutStats(gameId: string, startDate?: Date, endDate?: Date) {
    try {
      let sql = "SELECT * FROM game_payouts WHERE 1=1";
      const params: any[] = [];

      if (startDate) {
        sql += ` AND created_at >= $${params.length + 1}`;
        params.push(startDate);
      }

      if (endDate) {
        sql += ` AND created_at <= $${params.length + 1}`;
        params.push(endDate);
      }

      const result = await query(sql, params);
      const payouts = result.rows || [];

      const stats = {
        totalPayouts: payouts.length,
        totalGcPaid: payouts.reduce(
          (sum: number, p: any) => sum + (p.payout_amount_gc || 0),
          0,
        ),
        totalScPaid: payouts.reduce(
          (sum: number, p: any) => sum + (p.payout_amount_sc || 0),
          0,
        ),
        completedCount: payouts.filter((p: any) => p.status === "processed")
          .length,
        failedCount: payouts.filter((p: any) => p.status === "failed").length,
        pendingCount: payouts.filter((p: any) => p.status === "pending").length,
      };

      return stats;
    } catch (error) {
      console.error("Failed to get payout stats:", error);
      return null;
    }
  }
}

// Singleton instance
export const payoutService = new PayoutService();
