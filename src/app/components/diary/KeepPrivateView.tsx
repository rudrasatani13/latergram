import { useState } from "react";
import { motion } from "motion/react";
import { DiaryFrame } from "./DiaryFrame";
import { blooms } from "../BrandAssets";
import { EmptyState } from "../shared/EmptyState";
import { readLocalCounters, readLocalLategrams, removeLocalLategram } from "../../storage/localStorage";
import type { LocalCounter, LocalLategram } from "../../storage/types";

const tabs = [
  { id: "lategrams", label: "My Lategrams" },
  { id: "letters", label: "Late Letters" },
  { id: "time", label: "Time Since" },
  { id: "cards", label: "Saved Cards" },
  { id: "received", label: "Received" },
] as const;

type KeepPrivateTab = (typeof tabs)[number]["id"];

function formatSavedDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "saved locally";
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toLowerCase();
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

function lategramTitle(lategram: LocalLategram) {
  if (lategram.subject) {
    return lategram.subject;
  }

  if (lategram.to) {
    return `to ${lategram.to}`;
  }

  return "Saved Lategram";
}

export function KeepPrivateView() {
  const [tab, setTab] = useState<KeepPrivateTab>("lategrams");
  const [lategrams, setLategrams] = useState<LocalLategram[]>(() => readLocalLategrams());
  const [counters] = useState<LocalCounter[]>(() => readLocalCounters());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const copyLategram = async (lategram: LocalLategram) => {
    try {
      await navigator.clipboard.writeText(lategram.body);
      setStatus("Copied from this device.");
    } catch {
      setStatus("Copy did not work in this browser.");
    }
  };

  const removeLategram = (lategram: LocalLategram) => {
    if (pendingDeleteId !== lategram.id) {
      setPendingDeleteId(lategram.id);
      setStatus("remove this saved Lategram?");
      return;
    }

    const result = removeLocalLategram(lategram.id);

    if (!result.ok) {
      setStatus("Could not remove this saved Lategram in this browser.");
      return;
    }

    setLategrams((items) => items.filter((item) => item.id !== lategram.id));
    setPendingDeleteId(null);
    setStatus("Removed from this device.");
  };

  const selectTab = (nextTab: KeepPrivateTab) => {
    setTab(nextTab);
    setPendingDeleteId(null);
    setStatus("");
  };

  const renderLategrams = () => {
    if (lategrams.length === 0) {
      return (
        <EmptyState
          message="No saved Lategrams on this device yet."
          note="Write and save one first."
        />
      );
    }

    return (
      <>
        <p
          className="font-cute text-[var(--lg-cocoa)]/60 text-center mb-4"
          style={{ fontSize: "0.9rem" }}
        >
          Saved on this device only.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lategrams.map((lategram) => (
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
                    {lategram.body}
                  </p>
                  <p
                    className="text-[var(--lg-rose)] mt-2"
                    style={{ fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
                  >
                    {formatSavedDate(lategram.updatedAt)} · {lategram.wordCount} words
                  </p>
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => copyLategram(lategram)}
                      className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
                      style={{ fontSize: "1rem" }}
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLategram(lategram)}
                      className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
                      style={{ fontSize: "1rem" }}
                    >
                      {pendingDeleteId === lategram.id ? "remove this saved Lategram?" : "remove from this device"}
                    </button>
                    {pendingDeleteId === lategram.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setPendingDeleteId(null);
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
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderCounters = () => {
    if (counters.length === 0) {
      return (
        <EmptyState
          message="No counters on this device yet."
          note="Add one in Time Since first."
        />
      );
    }

    return (
      <>
        <p
          className="font-cute text-[var(--lg-cocoa)]/60 text-center mb-4"
          style={{ fontSize: "0.9rem" }}
        >
          saved on this device only
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {counters.map((counter) => (
            <div
              key={counter.id}
              className="bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-4 flex items-center gap-3 shadow-[0_8px_22px_-16px_rgba(120,80,70,0.4)]"
            >
              <img src={blooms.pinkDaisy} alt="" aria-hidden="true" className="w-10 h-10 object-contain shrink-0" />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[var(--lg-ink)] truncate"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "1rem" }}
                >
                  {counter.title}
                </p>
                <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.1rem" }}>
                  {daysBetween(counter.start)} days
                </p>
              </div>
            </div>
          ))}
        </div>
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
          note="Memory Cards are not connected yet."
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
      <div className="px-7 pt-2 pb-6 flex items-center justify-between border-t border-dashed border-[var(--lg-border)]">
        <span
          className="font-cute text-[var(--lg-cocoa)]"
          style={{ fontSize: "1.05rem" }}
        >
          Saved on this device only. Clearing browser data may remove it.
        </span>
        <span
          className="font-cute text-[var(--lg-cocoa)]/50"
          style={{ fontSize: "1.1rem" }}
        >
          Only available here for now.
        </span>
      </div>
    </DiaryFrame>
  );
}
