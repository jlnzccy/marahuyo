import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { ReaderContainer } from "@/components/reader-container";
import { FadeUp } from "@/components/motion";
import { sanitizeHtml } from "@/lib/sanitize";
import { search } from "@/lib/search";

export const metadata = {
  title: "Search — marahuyo"
};

type SearchParams = Promise<{ q?: string }>;

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const hits = query ? await search(query) : [];

  return (
    <main id="main-content" className="pt-16 pb-20 md:pt-24">
      <ReaderContainer width="wide">
        <FadeUp>
          <p className="meta mb-4">archive · search</p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-balance md:text-5xl">
            Find a <span className="font-italic italic font-normal">passage</span>
          </h1>
        </FadeUp>

        <form action="/search" method="get" className="mt-10">
          <label
            htmlFor="search-query"
            className="sr-only"
          >
            Search the archive
          </label>
          <div className="flex items-center gap-2 rounded-full border border-border/80 bg-surface/40 px-4 py-3 focus-within:border-ink">
            <SearchIcon className="h-4 w-4 text-whisper" aria-hidden="true" />
            <input
              id="search-query"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="a word, a name, a half-remembered line…"
              autoFocus
              autoComplete="off"
              className="w-full bg-transparent font-serif text-lg text-ink placeholder:text-whisper focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-ink px-3 py-1 font-sans text-xs text-canvas transition-opacity hover:opacity-95"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-12">
          {!query && (
            <p className="font-italic italic text-lg text-muted">
              type something above — the archive will answer.
            </p>
          )}

          {query && hits.length === 0 && (
            <p className="font-italic italic text-lg text-muted">
              nothing matches “{query}” yet.
            </p>
          )}

          {hits.length > 0 && (
            <FadeUp delay={0.05}>
              <p className="meta mb-6">
                {hits.length} {hits.length === 1 ? "result" : "results"}
              </p>
              <ul className="divide-y divide-border/60">
                {hits.map((hit) => (
                  <li key={`${hit.type}-${hit.href}`} className="py-6">
                    <Link href={hit.href} className="group block">
                      <div className="flex items-baseline gap-3">
                        <span className="meta">
                          {hit.type === "chapter" ? "chapter" : "letter"}
                          {hit.series ? ` · ${hit.series}` : ""}
                        </span>
                      </div>
                      <h2 className="mt-1.5 font-serif text-2xl font-bold leading-tight text-ink transition-transform group-hover:translate-x-0.5">
                        {hit.title}
                      </h2>
                      {hit.snippet && (
                        <p
                          className="mt-2 max-w-prose font-serif text-base leading-relaxed text-muted text-pretty"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(hit.snippet)
                          }}
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </FadeUp>
          )}
        </div>
      </ReaderContainer>
    </main>
  );
}
