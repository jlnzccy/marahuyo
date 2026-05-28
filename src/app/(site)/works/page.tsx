import Link from "next/link";
import { ReaderContainer } from "@/components/reader-container";
import { FadeUp } from "@/components/motion";
import { WorkRow } from "@/components/work-row";
import { getAllPublishedWorks } from "@/lib/works";
import { cn } from "@/lib/cn";

export const metadata = {
  title: "Works — the archive"
};

type SearchParams = Promise<{ tag?: string }>;

export default async function WorksPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const all = await getAllPublishedWorks();
  const { tag } = await searchParams;
  const activeTag = tag?.trim().toLowerCase() ?? null;

  /* Build the unique tag list across all published works, with counts. */
  const tagCounts = new Map<string, number>();
  for (const w of all) {
    for (const t of w.tags ?? []) {
      const key = t.trim().toLowerCase();
      if (!key) continue;
      tagCounts.set(key, (tagCounts.get(key) ?? 0) + 1);
    }
  }
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);

  const filtered = activeTag
    ? all.filter((w) => (w.tags ?? []).some((t) => t.toLowerCase() === activeTag))
    : all;

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
            poems, essays, and a slow novel — listed newest first.
          </p>
        </FadeUp>

        {tags.length > 0 && (
          <FadeUp delay={0.06}>
            <nav
              aria-label="Filter by tag"
              className="mt-12 flex flex-wrap items-center gap-2"
            >
              <Link
                href="/works"
                aria-current={activeTag === null ? "page" : undefined}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-meta transition-colors",
                  activeTag === null
                    ? "border-ink bg-ink text-canvas"
                    : "border-border/60 text-muted hover:border-ink hover:text-ink"
                )}
              >
                all · {all.length}
              </Link>
              {tags.map(([t, count]) => {
                const isActive = activeTag === t;
                return (
                  <Link
                    key={t}
                    href={`/works?tag=${encodeURIComponent(t)}`}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-meta transition-colors",
                      isActive
                        ? "border-ink bg-ink text-canvas"
                        : "border-border/60 text-muted hover:border-ink hover:text-ink"
                    )}
                  >
                    {t} · {count}
                  </Link>
                );
              })}
            </nav>
          </FadeUp>
        )}

        <div className="my-14 hairline" aria-hidden="true" />

        <FadeUp delay={0.1}>
          <div className="mx-auto max-w-3xl">
            {filtered.length === 0 ? (
              <p className="py-16 text-center font-italic italic text-xl text-muted">
                {activeTag
                  ? `nothing tagged "${activeTag}" yet.`
                  : "the archive is quiet — soon."}
              </p>
            ) : (
              filtered.map((w) => <WorkRow key={w.id} work={w} />)
            )}
          </div>
        </FadeUp>

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
