"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Search as SearchIcon } from "lucide-react";

type Props = {
  initialQuery: string;
};

/**
 * Client island for the /search form. Mirrors the server-rendered version but
 * adds a controlled input so we can show a "Clear" link whenever the query
 * is non-empty.
 */
export function SearchForm({ initialQuery }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialQuery);

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus();
    router.push("/search");
  };

  return (
    <form action="/search" method="get" className="mt-10">
      <label htmlFor="search-query" className="sr-only">
        Search the archive
      </label>
      <div className="flex items-center gap-2 rounded-full border border-border/80 bg-surface/40 px-4 py-3 transition-all duration-300 focus-within:border-accent/80 focus-within:ring-4 focus-within:ring-accent/10">
        <SearchIcon className="h-4 w-4 shrink-0 text-whisper" aria-hidden="true" />
        <input
          ref={inputRef}
          id="search-query"
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="a word, a name, a half-remembered line…"
          autoFocus
          autoComplete="off"
          className="w-full bg-transparent font-serif text-lg text-ink placeholder:text-whisper focus:outline-none"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 font-sans text-sm text-muted transition-colors hover:text-ink"
          >
            Clear
          </button>
        )}
        <button
          type="submit"
          className="shrink-0 rounded-full bg-ink px-3 py-1 font-sans text-xs text-canvas transition-opacity hover:opacity-95"
        >
          Search
        </button>
      </div>
    </form>
  );
}
