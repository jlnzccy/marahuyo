import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReaderContainer } from "@/components/reader-container";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { CoverHero } from "@/components/cover-hero";
import { SeriesChapters } from "@/components/series-progress";
import { FadeUp } from "@/components/motion";
import { getPublishedSeriesSlugs, getSeriesBySlug } from "@/lib/works";

type Params = { slug: string };

export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getPublishedSeriesSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) return {};
  return { title: series.title, description: series.excerpt };
}

export default async function SeriesPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) notFound();

  const published = series.chapters.filter((c) => c.status === "published");
  const chapters = published.map((c) => ({
    slug: c.slug,
    number: c.number,
    title: c.title,
    subtitle: c.subtitle,
    readingMinutes: c.readingMinutes
  }));

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="pt-12 pb-20 md:pt-20">
        <ReaderContainer width="wide">
          <CoverHero
            kind="series"
            title={series.title}
            eyebrow={`${published.length} chapter${published.length === 1 ? "" : "s"} · ${series.seriesStatus}`}
            subtitle={series.subtitle}
            coverImage={series.coverImage}
            priority
          />

          <FadeUp delay={0.28}>
            <p className="mt-8 max-w-prose font-serif text-reading-sm text-muted text-pretty">
              {series.excerpt}
            </p>
          </FadeUp>

          <SeriesChapters seriesSlug={series.slug} chapters={chapters} />
        </ReaderContainer>
      </main>
      <SiteFooter />
      <ThemeSwitcher />
    </>
  );
}
