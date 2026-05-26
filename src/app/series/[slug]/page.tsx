import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReaderContainer } from "@/components/reader-container";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { KindChip } from "@/components/kind-chip";
import { FadeUp } from "@/components/motion";
import { findSeriesBySlug, SERIES } from "@/lib/mock-content";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return SERIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const series = findSeriesBySlug(slug);
  if (!series) return {};
  return { title: series.title, description: series.excerpt };
}

export default async function SeriesPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const series = findSeriesBySlug(slug);
  if (!series) notFound();

  const published = series.chapters.filter((c) => c.status === "published");
  const drafts = series.chapters.filter((c) => c.status === "draft");
  const first = published[0];

  return (
    <>
      <SiteHeader />
      <main className="pt-12 pb-20 md:pt-20">
        <ReaderContainer width="wide">
          <FadeUp delay={0.05}>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <KindChip kind="series" />
              <span className="meta">
                {published.length} chapter{published.length === 1 ? "" : "s"} · ongoing
              </span>
            </div>
          </FadeUp>

          <FadeUp delay={0.12}>
            <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-balance md:text-6xl">
              {series.title}
            </h1>
          </FadeUp>
          {series.subtitle && (
            <FadeUp delay={0.2}>
              <p className="mt-4 max-w-2xl font-italic italic text-xl text-muted md:text-2xl">
                {series.subtitle}
              </p>
            </FadeUp>
          )}
          <FadeUp delay={0.28}>
            <p className="mt-6 max-w-prose font-serif text-reading-sm text-muted text-pretty">
              {series.excerpt}
            </p>
          </FadeUp>

          {first && (
            <FadeUp delay={0.36}>
              <div className="mt-8">
                <Link
                  href={`/series/${series.slug}/${first.slug}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 font-sans text-sm font-medium text-canvas transition-transform hover:scale-[1.02]"
                >
                  Start from chapter 01
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-45" />
                </Link>
              </div>
            </FadeUp>
          )}

          <div className="my-14 hairline" aria-hidden />

          <FadeUp>
            <h2 className="font-italic italic text-2xl text-muted md:text-3xl">chapters</h2>
            <ol className="mt-6 max-w-3xl">
              {published.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/series/${series.slug}/${c.slug}`}
                    className="group block border-t border-border/60 py-5 transition-colors hover:bg-surface/40"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-8">
                      <div className="meta md:w-24 md:shrink-0">
                        Ch. {String(c.number).padStart(2, "0")}
                      </div>
                      <div className="flex-1">
                        <div className="font-serif text-xl font-bold leading-snug text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5">
                          {c.title}
                        </div>
                        {c.subtitle && (
                          <div className="mt-1 font-italic italic text-base text-muted">
                            {c.subtitle}
                          </div>
                        )}
                      </div>
                      <div className="meta md:w-24 md:text-right">
                        {c.readingMinutes} min
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {drafts.map((c) => (
                <li key={c.id} className="border-t border-border/40">
                  <div className="flex items-baseline gap-8 py-5 opacity-50">
                    <div className="meta w-24">Ch. {String(c.number).padStart(2, "0")}</div>
                    <div className="flex-1 font-serif text-xl font-bold text-muted">
                      {c.title}
                    </div>
                    <div className="meta">draft</div>
                  </div>
                </li>
              ))}
            </ol>
          </FadeUp>
        </ReaderContainer>
      </main>
      <SiteFooter />
      <ThemeSwitcher />
    </>
  );
}
