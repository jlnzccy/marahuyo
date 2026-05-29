import { ReaderContainer } from "@/components/reader-container";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion";

export const metadata = {
  title: "Colophon",
  description: "The typefaces, palette, and tools behind Marahuyo."
};

type Typeface = {
  name: string;
  role: string;
  className: string;
  size: string;
  specimen: string;
  note: string;
};

const TYPEFACES: Typeface[] = [
  {
    name: "Libre Baskerville",
    role: "Reading & headlines",
    className: "font-serif font-bold",
    size: "text-3xl md:text-5xl",
    specimen: "The quiet hours hold the longest stories.",
    note: "A transitional serif redrawn for the screen — open counters, sturdy at small sizes. It carries every essay, poem, and chapter."
  },
  {
    name: "Instrument Serif",
    role: "Accents & asides",
    className: "font-italic italic",
    size: "text-4xl md:text-6xl",
    specimen: "to be enchanted",
    note: "An expressive display italic, kept for subtitles, pull-asides, and the small flourishes between sections."
  },
  {
    name: "Figtree",
    role: "Interface",
    className: "font-sans",
    size: "text-2xl md:text-3xl",
    specimen: "Continue · Chapter 03 · 8 min",
    note: "A humanist sans reserved for the chrome — navigation, buttons, the machinery that should never compete with the prose."
  },
  {
    name: "Geist Mono",
    role: "Metadata",
    className: "font-mono",
    size: "text-xl md:text-2xl",
    specimen: "01 — published · 1,240 words",
    note: "Monospace for timestamps, counts, and captions. The fine print, set with intent."
  },
  {
    name: "Highcrest",
    role: "Wordmark only",
    className: "font-display",
    size: "text-5xl md:text-7xl",
    specimen: "Marahuyo",
    note: "A display face held back for a single use: the name itself. You will not find it anywhere else on the site."
  }
];

type Swatch = { token: string; label: string; desc: string };

const PALETTE: Swatch[] = [
  { token: "canvas", label: "Canvas", desc: "the page" },
  { token: "surface", label: "Surface", desc: "raised panels" },
  { token: "ink", label: "Ink", desc: "body text" },
  { token: "muted", label: "Muted", desc: "secondary text" },
  { token: "whisper", label: "Whisper", desc: "captions" },
  { token: "accent", label: "Accent", desc: "links & marks" },
  { token: "border", label: "Border", desc: "hairlines" }
];

export default function ColophonPage() {
  return (
    <main id="main-content" className="pt-16 pb-24 md:pt-24">
      <ReaderContainer width="wide">
        <FadeUp>
          <p className="meta mb-6">a colophon</p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-balance md:text-6xl">
            How this place is{" "}
            <span className="font-italic italic font-normal">set</span>.
          </h1>
          <p className="mt-6 max-w-prose font-serif text-reading-sm text-muted text-pretty">
            Every choice here is in service of the reading — the letters you read
            by, the colours behind them, and the quiet tools that hold it together.
          </p>
        </FadeUp>

        <div className="my-14 hairline" aria-hidden="true" />

        <FadeUp>
          <h2 className="font-italic italic text-2xl text-muted md:text-3xl">
            typefaces
          </h2>
        </FadeUp>

        <Stagger className="mt-8 space-y-12" staggerChildren={0.08}>
          {TYPEFACES.map((t) => (
            <StaggerItem key={t.name}>
              <div className="grid gap-4 md:grid-cols-[1fr_minmax(0,2fr)] md:gap-10">
                <div className="md:pt-2">
                  <div className="font-sans text-sm font-medium text-ink">
                    {t.name}
                  </div>
                  <div className="meta mt-1">{t.role}</div>
                </div>
                <div>
                  <p className={`${t.className} ${t.size} leading-tight text-ink text-balance`}>
                    {t.specimen}
                  </p>
                  <p className="mt-3 max-w-prose font-serif text-sm text-muted text-pretty">
                    {t.note}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="my-14 hairline" aria-hidden="true" />

        <FadeUp>
          <h2 className="font-italic italic text-2xl text-muted md:text-3xl">
            palette
          </h2>
          <p className="mt-3 max-w-prose font-serif text-sm text-muted text-pretty">
            Shown in your current theme — switch it and these swatches follow.
            Three palettes, all tuned to stay legible: Paper, Cream, and Midnight.
          </p>
        </FadeUp>

        <Stagger
          className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
          staggerChildren={0.05}
        >
          {PALETTE.map((s) => (
            <StaggerItem key={s.token}>
              <div
                className="aspect-[4/3] w-full rounded-xl border border-border/60 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                style={{ backgroundColor: `rgb(var(--${s.token}))` }}
                aria-hidden="true"
              />
              <div className="mt-3">
                <div className="font-sans text-sm font-medium text-ink">
                  {s.label}
                </div>
                <div className="meta mt-0.5">{s.desc}</div>
                <code className="mt-1 block font-mono text-[11px] text-whisper">
                  --{s.token}
                </code>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="my-14 hairline" aria-hidden="true" />

        <FadeUp>
          <h2 className="font-italic italic text-2xl text-muted md:text-3xl">
            the workshop
          </h2>
          <div className="reader-prose mt-6 max-w-prose">
            <p>
              Marahuyo is built with{" "}
              <strong>Next.js</strong> and <strong>React</strong>, typeset with
              Tailwind, and kept honest by TypeScript. The words live in Postgres
              by way of Supabase; everything is written in a small in-house studio
              and rendered as static pages wherever it can be.
            </p>
            <p>
              There are no trackers, no pop-ups, no newsletter wall — only a
              theme switcher, a way to mark your place, and the text. The reading
              comes first; the rest stays out of the way.
            </p>
          </div>
        </FadeUp>
      </ReaderContainer>
    </main>
  );
}
