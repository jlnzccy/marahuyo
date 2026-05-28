import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-32 border-t border-border/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
        <div className="space-y-2">
          <p className="font-italic italic text-lg text-ink/90">to be enchanted.</p>
          <p className="meta">© {year} marahuyo</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-sm text-muted">
          <Link href="/works" className="hover:text-ink transition-colors">Archive</Link>
          <Link href="/about" className="hover:text-ink transition-colors">About</Link>
          <Link href="/contact" className="hover:text-ink transition-colors">Contact</Link>
          <a
            href="/feed.xml"
            className="hover:text-ink transition-colors"
            aria-label="RSS feed of recent dispatches"
          >
            RSS
          </a>
          <Link href="/studio" className="text-whisper hover:text-ink transition-colors">Studio</Link>
        </nav>
      </div>
    </footer>
  );
}
