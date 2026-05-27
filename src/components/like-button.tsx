"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  /** Stable identifier for this piece. Used as the localStorage key. */
  keyId: string;
};

const LS_PREFIX = "marahuyo:like:";

/**
 * Local-only heart. Persists across reloads via localStorage but is not
 * shared across devices. No DB write. Visual: outlined heart when un-liked,
 * filled (accent) heart with subtle bloom when liked.
 */
export function LikeButton({ keyId }: Props) {
  const [mounted, setMounted] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(LS_PREFIX + keyId) === "1");
    } catch {
      /* private mode, etc. — leave as false */
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
  };

  /* Server / pre-hydrate render uses the outlined state so SSR & CSR agree. */
  const showLiked = mounted && liked;

  return (
    <div className="mt-10 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={showLiked}
        aria-label={showLiked ? "Remove from liked" : "Like this piece"}
        className={cn(
          "group inline-flex h-12 w-12 items-center justify-center rounded-full border transition-all",
          showLiked
            ? "border-accent/50 bg-accent/10 text-accent"
            : "border-border/60 bg-surface/40 text-muted hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
        )}
      >
        <Heart
          className={cn(
            "h-5 w-5 transition-transform duration-300",
            showLiked && "scale-110",
            "group-active:scale-90"
          )}
          fill={showLiked ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      </button>
      <span className="meta">
        {showLiked ? "you loved this" : "leave a heart"}
      </span>
    </div>
  );
}
