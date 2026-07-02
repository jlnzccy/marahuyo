"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { Home, Library, Search, Bookmark, Menu } from "lucide-react";
import { useAppShell } from "@/lib/use-app-context";
import { MoreSheet } from "@/components/more-sheet";
import { hapticSelection, hapticLight } from "@/lib/native";
import { cn } from "@/lib/cn";

type Tab = {
  href: string;
  label: string;
  icon: typeof Home;
  isActive: (path: string) => boolean;
};

const TABS: Tab[] = [
  { href: "/", label: "Home", icon: Home, isActive: (p) => p === "/" },
  {
    href: "/works",
    label: "Works",
    icon: Library,
    isActive: (p) =>
      p.startsWith("/works") ||
      p.startsWith("/read") ||
      p.startsWith("/series"),
  },
  {
    href: "/search",
    label: "Search",
    icon: Search,
    isActive: (p) => p.startsWith("/search"),
  },
  {
    href: "/saved",
    label: "Saved",
    icon: Bookmark,
    isActive: (p) => p.startsWith("/saved"),
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Native-feeling tab bar shown only inside the installed app shell (see
 * `useAppShell`). Hidden in the regular browser and on Studio routes. The
 * frosted styling reuses the floating-chrome pattern DESIGN.md sanctions for
 * UI that hovers over scrolling content (translucent canvas + backdrop-blur +
 * hairline + soft shadow) — not decorative glass.
 */
export function BottomNav() {
  const isApp = useAppShell();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isReader =
    pathname.startsWith("/read") ||
    /^\/series\/[^/]+\/[^/]+/.test(pathname);
  // Hidden only inside the immersive chapter reader (its own chrome); stays
  // visible in Studio so you can navigate back out of the CMS.
  const active = isApp && !isReader;

  // Reserve bottom space so footers / last cards clear the fixed bar.
  useEffect(() => {
    const root = document.documentElement;
    if (active) root.classList.add("app-bottom-nav");
    else root.classList.remove("app-bottom-nav");
    return () => root.classList.remove("app-bottom-nav");
  }, [active]);

  // Drop on scroll-down, return on scroll-up (mirrors the reading header).
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (moreOpen) return;
    const prev = scrollY.getPrevious() ?? 0;
    if (latest > prev && latest > 180) setHidden(true);
    else setHidden(false);
  });

  if (!active) return null;

  return (
    <>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />

      <motion.nav
        aria-label="App navigation"
        initial={false}
        animate={{ y: hidden && !moreOpen ? 120 : 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: EASE }}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 md:hidden",
          "border-t border-border/60 bg-canvas/85 backdrop-blur-xl",
          "shadow-[0_-6px_18px_-16px_rgba(0,0,0,0.12)]",
          "pb-[max(env(safe-area-inset-bottom),0.5rem)]"
        )}
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1.5">
          {TABS.map((tab) => {
            const isActive = tab.isActive(pathname);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  if (!isActive) void hapticSelection();
                }}
                className="relative flex flex-1 items-center justify-center py-3.5"
              >
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    aria-hidden="true"
                    className="absolute top-0 h-[2px] w-8 rounded-full bg-accent"
                    transition={
                      reduceMotion ? { duration: 0 } : { duration: 0.4, ease: EASE }
                    }
                  />
                )}
                <Icon
                  size={25}
                  strokeWidth={isActive ? 2 : 1.6}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-ink" : "text-whisper"
                  )}
                />
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => {
              void hapticLight();
              setMoreOpen(true);
            }}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            aria-label="More"
            className="relative flex flex-1 items-center justify-center py-3.5"
          >
            <Menu
              size={25}
              strokeWidth={moreOpen ? 2 : 1.6}
              className={cn(
                "transition-colors",
                moreOpen ? "text-ink" : "text-whisper"
              )}
            />
          </button>
        </div>
      </motion.nav>
    </>
  );
}
