import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { WorkRow } from "@/lib/supabase/types";
import {
  BulkWorksList,
  type WorkListItem
} from "@/app/studio/(protected)/_components/bulk-works-list";

type WorkListRow = Pick<
  WorkRow,
  "id" | "slug" | "title" | "kind" | "status" | "updated_at" | "word_count"
>;

export const dynamic = "force-dynamic";
export const metadata = { title: "Works · Studio" };

export default async function StudioWorksList() {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("works")
    .select("id, slug, title, kind, status, updated_at, word_count")
    .in("kind", ["poem", "essay", "oneshot", "article", "story", "note"])
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .returns<WorkListRow[]>();

  if (error) {
    return (
      <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
        <p className="font-sans text-sm text-red-700">
          Couldn&rsquo;t load works: {error.message}
        </p>
      </div>
    );
  }

  const rows: WorkListItem[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    kind: row.kind,
    status: row.status,
    wordCount: row.word_count,
    updatedAt: row.updated_at
  }));

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between border-b border-border/60 pb-6">
        <div>
          <p className="meta mb-2">studio · works</p>
          <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
            Standalone works
          </h1>
          <p className="mt-2 font-italic italic text-base text-muted">
            poems, essays, one-shots. drafts live alongside the published.
          </p>
        </div>
        <Link
          href="/studio/works/new"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 font-sans text-sm font-medium text-canvas transition-opacity hover:opacity-95"
        >
          <Plus className="h-3.5 w-3.5" />
          New work
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-surface/30 p-10 text-center">
          <FileText className="mx-auto h-5 w-5 text-whisper" />
          <p className="mt-4 font-italic italic text-lg text-muted">
            nothing here yet. begin where the page is quiet.
          </p>
          <Link
            href="/studio/works/new"
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-ink px-3 py-1.5 font-sans text-sm text-ink hover:bg-ink hover:text-canvas transition-colors"
          >
            <Plus className="h-3 w-3" /> start a new work
          </Link>
        </div>
      ) : (
        <BulkWorksList rows={rows} />
      )}
    </div>
  );
}
