# Latergram

Some words arrive late. Latergram gives them a place.

## Current Status

Phase 3 App Structure and Navigation complete.

The app now has real route-based navigation with React Router, clean page boundaries, query-param-driven app sections, and a soft 404 page. The master development plan is [`LATERGRAM_DETAILED_PHASE_PLAN.md`](./LATERGRAM_DETAILED_PHASE_PLAN.md).

## Development Rule

Latergram is live-only product development:

- No fake user content.
- No demo Garden posts.
- No fake private Lategrams.
- No fake scheduled or opened Late Letters.
- No fake Time Since counters.
- No fake Memory Card sources.
- No fake account-backed behavior.
- No UI that makes a non-live feature look complete.

If a feature is not working end-to-end with real data, the UI must say so clearly or stay disabled.

## What Is Currently Live

- A Vite React app shell with real route-based navigation (React Router v7).
- A soft landing page that describes the product vision (`/`).
- An account access page with honest unavailable messaging (`/auth`).
- A main app shell with section navigation via URL query params (`/app`).
- An unsaved writing surface for drafting text on screen.
- Honest empty/unavailable states for Keep Private, The Garden, Late Letters, Time Since, and Memory Cards.
- A soft Latergram-style 404 page for unknown routes.
- Stable design system with shared components (Phase 2).
- Browser back/forward navigation and direct URL access.

## What Is Not Live Yet

- Real auth, sessions, account creation, and password reset.
- Database, backend APIs, or account-backed storage.
- LocalStorage or device persistence.
- Private Lategram saving.
- Late Letter scheduling, email delivery, secure open links, or recipient tracking.
- Public Garden posting, reading, reactions, reporting, or moderation.
- Time Since counter persistence.
- Memory Card generation, download, sharing, or export.
- Analytics, payments, AI, or public launch infrastructure.

## Completed Phases

### Phase 1: Live Baseline Cleanup
- [x] Replace generated project identity with Latergram identity.
- [x] Remove all fake user data, Garden posts, letters, counters, and card sources.
- [x] Replace with honest empty/unavailable states.

### Phase 2: Design System Stabilization
- [x] Standardize shared components (SoftButton, SoftField, PaperCard, etc.).
- [x] Isolate design-preview fixture data.
- [x] Remove duplicate code and establish consistent patterns.

### Phase 3: App Structure and Navigation
- [x] Replace local useState page switcher with React Router.
- [x] Add routes: `/`, `/auth`, `/app`, `/404`.
- [x] Add query param section navigation for HomePage.
- [x] Create soft 404 page.
- [x] Simplify Header navigation (removed non-live feature links).
- [x] Preserve page transitions with AnimatePresence.
- [x] Confirm all routes work with direct URL access and browser back/forward.

## Run Locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Asset Hosting Note

`src/app/components/BrandAssets.ts` currently points to raw GitHub asset URLs:

```text
https://raw.githubusercontent.com/rudrasatani13/Lategram/main/assets
```

This is temporary. Before public launch or mobile polish, product assets must move to a controlled CDN or self-hosted path. This is documented as future Phase 14/public-launch work and was not migrated in Phase 1.
