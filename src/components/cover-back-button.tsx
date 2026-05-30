"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Back affordance on a cover. Goes to the previous page (browser back) when
 * there's history, otherwise falls back to a sensible href. Hidden on the web
 * (the site has its own header nav) and shown only in the app via the
 * `.reader-cover-back` rule in globals.css.
 */
export function CoverBackButton({
  fallbackHref,
  onImage,
}: {
  fallbackHref: string;
  onImage: boolean;
}) {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Back"
      className={cn(
        "reader-cover-back h-9 w-9 items-center justify-center rounded-full transition-colors",
        onImage
          ? "absolute left-3 top-[calc(env(safe-area-inset-top)+0.6rem)] z-10 bg-black/45 text-white backdrop-blur-sm hover:bg-black/60"
          : "mb-4 border border-border/60 text-muted hover:text-ink"
      )}
    >
      <ChevronLeft className="h-5 w-5" />
    </button>
  );
}
