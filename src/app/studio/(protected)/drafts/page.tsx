import Link from "next/link";
import { FileText, Library, PenLine } from "lucide-react";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { ChapterRow, WorkRow } from "@/lib/supabase/types";
import { relativeTime } from "@/lib/format";

type WorkDraftRow = Pick<WorkRow, "id" | "title" | "kind" | "updated_at" | "word_count">;
type ChapterDraftRow = Pick<
  ChapterRow,
  "id" | "title" | "series_id" | "number" | "updated_at" | "word_count"
> & { works: Pick<WorkRow, "title"> | null };

export const dynamic = "force-dynamic";
export const metadata = { title: "Drafts · Studio" };

type Item = {
  key: string;
  href: string;
  icon: typeof FileText;
  primary: string;
  secondary: string;
  meta: string;
  updatedAt: string;
};

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
      .select("id, title, series_id, number, updated_at, word_count, works(title)")
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

  const workItems: Item[] = (worksRes.data ?? []).map((w) => ({
    key: `w-${w.id}`,
    href: w.kind === "series" ? `/studio/series/${w.id}` : `/studio/works/${w.id}`,
    icon: w.kind === "series" ? Library : PenLine,
    primary: w.title || "Untitled",
    secondary: w.kind,
    meta: `${w.word_count.toLocaleString()} words`,
    updatedAt: w.updated_at
  }));

  const chapterItems: Item[] = (chaptersRes.data ?? []).map((c) => ({
    key: `c-${c.id}`,
    href: `/studio/series/${c.series_id}/chapters/${c.id}`,
    icon: FileText,
    primary: c.title || `Chapter ${c.number}`,
    secondary: `${c.works?.title ?? "series"} · ch ${String(c.number).padStart(2, "0")}`,
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
        <ul className="divide-y divide-border/60">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="group grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 py-4 transition-colors hover:bg-surface/40"
                >
                  <Icon className="h-4 w-4 text-whisper transition-colors group-hover:text-ink" />
                  <div className="min-w-0">
                    <div className="truncate font-serif text-lg font-bold text-ink transition-transform group-hover:translate-x-0.5">
                      {item.primary}
                    </div>
                    <div className="meta truncate">{item.secondary}</div>
                  </div>
                  <span className="meta hidden sm:inline">{item.meta}</span>
                  <span className="meta">{relativeTime(item.updatedAt)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
