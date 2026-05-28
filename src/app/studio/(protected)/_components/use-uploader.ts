"use client";

import { useCallback, useRef, useState } from "react";

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

type Args = {
  /** Server action that takes a FormData and returns an UploadResult. */
  upload: (form: FormData) => Promise<UploadResult>;
  /** Extra FormData fields added per call (e.g. workId / prefix). */
  formFields: () => Record<string, string>;
  /** Called whenever the URL changes (upload success, manual edit, or clear). */
  onChange: (url: string) => void;
};

export type UseUploader = ReturnType<typeof useUploader>;

/**
 * Shared upload state machine for CoverUploader + ImageUploader.
 * Owns: drag-state, in-progress flag, error surface, file→server submit.
 */
export function useUploader({ upload, formFields, onChange }: Args) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const form = new FormData();
        for (const [k, v] of Object.entries(formFields())) form.set(k, v);
        form.set("file", file);
        const result = await upload(form);
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
    [upload, formFields, onChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void submit(file);
    },
    [submit]
  );

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void submit(file);
      e.target.value = "";
    },
    [submit]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  return {
    inputRef,
    isDragging,
    isUploading,
    error,
    onDrop,
    onPick,
    onDragOver,
    onDragLeave
  };
}
