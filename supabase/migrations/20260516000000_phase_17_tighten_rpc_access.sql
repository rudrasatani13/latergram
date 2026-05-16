-- Phase 17: Tighten SECURITY DEFINER function access
-- Addresses Supabase linter warnings about authenticated SECURITY DEFINER functions.
--
-- Strategy:
-- 1. Garden user-facing RPCs: revoke from authenticated (Garden UI is closed).
-- 2. Moderator-only RPCs: keep authenticated access (internal moderator check is the security boundary).
-- 3. Revoke from PUBLIC and anon on all functions (defense in depth).
-- 4. report_my_late_letter and get_my_moderator_role: keep authenticated (legitimate user access).

-- Revoke from PUBLIC and anon on all flagged functions
REVOKE EXECUTE ON FUNCTION public.get_garden_moderation_queue(int) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_garden_reports_queue(int) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.moderate_garden_post(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.resolve_garden_report(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_moderator_role() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.report_my_late_letter(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_public_garden_posts(text, int, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_garden_post(text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_garden_submissions() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.toggle_garden_reaction(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_garden_reaction_state(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.report_garden_post(uuid, text, text) FROM PUBLIC, anon;

-- Re-lock Garden user-facing RPCs (Garden UI remains closed)
REVOKE EXECUTE ON FUNCTION public.get_public_garden_posts(text, int, timestamptz) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_garden_post(text, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_garden_submissions() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.toggle_garden_reaction(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_garden_reaction_state(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.report_garden_post(uuid, text, text) FROM authenticated;

-- Keep authenticated access for:
-- get_garden_moderation_queue (internal moderator check)
-- get_garden_reports_queue (internal moderator check)
-- moderate_garden_post (internal moderator check)
-- resolve_garden_report (internal moderator check)
-- get_my_moderator_role (returns caller's own role, safe)
-- report_my_late_letter (user reports their own received letter)
