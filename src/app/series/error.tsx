"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReaderContainer } from "@/components/reader-container";

export default function SeriesError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="pt-20 pb-24">
        <ReaderContainer>
          <p className="meta mb-4">a chapter slipped</p>
          <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
            Couldn&rsquo;t load this <span className="font-italic italic font-normal">series</span>.
          </h1>
          <p className="mt-6 max-w-prose font-serif text-reading-sm text-muted text-pretty">
            The series view threw an error. Refresh once — if it persists, head back to the archive.
          </p>
          {error.digest && <p className="meta mt-6">ref · {error.digest}</p>}
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 font-sans text-sm font-medium text-canvas"
            >
              Try again
            </button>
            <Link
              href="/works"
              className="inline-flex items-center font-sans text-sm text-muted underline decoration-muted/30 underline-offset-[6px] hover:text-ink hover:decoration-ink"
            >
              All works
            </Link>
          </div>
        </ReaderContainer>
      </main>
      <SiteFooter />
    </>
  );
}
