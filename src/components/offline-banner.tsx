"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { isNative } from "@/lib/native";
import { cn } from "@/lib/cn";

/**
 * Quiet connectivity banner. Uses the Capacitor Network plugin inside the
 * native shell (more reliable than `navigator.onLine` on Android WebView) and
 * the `online`/`offline` events on the web. Slides in only while offline; stays
 * out of the way otherwise. Safe-area aware so it clears the status bar.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let remove = () => {};

    if (isNative()) {
      (async () => {
        try {
          const { Network } = await import("@capacitor/network");
          const status = await Network.getStatus();
          setOffline(!status.connected);
          const handle = await Network.addListener(
            "networkStatusChange",
            (s) => setOffline(!s.connected)
          );
          remove = () => handle.remove();
        } catch {
          /* network plugin unavailable */
        }
      })();
    } else {
      const sync = () => setOffline(!navigator.onLine);
      sync();
      window.addEventListener("online", sync);
      window.addEventListener("offline", sync);
      remove = () => {
        window.removeEventListener("online", sync);
        window.removeEventListener("offline", sync);
      };
    }

    return () => remove();
  }, []);

  return (
    <div
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 top-0 z-[70] flex justify-center transition-transform duration-300 ease-out",
        "pt-[env(safe-area-inset-top)]",
        offline ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="flex items-center gap-2 rounded-b-xl border border-t-0 border-border/60 bg-surface px-4 py-2 font-sans text-sm text-muted shadow-[0_8px_24px_-18px_rgba(0,0,0,0.3)]">
        <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
        You&rsquo;re offline
      </div>
    </div>
  );
}
