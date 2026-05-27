import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";
import type { Database, SettingsRow } from "@/lib/supabase/types";
import { AUTHOR } from "@/lib/mock-content";

let cached: ReturnType<typeof createClient<Database>> | null = null;

function getPublicSupabase() {
  if (cached) return cached;
  cached = createClient<Database>(supabaseEnv.url(), supabaseEnv.anonKey(), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return cached;
}

export type SiteSettings = {
  defaultTheme: string;
  instagramUrl: string | null;
  twitterUrl: string | null;
  substackUrl: string | null;
  githubUrl: string | null;
  contactEmail: string | null;
  author: {
    name: string;
    handle: string;
    tagline: string;
    subtitle: string;
    shortBio: string;
    bio: string;
    bioLong: string;
    location: string;
    portraitUrl: string;
  };
};

/**
 * Load the singleton settings row, falling back to the static AUTHOR mock for
 * any field the writer hasn't filled in yet. Safe to call from any server
 * component — uses the anon key with RLS allowing public read on `settings`.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const sb = getPublicSupabase();
  const { data } = await sb
    .from("settings")
    .select("*")
    .eq("id", "singleton")
    .maybeSingle();

  const row = (data ?? null) as SettingsRow | null;

  return {
    defaultTheme: row?.default_theme ?? "light",
    instagramUrl: row?.instagram_url ?? null,
    twitterUrl: row?.twitter_url ?? null,
    substackUrl: row?.substack_url ?? null,
    githubUrl: row?.github_url ?? null,
    contactEmail: row?.contact_email ?? null,
    author: {
      name: row?.author_name?.trim() || AUTHOR.name,
      handle: row?.author_handle?.trim() || AUTHOR.handle,
      tagline: row?.author_tagline?.trim() || AUTHOR.tagline,
      subtitle: row?.author_subtitle?.trim() || AUTHOR.subtitle,
      shortBio: row?.author_short_bio?.trim() || AUTHOR.shortBio,
      bio: row?.author_bio?.trim() || AUTHOR.bio,
      bioLong: row?.author_bio_long?.trim() || AUTHOR.bioLong,
      location: row?.author_location?.trim() || AUTHOR.location,
      portraitUrl: row?.portrait_url?.trim() || AUTHOR.portraitUrl
    }
  };
}
