/**
 * Convert any string into a URL-safe slug. Strips diacritics, lowercases,
 * collapses non-alphanumerics into single hyphens, trims edges.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Append a short random suffix (e.g. for resolving slug collisions). */
export function withSuffix(slug: string, length = 5): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let suffix = "";
  for (let i = 0; i < length; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${slug}-${suffix}`;
}
