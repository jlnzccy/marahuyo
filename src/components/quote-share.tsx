"use client";

import { useEffect, useRef, useState } from "react";
import { Quote, Check } from "lucide-react";
import { hapticLight } from "@/lib/native";

type Props = {
  title: string;
  author?: string;
};

type Anchor = { text: string; x: number; y: number; place: "above" | "below" };

const FEEDBACK_MS = 1600;
const MAX_QUOTE = 400;

/**
 * Select text inside `.reader-prose` → a small "Share quote" button appears
 * over the selection. Click builds a styled, attributed quote and hands it to
 * `navigator.share` (mobile sheet) or the clipboard, mirroring ShareButton's
 * copied/shared feedback. Image-card generation is intentionally out of scope.
 *
 * The button suppresses its own mousedown so clicking it doesn't collapse the
 * selection before the click lands.
 */
export function QuoteShare({ title, author }: Props) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [feedback, setFeedback] = useState<"copied" | "shared" | null>(null);
  /* While a confirmation is showing, freeze the selection listeners so the
     pill doesn't flicker away mid-flash. */
  const busy = useRef(false);

  useEffect(() => {
    const read = () => {
      if (busy.current) return;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setAnchor(null);
        return;
      }
      const text = selection.toString().replace(/\s+/g, " ").trim();
      if (text.length < 2) {
        setAnchor(null);
        return;
      }
      const root = document.querySelector(".reader-prose");
      const a = selection.anchorNode;
      const f = selection.focusNode;
      if (!root || !a || !f || !root.contains(a) || !root.contains(f)) {
        setAnchor(null);
        return;
      }
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setAnchor(null);
        return;
      }
      const x = Math.min(
        Math.max(rect.left + rect.width / 2, 80),
        window.innerWidth - 80
      );
      const place = rect.top < 72 ? "below" : "above";
      setAnchor({ text, x, y: place === "above" ? rect.top : rect.bottom, place });
    };

    const onSelectionChange = () => {
      if (busy.current) return;
      const s = window.getSelection();
      if (!s || s.isCollapsed) setAnchor(null);
    };
    const hide = () => {
      if (!busy.current) setAnchor(null);
    };

    document.addEventListener("mouseup", read);
    document.addEventListener("touchend", read);
    document.addEventListener("keyup", read);
    document.addEventListener("selectionchange", onSelectionChange);
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide);
    return () => {
      document.removeEventListener("mouseup", read);
      document.removeEventListener("touchend", read);
      document.removeEventListener("keyup", read);
      document.removeEventListener("selectionchange", onSelectionChange);
      window.removeEventListener("scroll", hide);
      window.removeEventListener("resize", hide);
    };
  }, []);

  if (!anchor) return null;

  const flash = (kind: "copied" | "shared") => {
    busy.current = true;
    setFeedback(kind);
    window.setTimeout(() => {
      busy.current = false;
      setFeedback(null);
      setAnchor(null);
    }, FEEDBACK_MS);
  };

  const share = async () => {
    void hapticLight();
    const clipped =
      anchor.text.length > MAX_QUOTE
        ? anchor.text.slice(0, MAX_QUOTE).trimEnd() + "…"
        : anchor.text;
    const attribution = author ? `${title}, ${author}` : title;
    const quote = `“${clipped}” — ${attribution}`;
    const url = window.location.href;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: quote, url });
        flash("shared");
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        /* fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(`${quote}\n${url}`);
      flash("copied");
    } catch {
      try {
        window.prompt("Copy this quote:", `${quote}\n${url}`);
      } catch {
        /* swallow */
      }
    }
  };

  return (
    <div
      className="no-print pointer-events-none fixed z-40"
      style={{
        left: anchor.x,
        top: anchor.y,
        transform:
          anchor.place === "above"
            ? "translate(-50%, -130%)"
            : "translate(-50%, 35%)"
      }}
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={share}
        aria-label="Share the selected quote"
        className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-ink py-1.5 pl-3 pr-3.5 font-sans text-xs font-medium text-canvas shadow-[0_8px_24px_-12px_rgba(0,0,0,0.55)] transition-transform hover:scale-[1.03]"
      >
        {feedback ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Quote className="h-3.5 w-3.5 text-canvas/70" />
        )}
        {feedback === "copied"
          ? "Copied"
          : feedback === "shared"
            ? "Shared"
            : "Share quote"}
      </button>
    </div>
  );
}
