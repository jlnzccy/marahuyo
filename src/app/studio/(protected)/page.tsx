import Link from "next/link";
import { FileText, Library, PenLine, FilePlus } from "lucide-react";

export default function StudioOverview() {
  const cards = [
    {
      href: "/studio/works/new",
      icon: FilePlus,
      title: "New work",
      hint: "Start a poem, essay, or one-shot."
    },
    {
      href: "/studio/works",
      icon: PenLine,
      title: "Works",
      hint: "Manage standalone pieces."
    },
    {
      href: "/studio/series",
      icon: Library,
      title: "Series",
      hint: "Chapters, ordering, drafts."
    },
    {
      href: "/studio/drafts",
      icon: FileText,
      title: "Drafts",
      hint: "Everything not yet published."
    }
  ];

  return (
    <div className="space-y-10">
      <header>
        <p className="meta mb-3">overview</p>
        <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
          The <span className="font-italic italic font-normal">writing</span> room.
        </h1>
        <p className="mt-3 font-italic italic text-lg text-muted">
          a private workspace. only you live here.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-xl border border-border/60 bg-surface/40 p-5 transition-colors hover:bg-surface"
            >
              <Icon className="h-4 w-4 text-muted transition-colors group-hover:text-ink" />
              <div className="mt-3 font-serif text-xl font-bold text-ink">{c.title}</div>
              <div className="mt-1 font-sans text-sm text-muted">{c.hint}</div>
            </Link>
          );
        })}
      </div>

      <section className="rounded-2xl border border-border/60 bg-surface/30 p-6">
        <p className="meta mb-3">next session</p>
        <h2 className="font-serif text-2xl font-bold">The CMS is sketched, not yet wired.</h2>
        <ul className="mt-4 space-y-2 font-sans text-sm text-muted">
          <li>• TipTap editor with a custom <span className="font-mono text-xs">poetry</span> node that preserves indents + soft returns.</li>
          <li>• Server actions backed by <span className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</span> for safe writes.</li>
          <li>• Draft / Published state machine and a quiet auto-save heartbeat.</li>
          <li>• Drag-and-drop chapter ordering inside each series.</li>
        </ul>
      </section>
    </div>
  );
}
