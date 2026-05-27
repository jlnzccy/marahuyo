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
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Lightweight modal confirm built on the native <dialog> element so focus
 * trap, ESC-to-close, and inert-scroll-lock come for free. Renders into
 * document.body via a portal to escape stacking contexts.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  pending = false,
  onConfirm,
  onCancel
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
      if (!pending) onCancel();
    };
    dialog.addEventListener("cancel", handler);
    return () => dialog.removeEventListener("cancel", handler);
  }, [onCancel, pending]);

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
              <p className="font-italic italic text-sm text-muted">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-surface/60 px-3 py-1.5 font-sans text-xs text-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-sans text-xs font-medium transition-opacity disabled:opacity-60",
              tone === "danger"
                ? "bg-red-600 text-white hover:opacity-90"
                : "bg-ink text-canvas hover:opacity-95"
            )}
          >
            {pending ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>,
    document.body
  );
}
