# Supabase Configuration

This directory contains the database migrations, Edge Function configuration, and deployment notes needed for the Latergram backend.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed.
- Docker installed and running (for local development).

## Applying Migrations

### Local Environment
To spin up a local instance of Supabase and apply all migrations:
```bash
supabase start
```
To reset your local database and re-apply all migrations from scratch:
```bash
supabase db reset
```

### Remote Environments (Production)
**WARNING:** Production migrations should be treated with caution. Rollbacks are not automatically handled by pushing forward migrations; ensure your database is backed up before applying.
```bash
supabase link --project-ref <your-project-id>
supabase db push
```

## Edge Functions

Phase 11 adds Supabase Edge Functions for real Late Letter delivery:

- `functions/send-due-late-letters`
- `functions/open-letter`
- `functions/resend-webhook`
- `functions/recipient-opt-out`
- `functions/_shared`

Function auth behavior is configured in `supabase/config.toml`.

`send-due-late-letters`, `open-letter`, `resend-webhook`, and `recipient-opt-out` use `verify_jwt = false` because cron callers, Resend webhooks, and letter recipients do not have a signed-in Latergram session. The functions enforce security themselves through a cron secret, secure token hash, webhook signature verification, and service-role-only server access.

### Server-Only Environment Variables

Use `supabase/functions/.env.example` as the placeholder template.

Required:

```text
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_WEBHOOK_SECRET=
APP_PUBLIC_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional:

```text
LETTER_DELIVERY_CRON_SECRET=
LETTER_DELIVERY_BATCH_SIZE=
```

These are server-only values. Do not add them to Vite `VITE_` env vars. Do not commit real values.

For local function serving:

```bash
supabase functions serve --env-file supabase/functions/.env
```

For remote secrets:

```bash
supabase secrets set --env-file supabase/functions/.env
```

### Deploying Functions

```bash
supabase functions deploy send-due-late-letters
supabase functions deploy open-letter
supabase functions deploy resend-webhook
supabase functions deploy recipient-opt-out
```

### Delivery Cron

Schedule a POST request to:

```text
https://<project-ref>.supabase.co/functions/v1/send-due-late-letters
```

Include either:

```text
x-latergram-cron-secret: <LETTER_DELIVERY_CRON_SECRET>
```

or:

```text
Authorization: Bearer <LETTER_DELIVERY_CRON_SECRET>
```

The job sends a bounded batch of due `scheduled` Late Letters, skips cancelled/deleted/future rows, marks rows `sending` before provider send, stores the real Resend message id on success, and marks safe failure reasons on failure.

The Phase 11 migration also tightens `late_letters` RLS: authenticated clients can insert draft/scheduled rows and cancel pending rows, but they cannot set `sent`, `opened`, provider ids, or secure token hashes through the frontend anon client.

### Resend Webhook

Register this endpoint in Resend:

```text
https://<project-ref>.supabase.co/functions/v1/resend-webhook
```

Subscribe to at least:

- `email.sent`
- `email.delivered`
- `email.failed`
- `email.bounced`
- `email.complained`

`email.opened` may be subscribed for audit timestamp only. Latergram's `opened` sender status is set by the secure recipient page, not by the email pixel event.

The webhook handler verifies the raw body with `RESEND_WEBHOOK_SECRET`, dedupes by `svix-id`, and matches letters by `delivery_provider_message_id`, never by recipient email.

## Security Requirements

- **Authentication:** Must be configured in the Supabase Dashboard.
- **RLS (Row Level Security):** RLS is enabled across all sensitive tables.
- **Service Role:** The Supabase Service Role key should **never** be used in the client application. The client must only interact with the database using the anon key and authenticated sessions, relying on RLS policies.
- **Edge Functions:** The service-role key is allowed only inside Supabase Edge Function secrets for delivery jobs, recipient token validation, webhook processing, and recipient opt-out hashing. Never import it into frontend code.
- **Phase 9 Frontend Usage**: The frontend actively uses the `private_lategrams` and `time_since_counters` tables for signed-in users using the `anon` key. Local data import is strictly explicit. No automatic localStorage migration occurs.
- **Phase 11 Frontend Usage:** The frontend reads Late Letter sender rows through the anon client and RLS, but it only selects masked recipient email and real status timestamps. Recipient `/letter/:token` pages call `open-letter` and do not query private tables directly.
- **Public Garden Access:** Must use safe views (`public_garden_posts`, `public_garden_reaction_counts`) or RPCs, not raw base-table access. Do not expose `user_id` or reaction fingerprints from public Garden reads.
- **Webhook Events:** `resend_webhook_events` has RLS enabled and no public policies. Webhook payloads must not be exposed through frontend reads.
