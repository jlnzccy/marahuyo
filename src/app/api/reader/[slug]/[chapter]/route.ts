import { getChapterByPath } from "@/lib/works";
import { sanitizeHtml } from "@/lib/sanitize";

/**
 * Lightweight JSON feed for the continuous reader: returns a chapter's
 * sanitized body plus the slug of the chapter after it, so the client can
 * append chapter-after-chapter as the reader scrolls (Wattpad-style).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; chapter: string }> }
) {
  const { slug, chapter } = await params;
  const found = await getChapterByPath(slug, chapter);
  if (!found) {
    return Response.json({ ok: false }, { status: 404 });
  }

  const { series, chapter: c, siblings } = found;
  const idx = siblings.findIndex((s) => s.id === c.id);
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const date = c.publishedAt
    ? new Date(c.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : null;

  return Response.json({
    ok: true,
    seriesTitle: series.title,
    slug: c.slug,
    number: c.number,
    title: c.title,
    subtitle: c.subtitle ?? null,
    eyebrow: `chapter ${String(c.number).padStart(2, "0")}${date ? " · " + date : ""}`,
    meta: `${c.readingMinutes} min · ${c.wordCount.toLocaleString()} words`,
    html: sanitizeHtml(c.body),
    nextSlug: next?.slug ?? null
  });
}
