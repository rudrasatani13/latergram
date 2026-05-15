import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { DiaryFrame } from "./DiaryFrame";
import { decor } from "../BrandAssets";
import { EmptyState } from "../shared/EmptyState";
import { useAuth } from "../../auth/useAuth";
import { useLateLetters } from "../../db/useLateLetters";
import type { LateLetterRecord } from "../../db/lateLetters";
import { isValidLookingEmail } from "../../utils/emailMasking";

interface ComposeDraft {
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  date: string;
  time: string;
}

type ComposeErrors = Partial<Record<keyof ComposeDraft | "scheduledFor", string>>;

const emptyDraft: ComposeDraft = {
  recipientName: "",
  recipientEmail: "",
  subject: "",
  body: "",
  date: "",
  time: "",
};

const senderReportReasons = [
  { value: "delivery_issue", label: "Delivery issue" },
  { value: "unwanted_delivery", label: "Unwanted delivery" },
  { value: "privacy", label: "Privacy" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
];

function buildScheduledDate(dateValue: string, timeValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);

  if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  const scheduledAt = new Date(year, month - 1, day, hours, minutes);

  if (
    Number.isNaN(scheduledAt.getTime()) ||
    scheduledAt.getFullYear() !== year ||
    scheduledAt.getMonth() !== month - 1 ||
    scheduledAt.getDate() !== day ||
    scheduledAt.getHours() !== hours ||
    scheduledAt.getMinutes() !== minutes
  ) {
    return null;
  }

  return scheduledAt;
}

function formatDateTime(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "a saved time";
  }

  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "saved";
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toLowerCase();
}

function excerpt(value: string, maxLength = 130) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

function letterTitle(letter: LateLetterRecord) {
  if (letter.subject?.trim()) {
    return letter.subject;
  }

  if (letter.recipient_name?.trim()) {
    return `to ${letter.recipient_name}`;
  }

  return "Scheduled Late Letter";
}

function statusLabel(status: LateLetterRecord["status"]) {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "sending":
      return "Sending...";
    case "sent":
      return "Sent";
    case "opened":
      return "Opened";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}

function statusNote(letter: LateLetterRecord) {
  switch (letter.status) {
    case "scheduled":
      return "Cancel before it is sent.";
    case "cancelled":
      return "Cancelled.";
    case "draft":
      return "Draft.";
    case "failed":
      return safeFailureNote(letter.failure_reason);
    case "sending":
      return "Sending...";
    case "sent":
      return "This letter was sent.";
    case "opened":
      return "This letter was opened.";
    default:
      return "Stored in your account.";
  }
}

function safeFailureNote(reason: string | null) {
  const safeReasons = new Set([
    "Recipient opted out.",
    "Recipient blocked future letters from this sender.",
    "Recipient email bounced.",
    "Recipient email could not be used.",
    "Delivery safety check failed.",
    "Delivery provider rejected the sender address.",
    "Delivery provider rejected the email request.",
    "Delivery provider rate limit or quota stopped this send.",
    "Delivery provider had a temporary failure.",
    "Delivery provider could not send this letter.",
    "Delivery provider reported a send failure.",
  ]);

  return reason && safeReasons.has(reason) ? reason : "Delivery failed.";
}

function canCancel(status: LateLetterRecord["status"]) {
  return status === "scheduled" || status === "draft";
}

export function LateLettersView() {
  const { authAvailable, loading: authLoading, session } = useAuth();
  const {
    data: letters,
    loading: lettersLoading,
    error: lettersError,
    refresh,
    create,
    cancel,
    report,
  } = useLateLetters();
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState<ComposeDraft>(emptyDraft);
  const [fieldErrors, setFieldErrors] = useState<ComposeErrors>({});
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("delivery_issue");
  const [reportDetails, setReportDetails] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const selectedLetter = useMemo(
    () => letters.find((letter) => letter.id === selectedLetterId) || null,
    [letters, selectedLetterId],
  );

  const validateDraft = () => {
    const errors: ComposeErrors = {};
    const recipientEmail = draft.recipientEmail.trim();
    const body = draft.body.trim();

    if (!recipientEmail) {
      errors.recipientEmail = "Enter a recipient email.";
    } else if (!isValidLookingEmail(recipientEmail)) {
      errors.recipientEmail = "Enter a valid-looking recipient email.";
    }

    if (!body) {
      errors.body = "Write the letter before saving.";
    }

    if (!draft.date || !draft.time) {
      errors.scheduledFor = "Pick a future date and time.";
    }

    const scheduledAt = draft.date && draft.time ? buildScheduledDate(draft.date, draft.time) : null;

    if (!errors.scheduledFor && !scheduledAt) {
      errors.scheduledFor = "Enter a real date and time.";
    }

    if (!errors.scheduledFor && scheduledAt && scheduledAt.getTime() <= Date.now()) {
      errors.scheduledFor = "Pick a future date and time.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0 ? scheduledAt : null;
  };

  const updateDraft = (key: keyof ComposeDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined, scheduledFor: key === "date" || key === "time" ? undefined : current.scheduledFor }));
    setStatus("");
  };

  const saveLetter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const scheduledAt = validateDraft();

    if (!scheduledAt) {
      return;
    }

    setSaving(true);
    setStatus("Saving this Late Letter...");
    const { data: savedLetter, error } = await create({
      body: draft.body.trim(),
      recipient_name: draft.recipientName.trim() || null,
      recipient_email: draft.recipientEmail.trim(),
      subject: draft.subject.trim() || null,
      scheduled_for: scheduledAt.toISOString(),
    });
    setSaving(false);

    if (error || !savedLetter) {
      setStatus(error || "Could not save this Late Letter. Your words are still here.");
      return;
    }

    setDraft(emptyDraft);
    setFieldErrors({});
    setComposing(false);
    setSelectedLetterId(savedLetter.id);
    setPendingCancelId(null);
    setStatus("Scheduled. Cancel before it is sent.");
  };

  const cancelLetter = async (letter: LateLetterRecord) => {
    if (cancellingId) {
      return;
    }

    if (!canCancel(letter.status)) {
      setStatus("Only scheduled Late Letters can be cancelled here.");
      return;
    }

    if (pendingCancelId !== letter.id) {
      setPendingCancelId(letter.id);
      setStatus("Cancel this Late Letter?");
      return;
    }

    setCancellingId(letter.id);
    setStatus("Cancelling this Late Letter...");
    const { error } = await cancel(letter.id);
    setCancellingId(null);

    if (error) {
      setStatus(error);
      return;
    }

    setPendingCancelId(null);
    setStatus("Cancelled.");
  };

  const submitLetterReport = async (letter: LateLetterRecord) => {
    if (submittingReport) {
      return;
    }

    setReportStatus("");
    setSubmittingReport(true);

    const { error } = await report({
      late_letter_id: letter.id,
      reason: reportReason,
      details: reportDetails,
    });

    setSubmittingReport(false);

    if (error) {
      setReportStatus(error);
      return;
    }

    setReportDetails("");
    setReportStatus("This letter has been reported.");
  };

  const signedIn = Boolean(session?.user);

  return (
    <DiaryFrame
      caption="dear future ❀"
      title={<span className="font-serif-italic text-[var(--lg-rose)]">late letters</span>}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-7 pt-6 pb-3 border-b border-dashed border-[var(--lg-border)]">
        <span className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.15rem" }}>
          letters written with love
        </span>
        {signedIn ? (
          <button
            type="button"
            onClick={() => {
              setComposing((current) => !current);
              setFieldErrors({});
              setStatus("");
              setPendingCancelId(null);
              setReportStatus("");
            }}
            className="min-h-11 min-w-11 inline-flex items-center justify-center px-2 font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-300"
            style={{ fontSize: "1.1rem" }}
          >
            {composing ? "← back to letters" : "+ write a letter"}
          </button>
        ) : (
          <a
            href="/auth"
            className="min-h-11 inline-flex items-center font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-300"
            style={{ fontSize: "1.1rem" }}
          >
            sign in
          </a>
        )}
      </div>

      {authLoading ? (
        <div className="px-4 sm:px-7 py-6 min-h-[280px]">
          <EmptyState message="Checking your account." note="Late Letters need a signed-in account." />
        </div>
      ) : !authAvailable ? (
        <div className="px-4 sm:px-7 py-6 min-h-[280px]">
          <EmptyState message="Accounts are not connected right now." note="Sign in is needed to schedule a Late Letter." />
        </div>
      ) : !signedIn ? (
        <div className="px-4 sm:px-7 py-6 space-y-4 min-h-[280px]">
          <EmptyState message="Sign in to schedule a Late Letter." note="Recipient email is hidden after saving." />
          <div className="text-center">
            <a
              href="/auth"
              className="min-h-12 inline-flex items-center gap-2 bg-[var(--lg-rose)] text-white py-3 px-6 rounded-full hover:bg-[var(--lg-focus-rose)] transition-colors duration-300 shadow-[0_8px_22px_-12px_rgba(200,110,124,0.5)]"
              style={{ fontSize: "0.95rem", fontWeight: 600 }}
            >
              <img src={decor.envelopeMini} alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
              open account access
            </a>
          </div>
        </div>
      ) : composing ? (
        <form onSubmit={saveLetter} className="px-4 sm:px-7 py-6 space-y-4 min-h-[280px]">
          <div className="bg-[var(--lg-cream)] border border-dashed border-[var(--lg-rose-soft)] rounded-2xl px-4 py-3">
            <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
              Recipient email is hidden after saving. You can cancel before a letter is sent. After a letter is sent, it cannot be recalled.
            </p>
          </div>

          <Row label="to (name)">
            <input
              value={draft.recipientName}
              onChange={(event) => updateDraft("recipientName", event.target.value)}
              disabled={saving}
              placeholder="amma, ravi, future me..."
              className="w-full bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-2 focus:outline-none focus:border-[var(--lg-rose)] font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontSize: "1.3rem" }}
            />
          </Row>

          <Row label="recipient email">
            <FieldBlock error={fieldErrors.recipientEmail}>
              <input
                value={draft.recipientEmail}
                onChange={(event) => updateDraft("recipientEmail", event.target.value)}
                disabled={saving}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-2 focus:outline-none focus:border-[var(--lg-rose)] font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontSize: "1.2rem" }}
              />
            </FieldBlock>
          </Row>

          <Row label="subject">
            <input
              value={draft.subject}
              onChange={(event) => updateDraft("subject", event.target.value)}
              disabled={saving}
              placeholder="optional"
              className="w-full bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-2 focus:outline-none focus:border-[var(--lg-rose)] font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontSize: "1.2rem" }}
            />
          </Row>

          <Row label="save for">
            <FieldBlock error={fieldErrors.scheduledFor}>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                <input
                  value={draft.date}
                  onChange={(event) => updateDraft("date", event.target.value)}
                  disabled={saving}
                  type="date"
                  className="min-h-11 w-full sm:w-auto bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-2 focus:outline-none focus:border-[var(--lg-rose)] text-[var(--lg-ink)] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontSize: "1.05rem" }}
                />
                <input
                  value={draft.time}
                  onChange={(event) => updateDraft("time", event.target.value)}
                  disabled={saving}
                  type="time"
                  className="min-h-11 w-full sm:w-auto bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-2 focus:outline-none focus:border-[var(--lg-rose)] text-[var(--lg-ink)] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontSize: "1.05rem" }}
                />
              </div>
            </FieldBlock>
          </Row>

          <Row label="the letter">
            <FieldBlock error={fieldErrors.body}>
              <textarea
                value={draft.body}
                onChange={(event) => updateDraft("body", event.target.value)}
                disabled={saving}
                rows={6}
                placeholder="dear ..."
                className="w-full bg-transparent border-0 focus:outline-none resize-none font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontSize: "1.4rem", lineHeight: "32px" }}
              />
            </FieldBlock>
          </Row>

          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-4">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setComposing(false);
                setFieldErrors({});
                setStatus("");
              }}
              className="min-h-11 inline-flex items-center justify-center font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontSize: "1.1rem" }}
            >
              close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--lg-rose)] text-white py-3 px-6 rounded-full hover:bg-[var(--lg-focus-rose)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-300 shadow-[0_8px_22px_-12px_rgba(200,110,124,0.5)]"
              style={{ fontSize: "0.95rem", fontWeight: 600 }}
            >
              <img src={decor.envelopeMini} alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
              {saving ? "saving..." : "save late letter"}
            </button>
          </div>
        </form>
      ) : (
        <div className="px-4 sm:px-7 py-6 space-y-4 min-h-[280px]">
          <div className="bg-[var(--lg-cream)] border border-dashed border-[var(--lg-rose-soft)] rounded-2xl px-4 py-3">
            <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
              Recipient email is hidden after saving. You can cancel before a letter is sent. After a letter is sent, it cannot be recalled.
            </p>
          </div>

          {lettersError && (
            <div className="bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
                {lettersError}
              </p>
              <button
                type="button"
                onClick={refresh}
                disabled={lettersLoading}
                className="min-h-11 font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontSize: "1rem" }}
              >
                {lettersLoading ? "loading..." : "try again"}
              </button>
            </div>
          )}

          {lettersLoading ? (
            <EmptyState message="Loading your Late Letters." note="Stored in your account." />
          ) : letters.length === 0 ? (
            <EmptyState message="No scheduled Late Letters yet." note="Write one to schedule a future email." />
          ) : (
            <div className="space-y-3">
              {letters.map((letter) => (
                <LetterCard
                  key={letter.id}
                  letter={letter}
                  pendingCancel={pendingCancelId === letter.id}
                  cancelling={cancellingId === letter.id}
                  selected={selectedLetterId === letter.id}
                  onView={() => {
                    setSelectedLetterId((current) => (current === letter.id ? null : letter.id));
                    setPendingCancelId(null);
                    setStatus("");
                    setReportDetails("");
                    setReportStatus("");
                  }}
                  onCancel={() => cancelLetter(letter)}
                  onKeep={() => {
                    setPendingCancelId(null);
                    setStatus("");
                  }}
                />
              ))}
            </div>
          )}

          {selectedLetter && (
            <>
              <LetterDetail letter={selectedLetter} />
              {selectedLetter.status !== "draft" && (
                <SenderSafetyPanel
                  reason={reportReason}
                  details={reportDetails}
                  status={reportStatus}
                  submitting={submittingReport}
                  onReasonChange={setReportReason}
                  onDetailsChange={setReportDetails}
                  onSubmit={() => submitLetterReport(selectedLetter)}
                />
              )}
            </>
          )}
        </div>
      )}

      {status && (
        <p className="px-4 sm:px-7 pb-4 text-center font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
          {status}
        </p>
      )}

      <div className="px-4 sm:px-7 pt-2 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-dashed border-[var(--lg-border)]">
        <span className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.05rem" }}>
          {signedIn ? "Stored in your account. Delivery uses the configured server job." : "Late Letters need a signed-in account."}
        </span>
        <img src={decor.heartLockKey} alt="" aria-hidden="true" className="w-7 h-7 object-contain opacity-80" />
      </div>
    </DiaryFrame>
  );
}

function LetterCard({
  letter,
  pendingCancel,
  cancelling,
  selected,
  onView,
  onCancel,
  onKeep,
}: {
  letter: LateLetterRecord;
  pendingCancel: boolean;
  cancelling: boolean;
  selected: boolean;
  onView: () => void;
  onCancel: () => void;
  onKeep: () => void;
}) {
  return (
    <article className="bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-4 shadow-[0_8px_22px_-16px_rgba(120,80,70,0.4)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-[var(--lg-ink)] break-words" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "1.05rem" }}>
            {letterTitle(letter)}
          </h3>
          <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
            {letter.recipient_name ? `${letter.recipient_name} · ` : ""}
            {letter.recipient_email_masked || "recipient email hidden"}
          </p>
        </div>
        <span
          className="w-fit shrink-0 rounded-full border border-[var(--lg-rose-soft)] px-3 py-1 text-[var(--lg-rose)]"
          style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
        >
          {statusLabel(letter.status)}
        </span>
      </div>

      <p className="mt-3 font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
        {excerpt(letter.body)}
      </p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Meta label="saved for" value={formatDateTime(letter.scheduled_for)} />
        <Meta label="created" value={formatShortDate(letter.created_at)} />
      </div>
      <p className="mt-2 font-cute text-[var(--lg-cocoa)]/70" style={{ fontSize: "0.95rem" }}>
        {statusNote(letter)}
      </p>

      <div className="mt-4 flex items-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={onView}
          className="min-h-11 inline-flex items-center font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] transition-colors duration-500"
          style={{ fontSize: "1rem" }}
        >
          {selected ? "hide" : "view"}
        </button>
        {canCancel(letter.status) && (
          <button
            type="button"
            onClick={onCancel}
            disabled={cancelling}
            className="min-h-11 inline-flex items-center font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-500"
            style={{ fontSize: "1rem" }}
          >
            {cancelling ? "cancelling..." : pendingCancel ? "confirm cancel" : "cancel before it is sent"}
          </button>
        )}
        {pendingCancel && (
          <button
            type="button"
            onClick={onKeep}
            className="min-h-11 inline-flex items-center font-cute text-[var(--lg-cocoa)]/70 hover:text-[var(--lg-ink)] transition-colors duration-500"
            style={{ fontSize: "1rem" }}
          >
            keep it
          </button>
        )}
      </div>
    </article>
  );
}

function LetterDetail({ letter }: { letter: LateLetterRecord }) {
  return (
    <section className="bg-[var(--lg-cream)] border border-dashed border-[var(--lg-rose-soft)] rounded-2xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-[var(--lg-ink)] break-words" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "1.25rem" }}>
            {letterTitle(letter)}
          </h3>
          <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
            {letter.recipient_name ? `${letter.recipient_name} · ` : ""}
            {letter.recipient_email_masked || "recipient email hidden"}
          </p>
        </div>
        <span
          className="w-fit shrink-0 rounded-full border border-[var(--lg-rose-soft)] px-3 py-1 text-[var(--lg-rose)]"
          style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
        >
          {statusLabel(letter.status)}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Meta label="saved for" value={formatDateTime(letter.scheduled_for)} />
        <Meta label="created" value={formatShortDate(letter.created_at)} />
      </div>
      <p className="mt-4 whitespace-pre-wrap font-cute text-[var(--lg-ink)]" style={{ fontSize: "1.18rem", lineHeight: "30px" }}>
        {letter.body}
      </p>
      <LetterStatusDetails letter={letter} />
    </section>
  );
}

function LetterStatusDetails({ letter }: { letter: LateLetterRecord }) {
  return (
    <div className="mt-4 space-y-2">
      <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
        {statusNote(letter)}
      </p>
      <p className="font-cute text-[var(--lg-cocoa)]/75" style={{ fontSize: "0.96rem" }}>
        You can cancel before a letter is sent. After a letter is sent, it cannot be recalled.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {letter.sent_at && <Meta label="sent" value={formatDateTime(letter.sent_at)} />}
        {letter.opened_at && <Meta label="opened" value={formatDateTime(letter.opened_at)} />}
        {letter.failed_at && <Meta label="failed" value={formatDateTime(letter.failed_at)} />}
        {letter.cancelled_at && <Meta label="cancelled" value={formatDateTime(letter.cancelled_at)} />}
      </div>
    </div>
  );
}

function SenderSafetyPanel({
  reason,
  details,
  status,
  submitting,
  onReasonChange,
  onDetailsChange,
  onSubmit,
}: {
  reason: string;
  details: string;
  status: string;
  submitting: boolean;
  onReasonChange: (value: string) => void;
  onDetailsChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="bg-[var(--lg-cream)] border border-dashed border-[var(--lg-rose-soft)] rounded-2xl p-5">
      <h3
        className="text-[var(--lg-ink)]"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "1.15rem" }}
      >
        safety
      </h3>
      <p className="mt-2 font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
        If something about this letter needs review, you can report it here.
      </p>
      <div className="mt-4 space-y-3">
        <select
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          className="w-full bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl px-4 py-3 text-[var(--lg-ink)] focus:outline-none focus:border-[var(--lg-rose)]"
          style={{ fontSize: "0.95rem" }}
        >
          {senderReportReasons.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <textarea
          value={details}
          onChange={(event) => onDetailsChange(event.target.value)}
          rows={4}
          placeholder="Share a little more if you want."
          className="w-full resize-y min-h-[120px] bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl px-4 py-3 text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/55 focus:outline-none focus:border-[var(--lg-rose)]"
          style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="min-h-11 w-full sm:w-auto inline-flex justify-center bg-[var(--lg-ink)] text-[var(--lg-cream)] py-3 px-5 rounded-full hover:bg-[var(--lg-rose)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-500"
          style={{ fontSize: "0.78rem", textTransform: "uppercase" }}
        >
          {submitting ? "Saving" : "Report this letter"}
        </button>
      </div>
      {status && (
        <p className="mt-3 font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.98rem" }}>
          {status}
        </p>
      )}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-3 items-start">
      <label className="col-span-12 sm:col-span-3 font-cute text-[var(--lg-rose)] pt-2" style={{ fontSize: "1.15rem" }}>
        {label}
      </label>
      <div className="col-span-12 sm:col-span-9">{children}</div>
    </div>
  );
}

function FieldBlock({ error, children }: { error?: string; children: ReactNode }) {
  return (
    <div>
      {children}
      {error && (
        <p className="mt-1 font-cute text-[var(--lg-rose)]" style={{ fontSize: "0.95rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "0.95rem" }}>
      <span className="text-[var(--lg-rose)]">{label}</span> · {value}
    </p>
  );
}
