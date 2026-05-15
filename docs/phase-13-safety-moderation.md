# Phase 13: Safety and Moderation

## Overview

Phase 13 adds the minimum real safety foundation Latergram needs before the Garden can be opened.

This work does **not** blindly make the Garden public. The product UI remains closed. Anonymous public Garden browsing remains locked. The backend now has the moderation, filtering, rate-limiting, and reporting primitives needed for a deliberate future opening.

Phase 13 assets:

- Migration: `supabase/migrations/20260515121701_phase_13_safety_moderation.sql`
- New recipient safety function: `supabase/functions/report-letter/index.ts`

## Product State After This Phase

- The Garden product UI still says: `The Garden is not open yet.`
- Garden posts are reviewed before they are shown.
- Anonymous execution for Garden read/report/reaction RPCs remains locked.
- Authenticated execution is restored only for the safety-hardened Garden RPCs.
- Moderator-only queue/review RPCs now exist.
- Sender cancellation remains available before send.
- After a Late Letter is sent, it cannot be recalled.
- Recipients can report a letter without an account.
- Recipients can block future letters from the same sender without exposing sender identity.
- Global recipient opt-out still exists.

## New Database Objects

Added tables:

- `public.moderators`
- `public.content_filter_terms`
- `public.action_rate_limits`
- `public.letter_safety_reports`
- `public.recipient_sender_blocks`

Updated tables:

- `public.garden_reports`
  - `reviewer_user_id`
  - `resolution_notes`

Added or updated RPCs:

- `public.get_my_moderator_role()`
- `public.get_garden_moderation_queue(p_limit int default 50)`
- `public.moderate_garden_post(p_post_id uuid, p_decision text, p_reason text default null)`
- `public.get_garden_reports_queue(p_limit int default 50)`
- `public.resolve_garden_report(p_report_id uuid, p_status text, p_resolution_notes text default null)`
- `public.submit_garden_post(p_body text, p_category text default null)` now includes filtering and rate limiting
- `public.report_my_late_letter(p_late_letter_id uuid, p_reason text, p_details text default null)`

## Moderator / Admin Model

Moderator membership is table-backed and managed manually through SQL for now.

Table:

```sql
select user_id, role, created_at, created_by
from public.moderators
order by created_at desc;
```

Add a moderator or admin:

```sql
insert into public.moderators (user_id, role, created_by)
values ('<user-uuid>', 'admin', '<your-user-uuid>')
on conflict (user_id) do update
set role = excluded.role,
    created_by = excluded.created_by;
```

Check your current role:

```sql
select public.get_my_moderator_role();
```

Normal users cannot grant themselves moderator access. There are no public read policies on `public.moderators`.

## Garden Moderation Criteria

Approve posts when they are:

- emotional, reflective, and non-targeted
- non-identifying
- free of harassment, threats, and private contact details
- not promotional or spammy

Reject or remove posts when they contain:

- harassment or targeted shaming
- threats or incitement
- hate or slurs
- explicit self-harm instructions or suicide encouragement
- sexual exploitation or anything involving minors
- doxxing, private personal information, or contact information
- spam, scams, or promotion
- attempts to identify or attack a real person
- repeated abuse
- illegal content

Important product truth:

Latergram is not therapy and does not promise healing, closure, forgiveness, or crisis support.

## Garden Submission Filtering

`submit_garden_post` now applies server-side checks before insert.

Guaranteed checks:

- body is trimmed
- empty body is rejected
- body over 1200 characters is rejected
- category is normalized to the allowed list
- email addresses are blocked
- URLs are blocked
- phone-number-like strings are blocked
- obvious block/flag terms are checked from `public.content_filter_terms`

Behavior:

- block matches stop the insert and write a `safety_events` record
- flag matches still insert the post as `pending` and write a `garden_post_flagged` event
- the post body is not duplicated into safety logs

This is intentionally basic filtering. It reduces obvious abuse. It does not replace human moderation.

## Garden Rate Limiting

Current enforced limit:

- `5` Garden submissions per authenticated user per hour

Current storage:

- `public.action_rate_limits`

Current limitation:

- Garden submission IP rate limiting is **not** implemented yet
- pure SQL RPCs do not safely know the client IP
- the schema now has `ip_hash` support for future server-side enforcement

## Garden Access Model

Garden UI status:

- closed

RPC execution status:

- `get_public_garden_posts`: `authenticated` only
- `submit_garden_post`: `authenticated` only
- `get_my_garden_submissions`: `authenticated` only
- `toggle_garden_reaction`: `authenticated` only
- `get_garden_reaction_state`: `authenticated` only
- `report_garden_post`: `authenticated` only
- moderator queue/review RPCs: `authenticated` plus moderator/admin role check
- `anon` Garden execution remains revoked

Privacy rules still enforced:

- no public response exposes `user_id`
- no public response exposes `reporter_user_id`
- no public response exposes `anonymous_fingerprint_hash`
- raw base-table Garden reads remain blocked

## Garden Moderation Workflow

Read pending queue:

```sql
select *
from public.get_garden_moderation_queue(50);
```

Approve a post:

```sql
select *
from public.moderate_garden_post('<post-uuid>', 'approve', 'reflective and non-targeted');
```

Reject a post:

```sql
select *
from public.moderate_garden_post('<post-uuid>', 'reject', 'contains targeted harassment');
```

Remove a post:

```sql
select *
from public.moderate_garden_post('<post-uuid>', 'remove', 'contains private identifying information');
```

Read report queue:

```sql
select *
from public.get_garden_reports_queue(50);
```

Mark a report as reviewing:

```sql
select *
from public.resolve_garden_report('<report-uuid>', 'reviewing', 'checking context');
```

Resolve or dismiss a report:

```sql
select *
from public.resolve_garden_report('<report-uuid>', 'resolved', 'post removed separately');

select *
from public.resolve_garden_report('<report-uuid>', 'dismissed', 'no policy violation found');
```

If a report is valid and the post should disappear, use `moderate_garden_post(..., 'remove', ...)` as an explicit second step.

## Late Letter Safety

### Sender protection

Sender rules are now explicit:

- before send: the sender can cancel
- after send: the letter cannot be recalled
- authenticated senders can create a real safety report via `public.report_my_late_letter(...)`

Example:

```sql
select *
from public.report_my_late_letter(
  '<late-letter-uuid>',
  'privacy',
  'The delivery should not continue.'
);
```

### Recipient protection

Recipient protections now include:

- existing global email-hash opt-out
- new sender-specific future-send block through `public.recipient_sender_blocks`
- new account-free recipient report flow through `report-letter`

The recipient report flow uses the secure open token server-side. It does not expose raw token hashes, sender identity, or raw recipient email in the report table.

The delivery job now checks:

- `public.recipient_opt_outs`
- `public.recipient_sender_blocks`

If the recipient blocked this sender, the letter fails safely before send with:

- `Recipient blocked future letters from this sender.`

## Letter Safety Review

Letter reports are intentionally DB-first in this phase. There is no internal moderator page yet.

Review open letter reports:

```sql
select
  id,
  late_letter_id,
  sender_user_id,
  reporter_role,
  recipient_email_hash,
  reason,
  details,
  status,
  created_at
from public.letter_safety_reports
where status in ('open', 'reviewing')
order by created_at asc;
```

Resolve or dismiss a letter report:

```sql
update public.letter_safety_reports
set
  status = 'resolved',
  reviewer_user_id = '<moderator-user-uuid>',
  reviewed_at = coalesce(reviewed_at, now()),
  resolved_at = now(),
  resolution_notes = 'reviewed and handled'
where id = '<letter-report-uuid>';
```

## Safety Events

Phase 13 writes audit events such as:

- `garden_post_blocked`
- `garden_post_flagged`
- `garden_submission_rate_limited`
- `garden_post_approved`
- `garden_post_rejected`
- `garden_post_removed`
- `garden_report_reviewing`
- `garden_report_resolved`
- `garden_report_dismissed`
- `late_letter_report_created`
- `late_letter_sender_blocked`

Inspect recent events:

```sql
select actor_user_id, target_type, target_id, event_type, severity, notes, created_at
from public.safety_events
order by created_at desc
limit 100;
```

## Intentional Limitations After Phase 13

- The Garden product UI is still closed.
- Anonymous public Garden browsing is still locked.
- There is no moderator web UI yet.
- Letter safety review is still manual SQL work.
- Garden submission IP rate limiting is not implemented yet.
- Basic filtering is intentionally conservative and incomplete.

That is deliberate. This phase builds the real safety foundation first, without pretending the public Garden launch decision has already been made.
