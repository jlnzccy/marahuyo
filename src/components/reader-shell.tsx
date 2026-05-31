import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReaderContainer } from "@/components/reader-container";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ReadingProgress } from "@/components/reading-progress";
import { ReaderFoot } from "@/components/reader-foot";
import { CoverHero } from "@/components/cover-hero";
import { ReaderActions } from "@/components/reader-actions";
import { QuoteShare } from "@/components/quote-share";
import { BookmarkTracker } from "@/components/bookmark-tracker";
import { ResumePill } from "@/components/resume-pill";
import { Marginalia } from "@/components/marginalia";
import { TableOfContents } from "@/components/table-of-contents";
import { RelatedReading } from "@/components/related-reading";
import { ReaderChrome, type ChapterNav } from "@/components/reader-chrome";
import { PrefetchRoute } from "@/components/prefetch-route";
import { FadeUp } from "@/components/motion";
import { cn } from "@/lib/cn";
import { sanitizeHtml } from "@/lib/sanitize";
import { parseHeadings } from "@/lib/toc";
import { getSiteSettings } from "@/lib/settings";
import type { AnyWork, WorkKind } from "@/types/content";

type FootLink = { href: string; label: string; hint?: string };

type Bookmark = {
  href: string;
  title: string;
  kind: WorkKind;
  subtitle?: string;
  /** Stable id used in localStorage. e.g. "read/<slug>" or "series/<slug>/<chapter>". */
  key: string;
};

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
  /** When set, records a visit in localStorage so the homepage rail surfaces it. */
  bookmark?: Bookmark;
  /** "Keep reading" suggestions rendered at the foot of the piece. */
  related?: AnyWork[];
  /** Series chapter list — powers the in-reader chapter selector (app chrome). */
  chapters?: ChapterNav[];
  seriesSlug?: string;
  currentChapterSlug?: string;
  seriesTitle?: string;
};

export async function ReaderShell({
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
  likeKey,
  bookmark,
  related,
  chapters,
  seriesSlug,
  currentChapterSlug
}: Props) {
  const { author } = await getSiteSettings();

  const isSeriesChapter = kind === "series" && !!seriesSlug && !!currentChapterSlug;
  // No-cover series chapters start flush at the top, where the floating reader
  // chrome (back · chapter pill) would otherwise sit on the title. Reserve room.
  const needsChromeClearance = isSeriesChapter && !coverImage;

  return (
    <>
      {bookmark && (
        <>
          <BookmarkTracker
            key_={bookmark.key}
            href={bookmark.href}
            title={bookmark.title}
            kind={bookmark.kind}
            subtitle={bookmark.subtitle}
          />
          <ResumePill bookmarkKey={bookmark.key} />
        </>
      )}
      <ReadingProgress />
      <SiteHeader scrollAware />
      <main
        id="main-content"
        className={cn("pt-12 pb-24 md:pt-20", needsChromeClearance && "reader-chrome-clearance")}
      >
        <ReaderContainer>
          {index && (
            <FadeUp delay={0.02} className="reader-index-link">
              <Link
                href={index.href}
                className="group mb-6 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-meta text-muted transition-colors hover:text-ink"
              >
                <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                {index.label}
              </Link>
            </FadeUp>
          )}

          <CoverHero
            kind={kind}
            title={title}
            eyebrow={eyebrow}
            meta={meta}
            subtitle={subtitle}
            coverImage={coverImage}
            backHref={kind === "series" ? undefined : index?.href}
            priority
          />

          <div className="my-12 hairline" aria-hidden="true" />

          {(() => {
            const sanitized = sanitizeHtml(body);
            const { html, headings } = parseHeadings(sanitized);
            return (
              <>
                <TableOfContents headings={headings} />
                <FadeUp delay={0.3}>
                  <article
                    className={cn("reader-prose", poetryMode && "poetry-context")}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </FadeUp>
                <Marginalia />
              </>
            );
          })()}

          {(prev || next || index) && (
            <div data-reader-foot={kind === "series" ? "series" : "work"}>
              <FadeUp delay={0.1}>
                <ReaderFoot prev={prev ?? null} next={next ?? null} index={index ?? null} />
              </FadeUp>
            </div>
          )}

          {related && related.length > 0 && (
            <FadeUp delay={0.12}>
              <RelatedReading works={related} />
            </FadeUp>
          )}
        </ReaderContainer>
      </main>
      <ReaderActions
        title={title}
        subtitle={subtitle}
        likeKey={likeKey}
        seriesMode={kind === "series"}
      />
      <ReaderChrome
        title={title}
        subtitle={subtitle}
        likeKey={likeKey}
        backHref={index?.href ?? "/works"}
        backLabel={index?.label}
        prev={prev}
        next={next}
        seriesSlug={seriesSlug}
        currentChapterSlug={currentChapterSlug}
        chapters={chapters}
      />
      <QuoteShare title={title} author={author.name || undefined} />
      {next?.href && <PrefetchRoute href={next.href} />}
      <SiteFooter />
      <ThemeSwitcher />
    </>
  );
}
