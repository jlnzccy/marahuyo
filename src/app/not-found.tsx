import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReaderContainer } from "@/components/reader-container";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="pt-24 pb-24">
        <ReaderContainer className="text-center">
          <p className="meta mb-6">404 — a missing page</p>
          <h1 className="font-serif text-5xl font-bold leading-tight md:text-6xl">
            The room you&rsquo;re looking for
            <br />
            <span className="font-italic italic font-normal">isn&rsquo;t here.</span>
          </h1>
          <p className="mt-6 font-italic italic text-xl text-muted">
            perhaps you took a turn that wasn&rsquo;t there. it happens.
          </p>
          <Link
            href="/"
            className="mt-10 inline-block font-sans text-sm text-muted underline decoration-muted/30 underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink"
          >
            ← back to the entrance
          </Link>
        </ReaderContainer>
      </main>
      <SiteFooter />
      <ThemeSwitcher />
    </>
  );
}
