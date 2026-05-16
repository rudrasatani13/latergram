# Manual Testing Template

This template guides manual end-to-end testing of Latergram before public launch. Complete all sections and document results without including private user data, real recipient emails, real letter content, tokens, auth IDs, or database IDs.

**Test Date:** _____  
**Tester:** _____  
**Environment:** _____  
**Build/Commit:** _____

---

## Privacy Reminder

**Do not include in test documentation:**
- Real recipient email addresses
- Real letter text or private writing
- Real tokens or secure links
- Real auth IDs or database IDs
- Real user names or personal information
- Screenshots containing private content

**Use instead:**
- Redacted screenshots if needed
- Generic descriptions ("scheduled letter to test recipient")
- Pass/fail status
- Issue IDs for bugs found

---

## Route Checks

Test all routes are accessible and render correctly.

| Route | Status | Notes |
|-------|--------|-------|
| `/` (Landing) | ☐ Pass ☐ Fail | |
| `/auth` (Auth) | ☐ Pass ☐ Fail | |
| `/app` (Home) | ☐ Pass ☐ Fail | |
| `/app?section=write` | ☐ Pass ☐ Fail | |
| `/app?section=later` | ☐ Pass ☐ Fail | |
| `/app?section=memory` | ☐ Pass ☐ Fail | |
| `/app?section=garden` | ☐ Pass ☐ Fail | Garden should show closed state |
| `/privacy` | ☐ Pass ☐ Fail | |
| `/terms` | ☐ Pass ☐ Fail | |
| `/support` | ☐ Pass ☐ Fail | |
| `/beta` | ☐ Pass ☐ Fail | |
| `/letter/:token` (invalid) | ☐ Pass ☐ Fail | Should show unavailable state |
| `/invalid-route` | ☐ Pass ☐ Fail | Should show 404 |

---

## Authentication Flow

Test account creation, sign in, sign out, and password reset.

### Sign Up
- ☐ Create new account with valid email/password
- ☐ Verify confirmation email received (if email confirmation enabled)
- ☐ Verify account session established
- ☐ Verify redirected to `/app` after sign up

**Issues found:** _____

### Sign In
- ☐ Sign in with existing account
- ☐ Verify session established
- ☐ Verify redirected to `/app` after sign in
- ☐ Test invalid password shows error
- ☐ Test invalid email shows error

**Issues found:** _____

### Sign Out
- ☐ Sign out from authenticated state
- ☐ Verify session cleared
- ☐ Verify redirected to landing or auth page
- ☐ Verify cannot access `/app` after sign out without re-auth

**Issues found:** _____

### Password Reset
- ☐ Request password reset
- ☐ Verify reset email received
- ☐ Complete password reset flow
- ☐ Verify can sign in with new password

**Issues found:** _____

---

## Writing Flow

Test private Latergram writing and saving.

### Signed-Out Writing
- ☐ Write Latergram while signed out
- ☐ Save to device
- ☐ Verify saved to local storage
- ☐ Verify appears in device archive
- ☐ Verify labeled as device-only

**Issues found:** _____

### Signed-In Writing
- ☐ Write Latergram while signed in
- ☐ Save to account
- ☐ Verify saved to Supabase
- ☐ Verify appears in account archive
- ☐ Verify persists after sign out and sign in

**Issues found:** _____

### Draft Restore
- ☐ Start writing Latergram
- ☐ Refresh page before saving
- ☐ Verify draft restored
- ☐ Complete and save

**Issues found:** _____

---

## Time Since Counters

Test Time Since counter creation and management.

### Signed-Out Counter
- ☐ Create Time Since counter while signed out
- ☐ Verify saved to local storage
- ☐ Verify appears in device archive
- ☐ Verify counter displays time elapsed

**Issues found:** _____

### Signed-In Counter
- ☐ Create Time Since counter while signed in
- ☐ Verify saved to Supabase
- ☐ Verify appears in account archive
- ☐ Verify persists after sign out and sign in

**Issues found:** _____

---

## Local-to-Account Import

Test explicit import of local saves into account.

- ☐ Create local saves while signed out (Latergram + Time Since)
- ☐ Sign in
- ☐ Navigate to import flow
- ☐ Select local items to import
- ☐ Complete import
- ☐ Verify items now in account archive
- ☐ Verify local items remain in device archive

**Issues found:** _____

---

## Late Letters

Test Late Letter scheduling, delivery, and status tracking.

### Scheduling
- ☐ Schedule Late Letter to test recipient (with consent)
- ☐ Verify recipient email masked after save
- ☐ Verify letter appears in archive with "scheduled" status
- ☐ Verify send date displayed

**Issues found:** _____

### Cancellation
- ☐ Cancel scheduled letter before send time
- ☐ Verify status changes to "cancelled"
- ☐ Verify letter not delivered

**Issues found:** _____

### Delivery (requires production environment)
- ☐ Wait for scheduled send time or trigger delivery job
- ☐ Verify status changes to "sending" then "sent"
- ☐ Verify recipient receives email
- ☐ Verify email contains secure link
- ☐ Verify Resend message ID recorded

**Issues found:** _____

---

## Recipient Flow

Test recipient letter opening, reporting, blocking, and opt-out.

### Letter Opening
- ☐ Open recipient link from delivered email
- ☐ Verify letter content displays
- ☐ Verify sender identity not exposed
- ☐ Verify status changes to "opened" in sender archive

**Issues found:** _____

### Report Letter
- ☐ Use "Report this letter" option on recipient page
- ☐ Verify report submitted
- ☐ Verify confirmation shown
- ☐ Verify report recorded in database (check admin/moderator view if available)

**Issues found:** _____

### Block Sender
- ☐ Use "Block future letters from this sender" option
- ☐ Verify block confirmed
- ☐ Verify future letters from same sender are blocked at send time

**Issues found:** _____

### Global Opt-Out
- ☐ Use global opt-out option
- ☐ Verify opt-out confirmed
- ☐ Verify recipient email added to opt-out list
- ☐ Verify future letters to this recipient are blocked

**Issues found:** _____

---

## Memory Card Export

Test Memory Card PNG export from saved content.

### Export from Latergram
- ☐ Select saved Latergram
- ☐ Choose Memory Card format (square/story/wallpaper)
- ☐ Generate card
- ☐ Verify preview displays
- ☐ Download PNG
- ☐ Verify PNG file saved to device
- ☐ Verify card content matches source

**Issues found:** _____

### Export from Time Since
- ☐ Select saved Time Since counter
- ☐ Choose Memory Card format
- ☐ Generate card
- ☐ Download PNG
- ☐ Verify PNG file saved to device

**Issues found:** _____

---

## Mobile Testing

Test mobile flows on actual mobile device or responsive viewport.

### Viewport Sizes
Test at: 320px, 375px, 390px, 414px, 768px

- ☐ Landing page renders correctly
- ☐ Auth page renders correctly
- ☐ App home renders correctly
- ☐ Writing flow works on mobile
- ☐ Navigation works on mobile
- ☐ No horizontal overflow
- ☐ Touch targets appropriately sized
- ☐ Keyboard behavior appropriate

**Issues found:** _____

---

## Garden (Closed State)

Test Garden shows honest closed state.

- ☐ Navigate to `/app?section=garden`
- ☐ Verify Garden shows "not open yet" message
- ☐ Verify no Garden posting UI
- ☐ Verify no Garden browsing UI
- ☐ Verify no Garden reactions UI

**Issues found:** _____

---

## Trust Pages

Test privacy, terms, and support pages for clarity and accuracy.

### Privacy Page
- ☐ Read privacy policy
- ☐ Verify data collection described accurately
- ☐ Verify Resend/provider disclosed
- ☐ Verify analytics status accurate (disabled unless configured)
- ☐ Verify legal review disclaimer present if review not complete

**Issues found:** _____

### Terms Page
- ☐ Read terms of service
- ☐ Verify user responsibilities clear
- ☐ Verify service limitations clear
- ☐ Verify legal review disclaimer present if review not complete

**Issues found:** _____

### Support Page
- ☐ Read support page
- ☐ Verify support email status accurate (pending or configured)
- ☐ Verify abuse reporting instructions clear
- ☐ Verify data deletion instructions clear
- ☐ Verify emergency disclaimer present

**Issues found:** _____

### Beta Page
- ☐ Read beta page
- ☐ Verify beta status accurate (not public launch)
- ☐ Verify testing instructions clear
- ☐ Verify no fake waitlist/counts/testimonials

**Issues found:** _____

---

## Analytics (if enabled)

Only test if analytics is explicitly configured.

- ☐ Verify analytics provider configured in environment
- ☐ Verify page views tracked
- ☐ Verify product events tracked
- ☐ Verify no sensitive data in events (no tokens, IDs, content, emails)
- ☐ Verify analytics disabled if env not configured

**Issues found:** _____

---

## Error Handling

Test error states and boundaries.

- ☐ Test network offline behavior
- ☐ Test invalid form inputs
- ☐ Test expired session handling
- ☐ Test database connection errors (if testable)
- ☐ Verify error messages user-friendly
- ☐ Verify no sensitive data in error messages

**Issues found:** _____

---

## Performance

Basic performance checks.

- ☐ Page load time acceptable
- ☐ Navigation feels responsive
- ☐ No obvious performance issues
- ☐ Memory Card generation completes in reasonable time

**Issues found:** _____

---

## Summary

**Total Issues Found:** _____  
**Critical Issues:** _____  
**Non-Critical Issues:** _____

**Overall Assessment:**
- ☐ Ready for beta
- ☐ Ready for public launch
- ☐ Needs fixes before beta
- ☐ Needs fixes before public launch

**Next Steps:** _____

---

## Issue References

List GitHub issue IDs for bugs found during testing:

- Issue #___: _____
- Issue #___: _____
- Issue #___: _____
