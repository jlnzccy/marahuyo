"use client";

import { Sun, Moon, Coffee, Monitor, Type } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import {
  THEME_PREFERENCES,
  PREFERENCE_LABEL,
  type ThemePreference,
} from "@/lib/theme";
import { READING_SIZES, READING_SIZE_LABELS } from "@/lib/reading-size";
import { cn } from "@/lib/cn";

const PREF_ICONS: Record<
  ThemePreference,
  React.ComponentType<{ className?: string }>
> = {
  auto: Monitor,
  cream: Coffee,
  light: Sun,
  midnight: Moon,
};

/**
 * Reading-temperature + text-size controls. Shared by the More sheet and the
 * in-reader settings sheet so both stay in lockstep. Place inside a padded
 * container.
 */
export function ReadingSettings() {
  const { preference, setPreference, readingSize, setReadingSize } = useTheme();

  return (
    <div>
      <p className="meta mb-2.5 px-0.5">Reading temperature</p>
      <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-2">
        {THEME_PREFERENCES.map((p) => {
          const Icon = PREF_ICONS[p];
          const isActive = p === preference;
          return (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setPreference(p)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left font-sans text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isActive
                  ? "border-accent/60 bg-surface text-ink"
                  : "border-border/60 text-muted hover:text-ink"
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-md border bg-canvas",
                  isActive ? "border-accent/60" : "border-border/60"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium">{PREFERENCE_LABEL[p]}</span>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-accent"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
        <span className="meta inline-flex items-center gap-1.5">
          <Type className="h-3 w-3" aria-hidden="true" />
          Type
        </span>
        <div
          role="radiogroup"
          aria-label="Reader text size"
          className="flex items-center gap-1"
        >
          {READING_SIZES.map((s) => {
            const isActive = s === readingSize;
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={`${READING_SIZE_LABELS[s]} text`}
                onClick={() => setReadingSize(s)}
                className={cn(
                  "h-8 min-w-[32px] rounded-md border px-2 font-serif text-ink transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  isActive
                    ? "border-accent/60 bg-surface"
                    : "border-border/60 text-muted hover:text-ink"
                )}
              >
                <span
                  className="block"
                  style={{
                    fontSize: s === "xs" ? 9 : s === "sm" ? 11 : s === "md" ? 13 : 16,
                    lineHeight: 1,
                  }}
                >
                  A
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
