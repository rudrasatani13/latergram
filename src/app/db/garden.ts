/**
 * Garden Backend Data Layer (Phase 12)
 *
 * Provides typed functions for Garden backend operations:
 * - Submit posts (authenticated, pending moderation)
 * - Read approved public posts (via RPC)
 * - Toggle "felt this" reactions (authenticated)
 * - Report posts (authenticated)
 * - List own submissions (authenticated)
 *
 * IMPORTANT: The Garden UI is NOT live yet. These functions exist for
 * backend readiness only. The Garden remains hidden until Phase 13
 * safety and moderation work is complete.
 *
 * No user_id, reporter_user_id, or anonymous_fingerprint_hash is
 * exposed through any of these functions.
 */

import { supabase, authConfigAvailable } from "../auth/authClient";

// --- Types ---

export type GardenCategory =
  | "unsent"
  | "grief"
  | "apology"
  | "gratitude"
  | "memory"
  | "hope"
  | "other";

export const GARDEN_CATEGORIES: GardenCategory[] = [
  "unsent",
  "grief",
  "apology",
  "gratitude",
  "memory",
  "hope",
  "other",
];

export interface PublicGardenPost {
  id: string;
  body: string;
  category: string | null;
  anonymous_seed: string | null;
  created_at: string;
  reaction_count: number;
}

export interface GardenSubmitResult {
  id: string;
  moderation_state: string;
  created_at: string;
}

export interface GardenReactionState {
  post_id: string;
  reaction_count: number;
  viewer_has_reacted: boolean;
}

export interface GardenReportResult {
  id: string;
  status: string;
  created_at: string;
}

export interface MyGardenSubmission {
  id: string;
  body: string;
  category: string | null;
  moderation_state: string;
  created_at: string;
  approved_at: string | null;
}

// --- Public Approved Posts ---

export async function listPublicGardenPosts(options?: {
  category?: string | null;
  limit?: number;
  before?: string | null;
}): Promise<{ data: PublicGardenPost[]; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { data: [], error: "Database not connected" };
  }

  try {
    const { data, error } = await supabase.rpc("get_public_garden_posts", {
      p_category: options?.category ?? null,
      p_limit: options?.limit ?? 20,
      p_before: options?.before ?? null,
    });

    if (error) {
      console.error("listPublicGardenPosts error:", error);
      return { data: [], error: "Could not load Garden posts right now." };
    }

    return { data: (data as PublicGardenPost[]) || [], error: null };
  } catch (err) {
    console.error("listPublicGardenPosts exception:", err);
    return { data: [], error: "Could not connect right now." };
  }
}

// --- Submit Garden Post ---

export async function submitGardenPost(input: {
  body: string;
  category?: string | null;
}): Promise<{ data: GardenSubmitResult | null; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { data: null, error: "Database not connected" };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      return { data: null, error: "Not signed in" };
    }

    const { data, error } = await supabase.rpc("submit_garden_post", {
      p_body: input.body,
      p_category: input.category ?? null,
    });

    if (error) {
      console.error("submitGardenPost error:", error);
      if (error.message?.includes("Body is required")) {
        return { data: null, error: "Message body is required." };
      }
      if (error.message?.includes("exceeds maximum length")) {
        return { data: null, error: "Message is too long (max 1200 characters)." };
      }
      return { data: null, error: "Could not submit post right now." };
    }

    // RPC returns an array with one row
    const result = Array.isArray(data) ? data[0] : data;
    return { data: result as GardenSubmitResult, error: null };
  } catch (err) {
    console.error("submitGardenPost exception:", err);
    return { data: null, error: "Could not connect right now." };
  }
}

// --- Toggle Reaction ---

export async function toggleGardenReaction(
  postId: string
): Promise<{ data: GardenReactionState | null; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { data: null, error: "Database not connected" };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      return { data: null, error: "Not signed in" };
    }

    const { data, error } = await supabase.rpc("toggle_garden_reaction", {
      p_post_id: postId,
    });

    if (error) {
      console.error("toggleGardenReaction error:", error);
      if (error.message?.includes("not found or not available")) {
        return { data: null, error: "Post is not available." };
      }
      return { data: null, error: "Could not update reaction right now." };
    }

    const result = Array.isArray(data) ? data[0] : data;
    return { data: result as GardenReactionState, error: null };
  } catch (err) {
    console.error("toggleGardenReaction exception:", err);
    return { data: null, error: "Could not connect right now." };
  }
}

// --- Get Reaction State ---

export async function getGardenReactionState(
  postId: string
): Promise<{ data: GardenReactionState | null; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { data: null, error: "Database not connected" };
  }

  try {
    const { data, error } = await supabase.rpc("get_garden_reaction_state", {
      p_post_id: postId,
    });

    if (error) {
      console.error("getGardenReactionState error:", error);
      return { data: null, error: "Could not load reaction state." };
    }

    const result = Array.isArray(data) ? data[0] : data;
    return { data: result as GardenReactionState, error: null };
  } catch (err) {
    console.error("getGardenReactionState exception:", err);
    return { data: null, error: "Could not connect right now." };
  }
}

// --- Report Post ---

export async function reportGardenPost(input: {
  postId: string;
  reason: string;
  details?: string | null;
}): Promise<{ data: GardenReportResult | null; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { data: null, error: "Database not connected" };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      return { data: null, error: "Not signed in" };
    }

    const { data, error } = await supabase.rpc("report_garden_post", {
      p_post_id: input.postId,
      p_reason: input.reason,
      p_details: input.details ?? null,
    });

    if (error) {
      console.error("reportGardenPost error:", error);
      if (error.message?.includes("not found or not available")) {
        return { data: null, error: "Post is not available." };
      }
      if (error.message?.includes("already reported")) {
        return { data: null, error: "You have already reported this post." };
      }
      return { data: null, error: "Could not submit report right now." };
    }

    const result = Array.isArray(data) ? data[0] : data;
    return { data: result as GardenReportResult, error: null };
  } catch (err) {
    console.error("reportGardenPost exception:", err);
    return { data: null, error: "Could not connect right now." };
  }
}

// --- My Submissions ---

export async function listMyGardenSubmissions(): Promise<{
  data: MyGardenSubmission[];
  error: string | null;
}> {
  if (!authConfigAvailable || !supabase) {
    return { data: [], error: "Database not connected" };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      return { data: [], error: "Not signed in" };
    }

    const { data, error } = await supabase.rpc("get_my_garden_submissions");

    if (error) {
      console.error("listMyGardenSubmissions error:", error);
      return { data: [], error: "Could not load submissions right now." };
    }

    return { data: (data as MyGardenSubmission[]) || [], error: null };
  } catch (err) {
    console.error("listMyGardenSubmissions exception:", err);
    return { data: [], error: "Could not connect right now." };
  }
}
