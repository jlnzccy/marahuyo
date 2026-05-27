"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Eye, Trash2, Send, Undo2, ChevronLeft } from "lucide-react";
import {
  updateChapter,
  publishChapter,
  unpublishChapter,
  deleteChapter
} from "@/app/studio/(protected)/_actions/works";
import { Editor, type EditorPayload } from "@/app/studio/(protected)/_components/editor";
import { ConfirmDialog } from "@/app/studio/(protected)/_components/confirm-dialog";
import { DatePicker } from "@/app/studio/(protected)/_components/date-picker";
import {
  SaveIndicator,
  type SaveStatus
} from "@/app/studio/(protected)/_components/save-indicator";
import { cn } from "@/lib/cn";
import type { WorkStatus } from "@/types/content";

export type InitialChapter = {
  id: string;
  slug: string;
  seriesId: string;
  seriesSlug: string;
  seriesTitle: string;
  number: number;
  title: string;
  subtitle: string;
  status: WorkStatus;
  body: string;
  poetryMode: boolean;
  wordCount: number;
  readingMinutes: number;
  publishedAt: string | null;
};

const SAVE_DEBOUNCE_MS = 1200;

export function ChapterEditorForm({ initial }: { initial: InitialChapter }) {
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [poetryMode, setPoetryMode] = useState(initial.poetryMode);
  const [customDate, setCustomDate] = useState<string>(
    initial.publishedAt ? initial.publishedAt.slice(0, 10) : ""
  );
  const [dateError, setDateError] = useState<string | undefined>(undefined);
  const [body, setBody] = useState(initial.body);
  const [wordCount, setWordCount] = useState(initial.wordCount);
  const [readingMinutes, setReadingMinutes] = useState(initial.readingMinutes);

  const [status, setStatus] = useState<WorkStatus>(initial.status);
  const [saveState, setSaveState] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | undefined>(undefined);
  const [actionPending, startAction] = useTransition();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didMount = useRef(false);
  const latestSnapshotRef = useRef({
    title: initial.title,
    subtitle: initial.subtitle,
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
      await updateChapter({
        id: initial.id,
        title: snap.title,
        subtitle: snap.subtitle || null,
        body: snap.body,
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

  useEffect(() => {
    latestSnapshotRef.current = {
      title,
      subtitle,
      poetryMode,
      body,
      wordCount,
      readingMinutes,
      customDate
    };
    if (didMount.current) scheduleSave();
    else didMount.current = true;
  }, [title, subtitle, poetryMode, body, wordCount, readingMinutes, customDate, scheduleSave]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        void flushSave();
      }
    };
  }, [flushSave]);

  const handleEditorChange = useCallback((payload: EditorPayload) => {
    setBody(payload.html);
    setWordCount(payload.words);
    setReadingMinutes(payload.readingMinutes);
  }, []);

  const isPublished = status === "published";

  const togglePublish = useCallback(() => {
    startAction(async () => {
      try {
        if (saveTimer.current) {
          clearTimeout(saveTimer.current);
          await flushSave();
        }
        if (isPublished) {
          await unpublishChapter(initial.id);
          setStatus("draft");
        } else {
          await publishChapter(initial.id);
          setStatus("published");
        }
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : String(err));
        setSaveState("error");
      }
    });
  }, [flushSave, initial.id, isPublished]);

  const confirmDelete = useCallback(() => {
    startAction(async () => {
      await deleteChapter(initial.id);
    });
  }, [initial.id]);

  const publicHref = useMemo(
    () => `/series/${initial.seriesSlug}/${initial.slug}`,
    [initial.seriesSlug, initial.slug]
  );

  return (
    <div className="space-y-6">
      <header className="sticky top-16 z-30 -mx-5 border-b border-border/60 bg-canvas/85 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/studio/series/${initial.seriesId}`}
              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface/60 px-2 py-1 font-sans text-xs text-muted hover:bg-surface hover:text-ink"
            >
              <ChevronLeft className="h-3 w-3" /> {initial.seriesTitle}
            </Link>
            <span className="meta">
              ch · {String(initial.number).padStart(2, "0")}
            </span>
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
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={actionPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-400/40 bg-red-500/5 px-2.5 py-1.5 font-sans text-xs text-red-600 transition-colors hover:bg-red-500/10"
            >
              <Trash2 className="h-3 w-3" /> delete
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled chapter"
            className="w-full bg-transparent font-serif text-4xl font-bold leading-tight tracking-tight text-ink placeholder:text-whisper focus:outline-none md:text-5xl"
          />
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="optional epigraph — in which…"
            className="w-full bg-transparent font-italic italic text-xl text-muted placeholder:text-whisper focus:outline-none md:text-2xl"
          />

          <div className="hairline" aria-hidden />

          <Editor
            initialContent={initial.body}
            onChange={handleEditorChange}
            uploadPrefix={`editor/${initial.id}`}
          />
        </div>

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
            <label className="flex items-center gap-2">
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
            <span className="meta">publication date</span>
            <DatePicker
              value={customDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(val) => {
                setDateError(undefined);
                setCustomDate(val);
              }}
            />
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
        title="Delete this chapter?"
        description="The chapter and all its drafts disappear. The series itself stays."
        confirmLabel="Delete chapter"
        pending={actionPending}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
