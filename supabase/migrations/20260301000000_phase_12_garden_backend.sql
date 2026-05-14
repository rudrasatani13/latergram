-- Phase 12: Garden Backend V1
-- This migration hardens raw Garden table access, creates safe RPCs for
-- public approved-post reads, authenticated submission, reactions, reports,
-- and category filtering. The Garden UI remains hidden until Phase 13 safety.

-- ============================================================================
-- 1. HARDEN RAW GARDEN TABLE ACCESS
-- ============================================================================

-- Remove the broad "Anyone can view approved garden posts" SELECT policy.
-- Public reads must go through safe RPCs/views, not raw base-table queries.
DROP POLICY IF EXISTS "Anyone can view approved garden posts" ON public.garden_posts;

-- Remove the broad "Anyone can view reactions for approved posts" SELECT policy.
DROP POLICY IF EXISTS "Anyone can view reactions for approved posts" ON public.garden_reactions;

-- Revoke remaining column-level SELECT grants on garden_posts from anon/authenticated.
-- The safe public_garden_posts view and RPCs will provide read access instead.
REVOKE SELECT ON public.garden_posts FROM anon;
REVOKE SELECT ON public.garden_posts FROM authenticated;

-- Revoke remaining column-level SELECT grants on garden_reactions from anon/authenticated.
REVOKE SELECT ON public.garden_reactions FROM anon;
REVOKE SELECT ON public.garden_reactions FROM authenticated;

-- Add policy: authenticated users can SELECT their own garden posts (for "my submissions").
CREATE POLICY "Users can select own garden posts"
  ON public.garden_posts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add policy: authenticated users can SELECT their own reactions (for toggle state).
CREATE POLICY "Users can select own reactions"
  ON public.garden_reactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. RECREATE SAFE PUBLIC VIEWS (drop and recreate with proper grants)
-- ============================================================================

-- Drop existing views to recreate them with proper security.
DROP VIEW IF EXISTS public.public_garden_reaction_counts;
DROP VIEW IF EXISTS public.public_garden_posts;

-- Recreate public_garden_posts as SECURITY DEFINER function-backed view is not needed;
-- we use RPCs instead. But keep the view for simple read access with safe columns.
-- Since we revoked direct SELECT on garden_posts from anon/authenticated,
-- a SECURITY INVOKER view won't work anymore. Use SECURITY DEFINER view instead,
-- which is safe because it only exposes approved, non-deleted posts with safe columns.
CREATE OR REPLACE VIEW public.public_garden_posts
WITH (security_barrier = true)
AS
SELECT
  gp.id,
  gp.body,
  gp.category,
  gp.anonymous_seed,
  gp.created_at
FROM public.garden_posts gp
WHERE gp.moderation_state = 'approved'
  AND gp.deleted_at IS NULL;

-- Grant SELECT on the safe view to anon and authenticated.
GRANT SELECT ON public.public_garden_posts TO anon, authenticated;

-- Recreate public_garden_reaction_counts with security_barrier.
CREATE OR REPLACE VIEW public.public_garden_reaction_counts
WITH (security_barrier = true)
AS
SELECT
  gr.post_id,
  count(*)::int AS reaction_count
FROM public.garden_reactions gr
INNER JOIN public.garden_posts gp ON gr.post_id = gp.id
WHERE gp.moderation_state = 'approved'
  AND gp.deleted_at IS NULL
GROUP BY gr.post_id;

GRANT SELECT ON public.public_garden_reaction_counts TO anon, authenticated;

-- ============================================================================
-- 3. GARDEN CATEGORIES TYPE
-- ============================================================================

-- Define allowed Garden categories. Posts with unknown categories get 'other'.
-- Categories: unsent, grief, apology, gratitude, memory, hope, other
-- We enforce this in the RPC rather than a CHECK constraint for flexibility.

-- ============================================================================
-- 4. SAFE PUBLIC READ RPC: get_public_garden_posts
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_public_garden_posts(
  p_category text DEFAULT NULL,
  p_limit int DEFAULT 20,
  p_before timestamptz DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  body text,
  category text,
  anonymous_seed text,
  created_at timestamptz,
  reaction_count int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  v_limit int;
BEGIN
  -- Bound limit between 1 and 50
  v_limit := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 50);

  RETURN QUERY
  SELECT
    gp.id,
    gp.body,
    gp.category,
    gp.anonymous_seed,
    gp.created_at,
    COALESCE(rc.reaction_count, 0)::int AS reaction_count
  FROM public.garden_posts gp
  LEFT JOIN (
    SELECT gr.post_id, count(*)::int AS reaction_count
    FROM public.garden_reactions gr
    GROUP BY gr.post_id
  ) rc ON rc.post_id = gp.id
  WHERE gp.moderation_state = 'approved'
    AND gp.deleted_at IS NULL
    AND (p_category IS NULL OR gp.category = lower(trim(p_category)))
    AND (p_before IS NULL OR gp.created_at < p_before)
  ORDER BY gp.created_at DESC
  LIMIT v_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_garden_posts(text, int, timestamptz) TO anon, authenticated;

COMMENT ON FUNCTION public.get_public_garden_posts IS
  'Returns approved, non-deleted Garden posts with reaction counts. '
  'Does not expose user_id, moderation metadata, or private fields. '
  'Supports optional category filter and cursor-based pagination.';

-- ============================================================================
-- 5. GARDEN SUBMISSION RPC: submit_garden_post
-- ============================================================================

CREATE OR REPLACE FUNCTION public.submit_garden_post(
  p_body text,
  p_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  moderation_state text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
VOLATILE
AS $$
DECLARE
  v_user_id uuid;
  v_body text;
  v_category text;
  v_anonymous_seed text;
  v_id uuid;
  v_created_at timestamptz;
  v_allowed_categories text[] := ARRAY['unsent', 'grief', 'apology', 'gratitude', 'memory', 'hope', 'other'];
BEGIN
  -- Require authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- Validate and trim body
  v_body := trim(p_body);
  IF v_body IS NULL OR length(v_body) = 0 THEN
    RAISE EXCEPTION 'Body is required' USING ERRCODE = 'P0002';
  END IF;
  IF length(v_body) > 1200 THEN
    RAISE EXCEPTION 'Body exceeds maximum length of 1200 characters' USING ERRCODE = 'P0003';
  END IF;

  -- Normalize category
  IF p_category IS NOT NULL AND trim(p_category) != '' THEN
    v_category := lower(trim(p_category));
    IF length(v_category) > 50 THEN
      v_category := 'other';
    END IF;
    IF NOT (v_category = ANY(v_allowed_categories)) THEN
      v_category := 'other';
    END IF;
  ELSE
    v_category := NULL;
  END IF;

  -- Generate anonymous seed (random per post, not tied to user identity)
  v_anonymous_seed := encode(gen_random_bytes(12), 'hex');

  -- Insert the post as pending
  INSERT INTO public.garden_posts (user_id, body, category, moderation_state, anonymous_seed)
  VALUES (v_user_id, v_body, v_category, 'pending', v_anonymous_seed)
  RETURNING public.garden_posts.id, public.garden_posts.created_at
  INTO v_id, v_created_at;

  -- Return only safe fields
  RETURN QUERY SELECT v_id, 'pending'::text, v_created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_garden_post(text, text) TO authenticated;

COMMENT ON FUNCTION public.submit_garden_post IS
  'Submits a new Garden post as pending moderation. '
  'Requires authentication. Body is trimmed and length-checked. '
  'Category is normalized to allowed values. '
  'Returns only id, moderation_state, and created_at. No user_id exposed.';

-- ============================================================================
-- 6. MY SUBMISSIONS RPC: get_my_garden_submissions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_my_garden_submissions()
RETURNS TABLE (
  id uuid,
  body text,
  category text,
  moderation_state text,
  created_at timestamptz,
  approved_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  SELECT
    gp.id,
    gp.body,
    gp.category,
    gp.moderation_state,
    gp.created_at,
    gp.approved_at
  FROM public.garden_posts gp
  WHERE gp.user_id = v_user_id
    AND gp.deleted_at IS NULL
  ORDER BY gp.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_garden_submissions() TO authenticated;

COMMENT ON FUNCTION public.get_my_garden_submissions IS
  'Returns the authenticated user''s own Garden submissions with moderation state. '
  'Safe because it only returns the caller''s own posts.';

-- ============================================================================
-- 7. TOGGLE REACTION RPC: toggle_garden_reaction
-- ============================================================================

CREATE OR REPLACE FUNCTION public.toggle_garden_reaction(
  p_post_id uuid
)
RETURNS TABLE (
  post_id uuid,
  reaction_count int,
  viewer_has_reacted boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
VOLATILE
AS $$
DECLARE
  v_user_id uuid;
  v_post_exists boolean;
  v_existing_reaction_id uuid;
  v_reaction_count int;
  v_has_reacted boolean;
BEGIN
  -- Require authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- Verify post is approved and not deleted
  SELECT EXISTS(
    SELECT 1 FROM public.garden_posts gp
    WHERE gp.id = p_post_id
      AND gp.moderation_state = 'approved'
      AND gp.deleted_at IS NULL
  ) INTO v_post_exists;

  IF NOT v_post_exists THEN
    RAISE EXCEPTION 'Post not found or not available' USING ERRCODE = 'P0004';
  END IF;

  -- Check if user already reacted
  SELECT gr.id INTO v_existing_reaction_id
  FROM public.garden_reactions gr
  WHERE gr.post_id = p_post_id AND gr.user_id = v_user_id;

  IF v_existing_reaction_id IS NOT NULL THEN
    -- Remove existing reaction (toggle off)
    DELETE FROM public.garden_reactions gr WHERE gr.id = v_existing_reaction_id;
    v_has_reacted := false;
  ELSE
    -- Add new reaction (toggle on)
    INSERT INTO public.garden_reactions (post_id, user_id)
    VALUES (p_post_id, v_user_id);
    v_has_reacted := true;
  END IF;

  -- Get updated reaction count
  SELECT count(*)::int INTO v_reaction_count
  FROM public.garden_reactions gr
  WHERE gr.post_id = p_post_id;

  RETURN QUERY SELECT p_post_id, v_reaction_count, v_has_reacted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_garden_reaction(uuid) TO authenticated;

COMMENT ON FUNCTION public.toggle_garden_reaction IS
  'Toggles a "felt this" reaction on an approved Garden post. '
  'If the user has already reacted, removes the reaction. '
  'If not, adds a reaction. Returns updated count and viewer state. '
  'Does not expose any user_id or fingerprint data.';

-- ============================================================================
-- 8. GET REACTION STATE RPC: get_garden_reaction_state
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_garden_reaction_state(
  p_post_id uuid
)
RETURNS TABLE (
  post_id uuid,
  reaction_count int,
  viewer_has_reacted boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  v_user_id uuid;
  v_reaction_count int;
  v_has_reacted boolean;
BEGIN
  v_user_id := auth.uid();

  -- Get reaction count (works for anon too)
  SELECT count(*)::int INTO v_reaction_count
  FROM public.garden_reactions gr
  INNER JOIN public.garden_posts gp ON gr.post_id = gp.id
  WHERE gr.post_id = p_post_id
    AND gp.moderation_state = 'approved'
    AND gp.deleted_at IS NULL;

  -- Check if authenticated user has reacted
  IF v_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.garden_reactions gr
      WHERE gr.post_id = p_post_id AND gr.user_id = v_user_id
    ) INTO v_has_reacted;
  ELSE
    v_has_reacted := false;
  END IF;

  RETURN QUERY SELECT p_post_id, v_reaction_count, v_has_reacted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_garden_reaction_state(uuid) TO anon, authenticated;

COMMENT ON FUNCTION public.get_garden_reaction_state IS
  'Returns reaction count and whether the authenticated caller has reacted. '
  'Safe for anon callers (viewer_has_reacted will be false). '
  'Does not expose user_id or fingerprint data.';

-- ============================================================================
-- 9. REPORT RPC: report_garden_post
-- ============================================================================

CREATE OR REPLACE FUNCTION public.report_garden_post(
  p_post_id uuid,
  p_reason text,
  p_details text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  status text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
VOLATILE
AS $$
DECLARE
  v_user_id uuid;
  v_post_exists boolean;
  v_reason text;
  v_details text;
  v_id uuid;
  v_created_at timestamptz;
  v_duplicate boolean;
  v_allowed_reasons text[] := ARRAY['inappropriate', 'harmful', 'spam', 'harassment', 'self_harm', 'other'];
BEGIN
  -- Require authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- Verify post is approved and not deleted
  SELECT EXISTS(
    SELECT 1 FROM public.garden_posts gp
    WHERE gp.id = p_post_id
      AND gp.moderation_state = 'approved'
      AND gp.deleted_at IS NULL
  ) INTO v_post_exists;

  IF NOT v_post_exists THEN
    RAISE EXCEPTION 'Post not found or not available' USING ERRCODE = 'P0004';
  END IF;

  -- Validate reason
  v_reason := lower(trim(p_reason));
  IF v_reason IS NULL OR length(v_reason) = 0 THEN
    RAISE EXCEPTION 'Reason is required' USING ERRCODE = 'P0005';
  END IF;
  IF NOT (v_reason = ANY(v_allowed_reasons)) THEN
    v_reason := 'other';
  END IF;

  -- Validate details (optional, length-limited)
  IF p_details IS NOT NULL THEN
    v_details := trim(p_details);
    IF length(v_details) > 1000 THEN
      v_details := left(v_details, 1000);
    END IF;
    IF length(v_details) = 0 THEN
      v_details := NULL;
    END IF;
  ELSE
    v_details := NULL;
  END IF;

  -- Check for duplicate open/reviewing report from same user on same post
  SELECT EXISTS(
    SELECT 1 FROM public.garden_reports gr
    WHERE gr.post_id = p_post_id
      AND gr.reporter_user_id = v_user_id
      AND gr.status IN ('open', 'reviewing')
  ) INTO v_duplicate;

  IF v_duplicate THEN
    RAISE EXCEPTION 'You have already reported this post' USING ERRCODE = 'P0006';
  END IF;

  -- Insert report
  INSERT INTO public.garden_reports (post_id, reporter_user_id, reason, details, status)
  VALUES (p_post_id, v_user_id, v_reason, v_details, 'open')
  RETURNING public.garden_reports.id, public.garden_reports.created_at
  INTO v_id, v_created_at;

  -- Also log a safety event for audit
  INSERT INTO public.safety_events (actor_user_id, target_type, target_id, event_type, severity, notes)
  VALUES (v_user_id, 'garden_post', p_post_id, 'report_created', 'low', v_reason);

  -- Return only safe fields
  RETURN QUERY SELECT v_id, 'open'::text, v_created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.report_garden_post(uuid, text, text) TO authenticated;

COMMENT ON FUNCTION public.report_garden_post IS
  'Reports an approved Garden post. Requires authentication. '
  'Prevents duplicate open reports from the same user on the same post. '
  'Logs a safety event for audit. Returns only report id, status, and created_at. '
  'Does not expose reporter_user_id publicly.';

-- ============================================================================
-- 10. ADDITIONAL INDEXES FOR GARDEN BACKEND PERFORMANCE
-- ============================================================================

-- Index for efficient user reaction lookups (toggle/state checks)
CREATE INDEX IF NOT EXISTS idx_garden_reactions_user_id
  ON public.garden_reactions(user_id);

-- Index for efficient duplicate report checks
CREATE INDEX IF NOT EXISTS idx_garden_reports_reporter_post
  ON public.garden_reports(reporter_user_id, post_id)
  WHERE status IN ('open', 'reviewing');

-- Index for category filtering on approved posts
CREATE INDEX IF NOT EXISTS idx_garden_posts_category_approved
  ON public.garden_posts(category, created_at DESC)
  WHERE moderation_state = 'approved' AND deleted_at IS NULL;

-- ============================================================================
-- 11. SECURITY NOTES (as SQL comments for documentation)
-- ============================================================================

-- SECURITY CHECKLIST:
-- [x] Pending posts are NOT returned by get_public_garden_posts (WHERE moderation_state = 'approved')
-- [x] Rejected posts are NOT returned by get_public_garden_posts
-- [x] Removed/deleted posts are NOT returned (WHERE deleted_at IS NULL)
-- [x] Public API does NOT return user_id (not in RETURNS TABLE columns)
-- [x] Public API does NOT return reaction user_id/fingerprints
-- [x] Report records are NOT publicly readable (no SELECT policy, RPC returns only own report result)
-- [x] Normal users cannot approve posts (no UPDATE policy for moderation_state changes to 'approved')
-- [x] Normal users cannot read all reports (no SELECT policy on garden_reports for non-owners)
-- [x] Duplicate reactions are prevented (UNIQUE constraint + toggle logic)
-- [x] Reactions only allowed on approved posts (checked in toggle_garden_reaction)
-- [x] Reports only allowed on approved posts (checked in report_garden_post)
-- [x] anonymous_fingerprint_hash is never exposed in any RPC response
-- [x] rejected_at, deleted_at, reviewer data never exposed in public RPCs
-- [x] Category filter does not bypass moderation state check
