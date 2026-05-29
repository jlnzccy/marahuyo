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

/** Reads every `marahuyo:like:*` key from localStorage and returns them. */
function readLikeKeys(): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(LIKE_PREFIX)) {
        // The key stored is the keyId (the part after the prefix), which
        // should match the bookmark key shape (e.g. "read/<slug>").
        keys.push(k.slice(LIKE_PREFIX.length));
      }
    }
    return keys;
  } catch {
    return [];
  }
}

/**
 * One-shot pull from /api/reader/state on mount. Merges server-side bookmarks
 * + likes into localStorage when this device hasn't seen them yet. Skips
 * rows already present in local with a newer visitedAt — local writes win,
 * since the user just made them this session.
 *
 * Also sweeps stale `marahuyo:like:*` keys whose underlying work no longer
 * exists (trashed / unpublished) by validating them against the DB.
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
      if (cancelled) return;

      // ---- Hydrate remote bookmarks + likes into localStorage ----
      if (remote.length > 0) {
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
      }

      // ---- Sweep stale like keys ----
      const likeKeys = readLikeKeys();
      if (likeKeys.length > 0 && !cancelled) {
        try {
          const localBookmarks = readBookmarks();
          const res = await fetch("/api/bookmarks/validate", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              keys: localBookmarks.map((b) => b.key),
              likeKeys
            })
          });
          if (res.ok && !cancelled) {
            const data = (await res.json()) as {
              ok: boolean;
              validLikeKeys?: string[];
            };
            if (data.ok && data.validLikeKeys) {
              const validSet = new Set(data.validLikeKeys);
              for (const keyId of likeKeys) {
                if (!validSet.has(keyId)) {
                  try {
                    window.localStorage.removeItem(LIKE_PREFIX + keyId);
                  } catch {
                    /* swallow */
                  }
                }
              }
            }
          }
        } catch {
          /* swallow — offline */
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
