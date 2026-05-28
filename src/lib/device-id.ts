const LS_KEY = "marahuyo:device";

/**
 * Stable per-browser identifier used to sync bookmarks + likes to the server.
 * Generated lazily on first call and persisted in localStorage. Returns null
 * on the server (no crypto / no storage) so callers can skip sync in SSR.
 */
export function getDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = window.localStorage.getItem(LS_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `dev-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      window.localStorage.setItem(LS_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}
