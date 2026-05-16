# Phase 20: Public Launch V1 Readiness

Date: 2026-05-16

## Summary

Phase 20 implements a comprehensive public launch readiness audit for Latergram. This phase does NOT publicly launch Latergram. Instead, it audits every launch gate, identifies blockers, and produces a clear launch/no-launch decision.

**Launch Decision: NO-LAUNCH**

Latergram remains in private beta readiness state. Three critical blockers prevent public launch:

1. Actual private beta (20-50 real users) has not been executed
2. Support inbox not configured (`SUPPORT_EMAIL_CONFIGURED = false`)
3. Formal legal review of privacy policy and terms pending

## Launch Gate Audit

### Gate 1: Private Beta Reality Gate

**Status: ❌ FAIL**

**Required for public launch:**
- 20-50 real users invited and tested
- Real feedback collected outside repo
- Critical bugs fixed based on beta findings
- Confusing flows fixed
- Real Late Letter delivery tested after beta setup
- Beta findings summarized without committing private user data

**Current state:**
- Beta infrastructure exists (BetaPage, beta notices on landing/auth/app)
- Beta access strategy documented (manual/off-platform direct link distribution)
- No evidence of actual beta execution
- No beta findings document
- No real user feedback collected
- No beta-driven bug fixes or flow improvements

**Blocker:** Actual private beta has not happened yet.

**Next steps before launch:**
- Execute real private beta with 20-50 users
- Collect feedback through off-platform channel
- Fix critical bugs and confusing flows
- Test Late Letter delivery end-to-end with real recipients
- Document findings in a beta results summary (without private user data)

### Gate 2: Garden Launch Gate

**Status: ✅ PASS (for intentionally closed state)**

**Required to open Garden publicly:**
- Real Garden UI implemented
- No anonymous unsafe access
- Authenticated access model explicitly designed
- Garden user-facing RPC grants intentionally opened only if safe
- Posts start pending, no auto-approval
- Moderation queue verified
- Report flow verified
- Reactions verified only for approved posts
- No raw user_id, reporter_user_id, anonymous_fingerprint_hash exposed
- Moderator/admin review operations staffed
- Content filtering and rate limiting verified

**Current state:**
- Garden backend safety infrastructure complete (Phase 13)
- Moderator/admin membership system exists
- Server-side content filtering and rate limiting implemented
- Garden user-facing RPCs locked (Phase 17 migration)
- Garden UI shows honest closed state
- GardenView displays: "The Garden is not open yet"
- Beta page explains Garden testing needs separate safety checkpoint

**Decision:** Keep Garden closed for initial private beta and public launch V1.

**Rationale:**
- Garden moderation operations not staffed
- No real moderation queue testing
- No real report handling verification
- Opening Garden requires dedicated safety checkpoint beyond Phase 20 scope

**Blocker status:** Garden closure is acceptable only for a revised V1 launch scope that explicitly excludes Garden. If V1 launch scope includes Garden as described in the original master plan, Garden remains a launch blocker until the Garden UI is safely opened, moderated, verified, and staffed. Opening Garden requires: separate safety checkpoint, moderation staffing, verified report handling, verified moderation queue, safe RPC grants, and updated docs/privacy/support.

### Gate 3: Support Readiness Gate

**Status: ❌ FAIL**

**Required for public launch:**
- Real support inbox configured
- Support page uses active support path
- Abuse/report recipient support path clear
- Data deletion request path works (manual minimum acceptable)
- No fake support form/email

**Current state:**
- `SUPPORT_EMAIL_CONFIGURED = false` in `src/app/constants.ts`
- Support page shows: "support@latergram.app (inbox pending before public launch)"
- Beta page shows: "support@latergram.app (inbox pending before public launch)"
- Privacy page data deletion section references support email with pending status
- No fake support form added

**Blocker:** Support inbox not configured.

**Next steps before launch:**
- Configure real support@latergram.app inbox
- Set `SUPPORT_EMAIL_CONFIGURED = true`
- Update all support references to remove "pending" language
- Verify abuse/report emails route correctly
- Test data deletion request handling manually

### Gate 4: Legal/Trust Gate

**Status: ⚠️ PARTIAL - formal review pending**

**Required for public launch:**
- Privacy policy reviewed enough for launch
- Terms reviewed enough for launch
- No fake compliance claims
- No HIPAA/GDPR/CCPA claims unless reviewed
- No "end-to-end encrypted" claim unless true
- No therapy/crisis/emergency copy present
- Recipient email marketing prohibition clear
- Analytics status accurate
- Resend/provider handling accurate
- Deletion limits accurate

**Current state:**
- Privacy policy exists at `/privacy` (PrivacyPage.tsx)
- Terms of service exist at `/terms` (TermsPage.tsx)
- Support page exists at `/support` (SupportPage.tsx)
- All trust pages include clear disclaimers: "This privacy policy has not undergone formal legal review"
- Content is product-specific and honest
- No HIPAA/GDPR/CCPA compliance claims
- No "end-to-end encrypted" claims
- Crisis redirection present on support page
- No therapy replacement claims
- Recipient email marketing prohibition clear in privacy policy
- Analytics status accurately described (disabled by default)
- Resend handling described accurately
- Deletion limits honest (manual process, support contact required)

**Blocker:** Formal legal review has not happened.

**Next steps before launch:**
- Engage legal counsel or compliance advisor
- Review privacy policy for jurisdiction-specific requirements
- Review terms of service for enforceability
- Update trust pages after review
- Remove "formal legal review pending" disclaimers only after review complete

### Gate 5: Core Product Gate

**Status: ✅ PASS (code audit complete, manual testing required)**

**Required for public launch:**
- Landing page has no prototype/fake/public-overclaim copy
- Auth works (sign up, sign in, sign out, password reset)
- Private Lategram local save works
- Private Lategram account save works
- Local-to-account import works
- Time Since local/account counters work
- Late Letter scheduling works
- Late Letter cancellation works before send
- Late Letter delivery works when secrets/cron configured
- Recipient /letter/:token open works
- Recipient report works
- Recipient block sender works
- Recipient global opt-out works
- Memory Card export works from real saved Lategram and Time Since counter
- Local draft restore works
- No raw recipient email shown after save
- No sender identity leaked to recipient
- No fake delivery/open status
- No fake counters/cards/letters/Garden posts

**Code audit results:**
- ✅ LandingPage.tsx: soft, honest copy; no prototype language; no overclaims
- ✅ AuthPage.tsx: Supabase Auth integration present
- ✅ DiaryComposer.tsx: local draft auto-save and restore implemented
- ✅ KeepPrivateView.tsx: local and account save paths, local-to-account import
- ✅ TimeSinceView.tsx: counter creation for local and account storage
- ✅ LateLettersView.tsx: scheduling, cancellation, status display
- ✅ RecipientLetterPage.tsx: secure token-based open, report, block, opt-out
- ✅ MemoryCardView.tsx: PNG export from saved content
- ✅ No fake data seeding in codebase
- ✅ No demo content generation
- ✅ Recipient email masking after save
- ✅ Sender identity protection in recipient flow

**Manual testing required:**
- Auth flows (sign up, sign in, sign out, password reset)
- Private save to local storage
- Private save to account (signed-in)
- Local-to-account import
- Time Since counter creation
- Late Letter scheduling
- Late Letter cancellation
- Late Letter delivery (requires Supabase Edge Function secrets and cron)
- Recipient letter open
- Recipient report/block/opt-out
- Memory Card export
- Draft restore after refresh

**Status:** Code implementation complete. Manual end-to-end testing required before launch.

### Gate 6: Analytics Gate

**Status: ✅ PASS**

**Required for public launch:**
- Decide whether analytics should remain disabled or be explicitly configured
- If enabled, verify provider is privacy-respecting and privacy page names it accurately
- Verify no message bodies, recipient emails, tokens, report details, Garden content, Memory Card text, auth IDs, DB IDs, or localStorage content are tracked
- No fake dashboards or fake metrics
- No Google Analytics/ad pixels/session replay/heatmaps

**Current state:**
- Analytics disabled by default in all env templates
- `.env.example`: `VITE_ANALYTICS_ENABLED=false`
- `.env.production.example`: `VITE_ANALYTICS_ENABLED=false`
- Analytics wrapper implemented in `src/app/analytics/analytics.ts`
- Wrapper supports Plausible-compatible provider only
- Wrapper no-ops when disabled or misconfigured
- Privacy page accurately describes analytics status
- No Google Analytics, Meta Pixel, session replay, heatmaps, or ad pixels
- Event allowlist excludes sensitive data
- Page view sanitization implemented
- No analytics provider configured in repo

**Decision:** Keep analytics disabled for public launch V1.

**Rationale:**
- Disabled analytics is acceptable for launch
- Privacy-respecting instrumentation exists if needed later
- No user tracking without explicit configuration
- Privacy policy accurately reflects disabled state

**Not a blocker:** Analytics can remain disabled indefinitely.

### Gate 7: Environment/Config Gate

**Status: ⚠️ NEEDS DOCUMENTATION**

**Required for public launch:**
- Env example files exist
- Required production env vars documented
- Supabase URL/anon key configuration clear
- Edge Function secrets documented
- Resend API/domain config documented
- Delivery cron/job config documented
- Support email config documented
- Analytics env documented (if enabled)
- No secrets committed
- No raw GitHub runtime assets
- No unstable external asset URLs

**Current state:**
- ✅ `.env.example` exists with Supabase and analytics placeholders
- ✅ `.env.production.example` exists
- ✅ `.env.development.example` exists
- ✅ `.env.local.example` exists
- ✅ No secrets committed to repo
- ✅ Supabase URL/anon key required and documented
- ⚠️ Edge Function secrets not documented in env files
- ⚠️ Resend API configuration not documented in env files
- ⚠️ Delivery cron/job setup not documented
- ✅ Support email constant exists in code
- ✅ Analytics env vars documented

**Action needed:** Create launch environment checklist (see section below).

**Blocker status:** Not a launch blocker if documented before deployment.

### Gate 8: Asset Hosting Gate

**Status: ✅ PASS (code audit complete)**

**Required for public launch:**
- No raw GitHub runtime asset dependency
- Product assets use local /assets or controlled paths
- Images load on landing/app/mobile
- No broken asset imports
- No giant unnecessary assets introduced

**Current state:**
- ✅ Assets stored in `/public/assets/`
- ✅ BrandAssets.tsx imports from local paths
- ✅ No raw GitHub URLs found in code
- ✅ BackgroundPetals uses local SVG
- ✅ Grain component uses inline SVG
- ✅ No external CDN dependencies for product assets

**Manual verification needed:**
- Test asset loading on deployed environment
- Verify mobile asset rendering
- Check asset file sizes

**Status:** Code audit complete. Manual deployment verification recommended.

### Gate 9: Mobile/Public Route Gate

**Status: ⚠️ NEEDS MANUAL TESTING**

**Required for public launch:**
- Test at 320px, 375px, 390px, 414px, 768px, desktop widths
- Test routes: /, /auth, /app, /privacy, /terms, /support, /beta, /letter/:token, /404
- No horizontal overflow
- Trust links work
- Browser back/forward works
- Unavailable states honest
- Garden closed if not launched
- Support pending if not configured
- Analytics disabled/enabled status accurate

**Code audit results:**
- ✅ Responsive design classes present (Tailwind breakpoints)
- ✅ Mobile-first approach in components
- ✅ All required routes exist
- ✅ TrustFooter links to /privacy, /terms, /support, /beta
- ✅ NotFoundPage exists for unknown routes
- ✅ Garden shows closed state
- ✅ Support shows pending status
- ✅ Analytics status accurate in privacy page

**Manual testing required:**
- Test all routes at all breakpoints
- Verify no horizontal scroll
- Test navigation flow
- Test touch interactions
- Verify text readability at small sizes
- Test form inputs on mobile
- Verify button tap targets adequate

**Status:** Code audit complete. Manual responsive testing required before launch.

## Launch Environment Checklist

This checklist documents all environment variables and configuration required for production deployment.

### Frontend Environment Variables (Public)

Required in hosting platform (Vercel/Netlify/etc.):

```bash
# Supabase (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Analytics (optional, disabled by default)
VITE_ANALYTICS_ENABLED=false
VITE_ANALYTICS_PROVIDER=
VITE_PLAUSIBLE_DOMAIN=
VITE_PLAUSIBLE_SCRIPT_SRC=
```

### Supabase Edge Function Secrets (Server-side)

Required in Supabase project settings for Late Letter delivery:

```bash
# Resend API (required for Late Letter delivery)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=letters@latergram.app
RESEND_FROM_NAME=Latergram

# Supabase Service Role (required for Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Supabase Cron/Queue Configuration

Required for scheduled Late Letter delivery:

- Configure `pg_cron` extension or Supabase Queue
- Schedule job to call `process_pending_late_letters()` function
- Recommended: every 5 minutes
- Verify job execution in Supabase logs

### DNS and Email Configuration

Required for Late Letter delivery:

- Configure Resend domain verification
- Add SPF, DKIM, DMARC records
- Verify `letters@latergram.app` sender domain
- Configure `support@latergram.app` inbox (currently pending)

### Deployment Verification Steps

Before marking production ready:

1. ✅ Frontend env vars configured in hosting platform
2. ✅ Supabase Edge Function secrets configured
3. ✅ Resend API key valid and domain verified
4. ✅ Delivery cron/queue job scheduled and running
5. ✅ Test Late Letter delivery end-to-end
6. ✅ Verify recipient link opens correctly
7. ✅ Test report/block/opt-out flows
8. ✅ Verify no secrets exposed in frontend bundle
9. ✅ Test auth flows on production domain
10. ✅ Verify asset loading on production

## Launch Blockers Summary

### Critical Blockers (Must Fix Before Launch)

1. **Private Beta Not Executed**
   - Status: No evidence of 20-50 user beta
   - Impact: Cannot validate product with real users
   - Next step: Execute real private beta, collect feedback, fix critical issues

2. **Support Inbox Not Configured**
   - Status: `SUPPORT_EMAIL_CONFIGURED = false`
   - Impact: No way to handle user support, abuse reports, deletion requests
   - Next step: Configure support@latergram.app inbox, update constant to true

3. **Formal Legal Review Pending**
   - Status: Privacy/terms include "formal legal review pending" disclaimers
   - Impact: Legal risk for public launch without review
   - Next step: Engage legal counsel, review privacy/terms, update pages

### Non-Critical Items (Conditional or Acceptable)

1. **Garden Closed**
   - Status: Intentionally closed
   - Impact: Garden not available in V1
   - Decision: Acceptable only if V1 launch scope explicitly excludes Garden. If original master plan V1 scope includes Garden, this becomes a critical blocker requiring Garden UI opening, moderation staffing, verified safety operations, and updated documentation.

2. **Analytics Disabled**
   - Status: Intentionally disabled by default
   - Impact: No usage tracking
   - Decision: Acceptable for public launch V1

3. **Manual Testing Incomplete**
   - Status: Code audit complete, manual testing needed
   - Impact: Unknown bugs may exist
   - Next step: Complete manual testing checklist before launch

## Implementation Summary

### Files Changed

- `README.md` - Updated Current Status section with Phase 20 audit results and launch decision
- `docs/phase-20-public-launch-v1.md` - Created comprehensive launch readiness documentation

### App Code Changes

None. Phase 20 is an audit phase, not an implementation phase. No app code files, package files, Supabase files, Garden files, analytics provider configuration, or runtime product behavior were changed.

### Supabase Changes

None required for Phase 20 audit.

### Package Changes

None required for Phase 20 audit.

## Commands Run

```bash
npm install                    # ✅ Passed
git status --short             # ✅ Clean
git log --oneline -5           # ✅ Verified recent commits
npm run build                  # ✅ Passed (1.33s)
```

## Manual Testing Checklist

### Auth Flows
- [ ] Sign up with email/password
- [ ] Sign in with existing account
- [ ] Sign out
- [ ] Password reset flow
- [ ] Session persistence across refresh

### Private Lategram Flows
- [ ] Write and save locally (signed out)
- [ ] Write and save to account (signed in)
- [ ] Local draft auto-save and restore
- [ ] Import local saves to account
- [ ] View saved Lategrams in archive

### Time Since Flows
- [ ] Create counter locally (signed out)
- [ ] Create counter in account (signed in)
- [ ] View counter updates
- [ ] Import local counters to account

### Late Letter Flows
- [ ] Schedule Late Letter to self
- [ ] Schedule Late Letter to external recipient
- [ ] Cancel scheduled letter before send
- [ ] Verify delivery after scheduled time (requires cron)
- [ ] Open recipient link
- [ ] Test report flow
- [ ] Test block sender flow
- [ ] Test global opt-out flow

### Memory Card Flows
- [ ] Export card from saved Lategram (square format)
- [ ] Export card from saved Lategram (story format)
- [ ] Export card from saved Lategram (wallpaper format)
- [ ] Export card from Time Since counter
- [ ] Verify PNG download works

### Trust Pages
- [ ] Read privacy policy for clarity
- [ ] Read terms of service for clarity
- [ ] Read support page for clarity
- [ ] Read beta page for clarity
- [ ] Verify all trust footer links work

### Mobile Responsive
- [ ] Test at 320px width
- [ ] Test at 375px width
- [ ] Test at 390px width
- [ ] Test at 414px width
- [ ] Test at 768px width
- [ ] Test at desktop width
- [ ] Verify no horizontal scroll
- [ ] Test touch interactions
- [ ] Verify text readability

### Route Testing
- [ ] / (landing)
- [ ] /auth
- [ ] /app
- [ ] /app?section=private
- [ ] /app?section=later
- [ ] /app?section=time
- [ ] /app?section=memory
- [ ] /app?section=garden
- [ ] /privacy
- [ ] /terms
- [ ] /support
- [ ] /beta
- [ ] /letter/:token (with real token)
- [ ] /invalid-route (should show 404)

## Next Steps Before Public Launch

### Immediate Actions Required

1. **Execute Private Beta**
   - Invite 20-50 real users through off-platform channel
   - Provide beta testing guidance
   - Collect feedback on clarity, trust, bugs, confusion
   - Test Late Letter delivery with real recipients
   - Document findings without committing private data
   - Fix critical bugs and confusing flows

2. **Configure Support Inbox**
   - Set up support@latergram.app email inbox
   - Configure email forwarding/ticketing if needed
   - Test abuse report handling
   - Test data deletion request handling
   - Update `SUPPORT_EMAIL_CONFIGURED = true` in constants.ts
   - Update all support page copy to remove "pending" language

3. **Complete Legal Review**
   - Engage legal counsel or compliance advisor
   - Review privacy policy for jurisdiction requirements
   - Review terms of service for enforceability
   - Address any legal concerns
   - Update trust pages after review
   - Remove "formal legal review pending" disclaimers

4. **Complete Manual Testing**
   - Work through manual testing checklist above
   - Fix any bugs discovered
   - Verify all flows work end-to-end
   - Test on multiple devices and browsers

5. **Configure Production Environment**
   - Set up Supabase production project
   - Configure all environment variables
   - Set up Resend domain and API key
   - Configure delivery cron/queue job
   - Verify Edge Functions deployed
   - Test production deployment

### Optional Actions (Conditional on Launch Scope)

1. **Open Garden** (required if V1 includes Garden per original master plan)
   - Complete separate Garden safety checkpoint
   - Staff moderation operations
   - Test moderation queue end-to-end
   - Test report handling
   - Unlock Garden user-facing RPCs only after safety verification
   - Update Garden UI to show available state
   - Update privacy/support/docs with Garden moderation details
   - Document Garden launch separately

2. **Enable Analytics** (optional)
   - Choose privacy-respecting provider (Plausible recommended)
   - Configure analytics environment variables
   - Update privacy policy with provider details
   - Test analytics events
   - Verify no sensitive data tracked

## Conclusion

**Launch Decision: NO-LAUNCH**

Latergram is not ready for public launch. Three critical blockers must be resolved:

1. Actual private beta execution (20-50 real users)
2. Support inbox configuration
3. Formal legal review of privacy/terms

Additionally, if the original master plan V1 scope includes Garden, Garden opening becomes a fourth critical blocker requiring full safety verification, moderation staffing, and operational readiness.

The codebase is structurally ready for launch. Core features are implemented, no fake data exists, trust pages are honest, and the product follows the live-only development rule. However, operational readiness (beta validation, support infrastructure, legal review) is incomplete.

**Recommended Status:** Keep Latergram in "private beta readiness" state until all critical blockers are resolved.

**Phase 20 Result:** Launch readiness audit complete. Clear blocker list documented. Next steps defined.

