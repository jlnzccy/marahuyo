"use client";

import { useTransition } from "react";
import { Send, Loader2 } from "lucide-react";
import { publishWork, publishChapter } from "@/app/studio/(protected)/_actions/works";
import { cn } from "@/lib/cn";

type Props = {
  kind: "work" | "chapter";
  id: string;
  className?: string;
};

/**
 * Single-button "publish from list view" used on /studio/drafts so the writer
 * can flip a draft live without drilling into the editor. Always navigable
 * via Tab; renders as a small ghost button so it doesn't compete visually
 * with the row's primary Link.
 */
export function InlinePublish({ kind, id, className }: Props) {
  const [pending, start] = useTransition();

  const onClick = () => {
    start(async () => {
      if (kind === "work") await publishWork(id);
      else await publishChapter(id);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label="Publish now"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-canvas px-2.5 py-1 font-sans text-xs text-muted transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-700 disabled:opacity-60",
        className
      )}
    >
      {pending ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" /> publishing
        </>
      ) : (
        <>
          <Send className="h-3 w-3" /> publish
        </>
      )}
    </button>
  );
}
