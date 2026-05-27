import { cn } from "@/lib/cn";
import type { WorkKind } from "@/types/content";

const LABELS: Record<WorkKind, string> = {
  poem: "Poem",
  essay: "Essay",
  oneshot: "One-shot",
  series: "Series",
  article: "Article",
  story: "Story",
  note: "Note"
};

export function KindChip({ kind, className }: { kind: WorkKind; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/60 px-2.5 py-0.5",
        "font-mono text-[10px] uppercase tracking-meta text-muted",
        className
      )}
    >
      <span aria-hidden className="h-1 w-1 rounded-full bg-accent/80" />
      {LABELS[kind]}
    </span>
  );
}
