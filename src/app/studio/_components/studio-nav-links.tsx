"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Library, PenLine, Settings, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/studio", label: "Overview", icon: FileText, exact: true },
  { href: "/studio/works", label: "Works", icon: PenLine },
  { href: "/studio/series", label: "Series", icon: Library },
  { href: "/studio/drafts", label: "Drafts", icon: FileText },
  { href: "/studio/trash", label: "Trash", icon: Trash2 },
  { href: "/studio/settings", label: "Settings", icon: Settings }
];

export function StudioNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 font-sans text-sm transition-colors",
              isActive
                ? "bg-surface text-ink"
                : "text-muted hover:bg-surface hover:text-ink"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
