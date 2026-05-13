# Phase 2: Design System Stabilization

**Status:** Complete  
**Date:** May 2026

---

## Summary

Phase 2 stabilized the Latergram visual system without damaging the existing UI. The work focused on:

1. Reducing duplicate code safely
2. Standardizing reusable UI patterns
3. Making product wording honest
4. Organizing fixture/preview data
5. Preserving the diary/card/flower aesthetic exactly

No auth, backend, storage, router, email delivery, or export was added.

---

## Existing Design Tokens

All colors come from `src/styles/theme.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--lg-cream` | `#FFF8ED` | Page background, button text |
| `--lg-paper` | `#FFF3DE` | Card/paper surfaces |
| `--lg-linen` | `#F7E7D2` | Gradient endpoints, muted surfaces |
| `--lg-blush` | `#FBE3DF` | Diary frame gradient, accent areas |
| `--lg-rose` | `#C86E7C` | Primary accent, active states |
| `--lg-rose-soft` | `#F3B8BF` | Decorative lines, chip borders |
| `--lg-butter` | `#F7D978` | Status badges (scheduled) |
| `--lg-sage` | `#A9C9A4` | Status badges (opened/success) |
| `--lg-lavender` | `#C9B7E8` | Chart/accent |
| `--lg-ink` | `#4E332B` | Primary text, button backgrounds |
| `--lg-cocoa` | `#7B5B4E` | Secondary text, muted labels |
| `--lg-border` | `#EAD5C4` | Borders, dividers, disabled surfaces |
| `--lg-focus-rose` | `#A94F61` | Focus rings, hover rose states |
| `--lg-error` | `#B85C5C` | Error/destructive text |

---

## Shared Components Added

All shared components live in `src/app/components/shared/`:

| Component | Purpose |
|-----------|---------|
| `SoftButton` | Primary pill button (ink → rose hover), disabled state support |
| `TextLinkButton` | Cute underline text-link button, disabled state support |
| `EmptyState` | Standard empty section with envelope icon + message + note |
| `FeatureUnavailableNote` | Animated inline note for unavailable features |
| `PillChip` | Filter chip / pill toggle (rose active, cream inactive) |
| `PaperCard` | Soft paper card surface with border + shadow |
| `DiarySectionHeader` | Dashed-border header strip inside diary frames |
| `SoftField` | Cute label + bottom-border input with rose focus |

### Component design rules

- All components use existing `--lg-*` design tokens exclusively
- No new colors were invented
- Visual output matches the original hand-crafted styles pixel-for-pixel
- Components do not over-abstract — they standardize exactly the patterns already in use

---

## Visual Patterns Standardized

| Pattern | Before | After |
|---------|--------|-------|
| Primary pill buttons | Inline styles in 5+ places | `SoftButton` component |
| Text-link buttons | Inline styles in 6+ places | `TextLinkButton` component |
| Disabled button states | Not handled | `SoftButton` + `TextLinkButton` disabled prop |
| Filter chips | Inline `Chip` in GardenView, inline in MemoryCardView | `PillChip` shared component |
| Empty/unavailable states | Ad-hoc per component | `EmptyState` + `FeatureUnavailableNote` |
| Paper card surfaces | Inline styles repeated | `PaperCard` component |
| Diary section headers | Repeated markup | `DiarySectionHeader` component |
| Form fields | Repeated markup in AuthPage, DiaryComposer | `SoftField` component |
| Focus states | Already using `--lg-focus-rose` | Preserved, added to disabled states |

---

## UI Preservation Rule

The current Latergram UI is visually strong. Phase 2 preserved it:

- ✅ Diary/book/card aesthetic preserved
- ✅ Flowers and decorative assets preserved
- ✅ Soft gradients preserved
- ✅ Rounded paper frames preserved
- ✅ Handwriting-style typography preserved
- ✅ Motion animations preserved
- ✅ Hover transitions preserved
- ✅ DiaryFrame component untouched
- ✅ BackgroundPetals, Grain, FloatingPetals untouched
- ✅ Header navigation untouched
- ✅ Landing page layout untouched

---

## User-Facing Copy Rule

**No phase numbers appear in product UI.**

Phase wording is allowed only in:
- README
- Developer documentation (`docs/`)
- Code comments

Product UI uses soft, honest, user-friendly wording:

| Instead of | Use |
|-----------|-----|
| "Phase 7" | *(never shown)* |
| "coming in Phase 5" | *(never shown)* |
| "auth phase" | *(never shown)* |
| saving works | "Saving is not connected yet." |
| delivery works | "Delivery is not connected yet." |
| Garden is live | "The Garden is closed for now." |
| download works | "Download is not connected yet." |
| accounts work | "Accounts are not connected yet." |

---

## Design-Preview Fixture Data

Fixture data is centralized in `src/app/fixtures/designPreviewData.ts`.

### What remains and why

| Fixture | Component | Why kept | Replacement phase |
|---------|-----------|----------|------------------|
| `designPreviewKeepsakeLategrams` | KeepPrivateView | Preserves card layout shape | Phase 5 + 6 |
| `designPreviewKeepsakeLetters` | KeepPrivateView | Preserves tab content layout | Phase 10 |
| `designPreviewKeepsakeTimers` | KeepPrivateView | Preserves tab content layout | Phase 5 |
| `designPreviewKeepsakeCards` | KeepPrivateView | Preserves tab content layout | Phase 16 |
| `designPreviewCounters` | TimeSinceView | Preserves counter visual + featured display | Phase 5 |
| `designPreviewCardSources` | MemoryCardView | Preserves card preview controls | Phase 6 + 16 |

### What was removed

| Former data | Component | Reason |
|-------------|-----------|--------|
| Fake Garden posts | GardenView | Replaced with honest closed Garden state |
| Fake scheduled/sent/opened letters | LateLettersView | Replaced with empty state + compose-with-warning |
| Fake "felt this" counts | GardenView | Removed — no real reactions exist |
| Fake report button | GardenView | Removed — no moderation exists |

### Fixture data rules

- All fixtures are clearly labeled with `designPreview` prefix
- Code comments state "Design preview only. Do not treat as real user data."
- No fixture data is wired into fake success flows
- No new fixture data may be added
- Each fixture entry documents which phase will replace it

---

## Duplicate Code Removed

| Removed | File | Reason |
|---------|------|--------|
| `Composer` component (unused) | HomePage.tsx | Duplicate of imported `DiaryComposer` |
| `SmallField` component (unused) | HomePage.tsx | Duplicate of shared `SoftField` pattern |
| Inline `Chip` component | GardenView.tsx | Replaced with shared `PillChip` |
| Inline `Field` component | AuthPage.tsx | Replaced with shared `SoftField` |

---

## Honesty Fixes

| Area | Before | After |
|------|--------|-------|
| Auth form | Navigated to home on submit | Shows "Accounts are not connected yet" inline |
| Auth copy | "your letters and gardens are waiting" | "a quiet account space is being prepared" |
| DiaryComposer Save/Draft | Buttons did nothing silently | Show "Saving is not connected yet" on click |
| Garden | Showed 6 fake posts with reactions | Shows beautiful closed state |
| Late Letters | Showed 3 fake scheduled/opened letters | Shows empty state + honest compose |
| Late Letters schedule | Pretended to schedule | Shows "Delivery is not connected yet" |
| Late Letters footer | "delivered by a soft magic link" | "delivery is not connected yet" |
| Time Since save | Added counter to in-memory state | Shows "Counters are not saved yet" |
| Time Since footer | "counters tick up softly, every day" | "counters are not saved yet" |
| Memory Card download | Active download button | Disabled button + "Download is not connected yet" |
| Memory Card footer | "export as image · share gently" | "export is not connected yet" |
| KeepPrivate footer | "stays softly on this device" | "saving is not connected yet" |
| KeepPrivate export | Active "export keepsake →" button | Visually disabled text |
| HomePage keepsake | "never leave this device" | "saving is not connected yet" |
| HomePage quick CTAs | "open the Garden", "write a letter", etc. | "view Garden space", "view letters space", etc. |

---

## Accessibility Improvements

- All decorative images use `alt=""` and `aria-hidden="true"` (properly quoted)
- `FeatureUnavailableNote` uses `role="status"` and `aria-live="polite"`
- Disabled buttons have `disabled` attribute and `cursor-not-allowed`
- Flower theme buttons have `aria-label` descriptions
- Download card button has descriptive `aria-label`

---

## Confirmation

- ✅ No auth implementation added
- ✅ No database added
- ✅ No localStorage added
- ✅ No routing added
- ✅ No email delivery added
- ✅ No Garden backend added
- ✅ No Memory Card export added
- ✅ No analytics added
- ✅ No payments added
- ✅ No AI added
- ✅ No Phase 3+ features implemented
