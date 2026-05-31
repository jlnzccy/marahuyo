"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Eagerly warms Next's client cache for a route the reader is very likely to
 * hit next (the next chapter of a series), so the tap lands instantly instead of
 * waiting on a fresh fetch. Default `<Link>` only prefetches once it scrolls
 * into view — at the very foot of the page — which is too late for the floating
 * "next" chrome. Renders nothing.
 */
export function PrefetchRoute({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);
  return null;
}
