import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, History } from "lucide-react";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { WorkRow, WorkVersionRow } from "@/lib/supabase/types";
import { formatDate, relativeTime } from "@/lib/format";
import { RestoreVersionButton } from "./restore-version-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Versions · Studio" };

type Params = { id: string };

type WorkInfo = Pick<WorkRow, "id" | "title">;
type VersionListRow = Pick<
  WorkVersionRow,
  "id" | "title" | "saved_at" | "excerpt"
> & { word_count?: number | null };

export default async function VersionsPage({
  params
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const supabase = getAdminSupabase();

  const [{ data: work }, { data: versions, error }] = await Promise.all([
    supabase
      .from("works")
      .select("id, title")
      .eq("id", id)
      .maybeSingle()
      .returns<WorkInfo | null>(),
    supabase
      .from("work_versions")
      .select("id, title, saved_at, excerpt")
      .eq("work_id", id)
      .order("saved_at", { ascending: false })
      .returns<VersionListRow[]>()
  ]);

  if (!work) notFound();
  if (error) {
    return (
      <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
        <p className="font-sans text-sm text-red-700">
          Couldn&rsquo;t load versions: {error.message}
        </p>
      </div>
    );
  }

  const rows = versions ?? [];

  return (
    <div className="space-y-8">
      <header className="border-b border-border/60 pb-6">
        <Link
          href={`/studio/works/${id}`}
          className="inline-flex items-center gap-1 font-sans text-xs text-muted hover:text-ink"
        >
          <ChevronLeft className="h-3 w-3" /> back to editor
        </Link>
        <p className="meta mb-2 mt-3">studio · history</p>
        <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
          Versions of <span className="font-italic italic font-normal">{work.title}</span>
        </h1>
        <p className="mt-2 font-italic italic text-base text-muted">
          a snapshot is saved every time you hit publish — you can roll back to any.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-surface/30 p-10 text-center">
          <History className="mx-auto h-5 w-5 text-whisper" />
          <p className="mt-4 font-italic italic text-lg text-muted">
            no versions yet — publish once to start the history.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {rows.map((v) => (
            <li
              key={v.id}
              className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-5"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-serif text-lg font-bold text-ink">
                    {v.title || "Untitled"}
                  </span>
                  <span className="meta">{relativeTime(v.saved_at)}</span>
                  <span className="meta text-whisper">·</span>
                  <span className="meta">{formatDate(v.saved_at)}</span>
                </div>
                {v.excerpt && (
                  <p className="line-clamp-2 max-w-prose font-serif text-sm text-muted">
                    {v.excerpt}
                  </p>
                )}
              </div>
              <RestoreVersionButton versionId={v.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
