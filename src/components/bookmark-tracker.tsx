"use client";

import { useEffect } from "react";
import { recordVisit } from "@/lib/bookmarks";
import type { WorkKind } from "@/types/content";

type Props = {
  key_: string;
  href: string;
  title: string;
  kind: WorkKind;
  subtitle?: string;
};

/**
 * Side-effect-only. Records a visit to localStorage on mount so the homepage
 * "continue reading" rail can surface it later. Renders nothing.
 */
export function BookmarkTracker({ key_, href, title, kind, subtitle }: Props) {
  useEffect(() => {
    recordVisit({ key: key_, href, title, kind, subtitle });
  }, [key_, href, title, kind, subtitle]);
  return null;
}
