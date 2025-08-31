import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const hasSupabaseServerConfig =
  Boolean(process.env.SUPABASE_URL) && Boolean(process.env.SUPABASE_SERVICE_ROLE);

let adminSingleton: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !serviceRole) {
    throw new Error(
      "Supabase server is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE in your environment.",
    );
  }

  if (!adminSingleton) {
    adminSingleton = createClient(supabaseUrl, serviceRole, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminSingleton;
}
