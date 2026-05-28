"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
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
  ChapterRow,
  WorkVersionInsert,
  WorkVersionRow
} from "@/lib/supabase/types";

const UUID = z.string().uuid("Invalid id");

/** Throw a user-facing message instead of leaking the raw ZodError shape. */
function parseInput<T>(schema: z.ZodType<T>, input: unknown, label: string): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first.path.length > 0 ? ` (${first.path.join(".")})` : "";
    throw new Error(`${label}: ${first.message}${path}`);
  }
  return result.data;
}

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

function revalidateSeriesSurfaces(seriesSlug?: string | null, chapterSlug?: string | null) {
  revalidatePath("/");
  revalidatePath("/works");
  if (seriesSlug) {
    revalidatePath(`/series/${seriesSlug}`);
    if (chapterSlug) revalidatePath(`/series/${seriesSlug}/${chapterSlug}`);
  }
}

async function getSeriesSlug(seriesId: string): Promise<string | null> {
  const supabase = getAdminSupabase();
  const { data } = await supabase
    .from("works")
    .select("slug")
    .eq("id", seriesId)
    .maybeSingle()
    .returns<Pick<WorkRow, "slug"> | null>();
  return data?.slug ?? null;
}

/**
 * Best-effort removal of every object directly under a prefix in `covers/`.
 * Stays one level deep — file uploads in this project are flat per-prefix.
 * Errors are swallowed: a stale storage file is harmless next to a successful
 * row delete.
 */
async function removeCoversPrefix(prefix: string): Promise<void> {
  if (!prefix || prefix.includes("..")) return;
  const supabase = getAdminSupabase();
  const { data, error } = await supabase.storage.from("covers").list(prefix, {
    limit: 1000
  });
  if (error || !data || data.length === 0) return;
  const paths = data.map((f) => `${prefix}/${f.name}`);
  await supabase.storage.from("covers").remove(paths);
}

/** Sweep every storage prefix tied to a work id (cover + inline editor uploads). */
async function removeWorkStorage(workId: string): Promise<void> {
  await Promise.all([
    removeCoversPrefix(workId),
    removeCoversPrefix(`editor/${workId}`)
  ]);
  // Note: post-Phase-5 uploads land in `covers/dedup/<hash>.<ext>` and are
  // shared across works, so we deliberately do NOT sweep that prefix on
  // delete — another work may still reference the same image. Orphaned
  // dedup files are reclaimed manually if storage pressure ever matters.
}

/**
 * Upload bytes once. Reuses the existing path when the SHA-256 of the file
 * matches a prior upload — saves bandwidth + Supabase storage for the writer
 * who re-uploads the same cover into different works. Returns a public URL
 * that the caller can persist on whichever row it belongs to.
 */
async function dedupUploadToCovers(
  file: File
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  const ext = (file.name.split(".").pop() || "bin")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const objectPath = `dedup/${hash}.${ext}`;
  const supabase = getAdminSupabase();

  const { data: existing } = await supabase.storage.from("covers").list("dedup", {
    search: `${hash}.${ext}`,
    limit: 1
  });

  if (existing && existing.length > 0) {
    const { data } = supabase.storage.from("covers").getPublicUrl(objectPath);
    return { ok: true, url: data.publicUrl };
  }

  const { error } = await supabase.storage.from("covers").upload(objectPath, file, {
    contentType: file.type,
    upsert: false,
    cacheControl: "31536000"
  });

  // A "Duplicate" error here means another request raced us to the same path,
  // which is exactly the dedup outcome we want — treat it as success.
  if (error && !/already exists|duplicate/i.test(error.message)) {
    return { ok: false, error: `Upload failed: ${error.message}` };
  }

  const { data } = supabase.storage.from("covers").getPublicUrl(objectPath);
  return { ok: true, url: data.publicUrl };
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

const updateWorkSchema = z.object({
  id: UUID,
  title: z.string().max(300).optional(),
  subtitle: z.string().max(500).nullable().optional(),
  excerpt: z.string().max(2000).optional(),
  body: z.string().max(2_000_000).optional(),
  tags: z.array(z.string().min(1).max(60)).max(40).optional(),
  coverImage: z.string().url().max(2000).nullable().optional(),
  poetryMode: z.boolean().optional(),
  featured: z.boolean().optional(),
  wordCount: z.number().int().min(0).max(10_000_000).optional(),
  readingMinutes: z.number().int().min(0).max(100_000).optional(),
  seriesStatus: z.enum(["ongoing", "completed", "hiatus"]).optional(),
  publishedAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .nullable()
    .optional(),
  scheduledAt: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .optional()
});

export type UpdateWorkInput = z.infer<typeof updateWorkSchema>;

export async function updateWork(rawInput: UpdateWorkInput) {
  await assertOwner();
  const input = parseInput(updateWorkSchema, rawInput, "updateWork");
  const supabase = getAdminSupabase();

  const patch: WorkUpdate = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.subtitle !== undefined) patch.subtitle = input.subtitle;
  if (input.excerpt !== undefined) patch.excerpt = input.excerpt;
  if (input.body !== undefined) patch.body = input.body;
  if (input.tags !== undefined) patch.tags = input.tags;
  if (input.coverImage !== undefined) patch.cover_image = input.coverImage;
  if (input.poetryMode !== undefined) patch.poetry_mode = input.poetryMode;
  if (input.featured !== undefined) patch.featured = input.featured;
  if (input.wordCount !== undefined) patch.word_count = input.wordCount;
  if (input.readingMinutes !== undefined) patch.reading_minutes = input.readingMinutes;
  if (input.seriesStatus !== undefined) patch.series_status = input.seriesStatus;
  if (input.publishedAt !== undefined) patch.published_at = input.publishedAt;
  if (input.scheduledAt !== undefined) patch.scheduled_at = input.scheduledAt;

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

/**
 * Snapshot a work's current title/body into work_versions. Called from
 * publishWork (before the status flip) and from restoreWorkVersion so
 * rollbacks themselves leave a trace. Best-effort — a snapshot failure
 * does NOT block the publish, since we'd rather ship than freeze.
 */
async function captureWorkVersion(workId: string): Promise<void> {
  const supabase = getAdminSupabase();
  const { data } = await supabase
    .from("works")
    .select("title, subtitle, excerpt, body")
    .eq("id", workId)
    .maybeSingle()
    .returns<
      Pick<WorkRow, "title" | "subtitle" | "excerpt" | "body"> | null
    >();
  if (!data) return;
  const insert: WorkVersionInsert = {
    work_id: workId,
    title: data.title,
    subtitle: data.subtitle,
    excerpt: data.excerpt,
    body: data.body
  };
  try {
    await supabase.from("work_versions").insert(insert as never);
  } catch {
    /* swallow — version snapshot is opportunistic */
  }
}

export async function publishWork(id: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  await captureWorkVersion(id);

  const { data: existing } = await supabase
    .from("works")
    .select("published_at")
    .eq("id", id)
    .maybeSingle()
    .returns<Pick<WorkRow, "published_at"> | null>();

  const patch: WorkUpdate = {
    status: "published",
    published_at: existing?.published_at ?? new Date().toISOString()
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

/**
 * Restore a work to a prior snapshot. Captures the current state into
 * work_versions first, then overwrites title/body/excerpt with the chosen
 * version. Status is left untouched — the writer publishes manually after
 * reviewing the rollback.
 */
export async function restoreWorkVersion(versionId: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const { data: version, error: fetchErr } = await supabase
    .from("work_versions")
    .select("work_id, title, subtitle, excerpt, body")
    .eq("id", versionId)
    .maybeSingle()
    .returns<
      Pick<WorkVersionRow, "work_id" | "title" | "subtitle" | "excerpt" | "body"> | null
    >();
  if (fetchErr) {
    throw new Error(`Failed to load version: ${fetchErr.message}`);
  }
  if (!version) throw new Error("Version not found.");

  // Snapshot current state before overwriting, so the rollback is itself
  // reversible.
  await captureWorkVersion(version.work_id);

  const patch: WorkUpdate = {
    title: version.title,
    subtitle: version.subtitle,
    excerpt: version.excerpt,
    body: version.body
  };
  const { error: updateErr } = await supabase
    .from("works")
    .update(patch as never)
    .eq("id", version.work_id);
  if (updateErr) throw new Error(`Failed to restore version: ${updateErr.message}`);

  revalidatePath(`/studio/works/${version.work_id}`);
  revalidatePath(`/studio/works/${version.work_id}/versions`);
  return { ok: true as const, workId: version.work_id };
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

/**
 * Soft delete — sets `deleted_at` on the work (and cascades to its chapters
 * when it's a series). Row + storage stay around until permanent purge from
 * the Trash view. All public read APIs filter `deleted_at is null`.
 */
export async function deleteWork(id: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("works")
    .select("kind, slug")
    .eq("id", id)
    .maybeSingle()
    .returns<Pick<WorkRow, "kind" | "slug"> | null>();

  const patch: WorkUpdate = { deleted_at: now };
  const { error } = await supabase
    .from("works")
    .update(patch as never)
    .eq("id", id);
  if (error) throw new Error(`Failed to delete work: ${error.message}`);

  if (existing?.kind === "series") {
    const chapPatch: ChapterUpdate = { deleted_at: now };
    const { error: chapErr } = await supabase
      .from("chapters")
      .update(chapPatch as never)
      .eq("series_id", id)
      .is("deleted_at", null);
    if (chapErr) {
      throw new Error(`Failed to delete series chapters: ${chapErr.message}`);
    }
  }

  revalidateReadingSurfaces(existing?.slug ?? null);
  revalidatePath("/studio/works");
  revalidatePath("/studio/series");
  revalidatePath("/studio/trash");
  redirect("/studio/works");
}

export async function restoreWork(id: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const patch: WorkUpdate = { deleted_at: null };
  const { data: rawData, error } = await supabase
    .from("works")
    .update(patch as never)
    .eq("id", id)
    .select("slug, kind, status")
    .single();
  const row = rawData as Pick<WorkRow, "slug" | "kind" | "status"> | null;
  if (error) throw new Error(`Failed to restore work: ${error.message}`);

  if (row?.kind === "series") {
    const chapPatch: ChapterUpdate = { deleted_at: null };
    await supabase
      .from("chapters")
      .update(chapPatch as never)
      .eq("series_id", id);
  }

  if (row?.status === "published") revalidateReadingSurfaces(row.slug);
  revalidatePath("/studio/works");
  revalidatePath("/studio/series");
  revalidatePath("/studio/trash");
  return { ok: true as const };
}

/**
 * Hard delete — only callable from the Trash view. Removes the DB row +
 * sweeps storage. Once gone, gone.
 */
export async function purgeWork(id: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const { data: existing } = await supabase
    .from("works")
    .select("kind, slug")
    .eq("id", id)
    .maybeSingle()
    .returns<Pick<WorkRow, "kind" | "slug"> | null>();

  let chapterIds: string[] = [];
  if (existing?.kind === "series") {
    const { data: chs } = await supabase
      .from("chapters")
      .select("id")
      .eq("series_id", id);
    chapterIds = ((chs ?? []) as Pick<ChapterRow, "id">[]).map((c) => c.id);
  }

  const { error } = await supabase.from("works").delete().eq("id", id);
  if (error) throw new Error(`Failed to purge work: ${error.message}`);

  await removeWorkStorage(id);
  await Promise.all(chapterIds.map((cid) => removeWorkStorage(cid)));

  revalidateReadingSurfaces(existing?.slug ?? null);
  revalidatePath("/studio/trash");
  return { ok: true as const };
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

const updateChapterSchema = z.object({
  id: UUID,
  title: z.string().max(300).optional(),
  subtitle: z.string().max(500).nullable().optional(),
  excerpt: z.string().max(2000).optional(),
  body: z.string().max(2_000_000).optional(),
  poetryMode: z.boolean().optional(),
  coverImage: z.string().url().max(2000).nullable().optional(),
  wordCount: z.number().int().min(0).max(10_000_000).optional(),
  readingMinutes: z.number().int().min(0).max(100_000).optional(),
  publishedAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .nullable()
    .optional()
});

export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;

export async function updateChapter(rawInput: UpdateChapterInput) {
  await assertOwner();
  const input = parseInput(updateChapterSchema, rawInput, "updateChapter");
  const supabase = getAdminSupabase();

  const patch: ChapterUpdate = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.subtitle !== undefined) patch.subtitle = input.subtitle;
  if (input.excerpt !== undefined) patch.excerpt = input.excerpt;
  if (input.body !== undefined) patch.body = input.body;
  if (input.poetryMode !== undefined) patch.poetry_mode = input.poetryMode;
  if (input.coverImage !== undefined) patch.cover_image = input.coverImage;
  if (input.wordCount !== undefined) patch.word_count = input.wordCount;
  if (input.readingMinutes !== undefined) patch.reading_minutes = input.readingMinutes;
  if (input.publishedAt !== undefined) patch.published_at = input.publishedAt;

  const { data: rawData, error } = await supabase
    .from("chapters")
    .update(patch as never)
    .eq("id", input.id)
    .select("slug, status, series_id")
    .single();
  const data = rawData as Pick<ChapterRow, "slug" | "status" | "series_id"> | null;

  if (error) throw new Error(`Failed to update chapter: ${error.message}`);

  if (data?.status === "published") {
    const seriesSlug = await getSeriesSlug(data.series_id);
    revalidateSeriesSurfaces(seriesSlug, data.slug);
  }
  revalidatePath(`/studio/series/${data?.series_id ?? ""}/chapters/${input.id}`);

  return { ok: true as const, savedAt: Date.now() };
}

export async function publishChapter(id: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const { data: existing } = await supabase
    .from("chapters")
    .select("published_at")
    .eq("id", id)
    .maybeSingle()
    .returns<Pick<ChapterRow, "published_at"> | null>();

  const patch: ChapterUpdate = {
    status: "published",
    published_at: existing?.published_at ?? new Date().toISOString()
  };

  const { data: rawData, error } = await supabase
    .from("chapters")
    .update(patch as never)
    .eq("id", id)
    .select("slug, series_id")
    .single();
  const data = rawData as Pick<ChapterRow, "slug" | "series_id"> | null;

  if (error) throw new Error(`Failed to publish chapter: ${error.message}`);
  if (data) {
    const seriesSlug = await getSeriesSlug(data.series_id);
    revalidateSeriesSurfaces(seriesSlug, data.slug);
    revalidatePath(`/studio/series/${data.series_id}`);
  }
  return { ok: true as const };
}

export async function unpublishChapter(id: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const patch: ChapterUpdate = { status: "draft" };

  const { data: rawData, error } = await supabase
    .from("chapters")
    .update(patch as never)
    .eq("id", id)
    .select("slug, series_id")
    .single();
  const data = rawData as Pick<ChapterRow, "slug" | "series_id"> | null;

  if (error) throw new Error(`Failed to unpublish chapter: ${error.message}`);
  if (data) {
    const seriesSlug = await getSeriesSlug(data.series_id);
    revalidateSeriesSurfaces(seriesSlug, data.slug);
    revalidatePath(`/studio/series/${data.series_id}`);
  }
  return { ok: true as const };
}

export async function deleteChapter(id: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const patch: ChapterUpdate = { deleted_at: new Date().toISOString() };
  const { data: rawData, error } = await supabase
    .from("chapters")
    .update(patch as never)
    .eq("id", id)
    .select("slug, series_id")
    .single();
  const data = rawData as Pick<ChapterRow, "slug" | "series_id"> | null;

  if (error) throw new Error(`Failed to delete chapter: ${error.message}`);

  if (data) {
    const seriesSlug = await getSeriesSlug(data.series_id);
    revalidateSeriesSurfaces(seriesSlug, data.slug);
    revalidatePath(`/studio/series/${data.series_id}`);
    revalidatePath("/studio/trash");
    redirect(`/studio/series/${data.series_id}`);
  }
  return { ok: true as const };
}

export async function restoreChapter(id: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const patch: ChapterUpdate = { deleted_at: null };
  const { data: rawData, error } = await supabase
    .from("chapters")
    .update(patch as never)
    .eq("id", id)
    .select("slug, series_id, status")
    .single();
  const data = rawData as Pick<ChapterRow, "slug" | "series_id" | "status"> | null;
  if (error) throw new Error(`Failed to restore chapter: ${error.message}`);

  if (data?.status === "published") {
    const seriesSlug = await getSeriesSlug(data.series_id);
    revalidateSeriesSurfaces(seriesSlug, data.slug);
  }
  revalidatePath(`/studio/series/${data?.series_id ?? ""}`);
  revalidatePath("/studio/trash");
  return { ok: true as const };
}

export async function purgeChapter(id: string) {
  await assertOwner();
  const supabase = getAdminSupabase();

  const { data: rawData, error } = await supabase
    .from("chapters")
    .delete()
    .eq("id", id)
    .select("slug, series_id")
    .single();
  const data = rawData as Pick<ChapterRow, "slug" | "series_id"> | null;
  if (error) throw new Error(`Failed to purge chapter: ${error.message}`);

  await removeWorkStorage(id);

  if (data) {
    const seriesSlug = await getSeriesSlug(data.series_id);
    revalidateSeriesSurfaces(seriesSlug, data.slug);
  }
  revalidatePath("/studio/trash");
  return { ok: true as const };
}

// =============================================================================
// Cover image uploads (Supabase Storage → covers/ bucket)
// =============================================================================

const COVER_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const COVER_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif"
]);

export type UploadCoverResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Uploads a cover image for `workId` to the public `covers` bucket and writes
 * the resulting public URL back onto `works.cover_image`. Returns either a new
 * URL or a user-facing error message — the form decides how to show it.
 */
export async function uploadCover(formData: FormData): Promise<UploadCoverResult> {
  await assertOwner();

  const workId = String(formData.get("workId") ?? "");
  const file = formData.get("file");

  if (!workId) return { ok: false, error: "Missing workId." };
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file received." };
  }
  if (!COVER_ALLOWED_MIME.has(file.type)) {
    return {
      ok: false,
      error: `Unsupported file type (${file.type || "unknown"}). Use JPEG, PNG, WebP, AVIF, or GIF.`
    };
  }
  if (file.size > COVER_MAX_BYTES) {
    return {
      ok: false,
      error: `File too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max is 5 MB.`
    };
  }

  const uploaded = await dedupUploadToCovers(file);
  if (!uploaded.ok) return uploaded;
  const publicUrl = uploaded.url;

  const supabase = getAdminSupabase();
  const patch: WorkUpdate = { cover_image: publicUrl };
  const { data: updated, error: updateError } = await supabase
    .from("works")
    .update(patch as never)
    .eq("id", workId)
    .select("slug, status")
    .single();

  if (updateError) {
    return { ok: false, error: `Saved file but failed to attach: ${updateError.message}` };
  }

  const row = updated as Pick<WorkRow, "slug" | "status"> | null;
  if (row?.status === "published") revalidateReadingSurfaces(row.slug);
  revalidatePath(`/studio/works/${workId}`);

  return { ok: true, url: publicUrl };
}

/**
 * Generic image upload. Same validation as cover upload but writes to the
 * caller-supplied path prefix and returns just the public URL — no DB write.
 * Use this for any non-cover-row image (portrait, OG art, future inline media).
 */
export type UploadImageResult = { ok: true; url: string } | { ok: false; error: string };

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif"
]);

export async function uploadStudioImage(formData: FormData): Promise<UploadImageResult> {
  await assertOwner();

  const prefix = String(formData.get("prefix") ?? "").replace(/^\/+|\/+$/g, "");
  const file = formData.get("file");

  if (!prefix || prefix.includes("..")) {
    return { ok: false, error: "Invalid upload prefix." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file received." };
  }
  if (!IMAGE_ALLOWED_MIME.has(file.type)) {
    return {
      ok: false,
      error: `Unsupported file type (${file.type || "unknown"}). Use JPEG, PNG, WebP, AVIF, or GIF.`
    };
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return {
      ok: false,
      error: `File too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max is 5 MB.`
    };
  }

  // Prefix is preserved for legibility / auditability of WHERE in the studio
  // the upload came from, but the underlying storage path is the dedup hash.
  // Same bytes uploaded twice → same URL.
  return dedupUploadToCovers(file);
}

// =============================================================================
// Bulk actions (multi-select on /studio/works + /studio/drafts)
// =============================================================================

const bulkWorksSchema = z.object({
  ids: z.array(UUID).min(1).max(200),
  action: z.enum(["publish", "unpublish", "delete"])
});

export type BulkWorksInput = z.infer<typeof bulkWorksSchema>;

/**
 * Apply the same status flip to every work id in `ids`. Returns the count of
 * successful operations and any per-id errors so the UI can surface a partial
 * failure without rolling back the rest.
 */
export async function bulkUpdateWorks(rawInput: BulkWorksInput) {
  await assertOwner();
  const { ids, action } = parseInput(bulkWorksSchema, rawInput, "bulkUpdateWorks");
  const supabase = getAdminSupabase();

  // Fetch slugs/kinds up front so revalidation hits the right paths.
  const { data: existing } = await supabase
    .from("works")
    .select("id, slug, kind")
    .in("id", ids)
    .is("deleted_at", null)
    .returns<Pick<WorkRow, "id" | "slug" | "kind">[]>();
  const rows = existing ?? [];

  const errors: { id: string; message: string }[] = [];
  let succeeded = 0;
  const now = new Date().toISOString();

  for (const row of rows) {
    try {
      if (action === "publish") {
        const { data: cur } = await supabase
          .from("works")
          .select("published_at")
          .eq("id", row.id)
          .maybeSingle()
          .returns<Pick<WorkRow, "published_at"> | null>();
        const patch: WorkUpdate = {
          status: "published",
          published_at: cur?.published_at ?? now
        };
        const { error } = await supabase
          .from("works")
          .update(patch as never)
          .eq("id", row.id);
        if (error) throw error;
      } else if (action === "unpublish") {
        const patch: WorkUpdate = { status: "draft" };
        const { error } = await supabase
          .from("works")
          .update(patch as never)
          .eq("id", row.id);
        if (error) throw error;
      } else {
        const patch: WorkUpdate = { deleted_at: now };
        const { error } = await supabase
          .from("works")
          .update(patch as never)
          .eq("id", row.id);
        if (error) throw error;
        if (row.kind === "series") {
          const chapPatch: ChapterUpdate = { deleted_at: now };
          await supabase
            .from("chapters")
            .update(chapPatch as never)
            .eq("series_id", row.id)
            .is("deleted_at", null);
        }
      }
      succeeded++;
      revalidateReadingSurfaces(row.slug);
    } catch (err) {
      errors.push({
        id: row.id,
        message: err instanceof Error ? err.message : String(err)
      });
    }
  }

  revalidatePath("/studio/works");
  revalidatePath("/studio/series");
  revalidatePath("/studio/drafts");
  revalidatePath("/studio/trash");

  return { ok: true as const, succeeded, errors };
}

const bulkChaptersSchema = z.object({
  ids: z.array(UUID).min(1).max(500),
  action: z.enum(["publish", "unpublish", "delete"])
});

export type BulkChaptersInput = z.infer<typeof bulkChaptersSchema>;

export async function bulkUpdateChapters(rawInput: BulkChaptersInput) {
  await assertOwner();
  const { ids, action } = parseInput(
    bulkChaptersSchema,
    rawInput,
    "bulkUpdateChapters"
  );
  const supabase = getAdminSupabase();

  const { data: existing } = await supabase
    .from("chapters")
    .select("id, slug, series_id")
    .in("id", ids)
    .is("deleted_at", null)
    .returns<Pick<ChapterRow, "id" | "slug" | "series_id">[]>();
  const rows = existing ?? [];

  const errors: { id: string; message: string }[] = [];
  let succeeded = 0;
  const now = new Date().toISOString();
  const touchedSeries = new Set<string>();

  for (const row of rows) {
    try {
      if (action === "publish") {
        const { data: cur } = await supabase
          .from("chapters")
          .select("published_at")
          .eq("id", row.id)
          .maybeSingle()
          .returns<Pick<ChapterRow, "published_at"> | null>();
        const patch: ChapterUpdate = {
          status: "published",
          published_at: cur?.published_at ?? now
        };
        const { error } = await supabase
          .from("chapters")
          .update(patch as never)
          .eq("id", row.id);
        if (error) throw error;
      } else if (action === "unpublish") {
        const patch: ChapterUpdate = { status: "draft" };
        const { error } = await supabase
          .from("chapters")
          .update(patch as never)
          .eq("id", row.id);
        if (error) throw error;
      } else {
        const patch: ChapterUpdate = { deleted_at: now };
        const { error } = await supabase
          .from("chapters")
          .update(patch as never)
          .eq("id", row.id);
        if (error) throw error;
      }
      succeeded++;
      touchedSeries.add(row.series_id);
    } catch (err) {
      errors.push({
        id: row.id,
        message: err instanceof Error ? err.message : String(err)
      });
    }
  }

  // One series-level revalidate per touched series instead of per row.
  await Promise.all(
    [...touchedSeries].map(async (sid) => {
      const slug = await getSeriesSlug(sid);
      revalidateSeriesSurfaces(slug);
      revalidatePath(`/studio/series/${sid}`);
    })
  );
  revalidatePath("/studio/drafts");
  revalidatePath("/studio/trash");

  return { ok: true as const, succeeded, errors };
}

const reorderChaptersSchema = z.object({
  seriesId: UUID,
  orderedIds: z
    .array(UUID)
    .min(1, "Need at least one chapter id")
    .max(1000)
    .refine((ids) => new Set(ids).size === ids.length, "Duplicate chapter id")
});

export async function reorderChapters(seriesId: string, orderedIds: string[]) {
  await assertOwner();
  const input = parseInput(
    reorderChaptersSchema,
    { seriesId, orderedIds },
    "reorderChapters"
  );
  const supabase = getAdminSupabase();

  // Verify every id actually belongs to this series — never trust a client list.
  const { data: rawExisting, error: fetchError } = await supabase
    .from("chapters")
    .select("id")
    .eq("series_id", input.seriesId)
    .in("id", input.orderedIds);
  if (fetchError) {
    throw new Error(`reorderChapters: ${fetchError.message}`);
  }
  const existing = (rawExisting ?? []) as Pick<ChapterRow, "id">[];
  if (existing.length !== input.orderedIds.length) {
    throw new Error(
      "reorderChapters: one or more chapter ids do not belong to this series"
    );
  }

  for (let i = 0; i < input.orderedIds.length; i++) {
    const patch: ChapterUpdate = { number: i + 1 };
    const { error } = await supabase
      .from("chapters")
      .update(patch as never)
      .eq("id", input.orderedIds[i])
      .eq("series_id", input.seriesId);
    if (error) throw new Error(`Failed to reorder chapters: ${error.message}`);
  }

  revalidatePath(`/studio/series/${input.seriesId}`);
  return { ok: true as const };
}
