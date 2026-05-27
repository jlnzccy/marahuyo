"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Eye,
  Trash2,
  Send,
  Undo2,
  ChevronLeft,
  Plus,
  GripVertical,
  FileText
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  updateWork,
  publishWork,
  unpublishWork,
  deleteWork,
  createChapter,
  reorderChapters
} from "@/app/studio/(protected)/_actions/works";
import { CoverUploader } from "@/app/studio/(protected)/_components/cover-uploader";
import { ConfirmDialog } from "@/app/studio/(protected)/_components/confirm-dialog";
import {
  SaveIndicator,
  type SaveStatus
} from "@/app/studio/(protected)/_components/save-indicator";
import { cn } from "@/lib/cn";
import type { WorkStatus } from "@/types/content";

export type ChapterListItem = {
  id: string;
  slug: string;
  number: number;
  title: string;
  status: WorkStatus;
  wordCount: number;
  updatedAt: string;
};

export type InitialSeries = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  status: WorkStatus;
  excerpt: string;
  tags: string[];
  coverImage: string;
  publishedAt: string | null;
  chapters: ChapterListItem[];
};

const SAVE_DEBOUNCE_MS = 1200;

export function SeriesEditor({ initial }: { initial: InitialSeries }) {
  // ---------- Series settings state ----------
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [tagsText, setTagsText] = useState(initial.tags.join(", "));
  const [coverImage, setCoverImage] = useState(initial.coverImage);

  const [status, setStatus] = useState<WorkStatus>(initial.status);
  const [saveState, setSaveState] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | undefined>(undefined);
  const [actionPending, startAction] = useTransition();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // ---------- Chapters state ----------
  const [chapters, setChapters] = useState<ChapterListItem[]>(initial.chapters);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [creatingChapter, startCreate] = useTransition();
  const [reorderPending, startReorder] = useTransition();

  // ---------- Save plumbing ----------
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didMount = useRef(false);
  const latestSnapshotRef = useRef({
    title: initial.title,
    subtitle: initial.subtitle,
    excerpt: initial.excerpt,
    tags: initial.tags,
    coverImage: initial.coverImage
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
        tags: snap.tags,
        coverImage: snap.coverImage || null
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
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    latestSnapshotRef.current = {
      title,
      subtitle,
      excerpt,
      tags,
      coverImage
    };
    if (didMount.current) scheduleSave();
    else didMount.current = true;
  }, [title, subtitle, excerpt, tagsText, coverImage, scheduleSave]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        void flushSave();
      }
    };
  }, [flushSave]);

  // ---------- Publish / delete ----------
  const isPublished = status === "published";

  const togglePublish = useCallback(() => {
    startAction(async () => {
      try {
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

  const confirmDelete = useCallback(() => {
    startAction(async () => {
      await deleteWork(initial.id);
    });
  }, [initial.id]);

  // ---------- Chapter create ----------
  const handleCreateChapter = useCallback(() => {
    const title = newChapterTitle.trim();
    if (!title) return;
    startCreate(async () => {
      await createChapter(initial.id, title);
    });
  }, [initial.id, newChapterTitle]);

  // ---------- Chapter drag-and-drop ----------
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = chapters.findIndex((c) => c.id === active.id);
      const newIndex = chapters.findIndex((c) => c.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      const reordered = arrayMove(chapters, oldIndex, newIndex).map((c, i) => ({
        ...c,
        number: i + 1
      }));
      setChapters(reordered);
      startReorder(async () => {
        try {
          await reorderChapters(
            initial.id,
            reordered.map((c) => c.id)
          );
        } catch (err) {
          setSaveError(err instanceof Error ? err.message : String(err));
          setSaveState("error");
        }
      });
    },
    [chapters, initial.id]
  );

  const publicHref = useMemo(() => `/series/${initial.slug}`, [initial.slug]);

  return (
    <div className="space-y-6">
      <header className="sticky top-16 z-30 -mx-5 border-b border-border/60 bg-canvas/85 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/studio/series"
              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface/60 px-2 py-1 font-sans text-xs text-muted hover:bg-surface hover:text-ink"
            >
              <ChevronLeft className="h-3 w-3" /> back
            </Link>
            <span className="meta">series</span>
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

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* ---------- Left: identity + chapters ---------- */}
        <div className="space-y-8">
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled series"
              className="w-full bg-transparent font-serif text-4xl font-bold leading-tight tracking-tight text-ink placeholder:text-whisper focus:outline-none md:text-5xl"
            />
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="optional subtitle — what the arc is about"
              className="w-full bg-transparent font-italic italic text-xl text-muted placeholder:text-whisper focus:outline-none md:text-2xl"
            />
          </div>

          <div className="hairline" aria-hidden />

          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="meta mb-1">chapters</p>
                <h2 className="font-serif text-2xl font-bold">
                  {chapters.length === 0
                    ? "no chapters yet"
                    : `${chapters.length} chapter${chapters.length === 1 ? "" : "s"}`}
                </h2>
              </div>
              {reorderPending && <span className="meta">reordering…</span>}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateChapter();
              }}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface/40 p-3"
            >
              <input
                type="text"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="new chapter title…"
                className="flex-1 rounded-md border border-border/80 bg-canvas px-3 py-1.5 font-serif text-base text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={creatingChapter || !newChapterTitle.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 font-sans text-xs font-medium text-canvas transition-opacity hover:opacity-95 disabled:opacity-60"
              >
                <Plus className="h-3 w-3" /> add chapter
              </button>
            </form>

            {chapters.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-surface/30 p-8 text-center">
                <FileText className="mx-auto h-5 w-5 text-whisper" />
                <p className="mt-3 font-italic italic text-base text-muted">
                  empty arc. type a title above to add the first one.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={chapters.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-surface/30">
                    {chapters.map((ch) => (
                      <SortableChapterRow
                        key={ch.id}
                        chapter={ch}
                        seriesId={initial.id}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </section>
        </div>

        {/* ---------- Right: meta sidebar ---------- */}
        <aside className="space-y-6">
          <section className="space-y-3 rounded-xl border border-border/60 bg-surface/40 p-4">
            <label className="block">
              <span className="meta">excerpt</span>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={4}
                placeholder="a short line shown on the series page and archive"
                className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-2 font-serif text-sm text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="meta">tags (comma-separated)</span>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="series, slow, gabi"
                className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-1.5 font-mono text-xs text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
              />
            </label>

            <CoverUploader
              workId={initial.id}
              value={coverImage}
              onChange={setCoverImage}
            />
          </section>

          {initial.publishedAt && (
            <p className="meta">
              first published · {new Date(initial.publishedAt).toLocaleDateString()}
            </p>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        tone="danger"
        title="Delete this series?"
        description="Every chapter, cover, and draft inside the series will be removed. This can’t be undone."
        confirmLabel="Delete series"
        pending={actionPending}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function SortableChapterRow({
  chapter,
  seriesId
}: {
  chapter: ChapterListItem;
  seriesId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface/60",
        isDragging && "bg-surface shadow-lg"
      )}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab touch-none rounded p-1 text-whisper hover:text-ink active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="w-8 font-mono text-xs text-whisper">
        {String(chapter.number).padStart(2, "0")}
      </span>
      <Link
        href={`/studio/series/${seriesId}/chapters/${chapter.id}`}
        className="flex-1 truncate font-serif text-base text-ink hover:underline"
      >
        {chapter.title || "Untitled chapter"}
      </Link>
      {chapter.status === "draft" && (
        <span className="rounded-full border border-border/60 bg-canvas px-2 py-0.5 font-mono text-[10px] uppercase tracking-meta text-muted">
          draft
        </span>
      )}
      <span className="meta hidden sm:inline">
        {chapter.wordCount.toLocaleString()} w
      </span>
    </li>
  );
}
