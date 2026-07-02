"use client";

import { Capacitor } from "@capacitor/core";
import type { Theme } from "@/lib/theme";
import { THEME_CANVAS } from "@/lib/theme";

/**
 * Thin, SSR-safe wrappers around the Capacitor native plugins. Every call is
 * gated on `isNative()` and the plugin is dynamically imported, so:
 *   - on the web (browser / PWA) nothing here loads or runs — the plugin code
 *     is split into a chunk that's only fetched inside the native shell;
 *   - failures never throw into the UI (each call is try/caught).
 *
 * The detection mirrors `useAppShell`, but this layer is specifically the
 * *native* bridge (Capacitor only), not the broader "installed app" notion.
 */

export function isNative(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

/* ── Haptics ─────────────────────────────────────────────── */

export async function hapticLight(): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* plugin unavailable */
  }
}

export async function hapticSelection(): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics } = await import("@capacitor/haptics");
    await Haptics.selectionStart();
    await Haptics.selectionEnd();
  } catch {
    /* plugin unavailable */
  }
}

/* ── Share ───────────────────────────────────────────────── */

/**
 * Native share sheet. Returns true if the native plugin handled it, false if
 * it isn't native (or failed) so callers can fall back to the Web Share API /
 * clipboard path they already have.
 */
export async function nativeShare(opts: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { Share } = await import("@capacitor/share");
    await Share.share(opts);
    return true;
  } catch {
    return false;
  }
}

/* ── Status bar ──────────────────────────────────────────── */

/**
 * Match the system status bar to the active reading temperature. Light/Cream
 * are light surfaces → dark icons (`Style.Light`); Midnight is dark → light
 * icons (`Style.Dark`).
 */
export async function setStatusBarTheme(theme: Theme): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setBackgroundColor({ color: THEME_CANVAS[theme] });
    await StatusBar.setStyle({
      style: theme === "midnight" ? Style.Dark : Style.Light,
    });
  } catch {
    /* plugin unavailable */
  }
}

/* ── Splash screen ───────────────────────────────────────── */

export async function hideSplash(): Promise<void> {
  if (!isNative()) return;
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* plugin unavailable */
  }
}
