import Image from "next/image";
import { ReaderContainer } from "@/components/reader-container";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ReadingProgress } from "@/components/reading-progress";
import { ReaderFoot } from "@/components/reader-foot";
import { KindChip } from "@/components/kind-chip";
import { FadeUp } from "@/components/motion";
import { cn } from "@/lib/cn";
import type { WorkKind } from "@/types/content";

type FootLink = { href: string; label: string; hint?: string };

type Props = {
  kind: WorkKind;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  body: string;
  poetryMode?: boolean;
  coverImage?: string;
  prev?: FootLink | null;
  next?: FootLink | null;
  index?: FootLink | null;
};

export function ReaderShell({
  kind,
  eyebrow,
  title,
  subtitle,
  meta,
  body,
  poetryMode,
  coverImage,
  prev,
  next,
  index
}: Props) {
  return (
    <>
      <ReadingProgress />
      <SiteHeader scrollAware />
      <main className="pt-12 pb-24 md:pt-20">
        <ReaderContainer>
          <FadeUp delay={0.05}>
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <KindChip kind={kind} />
              {eyebrow && <span className="meta">{eyebrow}</span>}
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="font-serif text-4xl font-bold leading-tight text-balance md:text-5xl">
              {title}
            </h1>
          </FadeUp>

          {subtitle && (
            <FadeUp delay={0.18}>
              <p className="mt-4 font-italic italic text-xl text-muted text-pretty md:text-2xl">
                {subtitle}
              </p>
            </FadeUp>
          )}

          {meta && (
            <FadeUp delay={0.24}>
              <p className="meta mt-6">{meta}</p>
            </FadeUp>
          )}

          {coverImage && (
            <FadeUp delay={0.28}>
              <figure className="relative mt-10 aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/60 bg-surface md:-mx-12 md:w-auto">
                <Image
                  src={coverImage}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 760px, 100vw"
                  className="object-cover"
                  priority
                />
              </figure>
            </FadeUp>
          )}

          <div className="my-12 hairline" aria-hidden />

          <FadeUp delay={0.3}>
            <article
              className={cn("reader-prose", poetryMode && "poetry-context")}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </FadeUp>

          <FadeUp delay={0.1}>
            <ReaderFoot prev={prev ?? null} next={next ?? null} index={index ?? null} />
          </FadeUp>
        </ReaderContainer>
      </main>
      <SiteFooter />
      <ThemeSwitcher />
    </>
  );
}
