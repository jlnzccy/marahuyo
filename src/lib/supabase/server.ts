import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { supabaseEnv } from "./env";

type CookieEntry = { name: string; value: string; options?: CookieOptions };

/** Per-request Supabase client for Server Components / Route Handlers / Server Actions. */
export async function getServerSupabase() {
  const store = await cookies();
  return createServerClient<Database>(supabaseEnv.url(), supabaseEnv.anonKey(), {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (entries: CookieEntry[]) => {
        try {
          entries.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component where set isn't allowed — safe to ignore. */
        }
      }
    }
  });
}
