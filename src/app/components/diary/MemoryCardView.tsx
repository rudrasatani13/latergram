import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { DiaryFrame } from "./DiaryFrame";
import { blooms, decor } from "../BrandAssets";
import { EmptyState } from "../shared/EmptyState";
import { readLocalCounters, readLocalLategrams } from "../../storage/localStorage";
import type { LocalCounter, LocalLategram } from "../../storage/types";
import { useAuth } from "../../auth/useAuth";
import { useAccountCounters } from "../../db/useAccountCounters";
import { useAccountLategrams } from "../../db/useAccountLategrams";
import type { DbPrivateLategram, DbTimeSinceCounter } from "../../db/types";
import {
  MEMORY_CARD_FORMATS,
  MEMORY_CARD_THEMES,
  getMemoryCardFilename,
  renderMemoryCardPng,
  supportsMemoryCardExport,
  type MemoryCardFormat,
  type MemoryCardRenderPayload,
  type MemoryCardSourceKind,
  type MemoryCardThemeKey,
} from "../../utils/memoryCardCanvas";
import { trackError, trackEvent, type AnalyticsProps } from "../../analytics/analytics";

type SourceType = MemoryCardSourceKind;
type SourceScope = "account" | "device";
type PreviewState = "missing" | "preparing" | "ready";
type ExportState = "idle" | "missing" | "exporting" | "success" | "error" | "unsupported";

type MemorySource = {
  key: string;
  id: string;
  sourceType: SourceType;
  scope: SourceScope;
  title: string;
  subtitle: string;
  previewText: string;
  body: string;
  dateLabel: string;
  updatedAt: string;
  statValue?: string;
  statLabel?: string;
};

const SOURCE_OPTIONS: Array<{ id: SourceType; label: string; note: string }> = [
  { id: "lategram", label: "Lategram", note: "saved writing only" },
  { id: "counter", label: "Time Since", note: "saved counters only" },
];

function memoryCardAnalyticsProps(input: {
  sourceType?: SourceType | null;
  sourceScope?: SourceScope;
  format?: MemoryCardFormat | null;
  signedIn: boolean;
}): AnalyticsProps {
  const props: AnalyticsProps = { signed_in: input.signedIn };

  if (input.sourceType === "lategram") {
    props.source_type = "lategram";
  }

  if (input.sourceType === "counter") {
    props.source_type = "time_since";
  }

  if (input.sourceScope) {
    props.storage_scope = input.sourceScope === "account" ? "account" : "local";
  }

  if (input.format) {
    props.format = input.format;
  }

  return props;
}

const TEXT_LIMITS: Record<MemoryCardFormat, Record<SourceType, number>> = {
  square: { lategram: 260, counter: 140 },
  story: { lategram: 560, counter: 240 },
  wallpaper: { lategram: 680, counter: 300 },
};

const SOURCE_PAGE_SIZE = 12;

const PREVIEW_FORMAT_STYLES: Record<MemoryCardFormat, { width: number; height: number }> = {
  square: { width: 280, height: 280 },
  story: { width: 200, height: 320 },
  wallpaper: { width: 156, height: 338 },
};

const PREVIEW_THEME_STYLES: Record<MemoryCardThemeKey, { bloom: string; background: string }> = {
  rose: {
    bloom: blooms.softPeony,
    background: "linear-gradient(160deg,#FBE3DF,#FFF3DE)",
  },
  linen: {
    bloom: blooms.coralCarnation,
    background: "linear-gradient(160deg,#FFE2E5,#FFF8ED)",
  },
  dawn: {
    bloom: blooms.blueAnemone,
    background: "linear-gradient(160deg,#E5E0F4,#FFF8ED)",
  },
};

const PREVIEW_BODY_CLAMPS: Record<MemoryCardFormat, Record<SourceType, number>> = {
  square: { lategram: 6, counter: 3 },
  story: { lategram: 9, counter: 4 },
  wallpaper: { lategram: 4, counter: 2 },
};

const PREVIEW_CARD_TRANSITION = { duration: 0.35, ease: "easeOut" } as const;

function timestampValue(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function sortByUpdatedAt<T extends { updatedAt: string }>(items: T[]) {
  return [...items].sort((a, b) => timestampValue(b.updatedAt) - timestampValue(a.updatedAt));
}

function normalizeCardText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncateForCard(value: string, maxLength: number) {
  const normalized = normalizeCardText(value);

  if (normalized.length <= maxLength) {
    return { text: normalized, shortened: false };
  }

  return {
    text: `${normalized.slice(0, maxLength).trimEnd()}...`,
    shortened: true,
  };
}

function excerpt(value: string, maxLength = 120) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "No text preview available.";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

function formatLongDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "saved date unavailable";
  }

  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatShortDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "saved date";
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function daysBetween(iso: string) {
  const start = new Date(iso);

  if (Number.isNaN(start.getTime())) {
    return 0;
  }

  const now = new Date();
  const ms = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function looksLikeSensitiveLabel(value: string) {
  const trimmed = value.trim();
  const hasEmail = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(trimmed);
  const hasUuid = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i.test(trimmed);
  const hasLongToken = /\b[A-Za-z0-9_-]{28,}\b/.test(trimmed);

  return hasEmail || hasUuid || hasLongToken;
}

function safeOptionalLabel(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed || looksLikeSensitiveLabel(trimmed)) {
    return null;
  }

  return trimmed;
}

function lategramTitle(subject: string | null | undefined) {
  return safeOptionalLabel(subject) ?? "Saved Lategram";
}

function toLocalLategramSource(lategram: LocalLategram): MemorySource {
  const title = lategramTitle(lategram.subject);

  return {
    key: `device:lategram:${lategram.id}`,
    id: lategram.id,
    sourceType: "lategram",
    scope: "device",
    title,
    subtitle: `This device · saved ${formatShortDate(lategram.updatedAt)}`,
    previewText: excerpt(lategram.body),
    body: lategram.body,
    dateLabel: `saved ${formatLongDate(lategram.createdAt)}`,
    updatedAt: lategram.updatedAt,
  };
}

function toAccountLategramSource(lategram: DbPrivateLategram): MemorySource {
  const title = lategramTitle(lategram.subject);

  return {
    key: `account:lategram:${lategram.id}`,
    id: lategram.id,
    sourceType: "lategram",
    scope: "account",
    title,
    subtitle: `Account archive · saved ${formatShortDate(lategram.updated_at)}`,
    previewText: excerpt(lategram.body),
    body: lategram.body,
    dateLabel: `saved ${formatLongDate(lategram.created_at)}`,
    updatedAt: lategram.updated_at,
  };
}

function toLocalCounterSource(counter: LocalCounter): MemorySource {
  const days = daysBetween(counter.start);

  return {
    key: `device:counter:${counter.id}`,
    id: counter.id,
    sourceType: "counter",
    scope: "device",
    title: counter.title,
    subtitle: `This device · since ${formatShortDate(counter.start)}`,
    previewText: `${days} days${counter.context ? ` · ${excerpt(counter.context, 90)}` : ""}`,
    body: counter.context ?? "",
    dateLabel: `since ${formatLongDate(counter.start)}`,
    updatedAt: counter.updatedAt,
    statValue: String(days),
    statLabel: "days",
  };
}

function toAccountCounterSource(counter: DbTimeSinceCounter): MemorySource {
  const days = daysBetween(counter.start_date);

  return {
    key: `account:counter:${counter.id}`,
    id: counter.id,
    sourceType: "counter",
    scope: "account",
    title: counter.title,
    subtitle: `Account archive · since ${formatShortDate(counter.start_date)}`,
    previewText: `${days} days${counter.context ? ` · ${excerpt(counter.context, 90)}` : ""}`,
    body: counter.context ?? "",
    dateLabel: `since ${formatLongDate(counter.start_date)}`,
    updatedAt: counter.updated_at,
    statValue: String(days),
    statLabel: "days",
  };
}

function buildPayload(source: MemorySource, format: MemoryCardFormat, theme: MemoryCardThemeKey): MemoryCardRenderPayload {
  const limit = TEXT_LIMITS[format][source.sourceType];
  const { text, shortened } = truncateForCard(source.body, limit);

  return {
    sourceKind: source.sourceType,
    title: source.title,
    body: text,
    eyebrow: source.sourceType === "lategram" ? `${source.scope} saved Lategram` : `${source.scope} saved counter`,
    dateLabel: source.dateLabel,
    format,
    theme,
    shortened,
    statValue: source.statValue,
    statLabel: source.statLabel,
  };
}

function refreshDeviceSnapshot() {
  return {
    lategrams: sortByUpdatedAt(readLocalLategrams().map(toLocalLategramSource)),
    counters: sortByUpdatedAt(readLocalCounters().map(toLocalCounterSource)),
  };
}

export function MemoryCardView() {
  const { session } = useAuth();
  const {
    data: accountLategrams,
    loading: accountLategramsLoading,
    error: accountLategramsError,
    refresh: refreshAccountLategrams,
  } = useAccountLategrams();
  const {
    data: accountCounters,
    loading: accountCountersLoading,
    error: accountCountersError,
    refresh: refreshAccountCounters,
  } = useAccountCounters();

  const initialSnapshot = useMemo(() => refreshDeviceSnapshot(), []);
  const [deviceLategrams, setDeviceLategrams] = useState<MemorySource[]>(initialSnapshot.lategrams);
  const [deviceCounters, setDeviceCounters] = useState<MemorySource[]>(initialSnapshot.counters);
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [sourceScope, setSourceScope] = useState<SourceScope>(session?.user ? "account" : "device");
  const [selectedSourceKey, setSelectedSourceKey] = useState<string | null>(null);
  const [format, setFormat] = useState<MemoryCardFormat | null>(null);
  const [theme, setTheme] = useState<MemoryCardThemeKey | null>(null);
  const [visibleSourceCount, setVisibleSourceCount] = useState(SOURCE_PAGE_SIZE);
  const [previewState, setPreviewState] = useState<PreviewState>("missing");
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [status, setStatus] = useState("");
  const [exportSupported, setExportSupported] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setSourceScope(session?.user ? "account" : "device");
    setSelectedSourceKey(null);
  }, [session?.user]);

  useEffect(() => {
    setExportSupported(supportsMemoryCardExport());
  }, []);

  const accountLategramSources = useMemo(
    () => sortByUpdatedAt(accountLategrams.map(toAccountLategramSource)),
    [accountLategrams]
  );
  const accountCounterSources = useMemo(
    () => sortByUpdatedAt(accountCounters.map(toAccountCounterSource)),
    [accountCounters]
  );

  const activeSources = useMemo(() => {
    if (!sourceType) {
      return [];
    }

    if (sourceType === "lategram") {
      return sourceScope === "account" ? accountLategramSources : deviceLategrams;
    }

    return sourceScope === "account" ? accountCounterSources : deviceCounters;
  }, [accountCounterSources, accountLategramSources, deviceCounters, deviceLategrams, sourceScope, sourceType]);

  const allDeviceCount = deviceLategrams.length + deviceCounters.length;
  const allAccountCount = accountLategramSources.length + accountCounterSources.length;
  const selectedSource = activeSources.find((source) => source.key === selectedSourceKey) ?? null;
  const payload = selectedSource && format && theme ? buildPayload(selectedSource, format, theme) : null;
  const visibleSources = activeSources.slice(0, visibleSourceCount);
  const hiddenSourceCount = Math.max(0, activeSources.length - visibleSources.length);

  const accountLoading =
    sourceScope === "account" &&
    ((sourceType === "lategram" && accountLategramsLoading) || (sourceType === "counter" && accountCountersLoading));
  const accountError =
    sourceScope === "account"
      ? sourceType === "lategram"
        ? accountLategramsError
        : sourceType === "counter"
        ? accountCountersError
        : null
      : null;

  useEffect(() => {
    if (!payload) {
      setPreviewState("missing");
      return;
    }

    setPreviewState("preparing");
    const timer = window.setTimeout(() => setPreviewState("ready"), 120);

    return () => window.clearTimeout(timer);
  }, [payload?.body, payload?.dateLabel, payload?.format, payload?.sourceKind, payload?.theme, payload?.title]);

  const refreshSources = async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    setStatus("Refreshing saved sources...");
    const snapshot = refreshDeviceSnapshot();
    setDeviceLategrams(snapshot.lategrams);
    setDeviceCounters(snapshot.counters);

    if (session?.user) {
      await Promise.all([refreshAccountLategrams(), refreshAccountCounters()]);
    }

    setSelectedSourceKey((current) => {
      if (!current) {
        return null;
      }

      const stillExists = [...snapshot.lategrams, ...snapshot.counters, ...accountLategramSources, ...accountCounterSources].some(
        (source) => source.key === current
      );

      return stillExists ? current : null;
    });
    setStatus("Saved sources refreshed.");
    setRefreshing(false);
  };

  const chooseSourceType = (next: SourceType) => {
    setSourceType(next);
    setSelectedSourceKey(null);
    setVisibleSourceCount(SOURCE_PAGE_SIZE);
    setExportState("idle");
    setStatus("");
  };

  const chooseSourceScope = (next: SourceScope) => {
    setSourceScope(next);
    setSelectedSourceKey(null);
    setVisibleSourceCount(SOURCE_PAGE_SIZE);
    setExportState("idle");
    setStatus("");
  };

  const chooseFormat = (next: MemoryCardFormat) => {
    setFormat(next);
    setExportState("idle");
    setStatus("");
  };

  const chooseTheme = (next: MemoryCardThemeKey) => {
    setTheme(next);
    setExportState("idle");
    setStatus("");
  };

  const disabledReason = useMemo(() => {
    if (!exportSupported) {
      return "Image export is not supported in this browser.";
    }

    if (!sourceType) {
      return "Choose Lategram or Time Since first.";
    }

    if (!selectedSource) {
      return "Choose one saved item.";
    }

    if (!format) {
      return "Choose square, story, or wallpaper.";
    }

    if (!theme) {
      return "Choose a card style.";
    }

    if (previewState === "preparing") {
      return "Preparing preview.";
    }

    return "";
  }, [exportSupported, format, previewState, selectedSource, sourceType, theme]);

  const downloadDisabled = Boolean(disabledReason) || exportState === "exporting";

  const downloadCard = async () => {
    const analyticsProps = memoryCardAnalyticsProps({
      sourceType: payload?.sourceKind ?? sourceType,
      sourceScope: selectedSource?.scope ?? sourceScope,
      format,
      signedIn: Boolean(session?.user),
    });
    trackEvent("memory_card_export_attempted", analyticsProps);

    if (!payload || !format) {
      setExportState("missing");
      setStatus(disabledReason || "Choose a real source item and format first.");
      trackEvent("memory_card_export_completed", { ...analyticsProps, result: "failure", reason: "invalid" });
      return;
    }

    if (!supportsMemoryCardExport()) {
      setExportSupported(false);
      setExportState("unsupported");
      setStatus("This browser cannot create Memory Card images with Canvas.");
      trackError("memory_card_export_error", { ...analyticsProps, reason: "unsupported" });
      trackEvent("memory_card_export_completed", { ...analyticsProps, result: "failure", reason: "unsupported" });
      return;
    }

    setExportState("exporting");
    setStatus("Exporting PNG...");

    try {
      const blob = await renderMemoryCardPng(payload);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getMemoryCardFilename(payload.sourceKind, format);
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setExportState("success");
      setStatus("PNG download created. Nothing was uploaded, shared, or saved to account history.");
      trackEvent("memory_card_export_completed", { ...analyticsProps, result: "success" });
    } catch {
      setExportState("error");
      setStatus("Export failed. Try again, or use another browser if downloads are blocked.");
      trackError("memory_card_export_error", { ...analyticsProps, reason: "server_error" });
      trackEvent("memory_card_export_completed", { ...analyticsProps, result: "failure", reason: "server_error" });
    }
  };

  const renderScopePicker = () => {
    if (!session?.user) {
      return (
        <p className="font-cute text-[var(--lg-cocoa)]/70" style={{ fontSize: "0.98rem" }}>
          Signed out: Memory Cards can use real saves from this browser only.
        </p>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => chooseSourceScope("account")}
          aria-pressed={sourceScope === "account"}
          className={`min-h-11 rounded-full border px-4 py-2 font-cute transition-colors duration-300 ${
            sourceScope === "account"
              ? "border-[var(--lg-rose-soft)] bg-[var(--lg-paper)] text-[var(--lg-rose)]"
              : "border-[var(--lg-border)] text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)]"
          }`}
          style={{ fontSize: "1.02rem" }}
        >
          Account archive
        </button>
        <button
          type="button"
          onClick={() => chooseSourceScope("device")}
          aria-pressed={sourceScope === "device"}
          className={`min-h-11 rounded-full border px-4 py-2 font-cute transition-colors duration-300 ${
            sourceScope === "device"
              ? "border-[var(--lg-rose-soft)] bg-[var(--lg-paper)] text-[var(--lg-rose)]"
              : "border-[var(--lg-border)] text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)]"
          }`}
          style={{ fontSize: "1.02rem" }}
        >
          This device
        </button>
      </div>
    );
  };

  const renderSourceList = () => {
    if (!sourceType) {
      return (
        <EmptyState
          message="Choose what kind of saved memory to use."
          note="Cards are created only from saved Lategrams or saved Time Since counters you select."
        />
      );
    }

    if (accountLoading) {
      return (
        <div className="py-12 text-center">
          <p className="font-cute text-[var(--lg-rose)] animate-pulse" style={{ fontSize: "1.15rem" }}>
            Loading real saved sources...
          </p>
        </div>
      );
    }

    if (accountError) {
      return (
        <div className="py-10 text-center">
          <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.15rem" }}>
            {accountError}
          </p>
          <p className="mt-2 font-cute text-[var(--lg-cocoa)]/70" style={{ fontSize: "0.98rem" }}>
            You can switch to this device or try refreshing.
          </p>
        </div>
      );
    }

    if (activeSources.length === 0) {
      return (
        <EmptyState
          message={sourceType === "lategram" ? "No saved Lategrams here yet." : "No saved counters here yet."}
          note={
            sourceScope === "account"
              ? "Save one to your account first, or switch to this device."
              : sourceType === "lategram"
              ? "Write and save a Lategram on this device first."
              : "Add and save a Time Since counter on this device first."
          }
        />
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleSources.map((source) => {
            const selected = selectedSourceKey === source.key;

            return (
              <button
                key={source.key}
                type="button"
                onClick={() => {
                  setSelectedSourceKey(source.key);
                  setExportState("idle");
                  setStatus("");
                }}
                aria-pressed={selected}
                className={`min-h-[9rem] text-left rounded-[20px] border px-4 py-4 transition-colors duration-300 ${
                  selected
                    ? "border-[var(--lg-rose)] bg-[var(--lg-paper)] text-[var(--lg-ink)]"
                    : "border-[var(--lg-border)] bg-[var(--lg-paper)]/55 text-[var(--lg-cocoa)] hover:border-[var(--lg-rose-soft)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={source.sourceType === "lategram" ? blooms.softPeony : blooms.pinkDaisy}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="h-9 w-9 shrink-0 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="break-words text-[var(--lg-ink)]"
                      style={{ fontFamily: "'Fraunces', serif", fontSize: "1.02rem", fontWeight: 500 }}
                    >
                      {source.title}
                    </p>
                    <p className="mt-1 line-clamp-2 font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem", lineHeight: 1.3 }}>
                      {source.previewText}
                    </p>
                    <p
                      className="mt-2 break-words text-[var(--lg-rose)]"
                      style={{ fontSize: "0.73rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
                    >
                      {source.subtitle}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {hiddenSourceCount > 0 && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setVisibleSourceCount((current) => current + SOURCE_PAGE_SIZE)}
              className="min-h-11 rounded-full border border-[var(--lg-border)] px-5 py-2 font-cute text-[var(--lg-rose)] hover:border-[var(--lg-rose-soft)] transition-colors duration-300"
              style={{ fontSize: "1rem" }}
            >
              Show {Math.min(SOURCE_PAGE_SIZE, hiddenSourceCount)} more
            </button>
          </div>
        )}
      </>
    );
  };

  const renderPreview = () => {
    if (!payload || !selectedSource || !format || !theme) {
      return (
        <div className="rounded-[22px] border border-dashed border-[var(--lg-border)] bg-[var(--lg-paper)]/50 px-4 py-8 text-center">
          <img src={decor.keepsakeBoxHeart} alt="" aria-hidden="true" className="mx-auto mb-3 h-10 w-10 object-contain opacity-75" />
          <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.08rem" }}>
            Preview appears after you choose a real source, format, and style.
          </p>
        </div>
      );
    }

    const formatSpec = MEMORY_CARD_FORMATS[format];
    const previewStyle = PREVIEW_FORMAT_STYLES[format];
    const previewTheme = PREVIEW_THEME_STYLES[theme];
    const bodyClamp = PREVIEW_BODY_CLAMPS[format][payload.sourceKind];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,20rem)] gap-5 items-start">
        <div>
          <div className="mx-auto flex min-h-[360px] w-full items-center justify-center overflow-hidden">
            <motion.div
              animate={{
                width: previewStyle.width,
                height: previewStyle.height,
                background: previewTheme.background,
              }}
              transition={PREVIEW_CARD_TRANSITION}
              className="relative overflow-hidden rounded-[24px]"
              style={{
                maxWidth: "100%",
                boxShadow:
                  "0 30px 60px -30px rgba(120,80,70,0.45), inset 0 0 0 1px rgba(234,213,196,0.6)",
              }}
            >
              <img
                src={previewTheme.bloom}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 object-contain opacity-90"
              />
              <img
                src={decor.pastelStarSparkles}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute bottom-3 left-3 h-7 w-7 object-contain opacity-80"
              />
              <div className="relative flex h-full w-full flex-col p-5">
                <p className="mb-2 font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
                  {payload.sourceKind === "counter" ? "a Time Since keepsake ✿" : "a Lategram keepsake ✿"}
                </p>

                {payload.sourceKind === "counter" ? (
                  <div className="flex min-h-0 flex-1 flex-col justify-center text-[var(--lg-ink)]">
                    <p
                      className="break-words"
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                        fontFamily: "'Fraunces', serif",
                        fontSize: "1.05rem",
                        fontWeight: 400,
                        lineHeight: 1.2,
                        letterSpacing: "0",
                      }}
                    >
                      {payload.title}
                    </p>
                    <p
                      className="mt-2 break-words"
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: format === "story" ? "3rem" : "2.65rem",
                        fontWeight: 500,
                        lineHeight: 0.95,
                        letterSpacing: "0",
                      }}
                    >
                      {payload.statValue}
                    </p>
                    <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.15rem", lineHeight: 1.1 }}>
                      {payload.statLabel} · {payload.dateLabel}
                    </p>
                    {payload.body && (
                      <p
                        className="mt-2 whitespace-pre-wrap break-words font-cute text-[var(--lg-cocoa)]"
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: bodyClamp,
                          overflow: "hidden",
                          fontSize: "1rem",
                          lineHeight: 1.18,
                        }}
                      >
                        {payload.body}
                      </p>
                    )}
                  </div>
                ) : (
                  <p
                    className="min-h-0 flex-1 whitespace-pre-wrap break-words text-[var(--lg-ink)]"
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: bodyClamp,
                      overflow: "hidden",
                      fontFamily: "'Fraunces', serif",
                      fontWeight: 400,
                      fontSize: "1.15rem",
                      lineHeight: 1.3,
                      letterSpacing: "0",
                    }}
                  >
                    {payload.body}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
                    — Latergram
                  </p>
                  {payload.shortened && (
                    <p className="text-right font-cute text-[var(--lg-cocoa)]/70" style={{ fontSize: "0.82rem", lineHeight: 1 }}>
                      shortened
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
          <p className="mt-3 text-center font-cute text-[var(--lg-cocoa)]/70" style={{ fontSize: "0.92rem" }}>
            Preview uses the original animated Memory Card layout; export is {formatSpec.description}.
          </p>
        </div>

        <div className="rounded-[20px] border border-dashed border-[var(--lg-border)] bg-[var(--lg-paper)]/60 px-4 py-4">
          <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
            text on card
          </p>
          <p className="mt-2 text-[var(--lg-ink)] break-words" style={{ fontFamily: "'Fraunces', serif", fontSize: "1rem", lineHeight: 1.25 }}>
            {payload.title}
          </p>
          {payload.sourceKind === "counter" && (
            <p className="mt-2 font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.1rem" }}>
              {payload.statValue} {payload.statLabel} · {payload.dateLabel}
            </p>
          )}
          {payload.body && (
            <p className="mt-3 whitespace-pre-wrap break-words font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.05rem", lineHeight: 1.32 }}>
              {payload.body}
            </p>
          )}
          {payload.shortened && (
            <p className="mt-3 font-cute text-[var(--lg-cocoa)]/70" style={{ fontSize: "0.92rem" }}>
              Long text was shortened so it stays readable in this format.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <DiaryFrame
      caption="dear keepsake card ❀"
      title={<span className="font-serif-italic text-[var(--lg-rose)]">memory cards</span>}
    >
      <div className="px-4 sm:px-7 py-6 min-h-[320px]">
        <div className="relative overflow-hidden rounded-[24px] border border-dashed border-[var(--lg-rose-soft)] bg-[var(--lg-paper)]/70 px-4 sm:px-5 py-5">
          <img
            src={blooms.softPeony}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 object-contain opacity-35"
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-[36rem]">
              <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.15rem" }}>
                export-only keepsakes from saved things
              </p>
              <p className="mt-2 font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem", lineHeight: 1.55 }}>
                Choose one real saved Lategram or Time Since counter, preview the exact card text, then download a PNG. Nothing is uploaded,
                shared, imported, or saved to card history.
              </p>
            </div>
            <button
              type="button"
              onClick={refreshSources}
              disabled={refreshing}
              className="min-h-11 w-fit shrink-0 rounded-full border border-[var(--lg-border)] px-4 py-2 font-cute text-[var(--lg-rose)] hover:border-[var(--lg-rose-soft)] disabled:cursor-not-allowed disabled:opacity-60 transition-colors duration-300"
              style={{ fontSize: "1rem" }}
            >
              {refreshing ? "Refreshing..." : "Refresh sources"}
            </button>
          </div>

          <div className="relative mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[22px] border border-[var(--lg-border)] bg-[var(--lg-cream)]/55 px-4 py-4">
              <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
                source type
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SOURCE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => chooseSourceType(option.id)}
                    aria-pressed={sourceType === option.id}
                    className={`min-h-14 rounded-2xl border px-4 py-3 text-left transition-colors duration-300 ${
                      sourceType === option.id
                        ? "border-[var(--lg-rose)] bg-[var(--lg-paper)] text-[var(--lg-ink)]"
                        : "border-[var(--lg-border)] bg-[var(--lg-paper)]/60 text-[var(--lg-cocoa)] hover:border-[var(--lg-rose-soft)]"
                    }`}
                  >
                    <span className="block font-cute" style={{ fontSize: "1.1rem" }}>
                      {option.label}
                    </span>
                    <span className="block font-cute text-[var(--lg-cocoa)]/65" style={{ fontSize: "0.92rem" }}>
                      {option.note}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--lg-border)] bg-[var(--lg-cream)]/55 px-4 py-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
                    source location
                  </p>
                  <p className="mt-1 font-cute text-[var(--lg-cocoa)]/65" style={{ fontSize: "0.92rem" }}>
                    Account and device saves stay separate.
                  </p>
                </div>
                <p className="font-cute text-[var(--lg-cocoa)]/60" style={{ fontSize: "0.9rem" }}>
                  {session?.user ? `${allAccountCount} account · ${allDeviceCount} device` : `${allDeviceCount} device`}
                </p>
              </div>
              <div className="mt-3">{renderScopePicker()}</div>
            </div>
          </div>

          <div className="relative mt-5 rounded-[22px] border border-[var(--lg-border)] bg-[var(--lg-cream)]/45 px-4 py-4">
            <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
                  choose saved item
                </p>
                <p className="mt-1 font-cute text-[var(--lg-cocoa)]/65" style={{ fontSize: "0.92rem" }}>
                  No source is selected automatically.
                </p>
              </div>
              {sourceType && activeSources.length > 0 && (
                <p className="font-cute text-[var(--lg-cocoa)]/60" style={{ fontSize: "0.9rem" }}>
                  {activeSources.length} real source{activeSources.length === 1 ? "" : "s"}
                </p>
              )}
            </div>
            {renderSourceList()}
          </div>

          <div className="relative mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] border border-[var(--lg-border)] bg-[var(--lg-cream)]/55 px-4 py-4">
              <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
                format
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2">
                {(Object.keys(MEMORY_CARD_FORMATS) as MemoryCardFormat[]).map((key) => {
                  const item = MEMORY_CARD_FORMATS[key];

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => chooseFormat(key)}
                      aria-pressed={format === key}
                      className={`min-h-16 rounded-2xl border px-3 py-3 text-left transition-colors duration-300 ${
                        format === key
                          ? "border-[var(--lg-rose)] bg-[var(--lg-paper)] text-[var(--lg-ink)]"
                          : "border-[var(--lg-border)] bg-[var(--lg-paper)]/60 text-[var(--lg-cocoa)] hover:border-[var(--lg-rose-soft)]"
                      }`}
                    >
                      <span className="block font-cute" style={{ fontSize: "1.04rem" }}>
                        {item.label}
                      </span>
                      <span className="block text-[var(--lg-cocoa)]/65" style={{ fontSize: "0.78rem" }}>
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--lg-border)] bg-[var(--lg-cream)]/55 px-4 py-4">
              <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
                style
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2">
                {(Object.keys(MEMORY_CARD_THEMES) as MemoryCardThemeKey[]).map((key) => {
                  const item = MEMORY_CARD_THEMES[key];

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => chooseTheme(key)}
                      aria-pressed={theme === key}
                      className={`min-h-16 rounded-2xl border px-3 py-3 text-left transition-colors duration-300 ${
                        theme === key
                          ? "border-[var(--lg-rose)] bg-[var(--lg-paper)] text-[var(--lg-ink)]"
                          : "border-[var(--lg-border)] bg-[var(--lg-paper)]/60 text-[var(--lg-cocoa)] hover:border-[var(--lg-rose-soft)]"
                      }`}
                    >
                      <span className="mb-2 flex gap-1" aria-hidden="true">
                        <span className="h-3 w-3 rounded-full border border-black/5" style={{ background: item.background }} />
                        <span className="h-3 w-3 rounded-full border border-black/5" style={{ background: item.rose }} />
                        <span className="h-3 w-3 rounded-full border border-black/5" style={{ background: item.accent }} />
                      </span>
                      <span className="block font-cute" style={{ fontSize: "1.04rem" }}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative mt-5 rounded-[22px] border border-[var(--lg-border)] bg-[var(--lg-cream)]/45 px-4 py-5">
            <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
                  preview
                </p>
                <p className="mt-1 font-cute text-[var(--lg-cocoa)]/65" style={{ fontSize: "0.92rem" }}>
                  Review this text before download. Recipient emails, account IDs, database IDs, tokens, and Garden metadata are not added.
                </p>
              </div>
              {previewState === "preparing" && (
                <p className="font-cute text-[var(--lg-rose)] animate-pulse" style={{ fontSize: "0.98rem" }}>
                  Preparing preview...
                </p>
              )}
            </div>
            {renderPreview()}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-7 pt-2 pb-6 border-t border-dashed border-[var(--lg-border)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.02rem", lineHeight: 1.45 }}>
              Privacy note: exports are created in this browser from the selected item only. Lategram recipient labels are not printed on
              cards, and no Garden or Late Letter delivery metadata is used.
            </p>
            <p className="mt-1 font-cute text-[var(--lg-cocoa)]/65" style={{ fontSize: "0.92rem" }}>
              Saved card history is still future work; download creates a PNG file only.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            {disabledReason && (
              <span className="font-cute text-[var(--lg-cocoa)]/65" style={{ fontSize: "0.95rem" }}>
                {disabledReason}
              </span>
            )}
            <button
              type="button"
              onClick={downloadCard}
              disabled={downloadDisabled}
              className="min-h-12 rounded-full bg-[var(--lg-ink)] px-6 py-3 text-[var(--lg-cream)] disabled:cursor-not-allowed disabled:opacity-55 hover:bg-[var(--lg-rose)] transition-colors duration-500"
              style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase" }}
            >
              {exportState === "exporting" ? "Exporting..." : "Download PNG"}
            </button>
          </div>
        </div>
        {status && (
          <p className="mt-4 text-center font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
            {status}
          </p>
        )}
      </div>
    </DiaryFrame>
  );
}
