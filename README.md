# Latergram

Some words arrive late. Latergram gives them a place.

## Current Status

Phase 8 Database and Security Model complete.

The app now has a fully wired authentication foundation using Supabase Auth and a corresponding database/security schema structure prepared using PostgreSQL. It supports real account creation, sign in, sign out, password reset, and session persistence. The database schema has been created with all tables required for upcoming phases, protected by robust Row Level Security (RLS) policies.

However, account-backed storage is not connected yet. Real accounts are strictly segregated from local writing. Saved data is stored only in this browser for now, is not synced, and may be removed if browser data is cleared. Migrations live under `supabase/migrations`. The master development plan is [`LATERGRAM_DETAILED_PHASE_PLAN.md`](./LATERGRAM_DETAILED_PHASE_PLAN.md).

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
- Local saved content must be described as device/browser-only until account storage exists.

If a feature is not working end-to-end with real data, the UI must say so clearly or stay disabled.

## What Is Currently Live

- A Vite React app shell with real route-based navigation (React Router v7).
- A soft landing page that describes the product vision (`/`).
- An account access page with honest unavailable messaging (`/auth`).
- A main app shell with section navigation via URL query params (`/app`).
- A writing surface for drafting text on screen.
- Local browser/device saving for private Lategrams.
- One local draft that can be saved, restored, and cleared on this device.
- Keep Private **My Lategrams** showing real locally saved writing with view, copy, destination filter, and remove actions.
- Keep Private draft visibility for the one local draft, with a path back to the writer for restore.
- Keep Private **Time Since** archive showing real locally saved counters.
- Local Time Since counters with save and remove behavior.
- A real copy action for the write flow using the browser clipboard.
- Recipient, subject, and intended-destination context inside the write flow.
- Clear/reset behavior that asks before removing current words.
- Visible guidance that saved writing is only available in this browser/device for now.
- Honest empty/unavailable states for Keep Private, The Garden, Late Letters, Time Since, and Memory Cards.
- A soft Latergram-style 404 page for unknown routes.
- Stable design system with shared components (Phase 2).
- Browser back/forward navigation and direct URL access.

## What Is Not Live Yet

- Real auth, sessions, account creation, and password reset.
- Database, backend APIs, account-backed storage, or cloud sync.
- Late Letter scheduling, email delivery, secure open links, or recipient tracking.
- Public Garden posting, reading, reactions, reporting, or moderation.
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

### Phase 4: Write Flow Live V1
- [x] Keep write flow state in the browser session only.
- [x] Add recipient, optional subject, and intended destination context.
- [x] Replace fake Save/Draft actions with copy, guarded clear, and continue-shaping behavior.
- [x] Keep visible "not saved yet" guidance.
- [x] Confirm no storage, backend, auth, delivery, Garden posting, or export behavior was added.

### Phase 5: Device Storage Foundation
- [x] Add typed local storage helpers under `latergram:v1`.
- [x] Save real private Lategrams on this browser/device.
- [x] Save, restore, and clear one local draft.
- [x] Show real local Lategrams in Keep Private and allow removing them from this device.
- [x] Save and remove local Time Since counters.
- [x] Keep copy honest: no sync, account storage, delivery, Garden posting, or card output claims.

### Phase 6: Keepsake Box / Private Archive V1
- [x] Turn Keep Private into a real local archive center.
- [x] Show saved Latergrams newest first with destination filters.
- [x] Add full saved Latergram view, copy, and two-step local remove.
- [x] Surface the one local draft without adding cross-component draft state.
- [x] Show real Time Since counters in the Keepsake Box and allow local removal.
- [x] Keep Late Letters, Saved Cards, and Received tabs honestly unavailable.
- [x] Keep copy honest: browser/device-only data, no accounts or cloud sync.

### Phase 7: Auth Live Foundation
- [x] Chose and configured Supabase Auth as the identity provider.
- [x] Added `authClient`, `useAuth`, and `AuthProvider` for a centralized auth foundation.
- [x] Set up environment variable templates (`.env.example`, `.env.local.example`, `.env.development.example`, `.env.production.example`) and ignored real `.env` files.
- [x] Wired real `signIn`, `signUp`, and `resetPassword` to the `AuthPage`.
- [x] Updated `Header` and `HomePage` / Keepsake views to accurately reflect auth state.
- [x] Failed gracefully with honest "Accounts are not connected" messages if env vars are missing.
- [x] Preserved local-only storage (no cloud sync or account backing was added yet).

### Phase 8: Database and Security Model
- [x] Chose Supabase PostgreSQL and created migration structure (`supabase/migrations`).
- [x] Defined all real database tables needed for user data, public content, moderation, and safety.
- [x] Enabled Row Level Security (RLS) and strict policies on all user and sensitive tables.
- [x] Prepared safe public view for the future Garden.
- [x] Added TypeScript definitions for database models.
- [x] Kept storage safely disconnected: no UI changes, fake synced data, or local migration was added.

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
