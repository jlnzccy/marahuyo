import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { ThemeProvider, themeInitScript } from "@/components/theme-provider";
import { ReaderStateHydrator } from "@/components/reader-state-hydrator";
import { CommandPalette } from "@/components/command-palette";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://marahuyo.art"),
  title: {
    default: "marahuyo",
    template: "%s — marahuyo"
  },
  description:
    "A premium reading canvas and literary portfolio. Poems, essays, and ongoing series in a quiet typography.",
  openGraph: {
    title: "marahuyo",
    description: "to be enchanted.",
    type: "website"
  },
  robots: { index: true, follow: true },
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" }
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0E10" }
  ],
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:border focus:border-border focus:bg-canvas focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:text-ink focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/60"
        >
          Skip to content
        </a>
        <ReaderStateHydrator />
        <ThemeProvider>
          {children}
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
