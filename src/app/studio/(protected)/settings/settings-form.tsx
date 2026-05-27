"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { updateSettings } from "@/app/studio/(protected)/_actions/settings";
import {
  SaveIndicator,
  type SaveStatus
} from "@/app/studio/(protected)/_components/save-indicator";
import { ImageUploader } from "@/app/studio/(protected)/_components/image-uploader";

export type InitialSettings = {
  defaultTheme: string;
  instagramUrl: string;
  twitterUrl: string;
  mediumUrl: string;
  githubUrl: string;
  contactEmail: string;
  portraitUrl: string;
  authorSubtitle: string;
  authorName: string;
  authorHandle: string;
  authorTagline: string;
  authorShortBio: string;
  authorBio: string;
  authorBioLong: string;
  authorLocation: string;
  aboutPlaceTitle: string;
  aboutPlaceBody: string;
  aboutPlaceQuote: string;
};

const SAVE_DEBOUNCE_MS = 1200;
const THEMES = ["light", "cream", "midnight"] as const;

export function SettingsForm({ initial }: { initial: InitialSettings }) {
  const [defaultTheme, setDefaultTheme] = useState(initial.defaultTheme);
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl);
  const [twitterUrl, setTwitterUrl] = useState(initial.twitterUrl);
  const [mediumUrl, setMediumUrl] = useState(initial.mediumUrl);
  const [githubUrl, setGithubUrl] = useState(initial.githubUrl);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);
  const [portraitUrl, setPortraitUrl] = useState(initial.portraitUrl);
  const [authorSubtitle, setAuthorSubtitle] = useState(initial.authorSubtitle);
  const [authorName, setAuthorName] = useState(initial.authorName);
  const [authorHandle, setAuthorHandle] = useState(initial.authorHandle);
  const [authorTagline, setAuthorTagline] = useState(initial.authorTagline);
  const [authorShortBio, setAuthorShortBio] = useState(initial.authorShortBio);
  const [authorBio, setAuthorBio] = useState(initial.authorBio);
  const [authorBioLong, setAuthorBioLong] = useState(initial.authorBioLong);
  const [authorLocation, setAuthorLocation] = useState(initial.authorLocation);
  const [aboutPlaceTitle, setAboutPlaceTitle] = useState(initial.aboutPlaceTitle);
  const [aboutPlaceBody, setAboutPlaceBody] = useState(initial.aboutPlaceBody);
  const [aboutPlaceQuote, setAboutPlaceQuote] = useState(initial.aboutPlaceQuote);

  const [saveState, setSaveState] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | undefined>(undefined);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didMount = useRef(false);

  const flushSave = useCallback(async () => {
    setSaveState("saving");
    setSaveError(undefined);
    try {
      await updateSettings({
        defaultTheme,
        instagramUrl: instagramUrl || null,
        twitterUrl: twitterUrl || null,
        mediumUrl: mediumUrl || null,
        githubUrl: githubUrl || null,
        contactEmail: contactEmail || null,
        portraitUrl: portraitUrl || null,
        authorSubtitle: authorSubtitle || null,
        authorName: authorName || null,
        authorHandle: authorHandle || null,
        authorTagline: authorTagline || null,
        authorShortBio: authorShortBio || null,
        authorBio: authorBio || null,
        authorBioLong: authorBioLong || null,
        authorLocation: authorLocation || null,
        aboutPlaceTitle: aboutPlaceTitle || null,
        aboutPlaceBody: aboutPlaceBody || null,
        aboutPlaceQuote: aboutPlaceQuote || null
      });
      setLastSavedAt(Date.now());
      setSaveState("saved");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
      setSaveState("error");
    }
  }, [
    defaultTheme,
    instagramUrl,
    twitterUrl,
    mediumUrl,
    githubUrl,
    contactEmail,
    portraitUrl,
    authorSubtitle,
    authorName,
    authorHandle,
    authorTagline,
    authorShortBio,
    authorBio,
    authorBioLong,
    authorLocation,
    aboutPlaceTitle,
    aboutPlaceBody,
    aboutPlaceQuote
  ]);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void flushSave();
    }, SAVE_DEBOUNCE_MS);
  }, [flushSave]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        void flushSave();
      }
    };
  }, [flushSave]);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between border-b border-border/60 pb-6">
        <div>
          <p className="meta mb-2">studio · settings</p>
          <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
            Site settings
          </h1>
          <p className="mt-2 font-italic italic text-base text-muted">
            theme, the about page, socials. quiet defaults for the public surface.
          </p>
        </div>
        <SaveIndicator
          status={saveState}
          lastSavedAt={lastSavedAt}
          errorMessage={saveError}
        />
      </header>

      <section className="space-y-4 rounded-2xl border border-border/60 bg-surface/40 p-6">
        <h2 className="font-serif text-xl font-bold">Reading</h2>
        <label className="block">
          <span className="meta">default theme</span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <label
                key={t}
                className="cursor-pointer rounded-md border border-border/60 bg-canvas p-3 text-center has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-canvas"
              >
                <input
                  type="radio"
                  name="default_theme"
                  value={t}
                  checked={defaultTheme === t}
                  onChange={() => setDefaultTheme(t)}
                  className="sr-only"
                />
                <span className="font-serif text-sm capitalize">{t}</span>
              </label>
            ))}
          </div>
        </label>
      </section>

      {/* ---------- About ---------- */}
      <section className="space-y-5 rounded-2xl border border-border/60 bg-surface/40 p-6">
        <div>
          <h2 className="font-serif text-xl font-bold">About the author</h2>
          <p className="mt-1 font-italic italic text-sm text-muted">
            powers the homepage hero and the /about page. plain text fields are
            single-line; the long bio accepts HTML (e.g. <code>&lt;p&gt;</code>, <code>&lt;em&gt;</code>).
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div>
            <ImageUploader
              prefix="portrait"
              label="portrait"
              value={portraitUrl}
              onChange={setPortraitUrl}
              previewAspect="aspect-[4/5]"
            />
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="name" value={authorName} onChange={setAuthorName} placeholder="Jae Cua" />
              <Field
                label="handle"
                value={authorHandle}
                onChange={setAuthorHandle}
                placeholder="marahuyo"
              />
            </div>
            <Field
              label="tagline"
              value={authorTagline}
              onChange={setAuthorTagline}
              placeholder="to be enchanted."
            />
            <Field
              label="subtitle (used on home + about)"
              value={authorSubtitle}
              onChange={setAuthorSubtitle}
              placeholder="dating cactus sa paso."
            />
            <Field
              label="location"
              value={authorLocation}
              onChange={setAuthorLocation}
              placeholder="Quezon City, Philippines"
            />

            <label className="block">
              <span className="meta">short bio (1–2 lines shown on home)</span>
              <textarea
                value={authorShortBio}
                onChange={(e) => setAuthorShortBio(e.target.value)}
                rows={2}
                placeholder="Filipino writer. Notes from a quiet kid…"
                className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-2 font-serif text-sm text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="meta">bio (one paragraph)</span>
              <textarea
                value={authorBio}
                onChange={(e) => setAuthorBio(e.target.value)}
                rows={4}
                placeholder="I read, write, and come up with some nonsense things…"
                className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-2 font-serif text-sm text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="meta">long bio (HTML — about page main body)</span>
              <textarea
                value={authorBioLong}
                onChange={(e) => setAuthorBioLong(e.target.value)}
                rows={10}
                placeholder='<p class="drop-cap">Isang hamak na bata na parating lutang…</p>'
                className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-2 font-mono text-xs text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
              />
            </label>
          </div>
        </div>
      </section>

      {/* ---------- About this place ---------- */}
      <section className="space-y-4 rounded-2xl border border-border/60 bg-surface/40 p-6">
        <div>
          <h2 className="font-serif text-xl font-bold">About this place</h2>
          <p className="mt-1 font-italic italic text-sm text-muted">
            shown at the bottom of the /about page. leave all fields empty to hide the section.
          </p>
        </div>
        <Field
          label="section title"
          value={aboutPlaceTitle}
          onChange={setAboutPlaceTitle}
          placeholder="About this place"
        />
        <label className="block">
          <span className="meta">body (HTML — supports {"<em>"}, {"<p>"}, etc.)</span>
          <textarea
            value={aboutPlaceBody}
            onChange={(e) => setAboutPlaceBody(e.target.value)}
            rows={5}
            placeholder="This site is built as a reading canvas first…"
            className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-2 font-mono text-xs text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="meta">closing quote (shown as a blockquote)</span>
          <input
            type="text"
            value={aboutPlaceQuote}
            onChange={(e) => setAboutPlaceQuote(e.target.value)}
            placeholder="If you are reading this, the work has already done what it set out to do."
            className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-1.5 font-mono text-xs text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
          />
        </label>
      </section>

      {/* ---------- Links ---------- */}
      <section className="space-y-4 rounded-2xl border border-border/60 bg-surface/40 p-6">
        <h2 className="font-serif text-xl font-bold">Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="instagram"
            value={instagramUrl}
            onChange={setInstagramUrl}
            type="url"
            placeholder="https://instagram.com/…"
          />
          <Field
            label="twitter / x"
            value={twitterUrl}
            onChange={setTwitterUrl}
            type="url"
            placeholder="https://x.com/…"
          />
          <Field
            label="medium"
            value={mediumUrl}
            onChange={setMediumUrl}
            type="url"
            placeholder="https://medium.com/@…"
          />
          <Field
            label="github"
            value={githubUrl}
            onChange={setGithubUrl}
            type="url"
            placeholder="https://github.com/…"
          />
          <Field
            label="contact email"
            value={contactEmail}
            onChange={setContactEmail}
            type="email"
            placeholder="hello@…"
          />
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="meta">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-1.5 font-mono text-xs text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
      />
    </label>
  );
}
