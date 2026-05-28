"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  /** Stable identifier for this piece. Used as the localStorage key. */
  keyId: string;
};

const LS_PREFIX = "marahuyo:like:";
const BURST_MS = 900;

/**
 * Local-only heart with a CSS-driven burst on activation. The burst is
 * triggered by toggling `data-burst="true"` on the button — the keyframes
 * in globals.css read that attribute, so this component owns no animation
 * mutation, only state.
 */
export function LikeButton({ keyId }: Props) {
  const [mounted, setMounted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bursting, setBursting] = useState(false);

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(LS_PREFIX + keyId) === "1");
    } catch {
      /* private mode, etc. */
    }
    setMounted(true);
  }, [keyId]);

  const toggle = () => {
    const next = !liked;
    setLiked(next);
    try {
      if (next) localStorage.setItem(LS_PREFIX + keyId, "1");
      else localStorage.removeItem(LS_PREFIX + keyId);
    } catch {
      /* swallow */
    }
    if (next) {
      setBursting(true);
      window.setTimeout(() => setBursting(false), BURST_MS);
    }
  };

  const showLiked = mounted && liked;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={showLiked}
      aria-label={showLiked ? "Remove from liked" : "Like this piece"}
      data-burst={bursting ? "true" : undefined}
      className={cn(
        "heart-burst-root relative inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors",
        showLiked ? "text-ink" : "text-whisper hover:text-ink"
      )}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all duration-300",
          bursting && "heart-burst-icon"
        )}
        fill={showLiked ? "currentColor" : "none"}
        strokeWidth={1.5}
      />
    </button>
  );
}
