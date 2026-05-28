"use client";

import { LikeButton } from "@/components/like-button";
import { ShareButton } from "@/components/share-button";

type Props = {
  title: string;
  subtitle?: string;
  /** Stable id for the localStorage like-toggle. Omit to hide the heart. */
  likeKey?: string;
};

/**
 * Floating like + share rail. On desktop it docks to the left edge as a
 * vertical pill alongside the prose; on mobile it sticks to the bottom-center
 * as a horizontal pill. Hidden in print to keep paper output clean.
 *
 * Lives outside the prose flow so the reader's eye isn't pulled away from
 * the closing lines of a piece, but stays in reach while scrolling.
 */
export function ReaderActions({ title, subtitle, likeKey }: Props) {
  return (
    <div
      className="reader-actions no-print pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center lg:inset-x-auto lg:left-4 lg:top-1/2 lg:-translate-y-1/2 lg:bottom-auto lg:justify-start xl:left-8"
      aria-label="Reader actions"
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border/60 bg-surface/90 px-1.5 py-1 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.35)] backdrop-blur lg:flex-col lg:gap-2 lg:px-1 lg:py-2">
        {likeKey && <LikeButton keyId={likeKey} />}
        <ShareButton title={title} text={subtitle} />
      </div>
    </div>
  );
}
