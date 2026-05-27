import type { WorkKind } from "@/types/content";

export type Bookmark = {
  key: string;
  href: string;
  title: string;
  kind: WorkKind;
  subtitle?: string;
  visitedAt: number;
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
