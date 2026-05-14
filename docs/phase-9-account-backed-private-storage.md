# Phase 9: Account-Backed Private Storage V1

## Overview
This phase connects signed-in users to real account-backed private storage using Supabase, effectively moving from local-only storage to a true backend persistence model for "Keep Private", while preserving full local storage capabilities for signed-out users.

## Changes Implemented

1. **Database Access Layer**
   - Added `src/app/db/privateLategrams.ts`: Handles CRUD operations for `private_lategrams`.
   - Added `src/app/db/timeSinceCounters.ts`: Handles CRUD operations for `time_since_counters`.
   - Added `src/app/db/profiles.ts`: Handles profile creation/upserting upon login/signup.

2. **React Hooks**
   - Added `useAccountLategrams.ts`: Maps database lategrams to UI state, manages loading/error, handles RLS integration implicitly.
   - Added `useAccountCounters.ts`: Maps database counters to UI state.

3. **DiaryComposer Updates**
   - Signed-out users retain the "Save on this device" button.
   - Signed-in users see "Save to account" as the primary action.
   - Saves successfully go to the `private_lategrams` table.
   - Drafts currently remain securely in `localStorage` as local drafts.

4. **KeepPrivateView Updates**
   - Separates account data from local data cleanly without automatic merging.
   - Signed-in users can browse their true account archive for Lategrams and Time Since counters.
   - Implemented an **explicit local-to-account import flow** so users can intentionally migrate local device saves to their account.
   - "My Lategrams" tab supports filtering across both local and account contexts seamlessly.

5. **Time Since Counters**
   - The "Time Since" feature has been securely connected to the backend. Signed-in users save to `time_since_counters`.

## What Was NOT Changed (Intentionally)
- **Automatic Migration**: No automatic copying of `localStorage` data occurs. The user has explicit control over migration.
- **Late Letters**: Still simulated. Letters are saved as private lategrams marked with the `later` destination. Delivery is not active.
- **Garden**: Still simulated. Garden posts are saved as private lategrams marked with the `garden` destination.
- **Memory Cards**: Still simulated.
- **UI Architecture**: No broad redesigns or changes to typography, animations, etc., were made, preserving the exact frontend aesthetic.

## Security and Architecture Note
- **RLS Compliant**: Frontend logic entirely relies on Supabase Row Level Security.
- **No Service Role**: Only the `anon` key is exposed and utilized safely.
- **Missing Env Fallback**: The system handles missing `.env` gracefully. If Supabase is disconnected, local functionality remains intact without crashing.
