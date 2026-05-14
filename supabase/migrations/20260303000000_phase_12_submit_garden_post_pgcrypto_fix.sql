-- Phase 12 cleanup: schema-qualify pgcrypto gen_random_bytes.
-- The submit_garden_post RPC uses SET search_path = '', so extension
-- functions must be schema-qualified on Supabase.

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
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  v_body := trim(p_body);
  IF v_body IS NULL OR length(v_body) = 0 THEN
    RAISE EXCEPTION 'Body is required' USING ERRCODE = 'P0002';
  END IF;
  IF length(v_body) > 1200 THEN
    RAISE EXCEPTION 'Body exceeds maximum length of 1200 characters' USING ERRCODE = 'P0003';
  END IF;

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

  v_anonymous_seed := encode(extensions.gen_random_bytes(12), 'hex');

  INSERT INTO public.garden_posts (user_id, body, category, moderation_state, anonymous_seed)
  VALUES (v_user_id, v_body, v_category, 'pending', v_anonymous_seed)
  RETURNING public.garden_posts.id, public.garden_posts.created_at
  INTO v_id, v_created_at;

  RETURN QUERY SELECT v_id, 'pending'::text, v_created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_garden_post(text, text) TO authenticated;
