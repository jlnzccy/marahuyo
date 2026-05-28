import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { studioEnv } from "@/lib/supabase/env";

export const STUDIO_COOKIE_NAME = "studio_session";
export const STUDIO_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function signSessionValue(username: string, secret: string): string {
  const sig = createHmac("sha256", secret).update(username).digest("hex");
  return `${username}.${sig}`;
}

/** Returns the verified username if the cookie value is intact, else null. */
export function verifySessionCookie(raw: string | undefined): string | null {
  if (!raw) return null;
  const dot = raw.indexOf(".");
  if (dot < 1) return null;
  const username = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);

  let secret: string;
  try {
    secret = studioEnv.sessionSecret();
  } catch {
    return null;
  }

  const expected = createHmac("sha256", secret).update(username).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return username;
}
