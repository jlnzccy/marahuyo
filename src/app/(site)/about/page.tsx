import Image from "next/image";
import { ReaderContainer } from "@/components/reader-container";
import { FadeUp } from "@/components/motion";
import { getSiteSettings } from "@/lib/settings";
import { sanitizeHtml } from "@/lib/sanitize";

export const metadata = {
  title: "About"
};

export default async function AboutPage() {
  const { author, aboutPlace } = await getSiteSettings();

  return (
    <main id="main-content" className="pt-16 pb-24 md:pt-24">
      <ReaderContainer width="wide">
        <FadeUp>
          <p className="meta mb-6">a preface</p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-balance md:text-6xl">
            Hey! It&rsquo;s{" "}
            <span className="font-italic italic font-normal">{author.name}</span>,
          </h1>
          {author.subtitle && (
            <p className="mt-4 font-italic italic text-2xl text-muted md:text-3xl">
              {author.subtitle}
            </p>
          )}
        </FadeUp>

        <div className="my-12 grid items-start gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <FadeUp delay={0.1}>
            <div className="relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border/60 bg-surface">
              <Image
                src={author.portraitUrl}
                alt={`Portrait of ${author.name}`}
                fill
                sizes="(min-width: 768px) 640px, 100vw"
                className="object-cover"
                priority
              />
            </div>
            <p className="meta mt-4 text-center md:text-left">
              {author.location}
            </p>
          </FadeUp>

          <FadeUp delay={0.2}>
            <article
              className="reader-prose"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(author.bioLong) }}
            />
          </FadeUp>
        </div>

        {(aboutPlace.title || aboutPlace.body || aboutPlace.quote) && (
          <>
            <div className="my-14 hairline" aria-hidden="true" />

            <FadeUp>
              <article className="reader-prose mx-auto max-w-prose">
                {aboutPlace.title && (
                  <h2 className="font-italic italic font-normal">{aboutPlace.title}</h2>
                )}
                {aboutPlace.body && (
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(aboutPlace.body) }} />
                )}
                {aboutPlace.quote && (
                  <blockquote>
                    &ldquo;{aboutPlace.quote}&rdquo;
                  </blockquote>
                )}
                {author.location && (
                  <p className="font-italic italic">
                    &mdash; with warmth, from {author.location}.
                  </p>
                )}
              </article>
            </FadeUp>
          </>
        )}
      </ReaderContainer>
    </main>
  );
}
