import { Resend } from "npm:resend@6.12.3";
import {
  createAdminClient,
  createOpenToken,
  escapeHtml,
  handleOptions,
  hashRecipientEmail,
  isValidLookingEmail,
  jsonResponse,
  normalizeEmail,
  requestSecretMatches,
  requireEnv,
  safeAppUrl,
  safeResendFailureReason,
  sha256Hex,
} from "../_shared/late-letter-shared.ts";

interface LateLetterDeliveryRow {
  id: string;
  recipient_name: string | null;
  recipient_email: string;
  subject: string | null;
  scheduled_for: string;
}

const DEFAULT_BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 25;

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
  }

  let cronSecret = "";
  let resendApiKey = "";
  let fromEmail = "";

  try {
    cronSecret = requireEnv("LETTER_DELIVERY_CRON_SECRET");
    resendApiKey = requireEnv("RESEND_API_KEY");
    fromEmail = requireEnv("RESEND_FROM_EMAIL");
    requireEnv("APP_PUBLIC_URL");
  } catch {
    return jsonResponse({ error: "server_delivery_env_missing" }, {
      status: 500,
    });
  }

  if (!(await requestSecretMatches(req, cronSecret))) {
    return jsonResponse({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const resend = new Resend(resendApiKey);
  const batchSize = readBatchSize();
  const now = new Date().toISOString();
  const summary = {
    checked: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  const { data: dueLetters, error: dueError } = await supabase
    .from("late_letters")
    .select("id, recipient_name, recipient_email, subject, scheduled_for")
    .eq("status", "scheduled")
    .lte("scheduled_for", now)
    .is("deleted_at", null)
    .is("cancelled_at", null)
    .order("scheduled_for", { ascending: true })
    .limit(batchSize);

  if (dueError) {
    console.error("send-due-late-letters due query failed", {
      code: dueError.code,
    });
    return jsonResponse({ error: "due_query_failed" }, { status: 500 });
  }

  const letters = (dueLetters || []) as LateLetterDeliveryRow[];
  summary.checked = letters.length;

  for (const letter of letters) {
    const recipientEmail = normalizeEmail(letter.recipient_email);

    if (!recipientEmail || !isValidLookingEmail(recipientEmail)) {
      await markFailed(
        supabase,
        letter.id,
        "Recipient email could not be used.",
        now,
      );
      summary.failed += 1;
      continue;
    }

    const recipientEmailHash = await hashRecipientEmail(recipientEmail);
    const { data: optOutRow, error: optOutError } = await supabase
      .from("recipient_opt_outs")
      .select("id")
      .eq("recipient_email_hash", recipientEmailHash)
      .maybeSingle();

    if (optOutError) {
      console.error("send-due-late-letters opt-out lookup failed", {
        letter_id: letter.id,
        code: optOutError.code,
      });
      await markFailed(
        supabase,
        letter.id,
        "Delivery safety check failed.",
        now,
      );
      summary.failed += 1;
      continue;
    }

    if (optOutRow) {
      await markFailed(supabase, letter.id, "Recipient opted out.", now);
      summary.failed += 1;
      continue;
    }

    const token = createOpenToken();
    const tokenHash = await sha256Hex(token);
    const deliveryAttemptedAt = new Date().toISOString();

    const { data: lockedLetter, error: lockError } = await supabase
      .from("late_letters")
      .update({
        status: "sending",
        delivery_provider: "resend",
        delivery_attempted_at: deliveryAttemptedAt,
        secure_open_token_hash: tokenHash,
        failure_reason: null,
      })
      .eq("id", letter.id)
      .eq("status", "scheduled")
      .is("deleted_at", null)
      .is("cancelled_at", null)
      .select("id, scheduled_for")
      .maybeSingle();

    if (lockError) {
      console.error("send-due-late-letters lock failed", {
        letter_id: letter.id,
        code: lockError.code,
      });
      summary.failed += 1;
      continue;
    }

    if (!lockedLetter) {
      summary.skipped += 1;
      continue;
    }

    const subject = letter.subject?.trim() || "A Late Letter arrived for you";
    const openUrl = safeAppUrl(`/letter/${token}`);
    const { text, html } = buildEmail({
      subject,
      recipientName: letter.recipient_name,
      openUrl,
    });

    try {
      const { data, error } = await resend.emails.send(
        {
          from: fromEmail,
          to: [recipientEmail],
          subject,
          text,
          html,
        },
        {
          idempotencyKey: `late-letter/${letter.id}/${letter.scheduled_for}`,
        },
      );

      if (error || !data?.id) {
        await markFailed(
          supabase,
          letter.id,
          safeResendFailureReason(error),
          new Date().toISOString(),
        );
        summary.failed += 1;
        continue;
      }

      const sentAt = new Date().toISOString();
      const { data: sentUpdate, error: sentUpdateError } = await supabase
        .from("late_letters")
        .update({
          status: "sent",
          sent_at: sentAt,
          failed_at: null,
          failure_reason: null,
          delivery_provider: "resend",
          delivery_provider_message_id: data.id,
        })
        .eq("id", letter.id)
        .eq("status", "sending")
        .select("id")
        .maybeSingle();

      if (sentUpdateError || !sentUpdate) {
        console.error("send-due-late-letters sent update failed", {
          letter_id: letter.id,
          provider_email_id: data.id,
          code: sentUpdateError?.code || "no_row_updated",
        });
        summary.failed += 1;
        continue;
      }

      console.info("send-due-late-letters sent", {
        letter_id: letter.id,
        provider_email_id: data.id,
      });
      summary.sent += 1;
    } catch (error) {
      await markFailed(
        supabase,
        letter.id,
        safeResendFailureReason(error),
        new Date().toISOString(),
      );
      summary.failed += 1;
    }
  }

  console.info("send-due-late-letters summary", summary);
  return jsonResponse(summary);
});

function readBatchSize() {
  const configured = Number(Deno.env.get("LETTER_DELIVERY_BATCH_SIZE"));

  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_BATCH_SIZE;
  }

  return Math.min(Math.floor(configured), MAX_BATCH_SIZE);
}

async function markFailed(
  supabase: ReturnType<typeof createAdminClient>,
  letterId: string,
  reason: string,
  timestamp: string,
) {
  const { error } = await supabase
    .from("late_letters")
    .update({
      status: "failed",
      failed_at: timestamp,
      delivery_attempted_at: timestamp,
      failure_reason: reason,
      delivery_provider: "resend",
    })
    .eq("id", letterId)
    .in("status", ["scheduled", "sending"]);

  if (error) {
    console.error("send-due-late-letters failed update failed", {
      letter_id: letterId,
      code: error.code,
    });
  }
}

function buildEmail({
  subject,
  recipientName,
  openUrl,
}: {
  subject: string;
  recipientName: string | null;
  openUrl: string;
}) {
  const greeting = recipientName?.trim()
    ? `Hi ${recipientName.trim()},`
    : "A Late Letter arrived for you.";
  const text = [
    greeting,
    "",
    "Someone wrote you a Late Letter. Open it when you are ready.",
    "",
    openUrl,
    "",
    "If this message feels unsafe or unwanted, you can ignore it. Recipient safety tools are being built.",
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:32px;background:#fff8f2;color:#4b3832;font-family:Georgia,serif;">
    <main style="max-width:560px;margin:0 auto;background:#fffdf9;border:1px solid #f0d7d0;border-radius:18px;padding:28px;">
      <p style="margin:0 0 16px;color:#c86e7c;font-size:18px;">A Late Letter arrived for you.</p>
      <h1 style="margin:0 0 18px;font-size:28px;font-weight:400;color:#4b3832;">${
    escapeHtml(subject)
  }</h1>
      <p style="margin:0 0 18px;line-height:1.6;">Someone wrote you a Late Letter. Open it when you are ready.</p>
      <p style="margin:0 0 24px;">
        <a href="${
    escapeHtml(openUrl)
  }" style="display:inline-block;background:#c86e7c;color:#ffffff;text-decoration:none;border-radius:999px;padding:12px 18px;font-family:Arial,sans-serif;font-size:14px;">Open the letter</a>
      </p>
      <p style="margin:0;color:#8d7169;font-size:13px;line-height:1.5;">If this message feels unsafe or unwanted, you can ignore it. Recipient safety tools are being built.</p>
    </main>
  </body>
</html>`;

  return { text, html };
}
