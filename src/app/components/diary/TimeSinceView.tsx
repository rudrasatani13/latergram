import { useMemo, useState, useEffect } from "react";
import { DiaryFrame } from "./DiaryFrame";
import { blooms, decor } from "../BrandAssets";
import { EmptyState } from "../shared/EmptyState";
import { addLocalCounter, createLocalId, readLocalCounters, removeLocalCounter } from "../../storage/localStorage";
import type { LocalCounter } from "../../storage/types";
import { useAuth } from "../../auth/useAuth";
import { useAccountCounters } from "../../db/useAccountCounters";

function daysBetween(iso: string) {
  const d1 = new Date(iso);
  if (Number.isNaN(d1.getTime())) {
    return 0;
  }
  const d2 = new Date();
  const ms = d2.getTime() - d1.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function prettyDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "a saved date";
  }
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function TimeSinceView() {
  const { session } = useAuth();
  const { data: accountCounters, create: createAccountCounter, remove: removeAccountCounter } = useAccountCounters();
  
  const [list, setList] = useState<LocalCounter[]>(() => readLocalCounters());
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", start: "", context: "" });
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const combinedList = useMemo(() => {
    if (session?.user) {
      return accountCounters.map(c => ({
        id: c.id,
        title: c.title,
        start: c.start_date,
        context: c.context,
        source: 'account' as const
      }));
    }
    return list.map(c => ({ ...c, source: 'local' as const }));
  }, [session?.user, accountCounters, list]);

  const featured = useMemo(() => combinedList[0], [combinedList]);
  const featuredDays = featured ? daysBetween(featured.start) : 0;

  const saveCounter = async () => {
    const title = draft.title.trim();

    if (!title || !draft.start) {
      setStatus("Add a title and date first.");
      return;
    }

    if (session?.user) {
      const { error } = await createAccountCounter({
        title,
        start_date: draft.start,
        context: draft.context.trim() || null,
        flower_key: null
      });

      if (error) {
        setStatus("Could not save to your account.");
        return;
      }
      setStatus("Counter saved to your account.");
    } else {
      const now = new Date().toISOString();
      const counter: LocalCounter = {
        id: createLocalId("counter"),
        title,
        start: draft.start,
        context: draft.context.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };

      const result = addLocalCounter(counter);
      if (!result.ok) {
        setStatus("Could not save this counter in this browser.");
        return;
      }
      setList((items) => [counter, ...items]);
      setStatus("Counter saved on this device.");
    }

    setDraft({ title: "", start: "", context: "" });
    setAdding(false);
    setPendingDeleteId(null);
  };

  const removeCounter = async (item: any) => {
    if (pendingDeleteId !== item.id) {
      setPendingDeleteId(item.id);
      setStatus("remove this counter?");
      return;
    }

    if (item.source === 'account') {
      const { success } = await removeAccountCounter(item.id);
      if (!success) {
        setStatus("Could not remove this counter from your account.");
        return;
      }
      setStatus("Counter removed from your account.");
    } else {
      const result = removeLocalCounter(item.id);
      if (!result.ok) {
        setStatus("Could not remove this counter in this browser.");
        return;
      }
      setList((items) => items.filter((i) => i.id !== item.id));
      setStatus("Counter removed from this device.");
    }

    setPendingDeleteId(null);
  };

  return (
    <DiaryFrame
      caption="dear days ✿"
      title={<span className="font-serif-italic text-[var(--lg-rose)]">time since</span>}
    >
      {/* Featured counter */}
      {featured && (
        <div className="relative px-7 pt-7 pb-6 border-b border-dashed border-[var(--lg-border)] text-center">
          <img
            src={blooms.pinkDaisy}
            alt=""
            aria-hidden="true"
            className="absolute -top-3 right-6 w-16 h-16 object-contain rotate-[8deg] opacity-90"
          />
          <p className="font-cute text-[var(--lg-rose)] mb-2" style={{ fontSize: "1.2rem" }}>
            {featured.title}
          </p>
          <div
            className="text-[var(--lg-ink)]"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 300,
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {featuredDays}
            <span
              className="font-serif-italic text-[var(--lg-rose)] ml-3"
              style={{ fontSize: "0.45em" }}
            >
              days
            </span>
          </div>
          <p className="mt-3 font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.15rem" }}>
            {featured.context}
          </p>
          <p
            className="mt-1 text-[var(--lg-rose)]"
            style={{ fontSize: "0.78rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
          >
            since {prettyDate(featured.start)}
          </p>
          <p
            className="mt-2 font-cute text-[var(--lg-cocoa)]/50"
            style={{ fontSize: "0.85rem" }}
          >
            {featured.source === 'account' ? "saved to your account" : "saved on this device only"}
          </p>
          <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => removeCounter(featured)}
              className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
              style={{ fontSize: "1rem" }}
            >
              {pendingDeleteId === featured.id ? "remove this counter?" : (featured.source === 'account' ? "remove from account" : "remove from this device")}
            </button>
            {pendingDeleteId === featured.id && (
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
      )}

      {/* Other counters */}
      <div className="px-7 py-5 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[180px]">
        {combinedList.length === 0 && !adding && (
          <div className="sm:col-span-2">
            <EmptyState
              message={session?.user ? "No counters in your account yet." : "No counters on this device yet."}
              note="Add one to keep time here."
            />
          </div>
        )}

        {combinedList.slice(1).map((c, i) => (
          <div
            key={c.id || `${c.title}-${i}`}
            className="bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-4 flex items-center gap-3 shadow-[0_8px_22px_-16px_rgba(120,80,70,0.4)]"
          >
            <img src={blooms.softPeony} alt="" aria-hidden="true" className="w-10 h-10 object-contain shrink-0" />
            <div className="flex-1 min-w-0">
              <p
                className="text-[var(--lg-ink)] truncate"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "1rem" }}
              >
                {c.title}
              </p>
              <p
                className="font-cute text-[var(--lg-rose)]"
                style={{ fontSize: "1.1rem" }}
              >
                {daysBetween(c.start)} days · since {prettyDate(c.start)}
              </p>
              <button
                type="button"
                onClick={() => removeCounter(c)}
                className="mt-2 font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
                style={{ fontSize: "0.95rem" }}
              >
                {pendingDeleteId === c.id ? "remove this counter?" : (c.source === 'account' ? "remove from account" : "remove from this device")}
              </button>
            </div>
          </div>
        ))}

        {/* Add new */}
        {!adding ? (
          <button
            onClick={() => {
              setAdding(true);
              setPendingDeleteId(null);
              setStatus("");
            }}
            className="bg-[var(--lg-cream)] border border-dashed border-[var(--lg-rose-soft)] rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-[var(--lg-paper)] transition-colors duration-300"
          >
            <img src={decor.timeClockHeart} alt="" aria-hidden="true" className="w-6 h-6 object-contain" />
            <span className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.15rem" }}>
              + add a counter
            </span>
          </button>
        ) : (
          <div className="sm:col-span-2 bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-4 space-y-2">
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="what should this remember?"
              className="w-full bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-1.5 focus:outline-none focus:border-[var(--lg-rose)] font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45"
              style={{ fontSize: "1.2rem" }}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <input
                value={draft.start}
                onChange={(e) => setDraft({ ...draft, start: e.target.value })}
                type="date"
                className="bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-1.5 focus:outline-none focus:border-[var(--lg-rose)] text-[var(--lg-ink)]"
                style={{ fontSize: "0.95rem" }}
              />
              <input
                value={draft.context}
                onChange={(e) => setDraft({ ...draft, context: e.target.value })}
                placeholder="a small note…"
                className="flex-1 bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-1.5 focus:outline-none focus:border-[var(--lg-rose)] font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45"
                style={{ fontSize: "1.1rem" }}
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => {
                  setAdding(false);
                  setStatus("");
                }}
                className="font-cute text-[var(--lg-cocoa)]"
                style={{ fontSize: "1rem" }}
              >
                cancel
              </button>
              <button
                onClick={saveCounter}
                className="bg-[var(--lg-rose)] text-white px-4 py-1.5 rounded-full"
                style={{ fontSize: "0.85rem", fontWeight: 600 }}
              >
                save counter
              </button>
            </div>
          </div>
        )}
      </div>

      {status && (
        <p
          className="px-7 pb-4 text-center font-cute text-[var(--lg-cocoa)]"
          style={{ fontSize: "1rem" }}
        >
          {status}
        </p>
      )}

      <div className="px-7 pt-2 pb-6 flex items-center justify-between border-t border-dashed border-[var(--lg-border)]">
        <span className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.05rem" }}>
          {session?.user ? "Saved to your account." : "Saved on this device only."}
        </span>
        <img src={decor.timeClockHeart} alt="" aria-hidden="true" className="w-7 h-7 object-contain opacity-80" />
      </div>
    </DiaryFrame>
  );
}
