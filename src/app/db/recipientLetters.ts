import { authConfigAvailable, supabase } from "../auth/authClient";

export interface RecipientLetter {
  body: string;
  subject: string;
  recipient_name: string | null;
  sent_at: string | null;
  opened_at: string | null;
}

export type OpenLetterResult =
  | { status: "available"; letter: RecipientLetter }
  | { status: "unavailable"; reason: "invalid" | "not_available" | "not_ready" | "server_error" };

type UnavailableReason = Extract<OpenLetterResult, { status: "unavailable" }>["reason"];

export async function openRecipientLetter(token: string): Promise<OpenLetterResult> {
  if (!authConfigAvailable || !supabase) {
    return { status: "unavailable", reason: "server_error" };
  }

  const { data, error } = await supabase.functions.invoke("open-letter", {
    body: { token },
  });

  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status;

    if (status === 404) {
      return { status: "unavailable", reason: "invalid" };
    }

    if (status === 409) {
      return { status: "unavailable", reason: "not_ready" };
    }

    if (status === 410) {
      return { status: "unavailable", reason: "not_available" };
    }

    return { status: "unavailable", reason: "server_error" };
  }

  if (data?.status === "available" && data.letter) {
    return {
      status: "available",
      letter: data.letter as RecipientLetter,
    };
  }

  return {
    status: "unavailable",
    reason: toUnavailableReason(data?.reason),
  };
}

export async function optOutRecipientEmail(email: string): Promise<{ error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { error: "Latergram is not connected right now." };
  }

  const { error } = await supabase.functions.invoke("recipient-opt-out", {
    body: { email },
  });

  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status;

    if (status === 400) {
      return { error: "Enter a valid-looking email." };
    }

    return { error: "Could not save that request right now." };
  }

  return { error: null };
}

function toUnavailableReason(value: unknown): UnavailableReason {
  if (value === "invalid" || value === "not_available" || value === "not_ready" || value === "server_error") {
    return value;
  }

  return "server_error";
}
