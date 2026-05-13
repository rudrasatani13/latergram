# Phase 1 Audit

Status: Phase 1 Live Baseline Cleanup.

Master plan: [`LATERGRAM_DETAILED_PHASE_PLAN.md`](../LATERGRAM_DETAILED_PHASE_PLAN.md).

## What Was Cleaned

- Replaced the empty README with a production-minded Latergram README.
- Updated the package identity from the generated Figma name to `@latergram/app`.
- Updated the browser page title to Latergram.
- Removed generated/prototype wording from attribution and visible product identity surfaces.
- Removed the duplicate unused `Composer` and `SmallField` code from `src/app/pages/HomePage.tsx`.
- Reworked non-live feature areas into honest empty or unavailable states.

## Fake Or Demo Data Removed

- Private Lategrams seeded in `KeepPrivateView.tsx`.
- Fake Late Letter records, recipient emails, and status labels in `LateLettersView.tsx`.
- Fake Garden posts, names, search results, and reaction counts in `GardenView.tsx`.
- Fake Time Since counters in `TimeSinceView.tsx`.
- Fake Memory Card sources and download UI in `MemoryCardView.tsx`.
- Fake auth success navigation in `AuthPage.tsx`.

## Components Audited

- `src/app/pages/HomePage.tsx`
- `src/app/pages/LandingPage.tsx`
- `src/app/pages/AuthPage.tsx`
- `src/app/components/Header.tsx`
- `src/app/components/Logo.tsx`
- `src/app/components/DiaryComposer.tsx`
- `src/app/components/diary/KeepPrivateView.tsx`
- `src/app/components/diary/GardenView.tsx`
- `src/app/components/diary/LateLettersView.tsx`
- `src/app/components/diary/TimeSinceView.tsx`
- `src/app/components/diary/MemoryCardView.tsx`
- `src/app/components/BrandAssets.ts`

## Features Currently Live

- Landing page vision copy.
- App shell navigation using local React state.
- Unsaved write surface.
- Honest unavailable states for later product areas.

## Features Intentionally Not Live

- Auth, account creation, sessions, and password reset.
- Database, backend APIs, or account-backed storage.
- LocalStorage or device persistence.
- Private Lategram saving.
- Late Letter scheduling, email delivery, secure links, status tracking, and recipient flows.
- Public Garden posting, reading, reactions, reporting, and moderation.
- Time Since counter creation or persistence.
- Memory Card generation, download, sharing, or export.
- Analytics, payments, AI, mobile polish, or public launch infrastructure.

## Known Future Work

- Phase 2: stabilize the design system.
- Phase 3: add real route-based navigation.
- Phase 4: make the write flow complete without pretending unsupported outcomes work.
- Phase 5: add device storage for real user-created content.
- Phase 7 and later: add real accounts and backend-backed product behavior.
- Phase 14/public launch preparation: migrate product assets away from raw GitHub URLs.

## Raw GitHub Asset URL Note

Current asset base URL in `src/app/components/BrandAssets.ts`:

```text
https://raw.githubusercontent.com/rudrasatani13/Lategram/main/assets
```

This is temporary. Assets must move to a controlled CDN or self-hosted path before public launch or mobile polish. Phase 1 documents the issue but does not migrate assets.

## Phase 1 Boundary Confirmation

Phase 1 did not add backend, auth, storage, router, email delivery, Garden backend, Memory Card export, analytics, payments, or AI.
