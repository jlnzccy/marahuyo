"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { NavLink } from "@/components/nav-link";
import { cn } from "@/lib/cn";

type Props = {
  /** On reading canvas: header hides on scroll-down, returns on scroll-up. */
  scrollAware?: boolean;
  /** Transparent until scrolled (used on hero pages). */
  transparentOnTop?: boolean;
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Works" },
  { href: "/search", label: "Search" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  scrollAware = false,
  transparentOnTop = false,
}: Props) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (scrollAware) {
      if (latest > prev && latest > 240) setHidden(true);
      else setHidden(false);
    }
    setScrolled(latest > 8);
  });

  /* ── Body scroll lock ─────────────────────────────────── */
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen]);

  /* ── Escape key closes menu ────────────────────────────── */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: hidden ? -96 : 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "sticky top-0 z-40 w-full transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || !transparentOnTop
            ? "border-b border-border/60 bg-canvas/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <Wordmark size="sm" />

          {/* ── Desktop nav ───────────────────────────────── */}
          <nav
            aria-label="Primary"
            className="hidden items-center gap-7 md:flex"
          >
            {NAV.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Mobile hamburger button ───────────────────── */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className={cn(
              "relative z-50 flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:hidden",
              "text-muted hover:text-ink hover:bg-border/40 active:bg-border/60"
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={22} strokeWidth={1.8} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={22} strokeWidth={1.8} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* ── Mobile full-screen menu overlay ────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-30 flex flex-col bg-canvas/95 backdrop-blur-2xl md:hidden"
          >
            {/* Spacer matching header height */}
            <div className="h-16 shrink-0" />

            <nav
              aria-label="Mobile navigation"
              className="flex flex-1 flex-col items-center justify-center gap-1 px-8"
            >
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.06 * i,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="w-full max-w-xs"
                >
                  {i > 0 && (
                    <div className="mx-auto mb-1 h-px w-full bg-border/40" />
                  )}
                  <div onClick={closeMenu} className="block">
                    <NavLink
                      href={item.href}
                      className="flex w-full items-center justify-center py-4 text-xl font-medium tracking-tight"
                    >
                      {item.label}
                    </NavLink>
                  </div>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
