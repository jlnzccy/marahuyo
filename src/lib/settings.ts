import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";
import type { Database, SettingsRow } from "@/lib/supabase/types";

const FALLBACK_PORTRAIT = (() => {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'>` +
    `<defs><linearGradient id='g' gradientTransform='rotate(165 0.5 0.5)'>` +
    `<stop offset='0' stop-color='#fde68a'/><stop offset='1' stop-color='#a16207'/>` +
    `</linearGradient></defs><rect width='1000' height='1000' fill='url(%23g)'/></svg>`;
  return `data:image/svg+xml;utf8,${svg.replace(/#/g, "%23")}`;
})();

let cached: ReturnType<typeof createClient<Database>> | null = null;

function getPublicSupabase() {
  if (cached) return cached;
  cached = createClient<Database>(supabaseEnv.url(), supabaseEnv.anonKey(), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return cached;
}

export type SiteSettingsAuthor = {
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

export type SiteSettingsAboutPlace = {
  title: string;
  body: string;
  quote: string;
};

export type SiteSettings = {
  defaultTheme: string;
  instagramUrl: string | null;
  twitterUrl: string | null;
  mediumUrl: string | null;
  githubUrl: string | null;
  contactEmail: string | null;
  author: SiteSettingsAuthor;
  aboutPlace: SiteSettingsAboutPlace;
};

/**
 * Compile-time guard: every SettingsRow column should map to a SiteSettings
 * field or be intentionally omitted (id, updated_at). If a migration adds a
 * column and you forget to wire it through, this map will fail to type-check.
 */
type _SettingsRowKey = keyof SettingsRow;
type _MappedSettingsKeys =
  | "id"
  | "updated_at"
  | "default_theme"
  | "instagram_url"
  | "twitter_url"
  | "medium_url"
  | "github_url"
  | "contact_email"
  | "portrait_url"
  | "author_name"
  | "author_handle"
  | "author_tagline"
  | "author_subtitle"
  | "author_short_bio"
  | "author_bio"
  | "author_bio_long"
  | "author_location"
  | "about_place_title"
  | "about_place_body"
  | "about_place_quote";
type _AssertAllMapped = Exclude<_SettingsRowKey, _MappedSettingsKeys> extends never
  ? true
  : `Unmapped SettingsRow column — extend getSiteSettings()`;
const _settingsExhaustive: _AssertAllMapped = true;
void _settingsExhaustive;

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const sb = getPublicSupabase();
  // settings_public is a Postgres VIEW not in the generated Database type.
  // We query it raw and cast the result to SettingsRow.
  const { data } = await sb
    .from("settings_public" as never)
    .select("*")
    .eq("id", "singleton")
    .maybeSingle();

  const row = (data ?? null) as SettingsRow | null;

  return {
    defaultTheme: row?.default_theme ?? "light",
    instagramUrl: row?.instagram_url ?? null,
    twitterUrl: row?.twitter_url ?? null,
    mediumUrl: row?.medium_url ?? null,
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
      portraitUrl: row?.portrait_url?.trim() || FALLBACK_PORTRAIT
    },
    aboutPlace: {
      title: row?.about_place_title?.trim() ?? "",
      body: row?.about_place_body?.trim() ?? "",
      quote: row?.about_place_quote?.trim() ?? ""
    }
  };
});
