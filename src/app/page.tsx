import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReaderContainer } from "@/components/reader-container";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FeaturedCard } from "@/components/featured-card";
import { WorkRow, workHref } from "@/components/work-row";
import { ContinueReading } from "@/components/continue-reading";
import { FadeUp } from "@/components/motion";
import { getFeaturedWork, getRecentDispatches, getRandomEpigraph } from "@/lib/works";
import { getSiteSettings } from "@/lib/settings";

export default async function HomePage() {
  const featured = await getFeaturedWork();
  const featuredHref = featured ? workHref(featured) : "/works";

  const recentRaw = await getRecentDispatches(5);
  const recent = recentRaw.filter((w) => w.id !== featured?.id).slice(0, 4);

  const { author } = await getSiteSettings();
  const epigraph = await getRandomEpigraph();

  return (
    <>
      <SiteHeader transparentOnTop />
      <main>
        {/* ---------- Hero: Author intro ---------- */}
        <section className="relative pt-20 pb-24 md:pt-28 md:pb-32">
          <ReaderContainer width="wide">
            <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
              <FadeUp delay={0.05}>
                <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-border/60 bg-surface">
                  <Image
                    src={author.portraitUrl}
                    alt={`Portrait of ${author.name}`}
                    fill
                    sizes="(min-width: 768px) 480px, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </FadeUp>
              <FadeUp delay={0.15}>
                <p className="meta mb-4">a literary archive · est. 2026</p>
                <h1 className="font-serif text-5xl font-bold leading-tight text-balance md:text-6xl">
                  Hey — it&rsquo;s{" "}
                  <span className="font-italic italic font-normal">{author.name}</span>.
                </h1>
                {author.subtitle && (
                  <p className="mt-4 font-italic italic text-xl text-muted md:text-2xl">
                    {author.subtitle}
                  </p>
                )}
                <p className="mt-6 max-w-prose font-serif text-reading-sm text-muted text-pretty">
                  {author.shortBio}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Link
                    href={featuredHref}
                    className="group inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 font-sans text-sm font-medium text-canvas transition-transform hover:scale-[1.02]"
                  >
                    Start with the latest
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-45" />
                  </Link>
                  <Link
                    href="/about"
                    className="group inline-flex items-center gap-2 font-sans text-sm text-muted underline decoration-muted/30 underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink"
                  >
                    Read the long version
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-45" />
                  </Link>
                </div>
              </FadeUp>
            </div>
          </ReaderContainer>
        </section>

        {/* ---------- Featured ---------- */}
        {featured && (
          <section className="pb-24">
            <ReaderContainer width="wide">
              <div className="mb-6 flex items-end justify-between">
                <h2 className="font-italic italic text-2xl text-muted md:text-3xl">
                  the latest letter
                </h2>
                <Link
                  href="/works"
                  className="meta hover:text-ink transition-colors"
                >
                  full archive →
                </Link>
              </div>
              <FeaturedCard work={featured} href={featuredHref} />
            </ReaderContainer>
          </section>
        )}

        {/* ---------- Continue reading (client, localStorage-driven) ---------- */}
        <ContinueReading />

        {/* ---------- Recent letters ---------- */}
        {recent.length > 0 && (
          <section className="pb-24">
            <ReaderContainer width="wide">
              <div className="mb-8 flex items-end justify-between border-b border-border/60 pb-6">
                <div>
                  <p className="meta mb-2">recent letters</p>
                  <h2 className="font-serif text-3xl font-bold md:text-4xl">
                    Quieter <span className="font-italic italic font-normal">things</span>
                  </h2>
                </div>
                <Link
                  href="/works"
                  className="hidden font-sans text-sm text-muted hover:text-ink transition-colors md:inline"
                >
                  All works →
                </Link>
              </div>

              <div className="mx-auto max-w-4xl">
                {recent.map((work) => (
                  <WorkRow key={work.id} work={work} />
                ))}
              </div>

              <div className="mt-12 text-center">
                <Link
                  href="/works"
                  className="font-italic italic text-lg text-muted underline decoration-muted/30 underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink"
                >
                  wander the rest of the archive →
                </Link>
              </div>
            </ReaderContainer>
          </section>
        )}

        {/* ---------- Closing voice ---------- */}
        {epigraph && (
          <section className="pb-32">
            <ReaderContainer>
              <div className="rounded-2xl border border-border/60 bg-surface/40 p-8 text-center md:p-14">
                <p className="font-italic italic text-2xl leading-snug text-ink text-pretty md:text-3xl">
                  &ldquo;{epigraph.text}&rdquo;
                </p>
                <p className="meta mt-6">
                  from{" "}
                  <Link
                    href={`/read/${epigraph.slug}`}
                    className="underline decoration-muted/30 underline-offset-[4px] transition-colors hover:text-ink hover:decoration-ink"
                  >
                    &ldquo;{epigraph.title}&rdquo;
                  </Link>
                </p>
              </div>
            </ReaderContainer>
          </section>
        )}
      </main>
      <SiteFooter />
      <ThemeSwitcher />
    </>
  );
}
