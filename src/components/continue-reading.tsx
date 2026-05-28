"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { KindChip } from "@/components/kind-chip";
import { ReaderContainer } from "@/components/reader-container";
import { readBookmarks, clearBookmark, type Bookmark } from "@/lib/bookmarks";
import { relativeTime } from "@/lib/format";

/**
 * Reads localStorage bookmarks on mount and renders a "continue reading" rail.
 * Returns null until mounted to avoid SSR/CSR mismatch, and stays null when
 * there are no bookmarks (the parent section is hidden via `hidden` class).
 */
export function ContinueReading() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<Bookmark[]>([]);

  useEffect(() => {
    setItems(readBookmarks());
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (items.length === 0) return null;

  const dismiss = (key: string) => {
    clearBookmark(key);
    setItems((prev) => prev.filter((b) => b.key !== key));
  };

  return (
    <section className="pb-24">
      <ReaderContainer width="wide">
        <div className="mb-8 flex items-end justify-between border-b border-border/60 pb-6">
          <div>
            <p className="meta mb-2">your shelf</p>
            <h2 className="font-serif text-3xl font-bold md:text-4xl">
              Continue <span className="font-italic italic font-normal">reading</span>
            </h2>
          </div>
          <Link
            href="/works"
            className="hidden font-sans text-sm text-muted hover:text-ink transition-colors md:inline"
          >
            All works →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((b) => (
            <div
              key={b.key}
              className="group relative rounded-xl border border-border/60 bg-surface/40 p-5 transition-colors hover:bg-surface"
            >
              <button
                type="button"
                onClick={() => dismiss(b.key)}
                aria-label={`Remove ${b.title} from continue reading`}
                className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-whisper opacity-50 transition-opacity hover:bg-canvas hover:text-ink group-hover:opacity-100 focus:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <Link href={b.href} className="block pr-8">
                <div className="mb-3 flex items-center gap-2">
                  <KindChip kind={b.kind} />
                  <span className="meta">{relativeTime(b.visitedAt)}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-lg font-bold leading-snug text-ink">
                    {b.title}
                  </h3>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                {b.subtitle && (
                  <p className="mt-1 font-italic italic text-sm text-muted">
                    {b.subtitle}
                  </p>
                )}
              </Link>
            </div>
          ))}
        </div>
      </ReaderContainer>
    </section>
  );
}
