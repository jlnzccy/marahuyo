import "server-only";
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
    publishedAt: row.published_at ?? undefined,
    tags: row.tags,
    excerpt: row.excerpt,
    wordCount: row.word_count,
    readingMinutes: row.reading_minutes,
    coverImage: row.cover_image ?? undefined,
    coverColor: row.cover_color ?? undefined,
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

export async function getAllPublishedWorks(): Promise<AnyWork[]> {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw new Error(`getAllPublishedWorks: ${error.message}`);
  return ((data ?? []) as WorkRow[]).map(mapWork);
}

export async function getStandaloneBySlug(slug: string): Promise<StandaloneWork | null> {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("*")
    .eq("slug", slug)
    .neq("kind", "series")
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`getStandaloneBySlug(${slug}): ${error.message}`);
  return data ? mapStandalone(data as WorkRow) : null;
}

export async function getSeriesBySlug(slug: string): Promise<Series | null> {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("*, chapters(*)")
    .eq("slug", slug)
    .eq("kind", "series")
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`getSeriesBySlug(${slug}): ${error.message}`);
  if (!data) return null;
  const row = data as WorkRow & { chapters: ChapterRow[] | null };
  const chapters = (row.chapters ?? [])
    .map(mapChapter)
    .sort((a, b) => a.number - b.number);
  return mapSeries(row, chapters);
}

export async function getChapter(
  seriesSlug: string,
  chapterSlug: string
): Promise<{ series: Series; chapter: Chapter } | null> {
  const series = await getSeriesBySlug(seriesSlug);
  if (!series) return null;
  const chapter = series.chapters.find(
    (c) => c.slug === chapterSlug && c.status === "published"
  );
  if (!chapter) return null;
  return { series, chapter };
}

export async function getRecentDispatches(limit: number): Promise<StandaloneWork[]> {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("*")
    .eq("status", "published")
    .neq("kind", "series")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error(`getRecentDispatches: ${error.message}`);
  return ((data ?? []) as WorkRow[]).map(mapStandalone);
}

export async function getFeaturedWork(): Promise<AnyWork | null> {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getFeaturedWork: ${error.message}`);
  return data ? mapWork(data as WorkRow) : null;
}

export async function getPublishedStandaloneSlugs(): Promise<string[]> {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("slug")
    .eq("status", "published")
    .neq("kind", "series");
  if (error) throw new Error(`getPublishedStandaloneSlugs: ${error.message}`);
  return ((data ?? []) as Pick<WorkRow, "slug">[]).map((r) => r.slug);
}

export async function getPublishedSeriesSlugs(): Promise<string[]> {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("slug")
    .eq("status", "published")
    .eq("kind", "series");
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
    .eq("status", "published");
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
    .select("slug, chapters(slug, status, updated_at)")
    .eq("status", "published")
    .eq("kind", "series");
  if (error) throw new Error(`getPublishedChapterUpdates: ${error.message}`);
  const out: { seriesSlug: string; chapterSlug: string; updatedAt: string }[] = [];
  for (const row of (data ?? []) as {
    slug: string;
    chapters: { slug: string; status: string; updated_at: string }[] | null;
  }[]) {
    for (const ch of row.chapters ?? []) {
      if (ch.status === "published") {
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

export async function getPublishedChapterParams(): Promise<
  { slug: string; chapter: string }[]
> {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("works")
    .select("slug, chapters(slug, status)")
    .eq("status", "published")
    .eq("kind", "series");
  if (error) throw new Error(`getPublishedChapterParams: ${error.message}`);
  const out: { slug: string; chapter: string }[] = [];
  for (const row of (data ?? []) as {
    slug: string;
    chapters: { slug: string; status: string }[] | null;
  }[]) {
    for (const ch of row.chapters ?? []) {
      if (ch.status === "published") out.push({ slug: row.slug, chapter: ch.slug });
    }
  }
  return out;
}
