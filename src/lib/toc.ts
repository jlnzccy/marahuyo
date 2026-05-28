import { slugify } from "@/lib/slug";

export type TocHeading = {
  level: 2 | 3;
  text: string;
  id: string;
};

const HEADING_RE = /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi;
const ID_ATTR_RE = /\sid\s*=\s*"([^"]+)"/i;
const TAG_STRIP_RE = /<[^>]+>/g;
const WS_RE = /\s+/g;

/**
 * Decode the small handful of HTML entities that DOMPurify lets through so
 * the TOC sidebar reads plain prose. No need for a real decoder: TipTap
 * doesn't emit anything more exotic than these.
 */
function decodeEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");
}

function textFromHeadingInner(inner: string): string {
  return decodeEntities(inner.replace(TAG_STRIP_RE, "").replace(WS_RE, " ").trim());
}

/**
 * Stamp every h2/h3 in the sanitized HTML with a stable id and return the
 * matching TOC outline. Headings that already carry an explicit id are left
 * alone (we just record them). Empty headings are skipped.
 *
 * Returns the transformed HTML and the heading list so the caller can render
 * both inline article + sidebar nav without re-parsing.
 */
export function parseHeadings(html: string): {
  html: string;
  headings: TocHeading[];
} {
  const headings: TocHeading[] = [];
  const usedIds = new Set<string>();

  const transformed = html.replace(
    HEADING_RE,
    (full, tag: string, attrs: string, inner: string) => {
      const text = textFromHeadingInner(inner);
      if (!text) return full;

      const existingMatch = attrs.match(ID_ATTR_RE);
      let id = existingMatch
        ? existingMatch[1]
        : slugify(text) || `section-${headings.length + 1}`;

      // Resolve duplicates by appending a counter — id must be unique in the
      // document so the anchor target is unambiguous.
      let candidate = id;
      let i = 2;
      while (usedIds.has(candidate)) {
        candidate = `${id}-${i++}`;
      }
      id = candidate;
      usedIds.add(id);

      const level = tag.toLowerCase() === "h2" ? 2 : 3;
      headings.push({ level: level as 2 | 3, text, id });

      const nextAttrs = existingMatch
        ? attrs.replace(ID_ATTR_RE, ` id="${id}"`)
        : `${attrs} id="${id}"`;
      return `<${tag}${nextAttrs}>${inner}</${tag}>`;
    }
  );

  return { html: transformed, headings };
}
