"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Send, Undo2, Trash2, X, Loader2 } from "lucide-react";
import {
  bulkUpdateWorks,
  type BulkWorksInput
} from "@/app/studio/(protected)/_actions/works";
import { ConfirmDialog } from "@/app/studio/(protected)/_components/confirm-dialog";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

export type WorkListItem = {
  id: string;
  title: string;
  kind: string;
  status: "draft" | "published";
  wordCount: number;
  updatedAt: string;
};

type Props = {
  rows: WorkListItem[];
};

type BulkAction = BulkWorksInput["action"];

/**
 * Studio Works list with multi-select. Renders the same row layout the
 * server page had, plus a checkbox column and a sticky action bar that
 * appears whenever ≥1 row is selected. The action bar dispatches a single
 * server action for the whole batch.
 */
export function BulkWorksList({ rows }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const someSelected = selected.size > 0;

  const selectedIds = useMemo(() => [...selected], [selected]);

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dispatch = (action: BulkAction) => {
    if (selectedIds.length === 0) return;
    start(async () => {
      await bulkUpdateWorks({ ids: selectedIds, action });
      setSelected(new Set());
      setConfirmDelete(false);
    });
  };

  return (
    <>
      <ul className="divide-y divide-border/60">
        {rows.length > 0 && (
          <li className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              aria-label={allSelected ? "Deselect all" : "Select all"}
              className="h-3.5 w-3.5 accent-ink"
            />
            <span className="meta">
              {someSelected
                ? `${selected.size} selected`
                : `${rows.length} works`}
            </span>
          </li>
        )}

        {rows.map((row) => {
          const checked = selected.has(row.id);
          return (
            <li
              key={row.id}
              className={cn(
                "group grid grid-cols-[auto_1fr_auto_auto] items-baseline gap-4 py-4 transition-colors hover:bg-surface/40",
                checked && "bg-surface/40"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleOne(row.id)}
                aria-label={`Select ${row.title || "Untitled"}`}
                className="h-3.5 w-3.5 self-center accent-ink"
              />
              <Link
                href={`/studio/works/${row.id}`}
                className="contents"
                aria-label={`Open ${row.title || "Untitled"}`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-xl font-bold text-ink transition-transform group-hover:translate-x-0.5">
                      {row.title || "Untitled"}
                    </span>
                    <span className="meta">{row.kind}</span>
                    {row.status === "draft" && (
                      <span className="rounded-full border border-border/60 bg-canvas px-2 py-0.5 font-mono text-[10px] uppercase tracking-meta text-muted">
                        draft
                      </span>
                    )}
                  </div>
                </div>
                <span className="meta">
                  {row.wordCount.toLocaleString()} words
                </span>
                <span className="meta">{relativeTime(row.updatedAt)}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {someSelected && (
        <div
          role="region"
          aria-label="Bulk actions"
          className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 no-print"
        >
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/80 bg-surface/95 px-3 py-2 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.4)] backdrop-blur">
            <span className="meta px-2">
              {selected.size} selected
            </span>
            <BulkButton
              onClick={() => dispatch("publish")}
              pending={pending}
              icon={Send}
              label="Publish"
              tone="accent"
            />
            <BulkButton
              onClick={() => dispatch("unpublish")}
              pending={pending}
              icon={Undo2}
              label="Revert"
            />
            <BulkButton
              onClick={() => setConfirmDelete(true)}
              pending={pending}
              icon={Trash2}
              label="Delete"
              tone="danger"
            />
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

      <ConfirmDialog
        open={confirmDelete}
        tone="danger"
        title={`Delete ${selected.size} ${selected.size === 1 ? "work" : "works"}?`}
        description="They'll move to Trash. You can restore them from there, but any series in the batch will take their chapters along."
        confirmLabel="Move to trash"
        pending={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => dispatch("delete")}
      />
    </>
  );
}

function BulkButton({
  onClick,
  pending,
  icon: Icon,
  label,
  tone
}: {
  onClick: () => void;
  pending: boolean;
  icon: typeof Send;
  label: string;
  tone?: "accent" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs transition-colors disabled:opacity-60",
        tone === "accent" && "bg-ink text-canvas hover:opacity-95",
        tone === "danger" &&
          "border border-red-400/40 bg-red-500/5 text-red-600 hover:bg-red-500/10",
        !tone &&
          "border border-border/60 bg-canvas text-muted hover:border-ink hover:text-ink"
      )}
    >
      {pending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Icon className="h-3 w-3" />
      )}
      {label}
    </button>
  );
}
