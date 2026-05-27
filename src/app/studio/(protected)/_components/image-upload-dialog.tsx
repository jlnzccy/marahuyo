"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImageIcon, UploadCloud } from "lucide-react";
import { uploadStudioImage } from "@/app/studio/(protected)/_actions/works";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  /** Path prefix under the `covers` bucket. e.g. "editor/<workId>". */
  prefix: string;
  /** Fires with the public URL once upload (or paste) succeeds. */
  onConfirm: (url: string) => void;
  onCancel: () => void;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";

export function ImageUploadDialog({ open, prefix, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState("");

  /* Reset state whenever we open */
  useEffect(() => {
    if (open) {
      setError(null);
      setUploading(false);
      setUrlValue("");
    }
  }, [open]);

  /* Toggle the native modal */
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  /* Esc + backdrop close */
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

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const form = new FormData();
        form.set("prefix", prefix);
        form.set("file", file);
        const result = await uploadStudioImage(form);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onConfirm(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setUploading(false);
      }
    },
    [prefix, onConfirm]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void upload(file);
    },
    [upload]
  );

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void upload(file);
      e.target.value = "";
    },
    [upload]
  );

  const submitUrl = () => {
    const trimmed = urlValue.trim();
    if (!trimmed) {
      setError("Paste a URL or pick a file.");
      return;
    }
    onConfirm(trimmed);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <dialog
      ref={ref}
      className="m-auto w-[min(480px,calc(100vw-2rem))] rounded-xl border border-border/60 bg-canvas p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <div className="space-y-4 p-6">
        <div className="space-y-1">
          <h2 className="font-serif text-xl font-bold leading-tight">Insert image</h2>
          <p className="font-italic italic text-sm text-muted">
            Upload from your device, or paste an existing URL.
          </p>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-3 py-8 text-center transition-colors",
            isDragging
              ? "border-accent bg-accent/5 text-ink"
              : "border-border/70 bg-surface/40 text-muted hover:bg-surface/60",
            isUploading && "pointer-events-none opacity-70"
          )}
        >
          {isUploading ? (
            <>
              <UploadCloud className="h-5 w-5 animate-pulse" />
              <span className="font-sans text-xs">uploading…</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-5 w-5" />
              <span className="font-sans text-xs">drop image or click to upload</span>
              <span className="font-mono text-[10px] text-whisper">
                jpg · png · webp · avif · gif — max 5MB
              </span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={onPick}
            className="hidden"
          />
        </div>

        {error && (
          <p className="rounded-md border border-red-400/40 bg-red-500/5 px-2 py-1.5 font-sans text-xs text-red-600">
            {error}
          </p>
        )}

        {/* URL fallback */}
        <details className="group">
          <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-meta text-muted hover:text-ink">
            or paste a URL
          </summary>
          <div className="mt-2 flex gap-2">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitUrl();
                }
              }}
              placeholder="https://…"
              className="flex-1 rounded-md border border-border/80 bg-canvas px-3 py-1.5 font-mono text-xs text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={submitUrl}
              className="shrink-0 rounded-md border border-border/60 bg-surface/60 px-3 py-1.5 font-sans text-xs text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              Insert
            </button>
          </div>
        </details>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-surface/60 px-3 py-1.5 font-sans text-xs text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>,
    document.body
  );
}
