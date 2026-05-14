# Phase 8: Database and Security Model

## Overview

This document summarizes the Database and Security Model implementation for Phase 8. The foundation uses PostgreSQL (via Supabase) to prepare for secure, account-backed data storage and server-side operations while strictly ensuring user privacy and zero-trust safety out of the box.

## Current Status: Local-Only Development

**IMPORTANT:** The schemas and security models described here are prepared for backend integration, but **the frontend does not use them yet.**
- Saving writing is still stored only in local storage on the browser.
- No frontend account-backed storage is currently connected.
- Local storage content is **not** automatically migrated to the database.
- Delivery of scheduled late letters, Garden posting, and memory card exports are **intentionally not live.**

No mock/fake seed data has been introduced.

## Security Model and RLS Policies

Row Level Security (RLS) is enabled on **all** sensitive tables.

### Private User-Owned Data
For the following tables, a strict policy model has been applied:
- `profiles`
- `private_lategrams`
- `time_since_counters`
- `late_letters`
- `memory_cards`

**Policies applied:**
- Users can only `SELECT` their own rows.
- Users can only `INSERT` rows associated with their authenticated `user_id`.
- Users can only `UPDATE` their own rows.
- Users can only `DELETE` their own rows.

There is **no public read or write access** to these tables.

### The Garden (Public/Moderated Data)

To support public read capabilities safely in the future without leaking PII:
- **`garden_posts`**: Authenticated users can insert posts, but must insert them as `pending` moderation state. Users can delete or edit their own posts if they are pending. Normal users cannot approve, reject, or remove posts. No public SELECT policy exists on the raw table.
- **Public View (`public_garden_posts`)**: A dedicated view exposes only approved posts, excluding the underlying `user_id` and other sensitive columns.
- **`garden_reactions`**: Reactions can be added by authenticated users only if the post is approved. No public SELECT policy exists on the raw table.
- **Public View (`public_garden_reaction_counts`)**: Exposes aggregated reaction counts safely.
- **`garden_reports`**: Users can create reports, but no public read policy is available. Only moderation/admin access will be allowed to view these.

### Safety and Compliance

- **`recipient_opt_outs`**: Stores hashes of emails that have opted out of future deliveries. No public access.
- **`safety_events`**: An audit table for moderation and system-level actions. No public access.
- **Service Roles**: No service-role key is exposed in the frontend. All client interactions respect RLS.

## Phase 8 Security Polish: Garden Public Access Hardening

To ensure zero-trust safety and prevent accidental data leaks (like `user_id` or anonymous fingerprints), the public access policies for the Garden have been tightened:
- **Raw Base-Table Access Removed:** Public `SELECT` policies were completely removed from `garden_posts` and `garden_reactions`. The public cannot query these tables directly.
- **Safe Public Views:** Public reads must happen through explicitly defined views (`public_garden_posts` and `public_garden_reaction_counts`). These views omit sensitive columns (`user_id`, `anonymous_fingerprint_hash`, moderation metadata) and filter for `approved` content only.
- **Strict Reaction Policies:** Reactions can only be added to posts that are already approved and not deleted. Reaction counts are aggregated safely in the `public_garden_reaction_counts` view.
- **Private Reports:** Garden reports remain strictly private, with no public read access. Admin/moderation access will be implemented in later phases.
- **Frontend Remains Local:** No frontend behaviors were altered. The Garden remains intentionally disconnected and not live. No account-backed storage has been added.

## Migration Files

The initial schema has been generated at `supabase/migrations/00_initial_schema.sql`. 
TypeScript types corresponding to these tables are available at `src/app/db/types.ts`.

## How to Apply Migrations

### Local Development
To apply migrations locally with the Supabase CLI:
```bash
supabase start
supabase db reset
```

### Development / Staging / Production
Use the Supabase CLI to apply migrations to remote environments:
```bash
supabase link --project-ref <your-project-id>
supabase db push
```

## RLS Testing Checklist
Before taking account-backed features live in Phase 9, ensure:
- [ ] Attempting to `SELECT` another user's `private_lategrams` returns 0 rows.
- [ ] Attempting to `INSERT` a `private_lategram` with a forged `user_id` fails.
- [ ] Attempting to `SELECT` a pending `garden_post` unauthenticated fails (or only returns own pending).
- [ ] Attempting to query `recipient_opt_outs` or `safety_events` as an authenticated user fails.
