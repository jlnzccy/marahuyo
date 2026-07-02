"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, Menu, Check } from "lucide-react";
import { LikeButton } from "@/components/like-button";
import { ShareButton } from "@/components/share-button";
import { ReadingSettings } from "@/components/reading-settings";
import { useAppShell } from "@/lib/use-app-context";
import { readBookmarks } from "@/lib/bookmarks";
import { hapticLight } from "@/lib/native";
import { cn } from "@/lib/cn";

export type ChapterNav = {
  slug: string;
  number: number;
  title: string;
  subtitle?: string;
  readingMinutes?: number;
};

type FootLink = { href: string; label: string; hint?: string };

type Props = {
  title: string;
  subtitle?: string;
  likeKey?: string;
  backHref: string;
  backLabel?: string;
  prev?: FootLink | null;
  next?: FootLink | null;
  seriesSlug?: string;
  currentChapterSlug?: string;
  chapters?: ChapterNav[];
};

const EASE = [0.16, 1, 0.3, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");
const PILL =
  "rounded-full border border-border/60 bg-surface/85 shadow-[0_6px_18px_-12px_rgba(0,0,0,0.25)] backdrop-blur";

/**
 * App-only reading chrome for SERIES chapters. Controls float as separate pills
 * over the page (back circle · chapter pill · [Aa | ☰] pill) plus a floating
 * like/share pill. Shown automatically at the top of the page, hidden on
 * scroll-down, toggled by a tap. Standalone reads use the ReaderActions rail.
 */
export function ReaderChrome({
  title,
  subtitle,
  likeKey,
  backHref,
  backLabel,
  seriesSlug,
  currentChapterSlug,
  chapters,
}: Props) {
  const isApp = useAppShell();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const sheetOpenRef = useRef(false);
  const lastYRef = useRef(0);

  const isSeries = !!(seriesSlug && chapters && chapters.length > 0);
  const current = isSeries
    ? chapters!.find((c) => c.slug === currentChapterSlug)
    : undefined;

  sheetOpenRef.current = drawerOpen || settingsOpen;

  // Auto-show at the top of the page; hide on scroll-down, reveal on scroll-up.
  useEffect(() => {
    if (!isApp) return;
    const onScroll = () => {
      const y = window.scrollY;
      const last = lastYRef.current;
      if (y <= 8) setVisible(true);
      else if (y > last + 4 && y > 140) setVisible(false);
      else if (y < last - 4) setVisible(true);
      lastYRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isApp]);

  // Tap on any non-interactive part of the page toggles the chrome.
  useEffect(() => {
    if (!isApp) return;
    const onClick = (e: MouseEvent) => {
      if (sheetOpenRef.current) return;
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (
        el.closest(
          "a,button,input,textarea,select,label,[role='button'],.marginalia,.marginalia-marker"
        )
      )
        return;
      if ((window.getSelection?.()?.toString().length ?? 0) > 0) return;
      setVisible((v) => !v);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [isApp]);

  // Series chapters only; standalone reads keep the floating ReaderActions rail.
  if (!isApp || !isSeries) return null;

  const pe = visible ? "pointer-events-auto" : "pointer-events-none";

  return (
    <>
      {/* Floating top controls */}
      <motion.div
        initial={false}
        animate={visible ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.3, ease: EASE }}
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-2 px-3 pt-[calc(env(safe-area-inset-top)+0.55rem)]"
      >
        <div className={cn("flex items-center gap-2", pe)}>
          <Link
            href={backHref}
            aria-label={backLabel ?? "Back"}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center text-ink transition-colors hover:bg-surface",
              PILL
            )}
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>

          {current && (
            <span
              className={cn(
                "inline-flex h-11 items-center px-4 font-mono text-[12px] uppercase tracking-meta text-muted",
                PILL
              )}
            >
              Ch. {pad(current.number)}
            </span>
          )}
        </div>

        <div className={cn("flex items-center", pe, PILL)}>
          <button
            type="button"
            onClick={() => {
              void hapticLight();
              setSettingsOpen(true);
            }}
            aria-label="Reading settings"
            className="inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-full px-3 font-serif text-[17px] leading-none text-muted transition-colors hover:text-ink"
          >
            Aa
          </button>
          <span aria-hidden="true" className="h-5 w-px bg-border/70" />
          <button
            type="button"
            onClick={() => {
              void hapticLight();
              setDrawerOpen(true);
            }}
            aria-label="Chapters"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-ink"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </motion.div>

      {/* Floating like / share pill */}
      <motion.div
        initial={false}
        animate={visible ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.3, ease: EASE }}
        className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center"
      >
        <div className={cn("flex items-center gap-1 px-1.5 py-1", pe, PILL)}>
          {likeKey && <LikeButton keyId={likeKey} />}
          <ShareButton title={title} text={subtitle} />
        </div>
      </motion.div>

      <ChapterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        seriesSlug={seriesSlug!}
        chapters={chapters!}
        currentSlug={currentChapterSlug}
      />

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

function SettingsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("overflow-hidden");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="settings-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
        >
          <motion.div
            key="settings-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Reading settings"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={reduce ? { duration: 0 } : { duration: 0.4, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border/60 bg-canvas/95 pb-[max(env(safe-area-inset-bottom),1rem)] backdrop-blur-2xl"
          >
            <div className="flex justify-center pt-3">
              <span aria-hidden="true" className="h-1 w-10 rounded-full bg-border" />
            </div>
            <p className="meta px-6 pb-1 pt-4">Reading</p>
            <div className="px-6 pb-4 pt-2">
              <ReadingSettings />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChapterDrawer({
  open,
  onClose,
  seriesSlug,
  chapters,
  currentSlug,
}: {
  open: boolean;
  onClose: () => void;
  seriesSlug: string;
  chapters: ChapterNav[];
  currentSlug?: string;
}) {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("overflow-hidden");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    const bm = readBookmarks();
    const map: Record<string, number> = {};
    for (const c of chapters) {
      const found = bm.find((b) => b.key === `series/${seriesSlug}/${c.slug}`);
      map[c.slug] = found?.scrollPercent ?? 0;
    }
    setProgress(map);

    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, seriesSlug, chapters, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="chapter-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
        >
          <motion.div
            key="chapter-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Chapters"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={reduce ? { duration: 0 } : { duration: 0.4, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 flex max-h-[78vh] flex-col rounded-t-3xl border-t border-border/60 bg-canvas/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] backdrop-blur-2xl"
          >
            <div className="flex shrink-0 justify-center pt-3">
              <span aria-hidden="true" className="h-1 w-10 rounded-full bg-border" />
            </div>
            <p className="meta shrink-0 px-6 pb-3 pt-4">Chapters</p>

            <ol className="min-h-0 flex-1 overflow-y-auto">
              {chapters.map((c) => {
                const active = c.slug === currentSlug;
                const pct = progress[c.slug] ?? 0;
                const finished = pct >= 95;
                return (
                  <li key={c.slug}>
                    <Link
                      href={`/series/${seriesSlug}/${c.slug}`}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-start gap-3 border-t border-border/60 px-6 py-4 transition-colors",
                        active ? "bg-surface/60" : "hover:bg-surface/40"
                      )}
                    >
                      <span className="meta w-10 shrink-0 pt-1">{pad(c.number)}</span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block font-serif text-base font-bold leading-snug",
                            finished && !active ? "text-muted" : "text-ink"
                          )}
                        >
                          {c.title}
                        </span>
                        {c.subtitle && (
                          <span className="mt-0.5 block font-italic text-sm italic text-muted">
                            {c.subtitle}
                          </span>
                        )}
                        {pct >= 5 && !finished && (
                          <span className="mt-2 block h-0.5 w-full max-w-[10rem] overflow-hidden rounded-full bg-border/70">
                            <span
                              className="block h-full bg-accent/80"
                              style={{ width: `${pct}%` }}
                            />
                          </span>
                        )}
                      </span>
                      {finished ? (
                        <Check
                          className="mt-1 h-4 w-4 shrink-0 text-accent"
                          aria-label="Finished"
                        />
                      ) : active ? (
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          aria-label="Current"
                        />
                      ) : (
                        <span className="w-4 shrink-0" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
