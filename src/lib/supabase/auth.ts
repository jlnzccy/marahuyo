import "server-only";
import { cookies } from "next/headers";
import { STUDIO_COOKIE_NAME, verifySessionCookie } from "@/lib/studio-session";

export interface StudioSession {
  username: string;
  isOwner: boolean;
}

/** Returns the current Studio session, or null when the session cookie is missing/invalid. */
export async function getStudioSession(): Promise<StudioSession | null> {
  const jar = await cookies();
  const raw = jar.get(STUDIO_COOKIE_NAME)?.value;
  const username = verifySessionCookie(raw);
  if (!username) return null;
  return { username, isOwner: true };
}
