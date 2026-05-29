import "server-only";
import { getAdminSupabase } from "@/lib/supabase/admin";

/**
 * Validates an array of reader-state keys and returns the subset that still
 * resolve to a live, published work or chapter.
 *
 * Key shapes:
 *   read/<slug>                    standalone work
 *   series/<seriesSlug>/<chapter>  chapter inside a series
 *
 * Any key that doesn't match either pattern is considered invalid (dropped).
 */
export async function validateKeys(keys: string[]): Promise<Set<string>> {
  if (keys.length === 0) return new Set();

  const standaloneSlugs = new Set<string>();
  const chapterPairs = new Map<string, Set<string>>(); // seriesSlug → chapterSlugs

  for (const key of keys) {
    const parts = key.split("/");
    if (parts[0] === "read" && parts[1]) {
      standaloneSlugs.add(parts[1]);
    } else if (parts[0] === "series" && parts[1] && parts[2]) {
      const seriesSlug = parts[1];
      const chapterSlug = parts[2];
      const bag = chapterPairs.get(seriesSlug) ?? new Set<string>();
      bag.add(chapterSlug);
      chapterPairs.set(seriesSlug, bag);
    }
  }

  const supabase = getAdminSupabase();
  const valid = new Set<string>();

  if (standaloneSlugs.size > 0) {
    const { data } = await supabase
      .from("works")
      .select("slug")
      .in("slug", Array.from(standaloneSlugs))
      .eq("status", "published")
      .is("deleted_at", null);
    for (const row of (data ?? []) as { slug: string }[]) {
      valid.add(`read/${row.slug}`);
    }
  }

  if (chapterPairs.size > 0) {
    const seriesSlugs = Array.from(chapterPairs.keys());
    const { data: seriesRows } = await supabase
      .from("works")
      .select("id, slug")
      .in("slug", seriesSlugs)
      .eq("status", "published")
      .is("deleted_at", null);

    const seriesById = new Map<string, string>();
    for (const row of (seriesRows ?? []) as { id: string; slug: string }[]) {
      seriesById.set(row.id, row.slug);
    }

    if (seriesById.size > 0) {
      const { data: chapterRows } = await supabase
        .from("chapters")
        .select("slug, series_id")
        .in("series_id", Array.from(seriesById.keys()))
        .eq("status", "published")
        .is("deleted_at", null);

      for (const row of (chapterRows ?? []) as {
        slug: string;
        series_id: string;
      }[]) {
        const seriesSlug = seriesById.get(row.series_id);
        if (!seriesSlug) continue;
        const wantedChapters = chapterPairs.get(seriesSlug);
        if (wantedChapters?.has(row.slug)) {
          valid.add(`series/${seriesSlug}/${row.slug}`);
        }
      }
    }
  }

  return valid;
}
