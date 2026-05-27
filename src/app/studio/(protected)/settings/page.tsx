import { getAdminSupabase } from "@/lib/supabase/admin";
import type { SettingsRow } from "@/lib/supabase/types";
import { SettingsForm, type InitialSettings } from "./settings-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings · Studio" };

const DEFAULTS: InitialSettings = {
  defaultTheme: "light",
  instagramUrl: "",
  twitterUrl: "",
  mediumUrl: "",
  githubUrl: "",
  contactEmail: "",
  portraitUrl: "",
  authorSubtitle: "",
  authorName: "",
  authorHandle: "",
  authorTagline: "",
  authorShortBio: "",
  authorBio: "",
  authorBioLong: "",
  authorLocation: "",
  aboutPlaceTitle: "",
  aboutPlaceBody: "",
  aboutPlaceQuote: ""
};

export default async function StudioSettingsPage() {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", "singleton")
    .maybeSingle()
    .returns<SettingsRow | null>();

  if (error) {
    return (
      <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
        <p className="font-sans text-sm text-red-700">
          Couldn&rsquo;t load settings: {error.message}
        </p>
        <p className="mt-2 font-sans text-xs text-red-700/80">
          Did you apply <code>supabase/migrations/0003_settings.sql</code>,{" "}
          <code>0005_settings_about.sql</code>, <code>0006_about_place_settings.sql</code>,
          and <code>0007_settings_medium.sql</code>?
        </p>
      </div>
    );
  }

  const initial: InitialSettings = data
    ? {
        defaultTheme: data.default_theme ?? "light",
        instagramUrl: data.instagram_url ?? "",
        twitterUrl: data.twitter_url ?? "",
        mediumUrl: data.medium_url ?? "",
        githubUrl: data.github_url ?? "",
        contactEmail: data.contact_email ?? "",
        portraitUrl: data.portrait_url ?? "",
        authorSubtitle: data.author_subtitle ?? "",
        authorName: data.author_name ?? "",
        authorHandle: data.author_handle ?? "",
        authorTagline: data.author_tagline ?? "",
        authorShortBio: data.author_short_bio ?? "",
        authorBio: data.author_bio ?? "",
        authorBioLong: data.author_bio_long ?? "",
        authorLocation: data.author_location ?? "",
        aboutPlaceTitle: data.about_place_title ?? "",
        aboutPlaceBody: data.about_place_body ?? "",
        aboutPlaceQuote: data.about_place_quote ?? ""
      }
    : DEFAULTS;

  return <SettingsForm initial={initial} />;
}
