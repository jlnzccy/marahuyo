"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [toast, setToast] = useState<{
    bookmark: Bookmark;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);

  const toastRef = useRef<{
    bookmark: Bookmark;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    const local = readBookmarks();
    setItems(local);
    setMounted(true);
    if (local.length === 0) return;

    // Validate against the live DB — drop bookmarks whose underlying work was
    // unpublished or trashed since they were saved. Fire-and-forget; on
    // network error we keep the local list as-is.
    const controller = new AbortController();
    fetch("/api/bookmarks/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ keys: local.map((b) => b.key) }),
      signal: controller.signal
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { ok: boolean; valid: string[] } | null) => {
        if (!data?.ok) return;
        const validSet = new Set(data.valid);
        const stale = local.filter((b) => !validSet.has(b.key));
        if (stale.length === 0) return;
        stale.forEach((b) => clearBookmark(b.key));
        setItems((prev) => prev.filter((b) => validSet.has(b.key)));
      })
      .catch(() => {
        /* swallow — offline / abort */
      });

    return () => {
      controller.abort();
      // On unmount, flush any pending bookmark deletion
      if (toastRef.current) {
        clearTimeout(toastRef.current.timeoutId);
        clearBookmark(toastRef.current.bookmark.key);
      }
    };
  }, []);

  if (!mounted) return null;
  if (items.length < 2) return null;

  const dismiss = (key: string) => {
    const itemToDismiss = items.find((x) => x.key === key);
    if (!itemToDismiss) return;

    // If there was already a pending toast, finalize that deletion
    if (toast) {
      clearTimeout(toast.timeoutId);
      clearBookmark(toast.bookmark.key);
    }

    // Optimistically remove from items list
    setItems((prev) => prev.filter((x) => x.key !== key));

    // Schedule actual deletion
    const timeoutId = setTimeout(() => {
      clearBookmark(key);
      setToast(null);
    }, 5000);

    setToast({
      bookmark: itemToDismiss,
      timeoutId
    });
  };

  const undo = () => {
    if (!toast) return;
    clearTimeout(toast.timeoutId);

    // Put item back into list and sort by visitedAt desc
    setItems((prev) => {
      const next = [...prev, toast.bookmark];
      return next.sort((a, b) => b.visitedAt - a.visitedAt);
    });

    setToast(null);
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
              className="group relative rounded-xl border border-border/60 bg-surface/40 p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-surface hover:border-border"
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
          {/* Ghost tile to fill the trailing slot when count is odd */}
          {items.length % 2 !== 0 && (
            <Link
              href="/works"
              className="flex items-center justify-center rounded-xl border border-dashed border-border/60 p-5 font-sans text-sm text-muted transition-all duration-300 hover:border-border hover:text-ink hover:shadow-sm"
            >
              see all works →
            </Link>
          )}
        </div>
      </ReaderContainer>

      {/* Undo Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-6 z-50 flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-surface/95 px-4 py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl max-w-sm w-[calc(100vw-3rem)] md:w-auto"
          >
            <span className="font-sans text-xs text-muted">
              Removed <span className="font-serif italic text-ink font-medium">&ldquo;{toast.bookmark.title}&rdquo;</span> from shelf
            </span>
            <button
              type="button"
              onClick={undo}
              className="font-sans text-xs font-bold text-accent hover:underline focus:outline-none"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
