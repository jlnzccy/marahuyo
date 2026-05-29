import Link from "next/link";
import { Plus, Library } from "lucide-react";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { WorkRow } from "@/lib/supabase/types";
import { relativeTime } from "@/lib/format";

type SeriesListRow = Pick<
  WorkRow,
  "id" | "slug" | "title" | "status" | "updated_at"
> & {
  chapters:
    | { id: string; status: string; deleted_at: string | null }[]
    | null;
};

export const dynamic = "force-dynamic";
export const metadata = { title: "Series · Studio" };

export default async function StudioSeriesList() {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("works")
    .select(
      "id, slug, title, status, updated_at, chapters(id, status, deleted_at)"
    )
    .eq("kind", "series")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .returns<SeriesListRow[]>();

  if (error) {
    return (
      <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
        <p className="font-sans text-sm text-red-700">
          Couldn&rsquo;t load series: {error.message}
        </p>
      </div>
    );
  }

  const rows = data ?? [];

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between border-b border-border/60 pb-6">
        <div>
          <p className="meta mb-2">studio · series</p>
          <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
            Series
          </h1>
          <p className="mt-2 font-italic italic text-base text-muted">
            chaptered work. order matters. drafts are safe.
          </p>
        </div>
        <Link
          href="/studio/series/new"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 font-sans text-sm font-medium text-canvas transition-opacity hover:opacity-95"
        >
          <Plus className="h-3.5 w-3.5" />
          New series
        </Link>
      </header>

      {rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 bg-surface/30 p-10 text-center">
          <Library className="mx-auto h-5 w-5 text-whisper" />
          <p className="mt-4 font-italic italic text-lg text-muted">
            no series yet. begin the first chapter when you&rsquo;re ready.
          </p>
          <Link
            href="/studio/series/new"
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-ink px-3 py-1.5 font-sans text-sm text-ink hover:bg-ink hover:text-canvas transition-colors"
          >
            <Plus className="h-3 w-3" /> start a new series
          </Link>
        </div>
      )}

      <ul className="divide-y divide-border/60">
        {rows.map((row) => {
          const liveChapters = (row.chapters ?? []).filter(
            (c) => c.deleted_at === null
          );
          const total = liveChapters.length;
          const published = liveChapters.filter(
            (c) => c.status === "published"
          ).length;
          return (
            <li key={row.id}>
              <Link
                href={`/studio/series/${row.id}`}
                className="group grid grid-cols-[1fr_auto_auto] items-baseline gap-6 py-4 transition-colors hover:bg-surface/40"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-xl font-bold text-ink transition-transform group-hover:translate-x-0.5">
                      {row.title || "Untitled"}
                    </span>
                    {row.status === "draft" && (
                      <span className="rounded-full border border-border/60 bg-canvas px-2 py-0.5 font-mono text-[10px] uppercase tracking-meta text-muted">
                        draft
                      </span>
                    )}
                  </div>
                </div>
                <span className="meta">
                  {published}/{total} chapter{total === 1 ? "" : "s"}
                </span>
                <span className="meta">{relativeTime(row.updated_at)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
