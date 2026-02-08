import type { RequestHandler } from "express";
import { query } from "../lib/db";
import { profilesQueries } from "../lib/db-queries";

export const getOrCreateProfileById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) return res.status(400).json({ error: "Missing id" });

    // Try to get existing profile
    let profile = await profilesQueries.getByUserId(id);

    if (!profile) {
      // Create a minimal profile when missing
      const newProfile = {
        user_id: id,
        email: "",
        name: "Player",
        verified: false,
        kyc_status: "pending" as const,
        gold_coins_balance: 0,
        sweep_coins_balance: 0,
        gold_coins: 0,
        sweep_coins: 0,
      };

      try {
        const result = await query(
          `INSERT INTO profiles (user_id, email, name, verified, kyc_status, gold_coins_balance, sweep_coins_balance, gold_coins, sweep_coins)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            newProfile.user_id,
            newProfile.email,
            newProfile.name,
            newProfile.verified,
            newProfile.kyc_status,
            newProfile.gold_coins_balance,
            newProfile.sweep_coins_balance,
            newProfile.gold_coins,
            newProfile.sweep_coins,
          ],
        );
        profile = result.rows[0];
      } catch (error: any) {
        // Profile might already exist (race condition)
        profile = await profilesQueries.getByUserId(id);
        if (!profile) {
          return res
            .status(500)
            .json({ error: error?.message || "Failed to create profile" });
        }
      }
    }

    return res.json(profile);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
};
