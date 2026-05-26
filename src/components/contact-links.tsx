"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Instagram, BookMarked, type LucideIcon } from "lucide-react";
import { Stagger, staggerChild } from "@/components/motion";

export type ContactLink = {
  icon: "mail" | "instagram" | "substack";
  label: string;
  value: string;
  href: string;
  hint: string;
};

const ICONS: Record<ContactLink["icon"], LucideIcon> = {
  mail: Mail,
  instagram: Instagram,
  substack: BookMarked
};

export function ContactLinks({ links }: { links: ContactLink[] }) {
  return (
    <Stagger className="space-y-3" staggerChildren={0.1}>
      {links.map((l) => {
        const Icon = ICONS[l.icon];
        return (
          <motion.div key={l.label} variants={staggerChild}>
            <Link
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noreferrer" : undefined}
              className="group flex items-center gap-5 rounded-xl border border-border/60 bg-surface/40 p-5 transition-colors hover:bg-surface"
            >
              <span className="grid h-11 w-11 place-items-center rounded-md border border-border/60 bg-canvas">
                <Icon className="h-4 w-4 text-ink" />
              </span>
              <div className="flex-1">
                <div className="meta">{l.label}</div>
                <div className="font-serif text-xl font-bold text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5">
                  {l.value}
                </div>
                <div className="mt-0.5 font-italic italic text-sm text-muted">{l.hint}</div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </Stagger>
  );
}
