import type { RequestHandler } from "express";
import { getSupabaseAdmin, hasSupabaseServerConfig } from "../lib/supabase";

const PROFILES_TABLE = "profiles";

export const seedTestUser: RequestHandler = async (req, res) => {
  try {
    if (!hasSupabaseServerConfig) {
      return res.status(501).json({ error: "Supabase not configured on server" });
    }
    const { email, password, name, isAdmin } = req.body as {
      email: string;
      password: string;
      name?: string;
      isAdmin?: boolean;
    };
    if (!email || !password) return res.status(400).json({ error: "Missing email/password" });

    const admin = getSupabaseAdmin();

    const { data: userRes, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || email.split("@")[0] },
    });
    if (createErr) return res.status(500).json({ error: createErr.message });

    const uid = userRes.user?.id;
    if (!uid) return res.status(500).json({ error: "No user id returned" });

    // Ensure profile exists
    const profilePayload = {
      id: uid,
      email,
      name: name || email.split("@")[0],
      is_admin: !!isAdmin,
      verified: false,
      kyc_status: "not_submitted",
      kyc_documents: null,
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
      total_losses: 0,
      jackpot_opt_in: false,
    };
    const { error: upsertErr } = await admin.from(PROFILES_TABLE).upsert(profilePayload, {
      onConflict: "id",
    });
    if (upsertErr) return res.status(500).json({ error: upsertErr.message });

    return res.json({ success: true, userId: uid });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
};
