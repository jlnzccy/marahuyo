import { notFound } from "next/navigation";
import { ReaderShell } from "@/components/reader-shell";
import {
  getPublishedStandaloneSlugs,
  getStandaloneBySlug
} from "@/lib/works";

type Params = { slug: string };

export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getPublishedStandaloneSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const work = await getStandaloneBySlug(slug);
  if (!work) return {};
  return {
    title: work.title,
    description: work.excerpt
  };
}

export default async function ReadPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const work = await getStandaloneBySlug(slug);
  if (!work) notFound();

  const date = work.publishedAt
    ? new Date(work.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : undefined;

  return (
    <ReaderShell
      kind={work.kind}
      eyebrow={date}
      title={work.title}
      subtitle={work.subtitle}
      meta={`${work.readingMinutes} min · ${work.wordCount.toLocaleString()} words`}
      body={work.body}
      poetryMode={work.poetryMode}
      coverImage={work.coverImage}
      prev={null}
      next={null}
      index={{ href: "/works", label: "All works", hint: "Return to the archive" }}
    />
  );
}
