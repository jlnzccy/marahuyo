"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon, Coffee, Type, Monitor } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import {
  THEME_PREFERENCES,
  PREFERENCE_LABEL,
  PREFERENCE_DESCRIPTION,
  type Theme,
  type ThemePreference
} from "@/lib/theme";
import {
  READING_SIZES,
  READING_SIZE_LABELS,
  type ReadingSize
} from "@/lib/reading-size";
import { cn } from "@/lib/cn";
import { useAppShell } from "@/lib/use-app-context";

const ICONS: Record<ThemePreference, React.ComponentType<{ className?: string }>> = {
  auto: Monitor,
  cream: Coffee,
  light: Sun,
  midnight: Moon
};

const RESOLVED_ICONS: Record<Theme, React.ComponentType<{ className?: string }>> = {
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
  const { theme, preference, setPreference, readingSize, setReadingSize } = useTheme();
  const isApp = useAppShell();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const themeButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
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

  /* Focus return: when the panel closes, send focus back to the trigger. */
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current && !open) {
      triggerRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  /* Roving focus inside the theme radiogroup. ArrowUp/Down moves the active
     radio; Home/End jump to ends; Space/Enter selects (native button behaviour
     already triggers click via Space/Enter). */
  const onThemeKey = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
      let nextIdx: number | null = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight")
        nextIdx = (idx + 1) % THEME_PREFERENCES.length;
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
        nextIdx = (idx - 1 + THEME_PREFERENCES.length) % THEME_PREFERENCES.length;
      else if (e.key === "Home") nextIdx = 0;
      else if (e.key === "End") nextIdx = THEME_PREFERENCES.length - 1;
      if (nextIdx === null) return;
      e.preventDefault();
      const p = THEME_PREFERENCES[nextIdx];
      setPreference(p);
      themeButtonRefs.current[nextIdx]?.focus();
    },
    [setPreference]
  );

  /* Trigger glyph: show the user's chosen preference (so the Monitor icon
     surfaces when they're in `auto`). Falls back to the resolved theme. */
  const ActiveIcon =
    preference === "auto" ? ICONS.auto : RESOLVED_ICONS[theme];

  // The floating reading-themes button is replaced by the More sheet inside the
  // app shell; suppress it there so it doesn't collide with the bottom nav.
  if (floating && isApp) return null;



  return (
    <div
      ref={ref}
      className={cn(
        "no-print",
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
            <div role="radiogroup" aria-label="Theme">
              {THEME_PREFERENCES.map((p, idx) => {
                const Icon = ICONS[p];
                const active = p === preference;
                return (
                  <button
                    key={p}
                    ref={(el) => {
                      themeButtonRefs.current[idx] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setPreference(p)}
                    onKeyDown={(e) => onThemeKey(e, idx)}
                    className={cn(
                      "group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left font-sans text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
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
                      <span className="block font-medium text-ink">{PREFERENCE_LABEL[p]}</span>
                      <span className="block text-[12px] leading-snug text-whisper">
                        {PREFERENCE_DESCRIPTION[p]}
                      </span>
                    </span>
                    {active && (
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-1 flex items-center justify-between border-t border-border/60 px-3 pt-3 pb-1">
              <span className="meta inline-flex items-center gap-1.5">
                <Type className="h-3 w-3" aria-hidden="true" />
                Type
              </span>
              <div role="radiogroup" aria-label="Reader text size" className="flex items-center gap-1">
                {READING_SIZES.map((s) => {
                  const active = s === readingSize;
                  return (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={`${READING_SIZE_LABELS[s]} text`}
                      onClick={() => setReadingSize(s)}
                      className={cn(
                        "h-7 min-w-[28px] rounded-md border px-2 font-serif text-ink transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        active
                          ? "border-accent/60 bg-canvas"
                          : "border-border/60 bg-canvas/40 text-muted hover:text-ink"
                      )}
                    >
                      <SizeGlyph size={s} />
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={triggerRef}
        type="button"
        aria-label="Reading themes"
        aria-expanded={open}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.04 }}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "grid h-11 w-11 place-items-center rounded-full border border-border bg-surface/90 text-ink shadow-[0_10px_30px_-15px_rgba(0,0,0,0.4)] backdrop-blur transition-colors",
          "hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        )}
      >
        <ActiveIcon className="h-4 w-4" />
      </motion.button>
    </div>
  );
}

function SizeGlyph({ size }: { size: ReadingSize }) {
  const fontSize = size === "sm" ? 10 : size === "md" ? 13 : 16;
  return (
    <span className="block" style={{ fontSize, lineHeight: 1 }}>
      A
    </span>
  );
}
