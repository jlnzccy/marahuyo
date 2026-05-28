"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { studioEnv } from "@/lib/supabase/env";
import {
  STUDIO_COOKIE_NAME,
  STUDIO_COOKIE_MAX_AGE,
  signSessionValue
} from "@/lib/studio-session";

export type SignInState = {
  status: "idle" | "error";
  message?: string;
};

/* ── Rate limiting ─────────────────────────────────────────────── */

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

type RateEntry = { count: number; resetAt: number };
const attempts = new Map<string, RateEntry>();

function getClientIp(h: Headers): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): string | null {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (entry) {
    // Reset window expired — clear
    if (now >= entry.resetAt) {
      attempts.delete(ip);
      return null;
    }
    if (entry.count >= MAX_ATTEMPTS) {
      const secsLeft = Math.ceil((entry.resetAt - now) / 1000);
      const minsLeft = Math.ceil(secsLeft / 60);
      return `Too many login attempts. Try again in ${minsLeft} minute${minsLeft === 1 ? "" : "s"}.`;
    }
  }
  return null;
}

function recordFailure(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && now < entry.resetAt) {
    entry.count += 1;
  } else {
    attempts.set(ip, { count: 1, resetAt: now + LOCKOUT_MS });
  }
}

function clearFailures(ip: string) {
  attempts.delete(ip);
}

/* ── Actions ───────────────────────────────────────────────────── */

/** Verifies username + password against env. Sets a signed session cookie. */
export async function signIn(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const h = await headers();
  const ip = getClientIp(h);

  // Check rate limit before doing anything
  const blocked = checkRateLimit(ip);
  if (blocked) {
    return { status: "error", message: blocked };
  }

  let expectedUser: string;
  let expectedPass: string;
  let secret: string;
  try {
    expectedUser = studioEnv.username();
    expectedPass = studioEnv.password();
    secret = studioEnv.sessionSecret();
  } catch {
    return {
      status: "error",
      message:
        "Studio is not configured. Set STUDIO_USERNAME, STUDIO_PASSWORD, STUDIO_SESSION_SECRET in .env.local."
    };
  }

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { status: "error", message: "Username and password are required." };
  }

  const userBuf = Buffer.from(username);
  const expectedUserBuf = Buffer.from(expectedUser);
  const passBuf = Buffer.from(password);
  const expectedPassBuf = Buffer.from(expectedPass);

  const userOk =
    userBuf.length === expectedUserBuf.length &&
    timingSafeEqual(userBuf, expectedUserBuf);
  const passOk =
    passBuf.length === expectedPassBuf.length &&
    timingSafeEqual(passBuf, expectedPassBuf);

  if (!userOk || !passOk) {
    recordFailure(ip);
    return { status: "error", message: "Invalid username or password." };
  }

  // Success — clear any previous failures for this IP
  clearFailures(ip);

  const jar = await cookies();
  jar.set(STUDIO_COOKIE_NAME, signSessionValue(username, secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STUDIO_COOKIE_MAX_AGE
  });

  redirect("/studio");
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(STUDIO_COOKIE_NAME);
  redirect("/studio/login");
}

