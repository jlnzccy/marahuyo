"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FeaturedCard } from "@/components/featured-card";
import { workHref } from "@/components/work-row";
import { cn } from "@/lib/cn";
import type { AnyWork } from "@/types/content";

type Props = {
  works: AnyWork[];
  eyebrow?: string;
};

/**
 * Horizontal scroll-snap carousel for the homepage featured rail. Each slide is
 * a full-width FeaturedCard. Native scroll-snap does the heavy lifting (touch +
 * trackpad work for free); prev/next arrows and dots drive it programmatically
 * and the active index is derived from scroll position. No autoplay — it steals
 * focus and fights reduced-motion. Honors prefers-reduced-motion for the scroll
 * behavior. Falls back to a single static card when there's nothing to page.
 */
export function FeaturedCarousel({ works, eyebrow = "featured" }: Props) {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const count = works.length;

  const go = useCallback(
    (to: number) => {
      const track = trackRef.current;
      if (!track) return;
      const next = Math.max(0, Math.min(count - 1, to));
      track.scrollTo({
        left: next * track.clientWidth,
        behavior: reduced ? "auto" : "smooth"
      });
    },
    [count, reduced]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        setIndex((prev) => (prev === i ? prev : i));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (count <= 1) {
    const only = works[0];
    if (!only) return null;
    return <FeaturedCard work={only} href={workHref(only)} eyebrow={eyebrow} />;
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={`${eyebrow} — ${count} works`}
      onKeyDown={onKeyDown}
      className="relative"
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {works.map((work, i) => (
          <div
            key={work.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            className="w-full shrink-0 snap-center"
          >
            <FeaturedCard work={work} href={workHref(work)} eyebrow={eyebrow} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2" role="tablist" aria-label="Choose featured work">
          {works.map((work, i) => (
            <button
              key={work.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to ${work.title}`}
              onClick={() => go(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-6 bg-ink" : "w-1.5 bg-border hover:bg-muted"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous featured work"
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === count - 1}
            aria-label="Next featured work"
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
