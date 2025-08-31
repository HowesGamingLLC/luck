import type { RequestHandler } from "express";
import { getSupabaseAdmin, hasSupabaseServerConfig } from "../lib/supabase";

const KYC_BUCKET = "kyc-documents";

async function ensureBucket() {
  const admin = getSupabaseAdmin();
  const { data: bucket } = await admin.storage.getBucket(KYC_BUCKET);
  if (!bucket) {
    await admin.storage.createBucket(KYC_BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
    });
  }
}

export const createKycUploadUrl: RequestHandler = async (req, res) => {
  try {
    if (!hasSupabaseServerConfig) {
      return res
        .status(501)
        .json({ error: "Supabase not configured on server" });
    }
    const { type, extension } = req.body as {
      type: "id" | "address" | "selfie";
      extension?: string;
    };
    if (!type) return res.status(400).json({ error: "Missing type" });

    const admin = getSupabaseAdmin();
    await ensureBucket();

    const userId = (req as any).userId || "anonymous"; // Optional: plug in auth middleware later
    const ext =
      (extension || "").replace(/[^a-zA-Z0-9.]/g, "").toLowerCase() || "bin";
    const fileName = `${type}-${Date.now()}.${ext.replace(/^\./, "")}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await admin.storage
      .from(KYC_BUCKET)
      .createSignedUploadUrl(filePath);

    if (error || !data)
      return res.status(500).json({ error: String(error?.message || error) });

    return res.json({ ...data, path: filePath, bucket: KYC_BUCKET });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
};

export const submitKyc: RequestHandler = async (req, res) => {
  try {
    if (!hasSupabaseServerConfig) {
      return res
        .status(501)
        .json({ error: "Supabase not configured on server" });
    }
    const { userId, documents } = req.body as {
      userId: string;
      documents: { id?: string; address?: string; selfie?: string };
    };
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const admin = getSupabaseAdmin();

    // Update profile with document paths and set status to pending
    const { error } = await admin
      .from("profiles")
      .update({
        kyc_status: "pending",
        kyc_documents: documents,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
};
