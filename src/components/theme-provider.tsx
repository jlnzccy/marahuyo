"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_PREFERENCE,
  DEFAULT_THEME,
  STORAGE_KEY,
  isTheme,
  isThemePreference,
  resolveTheme,
  THEMES,
  type Theme,
  type ThemePreference
} from "@/lib/theme";
import {
  DEFAULT_READING_SIZE,
  READING_SIZE_STORAGE_KEY,
  type ReadingSize,
  isReadingSize
} from "@/lib/reading-size";

type ThemeContextValue = {
  /** Resolved concrete theme currently applied. */
  theme: Theme;
  /** What the user picked — can be `auto`. */
  preference: ThemePreference;
  /** Save a new preference. `auto` re-binds to the OS color scheme. */
  setPreference: (next: ThemePreference) => void;
  /** Convenience: cycle through the concrete themes (skips `auto`). */
  cycle: () => void;
  readingSize: ReadingSize;
  setReadingSize: (next: ReadingSize) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(DEFAULT_PREFERENCE);
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [readingSize, setReadingSizeState] = useState<ReadingSize>(DEFAULT_READING_SIZE);

  // Sync from the pre-hydration script's outcome on mount, then keep listening
  // to system dark-mode while preference is `auto`.
  useEffect(() => {
    const root = document.documentElement;

    const storedPref = (() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (isThemePreference(raw)) return raw;
        // Legacy: older builds stored a concrete Theme. Treat as that theme.
        if (isTheme(raw)) return raw;
      } catch {
        /* storage blocked */
      }
      return DEFAULT_PREFERENCE;
    })();
    setPreferenceState(storedPref);

    const currentTheme = root.getAttribute("data-theme");
    if (isTheme(currentTheme)) setThemeState(currentTheme);

    const currentSize = root.getAttribute("data-reading-size");
    if (isReadingSize(currentSize)) setReadingSizeState(currentSize);
  }, []);

  // While preference is `auto`, follow the OS color scheme live.
  useEffect(() => {
    if (preference !== "auto") return;
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(DARK_QUERY);
    const apply = () => {
      const next = resolveTheme("auto", mql.matches);
      setThemeState(next);
      document.documentElement.setAttribute("data-theme", next);
    };
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    const systemDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia(DARK_QUERY).matches;
    const resolved = resolveTheme(next, systemDark);
    setThemeState(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — silent */
    }
  }, []);

  const setReadingSize = useCallback((next: ReadingSize) => {
    setReadingSizeState(next);
    document.documentElement.setAttribute("data-reading-size", next);
    try {
      window.localStorage.setItem(READING_SIZE_STORAGE_KEY, next);
    } catch {
      /* storage unavailable — silent */
    }
  }, []);

  const cycle = useCallback(() => {
    const idx = THEMES.indexOf(theme);
    const nextTheme = THEMES[(idx + 1) % THEMES.length];
    setPreference(nextTheme);
  }, [theme, setPreference]);

  const value = useMemo(
    () => ({ theme, preference, setPreference, cycle, readingSize, setReadingSize }),
    [theme, preference, setPreference, cycle, readingSize, setReadingSize]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

/**
 * Inline script injected pre-hydration to avoid theme + size flash. Reads the
 * stored preference, resolves `auto` against `matchMedia`, and stamps the
 * concrete theme onto `<html>` before paint.
 */
export const themeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    var pref = (stored === 'auto' || stored === 'cream' || stored === 'light' || stored === 'midnight')
      ? stored
      : '${DEFAULT_PREFERENCE}';
    var theme;
    if (pref === 'auto') {
      var dark = typeof window.matchMedia === 'function' && window.matchMedia('${DARK_QUERY}').matches;
      theme = dark ? 'midnight' : 'light';
    } else {
      theme = pref;
    }
    document.documentElement.setAttribute('data-theme', theme);
    var size = localStorage.getItem(${JSON.stringify(READING_SIZE_STORAGE_KEY)});
    if (size === 'xs' || size === 'sm' || size === 'md' || size === 'lg') {
      document.documentElement.setAttribute('data-reading-size', size);
    } else {
      document.documentElement.setAttribute('data-reading-size', '${DEFAULT_READING_SIZE}');
    }
    document.documentElement.setAttribute('data-theme-init', '');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', '${DEFAULT_THEME}');
    document.documentElement.setAttribute('data-reading-size', '${DEFAULT_READING_SIZE}');
    document.documentElement.setAttribute('data-theme-init', '');
  }
})();
`;
