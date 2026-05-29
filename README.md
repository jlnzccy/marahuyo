<p align="center">
  <a href="https://marahuyo.art">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="public/logo.svg" />
      <source media="(prefers-color-scheme: light)" srcset="public/logo.svg" />
      <img alt="marahuyo" src="public/logo.svg" width="540" />
    </picture>
  </a>
</p>

<p align="center">
  <em>to be enchanted — a literary site for the unhurried reader.</em>
</p>

<p align="center">
  <a href="https://marahuyo.art"><strong>marahuyo.art</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-3fcf8e?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Framer_Motion-e044a7?style=flat-square&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Vercel-000?style=flat-square&logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## Overview

**Marahuyo** is a single-author literary platform — half immersive reader, half editorial portfolio. It's built around a quiet typographic system, a 650-pixel reading line, and three reading temperatures.

Every design decision serves the text: restrained color, generous whitespace, and a type stack tuned for long-form prose.

---

## Features

### 📖 Reading Surface

- **650 px prose container** — `1.78` line-height, first-paragraph drop cap
- **Three themes** — Cream · Light · Midnight — persisted before hydration (no flash)
- **Scroll-tied progress bar** — accent-colored, spring-animated
- **Poetry mode** — whitespace, indents, and soft returns preserved
- **Chapter navigation** — prev / next / series-index footer cards
- **Anonymous likes** — `localStorage`-only heart with burst animation
- **Bookmarks** — reading history tracked, "Continue reading" rail on homepage
- **Share** — Web Share API with clipboard fallback
- **Print stylesheet** — black-on-white, no chrome, URLs appended

### ✍️ Studio (CMS)

Private at `/studio`, gated to a single admin.

- **TipTap rich-text editor** with custom Poetry node, floating bubble menu, and universal embed picker (YouTube, Instagram, Vimeo, Spotify, TikTok)
- **Auto-save** with debounce, status indicator, and live word count
- **Draft → Publish workflow** with scheduled publishing and calendar picker
- **Works + Series + Chapters** with drag-and-drop reorder (`dnd-kit`)
- **Cover & in-editor image upload** via Supabase Storage
- **Settings** — site metadata, social links, author bio, portrait upload
- **Soft delete + Trash** with 30-day auto-purge

### 🔍 Discovery & SEO

- **Full-text search** with highlighted snippets
- **Command palette** — `⌘K` keyboard navigation
- **RSS feed** at `/feed.xml`
- **Dynamic sitemap** — DB-driven, covers all routes
- **OG images** — generated via `next/og`
- **`robots.txt`** — allows everything except `/studio/*`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) — App Router, Server Actions, `src/` directory |
| Styling | [Tailwind CSS](https://tailwindcss.com) + CSS custom properties for theme tokens |
| Motion | [Framer Motion](https://motion.dev) — physics-based transitions, scroll-aware header |
| Database | [Supabase](https://supabase.com) — Postgres with RLS (public reads, secret-key writes) |
| Editor | [TipTap](https://tiptap.dev) — ProseMirror with custom extensions |
| Auth | Env-backed HMAC-SHA256 session cookie (single-tenant, no third-party provider) |
| Hosting | [Vercel](https://vercel.com) — auto-deploy on push to `main` |

### Typography

| Tailwind class | Family | Role |
|---|---|---|
| `font-display` | Highcrest | Wordmark & hero |
| `font-serif` | Libre Baskerville | Body prose, titles |
| `font-italic` | Instrument Serif *italic* | Pull quotes, subtitles |
| `font-sans` | Figtree | Navigation, UI |
| `font-mono` | Geist Mono | Metadata, dates |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A [Supabase](https://supabase.com) project (free tier works)

### Install

```bash
git clone https://github.com/jlnzccy/marahuyo.git
cd marahuyo
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Studio (single-owner gate)
STUDIO_USERNAME=your-username
STUDIO_PASSWORD=your-password
STUDIO_SESSION_SECRET=<32-byte-hex>
```

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database

Run the migrations in `supabase/migrations/` in order via the Supabase SQL editor or CLI.

### Develop

```bash
npm run dev          # → http://localhost:3000
```

---

## Project Structure

```
src/
  app/
    (site)/             Public reading routes
    studio/             Private CMS (owner-only)
      (protected)/      Guarded by layout.tsx
        _actions/       Server actions (works, chapters, settings)
        _components/    Editor, toolbar, uploaders, dialogs
      login/            Username + password sign-in
    layout.tsx          Root layout + theme init
    globals.css         Design tokens + theme variables
  components/           Shared UI (header, footer, reader shell, …)
  lib/                  Pure logic — no JSX
    supabase/           Supabase clients + read helpers
    studio-session.ts   HMAC sign + verify (server-only)
  types/                Domain types
  assets/fonts/         Local font files
public/                 Static assets (favicon, logo)
supabase/migrations/    SQL migrations (pushed via GitHub Actions)
```

---

## Scripts

```bash
npm run dev            # Local development
npm run build          # Production build
npm run start          # Serve production build
npm run lint           # ESLint
npm run type-check     # tsc --noEmit
```

---

## License

© 2026 marahuyo. All rights reserved.
