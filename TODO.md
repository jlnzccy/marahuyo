# Marahuyo — TODO

Organized so you can pick up any phase in a fresh session and know exactly what to do. Items are checkboxes — tick as you finish. Each phase is independent enough to ship on its own.

Last updated: 2026-05-28. Phase 0 complete. Phase 1 complete: editor + Poetry node (round-trip verified) + bubble menu + auto-save + works CRUD + cover uploads + series CMS (list/new/editor/sortable chapters) + chapter editor + drafts inbox + confirm modal + settings table & page. Phase 2 complete. Phase 3 mostly landed: sitemap, robots, RSS, OG images, Instagram embed extension, studio 404, extended work_kind enum, Highcrest 'm' favicon, gradient SVG fallbacks for mock covers. Remaining Phase 3: real cover/portrait photos (manual upload via Studio). Phase 1.7 complete: universal embed picker (YouTube/Instagram/Vimeo/Spotify/TikTok), inline dialogs (PromptDialog + AlertDialog replacing all window.prompt/alert), studio overview refresh (live stats + recent activity). Favicon SVG MIME type fixed. Phase 3.6 complete: bubble menu z-30, in-editor image upload (Supabase storage via `editor/<id>` prefix), footer tagline removed, themed DatePicker, localStorage LikeButton on reader pages, homepage epigraph links to source work. Phase 4 frontend trio done: localStorage bookmarks + continue-reading rail, Web-Share button with clipboard fallback, print stylesheet. Phase 5 🔴 critical complete: metadataBase env-aware, HTML sanitization (isomorphic-dompurify), mobile hamburger nav, login rate limiting (5/15min), README rewrite, settings RLS restricted via `settings_public` view (migration 0008). Phase 5 🟠 important complete: homepage Promise.all + React `cache()` reads, reduced-motion + `whileInView` scroll anims, three error boundaries, Zod-validated server actions (incl. reorderChapters sibling check), 7-day studio session, generated-types script + `WorkKind` single source, iframe `sandbox` enforced both at insert and at sanitize-time, storage prefix sweep on delete, sitemap static-route freshness, lean `getChapterByPath`. Phase 5 🟡 QoL pass: skip-link + `id="main-content"` everywhere, AA-contrast whisper tokens, alt-text + `aria-hidden="true"` sweep, theme-switcher radiogroup + arrow keys + focus return + reader font-size selector (sm/md/lg), CSS-only heart burst, lock-width share button, locale-aware dates via shared `lib/format.ts`, scroll threshold 240, `(site)` route group dedup, `useUploader` hook, mock-content + cover_color column dropped, picsum removed from next.config, series_status enum + studio surface (migration 0010), soft delete on works + chapters + `/studio/trash` view (migration 0011).

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
- [x] Add a floating bubble menu for inline formatting (bold / italic / link). `editor-bubble-menu.tsx`.

### 1.2 — Poetry node ✅ DONE

- [x] Custom Node at `src/app/studio/(protected)/_components/extensions/poetry-node.ts`.
- [x] Renders to `<div class="poetry">…</div>` with `data-node-type="poetry"`.
- [x] `code: true`, `content: 'text*'` — preserves whitespace + soft returns.
- [x] Toolbar feather icon toggles into / out of poetry mode.
- [x] Enter and Shift-Enter inside poetry insert literal `\n` rather than splitting the block.
- [x] Round-trip test: pasted verse with 3-space indents + soft returns + blank lines into `/studio/works/new` poetry block, published, `/read/test` renders byte-identical whitespace via `white-space: pre-wrap` on `.poetry`. (DevTools text preview collapses `\n` cosmetically — actual textContent preserves them.)

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
- [x] `updateChapter` / `publishChapter` / `unpublishChapter` / `deleteChapter` — added in `_actions/works.ts`.

### 1.5 — Studio UI

- [x] `/studio/works` — newest-first list of poems, essays, one-shots. Drafts visually distinguished.
- [x] `/studio/works/new` — kind picker + title input → creates a draft → redirects to `/studio/works/[id]`.
- [x] `/studio/works/[id]` — full editor: title, subtitle, body (TipTap), excerpt, tags, cover image URL, poetry-mode flag, publish/unpublish, delete, "view live" link, live word + reading-time stats.
- [x] `/studio/series` — list of series (drafts + published) with a "New series" CTA.
- [x] `/studio/series/new` — new-series form.
- [x] `/studio/series/[id]` — series settings + dnd-kit sortable chapter table.
- [x] `/studio/series/[id]/chapters/[chapterId]` — chapter editor.
- [x] `/studio/drafts` — unified inbox.
- [x] `/studio/settings` — settings singleton row + form. **User must run** `supabase/migrations/0003_settings.sql` before this page loads.
- [x] Replaced `window.confirm` with `ConfirmDialog` (native `<dialog>` + portal) on work + series + chapter editors.

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

## Phase 1.7 — Studio quality-of-life (follow-ups from first real use)

Things noticed once the CMS was actually used in production.

- [x] **Universal embed picker.** Replaced `InstagramNode` with a generic `EmbedNode` supporting YouTube, Instagram, Vimeo, Spotify, and TikTok. Single "Embed media" toolbar button opens an inline popover (`embed-picker.tsx`) with provider pills + URL input + auto-detect. Per-provider URL → embed-src adapters in `embed-node.ts`. Legacy `div.instagram-embed` still parsed for backward compat. Bandcamp and Twitter/X skipped for now.
- [x] **Inline prompts everywhere.** Created `PromptDialog` (text input) and `AlertDialog` (message + OK) as siblings to `ConfirmDialog`. Replaced all 4× `window.prompt` and 1× `window.alert` in `editor-toolbar.tsx` and `editor-bubble-menu.tsx`. Zero browser-native modals reach the user inside `/studio`.
- [x] **Refresh `/studio` overview.** Replaced the stale "CMS is sketched" card with live data: stats bar (drafts / published / words written) + recent activity feed (last 5 edited works with kind badge, status pill, relative timestamp). Server-side data via `studio-stats.ts` using admin client.
- [x] **Home button in the public nav.** Added `Home` entry to `src/components/site-header.tsx` `NAV` array, sits before Works / About / Contact.

---

## Phase 3 — Polish, growth-ish features (~half session)

Quiet additions that make the site feel finished.

- [x] `app/sitemap.ts` — DB-driven sitemap (works + series + chapters + static routes).
- [x] `app/robots.ts` — allows everything except `/studio/*`.
- [x] `app/feed.xml/route.ts` — RSS for recent standalone dispatches (1h cache).
- [x] `opengraph-image.tsx` — root + `/read/[slug]` + `/series/[slug]` + `/series/[slug]/[chapter]` via `next/og`.
- [~] Real cover images — `mock-content.ts` picsum URLs replaced with gradient SVG data URIs via `gradientCover(from, to, deg)` helper so the local fallback isn't random stock. Real photos still need uploading via `/studio/works/[id]` → `CoverUploader` (manual asset work).
- [x] **Editable about + portrait upload.** Migration `0005_settings_about.sql` adds `author_name`, `author_handle`, `author_tagline`, `author_short_bio`, `author_bio`, `author_bio_long`, `author_location` to `settings`. `/studio/settings` gained an "About the author" section with drag-drop portrait upload (`ImageUploader` writes to `covers/portrait/`). `/about` and `/` now read from `getSiteSettings()` with the static `AUTHOR` constant as fallback. **User must run** the migration before edits stick.
- [x] Instagram embed — TipTap `InstagramNode` (`/p`, `/reel`, `/tv`) + toolbar button. Renders `<div class="instagram-embed"><iframe src=".../embed"/></div>` so no companion JS needed.
- [x] Favicon: `public/favicon.svg` now renders the Highcrest "m" as inline `<path>` (glyph extracted from `src/assets/fonts/Highcrest.ttf` via fontTools `SVGPathPen`, flipped onto SVG y-axis with `scale(0.03 -0.03)`).
- [x] Studio 404 — `/studio/(protected)/not-found.tsx` keeps the chrome.
- [x] **More flexible "kind of work" picker.** Took the **light** path: `0004_extend_work_kind.sql` adds `article`, `story`, `note`; picker now shows six cards (poem / essay / one-shot / article / story / note); `KindChip` labels updated. **User must run** the migration before the new picker entries will save. Series stays separate (created from `/studio/series/new`).

---

## Phase 3.5 — User Requested Improvements (Current Session)

- [x] **Typography adjustments.** Removed `font-italic` (Instrument Serif) from `.reader-prose em, i, blockquote` — they now render Libre Baskerville's native italic. UI/decorative elements (`font-italic italic` classes elsewhere) keep Instrument Serif.
- [x] **Browser tab title.** Removed ` — to be enchanted` from default site metadata title in `src/app/layout.tsx`.
- [x] **Dynamic homepage closing quote.** Added `getRandomEpigraph()` in `src/lib/works.ts` — fetches published standalones with non-null subtitle, picks one at random. Section hidden if no epigraphs exist in DB.
- [x] **Rename subtitle to epigraph.** Studio placeholders updated to "epigraph" in work and chapter editors. Epigraph styled in reader-shell as a small italic serif block with left border (classic epigraph look, not a subtitle line).
- [x] **Manual publication date.** Date input added to work/chapter editor sidebars. Cannot be future (validated client-side, max=today). Auto-saves via debounce. `publishWork`/`publishChapter` preserve existing `published_at` rather than overwriting it; fall back to `now()` only if null.
- [x] **Settings blank default overrides.** All author text fields in `getSiteSettings()` now use `??` (null-coalescing) instead of `||` — empty/null DB values return `""`, never fall back to mock content. `portraitUrl` keeps the gradient fallback to avoid broken `<Image>`. Conditional rendering added on home + about pages for subtitle/bio fields.
- [x] **Editable "About this place" section.** Migration `0006_about_place_settings.sql` adds `about_place_title`, `about_place_body`, `about_place_quote` to `settings`. Wired through types → `getSiteSettings()` → settings action → settings form (new section) → `/about` rendering. Section hidden entirely if all three fields are empty.

---

## Phase 3.6 — Bugs & Follow-ups

- [x] **Bubble menu z-index.** Added `z-30` to the floating menu className so it sits above the sticky toolbar (`z-20`).
- [x] **In-editor image upload.** Toolbar `Image` button now opens an `ImageUploadDialog` (drag-drop + file picker, "or paste URL" fallback) that uploads via the existing `uploadStudioImage` action under `covers/editor/<workId-or-chapterId>/`. Both editors pass `uploadPrefix={\`editor/\${initial.id}\`}` to `<Editor>`.
- [x] **Remove footer tagline.** Stripped "— all stories belong to their author" from `src/components/site-footer.tsx`.
- [x] **Custom date picker.** New `DatePicker` component (calendar popover, month nav, today + clear, future-dates disabled via `max`). Wired into work + chapter editor sidebars in place of native `<input type="date">`. Other native pickers (`<select>` for kind etc.) already replaced earlier — no other `type="date"` left.
- [x] **Like button on reader.** Chose **anonymous, localStorage-only** path. New `LikeButton` reads/writes `marahuyo:like:<keyId>`, renders between body + reader-foot. Keys: `read/<slug>` for standalones, `series/<slug>/<chapter>` for chapters.
- [x] **Homepage epigraph link.** `getRandomEpigraph()` now returns `slug` too; the homepage closing quote wraps the title in `<Link href={\`/read/\${slug}\`}>`.

---

## Phase 4 — Future ideas (capture, don't commit)

Things worth thinking about but **not** before Phase 1 / 2 are done.

- [x] Reader bookmarks — `localStorage` keyed by slug; "Continue reading" rail on homepage. `src/lib/bookmarks.ts` storage helper, `BookmarkTracker` mounts on reader pages and records visits, `ContinueReading` client component on `/` renders the rail (hidden when empty, dismiss button per card).
- [x] Web-Share API on reader pages — `ShareButton` next to LikeButton in the new `.reader-actions` row; tries `navigator.share` then falls back to clipboard with a transient "copied" pill.
- [x] Print stylesheet — `@media print` block in `globals.css`. Forces black-on-white regardless of theme, hides `header`/`footer`/`.no-print`/`.reader-actions`/chapter nav, appends URLs after links, caps cover image height, page-break hygiene on headings + paragraphs + poetry, stubs out iframe embeds.
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

---

## Phase 5 — Review punchlist (2026-05-28)

Consolidated from a full codebase review (internal audit + external review). Items already done elsewhere have been pruned. Severity: 🔴 Critical · 🟠 Important · 🟡 Quality-of-life · 🔵 Feature ideas.

### 🔴 Critical (security · correctness · SEO)

- [x] **Fix `metadataBase`.** `src/app/layout.tsx:7` uses `https://marahuyo.local` — breaks OG/canonical URLs in production. Replace with `new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://marahuyoph.vercel.app")`.
- [x] **Sanitize reader HTML.** `src/components/reader-shell.tsx:136`, `src/app/about/page.tsx:56`, `src/app/about/page.tsx:71` all render DB content via `dangerouslySetInnerHTML` with no sanitization. Install `isomorphic-dompurify` or `sanitize-html`; sanitize on save (server action) or on render. Whitelist tags TipTap produces.
- [x] **Mobile navigation.** `src/components/site-header.tsx:23` — nav is `hidden sm:flex`; no fallback on small screens. Add a hamburger button (`sm:hidden`) opening a Framer Motion slide-out or full-screen drawer. Escape closes, focus traps inside, scroll locked while open.
- [x] **Login rate limiting.** `src/app/studio/actions.ts` `signIn` has zero brute-force protection. In-memory `Map<ip, { count, resetAt }>` with 5/15min lockout for v1; Vercel KV or Upstash for production resilience.
- [x] **Update README.** Stack table still says "Supabase magic-link", references dead `middleware.ts`, calls CMS "scaffolded". Rewrite for current state (env-HMAC auth, completed CMS, real data wiring).
- [x] **Restrict `settings` public-read RLS.** `supabase/migrations/0003_settings.sql:35-38` exposes `contact_email` and all rows to anon. Split sensitive columns into a private table, or change policy to expose only safe columns via a view.

### 🟠 Important (perf · a11y · type-safety · data integrity) ✅ DONE

- [x] **Parallelize homepage queries.** Four awaits in `src/app/page.tsx` wrapped in `Promise.all`.
- [x] **Wrap read APIs in `cache()`.** `src/lib/works.ts` + `src/lib/settings.ts` — `getStandaloneBySlug`, `getSeriesBySlug`, `getChapter`, `getFeaturedWork`, `getRecentDispatches`, `getRandomEpigraph`, `getAllPublishedWorks`, `getSiteSettings` all wrapped in React `cache()`.
- [x] **`prefers-reduced-motion` support.** `src/components/motion.tsx` uses Framer's `useReducedMotion()` and returns a plain `<div>` when true. `globals.css` adds a `@media (prefers-reduced-motion: reduce)` block that flattens animation/transition durations and the heart-burst keyframes.
- [x] **`whileInView` for scroll animations.** `FadeUp` / `FadeIn` / `Stagger` now use `whileInView` with `viewport={{ once: true, margin: "-10%" }}`.
- [x] **Error boundaries.** Added `src/app/error.tsx` (catch-all themed error), `src/app/read/error.tsx`, and `src/app/series/error.tsx`. Each surfaces `error.digest`, a "Try again" button, and a return-home link.
- [x] **Zod-validate server actions.** `src/app/studio/(protected)/_actions/works.ts` defines `updateWorkSchema`, `updateChapterSchema`, `reorderChaptersSchema`; `_actions/settings.ts` defines `updateSettingsSchema`. `reorderChapters` now (a) rejects duplicate ids via Zod `refine` and (b) re-queries the DB to confirm every id belongs to the given `series_id` before reordering.
- [x] **Shorten studio session.** `STUDIO_COOKIE_MAX_AGE` 30 days → 7 days.
- [x] **Generated Supabase types.** Added `npm run gen-types` (`supabase gen types typescript ... > src/lib/supabase/generated.ts`). `WorkKind` now re-exported from the single source `@/types/content`. `id` removed from `WorkUpdate` and `ChapterUpdate` (it's only the WHERE clause, never the patch).
- [x] **Sync `SiteSettings` type.** Extracted `SiteSettingsAuthor` + `SiteSettingsAboutPlace` subtypes. Added a compile-time exhaustiveness guard (`_AssertAllMapped`) that fails type-check if a future `SettingsRow` column isn't mapped through `getSiteSettings()`.
- [x] **Iframe sandbox.** `embed-node.ts` rendered `<iframe>` adds `sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"`. `src/lib/sanitize.ts` registers a DOMPurify `afterSanitizeAttributes` hook that forces the same sandbox + `loading=lazy` + `referrerpolicy` onto every iframe in published HTML (covers legacy embeds saved before this fix).
- [x] **Storage cleanup on delete.** `_actions/works.ts` adds `removeCoversPrefix` + `removeWorkStorage`. `deleteWork` sweeps `covers/<id>/` and `covers/editor/<id>/`; for series, also sweeps each chapter's storage. `deleteChapter` does the same for the chapter.
- [x] **Sitemap freshness.** `lastModified` dropped from static-route entries in `src/app/sitemap.ts` — only DB-backed entries get a timestamp.
- [x] **Chapter N+1.** Added `getChapterByPath(seriesSlug, chapterSlug)` to `src/lib/works.ts` — single query with two joins (chapter row + sibling slugs/numbers only, no sibling bodies). `src/app/series/[slug]/[chapter]/page.tsx` switched to it for prev/next nav.

### 🟡 Quality-of-life

- [x] **Skip-to-content link.** `src/app/layout.tsx` body now leads with `sr-only focus:not-sr-only` anchor → `#main-content`. Every `<main>` in the public app (home, works, about, contact, series index, reader-shell, studio chrome, error/not-found) carries the id.
- [x] **WCAG contrast.** `--whisper` lifted on all three themes to clear AA (light 108/108/116, cream 114/108/98, midnight 156/152/144). Theme-switcher focus rings now use solid `accent` instead of `accent/60` so they stay visible.
- [x] **Featured-card a11y.** `src/components/featured-card.tsx` image is now a plain `<div>` (no extra Link / `tabIndex={-1}`). The text-side CTA is the single tab stop; alt text describes the cover.
- [x] **Alt text.** `reader-shell.tsx`, `work-row.tsx`, `featured-card.tsx` now render `alt={\`Cover for ${title}\`}`. Author portrait alts already read from settings.
- [x] **`aria-hidden` boolean.** Every JSX `aria-hidden` shorthand swapped to `aria-hidden="true"` (kind-chip, featured-card, like-button, theme-switcher, nav-link, reading-progress, reader-shell, save-indicator, hairlines on /works, /about, /contact, /series, work + chapter editors, series editor, editor toolbar divider).
- [x] **Theme switcher semantics.** Listbox → `radiogroup`/`radio` with roving focus (ArrowUp/Down/Left/Right + Home/End), focus returns to trigger on close, and a parallel reading-size `radiogroup`.
- [x] **Orphaned "Type" section.** Wired to a real reader-size selector — sm (17px) / md (19px, default) / lg (21px). Persists in `marahuyo:reader-size`, hydrated by the same `themeInitScript` to avoid flash. CSS lives in `globals.css` keyed off `html[data-reading-size]`.
- [ ] **Skeleton/blur for images.** `src/components/work-row.tsx:31-38` no `placeholder="blur"`. Generate blurhash on upload or use static `bg-surface` fallback.
- [x] **Locale-aware dates.** New `src/lib/format.ts` exposes `formatDate` (no hard-coded `en-US`) and `relativeTime` (`Intl.RelativeTimeFormat`, handles "just now" natively). `work-row`, `continue-reading`, studio overview + /studio/works + /studio/series + /studio/drafts + /studio/trash all use it.
- [x] **Like-burst CSS-only.** `like-button.tsx` no longer mounts 10 particle spans per click — it toggles `data-burst="true"` and `globals.css` paints the 10-dot ring via a single `::before` with a multi-stop `box-shadow` and one `heart-particle-ring` keyframe.
- [x] **Share-button width lock.** Trigger is now a fixed `h-11 w-11` button; the "copied / shared" pill is an absolutely-positioned `aria-live` chip below it, so the button never reflows.
- [x] **Continue-reading dismiss visible.** Default opacity bumped 0 → 50 so the X is reachable on touch; still goes 100 on hover/focus.
- [x] **Time-ago: "just now".** Replaced bespoke ladders with `Intl.RelativeTimeFormat` via `relativeTime()`.
- [x] **Series status column.** Migration `0010_series_status.sql` adds `series_status enum('ongoing','completed','hiatus') not null default 'ongoing'`. Wired through types → `Series.seriesStatus` → `getSeriesBySlug` → `/series/[slug]` (replaces the hard-coded "ongoing") → SeriesEditor sidebar radiogroup (auto-saves).
- [x] **Page layout dedup.** Public chrome moved into `src/app/(site)/layout.tsx`. `/works`, `/about`, `/contact` now live under the group and render only their `<main>` — SiteHeader, SiteFooter, ThemeSwitcher come from the shared layout.
- [ ] **Slug i18n.** `src/lib/slug.ts` strips CJK/emoji. Acceptable but worth a comment so it isn't surprising. Optional: keep CJK via `\p{Letter}` Unicode property.
- [x] **Soft delete.** Migration `0011_soft_delete.sql` adds `deleted_at` to `works` + `chapters` with matching indexes. Every public read in `src/lib/works.ts` filters `deleted_at is null`; the studio Works / Series / Drafts / overview-stats queries do the same. `deleteWork` / `deleteChapter` now soft-delete; `restoreWork` / `restoreChapter` / `purgeWork` / `purgeChapter` added. New `/studio/trash` route with restore + permanent-remove (sweeps storage). No auto-purge cron — manual only.
- [ ] **Poetry-block keyboard exit.** `src/app/studio/(protected)/_components/extensions/poetry-node.ts` — Enter on empty trailing line exits to a new paragraph. Or bind `Mod-Enter` to exit.
- [x] **Duplicate uploaders.** Shared `useUploader({ upload, formFields, onChange })` hook in `_components/use-uploader.ts`; `cover-uploader.tsx` + `image-uploader.tsx` both use it. `relativeTime` moved to `lib/format.ts` (3 in-place duplicates removed).
- [x] **Dead `mock-content.ts` exports.** File deleted. `AUTHOR.portraitUrl` gradient fallback inlined as `FALLBACK_PORTRAIT` in `lib/settings.ts`.
- [x] **`cover_color` column.** Migration `0009_drop_cover_color.sql` drops the column. References pruned from `WorkRow` / `WorkInsert` / `WorkUpdate`, `Series` type, `mapSeries`, `updateWorkSchema`, the studio series query, and `mock-content.ts`.
- [x] **`picsum.photos` in `next.config`.** Removed `picsum.photos` and `fastly.picsum.photos` from `next.config.mjs` `remotePatterns`. Only Supabase + Unsplash remain.
- [ ] **`tsconfig.skipLibCheck`.** Hides Supabase type errors. Try removing; fix anything that surfaces.
- [x] **Aggressive scroll-aware header.** `src/components/site-header.tsx` threshold bumped 120 → 240 so the header sticks around longer on shallow scrolls.
- [x] **WorkKind enum comment.** `0004_extend_work_kind.sql` comment rewritten to list the full final enum (poem/essay/oneshot/series/article/story/note) and the picker offerings.
- [ ] **Reader-actions placement.** `like-button` + `share-button` cramped under prose. Consider floating side-rail on desktop, sticky bar on mobile.

### 🔵 Feature ideas (defer, scope per session)

- [ ] **Full-text search.** `tsvector` column on `works.title || excerpt || body`, GIN index, `/search` route with debounced input + result snippets.
- [ ] **Table of contents.** Server-parse `<h2>`/`<h3>` from body; render sticky sidebar (desktop) + collapsible top section (mobile). Auto-scroll-spy.
- [ ] **Reading position resume.** Extend `bookmarks.ts` with `scrollPercent`; offer "Continue from 47%" on rail click.
- [ ] **Version history.** `work_versions(work_id, body, saved_at)`; capture on each publish; restore button in studio.
- [ ] **Tag filters.** Tags currently decorative. Make clickable → `/works?tag=...`; archive filter chips.
- [ ] **Auto theme.** Add "Auto" option following `prefers-color-scheme`. Default for first-time visitors.
- [ ] **Explicit `featured` flag.** Boolean on `works`; `getFeaturedWork()` picks `featured=true` first, falls back to most recent. Toggle in studio.
- [ ] **Scheduled publishing.** `scheduled_at` column + Vercel cron / edge function to flip draft → published.
- [ ] **Bookmarks/likes sync.** Currently localStorage-only. Anonymous device-id + Supabase table; survives cache clear. Path forward if real accounts ever added.
- [ ] **Bulk actions in studio.** Multi-select rows for publish/unpublish/delete/tag in `/studio/works` and `/studio/drafts`.
- [ ] **Tag autocomplete.** Suggest existing tags as user types in editor sidebar.
- [ ] **Inline draft→publish toggles.** `/studio/drafts` row-level publish without drilling in.
- [ ] **Chapter excerpt + subtitle parity.** Chapter editor missing fields works have. Migration + form.
- [ ] **RSS link in footer.** `/feed.xml` exists, nothing surfaces it in UI.
- [ ] **Image dedup.** Hash uploads, reuse existing path if hash matches.
- [ ] **Save-success toast + last-saved tooltip.** Make SaveIndicator more legible.
- [ ] **Reader font-size control.** Wire the orphaned "Type" section in theme switcher.

---

### Top 5 to do first (recommended order)

1. `metadataBase` fix — one-line change, unblocks correct OG/canonical immediately.
2. Sanitize reader HTML — security; do before next public link share.
3. Mobile nav — basic usability; current site is half-broken on phone.
4. Parallelize homepage queries + wrap reads in `cache()` — perf, two small PRs.
5. Add `error.tsx` + `prefers-reduced-motion` — a11y baseline.
