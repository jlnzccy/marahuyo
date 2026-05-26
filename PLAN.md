# Marahuyo — Implementation Plan

A living document describing what has been built, what is left, the architectural decisions behind each layer, and the conventions to keep using across sessions. Pair this with `TODO.md` for the actionable checklist.

---

## 1. North star

A single-author literary site that is **both** a premium portfolio and a distraction-free immersive reader. Half "Wattpad-quality reading flow," half "editorial print magazine on the screen." One writer (Jae Cua). One private writing room (Studio). One public reader-first surface.

Three values, in order:

1. **The reading line is sacred.** Every prose surface caps at 650 px and runs at 1.78 line-height.
2. **Typography is the design system.** Color is restrained; spacing carries the eye. The brand is the wordmark and three serifs.
3. **Auth and CMS are private.** Only the env-backed `STUDIO_USERNAME` + `STUDIO_PASSWORD` pair reaches `/studio`. Public users see only published rows.

---

## 2. Tech stack (locked)

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15 App Router (TS, src dir) | SSR for reading SEO, server actions for CMS, image optimization |
| Styling | Tailwind v3.4 + CSS vars | Tokens drive theme switching without re-rendering |
| Motion | Framer Motion | Physics-based fades, scroll-aware header, reading progress spring |
| DB | Supabase Postgres (RLS) | Public-read gating, secret-key writes from server actions, free tier |
| Auth | Env credential + HMAC-signed cookie (Node `crypto`) | Single-tenant. No third-party auth dependency. See § 8. |
| Editor (Phase 1) | TipTap (ProseMirror) | Custom Poetry node for whitespace-preserved verse |
| Fonts | Libre Baskerville, Instrument Serif italic, Figtree, Geist Mono, Highcrest | See § 5 |
| Image host | Picsum placeholders today → Supabase Storage tomorrow | Phase 2 swap |
| Hosting | Vercel | Auto-deploy on push to `main`. Project `marahuyo`, org `jae-s-projects`, alias `marahuyoph.vercel.app`. |
| Git | GitHub `jlnzccy/marahuyo` over SSH | Per-account key at `~/.ssh/id_ed25519_jlnzccy`, scoped in `~/.ssh/config`. |

---

## 3. Routes

```
/                            Homepage / portfolio hub
/works                       Archive of every published work
/series/[slug]               Series directory (chapter list)
/series/[slug]/[chapter]     Chapter reader (immersive canvas)
/read/[slug]                 Standalone reader (poems, essays, oneshots)
/about                       Editorial bio
/contact                     Email + socials
/studio                      Private CMS (owner only)
/studio/login                Username + password sign-in
```

All public reading routes are statically generated via `generateStaticParams`. Studio routes are dynamic and gated by `getStudioSession`.

---

## 4. Content model

```
work (a single row covers BOTH standalone pieces and series parents)
  id, slug, title, subtitle
  kind        : poem | essay | oneshot | series
  status      : draft | published
  excerpt, body (empty for series), poetry_mode (bool)
  tags[], cover_image, cover_color
  word_count, reading_minutes
  published_at, created_at, updated_at

chapter (only used when work.kind = 'series')
  id, series_id (FK works.id), slug, number
  title, subtitle, body, poetry_mode, cover_image
  status, word_count, reading_minutes
  published_at, created_at, updated_at
  unique(series_id, slug), unique(series_id, number)
```

**RLS posture:** RLS is enabled. Public role can only `SELECT` rows where `status = 'published'`. **All writes go through the secret key (server actions only)** — there is no client write policy and never will be. This keeps the single-author guarantee impossible to violate from the browser.

Source of truth lives in `supabase/migrations/0001_init.sql`. Keep this file in sync with the schema; create `0002_*.sql` for changes.

---

## 5. Typography stack

| Tailwind class | Family | Where it lives |
| --- | --- | --- |
| `font-display` | Highcrest (local) | The wordmark and the homepage hero only |
| `font-serif` | Libre Baskerville | Body prose, titles, headings |
| `font-italic italic` | Instrument Serif italic | Pull quotes, subtitles, emphasis |
| `font-sans` | Figtree | Navigation, buttons, UI labels |
| `font-mono` | Geist Mono | Metadata, dates, stats (`.meta` class) |

Loaded once in `src/lib/fonts.ts`. Highcrest is a personal-use license (1001fonts.com). **If you ever go commercial, buy a commercial license or replace.**

---

## 6. Theme system

Three themes, all driven by CSS custom properties in `globals.css`:

| Theme | Canvas | Ink | Notes |
| --- | --- | --- | --- |
| **Paper** *(default)* | `#FFFFFF` | `#121214` | The white you see in screenshots |
| Cream | `#FDFBF7` | `#1A1A1A` | Warm reading temperature |
| Midnight | `#0E0E10` | `#E8E4DC` | Low-glare night |

`ThemeProvider` persists choice to `localStorage`. An inline `<script>` in `<head>` applies the saved theme *before* hydration to avoid flash. The floating `ThemeSwitcher` (bottom-right) cycles between them with a Framer Motion panel.

To add a fourth theme: add a `[data-theme="x"]` block in `globals.css`, append to `THEMES` in `src/lib/theme.ts`, add label + description.

---

## 7. Reading canvas conventions

- Container: `max-w-reader` (650 px) for prose; `max-w-wide` (4xl) for editorial pages.
- Drop cap: add `class="drop-cap"` to the first `<p>` of a chapter.
- Poetry: wrap in `<div class="poetry">…</div>` and set `poetry_mode = true`. Whitespace, indents, and soft returns are preserved.
- Scene break: `<hr/>` or `<div class="scene-break"/>` renders a centered `❦`.
- Block quote: standard `<blockquote>` is auto-styled.

Body content is stored as HTML for now. If the CMS needs structured JSON later (e.g., for image alt-text or interactive elements), we can swap `body` to `jsonb` in the schema and render via TipTap's HTML serializer.

---

## 8. Studio auth + CMS architecture

### 8.1 — Auth model

Single tenant. No Supabase auth, no magic link, no user table. The studio has exactly one valid identity, defined entirely in env vars:

```
STUDIO_USERNAME=jasthtcs
STUDIO_PASSWORD=chanjae13
STUDIO_SESSION_SECRET=<32-byte hex>
```

Local + production use **different** `STUDIO_SESSION_SECRET` values so compromise of one doesn't carry to the other. Rotating the secret invalidates all active sessions immediately.

### 8.2 — Session cookie

After a successful sign-in (`signIn` in `src/app/studio/actions.ts`):

- Both username and password are compared against env via `crypto.timingSafeEqual` (length-checked first; otherwise the function throws on length mismatch).
- On match, the server sets a cookie `studio_session` with value `<username>.<hex_hmac>` where `hex_hmac = HMAC-SHA256(username, STUDIO_SESSION_SECRET)`.
- Cookie attributes: `HttpOnly`, `SameSite=Lax`, `Secure` in production, `Path=/`, `Max-Age=30 days`.
- Sign-out (`signOut`) deletes the cookie.

Verification (`verifySessionCookie` in `src/lib/studio-session.ts`):

- Splits at the first `.`, recomputes the HMAC, compares with `timingSafeEqual` on equal-length buffers.
- Any mismatch returns `null`. No DB read, no network call.

`src/lib/studio-session.ts` is intentionally separate from `src/app/studio/actions.ts` because Next.js requires `"use server"` files to export only async functions. The HMAC helpers are sync, so they live outside the action file.

### 8.3 — Route guards

1. **Layout guard** (`src/app/studio/(protected)/layout.tsx`) — calls `getStudioSession()`. If null → redirect `/studio/login`. If `isOwner` is false → redirect `/`. With env-backed auth, `isOwner === true` whenever the cookie verifies; the field stays for future expansion.
2. **Login page** (`src/app/studio/login/page.tsx`) — sits *outside* the `(protected)` route group so the layout guard does not apply. If you arrive already authenticated, it redirects to `/studio`.

`middleware.ts` at the repo root still refreshes a Supabase auth cookie. This is **dead code** under the new auth model — nothing reads it. Remove or no-op when convenient; see `TODO.md` Phase 0.

### 8.4 — Server-action writes

All studio write actions live under `src/app/studio/(protected)/_actions/`. Each one:

1. Re-checks `getStudioSession().isOwner` (defense in depth — never trust the layout alone).
2. Uses `getAdminSupabase()` (the secret-key client) so writes work regardless of RLS.
3. Returns typed `{ status, message }` results consumable by `useActionState`.

---

## 9. Folder conventions

```
src/
  app/
    <route>/page.tsx       Server component by default
    <route>/<child>.tsx    Co-located client components for that route
    studio/_components/    Shared studio UI (underscore = non-routing)
    studio/actions.ts      Sign-in / sign-out server actions (auth only)
    studio/(protected)/_actions/  Domain write actions (works, chapters, …)
  components/              Reused across routes
  lib/                     Pure logic (no JSX)
    studio-session.ts      HMAC sign + verify helpers (server-only, sync)
    supabase/              All Supabase clients + read helpers + types
  types/                   Domain types
  assets/fonts/            Local font files (Highcrest.ttf today)
public/                    Static, served as-is (favicon.svg)
supabase/migrations/       SQL migrations
middleware.ts              Legacy Supabase cookie refresh — slated for removal
```

**Server vs client rules of thumb:**

- Pages stay server components unless they need state. If a page needs a small client island, extract it to a `*-client.tsx` or co-located component with `"use client"`.
- Lib files that import `next/headers`, `next/cookies`, or call `cookies()` must use `import "server-only"`.
- Files with `"use server"` may export *only* async functions. Sync helpers (HMAC sign / verify) live in plain server-only modules and are imported by both actions and the layout-side session lookup.
- Framer Motion components require `"use client"` somewhere up the tree. Wrap once in a primitive (`FadeUp`, `Stagger`) rather than scattering directives.

---

## 10. What's still mock

- `src/lib/mock-content.ts` is the source of truth today. Until Phase 2, every public page reads from it.
- All cover images point at `picsum.photos/seed/...` — deterministic but generic. Swap to Supabase Storage URLs (or real Unsplash links you've curated) when you have artwork.
- Author portrait is a Picsum placeholder. Replace `AUTHOR.portraitUrl` with a real photo (Supabase Storage URL or `/public/portrait.jpg`).

---

## 11. Decisions worth remembering

- **Auth is intentionally not Supabase.** Single-tenant + no email flow = no need for an OAuth/OTP provider. Env-backed credentials with an HMAC cookie are simpler, have no inbox dependency, and cannot be impersonated without leaking the password *and* the session secret. Trade-off: no password reset flow (rotate env vars instead) and no built-in rate-limiting (see Phase 4 TODO if you ever expose the URL publicly).
- **Two different `STUDIO_SESSION_SECRET` values** — local vs production. Compromising one doesn't compromise the other. Both are 32 random bytes (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
- **Single migration so far.** Don't edit `0001_init.sql` after it's been applied to a real DB; add `0002_*.sql` for any future change.
- **Body stored as HTML.** Simpler than ProseMirror JSON. TipTap can emit and consume HTML natively.
- **No user accounts.** The site is single-author. Auth is for the Studio only. Public readers have zero account flow.
- **No comments / reactions yet.** Reader-first means quiet. Add only if explicitly requested.
- **No analytics in the bundle.** When you want stats, prefer Vercel Analytics or Plausible — they don't add tracking pixels.
- **Highcrest is "personal use."** Audit if the site is ever monetized.
- **Vercel deploy = push to `main`.** The CLI deploy (`vercel --prod`) is a manual override; the default loop is `git push`. Env vars are *not* committed — they live only in `.env.local` (gitignored) and Vercel project settings.

---

See `TODO.md` for the actionable checklist organized by phase.
