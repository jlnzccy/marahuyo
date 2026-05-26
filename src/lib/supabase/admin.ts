import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { supabaseEnv } from "./env";

let cached: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Admin client using the service role key — bypasses RLS.
 * NEVER expose to the browser. Use only inside Studio Server Actions
 * AFTER the request has been authenticated as the owner.
 */
export function getAdminSupabase() {
  if (cached) return cached;
  cached = createClient<Database>(supabaseEnv.url(), supabaseEnv.serviceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return cached;
}
