"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CornerDownRight, X } from "lucide-react";
import { readBookmarks } from "@/lib/bookmarks";

type Props = {
  /** Same stable id the BookmarkTracker writes under (e.g. "read/<slug>"). */
  bookmarkKey: string;
};

/* Only offer a resume when there's meaningful unread distance left. */
const MIN_PERCENT = 5;
const MAX_PERCENT = 95;
/* Treat any real scroll as "I'm reading from here" → retract the offer. */
const DISMISS_AFTER_PX = 120;

/**
 * Honest companion to the "Continue from N%" shelf: the shelf records the
 * position, this restores it. On mount it reads the saved scroll percent for
 * this piece and, if there's a chunk left unread, offers a one-tap jump.
 *
 * Deliberately an affordance, not an auto-jump — percent-based restore is
 * approximate while images settle, and silently moving the page is hostile on
 * a refresh or a back-navigation. The reader stays in control.
 */
export function ResumePill({ bookmarkKey }: Props) {
  const reduced = useReducedMotion();
  const [percent, setPercent] = useState<number | null>(null);

  useEffect(() => {
    const saved = readBookmarks().find((b) => b.key === bookmarkKey);
    const p = saved?.scrollPercent;
    if (typeof p !== "number" || p < MIN_PERCENT || p > MAX_PERCENT) return;
    setPercent(Math.round(p));
  }, [bookmarkKey]);

  /* Retract once the reader starts scrolling on their own. */
  useEffect(() => {
    if (percent === null) return;
    const onScroll = () => {
      if (window.scrollY > DISMISS_AFTER_PX) setPercent(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [percent]);

  if (percent === null) return null;

  const jump = () => {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    const top = Math.max(0, (scrollable * percent) / 100);
    requestAnimationFrame(() => {
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    });
    setPercent(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="no-print fixed inset-x-0 bottom-24 z-40 flex justify-center px-5 lg:bottom-6"
      >
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border/70 bg-surface/95 py-1 pl-4 pr-1 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.4)] backdrop-blur">
          <button
            type="button"
            onClick={jump}
            className="group inline-flex items-center gap-2 rounded-full font-sans text-sm text-ink"
          >
            <CornerDownRight className="h-3.5 w-3.5 text-accent" />
            <span>
              Resume where you left off
              <span className="ml-1.5 font-mono text-[11px] text-whisper">
                {percent}%
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPercent(null)}
            aria-label="Dismiss resume"
            className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-whisper transition-colors hover:bg-canvas hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
