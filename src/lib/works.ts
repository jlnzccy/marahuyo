import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";
import type { ChapterRow, Database, WorkRow } from "@/lib/supabase/types";
import type { AnyWork, Chapter, Series, StandaloneWork } from "@/types/content";

let cached: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Stateless anon-key client for public reads. No cookies binding so it's safe
 * to call from generateStaticParams (build-time) as well as request scope.
 * RLS still enforces the published-only policy.
 */
function getPublicSupabase() {
  if (cached) return cached;
  cached = createClient<Database>(supabaseEnv.url(), supabaseEnv.anonKey(), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return cached;
}

function mapStandalone(row: WorkRow): StandaloneWork {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    kind: row.kind as "poem" | "essay" | "oneshot" | "article" | "story" | "note",
    status: row.status,
    publishedAt: row.published_at ?? undefined,
    tags: row.tags,
    excerpt: row.excerpt,
    wordCount: row.word_count,
    readingMinutes: row.reading_minutes,
    coverImage: row.cover_image ?? undefined,
    body: row.body,
    poetryMode: row.poetry_mode
  };
}

function mapSeries(row: WorkRow, chapters: Chapter[] = []): Series {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    kind: "series",
    status: row.status,
    seriesStatus: row.series_status,
    publishedAt: row.published_at ?? undefined,
    tags: row.tags,
    excerpt: row.excerpt,
    wordCount: row.word_count,
    readingMinutes: row.reading_minutes,
    coverImage: row.cover_image ?? undefined,
    chapters
  };
}

function mapChapter(row: ChapterRow): Chapter {
  return {
    id: row.id,
    seriesId: row.series_id,
    slug: row.slug,
    number: row.number,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    excerpt: row.excerpt ?? "",
    status: row.status,
    publishedAt: row.published_at ?? undefined,
    wordCount: row.word_count,
    readingMinutes: row.reading_minutes,
    body: row.body,
    poetryMode: row.poetry_mode
  };
}

function mapWork(row: WorkRow): AnyWork {
  return row.kind === "series" ? mapSeries(row) : mapStandalone(row);
}

export const getAllPublishedWorks = cache(async (): Promise<AnyWork[]> => {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("*")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw new Error(`getAllPublishedWorks: ${error.message}`);
  return ((data ?? []) as WorkRow[]).map(mapWork);
});

export const getStandaloneBySlug = cache(
  async (slug: string): Promise<StandaloneWork | null> => {
    const sb = getPublicSupabase();
    const { data, error } = await sb
      .from("works")
      .select("*")
      .eq("slug", slug)
      .neq("kind", "series")
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(`getStandaloneBySlug(${slug}): ${error.message}`);
    return data ? mapStandalone(data as WorkRow) : null;
  }
);

export const getSeriesBySlug = cache(async (slug: string): Promise<Series | null> => {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("*, chapters(*)")
    .eq("slug", slug)
    .eq("kind", "series")
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error(`getSeriesBySlug(${slug}): ${error.message}`);
  if (!data) return null;
  const row = data as WorkRow & { chapters: ChapterRow[] | null };
  const chapters = (row.chapters ?? [])
    .filter((c) => c.deleted_at === null)
    .map(mapChapter)
    .sort((a, b) => a.number - b.number);
  return mapSeries(row, chapters);
});

export const getChapter = cache(
  async (
    seriesSlug: string,
    chapterSlug: string
  ): Promise<{ series: Series; chapter: Chapter } | null> => {
    const series = await getSeriesBySlug(seriesSlug);
    if (!series) return null;
    const chapter = series.chapters.find(
      (c) => c.slug === chapterSlug && c.status === "published"
    );
    if (!chapter) return null;
    return { series, chapter };
  }
);

/**
 * Lightweight chapter fetch: pulls just the chapter row + parent series row
 * (no sibling bodies) and the sibling slugs/numbers needed for prev/next nav.
 * Replaces the N+1-ish `getChapter()` for chapter page render.
 */
export type ChapterSibling = Pick<Chapter, "id" | "slug" | "number" | "title">;

export type ChapterByPath = {
  series: Series;
  chapter: Chapter;
  siblings: ChapterSibling[];
};

export const getChapterByPath = cache(
  async (
    seriesSlug: string,
    chapterSlug: string
  ): Promise<ChapterByPath | null> => {
    const sb = getPublicSupabase();
    const { data, error } = await sb
      .from("works")
      .select(
        "*, chapter:chapters!inner(*), siblings:chapters(id, slug, number, title, status, deleted_at)"
      )
      .eq("slug", seriesSlug)
      .eq("kind", "series")
      .eq("status", "published")
      .is("deleted_at", null)
      .eq("chapter.slug", chapterSlug)
      .eq("chapter.status", "published")
      .is("chapter.deleted_at", null)
      .maybeSingle();
    if (error) {
      throw new Error(
        `getChapterByPath(${seriesSlug}/${chapterSlug}): ${error.message}`
      );
    }
    if (!data) return null;
    const row = data as WorkRow & {
      chapter: ChapterRow[] | ChapterRow;
      siblings:
        | (Pick<ChapterRow, "id" | "slug" | "number" | "title"> & {
            status: string;
            deleted_at: string | null;
          })[]
        | null;
    };
    const chapterRow = Array.isArray(row.chapter) ? row.chapter[0] : row.chapter;
    if (!chapterRow) return null;

    const siblings: ChapterSibling[] = (row.siblings ?? [])
      .filter((s) => s.status === "published" && s.deleted_at === null)
      .map((s) => ({ id: s.id, slug: s.slug, number: s.number, title: s.title }))
      .sort((a, b) => a.number - b.number);

    const series = mapSeries(row, []);
    const chapter = mapChapter(chapterRow);
    return { series, chapter, siblings };
  }
);

export const getRecentDispatches = cache(
  async (limit: number): Promise<StandaloneWork[]> => {
    const sb = getPublicSupabase();
    const { data, error } = await sb
      .from("works")
      .select("*")
      .eq("status", "published")
      .neq("kind", "series")
      .is("deleted_at", null)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);
    if (error) throw new Error(`getRecentDispatches: ${error.message}`);
    return ((data ?? []) as WorkRow[]).map(mapStandalone);
  }
);

/* All explicitly-featured published works, newest published first. Empty when
   none are pinned — the homepage then falls back to getLatestWork(). Tolerates
   a missing `featured` column so the homepage still renders during the window
   between deploy and migration apply. */
export const getFeaturedWorks = cache(async (): Promise<AnyWork[]> => {
  const sb = getPublicSupabase();
  try {
    const { data, error } = await sb
      .from("works")
      .select("*")
      .eq("status", "published")
      .eq("featured", true)
      .is("deleted_at", null)
      .order("published_at", { ascending: false, nullsFirst: false });
    if (error) {
      const msg = error.message ?? "";
      if (/column .*featured.* does not exist|undefined column/i.test(msg)) {
        return [];
      }
      throw new Error(`getFeaturedWorks: ${msg}`);
    }
    return ((data ?? []) as WorkRow[]).map(mapWork);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/column .*featured.* does not exist|undefined column/i.test(msg)) {
      return [];
    }
    throw err;
  }
});

/* Most recent published work, ignoring the featured flag. */
export const getLatestWork = cache(async (): Promise<AnyWork | null> => {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("*")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getLatestWork: ${error.message}`);
  return data ? mapWork(data as WorkRow) : null;
});

export async function getPublishedStandaloneSlugs(): Promise<string[]> {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("slug")
    .eq("status", "published")
    .neq("kind", "series")
    .is("deleted_at", null);
  if (error) throw new Error(`getPublishedStandaloneSlugs: ${error.message}`);
  return ((data ?? []) as Pick<WorkRow, "slug">[]).map((r) => r.slug);
}

export async function getPublishedSeriesSlugs(): Promise<string[]> {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("slug")
    .eq("status", "published")
    .eq("kind", "series")
    .is("deleted_at", null);
  if (error) throw new Error(`getPublishedSeriesSlugs: ${error.message}`);
  return ((data ?? []) as Pick<WorkRow, "slug">[]).map((r) => r.slug);
}

export async function getPublishedWorkUpdates(): Promise<
  { slug: string; kind: WorkRow["kind"]; updatedAt: string }[]
> {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("slug, kind, updated_at")
    .eq("status", "published")
    .is("deleted_at", null);
  if (error) throw new Error(`getPublishedWorkUpdates: ${error.message}`);
  return ((data ?? []) as Pick<WorkRow, "slug" | "kind" | "updated_at">[]).map((r) => ({
    slug: r.slug,
    kind: r.kind,
    updatedAt: r.updated_at
  }));
}

export async function getPublishedChapterUpdates(): Promise<
  { seriesSlug: string; chapterSlug: string; updatedAt: string }[]
> {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("slug, chapters(slug, status, updated_at, deleted_at)")
    .eq("status", "published")
    .eq("kind", "series")
    .is("deleted_at", null);
  if (error) throw new Error(`getPublishedChapterUpdates: ${error.message}`);
  const out: { seriesSlug: string; chapterSlug: string; updatedAt: string }[] = [];
  for (const row of (data ?? []) as {
    slug: string;
    chapters:
      | { slug: string; status: string; updated_at: string; deleted_at: string | null }[]
      | null;
  }[]) {
    for (const ch of row.chapters ?? []) {
      if (ch.status === "published" && ch.deleted_at === null) {
        out.push({
          seriesSlug: row.slug,
          chapterSlug: ch.slug,
          updatedAt: ch.updated_at
        });
      }
    }
  }
  return out;
}

export const getRandomEpigraph = cache(async (): Promise<
  { text: string; title: string; slug: string } | null
> => {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("title, subtitle, slug")
    .eq("status", "published")
    .neq("kind", "series")
    .is("deleted_at", null);
  if (error || !data) return null;
  const rows = (data as Pick<WorkRow, "title" | "subtitle" | "slug">[]).filter(
    (r) => r.subtitle
  );
  if (rows.length === 0) return null;
  const pick = rows[Math.floor(Math.random() * rows.length)];
  return { text: pick.subtitle!, title: pick.title, slug: pick.slug };
});

export async function getPublishedChapterParams(): Promise<
  { slug: string; chapter: string }[]
> {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("slug, chapters(slug, status, deleted_at)")
    .eq("status", "published")
    .eq("kind", "series")
    .is("deleted_at", null);
  if (error) throw new Error(`getPublishedChapterParams: ${error.message}`);
  const out: { slug: string; chapter: string }[] = [];
  for (const row of (data ?? []) as {
    slug: string;
    chapters: { slug: string; status: string; deleted_at: string | null }[] | null;
  }[]) {
    for (const ch of row.chapters ?? []) {
      if (ch.status === "published" && ch.deleted_at === null) {
        out.push({ slug: row.slug, chapter: ch.slug });
      }
    }
  }
  return out;
}
