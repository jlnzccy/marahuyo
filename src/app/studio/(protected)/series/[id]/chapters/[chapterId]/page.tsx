import { notFound } from "next/navigation";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { ChapterRow, WorkRow } from "@/lib/supabase/types";
import { ChapterEditorForm, type InitialChapter } from "./chapter-editor-form";

type ChapterPageRow = Pick<
  ChapterRow,
  | "id"
  | "slug"
  | "series_id"
  | "number"
  | "title"
  | "subtitle"
  | "excerpt"
  | "status"
  | "body"
  | "poetry_mode"
  | "word_count"
  | "reading_minutes"
  | "published_at"
>;

type SeriesParent = Pick<WorkRow, "id" | "slug" | "title">;

export const dynamic = "force-dynamic";

type Params = { id: string; chapterId: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { chapterId } = await params;
  const supabase = getAdminSupabase();
  const { data } = await supabase
    .from("chapters")
    .select("title")
    .eq("id", chapterId)
    .maybeSingle()
    .returns<Pick<ChapterRow, "title"> | null>();
  return { title: data?.title ? `${data.title} · Chapter` : "Chapter · Studio" };
}

export default async function StudioChapterEditorPage({
  params
}: {
  params: Promise<Params>;
}) {
  const { id, chapterId } = await params;
  const supabase = getAdminSupabase();

  const [{ data: chapter, error: chErr }, { data: series, error: srErr }] = await Promise.all([
    supabase
      .from("chapters")
      .select(
        "id, slug, series_id, number, title, subtitle, excerpt, status, body, poetry_mode, word_count, reading_minutes, published_at"
      )
      .eq("id", chapterId)
      .eq("series_id", id)
      .maybeSingle()
      .returns<ChapterPageRow | null>(),
    supabase
      .from("works")
      .select("id, slug, title")
      .eq("id", id)
      .eq("kind", "series")
      .maybeSingle()
      .returns<SeriesParent | null>()
  ]);

  if (chErr || srErr || !chapter || !series) notFound();

  const initial: InitialChapter = {
    id: chapter.id,
    slug: chapter.slug,
    seriesId: chapter.series_id,
    seriesSlug: series.slug,
    seriesTitle: series.title,
    number: chapter.number,
    title: chapter.title ?? "",
    subtitle: chapter.subtitle ?? "",
    excerpt: chapter.excerpt ?? "",
    status: chapter.status,
    body: chapter.body ?? "",
    poetryMode: Boolean(chapter.poetry_mode),
    wordCount: chapter.word_count ?? 0,
    readingMinutes: chapter.reading_minutes ?? 0,
    publishedAt: chapter.published_at ?? null
  };

  return <ChapterEditorForm initial={initial} />;
}
