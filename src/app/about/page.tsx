import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReaderContainer } from "@/components/reader-container";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FadeUp } from "@/components/motion";
import { AUTHOR } from "@/lib/mock-content";

export const metadata = {
  title: "About"
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-16 pb-24 md:pt-24">
        <ReaderContainer width="wide">
          <FadeUp>
            <p className="meta mb-6">a preface</p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-balance md:text-6xl">
              Hey! It&rsquo;s{" "}
              <span className="font-italic italic font-normal">{AUTHOR.name}</span>,
            </h1>
            <p className="mt-4 font-italic italic text-2xl text-muted md:text-3xl">
              {AUTHOR.subtitle}
            </p>
          </FadeUp>

          <div className="my-12 grid items-start gap-12 md:grid-cols-[1fr_1.4fr] md:gap-16">
            {/* Portrait */}
            <FadeUp delay={0.1}>
              <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-border/60 bg-surface">
                <Image
                  src={AUTHOR.portraitUrl}
                  alt={`Portrait of ${AUTHOR.name}`}
                  fill
                  sizes="(min-width: 768px) 480px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
              <p className="meta mt-4 text-center md:text-left">
                {AUTHOR.location}
              </p>
            </FadeUp>

            {/* Long bio */}
            <FadeUp delay={0.2}>
              <article
                className="reader-prose"
                dangerouslySetInnerHTML={{ __html: AUTHOR.bioLong }}
              />
            </FadeUp>
          </div>

          <div className="my-14 hairline" aria-hidden />

          <FadeUp>
            <article className="reader-prose mx-auto max-w-prose">
              <h2 className="font-italic italic font-normal">About this place</h2>
              <p>
                This site is built as a reading canvas first. The text is sized for the eye and the page is set to a width the line can fall on. There are three temperatures &mdash; <em>paper</em>, <em>cream</em>, and <em>midnight</em> &mdash; and a small floating control at the bottom-right to switch between them. There is no advertising. There is nothing to buy.
              </p>
              <blockquote>
                &ldquo;If you are reading this, the work has already done what it set out to do.&rdquo;
              </blockquote>
              <p className="font-italic italic">
                &mdash; with warmth, from {AUTHOR.location}.
              </p>
            </article>
          </FadeUp>
        </ReaderContainer>
      </main>
      <SiteFooter />
      <ThemeSwitcher />
    </>
  );
}
