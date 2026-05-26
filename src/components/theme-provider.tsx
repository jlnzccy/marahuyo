"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_THEME, STORAGE_KEY, type Theme, isTheme } from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (next: Theme) => void;
  cycle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (isTheme(current)) setThemeState(current);
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

  const cycle = useCallback(() => {
    setTheme(theme === "light" ? "cream" : theme === "cream" ? "midnight" : "light");
  }, [theme, setTheme]);

  const value = useMemo(() => ({ theme, setTheme, cycle }), [theme, setTheme, cycle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

/** Inline script injected pre-hydration to avoid theme flash. */
export const themeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    var theme = (stored === 'cream' || stored === 'light' || stored === 'midnight') ? stored : '${DEFAULT_THEME}';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme-init', '');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', '${DEFAULT_THEME}');
    document.documentElement.setAttribute('data-theme-init', '');
  }
})();
`;
