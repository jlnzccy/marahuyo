"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/app/studio/(protected)/_components/confirm-dialog";
import {
  restoreWork,
  restoreChapter,
  purgeWork,
  purgeChapter
} from "@/app/studio/(protected)/_actions/works";
import { cn } from "@/lib/cn";

type Props = {
  kind: "work" | "chapter";
  /** Only set for works — drives the dialog wording. */
  workKind?: string;
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  primary: string;
  secondary: string;
  meta: string;
  deletedLabel: string;
};

export function TrashRow({
  kind,
  workKind,
  id,
  icon: Icon,
  primary,
  secondary,
  meta,
  deletedLabel
}: Props) {
  const [confirmPurge, setConfirmPurge] = useState(false);
  const [pending, startTransition] = useTransition();

  const onRestore = () =>
    startTransition(async () => {
      if (kind === "work") await restoreWork(id);
      else await restoreChapter(id);
    });

  const onPurge = () =>
    startTransition(async () => {
      if (kind === "work") await purgeWork(id);
      else await purgeChapter(id);
      setConfirmPurge(false);
    });

  return (
    <li>
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 py-4">
        <Icon className="h-4 w-4 text-whisper" />
        <div className="min-w-0">
          <div className="truncate font-serif text-lg font-bold text-ink">
            {primary}
          </div>
          <div className="meta truncate">{secondary}</div>
        </div>
        <span className="meta hidden sm:inline">{meta}</span>
        <span className="meta">deleted {deletedLabel}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRestore}
            disabled={pending}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-surface/60 px-2.5 py-1.5 font-sans text-xs text-muted transition-colors hover:bg-surface hover:text-ink",
              pending && "opacity-60"
            )}
          >
            <RotateCcw className="h-3 w-3" /> restore
          </button>
          <button
            type="button"
            onClick={() => setConfirmPurge(true)}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-400/40 bg-red-500/5 px-2.5 py-1.5 font-sans text-xs text-red-600 transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="h-3 w-3" /> remove
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmPurge}
        tone="danger"
        title={
          kind === "work" && workKind === "series"
            ? "Permanently remove this series?"
            : `Permanently remove this ${kind}?`
        }
        description="The row, its cover, and any inline uploads will be deleted forever. This can't be undone."
        confirmLabel="Remove forever"
        pending={pending}
        onCancel={() => setConfirmPurge(false)}
        onConfirm={onPurge}
      />
    </li>
  );
}
