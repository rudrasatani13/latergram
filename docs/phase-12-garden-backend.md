# Phase 12: Garden Backend V1

## Overview

Phase 12 builds the real backend infrastructure for The Garden — Latergram's anonymous emotional sharing space. The Garden product UI remains closed/unavailable until Phase 13 safety and moderation work is complete. The app may show a closed Garden placeholder, but it does not show public Garden posts or expose posting, reactions, or reports in the product UI.

After this phase:
- Garden backend exists and is real.
- Authenticated users can submit Garden posts into pending moderation state.
- Approved posts can be read through the safe public RPC.
- "Felt this" reactions work with duplicate prevention.
- Reports can be created safely.
- Category filtering is real.
- No user identity leaks through public Garden responses.

## Migration

**Primary file:** `supabase/migrations/20260301000000_phase_12_garden_backend.sql`

**Cleanup file:** `supabase/migrations/20260302000000_phase_12_garden_backend_cleanup.sql`

**Security Advisor cleanup file:** `supabase/migrations/20260304000000_phase_12_security_advisor_cleanup.sql`

### What the migration does:

1. **Hardens raw table access** — Drops broad SELECT policies on `garden_posts` and `garden_reactions`. Revokes direct SELECT grants from anon/authenticated on base tables. Public reads must go through safe RPCs or views.

2. **Uses RPC-only public reads** — `get_public_garden_posts` is the canonical safe public read surface. The older public Garden views were dropped in `20260304000000_phase_12_security_advisor_cleanup.sql` to avoid SECURITY DEFINER view warnings.

3. **Creates RPCs:**
   - `get_public_garden_posts(p_category, p_limit, p_before)` — Safe public read
   - `submit_garden_post(p_body, p_category)` — Authenticated submission
   - `get_my_garden_submissions()` — Own submissions list
   - `toggle_garden_reaction(p_post_id)` — Felt-this toggle
   - `get_garden_reaction_state(p_post_id)` — Reaction count + viewer state
   - `report_garden_post(p_post_id, p_reason, p_details)` — Report creation

4. **Adds indexes** for reaction lookups, duplicate report checks, and category filtering.

The cleanup migration explicitly revokes the old column-level grants from the initial schema:
- `garden_posts`: `id`, `body`, `category`, `anonymous_seed`, `created_at`, `updated_at`, `moderation_state`, `deleted_at`
- `garden_reactions`: `post_id`

It also repeats broad raw table revokes and drops the old broad public raw SELECT policies idempotently. The Security Advisor cleanup migration drops the old Garden views and keeps the safe public read RPC.

## Backend APIs / RPCs

### get_public_garden_posts

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| p_category | text | NULL | Filter by category (optional) |
| p_limit | int | 20 | Max results (bounded 1–50) |
| p_before | timestamptz | NULL | Cursor for pagination |

**Returns:** id, body, category, anonymous_seed, created_at, reaction_count

**Access:** anon, authenticated

**Rules:**
- Only returns `moderation_state = 'approved'` posts
- Only returns posts where `deleted_at IS NULL`
- Does NOT return user_id, rejected_at, deleted_at, or moderation metadata
- Category filter does not bypass moderation check

### submit_garden_post

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| p_body | text | required | Post body (max 1200 chars) |
| p_category | text | NULL | Category (normalized to allowed list) |

**Returns:** id, moderation_state ('pending'), created_at

**Access:** authenticated only

**Rules:**
- Body is trimmed and length-validated
- Category normalized to: unsent, grief, apology, gratitude, memory, hope, other
- Unknown categories become 'other'
- Posts always start as 'pending' — never auto-approved
- anonymous_seed is generated randomly per post (not tied to user identity)
- Does NOT return user_id

### get_my_garden_submissions

**Returns:** id, body, category, moderation_state, created_at, approved_at

**Access:** authenticated only

**Rules:**
- Returns only the caller's own posts
- Excludes soft-deleted posts
- Safe because it only shows own data

### toggle_garden_reaction

| Parameter | Type | Description |
|-----------|------|-------------|
| p_post_id | uuid | The post to react to |

**Returns:** post_id, reaction_count, viewer_has_reacted

**Access:** authenticated only

**Rules:**
- Only works on approved, non-deleted posts
- If user already reacted → removes reaction (toggle off)
- If user has not reacted → adds reaction (toggle on)
- Duplicate prevention via UNIQUE(post_id, user_id) constraint
- Does NOT expose any user_id or fingerprint data

### get_garden_reaction_state

| Parameter | Type | Description |
|-----------|------|-------------|
| p_post_id | uuid | The post to check |

**Returns:** post_id, reaction_count, viewer_has_reacted

**Access:** anon, authenticated

**Rules:**
- Returns count for approved posts only
- viewer_has_reacted is false for anonymous callers
- Does NOT expose user_id or fingerprint data

### report_garden_post

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| p_post_id | uuid | required | Post to report |
| p_reason | text | required | Reason (from allowed list) |
| p_details | text | NULL | Optional details (max 1000 chars) |

**Returns:** id, status ('open'), created_at

**Access:** authenticated only

**Rules:**
- Only works on approved, non-deleted posts
- Reason normalized to: inappropriate, harmful, spam, harassment, self_harm, other
- Prevents duplicate open/reviewing reports from same user on same post
- Logs a safety_event for audit
- Does NOT expose reporter_user_id publicly
- Report records are NOT publicly readable

## Tables Used

- `garden_posts` — Main post storage with moderation state
- `garden_reactions` — Reaction records with UNIQUE(post_id, user_id)
- `garden_reports` — Report records (private, no public SELECT)
- `safety_events` — Audit log for report creation

## Category Filtering

**Allowed categories:** unsent, grief, apology, gratitude, memory, hope, other

- Input is normalized to lowercase and trimmed
- Unknown categories become 'other'
- Category max length: 50 characters
- Category filter in `get_public_garden_posts` does not bypass moderation state
- NULL category means "all categories"

## Anonymity Guarantees

- No public RPC returns `user_id`
- No public RPC returns `reporter_user_id`
- No public RPC returns `anonymous_fingerprint_hash`
- No public RPC returns `rejected_at`, `deleted_at`, or moderation reviewer data
- `anonymous_seed` is a random value generated per post, not derived from user identity
- Reaction toggle returns only count and boolean state, never user lists

## RLS / Grants Overview

- Raw SELECT on `garden_posts` revoked from anon/authenticated
- Raw SELECT on `garden_reactions` revoked from anon/authenticated
- Own-row SELECT RLS policies for garden_posts and garden_reactions remain defined, but raw base-table SELECT grants are not restored
- Own submission and reaction state reads should use the safe RPCs
- Authenticated users can INSERT pending garden_posts (existing policy preserved)
- Authenticated users can INSERT reactions on approved posts (existing policy preserved)
- Authenticated users can INSERT reports (existing policy preserved)
- No public SELECT policy on garden_reports
- Safe views granted SELECT to anon/authenticated
- RPCs use SECURITY DEFINER with pinned search_path for safe access

## What Remains Not Live

- The Garden product UI is closed/unavailable
- The app may show a closed Garden placeholder
- No public Garden browsing experience exists
- Garden posts are not shown in the product UI
- No Garden posting, reactions, or reporting are visible in the product UI
- No real Garden posts are shown in the product UI
- Posts are never auto-approved
- No moderation queue or admin UI exists yet

## Why Garden UI Remains Closed

The Garden is a public anonymous emotional space. Public anonymous spaces attract abuse. The Garden will not launch until Phase 13 safety and moderation infrastructure is complete. This is a deliberate product safety decision documented in the master plan.

## Phase 13 Safety Dependencies

Before the Garden can go live, Phase 13 must implement:
- Moderation queue and review UI
- Content filtering / automated safety checks
- Rate limiting for submissions
- Report review workflow
- Admin safety tools
- Criteria for approval/rejection
- Abuse prevention measures

## Frontend Data Layer

**File:** `src/app/db/garden.ts`

Provides typed functions matching all RPCs:
- `listPublicGardenPosts({ category, limit, before })`
- `submitGardenPost({ body, category })`
- `toggleGardenReaction(postId)`
- `getGardenReactionState(postId)`
- `reportGardenPost({ postId, reason, details })`
- `listMyGardenSubmissions()`

All functions:
- Use the Supabase anon client (no service-role key)
- Handle missing env gracefully
- Return friendly error messages
- Use RPC calls (no raw table queries)
- Are NOT wired into any public UI

## Manual Test Checklist

### Submission
- [ ] Authenticated user can call `submit_garden_post` and get back id + 'pending' state
- [ ] Unauthenticated call to `submit_garden_post` fails with auth error
- [ ] Empty body is rejected
- [ ] Body over 1200 chars is rejected
- [ ] Unknown category is normalized to 'other'

### Public Reads
- [ ] `get_public_garden_posts` returns only approved, non-deleted posts
- [ ] Pending posts do NOT appear in public reads
- [ ] Rejected posts do NOT appear in public reads
- [ ] Deleted posts do NOT appear in public reads
- [ ] No user_id in response
- [ ] Category filter works correctly
- [ ] Limit is bounded (max 50)
- [ ] Pagination via p_before works

### Reactions
- [ ] Authenticated user can toggle reaction on approved post
- [ ] Second toggle removes the reaction
- [ ] Reaction on pending/rejected/deleted post fails
- [ ] Unauthenticated toggle fails
- [ ] Reaction count is accurate
- [ ] No user_id exposed in reaction response

### Reports
- [ ] Authenticated user can report an approved post
- [ ] Duplicate report from same user on same post is prevented
- [ ] Report on pending/rejected/deleted post fails
- [ ] Unauthenticated report fails
- [ ] No reporter_user_id in response
- [ ] Safety event is logged

### Access Control
- [ ] Direct SELECT on garden_posts from anon client returns nothing (revoked)
- [ ] Direct SELECT on garden_reactions from anon client returns nothing (revoked)
- [ ] garden_reports has no public SELECT policy
- [ ] Normal users cannot UPDATE moderation_state to 'approved'
- [ ] `get_public_garden_posts` returns only approved posts with safe columns

## Build Result

Run `npm run build` to verify no TypeScript errors were introduced.
