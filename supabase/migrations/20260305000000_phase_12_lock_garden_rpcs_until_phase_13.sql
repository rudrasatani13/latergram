-- Phase 12 security advisor cleanup.
-- Garden product UI is closed until Phase 13 safety/moderation.
-- Lock exposed SECURITY DEFINER Garden RPCs until they are intentionally
-- reopened/redesigned during Phase 13.

REVOKE EXECUTE ON FUNCTION public.get_public_garden_posts(text, int, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_garden_post(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_garden_submissions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.toggle_garden_reaction(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_garden_reaction_state(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.report_garden_post(uuid, text, text) FROM PUBLIC, anon, authenticated;
