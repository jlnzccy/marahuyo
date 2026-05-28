import type { WorkKind } from "@/types/content";

export type Bookmark = {
  key: string;
  href: string;
  title: string;
  kind: WorkKind;
  subtitle?: string;
  visitedAt: number;
  /** 0-100. Where the reader had scrolled to when last seen on the page. */
  scrollPercent?: number;
};

const LS_KEY = "marahuyo:bookmarks";
const MAX_BOOKMARKS = 8;

function safeParse(raw: string | null): Bookmark[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is Bookmark =>
        b &&
        typeof b.key === "string" &&
        typeof b.href === "string" &&
        typeof b.title === "string" &&
        typeof b.kind === "string" &&
        typeof b.visitedAt === "number"
    );
  } catch {
    return [];
  }
}

export function readBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    return safeParse(localStorage.getItem(LS_KEY));
  } catch {
    return [];
  }
}

export function recordVisit(b: Omit<Bookmark, "visitedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const current = safeParse(localStorage.getItem(LS_KEY));
    const filtered = current.filter((x) => x.key !== b.key);
    const next: Bookmark[] = [
      { ...b, visitedAt: Date.now() },
      ...filtered
    ].slice(0, MAX_BOOKMARKS);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
}

/**
 * Patch a bookmark's scroll progress without bumping `visitedAt` or otherwise
 * reordering the shelf. No-op if the bookmark isn't already on the shelf.
 */
export function updateProgress(key: string, scrollPercent: number): void {
  if (typeof window === "undefined") return;
  const clamped = Math.max(0, Math.min(100, Math.round(scrollPercent)));
  try {
    const current = safeParse(localStorage.getItem(LS_KEY));
    let touched = false;
    const next = current.map((b) => {
      if (b.key !== key) return b;
      if (b.scrollPercent === clamped) return b;
      touched = true;
      return { ...b, scrollPercent: clamped };
    });
    if (touched) localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    /* swallow */
  }
}

export function clearBookmark(key: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = safeParse(localStorage.getItem(LS_KEY));
    const next = current.filter((x) => x.key !== key);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    /* swallow */
  }
}
