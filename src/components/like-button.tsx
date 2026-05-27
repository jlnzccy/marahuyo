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
 * Local-only heart with a mojs-style burst on activation.
 * - Idle: outlined heart, whisper tone.
 * - Click → liked: red particle burst, scale-curve, color settles to ink black.
 * - Click → unliked: instant fade back to outlined whisper (no burst).
 * State persists in localStorage but is not shared across devices.
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

  /* Server / pre-hydrate render uses the outlined state so SSR & CSR agree. */
  const showLiked = mounted && liked;

  /* 10 burst particles arranged radially. Alternating tints for depth. */
  const particles = Array.from({ length: 10 }, (_, i) => i);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={showLiked}
      aria-label={showLiked ? "Remove from liked" : "Like this piece"}
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors",
        showLiked ? "text-ink" : "text-whisper hover:text-ink"
      )}
    >
      {/* Particle ring — only mounted during burst */}
      {bursting && (
        <span aria-hidden className="pointer-events-none absolute inset-0">
          {particles.map((i) => {
            const angle = (i / particles.length) * 360;
            const radius = 28 + (i % 2) * 6;
            const color = i % 2 === 0 ? "rgb(239,68,68)" : "rgb(252,165,165)";
            return (
              <span
                key={i}
                className="heart-particle"
                style={
                  {
                    background: color,
                    ["--a" as string]: `${angle}deg`,
                    ["--r" as string]: `${radius}px`
                  } as React.CSSProperties
                }
              />
            );
          })}
        </span>
      )}

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
