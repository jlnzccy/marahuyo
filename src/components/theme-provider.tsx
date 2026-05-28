"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_THEME, STORAGE_KEY, type Theme, isTheme } from "@/lib/theme";
import {
  DEFAULT_READING_SIZE,
  READING_SIZE_STORAGE_KEY,
  type ReadingSize,
  isReadingSize
} from "@/lib/reading-size";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (next: Theme) => void;
  cycle: () => void;
  readingSize: ReadingSize;
  setReadingSize: (next: ReadingSize) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [readingSize, setReadingSizeState] = useState<ReadingSize>(DEFAULT_READING_SIZE);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (isTheme(currentTheme)) setThemeState(currentTheme);
    const currentSize = document.documentElement.getAttribute("data-reading-size");
    if (isReadingSize(currentSize)) setReadingSizeState(currentSize);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
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
    setTheme(theme === "light" ? "cream" : theme === "cream" ? "midnight" : "light");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, cycle, readingSize, setReadingSize }),
    [theme, setTheme, cycle, readingSize, setReadingSize]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

/** Inline script injected pre-hydration to avoid theme + size flash. */
export const themeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    var theme = (stored === 'cream' || stored === 'light' || stored === 'midnight') ? stored : '${DEFAULT_THEME}';
    document.documentElement.setAttribute('data-theme', theme);
    var size = localStorage.getItem(${JSON.stringify(READING_SIZE_STORAGE_KEY)});
    if (size === 'sm' || size === 'md' || size === 'lg') {
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
