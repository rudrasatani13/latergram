import {
  createAdminClient,
  handleOptions,
  jsonResponse,
  normalizeEmail,
  sha256Hex,
} from "../_shared/late-letter-shared.ts";

interface ReportLetterRow {
  id: string;
  user_id: string | null;
  recipient_email: string;
  sent_at: string | null;
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

const REPORT_LIMIT_PER_HOUR = 10;
const allowedReasons = new Set([
  "unwanted",
  "harassment",
  "spam",
  "privacy",
  "other",
]);

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
  }

  let payload: {
    token?: unknown;
    reason?: unknown;
    details?: unknown;
    block_sender?: unknown;
  };

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_request" }, { status: 400 });
  }

  const token = typeof payload.token === "string" ? payload.token.trim() : "";
  const normalizedReason = typeof payload.reason === "string"
    ? payload.reason.trim().toLowerCase()
    : "";
  const details = typeof payload.details === "string"
    ? payload.details.trim().slice(0, 1000)
    : "";
  const blockSender = payload.block_sender === true;

  if (
    token.length < 32 || token.length > 256 ||
    !allowedReasons.has(normalizedReason)
  ) {
    return jsonResponse({ error: "invalid_request" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const ipHash = await readIpHash(req);

  if (ipHash) {
    const rateLimit = await enforceIpRateLimit(supabase, ipHash);
    if (!rateLimit.ok) {
      return jsonResponse({ error: "rate_limited" }, { status: 429 });
    }
  }

  const tokenHash = await sha256Hex(token);
  const { data, error } = await supabase
    .from("late_letters")
    .select(
      "id, user_id, recipient_email, sent_at, status, deleted_at, cancelled_at, failed_at",
    )
    .eq("secure_open_token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    console.error("report-letter lookup failed", { code: error.code });
    return jsonResponse({ error: "server_error" }, { status: 500 });
  }

  if (!data) {
    return jsonResponse({ error: "invalid_token" }, { status: 404 });
  }

  const letter = data as ReportLetterRow;

  if (
    letter.deleted_at || letter.cancelled_at || letter.failed_at ||
    !letter.sent_at || !["sent", "opened"].includes(letter.status)
  ) {
    return jsonResponse({ error: "not_available" }, { status: 410 });
  }

  const recipientEmailHash = await sha256Hex(
    normalizeEmail(letter.recipient_email),
  );

  const { data: existingReport, error: existingReportError } = await supabase
    .from("letter_safety_reports")
    .select("id")
    .eq("late_letter_id", letter.id)
    .eq("reporter_role", "recipient")
    .eq("recipient_email_hash", recipientEmailHash)
    .in("status", ["open", "reviewing"])
    .maybeSingle();

  if (existingReportError) {
    console.error("report-letter duplicate check failed", {
      code: existingReportError.code,
    });
    return jsonResponse({ error: "server_error" }, { status: 500 });
  }

  if (existingReport) {
    return jsonResponse({ error: "already_reported" }, { status: 409 });
  }

  const { data: insertedReport, error: insertError } = await supabase
    .from("letter_safety_reports")
    .insert({
      late_letter_id: letter.id,
      sender_user_id: letter.user_id,
      reporter_role: "recipient",
      recipient_email_hash: recipientEmailHash,
      reason: normalizedReason,
      details: details || null,
      status: "open",
    })
    .select("id")
    .single();

  if (insertError || !insertedReport) {
    console.error("report-letter insert failed", {
      code: insertError?.code || "no_row_inserted",
    });
    return jsonResponse({ error: "server_error" }, { status: 500 });
  }

  if (blockSender && letter.user_id) {
    const { error: blockError } = await supabase
      .from("recipient_sender_blocks")
      .upsert(
        {
          sender_user_id: letter.user_id,
          recipient_email_hash: recipientEmailHash,
          reason: "recipient_request",
        },
        {
          onConflict: "sender_user_id,recipient_email_hash",
          ignoreDuplicates: true,
        },
      );

    if (blockError) {
      console.error("report-letter sender block failed", {
        code: blockError.code,
      });
      return jsonResponse({ error: "server_error" }, { status: 500 });
    }
  }

  const safetyEvents = [
    {
      actor_user_id: null,
      target_type: "late_letter",
      target_id: letter.id,
      event_type: "late_letter_report_created",
      severity: "medium",
      notes: `recipient:${normalizedReason}`,
    },
  ];

  if (blockSender && letter.user_id) {
    safetyEvents.push({
      actor_user_id: null,
      target_type: "late_letter",
      target_id: letter.id,
      event_type: "late_letter_sender_blocked",
      severity: "medium",
      notes: "recipient_request",
    });
  }

  const { error: safetyEventError } = await supabase
    .from("safety_events")
    .insert(safetyEvents);

  if (safetyEventError) {
    console.error("report-letter safety event failed", {
      code: safetyEventError.code,
    });
    return jsonResponse({ error: "server_error" }, { status: 500 });
  }

  return jsonResponse({
    status: "ok",
    report_id: insertedReport.id,
    sender_blocked: Boolean(blockSender && letter.user_id),
  });
});

async function readIpHash(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "";

  if (!forwarded) {
    return null;
  }

  return sha256Hex(forwarded);
}

async function enforceIpRateLimit(
  supabase: ReturnType<typeof createAdminClient>,
  ipHash: string,
) {
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setMinutes(0, 0, 0);
  const windowStartIso = windowStart.toISOString();

  const { data: existingRow, error: existingError } = await supabase
    .from("action_rate_limits")
    .select("id, count")
    .eq("action", "recipient_letter_report")
    .eq("ip_hash", ipHash)
    .eq("window_start", windowStartIso)
    .maybeSingle();

  if (existingError) {
    console.error("report-letter rate limit lookup failed", {
      code: existingError.code,
    });
    return { ok: false };
  }

  if (existingRow && existingRow.count >= REPORT_LIMIT_PER_HOUR) {
    return { ok: false };
  }

  if (existingRow) {
    const { error: updateError } = await supabase
      .from("action_rate_limits")
      .update({
        count: existingRow.count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingRow.id);

    if (updateError) {
      console.error("report-letter rate limit update failed", {
        code: updateError.code,
      });
      return { ok: false };
    }

    return { ok: true };
  }

  const { error: insertError } = await supabase
    .from("action_rate_limits")
    .insert({
      action: "recipient_letter_report",
      ip_hash: ipHash,
      window_start: windowStartIso,
      count: 1,
    });

  if (insertError) {
    console.error("report-letter rate limit insert failed", {
      code: insertError.code,
    });
    return { ok: false };
  }

  return { ok: true };
}
