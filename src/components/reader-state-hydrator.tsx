"use client";

import { useEffect } from "react";
import { fetchRemoteState } from "@/lib/reader-sync";
import { recordVisit, readBookmarks, updateProgress } from "@/lib/bookmarks";
import type { WorkKind } from "@/types/content";

const LIKE_PREFIX = "marahuyo:like:";
const HYDRATED_KEY = "marahuyo:hydrated-at";
const REHYDRATE_MS = 1000 * 60 * 60 * 24; // 24h

function asKind(value: string | null): WorkKind | null {
  if (!value) return null;
  switch (value) {
    case "poem":
    case "essay":
    case "oneshot":
    case "series":
    case "article":
    case "story":
    case "note":
      return value;
    default:
      return null;
  }
}

/**
 * One-shot pull from /api/reader/state on mount. Merges server-side bookmarks
 * + likes into localStorage when this device hasn't seen them yet. Skips
 * rows already present in local with a newer visitedAt — local writes win,
 * since the user just made them this session.
 *
 * Renders nothing. Mounted from app/layout so it runs once per page load.
 */
export function ReaderStateHydrator() {
  useEffect(() => {
    try {
      const last = window.localStorage.getItem(HYDRATED_KEY);
      const lastTs = last ? Number(last) : 0;
      if (Date.now() - lastTs < REHYDRATE_MS) return;
    } catch {
      return;
    }

    let cancelled = false;
    void (async () => {
      const remote = await fetchRemoteState();
      if (cancelled || remote.length === 0) return;

      const localBookmarks = readBookmarks();
      const localByKey = new Map(localBookmarks.map((b) => [b.key, b]));

      for (const entry of remote) {
        if (entry.liked) {
          try {
            window.localStorage.setItem(LIKE_PREFIX + entry.key, "1");
          } catch {
            /* swallow */
          }
        }

        if (!entry.href || !entry.title) continue;
        const kind = asKind(entry.kind);
        if (!kind) continue;

        const remoteTs = new Date(entry.visited_at).getTime();
        const localEntry = localByKey.get(entry.key);
        if (localEntry && localEntry.visitedAt >= remoteTs) continue;

        recordVisit({
          key: entry.key,
          href: entry.href,
          title: entry.title,
          kind,
          subtitle: entry.subtitle ?? undefined,
          scrollPercent: entry.scroll_percent
        });
        if (entry.scroll_percent > 0) {
          updateProgress(entry.key, entry.scroll_percent);
        }
      }

      try {
        window.localStorage.setItem(HYDRATED_KEY, Date.now().toString());
      } catch {
        /* swallow */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
