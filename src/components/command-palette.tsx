"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  BookOpen,
  User,
  Mail,
  Settings,
  Home,
  Loader2,
  FileText,
  CornerDownLeft
} from "lucide-react";
import { cn } from "@/lib/cn";

type SearchHit = {
  type: "work" | "chapter";
  href: string;
  title: string;
  snippet: string;
  series?: string;
};

const QUICK_ACTIONS = [
  { label: "Go to Home", href: "/", icon: Home },
  { label: "Browse Works Archive", href: "/works", icon: BookOpen },
  { label: "Search Archive", href: "/search", icon: Search },
  { label: "Read About Jae Cua", href: "/about", icon: User },
  { label: "Get in Touch", href: "/contact", icon: Mail },
  { label: "Studio Dashboard", href: "/studio", icon: Settings }
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Trigger Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset query and active index on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      // Autofocus input
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  // Debounced search queries
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setActiveIndex(0);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const items = query.trim() ? results : QUICK_ACTIONS;

  const selectItem = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  // Keyboard navigation within list
  useEffect(() => {
    if (!open || items.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const activeItem = items[activeIndex];
        if (activeItem) {
          selectItem(activeItem.href);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, items, activeIndex, selectItem]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="no-print fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-ink/30 dark:bg-canvas/30 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 bg-surface/95 shadow-2xl backdrop-blur-xl"
            >
              {/* Search input header */}
              <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5">
                <Search className="h-4.5 w-4.5 shrink-0 text-whisper" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search works or jump to page..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent font-sans text-sm text-ink placeholder:text-whisper focus:outline-none"
                />
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-whisper" />
                ) : (
                  <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/80 bg-canvas px-1.5 font-mono text-[9px] font-medium text-whisper">
                    ESC
                  </kbd>
                )}
              </div>

              {/* Items List */}
              <div className="max-h-[360px] overflow-y-auto p-2 scrollbar-none">
                {items.length === 0 && !loading ? (
                  <div className="p-8 text-center font-sans text-sm text-muted">
                    No results found for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <div className="px-2 py-1.5 meta text-[10px]">
                      {query.trim() ? "Search Results" : "Quick Navigation"}
                    </div>
                    {items.map((item, idx) => {
                      const active = idx === activeIndex;
                      // Quick actions use the predefined icons. Hits use kind-specific icons.
                      const Icon = "icon" in item ? item.icon : FileText;
                      const subtitle = "series" in item ? `In ${item.series}` : undefined;

                      return (
                        <button
                          key={item.href + idx}
                          type="button"
                          onClick={() => selectItem(item.href)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={cn(
                            "group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus:outline-none",
                            active
                              ? "bg-canvas text-ink"
                              : "text-muted hover:bg-canvas/50 hover:text-ink"
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border/60 bg-canvas transition-colors",
                              active && "border-accent/40"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block font-serif text-sm font-bold text-ink">
                              {"label" in item ? item.label : item.title}
                            </span>
                            {subtitle && (
                              <span className="block font-italic italic text-xs text-muted/90 mt-0.5">
                                {subtitle}
                              </span>
                            )}
                            {"snippet" in item && item.snippet && (
                              <span
                                className="block font-sans text-xs text-whisper truncate mt-0.5"
                                dangerouslySetInnerHTML={{ __html: item.snippet }}
                              />
                            )}
                          </span>
                          {active && (
                            <span className="shrink-0 flex items-center self-center opacity-65 text-whisper">
                              <CornerDownLeft className="h-3 w-3" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Keyboard shortcuts footer help */}
              <div className="flex items-center justify-between border-t border-border/60 bg-canvas/30 px-4 py-2.5 font-mono text-[9px] text-whisper">
                <div className="flex items-center gap-3">
                  <span>
                    <kbd className="rounded bg-canvas border border-border/80 px-1 py-0.5 mr-1 font-sans">↑↓</kbd>
                    navigate
                  </span>
                  <span>
                    <kbd className="rounded bg-canvas border border-border/80 px-1 py-0.5 mr-1 font-sans">↵</kbd>
                    select
                  </span>
                </div>
                <span>Cmd+K to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
