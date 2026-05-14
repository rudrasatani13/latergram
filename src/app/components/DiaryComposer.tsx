import { useRef, useState } from "react";
import { motion } from "motion/react";
import { decor } from "./BrandAssets";
import { FeatureUnavailableNote } from "./shared/FeatureUnavailableNote";

const easeSoft = [0.22, 1, 0.36, 1] as const;

type DestinationId = "private" | "later" | "garden" | "memory";

interface DiaryComposerProps {
  active: string;
  onViewSection?: (section: DestinationId) => void;
}

const titles: Record<string, string> = {
  write: "write a Lategram",
  private: "keep it private",
  garden: "plant in the Garden",
  later: "send it later",
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
    guidance: "Saving is not connected yet. Copy before leaving.",
    viewLabel: "view Keep Private space",
  },
  {
    id: "later",
    label: "late letter",
    guidance: "Delivery is not connected yet. You can shape the letter here.",
    viewLabel: "view Letter space",
  },
  {
    id: "garden",
    label: "garden",
    guidance: "The Garden is closed for now. You can still write what you would plant.",
    viewLabel: "view Garden space",
  },
  {
    id: "memory",
    label: "memory card",
    guidance: "Cards need saved memories first. You can still shape the words.",
    viewLabel: "view Card space",
  },
];

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function DiaryComposer({ active, onViewSection }: DiaryComposerProps) {
  const [text, setText] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [destination, setDestination] = useState<DestinationId>("private");
  const [note, setNote] = useState("");
  const [copyFailed, setCopyFailed] = useState(false);
  const [clearNeedsConfirm, setClearNeedsConfirm] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedDestination = destinations.find((item) => item.id === destination) ?? destinations[0];
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const markEdited = () => {
    setHasEdited(true);
    setClearNeedsConfirm(false);
    setCopyFailed(false);
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
      setNote("Copied. Your words are still not saved here.");
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
    setHasEdited(false);
    setClearNeedsConfirm(false);
    setCopyFailed(false);
    setNote("Cleared. The page is empty now.");
  };

  const continueShaping = () => {
    setClearNeedsConfirm(false);
    setCopyFailed(false);
    setNote("Keep shaping. Copy before leaving.");
    textareaRef.current?.focus();
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
        className="text-center text-[var(--lg-ink)] mb-8"
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
        className="relative rounded-[28px] p-6 md:p-8"
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
          className="pointer-events-none absolute -top-6 left-8 w-14 h-14 object-contain rotate-[-8deg]"
        />
        {/* Wax seal */}
        <img
          src={decor.heartWaxSeal}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-5 -right-3 w-14 h-14 object-contain rotate-[10deg]"
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
          <div className="flex items-center justify-between px-7 pt-6 pb-3 border-b border-dashed border-[var(--lg-border)]">
            <div className="flex items-center gap-2">
              <span
                className="font-cute text-[var(--lg-rose)]"
                style={{ fontSize: "1.15rem" }}
              >
                {today}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  markEdited();
                }}
                placeholder="to: someone, or me"
                aria-label="recipient"
                className="bg-transparent border-0 text-right text-[var(--lg-cocoa)] placeholder:text-[var(--lg-cocoa)]/40 focus:outline-none font-cute"
                style={{ fontSize: "1.15rem", width: "12rem" }}
              />
              <img
                src={decor.softHeart}
                alt=""
                aria-hidden="true"
                className="w-5 h-5 object-contain"
              />
            </div>
          </div>

          <div className="px-7 py-3 border-b border-dashed border-[var(--lg-border)] flex items-center gap-3">
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
              className="flex-1 min-w-0 bg-transparent border-0 text-[var(--lg-cocoa)] placeholder:text-[var(--lg-cocoa)]/40 focus:outline-none font-cute"
              style={{ fontSize: "1.05rem" }}
            />
          </div>

          {/* Red margin + ruled lines + textarea */}
          <div className="relative">
            {/* Pink left margin line */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-12 top-0 bottom-0 w-px"
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
              className="relative w-full bg-transparent border-0 focus:outline-none resize-none text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45"
              style={{
                fontFamily: "'Caveat', 'Segoe Print', cursive",
                fontSize: "1.55rem",
                lineHeight: "34px",
                paddingLeft: "4.2rem",
                paddingRight: "1.75rem",
                paddingTop: "10px",
                paddingBottom: "20px",
              }}
            />
          </div>

          {/* Footer */}
          <div className="px-7 pt-2 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 border-t border-dashed border-[var(--lg-border)]">
            <span
              className="font-cute text-[var(--lg-cocoa)]"
              style={{ fontSize: "1.05rem" }}
            >
              with love, <span className="text-[var(--lg-rose)]">not saved yet</span>
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

        <div className="mt-5 rounded-[22px] border border-dashed border-[var(--lg-border)] bg-[var(--lg-cream)]/45 px-5 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.08rem" }}>
              choose where this might belong
            </p>
            <p className="font-cute text-[var(--lg-cocoa)]/70" style={{ fontSize: "0.98rem" }}>
              written here only while this page stays open
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
                  className={`rounded-full border px-4 py-2 font-cute transition-colors duration-500 ${
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
              {selectedDestination.guidance}
            </p>
            {onViewSection && (
              <button
                type="button"
                onClick={() => onViewSection(selectedDestination.id)}
                className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
                style={{ fontSize: "1.02rem" }}
              >
                {selectedDestination.viewLabel} →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
        <button
          onClick={copyWords}
          className="group inline-flex items-center gap-3 bg-[var(--lg-ink)] text-[var(--lg-cream)] py-4 px-7 rounded-full hover:bg-[var(--lg-rose)] transition-colors duration-700"
        >
          <span
            style={{
              fontSize: "0.78rem",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
            }}
          >
            Copy words
          </span>
          <span className="block w-6 h-px bg-[var(--lg-cream)] transition-all duration-500 group-hover:w-10" />
        </button>
        <button
          onClick={clearPage}
          className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
          style={{ fontSize: "1.2rem" }}
        >
          {clearNeedsConfirm ? "yes, clear page" : "clear page"}
        </button>
        <button
          onClick={continueShaping}
          className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
          style={{ fontSize: "1.2rem" }}
        >
          continue shaping
        </button>
      </div>

      <FeatureUnavailableNote
        message={note || "Your words are only here while this page stays open. Copy before leaving."}
        visible={Boolean(note) || hasEdited}
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
