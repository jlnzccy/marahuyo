import Link from "next/link";
import { KindChip } from "@/components/kind-chip";
import { workHref } from "@/components/work-row";
import type { AnyWork } from "@/types/content";

/**
 * "Keep reading" rail at the foot of a standalone piece. A finished poem or
 * essay otherwise dead-ends; this gives the reader an onward path, ranked
 * upstream by shared tags (see getRelatedWorks). Renders nothing when there's
 * nothing to suggest, so it never shows an empty heading.
 */
export function RelatedReading({ works }: { works: AnyWork[] }) {
  if (works.length === 0) return null;
  return (
    <section
      aria-labelledby="keep-reading-heading"
      className="mt-20 border-t border-border/60 pt-8"
    >
      <h2 id="keep-reading-heading" className="meta mb-6">
        keep reading
      </h2>
      <ul className="space-y-7">
        {works.map((work) => (
          <li key={work.id}>
            <Link href={workHref(work)} className="group block">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h3 className="font-serif text-xl font-bold leading-tight text-ink transition-colors group-hover:text-accent">
                  {work.title}
                </h3>
                <KindChip kind={work.kind} />
              </div>
              {work.subtitle && (
                <p className="mt-1 font-italic italic text-base text-muted">
                  {work.subtitle}
                </p>
              )}
              <p className="mt-1.5 max-w-prose font-serif text-[15.5px] leading-relaxed text-muted text-pretty line-clamp-2">
                {work.excerpt}
              </p>
              <p className="meta mt-2">{work.readingMinutes} min read</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
