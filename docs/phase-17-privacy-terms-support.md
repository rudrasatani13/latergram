# Phase 17: Privacy, Terms, and Support

## Summary

Added honest, product-specific trust pages for Latergram before public launch. All content is written in plain language, specific to Latergram's actual data model and features, and clearly marks areas requiring legal review.

## Pages and Routes Added

| Route | Page | Purpose |
|-------|------|---------|
| `/privacy` | PrivacyPage | Privacy policy covering all data types, storage, deletion, and limitations |
| `/terms` | TermsPage | Terms of service with user responsibilities and service limitations |
| `/support` | SupportPage | Support instructions, data deletion, abuse reporting, crisis redirection |

## What Each Page Covers

### Privacy Policy (`/privacy`)
- What Latergram is (and is not)
- Local/device-only vs account-backed data distinction
- What is stored in Supabase when signed in (profiles, Lategrams, counters, Late Letters, Garden submissions)
- Recipient email handling (sensitive, not used for marketing)
- Email delivery through Resend and provider data retention
- Who reads content (no one under normal operation; exceptions for reports/moderation)
- Memory Card export (client-side PNG, no upload, no saved history)
- Data retention and deletion paths
- No analytics currently active
- What we do not do (no data sale, no marketing to recipients, no HIPAA/GDPR/CCPA claims, no E2E encryption claim)
- Not a crisis/emergency service
- Legal review disclaimer

### Terms of Service (`/terms`)
- User responsibility for content
- Prohibited uses (harassment, spam, impersonation, illegal content)
- Late Letter limitations (no guaranteed delivery, recipient controls)
- Garden moderation (currently closed)
- Memory Card user responsibility
- Not therapy/medical/legal/crisis service
- Account suspension for abuse
- Service availability not guaranteed
- Legal review disclaimer

### Support (`/support`)
- General support contact
- Reporting abusive Late Letters
- Opting out of future letters
- Delivery issue guidance
- Data deletion instructions:
  - Local/device data
  - Account-backed data (individual items)
  - Full account deletion (via support, not self-serve yet)
  - Memory Cards (device-only files)
- Garden (closed, future moderation path)
- Crisis/emergency redirection (contact local emergency services)

## Support/Contact Behavior

- `SUPPORT_EMAIL` constant defined in `src/app/constants.ts`
- Set to `support@latergram.app`
- Used consistently across all trust pages
- No fake support form added
- No mailto link (email displayed as text for now)

## Data Deletion Status

| Data Type | Self-Serve | Method |
|-----------|-----------|--------|
| Local device data | Yes | Remove in app or clear browser storage |
| Individual Lategrams (account) | Yes | Remove from archive |
| Individual counters (account) | Yes | Remove from archive |
| Late Letters (pre-send) | Yes | Cancel in app |
| Late Letters (post-send) | Partial | Remove record; cannot recall from recipient |
| Full account deletion | No | Request via support email |
| Memory Card PNGs | Yes | Delete file from device |

## Self-Serve Account Deletion

Not implemented. Documented as future work. Users are directed to contact support for full account/data deletion.

## Legal Review Notes

Both Privacy Policy and Terms of Service include a visible disclaimer:
> "This [policy/terms] is written in plain language to be honest about how Latergram works. It may require formal legal review before public launch."

No compliance claims made (HIPAA, GDPR, CCPA). No end-to-end encryption claimed. No guaranteed deletion from backups claimed.

## Navigation Integration

- **Landing page footer**: TrustFooter component added below copyright line
- **Auth page**: "by continuing you agree to our terms and privacy policy" now links to actual `/terms` and `/privacy` routes
- **Recipient letter page**: Subtle Privacy / Terms / Support links added below letter card

## Files Changed

- `src/app/App.tsx` — Added 3 lazy-loaded routes
- `src/app/pages/PrivacyPage.tsx` — New file
- `src/app/pages/TermsPage.tsx` — New file
- `src/app/pages/SupportPage.tsx` — New file
- `src/app/components/TrustFooter.tsx` — New reusable footer component
- `src/app/constants.ts` — New file with SUPPORT_EMAIL
- `src/app/pages/LandingPage.tsx` — Added TrustFooter import and usage
- `src/app/pages/AuthPage.tsx` — Added Link import, linked terms/privacy text
- `src/app/pages/RecipientLetterPage.tsx` — Added Link import, trust links below letter
- `src/styles/theme.css` — Added .trust-heading, .trust-subheading, .trust-list utility classes
- `docs/phase-17-privacy-terms-support.md` — This file
- `README.md` — Phase 17 status update

## Commands Run

```
git status --short
git log --oneline -5
npm install
npm run build (passed)
```

## Verification

- [x] npm run build passes
- [x] No package.json/package-lock.json changes
- [x] No Supabase migration files changed
- [x] No fake support form added
- [x] No fake compliance claims
- [x] No fake support email (real configurable constant)
- [x] "Not therapy/emergency service" present on all three pages
- [x] Data deletion explanation is clear and honest
- [x] Garden remains closed/unavailable
- [x] Memory Card export unchanged, no saved card history added
- [x] Recipient email marketing disclaimer is unambiguous
- [x] Legal review disclaimer present

## Remaining Risks

1. **Self-serve account deletion** — not implemented; users must contact support
2. **Legal review** — privacy policy and terms need formal legal review before public launch
3. **Support email** — `support@latergram.app` must be configured as a real inbox before launch
4. **GDPR/CCPA** — no compliance claim made; formal assessment needed if serving EU/CA users
5. **Resend data retention** — Latergram cannot control Resend's log retention; documented honestly
