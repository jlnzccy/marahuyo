/**
 * Shared formatting helpers. Keep tiny + side-effect free so they can be
 * imported from server + client equally.
 *
 * Dates use the runtime default locale (no hard-coded "en-US") so the same
 * page works for visitors in different regions. Relative times use
 * `Intl.RelativeTimeFormat` which handles the "just now" / "1 minute ago"
 * gradient natively and stays localized.
 */

const RTF =
  typeof Intl !== "undefined" && "RelativeTimeFormat" in Intl
    ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
    : null;

/** Months, days, year — locale-aware. */
export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

/**
 * Compact relative time for activity feeds + bookmark rail.
 * Falls back to `formatDate` past 30 days. Honors the runtime default locale.
 */
export function relativeTime(iso: string | number | Date): string {
  const ms = typeof iso === "number" ? iso : new Date(iso).getTime();
  const delta = Date.now() - ms;
  const secs = Math.round(delta / 1000);

  if (!RTF) return new Date(ms).toLocaleDateString();

  if (secs < 60) return RTF.format(-secs, "second");
  const mins = Math.round(secs / 60);
  if (mins < 60) return RTF.format(-mins, "minute");
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return RTF.format(-hrs, "hour");
  const days = Math.round(hrs / 24);
  if (days < 30) return RTF.format(-days, "day");

  return formatDate(new Date(ms).toISOString());
}
