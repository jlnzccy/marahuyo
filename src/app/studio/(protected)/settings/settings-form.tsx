"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { updateSettings } from "@/app/studio/(protected)/_actions/settings";
import {
  SaveIndicator,
  type SaveStatus
} from "@/app/studio/(protected)/_components/save-indicator";

export type InitialSettings = {
  defaultTheme: string;
  instagramUrl: string;
  twitterUrl: string;
  substackUrl: string;
  githubUrl: string;
  contactEmail: string;
  portraitUrl: string;
  authorSubtitle: string;
};

const SAVE_DEBOUNCE_MS = 1200;
const THEMES = ["light", "cream", "midnight"] as const;

export function SettingsForm({ initial }: { initial: InitialSettings }) {
  const [defaultTheme, setDefaultTheme] = useState(initial.defaultTheme);
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl);
  const [twitterUrl, setTwitterUrl] = useState(initial.twitterUrl);
  const [substackUrl, setSubstackUrl] = useState(initial.substackUrl);
  const [githubUrl, setGithubUrl] = useState(initial.githubUrl);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);
  const [portraitUrl, setPortraitUrl] = useState(initial.portraitUrl);
  const [authorSubtitle, setAuthorSubtitle] = useState(initial.authorSubtitle);

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
        substackUrl: substackUrl || null,
        githubUrl: githubUrl || null,
        contactEmail: contactEmail || null,
        portraitUrl: portraitUrl || null,
        authorSubtitle: authorSubtitle || null
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
    substackUrl,
    githubUrl,
    contactEmail,
    portraitUrl,
    authorSubtitle
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
            theme, socials, portrait. quiet defaults for the public surface.
          </p>
        </div>
        <SaveIndicator
          status={saveState}
          lastSavedAt={lastSavedAt}
          errorMessage={saveError}
        />
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
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

        <section className="space-y-4 rounded-2xl border border-border/60 bg-surface/40 p-6">
          <h2 className="font-serif text-xl font-bold">About</h2>
          <Field
            label="author subtitle"
            value={authorSubtitle}
            onChange={setAuthorSubtitle}
            placeholder="dating cactus sa paso."
          />
          <Field
            label="portrait url"
            value={portraitUrl}
            onChange={setPortraitUrl}
            type="url"
            placeholder="https://… (or a /portrait.jpg path)"
          />
        </section>

        <section className="space-y-4 rounded-2xl border border-border/60 bg-surface/40 p-6 lg:col-span-2">
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
              label="substack"
              value={substackUrl}
              onChange={setSubstackUrl}
              type="url"
              placeholder="https://…substack.com"
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
