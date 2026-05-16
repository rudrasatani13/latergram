# Phase 16: Memory Card Export

Date: 2026-05-15

## Summary

Phase 16 makes Memory Cards export-only live. Users can create a card only after explicitly selecting one real saved Lategram or one real saved Time Since counter. The export is generated client-side as a PNG through native Canvas APIs. The on-screen preview animates between square, story, and wallpaper shapes and softly transitions theme colors while keeping the actual export dimensions fixed.

No fake card sources, fake previews, fake downloads, fake sharing, analytics, AI, payments, Garden cards, Garden UI, Garden RPC changes, Supabase migrations, or dependency changes were added.

## Supported Sources

Memory Cards can use:

- Local saved Lategrams from device storage.
- Account-backed private Lategrams through the existing account archive hooks when signed in.
- Local Time Since counters from device storage.
- Account-backed Time Since counters through the existing account counter hooks when signed in.

Account and device sources stay separate. Local content is not imported into an account, and account content is not copied into local storage.

## Supported Formats

- Square: 1080 x 1080.
- Story: 1080 x 1920.
- Wallpaper: 1170 x 2532.

The preview scales down in the app, but export dimensions are defined at full resolution in the Canvas renderer.

## Export Approach

The implementation uses `document.createElement("canvas")`, 2D canvas drawing, `canvas.toBlob(..., "image/png")`, and a temporary object URL attached to a browser download link. There is no server upload, no third-party export service, and no new runtime dependency.

Downloads use safe filenames:

- `latergram-memory-card-square.png`
- `latergram-memory-card-story.png`
- `latergram-memory-card-wallpaper.png`
- `latergram-time-since-square.png`
- `latergram-time-since-story.png`
- `latergram-time-since-wallpaper.png`

## Privacy Protections

- The user must choose source type, source item, format, and style before download.
- No source item is selected automatically.
- The preview and "text on card" panel show the text that will be rendered.
- Long text is shortened before rendering and the UI says when shortening occurs.
- Lategram recipient labels are not printed on cards.
- Lategram subject is used only when it does not look like a raw email, UUID, or long token.
- Internal IDs, user IDs, Garden metadata, recipient emails, delivery tokens, and Late Letter delivery state are not added to the card or filename.
- No Garden posts, scheduled/delivered Late Letters, or received letters are card sources.

## Not Supported Yet

- Saved card metadata/history is intentionally deferred.
- The Keepsake "Saved Cards" tab remains not live.
- Sharing, auto-upload, cloud sync, card analytics, and card templates beyond the three local styles are not live.

## Commands Run

Baseline before edits:

```bash
git status --short
git log --oneline -5
npm install
npm run build
```

Results:

- `git status --short`: clean before edits.
- `git log --oneline -5`: latest commit was `e6da471 feat: clear local draft on empty input and reorder AuthProvider and AppErrorBoundary components`.
- `npm install`: completed; reported one existing high severity audit item and suggested `npm audit fix --force`, which was not run.
- Baseline `npm run build`: passed.

Implementation verification:

```bash
npm run build
```

Result:

- Build passed after implementation.

Supabase note:

- The Supabase changelog was checked because account-backed sources rely on existing Supabase hooks.
- No Supabase schema, function, policy, or migration files were changed, so `npx supabase db reset`, `npx supabase db lint`, and migration-list verification were not required.

## Manual Checks Completed

Routes checked in the local browser:

- `/`
- `/auth`
- `/app`
- `/app?section=memory`
- `/app?section=private`
- `/app?section=time`

Memory Card behavior checked:

- No saved Lategrams: showed an honest empty state and disabled download.
- Local saved Lategram: appeared as a real selectable source after saving through the writer.
- Lategram recipient email used during the writer check did not appear in the card preview.
- Local Time Since counter: appeared as a real selectable source after saving through Time Since.
- Square Lategram card: preview rendered and Download PNG became enabled.
- Story Time Since card: preview rendered and Download PNG became enabled.
- Wallpaper Time Since card: preview rendered and Download PNG became enabled.
- Download action reached the success state: "PNG download created. Nothing was uploaded, shared, or saved to account history."
- The in-app browser does not support download-event/file inspection, so the saved file itself could not be opened from that browser session.
- Follow-up animation check: square-to-wallpaper format changes and style changes were checked in the local browser; the preview remained real-data-backed and Download PNG stayed enabled after valid selections.
- Account-backed Lategram source export was manually verified with a signed-in local/dev account.
- Account-backed Time Since source export was manually verified with a signed-in local/dev account.
- Download PNG reached the success state for both account-backed source types.
- Privacy checks passed for account-backed source cards, preview, text-on-card panel, filenames, and status copy.

Mobile widths checked:

- 320px
- 375px
- 390px
- 414px
- 768px

Results:

- No horizontal overflow was detected.
- Preview stayed visible.
- Download button existed, stayed enabled after valid selections, and was reachable by scrolling.

Garden checks:

- `/app?section=garden` still shows the closed Garden state.
- No public Garden browsing, posting, reactions, reports, or Garden cards were introduced.

## Remaining Risks

- The Codex in-app browser could not inspect the downloaded PNG file after clicking Download, though the Canvas renderer defines the required dimensions and build/browser UI checks passed.
- Canvas export depends on browser support for Canvas, `toBlob`, Blob URLs, and programmatic downloads; unsupported browsers show an export error state.
