import Image from "next/image";
import Link from "next/link";
import { KindChip } from "@/components/kind-chip";
import type { AnyWork } from "@/types/content";

export function workHref(work: AnyWork): string {
  if (work.kind === "series") return `/series/${work.slug}`;
  return `/read/${work.slug}`;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function WorkRow({ work }: { work: AnyWork }) {
  return (
    <Link
      href={workHref(work)}
      className="group block border-t border-border/60 py-6 transition-colors first:border-t-0 hover:bg-surface/40"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
        {/* Thumb */}
        {work.coverImage && (
          <div className="md:w-44 md:shrink-0">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-surface md:aspect-[4/3]">
              <Image
                src={work.coverImage}
                alt=""
                fill
                sizes="(min-width: 768px) 176px, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 space-y-2">
          <div className="meta">{formatDate(work.publishedAt)}</div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-serif text-2xl font-bold leading-tight text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5">
              {work.title}
            </h3>
            <KindChip kind={work.kind} />
          </div>
          {work.subtitle && (
            <p className="font-italic italic text-lg text-muted">{work.subtitle}</p>
          )}
          <p className="max-w-prose font-serif text-[16.5px] leading-relaxed text-muted text-pretty">
            {work.excerpt}
          </p>
          <div className="pt-1">
            <span className="meta">{work.readingMinutes} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
