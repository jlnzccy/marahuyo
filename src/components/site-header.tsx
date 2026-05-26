"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { Wordmark } from "@/components/wordmark";
import { NavLink } from "@/components/nav-link";
import { cn } from "@/lib/cn";

type Props = {
  /** On reading canvas: header hides on scroll-down, returns on scroll-up. */
  scrollAware?: boolean;
  /** Transparent until scrolled (used on hero pages). */
  transparentOnTop?: boolean;
};

const NAV = [
  { href: "/works", label: "Works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader({ scrollAware = false, transparentOnTop = false }: Props) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (scrollAware) {
      if (latest > prev && latest > 120) setHidden(true);
      else setHidden(false);
    }
    setScrolled(latest > 8);
  });

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? -96 : 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sticky top-0 z-40 w-full transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled || !transparentOnTop
          ? "border-b border-border/60 bg-canvas/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <Wordmark size="sm" />
        <nav aria-label="Primary" className="flex items-center gap-7">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
