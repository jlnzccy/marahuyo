import "server-only";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { WorkRow } from "@/lib/supabase/types";

/**
 * Flat, deduped list of tags currently in use across the studio. Used by the
 * tag autocomplete in the work editor. Always reads fresh — list is small
 * (tens of strings) so caching the trip isn't worth the staleness.
 */
export async function getKnownTags(): Promise<string[]> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("works")
    .select("tags")
    .is("deleted_at", null)
    .returns<Pick<WorkRow, "tags">[]>();
  if (error || !data) return [];

  const seen = new Set<string>();
  for (const row of data) {
    for (const raw of row.tags ?? []) {
      const t = raw.trim();
      if (!t) continue;
      const key = t.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
    }
  }
  return [...seen].sort();
}
