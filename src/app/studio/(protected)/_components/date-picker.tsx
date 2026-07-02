"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  /** ISO YYYY-MM-DD string, or "" when unset. */
  value: string;
  /** Fires with new ISO string or "" when cleared. */
  onChange: (next: string) => void;
  /** Max ISO date (inclusive). Days after this are disabled. */
  max?: string;
  /** ISO placeholder shown in the trigger when value is empty. */
  placeholder?: string;
  /** Optional id for the trigger button (so labels can point at it). */
  id?: string;
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
] as const;

export function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromIso(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatLabel(s: string): string {
  const d = fromIso(s);
  if (!d) return "";
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function daysInMonth(year: number, monthIdx: number): number {
  return new Date(year, monthIdx + 1, 0).getDate();
}

export function DatePicker({ value, onChange, max, placeholder = "Pick a date", id }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  /* Month being viewed in calendar. Initialise from value, else today. */
  const initial = useMemo(() => fromIso(value) ?? new Date(), [value]);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  /* When opening, reset the view to the selected date (or today). */
  useEffect(() => {
    if (open) {
      const base = fromIso(value) ?? new Date();
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
    }
  }, [open, value]);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const wrap = wrapRef.current;
      if (wrap && !wrap.contains(e.target as Node)) setOpen(false);
    };
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [open]);

  const maxDate = useMemo(() => fromIso(max ?? "") ?? null, [max]);
  const todayIso = useMemo(() => toIso(new Date()), []);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const dayCount = daysInMonth(viewYear, viewMonth);

  /* Build a flat array of cells: leading blanks + day numbers. */
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= dayCount; d++) cells.push(d);

  const pick = (day: number) => {
    const iso = toIso(new Date(viewYear, viewMonth, day));
    if (maxDate && iso > toIso(maxDate)) return;
    onChange(iso);
    setOpen(false);
  };

  const clear = () => {
    onChange("");
    setOpen(false);
  };

  const goToday = () => {
    onChange(todayIso);
    setOpen(false);
  };

  const todayDisabled = maxDate ? todayIso > toIso(maxDate) : false;

  return (
    <div ref={wrapRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "mt-1.5 flex w-full items-center justify-between gap-2 rounded-md border border-border/80 bg-canvas px-3 py-1.5",
          "font-mono text-xs text-ink transition-colors",
          "hover:border-accent/60 focus:border-accent focus:outline-none",
          !value && "text-whisper"
        )}
      >
        <span className="truncate">{value ? formatLabel(value) : placeholder}</span>
        <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted" />
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 z-30 mt-1.5",
            "rounded-xl border border-border/60 bg-canvas p-3 shadow-xl"
          )}
        >
          {/* Month nav */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="inline-flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-surface hover:text-ink"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="font-sans text-xs font-medium text-ink">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="inline-flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-surface hover:text-ink"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Weekday header */}
          <div className="mb-1 grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((d, i) => (
              <span
                key={i}
                className="font-mono text-[10px] uppercase tracking-meta text-whisper"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (day === null) return <span key={i} className="h-7" />;
              const iso = toIso(new Date(viewYear, viewMonth, day));
              const selected = iso === value;
              const isToday = iso === todayIso;
              const disabled = maxDate ? iso > toIso(maxDate) : false;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(day)}
                  disabled={disabled}
                  className={cn(
                    "inline-flex h-7 items-center justify-center rounded font-mono text-xs transition-colors",
                    selected && "bg-ink text-canvas",
                    !selected && !disabled && "text-ink hover:bg-surface",
                    !selected && isToday && "ring-1 ring-accent/40",
                    disabled && "cursor-not-allowed text-whisper/50"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2">
            <button
              type="button"
              onClick={clear}
              disabled={!value}
              className={cn(
                "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-meta",
                value ? "text-muted hover:text-red-600" : "cursor-not-allowed text-whisper/50"
              )}
            >
              <X className="h-3 w-3" /> clear
            </button>
            <button
              type="button"
              onClick={goToday}
              disabled={todayDisabled}
              className={cn(
                "font-mono text-[10px] uppercase tracking-meta",
                todayDisabled
                  ? "cursor-not-allowed text-whisper/50"
                  : "text-muted hover:text-ink"
              )}
            >
              today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
