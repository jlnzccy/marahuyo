import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReaderContainer } from "@/components/reader-container";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FeaturedCard } from "@/components/featured-card";
import { WorkRow, workHref } from "@/components/work-row";
import { FadeUp } from "@/components/motion";
import { AUTHOR, FEATURED_WORK, POEMS, ESSAYS, ONESHOTS } from "@/lib/mock-content";

export default function HomePage() {
  const featuredHref = workHref(FEATURED_WORK);

  const recent = [...ESSAYS, ...ONESHOTS, ...POEMS]
    .filter((w) => w.status === "published")
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
    // Featured already shown above; skip it in the list.
    .filter((w) => w.id !== FEATURED_WORK.id)
    .slice(0, 4);

  return (
    <>
      <SiteHeader transparentOnTop />
      <main>
        {/* ---------- Hero ---------- */}
        <section className="relative pt-20 pb-24 md:pt-28 md:pb-32">
          <ReaderContainer width="wide">
            <FadeUp delay={0.05}>
              <p className="meta mb-6">a literary archive · est. 2026</p>
            </FadeUp>

            <FadeUp delay={0.12}>
              <h1 className="font-display lowercase leading-[0.92] text-[92px] md:text-[150px] lg:text-[200px]">
                marahuyo
              </h1>
            </FadeUp>

            <FadeUp delay={0.22} className="mt-5 max-w-2xl">
              <p className="font-italic italic text-2xl text-muted text-pretty md:text-3xl">
                to be enchanted —
              </p>
              <p className="mt-6 max-w-prose font-serif text-reading text-muted text-pretty">
                {AUTHOR.bio}
              </p>
            </FadeUp>

            <FadeUp delay={0.32} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={featuredHref}
                className="group inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 font-sans text-sm font-medium text-canvas transition-transform hover:scale-[1.02]"
              >
                Start with the latest
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-45" />
              </Link>
              <Link
                href="/works"
                className="group inline-flex items-center gap-2 font-sans text-sm text-muted underline decoration-muted/30 underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink"
              >
                Browse the archive
                <ArrowDown className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-y-0.5" />
              </Link>
            </FadeUp>
          </ReaderContainer>
        </section>

        {/* ---------- Featured ---------- */}
        <section className="pb-24">
          <ReaderContainer width="wide">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-italic italic text-2xl text-muted md:text-3xl">
                the latest dispatch
              </h2>
              <Link
                href="/works"
                className="meta hover:text-ink transition-colors"
              >
                full archive →
              </Link>
            </div>
            <FeaturedCard work={FEATURED_WORK} href={featuredHref} />
          </ReaderContainer>
        </section>

        {/* ---------- Author intro ---------- */}
        <section className="pb-24">
          <ReaderContainer width="wide">
            <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-border/60 bg-surface">
                <Image
                  src={AUTHOR.portraitUrl}
                  alt={`Portrait of ${AUTHOR.name}`}
                  fill
                  sizes="(min-width: 768px) 480px, 100vw"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="meta mb-4">about the author</p>
                <h2 className="font-serif text-4xl font-bold leading-tight text-balance md:text-5xl">
                  Hey — it&rsquo;s{" "}
                  <span className="font-italic italic font-normal">{AUTHOR.name}</span>.
                </h2>
                <p className="mt-4 font-italic italic text-xl text-muted md:text-2xl">
                  {AUTHOR.subtitle}
                </p>
                <p className="mt-6 max-w-prose font-serif text-reading-sm text-muted text-pretty">
                  {AUTHOR.shortBio}
                </p>
                <Link
                  href="/about"
                  className="mt-8 inline-flex items-center gap-2 font-sans text-sm font-medium text-ink underline decoration-ink/30 underline-offset-[6px] transition-all hover:decoration-ink"
                >
                  Read the long version
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </ReaderContainer>
        </section>

        {/* ---------- Recent dispatches ---------- */}
        <section className="pb-24">
          <ReaderContainer width="wide">
            <div className="mb-8 flex items-end justify-between border-b border-border/60 pb-6">
              <div>
                <p className="meta mb-2">recent dispatches</p>
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

        {/* ---------- Closing voice ---------- */}
        <section className="pb-32">
          <ReaderContainer>
            <div className="rounded-2xl border border-border/60 bg-surface/40 p-8 text-center md:p-14">
              <p className="font-italic italic text-2xl leading-snug text-ink text-pretty md:text-3xl">
                &ldquo;The algorithm doesn&rsquo;t know who you listened with. This is its mercy. This is also the other thing.&rdquo;
              </p>
              <p className="meta mt-6">from &ldquo;Wrapped&rdquo;</p>
            </div>
          </ReaderContainer>
        </section>
      </main>
      <SiteFooter />
      <ThemeSwitcher />
    </>
  );
}
