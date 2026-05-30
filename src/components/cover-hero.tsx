import Image from "next/image";
import { KindChip } from "@/components/kind-chip";
import { CoverBackButton } from "@/components/cover-back-button";
import { FadeUp } from "@/components/motion";
import { cn } from "@/lib/cn";
import type { WorkKind } from "@/types/content";

type Props = {
  kind: WorkKind;
  title: string;
  eyebrow?: string;
  meta?: string;
  subtitle?: string;
  coverImage?: string;
  /** Set on the first hero of the page so the LCP image isn't lazy-loaded. */
  priority?: boolean;
  /** App-shell back affordance (browser-back, with this as fallback). Rendered
   *  as a chevron on the cover; CSS-gated to the app. */
  backHref?: string;
  /** Series landing: a standard 2:3 portrait cover crop instead of the wide hero. */
  full?: boolean;
};

/**
 * Entry "moment" for a piece. With a cover it renders a cinematic hero; the
 * `full` variant (series landing) shows a standard 2:3 portrait cover. Without
 * a cover it falls back to a large-type title treatment.
 */
export function CoverHero({
  kind,
  title,
  eyebrow,
  meta,
  subtitle,
  coverImage,
  priority,
  backHref,
  full
}: Props) {
  if (coverImage) {
    return (
      <FadeUp delay={0.05}>
        <figure
          className={cn(
            "cover-bleed-top relative -mx-5 overflow-hidden bg-surface md:-mx-12 md:rounded-2xl md:border md:border-border/60",
            full ? "aspect-[2/3]" : "aspect-[4/5] sm:aspect-[16/10]"
          )}
        >
          {backHref && <CoverBackButton fallbackHref={backHref} onImage />}
          <Image
            src={coverImage}
            alt={`Cover for ${title}`}
            fill
            sizes="(min-width: 768px) 760px, 100vw"
            className="object-cover"
            priority={priority}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5"
          />
          <figcaption className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <KindChip
                kind={kind}
                className="border-white/25 bg-white/10 text-white/90 backdrop-blur-sm"
              />
              {eyebrow && <span className="meta text-white/80">{eyebrow}</span>}
              {meta && (
                <>
                  <span aria-hidden="true" className="meta text-white/40">·</span>
                  <span className="meta text-white/80">{meta}</span>
                </>
              )}
            </div>
            <h1 className="font-serif text-4xl font-bold leading-tight text-balance text-white drop-shadow-sm md:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 max-w-prose font-serif italic text-base text-white/85 text-pretty md:text-lg">
                {subtitle}
              </p>
            )}
          </figcaption>
        </figure>
      </FadeUp>
    );
  }

  return (
    <>
      {backHref && (
        <FadeUp delay={0.02}>
          <CoverBackButton fallbackHref={backHref} onImage={false} />
        </FadeUp>
      )}

      <FadeUp delay={0.05}>
        <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <KindChip kind={kind} />
          {eyebrow && <span className="meta">{eyebrow}</span>}
          {meta && (
            <>
              <span aria-hidden="true" className="meta text-whisper">·</span>
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
          <p className="mt-6 max-w-prose border-l-2 border-muted/20 pl-4 font-serif italic text-sm text-muted/80 text-pretty">
            {subtitle}
          </p>
        </FadeUp>
      )}
    </>
  );
}
