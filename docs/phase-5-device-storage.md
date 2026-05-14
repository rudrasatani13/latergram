# Phase 5: Device Storage / Local Persistence V1

Phase 5 adds real browser-device storage for the first Latergram writing experience. It does not add backend, auth, database, account storage, email delivery, Garden backend, card export, analytics, payments, or AI.

## Storage Keys

All keys are namespaced under `latergram:v1` and written through `src/app/storage/localStorage.ts`.

- `latergram:v1:lategrams`
- `latergram:v1:draft`
- `latergram:v1:counters`

Stored values are JSON envelopes with `schemaVersion: 1`. Reads and writes are guarded so missing storage, unavailable storage, corrupt JSON, or unexpected shapes return safe fallback values instead of crashing UI components.

## Data Types

The local data contracts live in `src/app/storage/types.ts`.

- `LocalLategram`: local id, body, optional recipient label, optional subject, destination, created/updated timestamps, word count, and character count.
- `LocalDraft`: body, optional recipient label, optional subject, destination, and updated timestamp.
- `LocalCounter`: local id, title, start date, optional context, and created/updated timestamps.

No fake user ids, account ids, server ids, delivery statuses, Garden post statuses, or export statuses were added.

## What Saves Locally

`DiaryComposer` now saves a written Lategram to `latergram:v1:lategrams` when the user chooses **Save on this device**. Empty body saves are blocked with: "Write a few words first."

Saved Lategrams appear in the Keep Private **My Lategrams** tab. They are described as device/browser-only, not synced or account-backed.

## Draft Restore

`DiaryComposer` can save one current draft to `latergram:v1:draft` with **Save draft**. If a draft exists, the composer shows a small restore area with:

- "Draft found on this device."
- **Restore draft**
- **Clear draft**

Restoring fills body, recipient label, subject, and intended destination. Clearing the draft removes only the draft key.

## Deletion

Keep Private saved Lategrams use a two-step inline remove action:

- first click: "remove this saved Lategram?"
- second click: remove from `latergram:v1:lategrams`

Time Since counters use the same gentle two-step local remove pattern.

## Time Since Counters

Time Since counter persistence was implemented in Phase 5 because counters are simple browser-device data and already fit the local-only phase scope.

Counters are stored in `latergram:v1:counters`, shown after refresh, and labeled as saved on this device only.

## Still Not Connected

The following remain intentionally not connected:

- real auth or sessions
- account storage or cloud sync
- backend APIs or database
- email scheduling or delivery
- Garden posting, reading, moderation, reports, or reactions
- Memory Card output
- received letters
- analytics
- payments
- AI

## UI And Copy

The diary/card/flower visual system was preserved. Phase 5 changed behavior and small truth-in-copy lines only; it did not redesign pages, flatten the aesthetic, or replace the app feel.

User-facing app copy now says local content is saved on this device/browser only and that clearing browser data may remove it. The app does not claim account storage, sync, backup, delivery, Garden posting, or card output.

## Build Result

`npm run build` passes with Vite.
