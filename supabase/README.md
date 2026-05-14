# Supabase Configuration

This directory contains the database migrations and configuration needed for the Latergram backend.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed.
- Docker installed and running (for local development).

## Applying Migrations

### Local Environment
To spin up a local instance of Supabase and apply all migrations:
```bash
supabase start
```
To reset your local database and re-apply all migrations from scratch:
```bash
supabase db reset
```

### Remote Environments (Production)
**WARNING:** Production migrations should be treated with caution. Rollbacks are not automatically handled by pushing forward migrations; ensure your database is backed up before applying.
```bash
supabase link --project-ref <your-project-id>
supabase db push
```

## Security Requirements

- **Authentication:** Must be configured in the Supabase Dashboard.
- **RLS (Row Level Security):** RLS is enabled across all sensitive tables.
- **Service Role:** The Supabase Service Role key should **never** be used in the client application. The client must only interact with the database using the anon key and authenticated sessions, relying on RLS policies.
- **Public Garden Access:** Must use safe views (`public_garden_posts`, `public_garden_reaction_counts`) or RPCs, not raw base-table access. Do not expose `user_id` or reaction fingerprints from public Garden reads.
