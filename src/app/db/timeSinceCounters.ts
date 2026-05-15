import { supabase, authConfigAvailable } from "../auth/authClient";
import type { DbTimeSinceCounter } from "./types";
import { accountLoadErrorMessage, accountSaveErrorMessage } from "../utils/reliability";

export async function listAccountCounters(): Promise<{ data: DbTimeSinceCounter[]; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { data: [], error: "Accounts are not connected in this environment." };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { data: [], error: "Not signed in" };
    }

    const { data, error } = await supabase
      .from("time_since_counters")
      .select("*")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("listAccountCounters error:", error);
      return { data: [], error: accountLoadErrorMessage("You can still use counters on this device.") };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error("listAccountCounters exception:", err);
    return { data: [], error: accountLoadErrorMessage("You can still use counters on this device.") };
  }
}

export async function createAccountCounter(
  input: Omit<DbTimeSinceCounter, "id" | "user_id" | "created_at" | "updated_at" | "deleted_at">
): Promise<{ data: DbTimeSinceCounter | null; error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { data: null, error: "Accounts are not connected in this environment." };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { data: null, error: "Not signed in" };
    }

    const { data, error } = await supabase
      .from("time_since_counters")
      .insert({
        user_id: session.user.id,
        title: input.title,
        start_date: input.start_date,
        context: input.context,
        flower_key: input.flower_key,
      })
      .select()
      .single();

    if (error) {
      console.error("createAccountCounter error:", error);
      return { data: null, error: accountSaveErrorMessage("This counter was not saved to your account.") };
    }

    return { data, error: null };
  } catch (err) {
    console.error("createAccountCounter exception:", err);
    return { data: null, error: accountSaveErrorMessage("This counter was not saved to your account.") };
  }
}

export async function removeAccountCounter(id: string): Promise<{ success: boolean; error: string | null }> {
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
      .from("time_since_counters")
      .update({ deleted_at: now })
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("removeAccountCounter error:", error);
      return { success: false, error: accountSaveErrorMessage("This counter was not removed.") };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("removeAccountCounter exception:", err);
    return { success: false, error: accountSaveErrorMessage("This counter was not removed.") };
  }
}
