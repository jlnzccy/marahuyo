"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Lock } from "lucide-react";
import { ReadingSettings } from "@/components/reading-settings";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/colophon", label: "Colophon" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Slide-up sheet behind the bottom nav's "More" tab. Holds the reading
 * controls (temperature + text size), secondary links, and a discreet Studio
 * entry.
 */
export function MoreSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("overflow-hidden");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="more-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-sm md:hidden"
        >
          <motion.div
            key="more-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="More"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border/60",
              "bg-canvas/95 backdrop-blur-2xl",
              "shadow-[0_-12px_36px_-24px_rgba(0,0,0,0.18)]",
              "pb-[max(env(safe-area-inset-bottom),1rem)]"
            )}
          >
            <div className="flex justify-center pt-3">
              <span
                aria-hidden="true"
                className="h-1 w-10 rounded-full bg-border"
              />
            </div>

            <div className="flex items-center justify-between px-6 pt-4">
              <p className="meta">reading room</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-whisper transition-colors hover:bg-border/40 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pt-4">
              <ReadingSettings />
            </div>

            <nav
              aria-label="More navigation"
              className="mt-2 flex flex-col px-3 pb-3 pt-2"
            >
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={onClose}
                  className="rounded-xl px-3 py-3 font-sans text-base text-ink transition-colors hover:bg-border/30"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="mx-6 border-t border-border/60 pb-1 pt-2">
              <Link
                href="/studio"
                onClick={onClose}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-sans text-sm text-muted transition-colors hover:bg-border/30 hover:text-ink"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Studio
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
