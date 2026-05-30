"use client";

import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/wordmark";

/**
 * App-shell top chrome: just the centered 'marahuyo' wordmark on Home, sitting
 * in the page flow (no bar, no background, no border) — it scrolls away with the
 * content. Every other route has nothing here. Only mounted in the app shell
 * (SiteHeader swaps to it when `isAppShell`).
 */
export function AppTopBar() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <div className="flex justify-center px-5 pb-1 pt-[calc(env(safe-area-inset-top)+0.85rem)]">
      <Wordmark size="sm" />
    </div>
  );
}
