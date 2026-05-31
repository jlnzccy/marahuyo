import { ReaderContainer } from "@/components/reader-container";
import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <main
      id="main-content"
      role="status"
      aria-label="Loading"
      className="pt-24 pb-28 md:pt-28"
    >
      <ReaderContainer width="wide">
        <div className="mb-8 border-b border-border/60 pb-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-10 w-64" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-surface/40 p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-[75%]" />
              <Skeleton className="mt-2 h-4 w-[50%]" />
              <Skeleton className="mt-4 h-0.5 w-full rounded-full" />
            </div>
          ))}
        </div>

        <span className="sr-only">Loading your shelf…</span>
      </ReaderContainer>
    </main>
  );
}
