# Latergram Master Plan V2

**Product name:** Latergram
**Repository:** `rudrasatani13/latergram`
**Document type:** Master plan — redesigned
**Development rule:** Live-only product development. No demo content, no fake states, no mock data, no placeholder product claims.

---

## 0. Master Rule

Latergram must be built as a real product.

From this point onward:

- No demo user data.
- No fake Garden posts.
- No fake saved Lategrams.
- No fake scheduled letters.
- No fake opened/delivered statuses.
- No fake counters.
- No fake memory-card sources.
- No fake analytics numbers.
- No fake account-backed behavior.
- No "coming soon" feature cards pretending to be active product areas.

If a feature is not live, it must either:

1. Stay hidden from the main product experience, or
2. Show a clean live-ready empty state, or
3. Be clearly unavailable without pretending it works.

The product should never lie to the user.

---

## 1. Product Vision

Latergram is a soft emotional writing app for words, memories, and feelings that arrive late.

It is for people who want to:

- Write something they could not say earlier.
- Keep emotional notes privately.
- Send a letter later.
- Save meaningful memories.
- Mark time since something important happened.
- Share a beautiful memory card.
- Release an anonymous feeling safely into a public Garden.

Latergram is not a normal messaging app.

It should not become:

- A chat app.
- A dating app.
- A gossip app.
- A confession drama app.
- A public popularity platform.
- A productivity dashboard.
- A therapy replacement.

Latergram should feel like:

- A private diary.
- A soft digital letter.
- A flower attached to a feeling.
- A keepsake box.
- A quiet emotional place.
- A calm alternative to fast social media.

Core feeling:

> Some words arrive late. Latergram gives them a place.

---

## 2. Solo Founder Constraints

Latergram is being built by one person.

This plan acknowledges that directly.

**Rules for solo development:**

- No phase should be started before the previous phase is honestly complete.
- A feature is not done because it looks done. It is done when it works end-to-end with real data.
- Phases can be compressed or skipped only if explicitly decided and documented.
- No phase adds complexity to impress. Every phase must make the product more real.

**Minimum Viable Launch definition:**

The following phases are mandatory before public launch. Everything else is post-launch or optional at that point:

Phase 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

Phase 16 onward is growth, polish, and monetization territory.

This means: write flow, private storage, real accounts, real database, real letter delivery, real Garden with safety, and mobile readiness — that is the real V1.

---

## 3. Monetization Hypothesis

Monetization must be decided before significant build time is spent, not after 22 phases.

**Current hypothesis:** Latergram earns through optional premium customization — extra themes, extra flowers, extra card styles, extra paper surfaces. The core writing experience stays free permanently.

**What must be validated before building payments:**

- Real users regularly return to write.
- Real users have content they care about preserving.
- Real users express desire for personalization or export features.
- The free product is meaningfully useful without payment.

**Rule:** Premium features will not be built until the free product has been validated by real users in private beta. No payment infrastructure before Phase 17.

---

## 4. Product Principles

### 4.1 Honesty

Latergram must never show fake activity as real.

If no user content exists, show empty states.

If email delivery is not connected, do not say a letter is scheduled, sent, delivered, or opened.

If Garden backend is not connected, do not show public Garden posts as if real people wrote them.

If card export is not implemented, do not show a download action as if it works.

### 4.2 Privacy

Private writing must stay private.

Latergram must clearly separate:

- Private Lategrams.
- Late Letters.
- Public Garden posts.
- Time Since counters.
- Memory Cards.
- Received Letters.

No private content should become public by accident.

### 4.3 Emotional Safety

Latergram handles sensitive feelings.

The app should be gentle, but not manipulative.

It must not promise healing, closure, forgiveness, replies, or therapy.

Allowed tone:

- Write when you are ready.
- Keep this private.
- Send it later.
- Plant this anonymously.
- Your memories belong to you.
- Open when you are ready.

Avoid:

- Overdramatic claims.
- Therapy-like language.
- Pressure to send.
- Public popularity mechanics.
- Shame, guilt, or emotional manipulation.

### 4.4 Live-Only Development

Every phase should move the app closer to real use.

Prototype-only screens should not remain in the production app.

If something cannot be made live in the current phase, the product must show an honest empty state or hide that feature entirely.

### 4.5 Garden Safety First

The Garden is a public anonymous emotional space. Public anonymous emotional spaces attract abuse. This has been proven repeatedly by products that launched first and added safety later.

**Rule:** The Garden will not go live until Phase 13 safety work is fully complete. The Garden backend (Phase 12) may be built, but the Garden will not be visible to users until safety infrastructure exists.

---

## 5. Product Areas

### 5.1 Landing Page

Explains Latergram softly and clearly.

Must not show fake traction, fake users, fake message counts, or fake community activity.

### 5.2 Auth

Real accounts, real sessions, real recovery.

Until auth is live, the UI must not pretend the user is signed in or that account data exists.

### 5.3 Write a Latergram

The heart of the app. Calm and distraction-free.

### 5.4 Keep Private / Keepsake Box

Private saving. Device-local first, then account-backed.

The UI must clearly tell the user where their content is saved.

### 5.5 Late Letters

A message scheduled to arrive later.

This feature requires: saved content, recipient handling, scheduled delivery system, secure open link, cancellation before delivery, bounce handling, and recipient opt-out.

It is only live when all of those work end-to-end.

### 5.6 The Garden

A public anonymous emotional wall.

It is only live when: backend exists, moderation states exist, reporting exists, abuse prevention exists, and safety review is complete.

**The Garden does not launch before safety infrastructure is in place.**

### 5.7 Time Since

Emotional day counter. Saved per user, editable and deletable.

### 5.8 Memory Cards

Real exportable cards from real content only.

Not live until card generation and export actually works.

### 5.9 Asset Hosting

All product assets — flowers, icons, logos, decor — must be served from a controlled, stable source before public launch.

Assets served from raw GitHub URLs are not production-grade. A CDN or self-hosted asset path must be in place before Phase 15.

---

## 6. Phase Roadmap

---

## Phase 0: User Research and Validation

**Goal:** Confirm the problem is real before building 26 phases.

This phase costs almost nothing. Skipping it is the most expensive mistake possible.

### Phase 0 Scope

- Identify 10 to 15 real people who have experienced feeling like they had something to say but said it too late, or never at all.
- Talk to them. Do not pitch Latergram. Ask about the experience.
- Ask: what did you do with that feeling? Did you write it down? Where? Did you wish you had sent it?
- Identify what specific thing they would actually use. Writing privately? Sending later? Sharing anonymously?
- Find out which of the six product areas resonates most strongly.
- Decide: is there a primary use case that should lead the product?
- Document what you found.

### Phase 0 Result

A written summary of who Latergram is for, what problem it solves for them specifically, and which feature is the strongest entry point. This becomes the foundation for every product decision after this point.

### Phase 0 Rule

If research reveals that the core problem is not real or that no one would actually use the product, that is valuable information and the plan should be adjusted before building.

---

## Phase 1: Live Baseline Cleanup

**Goal:** Make the existing app honest and ready for real development.

### Phase 1 Scope

- Clean project identity and README.
- Audit all existing pages and components.
- Remove all fake user data from product UI.
- Remove all fake Garden posts.
- Remove fake scheduled/opened Late Letters.
- Remove fake Time Since counters.
- Remove fake Memory Card sources.
- Remove fake download/export claims.
- Remove prototype-style generated wording from user-facing UI.
- Remove all seed data arrays from components.
- Fix duplicate Composer component in HomePage.tsx.
- Replace all fake content with honest empty states.
- Audit external asset URLs — document which are served from raw GitHub and flag them for future migration.
- Document what is live, what is not live, and what comes next.

### Phase 1 Result

Latergram looks like a real app shell with honest empty states and clean product identity. No screen lies about what is possible.

---

## Phase 2: Design System Stabilization

**Goal:** Make the visual system reusable, consistent, and production-ready.

### Phase 2 Scope

- Standardize color tokens — confirm the full Lategram palette is consistently used.
- Standardize typography scale.
- Standardize buttons, states, and hover behavior.
- Standardize card and paper surface styles.
- Standardize empty state design.
- Standardize form fields and input behavior.
- Standardize navigation patterns.
- Standardize mobile spacing and tap targets.
- Make flower and letter visuals consistent across all pages.
- Move shared components to a stable location — remove duplicates.
- Decide on the asset hosting strategy and begin migration plan from raw GitHub URLs.

### Phase 2 Result

Latergram has a stable design system. New features can be built without messy one-off UI.

---

## Phase 3: App Structure and Navigation

**Goal:** Turn the app from a useState page-switcher into a real structured frontend.

### Phase 3 Scope

- Add real route-based navigation using React Router.
- Separate landing, auth, and app areas cleanly.
- Create a stable app shell.
- Ensure browser back button works.
- Ensure URLs are shareable where appropriate.
- Make mobile navigation usable — add bottom nav or drawer for app area.
- Remove unused and duplicate components.
- Keep the product visually consistent throughout.

### Phase 3 Result

Latergram has a maintainable frontend structure with real navigation and clean page boundaries.

---

## Phase 4: Write Flow Live V1

**Goal:** Make writing a Latergram complete and real.

### Phase 4 Scope

- Build a complete write flow.
- Let user write a message.
- Let user add a recipient label.
- Let user choose mood or flower.
- Let user choose what happens next — save privately, schedule for later, plant in Garden.
- Keep copy gentle and clear.
- Do not pretend unsupported outcomes are live.
- Do not lose user input during the flow.
- Handle empty and error states gracefully.

### Phase 4 Result

A user can write a real Latergram draft and choose its intended destination.

---

## Phase 5: Device Storage Foundation

**Goal:** Save real user-created content on the current device before account-backed storage exists.

### Phase 5 Scope

- Save real drafts to device/browser storage.
- Save private Latergrams locally.
- Save local Time Since counters.
- Load saved content correctly after page refresh.
- Allow deletion of saved items.
- Handle storage errors and storage-full states.
- Clearly communicate to the user that content is saved only on this device.
- Never imply cloud sync exists when it does not.

### Phase 5 Result

Latergram holds real user content locally without pretending backend sync exists.

---

## Phase 6: Keepsake Box Live V1

**Goal:** Make the Keepsake Box show only real saved content.

### Phase 6 Scope

- Show real private Latergrams from device storage.
- Show real local drafts.
- Show real Time Since counters.
- Show honest empty states for any section with no content.
- Allow opening and reading saved items.
- Allow deleting saved items.
- Never show seeded or demo content.
- Sections for features not yet live must show a clear unavailable state — not a fake empty state that implies the feature works.

### Phase 6 Result

Keepsake Box becomes a real private archive for the user's own content.

---

## Phase 7: Auth Live Foundation

**Goal:** Add real accounts.

### Phase 7 Scope

- Choose one auth provider — Supabase Auth or Clerk recommended for solo development.
- Add real sign up with email.
- Add real sign in.
- Add real sign out.
- Add password reset.
- Persist sessions across page refreshes.
- Show correct account state in the UI at all times.
- Protect private account areas with auth checks.
- Do not commit secrets. Use environment variables.
- Handle auth errors gracefully — wrong password, expired session, network failure.

### Phase 7 Result

Users can create accounts and return to Latergram with a real authenticated session.

---

## Phase 8: Database and Security Model

**Goal:** Create the real data foundation.

### Phase 8 Scope

- Choose database — PostgreSQL via Supabase recommended.
- Create user profile model.
- Create private Latergram model.
- Create Late Letter model with all fields needed for real delivery.
- Create Garden post model with moderation state field.
- Create Time Since counter model.
- Create Memory Card model.
- Create report and safety model.
- Define row-level security rules — users can only access their own private content.
- Define what Garden content is publicly visible — only posts with approved moderation state.
- Test access rules before moving on.
- Document the data model.

### Phase 8 Result

Latergram has a secure database structure ready for real content persistence.

---

## Phase 9: Account-Backed Private Storage

**Goal:** Save private user content to the account database.

### Phase 9 Scope

- Save private Latergrams to the backend for signed-in users.
- Load a user's private Latergrams from the backend.
- Update and delete private Latergrams.
- Save Time Since counters to the backend.
- Load Time Since counters.
- Handle migration from device-local content — offer the user a clear choice to move local content to their account, never do it silently.
- Keepsake Box should now reflect account-backed content for signed-in users.

### Phase 9 Result

Signed-in users can save and return to their private Latergram content across sessions and devices.

---

## Phase 10: Late Letters Scheduling

**Goal:** Store real scheduled letters.

This phase stores scheduled letter records. It does not count as complete delivery without Phase 11.

### Phase 10 Scope

- Create Late Letter compose flow.
- Store recipient name and email carefully — treat recipient email as sensitive PII.
- Store scheduled delivery date and time.
- Store message body securely.
- Show real scheduled letters for the signed-in user.
- Allow cancellation before delivery with clear confirmation.
- Show honest status — scheduled, sent, opened. Never show a status that is not backed by real data.
- Do not display recipient email in full in the UI after saving.

### Phase 10 Result

Users can create real scheduled Late Letter records. No delivery happens yet but records are real.

---

## Phase 11: Real Letter Delivery

**Goal:** Make Late Letters actually arrive.

### Phase 11 Scope

- Choose an email delivery provider — Resend or Postmark recommended. Do not use raw SMTP.
- Build a scheduled job or cron system to check for letters due to be sent.
- Generate a secure unique recipient open link for each letter.
- Build the recipient letter page — this is the page the recipient sees when they open the link.
- Track delivery status using provider webhooks — sent, bounced, failed.
- Track opened status only if technically reliable — do not show false opened statuses.
- Handle failed delivery — retry logic, sender notification, honest status.
- Allow cancellation before delivery timestamp.
- Add recipient safety path — allow recipients to report, block future letters, or opt out.
- Define and document data retention — how long are recipient emails stored? When are they deleted after delivery?
- Comply with anti-spam requirements for transactional email.
- Test end-to-end before marking this phase complete.

### Phase 11 Result

Latergram's delayed-letter promise becomes real. A user can write a letter, schedule it, and it actually arrives.

---

## Phase 12: Garden Backend

**Goal:** Build the backend for The Garden.

**Important:** The Garden UI will not be made visible to users until Phase 13 safety work is complete. This phase only builds the backend infrastructure.

### Phase 12 Scope

- Build the API for submitting Garden posts.
- Store posts with moderation state — pending, approved, rejected.
- Build the API for reading approved public Garden posts.
- Build the "felt this" reaction with duplicate prevention.
- Build the report action.
- All submitted posts start in pending state. No post is public until approved.
- Build category filtering.
- Do not expose any user identity in Garden posts — anonymity must be real, not cosmetic.
- Test that no private user data is attached to any public Garden response.

### Phase 12 Result

Garden backend is real and ready. The Garden remains hidden from users until Phase 13 is complete.

---

## Phase 13: Safety and Moderation

**Goal:** Protect Latergram and its users from abuse before anything public goes live.

This phase is mandatory before the Garden is visible to any user.

### Phase 13 Scope

- Build a basic moderation queue for Garden posts.
- Define moderation criteria — what gets approved, what gets rejected.
- Build the report flow for Garden posts.
- Build the process for handling reported content — review, removal, response.
- Add rate limiting on Garden submissions per user and per IP.
- Add basic content filtering for the most obvious violations.
- Define what constitutes a safety violation clearly — document it.
- Add sender protection for Late Letters — cancel window, reporting path.
- Add recipient protection — opt-out from future letters from a sender, report path.
- Build basic admin review capability — even if only via direct database access at this stage.
- Test the full abuse cycle before marking this phase complete.

### Phase 13 Result

Latergram has the safety foundation needed to open the Garden to real users. The Garden is now enabled.

---

## Phase 14: Mobile Polish

**Goal:** Make Latergram feel excellent on mobile before public launch.

This is a mandatory pre-launch phase. Most emotional writing happens on phones.

### Phase 14 Scope

- Migrate all product assets from raw GitHub URLs to a proper CDN or self-hosted path.
- Fix mobile navigation — implement bottom nav or accessible drawer.
- Fix the writing experience on small screens — textarea, line height, keyboard behavior.
- Fix auth screens on mobile.
- Fix Keepsake Box browsing on mobile.
- Fix Garden browsing and submission on mobile.
- Fix the recipient letter page on mobile.
- Fix card view on mobile.
- Fix all overflow and touch target issues found during audit.
- Test on real devices — at least one iOS and one Android.

### Phase 14 Result

Latergram feels smooth and honest on mobile. No broken layouts, no cut-off content, no untouchable buttons.

---

## Phase 15: Performance and Error Handling

**Goal:** Make the app reliable before inviting real users.

### Phase 15 Scope

- Audit and fix loading states — every async action needs a loading state.
- Audit and fix error states — every async action needs an error state.
- Add network failure handling — what happens when the user goes offline mid-write?
- Add auto-save or draft recovery for the write flow.
- Reduce unnecessary re-renders.
- Audit asset load performance — large images, unused imports.
- Confirm the app does not crash or lose content on page refresh.
- Confirm Keepsake Box loads correctly for users with a lot of content.

### Phase 15 Result

Latergram is stable and reliable enough for real users to trust it with their emotional content.

---

## Phase 16: Memory Card Export

**Goal:** Let users export real memory cards.

### Phase 16 Scope

- Generate cards from real Latergrams or real Time Since counters only.
- Support square, story, and wallpaper formats.
- Export as real downloadable image.
- Ensure no private content leaks into shared cards — user must explicitly choose what goes on a card.
- Keep branding soft and minimal on exported cards.
- Save card metadata to the user's account if they want to return to it.

### Phase 16 Result

Users can create and download real Latergram memory cards.

---

## Phase 17: Privacy, Terms, and Support

**Goal:** Prepare trust pages and user support before public launch.

### Phase 17 Scope

- Write and publish a real privacy policy — not template boilerplate. Specifically address: what emotional content is stored, who can see it, how long it is kept, how it is deleted.
- Write and publish terms of service.
- Add a contact or support page.
- Add an abuse and report support path.
- Add a clear data deletion explanation — how does a user delete their account and all their content?
- Add a clear statement that Latergram is not a therapy service.
- Add a clear statement that recipient email addresses are treated as sensitive and are not used for marketing.

### Phase 17 Result

Latergram has honest, specific trust and support pages. Users know what they are agreeing to.

---

## Phase 18: Private Beta

**Goal:** Test with a small number of real users before public launch.

### Phase 18 Scope

- Invite 20 to 50 real users — people from Phase 0 research ideally.
- Give them access to the full write flow, private storage, accounts, Late Letters, and Garden.
- Observe what they do and what they do not do.
- Ask specifically: did the writing feel calm? Did you trust the app with your content? Did anything feel confusing or broken?
- Fix every confusing flow before public launch.
- Fix every bug found.
- Validate that Late Letters actually deliver correctly.
- Validate that the Garden functions safely with real people.
- Document what worked and what needs improvement.

### Phase 18 Result

Latergram is validated with real users. The product is ready for public launch.

---

## Phase 19: Analytics — Privacy-Respecting

**Goal:** Learn from usage without reading people's emotional content.

### Phase 19 Scope

- Choose an analytics provider that does not track individuals across sites — Plausible or Fathom recommended over Google Analytics.
- Track product events only: page visits, write flow started, write flow completed, letter scheduled, Garden post submitted. Never track message content.
- Do not store message bodies in analytics.
- Do not store recipient emails in analytics.
- Do not store any content that would identify what a user wrote.
- Monitor errors and failed flows.
- Track feature adoption — which areas are being used and which are not.

### Phase 19 Result

Latergram can improve based on real usage data while respecting the privacy of what users write.

---

## Phase 20: Public Launch V1

**Goal:** Launch a small, stable, honest version of Latergram.

### Phase 20 Scope

- Polish landing page — remove any remaining prototype language.
- Confirm write flow works end-to-end.
- Confirm private storage works for signed-in users.
- Confirm Late Letters deliver correctly.
- Confirm Garden is live and moderated.
- Confirm Memory Cards export correctly.
- Confirm privacy policy, terms, and support pages exist.
- Confirm reporting and safety flows work.
- Confirm mobile experience is solid.
- Confirm no fake data, no fake states, no overpromises remain anywhere.
- Confirm asset hosting is production-grade — no raw GitHub URLs.
- Write honest launch copy.

### Phase 20 Result

Latergram launches publicly as a real product.

---

## Phase 21: Post-Launch Improvement

**Goal:** Improve Latergram based on what real users actually do.

### Phase 21 Scope

- Fix confusing flows found through real usage.
- Improve copy based on user confusion points.
- Improve the writing experience based on what users actually write.
- Improve Garden safety based on what abuse patterns emerge.
- Improve Late Letter delivery reliability.
- Improve recipient experience.
- Improve mobile polish.
- Improve performance.
- Do not add features. Fix what is already there first.

### Phase 21 Result

Latergram becomes more reliable and more trusted by real users.

---

## Phase 22: Notifications and Preferences

**Goal:** Add gentle notification controls.

### Phase 22 Scope

- Delivery confirmation notification for sender when a letter is delivered.
- Optional opened-letter notification — only if technically reliable.
- Reminder preferences for drafts.
- Email preferences and unsubscribe controls.
- Opt-out from all non-essential email.
- No message content in email previews or notifications.

### Phase 22 Result

Users control how Latergram contacts them.

---

## Phase 23: Premium Customization

**Goal:** Add optional paid customization after the free product is validated.

**Rule:** Premium must be optional. Basic emotional writing must remain fully useful for free, permanently.

Only build this after real users have been using the free product and expressing desire for more personalization.

### Phase 23 Scope

- Extra flower styles.
- Extra paper and card themes.
- Extra card templates for Memory Cards.
- Extra envelope styles for Late Letters.
- More private customization options.

### Phase 23 Result

Users who want more personalization can pay for it without the core experience being gated.

---

## Phase 24: Payments

**Goal:** Add real billing for premium features.

Only build this after Phase 23 is defined and validated with users willing to pay.

### Phase 24 Scope

- Choose payment provider — Stripe recommended.
- Plan system with clear tier definition.
- Upgrade flow from free to premium.
- Billing settings and invoice access.
- Cancellation with no friction and no dark patterns.
- Failed payment handling.
- Access enforcement for premium-only features.
- Webhook handling for payment events.

### Phase 24 Result

Paid features work correctly without dark patterns.

---

## Phase 25: AI Reflection Assistant

**Goal:** Add optional writing help carefully.

Only add AI after the product works well without it.

### Phase 25 Allowed Scope

- Make this softer.
- Make this shorter.
- Help me say sorry.
- Translate gently.
- Remove harsh words.
- Suggest a reflection prompt.

### Phase 25 Not Allowed

- Invent fake feelings for the user.
- Manipulate recipients.
- Promise replies or reconciliation.
- Replace the user's voice.
- Pretend to be therapy.

### Phase 25 Result

AI helps gently when asked, without taking over the emotion or replacing the user's words.

---

## Phase 26: Admin and Operations

**Goal:** Add internal tools for safety and support as the product grows.

### Phase 26 Scope

- Garden moderation dashboard.
- Report review interface.
- User safety review tools.
- Failed delivery review and retry.
- Abuse pattern monitoring.
- Support tools for user account issues.
- Admin access protection.

### Phase 26 Result

Latergram can be operated safely at scale.

---

## Phase 27: Physical Keepsakes Exploration

**Goal:** Explore physical products only after digital demand is proven and operations are stable.

Do not promise physical products until operations are real and digital demand is clearly established.

### Possible Future Products

- Printed letters.
- Postcards.
- Keepsake books.
- Custom envelopes.
- Gift packaging.

### Phase 27 Rule

This phase does not start unless there is demonstrated user demand and the operational capacity to deliver physical products reliably.

---

## 7. Live Readiness Rule

A feature is live only when it works end-to-end.

A button is not live just because it exists.

A page is not live just because it looks finished.

A feature is live only when:

- The user action works.
- Data is saved correctly.
- User privacy is protected.
- Error states are handled.
- Empty states are honest.
- No fake or demo data is shown.
- The feature does not overpromise.
- The flow has been tested with real input.

---

## 8. Final Product Direction

Latergram should grow slowly and correctly.

The correct order is:

1. Validate the problem is real.
2. Honest UI with no fake content.
3. Stable design system.
4. Real writing flow.
5. Real local storage.
6. Real accounts.
7. Real database.
8. Real delayed letters with real delivery.
9. Real Garden with real safety — in that order, safety then Garden.
10. Mobile polish.
11. Real launch.
12. Learn from real users.
13. Premium only after free is validated.

Keep Latergram soft.

Keep it private where it should be private.

Keep it public only where safety exists.

Keep it live-only.

Never fake the product.