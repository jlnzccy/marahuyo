# Marahuyo — TODO

Forward-only. Past phases (0–6) are no longer tracked here — they shipped. See `git log` for history and `PLAN.md` for architecture.

Last reset: 2026-05-29.

---

## Just fixed (2026-05-29)

- [x] `/studio/trash` crashed (500, "Functions cannot be passed directly to Client Components"). Server page passed lucide icon component refs as props to the `"use client"` `TrashRow`. Switched to a string-keyed `TrashIcon` (`"library" | "pen-line" | "file-text"`) resolved inside the client.
- [x] Browser-native X (`::-webkit-search-cancel-button`) on the `/search` input. Hidden via `globals.css` so the input stays clean.
- [x] "Continue reading" rail kept showing bookmarks for trashed / unpublished works. Added `POST /api/bookmarks/validate` and wired `ContinueReading` to prune stale `localStorage` keys on mount.
- [x] `/studio/series` chapter count + `/studio/series/[id]` sortable list included soft-deleted chapters in the embedded join. Added `deleted_at` to the select + filtered client-side.
- [x] `/studio/drafts` listed chapter drafts whose parent series was trashed. Same fix — join `works(title, deleted_at)`, filter out orphans.
- [x] Page title doubled to "Search — marahuyo — marahuyo" because the search page hard-coded the suffix while the root layout already applies the `%s — marahuyo` template. Trimmed to `"Search"`.
- [x] **Studio nav active state + Drafts link.** Extracted `StudioNavLinks` client island using `usePathname()` to highlight the current route. Added Drafts between Series and Trash in the NAV array.
- [x] **Like keys never pruned.** Extended `POST /api/bookmarks/validate` to accept optional `likeKeys[]`. `ReaderStateHydrator` now sweeps stale `marahuyo:like:*` keys once per 24h by piggybacking on the same validate call.
- [x] **Reader-state server rows for trashed works.** `GET /api/reader/state` now validates all returned keys via the shared `validateKeys()` helper, deletes stale rows from DB, and returns only valid entries.
- [x] **Custom clear affordance on `/search`.** Replaced the static form with a `SearchForm` client island that shows an inline `Clear` button whenever the controlled input value is non-empty.
- [x] **Continue Reading grid lopsided with 3 items.** Hidden when `count < 2`; when count is odd, appends a ghost "see all works →" tile to fill the trailing slot.
- [x] **Trash empty-state icon.** Swapped `FileText` → `Trash2`.
- [x] **Studio overview trash count.** `getStudioStats()` now returns `trashCount`. Overview renders a small linked row below the stats bar when `trashCount > 0`.
- [x] **Trash banner on editors.** `/studio/works/[id]` and `/studio/series/[id]/chapters/[chapterId]` both select `deleted_at` and pass `inTrash` to their editor forms, which render an amber banner with a "Go to Trash" link when the row is soft-deleted.
- [x] **Horizontal swipe rail for Studio Nav.** On mobile, `StudioNavLinks` wraps/crowds. Make `StudioChrome` subnav container scrollable horizontally (`overflow-x-auto`) with `shrink-0` links and a clean right-edge opacity fade.
- [x] **Unblock mobile chapter footers.** Pass `index` down from `ReaderShell` to `ReaderFoot`. Update `ReaderFoot` to layout the index card below the navigation columns on narrow screens rather than hiding it via `hidden md:block`.
- [x] **Premium site footer upgrades.** Redesign `SiteFooter` to use a 3-column asymmetric layout. Add a dynamic breathing green "systems operational" pulse and hover link underline transitions.
- [x] **Embed ThemeSwitcher in mobile menu overlay.** When `menuOpen` is active in `SiteHeader`, render the switcher controls inline at the bottom of the mobile navigation panel.
- [x] **Drag & Drop visual overhaul.** In [series-editor.tsx](file:///c:/Users/jasthtcs/Documents/Marahuyo/src/app/studio/(protected)/series/[id]/series-editor.tsx), implement a floating `<DragOverlay>` with a scale/tilt lift (`scale-[1.02] rotate-1`), deep drop shadows, and a low-opacity ghost placeholder row.
- [x] **Active focus ring states on forms.** Add `:focus-within` outline rings, transition durations, and custom borders to form wrappers like [SearchForm](file:///c:/Users/jasthtcs/Documents/Marahuyo/src/app/(site)/search/search-form.tsx).
- [x] **Interactive card hover animations.** Add translation lift (`hover:-translate-y-1`), transition curves, and soft shadow expansions on clickable items like [ContinueReading](file:///c:/Users/jasthtcs/Documents/Marahuyo/src/components/continue-reading.tsx) cards.
- [x] **Staggered list load animations.** Apply transition delays on index/works lists to stagger-fade cards in sequence.
- [x] **Optimistic dismissal with Undo toasts.** Replace permanent dismissals on key rows (e.g. shelf bookmarks) with non-blocking toasts providing an "Undo" action before deleting.
- [x] **Command Palette interface (`Cmd+K`).** Support power-user keyboard navigation by adding a modal toggle on shortcut press.

---

## Phase 8 — Next batch (queued, not started)

### 🔵 UI & Mobile Polish (Next up)


### 🔵 Feature ideas (defer)

- [ ] **Auto-purge cron for Trash.** Today trash is forever. Add a cron + action that hard-deletes items soft-deleted > 30 days ago (or a per-user retention setting).
- [ ] **Per-bookmark hide vs. remove.** Right now the X on a Continue Reading card removes the bookmark entirely. A "snooze" affordance (re-surface in N days) would be nicer than a permanent dismiss.
- [ ] **Search highlighting reflects the matched token shape.** `src/lib/search.ts` returns snippets with `<mark>` highlights — verify the sanitizer keeps them; if not, allow `<mark>` in the search snippet whitelist.

---

## How to start a fresh session

1. Read `PLAN.md` (architecture).
2. Pick an unchecked item from Phase 8. Important > Polish > Feature ideas.
3. When you finish something, move it under "Just fixed" with the date.
4. New bugs noticed mid-task → append to the right severity bucket; don't scope-creep the current PR.
