import { notFound } from "next/navigation";
import { ReaderShell } from "@/components/reader-shell";
import { findStandaloneBySlug, POEMS, ESSAYS, ONESHOTS } from "@/lib/mock-content";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return [...POEMS, ...ESSAYS, ...ONESHOTS]
    .filter((w) => w.status === "published")
    .map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const work = findStandaloneBySlug(slug);
  if (!work) return {};
  return {
    title: work.title,
    description: work.excerpt
  };
}

export default async function ReadPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const work = findStandaloneBySlug(slug);
  if (!work || work.status !== "published") notFound();

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
