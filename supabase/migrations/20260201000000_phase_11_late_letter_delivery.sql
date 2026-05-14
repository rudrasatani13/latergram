-- Phase 11 Real Letter Delivery

ALTER TABLE public.late_letters
  ADD COLUMN IF NOT EXISTS delivery_attempted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS provider_event_last_seen_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.resend_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  svix_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  resend_email_id TEXT,
  late_letter_id UUID REFERENCES public.late_letters(id) ON DELETE SET NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB
);

ALTER TABLE public.resend_webhook_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.resend_webhook_events FROM anon, authenticated;
REVOKE ALL ON public.recipient_opt_outs FROM anon, authenticated;

DROP POLICY IF EXISTS "Users can insert own late_letters" ON public.late_letters;
CREATE POLICY "Users can insert own draft or scheduled late_letters"
  ON public.late_letters
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('draft', 'scheduled')
    AND delivery_provider IS NULL
    AND delivery_provider_message_id IS NULL
    AND secure_open_token_hash IS NULL
    AND delivery_attempted_at IS NULL
    AND sent_at IS NULL
    AND opened_at IS NULL
    AND failed_at IS NULL
    AND cancelled_at IS NULL
  );

DROP POLICY IF EXISTS "Users can update own late_letters" ON public.late_letters;
CREATE POLICY "Users can cancel own pending late_letters"
  ON public.late_letters
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status IN ('draft', 'scheduled')
    AND deleted_at IS NULL
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'cancelled'
    AND cancelled_at IS NOT NULL
    AND deleted_at IS NULL
  );

CREATE INDEX IF NOT EXISTS idx_late_letters_due_delivery
  ON public.late_letters(scheduled_for)
  WHERE status = 'scheduled'
    AND deleted_at IS NULL
    AND cancelled_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_late_letters_secure_open_token_hash
  ON public.late_letters(secure_open_token_hash)
  WHERE secure_open_token_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_late_letters_resend_message_id
  ON public.late_letters(delivery_provider_message_id)
  WHERE delivery_provider = 'resend'
    AND delivery_provider_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_resend_webhook_events_late_letter_id
  ON public.resend_webhook_events(late_letter_id);

CREATE INDEX IF NOT EXISTS idx_resend_webhook_events_resend_email_id
  ON public.resend_webhook_events(resend_email_id);
