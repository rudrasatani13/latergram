import { supabase, authConfigAvailable } from "../auth/authClient";
import type { DbPrivateLategram } from "./types";

export async function listAccountLategrams(): Promise<{ data: DbPrivateLategram[]; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { data: [], error: "Database not connected" };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { data: [], error: "Not signed in" };
    }

    const { data, error } = await supabase
      .from("private_lategrams")
      .select("*")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("listAccountLategrams error:", error);
      return { data: [], error: "Could not load account saves right now." };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error("listAccountLategrams exception:", err);
    return { data: [], error: "Could not connect to account right now." };
  }
}

export async function createAccountLategram(
  input: Omit<DbPrivateLategram, "id" | "user_id" | "created_at" | "updated_at" | "deleted_at">
): Promise<{ data: DbPrivateLategram | null; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { data: null, error: "Database not connected" };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { data: null, error: "Not signed in" };
    }

    const { data, error } = await supabase
      .from("private_lategrams")
      .insert({
        user_id: session.user.id,
        body: input.body,
        recipient_label: input.recipient_label,
        subject: input.subject,
        destination: input.destination,
        mood: input.mood,
        flower_key: input.flower_key,
      })
      .select()
      .single();

    if (error) {
      console.error("createAccountLategram error:", error);
      return { data: null, error: "Could not save to your account right now." };
    }

    return { data, error: null };
  } catch (err) {
    console.error("createAccountLategram exception:", err);
    return { data: null, error: "Could not connect to account right now." };
  }
}

export async function removeAccountLategram(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { success: false, error: "Database not connected" };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { success: false, error: "Not signed in" };
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("private_lategrams")
      .update({ deleted_at: now })
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("removeAccountLategram error:", error);
      return { success: false, error: "Could not remove from account right now." };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("removeAccountLategram exception:", err);
    return { success: false, error: "Could not connect to account right now." };
  }
}
