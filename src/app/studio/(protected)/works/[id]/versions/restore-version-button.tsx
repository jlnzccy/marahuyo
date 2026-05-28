"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Loader2 } from "lucide-react";
import { restoreWorkVersion } from "@/app/studio/(protected)/_actions/works";
import { ConfirmDialog } from "@/app/studio/(protected)/_components/confirm-dialog";

type Props = {
  versionId: string;
};

/**
 * One-click rollback to a stored version. Captures the current state first
 * (the server action handles that), then writes the version's title/body
 * back onto the work. Status is intentionally left alone.
 */
export function RestoreVersionButton({ versionId }: Props) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const confirm = () => {
    start(async () => {
      const res = await restoreWorkVersion(versionId);
      setOpen(false);
      router.push(`/studio/works/${res.workId}`);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-canvas px-2.5 py-1.5 font-sans text-xs text-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Undo2 className="h-3 w-3" />
        )}
        Restore
      </button>

      <ConfirmDialog
        open={open}
        title="Restore this version?"
        description="The current draft will be saved as its own version first, so this isn't destructive — you can undo the undo."
        confirmLabel="Restore"
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={confirm}
      />
    </>
  );
}
