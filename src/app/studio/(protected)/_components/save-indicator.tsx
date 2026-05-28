"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type Props = {
  status: SaveStatus;
  lastSavedAt?: number | null;
  errorMessage?: string;
};

const COLORS: Record<SaveStatus, string> = {
  idle: "bg-whisper",
  saving: "bg-accent",
  saved: "bg-emerald-500",
  error: "bg-red-500"
};

const TOAST_MS = 1500;

function formatRelative(ts: number) {
  const seconds = Math.round((Date.now() - ts) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  return new Date(ts).toLocaleTimeString();
}

function formatExact(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function SaveIndicator({ status, lastSavedAt, errorMessage }: Props) {
  const [flash, setFlash] = useState(false);
  const prevStatus = useRef<SaveStatus>(status);

  useEffect(() => {
    if (prevStatus.current !== "saving" || status !== "saved") {
      prevStatus.current = status;
      return;
    }
    prevStatus.current = status;
    setFlash(true);
    const t = window.setTimeout(() => setFlash(false), TOAST_MS);
    return () => window.clearTimeout(t);
  }, [status]);

  const tooltip =
    status === "saved" && lastSavedAt
      ? `Saved ${formatExact(lastSavedAt)}`
      : undefined;

  return (
    <div className="relative flex items-center gap-2" title={tooltip}>
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-2 w-2 rounded-full",
          COLORS[status],
          status === "saving" && "animate-pulse-soft"
        )}
      />
      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -2 }}
          transition={{ duration: 0.2 }}
          className="meta inline-flex items-center gap-1.5"
        >
          {status === "saving" && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> saving…
            </>
          )}
          {status === "saved" && (
            <>
              <Check className="h-3 w-3" />
              saved{lastSavedAt ? ` · ${formatRelative(lastSavedAt)}` : ""}
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="h-3 w-3 text-red-500" />
              <span className="text-red-600">{errorMessage ?? "save failed"}</span>
            </>
          )}
          {status === "idle" && <span>up to date</span>}
        </motion.span>
      </AnimatePresence>

      <AnimatePresence>
        {flash && (
          <motion.span
            role="status"
            initial={{ opacity: 0, y: -4, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.94 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute -top-9 right-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-meta text-emerald-700 dark:text-emerald-300"
          >
            <Check className="h-3 w-3" />
            saved
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
