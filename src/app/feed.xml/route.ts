import { getRecentDispatches } from "@/lib/works";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600; // 1 hour — feed readers can be patient

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toUTCString();
}

export async function GET() {
  const base = siteUrl();
  const items = await getRecentDispatches(20).catch(() => []);

  const xmlItems = items
    .map((w) => {
      const link = `${base}/read/${w.slug}`;
      return [
        "    <item>",
        `      <title>${escape(w.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${toRfc822(w.publishedAt)}</pubDate>`,
        `      <description>${escape(w.excerpt || w.subtitle || "")}</description>`,
        "    </item>"
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>marahuyo — recent letters</title>
    <link>${base}</link>
    <description>Poems, essays, one-shots, and series by Jae Cua.</description>
    <language>en</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${toRfc822()}</lastBuildDate>
${xmlItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
