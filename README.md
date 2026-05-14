# Latergram

Some words arrive late. Latergram gives them a place.

## Current Status

Phase 12 Garden Backend complete.

The app now has a fully wired authentication foundation using Supabase Auth and a true backend persistence model for "Keep Private", "Time Since" counters, and scheduled Late Letter records. Real accounts are strictly segregated from local writing. Signed-in users save private Lategrams and Time Since counters to their account archive, while signed-out users continue to save supported local records to their local device. No automatic migration occurs; local saves can be explicitly imported by the user.

Late Letters can now be delivered through Resend when the Supabase Edge Function secrets and delivery job are configured. Scheduled letters are sent server-side, receive real Resend message IDs, and open through secure recipient links. Sender status labels are backed by database/provider/page-open state. Recipient email remains masked in the saved-letter UI after saving.

The Garden backend is ready. Authenticated users can submit Garden posts (which start as pending moderation). Approved posts can be read through the safe `get_public_garden_posts` RPC that does not expose user identity. "Felt this" reactions and reports are real backend surfaces. The Garden product UI remains closed/unavailable; the app may show a closed Garden placeholder, but no public Garden browsing, posting, reactions, or reporting are visible in the product until Phase 13 safety and moderation work is complete.

Memory Cards are not connected yet; no Memory Card generation, export, sharing, or cloud sync is active. Migrations live under `supabase/migrations`. The master development plan is [`LATERGRAM_DETAILED_PHASE_PLAN.md`](./LATERGRAM_DETAILED_PHASE_PLAN.md).

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
- Local saved content must be described as device/browser-only when it has not been explicitly saved or imported into an account.

If a feature is not working end-to-end with real data, the UI must say so clearly or stay disabled.

## What Is Currently Live

- Real Supabase Auth.
- Real account sessions.
- Sign up / sign in / sign out / password reset.
- Supabase database schema.
- Account-backed private Lategrams for signed-in users.
- Account-backed Time Since counters for signed-in users.
- Account-backed Late Letter scheduling records for signed-in users.
- Resend-backed Late Letter delivery from Supabase Edge Functions when server secrets and cron are configured.
- Secure recipient open links at `/letter/:token`.
- Real sender statuses for scheduled, sending, sent, opened, failed, and cancelled Late Letters.
- Recipient opt-out hashing and send-time opt-out checks.
- Recipient email masking in saved Late Letter UI.
- Late Letter cancellation before sending.
- Garden backend RPCs for safe approved-post reads, pending submissions, reactions, and reports.
- Local browser/device saving for signed-out users.
- Explicit local-to-account import.
- Account/device archive separation.
- A Vite React app shell with real route-based navigation (React Router v7).
- A soft landing page that describes the product vision (`/`).
- An account access page (`/auth`).
- A main app shell with section navigation via URL query params (`/app`).
- A writing surface for drafting text on screen.
- One local draft that can be saved, restored, and cleared on this device.
- A real copy action for the write flow using the browser clipboard.
- Recipient, subject, and intended-destination context inside the write flow.
- Clear/reset behavior that asks before removing current words.
- Visible guidance that saved writing is only available in this browser/device for signed-out users.
- Honest empty/unavailable states for The Garden and Memory Cards.
- A soft Latergram-style 404 page for unknown routes.
- Stable design system with shared components (Phase 2).
- Browser back/forward navigation and direct URL access.

## What Is Not Live Yet

- Public Garden browsing, posting, reactions, or reporting in the product UI (backend is ready, but the product UI remains closed/unavailable until safety/moderation is complete).
- Garden moderation queue, admin review, content filtering, and full safety workflow.
- Memory Card generation, download, sharing, or export.
- Received letters.
- Guaranteed delivery or guaranteed read receipts.
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

### Phase 9: Account-Backed Private Storage V1
- [x] Implemented typed database access layer for `private_lategrams`, `time_since_counters`, and `profiles`.
- [x] Created database hooks `useAccountLategrams` and `useAccountCounters`.
- [x] Updated DiaryComposer to seamlessly save to account when signed in, while preserving the device save option.
- [x] Updated KeepPrivateView to separate account archive from local device archive.
- [x] Added explicit "Import local saves" feature to explicitly move local storage to the account archive.
- [x] Maintained strict live-only design rules (no generic UI destruction or fake sync).

### Phase 10: Late Letters Scheduling V1
- [x] Added typed database access for `late_letters`.
- [x] Let signed-in users create real scheduled Late Letter records.
- [x] Store recipient email for future delivery while showing only masked email after saving.
- [x] Show saved Late Letters from the account database without fake sent/opened states.
- [x] Allow scheduled/draft Late Letter records to be cancelled with a two-step confirmation.
- [x] Confirmed no email provider, delivery job, secure open link, recipient page, or tracking flow was added.

### Phase 11: Real Letter Delivery
- [x] Installed Resend SDK and kept Resend usage server-side only.
- [x] Added Supabase Edge Functions for due-letter sending, secure recipient opening, Resend webhooks, and recipient opt-out.
- [x] Added server-only env template under `supabase/functions/.env.example`.
- [x] Added `resend_webhook_events` for webhook dedupe and delivery event audit.
- [x] Added secure token hashing for recipient open links; raw tokens are only emailed.
- [x] Added `/letter/:token` recipient page with no account requirement.
- [x] Updated sender Late Letter UI to show only real database-backed statuses.
- [x] Preserved cancellation before send and masked recipient email display.

### Phase 12: Garden Backend V1
- [x] Created Phase 12 migration (`supabase/migrations/20260301000000_phase_12_garden_backend.sql`).
- [x] Added Phase 12 cleanup migration (`supabase/migrations/20260302000000_phase_12_garden_backend_cleanup.sql`) to explicitly revoke old column-level raw table grants.
- [x] Dropped old public Garden views to clear Security Advisor SECURITY DEFINER view errors.
- [x] Hardened raw Garden table access — revoked direct SELECT from anon/authenticated on base tables.
- [x] Uses `get_public_garden_posts` as the safe public read surface; old public Garden views were dropped.
- [x] Built `get_public_garden_posts` RPC for safe approved-post reads with category filter and pagination.
- [x] Built `submit_garden_post` RPC — posts always start pending, no auto-approval.
- [x] Built `get_my_garden_submissions` RPC for own submission tracking.
- [x] Built `toggle_garden_reaction` RPC with duplicate prevention and toggle behavior.
- [x] Built `get_garden_reaction_state` RPC for reaction count and viewer state.
- [x] Built `report_garden_post` RPC with duplicate report prevention and safety event logging.
- [x] Added category normalization (unsent, grief, apology, gratitude, memory, hope, other).
- [x] Added performance indexes for reactions, reports, and category filtering.
- [x] Created typed frontend data layer (`src/app/db/garden.ts`) using RPC calls only.
- [x] Confirmed no user_id, reporter_user_id, or anonymous_fingerprint_hash exposed publicly.
- [x] Garden product UI remains closed/unavailable — "The Garden is not open yet."
- [x] No fake posts, reactions, reports, or moderation added.
- [x] Documented Phase 13 safety dependencies.

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

Product assets are currently served from local `/assets` paths. Before public launch, asset loading should be audited for performance and caching.
