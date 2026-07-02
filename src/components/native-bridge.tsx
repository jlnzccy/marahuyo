"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { isNative, setStatusBarTheme, hideSplash } from "@/lib/native";

/**
 * Wires the Capacitor native shell to the running web app. Mounted once inside
 * ThemeProvider (so it can read the resolved theme). No-ops entirely on the web
 * — every effect bails when `isNative()` is false, and the plugins are
 * dynamically imported inside the gated helpers, so the browser bundle is
 * unaffected.
 *
 * Responsibilities:
 *   - hide the native splash on first paint (config keeps it up until then),
 *   - keep the status bar color/style in lockstep with the reading temperature,
 *   - hardware back button: close an open overlay, else navigate back, else exit,
 *   - keyboard resize mode for the Studio editor.
 */
export function NativeBridge() {
  const router = useRouter();
  const { theme } = useTheme();

  // First-paint: dismiss splash + set keyboard behavior. Once per launch.
  useEffect(() => {
    if (!isNative()) return;
    hideSplash();

    const cleanup = () => {};
    (async () => {
      try {
        const { Keyboard, KeyboardResize } = await import("@capacitor/keyboard");
        await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
      } catch {
        /* keyboard plugin unavailable */
      }
    })();

    return () => cleanup();
  }, []);

  // Status bar follows the active reading temperature.
  useEffect(() => {
    if (!isNative()) return;
    setStatusBarTheme(theme);
  }, [theme]);

  // Hardware back button.
  useEffect(() => {
    if (!isNative()) return;
    let remove = () => {};

    (async () => {
      try {
        const { App } = await import("@capacitor/app");
        const handle = await App.addListener("backButton", ({ canGoBack }) => {
          // Every sheet/menu/overlay in the app locks body scroll via the
          // `overflow-hidden` class. If one is open, send Escape — they all
          // close on it — instead of navigating away.
          if (document.body.classList.contains("overflow-hidden")) {
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
            );
            return;
          }
          if (canGoBack || window.history.length > 1) {
            router.back();
          } else {
            App.exitApp();
          }
        });
        remove = () => handle.remove();
      } catch {
        /* app plugin unavailable */
      }
    })();

    return () => remove();
  }, [router]);

  return null;
}
