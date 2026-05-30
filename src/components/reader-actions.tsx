"use client";

import { useEffect, useState } from "react";
import { LikeButton } from "@/components/like-button";
import { ShareButton } from "@/components/share-button";
import { useAppShell } from "@/lib/use-app-context";
import { cn } from "@/lib/cn";

type Props = {
  title: string;
  subtitle?: string;
  /** Stable id for the localStorage like-toggle. Omit to hide the heart. */
  likeKey?: string;
  /** True on series chapters — there the reader chrome owns like/share, so this
   *  rail stays out of the way entirely. */
  seriesMode?: boolean;
};

/**
 * Like + share rail. On the web it's the familiar always-present floating pill
 * (bottom-center on mobile, docked left on desktop). In the app on a standalone
 * read it hides during reading and reveals on a tap or once you reach the very
 * bottom of the piece; on a series chapter it yields to the reader chrome.
 */
export function ReaderActions({ title, subtitle, likeKey, seriesMode }: Props) {
  const isApp = useAppShell();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!isApp || seriesMode) return;

    const syncBottom = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80;
      if (nearBottom) setRevealed(true);
    };
    const onTap = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        el?.closest(
          "a,button,input,textarea,select,label,[role='button'],.marginalia,.marginalia-marker"
        )
      )
        return;
      if ((window.getSelection?.()?.toString().length ?? 0) > 0) return;
      setRevealed((v) => !v);
    };

    window.addEventListener("scroll", syncBottom, { passive: true });
    document.addEventListener("click", onTap);
    syncBottom();
    return () => {
      window.removeEventListener("scroll", syncBottom);
      document.removeEventListener("click", onTap);
    };
  }, [isApp, seriesMode]);

  // Series chapters: the reader chrome carries like/share instead.
  if (isApp && seriesMode) return null;

  const hidden = isApp && !revealed;

  return (
    <div
      className={cn(
        "reader-actions no-print pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center transition-all duration-300 lg:inset-x-auto lg:left-4 lg:top-1/2 lg:-translate-y-1/2 lg:bottom-auto lg:justify-start xl:left-8",
        hidden && "translate-y-6 opacity-0"
      )}
      aria-label="Reader actions"
      aria-hidden={hidden}
    >
      <div
        className={cn(
          "flex items-center gap-1 rounded-full border border-border/60 bg-surface/90 px-1.5 py-1 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.3)] backdrop-blur lg:flex-col lg:gap-2 lg:px-1 lg:py-2",
          hidden ? "pointer-events-none" : "pointer-events-auto"
        )}
      >
        {likeKey && <LikeButton keyId={likeKey} />}
        <ShareButton title={title} text={subtitle} />
      </div>
    </div>
  );
}
