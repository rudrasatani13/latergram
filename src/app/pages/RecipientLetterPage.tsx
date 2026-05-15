import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router";
import { motion } from "motion/react";
import { BackgroundPetals } from "../components/BackgroundPetals";
import { Grain } from "../components/Grain";
import { decor } from "../components/BrandAssets";
import {
  openRecipientLetter,
  optOutRecipientEmail,
  reportRecipientLetter,
  type OpenLetterResult,
} from "../db/recipientLetters";

const easeSoft = [0.22, 1, 0.36, 1] as const;
const reportReasons = [
  { value: "unwanted", label: "Unwanted" },
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "privacy", label: "Privacy" },
  { value: "other", label: "Other" },
];

function formatDateTime(iso: string | null) {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function unavailableCopy(reason: Exclude<OpenLetterResult, { status: "available" }>["reason"]) {
  switch (reason) {
    case "invalid":
      return {
        title: "This letter link is not available.",
        note: "The link may be incorrect or expired.",
      };
    case "not_ready":
      return {
        title: "This letter is not ready yet.",
        note: "A Late Letter can only open after it has been sent.",
      };
    case "not_available":
      return {
        title: "This letter is unavailable.",
        note: "It may have been cancelled or could not be sent.",
      };
    default:
      return {
        title: "This letter could not open right now.",
        note: "Latergram could not connect right now. Try again when your connection is available.",
      };
  }
}

export function RecipientLetterPage() {
  const { token = "" } = useParams();
  const [result, setResult] = useState<OpenLetterResult | null>(null);
  const [loadingLetter, setLoadingLetter] = useState(true);
  const [optOutEmail, setOptOutEmail] = useState("");
  const [optOutStatus, setOptOutStatus] = useState("");
  const [optingOut, setOptingOut] = useState(false);
  const [reportReason, setReportReason] = useState("unwanted");
  const [reportDetails, setReportDetails] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [blockSender, setBlockSender] = useState(true);
  const [reporting, setReporting] = useState(false);

  const loadLetter = useCallback(() => {
    setResult(null);
    setLoadingLetter(true);
    openRecipientLetter(token).then((nextResult) => {
      setResult(nextResult);
      setLoadingLetter(false);
    });
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    setResult(null);
    setLoadingLetter(true);
    openRecipientLetter(token).then((nextResult) => {
      if (!cancelled) {
        setResult(nextResult);
        setLoadingLetter(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const submitOptOut = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (optingOut) {
      return;
    }

    setOptOutStatus("");
    setOptingOut(true);
    const { error } = await optOutRecipientEmail(optOutEmail);
    setOptingOut(false);

    if (error) {
      setOptOutStatus(error);
      return;
    }

    setOptOutEmail("");
    setOptOutStatus("Future Late Letters to this email will be blocked.");
  };

  const submitReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (reporting) {
      return;
    }

    setReportStatus("");
    setReporting(true);
    const { error } = await reportRecipientLetter({
      token,
      reason: reportReason,
      details: reportDetails,
      blockSender,
    });
    setReporting(false);

    if (error) {
      setReportStatus(error);
      return;
    }

    setReportDetails("");
    setReportStatus(
      blockSender
        ? "This letter has been reported. Future letters from this sender will be blocked."
        : "This letter has been reported.",
    );
  };

  const unavailable = result?.status === "unavailable" ? unavailableCopy(result.reason) : null;
  const letter = result?.status === "available" ? result.letter : null;
  const openedAt = letter ? formatDateTime(letter.opened_at) : "";
  const sentAt = letter ? formatDateTime(letter.sent_at) : "";

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--lg-cream)]">
      <BackgroundPetals />
      <Grain />

      <main className="relative z-10 px-4 py-8 sm:px-6 md:px-12 md:py-16">
        <motion.section
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: easeSoft }}
          className="max-w-[680px] mx-auto bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl shadow-[0_18px_70px_-42px_rgba(120,80,70,0.55)] overflow-hidden"
        >
          <div className="px-4 sm:px-7 py-5 border-b border-dashed border-[var(--lg-border)] flex items-start justify-between gap-4">
            <div>
              <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.25rem" }}>
                A Late Letter arrived for you.
              </p>
              {sentAt && (
                <p className="mt-1 text-[var(--lg-cocoa)]" style={{ fontSize: "0.92rem" }}>
                  Sent. {sentAt}
                </p>
              )}
            </div>
            <img src={decor.envelopeMini} alt="" aria-hidden="true" className="w-9 h-9 object-contain opacity-85" />
          </div>

          <div className="px-4 sm:px-7 py-7 md:px-9 md:py-10">
            {loadingLetter ? (
              <p className="font-cute text-[var(--lg-cocoa)] animate-pulse" style={{ fontSize: "1.2rem" }}>
                Opening softly...
              </p>
            ) : letter ? (
              <div>
                <h1
                  className="text-[var(--lg-ink)]"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: "clamp(2rem, 6vw, 3.7rem)", lineHeight: 1.05 }}
                >
                  {letter.subject}
                </h1>
                {letter.recipient_name && (
                  <p className="mt-3 font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.25rem" }}>
                    for {letter.recipient_name}
                  </p>
                )}
                <p className="mt-7 whitespace-pre-wrap break-words font-cute text-[var(--lg-ink)]" style={{ fontSize: "1.35rem", lineHeight: "34px" }}>
                  {letter.body}
                </p>
                {openedAt && (
                  <p className="mt-7 font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
                    Opened. {openedAt}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h1
                  className="text-[var(--lg-ink)]"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: "clamp(2rem, 6vw, 3.5rem)", lineHeight: 1.05 }}
                >
                  {unavailable?.title}
                </h1>
                <p className="mt-5 font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.2rem", lineHeight: "30px" }}>
                  {unavailable?.note}
                </p>
                {result?.status === "unavailable" && result.reason === "server_error" && (
                  <button
                    type="button"
                    onClick={loadLetter}
                    className="mt-5 min-h-11 rounded-full border border-[var(--lg-border)] px-5 py-2 font-cute text-[var(--lg-rose)] hover:border-[var(--lg-rose-soft)] transition-colors duration-300"
                    style={{ fontSize: "1rem" }}
                  >
                    Try opening again
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="px-4 sm:px-7 py-6 md:px-9 bg-[var(--lg-cream)] border-t border-dashed border-[var(--lg-rose-soft)] space-y-6">
            {letter && (
              <div className="rounded-2xl border border-dashed border-[var(--lg-border)] bg-[var(--lg-paper)]/70 p-4">
                <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
                  If this feels unwanted, you can report this letter. Reports are reviewed, and future letters from this sender can be blocked.
                </p>
                <form onSubmit={submitReport} className="mt-4 space-y-3">
                  <select
                    value={reportReason}
                    disabled={reporting}
                    onChange={(event) => {
                      setReportReason(event.target.value);
                      setReportStatus("");
                    }}
                    className="min-h-11 w-full bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl px-4 py-3 text-[var(--lg-ink)] focus:outline-none focus:border-[var(--lg-rose)] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ fontSize: "0.95rem" }}
                  >
                    {reportReasons.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={reportDetails}
                    disabled={reporting}
                    onChange={(event) => {
                      setReportDetails(event.target.value);
                      setReportStatus("");
                    }}
                    rows={4}
                    placeholder="Share a little more if you want."
                    className="w-full resize-y min-h-[120px] bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl px-4 py-3 text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/55 focus:outline-none focus:border-[var(--lg-rose)] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
                  />
                  <label className="flex items-start gap-3 text-[var(--lg-cocoa)]" style={{ fontSize: "0.95rem" }}>
                    <input
                      type="checkbox"
                      checked={blockSender}
                      disabled={reporting}
                      onChange={(event) => {
                        setBlockSender(event.target.checked);
                        setReportStatus("");
                      }}
                      className="mt-1 h-5 w-5 accent-[var(--lg-rose)]"
                    />
                    <span>You can opt out of future letters from this sender.</span>
                  </label>
                  <button
                    type="submit"
                    disabled={reporting}
                    className="min-h-11 w-full sm:w-auto inline-flex justify-center bg-[var(--lg-ink)] text-[var(--lg-cream)] py-3 px-5 rounded-full hover:bg-[var(--lg-rose)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-500"
                    style={{ fontSize: "0.78rem", textTransform: "uppercase" }}
                  >
                    {reporting ? "Saving" : "Report this letter"}
                  </button>
                </form>
                {reportStatus && (
                  <p className="mt-3 font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
                    {reportStatus}
                  </p>
                )}
              </div>
            )}

            <div>
              <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
                You can opt out of future letters to this email too.
              </p>
              <form onSubmit={submitOptOut} className="mt-4 flex flex-col sm:flex-row gap-3">
                <input
                  value={optOutEmail}
                  onChange={(event) => {
                    setOptOutEmail(event.target.value);
                    setOptOutStatus("");
                  }}
                  type="email"
                  required
                  disabled={optingOut}
                  placeholder="your email"
                  className="min-h-12 min-w-0 flex-1 bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-full px-4 py-3 text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/55 focus:outline-none focus:border-[var(--lg-rose)] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontSize: "0.95rem" }}
                />
                <button
                  type="submit"
                  disabled={optingOut}
                  className="min-h-12 w-full sm:w-auto inline-flex justify-center bg-[var(--lg-ink)] text-[var(--lg-cream)] py-3 px-5 rounded-full hover:bg-[var(--lg-rose)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-500"
                  style={{ fontSize: "0.78rem", textTransform: "uppercase" }}
                >
                  {optingOut ? "Saving" : "Block all future letters"}
                </button>
              </form>
              {optOutStatus && (
                <p className="mt-3 font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
                  {optOutStatus}
                </p>
              )}
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
