import { notFound } from "next/navigation";
import { ReaderShell } from "@/components/reader-shell";
import { getChapter, getPublishedChapterParams } from "@/lib/works";

type Params = { slug: string; chapter: string };

export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  return getPublishedChapterParams();
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug, chapter } = await params;
  const found = await getChapter(slug, chapter);
  if (!found) return {};
  return {
    title: `${found.chapter.title} — ${found.series.title}`,
    description: found.chapter.subtitle ?? found.series.excerpt
  };
}

export default async function ChapterPage({ params }: { params: Promise<Params> }) {
  const { slug, chapter } = await params;
  const found = await getChapter(slug, chapter);
  if (!found) notFound();

  const { series, chapter: c } = found;
  const published = series.chapters.filter((ch) => ch.status === "published");
  const idx = published.findIndex((ch) => ch.id === c.id);
  const prevCh = idx > 0 ? published[idx - 1] : null;
  const nextCh = idx >= 0 && idx < published.length - 1 ? published[idx + 1] : null;

  const date = c.publishedAt
    ? new Date(c.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : undefined;

  return (
    <ReaderShell
      kind="series"
      eyebrow={`${series.title} · chapter ${String(c.number).padStart(2, "0")}${date ? " · " + date : ""}`}
      title={c.title}
      subtitle={c.subtitle}
      meta={`${c.readingMinutes} min · ${c.wordCount.toLocaleString()} words`}
      body={c.body}
      poetryMode={c.poetryMode}
      coverImage={series.coverImage}
      prev={
        prevCh
          ? {
              href: `/series/${series.slug}/${prevCh.slug}`,
              label: prevCh.title,
              hint: `Chapter ${String(prevCh.number).padStart(2, "0")}`
            }
          : null
      }
      next={
        nextCh
          ? {
              href: `/series/${series.slug}/${nextCh.slug}`,
              label: nextCh.title,
              hint: `Chapter ${String(nextCh.number).padStart(2, "0")}`
            }
          : null
      }
      index={{
        href: `/series/${series.slug}`,
        label: "Series index",
        hint: series.title
      }}
      likeKey={`series/${series.slug}/${c.slug}`}
    />
  );
}
