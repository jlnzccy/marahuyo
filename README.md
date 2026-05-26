# marahuyo

*to be enchanted.*

A premium, single-author full-stack web app — half literary portfolio, half distraction-free immersive reader. Built around a quiet typographic system, the 650-pixel reading line, and three reading temperatures (Cream / Light / Midnight).

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 15** (App Router, TypeScript) |
| Styling | **Tailwind CSS** + CSS variables for theme tokens |
| Motion | **Framer Motion** |
| Database & Auth | **Supabase** (Postgres + magic-link auth) |
| Editor (CMS, next session) | **TipTap** |
| Fonts | `Libre Baskerville` · `Instrument Serif` *italic* · `Figtree` · `Geist Mono` |

---

## Quick start

```bash
# 1. install
npm install

# 2. environment
cp .env.local.example .env.local
# then fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, STUDIO_OWNER_EMAIL

# 3. database
# Paste supabase/migrations/0001_init.sql into the Supabase SQL editor,
# or run via the Supabase CLI:
#   supabase db push

# 4. dev
npm run dev          # http://localhost:3000
```

The site is fully functional with **mock content** until Supabase env vars are set; only the `/studio` route requires a real Supabase project.

---

## Project layout

```
src/
  app/
    page.tsx                       # Home / portfolio hub
    works/                         # Archive page
    series/[slug]/                 # Series directory
    series/[slug]/[chapter]/       # Chapter reader (immersive canvas)
    read/[slug]/                   # Standalone reader (poem / essay)
    about/  contact/  not-found.tsx
    studio/
      (protected)/                 # owner-only — wrapped by auth guard
        layout.tsx   page.tsx
      login/                       # magic-link sign-in (public)
      _components/chrome.tsx
      actions.ts                   # signInWithEmail, signOut
    layout.tsx  globals.css
  components/
    site-header.tsx                # scroll-aware on reader pages
    site-footer.tsx
    reader-container.tsx           # 650px max-width
    reader-shell.tsx               # full immersive reading template
    reading-progress.tsx           # scroll-tied accent line
    theme-provider.tsx             # cream / light / midnight, no-flash
    theme-switcher.tsx             # floating control bottom-right
    featured-card.tsx  work-row.tsx  kind-chip.tsx
    motion.tsx                     # FadeUp / FadeIn / Stagger primitives
    wordmark.tsx  nav-link.tsx
    contact-links.tsx
  lib/
    fonts.ts  cn.ts  theme.ts  mock-content.ts
    supabase/  client.ts server.ts admin.ts auth.ts env.ts types.ts
  types/content.ts
middleware.ts                      # refreshes Supabase session on /studio/*
supabase/migrations/0001_init.sql  # works + chapters schema, RLS
tailwind.config.ts  tsconfig.json  next.config.mjs
```

---

## Typography

The four families are loaded once in `src/lib/fonts.ts` and exposed as CSS variables (`--font-libre-baskerville`, `--font-instrument-serif`, `--font-figtree`, `--font-geist-mono`). Tailwind maps them to:

| Class | Family | Used for |
| --- | --- | --- |
| `font-serif` | Libre Baskerville | body prose, titles, the wordmark |
| `font-italic italic` | Instrument Serif *italic* | emphasis, pull quotes, creative subtitles |
| `font-sans` | Figtree | navigation, buttons, UI labels |
| `font-mono` | Geist Mono | metadata, dates, system stats — the `.meta` class |

The reading line is enforced via `max-w-reader` (650px) on every immersive surface.

---

## Themes

Three modes, all driven by CSS custom properties in `src/app/globals.css`:

| Theme | Canvas | Ink | Accent |
| --- | --- | --- | --- |
| **Cream** *(default)* | `#FDFBF7` | `#1A1A1A` | warm sienna |
| Light | `#FFFFFF` | `#121214` | editorial cobalt |
| Midnight | `#0E0E10` | `#E8E4DC` | candle-gold |

`<ThemeProvider>` persists choice to `localStorage`; an inline init script in `<head>` applies the saved theme **before** hydration to prevent flash. The floating `ThemeSwitcher` (bottom-right) cycles between them with a Framer Motion panel.

---

## Reading canvas

Mounted by `<ReaderShell />` and used by:

- `/read/[slug]` — standalone poems / essays / one-shots
- `/series/[slug]/[chapter]` — series chapters

Includes:

- 650-px prose container, `1.78` line-height
- First-paragraph drop cap (`.drop-cap` modifier)
- Scroll-tied accent progress bar (`<ReadingProgress />`)
- Scroll-aware site header (hides on down-scroll, returns on up-scroll)
- Chapter footer with prev / next / series-index cards
- Full poetry-mode preservation — whitespace + soft returns intact (`.poetry`)

---

## Studio (CMS)

Located at `/studio`, gated to a single email address.

- `/studio/login` — magic-link sign-in (uses Supabase `signInWithOtp`)
- `/studio/(protected)/*` — only renders when `auth.user.email === STUDIO_OWNER_EMAIL`
- `middleware.ts` keeps the Supabase session cookie fresh on every `/studio/*` request

The CMS itself (TipTap editor, draft/publish toggle, auto-save, chapter drag-and-drop) is **scaffolded** with route folders and Server Action stubs (`signInWithEmail`, `signOut`) and is targeted for the next build session.

When Supabase env vars are absent, `/studio` renders a graceful "configure Supabase" notice instead of erroring.

---

## Roadmap (next session)

1. TipTap editor with a custom `PoetryNode` that preserves indents + hard breaks.
2. Server actions for `createWork`, `updateWork`, `publishWork`, `reorderChapters` (service-role).
3. Quiet auto-save heartbeat with a status-light indicator.
4. Live data wiring — swap `src/lib/mock-content.ts` for Supabase queries via `getServerSupabase`.
5. Image upload via Supabase Storage.
6. RSS feed at `/feed.xml` for the recent dispatches.

---

## Scripts

```bash
npm run dev          # local development
npm run build        # production build
npm run start        # serve the production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
```

---

© 2026 marahuyo — all stories belong to their author.
