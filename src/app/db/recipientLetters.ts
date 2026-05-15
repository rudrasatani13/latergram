import { authConfigAvailable, supabase } from "../auth/authClient";
import { recipientActionErrorMessage } from "../utils/reliability";

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

  let data: unknown = null;
  let error: { context?: { status?: number } } | null = null;

  try {
    const result = await supabase.functions.invoke("open-letter", {
      body: { token },
    });
    data = result.data;
    error = result.error;
  } catch {
    return { status: "unavailable", reason: "server_error" };
  }

  if (error) {
    const status = error.context?.status;

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

  if (isRecord(data) && data.status === "available" && data.letter) {
    return {
      status: "available",
      letter: data.letter as RecipientLetter,
    };
  }

  return {
    status: "unavailable",
    reason: toUnavailableReason(isRecord(data) ? data.reason : undefined),
  };
}

export async function optOutRecipientEmail(email: string): Promise<{ error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { error: "Latergram is not connected right now." };
  }

  let error: { context?: { status?: number } } | null = null;

  try {
    const result = await supabase.functions.invoke("recipient-opt-out", {
      body: { email },
    });
    error = result.error;
  } catch {
    return { error: recipientActionErrorMessage("The opt-out request was not saved.") };
  }

  if (error) {
    const status = error.context?.status;

    if (status === 400) {
      return { error: "Enter a valid-looking email." };
    }

    return { error: recipientActionErrorMessage("The opt-out request was not saved.") };
  }

  return { error: null };
}

export async function reportRecipientLetter(input: {
  token: string;
  reason: string;
  details?: string | null;
  blockSender?: boolean;
}): Promise<{ error: string | null }> {
  if (!authConfigAvailable || !supabase) {
    return { error: "Latergram is not connected right now." };
  }

  let error: { context?: { status?: number } } | null = null;

  try {
    const result = await supabase.functions.invoke("report-letter", {
      body: {
        token: input.token,
        reason: input.reason,
        details: input.details ?? null,
        block_sender: Boolean(input.blockSender),
      },
    });
    error = result.error;
  } catch {
    return { error: recipientActionErrorMessage("The report was not submitted.") };
  }

  if (error) {
    const status = error.context?.status;

    if (status === 400) {
      return { error: "Choose a reason first." };
    }

    if (status === 404) {
      return { error: "This letter link is not available." };
    }

    if (status === 409) {
      return { error: "This letter has already been reported." };
    }

    if (status === 410) {
      return { error: "This letter is unavailable." };
    }

    return { error: recipientActionErrorMessage("The report was not submitted.") };
  }

  return { error: null };
}

function toUnavailableReason(value: unknown): UnavailableReason {
  if (value === "invalid" || value === "not_available" || value === "not_ready" || value === "server_error") {
    return value;
  }

  return "server_error";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
