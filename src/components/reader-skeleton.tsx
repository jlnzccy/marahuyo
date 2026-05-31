import { ReaderContainer } from "@/components/reader-container";
import { Skeleton } from "@/components/skeleton";

const LINES = [
  "w-full",
  "w-[96%]",
  "w-full",
  "w-[88%]",
  "w-[94%]",
  "w-full",
  "w-[70%]",
];

/**
 * Loading placeholder for the reading canvas (standalone reads + series
 * chapters). Mirrors ReaderShell's `<main>`: a cover block, the hairline rule,
 * then a column of prose lines at the sacred 650px width. No header is drawn —
 * in the app shell the reader has none, and on the web it returns within a beat.
 */
export function ReaderSkeleton() {
  return (
    <main
      id="main-content"
      role="status"
      aria-label="Loading"
      className="pt-12 pb-24 md:pt-20"
    >
      <ReaderContainer>
        <Skeleton className="-mx-5 aspect-[4/5] rounded-2xl sm:aspect-[16/10] md:-mx-12" />

        <div className="my-12 h-px bg-border/40" aria-hidden="true" />

        <div className="space-y-4">
          {LINES.map((w, i) => (
            <Skeleton key={i} className={`h-4 ${w}`} />
          ))}
        </div>

        <div className="mt-10 space-y-4">
          {LINES.slice(0, 5).map((w, i) => (
            <Skeleton key={i} className={`h-4 ${w}`} />
          ))}
        </div>

        <span className="sr-only">Loading the page…</span>
      </ReaderContainer>
    </main>
  );
}
