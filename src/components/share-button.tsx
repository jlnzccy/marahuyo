"use client";

import { useEffect, useState } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  title: string;
  text?: string;
};

const FEEDBACK_MS = 1500;

/**
 * Tries `navigator.share` first (mobile-native sheet). Falls back to copying
 * the current page URL to the clipboard, then shows a transient "copied"
 * pill. The URL is read at click time from `window.location.href` so this
 * component doesn't need to know about routing.
 */
export function ShareButton({ title, text }: Props) {
  const [mounted, setMounted] = useState(false);
  const [feedback, setFeedback] = useState<"copied" | "shared" | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function"
    );
  }, []);

  const flash = (kind: "copied" | "shared") => {
    setFeedback(kind);
    window.setTimeout(() => setFeedback(null), FEEDBACK_MS);
  };

  const handle = async () => {
    const url = window.location.href;
    if (canNativeShare) {
      try {
        await navigator.share({ title, text, url });
        flash("shared");
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        /* fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      flash("copied");
    } catch {
      /* clipboard blocked — last-ditch prompt */
      try {
        window.prompt("Copy this link:", url);
      } catch {
        /* swallow */
      }
    }
  };

  /* Render-stable on server: icon only, no aria-live flicker. */
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Share this piece"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-whisper transition-colors hover:text-ink"
      >
        <Share2 className="h-5 w-5" strokeWidth={1.5} />
      </button>
    );
  }

  const Icon = feedback === "copied" || feedback === "shared" ? Check : canNativeShare ? Share2 : Link2;
  const label =
    feedback === "copied"
      ? "Link copied"
      : feedback === "shared"
        ? "Shared"
        : canNativeShare
          ? "Share this piece"
          : "Copy link";

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={label}
      className={cn(
        "relative inline-flex h-11 items-center justify-center rounded-full px-3 text-whisper transition-colors hover:text-ink",
        feedback && "text-ink"
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} />
      {feedback && (
        <span className="ml-2 font-mono text-[10px] uppercase tracking-meta">
          {feedback === "copied" ? "copied" : "shared"}
        </span>
      )}
    </button>
  );
}
