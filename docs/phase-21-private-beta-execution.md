# Phase 21: Private Beta Execution & Launch Blocker Resolution

Date: 2026-05-16

## Summary

Phase 21 prepares Latergram to execute a real private beta with 20-50 users and provides the operational infrastructure to close launch blockers. This phase does NOT execute the beta, does NOT fake beta results, and does NOT publicly launch Latergram.

This phase creates:
- A practical beta execution runbook
- A launch blocker tracking system
- A manual testing evidence structure
- GitHub issue templates for feedback collection
- Production environment readiness checklist

**Important:** This phase documents HOW to run the beta. The beta itself must be executed separately by the founder with real users and real feedback collected off-platform.

---

## Implementation Summary

**Added:**
- `docs/phase-21-private-beta-execution.md` (this document)
- `docs/launch-blockers.md` - Launch blocker tracker
- `docs/manual-testing-template.md` - Manual testing checklist
- `.github/ISSUE_TEMPLATE/beta_feedback.md` - Beta feedback issue template
- `.github/ISSUE_TEMPLATE/bug_report.md` - Bug report issue template
- `.github/ISSUE_TEMPLATE/safety_report_internal.md` - Safety report template

**Updated:**
- README.md - Phase 21 status
- (Potentially) BetaPage.tsx - Minor copy improvements if needed

**Not Changed:**
- `SUPPORT_EMAIL_CONFIGURED` remains `false` (support inbox not verified)
- No Supabase schema, policy, function, or migration changes
- No package dependency changes
- No Garden opening
- No analytics configuration
- No fake beta results or fake support infrastructure

---

## Private Beta Execution Runbook

### Beta Status

**Current Status:** Not executed

The private beta infrastructure exists but the actual beta with real users has not been executed yet. This section documents how to run the beta when ready.

### Beta Goals

- Validate core product flows with 20-50 real users
- Identify confusing UX, trust concerns, and critical bugs
- Test Late Letter delivery end-to-end with real recipients
- Verify Memory Card export works across devices
- Collect honest feedback about clarity, safety, and reliability
- Build confidence before public launch

### Target Beta Size

**20-50 real users**

This size is large enough to surface common issues but small enough to manage manually without complex infrastructure.

### Invite Criteria

Invite users who:
- Understand this is a private beta, not a public launch
- Are comfortable with early-stage software
- Can provide thoughtful feedback about clarity and trust
- Will not share access publicly
- Understand Latergram is not for emergencies or crisis support
- Are willing to test Late Letters with consenting recipients

**Do not invite:**
- Users expecting a polished, production-ready product
- Users who may use Latergram for urgent or crisis communication
- Users who cannot provide feedback in English (current UI language)
- Minors without appropriate consent/oversight

### How to Invite Users

**Off-platform invite distribution:**

1. **Choose your invite channel:**
   - Direct email to selected testers
   - Private message through existing community
   - Personal outreach to trusted contacts

2. **Send invite message** (template below)

3. **Do not:**
   - Post public signup links
   - Commit real user emails to this repo
   - Create a fake waitlist or invite queue in the app
   - Track beta user count in committed code

4. **Track invites privately:**
   - Keep a private spreadsheet or note (not in repo)
   - Record: invite date, tester name/email, invite channel
   - Track: who accepted, who provided feedback, who tested Late Letters

### Invite Message Template

```
Subject: Latergram Private Beta Invitation

Hi [Name],

I'm inviting you to test Latergram, a private writing app for words that arrive late.

This is a small private beta (20-50 people) before public launch. The app is functional but early-stage. I'm looking for feedback on clarity, trust, and whether the core flows make sense.

What Latergram does:
- Private writing saved to your device or account
- Time Since counters for marking moments
- Late Letters: schedule a letter to someone for future delivery
- Memory Cards: export saved writing as shareable images

What to test:
- Sign up, write, save content
- Schedule a Late Letter to yourself or a consenting test recipient
- Export a Memory Card
- Read the privacy, terms, and support pages
- Try the mobile flow

What I need feedback on:
- Is anything confusing or unclear?
- Do you trust how your data is handled?
- Did anything break or feel unreliable?
- Would you use this for real?

Important boundaries:
- Don't use Latergram for emergencies or crisis support
- Don't send Late Letters to people who haven't agreed to test
- Don't include secrets, passwords, or sensitive personal data in beta content

Access: [Your Latergram URL]

Beta page: [Your Latergram URL]/beta

Feedback: Reply to this email or [your preferred feedback channel]

Thank you for helping make Latergram better.

[Your name]
```

### Beta Testing Script

Share this with beta testers or include in onboarding:

**Core flows to test:**

1. **Account & Auth**
   - Sign up with email/password
   - Sign out and sign back in
   - Test password reset (optional)

2. **Private Writing**
   - Write a Latergram while signed out (saves to device)
   - Sign in and write a Latergram (saves to account)
   - Verify both appear in your archive

3. **Time Since Counter**
   - Create a Time Since counter
   - Verify it displays time elapsed

4. **Late Letter**
   - Schedule a Late Letter to yourself or a consenting test recipient
   - Wait for delivery (or ask founder to trigger delivery job)
   - Open the recipient link when email arrives
   - Try the report/block/opt-out controls

5. **Memory Card**
   - Export a Memory Card from a saved Latergram or Time Since counter
   - Try different formats (square, story, wallpaper)
   - Download the PNG

6. **Mobile**
   - Test the above flows on mobile
   - Check if writing flow works on small screens
   - Verify draft restore after refresh

7. **Trust Pages**
   - Read `/privacy`, `/terms`, `/support`
   - Note anything confusing or concerning

### Feedback Questions

Ask beta testers:

**Clarity:**
- Was anything confusing or unclear?
- Did you understand what each feature does?
- Were the trust pages (privacy/terms/support) clear?

**Trust:**
- Do you trust how Latergram handles your data?
- Do you trust the Late Letter delivery process?
- Do you trust the recipient controls (report/block/opt-out)?
- Would you feel comfortable using this for real private writing?

**Reliability:**
- Did anything break or fail?
- Did Late Letter delivery work?
- Did Memory Card export work?
- Did the mobile flow work?

**Safety:**
- Did anything feel unsafe or concerning?
- Are the boundaries (no emergencies, no crisis support) clear?
- Would you know how to report an abusive Late Letter if you received one?

**Overall:**
- Would you use Latergram for real?
- What would stop you from using it?
- What's the most confusing part?
- What's the most concerning part?

### Bug Reporting Workflow

**For beta testers:**
- Report bugs through the off-platform feedback channel (email, DM, etc.)
- Include: what you were doing, what happened, what you expected
- Do not include: private writing content, recipient emails, secure tokens

**For founder:**
- Triage bugs as they arrive
- Create GitHub issues using `.github/ISSUE_TEMPLATE/bug_report.md`
- Prioritize: critical (blocks core flow) > major (confusing/broken) > minor (polish)
- Fix critical bugs immediately
- Document fixes without committing private user data

### Safety Escalation Workflow

**If a beta tester reports:**
- Abusive Late Letter received
- Safety concern about another user
- Potential harm or crisis situation

**Founder response:**
1. Respond quickly (within 24 hours for safety issues)
2. If immediate danger: direct to emergency services (911, crisis hotline)
3. If abusive letter: verify report in database, consider blocking sender
4. If safety concern: investigate, document privately, take appropriate action
5. Create internal safety report using `.github/ISSUE_TEMPLATE/safety_report_internal.md`
6. Do not commit private details to repo

### Support Workflow

**Current support status:** Support inbox not configured (`SUPPORT_EMAIL_CONFIGURED = false`)

**During beta:**
- Handle support requests through the same off-platform channel used for invites
- Common requests: password reset help, delivery issues, data deletion
- Response time goal: 24-48 hours for non-urgent, <24 hours for safety

**After support inbox is configured:**
- Update `SUPPORT_EMAIL_CONFIGURED = true` in `src/app/constants.ts`
- Update BetaPage, SupportPage, PrivacyPage, TermsPage to remove "pending" language
- Document support workflow in `docs/launch-blockers.md`

### Data Deletion Request Workflow

**If a beta tester requests data deletion:**

1. Verify identity (confirm via original invite channel)
2. Delete user account and associated data:
   - Supabase Auth account
   - Private Lategrams in `private_lategrams` table
   - Time Since counters in `time_since_counters` table
   - Late Letters in `late_letters` table
   - Any Garden submissions if Garden was opened
3. Note: data may remain in database backups or Resend logs temporarily
4. Confirm deletion to user
5. Document process (without PII) in `docs/launch-blockers.md`

### Late Letter Delivery Test Workflow

**Prerequisites:**
- Resend API key configured in Supabase Edge Function secrets
- Resend sender domain verified
- Delivery cron job or manual trigger configured

**Test process:**
1. Schedule Late Letter to test recipient (with consent)
2. Trigger delivery job at scheduled time
3. Verify:
   - Letter status changes to "sending" then "sent"
   - Recipient receives email
   - Email contains secure link
   - Recipient can open letter
   - Sender status updates to "opened" after recipient opens
4. Test recipient controls:
   - Report letter
   - Block sender
   - Global opt-out
5. Verify blocks work: schedule another letter, verify it's blocked at send time

**Document results:**
- Delivery success rate
- Any delivery failures and reasons
- Recipient control functionality
- Do not commit recipient emails or letter content

### Memory Card Test Workflow

**Test across devices:**
- Desktop browser (Chrome, Firefox, Safari)
- Mobile browser (iOS Safari, Android Chrome)
- Different screen sizes

**Test all formats:**
- Square (1080x1080)
- Story (1080x1920)
- Wallpaper (1170x2532)

**Verify:**
- Card generates without errors
- Preview displays correctly
- Download works
- PNG file is valid
- Text is readable
- Layout is correct

### Mobile Test Workflow

**Test on real mobile devices:**
- iOS (iPhone)
- Android

**Test flows:**
- Sign up / sign in
- Write Latergram
- Create Time Since counter
- Schedule Late Letter
- Export Memory Card
- Navigate between sections
- Draft restore after refresh

**Check for:**
- Horizontal scroll issues
- Text input issues
- Button tap targets
- Viewport sizing
- Keyboard behavior

### Trust/Confusion Questions

**Ask beta testers:**
- Did you read the privacy policy? Was it clear?
- Did you read the terms? Was anything concerning?
- Did you understand the support page?
- Would you know how to delete your data?
- Would you know how to report an abusive letter?
- Is it clear that Latergram is not for emergencies?

### Stop/Pause Conditions

**Pause or stop the beta if:**
- Critical security vulnerability discovered
- Data loss or corruption occurs
- Late Letter delivery fails consistently
- Multiple reports of abusive letters
- Legal or safety concern arises
- Support requests exceed capacity to respond

**If paused:**
- Notify all beta testers
- Fix the issue
- Document the fix
- Resume only when safe

### Beta Success Criteria

**The beta is successful if:**
- 20-50 real users invited and tested
- Real feedback collected from at least 50% of testers
- Critical bugs identified and fixed
- Confusing flows identified and improved
- Late Letter delivery tested end-to-end with real recipients
- No major safety incidents
- Founder has confidence in core product flows

**Beta success does NOT require:**
- Perfect bug-free state
- 100% positive feedback
- Feature completeness
- Analytics data
- Large user count

### Beta Failure Criteria

**The beta fails if:**
- Core flows are too confusing for most testers
- Late Letter delivery doesn't work reliably
- Major safety incident occurs
- Trust pages are not trusted
- Data loss occurs
- Founder loses confidence in product readiness

**If beta fails:**
- Document what went wrong
- Fix critical issues
- Consider running another small beta
- Do not proceed to public launch until issues resolved

### Documenting Beta Results

**After beta completes, create:**
- `docs/beta-results-summary.md` (not created yet - create after real beta)

**Include in summary:**
- Beta dates
- Number of users invited/tested
- Key feedback themes
- Critical bugs found and fixed
- Confusing flows found and improved
- Late Letter delivery results
- Memory Card export results
- Mobile testing results
- Trust page feedback
- What changed based on beta feedback

**Do not include:**
- Real user names or emails
- Private writing content
- Real recipient emails
- Real letter text
- Secure tokens or links
- Auth IDs or database IDs
- Emotional or sensitive feedback verbatim

**Use instead:**
- Anonymized quotes ("One tester said...")
- Aggregated feedback ("3 testers found X confusing")
- Issue IDs for bugs
- Generic descriptions

---

## Launch Blocker Resolution

See `docs/launch-blockers.md` for complete launch blocker tracking.

**Critical blockers:**
1. Private beta execution (this runbook)
2. Support inbox configuration
3. Formal legal review

**Conditional blockers:**
4. Garden opening (if V1 includes Garden)

**Operational blockers:**
5. Production environment configuration
6. Manual end-to-end testing
7. Support workflow testing

---

## Production Environment Checklist

**Frontend Deployment:**
- [ ] Choose deployment platform (Vercel/Netlify/Cloudflare Pages)
- [ ] Create production project
- [ ] Configure build settings
- [ ] Set environment variables (see below)
- [ ] Deploy and verify
- [ ] Configure custom domain if applicable
- [ ] Test production build

**Supabase Production:**
- [ ] Create Supabase production project
- [ ] Apply all migrations from `supabase/migrations/`
- [ ] Verify schema matches development
- [ ] Configure RLS policies
- [ ] Deploy Edge Functions
- [ ] Configure Edge Function secrets (see below)
- [ ] Test database connectivity
- [ ] Test Edge Function execution

**Environment Variables (Frontend):**
```
VITE_SUPABASE_URL=<production-supabase-url>
VITE_SUPABASE_ANON_KEY=<production-anon-key>
VITE_ANALYTICS_ENABLED=false  # or true if configured
VITE_ANALYTICS_PROVIDER=plausible  # if enabled
VITE_PLAUSIBLE_DOMAIN=<your-domain>  # if enabled
VITE_PLAUSIBLE_SCRIPT_SRC=<plausible-script-url>  # if enabled
```

**Edge Function Secrets (Supabase):**
```
RESEND_API_KEY=<resend-api-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

**Resend Configuration:**
- [ ] Create Resend account
- [ ] Add and verify sender domain
- [ ] Generate API key
- [ ] Configure API key in Supabase Edge Function secrets
- [ ] Test email sending

**Delivery Job:**
- [ ] Configure Supabase cron job or external scheduler
- [ ] Set schedule (e.g., every 5 minutes)
- [ ] Test job execution
- [ ] Monitor job logs

**Security Checklist:**
- [ ] No secrets committed to repo
- [ ] Service role key only in server environment
- [ ] Anon key only in frontend environment
- [ ] RLS policies verified
- [ ] Edge Function auth verified
- [ ] CORS configured if needed

**Testing Checklist:**
- [ ] Test production auth flow
- [ ] Test production database writes
- [ ] Test Late Letter delivery
- [ ] Test recipient link opening
- [ ] Test Memory Card export
- [ ] Test all routes
- [ ] Test mobile flows

---

## Garden Decision

**Current Status:** Garden remains closed

**Decision:** Keep Garden closed for initial private beta and public launch V1.

**Rationale:**
- Garden moderation operations not staffed
- No real moderation queue testing
- No real report handling verification
- Opening Garden requires dedicated safety checkpoint beyond Phase 21 scope

**If Garden is required for V1:**
- Complete separate Garden safety checkpoint
- Staff moderation operations
- Test moderation queue end-to-end
- Test report handling
- Unlock Garden user-facing RPCs only after safety verification
- Update Garden UI to show available state
- Update privacy/support/docs with Garden moderation details
- Document Garden launch separately in `docs/garden-launch.md`

**Recommended:** Defer Garden to post-V1.

---

## Analytics Decision

**Current Status:** Analytics disabled by default

**Phase 19 instrumentation exists but:**
- No analytics provider configured
- `VITE_ANALYTICS_ENABLED` not set or set to `false`
- Analytics wrapper is a no-op when disabled

**If enabling analytics:**
- Choose privacy-respecting provider (Plausible recommended)
- Configure environment variables
- Update privacy policy with provider details
- Test analytics events
- Verify no sensitive data tracked (no message content, recipient data, tokens, IDs, Garden content, card text)
- Document analytics configuration in `docs/launch-blockers.md`

**Recommended:** Keep analytics disabled for initial beta, enable only if needed for launch.

---

## Support Inbox Status

**Current Status:** Not configured

`SUPPORT_EMAIL = "support@latergram.app"`  
`SUPPORT_EMAIL_CONFIGURED = false`

**To configure:**
1. Set up email forwarding or inbox access for support@latergram.app
2. Test inbox receives mail
3. Document support workflow
4. Update `SUPPORT_EMAIL_CONFIGURED = true` in `src/app/constants.ts`
5. Update BetaPage, SupportPage, PrivacyPage, TermsPage to remove "pending" language
6. Update `docs/launch-blockers.md` to mark blocker resolved

**Do not:**
- Configure DNS or email secrets in repo
- Commit credentials
- Add fake support form
- Pretend support is ready if it's not

---

## Legal Review Status

**Current Status:** Pending

**Required:**
- Legal review of privacy policy
- Legal review of terms of service
- Review of data deletion process
- Review of recipient email handling
- Review of Resend/provider disclosures
- Review of analytics disclosures (if enabled)
- Age/jurisdiction assessment
- GDPR/CCPA assessment if applicable

**To complete:**
1. Engage legal counsel or legal review service
2. Provide privacy policy, terms, and data handling documentation
3. Incorporate feedback
4. Document that review occurred (without committing privileged notes)
5. Update pages to remove disclaimers if appropriate
6. Update `docs/launch-blockers.md` to mark blocker resolved

**Do not:**
- Claim HIPAA/GDPR/CCPA compliance without verification
- Remove legal disclaimers without actual review
- Invent compliance claims

---

## Verification Checklist

After Phase 21 implementation:

**Build:**
- [x] `npm install` completed
- [x] `npm run build` passed
- [x] No build errors

**Files:**
- [x] `docs/phase-21-private-beta-execution.md` created
- [x] `docs/launch-blockers.md` created
- [x] `docs/manual-testing-template.md` created
- [x] `.github/ISSUE_TEMPLATE/` directory created
- [x] Beta feedback, bug report, safety report templates created
- [x] README.md updated with Phase 21 status
- [x] No package.json changes
- [x] No Supabase file changes

**Status:**
- [x] NO-LAUNCH status preserved
- [x] `SUPPORT_EMAIL_CONFIGURED` remains `false`
- [x] Garden remains closed
- [x] Analytics remains disabled by default
- [x] No fake beta results added
- [x] No fake support infrastructure added
- [x] No fake legal review claims added

**Routes (if copy changed):**
- [ ] `/` - Landing
- [ ] `/auth` - Auth
- [ ] `/app` - Home
- [ ] `/privacy` - Privacy
- [ ] `/terms` - Terms
- [ ] `/support` - Support
- [ ] `/beta` - Beta
- [ ] `/letter/invalid` - Recipient unavailable
- [ ] `/invalid` - 404

---

## Next Steps

**Before public launch:**

1. **Execute private beta:**
   - Follow this runbook
   - Invite 20-50 real users
   - Collect real feedback
   - Fix critical bugs
   - Document results

2. **Configure support inbox:**
   - Set up support@latergram.app
   - Test inbox
   - Update constant and UI

3. **Complete legal review:**
   - Engage legal counsel
   - Review privacy/terms
   - Incorporate feedback
   - Document completion

4. **Configure production environment:**
   - Deploy frontend
   - Configure Supabase production
   - Configure Resend
   - Test end-to-end

5. **Complete manual testing:**
   - Follow `docs/manual-testing-template.md`
   - Document results
   - Fix issues found

6. **Decide on Garden:**
   - Defer to post-V1 (recommended)
   - OR complete Garden safety checkpoint

7. **Decide on analytics:**
   - Keep disabled (recommended for initial launch)
   - OR configure privacy-respecting provider

8. **Final launch decision:**
   - Review `docs/launch-blockers.md`
   - Verify all critical blockers resolved
   - Make launch/no-launch decision

---

## Remaining Risks

- Private beta has not been executed yet
- Support inbox not configured
- Legal review not completed
- Production environment not configured
- Manual testing not completed
- Garden remains closed (conditional blocker)
- Late Letter delivery not tested in production

---

## Phase 21 Result

**Status:** Phase 21 implementation complete

**Deliverables:**
- Private beta execution runbook
- Launch blocker tracking system
- Manual testing template
- GitHub issue templates
- Production environment checklist

**What was NOT done:**
- Actual private beta execution (must be done separately)
- Support inbox configuration (blocker remains)
- Legal review (blocker remains)
- Production deployment (blocker remains)
- Garden opening (remains closed)
- Analytics configuration (remains disabled)

**Launch Status:** NO-LAUNCH (unchanged)

**Next Phase:** Execute private beta per this runbook, then resolve remaining launch blockers.
