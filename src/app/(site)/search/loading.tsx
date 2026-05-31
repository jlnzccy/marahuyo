import { ReaderContainer } from "@/components/reader-container";
import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <main
      id="main-content"
      role="status"
      aria-label="Loading"
      className="pt-16 pb-20 md:pt-24"
    >
      <ReaderContainer width="wide">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-4 h-11 w-[60%] max-w-md" />

        <Skeleton className="mt-8 h-12 w-full rounded-full" />

        <div className="mt-12 space-y-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-[65%]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          ))}
        </div>

        <span className="sr-only">Searching the archive…</span>
      </ReaderContainer>
    </main>
  );
}
