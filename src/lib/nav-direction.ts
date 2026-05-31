/**
 * Tracks whether the current navigation was a back/forward (popstate) or a
 * forward push, so the route transition can slide in the matching direction —
 * the small cue that makes app navigation read as native push / pop.
 *
 * Module-level (not React state) because `template.tsx` remounts on every
 * navigation; the flag has to survive that remount to be read on the way in.
 */

let popped = false;
let attached = false;

/** Attach the popstate listener once (idempotent, client-only). */
export function watchNavDirection(): void {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener("popstate", () => {
    popped = true;
  });
}

/** Read the direction for the navigation just made, then reset. */
export function consumeNavDirection(): "back" | "forward" {
  const dir = popped ? "back" : "forward";
  popped = false;
  return dir;
}
