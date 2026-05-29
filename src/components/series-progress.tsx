"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Heart } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion";
import { readBookmarks } from "@/lib/bookmarks";
import { cn } from "@/lib/cn";

export type ChapterLite = {
  slug: string;
  number: number;
  title: string;
  subtitle?: string;
  readingMinutes: number;
};

type Props = {
  seriesSlug: string;
  chapters: ChapterLite[];
};

type Progress = { percent: number; liked: boolean };

const LIKE_PREFIX = "marahuyo:like:";
const FINISHED = 95;
const STARTED = 5;

const pad = (n: number) => String(n).padStart(2, "0");
const keyFor = (seriesSlug: string, chapterSlug: string) =>
  `series/${seriesSlug}/${chapterSlug}`;

/**
 * Renders the series CTA + chapter list, then upgrades it with the reader's
 * own progress once mounted. Progress lives in the same localStorage the
 * "continue reading" shelf uses, so the series page knows where you stopped
 * and which chapters you've finished — no account, no DB read.
 *
 * SSR renders the plain "start from the top" state; the post-mount effect
 * layers progress on, matching the site's other localStorage-driven surfaces.
 */
export function SeriesChapters({ seriesSlug, chapters }: Props) {
  const [progress, setProgress] = useState<Record<string, Progress> | null>(null);

  useEffect(() => {
    const bookmarks = readBookmarks();
    const byKey = new Map(bookmarks.map((b) => [b.key, b]));
    const map: Record<string, Progress> = {};
    for (const c of chapters) {
      const k = keyFor(seriesSlug, c.slug);
      let liked = false;
      try {
        liked = localStorage.getItem(LIKE_PREFIX + k) === "1";
      } catch {
        /* private mode */
      }
      map[c.slug] = {
        percent: byKey.get(k)?.scrollPercent ?? 0,
        liked
      };
    }
    setProgress(map);
  }, [seriesSlug, chapters]);

  const first = chapters[0];

  /* Pick where the CTA should send the reader. */
  const anyProgress =
    progress != null &&
    chapters.some((c) => (progress[c.slug]?.percent ?? 0) >= STARTED);
  const nextUnfinished = chapters.find(
    (c) => (progress?.[c.slug]?.percent ?? 0) < FINISHED
  );
  const ctaTarget = anyProgress ? (nextUnfinished ?? first) : first;
  const ctaLabel = !anyProgress
    ? `Start from chapter ${first ? pad(first.number) : "01"}`
    : nextUnfinished
      ? `Continue · Ch. ${pad(ctaTarget.number)}`
      : `Read again from chapter ${pad(first.number)}`;

  return (
    <>
      {ctaTarget && (
        <div className="mt-8">
          <Link
            href={`/series/${seriesSlug}/${ctaTarget.slug}`}
            className="group inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 font-sans text-sm font-medium text-canvas transition-transform hover:scale-[1.02]"
          >
            {ctaLabel}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-45" />
          </Link>
        </div>
      )}

      <div className="my-14 hairline" aria-hidden="true" />

      <h2 className="font-italic italic text-2xl text-muted md:text-3xl">chapters</h2>
      {chapters.length === 0 ? (
        <p className="mt-6 font-italic italic text-lg text-muted">
          no chapters yet — soon.
        </p>
      ) : (
        <Stagger className="mt-6 max-w-3xl" staggerChildren={0.05}>
          <ol>
            {chapters.map((c) => {
              const p = progress?.[c.slug];
              const percent = p?.percent ?? 0;
              const finished = percent >= FINISHED;
              const inProgress = percent >= STARTED && !finished;
              return (
                <StaggerItem as="li" key={c.slug}>
                  <Link
                    href={`/series/${seriesSlug}/${c.slug}`}
                    className="group block border-t border-border/60 py-5 transition-colors hover:bg-surface/40"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-8">
                      <div className="meta flex items-center gap-2 md:w-24 md:shrink-0">
                        <span>Ch. {pad(c.number)}</span>
                        {finished && (
                          <Check className="h-3 w-3 text-accent" aria-label="Finished" />
                        )}
                        {p?.liked && (
                          <Heart
                            className="h-3 w-3 text-accent"
                            fill="currentColor"
                            aria-label="Liked"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={cn(
                            "font-serif text-xl font-bold leading-snug text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5",
                            finished && "text-muted"
                          )}
                        >
                          {c.title}
                        </div>
                        {c.subtitle && (
                          <div className="mt-1 font-italic italic text-base text-muted">
                            {c.subtitle}
                          </div>
                        )}
                        {inProgress && (
                          <div className="mt-3 max-w-xs space-y-1">
                            <div className="h-0.5 w-full overflow-hidden rounded-full bg-border/70">
                              <div
                                className="h-full bg-accent/80"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <p className="meta">{percent}% in</p>
                          </div>
                        )}
                      </div>
                      <div className="meta md:w-24 md:text-right">
                        {c.readingMinutes} min
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </ol>
        </Stagger>
      )}
    </>
  );
}
