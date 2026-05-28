import { NextRequest, NextResponse } from "next/server";
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
  if (!user) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  return NextResponse.json({ valid: true });
}
