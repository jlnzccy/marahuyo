import { cn } from "@/lib/cn";

/**
 * Flat tonal placeholder block for route `loading.tsx` states. Uses the
 * existing `pulse-soft` keyframe (opacity, not a sweeping gradient) so it stays
 * on-brand and collapses to static under `prefers-reduced-motion`.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse-soft rounded-md bg-surface", className)}
    />
  );
}
