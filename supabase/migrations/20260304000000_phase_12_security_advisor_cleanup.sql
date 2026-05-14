-- Phase 12 security advisor cleanup.
-- Drop SECURITY DEFINER-flagged Garden views. Garden public reads use the
-- get_public_garden_posts RPC as the canonical safe read surface.

DROP VIEW IF EXISTS public.public_garden_reaction_counts;
DROP VIEW IF EXISTS public.public_garden_posts;

-- Tighten SECURITY DEFINER RPC execute privileges.
-- Postgres grants EXECUTE on new functions to PUBLIC by default, so explicitly
-- remove public/anon access from RPCs that require a signed-in user.

REVOKE EXECUTE ON FUNCTION public.submit_garden_post(text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_garden_submissions() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.toggle_garden_reaction(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.report_garden_post(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_garden_reaction_state(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.submit_garden_post(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_garden_submissions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_garden_reaction(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_garden_post(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_garden_reaction_state(uuid) TO authenticated;

-- Keep approved Garden post reads intentionally public through the safe RPC.
-- This RPC returns only approved, non-deleted posts and does not expose user_id,
-- reporter_user_id, reaction identities, or moderation-private fields.

REVOKE EXECUTE ON FUNCTION public.get_public_garden_posts(text, int, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_garden_posts(text, int, timestamptz) TO anon, authenticated;
