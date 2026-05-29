"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * App Router re-mounts `template` on every navigation, so this is where a
 * route transition lives. Deliberately opacity-only: a `transform` (even an
 * identity `translateY(0)`) or `opacity < 1` makes this element the containing
 * block for every `position: fixed` descendant (header, theme switcher, reader
 * rail, resume + quote pills). Opacity returns to 1 when the fade ends, which
 * dissolves the containing block; a lingering transform would not.
 *
 * Next resets scroll to top on navigation; the fade runs at scroll 0, so the
 * brief containing-block window has no visible effect on fixed chrome.
 */
export default function Template({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
