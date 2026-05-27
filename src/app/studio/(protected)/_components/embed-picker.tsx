"use client";

import { useEffect, useRef, useState } from "react";
import {
  type EmbedProvider,
  EMBED_PROVIDERS,
  detectProvider,
  toEmbedUrl
} from "./extensions/embed-node";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";

type Props = {
  editor: Editor;
  open: boolean;
  onClose: () => void;
  /** Ref to the trigger button, used for positioning */
  anchorRef: React.RefObject<HTMLButtonElement | null>;
};

export function EmbedPicker({ editor, open, onClose, anchorRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [provider, setProvider] = useState<EmbedProvider>("youtube");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  /* Reset state whenever we open */
  useEffect(() => {
    if (open) {
      setUrl("");
      setError("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [open, onClose]);

  /* Close on click outside */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const panel = panelRef.current;
      const anchor = anchorRef.current;
      if (
        panel &&
        !panel.contains(e.target as Node) &&
        anchor &&
        !anchor.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    /* Delay to avoid catching the opening click */
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose, anchorRef]);

  /* Auto-detect provider when URL is pasted */
  const handleUrlChange = (v: string) => {
    setUrl(v);
    setError("");
    const detected = detectProvider(v);
    if (detected) setProvider(detected);
  };

  const submit = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a URL first.");
      return;
    }

    const embed = toEmbedUrl(provider, trimmed);
    if (!embed) {
      const meta = EMBED_PROVIDERS.find((p) => p.id === provider);
      setError(`Doesn't look like a valid ${meta?.label ?? provider} URL.`);
      return;
    }

    const ok = editor.chain().focus().setEmbed({ provider, url: trimmed }).run();
    if (!ok) {
      setError("Couldn't insert the embed. Try placing your cursor in a paragraph first.");
      return;
    }

    onClose();
  };

  if (!open) return null;

  const currentProvider = EMBED_PROVIDERS.find((p) => p.id === provider);

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute left-0 right-0 z-30 mt-1.5",
        "rounded-xl border border-border/60 bg-canvas p-4 shadow-xl"
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="font-sans text-xs font-medium text-muted uppercase tracking-wider">
          Embed media
        </span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-6 w-6 items-center justify-center rounded text-muted transition-colors hover:text-ink"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Provider pills */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {EMBED_PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setProvider(p.id);
              setError("");
            }}
            className={cn(
              "rounded-md px-2.5 py-1 font-sans text-xs transition-colors",
              provider === p.id
                ? "bg-ink text-canvas"
                : "border border-border/60 text-muted hover:bg-surface hover:text-ink"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* URL input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={currentProvider?.placeholder ?? "Paste URL…"}
          className={cn(
            "flex-1 rounded-md border bg-surface/60 px-3 py-2 font-sans text-sm text-ink",
            "placeholder:text-whisper",
            "focus:outline-none focus:ring-1",
            error
              ? "border-red-400/60 focus:ring-red-400/30"
              : "border-border/60 focus:border-accent/50 focus:ring-accent/30"
          )}
        />
        <button
          type="button"
          onClick={submit}
          className="shrink-0 rounded-md bg-ink px-4 py-2 font-sans text-xs font-medium text-canvas transition-opacity hover:opacity-95"
        >
          Embed
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 font-sans text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
