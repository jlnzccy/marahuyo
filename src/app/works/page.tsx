import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReaderContainer } from "@/components/reader-container";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FadeUp } from "@/components/motion";
import { WorkRow } from "@/components/work-row";
import { getAllPublishedWorks } from "@/lib/works";

export const metadata = {
  title: "Works — the archive"
};

export default async function WorksPage() {
  const all = await getAllPublishedWorks();

  return (
    <>
      <SiteHeader />
      <main className="pt-16 pb-20 md:pt-24">
        <ReaderContainer width="wide">
          <FadeUp>
            <p className="meta mb-4">the archive</p>
            <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-balance md:text-6xl">
              every <span className="font-italic italic font-normal">quiet</span> thing,
              in one place.
            </h1>
            <p className="mt-6 max-w-prose font-italic italic text-xl text-muted md:text-2xl">
              poems, essays, and a slow novel — listed newest first.
            </p>
          </FadeUp>

          <div className="my-14 hairline" aria-hidden />

          <FadeUp delay={0.1}>
            <div className="mx-auto max-w-3xl">
              {all.length === 0 ? (
                <p className="py-16 text-center font-italic italic text-xl text-muted">
                  the archive is quiet — soon.
                </p>
              ) : (
                all.map((w) => <WorkRow key={w.id} work={w} />)
              )}
            </div>
          </FadeUp>

          <div className="mt-20 text-center">
            <Link
              href="/"
              className="font-italic italic text-lg text-muted underline decoration-muted/30 underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink"
            >
              ← back to the entrance
            </Link>
          </div>
        </ReaderContainer>
      </main>
      <SiteFooter />
      <ThemeSwitcher />
    </>
  );
}
