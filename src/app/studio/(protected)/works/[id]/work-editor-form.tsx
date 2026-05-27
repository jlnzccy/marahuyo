"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Eye, Trash2, Send, Undo2, ChevronLeft } from "lucide-react";
import {
  updateWork,
  publishWork,
  unpublishWork,
  deleteWork
} from "@/app/studio/(protected)/_actions/works";
import { Editor, type EditorPayload } from "@/app/studio/(protected)/_components/editor";
import { CoverUploader } from "@/app/studio/(protected)/_components/cover-uploader";
import { ConfirmDialog } from "@/app/studio/(protected)/_components/confirm-dialog";
import {
  SaveIndicator,
  type SaveStatus
} from "@/app/studio/(protected)/_components/save-indicator";
import { cn } from "@/lib/cn";
import type { WorkKind, WorkStatus } from "@/types/content";

export type InitialWork = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  kind: WorkKind;
  status: WorkStatus;
  excerpt: string;
  body: string;
  tags: string[];
  coverImage: string;
  poetryMode: boolean;
  wordCount: number;
  readingMinutes: number;
  publishedAt: string | null;
};

const SAVE_DEBOUNCE_MS = 1200;

export function WorkEditorForm({ initial }: { initial: InitialWork }) {
  // ----- Local form state -----
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [tagsText, setTagsText] = useState(initial.tags.join(", "));
  const [coverImage, setCoverImage] = useState(initial.coverImage);
  const [poetryMode, setPoetryMode] = useState(initial.poetryMode);
  const [body, setBody] = useState(initial.body);
  const [wordCount, setWordCount] = useState(initial.wordCount);
  const [readingMinutes, setReadingMinutes] = useState(initial.readingMinutes);
  const [customDate, setCustomDate] = useState<string>(
    initial.publishedAt ? initial.publishedAt.slice(0, 10) : ""
  );
  const [dateError, setDateError] = useState<string | undefined>(undefined);

  // ----- Status + control -----
  const [status, setStatus] = useState<WorkStatus>(initial.status);
  const [saveState, setSaveState] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | undefined>(undefined);
  const [actionPending, startAction] = useTransition();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // ----- Save scheduling -----
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didMount = useRef(false);
  const latestSnapshotRef = useRef({
    title: initial.title,
    subtitle: initial.subtitle,
    excerpt: initial.excerpt,
    tags: initial.tags,
    coverImage: initial.coverImage,
    poetryMode: initial.poetryMode,
    body: initial.body,
    wordCount: initial.wordCount,
    readingMinutes: initial.readingMinutes,
    customDate: initial.publishedAt ? initial.publishedAt.slice(0, 10) : ""
  });

  const flushSave = useCallback(async () => {
    const snap = latestSnapshotRef.current;
    setSaveState("saving");
    setSaveError(undefined);
    try {
      await updateWork({
        id: initial.id,
        title: snap.title,
        subtitle: snap.subtitle || null,
        excerpt: snap.excerpt,
        body: snap.body,
        tags: snap.tags,
        coverImage: snap.coverImage || null,
        poetryMode: snap.poetryMode,
        wordCount: snap.wordCount,
        readingMinutes: snap.readingMinutes,
        publishedAt: snap.customDate ? new Date(snap.customDate).toISOString() : null
      });
      setLastSavedAt(Date.now());
      setSaveState("saved");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
      setSaveState("error");
    }
  }, [initial.id]);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void flushSave();
    }, SAVE_DEBOUNCE_MS);
  }, [flushSave]);

  // Whenever local state changes, update the snapshot + reschedule a save.
  useEffect(() => {
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    latestSnapshotRef.current = {
      title,
      subtitle,
      excerpt,
      tags,
      coverImage,
      poetryMode,
      body,
      wordCount,
      readingMinutes,
      customDate
    };
    // Skip the very first render — there are no real changes yet.
    if (didMount.current) scheduleSave();
    else didMount.current = true;
  }, [
    title,
    subtitle,
    excerpt,
    tagsText,
    coverImage,
    poetryMode,
    body,
    wordCount,
    readingMinutes,
    customDate,
    scheduleSave
  ]);

  // Flush pending saves on unmount so the writer never loses an in-flight change.
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        void flushSave();
      }
    };
  }, [flushSave]);

  // ----- Editor change handler -----
  const handleEditorChange = useCallback((payload: EditorPayload) => {
    setBody(payload.html);
    setWordCount(payload.words);
    setReadingMinutes(payload.readingMinutes);
  }, []);

  // ----- Publish / unpublish / delete -----
  const isPublished = status === "published";

  const togglePublish = useCallback(() => {
    startAction(async () => {
      try {
        // Flush any pending edits first so the published version is current.
        if (saveTimer.current) {
          clearTimeout(saveTimer.current);
          await flushSave();
        }
        if (isPublished) {
          await unpublishWork(initial.id);
          setStatus("draft");
        } else {
          await publishWork(initial.id);
          setStatus("published");
        }
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : String(err));
        setSaveState("error");
      }
    });
  }, [flushSave, initial.id, isPublished]);

  const handleDelete = useCallback(() => {
    setConfirmDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    startAction(async () => {
      await deleteWork(initial.id);
    });
  }, [initial.id]);

  const publicHref = useMemo(() => `/read/${initial.slug}`, [initial.slug]);

  return (
    <div className="space-y-6">
      {/* ---------- Top bar ---------- */}
      <header className="sticky top-16 z-30 -mx-5 border-b border-border/60 bg-canvas/85 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/studio/works"
              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface/60 px-2 py-1 font-sans text-xs text-muted hover:bg-surface hover:text-ink"
            >
              <ChevronLeft className="h-3 w-3" /> back
            </Link>
            <span className="meta">{initial.kind}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-meta",
                isPublished
                  ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                  : "border border-border/60 bg-canvas text-muted"
              )}
            >
              {status}
            </span>
            <SaveIndicator
              status={saveState}
              lastSavedAt={lastSavedAt}
              errorMessage={saveError}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isPublished && (
              <Link
                href={publicHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-surface/60 px-2.5 py-1.5 font-sans text-xs text-muted hover:bg-surface hover:text-ink"
              >
                <Eye className="h-3 w-3" /> view live
              </Link>
            )}
            <button
              type="button"
              onClick={togglePublish}
              disabled={actionPending}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-sans text-xs font-medium transition-opacity",
                isPublished
                  ? "border border-border/60 bg-surface text-ink hover:bg-canvas"
                  : "bg-ink text-canvas hover:opacity-95",
                actionPending && "opacity-60"
              )}
            >
              {isPublished ? (
                <>
                  <Undo2 className="h-3 w-3" /> revert to draft
                </>
              ) : (
                <>
                  <Send className="h-3 w-3" /> publish
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={actionPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-400/40 bg-red-500/5 px-2.5 py-1.5 font-sans text-xs text-red-600 transition-colors hover:bg-red-500/10"
            >
              <Trash2 className="h-3 w-3" /> delete
            </button>
          </div>
        </div>
      </header>

      {/* ---------- Body ---------- */}
      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* Editor column */}
        <div className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent font-serif text-4xl font-bold leading-tight tracking-tight text-ink placeholder:text-whisper focus:outline-none md:text-5xl"
          />
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="optional epigraph — a quiet line before the work"
            className="w-full bg-transparent font-italic italic text-xl text-muted placeholder:text-whisper focus:outline-none md:text-2xl"
          />

          <div className="hairline" aria-hidden />

          <Editor initialContent={initial.body} onChange={handleEditorChange} />
        </div>

        {/* Meta sidebar */}
        <aside className="space-y-6">
          <section className="space-y-3 rounded-xl border border-border/60 bg-surface/40 p-4">
            <p className="meta">stats</p>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              <div>
                <div className="text-2xl font-medium text-ink">{wordCount.toLocaleString()}</div>
                <div className="meta">words</div>
              </div>
              <div>
                <div className="text-2xl font-medium text-ink">{readingMinutes}</div>
                <div className="meta">min read</div>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border/60 bg-surface/40 p-4">
            <label className="block">
              <span className="meta">excerpt</span>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={4}
                placeholder="a short line shown on cards and the archive"
                className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-2 font-serif text-sm text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="meta">tags (comma-separated)</span>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="essay, memory, manila"
                className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-1.5 font-mono text-xs text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
              />
            </label>

            <CoverUploader
              workId={initial.id}
              value={coverImage}
              onChange={setCoverImage}
            />

            <label className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={poetryMode}
                onChange={(e) => setPoetryMode(e.target.checked)}
                className="h-3.5 w-3.5 accent-ink"
              />
              <span className="font-sans text-sm text-muted">
                Poetry mode (preserves all whitespace)
              </span>
            </label>
          </section>

          <section className="space-y-2 rounded-xl border border-border/60 bg-surface/40 p-4">
            <label className="block">
              <span className="meta">publication date</span>
              <input
                type="date"
                value={customDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && val > new Date().toISOString().slice(0, 10)) {
                    setDateError("Date cannot be in the future.");
                    return;
                  }
                  setDateError(undefined);
                  setCustomDate(val);
                }}
                className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-1.5 font-mono text-xs text-ink focus:border-accent focus:outline-none"
              />
            </label>
            {dateError && (
              <p className="font-sans text-xs text-red-600">{dateError}</p>
            )}
            <p className="font-sans text-xs text-whisper">
              leave empty to auto-set when published
            </p>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        tone="danger"
        title="Delete this work?"
        description="This can’t be undone. Chapters and all attached covers go with it."
        confirmLabel="Delete forever"
        pending={actionPending}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
