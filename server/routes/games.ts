import { RequestHandler } from "express";
import { gameRegistry, GameType } from "../services/GameRegistry";
import { rngService } from "../services/RNGService";
import { entryValidationService } from "../services/EntryValidationService";
import { payoutService } from "../services/PayoutService";
import { webSocketService } from "../services/WebSocketService";
import {
  gamesQueries,
  roundsQueries,
  entriesQueries,
  payoutsQueries,
  profilesQueries,
  resultsQueries,
  rngQueries,
  adminActionsQueries,
} from "../lib/db-queries";
import { query } from "../lib/db";

/**
 * Get all games
 */
export const getGames: RequestHandler = async (req, res) => {
  try {
    const { enabled, category, offset = 0, limit = 20 } = req.query;

    const { data: games } = await gamesQueries.getAll(
      enabled === "true" ? true : undefined,
      category as string | undefined,
      Number(offset),
      Number(limit),
    );

    res.json({ games, count: games.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get game details with current round
 */
export const getGameDetails: RequestHandler = async (req, res) => {
  try {
    const { gameId } = req.params;

    // Get game
    const game = await gamesQueries.getById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Get config
    const config = await query(
      "SELECT * FROM game_configs WHERE game_id = $1",
      [gameId],
    );

    // Get current active round
    const round = await roundsQueries.getActiveRound(gameId);

    // Get round stats if exists
    let stats = null;
    if (round) {
      const entryCount = await entriesQueries.countByRoundId(
        round.id,
        "active",
      );
      stats = { entryCount, roundId: round.id, drawTime: round.draw_time };
    }

    res.json({
      game,
      config: config.rows[0],
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
    const { name, description, gameType, category, config } = req.body;

    if (!name || !gameType || !category) {
      return res.status(400).json({
        error: "Missing required fields: name, gameType, category",
      });
    }

    // Create game
    const game = await gamesQueries.create({
      name,
      description,
      game_type: gameType,
      category,
      enabled: true,
      currency_type: "gc",
    });

    // Create config
    try {
      await query(
        `INSERT INTO game_configs (game_id, config_json) VALUES ($1, $2)`,
        [
          game.id,
          JSON.stringify({
            entryFeeGc: config?.entryFeeGc || 0,
            entryFeeSc: config?.entryFeeSc || 0,
            maxEntriesPerUser: config?.maxEntriesPerUser || 100,
            acceptedCurrencies: config?.acceptedCurrencies || ["GC"],
            rtpPercentage: config?.rtpPercentage || 90,
            drawIntervalMinutes: config?.drawIntervalMinutes || 60,
          }),
        ],
      );
    } catch (error) {
      console.error("Error creating config:", error);
      return res.status(400).json({
        error: "Failed to create game configuration",
      });
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
    const userId = (req as any).user?.id;
    const { gameId, roundId, clientSeed, currencyType } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!gameId || !roundId || !clientSeed) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate client seed
    if (!rngService.validateClientSeed(clientSeed)) {
      return res.status(400).json({ error: "Invalid client seed format" });
    }

    // Get game config
    const configResult = await query(
      "SELECT * FROM game_configs WHERE game_id = $1",
      [gameId],
    );
    const config = configResult.rows[0];

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
      currencyType === "GC" ? (config.entry_cost_gc || 0) : (config.entry_cost_sc || 0),
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

    const entry = await entriesQueries.create({
      round_id: roundId,
      user_id: userId,
      entry_cost:
        currencyType === "GC"
          ? (config.entry_cost_gc || 0)
          : (config.entry_cost_sc || 0),
      currency_type: currencyType,
      client_seed: clientSeed,
    });

    // TODO: Deduct balance from user account

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
    const userId = (req as any).user?.id;
    const { roundId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const entries = await query(
      `SELECT * FROM game_entries WHERE user_id = $1 AND round_id = $2 ORDER BY created_at DESC`,
      [userId, roundId],
    );

    res.json({ entries: entries.rows || [] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get round status
 */
export const getRoundStatus: RequestHandler = async (req, res) => {
  try {
    const { roundId } = req.params;

    const round = await roundsQueries.getById(roundId);

    if (!round) {
      return res.status(404).json({ error: "Round not found" });
    }

    // Get stats
    const entryCount = await entriesQueries.countByRoundId(roundId, "active");
    const winnersResult = await query(
      `SELECT user_id, payout_amount_gc, payout_amount_sc FROM game_payouts 
       WHERE round_id = $1 AND status = 'processed'`,
      [roundId],
    );

    res.json({
      round: {
        ...round,
        activeEntries: entryCount,
        winnerCount: winnersResult.rows?.length || 0,
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
    const { roundId, verificationCode } = req.params;

    // Get result
    const result = await query(
      `SELECT * FROM game_results WHERE round_id = $1 AND verification_code = $2`,
      [roundId, verificationCode],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Result verification failed" });
    }

    const gameResult = result.rows[0];

    // Get RNG log
    const rngLog = await query(
      `SELECT * FROM rng_audit_logs WHERE round_id = $1 LIMIT 1`,
      [roundId],
    );

    res.json({
      verified: true,
      result: {
        outcome: gameResult.outcome,
        verificationCode: gameResult.verification_code,
        verifiedAt: gameResult.created_at,
      },
      rngLog: rngLog.rows[0]
        ? {
            serverSeed: rngLog.rows[0].server_seed,
            executedAt: rngLog.rows[0].created_at,
          }
        : null,
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
    const userId = (req as any).user?.id;
    const { gameId, limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    let sql = `
      SELECT ge.*, gp.payout_amount_gc, gp.payout_amount_sc, gp.status as payout_status
      FROM game_entries ge
      LEFT JOIN game_payouts gp ON ge.round_id = gp.round_id AND ge.user_id = gp.user_id
      WHERE ge.user_id = $1
    `;
    const params: any[] = [userId];

    if (gameId) {
      sql += ` AND ge.round_id IN (SELECT id FROM game_rounds WHERE game_id = $${params.length + 1})`;
      params.push(gameId);
    }

    sql += ` ORDER BY ge.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const entries = await query(sql, params);

    res.json({ history: entries.rows || [] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
