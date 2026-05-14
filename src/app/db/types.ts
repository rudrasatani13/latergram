export interface DbProfile {
  id: string; // UUID
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPrivateLategram {
  id: string; // UUID
  user_id: string; // UUID
  body: string;
  recipient_label: string | null;
  subject: string | null;
  destination: 'private' | 'later' | 'garden' | 'memory';
  mood: string | null;
  flower_key: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DbTimeSinceCounter {
  id: string; // UUID
  user_id: string; // UUID
  title: string;
  start_date: string; // DATE
  context: string | null;
  flower_key: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DbLateLetter {
  id: string; // UUID
  user_id: string; // UUID
  body: string;
  recipient_name: string | null;
  recipient_email: string;
  recipient_email_masked: string | null;
  subject: string | null;
  scheduled_for: string; // TIMESTAMPTZ
  status: 'draft' | 'scheduled' | 'cancelled' | 'sending' | 'sent' | 'failed' | 'opened';
  delivery_provider: string | null;
  delivery_provider_message_id: string | null;
  secure_open_token_hash: string | null;
  opened_at: string | null;
  sent_at: string | null;
  failed_at: string | null;
  cancelled_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DbGardenPost {
  id: string; // UUID
  user_id: string | null; // UUID
  body: string;
  category: string | null;
  moderation_state: 'pending' | 'approved' | 'rejected' | 'removed';
  anonymous_seed: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  deleted_at: string | null;
}

export interface DbPublicGardenPost {
  id: string; // UUID
  body: string;
  category: string | null;
  anonymous_seed: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbGardenReaction {
  id: string; // UUID
  post_id: string; // UUID
  user_id: string | null; // UUID
  anonymous_fingerprint_hash: string | null;
  created_at: string;
}

export interface DbPublicGardenReactionCount {
  post_id: string; // UUID
  reaction_count: number;
}

export interface DbGardenReport {
  id: string; // UUID
  post_id: string; // UUID
  reporter_user_id: string | null; // UUID
  reason: string;
  details: string | null;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
  reviewed_at: string | null;
  resolved_at: string | null;
}

export interface DbMemoryCard {
  id: string; // UUID
  user_id: string; // UUID
  source_type: 'lategram' | 'counter' | 'custom';
  source_id: string | null; // UUID
  title: string | null;
  body: string;
  format: 'square' | 'story' | 'wallpaper';
  theme_key: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DbRecipientOptOut {
  id: string; // UUID
  recipient_email_hash: string;
  reason: string | null;
  created_at: string;
}

export interface DbSafetyEvent {
  id: string; // UUID
  actor_user_id: string | null; // UUID
  target_type: string;
  target_id: string | null; // UUID
  event_type: string;
  severity: string; // default 'low'
  notes: string | null;
  created_at: string;
}
