import { Resend } from "npm:resend@6.12.3";
import {
  createAdminClient,
  eventTimestamp,
  handleOptions,
  jsonResponse,
  requireEnv,
} from "../_shared/late-letter-shared.ts";

interface ResendWebhookPayload {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    failed?: { reason?: string };
    bounce?: { message?: string };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
  }

  let webhookSecret = "";

  try {
    webhookSecret = requireEnv("RESEND_WEBHOOK_SECRET");
  } catch {
    return jsonResponse({ error: "webhook_env_missing" }, { status: 500 });
  }

  const svixId = req.headers.get("svix-id") || "";
  const svixTimestamp = req.headers.get("svix-timestamp") || "";
  const svixSignature = req.headers.get("svix-signature") || "";

  if (!svixId || !svixTimestamp || !svixSignature) {
    return jsonResponse({ error: "missing_signature_headers" }, {
      status: 400,
    });
  }

  const rawPayload = await req.text();
  const resend = new Resend(Deno.env.get("RESEND_API_KEY") || undefined);
  let event: ResendWebhookPayload;

  try {
    event = resend.webhooks.verify({
      payload: rawPayload,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      webhookSecret,
    }) as unknown as ResendWebhookPayload;
  } catch {
    return jsonResponse({ error: "invalid_signature" }, { status: 400 });
  }

  const eventType = event.type;
  const resendEmailId = typeof event.data?.email_id === "string"
    ? event.data.email_id
    : null;
  const supabase = createAdminClient();
  const receivedAt = new Date().toISOString();
  const providerEventAt = eventTimestamp(event.created_at);

  let lateLetterId: string | null = null;

  if (resendEmailId) {
    const { data: matchedLetter, error: matchError } = await supabase
      .from("late_letters")
      .select("id, status")
      .eq("delivery_provider", "resend")
      .eq("delivery_provider_message_id", resendEmailId)
      .maybeSingle();

    if (matchError) {
      console.error("resend-webhook match failed", {
        resend_email_id: resendEmailId,
        code: matchError.code,
      });
      return jsonResponse({ error: "match_failed" }, { status: 500 });
    }

    lateLetterId = matchedLetter?.id || null;
  }

  const { error: insertError } = await supabase
    .from("resend_webhook_events")
    .insert({
      svix_id: svixId,
      event_type: eventType,
      resend_email_id: resendEmailId,
      late_letter_id: lateLetterId,
      received_at: receivedAt,
      payload: event,
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return jsonResponse({ received: true, duplicate: true });
    }

    console.error("resend-webhook event insert failed", {
      svix_id: svixId,
      code: insertError.code,
    });
    return jsonResponse({ error: "event_insert_failed" }, { status: 500 });
  }

  if (!lateLetterId) {
    return jsonResponse({ received: true, ignored: true });
  }

  const update = buildLetterUpdate(eventType, providerEventAt);

  if (update) {
    let updateQuery = supabase
      .from("late_letters")
      .update(update)
      .eq("id", lateLetterId);

    if (eventType === "email.sent") {
      updateQuery = updateQuery.in("status", ["sending", "sent"]);
    }

    const { error: updateError } = await updateQuery;

    if (updateError) {
      console.error("resend-webhook letter update failed", {
        late_letter_id: lateLetterId,
        event_type: eventType,
        code: updateError.code,
      });
      return jsonResponse({ error: "letter_update_failed" }, { status: 500 });
    }
  }

  if (eventType === "email.complained") {
    await supabase.from("safety_events").insert({
      target_type: "late_letter",
      target_id: lateLetterId,
      event_type: "recipient_complaint",
      severity: "medium",
      notes: "Resend complaint webhook received.",
    });
  }

  return jsonResponse({ received: true });
});

function buildLetterUpdate(eventType: string, timestamp: string) {
  switch (eventType) {
    case "email.sent":
      return {
        status: "sent",
        sent_at: timestamp,
        provider_event_last_seen_at: timestamp,
      };
    case "email.delivered":
      return {
        delivered_at: timestamp,
        provider_event_last_seen_at: timestamp,
      };
    case "email.failed":
      return {
        status: "failed",
        failed_at: timestamp,
        failure_reason: "Delivery provider reported a send failure.",
        provider_event_last_seen_at: timestamp,
      };
    case "email.bounced":
      return {
        status: "failed",
        failed_at: timestamp,
        bounced_at: timestamp,
        failure_reason: "Recipient email bounced.",
        provider_event_last_seen_at: timestamp,
      };
    case "email.complained":
    case "email.opened":
    case "email.clicked":
    case "email.delivery_delayed":
    case "email.suppressed":
      return {
        provider_event_last_seen_at: timestamp,
      };
    default:
      return null;
  }
}
