import Link from "next/link";
import { FileText, Library, PenLine, FilePlus } from "lucide-react";
import { getStudioStats } from "./_actions/studio-stats";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function editorHref(kind: string, id: string): string {
  if (kind === "series") return `/studio/series/${id}`;
  return `/studio/works/${id}`;
}

export default async function StudioOverview() {
  const stats = await getStudioStats();

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

      {/* Quick-action tiles */}
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

      {/* Stats bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "drafts", value: stats.draftCount },
          { label: "published", value: stats.publishedCount },
          { label: "words written", value: stats.totalWords }
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border/60 bg-surface/30 px-5 py-4"
          >
            <p className="meta">{s.label}</p>
            <p className="mt-1 font-serif text-3xl font-bold text-ink">
              {formatNumber(s.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      {stats.recentEdits.length > 0 && (
        <section>
          <p className="meta mb-4">recent activity</p>
          <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-surface/30">
            {stats.recentEdits.map((w) => (
              <Link
                key={w.id}
                href={editorHref(w.kind, w.id)}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-surface/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                    {w.kind}
                  </span>
                  <span className="truncate font-serif text-sm text-ink">
                    {w.title || "Untitled"}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={
                      w.status === "draft"
                        ? "rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-700"
                        : "rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-700"
                    }
                  >
                    {w.status}
                  </span>
                  <span className="font-mono text-xs text-whisper">
                    {relativeTime(w.updatedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
