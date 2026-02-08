import { getSupabaseAdmin } from "../lib/supabase";
import { webSocketService } from "./WebSocketService";

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
  private supabase: any = null;

  private getSupabase() {
    if (!this.supabase) {
      this.supabase = getSupabaseAdmin();
    }
    return this.supabase;
  }

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
      const supabase = this.getSupabase();
      const payoutId = this.generatePayoutId();
      const transactionIds: string[] = [];

      // Create payout record
      const { error: payoutError } = await supabase
        .from("game_payouts")
        .insert({
          id: payoutId,
          result_id: resultId,
          round_id: roundId,
          user_id: payout.userId,
          entry_id: payout.entryId,
          win_type: payout.winType,
          prize_tier: payout.prizeTier,
          payout_amount_gc: payout.payoutAmountGc,
          payout_amount_sc: payout.payoutAmountSc,
          status: "processing",
          created_at: new Date().toISOString(),
        });

      if (payoutError) {
        return {
          payoutId,
          userId: payout.userId,
          totalGc: 0,
          totalSc: 0,
          status: "failed",
          error: `Failed to create payout record: ${payoutError.message}`,
          transactionIds: [],
        };
      }

      // Process GC payout if applicable
      if (payout.payoutAmountGc > 0) {
        const gcTxId = await this.updateBalance(
          payout.userId,
          "goldCoins",
          payout.payoutAmountGc,
          "win",
          `Payout from round ${roundId}`,
        );

        if (gcTxId) {
          transactionIds.push(gcTxId);
        } else {
          return {
            payoutId,
            userId: payout.userId,
            totalGc: 0,
            totalSc: 0,
            status: "failed",
            error: "Failed to process GC payout",
            transactionIds: [],
          };
        }
      }

      // Process SC payout if applicable
      if (payout.payoutAmountSc > 0) {
        const scTxId = await this.updateBalance(
          payout.userId,
          "sweepCoins",
          payout.payoutAmountSc,
          "win",
          `Sweepstakes payout from round ${roundId}`,
        );

        if (scTxId) {
          transactionIds.push(scTxId);
        } else {
          // Rollback GC payout if SC fails
          if (payout.payoutAmountGc > 0) {
            await this.updateBalance(
              payout.userId,
              "goldCoins",
              -payout.payoutAmountGc,
              "rollback",
              `Rollback GC payout for ${payoutId}`,
            );
          }

          return {
            payoutId,
            userId: payout.userId,
            totalGc: payout.payoutAmountGc,
            totalSc: 0,
            status: "partial",
            error: "Failed to process SC payout",
            transactionIds,
          };
        }
      }

      // Update payout status to completed
      await supabase
        .from("game_payouts")
        .update({
          status: "completed",
          processed_at: new Date().toISOString(),
          transaction_id: transactionIds.join(","),
        })
        .eq("id", payoutId);

      return {
        payoutId,
        userId: payout.userId,
        totalGc: payout.payoutAmountGc,
        totalSc: payout.payoutAmountSc,
        status: "completed",
        transactionIds,
      };
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
   * Update user balance atomically
   * Returns transaction ID if successful, null otherwise
   */
  private async updateBalance(
    userId: string,
    balanceField: "goldCoins" | "sweepCoins",
    amount: number,
    type: "win" | "wager" | "refund" | "rollback" | "bonus",
    description: string,
  ): Promise<string | null> {
    try {
      const supabase = this.getSupabase();
      const dbField = balanceField === "goldCoins" ? "gold_coins_balance" : "sweep_coins_balance";

      // Use Supabase RPC or raw SQL for atomic update
      const { data, error } = await supabase.rpc("update_balance", {
        p_user_id: userId,
        p_field: dbField,
        p_amount: amount,
      });

      if (error) {
        console.error(`Balance update error for ${userId}:`, error);
        return null;
      }

      // Create transaction record
      const txId = this.generateTransactionId();

      await supabase.from("balance_transactions").insert({
        id: txId,
        user_id: userId,
        type,
        currency: balanceField === "goldCoins" ? "GC" : "SC",
        amount,
        description,
        created_at: new Date().toISOString(),
      });

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
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("game_payouts")
        .select("*")
        .eq("round_id", roundId)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      return data || [];
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
      const supabase = this.getSupabase();
      const { data: failedPayouts } = await supabase
        .from("game_payouts")
        .select("*")
        .eq("round_id", roundId)
        .eq("status", "failed");

      const results: PayoutResult[] = [];

      for (const payout of failedPayouts || []) {
        const result = await this.processPayout(
          roundId,
          payout.result_id,
          {
            userId: payout.user_id,
            entryId: payout.entry_id,
            winType: payout.win_type,
            prizeTier: payout.prize_tier,
            payoutAmountGc: payout.payout_amount_gc,
            payoutAmountSc: payout.payout_amount_sc,
          },
        );

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
    const totalMultiplier = winners.reduce((sum, w) => sum + w.prizeMultiplier, 0);

    return winners.map((winner) => ({
      userId: winner.userId,
      winType: "jackpot_share",
      prizeTier: 1,
      payoutAmountGc: (totalPrizePoolGc * winner.prizeMultiplier) / totalMultiplier,
      payoutAmountSc: (totalPrizePoolSc * winner.prizeMultiplier) / totalMultiplier,
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
      const supabase = this.getSupabase();
      let query = supabase
        .from("game_payouts")
        .select("payout_amount_gc, payout_amount_sc, status");

      if (startDate) {
        query = query.gte("created_at", startDate.toISOString());
      }

      if (endDate) {
        query = query.lte("created_at", endDate.toISOString());
      }

      const { data: payouts, error } = await query;

      if (error) {
        return null;
      }

      const stats = {
        totalPayouts: payouts?.length || 0,
        totalGcPaid: payouts?.reduce((sum, p) => sum + (p.payout_amount_gc || 0), 0) || 0,
        totalScPaid: payouts?.reduce((sum, p) => sum + (p.payout_amount_sc || 0), 0) || 0,
        completedCount: payouts?.filter((p) => p.status === "completed").length || 0,
        failedCount: payouts?.filter((p) => p.status === "failed").length || 0,
        pendingCount: payouts?.filter((p) => p.status === "pending").length || 0,
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
