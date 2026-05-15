-- Phase 13: Safety and Moderation
-- Build the minimum real safety foundation required before the Garden is
-- opened to users. The Garden UI remains closed by default after this
-- migration; anonymous public Garden access stays locked.

-- ============================================================================
-- 1. MODERATOR / ADMIN MODEL
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.moderators (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('moderator', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.moderators ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.moderators FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.moderators IS
  'Manual moderator/admin membership for Garden moderation and safety review.';

CREATE OR REPLACE FUNCTION public.get_my_moderator_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  v_user_id uuid;
  v_role text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT m.role
  INTO v_role
  FROM public.moderators m
  WHERE m.user_id = v_user_id
  LIMIT 1;

  RETURN v_role;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_moderator_role() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_moderator_role() TO authenticated;

COMMENT ON FUNCTION public.get_my_moderator_role IS
  'Returns the caller''s moderator role (moderator/admin) or NULL.';

-- ============================================================================
-- 2. CONTENT FILTER CONFIG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.content_filter_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  category text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  action text NOT NULL CHECK (action IN ('flag', 'block')),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_filter_terms ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.content_filter_terms FROM PUBLIC, anon, authenticated;

CREATE UNIQUE INDEX IF NOT EXISTS idx_content_filter_terms_term_lower
  ON public.content_filter_terms ((lower(term)));

CREATE INDEX IF NOT EXISTS idx_content_filter_terms_enabled_action
  ON public.content_filter_terms (enabled, action, severity);

INSERT INTO public.content_filter_terms (term, category, severity, action)
VALUES
  ('kill yourself', 'self_harm', 'high', 'block'),
  ('kys', 'self_harm', 'high', 'block'),
  ('i will kill you', 'threat', 'high', 'block'),
  ('i''m going to kill you', 'threat', 'high', 'block'),
  ('shoot up', 'violent_threat', 'high', 'block'),
  ('address is', 'doxxing', 'medium', 'flag'),
  ('phone number', 'contact_info', 'medium', 'flag'),
  ('call me at', 'contact_info', 'medium', 'flag'),
  ('text me at', 'contact_info', 'medium', 'flag'),
  ('dm me', 'contact_info', 'medium', 'flag')
ON CONFLICT ((lower(term))) DO NOTHING;

COMMENT ON TABLE public.content_filter_terms IS
  'Manual server-side Garden content filter terms. Basic filtering only; human review still required.';

-- ============================================================================
-- 3. RATE LIMIT TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.action_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_hash text,
  window_start timestamptz NOT NULL,
  count int NOT NULL DEFAULT 1 CHECK (count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.action_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.action_rate_limits FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS update_action_rate_limits_updated_at ON public.action_rate_limits;
CREATE TRIGGER update_action_rate_limits_updated_at
BEFORE UPDATE ON public.action_rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE UNIQUE INDEX IF NOT EXISTS idx_action_rate_limits_action_user_window
  ON public.action_rate_limits (action, user_id, window_start)
  WHERE user_id IS NOT NULL AND ip_hash IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_action_rate_limits_action_ip_window
  ON public.action_rate_limits (action, ip_hash, window_start)
  WHERE ip_hash IS NOT NULL;

COMMENT ON TABLE public.action_rate_limits IS
  'Tracks backend action counts. Phase 13 enforces Garden per-user limits and prepares for future IP-hash limits.';

-- ============================================================================
-- 4. GARDEN REPORT REVIEW COLUMNS
-- ============================================================================

ALTER TABLE public.garden_reports
  ADD COLUMN IF NOT EXISTS reviewer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resolution_notes text;

CREATE INDEX IF NOT EXISTS idx_garden_reports_status_created_at
  ON public.garden_reports (status, created_at DESC);

-- ============================================================================
-- 5. LATE LETTER SAFETY TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.letter_safety_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  late_letter_id uuid REFERENCES public.late_letters(id) ON DELETE SET NULL,
  sender_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_role text NOT NULL CHECK (reporter_role IN ('sender', 'recipient')),
  recipient_email_hash text,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  reviewer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  resolved_at timestamptz
);

ALTER TABLE public.letter_safety_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.letter_safety_reports FROM PUBLIC, anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_letter_safety_reports_status_created_at
  ON public.letter_safety_reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_letter_safety_reports_letter_id
  ON public.letter_safety_reports (late_letter_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_letter_safety_reports_sender_dedupe
  ON public.letter_safety_reports (late_letter_id, reporter_user_id)
  WHERE reporter_role = 'sender'
    AND reporter_user_id IS NOT NULL
    AND status IN ('open', 'reviewing');

CREATE UNIQUE INDEX IF NOT EXISTS idx_letter_safety_reports_recipient_dedupe
  ON public.letter_safety_reports (late_letter_id, recipient_email_hash)
  WHERE reporter_role = 'recipient'
    AND recipient_email_hash IS NOT NULL
    AND status IN ('open', 'reviewing');

CREATE TABLE IF NOT EXISTS public.recipient_sender_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email_hash text NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sender_user_id, recipient_email_hash)
);

ALTER TABLE public.recipient_sender_blocks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.recipient_sender_blocks FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.letter_safety_reports IS
  'Sender and recipient safety reports for Late Letters. Raw recipient emails are not stored here.';

COMMENT ON TABLE public.recipient_sender_blocks IS
  'Recipient-level future-send blocks scoped to a specific sender user.';

-- ============================================================================
-- 6. MODERATION QUEUE RPCS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_garden_moderation_queue(
  p_limit int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  body text,
  category text,
  created_at timestamptz,
  moderation_state text,
  open_report_count int,
  safety_flag_count int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  v_role text;
  v_limit int;
BEGIN
  v_role := public.get_my_moderator_role();
  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Moderator access required' USING ERRCODE = 'P0010';
  END IF;

  v_limit := LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100);

  RETURN QUERY
  SELECT
    gp.id,
    gp.body,
    gp.category,
    gp.created_at,
    gp.moderation_state,
    COALESCE(report_counts.open_report_count, 0)::int,
    COALESCE(flag_counts.safety_flag_count, 0)::int
  FROM public.garden_posts gp
  LEFT JOIN (
    SELECT gr.post_id, count(*)::int AS open_report_count
    FROM public.garden_reports gr
    WHERE gr.status IN ('open', 'reviewing')
    GROUP BY gr.post_id
  ) report_counts ON report_counts.post_id = gp.id
  LEFT JOIN (
    SELECT se.target_id, count(*)::int AS safety_flag_count
    FROM public.safety_events se
    WHERE se.target_type = 'garden_post'
      AND se.event_type = 'garden_post_flagged'
    GROUP BY se.target_id
  ) flag_counts ON flag_counts.target_id = gp.id
  WHERE gp.moderation_state = 'pending'
    AND gp.deleted_at IS NULL
  ORDER BY
    COALESCE(report_counts.open_report_count, 0) DESC,
    COALESCE(flag_counts.safety_flag_count, 0) DESC,
    gp.created_at ASC
  LIMIT v_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.get_garden_moderation_queue(int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_garden_moderation_queue(int) TO authenticated;

COMMENT ON FUNCTION public.get_garden_moderation_queue IS
  'Moderator-only pending Garden queue with safe content fields and report/flag counts.';

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
    UPDATE public.garden_posts
    SET
      moderation_state = 'approved',
      approved_at = v_now,
      rejected_at = NULL,
      deleted_at = NULL
    WHERE id = p_post_id;
    v_event_type := 'garden_post_approved';
  ELSIF v_decision = 'reject' THEN
    UPDATE public.garden_posts
    SET
      moderation_state = 'rejected',
      approved_at = NULL,
      rejected_at = v_now
    WHERE id = p_post_id;
    v_event_type := 'garden_post_rejected';
  ELSE
    UPDATE public.garden_posts
    SET
      moderation_state = 'removed',
      deleted_at = v_now
    WHERE id = p_post_id;
    v_event_type := 'garden_post_removed';
  END IF;

  INSERT INTO public.safety_events (actor_user_id, target_type, target_id, event_type, severity, notes)
  VALUES (v_actor_user_id, 'garden_post', p_post_id, v_event_type, 'medium', v_reason);

  RETURN QUERY
  SELECT gp.id, gp.moderation_state, gp.approved_at, gp.rejected_at, gp.deleted_at
  FROM public.garden_posts gp
  WHERE gp.id = p_post_id;
END;
$$;

REVOKE ALL ON FUNCTION public.moderate_garden_post(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_garden_post(uuid, text, text) TO authenticated;

COMMENT ON FUNCTION public.moderate_garden_post IS
  'Moderator-only Garden decision RPC. Approves, rejects, or removes a post and writes a safety event.';

CREATE OR REPLACE FUNCTION public.get_garden_reports_queue(
  p_limit int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  post_id uuid,
  reason text,
  details text,
  status text,
  created_at timestamptz,
  reviewed_at timestamptz,
  resolved_at timestamptz,
  resolution_notes text,
  post_body text,
  post_category text,
  post_moderation_state text,
  post_created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  v_role text;
  v_limit int;
BEGIN
  v_role := public.get_my_moderator_role();
  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Moderator access required' USING ERRCODE = 'P0010';
  END IF;

  v_limit := LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100);

  RETURN QUERY
  SELECT
    gr.id,
    gr.post_id,
    gr.reason,
    gr.details,
    gr.status,
    gr.created_at,
    gr.reviewed_at,
    gr.resolved_at,
    gr.resolution_notes,
    gp.body,
    gp.category,
    gp.moderation_state,
    gp.created_at
  FROM public.garden_reports gr
  INNER JOIN public.garden_posts gp ON gp.id = gr.post_id
  WHERE gr.status IN ('open', 'reviewing')
  ORDER BY
    CASE gr.status WHEN 'open' THEN 0 ELSE 1 END,
    gr.created_at ASC
  LIMIT v_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.get_garden_reports_queue(int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_garden_reports_queue(int) TO authenticated;

COMMENT ON FUNCTION public.get_garden_reports_queue IS
  'Moderator-only queue for open/reviewing Garden reports. Reporter identity is not exposed.';

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

  UPDATE public.garden_reports
  SET
    status = v_status,
    reviewer_user_id = v_actor_user_id,
    reviewed_at = CASE
      WHEN v_status = 'reviewing' THEN COALESCE(reviewed_at, v_now)
      ELSE COALESCE(reviewed_at, v_now)
    END,
    resolved_at = CASE
      WHEN v_status IN ('resolved', 'dismissed') THEN v_now
      ELSE NULL
    END,
    resolution_notes = v_notes
  WHERE id = p_report_id;

  v_event_type := CASE v_status
    WHEN 'reviewing' THEN 'garden_report_reviewing'
    WHEN 'resolved' THEN 'garden_report_resolved'
    ELSE 'garden_report_dismissed'
  END;

  INSERT INTO public.safety_events (actor_user_id, target_type, target_id, event_type, severity, notes)
  VALUES (v_actor_user_id, 'garden_report', p_report_id, v_event_type, 'medium', v_notes);

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

-- ============================================================================
-- 7. GARDEN SUBMISSION HARDENING
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
  v_window_start timestamptz;
  v_rate_count int;
  v_block_terms text[];
  v_flag_terms text[];
  v_contact_reason text[];
  v_notes text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  v_body := trim(COALESCE(p_body, ''));
  IF length(v_body) = 0 THEN
    RAISE EXCEPTION 'Body is required' USING ERRCODE = 'P0002';
  END IF;
  IF length(v_body) > 1200 THEN
    RAISE EXCEPTION 'Body exceeds maximum length of 1200 characters' USING ERRCODE = 'P0003';
  END IF;

  IF p_category IS NOT NULL AND trim(p_category) <> '' THEN
    v_category := lower(trim(p_category));
    IF length(v_category) > 50 OR NOT (v_category = ANY(v_allowed_categories)) THEN
      v_category := 'other';
    END IF;
  ELSE
    v_category := NULL;
  END IF;

  v_contact_reason := ARRAY[]::text[];
  IF v_body ~* '([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})' THEN
    v_contact_reason := array_append(v_contact_reason, 'email');
  END IF;
  IF v_body ~* '((https?://|www\.)\S+)' THEN
    v_contact_reason := array_append(v_contact_reason, 'url');
  END IF;
  IF v_body ~* '(\+?\d[\d\-\s().]{6,}\d)' THEN
    v_contact_reason := array_append(v_contact_reason, 'phone');
  END IF;

  SELECT
    array_remove(array_agg(cft.term) FILTER (WHERE cft.action = 'block'), NULL),
    array_remove(array_agg(cft.term) FILTER (WHERE cft.action = 'flag'), NULL)
  INTO v_block_terms, v_flag_terms
  FROM public.content_filter_terms cft
  WHERE cft.enabled = true
    AND position(lower(cft.term) in lower(v_body)) > 0;

  IF COALESCE(array_length(v_contact_reason, 1), 0) > 0
     OR COALESCE(array_length(v_block_terms, 1), 0) > 0 THEN
    v_notes := 'blocked:' ||
      COALESCE(array_to_string(v_contact_reason, ','), '') ||
      CASE
        WHEN COALESCE(array_length(v_block_terms, 1), 0) > 0
          THEN CASE WHEN COALESCE(array_length(v_contact_reason, 1), 0) > 0 THEN ';' ELSE '' END ||
               'terms=' || array_to_string(v_block_terms, ',')
        ELSE ''
      END;

    INSERT INTO public.safety_events (actor_user_id, target_type, target_id, event_type, severity, notes)
    VALUES (v_user_id, 'garden_submission', NULL, 'garden_post_blocked', 'high', left(v_notes, 1000));

    RAISE EXCEPTION 'This post could not be submitted. Garden posts cannot include contact information or obvious safety violations.'
      USING ERRCODE = 'P0015';
  END IF;

  v_window_start := date_trunc('hour', pg_catalog.now());

  SELECT arl.count
  INTO v_rate_count
  FROM public.action_rate_limits arl
  WHERE arl.action = 'garden_submission'
    AND arl.user_id = v_user_id
    AND arl.window_start = v_window_start
    AND arl.ip_hash IS NULL
  FOR UPDATE;

  IF v_rate_count IS NULL THEN
    INSERT INTO public.action_rate_limits (action, user_id, window_start, count)
    VALUES ('garden_submission', v_user_id, v_window_start, 1);
  ELSIF v_rate_count >= 5 THEN
    INSERT INTO public.safety_events (actor_user_id, target_type, target_id, event_type, severity, notes)
    VALUES (v_user_id, 'garden_submission', NULL, 'garden_submission_rate_limited', 'low', 'hourly_user_limit');

    RAISE EXCEPTION 'You have reached the current Garden submission limit. Please try again later.'
      USING ERRCODE = 'P0016';
  ELSE
    UPDATE public.action_rate_limits
    SET count = v_rate_count + 1
    WHERE action = 'garden_submission'
      AND user_id = v_user_id
      AND window_start = v_window_start
      AND ip_hash IS NULL;
  END IF;

  v_anonymous_seed := encode(extensions.gen_random_bytes(12), 'hex');

  INSERT INTO public.garden_posts (user_id, body, category, moderation_state, anonymous_seed)
  VALUES (v_user_id, v_body, v_category, 'pending', v_anonymous_seed)
  RETURNING public.garden_posts.id, public.garden_posts.created_at
  INTO v_id, v_created_at;

  IF COALESCE(array_length(v_flag_terms, 1), 0) > 0 THEN
    v_notes := 'terms=' || array_to_string(v_flag_terms, ',');
    INSERT INTO public.safety_events (actor_user_id, target_type, target_id, event_type, severity, notes)
    VALUES (v_user_id, 'garden_post', v_id, 'garden_post_flagged', 'medium', left(v_notes, 1000));
  END IF;

  RETURN QUERY SELECT v_id, 'pending'::text, v_created_at;
END;
$$;

COMMENT ON FUNCTION public.submit_garden_post IS
  'Authenticated Garden submission RPC with trim/length checks, content filtering, and per-user rate limiting.';

-- ============================================================================
-- 8. LATE LETTER REPORT RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.report_my_late_letter(
  p_late_letter_id uuid,
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
  v_reason text;
  v_details text;
  v_recipient_email text;
  v_recipient_email_hash text;
  v_id uuid;
  v_created_at timestamptz;
  v_duplicate boolean;
  v_allowed_reasons text[] := ARRAY['delivery_issue', 'unwanted_delivery', 'privacy', 'harassment', 'other'];
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  SELECT ll.recipient_email
  INTO v_recipient_email
  FROM public.late_letters ll
  WHERE ll.id = p_late_letter_id
    AND ll.user_id = v_user_id
    AND ll.deleted_at IS NULL
    AND ll.status <> 'draft';

  IF v_recipient_email IS NULL THEN
    RAISE EXCEPTION 'Late Letter not found or not eligible for reporting' USING ERRCODE = 'P0017';
  END IF;

  v_reason := lower(trim(COALESCE(p_reason, '')));
  IF v_reason = '' THEN
    RAISE EXCEPTION 'Reason is required' USING ERRCODE = 'P0005';
  END IF;
  IF NOT (v_reason = ANY(v_allowed_reasons)) THEN
    v_reason := 'other';
  END IF;

  v_details := NULLIF(trim(COALESCE(p_details, '')), '');
  IF v_details IS NOT NULL THEN
    v_details := left(v_details, 1000);
  END IF;

  v_recipient_email_hash := encode(
    extensions.digest(lower(trim(v_recipient_email)), 'sha256'),
    'hex'
  );

  SELECT EXISTS(
    SELECT 1
    FROM public.letter_safety_reports lsr
    WHERE lsr.late_letter_id = p_late_letter_id
      AND lsr.reporter_role = 'sender'
      AND lsr.reporter_user_id = v_user_id
      AND lsr.status IN ('open', 'reviewing')
  ) INTO v_duplicate;

  IF v_duplicate THEN
    RAISE EXCEPTION 'You have already reported this letter' USING ERRCODE = 'P0018';
  END IF;

  INSERT INTO public.letter_safety_reports (
    late_letter_id,
    sender_user_id,
    reporter_user_id,
    reporter_role,
    recipient_email_hash,
    reason,
    details,
    status
  )
  VALUES (
    p_late_letter_id,
    v_user_id,
    v_user_id,
    'sender',
    v_recipient_email_hash,
    v_reason,
    v_details,
    'open'
  )
  RETURNING public.letter_safety_reports.id, public.letter_safety_reports.created_at
  INTO v_id, v_created_at;

  INSERT INTO public.safety_events (actor_user_id, target_type, target_id, event_type, severity, notes)
  VALUES (v_user_id, 'late_letter', p_late_letter_id, 'late_letter_report_created', 'low', 'sender:' || v_reason);

  RETURN QUERY SELECT v_id, 'open'::text, v_created_at;
END;
$$;

REVOKE ALL ON FUNCTION public.report_my_late_letter(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.report_my_late_letter(uuid, text, text) TO authenticated;

COMMENT ON FUNCTION public.report_my_late_letter IS
  'Authenticated sender safety report RPC for non-draft Late Letters.';

-- ============================================================================
-- 9. GARDEN GRANTS AFTER SAFETY HARDENING
-- ============================================================================

-- Garden product UI remains closed. Keep anon access locked.
REVOKE EXECUTE ON FUNCTION public.get_public_garden_posts(text, int, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_garden_post(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_garden_submissions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.toggle_garden_reaction(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_garden_reaction_state(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.report_garden_post(uuid, text, text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_public_garden_posts(text, int, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_garden_post(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_garden_submissions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_garden_reaction(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_garden_reaction_state(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_garden_post(uuid, text, text) TO authenticated;

COMMENT ON FUNCTION public.get_public_garden_posts IS
  'Safe Garden read surface. Phase 13 keeps anonymous execution locked while the product UI stays closed.';
