"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { watchNavDirection, consumeNavDirection } from "@/lib/nav-direction";

/**
 * App Router remounts `template` on every navigation, so this is where a route
 * transition lives. The animation itself is pure CSS (`.route-tx` in
 * globals.css): a quiet fade everywhere, plus a directional slide inside the
 * installed app shell so navigation reads like a native push / pop.
 *
 * The slide uses a transform, which makes this element the containing block for
 * any `position: fixed` descendant while it runs. That's fine for the standard
 * pages (their fixed chrome — bottom nav — lives in the layout, outside this
 * wrapper), but NOT for the reader: its floating chrome (ReaderChrome pills,
 * ResumePill, QuoteShare) is rendered inside the page, so a transform here would
 * drag it sideways. Reader routes therefore fall back to the opacity-only fade.
 * The animation ends at transform:none / opacity:1, so it never leaves a
 * lingering containing block. `prefers-reduced-motion` is handled globally.
 */

const isReaderRoute = (path: string) =>
  path.startsWith("/read/") || /^\/series\/[^/]+\/[^/]+/.test(path);

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // useState initializer runs once per mount → consumes the direction flag
  // exactly once for this navigation (template remounts on every nav).
  const [dir] = useState(consumeNavDirection);

  useEffect(() => {
    watchNavDirection();
  }, []);

  // Reader routes keep the safe fade; everywhere else gets the directional cue.
  const effectiveDir = isReaderRoute(pathname) ? "fade" : dir;

  return (
    <div className="route-tx" data-dir={effectiveDir}>
      {children}
    </div>
  );
}
