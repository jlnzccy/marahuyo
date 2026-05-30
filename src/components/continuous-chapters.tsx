"use client";

import { useEffect, useRef, useState } from "react";
import { useAppShell } from "@/lib/use-app-context";
import { recordVisit } from "@/lib/bookmarks";

type Loaded = {
  slug: string;
  number: number;
  title: string;
  subtitle: string | null;
  eyebrow: string;
  meta: string;
  html: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Continuous (Wattpad-style) reading for series chapters: as the reader nears
 * the end of the current chapter, the next chapter's body is fetched and
 * appended inline, chaining onward. App-only — the web keeps the prev/next
 * foot cards. As each appended chapter scrolls into view it updates the URL
 * and the "continue reading" shelf.
 */
export function ContinuousChapters({
  seriesSlug,
  seriesTitle,
  firstNextSlug,
  currentSlug,
}: {
  seriesSlug: string;
  seriesTitle: string;
  firstNextSlug: string | null;
  currentSlug: string;
}) {
  const isApp = useAppShell();
  const [loaded, setLoaded] = useState<Loaded[]>([]);
  const [nextSlug, setNextSlug] = useState<string | null>(firstNextSlug);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when the underlying chapter changes (hard navigation to a new one).
  useEffect(() => {
    setLoaded([]);
    setNextSlug(firstNextSlug);
  }, [firstNextSlug, currentSlug]);

  useEffect(() => {
    if (!isApp) return;
    const el = sentinelRef.current;
    if (!el || !nextSlug) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (loadingRef.current || !nextSlug) return;
        loadingRef.current = true;
        fetch(`/api/reader/${seriesSlug}/${nextSlug}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.ok) {
              setLoaded((prev) => [...prev, data as Loaded]);
              setNextSlug(data.nextSlug ?? null);
            } else {
              setNextSlug(null);
            }
          })
          .catch(() => {
            /* leave nextSlug set so a later scroll retries */
          })
          .finally(() => {
            loadingRef.current = false;
          });
      },
      { rootMargin: "800px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isApp, nextSlug, seriesSlug]);

  if (!isApp) return null;

  return (
    <>
      {loaded.map((ch) => (
        <ContinuedChapter
          key={ch.slug}
          ch={ch}
          seriesSlug={seriesSlug}
          seriesTitle={seriesTitle}
        />
      ))}

      {nextSlug ? (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className="flex h-16 items-center justify-center"
        >
          <span className="meta animate-pulse">loading next chapter…</span>
        </div>
      ) : (
        loaded.length > 0 && (
          <p className="mt-16 text-center font-italic italic text-lg text-muted">
            the end — for now.
          </p>
        )
      )}
    </>
  );
}

function ContinuedChapter({
  ch,
  seriesSlug,
  seriesTitle,
}: {
  ch: Loaded;
  seriesSlug: string;
  seriesTitle: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        const url = `/series/${seriesSlug}/${ch.slug}`;
        if (window.location.pathname !== url) {
          window.history.replaceState(null, "", url);
        }
        recordVisit({
          key: `series/${seriesSlug}/${ch.slug}`,
          href: url,
          title: `${ch.title} — ${seriesTitle}`,
          kind: "series",
          subtitle: ch.subtitle ?? undefined,
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ch, seriesSlug, seriesTitle]);

  return (
    <section ref={ref} aria-label={`Chapter ${ch.number}: ${ch.title}`}>
      <div className="my-16 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-border/60" />
        <span className="meta">Ch. {pad(ch.number)}</span>
        <span className="h-px flex-1 bg-border/60" />
      </div>

      <p className="meta mb-3">{ch.eyebrow}</p>
      <h2 className="mb-2 font-serif text-3xl font-bold leading-tight text-ink">
        {ch.title}
      </h2>
      {ch.subtitle && (
        <p className="mb-8 font-italic text-lg italic text-muted">{ch.subtitle}</p>
      )}

      <article
        className="reader-prose"
        dangerouslySetInnerHTML={{ __html: ch.html }}
      />
    </section>
  );
}
