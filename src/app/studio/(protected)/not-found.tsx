import Link from "next/link";
import { ChevronLeft, Compass } from "lucide-react";

export default function StudioNotFound() {
  return (
    <div className="mx-auto max-w-xl space-y-6 py-16 text-center">
      <Compass className="mx-auto h-6 w-6 text-whisper" />
      <p className="meta">404 · studio</p>
      <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
        That room <span className="font-italic italic font-normal">isn&rsquo;t here.</span>
      </h1>
      <p className="font-italic italic text-lg text-muted">
        the piece may have been deleted, or never existed.
      </p>
      <div className="flex justify-center pt-2">
        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-surface/60 px-3 py-1.5 font-sans text-xs text-muted hover:bg-surface hover:text-ink"
        >
          <ChevronLeft className="h-3 w-3" /> back to overview
        </Link>
      </div>
    </div>
  );
}
