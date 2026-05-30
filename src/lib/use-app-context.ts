"use client";

import { useEffect, useState } from "react";

/**
 * Detects whether we're running inside the installed app shell — either the
 * Capacitor Android wrapper (native bridge injects a `window.Capacitor`) or an
 * installed PWA (display-mode: standalone). A `?app=1` query param forces it on
 * for browser testing and is remembered for the session.
 *
 * Resolves on mount via `useEffect` (starts `false` on the server + first client
 * render, then flips), so SSR markup never carries app chrome — no hydration
 * mismatch — and the client value applies reliably even on dynamic routes like
 * Studio, where a `useSyncExternalStore` re-render can be skipped.
 */

const STANDALONE_QUERY = "(display-mode: standalone)";
const OVERRIDE_KEY = "marahuyo:app-shell";

let overrideResolved = false;

function resolveOverride(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (!overrideResolved) {
      const param = new URLSearchParams(window.location.search).get("app");
      if (param === "1") window.sessionStorage.setItem(OVERRIDE_KEY, "1");
      else if (param === "0") window.sessionStorage.removeItem(OVERRIDE_KEY);
      overrideResolved = true;
    }
    return window.sessionStorage.getItem(OVERRIDE_KEY) === "1";
  } catch {
    return false;
  }
}

function detect(): boolean {
  if (typeof window === "undefined") return false;

  const cap = (window as unknown as {
    Capacitor?: { isNativePlatform?: () => boolean };
  }).Capacitor;
  if (cap?.isNativePlatform?.()) return true;

  try {
    if (window.matchMedia?.(STANDALONE_QUERY).matches) return true;
  } catch {
    /* matchMedia unavailable */
  }

  if ((window.navigator as unknown as { standalone?: boolean }).standalone === true) {
    return true;
  }

  return resolveOverride();
}

export function useAppShell(): boolean {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    const update = () => setIsApp(detect());
    update();

    let mql: MediaQueryList | undefined;
    try {
      mql = window.matchMedia(STANDALONE_QUERY);
      mql.addEventListener("change", update);
    } catch {
      /* matchMedia unavailable */
    }
    return () => mql?.removeEventListener("change", update);
  }, []);

  return isApp;
}
