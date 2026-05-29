import { FileText } from "lucide-react";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { ChapterRow, WorkRow } from "@/lib/supabase/types";
import {
  BulkDraftsList,
  type DraftItem
} from "@/app/studio/(protected)/_components/bulk-drafts-list";

type WorkDraftRow = Pick<WorkRow, "id" | "title" | "kind" | "updated_at" | "word_count">;
type ParentSeries = Pick<WorkRow, "title" | "deleted_at">;
type ChapterDraftRow = Pick<
  ChapterRow,
  "id" | "title" | "series_id" | "number" | "updated_at" | "word_count"
> & { works: ParentSeries | ParentSeries[] | null };

function parent(c: ChapterDraftRow): ParentSeries | null {
  if (!c.works) return null;
  return Array.isArray(c.works) ? c.works[0] ?? null : c.works;
}

export const dynamic = "force-dynamic";
export const metadata = { title: "Drafts · Studio" };

export default async function StudioDraftsPage() {
  const supabase = getAdminSupabase();

  const [worksRes, chaptersRes] = await Promise.all([
    supabase
      .from("works")
      .select("id, title, kind, updated_at, word_count")
      .eq("status", "draft")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .returns<WorkDraftRow[]>(),
    supabase
      .from("chapters")
      .select(
        "id, title, series_id, number, updated_at, word_count, works(title, deleted_at)"
      )
      .eq("status", "draft")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .returns<ChapterDraftRow[]>()
  ]);

  const error = worksRes.error ?? chaptersRes.error;
  if (error) {
    return (
      <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
        <p className="font-sans text-sm text-red-700">
          Couldn&rsquo;t load drafts: {error.message}
        </p>
      </div>
    );
  }

  const workItems: DraftItem[] = (worksRes.data ?? []).map((w) => ({
    key: `w-${w.id}`,
    id: w.id,
    kind: "work",
    href: w.kind === "series" ? `/studio/series/${w.id}` : `/studio/works/${w.id}`,
    icon: w.kind === "series" ? "library" : "pen",
    primary: w.title || "Untitled",
    secondary: w.kind,
    meta: `${w.word_count.toLocaleString()} words`,
    updatedAt: w.updated_at
  }));

  // Hide chapter drafts whose parent series is trashed — they're effectively
  // orphaned; the series has to be restored before they're editable again.
  const chapterItems: DraftItem[] = (chaptersRes.data ?? [])
    .filter((c) => parent(c)?.deleted_at === null)
    .map((c) => ({
      key: `c-${c.id}`,
      id: c.id,
      kind: "chapter",
      href: `/studio/series/${c.series_id}/chapters/${c.id}`,
      icon: "file",
      primary: c.title || `Chapter ${c.number}`,
      secondary: `${parent(c)?.title ?? "series"} · ch ${String(c.number).padStart(2, "0")}`,
      meta: `${c.word_count.toLocaleString()} words`,
      updatedAt: c.updated_at
    }));

  const items = [...workItems, ...chapterItems].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="space-y-8">
      <header className="border-b border-border/60 pb-6">
        <p className="meta mb-2">studio · drafts</p>
        <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
          Unfinished
        </h1>
        <p className="mt-2 font-italic italic text-base text-muted">
          everything still in the notebook — works, chapters, fragments.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-surface/30 p-10 text-center">
          <FileText className="mx-auto h-5 w-5 text-whisper" />
          <p className="mt-4 font-italic italic text-lg text-muted">
            no drafts — the desk is clear.
          </p>
        </div>
      ) : (
        <BulkDraftsList items={items} />
      )}
    </div>
  );
}
