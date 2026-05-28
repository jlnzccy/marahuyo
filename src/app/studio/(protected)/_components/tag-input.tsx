"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  value: string;
  onChange: (next: string) => void;
  /** Tags already in use across the studio — used as autocomplete pool. */
  knownTags: string[];
  placeholder?: string;
  className?: string;
};

const MAX_SUGGESTIONS = 6;

/**
 * Comma-separated tag input with autocomplete. The author types as normal;
 * once they're partway through a tag, we surface the matching known tags
 * underneath as a small popover. ArrowDown/ArrowUp navigates the list, Enter
 * or click inserts the suggestion, Escape dismisses.
 */
export function TagInput({
  value,
  onChange,
  knownTags,
  placeholder = "essay, memory, manila",
  className
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [highlight, setHighlight] = useState(0);
  const [open, setOpen] = useState(false);

  /* Splits the input into [prefix tags, current token]. The token is whatever
     follows the last comma — that's what the writer is editing right now. */
  const { committed, token } = useMemo(() => {
    const lastComma = value.lastIndexOf(",");
    if (lastComma === -1) {
      return { committed: "", token: value.trim() };
    }
    return {
      committed: value.slice(0, lastComma + 1),
      token: value.slice(lastComma + 1).trim()
    };
  }, [value]);

  const usedSet = useMemo(() => {
    return new Set(
      value
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    );
  }, [value]);

  const suggestions = useMemo(() => {
    if (token.length === 0) return [];
    const q = token.toLowerCase();
    return knownTags
      .filter((t) => {
        const lower = t.toLowerCase();
        if (lower === q) return false;
        if (usedSet.has(lower)) return false;
        return lower.includes(q);
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [knownTags, token, usedSet]);

  useEffect(() => {
    setHighlight(0);
  }, [suggestions.length]);

  const insertSuggestion = useCallback(
    (tag: string) => {
      const head = committed.length > 0 ? `${committed.replace(/,\s*$/, "")}, ` : "";
      onChange(`${head}${tag}, `);
      setOpen(false);
      ref.current?.focus();
    },
    [committed, onChange]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertSuggestion(suggestions[highlight]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay closing so a mousedown on a suggestion still registers.
          window.setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          "mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-1.5 font-mono text-xs text-ink placeholder:text-whisper focus:border-accent focus:outline-none",
          className
        )}
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-autocomplete="list"
        aria-controls="tag-autocomplete-list"
      />
      {open && suggestions.length > 0 && (
        <ul
          id="tag-autocomplete-list"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-border/80 bg-canvas shadow-lg"
        >
          {suggestions.map((tag, idx) => (
            <li key={tag} role="option" aria-selected={idx === highlight}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertSuggestion(tag);
                }}
                onMouseEnter={() => setHighlight(idx)}
                className={cn(
                  "block w-full px-3 py-1.5 text-left font-mono text-xs transition-colors",
                  idx === highlight
                    ? "bg-surface text-ink"
                    : "text-muted hover:text-ink"
                )}
              >
                {tag}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
