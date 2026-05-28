"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Props = {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  className?: string;
};

export function NavLink({ href, children, exact, className }: Props) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative font-sans text-sm font-medium transition-colors",
        active ? "text-ink" : "text-muted hover:text-ink",
        className
      )}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute -bottom-1 left-0 h-px bg-ink transition-all duration-500 ease-out-expo",
          active ? "w-full" : "w-0 group-hover:w-full"
        )}
      />
    </Link>
  );
}
