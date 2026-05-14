import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { DiaryFrame } from "./DiaryFrame";
import { blooms } from "../BrandAssets";
import { EmptyState } from "../shared/EmptyState";
import { PillChip } from "../shared/PillChip";
import {
  deleteLocalDraft,
  readLocalCounters,
  readLocalDraft,
  readLocalLategrams,
  removeLocalCounter,
  removeLocalLategram,
} from "../../storage/localStorage";
import type { LocalCounter, LocalDestination, LocalDraft, LocalLategram } from "../../storage/types";
import { useAuth } from "../../auth/useAuth";
import { useAccountLategrams } from "../../db/useAccountLategrams";
import { useAccountCounters } from "../../db/useAccountCounters";
import type { DbPrivateLategram, DbTimeSinceCounter } from "../../db/types";

const tabs = [
  { id: "lategrams", label: "My Lategrams" },
  { id: "letters", label: "Late Letters" },
  { id: "time", label: "Time Since" },
  { id: "cards", label: "Saved Cards" },
  { id: "received", label: "Received" },
] as const;

const destinationFilters: Array<{ id: "all" | LocalDestination; label: string }> = [
  { id: "all", label: "all" },
  { id: "private", label: "keep private" },
  { id: "later", label: "late letter" },
  { id: "garden", label: "garden" },
  { id: "memory", label: "memory card" },
];

const destinationLabels: Record<LocalDestination, string> = {
  private: "Keep Private",
  later: "Late Letter",
  garden: "Garden",
  memory: "Memory Card",
};

const destinationNotes: Record<LocalDestination, string> = {
  private: "Saved on this device.",
  later: "Written as a late letter, saved privately on this device. Delivery is not connected yet.",
  garden: "Written for the Garden, saved privately on this device.",
  memory: "Written for a Memory Card, saved privately on this device. Card export is not connected yet.",
};

type KeepPrivateTab = (typeof tabs)[number]["id"];
type DestinationFilter = (typeof destinationFilters)[number]["id"];

interface KeepPrivateViewProps {
  onViewSection?: (section: "write") => void;
}

function timestampValue(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function sortLategrams(lategrams: LocalLategram[]) {
  return [...lategrams].sort((a, b) => timestampValue(b.updatedAt) - timestampValue(a.updatedAt));
}

function sortCounters(counters: LocalCounter[]) {
  return [...counters].sort((a, b) => timestampValue(b.updatedAt) - timestampValue(a.updatedAt));
}

function readArchiveSnapshot() {
  return {
    lategrams: sortLategrams(readLocalLategrams()),
    counters: sortCounters(readLocalCounters()),
    draft: readLocalDraft(),
  };
}

function formatShortDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "saved locally";
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toLowerCase();
}

function formatLongDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "a saved date";
  }

  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function daysBetween(iso: string) {
  const d1 = new Date(iso);

  if (Number.isNaN(d1.getTime())) {
    return 0;
  }

  const d2 = new Date();
  const ms = d2.getTime() - d1.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function excerpt(value: string, maxLength = 150) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

function lategramTitle(lategram: LocalLategram) {
  if (lategram.subject?.trim()) {
    return lategram.subject;
  }

  if (lategram.to?.trim()) {
    return `to ${lategram.to}`;
  }

  return "Saved Lategram";
}

function accountLategramTitle(lategram: DbPrivateLategram) {
  if (lategram.subject?.trim()) {
    return lategram.subject;
  }

  if (lategram.recipient_label?.trim()) {
    return `to ${lategram.recipient_label}`;
  }

  return "Saved Lategram";
}

export function KeepPrivateView({ onViewSection }: KeepPrivateViewProps) {
  const { authAvailable, session } = useAuth();
  const { 
    data: accountLategrams, 
    loading: accountLategramsLoading,
    error: accountLategramsError,
    refresh: refreshAccountLategrams, 
    remove: removeAccountLategram, 
    create: createAccountLategram 
  } = useAccountLategrams();
  const { 
    data: accountCounters, 
    loading: accountCountersLoading,
    error: accountCountersError,
    refresh: refreshAccountCounters, 
    remove: removeAccountCounter, 
    create: createAccountCounter 
  } = useAccountCounters();
  
  const [tab, setTab] = useState<KeepPrivateTab>("lategrams");
  const [viewType, setViewType] = useState<"account" | "device">("device");
  const [filter, setFilter] = useState<DestinationFilter>("all");
  const [lategrams, setLategrams] = useState<LocalLategram[]>(() => sortLategrams(readLocalLategrams()));
  const [counters, setCounters] = useState<LocalCounter[]>(() => sortCounters(readLocalCounters()));
  const [draft, setDraft] = useState<LocalDraft | null>(() => readLocalDraft());
  const [selectedLategramId, setSelectedLategramId] = useState<string | null>(null);
  const [pendingLategramDeleteId, setPendingLategramDeleteId] = useState<string | null>(null);
  const [pendingCounterDeleteId, setPendingCounterDeleteId] = useState<string | null>(null);
  const [pendingDraftDelete, setPendingDraftDelete] = useState(false);
  const [status, setStatus] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setViewType("account");
    } else {
      setViewType("device");
    }
  }, [session?.user]);

  useEffect(() => {
    const snapshot = readArchiveSnapshot();
    setLategrams(snapshot.lategrams);
    setCounters(snapshot.counters);
    setDraft(snapshot.draft);
  }, []);

  const filteredLategrams = useMemo(() => {
    if (filter === "all") {
      return lategrams;
    }

    return lategrams.filter((lategram) => lategram.destination === filter);
  }, [filter, lategrams]);

  const filteredAccountLategrams = useMemo(() => {
    if (filter === "all") {
      return accountLategrams;
    }

    return accountLategrams.filter((lategram) => lategram.destination === filter);
  }, [filter, accountLategrams]);

  const filteredAccountCounters = useMemo(() => {
    // There are no filters for counters currently in this UI, 
    // but we'll sort them by updated_at descending
    return [...accountCounters].sort((a, b) => timestampValue(b.updated_at) - timestampValue(a.updated_at));
  }, [accountCounters]);

  const refreshArchive = async (message = "Archive refreshed.") => {
    const snapshot = readArchiveSnapshot();
    setLategrams(snapshot.lategrams);
    setCounters(snapshot.counters);
    setDraft(snapshot.draft);
    setPendingLategramDeleteId(null);
    setPendingCounterDeleteId(null);
    setPendingDraftDelete(false);

    if (selectedLategramId && !snapshot.lategrams.some((lategram) => lategram.id === selectedLategramId)) {
      setSelectedLategramId(null);
    }
    
    if (session?.user) {
      await refreshAccountLategrams();
      await refreshAccountCounters();
    }

    setStatus(message);
  };

  const copyLategram = async (lategram: LocalLategram) => {
    setPendingLategramDeleteId(null);

    if (!navigator.clipboard?.writeText) {
      setStatus("Copy did not work in this browser.");
      return;
    }

    try {
      await navigator.clipboard.writeText(lategram.body);
      setStatus("Copied from this device.");
    } catch {
      setStatus("Copy did not work in this browser.");
    }
  };

  const copyAccountLategram = async (lategram: DbPrivateLategram) => {
    setPendingLategramDeleteId(null);

    if (!navigator.clipboard?.writeText) {
      setStatus("Copy did not work in this browser.");
      return;
    }

    try {
      await navigator.clipboard.writeText(lategram.body);
      setStatus("Copied from your account archive.");
    } catch {
      setStatus("Copy did not work in this browser.");
    }
  };

  const removeAccountLategramAction = async (lategram: DbPrivateLategram) => {
    if (pendingLategramDeleteId !== lategram.id) {
      setPendingLategramDeleteId(lategram.id);
      setPendingCounterDeleteId(null);
      setPendingDraftDelete(false);
      setStatus("remove this saved Lategram from your account?");
      return;
    }

    const { success, error } = await removeAccountLategram(lategram.id);

    if (!success) {
      setStatus(error || "Could not remove this saved Lategram from your account.");
      return;
    }

    setPendingLategramDeleteId(null);

    if (selectedLategramId === lategram.id) {
      setSelectedLategramId(null);
    }

    setStatus("Removed from your account.");
  };

  const removeLategram = (lategram: LocalLategram) => {
    if (pendingLategramDeleteId !== lategram.id) {
      setPendingLategramDeleteId(lategram.id);
      setPendingCounterDeleteId(null);
      setPendingDraftDelete(false);
      setStatus("remove this saved Lategram?");
      return;
    }

    const result = removeLocalLategram(lategram.id);

    if (!result.ok) {
      setStatus("Could not remove this saved Lategram in this browser.");
      return;
    }

    setLategrams((items) => items.filter((item) => item.id !== lategram.id));
    setPendingLategramDeleteId(null);

    if (selectedLategramId === lategram.id) {
      setSelectedLategramId(null);
    }

    setStatus("Removed from this device.");
  };

  const removeAccountCounterAction = async (counter: DbTimeSinceCounter) => {
    if (pendingCounterDeleteId !== counter.id) {
      setPendingCounterDeleteId(counter.id);
      setPendingLategramDeleteId(null);
      setPendingDraftDelete(false);
      setStatus("remove this counter from your account?");
      return;
    }

    const { success, error } = await removeAccountCounter(counter.id);

    if (!success) {
      setStatus(error || "Could not remove this counter from your account.");
      return;
    }

    setPendingCounterDeleteId(null);
    setStatus("Counter removed from your account.");
  };

  const removeCounter = (counter: LocalCounter) => {
    if (pendingCounterDeleteId !== counter.id) {
      setPendingCounterDeleteId(counter.id);
      setPendingLategramDeleteId(null);
      setPendingDraftDelete(false);
      setStatus("remove this counter?");
      return;
    }

    const result = removeLocalCounter(counter.id);

    if (!result.ok) {
      setStatus("Could not remove this counter in this browser.");
      return;
    }

    setCounters((items) => items.filter((item) => item.id !== counter.id));
    setPendingCounterDeleteId(null);
    setStatus("Counter removed from this device.");
  };

  const clearDraft = () => {
    if (!draft) {
      return;
    }

    if (!pendingDraftDelete) {
      setPendingDraftDelete(true);
      setPendingLategramDeleteId(null);
      setPendingCounterDeleteId(null);
      setStatus("clear this draft from this device?");
      return;
    }

    const result = deleteLocalDraft();

    if (!result.ok) {
      setStatus("Could not clear draft in this browser.");
      return;
    }

    setDraft(null);
    setPendingDraftDelete(false);
    setStatus("Draft cleared from this device.");
  };

  const restoreDraftInWriter = () => {
    setPendingDraftDelete(false);
    setStatus("");

    if (onViewSection) {
      onViewSection("write");
      return;
    }

    setStatus("Open the writer to restore this draft.");
  };

  const importLocalToAccount = async () => {
    if (!session?.user || lategrams.length === 0) return;

    if (!isImporting && importStatus === null) {
      setImportStatus("Import these local saves to your account?");
      return;
    }

    setIsImporting(true);
    setImportStatus("Importing...");

    let successCount = 0;
    let failCount = 0;
    let duplicateCount = 0;

    for (const local of lategrams) {
      // Simple duplicate detection: check if an account lategram with same body and destination exists
      const isDuplicate = accountLategrams.some(
        (acc) => acc.body === local.body && acc.destination === local.destination
      );

      if (isDuplicate) {
        duplicateCount++;
        continue;
      }

      const { error } = await createAccountLategram({
        body: local.body,
        recipient_label: local.to || null,
        subject: local.subject || null,
        destination: local.destination,
        mood: null,
        flower_key: null
      });

      if (error) {
        failCount++;
      } else {
        successCount++;
      }
    }

    setIsImporting(false);
    
    if (successCount > 0 || duplicateCount > 0) {
      let msg = `Imported ${successCount} local saves to your account.`;
      if (duplicateCount > 0) {
        msg += ` Skipped ${duplicateCount} duplicates.`;
      }
      if (failCount > 0) {
        msg += ` ${failCount} could not be imported.`;
      }
      msg += " Local copies remain on this device.";
      setImportStatus(msg);
      await refreshAccountLategrams();
    } else if (failCount > 0) {
      setImportStatus("Import failed. Could not save to your account.");
    } else {
      setImportStatus("Nothing new to import.");
    }
  };

  const selectTab = async (nextTab: KeepPrivateTab) => {
    const snapshot = readArchiveSnapshot();
    setTab(nextTab);
    setLategrams(snapshot.lategrams);
    setCounters(snapshot.counters);
    setDraft(snapshot.draft);
    setPendingLategramDeleteId(null);
    setPendingCounterDeleteId(null);
    setPendingDraftDelete(false);
    setStatus("");
    
    if (session?.user) {
      await refreshAccountLategrams();
      await refreshAccountCounters();
    }
  };

  const renderImportPanel = () => {
    if (!session?.user || lategrams.length === 0) return null;

    return (
      <div className="mb-6 rounded-[22px] border border-dashed border-[var(--lg-rose-soft)] bg-[var(--lg-blush)]/40 px-5 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.08rem" }}>
              You have {lategrams.length} local save{lategrams.length === 1 ? '' : 's'} on this device.
            </p>
            <p className="font-cute text-[var(--lg-cocoa)]/70 mt-1" style={{ fontSize: "0.95rem" }}>
              {importStatus || "Local copies will remain unless you remove them."}
            </p>
          </div>
          <button
            type="button"
            onClick={importLocalToAccount}
            disabled={isImporting}
            className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500 disabled:opacity-50"
            style={{ fontSize: "1.02rem" }}
          >
            {isImporting ? "Importing..." : (importStatus?.includes("?") ? "Yes, import" : "Import to account")}
          </button>
        </div>
      </div>
    );
  };

  const renderDraftPanel = () => {
    if (!draft) {
      return null;
    }

    return (
      <div className="mb-5 rounded-[22px] border border-dashed border-[var(--lg-border)] bg-[var(--lg-paper)]/55 px-5 py-4">
        <div className="flex items-start gap-3">
          <img src={blooms.coralCarnation} alt="" aria-hidden="true" className="w-9 h-9 object-contain shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.08rem" }}>
                  Draft found on this device.
                </p>
                <p className="font-cute text-[var(--lg-cocoa)]/70 mt-1" style={{ fontSize: "0.95rem" }}>
                  Updated {formatLongDate(draft.updatedAt)}. Only available in this browser.
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={restoreDraftInWriter}
                  className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
                  style={{ fontSize: "1.02rem" }}
                >
                  Restore in writer
                </button>
                <button
                  type="button"
                  onClick={clearDraft}
                  className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
                  style={{ fontSize: "1.02rem" }}
                >
                  {pendingDraftDelete ? "clear draft from this device" : "Clear draft"}
                </button>
                {pendingDraftDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingDraftDelete(false);
                      setStatus("");
                    }}
                    className="font-cute text-[var(--lg-cocoa)]/70 hover:text-[var(--lg-ink)] transition-colors duration-500"
                    style={{ fontSize: "1.02rem" }}
                  >
                    keep draft
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 font-cute text-[var(--lg-cocoa)] line-clamp-2" style={{ fontSize: "1.05rem", lineHeight: 1.35 }}>
              {excerpt(draft.body, 180)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderLategramDetail = (lategram: LocalLategram | DbPrivateLategram) => {
    const isAccount = 'user_id' in lategram;
    const to = isAccount ? lategram.recipient_label : lategram.to;
    const createdAt = isAccount ? lategram.created_at : lategram.createdAt;
    const updatedAt = isAccount ? lategram.updated_at : lategram.updatedAt;
    const wordCount = isAccount ? lategram.body.trim().split(/\s+/).length : lategram.wordCount;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="mt-4 rounded-[20px] border border-dashed border-[var(--lg-border)] bg-[var(--lg-cream)]/70 p-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2">
          {to && (
            <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
              recipient: <span className="text-[var(--lg-ink)]">{to}</span>
            </p>
          )}
          {lategram.subject && (
            <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
              subject: <span className="text-[var(--lg-ink)]">{lategram.subject}</span>
            </p>
          )}
          <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
            destination: <span className="text-[var(--lg-ink)]">{destinationLabels[lategram.destination]}</span>
          </p>
          <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
            created: <span className="text-[var(--lg-ink)]">{formatLongDate(createdAt)}</span>
          </p>
          <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
            updated: <span className="text-[var(--lg-ink)]">{formatLongDate(updatedAt)}</span>
          </p>
          <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
            words: <span className="text-[var(--lg-ink)]">{wordCount}</span>
          </p>
        </div>
        <div
          className="mt-4 rounded-[18px] bg-[var(--lg-paper)]/80 border border-[var(--lg-border)] px-4 py-3 text-[var(--lg-ink)] whitespace-pre-wrap break-words"
          style={{ fontFamily: "'Caveat', 'Segoe Print', cursive", fontSize: "1.35rem", lineHeight: 1.35 }}
        >
          {lategram.body}
        </div>
        <p className="mt-3 font-cute text-[var(--lg-cocoa)]/65" style={{ fontSize: "0.95rem" }}>
          {isAccount ? "Saved to your account." : `${destinationNotes[lategram.destination]} Only available in this browser.`}
        </p>
      </motion.div>
    );
  };

  const renderLategrams = () => {
    const activeItems = viewType === "account" ? filteredAccountLategrams : filteredLategrams;
    const allItems = viewType === "account" ? accountLategrams : lategrams;
    const isLoading = viewType === "account" && accountLategramsLoading;
    const hasError = viewType === "account" && accountLategramsError;

    return (
      <>
        {viewType === "device" && renderDraftPanel()}
        {viewType === "account" && renderImportPanel()}

        {session?.user && (
          <div className="mb-6 flex items-center gap-2 border-b border-dashed border-[var(--lg-border)] pb-4">
            <button
              onClick={() => {
                setViewType("account");
                setPendingLategramDeleteId(null);
                setSelectedLategramId(null);
                setStatus("");
              }}
              className={`font-cute transition-colors duration-300 ${
                viewType === "account" ? "text-[var(--lg-rose)]" : "text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)]"
              }`}
              style={{ fontSize: "1.1rem" }}
            >
              Account archive
            </button>
            <span className="text-[var(--lg-border)]">|</span>
            <button
              onClick={() => {
                setViewType("device");
                setPendingLategramDeleteId(null);
                setSelectedLategramId(null);
                setStatus("");
              }}
              className={`font-cute transition-colors duration-300 ${
                viewType === "device" ? "text-[var(--lg-rose)]" : "text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)]"
              }`}
              style={{ fontSize: "1.1rem" }}
            >
              This device
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center">
            <p className="font-cute text-[var(--lg-rose)] animate-pulse" style={{ fontSize: "1.2rem" }}>
              Loading your account archive...
            </p>
          </div>
        ) : hasError ? (
          <div className="py-12 text-center">
            <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.2rem" }}>
              Account archive could not load right now.
            </p>
            <p className="font-cute text-[var(--lg-cocoa)] mt-2" style={{ fontSize: "1rem" }}>
              You can still view saves on this device.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {destinationFilters.map((item) => (
                  <PillChip
                    key={item.id}
                    active={filter === item.id}
                    onClick={() => {
                      setFilter(item.id);
                      setPendingLategramDeleteId(null);
                      setSelectedLategramId(null);
                      setStatus("");
                    }}
                  >
                    {item.label}
                  </PillChip>
                ))}
              </div>
              <p className="font-cute text-[var(--lg-cocoa)]/60" style={{ fontSize: "0.9rem" }}>
                {viewType === "account" ? "your account archive" : "saves on this device"}
              </p>
            </div>

            {allItems.length === 0 && (
              <EmptyState
                message={viewType === "account" ? "No saved Lategrams in your account yet." : "No saved Lategrams on this device yet."}
                note={viewType === "account" ? "Save one from the writer." : "Write and save one first."}
              />
            )}

            {allItems.length > 0 && activeItems.length === 0 && (
              <EmptyState
                message="No saved Lategrams here yet."
                note="Try a different filter."
              />
            )}

            {activeItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeItems.map((lategram) => {
                  const isSelected = selectedLategramId === lategram.id;
                  const isAccount = 'user_id' in lategram;
                  const updatedAt = isAccount ? lategram.updated_at : lategram.updatedAt;
                  const wordCount = isAccount ? lategram.body.trim().split(/\s+/).length : lategram.wordCount;

                  return (
                    <div
                      key={lategram.id}
                      className="group text-left bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-4 shadow-[0_8px_22px_-16px_rgba(120,80,70,0.4)]"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={blooms.softPeony}
                          alt=""
                          aria-hidden="true"
                          className="w-10 h-10 object-contain shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-[var(--lg-ink)] truncate"
                            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "1.05rem" }}
                          >
                            {isAccount ? accountLategramTitle(lategram as DbPrivateLategram) : lategramTitle(lategram as LocalLategram)}
                          </h3>
                          <p
                            className="font-cute text-[var(--lg-cocoa)] mt-1 line-clamp-2"
                            style={{ fontSize: "1.1rem", lineHeight: 1.3 }}
                          >
                            {excerpt(lategram.body, 170)}
                          </p>
                          <p
                            className="text-[var(--lg-rose)] mt-2"
                            style={{ fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
                          >
                            {formatShortDate(updatedAt)} · {destinationLabels[lategram.destination]} · {wordCount} words
                          </p>
                          <p className="mt-2 font-cute text-[var(--lg-cocoa)]/65" style={{ fontSize: "0.92rem" }}>
                            {isAccount ? "Saved to your account." : `${destinationNotes[lategram.destination]} Only available in this browser.`}
                          </p>
                          <div className="mt-3 flex items-center gap-3 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLategramId(isSelected ? null : lategram.id);
                                setPendingLategramDeleteId(null);
                                setStatus("");
                              }}
                              className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
                              style={{ fontSize: "1rem" }}
                            >
                              {isSelected ? "Close" : "View"}
                            </button>
                            <button
                              type="button"
                              onClick={() => isAccount ? copyAccountLategram(lategram as DbPrivateLategram) : copyLategram(lategram as LocalLategram)}
                              className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
                              style={{ fontSize: "1rem" }}
                            >
                              Copy
                            </button>
                            <button
                              type="button"
                              onClick={() => isAccount ? removeAccountLategramAction(lategram as DbPrivateLategram) : removeLategram(lategram as LocalLategram)}
                              className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
                              style={{ fontSize: "1rem" }}
                            >
                              {pendingLategramDeleteId === lategram.id 
                                ? (isAccount ? "remove from account" : "remove from this device") 
                                : (isAccount ? "Remove from account" : "Remove from this device")}
                            </button>
                            {pendingLategramDeleteId === lategram.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPendingLategramDeleteId(null);
                                  setStatus("");
                                }}
                                className="font-cute text-[var(--lg-cocoa)]/70 hover:text-[var(--lg-ink)] transition-colors duration-500"
                                style={{ fontSize: "1rem" }}
                              >
                                keep it
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {isSelected && renderLategramDetail(lategram)}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </>
    );
  };

  const renderCounters = () => {
    const activeItems = viewType === "account" ? filteredAccountCounters : counters;
    const allItems = viewType === "account" ? accountCounters : counters;
    const isLoading = viewType === "account" && accountCountersLoading;
    const hasError = viewType === "account" && accountCountersError;

    return (
      <>
        {session?.user && (
          <div className="mb-6 flex items-center gap-2 border-b border-dashed border-[var(--lg-border)] pb-4">
            <button
              onClick={() => {
                setViewType("account");
                setPendingCounterDeleteId(null);
                setStatus("");
              }}
              className={`font-cute transition-colors duration-300 ${
                viewType === "account" ? "text-[var(--lg-rose)]" : "text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)]"
              }`}
              style={{ fontSize: "1.1rem" }}
            >
              Account archive
            </button>
            <span className="text-[var(--lg-border)]">|</span>
            <button
              onClick={() => {
                setViewType("device");
                setPendingCounterDeleteId(null);
                setStatus("");
              }}
              className={`font-cute transition-colors duration-300 ${
                viewType === "device" ? "text-[var(--lg-rose)]" : "text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)]"
              }`}
              style={{ fontSize: "1.1rem" }}
            >
              This device
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center">
            <p className="font-cute text-[var(--lg-rose)] animate-pulse" style={{ fontSize: "1.2rem" }}>
              Loading your account counters...
            </p>
          </div>
        ) : hasError ? (
          <div className="py-12 text-center">
            <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.2rem" }}>
              Account archive could not load right now.
            </p>
            <p className="font-cute text-[var(--lg-cocoa)] mt-2" style={{ fontSize: "1rem" }}>
              You can still view counters on this device.
            </p>
          </div>
        ) : (
          <>
            <p
              className="font-cute text-[var(--lg-cocoa)]/60 text-center mb-4"
              style={{ fontSize: "0.9rem" }}
            >
              {viewType === "account" ? "Saved to your account." : "Saved on this device only."}
            </p>

            {allItems.length === 0 && (
              <EmptyState
                message={viewType === "account" ? "No counters in your account yet." : "No counters on this device yet."}
                note={viewType === "account" ? "Add one in Time Since first." : "Add one in Time Since first."}
              />
            )}

            {activeItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeItems.map((counter) => {
                  const isAccount = 'user_id' in counter;
                  const title = counter.title;
                  const start = isAccount ? counter.start_date : counter.start;
                  const context = counter.context;

                  return (
                    <div
                      key={counter.id}
                      className="bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-4 flex items-start gap-3 shadow-[0_8px_22px_-16px_rgba(120,80,70,0.4)]"
                    >
                      <img src={blooms.pinkDaisy} alt="" aria-hidden="true" className="w-10 h-10 object-contain shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[var(--lg-ink)] truncate"
                          style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "1rem" }}
                        >
                          {title}
                        </p>
                        <p className="font-cute text-[var(--lg-rose)] mt-1" style={{ fontSize: "1.1rem" }}>
                          {daysBetween(start)} days
                        </p>
                        <p className="font-cute text-[var(--lg-cocoa)] mt-1" style={{ fontSize: "0.98rem" }}>
                          since {formatLongDate(start)}
                        </p>
                        {context && (
                          <p className="font-cute text-[var(--lg-cocoa)]/75 mt-2 line-clamp-2" style={{ fontSize: "0.98rem", lineHeight: 1.3 }}>
                            {context}
                          </p>
                        )}
                        <p className="mt-2 font-cute text-[var(--lg-cocoa)]/60" style={{ fontSize: "0.9rem" }}>
                          {isAccount ? "Saved to your account." : "Saved on this device. Only available in this browser."}
                        </p>
                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                          <button
                            type="button"
                            onClick={() => isAccount ? removeAccountCounterAction(counter as DbTimeSinceCounter) : removeCounter(counter as LocalCounter)}
                            className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
                            style={{ fontSize: "1rem" }}
                          >
                            {pendingCounterDeleteId === counter.id 
                              ? (isAccount ? "remove from account" : "remove from this device") 
                              : (isAccount ? "Remove from account" : "Remove from this device")}
                          </button>
                          {pendingCounterDeleteId === counter.id && (
                            <button
                              type="button"
                              onClick={() => {
                                setPendingCounterDeleteId(null);
                                setStatus("");
                              }}
                              className="font-cute text-[var(--lg-cocoa)]/70 hover:text-[var(--lg-ink)] transition-colors duration-500"
                              style={{ fontSize: "1rem" }}
                            >
                              keep it
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </>
    );
  };

  const renderUnavailableTab = () => {
    if (tab === "letters") {
      return (
        <EmptyState
          message="No late letters are connected here yet."
          note="Delivery is not connected yet."
        />
      );
    }

    if (tab === "cards") {
      return (
        <EmptyState
          message="No saved cards on this device yet."
          note="Card export is not connected yet."
        />
      );
    }

    return (
      <EmptyState
        message="No received letters here yet."
        note="Receiving letters is not connected yet."
      />
    );
  };

  return (
    <DiaryFrame
      caption="dear keepsake ✿"
      title={<span className="font-serif-italic text-[var(--lg-rose)]">keep it private</span>}
    >
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-7 pt-6 pb-3 border-b border-dashed border-[var(--lg-border)]">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => selectTab(t.id)}
              className={`relative font-cute transition-colors duration-300 ${
                active ? "text-[var(--lg-rose)]" : "text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)]"
              }`}
              style={{ fontSize: "1.2rem" }}
            >
              {t.label}
              {active && (
                <motion.span
                  layoutId="kp-underline"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-[var(--lg-rose)]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="px-7 py-6 min-h-[280px]">
        <div className="mb-5 rounded-[22px] border border-dashed border-[var(--lg-border)] bg-[var(--lg-cream)]/50 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
            {authAvailable ? "Accounts are connected, but this archive is still stored only in this browser." : "Saved on this device only. Clearing browser data may remove these. Accounts are not connected yet."}
          </p>
          <button
            type="button"
            onClick={() => refreshArchive()}
            className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
            style={{ fontSize: "1rem" }}
          >
            Refresh archive
          </button>
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {tab === "lategrams" && renderLategrams()}
          {tab === "time" && renderCounters()}
          {tab !== "lategrams" && tab !== "time" && renderUnavailableTab()}
          {status && (
            <p
              className="mt-5 text-center font-cute text-[var(--lg-cocoa)]"
              style={{ fontSize: "1rem" }}
            >
              {status}
            </p>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-7 pt-2 pb-6 flex items-center justify-between gap-4 flex-wrap border-t border-dashed border-[var(--lg-border)]">
        <span
          className="font-cute text-[var(--lg-cocoa)]"
          style={{ fontSize: "1.05rem" }}
        >
          Private on this device for now.
        </span>
        <span
          className="font-cute text-[var(--lg-cocoa)]/50"
          style={{ fontSize: "1.1rem" }}
        >
          Only available in this browser.
        </span>
      </div>
    </DiaryFrame>
  );
}
