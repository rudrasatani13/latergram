# Phase 15: Performance and Error Handling

Date: 2026-05-15

## Summary

Phase 15 focused on making Latergram safer to trust with real emotional content before beta use. The work adds clearer loading, disabled, error, retry, offline, draft recovery, refresh safety, and crash fallback behavior without adding fake content or opening unavailable products.

No Supabase migrations were added. Garden remains closed in the product UI. Memory Cards remain unavailable. No fake Garden posts, fake reactions, fake letters, fake counters, fake card previews, fake analytics, or fake success behavior were added.

## Async Flows Audited

- Auth sign in, sign up, sign out, and password reset.
- Auth initialization when Supabase env/config is missing or unreachable.
- Private Lategram account load, create, remove, refresh, and local-to-account import.
- Local device Lategram save, draft save/restore/clear, and copy.
- Time Since account/local create and delete.
- Late Letter account load, schedule, cancel, sender report, and retry.
- Recipient letter open/load for `/letter/:token`.
- Recipient letter report and sender block.
- Recipient global opt-out.
- Garden closed UI.
- Memory Cards unavailable UI.
- Supabase helper calls in `privateLategrams`, `timeSinceCounters`, `lateLetters`, `recipientLetters`, and account hooks.

## Loading States Fixed

- Account auth actions now keep form controls disabled while requests are in flight and surface the returned user-facing error copy.
- The writer disables account save while account save is in flight.
- Time Since create/delete now has saving/removing states for account and local paths.
- Keepsake Box refresh, account deletion, and local-to-account import now show in-progress states and avoid duplicate actions.
- Late Letter schedule, cancel, list retry, and sender report now disable controls while requests are active.
- Recipient report, sender block, and global opt-out controls are disabled during submission.
- Recipient letter opening has an explicit loading state and retry button for connection/server failures.

## Error States Fixed

- Shared reliability helpers now distinguish offline-looking failures from general connection failures.
- Account saves do not pretend to succeed while offline. Copy says the account was not changed and, where relevant, that local/page content remains available.
- Supabase account load helpers return calm product copy without exposing raw technical details to users.
- Recipient report/opt-out helpers catch thrown function invocation failures and return honest failure copy.
- Auth initialization catches `getSession` failures so the app does not remain stuck on a loading screen.
- Late Letter invalid date/time handling now rejects impossible date rollovers and explains when the date/time is not real.

## Offline and Draft Recovery Behavior

- The writer restores the current local draft on refresh if one exists.
- The writer auto-saves current writing, recipient label, subject, destination, and timestamp to the existing local draft slot after edits.
- The writer shows subtle states such as "Saving draft locally", "Draft saved locally on this device", "Draft restored from this device", and "Unable to save draft locally".
- Clearing the writer also attempts to clear the local draft and reports if that local delete fails.
- Signed-in users can still have a local draft. Nothing auto-migrates into account storage.
- Scheduling or account save still requires an explicit user action. No send, schedule, import, or account save happens automatically.

## Refresh Testing Notes

The route shell was updated with lazy route loading and an app-level error boundary. The app should no longer show a blank white screen for unexpected render errors; the fallback does not include private content and links back to `/app`.

Routes covered by the Phase 15 audit:

- `/`
- `/auth`
- `/app`
- `/app?section=private`
- `/app?section=time`
- `/app?section=later`
- `/app?section=garden`
- `/app?section=memory`
- `/letter/not-a-real-token`

Refresh-sensitive states:

- `/app` restores a saved local draft in the writer.
- `/app?section=private` reloads local archive data from device storage and account data from Supabase when signed in.
- `/app?section=later` reloads account-backed Late Letters and shows honest account-required states when signed out or unconfigured.
- `/letter/not-a-real-token` shows an unavailable invalid-link state instead of crashing.

## Performance and Asset Notes

- Route pages are now lazily loaded with React `lazy`/`Suspense`.
- Vite manual chunks split Supabase, React, and remaining UI/runtime dependencies so the previous single large app chunk warning is removed.
- `DiaryComposer` no longer mounts the full account-archive hook just to save one account Lategram, avoiding an unnecessary account archive fetch in the writer.
- Account hooks use `session.user.id` as the stable refresh dependency instead of the whole session object.
- Decorative images in background petals, diary frames, and shared empty states now use lazy decoding/loading where safe.
- Asset audit found product runtime assets remain local under `/assets`. No raw GitHub runtime asset dependency was introduced.
- Current local asset size is about 3.4 MB under `public/assets`; no new heavy runtime assets were added.

## Keepsake Large-Content Notes

- Keepsake Box Lategrams and counters now render an initial 12 real items with a real "show more" control.
- The "show more" copy reflects real loaded item counts and does not fake totals.
- Destination filters, account/device tabs, deletion confirmations, full-detail view, and empty states remain intact.
- Local and account archives remain separate. Private content is not copied into Garden, Memory Cards, or other sections.

## Late Letters Reliability Notes

- Schedule form controls disable during save, and failed schedule attempts leave the draft visible.
- Cancellation has a per-letter in-progress state and only updates UI after the database-backed cancel succeeds.
- Sender status labels remain database-backed only.
- Recipient email remains masked after save through `recipient_email_masked`.
- No fake delivered/opened status is shown.
- Impossible date/time values and past schedules are rejected before insert.

## Recipient Letter Reliability Notes

- `/letter/:token` has explicit opening/loading state.
- Invalid/expired/unavailable token states do not show sender identity or raw recipient email.
- Server/connection failures offer a retry action.
- Report and block sender submission states are disabled while saving.
- Global email opt-out validates through the Edge Function and does not pretend to succeed on failure.

## Garden and Memory Cards

- Garden remains closed/unavailable in product UI.
- Anonymous public Garden browsing remains unavailable.
- No Garden posting, reaction, report, or fake post UI was added.
- No Garden RPC grants or migrations were changed.
- Memory Cards remain unavailable.
- No preview cards, generation, download, share, export, or source selection was added.

## Commands Run

Baseline before changes:

```bash
git status --short
git log --oneline -5
npm install
npm run build
```

Results:

- `git status --short`: clean before edits.
- `git log --oneline -5`: latest commit was `6f260b6 feat: phase 14 mobile polish`.
- `npm install`: up to date.
- Initial `npm run build`: passed, with Vite large chunk warning.

Verification after implementation:

```bash
npm run build
```

Results:

- Build passed.
- Vite large chunk warning was removed after route lazy loading and manual vendor chunks.
- No Supabase migrations/schema/functions/policies were changed, so `npx supabase db lint` was not required.

## Known Remaining Risks

- Manual offline testing depends on browser devtools/network conditions; the code paths now return honest offline/connection messages, but a real multi-browser beta pass is still needed.
- Local draft recovery depends on `localStorage`; private browsing, storage quota, or browser settings can still block local persistence.
- Delivery reliability still depends on correctly configured Supabase Edge Function secrets, Resend, and the external delivery job. Phase 15 improves surfaced UI states but does not guarantee delivery.
- Garden and Memory Cards are intentionally unavailable and require later phases before public/product use.
