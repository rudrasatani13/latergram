import { authConfigAvailable, supabase } from "../auth/authClient";
import { maskRecipientEmail } from "../utils/emailMasking";
import type { DbLateLetter } from "./types";

export type LateLetterRecord = Pick<
  DbLateLetter,
  | "id"
  | "user_id"
  | "body"
  | "recipient_name"
  | "recipient_email_masked"
  | "subject"
  | "scheduled_for"
  | "status"
  | "failed_at"
  | "cancelled_at"
  | "failure_reason"
  | "created_at"
  | "updated_at"
  | "deleted_at"
>;

export interface CreateLateLetterInput {
  body: string;
  recipient_name?: string | null;
  recipient_email: string;
  subject?: string | null;
  scheduled_for: string;
}

type DataResult<T> = Promise<{ data: T; error: string | null }>;

const lateLetterSelectColumns = [
  "id",
  "user_id",
  "body",
  "recipient_name",
  "recipient_email_masked",
  "subject",
  "scheduled_for",
  "status",
  "failed_at",
  "cancelled_at",
  "failure_reason",
  "created_at",
  "updated_at",
  "deleted_at",
].join(", ");

function safeLog(label: string, error: unknown) {
  if (!error || typeof error !== "object") {
    console.error(label, "Unknown database error");
    return;
  }

  const dbError = error as { code?: string; message?: string };
  console.error(label, {
    code: dbError.code,
    message: dbError.message,
  });
}

async function getSignedInUserId() {
  if (!authConfigAvailable || !supabase) {
    return { userId: null, error: "Database not connected" };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { userId: null, error: "Not signed in" };
  }

  return { userId: session.user.id, error: null };
}

export async function listLateLetters(): DataResult<LateLetterRecord[]> {
  try {
    const { userId, error: sessionError } = await getSignedInUserId();

    if (!userId) {
      return { data: [], error: sessionError };
    }

    const { data, error } = await supabase!
      .from("late_letters")
      .select(lateLetterSelectColumns)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("scheduled_for", { ascending: true });

    if (error) {
      safeLog("listLateLetters error:", error);
      return { data: [], error: "Your scheduled letters could not load right now." };
    }

    return { data: (data || []) as LateLetterRecord[], error: null };
  } catch (error) {
    safeLog("listLateLetters exception:", error);
    return { data: [], error: "Could not connect to your letters right now." };
  }
}

export async function createLateLetter(input: CreateLateLetterInput): DataResult<LateLetterRecord | null> {
  try {
    const { userId, error: sessionError } = await getSignedInUserId();

    if (!userId) {
      return { data: null, error: sessionError };
    }

    const recipientEmail = input.recipient_email.trim();

    const { data, error } = await supabase!
      .from("late_letters")
      .insert({
        user_id: userId,
        body: input.body,
        recipient_name: input.recipient_name?.trim() || null,
        recipient_email: recipientEmail,
        recipient_email_masked: maskRecipientEmail(recipientEmail),
        subject: input.subject?.trim() || null,
        scheduled_for: input.scheduled_for,
        status: "scheduled",
      })
      .select(lateLetterSelectColumns)
      .single();

    if (error) {
      safeLog("createLateLetter error:", error);
      return { data: null, error: "Could not save this Late Letter. Your words are still here." };
    }

    return { data: data as LateLetterRecord, error: null };
  } catch (error) {
    safeLog("createLateLetter exception:", error);
    return { data: null, error: "Could not connect to your account right now." };
  }
}

export async function cancelLateLetter(id: string): DataResult<LateLetterRecord | null> {
  try {
    const { userId, error: sessionError } = await getSignedInUserId();

    if (!userId) {
      return { data: null, error: sessionError };
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase!
      .from("late_letters")
      .update({
        status: "cancelled",
        cancelled_at: now,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .in("status", ["draft", "scheduled"])
      .select(lateLetterSelectColumns)
      .maybeSingle();

    if (error) {
      safeLog("cancelLateLetter error:", error);
      return { data: null, error: "Could not cancel this Late Letter right now." };
    }

    if (!data) {
      return { data: null, error: "Only scheduled Late Letters can be cancelled here." };
    }

    return { data: data as LateLetterRecord, error: null };
  } catch (error) {
    safeLog("cancelLateLetter exception:", error);
    return { data: null, error: "Could not connect to your account right now." };
  }
}
