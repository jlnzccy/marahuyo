import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReaderContainer } from "@/components/reader-container";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FadeUp } from "@/components/motion";
import { ContactLinks, type ContactLink } from "@/components/contact-links";

export const metadata = {
  title: "Contact"
};

const LINKS: ContactLink[] = [
  {
    icon: "mail",
    label: "Letters",
    value: "hello@marahuyo.ph",
    href: "mailto:hello@marahuyo.ph",
    hint: "I read every one. I do not promise to be quick."
  },
  {
    icon: "instagram",
    label: "Instagram",
    value: "@marahuyo.archive",
    href: "https://instagram.com",
    hint: "occasional fragments, mostly light"
  },
  {
    icon: "substack",
    label: "Substack",
    value: "marahuyo.substack",
    href: "https://substack.com",
    hint: "longer dispatches, once a month"
  }
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-16 pb-24 md:pt-24">
        <ReaderContainer>
          <FadeUp>
            <p className="meta mb-6">a quiet hello</p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-balance md:text-5xl">
              Say <span className="font-italic italic font-normal">something</span>.
            </h1>
            <p className="mt-5 font-italic italic text-xl text-muted text-pretty md:text-2xl">
              the room is small, but the door is open.
            </p>
          </FadeUp>

          <div className="my-12 hairline" aria-hidden />

          <ContactLinks links={LINKS} />
        </ReaderContainer>
      </main>
      <SiteFooter />
      <ThemeSwitcher />
    </>
  );
}
