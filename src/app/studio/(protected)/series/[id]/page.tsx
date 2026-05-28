import { notFound } from "next/navigation";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { WorkRow, ChapterRow } from "@/lib/supabase/types";
import { SeriesEditor, type InitialSeries, type ChapterListItem } from "./series-editor";

type SeriesPageRow = Pick<
  WorkRow,
  | "id"
  | "slug"
  | "title"
  | "subtitle"
  | "kind"
  | "status"
  | "series_status"
  | "excerpt"
  | "tags"
  | "cover_image"
  | "published_at"
> & {
  chapters:
    | Pick<
        ChapterRow,
        "id" | "slug" | "number" | "title" | "status" | "word_count" | "updated_at"
      >[]
    | null;
};

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const supabase = getAdminSupabase();
  const { data } = await supabase
    .from("works")
    .select("title")
    .eq("id", id)
    .maybeSingle()
    .returns<Pick<WorkRow, "title"> | null>();
  return { title: data?.title ? `${data.title} · Series` : "Series · Studio" };
}

export default async function StudioSeriesEditorPage({
  params
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("works")
    .select(
      "id, slug, title, subtitle, kind, status, series_status, excerpt, tags, cover_image, published_at, chapters(id, slug, number, title, status, word_count, updated_at)"
    )
    .eq("id", id)
    .eq("kind", "series")
    .maybeSingle()
    .returns<SeriesPageRow | null>();

  if (error || !data) notFound();

  const chapters: ChapterListItem[] = (data.chapters ?? [])
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      number: c.number,
      title: c.title,
      status: c.status,
      wordCount: c.word_count,
      updatedAt: c.updated_at
    }))
    .sort((a, b) => a.number - b.number);

  const initial: InitialSeries = {
    id: data.id,
    slug: data.slug,
    title: data.title ?? "",
    subtitle: data.subtitle ?? "",
    status: data.status,
    seriesStatus: data.series_status,
    excerpt: data.excerpt ?? "",
    tags: data.tags ?? [],
    coverImage: data.cover_image ?? "",
    publishedAt: data.published_at ?? null,
    chapters
  };

  return <SeriesEditor initial={initial} />;
}
