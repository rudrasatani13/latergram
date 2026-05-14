# Phase 7: Auth Live Foundation Implementation Details

## Provider Chosen
**Supabase Auth**
- *Reasoning*: The Latergram master plan suggests either Supabase Auth or Clerk. Since the plan outlines the use of PostgreSQL via Supabase for the database and storage layers in Phase 8, keeping authentication on the same platform reduces configuration complexity, streamlines future integrations, and sets a cohesive foundation.

## Packages Added
- `@supabase/supabase-js`

## Environment Setup
Environment templates have been created to cleanly separate variable management across environments:
- `.env.example`: General reference file.
- `.env.local.example`: Template for local development.
- `.env.development.example`: Template for staging/development deployments.
- `.env.production.example`: Template for production (values should be securely configured in the hosting provider dashboard).

**.gitignore updates:**
All physical `.env` files (e.g., `.env`, `.env.local`, `.env.development`, `.env.production`, `.env.*.local`) are strictly ignored. No real secrets were committed.

## Auth Foundation Files
The authentication layer is centralized in `src/app/auth/`:
- `authClient.ts`: Safely instantiates the Supabase client based on environment variable availability.
- `useAuth.ts`: Exposes the `AuthContext` and hook for consuming auth state and invoking methods (`signIn`, `signUp`, `signOut`, `resetPassword`).
- `AuthProvider.tsx`: Wraps the app in `src/main.tsx`, manages session state via Supabase subscriptions, and ensures smooth persistence across refreshes.

## Missing Environment Behavior
If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not configured:
- The app will build and execute successfully without crashing.
- Forms on `AuthPage` are safely disabled.
- Graceful placeholders explain that "Accounts are not connected in this environment."

## Auth Flows (AuthPage)
- **Sign In**: Wires real sign-in logic. Navigates to `/app` on success. Errors are softly shown inline.
- **Sign Up**: Wires real account creation. Depending on email confirmation settings, redirects users or alerts them to check their email.
- **Password Reset**: Integrated seamlessly within the AuthPage as a clickable text-link action. Requests an email payload and handles success/error gently without separate pages.
- **Already Signed In**: The AuthPage respects active sessions by replacing the forms with an honest "You are signed in" view holding actions to "Go to app" or "Sign out".

## UI/UX Preservation
- **Header**: Automatically updates from "Sign in" to display the authenticated user's email alongside a "Sign out" button, maintaining its minimal design.
- **Home/Keepsake Views**: "Truth copy" added subtly indicating whether writing is local or if an account is attached (e.g., "Accounts are connected, but this archive is still stored only in this browser").
- **Aesthetic**: All typography, layouts, colors, and gradients remain entirely preserved.

## Local Data Guarantee
- The application's fundamental operation remains strictly local as intended for Phase 7. Local data paths (`latergram:v1:lategrams`, `draft`, `counters`) are unaffected.
- No database connections, sync routines, or migrations have been triggered or implemented.
- Users can continue local writing even when signed out.

## Build Results
`npm run build` runs efficiently with no errors, confirming the structural integrity of the application.

## Phase 7 Polish
- **Copy Update**: Stale "account space is being prepared" copy was corrected to accurately describe the environment's state based on actual auth availability.
- **Sign Out Flow**: Sign-out now consistently calls the provider and cleanly navigates to `/` without deleting any local data.
- **Password Reset Prep**: Added safe redirect behavior using `window.location.origin` for return trips.
- **Data Guarantee**: Confirmed again that local saved writing remains local-only. No database or account-backed archives have been added. No cloud sync was added.
- **Build Status**: Verified `npm run build` continues to pass.
