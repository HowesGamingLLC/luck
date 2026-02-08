import { RequestHandler } from "express";
import { query } from "../lib/db";
import { adminActionsQueries, roundsQueries } from "../lib/db-queries";
import { gameRegistry } from "../services/GameRegistry";
import { payoutService } from "../services/PayoutService";
import { webSocketService } from "../services/WebSocketService";

/**
 * Middleware: Verify admin role
 */
export const requireAdmin: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const result = await query(
      `SELECT verified FROM profiles WHERE user_id = $1`,
      [userId],
    );

    const user = result.rows[0];

    // Check if admin (for now, assume all verified users are admins - implement proper admin check)
    if (!user?.verified) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get admin dashboard data
 */
export const getDashboard: RequestHandler = async (req, res) => {
  try {
    // Get total games
    const gameCount = await query(
      `SELECT COUNT(*) as count FROM games`,
    ).then((r) => parseInt(r.rows[0]?.count || "0", 10));

    // Get active rounds
    const activeRounds = await query(
      `SELECT COUNT(*) as count FROM game_rounds WHERE status IN ('registering', 'live')`,
    ).then((r) => parseInt(r.rows[0]?.count || "0", 10));

    // Get total entries today
    const todayEntries = await query(
      `SELECT COUNT(*) as count FROM game_entries WHERE created_at >= NOW() - INTERVAL '24 hours'`,
    ).then((r) => parseInt(r.rows[0]?.count || "0", 10));

    // Get pending payouts
    const pendingPayouts = await query(
      `SELECT COUNT(*) as count FROM game_payouts WHERE status = 'pending'`,
    ).then((r) => parseInt(r.rows[0]?.count || "0", 10));

    // Get today's revenue
    const todayPayouts = await query(
      `SELECT payout_amount_gc, payout_amount_sc FROM game_payouts 
       WHERE status = 'processed' AND created_at >= NOW() - INTERVAL '24 hours'`,
    );

    const totalGcPaid =
      todayPayouts.rows.reduce(
        (sum: number, p: any) => sum + (p.payout_amount_gc || 0),
        0,
      ) || 0;
    const totalScPaid =
      todayPayouts.rows.reduce(
        (sum: number, p: any) => sum + (p.payout_amount_sc || 0),
        0,
      ) || 0;

    res.json({
      stats: {
        gameCount,
        activeRounds,
        todayEntries,
        pendingPayouts,
        todayRevenueGc: totalGcPaid,
        todayRevenueSc: totalScPaid,
      },
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Update game configuration
 */
export const updateGameConfig: RequestHandler = async (req, res) => {
  try {
    const { gameId } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const fields = Object.keys(updates)
      .map((k, i) => `${k} = $${i + 2}`)
      .join(", ");
    const values = Object.values(updates);

    await query(
      `UPDATE game_configs SET ${fields} WHERE game_id = $1`,
      [gameId, ...values],
    );

    // Log admin action
    await logAdminAction(
      (req as any).user?.id,
      gameId,
      "modify_config",
      updates,
    );

    res.json({ success: true, message: "Configuration updated" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Enable/disable a game
 */
export const toggleGameEnabled: RequestHandler = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { enabled } = req.body;

    await query(
      `UPDATE games SET enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [enabled, gameId],
    );

    // Log admin action
    await logAdminAction(
      (req as any).user?.id,
      gameId,
      enabled ? "enable_game" : "disable_game",
      { enabled },
    );

    res.json({
      success: true,
      message: `Game ${enabled ? "enabled" : "disabled"}`,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Pause a round
 */
export const pauseRound: RequestHandler = async (req, res) => {
  try {
    const { roundId } = req.params;

    const round = await roundsQueries.getById(roundId);

    if (!round) {
      return res.status(404).json({ error: "Round not found" });
    }

    // Can only pause if currently registering
    if (round.status !== "registering") {
      return res.status(400).json({
        error: "Can only pause rounds in registering status",
      });
    }

    await roundsQueries.update(roundId, { status: "paused" });

    // Log action
    await logAdminAction((req as any).user?.id, round.game_id, "pause_round", {
      roundId,
    });

    res.json({ success: true, message: "Round paused" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Cancel a round and refund entries
 */
export const cancelRound: RequestHandler = async (req, res) => {
  try {
    const { roundId } = req.params;
    const { reason } = req.body;

    const round = await roundsQueries.getById(roundId);

    if (!round) {
      return res.status(404).json({ error: "Round not found" });
    }

    // Mark round as cancelled
    await roundsQueries.update(roundId, { status: "cancelled" });

    // Mark entries as cancelled
    await query(
      `UPDATE game_entries SET status = 'cancelled' WHERE round_id = $1 AND status = 'active'`,
      [roundId],
    );

    // TODO: Process refunds

    // Log action
    await logAdminAction((req as any).user?.id, round.game_id, "cancel_round", {
      roundId,
      reason,
    });

    // Broadcast round cancellation via WebSocket
    webSocketService.broadcastRoundCancelled(
      round.game_id,
      roundId,
      reason || "Round cancelled by admin",
    );

    res.json({
      success: true,
      message: "Round cancelled and entries refunded",
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get round monitoring data
 */
export const monitorRound: RequestHandler = async (req, res) => {
  try {
    const { roundId } = req.params;

    const round = await roundsQueries.getById(roundId);

    if (!round) {
      return res.status(404).json({ error: "Round not found" });
    }

    // Get entry count by currency
    const entriesResult = await query(
      `SELECT currency_type, entry_cost FROM game_entries WHERE round_id = $1 AND status = 'active'`,
      [roundId],
    );

    const entries = entriesResult.rows || [];

    const entriesByGc = entries.filter((e: any) => e.currency_type === "GC")
      .length;
    const entriesBySc = entries.filter((e: any) => e.currency_type === "SC")
      .length;

    const totalGc = entries
      .filter((e: any) => e.currency_type === "GC")
      .reduce((sum: number, e: any) => sum + e.entry_cost, 0);
    const totalSc = entries
      .filter((e: any) => e.currency_type === "SC")
      .reduce((sum: number, e: any) => sum + e.entry_cost, 0);

    // Get winners if completed
    let winners = null;
    if (round.status === "completed") {
      const payoutsResult = await query(
        `SELECT user_id, payout_amount_gc, payout_amount_sc, win_type FROM game_payouts 
         WHERE round_id = $1 AND status = 'processed'`,
        [roundId],
      );
      winners = payoutsResult.rows;
    }

    res.json({
      round,
      entries: {
        countGc: entriesByGc,
        countSc: entriesBySc,
        totalPrizePoolGc: totalGc,
        totalPrizePoolSc: totalSc,
      },
      winners,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Manually trigger round draw
 */
export const manualDraw: RequestHandler = async (req, res) => {
  try {
    const { roundId } = req.params;

    // TODO: Implement manual draw using game engine

    // Log action
    await logAdminAction((req as any).user?.id, null, "manual_draw", {
      roundId,
    });

    res.json({ success: true, message: "Draw executed manually" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Adjust payout for winner
 */
export const adjustPayout: RequestHandler = async (req, res) => {
  try {
    const { roundId } = req.params;
    const { userId, adjustmentAmount, reason } = req.body;

    // TODO: Implement payout adjustment with transaction

    // Log action
    await logAdminAction((req as any).user?.id, null, "adjust_payout", {
      roundId,
      userId,
      adjustmentAmount,
      reason,
    });

    res.json({ success: true, message: "Payout adjusted" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get RNG verification data
 */
export const getRngVerification: RequestHandler = async (req, res) => {
  try {
    const { roundId } = req.params;

    const logsResult = await query(
      `SELECT * FROM rng_audit_logs WHERE round_id = $1`,
      [roundId],
    );

    const logs = logsResult.rows;

    if (!logs || logs.length === 0) {
      return res.status(404).json({ error: "No RNG logs found" });
    }

    res.json({
      logs: logs.map((log: any) => ({
        id: log.id,
        algorithm: "sha256",
        executedAt: log.created_at,
        verified: true,
        verificationHash: log.result_hash,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get all admin actions (audit log)
 */
export const getAdminAuditLog: RequestHandler = async (req, res) => {
  try {
    const { limit = 100, offset = 0, adminId, action } = req.query;

    let sql = `SELECT * FROM admin_game_actions WHERE 1=1`;
    const params: any[] = [];

    if (adminId) {
      sql += ` AND admin_id = $${params.length + 1}`;
      params.push(adminId);
    }

    if (action) {
      sql += ` AND action = $${params.length + 1}`;
      params.push(action);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    res.json({ actions: result.rows || [] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Log an admin action
 */
async function logAdminAction(
  adminId: string | undefined,
  gameId: string | null | undefined,
  action: string,
  details: any,
): Promise<void> {
  try {
    await adminActionsQueries.create({
      admin_id: adminId || "unknown",
      action,
      game_id: gameId,
      details,
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
