import { useRef, useState } from "react";
import { motion } from "motion/react";
import { decor } from "./BrandAssets";
import { FeatureUnavailableNote } from "./shared/FeatureUnavailableNote";
import {
  addLocalLategram,
  createLocalId,
  deleteLocalDraft,
  readLocalDraft,
  writeLocalDraft,
} from "../storage/localStorage";
import type { LocalDestination, LocalDraft, LocalLategram } from "../storage/types";
import { useAuth } from "../auth/useAuth";
import { useAccountLategrams } from "../db/useAccountLategrams";

const easeSoft = [0.22, 1, 0.36, 1] as const;

type DestinationId = LocalDestination;

interface DiaryComposerProps {
  active: string;
  onViewSection?: (section: DestinationId) => void;
}

const titles: Record<string, string> = {
  write: "write a Lategram",
  private: "keep it private",
  garden: "write for the Garden",
  later: "shape a late letter",
  time: "mark a Time Since",
  memory: "make a Memory Card",
};

const destinations: Array<{
  id: DestinationId;
  label: string;
  guidance: string;
  viewLabel: string;
}> = [
  {
    id: "private",
    label: "keep private",
    guidance: "Save privately on this device before leaving.",
    viewLabel: "view Keep Private space",
  },
  {
    id: "later",
    label: "late letter",
    guidance: "Use Late Letters to schedule delivery. Save locally or copy before leaving.",
    viewLabel: "view Letter space",
  },
  {
    id: "garden",
    label: "garden",
    guidance: "The Garden is closed for now. You can still write what might belong there.",
    viewLabel: "view Garden space",
  },
  {
    id: "memory",
    label: "memory card",
    guidance: "Cards need saved memories first. Save locally or copy before leaving.",
    viewLabel: "view Card space",
  },
];

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function DiaryComposer({ active, onViewSection }: DiaryComposerProps) {
  const { session } = useAuth();
  const { create: createAccountLategram } = useAccountLategrams();
  const [text, setText] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [destination, setDestination] = useState<DestinationId>("private");
  const [note, setNote] = useState("");
  const [saveState, setSaveState] = useState("not saved yet");
  const [storedDraft, setStoredDraft] = useState<LocalDraft | null>(() => readLocalDraft());
  const [copyFailed, setCopyFailed] = useState(false);
  const [clearNeedsConfirm, setClearNeedsConfirm] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedDestination = destinations.find((item) => item.id === destination) ?? destinations[0];
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characterCount = text.trim().length;

  const getDestinationGuidance = (id: LocalDestination) => {
    if (session?.user) {
      if (id === "private") return "Save privately to your account, or keep a device copy.";
      if (id === "later") return "Use Late Letters to schedule delivery. Save privately to your account for now.";
      if (id === "garden") return "The Garden is closed for now. Save privately to your account for now.";
      if (id === "memory") return "Export is not connected yet. Save privately to your account for now.";
    }
    
    // Default/Signed-out guidance
    const d = destinations.find(dest => dest.id === id);
    return d?.guidance || "";
  };

  const markEdited = () => {
    setHasEdited(true);
    setClearNeedsConfirm(false);
    setCopyFailed(false);
    setSaveState("not saved yet");
    setNote("");
  };

  const buildCopyText = () => {
    const lines: string[] = [];

    if (to.trim()) {
      lines.push(`to: ${to.trim()}`);
    }

    if (subject.trim()) {
      lines.push(`about: ${subject.trim()}`);
    }

    lines.push(`might belong: ${selectedDestination.label}`);
    lines.push("");
    lines.push(text.trim());

    return lines.join("\n");
  };

  const copyWords = async () => {
    setClearNeedsConfirm(false);

    if (!text.trim()) {
      setCopyFailed(false);
      setNote("Write a few words first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(buildCopyText());
      setCopyFailed(false);
      setNote("Copied. Save on this device if you want these words to stay here.");
    } catch {
      setCopyFailed(true);
      setNote("Copy did not work in this browser. Select the words and copy them manually.");
    }
  };

  const clearPage = () => {
    const hasContent = text.trim() || to.trim() || subject.trim();

    if (!hasContent) {
      setCopyFailed(false);
      setNote("The page is already clear.");
      return;
    }

    if (!clearNeedsConfirm) {
      setCopyFailed(false);
      setClearNeedsConfirm(true);
      setNote("Clear these words?");
      return;
    }

    setText("");
    setTo("");
    setSubject("");
    setDestination("private");
    setSaveState("not saved yet");
    setHasEdited(false);
    setClearNeedsConfirm(false);
    setCopyFailed(false);
    setNote("Cleared. The page is empty now.");
  };

  const continueShaping = () => {
    setClearNeedsConfirm(false);
    setCopyFailed(false);
    setNote("Keep shaping. Save on this device or save a draft before leaving.");
    textareaRef.current?.focus();
  };

  const buildLocalLategram = (): LocalLategram | null => {
    const body = text.trim();

    if (!body) {
      return null;
    }

    const now = new Date().toISOString();

    return {
      id: createLocalId("lategram"),
      body,
      to: to.trim() || undefined,
      subject: subject.trim() || undefined,
      destination,
      createdAt: now,
      updatedAt: now,
      wordCount,
      characterCount,
    };
  };

  const saveOnDevice = () => {
    setClearNeedsConfirm(false);
    setCopyFailed(false);

    const lategram = buildLocalLategram();

    if (!lategram) {
      setNote("Write a few words first.");
      return;
    }

    const result = addLocalLategram(lategram);

    if (!result.ok) {
      setNote("Could not save in this browser. Copy your words before leaving.");
      return;
    }

    setSaveState("saved on this device");
    setHasEdited(false);
    setNote("Saved on this device.");
  };

  const saveToAccount = async () => {
    setClearNeedsConfirm(false);
    setCopyFailed(false);

    if (!text.trim()) {
      setNote("Write a few words first.");
      return;
    }

    setSaveState("saving...");
    const { error } = await createAccountLategram({
      body: text.trim(),
      recipient_label: to.trim() || null,
      subject: subject.trim() || null,
      destination: destination,
      mood: null,
      flower_key: null,
    });

    if (error) {
      setSaveState("not saved yet");
      setNote("Could not save to your account. Your words are still on this page.");
      return;
    }

    setSaveState("saved to your account");
    setHasEdited(false);
    
    const noteText = destination === "private" 
      ? "Saved to your account as private writing."
      : destination === "later"
      ? "Written as a future letter, saved privately to your account. Use Late Letters to schedule delivery."
      : destination === "garden"
      ? "Written for the Garden, saved privately to your account."
      : "Written for a memory card, saved privately to your account. Export is not connected yet.";
      
    setNote(noteText);
  };

  const saveDraft = () => {
    setClearNeedsConfirm(false);
    setCopyFailed(false);

    if (!text.trim()) {
      setNote("Write a few words first.");
      return;
    }

    const draft: LocalDraft = {
      body: text,
      to: to.trim() || undefined,
      subject: subject.trim() || undefined,
      destination,
      updatedAt: new Date().toISOString(),
    };

    const result = writeLocalDraft(draft);

    if (!result.ok) {
      setNote("Could not save a draft in this browser. Copy your words before leaving.");
      return;
    }

    setStoredDraft(draft);
    setSaveState("draft saved on this device");
    setHasEdited(false);
    setNote("Draft saved on this device.");
  };

  const restoreDraft = () => {
    if (!storedDraft) {
      return;
    }

    setText(storedDraft.body);
    setTo(storedDraft.to ?? "");
    setSubject(storedDraft.subject ?? "");
    setDestination(storedDraft.destination);
    setSaveState("draft restored from this device");
    setHasEdited(true);
    setClearNeedsConfirm(false);
    setCopyFailed(false);
    setNote("Draft restored. Only available in this browser.");
    textareaRef.current?.focus();
  };

  const clearDraft = () => {
    const result = deleteLocalDraft();

    if (!result.ok) {
      setNote("Could not clear draft in this browser.");
      return;
    }

    setStoredDraft(null);
    setClearNeedsConfirm(false);
    setCopyFailed(false);
    setNote("Draft cleared from this device.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: easeSoft }}
      className="max-w-[820px] mx-auto"
    >
      <p
        className="text-center font-cute text-[var(--lg-rose)] mb-3"
        style={{ fontSize: "1.3rem" }}
      >
        dear diary ✿
      </p>
      <h2
        className="text-center text-[var(--lg-ink)] mb-6 sm:mb-8"
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 300,
          fontSize: "clamp(1.7rem, 3vw, 2.2rem)",
          letterSpacing: "-0.02em",
        }}
      >
        <span className="font-serif-italic text-[var(--lg-rose)]">{titles[active]}</span>
      </h2>

      {/* Diary book */}
      <div
        className="relative rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 md:p-8"
        style={{
          background:
            "linear-gradient(180deg, var(--lg-blush) 0%, var(--lg-paper) 60%, var(--lg-linen) 100%)",
          boxShadow:
            "0 30px 70px -30px rgba(120,80,70,0.35), inset 0 0 0 1px rgba(234,213,196,0.6)",
        }}
      >
        {/* Top ribbon bookmark */}
        <img
          src={decor.pinkRibbonBow}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-5 left-5 sm:-top-6 sm:left-8 w-12 h-12 sm:w-14 sm:h-14 object-contain rotate-[-8deg]"
        />
        {/* Wax seal */}
        <img
          src={decor.heartWaxSeal}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 -right-2 sm:-top-5 sm:-right-3 w-12 h-12 sm:w-14 sm:h-14 object-contain rotate-[10deg]"
        />

        {/* Inner paper */}
        <div
          className="relative rounded-[22px] overflow-hidden"
          style={{
            background: "var(--lg-cream)",
            boxShadow: "inset 0 0 0 1px rgba(234,213,196,0.7)",
          }}
        >
          {/* Header strip */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-7 pt-6 pb-3 border-b border-dashed border-[var(--lg-border)]">
            <div className="flex items-center gap-2">
              <span
                className="font-cute text-[var(--lg-rose)]"
                style={{ fontSize: "1.15rem" }}
              >
                {today}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <input
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  markEdited();
                }}
                placeholder="to: someone, or me"
                aria-label="recipient"
                className="min-h-11 w-full sm:w-48 bg-transparent border-0 text-left sm:text-right text-[var(--lg-cocoa)] placeholder:text-[var(--lg-cocoa)]/40 focus:outline-none font-cute"
                style={{ fontSize: "1.15rem" }}
              />
              <img
                src={decor.softHeart}
                alt=""
                aria-hidden="true"
                className="w-5 h-5 object-contain"
              />
            </div>
          </div>

          <div className="px-4 sm:px-7 py-3 border-b border-dashed border-[var(--lg-border)] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
              about:
            </span>
            <input
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                markEdited();
              }}
              placeholder="a title, if it helps"
              aria-label="title or subject"
                className="min-h-11 flex-1 min-w-0 bg-transparent border-0 text-[var(--lg-cocoa)] placeholder:text-[var(--lg-cocoa)]/40 focus:outline-none font-cute"
              style={{ fontSize: "1.05rem" }}
            />
          </div>

          {/* Red margin + ruled lines + textarea */}
          <div className="relative">
            {/* Pink left margin line */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-6 sm:left-12 top-0 bottom-0 w-px"
              style={{ background: "var(--lg-rose-soft)" }}
            />
            {/* Ruled lines */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(transparent 0, transparent 33px, var(--lg-border) 33px, var(--lg-border) 34px)",
                backgroundPosition: "0 36px",
              }}
            />

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                markEdited();
              }}
              placeholder={`dear ${to || "you"},\nstart with the feeling, not the form…`}
              rows={12}
              className="relative min-h-[360px] w-full bg-transparent border-0 focus:outline-none resize-y text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45 pl-10 pr-4 pt-3 pb-6 sm:pl-[4.2rem] sm:pr-7"
              style={{
                fontFamily: "'Caveat', 'Segoe Print', cursive",
                fontSize: "1.55rem",
                lineHeight: "34px",
              }}
            />
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-7 pt-2 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 border-t border-dashed border-[var(--lg-border)]">
            <span
              className="font-cute text-[var(--lg-cocoa)]"
              style={{ fontSize: "1.05rem" }}
            >
              with love, <span className="text-[var(--lg-rose)]">{saveState}</span>
            </span>
            <div className="flex items-center gap-2 sm:justify-end">
              <span
                className="font-cute text-[var(--lg-rose)]"
                style={{ fontSize: "1.15rem" }}
              >
                {wordCount} words · {text.length}/∞
              </span>
              <img
                src={decor.pastelStarSparkles}
                alt=""
                aria-hidden="true"
                className="w-5 h-5 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Bottom decor */}
        <div className="mt-6 flex items-center justify-center gap-4 opacity-80">
          <img src={decor.envelopeMini} alt="" aria-hidden="true" className="w-7 h-7 object-contain" />
          <span
            className="font-cute text-[var(--lg-rose)]"
            style={{ fontSize: "1.15rem" }}
          >
            sealed softly ✿
          </span>
          <img
            src={decor.foldedLetterHeart}
            alt=""
            aria-hidden="true"
            className="w-7 h-7 object-contain"
          />
        </div>

        <div className="mt-5 rounded-[22px] border border-dashed border-[var(--lg-border)] bg-[var(--lg-cream)]/45 px-4 sm:px-5 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.08rem" }}>
              choose where this might belong
            </p>
            <p className="font-cute text-[var(--lg-cocoa)]/70" style={{ fontSize: "0.98rem" }}>
              {session?.user ? "save to your account, or keep a device copy" : "stored only in this browser when you save"}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {destinations.map((item) => {
              const isSelected = destination === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setDestination(item.id);
                    markEdited();
                    setNote(item.guidance);
                  }}
                  aria-pressed={isSelected}
                  className={`min-h-11 rounded-full border px-4 py-2 font-cute transition-colors duration-500 ${
                    isSelected
                      ? "border-[var(--lg-rose)] bg-[var(--lg-blush)] text-[var(--lg-ink)]"
                      : "border-[var(--lg-border)] bg-[var(--lg-paper)]/70 text-[var(--lg-cocoa)] hover:border-[var(--lg-rose-soft)] hover:text-[var(--lg-ink)]"
                  }`}
                  style={{ fontSize: "1.02rem" }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
            <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
              {getDestinationGuidance(destination)}
            </p>
            {onViewSection && (
              <button
                type="button"
                onClick={() => onViewSection(selectedDestination.id)}
                className="min-h-11 inline-flex items-center font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
                style={{ fontSize: "1.02rem" }}
              >
                {selectedDestination.viewLabel} →
              </button>
            )}
          </div>
        </div>
        {storedDraft && (
          <div className="mt-5 rounded-[22px] border border-dashed border-[var(--lg-border)] bg-[var(--lg-paper)]/55 px-4 sm:px-5 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.08rem" }}>
                  Draft found on this device.
                </p>
                <p className="font-cute text-[var(--lg-cocoa)]/70 mt-1" style={{ fontSize: "0.98rem" }}>
                  Only available in this browser.
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={restoreDraft}
                  className="min-h-11 inline-flex items-center font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
                  style={{ fontSize: "1.05rem" }}
                >
                  Restore draft
                </button>
                <button
                  type="button"
                  onClick={clearDraft}
                  className="min-h-11 inline-flex items-center font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
                  style={{ fontSize: "1.05rem" }}
                >
                  Clear draft
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="sticky bottom-[calc(4.9rem+env(safe-area-inset-bottom))] z-20 mt-8 flex items-center justify-center gap-3 rounded-[24px] border border-[var(--lg-border)] bg-[var(--lg-cream)]/92 p-3 shadow-[0_16px_34px_-26px_rgba(92,61,48,0.45)] backdrop-blur sm:static sm:gap-6 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none flex-wrap">
        {session?.user ? (
          <>
            <button
              type="button"
              onClick={saveToAccount}
              className="group min-h-12 w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[var(--lg-ink)] text-[var(--lg-cream)] py-4 px-7 rounded-full hover:bg-[var(--lg-rose)] transition-colors duration-700"
            >
              <span
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                }}
              >
                Save to account
              </span>
              <span className="block w-6 h-px bg-[var(--lg-cream)] transition-all duration-500 group-hover:w-10" />
            </button>
            <button
              type="button"
              onClick={saveOnDevice}
              className="min-h-11 inline-flex items-center justify-center font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
              style={{ fontSize: "1.2rem" }}
            >
              Save on this device
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={saveOnDevice}
            className="group min-h-12 w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[var(--lg-ink)] text-[var(--lg-cream)] py-4 px-7 rounded-full hover:bg-[var(--lg-rose)] transition-colors duration-700"
          >
            <span
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
              }}
            >
              Save on this device
            </span>
            <span className="block w-6 h-px bg-[var(--lg-cream)] transition-all duration-500 group-hover:w-10" />
          </button>
        )}
        <button
          type="button"
          onClick={copyWords}
          className="min-h-11 inline-flex items-center justify-center font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
          style={{ fontSize: "1.2rem" }}
        >
          Copy words
        </button>
        <button
          type="button"
          onClick={saveDraft}
          className="min-h-11 inline-flex items-center justify-center font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
          style={{ fontSize: "1.2rem" }}
        >
          Save draft
        </button>
        <button
          type="button"
          onClick={clearPage}
          className="min-h-11 inline-flex items-center justify-center font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
          style={{ fontSize: "1.2rem" }}
        >
          {clearNeedsConfirm ? "yes, clear page" : "clear page"}
        </button>
        <button
          type="button"
          onClick={continueShaping}
          className="min-h-11 inline-flex items-center justify-center font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
          style={{ fontSize: "1.2rem" }}
        >
          continue shaping
        </button>
      </div>

      <FeatureUnavailableNote
        message={note || (session?.user ? "Save to your account, or keep saving on this device." : "Sign in to save to your account, or keep saving on this device. Clearing browser data may remove saved items.")}
        visible={Boolean(note) || hasEdited || !session?.user}
      />
      {copyFailed && (
        <p
          className="mt-3 text-center font-cute text-[var(--lg-rose)]"
          style={{ fontSize: "1rem" }}
        >
          The writing is still on the page. Copy it manually if you need it.
        </p>
      )}
    </motion.div>
  );
}
