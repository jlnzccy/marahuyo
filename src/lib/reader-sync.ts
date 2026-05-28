import { getDeviceId } from "@/lib/device-id";

export type SyncEntry = {
  key: string;
  kind?: string | null;
  title?: string | null;
  href?: string | null;
  subtitle?: string | null;
  scrollPercent?: number;
  liked?: boolean;
  visitedAt?: number;
};

const ENDPOINT = "/api/reader/state";

/**
 * Fire-and-forget upsert to the reader-state endpoint. Failures are silent —
 * localStorage is the source of truth for the active session; the server is
 * a durability backup that the user gets across devices / cache clears.
 */
export function syncEntries(entries: SyncEntry[]): void {
  if (entries.length === 0) return;
  const deviceId = getDeviceId();
  if (!deviceId) return;
  try {
    const body = JSON.stringify({ device_id: deviceId, entries });
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(ENDPOINT, blob);
      return;
    }
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true
    }).catch(() => {
      /* swallow */
    });
  } catch {
    /* swallow */
  }
}

export type RemoteEntry = {
  key: string;
  kind: string | null;
  title: string | null;
  href: string | null;
  subtitle: string | null;
  scroll_percent: number;
  liked: boolean;
  visited_at: string;
};

/**
 * One-shot fetch of the full server state for this device. Used by the
 * homepage rail + reader-page liked-state hydration. Returns [] on any error.
 */
export async function fetchRemoteState(): Promise<RemoteEntry[]> {
  const deviceId = getDeviceId();
  if (!deviceId) return [];
  try {
    const res = await fetch(`${ENDPOINT}?device_id=${deviceId}`, {
      cache: "no-store"
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { ok: boolean; entries?: RemoteEntry[] };
    if (!json.ok) return [];
    return json.entries ?? [];
  } catch {
    return [];
  }
}
