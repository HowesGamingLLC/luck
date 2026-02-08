import { GameEngine, GameEngineConfig, GameType } from "../services/GameRegistry";
import { rngService } from "../services/RNGService";
import { payoutService } from "../services/PayoutService";
import { webSocketService } from "../services/WebSocketService";
import { getSupabaseAdmin } from "../lib/supabase";

/**
 * Instant Win Engine: Spin-based games with immediate results
 * Games like slots, scratches, spins with instant outcome determination
 */
export class InstantWinEngine implements GameEngine {
  gameId: string;
  gameType: GameType = "instant_win";
  config: GameEngineConfig;
  private supabase: any = null;

  private getSupabase() {
    if (!this.supabase) {
      this.supabase = getSupabaseAdmin();
    }
    return this.supabase;
  }

  constructor(gameId: string, config: GameEngineConfig) {
    this.gameId = gameId;
    this.config = config;
  }

  /**
   * Create a new instant-win "round" (actually a single spin session)
   */
  async createRound(): Promise<string> {
    const supabase = this.getSupabase();
    const now = new Date();

    // For instant win games, a "round" is just a session
    const { data, error } = await supabase
      .from("game_rounds")
      .insert({
        game_id: this.gameId,
        status: "registering",
        starts_at: now.toISOString(),
        draw_time: now.toISOString(), // Instant draw
        server_seed: rngService.generateServerSeed(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create round: ${error.message}`);
    }

    return data.id;
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

    // Get user balance
    const supabase = this.getSupabase();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "gold_coins, sweep_coins"
      )
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
   * Process instant win spin with immediate result
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

    // Get round for server seed
    const { data: round, error: roundError } = await supabase
      .from("game_rounds")
      .select("server_seed")
      .eq("id", roundId)
      .single();

    if (roundError || !round) {
      throw new Error("Round not found");
    }

    // Create entry record
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

    // Execute RNG immediately for instant result
    const rngResult = await rngService.executeRNG(
      this.gameId,
      roundId,
      clientSeed,
      100, // 1-100 for win probability
      false
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
      const { data: result } = await supabase
        .from("game_results")
        .insert({
          round_id: roundId,
          game_id: this.gameId,
          server_seed_used: round.server_seed,
          drawn_number_or_result: { rng_value: rngResult.value, is_win: true },
          is_provably_fair: true,
          verification_code: `instant_${roundId}_${entry.id}`,
        })
        .select()
        .single();

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
        await supabase
          .from("game_entries")
          .update({ status: "won" })
          .eq("id", entry.id);

        // Broadcast win via WebSocket
        webSocketService.broadcastWinnerAnnounced(
          this.gameId,
          roundId,
          userId,
          prizeGc + prizeSc,
          prizeGc > 0 ? "gc" : "sc"
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
      const { data: result } = await supabase
        .from("game_results")
        .insert({
          round_id: roundId,
          game_id: this.gameId,
          server_seed_used: round.server_seed,
          drawn_number_or_result: { rng_value: rngResult.value, is_win: false },
          is_provably_fair: true,
          verification_code: `instant_${roundId}_${entry.id}`,
        })
        .select()
        .single();

      if (result) {
        await supabase
          .from("game_entries")
          .update({ status: "lost" })
          .eq("id", entry.id);
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
   * Cancel round and refund entries
   */
  async cancelRound(roundId: string): Promise<void> {
    const supabase = this.getSupabase();

    // Update round status
    await supabase
      .from("game_rounds")
      .update({ status: "cancelled" })
      .eq("id", roundId);

    // Mark entries as cancelled
    await supabase
      .from("game_entries")
      .update({ status: "cancelled" })
      .eq("round_id", roundId);

    // TODO: Process refunds
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

    // Get stats
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
   * Get player entries for a round
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
}
