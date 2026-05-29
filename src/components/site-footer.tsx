import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-32 border-t border-border/50 bg-surface/10 py-16">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">
          {/* Col 1: Brand & Tagline (2 cols wide) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-col gap-2">
              <Wordmark size="sm" />
              <p className="font-italic italic text-lg text-ink/90">to be enchanted.</p>
            </div>
            <p className="meta mt-4 block">© {year} marahuyo</p>
          </div>

          {/* Col 2: Navigation (1 col wide) */}
          <div className="space-y-4">
            <h4 className="meta text-whisper">Explore</h4>
            <nav aria-label="Footer Navigation" className="flex flex-col gap-2.5 font-sans text-sm text-muted">
              <Link href="/works" className="hover:text-ink transition-colors link-underline w-fit">
                Archive
              </Link>
              <Link href="/about" className="hover:text-ink transition-colors link-underline w-fit">
                About
              </Link>
              <Link href="/contact" className="hover:text-ink transition-colors link-underline w-fit">
                Contact
              </Link>
              <a
                href="/feed.xml"
                className="hover:text-ink transition-colors link-underline w-fit"
                aria-label="RSS feed of recent dispatches"
              >
                RSS
              </a>
            </nav>
          </div>

          {/* Col 3: Status (1 col wide) */}
          <div className="space-y-4">
            <h4 className="meta text-whisper">Status</h4>
            <div className="flex flex-col gap-2 font-sans text-sm text-muted">
              <div className="flex items-center gap-2 text-ink/95">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-mono uppercase tracking-wider">Operational</span>
              </div>
              <Link
                href="/studio"
                className="text-xs text-whisper hover:text-ink transition-colors link-underline w-fit mt-1"
              >
                Studio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
