"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon, Coffee, Type } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { THEMES, THEME_LABELS, THEME_DESCRIPTIONS, type Theme } from "@/lib/theme";
import { cn } from "@/lib/cn";

const ICONS: Record<Theme, React.ComponentType<{ className?: string }>> = {
  cream: Coffee,
  light: Sun,
  midnight: Moon
};

type Props = {
  /** Float bottom-right inside the viewport. Otherwise inline. */
  floating?: boolean;
  className?: string;
};

export function ThemeSwitcher({ floating = true, className }: Props) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ActiveIcon = ICONS[theme];

  return (
    <div
      ref={ref}
      className={cn(
        floating && "fixed bottom-6 right-6 z-50",
        className
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-14 right-0 w-72 origin-bottom-right rounded-2xl border border-border/80 bg-surface/95 p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl"
          >
            <div className="px-3 pt-2 pb-1 meta">Reading temperature</div>
            <ul role="listbox" aria-label="Theme">
              {THEMES.map((t) => {
                const Icon = ICONS[t];
                const active = t === theme;
                return (
                  <li key={t}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        setTheme(t);
                        setOpen(false);
                      }}
                      className={cn(
                        "group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left font-sans text-sm transition-colors",
                        active
                          ? "bg-canvas text-ink"
                          : "hover:bg-canvas/70 text-muted hover:text-ink"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid h-7 w-7 place-items-center rounded-md border border-border/60 bg-canvas",
                          active && "border-accent/60"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-medium text-ink">{THEME_LABELS[t]}</span>
                        <span className="block text-[12px] leading-snug text-whisper">
                          {THEME_DESCRIPTIONS[t]}
                        </span>
                      </span>
                      {active && (
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-1 flex items-center justify-between border-t border-border/60 px-3 pt-2 pb-1">
              <span className="meta">Type</span>
              <Type className="h-3 w-3 text-whisper" aria-hidden />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label="Reading themes"
        aria-expanded={open}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.04 }}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "grid h-11 w-11 place-items-center rounded-full border border-border bg-surface/90 text-ink shadow-[0_10px_30px_-15px_rgba(0,0,0,0.4)] backdrop-blur transition-colors",
          "hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        )}
      >
        <ActiveIcon className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
