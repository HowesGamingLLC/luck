import type { RequestHandler } from "express";
import { getSupabaseAdmin, hasSupabaseServerConfig } from "../lib/supabase";

const PROFILES_TABLE = "profiles";

export const getOrCreateProfileById: RequestHandler = async (req, res) => {
  try {
    if (!hasSupabaseServerConfig) {
      return res.status(501).json({ error: "Supabase not configured on server" });
    }
    const { id } = req.params as { id: string };
    if (!id) return res.status(400).json({ error: "Missing id" });

    const admin = getSupabaseAdmin();

    let { data: profile, error } = await admin
      .from(PROFILES_TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });

    if (!profile) {
      // Create a minimal profile when missing
      // Attempt to read auth user for email/name
      let email = "";
      let name = "Player";
      try {
        const { data: userRes } = await admin.auth.admin.getUserById(id);
        email = userRes.user?.email ?? "";
        const metaName = (userRes.user?.user_metadata as any)?.name as
          | string
          | undefined;
        name = metaName || email?.split("@")[0] || "Player";
      } catch {}

      const newProfile = {
        id,
        email,
        name,
        is_admin: false,
        verified: false,
        kyc_status: "not_submitted",
        kyc_documents: null,
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
        total_losses: 0,
        jackpot_opt_in: false,
      };

      const { data: inserted, error: upsertErr } = await admin
        .from(PROFILES_TABLE)
        .upsert(newProfile)
        .select("*")
        .maybeSingle();
      if (upsertErr) return res.status(500).json({ error: upsertErr.message });
      profile = inserted;
    }

    return res.json(profile);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
};
