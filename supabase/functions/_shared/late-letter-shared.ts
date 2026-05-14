import { createClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-latergram-cron-secret, svix-id, svix-timestamp, svix-signature",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export type JsonRecord = Record<string, unknown>;

export function jsonResponse(body: JsonRecord, init: ResponseInit = {}) {
  return Response.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
}

export function handleOptions(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  return null;
}

export function requireEnv(name: string) {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

export function createAdminClient() {
  return createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidLookingEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export async function hashRecipientEmail(email: string) {
  return sha256Hex(normalizeEmail(email));
}

export function createOpenToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(
    /=+$/g,
    "",
  );
}

export async function requestSecretMatches(
  req: Request,
  expectedSecret: string,
) {
  const authHeader = req.headers.get("authorization") || "";
  const bearerSecret = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const providedSecret = req.headers.get("x-latergram-cron-secret")?.trim() ||
    bearerSecret ||
    req.headers.get("apikey")?.trim() ||
    "";

  if (!providedSecret) {
    return false;
  }

  const [providedHash, expectedHash] = await Promise.all([
    sha256Hex(providedSecret),
    sha256Hex(expectedSecret),
  ]);

  return providedHash === expectedHash;
}

export function safeAppUrl(path: string) {
  return `${requireEnv("APP_PUBLIC_URL").replace(/\/+$/g, "")}${path}`;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function safeResendFailureReason(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Delivery provider could not send this letter.";
  }

  const providerError = error as { name?: string; statusCode?: number };

  switch (providerError.name) {
    case "invalid_from_address":
    case "invalid_access":
      return "Delivery provider rejected the sender address.";
    case "invalid_parameter":
    case "missing_required_field":
    case "validation_error":
      return "Delivery provider rejected the email request.";
    case "daily_quota_exceeded":
    case "monthly_quota_exceeded":
    case "rate_limit_exceeded":
      return "Delivery provider rate limit or quota stopped this send.";
    default:
      return providerError.statusCode && providerError.statusCode >= 500
        ? "Delivery provider had a temporary failure."
        : "Delivery provider could not send this letter.";
  }
}

export function eventTimestamp(value: unknown) {
  if (typeof value !== "string") {
    return new Date().toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}
