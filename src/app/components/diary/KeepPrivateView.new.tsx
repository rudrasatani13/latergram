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

const accountDestinationNotes: Record<LocalDestination, string> = {
  private: "Saved to your account.",
  later: "Written as a late letter, saved privately to your account. Delivery is not connected yet.",
  garden: "Written for the Garden, saved privately to your account.",
  memory: "Written for a Memory Card, saved privately to your account. Card export is not connected yet.",
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

function lategramTitle(lategram: { subject?: string | null; to?: string | null; recipient_label?: string | null }) {
  if (lategram.subject?.trim()) {
    return lategram.subject;
  }
  const to = lategram.to || lategram.recipient_label;
  if (to?.trim()) {
    return `to ${to}`;
  }
  return "Saved Lategram";
}

export function KeepPrivateView({ onViewSection }: KeepPrivateViewProps) {
  const { authAvailable, session } = useAuth();
  const { data: accountLategrams, refresh: refreshAccountLategrams, remove: removeAccountLategram, create: createAccountLategram } = useAccountLategrams();
  const { data: accountCounters, refresh: refreshAccountCounters, remove: removeAccountCounter, create: createAccountCounter } = useAccountCounters();
  
  const [tab, setTab] = useState<KeepPrivateTab>("lategrams");
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

  useEffect(() => {
    const snapshot = readArchiveSnapshot();
    setLategrams(snapshot.lategrams);
    setCounters(snapshot.counters);
    setDraft(snapshot.draft);
  }, []);

  const unifiedLategrams = useMemo(() => {
    if (!session?.user) {
      return lategrams.map(l => ({ ...l, source: 'local' as const }));
    }
    
    const accountMapped = accountLategrams.map(l => ({
      id: l.id,
      body: l.body || '',
      to: l.recipient_label || undefined,
      subject: l.subject || undefined,
      destination: l.destination as LocalDestination,
      createdAt: l.created_at,
      updatedAt: l.updated_at,
      wordCount: l.body ? l.body.split(/\s+/).length : 0,
      source: 'account' as const
    }));
    
    // Do not mix seamlessly, just keep account mapped here. Local will render in a separate section.
    return accountMapped;
  }, [session?.user, accountLategrams, lategrams]);

  const filteredUnified = useMemo(() => {
    if (filter === "all") return unifiedLategrams;
    return unifiedLategrams.filter(l => l.destination === filter);
  }, [filter, unifiedLategrams]);

  const filteredLocal = useMemo(() => {
    if (filter === "all") return lategrams;
    return lategrams.filter(l => l.destination === filter);
  }, [filter, lategrams]);

  const refreshArchive = async (message = "Archive refreshed.") => {
    const snapshot = readArchiveSnapshot();
    setLategrams(snapshot.lategrams);
    setCounters(snapshot.counters);
    setDraft(snapshot.draft);
    setPendingLategramDeleteId(null);
    setPendingCounterDeleteId(null);
    setPendingDraftDelete(false);

    if (selectedLategramId && !snapshot.lategrams.some((l) => l.id === selectedLategramId) && !accountLategrams.some(l => l.id === selectedLategramId)) {
      setSelectedLategramId(null);
    }
    
    if (session?.user) {
      await refreshAccountLategrams();
      await refreshAccountCounters();
    }

    setStatus(message);
  };

  const copyLategram = async (body: string) => {
    setPendingLategramDeleteId(null);

    if (!navigator.clipboard?.writeText) {
      setStatus("Copy did not work in this browser.");
      return;
    }

    try {
      await navigator.clipboard.writeText(body);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus("Copy did not work in this browser.");
    }
  };

  const doRemoveLategram = async (id: string, source: 'local' | 'account') => {
    if (pendingLategramDeleteId !== id) {
      setPendingLategramDeleteId(id);
      setPendingCounterDeleteId(null);
      setPendingDraftDelete(false);
      setStatus(source === 'account' ? "Remove from your account?" : "Remove this saved Lategram?");
      return;
    }

    if (source === 'local') {
      const result = removeLocalLategram(id);
      if (!result.ok) {
        setStatus("Could not remove this saved Lategram in this browser.");
        return;
      }
      setLategrams((items) => items.filter((item) => item.id !== id));
      setStatus("Removed from this device.");
    } else {
      setStatus("Removing...");
      const { success } = await removeAccountLategram(id);
      if (!success) {
        setStatus("Could not remove from account right now.");
        return;
      }
      setStatus("Removed from your account.");
    }

    setPendingLategramDeleteId(null);
    if (selectedLategramId === id) {
      setSelectedLategramId(null);
    }
  };

  const doRemoveCounter = async (id: string, source: 'local' | 'account') => {
    if (pendingCounterDeleteId !== id) {
      setPendingCounterDeleteId(id);
      setPendingLategramDeleteId(null);
      setPendingDraftDelete(false);
      setStatus("remove this counter?");
      return;
    }

    if (source === 'local') {
      const result = removeLocalCounter(id);
      if (!result.ok) {
        setStatus("Could not remove this counter in this browser.");
        return;
      }
      setCounters((items) => items.filter((item) => item.id !== id));
      setStatus("Counter removed from this device.");
    } else {
      setStatus("Removing...");
      const { success } = await removeAccountCounter(id);
      if (!success) {
        setStatus("Could not remove from account right now.");
        return;
      }
      setStatus("Removed from your account.");
    }

    setPendingCounterDeleteId(null);
  };

  const clearDraft = () => {
    if (!draft) return;
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

  const importLocalSaves = async () => {
    setIsImporting(true);
    setStatus("Importing local saves...");
    
    let imported = 0;
    for (const lg of lategrams) {
      // Check if already imported
      const exists = accountLategrams.some(al => 
        al.body === lg.body && 
        al.subject === (lg.subject || null) && 
        al.destination === lg.destination
      );
      if (exists) continue;
      
      const { error } = await createAccountLategram({
        body: lg.body,
        recipient_label: lg.to || null,
        subject: lg.subject || null,
        destination: lg.destination,
        mood: null,
        flower_key: null,
      });
      if (!error) {
        imported++;
      }
    }
    
    await refreshAccountLategrams();
    setIsImporting(false);
    setStatus(`Imported ${imported} local saves to your account. Local copies remain unless you remove them.`);
  };

  const renderDraftPanel = () => {
    if (!draft) return null;
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

  const renderLategramDetail = (lategram: any, source: 'local' | 'account') => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="mt-4 rounded-[20px] border border-dashed border-[var(--lg-border)] bg-[var(--lg-cream)]/70 p-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2">
        {lategram.to && (
          <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
            recipient: <span className="text-[var(--lg-ink)]">{lategram.to}</span>
          </p>
        )}
        {lategram.subject && (
          <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
            subject: <span className="text-[var(--lg-ink)]">{lategram.subject}</span>
          </p>
        )}
        <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
          destination: <span className="text-[var(--lg-ink)]">{destinationLabels[lategram.destination as LocalDestination]}</span>
        </p>
        <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
          created: <span className="text-[var(--lg-ink)]">{formatLongDate(lategram.createdAt)}</span>
        </p>
        <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
          updated: <span className="text-[var(--lg-ink)]">{formatLongDate(lategram.updatedAt)}</span>
        </p>
        <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
          words: <span className="text-[var(--lg-ink)]">{lategram.wordCount}</span>
        </p>
      </div>
      <div
        className="mt-4 rounded-[18px] bg-[var(--lg-paper)]/80 border border-[var(--lg-border)] px-4 py-3 text-[var(--lg-ink)] whitespace-pre-wrap break-words"
        style={{ fontFamily: "'Caveat', 'Segoe Print', cursive", fontSize: "1.35rem", lineHeight: 1.35 }}
      >
        {lategram.body}
      </div>
      <p className="mt-3 font-cute text-[var(--lg-cocoa)]/65" style={{ fontSize: "0.95rem" }}>
        {source === 'account' ? accountDestinationNotes[lategram.destination as LocalDestination] : `${destinationNotes[lategram.destination as LocalDestination]} Only available in this browser.`}
      </p>
    </motion.div>
  );

  const renderLategramList = (list: any[], source: 'local' | 'account') => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {list.map((lategram) => {
          const isSelected = selectedLategramId === lategram.id;
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
                    {lategramTitle(lategram)}
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
                    {formatShortDate(lategram.updatedAt)} · {destinationLabels[lategram.destination as LocalDestination]} · {lategram.wordCount} words
                  </p>
                  <p className="mt-2 font-cute text-[var(--lg-cocoa)]/65" style={{ fontSize: "0.92rem" }}>
                    {source === 'account' ? accountDestinationNotes[lategram.destination as LocalDestination] : `${destinationNotes[lategram.destination as LocalDestination]} Only available in this browser.`}
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
                      onClick={() => copyLategram(lategram.body)}
                      className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
                      style={{ fontSize: "1rem" }}
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => doRemoveLategram(lategram.id, source)}
                      className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
                      style={{ fontSize: "1rem" }}
                    >
                      {pendingLategramDeleteId === lategram.id ? (source === 'account' ? "remove from account?" : "remove from this device") : (source === 'account' ? "Remove from account" : "Remove from this device")}
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
              {isSelected && renderLategramDetail(lategram, source)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderLategrams = () => (
    <>
      {renderDraftPanel()}
      {(unifiedLategrams.length > 0 || (session?.user && lategrams.length > 0)) && (
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
            newest saved first
          </p>
        </div>
      )}

      {!session?.user && lategrams.length === 0 && (
        <EmptyState
          message="No saved Lategrams on this device yet."
          note="Write and save one first."
        />
      )}
      
      {session?.user && unifiedLategrams.length === 0 && lategrams.length === 0 && (
        <EmptyState
          message="No saved Lategrams in your account yet."
          note="Write and save one first."
        />
      )}

      {session?.user && unifiedLategrams.length > 0 && filteredUnified.length > 0 && (
        <div className="mb-8">
          {renderLategramList(filteredUnified, 'account')}
        </div>
      )}

      {!session?.user && filteredLocal.length > 0 && (
        <div className="mb-8">
          {renderLategramList(filteredLocal, 'local')}
        </div>
      )}

      {session?.user && lategrams.length > 0 && (
        <div className="mt-8 pt-8 border-t border-dashed border-[var(--lg-border)]">
          <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.1rem" }}>
                You also have local saves on this browser.
              </p>
              <p className="font-cute text-[var(--lg-cocoa)]/70" style={{ fontSize: "0.95rem" }}>
                These remain on this device unless you choose to import or remove them.
              </p>
            </div>
            <button
              onClick={importLocalSaves}
              disabled={isImporting}
              className="bg-[var(--lg-rose)] text-[var(--lg-cream)] px-4 py-2 rounded-full font-cute transition-colors hover:bg-[var(--lg-focus-rose)] disabled:opacity-50"
              style={{ fontSize: "1rem" }}
            >
              {isImporting ? "Importing..." : "Import local saves to your account"}
            </button>
          </div>
          {filteredLocal.length > 0 && renderLategramList(filteredLocal, 'local')}
        </div>
      )}
    </>
  );

  const renderCounters = () => {
    const list = session?.user 
      ? accountCounters.map(c => ({...c, source: 'account'}))
      : counters.map(c => ({...c, source: 'local'}));

    if (list.length === 0 && (!session?.user || counters.length === 0)) {
      return (
        <EmptyState
          message="No counters on this device yet."
          note="Add one in Time Since first."
        />
      );
    }

    return (
      <>
        {session?.user && list.length > 0 && (
          <p
            className="font-cute text-[var(--lg-cocoa)]/60 text-center mb-4"
            style={{ fontSize: "0.9rem" }}
          >
            Saved to your account.
          </p>
        )}
        {!session?.user && list.length > 0 && (
          <p
            className="font-cute text-[var(--lg-cocoa)]/60 text-center mb-4"
            style={{ fontSize: "0.9rem" }}
          >
            Saved on this device only.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {list.map((counter: any) => (
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
                  {counter.title}
                </p>
                <p className="font-cute text-[var(--lg-rose)] mt-1" style={{ fontSize: "1.1rem" }}>
                  {daysBetween(counter.start || counter.start_date)} days
                </p>
                <p className="font-cute text-[var(--lg-cocoa)] mt-1" style={{ fontSize: "0.98rem" }}>
                  since {formatLongDate(counter.start || counter.start_date)}
                </p>
                {counter.context && (
                  <p className="font-cute text-[var(--lg-cocoa)]/75 mt-2 line-clamp-2" style={{ fontSize: "0.98rem", lineHeight: 1.3 }}>
                    {counter.context}
                  </p>
                )}
                <p className="mt-2 font-cute text-[var(--lg-cocoa)]/60" style={{ fontSize: "0.9rem" }}>
                  {counter.source === 'account' ? "Saved to your account." : "Saved on this device. Only available in this browser."}
                </p>
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => doRemoveCounter(counter.id, counter.source)}
                    className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
                    style={{ fontSize: "1rem" }}
                  >
                    {pendingCounterDeleteId === counter.id ? (counter.source === 'account' ? "remove from account" : "remove from this device") : (counter.source === 'account' ? "Remove from account" : "Remove from this device")}
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
          ))}
        </div>
        
        {session?.user && counters.length > 0 && (
          <div className="mt-8 pt-8 border-t border-dashed border-[var(--lg-border)]">
             <div className="mb-4">
              <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.1rem" }}>
                You also have local counters on this browser.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {counters.map((counter: any) => (
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
                      {counter.title}
                    </p>
                    <p className="font-cute text-[var(--lg-rose)] mt-1" style={{ fontSize: "1.1rem" }}>
                      {daysBetween(counter.start)} days
                    </p>
                    <p className="font-cute text-[var(--lg-cocoa)] mt-1" style={{ fontSize: "0.98rem" }}>
                      since {formatLongDate(counter.start)}
                    </p>
                    <p className="mt-2 font-cute text-[var(--lg-cocoa)]/60" style={{ fontSize: "0.9rem" }}>
                      Saved on this device.
                    </p>
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => doRemoveCounter(counter.id, 'local')}
                        className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
                        style={{ fontSize: "1rem" }}
                      >
                        Remove from this device
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

      <div className="px-7 py-6 min-h-[280px]">
        <div className="mb-5 rounded-[22px] border border-dashed border-[var(--lg-border)] bg-[var(--lg-cream)]/50 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
            {session?.user ? "You are viewing your account archive." : (authAvailable ? "Accounts are connected, but this archive is still stored only in this browser." : "Saved on this device only. Clearing browser data may remove these. Accounts are not connected yet.")}
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

      <div className="px-7 pt-2 pb-6 flex items-center justify-between gap-4 flex-wrap border-t border-dashed border-[var(--lg-border)]">
        <span
          className="font-cute text-[var(--lg-cocoa)]"
          style={{ fontSize: "1.05rem" }}
        >
          {session?.user ? "Private account archive." : "Private on this device for now."}
        </span>
        <span
          className="font-cute text-[var(--lg-cocoa)]/50"
          style={{ fontSize: "1.1rem" }}
        >
          {session?.user ? "Available when you sign in." : "Only available in this browser."}
        </span>
      </div>
    </DiaryFrame>
  );
}
