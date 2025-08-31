import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const hasUrl = Boolean(import.meta.env.VITE_SUPABASE_URL);
const hasKey = Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const hasSupabaseConfig = hasUrl && hasKey;

let singleton: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.",
    );
  }

  if (!singleton) {
    singleton = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return singleton;
}
