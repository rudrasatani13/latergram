# Phase 18: Private Beta Readiness

Date: 2026-05-16

## Summary

Phase 18 prepares Latergram for a small, controlled private beta with 20 to 50 real users. This phase does not publicly launch Latergram and does not claim that real beta testing has already happened.

The implementation adds an honest `/beta` page, subtle private beta notices on entry/app surfaces, and this founder-facing checklist. It keeps access manual for now, keeps the Garden closed, keeps support email marked pending, and avoids fake beta users, fake waitlist counts, fake feedback, fake Garden activity, fake analytics, and fake delivery success.

## Implementation Summary

- Added `/beta` route and `BetaPage`.
- Added private beta notes to landing, auth, and signed-in app home surfaces.
- Added `Private beta` to the trust footer.
- Updated the closed Garden state to say Garden testing needs a separate safety checkpoint.
- Added a 10-second timeout fallback around recipient letter Edge Function calls so `/letter/:token` does not stay on the opening state if the function request does not return.
- Updated README Phase 18 status after implementation.
- No Supabase schema, policy, function, or migration changes were made.
- No package dependency changes were made.

## Beta Access Strategy

Chosen strategy: **Option A, direct-link private beta with manual invite distribution.**

Latergram remains reachable by direct link. There is no real Supabase-backed beta allowlist or invite-code gate yet. Because no real server-side gate was added, the app does not pretend invite enforcement exists.

Private beta access must be managed manually and off-platform:

- Invite only 20 to 50 real users.
- Send links directly to selected testers.
- Do not publish broad public signup links.
- Do not claim beta capacity, queue position, invite counts, or tester counts in product UI.
- If real access gating is needed later, implement it server-side with Supabase records and RLS before using it as a security boundary.

## `/beta` Route

Status: added.

The `/beta` page explains:

- Private beta is not public launch.
- Access is manual by direct link.
- What testers should test.
- What features are included.
- What features are excluded.
- Garden remains closed.
- How to report issues while support email is pending.
- Privacy, safety, and emergency boundaries.
- Links to `/privacy`, `/terms`, `/support`, and `/app`.

The page does not include:

- A fake waitlist form.
- A fake signup queue.
- Fake user counts.
- Fake testimonials.
- A fake support form.
- Fake analytics or launch claims.

## Support and Feedback Path

`SUPPORT_EMAIL_CONFIGURED` remains `false`.

The beta feedback path is intentionally manual:

- Beta testers should report bugs, confusion, trust concerns, and delivery issues through the real off-platform channel used to invite them.
- If the support inbox becomes real, set `SUPPORT_EMAIL_CONFIGURED = true` and update this document.
- Until then, UI copy continues to say the support inbox is pending before public launch.
- Do not ask testers to send private emotional content as feedback.
- Ask about clarity, trust, bugs, safety, and confusion instead.

## Garden Private Beta Decision

Chosen path: **Path A, keep Garden closed for the initial private beta.**

Reason:

- No real server-side beta gate was implemented in this phase.
- Phase 17 re-locked Garden user-facing RPC execution from authenticated users.
- Anonymous Garden execution remains locked.
- The Garden is the highest safety-risk product area.

The Garden may be considered for a later private safety checkpoint only if:

- Real beta access gating exists server-side.
- No anonymous access is granted.
- Garden posts start pending and are not auto-approved.
- Moderator/admin review operations are actively staffed.
- Reports and reactions are tested with real approved posts only.
- No raw `user_id`, `reporter_user_id`, or `anonymous_fingerprint_hash` is exposed.
- Migrations pass local reset, lint, linked migration list checks, and dry-run review before any remote push.

## Beta Goals

- Learn whether writing feels calm and safe.
- Learn whether users understand local-only vs account-backed storage.
- Confirm account flows work for real users.
- Confirm Late Letter delivery works in the real configured environment.
- Confirm recipient controls are understandable and functional.
- Confirm Memory Card export works from real saved content.
- Identify every confusing flow before public launch.
- Identify mobile writing issues before public launch.

## Target Users

Target size: 20 to 50 real users.

Invite criteria:

- People willing to test thoughtfully and report issues.
- People who understand Latergram is private beta, not a public service.
- People who can test on mobile and desktop if possible.
- People who agree not to use Latergram for emergencies, harassment, spam, or urgent communication.
- People who can schedule Late Letters only to themselves or trusted test recipients.

Do not commit real user names, emails, feedback quotes, or private content into the repo.

## Onboarding Checklist

- Tell testers this is private beta, not public launch.
- Share `/beta`, `/privacy`, `/terms`, and `/support`.
- Explain that the support inbox is pending unless `SUPPORT_EMAIL_CONFIGURED` has been changed to `true`.
- Explain that access is manual by direct link and not invite-code gated yet.
- Ask testers not to send private emotional content as feedback.
- Ask testers to use self or trusted recipients for Late Letter delivery.
- Ask testers not to test emergencies, crisis use, harassment, spam, or unwanted recipient scenarios.
- Confirm testers know Garden is closed.

## Beta User Test Script

Ask testers to try these tasks with real but non-sensitive content:

- Sign up, sign in, sign out, and request a password reset.
- Write a Latergram.
- Save private writing locally while signed out.
- Save private writing to an account while signed in.
- Import local saves into an account if relevant.
- Create a Time Since counter.
- Export a Memory Card from a saved Lategram or saved Time Since counter.
- Schedule a Late Letter to themselves or to a trusted test recipient.
- Confirm the scheduled letter appears in their account.
- Cancel one scheduled Late Letter before send.
- Let one Late Letter send through the configured delivery job.
- Open the secure recipient link from the delivered email.
- Use recipient report, sender block, and global opt-out controls.
- Try the mobile writing flow.
- Refresh during writing and confirm draft restore behaves clearly.
- Visit `/privacy`, `/terms`, `/support`, and `/beta`.

## Feedback Questions

Ask:

- Did the writing surface feel calm?
- Did you understand what was saved locally vs saved to your account?
- Did you trust the app with the content you chose to test?
- Did any copy feel misleading, too vague, or overconfident?
- Did any action feel risky or irreversible without warning?
- Was Late Letter scheduling clear?
- Did the recipient email privacy explanation make sense?
- Did Memory Card export make sense?
- Did anything break on your phone?
- Did you know how to report a problem?

Do not ask testers to share private emotional content with the founder.

## Late Letter Delivery Test Plan

Use only real test messages sent to the sender or a trusted recipient.

For each delivery test:

- Schedule a Late Letter from a signed-in account.
- Confirm the `late_letters` row exists with `status = scheduled`.
- Confirm the delivery job runs only when server secrets and cron are configured.
- Confirm Resend returns a real send result and message ID.
- Confirm the recipient email arrives.
- Open the `/letter/:token` link from the email.
- Confirm `opened_at` and sender-visible status update from real database state.
- Confirm recipient report creates a real report.
- Confirm sender-specific block prevents future letters from that sender.
- Confirm global opt-out prevents future letters to that email.
- Confirm sender identity and raw recipient email are not leaked to the recipient.
- Confirm a scheduled letter can be cancelled before send.
- Do not create fake sent, delivered, opened, or failed states.

## Garden Safety Test Plan

Initial Phase 18 decision: Garden remains closed.

Checks:

- `/app?section=garden` shows the closed Garden state.
- No public Garden posts are shown.
- No Garden submit UI is shown.
- No Garden reaction or report UI is shown.
- Anonymous Garden RPC execution remains locked.
- User-facing Garden RPC execution remains locked from authenticated after Phase 17.
- Moderator/admin RPCs remain internally guarded.

Garden testing is deferred until a separate gated safety checkpoint.

## Memory Card Test Plan

- Create or use a real saved Lategram.
- Create or use a real saved Time Since counter.
- Open Memory Cards.
- Confirm no source is selected automatically.
- Select one real source, one format, and one style.
- Export square, story, and wallpaper formats.
- Confirm export text does not include raw recipient email, user IDs, tokens, Garden metadata, or delivery state.
- Confirm no saved card history is created.
- Confirm no upload, sharing, analytics, or cloud sync occurs.

## Mobile Test Plan

Check widths:

- 320px
- 375px
- 390px
- 414px
- 768px

Routes and flows:

- `/`
- `/auth`
- `/app`
- `/app?section=private`
- `/app?section=later`
- `/app?section=time`
- `/app?section=memory`
- `/app?section=garden`
- `/privacy`
- `/terms`
- `/support`
- `/beta`
- `/letter/not-a-real-token`
- `/not-a-real-route`

Watch for text overflow, button overflow, horizontal scrolling, sticky nav collisions, and confusing beta/support copy.

## Safety Monitoring Plan

- Review Late Letter safety reports.
- Review recipient sender blocks and global opt-outs.
- Pause beta if abusive, threatening, or unwanted recipient behavior appears.
- Pause beta if delivery creates misleading sender states.
- Pause beta if support requests cannot be handled while the inbox is pending.
- Pause beta if privacy or deletion requests cannot be completed manually.
- Keep Garden closed unless real gating and moderator operations are ready.
- Direct crisis or emergency needs away from Latergram and toward local emergency services or trusted nearby people.

## Abuse Handling

- Abusive Late Letters should be handled through recipient reports, sender-specific blocks, global opt-outs, and manual support review.
- Recipient reports should be reviewed from database records until a later admin UI exists.
- Sender identity should not be disclosed to recipients through report or opt-out handling.
- Recipient opt-outs and sender blocks must be respected before future sends.
- Accounts used for harassment, spam, impersonation, or illegal content should be suspended or removed manually as needed.

## User Deletion Requests

- Local/device data can be removed in app or by clearing browser storage.
- Individual account Lategrams and counters can be removed in app.
- Late Letters can be cancelled before send.
- Full account deletion remains manual through support.
- Because the support inbox is pending, deletion requests during beta must be handled through the real off-platform invite/support channel until the inbox is configured.

## Rollback and Stop Conditions

Pause or stop the beta if:

- Late Letter delivery sends to unintended recipients.
- Recipient report/block/opt-out controls fail.
- Sender UI shows fake or incorrect delivery/open states.
- Raw recipient email, sender identity, tokens, user IDs, or private content leak where they should not.
- Garden becomes reachable publicly or anonymously.
- Support/deletion requests cannot be handled safely.
- Users misunderstand Latergram as therapy, crisis support, or guaranteed delivery.
- Mobile writing loses drafts or blocks core use.
- Any security migration drift appears.

## Known Limitations

- No real invite-code or allowlist gating yet.
- Support inbox remains pending.
- Garden remains closed.
- No moderator/admin web UI.
- No analytics or error monitoring provider yet.
- No self-serve full account deletion.
- Late Letter reliability depends on Supabase Edge Function secrets, Resend configuration, and the delivery job.
- Legal review of privacy and terms remains pending.

## Commands Run and Results

Baseline before edits:

```bash
git status --short
git log --oneline -5
npm install
npm run build
```

Results:

- `git status --short`: clean before edits.
- `git log --oneline -5`: latest commit was `f40a416 feat: add SUPPORT_EMAIL_CONFIGURED constant and conditionally display pending status on support pages`.
- `npm install`: completed, no package changes; reported one existing high severity audit item. `npm audit fix --force` was not run.
- Baseline `npm run build`: passed.

Implementation verification:

```bash
npm run build
```

Result:

- Passed.

## Supabase Verification

No Supabase schema, function, policy, or migration files were changed in this phase.

Because no Supabase files were touched, the Phase 18 implementation does not require:

- `npx supabase db reset`
- `npx supabase db lint`
- `npx supabase migration list --linked`
- `npx supabase db push --dry-run`

If a later beta gate or Garden opening changes Supabase files, run the full Supabase verification checklist before any remote push.

## Manual Checks

Checked in the local browser at `http://127.0.0.1:5173`.

Routes checked:

- `/`
- `/auth`
- `/app`
- `/app?section=garden`
- `/app?section=later`
- `/app?section=memory`
- `/privacy`
- `/terms`
- `/support`
- `/beta`
- `/letter/not-a-real-token`
- `/not-a-real-route`

Results:

- 66 normal route and viewport checks passed with no horizontal overflow.
- `/letter/not-a-real-token` resolves to the existing honest unavailable state at default width and at 320px, 375px, 390px, 414px, and 768px.
- Browser back/forward between `/beta` and `/privacy` worked.
- No browser console errors were observed during the route checks.
- Garden remained closed in `/app?section=garden`.
- Memory Card and Late Letter sections remained reachable with real-data-backed states only.
- No fake beta users, fake feedback, fake support form, fake support inbox, fake analytics, or public launch behavior was added.

## Remaining Risks

- Direct-link access is not a real security gate.
- Support requests need a real off-platform handling channel until the support inbox is configured.
- Late Letter delivery needs real environment and provider checks outside the repo.
- Garden safety still needs a separate gated beta plan before any opening.
- No analytics or error monitoring provider exists yet, so beta observation relies on direct feedback and manual checks.

## Before Phase 19 or Public Launch

- Invite and observe 20 to 50 real beta users.
- Fix confusing flows found in beta.
- Configure the real support inbox or document an equivalent real support process.
- Complete a real Late Letter delivery pass.
- Decide whether to build server-side beta gating before any larger rollout.
- Keep Garden closed or complete a separate gated Garden safety checkpoint.
- Add privacy-respecting analytics only in Phase 19.
- Complete legal review before public launch.
