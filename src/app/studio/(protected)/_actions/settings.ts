"use server";

import { revalidatePath } from "next/cache";
import { getStudioSession } from "@/lib/supabase/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { SettingsUpdate } from "@/lib/supabase/types";

async function assertOwner() {
  const session = await getStudioSession();
  if (!session?.isOwner) throw new Error("Unauthorized — owner session required.");
}

export type UpdateSettingsInput = {
  defaultTheme?: string;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  substackUrl?: string | null;
  githubUrl?: string | null;
  contactEmail?: string | null;
  portraitUrl?: string | null;
  authorSubtitle?: string | null;
};

export async function updateSettings(input: UpdateSettingsInput) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const patch: SettingsUpdate = {};
  if (input.defaultTheme !== undefined) patch.default_theme = input.defaultTheme;
  if (input.instagramUrl !== undefined) patch.instagram_url = input.instagramUrl;
  if (input.twitterUrl !== undefined) patch.twitter_url = input.twitterUrl;
  if (input.substackUrl !== undefined) patch.substack_url = input.substackUrl;
  if (input.githubUrl !== undefined) patch.github_url = input.githubUrl;
  if (input.contactEmail !== undefined) patch.contact_email = input.contactEmail;
  if (input.portraitUrl !== undefined) patch.portrait_url = input.portraitUrl;
  if (input.authorSubtitle !== undefined) patch.author_subtitle = input.authorSubtitle;

  const { error } = await supabase
    .from("settings")
    .update(patch as never)
    .eq("id", "singleton");

  if (error) throw new Error(`Failed to update settings: ${error.message}`);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/studio/settings");

  return { ok: true as const, savedAt: Date.now() };
}
