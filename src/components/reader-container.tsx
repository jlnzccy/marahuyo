import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Slightly wider variant for editorial pages that aren't pure reading. */
  width?: "reader" | "editorial" | "wide";
  as?: keyof React.JSX.IntrinsicElements;
};

const WIDTHS: Record<NonNullable<Props["width"]>, string> = {
  reader: "max-w-reader",
  editorial: "max-w-2xl",
  wide: "max-w-4xl"
};

export function ReaderContainer({ children, className, width = "reader", as = "div" }: Props) {
  const Tag = as as React.ElementType;
  return (
    <Tag className={cn("mx-auto w-full px-5 md:px-8", WIDTHS[width], className)}>
      {children}
    </Tag>
  );
}
