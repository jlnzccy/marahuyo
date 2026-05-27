"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "danger" | "default";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  tone?: Tone;
  closeLabel?: string;
  onClose: () => void;
};

/**
 * Themed replacement for window.alert(). Shows a message with a single
 * dismiss button. Uses the same <dialog> + portal shell as ConfirmDialog.
 */
export function AlertDialog({
  open,
  title,
  description,
  tone = "default",
  closeLabel = "OK",
  onClose
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handler = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", handler);
    return () => dialog.removeEventListener("cancel", handler);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <dialog
      ref={ref}
      className="m-auto w-[min(440px,calc(100vw-2rem))] rounded-xl border border-border/60 bg-canvas p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <div className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          {tone === "danger" && (
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
          )}
          <div className="flex-1 space-y-1">
            <h2 className="font-serif text-xl font-bold leading-tight">{title}</h2>
            {description && (
              <p className={cn(
                "text-sm",
                tone === "danger" ? "text-red-700" : "font-italic italic text-muted"
              )}>
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-sans text-xs font-medium transition-opacity",
              tone === "danger"
                ? "bg-red-600 text-white hover:opacity-90"
                : "bg-ink text-canvas hover:opacity-95"
            )}
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </dialog>,
    document.body
  );
}
