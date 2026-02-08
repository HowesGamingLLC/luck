import { RequestHandler } from "express";
import { getSupabaseAdmin } from "../lib/supabase";
import { gameRegistry, GameType } from "../services/GameRegistry";
import { rngService } from "../services/RNGService";
import { entryValidationService } from "../services/EntryValidationService";
import { payoutService } from "../services/PayoutService";
import { webSocketService } from "../services/WebSocketService";

function getSupabase() {
  return getSupabaseAdmin();
}

/**
 * Get all games
 */
export const getGames: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { enabled, category, offset = 0, limit = 20 } = req.query;

    let query = supabase.from("games").select("*");

    if (enabled === "true") {
      query = query.eq("enabled", true);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ games: data || [], count: data?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get game details with current round
 */
export const getGameDetails: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { gameId } = req.params;

    // Get game
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (gameError || !game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Get config
    const { data: config } = await supabase
      .from("game_configs")
      .select("*")
      .eq("game_id", gameId)
      .single();

    // Get current active round
    const { data: round } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("game_id", gameId)
      .in("status", ["registering", "live"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Get round stats if exists
    let stats = null;
    if (round) {
      const { count: entryCount } = await supabase
        .from("game_entries")
        .select("*", { count: "exact" })
        .eq("round_id", round.id)
        .eq("status", "active");

      stats = { entryCount, roundId: round.id, drawTime: round.draw_time };
    }

    res.json({
      game,
      config,
      currentRound: round,
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Create a new game
 */
export const createGame: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { name, description, gameType, category, config } = req.body;

    if (!name || !gameType || !category) {
      return res
        .status(400)
        .json({ error: "Missing required fields: name, gameType, category" });
    }

    // Create game
    const { data: game, error: gameError } = await supabase
      .from("games")
      .insert({
        name,
        description,
        game_type: gameType,
        category,
        enabled: true,
        created_by: (req as any).user?.id,
      })
      .select()
      .single();

    if (gameError) {
      return res.status(400).json({ error: gameError.message });
    }

    // Create config
    const { error: configError } = await supabase
      .from("game_configs")
      .insert({
        game_id: game.id,
        entry_cost_gc: config?.entryFeeGc || 0,
        entry_cost_sc: config?.entryFeeSc || 0,
        max_entries_per_user: config?.maxEntriesPerUser || 100,
        accepted_currencies: config?.acceptedCurrencies || ["GC"],
        rtp_percentage: config?.rtpPercentage || 90,
        pool_draw_interval_minutes: config?.drawIntervalMinutes || 60,
      });

    if (configError) {
      return res.status(400).json({ error: configError.message });
    }

    // Register game in memory
    gameRegistry.registerGame(game.id, gameType as GameType, {
      gameId: game.id,
      entryFeeGc: config?.entryFeeGc || 0,
      entryFeeSc: config?.entryFeeSc || 0,
      maxEntriesPerUser: config?.maxEntriesPerUser || 100,
      acceptedCurrencies: config?.acceptedCurrencies || ["GC"],
      rtpPercentage: config?.rtpPercentage || 90,
    });

    res.json({ game });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Validate and process entry
 */
export const submitEntry: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = (req as any).user?.id;
    const { gameId, roundId, clientSeed, currencyType } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!gameId || !roundId || !clientSeed) {
      return res
        .status(400)
        .json({ error: "Missing required fields" });
    }

    // Validate client seed
    if (!rngService.validateClientSeed(clientSeed)) {
      return res.status(400).json({ error: "Invalid client seed format" });
    }

    // Get game config
    const { data: config } = await supabase
      .from("game_configs")
      .select("*")
      .eq("game_id", gameId)
      .single();

    if (!config) {
      return res.status(404).json({ error: "Game configuration not found" });
    }

    // Get user balance
    const balance = await entryValidationService.getUserBalance(userId);

    // Validate entry
    const validation = await entryValidationService.validateEntry(
      userId,
      gameId,
      roundId,
      currencyType === "GC" ? config.entry_cost_gc : config.entry_cost_sc,
      currencyType,
      balance,
      config.max_entries_per_user,
    );

    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
        reason: validation.reason,
        details: validation.details,
      });
    }

    // Create entry
    const clientSeedHash = rngService.hashSeed(clientSeed);

    const { data: entry, error: entryError } = await supabase
      .from("game_entries")
      .insert({
        round_id: roundId,
        game_id: gameId,
        user_id: userId,
        currency_type: currencyType,
        entry_cost: currencyType === "GC" ? config.entry_cost_gc : config.entry_cost_sc,
        client_seed: clientSeed,
        client_seed_hash: clientSeedHash,
        status: "active",
      })
      .select()
      .single();

    if (entryError) {
      return res.status(400).json({ error: entryError.message });
    }

    // TODO: Deduct balance from user account

    // Update round stats
    await supabase.rpc("increment_round_entries", { p_round_id: roundId });

    // Broadcast entry submission event via WebSocket
    webSocketService.broadcastEntrySubmitted(gameId, roundId, {
      entryId: entry.id,
      userId,
      currencyType,
      entryCost: entry.entry_cost,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      entryId: entry.id,
      message: "Entry submitted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get player entries for a round
 */
export const getPlayerEntries: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user?.id;
    const { roundId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { data: entries, error } = await supabase
      .from("game_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("round_id", roundId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ entries: entries || [] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get round status
 */
export const getRoundStatus: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { roundId } = req.params;

    const { data: round, error: roundError } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (roundError || !round) {
      return res.status(404).json({ error: "Round not found" });
    }

    // Get stats
    const { count: entryCount } = await supabase
      .from("game_entries")
      .select("*", { count: "exact" })
      .eq("round_id", roundId)
      .eq("status", "active");

    const { data: winners } = await supabase
      .from("game_payouts")
      .select("user_id, payout_amount_gc, payout_amount_sc")
      .eq("round_id", roundId)
      .eq("status", "completed");

    res.json({
      round: {
        ...round,
        activeEntries: entryCount || 0,
        winnerCount: winners?.length || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Verify game result (provably-fair)
 */
export const verifyResult: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { roundId, verificationCode } = req.params;

    // Get result
    const { data: result, error: resultError } = await supabase
      .from("game_results")
      .select("*")
      .eq("round_id", roundId)
      .eq("verification_code", verificationCode)
      .single();

    if (resultError || !result) {
      return res.status(404).json({ error: "Result verification failed" });
    }

    // Get RNG log
    const { data: rngLog } = await supabase
      .from("rng_audit_logs")
      .select("*")
      .eq("result_id", result.id)
      .single();

    res.json({
      verified: result.is_provably_fair,
      result: {
        outcome: result.drawn_number_or_result,
        verificationCode: result.verification_code,
        rngAlgorithm: result.rng_algorithm,
        verifiedAt: result.verification_timestamp,
      },
      rngLog: rngLog ? {
        serverSeedHash: rngLog.server_seed_hash,
        algorithm: rngLog.rng_algorithm,
        executedAt: rngLog.execution_timestamp,
      } : null,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get game history for user
 */
export const getUserGameHistory: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const userId = req.user?.id;
    const { gameId, limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    let query = supabase
      .from("game_entries")
      .select("*, game_payouts(payout_amount_gc, payout_amount_sc, status)")
      .eq("user_id", userId);

    if (gameId) {
      query = query.eq("game_id", gameId);
    }

    const { data: entries, error } = await query
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ history: entries || [] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
