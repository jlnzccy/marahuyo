import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReaderContainer } from "@/components/reader-container";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ReadingProgress } from "@/components/reading-progress";
import { ReaderFoot } from "@/components/reader-foot";
import { KindChip } from "@/components/kind-chip";
import { LikeButton } from "@/components/like-button";
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
  /** Stable id for the localStorage like-toggle. Omit to hide the heart. */
  likeKey?: string;
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
  index,
  likeKey
}: Props) {
  return (
    <>
      <ReadingProgress />
      <SiteHeader scrollAware />
      <main className="pt-12 pb-24 md:pt-20">
        <ReaderContainer>
          {index && (
            <FadeUp delay={0.02}>
              <Link
                href={index.href}
                className="group mb-6 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-meta text-muted transition-colors hover:text-ink"
              >
                <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                {index.label}
              </Link>
            </FadeUp>
          )}

          <FadeUp delay={0.05}>
            <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <KindChip kind={kind} />
              {eyebrow && <span className="meta">{eyebrow}</span>}
              {meta && (
                <>
                  <span aria-hidden className="meta text-whisper">·</span>
                  <span className="meta">{meta}</span>
                </>
              )}
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="font-serif text-4xl font-bold leading-tight text-balance md:text-5xl">
              {title}
            </h1>
          </FadeUp>

          {subtitle && (
            <FadeUp delay={0.18}>
              <p className="mt-6 font-serif italic text-sm text-muted/80 text-pretty border-l-2 border-muted/20 pl-4 max-w-prose">
                {subtitle}
              </p>
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

          {likeKey && (
            <FadeUp delay={0.08}>
              <LikeButton keyId={likeKey} />
            </FadeUp>
          )}

          {(prev || next) && (
            <FadeUp delay={0.1}>
              <ReaderFoot prev={prev ?? null} next={next ?? null} index={null} />
            </FadeUp>
          )}
        </ReaderContainer>
      </main>
      <SiteFooter />
      <ThemeSwitcher />
    </>
  );
}
