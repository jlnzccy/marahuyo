export const THEMES = ["light", "cream", "midnight"] as const;
export type Theme = (typeof THEMES)[number];

/**
 * What the user picked in the theme switcher. `auto` follows the OS-level
 * `prefers-color-scheme`; everything else is a concrete `Theme`.
 */
export const THEME_PREFERENCES = ["auto", ...THEMES] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export const DEFAULT_PREFERENCE: ThemePreference = "auto";

/** Concrete fallback used when `matchMedia` is unavailable (SSR, old engines). */
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

export const PREFERENCE_LABEL: Record<ThemePreference, string> = {
  auto: "Auto",
  ...THEME_LABELS
};

export const PREFERENCE_DESCRIPTION: Record<ThemePreference, string> = {
  auto: "Follows your system light or dark setting.",
  ...THEME_DESCRIPTIONS
};

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return (
    typeof value === "string" &&
    (THEME_PREFERENCES as readonly string[]).includes(value)
  );
}

/** Resolve a preference to a concrete theme using the given system-dark flag. */
export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean
): Theme {
  if (preference === "auto") return systemPrefersDark ? "midnight" : "light";
  return preference;
}
