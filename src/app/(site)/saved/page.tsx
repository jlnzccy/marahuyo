"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, BookmarkX, X } from "lucide-react";
import { KindChip } from "@/components/kind-chip";
import { ReaderContainer } from "@/components/reader-container";
import { readBookmarks, clearBookmark, type Bookmark } from "@/lib/bookmarks";
import { relativeTime } from "@/lib/format";

/**
 * "Saved" surface for the app bottom-nav. Backed by the same localStorage shelf
 * (`readBookmarks`) the homepage "Continue reading" rail uses, so saving while
 * reading and the Saved tab stay in sync. Renders all saved items (the homepage
 * rail only shows when there are 2+).
 */
export default function SavedPage() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<Bookmark[]>([]);

  useEffect(() => {
    setItems(readBookmarks());
    setMounted(true);
  }, []);

  const remove = (key: string) => {
    clearBookmark(key);
    setItems((prev) => prev.filter((b) => b.key !== key));
  };

  return (
    <main id="main-content" className="pt-24 pb-28 md:pt-28">
      <ReaderContainer width="wide">
        <header className="mb-8 border-b border-border/60 pb-6">
          <p className="meta mb-2">your shelf</p>
          <h1 className="font-serif text-3xl font-bold md:text-4xl">
            Saved{" "}
            <span className="font-italic font-normal italic">reading</span>
          </h1>
        </header>

        {!mounted ? null : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 px-6 py-16 text-center">
            <BookmarkX className="mb-4 h-7 w-7 text-whisper" strokeWidth={1.5} />
            <p className="font-serif text-lg text-ink">Nothing saved yet</p>
            <p className="mt-1 max-w-xs font-sans text-sm text-muted">
              Pieces you open are kept here so you can pick up where you left off.
            </p>
            <Link
              href="/works"
              className="mt-5 font-sans text-sm text-accent transition-colors hover:text-ink"
            >
              Browse the archive →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((b) => (
              <div
                key={b.key}
                className="group relative rounded-xl border border-border/60 bg-surface/40 p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-border hover:bg-surface"
              >
                <button
                  type="button"
                  onClick={() => remove(b.key)}
                  aria-label={`Remove ${b.title} from saved`}
                  className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-whisper opacity-50 transition-opacity hover:bg-canvas hover:text-ink focus:opacity-100 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <Link href={b.href} className="block pr-8">
                  <div className="mb-3 flex items-center gap-2">
                    <KindChip kind={b.kind} />
                    <span className="meta">{relativeTime(b.visitedAt)}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-serif text-lg font-bold leading-snug text-ink">
                      {b.title}
                    </h2>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  {b.subtitle && (
                    <p className="mt-1 font-italic text-sm italic text-muted">
                      {b.subtitle}
                    </p>
                  )}
                  {typeof b.scrollPercent === "number" && b.scrollPercent >= 5 && (
                    <div className="mt-4 space-y-1.5">
                      <div className="h-0.5 w-full overflow-hidden rounded-full bg-border/70">
                        <div
                          className="h-full bg-accent/80"
                          style={{ width: `${Math.min(100, b.scrollPercent)}%` }}
                        />
                      </div>
                      <p className="meta">
                        {b.scrollPercent >= 95
                          ? "Almost finished"
                          : `Continue from ${Math.round(b.scrollPercent)}%`}
                      </p>
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </ReaderContainer>
    </main>
  );
}
