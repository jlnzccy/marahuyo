import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { verifySessionCookie } from "@/lib/studio-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bearer(req: NextRequest): string | null {
  const raw = req.headers.get("authorization");
  if (!raw) return null;
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

export async function GET(req: NextRequest) {
  const token = bearer(req);
  const user = token ? verifySessionCookie(token) : null;
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sb = getAdminSupabase();
  const { data, error } = await sb
    .from("works")
    .select(
      "id, slug, title, subtitle, kind, status, series_status, excerpt, body, poetry_mode, tags, cover_image, word_count, reading_minutes, published_at"
    )
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}
