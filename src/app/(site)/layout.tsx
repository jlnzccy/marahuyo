import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeSwitcher } from "@/components/theme-switcher";

/**
 * Shared chrome for the standard public pages — Works, About, Contact.
 * The home page lives outside this group because it needs `transparentOnTop`
 * on the header, and reader/series pages render their own ReaderShell.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <ThemeSwitcher />
    </>
  );
}
