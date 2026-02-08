import { RequestHandler } from "express";
import { getSupabaseAdmin } from "../lib/supabase";
import { gameRegistry } from "../services/GameRegistry";
import { payoutService } from "../services/PayoutService";
import { webSocketService } from "../services/WebSocketService";

function getSupabase() {
  return getSupabaseAdmin();
}

/**
 * Middleware: Verify admin role
 */
export const requireAdmin: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (error || !user?.is_admin) {
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
    const supabase = getSupabase();
    // Get total games
    const { count: gameCount } = await supabase
      .from("games")
      .select("*", { count: "exact" });

    // Get active rounds
    const { count: activeRounds } = await supabase
      .from("game_rounds")
      .select("*", { count: "exact" })
      .in("status", ["registering", "live"]);

    // Get total entries today
    const { count: todayEntries } = await supabase
      .from("game_entries")
      .select("*", { count: "exact" })
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Get pending payouts
    const { count: pendingPayouts } = await supabase
      .from("game_payouts")
      .select("*", { count: "exact" })
      .eq("status", "pending");

    // Get today's revenue
    const { data: todayPayouts } = await supabase
      .from("game_payouts")
      .select("payout_amount_gc, payout_amount_sc")
      .eq("status", "completed")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const totalGcPaid = todayPayouts?.reduce((sum, p) => sum + (p.payout_amount_gc || 0), 0) || 0;
    const totalScPaid = todayPayouts?.reduce((sum, p) => sum + (p.payout_amount_sc || 0), 0) || 0;

    res.json({
      stats: {
        gameCount: gameCount || 0,
        activeRounds: activeRounds || 0,
        todayEntries: todayEntries || 0,
        pendingPayouts: pendingPayouts || 0,
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
    const supabase = getSupabase();
    const { gameId } = req.params;
    const updates = req.body;

    const { error } = await supabase
      .from("game_configs")
      .update(updates)
      .eq("game_id", gameId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log admin action
    await logAdminAction(req.user?.id, gameId, "modify_config", updates);

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
    const supabase = getSupabase();
    const { gameId } = req.params;
    const { enabled } = req.body;

    const { error } = await supabase
      .from("games")
      .update({ enabled })
      .eq("id", gameId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log admin action
    await logAdminAction(
      req.user?.id,
      gameId,
      enabled ? "enable_game" : "disable_game",
      { enabled },
    );

    res.json({ success: true, message: `Game ${enabled ? "enabled" : "disabled"}` });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Pause a round
 */
export const pauseRound: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { roundId } = req.params;

    const { data: round, error: getError } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (getError || !round) {
      return res.status(404).json({ error: "Round not found" });
    }

    // Can only pause if currently registering
    if (round.status !== "registering") {
      return res.status(400).json({ error: "Can only pause rounds in registering status" });
    }

    const { error } = await supabase
      .from("game_rounds")
      .update({ status: "paused" })
      .eq("id", roundId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log action
    await logAdminAction(req.user?.id, round.game_id, "pause_round", { roundId });

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
    const supabase = getSupabase();
    const { roundId } = req.params;
    const { reason } = req.body;

    const { data: round, error: getError } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (getError || !round) {
      return res.status(404).json({ error: "Round not found" });
    }

    // Mark round as cancelled
    const { error: cancelError } = await supabase
      .from("game_rounds")
      .update({ status: "cancelled" })
      .eq("id", roundId);

    if (cancelError) {
      return res.status(400).json({ error: cancelError.message });
    }

    // Mark entries as cancelled
    await supabase
      .from("game_entries")
      .update({ status: "cancelled" })
      .eq("round_id", roundId)
      .eq("status", "active");

    // TODO: Process refunds

    // Log action
    await logAdminAction(req.user?.id, round.game_id, "cancel_round", {
      roundId,
      reason,
    });

    // Broadcast round cancellation via WebSocket
    webSocketService.broadcastRoundCancelled(round.game_id, roundId, reason || "Round cancelled by admin");

    res.json({ success: true, message: "Round cancelled and entries refunded" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get round monitoring data
 */
export const monitorRound: RequestHandler = async (req, res) => {
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

    // Get entry count by currency
    const { data: entries } = await supabase
      .from("game_entries")
      .select("currency_type, entry_cost")
      .eq("round_id", roundId)
      .eq("status", "active");

    const entriesByGc = entries?.filter((e) => e.currency_type === "GC").length || 0;
    const entriesBySc = entries?.filter((e) => e.currency_type === "SC").length || 0;

    const totalGc = entries
      ?.filter((e) => e.currency_type === "GC")
      .reduce((sum, e) => sum + e.entry_cost, 0) || 0;
    const totalSc = entries
      ?.filter((e) => e.currency_type === "SC")
      .reduce((sum, e) => sum + e.entry_cost, 0) || 0;

    // Get winners if completed
    let winners = null;
    if (round.status === "completed") {
      const { data: payouts } = await supabase
        .from("game_payouts")
        .select("user_id, payout_amount_gc, payout_amount_sc, win_type")
        .eq("round_id", roundId)
        .eq("status", "completed");

      winners = payouts;
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
    await logAdminAction(req.user?.id, null, "manual_draw", { roundId });

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
    await logAdminAction(req.user?.id, null, "adjust_payout", {
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
    const supabase = getSupabase();
    const { roundId } = req.params;

    const { data: logs } = await supabase
      .from("rng_audit_logs")
      .select("*")
      .eq("round_id", roundId);

    if (!logs || logs.length === 0) {
      return res.status(404).json({ error: "No RNG logs found" });
    }

    res.json({
      logs: logs.map((log) => ({
        id: log.id,
        algorithm: log.rng_algorithm,
        executedAt: log.execution_timestamp,
        verified: log.verification_status === "verified",
        verificationHash: log.final_hash,
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
    const supabase = getSupabase();
    const { limit = 100, offset = 0, adminId, action } = req.query;

    let query = supabase.from("admin_game_actions").select("*");

    if (adminId) {
      query = query.eq("admin_id", adminId);
    }

    if (action) {
      query = query.eq("action", action);
    }

    const { data, error } = await query
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ actions: data || [] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Log an admin action
 */
async function logAdminAction(
  adminId: string | undefined,
  gameId: string | null,
  action: string,
  details: any,
): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.from("admin_game_actions").insert({
      admin_id: adminId,
      game_id: gameId,
      action,
      details,
      success: true,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
