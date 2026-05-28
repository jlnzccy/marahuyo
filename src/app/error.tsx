"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
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
    <main id="main-content" className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      <div className="max-w-prose text-center">
        <p className="meta mb-4">something went sideways</p>
        <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
          The page <span className="font-italic italic font-normal">stumbled</span>.
        </h1>
        <p className="mt-6 font-serif text-reading-sm text-muted text-pretty">
          A page error broke this view. Try again — usually it works the second time.
        </p>
        {error.digest && (
          <p className="meta mt-6">ref · {error.digest}</p>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 font-sans text-sm font-medium text-canvas transition-transform hover:scale-[1.02]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center font-sans text-sm text-muted underline decoration-muted/30 underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
