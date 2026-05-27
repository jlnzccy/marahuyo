import "server-only";
import { getAdminSupabase } from "@/lib/supabase/admin";

type RecentEdit = {
  id: string;
  title: string;
  kind: string;
  status: string;
  updatedAt: string;
};

export type StudioStats = {
  draftCount: number;
  publishedCount: number;
  totalWords: number;
  recentEdits: RecentEdit[];
};

/**
 * Fetches overview stats for the studio dashboard.
 * Uses the admin client (bypasses RLS) so we can see drafts.
 */
export async function getStudioStats(): Promise<StudioStats> {
  const sb = getAdminSupabase();

  /* Fetch all works — the total row count is small, so a single query
     aggregated in JS is simpler than multiple Supabase count queries. */
  const [worksRes, recentRes] = await Promise.all([
    sb.from("works").select("status, word_count"),
    sb
      .from("works")
      .select("id, title, kind, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5)
  ]);

  if (worksRes.error) throw new Error(`getStudioStats works: ${worksRes.error.message}`);
  if (recentRes.error) throw new Error(`getStudioStats recent: ${recentRes.error.message}`);

  const rows = (worksRes.data ?? []) as { status: string; word_count: number }[];

  let draftCount = 0;
  let publishedCount = 0;
  let totalWords = 0;

  for (const row of rows) {
    if (row.status === "draft") draftCount++;
    else if (row.status === "published") publishedCount++;
    totalWords += row.word_count ?? 0;
  }

  const recentEdits: RecentEdit[] = (
    (recentRes.data ?? []) as {
      id: string;
      title: string;
      kind: string;
      status: string;
      updated_at: string;
    }[]
  ).map((r) => ({
    id: r.id,
    title: r.title,
    kind: r.kind,
    status: r.status,
    updatedAt: r.updated_at
  }));

  return { draftCount, publishedCount, totalWords, recentEdits };
}
