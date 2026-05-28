"use client";

import { useEffect, useRef } from "react";
import { recordVisit, updateProgress } from "@/lib/bookmarks";
import { syncEntries } from "@/lib/reader-sync";
import type { WorkKind } from "@/types/content";

type Props = {
  key_: string;
  href: string;
  title: string;
  kind: WorkKind;
  subtitle?: string;
};

const PROGRESS_DEBOUNCE_MS = 800;
const MIN_PROGRESS_DELTA = 2;

/**
 * Side-effect-only. Records a visit on mount, then writes scroll progress
 * back to localStorage (debounced) so the homepage rail can offer
 * "Continue from N%". Renders nothing.
 */
export function BookmarkTracker({ key_, href, title, kind, subtitle }: Props) {
  const lastPercent = useRef<number>(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    recordVisit({ key: key_, href, title, kind, subtitle });
    syncEntries([
      {
        key: key_,
        href,
        title,
        kind,
        subtitle,
        scrollPercent: 0,
        visitedAt: Date.now()
      }
    ]);
  }, [key_, href, title, kind, subtitle]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const computePercent = (): number => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      return (window.scrollY / scrollable) * 100;
    };

    const flush = () => {
      const next = computePercent();
      if (Math.abs(next - lastPercent.current) < MIN_PROGRESS_DELTA) return;
      lastPercent.current = next;
      updateProgress(key_, next);
      syncEntries([
        {
          key: key_,
          scrollPercent: Math.round(next),
          visitedAt: Date.now()
        }
      ]);
    };

    const schedule = () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, PROGRESS_DEBOUNCE_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", onVisibility);
      if (timer.current !== null) window.clearTimeout(timer.current);
      flush();
    };
  }, [key_]);

  return null;
}
