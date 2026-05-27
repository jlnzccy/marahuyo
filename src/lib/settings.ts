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
  aboutPlace: {
    title: string;
    body: string;
    quote: string;
  };
};

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
      name: row?.author_name?.trim() ?? "",
      handle: row?.author_handle?.trim() ?? "",
      tagline: row?.author_tagline?.trim() ?? "",
      subtitle: row?.author_subtitle?.trim() ?? "",
      shortBio: row?.author_short_bio?.trim() ?? "",
      bio: row?.author_bio?.trim() ?? "",
      bioLong: row?.author_bio_long?.trim() ?? "",
      location: row?.author_location?.trim() ?? "",
      portraitUrl: row?.portrait_url?.trim() || AUTHOR.portraitUrl
    },
    aboutPlace: {
      title: row?.about_place_title?.trim() ?? "",
      body: row?.about_place_body?.trim() ?? "",
      quote: row?.about_place_quote?.trim() ?? ""
    }
  };
}
