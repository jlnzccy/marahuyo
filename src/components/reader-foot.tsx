import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

type FootLink = {
  href: string;
  label: string;
  hint?: string;
};

type Props = {
  prev?: FootLink | null;
  next?: FootLink | null;
  index?: FootLink | null;
};

export function ReaderFoot({ prev, next, index }: Props) {
  return (
    <nav aria-label="Chapter navigation" className="mt-16 border-t border-border/60 pt-10">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        <div>
          {prev && (
            <Link
              href={prev.href}
              className="group block rounded-xl border border-border/60 bg-surface/40 p-5 transition-colors hover:bg-surface"
            >
              <div className="meta mb-2 flex items-center gap-2">
                <ArrowLeft className="h-3 w-3" /> previous
              </div>
              <div className="font-serif text-lg font-bold leading-snug text-ink">
                {prev.label}
              </div>
              {prev.hint && <div className="meta mt-1">{prev.hint}</div>}
            </Link>
          )}
        </div>

        {index && (
          <div className="hidden md:block">
            <Link
              href={index.href}
              className="group flex h-full flex-col items-center justify-center rounded-xl border border-border/60 bg-canvas p-5 text-center transition-colors hover:bg-surface"
            >
              <BookOpen className="h-4 w-4 text-muted" />
              <div className="meta mt-2">{index.label}</div>
              {index.hint && (
                <div className="mt-1 font-italic italic text-sm text-muted">{index.hint}</div>
              )}
            </Link>
          </div>
        )}

        <div className="text-right">
          {next && (
            <Link
              href={next.href}
              className="group block rounded-xl border border-border/60 bg-surface/40 p-5 transition-colors hover:bg-surface"
            >
              <div className="meta mb-2 flex items-center justify-end gap-2">
                next <ArrowRight className="h-3 w-3" />
              </div>
              <div className="font-serif text-lg font-bold leading-snug text-ink">
                {next.label}
              </div>
              {next.hint && <div className="meta mt-1">{next.hint}</div>}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
