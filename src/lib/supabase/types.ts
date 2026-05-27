// Hand-written types mirroring the SQL schema in supabase/migrations/0001_init.sql.
// Replace with `supabase gen types typescript` output once your project is live.

export type WorkKind =
  | "poem"
  | "essay"
  | "oneshot"
  | "series"
  | "article"
  | "story"
  | "note";
export type WorkStatusDb = "draft" | "published";

export interface WorkRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  kind: WorkKind;
  status: WorkStatusDb;
  excerpt: string;
  body: string;
  poetry_mode: boolean;
  tags: string[];
  cover_image: string | null;
  cover_color: string | null;
  word_count: number;
  reading_minutes: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkInsert {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  kind: WorkKind;
  status?: WorkStatusDb;
  excerpt?: string;
  body?: string;
  poetry_mode?: boolean;
  tags?: string[];
  cover_image?: string | null;
  cover_color?: string | null;
  word_count?: number;
  reading_minutes?: number;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WorkUpdate {
  id?: string;
  slug?: string;
  title?: string;
  subtitle?: string | null;
  kind?: WorkKind;
  status?: WorkStatusDb;
  excerpt?: string;
  body?: string;
  poetry_mode?: boolean;
  tags?: string[];
  cover_image?: string | null;
  cover_color?: string | null;
  word_count?: number;
  reading_minutes?: number;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChapterRow {
  id: string;
  series_id: string;
  slug: string;
  number: number;
  title: string;
  subtitle: string | null;
  status: WorkStatusDb;
  body: string;
  poetry_mode: boolean;
  cover_image: string | null;
  word_count: number;
  reading_minutes: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChapterInsert {
  id?: string;
  series_id: string;
  slug: string;
  number: number;
  title: string;
  subtitle?: string | null;
  status?: WorkStatusDb;
  body?: string;
  poetry_mode?: boolean;
  cover_image?: string | null;
  word_count?: number;
  reading_minutes?: number;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChapterUpdate {
  id?: string;
  series_id?: string;
  slug?: string;
  number?: number;
  title?: string;
  subtitle?: string | null;
  status?: WorkStatusDb;
  body?: string;
  poetry_mode?: boolean;
  cover_image?: string | null;
  word_count?: number;
  reading_minutes?: number;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SettingsRow {
  id: string;
  default_theme: string;
  instagram_url: string | null;
  twitter_url: string | null;
  substack_url: string | null;
  github_url: string | null;
  contact_email: string | null;
  portrait_url: string | null;
  author_subtitle: string | null;
  author_name: string | null;
  author_handle: string | null;
  author_tagline: string | null;
  author_short_bio: string | null;
  author_bio: string | null;
  author_bio_long: string | null;
  author_location: string | null;
  about_place_title: string | null;
  about_place_body: string | null;
  about_place_quote: string | null;
  updated_at: string;
}

export interface SettingsUpdate {
  default_theme?: string;
  instagram_url?: string | null;
  twitter_url?: string | null;
  substack_url?: string | null;
  github_url?: string | null;
  contact_email?: string | null;
  portrait_url?: string | null;
  author_subtitle?: string | null;
  author_name?: string | null;
  author_handle?: string | null;
  author_tagline?: string | null;
  author_short_bio?: string | null;
  author_bio?: string | null;
  author_bio_long?: string | null;
  author_location?: string | null;
  about_place_title?: string | null;
  about_place_body?: string | null;
  about_place_quote?: string | null;
  updated_at?: string;
}

export type Database = {
  public: {
    Tables: {
      works: {
        Row: WorkRow;
        Insert: WorkInsert;
        Update: WorkUpdate;
        Relationships: [];
      };
      chapters: {
        Row: ChapterRow;
        Insert: ChapterInsert;
        Update: ChapterUpdate;
        Relationships: [
          {
            foreignKeyName: "chapters_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "works";
            referencedColumns: ["id"];
          }
        ];
      };
      settings: {
        Row: SettingsRow;
        Insert: SettingsRow;
        Update: SettingsUpdate;
        Relationships: [];
      };
    };
    Views: {
      works_public: { Row: WorkRow; Relationships: [] };
      chapters_public: { Row: ChapterRow; Relationships: [] };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: { work_kind: WorkKind; work_status: WorkStatusDb };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
