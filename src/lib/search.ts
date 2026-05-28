import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

export type SearchHit = {
  type: "work" | "chapter";
  /** Public URL to navigate to. */
  href: string;
  title: string;
  /** HTML snippet with `<mark>` tags around matched terms. */
  snippet: string;
  /** Parent series title when the hit is a chapter. */
  series?: string;
  rank: number;
};

let cached: ReturnType<typeof createClient<Database>> | null = null;
function client() {
  if (cached) return cached;
  cached = createClient<Database>(supabaseEnv.url(), supabaseEnv.anonKey(), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return cached;
}

/**
 * Turn user input into a tsquery suitable for `to_tsquery`. We use the
 * `&` operator between tokens so every word must match, and append `:*`
 * to the trailing token to enable prefix matching while the user is
 * still typing.
 */
function toTsQuery(raw: string): string | null {
  const cleaned = raw
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .trim();
  if (!cleaned) return null;
  const tokens = cleaned.split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length === 0) return null;
  const last = tokens.pop()!;
  const head = tokens.map((t) => `${t}`).join(" & ");
  const tail = `${last}:*`;
  return head ? `${head} & ${tail}` : tail;
}

const SEARCH_LIMIT = 20;

/**
 * Top-level search. Returns the top N matches across works (excluding the
 * series shell rows, which match on metadata only) and chapters, sorted
 * by ts_rank descending. Snippets come from ts_headline so the matched
 * phrase is already highlighted.
 *
 * Wrapped in React's `cache()` so repeated calls during the same render
 * dedupe — useful when the page reads the count and the list separately.
 */
export const search = cache(async (query: string): Promise<SearchHit[]> => {
  const tsq = toTsQuery(query);
  if (!tsq) return [];

  const sb = client();

  // We hand-roll the query through `.rpc`-style raw SQL via REST: the JS
  // client doesn't expose ts_headline cleanly. Supabase's `from(...).select`
  // accepts a `raw` Postgres expression via a workaround using `*, expr`,
  // but for snippet HTML we need server-side ts_headline. Easiest path: a
  // pair of SECURITY DEFINER SQL functions. Until those exist we fall back
  // to client-side snippet generation around the first matched token.
  //
  // We still use the tsvector + GIN for the ranked match, then synthesize a
  // snippet from the body. This keeps the migration set free of functions.

  const [worksRes, chaptersRes] = await Promise.all([
    sb
      .from("works")
      .select("slug, title, kind, subtitle, excerpt, body")
      .eq("status", "published")
      .neq("kind", "series")
      .is("deleted_at", null)
      .textSearch("search_tsv", tsq, { config: "english" })
      .limit(SEARCH_LIMIT),
    sb
      .from("chapters")
      .select(
        "slug, title, series_id, subtitle, excerpt, body, works(slug, title, status, deleted_at)"
      )
      .eq("status", "published")
      .is("deleted_at", null)
      .textSearch("search_tsv", tsq, { config: "english" })
      .limit(SEARCH_LIMIT)
  ]);

  if (worksRes.error || chaptersRes.error) return [];

  const terms = query
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const works = ((worksRes.data ?? []) as unknown as Array<{
    slug: string;
    title: string;
    kind: string;
    subtitle: string | null;
    excerpt: string;
    body: string;
  }>).map<SearchHit>((w) => ({
    type: "work",
    href: `/read/${w.slug}`,
    title: w.title,
    snippet: highlightSnippet(`${w.subtitle ?? ""} ${w.excerpt} ${w.body}`, terms),
    rank: scoreMatch(`${w.title} ${w.subtitle ?? ""} ${w.excerpt} ${w.body}`, terms)
  }));

  const chapters = ((chaptersRes.data ?? []) as unknown as Array<{
    slug: string;
    title: string;
    subtitle: string | null;
    excerpt: string;
    body: string;
    works: { slug: string; title: string; status: string; deleted_at: string | null } | null;
  }>)
    .filter(
      (c) =>
        c.works &&
        c.works.status === "published" &&
        c.works.deleted_at === null
    )
    .map<SearchHit>((c) => ({
      type: "chapter",
      href: `/series/${c.works!.slug}/${c.slug}`,
      title: c.title,
      series: c.works!.title,
      snippet: highlightSnippet(`${c.subtitle ?? ""} ${c.excerpt} ${c.body}`, terms),
      rank: scoreMatch(`${c.title} ${c.subtitle ?? ""} ${c.excerpt} ${c.body}`, terms)
    }));

  return [...works, ...chapters]
    .sort((a, b) => b.rank - a.rank)
    .slice(0, SEARCH_LIMIT);
});

const STRIP_TAGS_RE = /<[^>]+>/g;
const WS_RE = /\s+/g;

function plainText(body: string): string {
  return body.replace(STRIP_TAGS_RE, " ").replace(WS_RE, " ").trim();
}

/**
 * Cheap, deterministic snippet builder. Finds the first token match in the
 * plain-text body and wraps every term occurrence within a ±90-char window
 * in `<mark>`. Returns "" when nothing matches — caller renders a fallback.
 */
function highlightSnippet(haystack: string, terms: string[]): string {
  const text = plainText(haystack);
  if (terms.length === 0) return text.slice(0, 180);
  const lower = text.toLowerCase();
  let firstIdx = -1;
  for (const t of terms) {
    const i = lower.indexOf(t.toLowerCase());
    if (i !== -1 && (firstIdx === -1 || i < firstIdx)) firstIdx = i;
  }
  if (firstIdx === -1) return text.slice(0, 180);

  const start = Math.max(0, firstIdx - 90);
  const end = Math.min(text.length, firstIdx + 180);
  let window = text.slice(start, end);
  if (start > 0) window = "…" + window;
  if (end < text.length) window = window + "…";

  for (const term of terms) {
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${safe})`, "gi");
    window = window.replace(re, "<mark>$1</mark>");
  }
  return window;
}

function scoreMatch(haystack: string, terms: string[]): number {
  if (terms.length === 0) return 0;
  const lower = haystack.toLowerCase();
  let score = 0;
  for (const t of terms) {
    const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = lower.match(re);
    if (matches) score += matches.length;
  }
  return score;
}
