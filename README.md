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
| Database | **Supabase** (Postgres, RLS — public reads, secret-key writes) |
| Auth | **Env-HMAC session** (single admin, no third-party provider) |
| Editor | **TipTap** (ProseMirror) with custom Poetry node |
| Fonts | `Libre Baskerville` · `Instrument Serif` *italic* · `Figtree` · `Geist Mono` · `Highcrest` |

---

## Quick start

```bash
# 1. install
npm install

# 2. environment
cp .env.local.example .env.local
# then fill in:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   STUDIO_USERNAME
#   STUDIO_PASSWORD
#   STUDIO_SESSION_SECRET          ← 32 random bytes, hex-encoded
#   NEXT_PUBLIC_SITE_URL           ← optional, defaults to marahuyoph.vercel.app

# 3. database — run all migrations in order via the Supabase SQL editor or CLI
#   supabase/migrations/0001_init.sql
#   supabase/migrations/0002_storage_covers.sql
#   supabase/migrations/0003_settings.sql
#   supabase/migrations/0004_extend_work_kind.sql
#   supabase/migrations/0005_settings_about.sql
#   supabase/migrations/0006_about_place_settings.sql
#   supabase/migrations/0007_settings_medium.sql
#   supabase/migrations/0008_settings_public_view.sql

# 4. dev
npm run dev          # http://localhost:3000
```

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The site is fully functional with **mock content** until Supabase env vars are set; only the `/studio` route requires a real Supabase project.

---

## Features

### Reading surface

- **650-px prose container** with `1.78` line-height and first-paragraph drop cap
- **Three themes** — Cream (warm), Light (editorial), Midnight (low-glare) — persisted to `localStorage`, applied before hydration to prevent flash
- **Scroll-tied reading progress bar** (accent-colored)
- **Scroll-aware site header** — hides on down-scroll, returns on up-scroll
- **Poetry mode** — whitespace, indents, and soft returns preserved via `.poetry` styling
- **Chapter navigation** — prev / next / series-index footer cards
- **Like button** — anonymous, `localStorage`-only heart with burst animation
- **Share button** — Web-Share API with clipboard fallback
- **Bookmarks** — `localStorage`-backed reading history; "Continue reading" rail on homepage
- **Print stylesheet** — forces black-on-white, hides chrome, appends URLs after links
- **RSS feed** at `/feed.xml` (1 h cache, recent standalone dispatches)
- **Sitemap** (`/sitemap.xml`) — DB-driven, covers works + series + chapters + static routes
- **`robots.txt`** — allows everything except `/studio/*`
- **OG images** — generated via `next/og` for root, reads, series, and chapters

### Studio (CMS)

Located at `/studio`, gated to a single admin via env-backed credentials.

- **Sign-in** — `/studio/login` accepts `STUDIO_USERNAME` + `STUDIO_PASSWORD`, verified with `crypto.timingSafeEqual`. On match, sets an HMAC-SHA256 signed session cookie (`HttpOnly`, `SameSite=Lax`, `Secure` in production, 30-day expiry).
- **Route guard** — `(protected)/layout.tsx` checks `getStudioSession()` on every request. No `middleware.ts` is used.
- **TipTap rich text editor** — StarterKit extensions (headings, lists, blockquote, hr) + Placeholder + Link + Image + CharacterCount. Floating bubble menu for inline formatting.
- **Custom PoetryNode** — renders `<div class="poetry">` with preserved whitespace; Enter inserts literal `\n` rather than splitting the block.
- **Universal embed picker** — inline popover supporting YouTube, Instagram, Vimeo, Spotify, and TikTok with auto-detect URL parsing.
- **Auto-save** — 1200 ms debounce with status indicator (idle / saving / saved / error) and last-saved timestamp. Word count and reading time computed live.
- **Draft / publish workflow** — publish, unpublish, and manual publication date with calendar picker.
- **Works management** — create, edit, and delete poems, essays, one-shots, articles, stories, and notes.
- **Series & chapter management** — sortable chapter list with `dnd-kit` drag-and-drop reorder.
- **Cover image upload** — drag-drop uploader with Supabase Storage (`covers/<workId>/`).
- **In-editor image upload** — toolbar button opens upload dialog; images stored under `covers/editor/<id>/`.
- **Settings page** — site metadata, social links, author bio, and drag-drop portrait upload.
- **Drafts inbox** — unified view of all unpublished works and chapters.
- **Studio overview** — live stats (drafts / published / total words) + recent activity feed.
- **Inline dialogs** — `PromptDialog`, `AlertDialog`, and `ConfirmDialog` replace all browser-native modals.

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
    feed.xml/route.ts              # RSS feed
    sitemap.ts  robots.ts          # SEO
    opengraph-image.tsx            # Root OG image
    studio/
      (protected)/                 # owner-only — guarded by layout.tsx
        layout.tsx   page.tsx      # Dashboard with stats + activity
        works/                     # Works list / new / [id] editor
        series/                    # Series list / new / [id] + chapters
        drafts/                    # Unified drafts inbox
        settings/                  # Site settings + portrait upload
        not-found.tsx
        _actions/                  # Server actions (works, chapters, settings)
        _components/               # Editor, toolbar, uploaders, dialogs
      login/                       # Username + password sign-in (public)
      _components/chrome.tsx
      actions.ts                   # signIn, signOut
    layout.tsx  globals.css
  components/
    site-header.tsx                # scroll-aware on reader pages
    site-footer.tsx
    reader-container.tsx           # 650px max-width
    reader-shell.tsx               # full immersive reading template
    reading-progress.tsx           # scroll-tied accent line
    theme-provider.tsx             # cream / light / midnight, no-flash
    theme-switcher.tsx             # floating control bottom-right
    like-button.tsx                # localStorage anonymous heart
    share-button.tsx               # Web-Share + clipboard fallback
    bookmark-tracker.tsx           # records reading history
    continue-reading.tsx           # homepage "continue reading" rail
    featured-card.tsx  work-row.tsx  kind-chip.tsx
    motion.tsx                     # FadeUp / FadeIn / Stagger primitives
    wordmark.tsx  nav-link.tsx
    reader-foot.tsx                # chapter prev/next/index cards
    contact-links.tsx
  lib/
    fonts.ts  cn.ts  theme.ts
    works.ts                       # read APIs (published works, series, chapters)
    settings.ts                    # site settings reader
    bookmarks.ts                   # localStorage bookmark helpers
    studio-session.ts              # HMAC sign + verify (server-only)
    slug.ts  site.ts
    mock-content.ts                # fallback seed data
    supabase/
      client.ts  server.ts  admin.ts
      auth.ts  env.ts  types.ts
  types/content.ts
  assets/fonts/                    # Highcrest.ttf (personal-use license)
public/                            # favicon.svg, static assets
supabase/migrations/
  0001_init.sql                    # works + chapters schema, RLS
  0002_storage_covers.sql          # public covers bucket + policy
  0003_settings.sql                # settings singleton table
  0004_extend_work_kind.sql        # article, story, note kinds
  0005_settings_about.sql          # author bio fields
  0006_about_place_settings.sql    # "about this place" fields
  0007_settings_medium.sql         # rename substack_url → medium_url
  0008_settings_public_view.sql    # public-safe view for anon reads
tailwind.config.ts  tsconfig.json  next.config.mjs
```

---

## Typography

The five families are loaded once in `src/lib/fonts.ts` and exposed as CSS variables. Tailwind maps them to:

| Class | Family | Used for |
| --- | --- | --- |
| `font-display` | Highcrest (local) | the wordmark and homepage hero |
| `font-serif` | Libre Baskerville | body prose, titles, headings |
| `font-italic italic` | Instrument Serif *italic* | pull quotes, decorative subtitles |
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
- Anonymous like button + share button below body
- `localStorage` bookmarks — reading history tracked, "Continue reading" rail on homepage

---

## Auth

Single-tenant, env-backed. No Supabase auth, no magic link, no user table.

| Env var | Purpose |
| --- | --- |
| `STUDIO_USERNAME` | The one admin username |
| `STUDIO_PASSWORD` | The one admin password |
| `STUDIO_SESSION_SECRET` | 32-byte hex key for HMAC-SHA256 cookie signing |

Sign-in compares credentials with `crypto.timingSafeEqual`. On match, the server sets a `studio_session` cookie containing `<username>.<hex_hmac>`. Verification recomputes the HMAC — no database read, no network call.

Route protection is handled entirely by `(protected)/layout.tsx`. There is no `middleware.ts`.

---

## Database

All writes go through the Supabase service-role key (server actions only). RLS is enabled — the public anon key can only `SELECT` rows where `status = 'published'`. There are no client write policies.

**Migrations** (run in order):

| File | Purpose |
| --- | --- |
| `0001_init.sql` | `works` + `chapters` tables, RLS policies, indexes |
| `0002_storage_covers.sql` | Public `covers` storage bucket + read policy |
| `0003_settings.sql` | `settings` singleton table (site metadata, social links) |
| `0004_extend_work_kind.sql` | Adds `article`, `story`, `note` to work kind enum |
| `0005_settings_about.sql` | Author bio + portrait fields on `settings` |
| `0006_about_place_settings.sql` | "About this place" section fields |
| `0007_settings_medium.sql` | Renames `substack_url` → `medium_url` |
| `0008_settings_public_view.sql` | Public-safe view for anon reads, restricts direct table access |

---

## Future work

The core CMS, live data wiring, and reader experience are complete. Remaining quality items from a full codebase review:

- **Accessibility** — skip-to-content link, `prefers-reduced-motion` support, WCAG contrast audit.
- **Performance** — parallelize homepage queries with `Promise.all`, wrap read APIs in React `cache()`, `whileInView` scroll animations.
- **Data integrity** — Zod-validate server actions, generated Supabase types, storage cleanup on delete.
- **Features** — full-text search, table of contents, reading position resume, version history, tag filters, scheduled publishing.

See `TODO.md` for the full prioritized checklist.

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

© 2026 marahuyo
