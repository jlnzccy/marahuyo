import { LogOut } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { signOut } from "@/app/studio/actions";
import { StudioNavLinks } from "./studio-nav-links";

export function StudioChrome({
  username,
  children
}: {
  username: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-4">
            <Wordmark size="sm" />
            <span className="meta">studio</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="meta hidden sm:inline">{username}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-surface/60 px-2.5 py-1.5 font-sans text-xs text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                <LogOut className="h-3 w-3" /> sign out
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Studio" className="relative mx-auto max-w-6xl">
          <div className="flex overflow-x-auto scrollbar-none flex-nowrap items-center gap-1 px-3 pb-2 md:px-6">
            <StudioNavLinks />
          </div>
          <div className="pointer-events-none absolute bottom-2 right-0 top-0 w-8 bg-gradient-to-l from-canvas to-transparent md:hidden" />
        </nav>
      </header>
      <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 md:px-8">{children}</main>
    </div>
  );
}
