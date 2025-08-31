import type { RequestHandler } from "express";
import { getSupabaseAdmin, hasSupabaseServerConfig } from "../lib/supabase";

type Period = "daily" | "weekly" | "monthly" | "all";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function startOfWeekMonday(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0=Sun,1=Mon,..6=Sat
  const diff = (day + 6) % 7; // days since Monday
  x.setDate(x.getDate() - diff);
  return x;
}
function endOfWeekSunday(d: Date) {
  const start = startOfWeekMonday(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}
function getPeriodRange(period: Period) {
  const now = new Date();
  if (period === "daily") {
    return { start: startOfDay(now), end: endOfDay(now) };
  }
  if (period === "weekly") {
    return { start: startOfWeekMonday(now), end: endOfWeekSunday(now) };
  }
  if (period === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }
  return { start: new Date(0), end: now };
}

function getLastWeekRange() {
  const now = new Date();
  const thisWeekStart = startOfWeekMonday(now);
  const lastWeekEnd = new Date(thisWeekStart.getTime() - 1);
  const lastWeekStart = startOfWeekMonday(new Date(thisWeekStart.getTime() - 24 * 3600 * 1000));
  return { start: lastWeekStart, end: lastWeekEnd };
}

function isoWeekKey(d: Date) {
  const dt = new Date(d);
  // ISO week: use Thursday in current week to ensure week/year association
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() + 3 - ((dt.getDay() + 6) % 7));
  const week1 = new Date(dt.getFullYear(), 0, 4);
  const weekNo =
    1 + Math.round(((dt.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${dt.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export const getLeaderboard: RequestHandler = async (req, res) => {
  try {
    const period = (String(req.query.period || "weekly").toLowerCase() as Period) || "weekly";
    const { start, end } = getPeriodRange(period);

    if (!hasSupabaseServerConfig) {
      return res.json({ success: true, entries: [], period, start, end });
    }

    const admin = getSupabaseAdmin();
    // Sum GC wins per user within the period
    let { data, error } = await admin
      .from("transactions")
      .select("user_id, amount, type, currency, created_at")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    if (error && String(error.message).toLowerCase().includes("created_at")) {
      // Fallback if created_at column doesn't exist
      const fallback = await admin.from("transactions").select("user_id, amount, type, currency");
      data = fallback.data as any;
      error = fallback.error as any;
    }

    if (error) return res.status(500).json({ success: false, error: error.message });

    const totals = new Map<string, number>();
    (data || []).forEach((row: any) => {
      if (row.type === "win" && (row.currency === "GC" || row.currency === "gc")) {
        totals.set(row.user_id, (totals.get(row.user_id) || 0) + Number(row.amount || 0));
      }
    });

    const sorted = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100);

    // Fetch profile names for the top users
    const ids = sorted.map(([id]) => id);
    let profilesById = new Map<string, { name: string; email: string }>();
    if (ids.length) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id,name,email")
        .in("id", ids);
      (profiles || []).forEach((p: any) => profilesById.set(p.id, { name: p.name || p.email || p.id, email: p.email }));
    }

    const entries = sorted.map(([user_id, value], idx) => {
      const prof = profilesById.get(user_id);
      return {
        user_id,
        name: prof?.name || user_id,
        rank: idx + 1,
        value: Math.round(value),
      };
    });

    res.json({ success: true, period, start, end, entries });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || String(e) });
  }
};

async function bonusesAlreadyAwardedForWeek(weekKey: string): Promise<boolean> {
  if (!hasSupabaseServerConfig) return true;
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("transactions")
    .select("id, description, created_at")
    .ilike("description", `%Weekly leaderboard bonus%${weekKey}%`)
    .limit(1);
  if (error) return false;
  return (data || []).length > 0;
}

async function awardWeeklyBonusesInternal(): Promise<{ awarded: boolean; winners?: any[]; weekKey: string; reason?: string }>{
  if (!hasSupabaseServerConfig) return { awarded: false, weekKey: isoWeekKey(new Date()), reason: "No Supabase config" };
  const admin = getSupabaseAdmin();
  const lastWeek = getLastWeekRange();
  const weekKey = isoWeekKey(lastWeek.start);

  if (await bonusesAlreadyAwardedForWeek(weekKey)) {
    return { awarded: false, weekKey, reason: "Already awarded" };
  }

  // Compute winners for last week
  const { data, error } = await admin
    .from("transactions")
    .select("user_id, amount, type, currency, created_at")
    .gte("created_at", lastWeek.start.toISOString())
    .lte("created_at", lastWeek.end.toISOString());
  if (error) return { awarded: false, weekKey, reason: error.message };

  const totals = new Map<string, number>();
  (data || []).forEach((row: any) => {
    if (row.type === "win" && (row.currency === "GC" || row.currency === "gc")) {
      totals.set(row.user_id, (totals.get(row.user_id) || 0) + Number(row.amount || 0));
    }
  });
  const winners = Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([user_id, total], idx) => ({ user_id, total, rank: idx + 1 }));

  if (!winners.length) return { awarded: false, weekKey, reason: "No winners" };

  const awards = [10, 5, 5]; // SC bonuses for 1st/2nd/3rd

  for (let i = 0; i < Math.min(winners.length, 3); i++) {
    const w = winners[i];
    const sc = awards[i];
    // Credit SC
    // increment_profile_balances(p_user_id, p_gold_delta, p_sweep_delta)
    const { error: rpcErr } = await admin.rpc("increment_profile_balances", {
      p_user_id: w.user_id,
      p_gold_delta: 0,
      p_sweep_delta: sc,
    });
    if (rpcErr) {
      // continue but record
      // eslint-disable-next-line no-console
      console.error("Weekly award RPC error", rpcErr);
    }
    // Log bonus transaction
    await admin.from("transactions").insert({
      user_id: w.user_id,
      currency: "SC",
      amount: sc,
      type: "bonus",
      description: `Weekly leaderboard bonus ${weekKey} - Rank ${w.rank}`,
    });
  }

  return { awarded: true, winners, weekKey };
}

export const awardWeeklyBonuses: RequestHandler = async (req, res) => {
  try {
    const secret = process.env.LEADERBOARD_AWARD_SECRET;
    if (secret) {
      const header = req.header("x-award-secret");
      if (header !== secret) return res.status(403).json({ success: false, error: "Forbidden" });
    }
    const result = await awardWeeklyBonusesInternal();
    res.json({ success: true, result });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || String(e) });
  }
};

let schedulerStarted = false;
export function startLeaderboardScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;
  if (!hasSupabaseServerConfig) return;
  const tick = async () => {
    try {
      const now = new Date();
      // Run on Mondays between 00:00 and 06:00 server time if not yet awarded
      if (now.getDay() === 1) {
        await awardWeeklyBonusesInternal();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Leaderboard scheduler error", e);
    }
  };
  // Check hourly
  setInterval(tick, 60 * 60 * 1000);
  // Also run at startup (no-op if already awarded)
  tick();
}
