import type { RequestHandler } from "express";
import { getSupabaseAdmin, hasSupabaseServerConfig } from "../lib/supabase";

export const listAdminPackages: RequestHandler = async (_req, res) => {
  try {
    if (!hasSupabaseServerConfig) return res.json({ success: true, packages: [] });
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("packages")
      .select("id,name,gc,bonus_sc,price_cents,active,description,color,icon")
      .order("name", { ascending: true });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, packages: data || [] });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || String(e) });
  }
};

export const createAdminPackage: RequestHandler = async (req, res) => {
  try {
    if (!hasSupabaseServerConfig) return res.status(400).json({ success: false, error: "Supabase not configured" });
    const { id, name, gc, bonus_sc, price_cents, active = true, description, color, icon } = req.body || {};
    const admin = getSupabaseAdmin();
    const insert = { id, name, gc, bonus_sc, price_cents, active, description, color, icon };
    const { data, error } = await admin.from("packages").insert(insert).select().single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, pkg: data });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || String(e) });
  }
};

export const updateAdminPackage: RequestHandler = async (req, res) => {
  try {
    if (!hasSupabaseServerConfig) return res.status(400).json({ success: false, error: "Supabase not configured" });
    const { id } = req.params;
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("packages")
      .update(req.body || {})
      .eq("id", id)
      .select()
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, pkg: data });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || String(e) });
  }
};

export const deleteAdminPackage: RequestHandler = async (req, res) => {
  try {
    if (!hasSupabaseServerConfig) return res.status(400).json({ success: false, error: "Supabase not configured" });
    const { id } = req.params;
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("packages").delete().eq("id", id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || String(e) });
  }
};
