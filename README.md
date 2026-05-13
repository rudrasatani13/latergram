# Latergram

Some words arrive late. Latergram gives them a place.

## Current Status

Phase 1 Live Baseline Cleanup.

The project is being reset from a generated prototype into an honest app shell that can support real development. The master development plan is [`LATERGRAM_DETAILED_PHASE_PLAN.md`](./LATERGRAM_DETAILED_PHASE_PLAN.md).

## Development Rule

Latergram is live-only product development:

- No fake user content.
- No demo Garden posts.
- No fake private Lategrams.
- No fake scheduled or opened Late Letters.
- No fake Time Since counters.
- No fake Memory Card sources.
- No fake account-backed behavior.
- No UI that makes a non-live feature look complete.

If a feature is not working end-to-end with real data, the UI must say so clearly or stay disabled.

## What Is Currently Live

- A Vite React app shell.
- A soft landing page that describes the product vision.
- A local in-memory page switcher between landing, account status, and app shell views.
- An unsaved writing surface for drafting text on screen.
- Honest empty/unavailable states for Keep Private, The Garden, Late Letters, Time Since, and Memory Cards.

## What Is Not Live Yet

- Real auth, sessions, account creation, and password reset.
- Database, backend APIs, or account-backed storage.
- LocalStorage or device persistence.
- Private Lategram saving.
- Late Letter scheduling, email delivery, secure open links, or recipient tracking.
- Public Garden posting, reading, reactions, reporting, or moderation.
- Time Since counter persistence.
- Memory Card generation, download, sharing, or export.
- Analytics, payments, AI, or public launch infrastructure.

## Phase 1 Completion Checklist

- [x] Replace generated project identity with Latergram identity.
- [x] Replace the empty README with a real project README.
- [x] Remove fake private Lategrams.
- [x] Remove fake Garden posts and reaction counts.
- [x] Remove fake scheduled or opened Late Letters.
- [x] Remove fake Time Since counters.
- [x] Remove fake Memory Card source content and download claims.
- [x] Remove fake auth success behavior.
- [x] Remove duplicate unused Composer code from `HomePage.tsx`.
- [x] Document current non-live features and future requirements.

## Run Locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Asset Hosting Note

`src/app/components/BrandAssets.ts` currently points to raw GitHub asset URLs:

```text
https://raw.githubusercontent.com/rudrasatani13/Lategram/main/assets
```

This is temporary. Before public launch or mobile polish, product assets must move to a controlled CDN or self-hosted path. This is documented as future Phase 14/public-launch work and was not migrated in Phase 1.
