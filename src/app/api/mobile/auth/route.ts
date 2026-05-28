import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { studioEnv } from "@/lib/supabase/env";
import { signSessionValue } from "@/lib/studio-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  let payload: { username?: unknown; password?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const username = typeof payload.username === "string" ? payload.username.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  if (!username || !password) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  let expectedUser: string;
  let expectedPass: string;
  let secret: string;
  try {
    expectedUser = studioEnv.username();
    expectedPass = studioEnv.password();
    secret = studioEnv.sessionSecret();
  } catch {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const userOk = safeEqual(username, expectedUser);
  const passOk = safeEqual(password, expectedPass);
  if (!userOk || !passOk) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const token = signSessionValue(expectedUser, secret);
  return NextResponse.json({ token });
}
