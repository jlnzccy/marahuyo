"use client";

import Link from "next/link";
import { FileText, Library, PenLine, Send, Loader2, X } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import {
  bulkUpdateWorks,
  bulkUpdateChapters
} from "@/app/studio/(protected)/_actions/works";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

export type DraftItem = {
  key: string;
  id: string;
  kind: "work" | "chapter";
  href: string;
  icon: "file" | "library" | "pen";
  primary: string;
  secondary: string;
  meta: string;
  updatedAt: string;
};

const ICONS = {
  file: FileText,
  library: Library,
  pen: PenLine
} as const;

type Props = {
  items: DraftItem[];
};

/**
 * Drafts inbox with multi-select. Same shape as BulkWorksList, but the
 * batch can mix works and chapters — we route ids to the right server
 * action when the user hits Publish.
 */
export function BulkDraftsList({ items }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  const selectedItems = useMemo(
    () => items.filter((i) => selected.has(i.key)),
    [items, selected]
  );

  const allSelected = items.length > 0 && selected.size === items.length;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.key)));
  };

  const toggleOne = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const publishSelected = () => {
    if (selectedItems.length === 0) return;
    const workIds = selectedItems
      .filter((i) => i.kind === "work")
      .map((i) => i.id);
    const chapterIds = selectedItems
      .filter((i) => i.kind === "chapter")
      .map((i) => i.id);
    start(async () => {
      await Promise.all([
        workIds.length > 0
          ? bulkUpdateWorks({ ids: workIds, action: "publish" })
          : Promise.resolve(),
        chapterIds.length > 0
          ? bulkUpdateChapters({ ids: chapterIds, action: "publish" })
          : Promise.resolve()
      ]);
      setSelected(new Set());
    });
  };

  return (
    <>
      <ul className="divide-y divide-border/60">
        <li className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            aria-label={allSelected ? "Deselect all" : "Select all"}
            className="h-3.5 w-3.5 accent-ink"
          />
          <span className="meta">
            {selected.size > 0
              ? `${selected.size} selected`
              : `${items.length} drafts`}
          </span>
        </li>

        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const checked = selected.has(item.key);
          return (
            <li
              key={item.key}
              className={cn(
                "group grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-4 py-4 transition-colors hover:bg-surface/40",
                checked && "bg-surface/40"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleOne(item.key)}
                aria-label={`Select ${item.primary}`}
                className="h-3.5 w-3.5 self-center accent-ink"
              />
              <Link
                href={item.href}
                className="contents"
                aria-label={`Open ${item.primary}`}
              >
                <Icon className="h-4 w-4 text-whisper transition-colors group-hover:text-ink" />
                <div className="min-w-0">
                  <div className="truncate font-serif text-lg font-bold text-ink transition-transform group-hover:translate-x-0.5">
                    {item.primary}
                  </div>
                  <div className="meta truncate">{item.secondary}</div>
                </div>
                <span className="meta hidden sm:inline">{item.meta}</span>
                <span className="meta">{relativeTime(item.updatedAt)}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {selected.size > 0 && (
        <div
          role="region"
          aria-label="Bulk actions"
          className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 no-print"
        >
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/80 bg-surface/95 px-3 py-2 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.4)] backdrop-blur">
            <span className="meta px-2">{selected.size} selected</span>
            <button
              type="button"
              onClick={publishSelected}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 font-sans text-xs text-canvas transition-opacity hover:opacity-95 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              Publish all
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              aria-label="Clear selection"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-whisper transition-colors hover:bg-canvas hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
