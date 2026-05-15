import { supabase, authConfigAvailable } from "../auth/authClient";
import type { DbPrivateLategram } from "./types";
import { accountLoadErrorMessage, accountSaveErrorMessage } from "../utils/reliability";

export async function listAccountLategrams(): Promise<{ data: DbPrivateLategram[]; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { data: [], error: "Accounts are not connected in this environment." };
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
      return { data: [], error: accountLoadErrorMessage("You can still use saves on this device.") };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error("listAccountLategrams exception:", err);
    return { data: [], error: accountLoadErrorMessage("You can still use saves on this device.") };
  }
}

export async function createAccountLategram(
  input: Omit<DbPrivateLategram, "id" | "user_id" | "created_at" | "updated_at" | "deleted_at">
): Promise<{ data: DbPrivateLategram | null; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { data: null, error: "Accounts are not connected in this environment." };
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
      return { data: null, error: accountSaveErrorMessage("Your words are still on this page.") };
    }

    return { data, error: null };
  } catch (err) {
    console.error("createAccountLategram exception:", err);
    return { data: null, error: accountSaveErrorMessage("Your words are still on this page.") };
  }
}

export async function removeAccountLategram(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { success: false, error: "Accounts are not connected in this environment." };
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
      return { success: false, error: accountSaveErrorMessage("This saved Lategram was not removed.") };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("removeAccountLategram exception:", err);
    return { success: false, error: accountSaveErrorMessage("This saved Lategram was not removed.") };
  }
}
