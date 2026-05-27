import type { MetadataRoute } from "next";
import {
  getPublishedChapterUpdates,
  getPublishedWorkUpdates
} from "@/lib/works";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/works`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 }
  ];

  const [works, chapters] = await Promise.all([
    getPublishedWorkUpdates().catch(() => []),
    getPublishedChapterUpdates().catch(() => [])
  ]);

  const workEntries: MetadataRoute.Sitemap = works.map((w) => ({
    url:
      w.kind === "series"
        ? `${base}/series/${w.slug}`
        : `${base}/read/${w.slug}`,
    lastModified: new Date(w.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const chapterEntries: MetadataRoute.Sitemap = chapters.map((c) => ({
    url: `${base}/series/${c.seriesSlug}/${c.chapterSlug}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6
  }));

  return [...staticEntries, ...workEntries, ...chapterEntries];
}
