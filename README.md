# Latergram

Some words arrive late. Latergram gives them a place.

## Current Status

Phase 21 Private Beta Execution & Launch Blocker Resolution is complete. Latergram is not publicly launched.

**Launch Decision: NO-LAUNCH**

Three critical blockers prevent public launch:
1. Actual private beta (20-50 real users) has not been executed
2. Support inbox not configured (`SUPPORT_EMAIL_CONFIGURED = false`)
3. Formal legal review of privacy policy and terms pending

Phase 21 provides the operational infrastructure to execute the private beta and close launch blockers: a beta execution runbook, launch blocker tracker, manual testing template, GitHub issue templates for feedback collection, and production environment readiness checklist. The actual beta execution must be performed separately by the founder with real users and real feedback collected off-platform.

The codebase is structurally ready for launch. Core features are implemented, no fake data exists, trust pages are honest, and the product follows the live-only development rule. However, operational readiness (beta validation, support infrastructure, legal review) is incomplete. See [`docs/phase-20-public-launch-v1.md`](./docs/phase-20-public-launch-v1.md) for the launch gate audit and [`docs/launch-blockers.md`](./docs/launch-blockers.md) for current blocker status.

Privacy-safe analytics instrumentation exists behind environment gates and is disabled by default. The wrapper supports a Plausible-compatible provider only when `VITE_ANALYTICS_ENABLED=true`, `VITE_ANALYTICS_PROVIDER=plausible`, `VITE_PLAUSIBLE_DOMAIN`, and `VITE_PLAUSIBLE_SCRIPT_SRC` are configured. With missing or disabled env, analytics is a no-op and no analytics network request is sent by the wrapper. No analytics provider, production domain, secret, fake dashboard, fake metrics, session replay, heatmap, ad pixel, or Google Analytics integration was added.

The app now has an honest private beta state: a `/beta` page, subtle beta notices on landing/auth/app surfaces, and documentation for a small real beta with 20 to 50 users. Beta access is **not** enforced by invite code or allowlist yet. Access distribution is manual/off-platform by direct link for now, and the UI says that plainly. No fake waitlist counts, fake beta users, fake testimonials, fake feedback forms, fake analytics, or fake launch claims were added.

The app now has honest, product-specific trust pages: a privacy policy explaining what data Latergram stores and how, terms of service with user responsibilities and service limitations, and a support page with data deletion instructions, abuse reporting, and crisis redirection. All trust content is written in plain language specific to Latergram's actual features and data model. Legal review disclaimers are clearly marked.

The app has a fully wired authentication foundation using Supabase Auth and a true backend persistence model for "Keep Private", "Time Since" counters, and scheduled Late Letter records. Real accounts are strictly segregated from local writing. Signed-in users save private Lategrams and Time Since counters to their account archive, while signed-out users continue to save supported local records to their local device. No automatic migration occurs; local saves can be explicitly imported by the user.

Late Letters can now be delivered through Resend when the Supabase Edge Function secrets and delivery job are configured. Scheduled letters are sent server-side, receive real Resend message IDs, and open through secure recipient links. Sender status labels are backed by database/provider/page-open state. Recipient email remains masked in the saved-letter UI after saving. Sender cancellation still works before send. After send, the letter cannot be recalled. Recipients can now report a letter and block future letters from the same sender without exposing sender identity.

The Garden backend now has a real safety foundation: moderator/admin membership, moderator-only queue/review RPCs, server-side content filtering, per-user submission rate limiting, and real report handling. The Garden product UI remains closed/unavailable for the initial private beta. Anonymous public Garden execution remains locked. Authenticated user-facing Garden RPCs remain re-locked after Phase 17. Garden testing requires a separate safety checkpoint before any opening.

Memory Card export is live only for real saved Lategrams and real saved Time Since counters. Saved card history/metadata, sharing, auto-upload, and cloud sync are not active. Phase 13 migrations and cleanup migrations live under `supabase/migrations`. The master development plan is [`LATERGRAM_DETAILED_PHASE_PLAN.md`](./LATERGRAM_DETAILED_PHASE_PLAN.md).

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

After the current migrations and Edge Functions are applied:

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
- Recipient letter reporting and per-sender future-send blocking.
- Recipient email masking in saved Late Letter UI.
- Late Letter cancellation before sending.
- Moderator/admin membership stored in `public.moderators`.
- Moderator-only Garden moderation queue and Garden report queue RPCs.
- Server-side Garden content filtering and per-user submission rate limiting.
- Garden backend RPCs for safe approved-post reads, pending submissions, reactions, and reports.
- Local browser/device saving for signed-out users.
- Explicit local-to-account import.
- Account/device archive separation.
- Real Memory Card PNG export from explicitly selected saved Lategrams or Time Since counters.
- Memory Card formats: square 1080 x 1080, story 1080 x 1920, and phone wallpaper 1170 x 2532.
- Memory Card export is client-side Canvas-based and does not upload, share, or auto-save card output.
- A Vite React app shell with real route-based navigation (React Router v7).
- A soft landing page that describes the product vision (`/`).
- An account access page (`/auth`).
- A main app shell with section navigation via URL query params (`/app`).
- Mobile app navigation for the live core app sections.
- A writing surface for drafting text on screen.
- One local draft that auto-saves locally, restores on refresh, and can be manually saved/restored/cleared on this device.
- A real copy action for the write flow using the browser clipboard.
- Recipient, subject, and intended-destination context inside the write flow.
- Clear/reset behavior that asks before removing current words.
- Visible guidance that saved writing is only available in this browser/device for signed-out users.
- Honest empty/unavailable states for The Garden and for saved card history.
- Mobile-friendly closed Garden and Memory Card export states.
- A soft Latergram-style 404 page for unknown routes.
- Stable design system with shared components (Phase 2).
- Browser back/forward navigation and direct URL access.
- Privacy policy page at `/privacy` with Latergram-specific data handling explanation.
- Terms of service page at `/terms` with honest user responsibilities and limitations.
- Support page at `/support` with data deletion, abuse reporting, and crisis redirection.
- Private beta readiness page at `/beta` with direct-link/manual access strategy, test guidance, safety boundaries, and Garden-closed decision.
- Private beta notices on landing, auth, and app home surfaces.
- Privacy-safe analytics wrapper, route scrubbing, fixed product-event instrumentation, and category-only error observation prepared behind disabled-by-default env gates.
- Trust/legal links on landing, auth, trust, beta, and recipient letter pages.

## What Is Not Live Yet

- Public Garden browsing, posting, reactions, or reporting in the product UI.
- Anonymous public Garden browsing via `anon` execution.
- A moderator web UI. Phase 13 moderation is DB/RPC-based.
- Garden submission IP-based rate limiting. Current enforced limit is per authenticated user only.
- Saved Memory Card history/metadata.
- Memory Card sharing, auto-upload, or cloud sync.
- Received letters.
- Guaranteed delivery or guaranteed read receipts.
- Analytics collection is not enabled by default and no provider is configured in committed env templates.
- Payments, AI, or public launch infrastructure.
- Real invite-code or allowlist beta access enforcement.
- Real configured support inbox (`SUPPORT_EMAIL_CONFIGURED` is still `false`).
- Self-serve full account deletion (available via support request).
- Formal legal review of privacy policy and terms of service.

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

### Phase 13: Safety and Moderation
- [x] Added `supabase/migrations/20260515121701_phase_13_safety_moderation.sql`.
- [x] Added `public.moderators`, `public.content_filter_terms`, `public.action_rate_limits`, `public.letter_safety_reports`, and `public.recipient_sender_blocks`.
- [x] Added moderator-only Garden queue/review RPCs and manual SQL role assignment.
- [x] Hardened `submit_garden_post` with server-side filtering and per-user rate limiting.
- [x] Added recipient letter reporting via `supabase/functions/report-letter`.
- [x] Added sender-specific future-send blocking for recipients.
- [x] Added authenticated sender report RPC for Late Letters.
- [x] Kept the Garden product UI closed and anonymous public Garden execution locked.
- [x] Added Phase 13 safety documentation and test checklist.

### Phase 14: Mobile Polish
- [x] Added mobile app navigation for live core sections while preserving query-param section URLs.
- [x] Improved mobile writer layout, textarea spacing, sticky writer actions, safe-area spacing, and tap targets.
- [x] Improved auth, Keepsake Box, Late Letters, Time Since, and recipient letter layouts for small screens.
- [x] Kept the Garden closed/unavailable in the product UI and removed inactive search/filter controls from the closed state.
- [x] Replaced Memory Card preview sources with an honest unavailable state.
- [x] Confirmed no fake Garden posts, fake card sources, fake counters, fake letters, or fake analytics were added.
- [x] Confirmed no new Supabase migrations, dependency upgrades, or production config changes were needed.

### Phase 15: Performance and Error Handling
- [x] Audited auth, account storage, Time Since, Late Letters, recipient letter, Garden closed, and then-unavailable Memory Card async flows.
- [x] Added calmer offline/network/account error handling without exposing raw technical details in user UI.
- [x] Added local draft auto-save and refresh restore without automatic account migration, scheduling, or sending.
- [x] Added app-level render error fallback with a safe recovery path back to writing.
- [x] Added large-list "show more" behavior for Keepsake Lategrams and counters using real loaded items only.
- [x] Improved Late Letter schedule/cancel/report loading states and kept status labels database-backed.
- [x] Improved recipient token loading/unavailable/retry states and report/block/opt-out submission handling.
- [x] Split route/vendor bundles and lazy-loaded route pages to reduce initial app chunk pressure.
- [x] Confirmed Garden remained closed/unavailable and Memory Cards stayed unavailable during Phase 15.
- [x] Documented Phase 15 in [`docs/phase-15-performance-error-handling.md`](./docs/phase-15-performance-error-handling.md).

### Phase 16: Memory Card Export
- [x] Replaced the unavailable Memory Cards section with real export-only card generation.
- [x] Source selection is explicit and uses only real saved Lategrams or real saved Time Since counters from device storage or, when signed in, account storage.
- [x] Added square, story, and phone wallpaper PNG export through native browser Canvas APIs.
- [x] Added privacy-safe previews, disabled/missing-source/exporting/error states, and safe non-sensitive filenames.
- [x] Kept saved card history/metadata deferred and did not add sharing, cloud sync, analytics, AI, or fake card sources.
- [x] Confirmed Garden remains closed/unavailable and no Garden cards or Garden RPC changes were added.
- [x] Documented Phase 16 in [`docs/phase-16-memory-card-export.md`](./docs/phase-16-memory-card-export.md).

### Phase 17: Privacy, Terms, and Support
- [x] Added `/privacy` route with Latergram-specific privacy policy.
- [x] Added `/terms` route with honest terms of service.
- [x] Added `/support` route with data deletion, abuse reporting, and crisis redirection.
- [x] Integrated trust footer links on landing, auth, and recipient letter pages.
- [x] Auth page "agree to terms" text now links to actual `/terms` and `/privacy` pages.
- [x] No fake support form, no fake compliance claims, no fake support email.
- [x] Self-serve account deletion documented as future work (available via support request).
- [x] Legal review disclaimers clearly marked on privacy and terms pages.
- [x] Documented Phase 17 in [`docs/phase-17-privacy-terms-support.md`](./docs/phase-17-privacy-terms-support.md).

### Phase 18: Private Beta Readiness
- [x] Added `/beta` route with honest private beta scope, test guidance, support status, and safety boundaries.
- [x] Chose direct-link/manual off-platform invite distribution for beta access; no fake invite enforcement was added.
- [x] Kept `SUPPORT_EMAIL_CONFIGURED = false` and kept support inbox pending copy honest.
- [x] Kept Garden closed for the initial private beta and did not change Garden RPC grants.
- [x] Added subtle private beta notices to landing, auth, and app home surfaces.
- [x] Added recipient letter function timeout fallback so invalid/unavailable letter routes do not stay on an opening state if the function request hangs.
- [x] Added founder-facing beta checklist, user test script, feedback questions, Late Letter delivery test plan, Garden safety checkpoint, rollback conditions, and remaining risks.
- [x] Confirmed no fake beta users, fake feedback, fake support form, fake Garden activity, fake analytics, payments, AI, or public launch behavior were added.
- [x] Documented Phase 18 in [`docs/phase-18-private-beta.md`](./docs/phase-18-private-beta.md).

### Phase 19: Privacy-Respecting Analytics
- [x] Added a dependency-free analytics wrapper that is disabled by default and no-ops when env is missing or misconfigured.
- [x] Supports only a Plausible-compatible provider through public frontend env variables; no Google Analytics, ad pixels, session replay, heatmaps, cookies, or package changes were added.
- [x] Added route-level page view tracking with canonical paths and `/letter/:token` token scrubbing.
- [x] Added fixed product events with enum/boolean props only for auth, writing, saves/imports, Time Since, Late Letters, recipient actions, Memory Card export, beta/support views, and closed Garden viewing.
- [x] Added category-only error observation without sending raw messages, stacks, user content, tokens, auth IDs, or database IDs.
- [x] Updated privacy copy and documentation to describe the disabled-by-default analytics status honestly.
- [x] Documented Phase 19 in [`docs/phase-19-privacy-respecting-analytics.md`](./docs/phase-19-privacy-respecting-analytics.md).

### Phase 20: Public Launch V1 Readiness
- [x] Completed comprehensive launch readiness audit across 12 gates.
- [x] Audited private beta reality, Garden launch readiness, support infrastructure, legal/trust status, core product implementation, analytics configuration, environment setup, asset hosting, mobile responsiveness, and documentation.
- [x] Identified three critical launch blockers: actual private beta not executed, support inbox not configured, formal legal review pending.
- [x] Documented launch environment checklist with all required env vars, secrets, and deployment steps.
- [x] Created manual testing checklist for auth, private saves, Late Letters, Memory Cards, trust pages, mobile responsive, and all public routes.
- [x] Confirmed Garden intentionally closed (not a blocker), analytics intentionally disabled (not a blocker), and codebase structurally ready.
- [x] Made launch decision: NO-LAUNCH until critical blockers resolved.
- [x] Documented Phase 20 in [`docs/phase-20-public-launch-v1.md`](./docs/phase-20-public-launch-v1.md).
- [x] Updated README to reflect Phase 20 audit complete, public launch not ready.

### Phase 21: Private Beta Execution & Launch Blocker Resolution
- [x] Created private beta execution runbook with invite process, testing script, feedback questions, bug/safety/support workflows, and success/failure criteria.
- [x] Created launch blocker tracker documenting all critical, conditional, and operational blockers with clear status tracking.
- [x] Created manual testing template with privacy-safe evidence structure for route checks, auth flows, Late Letter delivery, recipient flows, Memory Card export, and mobile testing.
- [x] Added GitHub issue templates for beta feedback, bug reports, and internal safety reports with privacy reminders.
- [x] Documented production environment readiness checklist covering deployment, Supabase, Resend, secrets, and testing.
- [x] Kept `SUPPORT_EMAIL_CONFIGURED = false` (support inbox not verified configured).
- [x] Kept Garden closed and documented as conditional blocker if V1 includes Garden.
- [x] Kept analytics disabled by default.
- [x] Confirmed no fake beta results, fake support infrastructure, fake legal review, fake Garden activity, or fake public launch behavior was added.
- [x] Documented Phase 21 in [`docs/phase-21-private-beta-execution.md`](./docs/phase-21-private-beta-execution.md).
- [x] Updated README to reflect Phase 21 operational infrastructure complete, actual beta execution pending.

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

Product assets are currently served from local `/assets` paths. No runtime raw GitHub asset dependency is used.
