import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { ReaderStateInsert, ReaderStateRow } from "@/lib/supabase/types";

/**
 * Anonymous reader-state sync. Each device generates a UUID once and posts
 * its bookmarks + likes here. There is no auth — the device id IS the key.
 *
 * GET ?device_id=<uuid>           returns every row for that device.
 * POST { device_id, entries[] }   upserts the entries.
 *
 * The endpoint is intentionally CORS-open: the writer may someday want a
 * companion app on a different origin.
 */

export const dynamic = "force-dynamic";

const DEVICE_RE = /^[0-9a-fA-F-]{16,64}$/;

const entrySchema = z.object({
  key: z.string().min(1).max(200),
  kind: z.string().max(40).nullable().optional(),
  title: z.string().max(300).nullable().optional(),
  href: z.string().max(500).nullable().optional(),
  subtitle: z.string().max(500).nullable().optional(),
  scrollPercent: z.number().int().min(0).max(100).optional(),
  liked: z.boolean().optional(),
  visitedAt: z.number().int().positive().optional()
});

const postSchema = z.object({
  device_id: z.string().regex(DEVICE_RE, "Invalid device id"),
  entries: z.array(entrySchema).min(1).max(100)
});

const MAX_ROWS_PER_DEVICE = 200;

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const deviceId = url.searchParams.get("device_id") ?? "";
  if (!DEVICE_RE.test(deviceId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid device id" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("reader_state")
    .select(
      "key, kind, title, href, subtitle, scroll_percent, liked, visited_at"
    )
    .eq("device_id", deviceId)
    .order("visited_at", { ascending: false })
    .limit(MAX_ROWS_PER_DEVICE)
    .returns<ReaderStateRow[]>();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }

  return NextResponse.json(
    { ok: true, entries: data ?? [] },
    { headers: corsHeaders() }
  );
}

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const parsed = postSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0].message },
      { status: 400, headers: corsHeaders() }
    );
  }

  const { device_id, entries } = parsed.data;
  const supabase = getAdminSupabase();

  const rows: ReaderStateInsert[] = entries.map((e) => ({
    device_id,
    key: e.key,
    kind: e.kind ?? null,
    title: e.title ?? null,
    href: e.href ?? null,
    subtitle: e.subtitle ?? null,
    scroll_percent: e.scrollPercent ?? 0,
    liked: e.liked ?? false,
    visited_at: e.visitedAt
      ? new Date(e.visitedAt).toISOString()
      : new Date().toISOString()
  }));

  const { error } = await supabase
    .from("reader_state")
    .upsert(rows as never, { onConflict: "device_id,key" });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }

  return NextResponse.json(
    { ok: true, count: rows.length },
    { headers: corsHeaders() }
  );
}
