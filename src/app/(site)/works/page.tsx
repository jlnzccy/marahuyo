import Link from "next/link";
import { ReaderContainer } from "@/components/reader-container";
import { FadeUp } from "@/components/motion";
import { WorkRow } from "@/components/work-row";
import { getAllPublishedWorks } from "@/lib/works";
import { cn } from "@/lib/cn";

export const metadata = {
  title: "Works — the archive"
};

type SearchParams = Promise<{ view?: string }>;

const ts = (d?: string) => (d ? new Date(d).getTime() : 0);

const tab = (active: boolean) =>
  cn(
    "rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-meta transition-colors",
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
  const view = sp.view === "series" ? "series" : "works";

  const works = all.filter((w) => w.kind !== "series");
  const series = all.filter((w) => w.kind === "series");

  const list = (view === "series" ? series : works)
    .slice()
    .sort((a, b) => ts(b.publishedAt) - ts(a.publishedAt));

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
            standalone pieces and ongoing series.
          </p>
        </FadeUp>

        <FadeUp delay={0.06}>
          <div
            className="mt-12 flex items-center gap-2"
            role="tablist"
            aria-label="Browse the archive"
          >
            <Link
              href="/works"
              role="tab"
              aria-selected={view === "works"}
              className={tab(view === "works")}
            >
              Works · {works.length}
            </Link>
            <Link
              href="/works?view=series"
              role="tab"
              aria-selected={view === "series"}
              className={tab(view === "series")}
            >
              Series · {series.length}
            </Link>
          </div>
        </FadeUp>

        <div className="my-14 hairline" aria-hidden="true" />

        {/* Plain render (no whileInView): a soft nav between ?view values must
            never leave the list stuck at opacity 0. */}
        <div className="mx-auto max-w-3xl">
          {list.length === 0 ? (
            <p className="py-16 text-center font-italic italic text-xl text-muted">
              {view === "series"
                ? "no series yet — soon."
                : "the archive is quiet — soon."}
            </p>
          ) : (
            list.map((w) => <WorkRow key={w.id} work={w} />)
          )}
        </div>

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
