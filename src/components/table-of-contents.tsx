"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TocHeading } from "@/lib/toc";
import { cn } from "@/lib/cn";

type Props = {
  headings: TocHeading[];
};

/**
 * Sticky sidebar on desktop, collapsible details element on mobile. Listens
 * to scroll position via IntersectionObserver and highlights whichever
 * heading is currently in the upper half of the viewport.
 *
 * Hidden entirely (returns null) when fewer than 2 headings — a single h2
 * isn't worth a TOC.
 */
export function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string | null>(
    headings[0]?.id ?? null
  );

  useEffect(() => {
    if (headings.length === 0) return;
    const ids = headings.map((h) => h.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    /* Track each heading's most recent intersection ratio and pick the one
       closest to the top of the viewport. */
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.intersectionRatio);
        }
        let best: { id: string; ratio: number; top: number } | null = null;
        for (const el of elements) {
          const ratio = ratios.get(el.id) ?? 0;
          if (ratio <= 0) continue;
          const top = el.getBoundingClientRect().top;
          if (!best || top < best.top) best = { id: el.id, ratio, top };
        }
        if (best) setActiveId(best.id);
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <>
      {/* Mobile: collapsible block above the prose. */}
      <details className="my-8 rounded-lg border border-border/60 bg-surface/40 px-4 py-3 lg:hidden">
        <summary className="flex cursor-pointer items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-meta text-muted [&::-webkit-details-marker]:hidden">
          <span>Contents</span>
          <ChevronDown
            className="h-3 w-3 transition-transform [details[open]_&]:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <ol className="mt-3 space-y-1.5 border-l border-border/60 pl-3">
          {headings.map((h) => (
            <TocItem
              key={h.id}
              heading={h}
              active={h.id === activeId}
              setActive={setActiveId}
            />
          ))}
        </ol>
      </details>

      {/* Desktop: sticky sidebar offset to the right of the prose. */}
      <nav
        aria-label="Table of contents"
        className="hidden lg:fixed lg:top-32 lg:right-[max(1.5rem,calc((100vw-880px)/2-260px))] lg:block lg:w-[220px]"
      >
        <p className="meta mb-3">Contents</p>
        <ol className="space-y-1.5 border-l border-border/60 pl-3">
          {headings.map((h) => (
            <TocItem
              key={h.id}
              heading={h}
              active={h.id === activeId}
              setActive={setActiveId}
            />
          ))}
        </ol>
      </nav>
    </>
  );
}

function TocItem({
  heading,
  active,
  setActive
}: {
  heading: TocHeading;
  active: boolean;
  setActive: (id: string) => void;
}) {
  return (
    <li className={cn(heading.level === 3 && "pl-3")}>
      <a
        href={`#${heading.id}`}
        onClick={() => setActive(heading.id)}
        aria-current={active ? "location" : undefined}
        className={cn(
          "block truncate font-sans text-xs leading-snug transition-colors",
          active
            ? "text-ink"
            : heading.level === 2
              ? "text-muted hover:text-ink"
              : "text-whisper hover:text-ink"
        )}
      >
        {heading.text}
      </a>
    </li>
  );
}
