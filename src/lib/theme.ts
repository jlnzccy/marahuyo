export const THEMES = ["light", "cream", "midnight"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "light";
export const STORAGE_KEY = "marahuyo:theme";

export const THEME_LABELS: Record<Theme, string> = {
  light: "Paper",
  cream: "Cream",
  midnight: "Midnight"
};

export const THEME_DESCRIPTIONS: Record<Theme, string> = {
  light: "Crisp white. Default.",
  cream: "Warm off-white for longer reads.",
  midnight: "Low-glare dark."
};

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}
