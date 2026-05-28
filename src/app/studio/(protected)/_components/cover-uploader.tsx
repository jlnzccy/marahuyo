"use client";

import { useCallback } from "react";
import { ImageIcon, UploadCloud, X } from "lucide-react";
import { uploadCover } from "@/app/studio/(protected)/_actions/works";
import { cn } from "@/lib/cn";
import { useUploader } from "./use-uploader";

type Props = {
  workId: string;
  /** Current cover URL (DB or freshly uploaded). */
  value: string;
  /** Called whenever the URL changes (upload success, manual edit, or clear). */
  onChange: (url: string) => void;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";

export function CoverUploader({ workId, value, onChange }: Props) {
  const formFields = useCallback(() => ({ workId }), [workId]);
  const u = useUploader({ upload: uploadCover, formFields, onChange });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="meta">cover image</span>
        {value && !u.isUploading && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-meta text-muted hover:text-red-600"
          >
            <X className="h-3 w-3" /> clear
          </button>
        )}
      </div>

      {value && !u.isUploading && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Cover preview"
          className="aspect-[4/3] w-full rounded-md border border-border/60 object-cover"
        />
      )}

      <div
        onDragOver={u.onDragOver}
        onDragLeave={u.onDragLeave}
        onDrop={u.onDrop}
        onClick={() => u.inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            u.inputRef.current?.click();
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-3 py-5 text-center transition-colors",
          u.isDragging
            ? "border-accent bg-accent/5 text-ink"
            : "border-border/70 bg-canvas text-muted hover:bg-surface/60",
          u.isUploading && "pointer-events-none opacity-70"
        )}
      >
        {u.isUploading ? (
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
          ref={u.inputRef}
          type="file"
          accept={ACCEPT}
          onChange={u.onPick}
          className="hidden"
        />
      </div>

      {u.error && (
        <p className="rounded-md border border-red-400/40 bg-red-500/5 px-2 py-1.5 font-sans text-xs text-red-600">
          {u.error}
        </p>
      )}

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
    </div>
  );
}
