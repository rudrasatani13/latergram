# Phase 14: Mobile Polish

## What Was Audited

Routes checked:

- `/`
- `/auth`
- `/app`
- `/app?section=private`
- `/app?section=time`
- `/app?section=later`
- `/app?section=garden`
- `/app?section=memory`
- `/letter/not-a-real-token`

Mobile widths checked:

- `320px`
- `375px`
- `390px`
- `414px`
- `768px`

The audit looked for horizontal overflow, cramped controls, small tap targets, non-wrapping text, mobile form issues, fixed/sticky collisions, Garden availability drift, Memory Card fake-preview drift, raw recipient email exposure, and runtime raw GitHub asset references.

## What Was Fixed

- Added a bottom mobile app navigation for the live core sections: Write, Keep, Letters, and Time.
- Kept Garden and Memory Cards reachable through the section picker, but labeled them as closed/unavailable instead of live bottom-nav destinations.
- Improved the writer on phones: stacked header inputs, wider writing column, resizable textarea, larger touch targets, and a mobile sticky action dock above the bottom nav.
- Improved auth layout by stacking small-screen secondary actions and enforcing mobile-sized form controls/buttons.
- Improved Keepsake Box mobile browsing with scrollable tabs, larger account/device controls, larger filters, wrapped long titles/text, and larger delete/cancel actions.
- Improved Late Letters mobile layout for compose fields, date/time controls, saved-letter cards, cancellation, and sender report controls.
- Improved Time Since mobile controls and deletion actions.
- Improved `/letter/:token` mobile layout, report form, opt-out form, checkbox target, and button sizing.
- Rebuilt the Garden closed state as a non-interactive mobile-friendly state; inactive search/filter controls were removed.
- Replaced Memory Cards preview controls and fixture card sources with an honest unavailable state.
- Removed the unused `src/app/fixtures/designPreviewData.ts` fixture file from runtime source.
- Added global mobile cleanup for overflow, media sizing, and touch manipulation.

## Garden Status

The Garden product UI stayed closed.

No public Garden posts are shown. No Garden search, category filtering, anonymous browsing, posting, reactions, or report UI was enabled. No Garden RPC access was added from the UI, and no `user_id`, `reporter_user_id`, or `anonymous_fingerprint_hash` fields were exposed.

## Memory Cards Status

Memory Cards stayed unavailable.

No generation, download, export, sharing, source selection, or fake card preview is active. Cards must come from real saved writing in a future phase before the UI can become interactive.

## Asset Audit

Runtime product asset references are controlled local paths under `/assets`.

No new external raw GitHub asset dependency was introduced. The only raw GitHub asset URL found is a historical note in `docs/phase-1-audit.md`; it is not used by runtime product code. Google Fonts remains an external stylesheet dependency in `src/styles/fonts.css`.

## Verification

Commands run:

```bash
git status --short
git log --oneline -5
npm install
npm run build
npm run build
```

Results:

- Initial `git status --short`: clean.
- `npm install`: completed; no dependency file changes remained in git.
- `npm run build`: passed before changes.
- Final `npm run build`: passed after changes.
- Build output still has the existing Vite chunk-size warning for the main JavaScript bundle.
- Browser route/width audit completed for the widths listed above with no document-level horizontal scroll and no console errors.
- Automated checks confirmed Memory Cards no longer render preview-source text.
- Automated checks confirmed recipient unavailable page did not expose a raw recipient email.

Supabase:

- No Supabase schema, migration, function, policy, or config files were changed in Phase 14.
- `npx supabase db lint` was not required for this phase because Supabase code was not touched.

## Remaining Risks

- Browser back/forward behavior is preserved by the existing `setSearchParams(..., { replace: false })` section navigation. Direct query-param routes were verified. The in-app browser connection dropped during one click-history check, so the history-click result itself was source-verified rather than fully completed in the browser.
- The JavaScript bundle remains above Vite's default chunk-size warning threshold. Phase 14 did not add code splitting.
- Garden opening remains a future product decision even though Phase 13 safety primitives exist.
- Memory Card generation/export remains a future phase.
