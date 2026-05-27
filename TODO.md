# Marahuyo — TODO

Organized so you can pick up any phase in a fresh session and know exactly what to do. Items are checkboxes — tick as you finish. Each phase is independent enough to ship on its own.

Last updated: 2026-05-27. Phase 0 complete: studio auth swapped from Supabase magic-link to env-backed username + password with an HMAC-signed cookie. GitHub repo live at `jlnzccy/marahuyo`; Vercel project linked + production env vars set + deployed. Phase 1 partially landed: editor, Poetry node, auto-save, works CRUD are live. Series CMS + image uploads still open.

---

## Phase 0 — Make the local app real (mostly done)

- [x] `.env.local` filled (URL, publishable, secret).
- [x] **Auth replaced.** `STUDIO_OWNER_EMAIL` + magic-link removed. New env vars: `STUDIO_USERNAME=jasthtcs`, `STUDIO_PASSWORD=chanjae13`, `STUDIO_SESSION_SECRET=<32-byte hex>`.
- [x] **GitHub.** Repo: https://github.com/jlnzccy/marahuyo. SSH key `~/.ssh/id_ed25519_jlnzccy` bound via `~/.ssh/config`. Git identity = `jlnzccy` / `j.lnzccy@gmail.com`.
- [x] **Vercel.** Project `marahuyo` (org `jae-s-projects`) linked to repo. Production env vars set (`STUDIO_USERNAME`, `STUDIO_PASSWORD`, `STUDIO_SESSION_SECRET` — production secret is *different* from local). Aliased to `marahuyoph.vercel.app`. Auto-deploys on push to `main`.
- [x] **Apply the schema to your Supabase project.** Ran `supabase/migrations/0001_init.sql` via SQL Editor.
- [x] **Smoke-test login.** Confirmed `/studio` loads, can create works.
- [ ] **Delete the legacy Supabase auth user.** Dashboard → Authentication → Users → remove any existing entry (or leave — it's harmless, the app no longer queries `auth.users`).
- [x] **Clean up dead middleware.** Deleted `middleware.ts` — was refreshing a Supabase auth cookie nothing reads. `/studio/*` guarded by `(protected)/layout.tsx`.
- [x] **Add Vercel env vars to Preview + Development.** Done via `vercel env add ... preview/development`. Note: `STUDIO_USERNAME` Preview is currently scoped to branch `dev-marahuyo` only — re-add unscoped if previews ever run from other branches. Supabase keys (URL/ANON/SERVICE_ROLE) still Production-only — add to Preview/Dev when previews need DB.
- [ ] **Rotate any keys ever pasted in chat.** Supabase Dashboard → Settings → API → Reset publishable + secret. Update `.env.local` and the matching Vercel env vars.

---

## Phase 1 — Build the Studio CMS (biggest piece, ~1 session)

Make the writing room usable.

### 1.1 — Editor ✅ DONE

- [x] `npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-link @tiptap/extension-image @tiptap/extension-character-count @dnd-kit/core @dnd-kit/sortable`
- [x] Create `src/app/studio/(protected)/_components/editor.tsx` — TipTap React editor, `immediatelyRender: false` for Next 15 SSR safety.
- [x] Wire StarterKit extensions (h2/h3, lists, blockquote, hr) + Placeholder + Link + Image + CharacterCount.
- [x] Toolbar with block-level + inline buttons. (No floating bubble menu yet — Phase 1 follow-up.)
- [x] Style ProseMirror content area to match `.reader-prose` (set as the `attributes.class`).
- [ ] Add a floating bubble menu for inline formatting (bold / italic / link) — quality-of-life follow-up.

### 1.2 — Poetry node ✅ DONE

- [x] Custom Node at `src/app/studio/(protected)/_components/extensions/poetry-node.ts`.
- [x] Renders to `<div class="poetry">…</div>` with `data-node-type="poetry"`.
- [x] `code: true`, `content: 'text*'` — preserves whitespace + soft returns.
- [x] Toolbar feather icon toggles into / out of poetry mode.
- [x] Enter and Shift-Enter inside poetry insert literal `\n` rather than splitting the block.
- [ ] Round-trip test: open `/studio/works/new` after applying the migration, paste a verse with 3-space indents and soft returns, publish, and confirm `/read/<slug>` renders byte-identical whitespace.

### 1.3 — Auto-save ✅ DONE

- [x] `SaveIndicator` component with dot colors (idle / saving / saved / error) and last-saved timestamp.
- [x] 1200 ms debounce; flushes on unmount; reschedules on every form field change.
- [x] `word_count` computed via TipTap CharacterCount storage; `reading_minutes` = `max(1, round(words / 200))`.
- [x] Surfaces the supabase error message inline when a save fails.

### 1.4 — Server actions (writes) ✅ MOSTLY DONE

All actions are in `src/app/studio/(protected)/_actions/works.ts`. Each re-checks `getStudioSession().isOwner` before touching the admin client, then `revalidatePath`s the affected public surfaces.

- [x] `createWork({ kind, title })` → drafts a row with a unique slug, redirects to the editor.
- [x] `updateWork(input)` → general patch; refreshes reader pages only when status is `published`.
- [x] `publishWork(id)` → sets `status='published'` + `published_at`.
- [x] `unpublishWork(id)` → reverts to draft, keeps the row.
- [x] `deleteWork(id)` → hard delete (confirmation UI is browser `confirm()` — replace with a nicer modal later).
- [x] `createChapter(seriesId, title)` → auto-numbers, redirects to the chapter editor.
- [x] `reorderChapters(seriesId, orderedIds[])` → one UPDATE per row; switch to RPC if chapter counts ever balloon.
- [ ] `updateChapter` / `publishChapter` / `unpublishChapter` / `deleteChapter` — same shape as `*Work`, blocked on the Series UI below.

### 1.5 — Studio UI

- [x] `/studio/works` — newest-first list of poems, essays, one-shots. Drafts visually distinguished.
- [x] `/studio/works/new` — kind picker + title input → creates a draft → redirects to `/studio/works/[id]`.
- [x] `/studio/works/[id]` — full editor: title, subtitle, body (TipTap), excerpt, tags, cover image URL, poetry-mode flag, publish/unpublish, delete, "view live" link, live word + reading-time stats.
- [ ] `/studio/series` — list of series (drafts + published) with a "New series" CTA.
- [ ] `/studio/series/[id]` — series settings + chapter table with the dnd-kit sortable list.
- [ ] `/studio/series/[id]/chapters/[chapterId]` — chapter editor (reuse the work-editor-form shape).
- [ ] `/studio/drafts` — single inbox of every `status='draft'` row across works + chapters.
- [ ] `/studio/settings` — default theme, social links. Probably needs a new `settings` row in Supabase. (No more "owner email" — auth is env-backed.)
- [ ] Replace the native `window.confirm` delete-flow with an inline modal (`<dialog>` element or a small Framer Motion sheet).

### 1.6 — Image uploads ✅ DONE

- [x] Migration `supabase/migrations/0002_storage_covers.sql` creates the public `covers` bucket + `covers public read` policy on `storage.objects`. **User must run it** in Supabase SQL Editor before uploads work in production.
- [x] Server action `uploadCover(formData)` in `_actions/works.ts`: re-checks owner, validates MIME + 5 MB cap, stores under `covers/<workId>/<ts>-<slug>.<ext>`, writes the public URL to `works.cover_image`, revalidates reading surfaces if published.
- [x] New `CoverUploader` client component (`_components/cover-uploader.tsx`): drag-drop, click-pick, preview, clear, in-progress state, error surface, and a collapsed "paste URL" fallback.
- [x] Wired into `work-editor-form.tsx`, replacing the URL-only input.

---

## Phase 2 — Wire live data into the public site ✅ DONE

- [x] Created `src/lib/works.ts` with read APIs: `getAllPublishedWorks`, `getStandaloneBySlug`, `getSeriesBySlug`, `getChapter`, `getRecentDispatches`, `getFeaturedWork`, plus slug enumerators for `generateStaticParams` (`getPublishedStandaloneSlugs`, `getPublishedSeriesSlugs`, `getPublishedChapterParams`).
- [x] Uses a stateless anon-key client (`createClient` from `@supabase/supabase-js`) — RLS still enforces published-only, but no cookies binding so `generateStaticParams` works at build time. (Initial `getServerSupabase()` wiring failed build with "cookies was called outside a request scope".)
- [x] Swapped mock imports in `src/app/page.tsx`, `/works/page.tsx`, `/read/[slug]/page.tsx`, `/series/[slug]/page.tsx`, `/series/[slug]/[chapter]/page.tsx`. `about/page.tsx` still uses `AUTHOR` from `mock-content.ts` — move to a `settings` row later.
- [x] `generateStaticParams` now fetches slugs from DB; each dynamic route exports `dynamicParams = true` so new published rows resolve without redeploy.
- [x] `revalidatePath('/')` + `revalidatePath('/works')` already in `_actions/works.ts` — no change needed.
- [x] Kept `mock-content.ts` (`AUTHOR` + types) as backup seed.
- [x] Empty-state copy added on `/` (hides featured + recent sections when no data) and `/works` ("the archive is quiet — soon.") + `/series/[slug]` ("no chapters yet").

---

## Phase 3 — Polish, growth-ish features (~half session)

Quiet additions that make the site feel finished.

- [ ] `app/sitemap.ts` — generate sitemap from published slugs.
- [ ] `app/robots.ts` — allow everything except `/studio/*`.
- [ ] `app/feed.xml/route.ts` — RSS for the recent dispatches.
- [ ] `app/opengraph-image.tsx` per route — Next.js OG image generation using the wordmark + work title.
- [ ] Real cover images — replace `picsum.photos` URLs in `mock-content.ts` (or in DB rows) with real photos uploaded to Supabase Storage.
- [ ] Replace `AUTHOR.portraitUrl` with a real photo of yourself.
- [ ] Add an Instagram link parser — embed an Instagram post into prose (`<iframe src="…/embed"/>` block in the editor).
- [ ] Favicon: regenerate `public/favicon.svg` with a Highcrest "m" rendered to inline `<path>` so the favicon matches the wordmark exactly (use the Highcrest font in Figma → export the "m" as SVG path).
- [ ] Add 404 illustrations for `/studio` separately from the public not-found.

---

## Phase 4 — Future ideas (capture, don't commit)

Things worth thinking about but **not** before Phase 1 / 2 are done.

- [ ] Bilingual toggle (English ↔ Tagalog) — each work can have an optional `body_tl` column.
- [ ] Reader bookmarks — `localStorage` keyed by slug; show a "continue reading" rail on Homepage. No server state needed.
- [ ] Audio narration — host MP3s in Supabase Storage; render a `<audio>` player above the prose.
- [ ] Newsletter — Buttondown or Beehiiv. A `subscribe` form at the bottom of `/works`.
- [ ] Web-Share API on every reader page (`navigator.share`) for native mobile share.
- [ ] Print stylesheet — `@media print` block in `globals.css` so essays print as actual essays.
- [ ] Optional later: add Supabase schema sync via GitHub Action (`supabase db push` on main) — free, ~30 min setup. Useful only once schema changes start happening frequently.
- [ ] Optional later: brute-force protection on `/studio/login` — current implementation has no rate limit. Add a simple in-memory or Vercel KV counter if you ever expose this URL publicly.

---

## Things you can do in any session

- Buy a Highcrest commercial license (or replace with a free alternative like *Cormorant Garamond* or *Tenor Sans* if you go commercial).
- Decide what `Marahuyo` becomes on social — Instagram handle, possible Substack mirror, mailing list.
- Take an actual portrait photo with the yellow background, like the Google Sites version. Replace the Picsum placeholder.
- Rotate `STUDIO_SESSION_SECRET` (local + Vercel) anytime you want to invalidate all active studio sessions.

---

## How to start a fresh session

1. Open this repo.
2. Read `PLAN.md` first (architecture), then this file.
3. Pick an unchecked item from the earliest non-empty phase.
4. Stay in scope. When tempted to refactor across phases, write the temptation here as a Phase 4 item and move on.
