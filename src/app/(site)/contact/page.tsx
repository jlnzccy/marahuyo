import { ReaderContainer } from "@/components/reader-container";
import { FadeUp } from "@/components/motion";
import { ContactLinks, type ContactLink } from "@/components/contact-links";
import { getSiteSettings } from "@/lib/settings";

export const metadata = {
  title: "Contact"
};

function trimAt(s: string): string {
  return s.replace(/^@+/, "");
}

function hostnameAndPath(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname + u.pathname).replace(/\/$/, "");
  } catch {
    return url;
  }
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const handle = settings.author.handle || "marahuyo";

  const links: ContactLink[] = [];

  if (settings.contactEmail) {
    links.push({
      icon: "mail",
      label: "Letters",
      value: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
      hint: "I read every one. I do not promise to be quick."
    });
  }

  if (settings.instagramUrl) {
    const display = hostnameAndPath(settings.instagramUrl).replace(/^instagram\.com\//, "@");
    links.push({
      icon: "instagram",
      label: "Instagram",
      value: display.startsWith("@") ? display : `@${trimAt(handle)}`,
      href: settings.instagramUrl,
      hint: "occasional fragments, mostly light"
    });
  }

  if (settings.mediumUrl) {
    const display = hostnameAndPath(settings.mediumUrl).replace(/^medium\.com\//, "");
    links.push({
      icon: "medium",
      label: "Medium",
      value: display || "medium",
      href: settings.mediumUrl,
      hint: "longer letters"
    });
  }

  if (settings.twitterUrl) {
    const display = hostnameAndPath(settings.twitterUrl).replace(/^(x|twitter)\.com\//, "@");
    links.push({
      icon: "twitter",
      label: "Twitter / X",
      value: display.startsWith("@") ? display : settings.twitterUrl,
      href: settings.twitterUrl,
      hint: "the briefer thoughts"
    });
  }

  if (settings.githubUrl) {
    const display = hostnameAndPath(settings.githubUrl).replace(/^github\.com\//, "");
    links.push({
      icon: "github",
      label: "GitHub",
      value: display || "github",
      href: settings.githubUrl,
      hint: "code, sometimes"
    });
  }

  return (
    <main id="main-content" className="pt-16 pb-24 md:pt-24">
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

        <div className="my-12 hairline" aria-hidden="true" />

        {links.length > 0 ? (
          <ContactLinks links={links} />
        ) : (
          <p className="font-italic italic text-muted">
            no channels open yet — check back soon.
          </p>
        )}
      </ReaderContainer>
    </main>
  );
}
