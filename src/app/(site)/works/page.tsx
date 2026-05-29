import Link from "next/link";
import { ReaderContainer } from "@/components/reader-container";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion";
import { WorkRow } from "@/components/work-row";
import { getAllPublishedWorks } from "@/lib/works";
import { cn } from "@/lib/cn";
import type { WorkKind } from "@/types/content";

export const metadata = {
  title: "Works — the archive"
};

type SortKey = "newest" | "oldest" | "reading-time";

type SearchParams = Promise<{ tag?: string; kind?: string; sort?: string }>;

const KIND_LABELS: Record<WorkKind, string> = {
  poem: "poems",
  essay: "essays",
  oneshot: "one-shots",
  series: "series",
  article: "articles",
  story: "stories",
  note: "notes"
};

const SORTS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "newest" },
  { value: "oldest", label: "oldest" },
  { value: "reading-time", label: "longest" }
];

const isKind = (v?: string): v is WorkKind => !!v && v in KIND_LABELS;
const ts = (d?: string) => (d ? new Date(d).getTime() : 0);

const pill = (active: boolean) =>
  cn(
    "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-meta transition-colors",
    active
      ? "border-ink bg-ink text-canvas"
      : "border-border/60 text-muted hover:border-ink hover:text-ink"
  );

export default async function WorksPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const all = await getAllPublishedWorks();
  const sp = await searchParams;

  const activeTag = sp.tag?.trim().toLowerCase() || null;
  const activeKind = isKind(sp.kind) ? sp.kind : null;
  const activeSort: SortKey = SORTS.some((s) => s.value === sp.sort)
    ? (sp.sort as SortKey)
    : "newest";

  /* Facet counts are computed over the full archive so each pill shows what's
     available, not the intersection with the current selection. */
  const tagCounts = new Map<string, number>();
  const kindCounts = new Map<WorkKind, number>();
  for (const w of all) {
    kindCounts.set(w.kind, (kindCounts.get(w.kind) ?? 0) + 1);
    for (const t of w.tags ?? []) {
      const key = t.trim().toLowerCase();
      if (!key) continue;
      tagCounts.set(key, (tagCounts.get(key) ?? 0) + 1);
    }
  }
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
  const kinds = [...kindCounts.entries()].sort((a, b) => b[1] - a[1]);

  const filtered = all.filter((w) => {
    if (activeKind && w.kind !== activeKind) return false;
    if (activeTag && !(w.tags ?? []).some((t) => t.toLowerCase() === activeTag))
      return false;
    return true;
  });

  const sorted = [...filtered];
  if (activeSort === "oldest") {
    sorted.sort((a, b) => ts(a.publishedAt) - ts(b.publishedAt));
  } else if (activeSort === "reading-time") {
    sorted.sort((a, b) => b.readingMinutes - a.readingMinutes);
  } else {
    sorted.sort((a, b) => ts(b.publishedAt) - ts(a.publishedAt));
  }

  /* Compose a /works URL, merging overrides over the current selection.
     Using `key in overrides` lets a caller clear a facet by passing null. */
  const hrefWith = (overrides: {
    tag?: string | null;
    kind?: string | null;
    sort?: SortKey;
  }) => {
    const next = {
      tag: "tag" in overrides ? overrides.tag : activeTag,
      kind: "kind" in overrides ? overrides.kind : activeKind,
      sort: "sort" in overrides ? overrides.sort : activeSort
    };
    const q = new URLSearchParams();
    if (next.tag) q.set("tag", next.tag);
    if (next.kind) q.set("kind", next.kind);
    if (next.sort && next.sort !== "newest") q.set("sort", next.sort);
    const qs = q.toString();
    return qs ? `/works?${qs}` : "/works";
  };

  return (
    <main id="main-content" className="pt-16 pb-20 md:pt-24">
      <ReaderContainer width="wide">
        <FadeUp>
          <p className="meta mb-4">the archive</p>
          <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-balance md:text-6xl">
            every <span className="font-italic italic font-normal">quiet</span> thing,
            in one place.
          </h1>
          <p className="mt-6 max-w-prose font-italic italic text-xl text-muted md:text-2xl">
            poems, essays, and a slow novel — filtered to your taste.
          </p>
        </FadeUp>

        <FadeUp delay={0.06}>
          <div className="mt-12 space-y-5">
            {kinds.length > 1 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="meta mr-1 w-10 shrink-0 text-whisper">type</span>
                <Link
                  href={hrefWith({ kind: null })}
                  aria-current={activeKind === null ? "page" : undefined}
                  className={pill(activeKind === null)}
                >
                  all · {all.length}
                </Link>
                {kinds.map(([k, count]) => (
                  <Link
                    key={k}
                    href={hrefWith({ kind: k })}
                    aria-current={activeKind === k ? "page" : undefined}
                    className={pill(activeKind === k)}
                  >
                    {KIND_LABELS[k]} · {count}
                  </Link>
                ))}
              </div>
            )}

            {tags.length > 0 && (
              <nav
                aria-label="Filter by tag"
                className="flex flex-wrap items-center gap-2"
              >
                <span className="meta mr-1 w-10 shrink-0 text-whisper">tag</span>
                <Link
                  href={hrefWith({ tag: null })}
                  aria-current={activeTag === null ? "page" : undefined}
                  className={pill(activeTag === null)}
                >
                  all
                </Link>
                {tags.map(([t, count]) => (
                  <Link
                    key={t}
                    href={hrefWith({ tag: t })}
                    aria-current={activeTag === t ? "page" : undefined}
                    className={pill(activeTag === t)}
                  >
                    {t} · {count}
                  </Link>
                ))}
              </nav>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="meta mr-1 w-10 shrink-0 text-whisper">sort</span>
              {SORTS.map((s) => (
                <Link
                  key={s.value}
                  href={hrefWith({ sort: s.value })}
                  aria-current={activeSort === s.value ? "page" : undefined}
                  className={pill(activeSort === s.value)}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </FadeUp>

        <div className="my-14 hairline" aria-hidden="true" />

        <Stagger className="mx-auto max-w-3xl" staggerChildren={0.05}>
          {sorted.length === 0 ? (
            <p className="py-16 text-center font-italic italic text-xl text-muted">
              {activeTag || activeKind
                ? "nothing matches these filters yet."
                : "the archive is quiet — soon."}
            </p>
          ) : (
            sorted.map((w) => (
              <StaggerItem key={w.id}>
                <WorkRow work={w} />
              </StaggerItem>
            ))
          )}
        </Stagger>

        <div className="mt-20 text-center">
          <Link
            href="/"
            className="font-italic italic text-lg text-muted underline decoration-muted/30 underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink"
          >
            ← back to the entrance
          </Link>
        </div>
      </ReaderContainer>
    </main>
  );
}
