# Phase 10: Late Letters Scheduling V1

## What This Adds

Phase 10 adds real account-backed Late Letter scheduling records for signed-in users. A signed-in user can enter recipient details, write a letter, choose a future date and time, and save a row in the `late_letters` table.

This is scheduling storage only. Email delivery is not connected yet.

## Database Table Used

The flow uses the existing `late_letters` table from `supabase/migrations/00_initial_schema.sql`.

The frontend uses the Supabase anon client and the signed-in user's session. It does not use a service-role key. Access remains RLS-compatible and scoped to the current user's rows.

## Files Added

- `src/app/db/lateLetters.ts`
- `src/app/db/useLateLetters.ts`
- `src/app/utils/emailMasking.ts`
- `docs/phase-10-late-letters-scheduling.md`

## Files Updated

- `src/app/components/diary/LateLettersView.tsx`
- `README.md`

## Compose Form Fields

The signed-in compose flow includes:

- Recipient name, optional.
- Recipient email, required.
- Subject, optional.
- Message body, required.
- Scheduled delivery date, required.
- Scheduled delivery time, required.

Signed-out users cannot schedule a Late Letter and are shown the sign-in prompt.

## Validation Rules

The UI validates before insert:

- Recipient email is required.
- Recipient email must look like an email address.
- Message body is required.
- Date and time are required.
- The selected date and time must be in the future.

Validation errors are shown inline. Browser alerts are not used.

## Recipient Email Masking

Recipient email is sensitive PII.

The database insert stores:

- `recipient_email`: the real email, needed for future delivery.
- `recipient_email_masked`: a masked display version.

Saved-letter UI uses only `recipient_email_masked`. The data layer does not select `recipient_email` back into saved-letter UI records after saving.

Masking examples:

- `a@x.com` becomes `a***@x.com`
- `rudra@example.com` becomes `r****@example.com`
- `hello.world@gmail.com` becomes `h*********@gmail.com`

Recipient email is not stored in localStorage and is not logged to the console.

## Scheduled Record Behavior

Creating a Late Letter inserts a real `late_letters` row with:

- `status = scheduled`
- `scheduled_for` as an ISO timestamp
- `recipient_email_masked`
- no delivery provider
- no delivery provider message id
- no secure open token hash
- no `sent_at`
- no `opened_at`

The UI says delivery is not connected yet.

## Cancellation Behavior

Users can cancel their own `draft` or `scheduled` records.

Cancellation sets:

- `status = cancelled`
- `cancelled_at = now`

Cancellation uses a two-step UI confirmation. It does not delete the record by default.

## Status Honesty Rules

The Phase 10 UI creates only `scheduled` records and allows `cancelled` records.

If other statuses exist from future or manual database work, the UI displays the database status without pretending Phase 11 delivery is live.

The UI does not show recipient open links, delivery provider data, or fake tracking data.

## Not Live

The following remain intentionally not live:

- Email provider integration.
- Email sending.
- Scheduled jobs or cron.
- Secure recipient open links.
- Recipient letter pages.
- Sent, delivered, or opened tracking.
- Garden posting, reactions, or reports frontend.
- Memory Card export.
- Analytics.
- Payments.
- AI.

## Existing Behavior Preserved

Phase 10 does not change:

- Account-backed private Lategrams.
- Account-backed Time Since counters.
- Signed-out local save behavior.
- Explicit localStorage import behavior.
- Current local storage key meanings.
- Keep Private account/device archive behavior.

## Build Result

`npm run build` passes.
