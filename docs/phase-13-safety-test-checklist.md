# Phase 13: Safety and Moderation Test Checklist

This checklist is the source-of-truth verification list for:

- `supabase/migrations/20260515121701_phase_13_safety_moderation.sql`
- `supabase/functions/report-letter/index.ts`

## Local Code Checks

Run:

```bash
npm run build
deno check supabase/functions/report-letter/index.ts
deno check supabase/functions/send-due-late-letters/index.ts
deno check supabase/functions/open-letter/index.ts
deno check supabase/functions/recipient-opt-out/index.ts
git diff --check
```

Search for fake Garden/report/reaction content:

```bash
rg -n "fake Garden|fake reaction|fake report" src README.md docs supabase
```

Search for forbidden phase wording in product UI:

```bash
rg -n "Phase 13|Phase 12|moderation phase|safety phase|backend phase|coming in Phase" src/app
```

Expected:

- build passes
- changed Edge Functions type-check
- no fake content claims
- no internal phase copy in user-facing UI

## Migration Apply

Remote apply requires a linked project plus `SUPABASE_DB_PASSWORD`.

```bash
supabase migration list --linked
supabase db push
supabase migration list --linked
```

Expected:

- `20260515121701_phase_13_safety_moderation.sql` appears locally and remotely
- no history drift remains

If local Docker-backed Supabase is available, also run:

```bash
supabase start
supabase db reset
supabase db lint
```

## Function Deploy

Deploy the new public recipient safety function:

```bash
supabase functions deploy report-letter
```

Recommended full function deploy pass after migration:

```bash
supabase functions deploy send-due-late-letters
supabase functions deploy open-letter
supabase functions deploy resend-webhook
supabase functions deploy recipient-opt-out
supabase functions deploy report-letter
```

## Schema Verification

Confirm tables exist:

```sql
select to_regclass('public.moderators') as moderators_table;
select to_regclass('public.content_filter_terms') as content_filter_terms_table;
select to_regclass('public.action_rate_limits') as action_rate_limits_table;
select to_regclass('public.letter_safety_reports') as letter_safety_reports_table;
select to_regclass('public.recipient_sender_blocks') as recipient_sender_blocks_table;
```

Expected:

- every query returns the matching table name, not `null`

Confirm new columns:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'garden_reports'
  and column_name in ('reviewer_user_id', 'resolution_notes')
order by column_name;
```

Expected:

- `reviewer_user_id`
- `resolution_notes`

Confirm RPCs exist:

```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'get_my_moderator_role',
    'get_garden_moderation_queue',
    'moderate_garden_post',
    'get_garden_reports_queue',
    'resolve_garden_report',
    'submit_garden_post',
    'report_my_late_letter'
  )
order by routine_name;
```

## Grant Verification

Garden anon access should remain locked:

```sql
select
  has_function_privilege('anon', 'public.get_public_garden_posts(text, int, timestamptz)', 'EXECUTE') as anon_public_posts,
  has_function_privilege('anon', 'public.submit_garden_post(text, text)', 'EXECUTE') as anon_submit,
  has_function_privilege('anon', 'public.get_my_garden_submissions()', 'EXECUTE') as anon_my_submissions,
  has_function_privilege('anon', 'public.toggle_garden_reaction(uuid)', 'EXECUTE') as anon_toggle,
  has_function_privilege('anon', 'public.get_garden_reaction_state(uuid)', 'EXECUTE') as anon_reaction_state,
  has_function_privilege('anon', 'public.report_garden_post(uuid, text, text)', 'EXECUTE') as anon_report;
```

Expected:

- all `false`

Authenticated access should exist for safety-hardened Garden RPCs:

```sql
select
  has_function_privilege('authenticated', 'public.get_public_garden_posts(text, int, timestamptz)', 'EXECUTE') as auth_public_posts,
  has_function_privilege('authenticated', 'public.submit_garden_post(text, text)', 'EXECUTE') as auth_submit,
  has_function_privilege('authenticated', 'public.get_my_garden_submissions()', 'EXECUTE') as auth_my_submissions,
  has_function_privilege('authenticated', 'public.toggle_garden_reaction(uuid)', 'EXECUTE') as auth_toggle,
  has_function_privilege('authenticated', 'public.get_garden_reaction_state(uuid)', 'EXECUTE') as auth_reaction_state,
  has_function_privilege('authenticated', 'public.report_garden_post(uuid, text, text)', 'EXECUTE') as auth_report,
  has_function_privilege('authenticated', 'public.get_garden_moderation_queue(int)', 'EXECUTE') as auth_mod_queue,
  has_function_privilege('authenticated', 'public.moderate_garden_post(uuid, text, text)', 'EXECUTE') as auth_moderate,
  has_function_privilege('authenticated', 'public.get_garden_reports_queue(int)', 'EXECUTE') as auth_report_queue,
  has_function_privilege('authenticated', 'public.resolve_garden_report(uuid, text, text)', 'EXECUTE') as auth_resolve_report;
```

Expected:

- all `true`

Raw Garden tables should remain blocked:

```sql
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'garden_posts',
    'garden_reactions',
    'garden_reports',
    'moderators',
    'content_filter_terms',
    'action_rate_limits',
    'letter_safety_reports',
    'recipient_sender_blocks'
  )
  and grantee in ('anon', 'authenticated')
order by grantee, table_name, privilege_type;
```

Expected:

- no unsafe `SELECT`/`INSERT`/`UPDATE`/`DELETE` grants on the safety tables
- no raw base-table public Garden read grants

## Moderator Role Simulation

Use test UUIDs and JWT claim simulation in SQL sessions.

Example setup:

```sql
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user-a@example.com', crypt('password', gen_salt('bf')), now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'moderator@example.com', crypt('password', gen_salt('bf')), now(), now(), now())
on conflict (id) do nothing;

insert into public.moderators (user_id, role)
values ('22222222-2222-2222-2222-222222222222', 'admin')
on conflict (user_id) do update set role = excluded.role;
```

Switch to a normal authenticated user:

```sql
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
```

Switch to a moderator:

```sql
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
```

## Abuse-Cycle Tests

### 1. Safe submission becomes pending

As normal authenticated user:

```sql
select *
from public.submit_garden_post(
  'I wish I had said goodbye more gently.',
  'grief'
);
```

Expected:

- one row
- `moderation_state = 'pending'`

### 2. Block obvious violations

```sql
select *
from public.submit_garden_post(
  'Call me at 555-111-2222.',
  'other'
);
```

Expected:

- exception
- matching `garden_post_blocked` event in `public.safety_events`

### 3. Rate limit repeated submissions

Run the safe submission six times within the same hour as the same user.

Expected:

- first five succeed
- sixth raises the rate-limit exception
- a `garden_submission_rate_limited` event is inserted

### 4. Non-moderator cannot open moderation queue

As normal authenticated user:

```sql
select * from public.get_garden_moderation_queue(20);
```

Expected:

- exception: moderator access required

### 5. Moderator can approve a safe post

As moderator:

```sql
select *
from public.get_garden_moderation_queue(20);

select *
from public.moderate_garden_post('<pending-post-uuid>', 'approve', 'safe reflective post');
```

Expected:

- queue returns the pending post
- moderation decision returns `approved`

### 6. Approved post appears in authenticated safe read

As authenticated user:

```sql
select *
from public.get_public_garden_posts(null, 20, null)
where id = '<approved-post-uuid>';
```

Expected:

- one row

### 7. Reject unsafe content

As moderator:

```sql
select *
from public.moderate_garden_post('<pending-post-uuid>', 'reject', 'targeted harassment');
```

Expected:

- `moderation_state = 'rejected'`
- rejected post absent from `get_public_garden_posts`

### 8. Report approved post

As authenticated non-moderator:

```sql
select *
from public.report_garden_post('<approved-post-uuid>', 'harassment', 'targeted at a real person');
```

Expected:

- one row
- report `status = 'open'`

### 9. Duplicate report is prevented

```sql
select *
from public.report_garden_post('<approved-post-uuid>', 'spam', 'duplicate report');
```

Expected:

- exception: already reported

### 10. Moderator resolves report and removes post

As moderator:

```sql
select *
from public.get_garden_reports_queue(20);

select *
from public.resolve_garden_report('<report-uuid>', 'resolved', 'valid report');

select *
from public.moderate_garden_post('<approved-post-uuid>', 'remove', 'privacy violation');
```

Expected:

- report appears in queue
- report resolves cleanly
- post moves to `removed`
- removed post no longer appears in `get_public_garden_posts`

### 11. Reaction rules remain honest

As authenticated user:

```sql
select *
from public.toggle_garden_reaction('<approved-post-uuid>');
```

Expected:

- succeeds only on approved posts
- second call toggles back off

### 12. Recipient report flow

Deploy `report-letter`, send a real Late Letter, open `/letter/:token`, then call:

```bash
curl -i \
  -X POST "https://<project-ref>.supabase.co/functions/v1/report-letter" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<raw-open-token>",
    "reason": "unwanted",
    "details": "Please review this letter.",
    "block_sender": true
  }'
```

Expected:

- `200 OK`
- row inserted into `public.letter_safety_reports`
- matching row inserted or already present in `public.recipient_sender_blocks`
- `late_letter_report_created` safety event exists

### 13. Sender report flow

As the sending authenticated user:

```sql
select *
from public.report_my_late_letter(
  '<late-letter-uuid>',
  'privacy',
  'Please review this delivery.'
);
```

Expected:

- one row
- `status = 'open'`

## Regression Checks

Verify these unchanged flows after migration apply:

- sign in / sign out
- Phase 9 private Lategram save/load
- Phase 9 Time Since save/load
- Phase 10 Late Letter scheduling
- Phase 11 `send-due-late-letters`
- Phase 11 `/letter/:token`
- Phase 11 `recipient-opt-out`
- Garden closed placeholder still visible in product UI

## Security Advisor

Before marking Phase 13 complete on a real project:

```bash
supabase db advisors --linked -o json | jq '[.[] | select(.level=="ERROR")]'
supabase db advisors --linked -o json | jq '[.[] | select(.level=="WARN")]'
```

Expected:

- no relevant `ERROR` entries
- any remaining `WARN` entries documented honestly

Phase 13-specific note:

- the repo intentionally keeps anonymous Garden execution locked
- current remote linked project already reports no `ERROR` rows before Phase 13 apply
- leaked password protection is still a dashboard-level `WARN` until enabled
