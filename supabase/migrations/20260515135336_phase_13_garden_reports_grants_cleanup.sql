-- Phase 13 cleanup: harden raw Garden report table grants.
-- Garden reports are private moderation records.
-- Client access should go through report_garden_post(...) and moderator RPCs,
-- not direct table reads/writes.

ALTER TABLE public.garden_reports ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.garden_reports FROM PUBLIC, anon, authenticated;

GRANT ALL ON TABLE public.garden_reports TO service_role;

COMMENT ON TABLE public.garden_reports IS
  'Private Garden report records. Raw table access is revoked from anon/authenticated; use report_garden_post and moderator RPCs.';
