"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { KindChip } from "@/components/kind-chip";
import type { AnyWork } from "@/types/content";

type Props = {
  work: AnyWork;
  href: string;
  eyebrow?: string;
};

export function FeaturedCard({ work, href, eyebrow = "latest letter" }: Props) {
  const cover = work.coverImage;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="group relative overflow-hidden rounded-3xl"
    >
      <div className="relative grid gap-0 md:grid-cols-[1.05fr_1fr]">
        {/* Text column */}
        <div className="order-2 space-y-5 p-8 md:order-1 md:p-12 lg:p-16">
          <div className="flex items-center gap-3">
            <KindChip kind={work.kind} />
            <span className="meta">{eyebrow}</span>
          </div>
          <h2 className="font-serif text-3xl font-bold leading-tight text-balance md:text-4xl lg:text-5xl">
            {work.title}
          </h2>
          {work.subtitle && (
            <p className="font-italic italic text-xl text-muted text-pretty md:text-2xl">
              {work.subtitle}
            </p>
          )}
          <p className="max-w-prose font-serif text-reading-sm text-muted text-pretty">
            {work.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
            <Link
              href={href}
              className="group/cta inline-flex items-center gap-2 font-sans text-sm font-medium text-ink underline decoration-ink/30 underline-offset-[6px] transition-all hover:decoration-ink"
            >
              {work.kind === "series" ? "Begin reading" : "Read the letter"}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover/cta:translate-x-1" />
            </Link>
            <span className="meta">
              {work.readingMinutes} min · {work.wordCount.toLocaleString()} words
            </span>
          </div>
        </div>

        {/* Image column — decorative; the text-side CTA is the only interactive
            entry-point. Keeping a single tabbable link avoids the double-stop
            and the empty `alt=""` accessibility smell. */}
        <div className="relative order-1 block aspect-[5/4] overflow-hidden rounded-2xl bg-surface md:order-2 md:aspect-auto md:min-h-[460px]">
          {cover && (
            <Image
              src={cover}
              alt={`Cover for ${work.title}`}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              priority
            />
          )}
          {!cover && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-italic italic text-xl text-whisper">no cover yet</span>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
