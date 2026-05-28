import { FileText, Library, PenLine } from "lucide-react";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { ChapterRow, WorkRow } from "@/lib/supabase/types";
import { relativeTime } from "@/lib/format";
import { TrashRow } from "./trash-row";

type DeletedWork = Pick<
  WorkRow,
  "id" | "title" | "kind" | "deleted_at" | "word_count"
>;
type DeletedChapter = Pick<
  ChapterRow,
  "id" | "title" | "series_id" | "number" | "deleted_at" | "word_count"
> & { works: Pick<WorkRow, "title" | "deleted_at"> | null };

export const dynamic = "force-dynamic";
export const metadata = { title: "Trash · Studio" };

export default async function TrashPage() {
  const supabase = getAdminSupabase();

  const [worksRes, chaptersRes] = await Promise.all([
    supabase
      .from("works")
      .select("id, title, kind, deleted_at, word_count")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
    supabase
      .from("chapters")
      .select(
        "id, title, series_id, number, deleted_at, word_count, works(title, deleted_at)"
      )
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
  ]);

  const error = worksRes.error ?? chaptersRes.error;
  if (error) {
    return (
      <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
        <p className="font-sans text-sm text-red-700">
          Couldn&rsquo;t load trash: {error.message}
        </p>
      </div>
    );
  }

  const works = (worksRes.data ?? []) as DeletedWork[];
  // Drop chapter rows that belong to an already-trashed series — restoring the
  // parent restores them, listing them separately would be misleading.
  const chapters = ((chaptersRes.data ?? []) as DeletedChapter[]).filter(
    (c) => c.works?.deleted_at === null
  );

  const total = works.length + chapters.length;

  return (
    <div className="space-y-8">
      <header className="border-b border-border/60 pb-6">
        <p className="meta mb-2">studio · trash</p>
        <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
          Trash
        </h1>
        <p className="mt-2 font-italic italic text-base text-muted">
          deleted works + chapters. restore them, or remove for good.
        </p>
      </header>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-surface/30 p-10 text-center">
          <FileText className="mx-auto h-5 w-5 text-whisper" />
          <p className="mt-4 font-italic italic text-lg text-muted">
            the trash is empty.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {works.map((w) => (
            <TrashRow
              key={`w-${w.id}`}
              kind="work"
              workKind={w.kind}
              id={w.id}
              icon={w.kind === "series" ? Library : PenLine}
              primary={w.title || "Untitled"}
              secondary={w.kind}
              meta={`${w.word_count.toLocaleString()} words`}
              deletedLabel={relativeTime(w.deleted_at ?? new Date())}
            />
          ))}
          {chapters.map((c) => (
            <TrashRow
              key={`c-${c.id}`}
              kind="chapter"
              id={c.id}
              icon={FileText}
              primary={c.title || `Chapter ${c.number}`}
              secondary={`${c.works?.title ?? "series"} · ch ${String(c.number).padStart(2, "0")}`}
              meta={`${c.word_count.toLocaleString()} words`}
              deletedLabel={relativeTime(c.deleted_at ?? new Date())}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
