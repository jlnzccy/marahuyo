import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { ThemeProvider, themeInitScript } from "@/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://marahuyo.local"),
  title: {
    default: "marahuyo — to be enchanted",
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
    icon: "/favicon.svg"
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
