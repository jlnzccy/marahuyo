export type WorkKind =
  | "poem"
  | "essay"
  | "oneshot"
  | "series"
  | "article"
  | "story"
  | "note";

export type WorkStatus = "draft" | "published";

export type SeriesStatus = "ongoing" | "completed" | "hiatus";

export interface BaseWork {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  kind: WorkKind;
  status: WorkStatus;
  publishedAt?: string;
  tags: string[];
  excerpt: string;
  wordCount: number;
  readingMinutes: number;
  /** Cover/hero image URL — used on cards, archive rows, and reader hero. */
  coverImage?: string;
}

export interface StandaloneWork extends BaseWork {
  kind: "poem" | "essay" | "oneshot" | "article" | "story" | "note";
  /** Rich text body — HTML or structured JSON depending on storage. */
  body: string;
  /** Set true on poetry to render with whitespace-preserved formatting. */
  poetryMode?: boolean;
}

export interface Chapter {
  id: string;
  seriesId: string;
  slug: string;
  number: number;
  title: string;
  subtitle?: string;
  excerpt: string;
  /** Per-chapter cover. When unset the chapter opens with no cover (it does
   *  NOT fall back to the series cover). */
  coverImage?: string;
  status: WorkStatus;
  publishedAt?: string;
  wordCount: number;
  readingMinutes: number;
  body: string;
  poetryMode?: boolean;
}

export interface Series extends BaseWork {
  kind: "series";
  seriesStatus: SeriesStatus;
  chapters: Chapter[];
}

export type AnyWork = StandaloneWork | Series;
