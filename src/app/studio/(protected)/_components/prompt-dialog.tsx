"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

/**
 * Themed replacement for window.prompt(). Same <dialog> + portal shell
 * as ConfirmDialog, with a controlled text input.
 */
export function PromptDialog({
  open,
  title,
  description,
  placeholder,
  defaultValue = "",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);

  /* Sync the default value whenever the dialog opens */
  useEffect(() => {
    if (open) setValue(defaultValue);
  }, [open, defaultValue]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      /* Auto-focus + select all text after the dialog animation starts */
      requestAnimationFrame(() => inputRef.current?.select());
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handler = (e: Event) => {
      e.preventDefault();
      onCancel();
    };
    dialog.addEventListener("cancel", handler);
    return () => dialog.removeEventListener("cancel", handler);
  }, [onCancel]);

  const submit = () => {
    const trimmed = value.trim();
    onConfirm(trimmed);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <dialog
      ref={ref}
      className="m-auto w-[min(440px,calc(100vw-2rem))] rounded-xl border border-border/60 bg-canvas p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-4 p-6"
      >
        <div className="space-y-1">
          <h2 className="font-serif text-xl font-bold leading-tight">{title}</h2>
          {description && (
            <p className="font-italic italic text-sm text-muted">{description}</p>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-md border border-border/60 bg-surface/60 px-3 py-2 font-sans text-sm text-ink",
            "placeholder:text-whisper",
            "focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
          )}
        />

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-surface/60 px-3 py-1.5 font-sans text-xs text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 font-sans text-xs font-medium text-canvas transition-opacity hover:opacity-95"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </dialog>,
    document.body
  );
}
