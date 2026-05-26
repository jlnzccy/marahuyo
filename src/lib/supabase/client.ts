"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { supabaseEnv } from "./env";

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Browser-side Supabase client (anon key, RLS-respecting). */
export function getBrowserSupabase() {
  if (cached) return cached;
  cached = createBrowserClient<Database>(supabaseEnv.url(), supabaseEnv.anonKey());
  return cached;
}
