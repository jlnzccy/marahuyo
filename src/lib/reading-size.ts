export const READING_SIZES = ["sm", "md", "lg"] as const;
export type ReadingSize = (typeof READING_SIZES)[number];

export const DEFAULT_READING_SIZE: ReadingSize = "md";
export const READING_SIZE_STORAGE_KEY = "marahuyo:reader-size";

export const READING_SIZE_LABELS: Record<ReadingSize, string> = {
  sm: "Small",
  md: "Default",
  lg: "Large"
};

export function isReadingSize(value: unknown): value is ReadingSize {
  return (
    typeof value === "string" &&
    (READING_SIZES as readonly string[]).includes(value)
  );
}
