import type { RequestHandler } from "express";
import { getSupabaseAdmin, hasSupabaseServerConfig } from "../lib/supabase";
import crypto from "crypto";

const REQUIRED_ENV = ["SQUARE_ACCESS_TOKEN", "SQUARE_APPLICATION_ID"] as const;

function assertEnv(): { ok: boolean; missing: string[] } {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  return { ok: missing.length === 0, missing };
}

// Simple package catalog (source of truth)
export const packages = [
  { id: "starter", name: "Starter Pack", gc: 10000, bonusSc: 5, priceCents: 999 },
  { id: "popular", name: "Popular Pack", gc: 50000, bonusSc: 30, priceCents: 3999 },
  { id: "pro", name: "Pro Pack", gc: 100000, bonusSc: 75, priceCents: 6999 },
  { id: "whale", name: "Whale Pack", gc: 250000, bonusSc: 200, priceCents: 14999 },
  { id: "daily", name: "Daily Deal", gc: 25000, bonusSc: 15, priceCents: 1999 },
] as const;

type Pkg = (typeof packages)[number];

export const listPackages: RequestHandler = (_req, res) => {
  res.json({ success: true, packages });
};

export const createPaymentLink: RequestHandler = async (req, res) => {
  const env = assertEnv();
  if (!env.ok) return res.status(400).json({ success: false, error: `Missing env: ${env.missing.join(",")}` });

  const { packageId, quantity = 1, userId, email, returnUrl } = req.body || {};
  const pkg: Pkg | undefined = packages.find((p) => p.id === packageId);
  const locationId = process.env.SQUARE_LOCATION_ID;

  if (!pkg) return res.status(404).json({ success: false, error: "Package not found" });
  if (!locationId) return res.status(400).json({ success: false, error: "Missing SQUARE_LOCATION_ID" });

  const idempotencyKey = crypto.randomUUID();
  const order = {
    location_id: locationId,
    reference_id: `${userId ?? "guest"}:${pkg.id}:${quantity}`,
    line_items: [
      {
        name: pkg.name,
        quantity: String(quantity),
        base_price_money: { amount: pkg.priceCents, currency: "USD" },
      },
    ],
  };

  const resp = await fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      idempotency_key: idempotencyKey,
      order,
      checkout_options: { redirect_url: returnUrl || undefined },
      pre_populate_buyer_email: email || undefined,
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    return res.status(resp.status).json({ success: false, error: data });
  }
  return res.json({ success: true, url: data.payment_link?.url, link: data.payment_link });
};

function verifySquareSignature(req: any): boolean {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notifUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;
  if (!signatureKey || !notifUrl) return false;
  const signature = req.header("x-square-hmacsha256-signature");
  if (!signature) return false;
  const body = req.rawBody || JSON.stringify(req.body);
  const hmac = crypto.createHmac("sha256", signatureKey);
  hmac.update(notifUrl + body);
  const expected = hmac.digest("base64");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export const squareWebhook: RequestHandler = async (req, res) => {
  if (!verifySquareSignature(req)) {
    return res.status(400).json({ success: false, error: "Bad signature" });
  }

  const event = req.body;
  try {
    if (event.type === "payment.updated" || event.type === "payment.created") {
      const payment = event.data?.object?.payment;
      if (payment?.status === "COMPLETED") {
        const reference = payment.order?.reference_id as string | undefined;
        const totalMoney = payment.total_money?.amount as number | undefined;
        if (reference) {
          const [uid, pkgId, qtyStr] = reference.split(":");
          const pack = packages.find((p) => p.id === pkgId);
          const qty = Number(qtyStr ?? 1) || 1;
          if (pack && hasSupabaseServerConfig) {
            const admin = getSupabaseAdmin();
            const gcAmount = pack.gc * qty;
            const scBonus = pack.bonusSc * qty;
            // Try to add to profiles if columns exist
            const { error } = await admin.rpc("increment_profile_balances", {
              p_user_id: uid,
              p_gold_delta: gcAmount,
              p_sweep_delta: scBonus,
            });
            if (error) {
              // Fallback: direct update if columns exist
              await admin.from("profiles").update({ gold_coins: (null as any), sweep_coins: (null as any) }).eq("id", uid);
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Square webhook handling error", e);
  }

  res.json({ success: true });
};

export const dbStatus: RequestHandler = async (_req, res) => {
  const status: any = {
    hasSupabaseServerConfig,
  };
  if (!hasSupabaseServerConfig) return res.json(status);
  try {
    const admin = getSupabaseAdmin();
    const tables = ["profiles", "orders", "transactions"];
    status.tables = {};
    for (const t of tables) {
      const { count, error } = await admin.from(t).select("id", { count: "exact", head: true });
      status.tables[t] = { count: count ?? 0, error: error?.message ?? null };
    }
  } catch (e: any) {
    status.error = e?.message || String(e);
  }
  res.json(status);
};
