# Phase 4: Write Flow Live V1

Phase 4 makes the write area useful in the current browser session without pretending storage or delivery exists.

## What Changed

- `DiaryComposer` now keeps session-only writing state for the message body, recipient label, optional subject, and intended destination.
- The original diary/card/flower surface is preserved: ribbon, wax seal, ruled paper, handwriting textarea, soft footer, decor, motion, and button layout remain in place.
- The composer now shows honest writing details: word count, character count, "not saved yet" copy, and visible copy-before-leaving guidance.
- The user can choose where the writing might belong: Keep Private, Late Letter, Garden, or Memory Card.
- Destination guidance is honest and does not imply save, send, post, export, or account behavior.

## Real Browser-Session Behavior

- Users can type a message in the diary composer.
- Users can edit the "to" field.
- Users can add an optional subject.
- Users can choose an intended destination.
- Users can copy their writing through the browser Clipboard API.
- Users can clear the page with an inline second-step confirmation.
- All writing exists only while the current page session stays open.

## Real Actions

- Copy words: writes the current message, recipient, subject, and intended destination to the browser clipboard when text exists.
- Empty copy validation: shows "Write a few words first." when there is no message body.
- Clear page: asks once with "Clear these words?" before removing current session text.
- Continue shaping: returns focus to the handwriting textarea.

## Not Connected Yet

- No saving.
- No draft storage.
- No localStorage.
- No database.
- No backend API.
- No account-backed storage.
- No auth/session behavior.
- No email delivery.
- No Garden posting.
- No Memory Card export.

## Honesty Confirmations

- Save/Draft fake success was not added.
- The old fake Save/Draft actions were replaced with real copy, guarded clear, and focus behavior.
- The product UI does not mention phase numbers.
- Local persistence belongs to the next storage phase, not Phase 4.
- The write flow does not create fake saved Lategrams, fake scheduled letters, fake Garden entries, or fake card exports.
