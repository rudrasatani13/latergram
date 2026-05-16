type AnalyticsProvider = "plausible";
type AnalyticsEnvironment = "development" | "production";
type AnalyticsSection = "write" | "private" | "later" | "time" | "memory" | "garden";
type AnalyticsSourceType = "lategram" | "time_since";
type AnalyticsStorageScope = "local" | "account";
type AnalyticsFormat = "square" | "story" | "wallpaper";
type AnalyticsResult = "success" | "failure" | "unavailable";
type AnalyticsReason = "invalid" | "not_ready" | "not_available" | "server_error" | "offline" | "missing_config" | "unsupported";

export type AnalyticsEventName =
  | "auth_viewed"
  | "auth_sign_in_attempted"
  | "auth_sign_up_attempted"
  | "write_started"
  | "write_copied"
  | "local_draft_restored"
  | "private_save_attempted"
  | "private_save_completed"
  | "local_to_account_import_attempted"
  | "local_to_account_import_completed"
  | "time_counter_create_attempted"
  | "time_counter_create_completed"
  | "late_letter_schedule_attempted"
  | "late_letter_schedule_completed"
  | "late_letter_cancel_attempted"
  | "late_letter_cancel_completed"
  | "recipient_letter_open_attempted"
  | "recipient_letter_open_available"
  | "recipient_letter_open_unavailable"
  | "recipient_report_attempted"
  | "recipient_report_completed"
  | "recipient_opt_out_attempted"
  | "recipient_opt_out_completed"
  | "memory_card_export_attempted"
  | "memory_card_export_completed"
  | "garden_closed_viewed"
  | "beta_page_viewed"
  | "support_page_viewed";

export type AnalyticsErrorCategory =
  | "auth_error"
  | "account_save_error"
  | "local_storage_error"
  | "late_letter_schedule_error"
  | "recipient_letter_error"
  | "memory_card_export_error"
  | "app_render_error"
  | "analytics_error";

export type AnalyticsProps = Partial<{
  section: AnalyticsSection;
  source_type: AnalyticsSourceType;
  storage_scope: AnalyticsStorageScope;
  format: AnalyticsFormat;
  result: AnalyticsResult;
  reason: AnalyticsReason;
  signed_in: boolean;
  environment: AnalyticsEnvironment;
}>;

type AnalyticsPropKey = keyof AnalyticsProps;
type PagePath = "/" | "/auth" | "/app" | "/privacy" | "/terms" | "/support" | "/beta" | "/letter/:token" | "/404";
type PlausibleOptions = { props?: Record<string, string | boolean>; u?: string };
type PlausibleCall = ((eventName: string, options?: PlausibleOptions) => void) & { q?: unknown[][] };

export type SanitizedPageView = {
  path: PagePath;
  props: AnalyticsProps;
};

export type AnalyticsStatus = {
  enabled: boolean;
  configured: boolean;
  provider: AnalyticsProvider | "none" | "unsupported";
  reason: "disabled" | "missing_config" | "unsupported_provider" | "ready";
};

declare global {
  interface Window {
    plausible?: PlausibleCall;
    __latergramAnalyticsScriptSrc?: string;
  }
}

const EVENT_ALLOWLIST = new Set<AnalyticsEventName>([
  "auth_viewed",
  "auth_sign_in_attempted",
  "auth_sign_up_attempted",
  "write_started",
  "write_copied",
  "local_draft_restored",
  "private_save_attempted",
  "private_save_completed",
  "local_to_account_import_attempted",
  "local_to_account_import_completed",
  "time_counter_create_attempted",
  "time_counter_create_completed",
  "late_letter_schedule_attempted",
  "late_letter_schedule_completed",
  "late_letter_cancel_attempted",
  "late_letter_cancel_completed",
  "recipient_letter_open_attempted",
  "recipient_letter_open_available",
  "recipient_letter_open_unavailable",
  "recipient_report_attempted",
  "recipient_report_completed",
  "recipient_opt_out_attempted",
  "recipient_opt_out_completed",
  "memory_card_export_attempted",
  "memory_card_export_completed",
  "garden_closed_viewed",
  "beta_page_viewed",
  "support_page_viewed",
]);

const ERROR_CATEGORY_ALLOWLIST = new Set<AnalyticsErrorCategory>([
  "auth_error",
  "account_save_error",
  "local_storage_error",
  "late_letter_schedule_error",
  "recipient_letter_error",
  "memory_card_export_error",
  "app_render_error",
  "analytics_error",
]);

const PROP_ALLOWLIST: Record<AnalyticsPropKey, readonly (string | boolean)[]> = {
  section: ["write", "private", "later", "time", "memory", "garden"],
  source_type: ["lategram", "time_since"],
  storage_scope: ["local", "account"],
  format: ["square", "story", "wallpaper"],
  result: ["success", "failure", "unavailable"],
  reason: ["invalid", "not_ready", "not_available", "server_error", "offline", "missing_config", "unsupported"],
  signed_in: [true, false],
  environment: ["development", "production"],
};

const SENSITIVE_VALUE_PATTERNS = [
  /@/,
  /\blatergram:v1\b/i,
  /\b[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\b/i,
  /^eyJ[A-Za-z0-9_-]+/,
  /^[A-Za-z0-9_-]{32,}$/,
];

const rawProvider = readEnv("VITE_ANALYTICS_PROVIDER").trim().toLowerCase();
const analyticsEnabled = readEnv("VITE_ANALYTICS_ENABLED").trim().toLowerCase() === "true";
const plausibleDomain = readEnv("VITE_PLAUSIBLE_DOMAIN").trim();
const plausibleScriptSrc = readEnv("VITE_PLAUSIBLE_SCRIPT_SRC").trim();

export function isAnalyticsEnabled() {
  return getAnalyticsStatus().enabled;
}

export function getAnalyticsStatus(): AnalyticsStatus {
  if (!analyticsEnabled) {
    return { enabled: false, configured: false, provider: "none", reason: "disabled" };
  }

  if (rawProvider !== "plausible") {
    return { enabled: false, configured: false, provider: rawProvider ? "unsupported" : "none", reason: "unsupported_provider" };
  }

  if (!plausibleDomain || !isSafePublicUrl(plausibleScriptSrc)) {
    return { enabled: false, configured: false, provider: "plausible", reason: "missing_config" };
  }

  return { enabled: true, configured: true, provider: "plausible", reason: "ready" };
}

export function trackPageView(path: string): SanitizedPageView {
  const pageView = sanitizePageView(path);
  const status = getAnalyticsStatus();

  if (!status.enabled) {
    return pageView;
  }

  safelyDispatch("pageview", pageView.props, pageView.path);
  return pageView;
}

export function trackEvent(name: AnalyticsEventName, props: AnalyticsProps = {}) {
  if (!EVENT_ALLOWLIST.has(name)) {
    return;
  }

  if (!isAnalyticsEnabled()) {
    return;
  }

  safelyDispatch(name, props);
}

export function trackError(category: AnalyticsErrorCategory, props: AnalyticsProps = {}) {
  if (!ERROR_CATEGORY_ALLOWLIST.has(category)) {
    return;
  }

  if (!isAnalyticsEnabled()) {
    return;
  }

  safelyDispatch(category, { ...props, result: "failure" });
}

export function sanitizePageView(rawPath: string): SanitizedPageView {
  const url = parsePath(rawPath);
  const pathname = normalizePathname(url.pathname);
  const section = sanitizeSection(url.searchParams.get("section"));

  if (pathname === "/") {
    return { path: "/", props: {} };
  }

  if (pathname === "/auth") {
    return { path: "/auth", props: {} };
  }

  if (pathname === "/app") {
    return { path: "/app", props: section ? { section } : {} };
  }

  if (pathname === "/privacy") {
    return { path: "/privacy", props: {} };
  }

  if (pathname === "/terms") {
    return { path: "/terms", props: {} };
  }

  if (pathname === "/support") {
    return { path: "/support", props: {} };
  }

  if (pathname === "/beta") {
    return { path: "/beta", props: {} };
  }

  if (pathname.startsWith("/letter/")) {
    return { path: "/letter/:token", props: {} };
  }

  return { path: "/404", props: {} };
}

function safelyDispatch(eventName: AnalyticsEventName | AnalyticsErrorCategory | "pageview", props: AnalyticsProps, pagePath?: PagePath) {
  try {
    const safeProps = sanitizeProps({ ...props, environment: getEnvironment() });
    loadPlausibleScript();
    const plausible = getPlausible();
    const options: PlausibleOptions = { props: safeProps };

    if (pagePath) {
      options.u = `${getOrigin()}${pagePath}`;
    }

    plausible(eventName, options);
  } catch {
    if (eventName !== "analytics_error") {
      trackError("analytics_error");
    }
  }
}

function sanitizeProps(props: AnalyticsProps): Record<string, string | boolean> {
  const safeProps: Record<string, string | boolean> = {};

  for (const [rawKey, rawValue] of Object.entries(props)) {
    const key = rawKey as AnalyticsPropKey;

    if (!(key in PROP_ALLOWLIST) || rawValue === undefined) {
      continue;
    }

    const allowedValues = PROP_ALLOWLIST[key];

    if (!allowedValues.includes(rawValue)) {
      continue;
    }

    if (typeof rawValue === "string" && SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(rawValue))) {
      continue;
    }

    safeProps[key] = rawValue;
  }

  return safeProps;
}

function loadPlausibleScript() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  if (window.__latergramAnalyticsScriptSrc === plausibleScriptSrc) {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = plausibleScriptSrc;
  script.dataset.domain = plausibleDomain;
  script.dataset.latergramAnalytics = "plausible";

  document.head.appendChild(script);
  window.__latergramAnalyticsScriptSrc = plausibleScriptSrc;
}

function getPlausible(): PlausibleCall {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  if (window.plausible) {
    return window.plausible;
  }

  const queued: PlausibleCall = (...args) => {
    queued.q = queued.q || [];
    queued.q.push(args);
  };

  window.plausible = queued;
  return queued;
}

function readEnv(key: string) {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  return env?.[key] ?? "";
}

function getEnvironment(): AnalyticsEnvironment {
  return import.meta.env.PROD ? "production" : "development";
}

function getOrigin() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
}

function parsePath(rawPath: string) {
  const base = typeof window === "undefined" ? "https://latergram.local" : window.location.origin;

  try {
    return new URL(rawPath, base);
  } catch {
    return new URL("/404", base);
  }
}

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname || "/";
}

function sanitizeSection(value: string | null): AnalyticsSection | null {
  if (value === "write" || value === "private" || value === "later" || value === "time" || value === "memory" || value === "garden") {
    return value;
  }

  return null;
}

function isSafePublicUrl(value: string) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
