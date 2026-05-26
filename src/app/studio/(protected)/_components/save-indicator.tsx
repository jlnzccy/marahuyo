"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertCircle } from "lucide-react";
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

function formatRelative(ts: number) {
  const seconds = Math.round((Date.now() - ts) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  return new Date(ts).toLocaleTimeString();
}

export function SaveIndicator({ status, lastSavedAt, errorMessage }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
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
    </div>
  );
}
