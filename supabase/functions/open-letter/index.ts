import {
  createAdminClient,
  handleOptions,
  jsonResponse,
  sha256Hex,
} from "../_shared/late-letter-shared.ts";

interface OpenLetterRow {
  id: string;
  body: string;
  recipient_name: string | null;
  subject: string | null;
  sent_at: string | null;
  opened_at: string | null;
  status:
    | "draft"
    | "scheduled"
    | "cancelled"
    | "sending"
    | "sent"
    | "failed"
    | "opened";
  deleted_at: string | null;
  cancelled_at: string | null;
  failed_at: string | null;
}

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
  }

  let payload: { token?: unknown };

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ status: "unavailable", reason: "invalid" }, {
      status: 400,
    });
  }

  const token = typeof payload.token === "string" ? payload.token.trim() : "";

  if (token.length < 32 || token.length > 256) {
    return jsonResponse({ status: "unavailable", reason: "invalid" }, {
      status: 404,
    });
  }

  const tokenHash = await sha256Hex(token);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("late_letters")
    .select(
      "id, body, recipient_name, subject, sent_at, opened_at, status, deleted_at, cancelled_at, failed_at",
    )
    .eq("secure_open_token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    console.error("open-letter lookup failed", { code: error.code });
    return jsonResponse({ status: "unavailable", reason: "server_error" }, {
      status: 500,
    });
  }

  if (!data) {
    return jsonResponse({ status: "unavailable", reason: "invalid" }, {
      status: 404,
    });
  }

  const letter = data as OpenLetterRow;

  if (
    letter.deleted_at || letter.cancelled_at || letter.failed_at ||
    letter.status === "cancelled" || letter.status === "failed"
  ) {
    return jsonResponse({ status: "unavailable", reason: "not_available" }, {
      status: 410,
    });
  }

  if (!letter.sent_at || !["sent", "opened"].includes(letter.status)) {
    return jsonResponse({ status: "unavailable", reason: "not_ready" }, {
      status: 409,
    });
  }

  let openedAt = letter.opened_at;

  if (!openedAt) {
    openedAt = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from("late_letters")
      .update({
        status: "opened",
        opened_at: openedAt,
      })
      .eq("id", letter.id)
      .in("status", ["sent", "opened"])
      .select("opened_at")
      .maybeSingle();

    if (updateError || !updated) {
      console.error("open-letter opened update failed", {
        letter_id: letter.id,
        code: updateError?.code || "no_row_updated",
      });
      return jsonResponse({ status: "unavailable", reason: "server_error" }, {
        status: 500,
      });
    }

    openedAt = updated.opened_at as string;
  }

  return jsonResponse({
    status: "available",
    letter: {
      body: letter.body,
      subject: letter.subject?.trim() || "A Late Letter arrived for you",
      recipient_name: letter.recipient_name,
      sent_at: letter.sent_at,
      opened_at: openedAt,
    },
  });
});
