# Phase 12: Garden Backend — Security & SQL Test Checklist

This checklist documents the security invariants that must hold for the Garden backend. These can be verified via SQL queries against a Supabase instance with the Phase 12 migrations applied:

- `supabase/migrations/20260301000000_phase_12_garden_backend.sql`
- `supabase/migrations/20260302000000_phase_12_garden_backend_cleanup.sql`

## Access Control Tests

### Pending posts are not public
```sql
-- As anon or authenticated (non-owner), this should return 0 rows:
SELECT * FROM public.get_public_garden_posts() 
WHERE id IN (SELECT id FROM garden_posts WHERE moderation_state = 'pending');
-- Expected: 0 rows (pending posts never appear in public reads)
```

### Rejected posts are not public
```sql
-- Should return 0 rows:
SELECT * FROM public.get_public_garden_posts()
WHERE id IN (SELECT id FROM garden_posts WHERE moderation_state = 'rejected');
-- Expected: 0 rows
```

### Removed/deleted posts are not public
```sql
-- Should return 0 rows:
SELECT * FROM public.get_public_garden_posts()
WHERE id IN (SELECT id FROM garden_posts WHERE deleted_at IS NOT NULL);
-- Expected: 0 rows
```

### Public API does not return user_id
```sql
-- The get_public_garden_posts function signature does not include user_id.
-- Verify by checking the function return type:
SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'get_public_garden_posts';
-- Expected: RETURNS TABLE with columns: id, body, category, anonymous_seed, created_at, reaction_count
-- No user_id column present.
```

### Public API does not return reaction user_id/fingerprints
```sql
-- toggle_garden_reaction and get_garden_reaction_state return:
-- post_id, reaction_count, viewer_has_reacted
-- No user_id or anonymous_fingerprint_hash columns.
SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'toggle_garden_reaction';
SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'get_garden_reaction_state';
```

### Report records are not public
```sql
-- As anon role, attempt to SELECT from garden_reports:
SET ROLE anon;
SELECT * FROM garden_reports;
-- Expected: ERROR or 0 rows (no SELECT policy for anon/authenticated)
RESET ROLE;
```

### Normal users cannot approve posts
```sql
-- As authenticated user, attempt to update moderation_state:
SET ROLE authenticated;
-- (with auth.uid() set to a test user)
UPDATE garden_posts SET moderation_state = 'approved' WHERE id = '<some-post-id>';
-- Expected: 0 rows updated (UPDATE policy only allows pending posts, 
-- and the INSERT policy requires moderation_state = 'pending')
RESET ROLE;
```

### Normal users cannot read all reports
```sql
-- As authenticated user:
SET ROLE authenticated;
SELECT * FROM garden_reports;
-- Expected: 0 rows (no SELECT policy on garden_reports)
RESET ROLE;
```

### Duplicate reactions are prevented
```sql
-- The UNIQUE(post_id, user_id) constraint on garden_reactions prevents duplicates.
-- The toggle_garden_reaction RPC handles this gracefully by checking existence first.
-- Direct INSERT of duplicate should fail:
INSERT INTO garden_reactions (post_id, user_id) VALUES ('<post>', '<user>');
INSERT INTO garden_reactions (post_id, user_id) VALUES ('<post>', '<user>');
-- Expected: Second INSERT fails with unique violation
```

### Reactions only allowed on approved posts
```sql
-- toggle_garden_reaction checks moderation_state = 'approved' AND deleted_at IS NULL
-- Calling with a pending post_id should raise exception:
SELECT * FROM public.toggle_garden_reaction('<pending-post-id>');
-- Expected: ERROR 'Post not found or not available'
```

### Reports only allowed on approved posts
```sql
-- report_garden_post checks moderation_state = 'approved' AND deleted_at IS NULL
SELECT * FROM public.report_garden_post('<pending-post-id>', 'spam');
-- Expected: ERROR 'Post not found or not available'
```

## Category Filtering Tests

### Category filter works
```sql
SELECT * FROM public.get_public_garden_posts(p_category := 'grief');
-- Expected: Only posts with category = 'grief' returned
```

### Category filter does not bypass moderation
```sql
-- Even with category filter, only approved posts returned:
SELECT * FROM public.get_public_garden_posts(p_category := 'grief')
WHERE id IN (SELECT id FROM garden_posts WHERE moderation_state != 'approved');
-- Expected: 0 rows
```

## Duplicate Report Prevention

```sql
-- Same user reporting same post twice should fail:
SELECT * FROM public.report_garden_post('<post-id>', 'spam');
-- First call: succeeds
SELECT * FROM public.report_garden_post('<post-id>', 'harassment');
-- Second call: ERROR 'You have already reported this post'
```

## Privacy Verification

### anonymous_fingerprint_hash never exposed
```sql
-- No RPC returns this column. Verify by checking all garden RPC signatures:
SELECT proname, pg_get_function_result(oid) 
FROM pg_proc 
WHERE proname LIKE '%garden%';
-- Expected: No function returns anonymous_fingerprint_hash
```

### Raw table SELECT revoked
```sql
-- As anon:
SET ROLE anon;
SELECT * FROM garden_posts;
-- Expected: ERROR (permission denied) or 0 rows
SELECT * FROM garden_reactions;
-- Expected: ERROR (permission denied) or 0 rows
RESET ROLE;
```

### Initial column-level Garden grants revoked
```sql
-- These should not exist for anon/authenticated after the cleanup migration:
SELECT grantee, table_name, column_name, privilege_type
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND table_name IN ('garden_posts', 'garden_reactions')
  AND grantee IN ('anon', 'authenticated')
  AND privilege_type = 'SELECT'
ORDER BY grantee, table_name, column_name;
-- Expected: 0 rows
```

### Safe public read surface remains granted
```sql
SELECT has_function_privilege(
  'anon',
  'public.get_public_garden_posts(text, int, timestamptz)',
  'EXECUTE'
) AS anon_can_execute_public_posts_rpc;

SELECT has_table_privilege('anon', 'public.public_garden_posts', 'SELECT') AS anon_can_select_safe_posts_view;
SELECT has_table_privilege('anon', 'public.public_garden_reaction_counts', 'SELECT') AS anon_can_select_safe_reaction_counts_view;
-- Expected: true for all three if the safe views are intentionally kept.
```
