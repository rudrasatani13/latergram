# Phase 3: App Structure and Navigation

**Completed:** 2026-05-13

## Summary

Phase 3 replaced the local `useState` page-switcher in `App.tsx` with real route-based navigation using React Router v7. The app now has clean URL-based routing, browser back/forward support, direct URL access, and a soft Latergram-style 404 page — while preserving the exact visual design from Phase 2.

---

## Routes Added

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `LandingPage` | Public product/vision page |
| `/auth` | `AuthPage` | Account access page (not connected yet) |
| `/app` | `HomePage` | Main app shell for writing and product areas |
| `/app?section=write` | `HomePage` | Write section (default) |
| `/app?section=private` | `HomePage` | Keep Private section |
| `/app?section=garden` | `HomePage` | The Garden section |
| `/app?section=later` | `HomePage` | Late Letters section |
| `/app?section=time` | `HomePage` | Time Since section |
| `/app?section=memory` | `HomePage` | Memory Cards section |
| `/404` | `NotFoundPage` | Soft 404 page |
| `*` | Redirects to `/404` | Unknown route handler |

---

## App Structure Changes

### Before (Phase 2)

```
src/main.tsx          → renders <App />
src/app/App.tsx       → useState("landing" | "auth" | "home") + conditional rendering
src/app/pages/        → LandingPage, AuthPage, HomePage (all accept onNavigate prop)
src/app/components/   → Header accepts onNavigate prop
```

### After (Phase 3)

```
src/main.tsx          → wraps <App /> in <BrowserRouter>
src/app/App.tsx       → Routes + AnimatePresence with location.pathname key
src/app/pages/        → LandingPage, AuthPage, HomePage, NotFoundPage (no onNavigate props)
src/app/components/   → Header uses useNavigate() internally
```

### Key Changes

- `App.tsx` no longer uses `useState` for page selection. Routes define page boundaries.
- All `onNavigate` callback props were removed from pages and Header.
- Header now uses `useNavigate()` from React Router internally.
- Navigation is no longer passed down as props — each component navigates independently.
- `BrowserRouter` is mounted in `main.tsx`, keeping App.tsx clean.

---

## Shell/Layout Changes

No separate AppShell or layout wrapper file was extracted. Each page (LandingPage, AuthPage, HomePage, NotFoundPage) continues to compose its own shell from `BackgroundPetals`, `Grain`, `Header`, and a `<main>` wrapper — exactly as before.

**Rationale:** Extracting a shared shell would risk changing the visual output since each page uses slightly different Header variants and spacing. The current approach preserves visual fidelity with zero risk.

---

## How Navigation Works

### Route-level navigation
- `BrowserRouter` in `main.tsx` provides history context.
- `App.tsx` uses `<Routes>` to map paths to page components.
- `AnimatePresence` with `location.pathname` as key provides soft page transitions (same timing and easing as the original `useState` switcher).

### Header navigation
- Logo → navigates to `/`
- Write → navigates to `/app`
- About → navigates to `/`
- Sign in → navigates to `/auth`
- "← Back to app" (minimal variant) → navigates to `/app`

### Header links simplified
- Removed "Garden" and "Letters" from the public header nav.
- These features are not live and should not be implied as navigable from the global header.
- Safe public header is now: **Write**, **About**, **Sign in**.

### Page-level navigation
- LandingPage: "Begin softly" → `/auth`, "or wander in →" → `/app`
- AuthPage: Header handles back-to-app navigation
- NotFoundPage: "Go home" → `/`, "or start writing →" → `/app`

---

## What Remained as Internal HomePage Section State

HomePage internal sections (Write, Keep Private, The Garden, Late Letters, Time Since, Memory Cards) remain as internal navigation within the single `/app` route. They are **not** separate pages with their own routes.

However, they are now reflected in the URL via query parameters (see below).

---

## Query Parameters

**Query params were added.** The HomePage uses `useSearchParams()` from React Router to sync internal section state with the URL.

### Behavior
- `/app` → defaults to "write" section
- `/app?section=private` → opens Keep Private
- `/app?section=garden` → opens The Garden
- `/app?section=later` → opens Late Letters
- `/app?section=time` → opens Time Since
- `/app?section=memory` → opens Memory Cards
- `/app?section=invalid` → falls back to "write"
- Clicking section tabs updates the URL
- Browser back/forward moves between sections
- The "write" section uses a clean `/app` URL (no `?section=write` in the address bar)

### Implementation
- `resolveSection()` validates the `section` query param against a whitelist of valid section IDs
- Invalid values silently fall back to "write"
- `setSearchParams()` with `replace: false` ensures each section change creates a history entry for back/forward navigation

---

## Mobile Navigation Notes

No mobile redesign was performed. The existing navigation remains functional on mobile:

- Header remains a single flex row with logo and nav items.
- On mobile, the full header nav links are hidden (`hidden md:flex`), leaving only the Logo and Sign in button visible — this was already the case before Phase 3.
- App section tabs use `flex-wrap` and remain tappable on small screens.
- No overflow issues were introduced.
- No bottom nav or drawer was added — this remains future mobile polish work (Phase 14).

---

## Browser Behavior Confirmation

- ✅ Visiting `/` directly opens LandingPage
- ✅ Visiting `/auth` directly opens AuthPage
- ✅ Visiting `/app` directly opens HomePage
- ✅ Refreshing `/auth` keeps AuthPage
- ✅ Refreshing `/app` keeps HomePage
- ✅ Browser back and forward work between pages
- ✅ Browser back and forward work between HomePage sections (via query params)
- ✅ Unknown routes redirect to a soft 404 page
- ✅ Page transitions use AnimatePresence with the same timing as before

---

## Confirmations

### UI Preserved
- ✅ Landing page looks the same
- ✅ Auth page looks the same
- ✅ Home/app page looks the same
- ✅ Diary composer looks the same
- ✅ Garden, Late Letters, Time Since, Memory Cards preserve current visual quality
- ✅ No spacing, typography, color, gradient, or animation changes
- ✅ No generic redesign

### No Backend/Auth/Storage Added
- ✅ No auth was connected
- ✅ No backend or database was added
- ✅ No localStorage or device persistence was added
- ✅ No email delivery was added
- ✅ No Garden backend was added
- ✅ No Memory Card export was added
- ✅ No analytics, payments, or AI was added

### Product Honesty
- ✅ No fake auth success
- ✅ No fake save/draft success
- ✅ No fake schedule/send/open success
- ✅ No fake Garden reaction/report success
- ✅ No fake export/download success
- ✅ No user-facing phase-number wording
- ✅ Existing honest unavailable states preserved

### Build
- ✅ `npm run build` passes cleanly (457 modules, 0 errors)
