import { ReaderContainer } from "@/components/reader-container";
import { Skeleton } from "@/components/skeleton";

const ROWS = [true, false, true, false];

export default function Loading() {
  return (
    <main
      id="main-content"
      role="status"
      aria-label="Loading"
      className="pt-16 pb-20 md:pt-24"
    >
      <ReaderContainer width="wide">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-4 h-12 w-[80%] max-w-2xl" />
        <Skeleton className="mt-3 h-12 w-[55%] max-w-xl" />
        <Skeleton className="mt-6 h-6 w-64" />

        <div className="mt-12 flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>

        <div className="my-14 h-px bg-border/40" aria-hidden="true" />

        <div className="mx-auto max-w-3xl">
          {ROWS.map((hasThumb, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 border-t border-border/60 py-6 first:border-t-0 md:flex-row md:items-start md:gap-8"
            >
              {hasThumb && (
                <Skeleton className="aspect-[4/3] w-full rounded-md md:w-72 md:shrink-0" />
              )}
              <div className="flex-1 space-y-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-7 w-[70%]" />
                <Skeleton className="h-5 w-[45%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>

        <span className="sr-only">Loading the archive…</span>
      </ReaderContainer>
    </main>
  );
}
