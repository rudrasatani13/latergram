import {
  createAdminClient,
  handleOptions,
  hashRecipientEmail,
  isValidLookingEmail,
  jsonResponse,
  normalizeEmail,
} from "../_shared/late-letter-shared.ts";

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
  }

  let payload: { email?: unknown };

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_request" }, { status: 400 });
  }

  const email = typeof payload.email === "string"
    ? normalizeEmail(payload.email)
    : "";

  if (!email || !isValidLookingEmail(email)) {
    return jsonResponse({ error: "invalid_email" }, { status: 400 });
  }

  const recipientEmailHash = await hashRecipientEmail(email);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("recipient_opt_outs")
    .upsert(
      {
        recipient_email_hash: recipientEmailHash,
        reason: "recipient_request",
      },
      { onConflict: "recipient_email_hash", ignoreDuplicates: true },
    );

  if (error) {
    console.error("recipient-opt-out insert failed", { code: error.code });
    return jsonResponse({ error: "opt_out_failed" }, { status: 500 });
  }

  return jsonResponse({
    status: "ok",
    message: "Future Late Letters to this email will be blocked.",
  });
});
