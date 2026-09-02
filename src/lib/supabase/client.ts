import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(
    url &&
    key &&
    url !== "your_supabase_url" &&
    key !== "your_supabase_anon_key" &&
    url.startsWith("https://") &&
    key.length > 20
  );
}

export function getSupabaseConfigIssue(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return "Supabase env vars are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.";
  }
  if (url === "your_supabase_url" || key === "your_supabase_anon_key") {
    return "Supabase is still using placeholder env values. Update them in Vercel project settings, then redeploy.";
  }
  if (!url.startsWith("https://")) {
    return "NEXT_PUBLIC_SUPABASE_URL must start with https://";
  }
  return null;
}

export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}

export function getSupabase(): SupabaseClient {
  const sb = createClient();
  if (!sb) throw new Error("Supabase is not configured");
  return sb;
}
