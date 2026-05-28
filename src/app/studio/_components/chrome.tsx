import Link from "next/link";
import { LogOut, FileText, Library, PenLine, Settings, Trash2 } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { signOut } from "@/app/studio/actions";

const NAV = [
  { href: "/studio", label: "Overview", icon: FileText, exact: true },
  { href: "/studio/works", label: "Works", icon: PenLine },
  { href: "/studio/series", label: "Series", icon: Library },
  { href: "/studio/trash", label: "Trash", icon: Trash2 },
  { href: "/studio/settings", label: "Settings", icon: Settings }
];

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
        <nav aria-label="Studio" className="mx-auto flex max-w-6xl items-center gap-1 px-3 pb-2 md:px-6">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-sans text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 md:px-8">{children}</main>
    </div>
  );
}
