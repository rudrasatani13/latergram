# Phase 11: Real Letter Delivery

## What This Adds

Phase 11 connects account-backed Late Letter records to real email delivery through Resend and Supabase Edge Functions.

Scheduled letters can now be picked up by a protected server job, sent through Resend, opened through a secure recipient link, updated from real database/provider events, and cancelled before sending.

This phase does not make delivery guaranteed. It does not guarantee that a recipient read the letter. "Opened" means the secure Latergram recipient page was opened, not that the recipient emotionally read or understood the letter.

## Provider

Email provider: Resend.

Resend is used only in Supabase Edge Function code. The Vite frontend never imports the Resend SDK and never sees `RESEND_API_KEY`.

`RESEND_FROM_EMAIL` must be a sender/domain verified in Resend. Do not use `onboarding@resend.dev` for production.

## Server-Side Architecture

Added Supabase Edge Functions:

- `send-due-late-letters`: protected delivery job for due scheduled letters.
- `open-letter`: public recipient-token validation endpoint used by `/letter/:token`.
- `resend-webhook`: Resend webhook receiver with signature verification and event dedupe.
- `recipient-opt-out`: public endpoint that hashes a submitted email and blocks future sends to that hash.

Added shared Edge Function helpers:

- `supabase/functions/_shared/late-letter-shared.ts`

Added function configuration:

- `supabase/config.toml`

The public functions have `verify_jwt = false` because recipients and Resend webhooks do not have signed-in Latergram sessions. The functions enforce their own security: cron secret for delivery, token hash for opening, Resend webhook signature for webhooks, and service-role-only database access inside Edge Functions.

## Environment Variables

Client Vite env templates stay limited to:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Server-only Edge Function env template:

- `supabase/functions/.env.example`

Required server-only variables:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_WEBHOOK_SECRET`
- `APP_PUBLIC_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:

- `LETTER_DELIVERY_BATCH_SIZE`
- `LETTER_DELIVERY_CRON_SECRET`

`RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` must only live in Supabase Edge Function secrets or a local, ignored `supabase/functions/.env` file. They must not be added to Vite env files and must not be committed.

## Database Changes

Migration:

- `supabase/migrations/0002_phase_11_late_letter_delivery.sql`

Adds to `late_letters`:

- `delivery_attempted_at`
- `delivered_at`
- `bounced_at`
- `provider_event_last_seen_at`

Adds:

- `resend_webhook_events`

`resend_webhook_events` stores `svix_id` with a unique constraint for webhook idempotency, event type, Resend email id, optional Late Letter id, receipt timestamp, and the payload. RLS is enabled and no public policies are added. Frontend code does not read this table.

The existing `recipient_opt_outs` table is reused. Recipient emails are normalized and hashed server-side before insert/check. Plain opt-out email is not stored.

The migration also tightens `late_letters` RLS so authenticated frontend clients can insert only draft/scheduled rows and can update pending rows only into cancelled state. Resend/provider/open statuses are server-controlled through Edge Functions.

## Delivery Job

`send-due-late-letters`:

1. Requires `LETTER_DELIVERY_CRON_SECRET`.
2. Accepts the secret via `x-latergram-cron-secret` or `Authorization: Bearer <secret>`.
3. Queries a small batch of due rows:
   - `status = scheduled`
   - `scheduled_for <= now()`
   - `deleted_at IS NULL`
   - `cancelled_at IS NULL`
4. Checks recipient opt-out hash before sending.
5. Marks each eligible row as `sending` before calling Resend.
6. Generates a crypto-safe random open token.
7. Stores only `secure_open_token_hash` using SHA-256.
8. Sends email through `resend.emails.send`.
9. Uses a Resend idempotency key based on Late Letter id and scheduled timestamp.
10. On success, stores:
    - `status = sent`
    - `sent_at`
    - `delivery_provider = resend`
    - `delivery_provider_message_id`
11. On failure, stores:
    - `status = failed`
    - `failed_at`
    - safe `failure_reason`

The function returns:

- `checked`
- `sent`
- `failed`
- `skipped`

The function does not log message bodies, full recipient emails, raw tokens, token hashes, or service keys.

## Cron Setup

This repo does not pretend cron is already running.

Production options:

- Supabase Scheduled Functions / dashboard scheduling if enabled for the project.
- External cron hitting:

```text
https://<project-ref>.supabase.co/functions/v1/send-due-late-letters
```

Use:

```text
x-latergram-cron-secret: <LETTER_DELIVERY_CRON_SECRET>
```

or:

```text
Authorization: Bearer <LETTER_DELIVERY_CRON_SECRET>
```

Recommended cadence: every 1 to 5 minutes for launch testing, with `LETTER_DELIVERY_BATCH_SIZE` set to `10` or `25`.

## Secure Open Links

Open link format:

```text
APP_PUBLIC_URL + "/letter/" + token
```

The raw token exists only in the emailed link. The database stores only `secure_open_token_hash`.

Recipient page:

- Route: `/letter/:token`
- Component: `src/app/pages/RecipientLetterPage.tsx`
- Data function: `src/app/db/recipientLetters.ts`
- Server validation: `open-letter`

The frontend recipient page does not query private database tables directly.

`open-letter` returns only:

- `body`
- `subject`
- `recipient_name`
- `sent_at`
- `opened_at`

It does not return:

- sender `user_id`
- recipient email
- masked recipient email
- provider message id
- failure reason
- secure token hash

If the token is valid and the letter is sent, `open-letter` sets `opened_at` if it is null and updates `status` to `opened`. Reusing the same token shows the same letter without changing the first open timestamp.

Invalid, cancelled, failed, deleted, or not-yet-sent letters return gentle unavailable states.

## Webhooks

`resend-webhook` verifies the Resend signature with the raw request body and `RESEND_WEBHOOK_SECRET`.

It uses:

- `svix-id`
- `svix-timestamp`
- `svix-signature`

Processed `svix-id` values are inserted into `resend_webhook_events`. Duplicate `svix-id` values return success without reprocessing.

Webhook matching uses:

```text
late_letters.delivery_provider_message_id = event.data.email_id
```

It does not match by recipient email.

Handled events:

- `email.sent`: confirms sent state only if the row is still `sending` or `sent`.
- `email.delivered`: stores `delivered_at`; UI still does not show "Delivered".
- `email.failed`: marks `status = failed`.
- `email.bounced`: marks `status = failed`, stores `bounced_at`, and safe failure reason.
- `email.complained`: records a safety event and updates provider event timestamp.
- `email.opened`: records provider event timestamp only. It does not set Latergram opened status because provider open tracking can be unreliable.
- `email.clicked`, `email.delivery_delayed`, `email.suppressed`: stores provider event timestamp.

Raw webhook payloads are not exposed to frontend code.

## Cancellation

Sender cancellation remains available only for:

- `draft`
- `scheduled`

Cancellation sets:

- `status = cancelled`
- `cancelled_at`

The delivery job skips cancelled rows. Sending, sent, opened, failed, and cancelled letters cannot be cancelled from the sender UI.

## Sender UI Status Rules

`LateLettersView` shows only status backed by database state:

| Database status | Sender label | Meaning |
| --- | --- | --- |
| `scheduled` | Scheduled | The record exists and can still be cancelled before sending. |
| `sending` | Sending... | The server job has marked the row for provider send. |
| `sent` | Sent | Resend send succeeded and `sent_at` / provider message id were stored. |
| `opened` | Opened | The secure recipient page was opened and `opened_at` was stored. |
| `failed` | Failed | Send, bounce, opt-out, or safety failure was stored. |
| `cancelled` | Cancelled | Sender cancelled before delivery. |

The sender UI does not show full recipient email, provider message id, raw webhook data, raw failure logs, or raw token data.

## Recipient Safety

Email and recipient page copy include:

```text
If this feels unwanted, you can ignore it.
```

The recipient page includes a real opt-out form. The recipient enters an email, `recipient-opt-out` hashes the normalized address server-side, and future delivery checks block sends to that hash.

Current opt-out scope is global by recipient email hash. Per-sender blocking and reporting remain Phase 13 safety work before public launch.

## What Remains Not Live

- Garden posting, reactions, reports, moderation UI, or public Garden launch.
- Memory Card export/download/share.
- Analytics.
- Payments.
- AI.
- Guaranteed delivery.
- Guaranteed reads.
- Sender notifications.
- Provider-open-based read receipts.
- Public support/admin review UI for recipient reports.

## Local Development Testing

The Supabase CLI was not installed in this local environment during implementation, so Edge Functions were type-checked with Deno directly.

Install Supabase CLI before local Edge Function serving:

```bash
npm install
supabase start
supabase db reset
supabase functions serve --env-file supabase/functions/.env
```

Deploy function secrets:

```bash
supabase secrets set --env-file supabase/functions/.env
```

Deploy functions:

```bash
supabase functions deploy send-due-late-letters
supabase functions deploy open-letter
supabase functions deploy resend-webhook
supabase functions deploy recipient-opt-out
```

Manual end-to-end test plan:

1. Create a signed-in scheduled Late Letter a few minutes in the future.
2. Wait until it is due.
3. Invoke `send-due-late-letters` with `LETTER_DELIVERY_CRON_SECRET`.
4. Confirm Resend sends the email.
5. Confirm `late_letters.status = sent`.
6. Confirm `sent_at` is set.
7. Confirm `delivery_provider_message_id` is set.
8. Open the `/letter/:token` link from the email.
9. Confirm the recipient page shows the letter.
10. Confirm `opened_at` is set and `status = opened`.
11. Refresh sender UI and confirm it shows Opened.
12. Create another scheduled letter and cancel it before due time.
13. Invoke the delivery job after the cancelled time.
14. Confirm the cancelled letter is not sent.
15. Visit an invalid `/letter/not-a-real-token` URL and confirm unavailable state.
16. POST a webhook with an invalid signature and confirm it is rejected.
17. Replay a real webhook event and confirm duplicate `svix-id` is ignored.
18. Submit the recipient opt-out form, schedule a letter to the same email, run delivery, and confirm it is not sent.

## Build Result

Implementation validation:

- `deno check supabase/functions/send-due-late-letters/index.ts`
- `deno check supabase/functions/open-letter/index.ts`
- `deno check supabase/functions/resend-webhook/index.ts`
- `deno check supabase/functions/recipient-opt-out/index.ts`
- `deno fmt --check supabase/functions`
- `npx --package typescript tsc --noEmit`
- `npm run build`
- `git diff --check`
- `npm audit --omit=dev`
- targeted secret/user-facing wording scans
- local browser smoke check for `/letter/not-a-real-token` and `/app?section=later`

Result: all commands passed. Vite reported the existing production chunk-size warning after a successful build.
