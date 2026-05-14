-- Phase 12 Garden Backend cleanup
-- Forward-only hardening for raw Garden table access after the initial
-- Phase 12 backend migration. Safe public reads stay on RPCs/views.

-- Explicitly remove the column-level grants introduced by the initial schema.
-- Some Supabase/Postgres setups preserve column privileges independently of
-- broad table revokes, so keep this cleanup direct and concrete.
REVOKE SELECT (
  id,
  body,
  category,
  anonymous_seed,
  created_at,
  updated_at,
  moderation_state,
  deleted_at
)
ON public.garden_posts
FROM anon, authenticated;

REVOKE SELECT (post_id)
ON public.garden_reactions
FROM anon, authenticated;

-- Re-apply broad raw table revokes for idempotency. Public reads must not use
-- base-table SELECT grants.
REVOKE SELECT ON public.garden_posts FROM anon, authenticated;
REVOKE SELECT ON public.garden_reactions FROM anon, authenticated;

-- Re-drop the old broad public raw SELECT policies for idempotency.
DROP POLICY IF EXISTS "Anyone can view approved garden posts"
  ON public.garden_posts;

DROP POLICY IF EXISTS "Anyone can view reactions for approved posts"
  ON public.garden_reactions;

-- Keep the safe public read surface available. These do not expose user_id,
-- reporter_user_id, reaction identities, deleted rows, or rejected/private
-- moderation fields.
GRANT SELECT ON public.public_garden_posts TO anon, authenticated;
GRANT SELECT ON public.public_garden_reaction_counts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_garden_posts(text, int, timestamptz)
  TO anon, authenticated;
