import { notFound } from "next/navigation";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { WorkRow } from "@/lib/supabase/types";
import { getKnownTags } from "@/app/studio/(protected)/_lib/known-tags";
import { WorkEditorForm, type InitialWork } from "./work-editor-form";

type EditorRow = Pick<
  WorkRow,
  | "id"
  | "slug"
  | "title"
  | "subtitle"
  | "kind"
  | "status"
  | "excerpt"
  | "body"
  | "tags"
  | "cover_image"
  | "poetry_mode"
  | "featured"
  | "word_count"
  | "reading_minutes"
  | "published_at"
  | "scheduled_at"
  | "deleted_at"
>;

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
  return { title: data?.title ? `${data.title} · Studio` : "Editor · Studio" };
}

export default async function StudioWorkEditorPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const supabase = getAdminSupabase();
  const [{ data, error }, knownTags] = await Promise.all([
    supabase
      .from("works")
      .select(
        "id, slug, title, subtitle, kind, status, excerpt, body, tags, cover_image, poetry_mode, featured, word_count, reading_minutes, published_at, scheduled_at, deleted_at"
      )
      .eq("id", id)
      .maybeSingle()
      .returns<EditorRow | null>(),
    getKnownTags()
  ]);

  if (error || !data) notFound();

  const initial: InitialWork = {
    id: data.id,
    slug: data.slug,
    title: data.title ?? "",
    subtitle: data.subtitle ?? "",
    kind: data.kind,
    status: data.status,
    excerpt: data.excerpt ?? "",
    body: data.body ?? "",
    tags: data.tags ?? [],
    coverImage: data.cover_image ?? "",
    poetryMode: Boolean(data.poetry_mode),
    featured: Boolean(data.featured),
    wordCount: data.word_count ?? 0,
    readingMinutes: data.reading_minutes ?? 0,
    publishedAt: data.published_at ?? null,
    scheduledAt: data.scheduled_at ?? null
  };

  return <WorkEditorForm initial={initial} knownTags={knownTags} inTrash={data.deleted_at !== null} />;
}
