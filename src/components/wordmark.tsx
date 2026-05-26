import Link from "next/link";
import { cn } from "@/lib/cn";

type Props = {
  size?: "sm" | "md" | "lg" | "xl";
  asLink?: boolean;
  className?: string;
  showTagline?: boolean;
};

const SIZES: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-[26px]",
  md: "text-[34px]",
  lg: "text-[56px] md:text-[68px]",
  xl: "text-[88px] md:text-[120px] lg:text-[150px]"
};

export function Wordmark({
  size = "md",
  asLink = true,
  className,
  showTagline = true
}: Props) {
  const inner = (
    <span
      className={cn(
        "font-display lowercase leading-none text-ink",
        SIZES[size],
        className
      )}
    >
      marahuyo
    </span>
  );

  if (!asLink) return inner;

  return (
    <Link href="/" aria-label="Marahuyo — home" className="group inline-flex items-baseline gap-2">
      {inner}
      {showTagline && (
        <span
          aria-hidden
          className="meta hidden sm:inline opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        >
          to be enchanted
        </span>
      )}
    </Link>
  );
}
