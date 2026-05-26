"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getStudioSession } from "@/lib/supabase/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { slugify, withSuffix } from "@/lib/slug";
import type { WorkKind } from "@/types/content";
import type {
  WorkInsert,
  WorkUpdate,
  WorkRow,
  ChapterInsert,
  ChapterUpdate,
  ChapterRow
} from "@/lib/supabase/types";

/**
 * Every action in this file uses the admin (secret-key) Supabase client which
 * bypasses RLS. As defense in depth we re-verify the caller is the studio
 * owner before any read or write — middleware can be bypassed by a misconfigured
 * matcher, so we never trust it alone.
 */
async function assertOwner() {
  const session = await getStudioSession();
  if (!session?.isOwner) {
    throw new Error("Unauthorized — owner session required.");
  }
  return session;
}

function revalidateReadingSurfaces(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/works");
  if (slug) revalidatePath(`/read/${slug}`);
}

// =============================================================================
// Works (standalone + series parents)
// =============================================================================

export type CreateWorkInput = {
  kind: WorkKind;
  title: string;
};

export async function createWork({ kind, title }: CreateWorkInput) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const safeTitle = title.trim() || "Untitled";
  let slug = slugify(safeTitle) || "untitled";

  // Resolve slug collision by appending a short suffix.
  const { data: existing } = await supabase
    .from("works")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()
    .returns<{ id: string } | null>();
  if (existing) slug = withSuffix(slug);

  const insertRow: WorkInsert = {
    slug,
    title: safeTitle,
    kind,
    status: "draft",
    excerpt: "",
    body: "",
    tags: []
  };

  const { data: rawData, error } = await supabase
    .from("works")
    // supabase-js's generic inference collapses on hand-written Database types;
    // the cast keeps the runtime shape (insertRow above) statically correct.
    .insert(insertRow as never)
    .select("id")
    .single();
  const data = rawData as { id: string } | null;

  if (error || !data) {
    throw new Error(`Failed to create work: ${error?.message ?? "unknown error"}`);
  }

  revalidatePath("/studio/works");
  redirect(`/studio/works/${data.id}`);
}

export type UpdateWorkInput = {
  id: string;
  title?: string;
  subtitle?: string | null;
  excerpt?: string;
  body?: string;
  tags?: string[];
  coverImage?: string | null;
  coverColor?: string | null;
  poetryMode?: boolean;
  wordCount?: number;
  readingMinutes?: number;
};

export async function updateWork(input: UpdateWorkInput) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const patch: WorkUpdate = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.subtitle !== undefined) patch.subtitle = input.subtitle;
  if (input.excerpt !== undefined) patch.excerpt = input.excerpt;
  if (input.body !== undefined) patch.body = input.body;
  if (input.tags !== undefined) patch.tags = input.tags;
  if (input.coverImage !== undefined) patch.cover_image = input.coverImage;
  if (input.coverColor !== undefined) patch.cover_color = input.coverColor;
  if (input.poetryMode !== undefined) patch.poetry_mode = input.poetryMode;
  if (input.wordCount !== undefined) patch.word_count = input.wordCount;
  if (input.readingMinutes !== undefined) patch.reading_minutes = input.readingMinutes;

  const { data: rawData, error } = await supabase
    .from("works")
    .update(patch as never)
    .eq("id", input.id)
    .select("slug, status")
    .single();
  const data = rawData as Pick<WorkRow, "slug" | "status"> | null;

  if (error) throw new Error(`Failed to update work: ${error.message}`);

  // Only refresh public surfaces if this row is actually visible.
  if (data?.status === "published") revalidateReadingSurfaces(data.slug);
  revalidatePath(`/studio/works/${input.id}`);

  return { ok: true as const, savedAt: Date.now() };
}

export async function publishWork(id: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const patch: WorkUpdate = {
    status: "published",
    published_at: new Date().toISOString()
  };

  const { data: rawData, error } = await supabase
    .from("works")
    .update(patch as never)
    .eq("id", id)
    .select("slug")
    .single();
  const data = rawData as Pick<WorkRow, "slug"> | null;

  if (error) throw new Error(`Failed to publish work: ${error.message}`);
  revalidateReadingSurfaces(data?.slug ?? null);
  revalidatePath("/studio/works");
  return { ok: true as const };
}

export async function unpublishWork(id: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const patch: WorkUpdate = { status: "draft" };

  const { data: rawData, error } = await supabase
    .from("works")
    .update(patch as never)
    .eq("id", id)
    .select("slug")
    .single();
  const data = rawData as Pick<WorkRow, "slug"> | null;

  if (error) throw new Error(`Failed to unpublish work: ${error.message}`);
  revalidateReadingSurfaces(data?.slug ?? null);
  revalidatePath("/studio/works");
  return { ok: true as const };
}

export async function deleteWork(id: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const { data: rawData, error } = await supabase
    .from("works")
    .delete()
    .eq("id", id)
    .select("slug")
    .single();
  const data = rawData as Pick<WorkRow, "slug"> | null;

  if (error) throw new Error(`Failed to delete work: ${error.message}`);
  revalidateReadingSurfaces(data?.slug ?? null);
  revalidatePath("/studio/works");
  revalidatePath("/studio/series");
  redirect("/studio/works");
}

// =============================================================================
// Chapters (only for series)
// =============================================================================

export async function createChapter(seriesId: string, title: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  // Determine the next chapter number (max+1, default 1).
  const { data: lastChapter } = await supabase
    .from("chapters")
    .select("number")
    .eq("series_id", seriesId)
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle()
    .returns<Pick<ChapterRow, "number"> | null>();

  const nextNumber = (lastChapter?.number ?? 0) + 1;
  const safeTitle = title.trim() || `Chapter ${nextNumber}`;
  let slug = slugify(safeTitle) || `chapter-${nextNumber}`;

  const { data: existing } = await supabase
    .from("chapters")
    .select("id")
    .eq("series_id", seriesId)
    .eq("slug", slug)
    .maybeSingle()
    .returns<{ id: string } | null>();
  if (existing) slug = withSuffix(slug);

  const insertRow: ChapterInsert = {
    series_id: seriesId,
    slug,
    number: nextNumber,
    title: safeTitle,
    status: "draft",
    body: ""
  };

  const { data: rawData, error } = await supabase
    .from("chapters")
    .insert(insertRow as never)
    .select("id, series_id")
    .single();
  const data = rawData as Pick<ChapterRow, "id" | "series_id"> | null;

  if (error || !data) {
    throw new Error(`Failed to create chapter: ${error?.message ?? "unknown error"}`);
  }

  revalidatePath(`/studio/series/${seriesId}`);
  redirect(`/studio/series/${seriesId}/chapters/${data.id}`);
}

export async function reorderChapters(seriesId: string, orderedIds: string[]) {
  await assertOwner();
  const supabase = getAdminSupabase();

  // One UPDATE per row. For small chapter counts (the only realistic case here)
  // this is dramatically simpler than a CTE bulk update and the round-trips are
  // negligible. If this ever becomes hot, switch to an RPC.
  for (let i = 0; i < orderedIds.length; i++) {
    const patch: ChapterUpdate = { number: i + 1 };
    const { error } = await supabase
      .from("chapters")
      .update(patch as never)
      .eq("id", orderedIds[i])
      .eq("series_id", seriesId);
    if (error) throw new Error(`Failed to reorder chapters: ${error.message}`);
  }

  revalidatePath(`/studio/series/${seriesId}`);
  return { ok: true as const };
}
