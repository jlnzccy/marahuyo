import { NextResponse } from "next/server";
import { z } from "zod";
import { validateKeys } from "@/lib/validate-keys";

/**
 * Anonymous bookmark + like validator. The Continue-Reading rail and the
 * ReaderStateHydrator read state from localStorage but the underlying work /
 * chapter may have been unpublished or trashed since then. This endpoint takes
 * the local keys and returns the subset that still resolve to a live,
 * published row.
 *
 * Key shapes (mirrors what readers + ReaderShell write):
 *   read/<slug>                    standalone work
 *   series/<seriesSlug>/<chapter>  chapter inside a series
 *
 * Body:
 *   { keys: string[] }              bookmark keys to validate
 *   { likeKeys?: string[] }         optional like keyIds to validate (same shapes)
 */

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  keys: z.array(z.string().min(1).max(300)).max(200),
  likeKeys: z.array(z.string().min(1).max(300)).max(200).optional()
});

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { keys, likeKeys } = parsed.data;

  const [validBookmarks, validLikes] = await Promise.all([
    validateKeys(keys),
    likeKeys && likeKeys.length > 0 ? validateKeys(likeKeys) : Promise.resolve(new Set<string>())
  ]);

  return NextResponse.json({
    ok: true,
    valid: Array.from(validBookmarks),
    validLikeKeys: likeKeys ? Array.from(validLikes) : undefined
  });
}
