# Phase 19: Privacy-Respecting Analytics

Date: 2026-05-16

## Summary

Phase 19 adds privacy-respecting analytics instrumentation and lightweight client error observation for Latergram without collecting emotional writing content.

Analytics is prepared but disabled by default. With the committed env templates, the analytics wrapper is a no-op and does not send analytics network requests. No public launch copy, fake metrics, fake dashboards, ad pixels, session replay, Google Analytics, Garden opening, Supabase analytics table, or package dependency was added.

## Provider Decision

Chosen path: dependency-free Plausible-compatible wrapper.

Why:

- Keeps analytics disabled unless explicitly configured.
- Avoids adding a new dependency.
- Avoids Google Analytics, Meta Pixel, TikTok Pixel, Hotjar, heatmaps, session replay, fingerprinting, and keystroke/input recording.
- Keeps Latergram from storing first-party analytics events in Supabase during this phase.

Status:

- Analytics wrapper: implemented.
- Analytics collection: disabled by default.
- Provider configured in repo env templates: no.
- Production analytics domain or endpoint committed: no.
- Secrets in frontend env: no.

## Env Vars

Public frontend env vars:

```bash
VITE_ANALYTICS_ENABLED=false
VITE_ANALYTICS_PROVIDER=
VITE_PLAUSIBLE_DOMAIN=
VITE_PLAUSIBLE_SCRIPT_SRC=
```

To enable analytics later, all of these must be explicitly configured:

```bash
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=plausible
VITE_PLAUSIBLE_DOMAIN=your_public_domain
VITE_PLAUSIBLE_SCRIPT_SRC=https://your-plausible-script.example/script.js
```

Missing, disabled, unsupported, or malformed config no-ops safely.

## Files Added Or Changed

- `src/app/analytics/analytics.ts` - new env-gated analytics wrapper, page sanitizer, event allowlist, prop sanitizer, error category tracking.
- `src/app/App.tsx` - route-level page views, beta/support/closed-Garden product events.
- `src/app/components/AppErrorBoundary.tsx` - category-only render error observation.
- `src/app/storage/localStorage.ts` - category-only local storage error observation.
- `src/app/pages/AuthPage.tsx` and `src/app/auth/AuthProvider.tsx` - auth view/attempt/error categories.
- `src/app/components/DiaryComposer.tsx` - write/copy/private-save/local-draft events.
- `src/app/components/diary/KeepPrivateView.tsx` - local-to-account import events.
- `src/app/components/diary/TimeSinceView.tsx` - counter create events.
- `src/app/components/diary/LateLettersView.tsx` - schedule/cancel events.
- `src/app/pages/RecipientLetterPage.tsx` - recipient open/report/opt-out events without token payloads.
- `src/app/components/diary/MemoryCardView.tsx` - Memory Card export events without card text.
- `src/app/pages/PrivacyPage.tsx` - analytics status copy.
- `src/app/pages/BetaPage.tsx` - clarified analytics collection is not enabled by default.
- `.env.example`, `.env.local.example`, `.env.development.example`, `.env.production.example` - analytics env placeholders.
- `README.md` - Phase 19 status.
- `docs/phase-18-private-beta.md` - updated Phase 18 analytics wording.
- `docs/phase-19-privacy-respecting-analytics.md` - this document.

## Page View Handling

Tracked page views are canonicalized before dispatch:

- `/`
- `/auth`
- `/app`
- `/privacy`
- `/terms`
- `/support`
- `/beta`
- `/letter/:token`
- `/404`

For `/app`, the only query-derived value that can be tracked is the safe enum `section`:

- `write`
- `private`
- `later`
- `time`
- `memory`
- `garden`

Full URLs, unknown query params, recipient data, and raw letter tokens are not passed to analytics. `/letter/not-a-real-token` is sanitized to `/letter/:token` before it can become the Plausible `u` value.

## Event Allowlist

Allowed product events:

- `auth_viewed`
- `auth_sign_in_attempted`
- `auth_sign_up_attempted`
- `write_started`
- `write_copied`
- `local_draft_restored`
- `private_save_attempted`
- `private_save_completed`
- `local_to_account_import_attempted`
- `local_to_account_import_completed`
- `time_counter_create_attempted`
- `time_counter_create_completed`
- `late_letter_schedule_attempted`
- `late_letter_schedule_completed`
- `late_letter_cancel_attempted`
- `late_letter_cancel_completed`
- `recipient_letter_open_attempted`
- `recipient_letter_open_available`
- `recipient_letter_open_unavailable`
- `recipient_report_attempted`
- `recipient_report_completed`
- `recipient_opt_out_attempted`
- `recipient_opt_out_completed`
- `memory_card_export_attempted`
- `memory_card_export_completed`
- `garden_closed_viewed`
- `beta_page_viewed`
- `support_page_viewed`

Error categories are separately allowlisted:

- `auth_error`
- `account_save_error`
- `local_storage_error`
- `late_letter_schedule_error`
- `recipient_letter_error`
- `memory_card_export_error`
- `app_render_error`
- `analytics_error`

## Prop Allowlist

Allowed prop keys:

- `section`
- `source_type`
- `storage_scope`
- `format`
- `result`
- `reason`
- `signed_in`
- `environment`

Allowed values are strict enums or booleans:

- `section`: `write`, `private`, `later`, `time`, `memory`, `garden`
- `source_type`: `lategram`, `time_since`
- `storage_scope`: `local`, `account`
- `format`: `square`, `story`, `wallpaper`
- `result`: `success`, `failure`, `unavailable`
- `reason`: `invalid`, `not_ready`, `not_available`, `server_error`, `offline`, `missing_config`, `unsupported`
- `signed_in`: boolean
- `environment`: `development`, `production`

## Sensitive Data Blocklist

Analytics must not collect:

- message bodies
- drafts
- Late Letter text
- recipient emails
- recipient names
- subjects
- Garden post bodies
- report details
- Memory Card text
- localStorage content
- tokens
- auth IDs
- database IDs
- IP-derived identifiers
- raw URLs or arbitrary query params

The wrapper rejects unallowlisted props, rejects values matching obvious sensitive patterns, and only exposes typed functions that accept fixed event names and enum/boolean props.

## Error Observation

No Sentry or heavyweight error monitoring was added.

Error observation uses `trackError(category, props?)`, which only sends the allowlisted error category plus safe enum/boolean props if analytics is enabled. It does not send raw `Error.message`, stack traces, component props, user input, route tokens, database IDs, auth IDs, or localStorage content.

## Privacy Page Change

The `/privacy` page now describes the actual analytics status:

- If analytics is disabled or misconfigured, it says instrumentation is prepared but disabled and no analytics request is sent by the wrapper.
- It says Latergram does not use cross-site tracking, advertising pixels, session replay, heatmaps, screenshots, or keystroke recording.
- It says prepared analytics events do not include writing content, recipient emails, names, subjects, tokens, report details, Memory Card text, Garden content, browser local storage, auth IDs, or database IDs.
- If Plausible-compatible analytics is enabled later, the page names the configured provider path and describes the fixed event approach.

## Commands Run

Pre-edit audit:

```bash
git status --short
git log --oneline -5
npm install
npm run build
```

Results:

- `git status --short`: clean before edits.
- `git log --oneline -5`: latest commit was `95dcef4 feat: implement private beta infrastructure with new BetaPage and discovery notices`.
- `npm install`: completed, no package changes; reported one existing high severity audit item. `npm audit fix --force` was not run.
- Baseline `npm run build`: passed.

Implementation checkpoint:

```bash
npm run build
```

Result:

- Passed.

Final verification:

```bash
npm run build
```

Result:

- Passed.

## Manual Checks

Disabled analytics route checks ran against `http://127.0.0.1:5173`:

- `/`
- `/auth`
- `/app`
- `/app?section=private`
- `/app?section=later`
- `/app?section=time`
- `/app?section=memory`
- `/app?section=garden`
- `/privacy`
- `/terms`
- `/support`
- `/beta`
- `/letter/not-a-real-token`
- `/not-a-real-route`

Results:

- All listed routes rendered the expected page or section.
- `/not-a-real-route` redirected to `/404`.
- `/app?section=garden` still showed the closed Garden state.
- `/privacy` showed the prepared/disabled analytics copy.
- `/support`, `/auth`, `/app`, `/beta`, and trust pages still showed the support inbox pending status where relevant.
- Disabled analytics had no Plausible/window hook, no analytics script tag, and no analytics-looking resource requests.
- `/letter/not-a-real-token` did not render the token in the UI.

Enabled-wrapper checks used a local dummy Plausible script, not a real provider:

- `VITE_ANALYTICS_ENABLED=true`
- `VITE_ANALYTICS_PROVIDER=plausible`
- `VITE_PLAUSIBLE_DOMAIN=example.test`
- `VITE_PLAUSIBLE_SCRIPT_SRC=http://127.0.0.1:5180/plausible.js`

Results:

- `/support` queued only `pageview` for `/support` and `support_page_viewed` with `environment` and `signed_in`.
- `/app?section=garden` queued only `pageview` for `/app` with `section: garden` and `garden_closed_viewed`.
- Empty writer actions queued `write_copied`, `private_save_attempted`, and `private_save_completed` with safe enum/boolean props only.
- Captured payloads did not include body text, subject, recipient email, recipient name, report details, card text, Garden content, auth IDs, database IDs, or raw tokens.
- `/letter/not-a-real-token` did not expose the token in captured recipient-open analytics payloads; source audit confirms route page views are sanitized to `/letter/:token` before dispatch.

Memory Card check:

- `/app?section=memory` rendered.
- The export UI still requires a real saved Lategram or real saved Time Since counter.
- This browser had zero local saved Lategrams and zero local saved counters, so a real PNG export was not performed. No fake saved content was created.

## Supabase Verification

No Supabase schema, migration, policy, RPC, or Edge Function files were changed in this phase.

Because no Supabase files were touched, the Phase 19 implementation does not require:

- `npx supabase db reset`
- `npx supabase db lint`
- `npx supabase migration list --linked`
- `npx supabase db push --dry-run`

## Package Changes

No package dependencies were added, removed, or upgraded.

`package.json` and `package-lock.json` were not changed.

## Remaining Risks

- A real analytics provider still needs explicit deployment env configuration and a policy review before collection should be considered active.
- Provider script URL/domain choices must be reviewed before production use.
- If analytics is enabled later, verify the real provider is cookieless/privacy-respecting and update the privacy policy with provider name and purpose.
- Runtime checks used a dummy local script, not a real Plausible dashboard.
- Actual Memory Card PNG export was not re-run because no real saved source existed in this browser and fake content was intentionally not created.
- The 20 to 50 user private beta run has still not happened.
- Garden remains closed and still needs a separate safety checkpoint before any opening.
