/**
 * The canonical public origin for the site. Used by sitemap, robots, RSS and
 * OG image generation. Override with `NEXT_PUBLIC_SITE_URL` on Vercel; falls
 * back to the production alias so local builds still emit sane URLs.
 */
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "https://marahuyo.art";
  return raw.replace(/\/+$/, "");
}

