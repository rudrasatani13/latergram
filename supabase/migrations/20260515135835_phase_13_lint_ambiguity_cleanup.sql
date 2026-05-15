-- Phase 13 cleanup: fix PL/pgSQL ambiguous id references reported by
-- supabase db lint in moderator RPCs.
--
-- These functions return TABLE columns named id/status/etc, so UPDATE
-- predicates must qualify table columns explicitly.

CREATE OR REPLACE FUNCTION public.moderate_garden_post(
  p_post_id uuid,
  p_decision text,
  p_reason text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  moderation_state text,
  approved_at timestamptz,
  rejected_at timestamptz,
  deleted_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
VOLATILE
AS $$
DECLARE
  v_actor_user_id uuid;
  v_role text;
  v_decision text;
  v_reason text;
  v_now timestamptz;
  v_event_type text;
BEGIN
  v_actor_user_id := auth.uid();
  v_role := public.get_my_moderator_role();

  IF v_actor_user_id IS NULL OR v_role IS NULL THEN
    RAISE EXCEPTION 'Moderator access required' USING ERRCODE = 'P0010';
  END IF;

  v_decision := lower(trim(COALESCE(p_decision, '')));

  IF v_decision NOT IN ('approve', 'reject', 'remove') THEN
    RAISE EXCEPTION 'Decision must be approve, reject, or remove' USING ERRCODE = 'P0011';
  END IF;

  v_reason := NULLIF(trim(COALESCE(p_reason, '')), '');

  IF v_reason IS NOT NULL THEN
    v_reason := left(v_reason, 1000);
  END IF;

  v_now := pg_catalog.now();

  PERFORM 1
  FROM public.garden_posts gp
  WHERE gp.id = p_post_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Garden post not found' USING ERRCODE = 'P0012';
  END IF;

  IF v_decision = 'approve' THEN
    UPDATE public.garden_posts AS gp
    SET
      moderation_state = 'approved',
      approved_at = v_now,
      rejected_at = NULL,
      deleted_at = NULL
    WHERE gp.id = p_post_id;

    v_event_type := 'garden_post_approved';

  ELSIF v_decision = 'reject' THEN
    UPDATE public.garden_posts AS gp
    SET
      moderation_state = 'rejected',
      approved_at = NULL,
      rejected_at = v_now
    WHERE gp.id = p_post_id;

    v_event_type := 'garden_post_rejected';

  ELSE
    UPDATE public.garden_posts AS gp
    SET
      moderation_state = 'removed',
      deleted_at = v_now
    WHERE gp.id = p_post_id;

    v_event_type := 'garden_post_removed';
  END IF;

  INSERT INTO public.safety_events (
    actor_user_id,
    target_type,
    target_id,
    event_type,
    severity,
    notes
  )
  VALUES (
    v_actor_user_id,
    'garden_post',
    p_post_id,
    v_event_type,
    'medium',
    v_reason
  );

  RETURN QUERY
  SELECT
    gp.id,
    gp.moderation_state,
    gp.approved_at,
    gp.rejected_at,
    gp.deleted_at
  FROM public.garden_posts gp
  WHERE gp.id = p_post_id;
END;
$$;

REVOKE ALL ON FUNCTION public.moderate_garden_post(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_garden_post(uuid, text, text) TO authenticated;

COMMENT ON FUNCTION public.moderate_garden_post IS
  'Moderator-only Garden decision RPC. Approves, rejects, or removes a post and writes a safety event.';


CREATE OR REPLACE FUNCTION public.resolve_garden_report(
  p_report_id uuid,
  p_status text,
  p_resolution_notes text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  post_id uuid,
  status text,
  reviewed_at timestamptz,
  resolved_at timestamptz,
  resolution_notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
VOLATILE
AS $$
DECLARE
  v_actor_user_id uuid;
  v_role text;
  v_status text;
  v_notes text;
  v_post_id uuid;
  v_now timestamptz;
  v_event_type text;
BEGIN
  v_actor_user_id := auth.uid();
  v_role := public.get_my_moderator_role();

  IF v_actor_user_id IS NULL OR v_role IS NULL THEN
    RAISE EXCEPTION 'Moderator access required' USING ERRCODE = 'P0010';
  END IF;

  v_status := lower(trim(COALESCE(p_status, '')));

  IF v_status NOT IN ('reviewing', 'resolved', 'dismissed') THEN
    RAISE EXCEPTION 'Status must be reviewing, resolved, or dismissed' USING ERRCODE = 'P0013';
  END IF;

  v_notes := NULLIF(trim(COALESCE(p_resolution_notes, '')), '');

  IF v_notes IS NOT NULL THEN
    v_notes := left(v_notes, 1000);
  END IF;

  v_now := pg_catalog.now();

  SELECT gr.post_id
  INTO v_post_id
  FROM public.garden_reports gr
  WHERE gr.id = p_report_id
  FOR UPDATE;

  IF v_post_id IS NULL THEN
    RAISE EXCEPTION 'Garden report not found' USING ERRCODE = 'P0014';
  END IF;

  UPDATE public.garden_reports AS gr_update
  SET
    status = v_status,
    reviewer_user_id = v_actor_user_id,
    reviewed_at = COALESCE(gr_update.reviewed_at, v_now),
    resolved_at = CASE
      WHEN v_status IN ('resolved', 'dismissed') THEN v_now
      ELSE NULL
    END,
    resolution_notes = v_notes
  WHERE gr_update.id = p_report_id;

  v_event_type := CASE v_status
    WHEN 'reviewing' THEN 'garden_report_reviewing'
    WHEN 'resolved' THEN 'garden_report_resolved'
    ELSE 'garden_report_dismissed'
  END;

  INSERT INTO public.safety_events (
    actor_user_id,
    target_type,
    target_id,
    event_type,
    severity,
    notes
  )
  VALUES (
    v_actor_user_id,
    'garden_report',
    p_report_id,
    v_event_type,
    'medium',
    v_notes
  );

  RETURN QUERY
  SELECT
    gr.id,
    gr.post_id,
    gr.status,
    gr.reviewed_at,
    gr.resolved_at,
    gr.resolution_notes
  FROM public.garden_reports gr
  WHERE gr.id = p_report_id;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_garden_report(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_garden_report(uuid, text, text) TO authenticated;

COMMENT ON FUNCTION public.resolve_garden_report IS
  'Moderator-only Garden report resolution RPC. Post removal remains an explicit separate moderation action.';
