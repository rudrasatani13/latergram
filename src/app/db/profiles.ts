import { supabase, authConfigAvailable } from "../auth/authClient";
import type { DbProfile } from "./types";

export async function upsertOwnProfile(displayName: string | null = null): Promise<{ data: DbProfile | null; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { data: null, error: "Database not connected" };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { data: null, error: "Not signed in" };
    }

    // Profile table is linked to auth.users by id, and RLS policy uses 'id = auth.uid()'
    const nameToSave = displayName || session.user.user_metadata?.name || null;

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: session.user.id,
        display_name: nameToSave,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("upsertOwnProfile error:", error);
      return { data: null, error: "Could not save profile right now." };
    }

    return { data, error: null };
  } catch (err) {
    console.error("upsertOwnProfile exception:", err);
    return { data: null, error: "Could not connect to account right now." };
  }
}
