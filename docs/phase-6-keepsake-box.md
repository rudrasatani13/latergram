# Phase 6: Keepsake Box / Private Archive V1

Phase 6 turns Keep Private / Keepsake Box into a real local-device archive for content already stored by the Phase 5 browser storage foundation.

It does not add backend, auth, database, account storage, cloud sync, email delivery, Garden posting, Memory Card export, analytics, payments, or AI.

## What The Keepsake Box Can Show

The Keepsake Box now reads real browser-device data from the existing `latergram:v1` keys:

- `latergram:v1:lategrams`
- `latergram:v1:draft`
- `latergram:v1:counters`

The archive reads fresh local data on mount, when switching tabs, and when the user chooses **Refresh archive**.

## Real Tabs

### My Lategrams

The **My Lategrams** tab shows real locally saved Latergrams from `latergram:v1:lategrams`.

Each saved card shows:

- title from subject, recipient, or fallback
- body excerpt
- saved date
- destination label
- word count
- local-only note

Saved Latergrams are sorted newest first. Destination filters are available for all, keep private, late letter, garden, and memory card.

### Time Since

The **Time Since** tab shows real locally saved counters from `latergram:v1:counters`.

Each counter shows:

- title
- day count
- start date
- optional context
- local-only note

Counters can be removed from this device with an inline two-step confirmation.

### Draft Visibility

Draft visibility was added as a small panel inside **My Lategrams** when `latergram:v1:draft` exists.

The draft panel shows:

- "Draft found on this device."
- updated date
- short preview
- local-only browser copy
- **Restore in writer**
- **Clear draft**

**Restore in writer** switches back to the writer. The existing `DiaryComposer` draft restore area remains responsible for actually restoring the draft into the writing surface. This avoids adding cross-component draft state.

**Clear draft** removes `latergram:v1:draft` with a soft two-step confirmation.

## Saved Latergram Actions

### View

**View** opens the full saved Latergram inline inside the existing soft card style.

The full view shows:

- recipient label when present
- subject when present
- destination
- created date
- updated date
- word count
- full body
- local-only note

No backend route or new page was added.

### Copy

**Copy** uses the browser Clipboard API to copy the full saved body. The UI shows a local success or browser-copy failure message.

### Remove From This Device

Saved Latergrams use an inline two-step confirmation:

- first click asks: "remove this saved Lategram?"
- second click removes it from `latergram:v1:lategrams`

No browser alert is used.

## Unavailable Tabs

The following tabs remain intentionally unavailable and do not show fake content:

- **Late Letters**: "No late letters are connected here yet." / "Delivery is not connected yet."
- **Saved Cards**: "No saved cards on this device yet." / "Card export is not connected yet."
- **Received**: "No received letters here yet." / "Receiving letters is not connected yet."

Saved Latergrams with a Garden or Memory Card destination can appear only as private local writing. They do not create Garden posts or card exports.

## Local-Only Limitation

The Keepsake Box now says:

- saved content is on this device only
- content is only available in this browser
- clearing browser data may remove it
- accounts are not connected yet

The app does not claim sync, backup, account storage, delivery, Garden posting, or Memory Card export.

## UI Preservation

The existing DiaryFrame, tabs, soft cards, flowers, paper/card feeling, gentle motion, and soft footer were preserved. Phase 6 changed archive behavior and truth-in-copy only; it did not redesign the page into a dashboard.

## Build Result

`npm run build` passes with Vite.
