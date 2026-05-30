"use client";

import { useEffect } from "react";
import { useAppShell } from "@/lib/use-app-context";

/**
 * Toggles a global `app-shell` class on <html> whenever we're in the installed
 * app, so plain CSS can adapt chrome on every route — including the reader,
 * where the bottom nav is absent (its own class can't be relied on there).
 */
export function AppShellFlag() {
  const isApp = useAppShell();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("app-shell", isApp);
    return () => root.classList.remove("app-shell");
  }, [isApp]);
  return null;
}
