# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A static, client-side clone of the ClickUp calendar/notes UI ("Notas Bonitas" — Spanish UI). Plain HTML/CSS/JS, no framework, no build step, no bundler. All state lives in `localStorage`; there is no backend.

## Running the app

There is no dev server or build command defined. Open `index.html` directly in a browser, or serve the directory with any static file server (e.g. `npx serve .`) if `file://` restrictions cause issues.

`package.json` only declares `playwright` as a dependency (for browser automation/screenshotting during development) and a placeholder `test` script that does nothing useful — there is no test suite.

## Architecture

Everything is wired together through global objects attached via IIFEs and loaded as plain `<script>` tags in `index.html`, in this order:

1. `js/store.js` — `NotesStore`: the only data layer. Persists notes and categories to `localStorage` (`clickup_notes`, `clickup_categories`), seeded from `DEFAULT_NOTES`/`DEFAULT_CATEGORIES` on first load. All CRUD (`create`, `update`, `delete`, `getForMonth`, etc.) goes through this module — no other file touches `localStorage` directly.
2. `js/utils.js` — `CalendarUtils`: pure date/layout helpers (month grid generation, event segmentation across week boundaries, track assignment for overlapping multi-day events, date formatting, hex→rgb).
3. `js/sidebar.js` — `Sidebar`: click-to-activate state for the leftmost icon rail and the second panel's list items.
4. `js/calendar.js` — `Calendar`: owns `currentYear`/`currentMonth` and renders the month grid into `#calendar-body`. Each week is a positioned grid (day cells layer + an absolutely-tracked event-bar layer built from `CalendarUtils.segmentEvents`/`assignTracks`, so multi-day notes render as continuous bars spanning columns). Wires prev/next/today navigation and delegates note creation/opening to `QuickCreate`/`DetailPanel` via `window.*` lookups (no imports — cross-file calls rely on load order and globals existing by the time handlers fire).
5. `js/quick-create.js` — `QuickCreate`: the small popover for creating a note on a given date, positioned relative to the clicked day cell.
6. `js/detail-panel.js` — `DetailPanel`: full overlay for viewing/editing a note.

Styling follows the same layering as the scripts: `styles/tokens.css` defines all design tokens (colors, spacing, radii, shadows as CSS custom properties on `:root`, prefixed `--cu-*`) plus global resets/utility classes (`.flex`, `.flex-col`, etc.); each other stylesheet (`sidebar.css`, `panel.css`, `header.css`, `calendar.css`, `quick-create.css`, `detail-panel.css`) styles one component and is loaded independently — there's no CSS build/scoping, so avoid class-name collisions across files.

Notes/events carry a `category` (id into `NotesStore.getCategories()`), a `color`, a date range (`startDate`/`endDate`, `YYYY-MM-DD` strings), a `status`, and an `emoji`. Multi-day notes are visually segmented per week by `CalendarUtils.segmentEvents`.

## Known issue: broken files

`js/calendar.js`, `js/utils.js`, and `js/detail-panel.js` currently contain **duplicated, conflicting code** — it looks like an ES5 (`var`/`function`) rewrite was pasted in alongside the original ES6 (`const`/`let`/arrow-function) version instead of replacing it, leaving two copies of most function bodies back to back (including duplicate `const`/`var` declarations of the same identifier in the same scope, and stray leftover `innerHTML`-building code next to newer DOM-building code in `calendar.js`). Verify with `node -c <file>` — these three fail to parse as-is:

```
node -c js/calendar.js
node -c js/utils.js
node -c js/detail-panel.js
```

`js/store.js`, `js/quick-create.js`, and `js/sidebar.js` are clean. Before editing any of the three broken files, read the whole file first to determine which of the two duplicated code paths is the intended final version (generally the second/later copy in each function looks like the more complete, defensive one) and remove the other rather than editing both copies.
