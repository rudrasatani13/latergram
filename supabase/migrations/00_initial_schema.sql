-- Phase 8 Database and Security Model

-- Enable pgcrypto for gen_random_uuid() if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update 'updated_at' column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = pg_catalog.now();
    RETURN NEW;
END;
$$;

-- 1. Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Private Lategrams
CREATE TABLE IF NOT EXISTS private_lategrams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    recipient_label TEXT,
    subject TEXT,
    destination TEXT NOT NULL CHECK (destination IN ('private', 'later', 'garden', 'memory')),
    mood TEXT,
    flower_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TRIGGER update_private_lategrams_updated_at BEFORE UPDATE ON private_lategrams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Time Since Counters
CREATE TABLE IF NOT EXISTS time_since_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_date DATE NOT NULL,
    context TEXT,
    flower_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TRIGGER update_time_since_counters_updated_at BEFORE UPDATE ON time_since_counters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Late Letters
CREATE TABLE IF NOT EXISTS late_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    recipient_name TEXT,
    recipient_email TEXT NOT NULL,
    recipient_email_masked TEXT,
    subject TEXT,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'cancelled', 'sending', 'sent', 'failed', 'opened')),
    delivery_provider TEXT,
    delivery_provider_message_id TEXT,
    secure_open_token_hash TEXT,
    opened_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TRIGGER update_late_letters_updated_at BEFORE UPDATE ON late_letters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Garden Posts
CREATE TABLE IF NOT EXISTS garden_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    category TEXT,
    moderation_state TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_state IN ('pending', 'approved', 'rejected', 'removed')),
    anonymous_seed TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);
CREATE TRIGGER update_garden_posts_updated_at BEFORE UPDATE ON garden_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Safe public view for Garden Posts (excluding user_id and sensitive fields)
-- This view uses security_invoker = on to respect RLS and follow security best practices.
CREATE OR REPLACE VIEW public.public_garden_posts 
AS
SELECT id, body, category, anonymous_seed, created_at, updated_at
FROM public.garden_posts
WHERE moderation_state = 'approved' AND deleted_at IS NULL;

GRANT SELECT ON public.public_garden_posts TO anon, authenticated;

-- 6. Garden Reactions
CREATE TABLE IF NOT EXISTS garden_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES garden_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    anonymous_fingerprint_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Safe public view for Garden Reaction Counts
-- This view uses security_invoker = on to respect RLS and follow security best practices.
CREATE OR REPLACE VIEW public.public_garden_reaction_counts 
AS
SELECT post_id, count(*) as reaction_count
FROM public.garden_reactions gr
JOIN public.garden_posts gp ON gr.post_id = gp.id
WHERE gp.moderation_state = 'approved' AND gp.deleted_at IS NULL
GROUP BY post_id;

GRANT SELECT ON public.public_garden_reaction_counts TO anon, authenticated;

-- 7. Garden Reports
CREATE TABLE IF NOT EXISTS garden_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES garden_posts(id) ON DELETE CASCADE,
    reporter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

-- 8. Memory Cards
CREATE TABLE IF NOT EXISTS memory_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('lategram', 'counter', 'custom')),
    source_id UUID,
    title TEXT,
    body TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'square' CHECK (format IN ('square', 'story', 'wallpaper')),
    theme_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TRIGGER update_memory_cards_updated_at BEFORE UPDATE ON memory_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Recipient Opt Outs
CREATE TABLE IF NOT EXISTS recipient_opt_outs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email_hash TEXT NOT NULL UNIQUE,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Safety Events
CREATE TABLE IF NOT EXISTS safety_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'low',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_lategrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_since_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE late_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipient_opt_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles: Users can select/insert/update their own profile
CREATE POLICY "Users can select their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Private Lategrams: Users can fully manage their own rows
CREATE POLICY "Users can select own private_lategrams" ON private_lategrams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own private_lategrams" ON private_lategrams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own private_lategrams" ON private_lategrams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own private_lategrams" ON private_lategrams FOR DELETE USING (auth.uid() = user_id);

-- Time Since Counters: Users can fully manage their own rows
CREATE POLICY "Users can select own counters" ON time_since_counters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own counters" ON time_since_counters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own counters" ON time_since_counters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own counters" ON time_since_counters FOR DELETE USING (auth.uid() = user_id);

-- Late Letters: Users can fully manage their own rows
CREATE POLICY "Users can select own late_letters" ON late_letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own late_letters" ON late_letters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own late_letters" ON late_letters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own late_letters" ON late_letters FOR DELETE USING (auth.uid() = user_id);

-- Garden Posts: 
CREATE POLICY "Authenticated users can insert pending garden posts" ON garden_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND moderation_state = 'pending' AND auth.uid() = user_id);
CREATE POLICY "Users can update own garden posts if not approved" ON garden_posts FOR UPDATE USING (auth.uid() = user_id AND moderation_state = 'pending');
CREATE POLICY "Users can delete own garden posts" ON garden_posts FOR DELETE USING (auth.uid() = user_id);

-- Garden Reactions
CREATE POLICY "Users can insert reactions on approved posts" ON garden_reactions FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
        SELECT 1 FROM garden_posts 
        WHERE id = post_id 
        AND moderation_state = 'approved' 
        AND deleted_at IS NULL
    )
);
CREATE POLICY "Users can delete own reactions" ON garden_reactions FOR DELETE USING (auth.uid() = user_id);

-- Garden Reports: Users can insert reports, cannot read all reports
CREATE POLICY "Authenticated users can insert reports" ON garden_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = reporter_user_id);
-- No public select policy for reports.

-- Memory Cards: Users can fully manage their own rows
CREATE POLICY "Users can select own memory_cards" ON memory_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memory_cards" ON memory_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memory_cards" ON memory_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memory_cards" ON memory_cards FOR DELETE USING (auth.uid() = user_id);

-- Recipient Opt Outs: No public access
-- Safety Events: No public access

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_private_lategrams_user_id_updated_at ON private_lategrams(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_time_since_counters_user_id_updated_at ON time_since_counters(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_late_letters_user_id_scheduled_for ON late_letters(user_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_late_letters_status_scheduled_for ON late_letters(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_garden_posts_moderation_state_created_at ON garden_posts(moderation_state, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_garden_reactions_post_id ON garden_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_garden_reports_post_id_status ON garden_reports(post_id, status);
CREATE INDEX IF NOT EXISTS idx_memory_cards_user_id_updated_at ON memory_cards(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_safety_events_target_type_target_id ON safety_events(target_type, target_id);
