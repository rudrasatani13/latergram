# Launch Blockers

This document tracks all blockers preventing Latergram's public launch. Each blocker must be resolved or explicitly deferred with rationale before public launch can proceed.

**Last Updated:** 2026-05-16  
**Current Launch Status:** NO-LAUNCH

---

## Critical Blockers

These must be resolved before public launch.

### 1. Private Beta Execution

**Status:** 🔴 Open

**Required:**
- Invite 20-50 real users through off-platform channel
- Collect real feedback outside repo
- Fix critical bugs found in beta
- Fix confusing flows
- Test Late Letter delivery end-to-end with real recipients
- Document beta findings without committing private user data

**Current State:**
- Beta infrastructure exists (BetaPage, beta notices, documentation)
- Beta runbook created in Phase 21
- No actual beta execution yet
- No real user feedback collected
- No beta-driven improvements made

**Next Steps:**
- Execute beta per `docs/phase-21-private-beta-execution.md`
- Collect feedback through off-platform channel
- Triage and fix critical issues
- Document results in beta findings summary (no PII)

**Owner:** Founder

---

### 2. Support Inbox Configuration

**Status:** 🔴 Open

**Required:**
- Configure support@latergram.app inbox
- Verify inbox receives mail
- Document support workflow
- Update `SUPPORT_EMAIL_CONFIGURED = true`
- Update all pages/docs to remove "pending" language

**Current State:**
- `SUPPORT_EMAIL = "support@latergram.app"`
- `SUPPORT_EMAIL_CONFIGURED = false`
- UI shows "(inbox pending before public launch)"
- Support workflow documented but not operational

**Next Steps:**
- Configure email forwarding or inbox access for support@latergram.app
- Test inbox receives mail
- Document how support requests will be handled
- Update constant and UI copy

**Owner:** Founder

---

### 3. Formal Legal Review

**Status:** 🔴 Open

**Required:**
- Legal review of privacy policy
- Legal review of terms of service
- Review of data deletion process
- Review of recipient email handling
- Review of Resend/provider disclosures
- Review of analytics disclosures (if enabled)
- Age/jurisdiction assessment if serving minors or specific regions
- GDPR/CCPA assessment if serving EU/California users

**Current State:**
- Privacy policy written in plain language
- Terms of service written with product-specific content
- Legal review disclaimers present in UI
- No formal legal review completed

**Next Steps:**
- Engage legal counsel or legal review service
- Provide privacy policy, terms, and data handling documentation
- Incorporate feedback
- Document that review occurred (without committing privileged notes)
- Update pages to remove disclaimers if appropriate

**Owner:** Founder

---

## Conditional Blockers

These are blockers only if the feature is included in V1 scope.

### 4. Garden Public Launch

**Status:** 🟡 Conditional (blocker if V1 includes Garden)

**Required to open Garden:**
- Complete separate Garden safety checkpoint
- Staff moderation operations
- Test moderation queue end-to-end
- Test report handling workflow
- Unlock Garden user-facing RPCs only after safety verification
- Update Garden UI to show available state
- Update privacy/support/docs with Garden moderation details
- Document Garden launch separately

**Current State:**
- Garden backend safety infrastructure complete (Phase 13)
- Moderator/admin membership system exists
- Server-side content filtering and rate limiting implemented
- Garden user-facing RPCs locked (Phase 17)
- Garden UI shows honest closed state
- No moderation operations staffed
- No real moderation testing

**Decision Options:**
- **Option A:** Defer Garden to post-V1 (recommended)
- **Option B:** Complete Garden safety checkpoint before V1 launch

**Next Steps:**
- Decide if Garden is in V1 scope
- If yes: complete full Garden safety verification
- If no: document Garden as post-V1 feature

**Owner:** Founder

---

## Operational Readiness Blockers

These must be resolved before launch.

### 5. Production Environment Configuration

**Status:** 🔴 Open

**Required:**
- Frontend deployment host configured
- Supabase production project configured
- Supabase migrations applied to production
- Supabase Edge Functions deployed to production
- Service role key configured in server environment only
- Resend API key configured
- Resend sender domain verified
- Delivery cron/job configured and tested
- No secrets committed to repo
- Production environment variables documented

**Current State:**
- Development environment functional
- Supabase migrations exist and pass local reset
- Edge Functions exist
- No production deployment documented

**Next Steps:**
- Choose frontend deployment platform (Vercel/Netlify/Cloudflare Pages)
- Create Supabase production project
- Apply migrations to production
- Deploy Edge Functions
- Configure secrets in deployment platform
- Verify Resend domain
- Test delivery job
- Document production setup without committing secrets

**Owner:** Founder

---

### 6. Manual End-to-End Testing

**Status:** 🔴 Open

**Required:**
- Complete manual testing per `docs/manual-testing-template.md`
- Test all routes
- Test auth flows
- Test Late Letter delivery
- Test recipient flows (open, report, block, opt-out)
- Test Memory Card export
- Test mobile flows
- Test support/trust pages
- Document test results without PII

**Current State:**
- Manual testing template created in Phase 21
- No documented test pass

**Next Steps:**
- Execute manual testing checklist
- Document results
- Fix any critical issues found
- Re-test after fixes

**Owner:** Founder

---

### 7. Support Workflow Testing

**Status:** 🔴 Open (depends on blocker #2)

**Required:**
- Test support inbox receives mail
- Test data deletion request handling
- Test abuse report handling
- Test recipient help workflow
- Document support response process

**Current State:**
- Support workflows documented
- Support inbox not configured
- No operational testing

**Next Steps:**
- After support inbox configured, test all support workflows
- Document response times and processes
- Verify data deletion process works end-to-end

**Owner:** Founder

---

## Optional/Deferred Items

These are not blockers but may be considered.

### Analytics Configuration

**Status:** ⚪ Optional

**Current State:**
- Analytics instrumentation exists (Phase 19)
- Disabled by default
- No provider configured
- Privacy-respecting design (Plausible-compatible)

**Decision:**
- Analytics is optional for V1
- If enabled: configure Plausible, update privacy policy, test events
- If deferred: keep disabled, enable post-launch

---

### Server-Side Beta Gating

**Status:** ⚪ Optional

**Current State:**
- Beta access is manual/off-platform
- No server-side allowlist or invite code enforcement

**Decision:**
- Not required for small private beta
- May be useful for larger controlled rollout
- Can be added post-V1 if needed

---

## Resolution Criteria

A blocker is considered **resolved** when:
- All required items are completed
- Completion is documented
- No fake/demo behavior was added
- Changes are verified in production (where applicable)

A blocker can be **deferred** when:
- Explicit decision made to exclude feature from V1
- Rationale documented
- No partial/fake implementation exists

---

## Launch Readiness Checklist

Before changing launch status from NO-LAUNCH to LAUNCH-READY:

- [ ] All critical blockers resolved
- [ ] All conditional blockers resolved or explicitly deferred
- [ ] All operational readiness blockers resolved
- [ ] Beta findings documented
- [ ] Support inbox operational
- [ ] Legal review complete
- [ ] Production environment tested
- [ ] Manual testing complete
- [ ] No fake/demo content anywhere
- [ ] README updated with launch status
- [ ] Phase 21 documentation complete

---

**Note:** This document should be updated as blockers are resolved. Do not mark items resolved unless they are genuinely complete with real operational verification.
