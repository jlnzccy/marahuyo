"use client";

import { useCallback, useRef, useState } from "react";
import { ImageIcon, UploadCloud, X } from "lucide-react";
import { uploadStudioImage } from "@/app/studio/(protected)/_actions/works";
import { cn } from "@/lib/cn";

type Props = {
  /** Storage path prefix under the `covers` bucket. e.g. "portrait" or "embeds". */
  prefix: string;
  label?: string;
  /** Current image URL (DB or freshly uploaded). */
  value: string;
  /** Called whenever the URL changes (upload success, manual edit, or clear). */
  onChange: (url: string) => void;
  /** Aspect ratio for the preview. Defaults to 4/3 — pass "aspect-[4/5]" for portrait. */
  previewAspect?: string;
  /** Show the inline "or paste a URL" fallback. Defaults to true. */
  allowUrlFallback?: boolean;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";

export function ImageUploader({
  prefix,
  label = "image",
  value,
  onChange,
  previewAspect = "aspect-[4/3]",
  allowUrlFallback = true
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        onChange(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setUploading(false);
      }
    },
    [prefix, onChange]
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="meta">{label}</span>
        {value && !isUploading && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-meta text-muted hover:text-red-600"
          >
            <X className="h-3 w-3" /> clear
          </button>
        )}
      </div>

      {value && !isUploading && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt={`${label} preview`}
          className={cn(
            "w-full rounded-md border border-border/60 object-cover",
            previewAspect
          )}
        />
      )}

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
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-3 py-5 text-center transition-colors",
          isDragging
            ? "border-accent bg-accent/5 text-ink"
            : "border-border/70 bg-canvas text-muted hover:bg-surface/60",
          isUploading && "pointer-events-none opacity-70"
        )}
      >
        {isUploading ? (
          <>
            <UploadCloud className="h-4 w-4 animate-pulse" />
            <span className="font-sans text-xs">uploading…</span>
          </>
        ) : value ? (
          <>
            <ImageIcon className="h-4 w-4" />
            <span className="font-sans text-xs">drop or click to replace</span>
          </>
        ) : (
          <>
            <UploadCloud className="h-4 w-4" />
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

      {allowUrlFallback && (
        <details className="group">
          <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-meta text-muted hover:text-ink">
            or paste a URL
          </summary>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-1.5 font-mono text-xs text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
          />
        </details>
      )}
    </div>
  );
}
