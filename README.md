# Seoul × Incheon — 8-Day Itinerary

A Next.js fullstack rebuild of the bundled "Seoul Itinerary" artifact: a neo-brutalist
travel planner for an 8-day mother-and-daughters trip (7–14 Nov 2026).

Frontend (React) and backend (Next.js API routes + SQLite) live in one app.

## Features

- **Trip overview** — hero, info cards, a tappable route timeline, a live progress bar, and a "before you fly" checklist.
- **8 day pages** — a day hero plus a vertical timeline of collapsible activity cards (address, hours, cost per person/total, what to do, "don't miss" highlights, insider tips, Google/Naver map links, onward directions).
- **Budget tracker** — SGD ⇄ KRW and total ⇄ per-person toggles with animated category bars, plus an **"actually spent so far"** rollup.
- **Per-person photos** — every day & activity has **three** full-width photo slots, one per traveller (Jolin / Perris / Perynn), so everyone uploads their own shot. Your own slot is highlighted.
- **Actual-spend logging** — each activity has an "actually spent" box: log **one combined bill** or **split per person**; the group total rolls up into the Budget page. Synced live.
- **Synced state** — checked stops, todos, expanded cards, logged spend and preferences persist on the server and sync across devices. No login (single shared trip).
- **Settings** — a bottom sheet (phones) / popover (desktop) to choose **who you are on this device** (highlights your photo + spend), pick an accent colour, toggle Korean place names, reset all ticks, and print.
- **Installable PWA + offline** — "Add to Home Screen" runs it full-screen; a service worker caches the app shell, fonts, itinerary, weather and already-viewed photos, so it works on patchy/no data. Edits are mirrored to the device and re-synced on reconnect (an offline bar shows when disconnected).
- **"Today" awareness** — during the trip a **Today** chip jumps to the current day, and the activity happening **right now** gets a pulsing "HAPPENING NOW" highlight (by clock time).
- **Live weather** — once the trip is inside the ~16-day forecast window, a live Seoul forecast strip (Open-Meteo, no API key) shows each day's hi/lo + condition, plus the current temperature; each day hero shows its own forecast.
- **Essentials / safety** — a shield-icon page with one-tap emergency numbers (112 / 119 / 1330), the Singapore Embassy, hotel addresses **in Korean** (copy to show a driver), and flight details. Cached for offline.
- **Print / PDF** — a clean `/print` page (Settings → Print) for a paper backup that needs no battery.
- **Mobile-first** — tuned for iPhone 16 Pro / 17 Pro: safe-area insets (notch / Dynamic Island / home indicator), a two-row header, and large touch targets.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Pluggable storage** (`src/lib/storage/`): a local **SQLite** file (`data/trip.db`) in development, **Vercel Blob** in production. The backend is chosen automatically by the presence of `BLOB_READ_WRITE_TOKEN`.
- **Live sync** — while a tab is visible, ticked stops, todos and photos are polled every ~7–9s (and on tab focus), so a family member's changes appear within seconds. Navigation and display prefs stay local to each device.
- **Self-hosted fonts** — Bricolage Grotesque, Plus Jakarta Sans, Space Mono (the exact woff2 from the original offline bundle, in `public/fonts/`; declared in `src/app/fonts.css`). No external font CDN, so it renders identically offline.

## Getting started (local)

No setup or env vars needed — local persistence is a SQLite file.

```bash
npm install
npm run dev
# open http://localhost:3000
```

The SQLite database and uploaded photos are created under `data/` at runtime
(git-ignored). Delete that folder to reset all local trip state and photos.

## Deploy to Vercel

The app needs **persistent** storage, which Vercel's serverless filesystem does
not provide — so it uses **Vercel Blob** in production. Setup is two clicks:

1. Push this repo to GitHub and **import it** at [vercel.com/new](https://vercel.com/new).
2. In the new project, open the **Storage** tab → **Create Database** → **Blob**, and connect it. Vercel adds the `BLOB_READ_WRITE_TOKEN` env var for you.
3. **Redeploy** (Deployments → ⋯ → Redeploy) so the function picks up the token.

That's it — share the deployment URL with your family. Everyone on the link can
view and edit the same trip (no login), and changes sync live.

> If you deploy without adding Blob storage, the API will return a clear error
> telling you to add it (rather than silently losing data).

To run the production build locally (uses SQLite, since no Blob token):

```bash
npm run build && npm start
```

## API

| Method | Route                   | Purpose                                            |
| ------ | ----------------------- | -------------------------------------------------- |
| GET    | `/api/itinerary`        | Full trip content (days, route, budget, meta).     |
| GET    | `/api/state`            | Saved shared trip state (merged over defaults).    |
| PUT    | `/api/state`            | Merge a (partial) state patch and persist it.      |
| GET    | `/api/photos`           | List slots that currently have a photo.            |
| GET    | `/api/photos/:slotId`   | The image (bytes locally, 307→Blob URL on Vercel). |
| PUT    | `/api/photos/:slotId`   | Upload an image (raw body, `image/*`, ≤ 10 MB).    |
| DELETE | `/api/photos/:slotId`   | Remove a slot's image.                             |

## Project layout

```
src/
  app/
    layout.tsx            Root layout + fonts
    page.tsx              Client orchestrator (picks the active view)
    globals.css           Animations, scrollbar, hover utilities
    api/                  Backend route handlers
      itinerary/route.ts
      state/route.ts
      photos/route.ts
      photos/[slotId]/route.ts
  components/             Header, Settings, TripOverview, DayView,
                         ActivityCard, BudgetView, ImageSlot, PhotosProvider
  hooks/                 useItinerary, useTripState
  lib/
    itinerary.ts          Builds the served itinerary payload
    itinerary-data.ts     Trip content (generated from the original artifact)
    db.ts                 SQLite access
    format.ts             Currency + duration helpers
    icons.tsx             Inline SVG icon set
    types.ts              Shared types + default state
```

## Editing the trip

All day/activity content lives in `src/lib/itinerary-data.ts`; framing (meta,
route names, budget) lives in `src/lib/itinerary.ts`. Change those and the whole
UI updates — no trip content is hard-coded in components.

## Hardening notes

The backend is intentionally login-less (a single shared family trip), so it
applies guardrails instead of auth:

- **Photo uploads** are restricted to the slot ids the UI actually uses, to a
  raster allowlist (`jpeg/png/webp/gif/avif` — SVG is rejected to avoid stored
  XSS), and to ≤ 10 MB read with a streaming cap. Image responses send
  `nosniff` + a locked-down `Content-Security-Policy`.
- **State writes** are validated against a strict allowlist (known keys, valid
  enums, capped maps); unknown keys are dropped.

If you intend to expose this on the public internet, add authentication and/or a
reverse proxy with a request-body limit.

### Known accessibility tradeoffs

To stay faithful to the original design, two WCAG AA **colour-contrast** items
are left as-is: white text on the bright accent colours (active nav / budget
total) and the muted grey helper text. To meet AA, darken the accent palette in
`src/lib/itinerary.ts` (e.g. Coral `#D8341B`, Pink `#D81E6E`) and swap the
`#9A8C81` / `#B7A99C` greys for `#6B5E54`. All keyboard/screen-reader behaviour
(focus rings, button semantics, alt text) already meets AA.
