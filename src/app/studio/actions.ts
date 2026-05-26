"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
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

/** Verifies username + password against env. Sets a signed session cookie. */
export async function signIn(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
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
    return { status: "error", message: "Invalid username or password." };
  }

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
