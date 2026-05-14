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

function buildScheduledDate(dateValue: string, timeValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);

  if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  const scheduledAt = new Date(year, month - 1, day, hours, minutes);

  if (Number.isNaN(scheduledAt.getTime())) {
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
  } = useLateLetters();
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState<ComposeDraft>(emptyDraft);
  const [fieldErrors, setFieldErrors] = useState<ComposeErrors>({});
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);

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

    if (!errors.scheduledFor && (!scheduledAt || scheduledAt.getTime() <= Date.now())) {
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

    const scheduledAt = validateDraft();

    if (!scheduledAt) {
      return;
    }

    setSaving(true);
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
    if (!canCancel(letter.status)) {
      setStatus("Only scheduled Late Letters can be cancelled here.");
      return;
    }

    if (pendingCancelId !== letter.id) {
      setPendingCancelId(letter.id);
      setStatus("Cancel this Late Letter?");
      return;
    }

    const { error } = await cancel(letter.id);

    if (error) {
      setStatus(error);
      return;
    }

    setPendingCancelId(null);
    setStatus("Cancelled.");
  };

  const signedIn = Boolean(session?.user);

  return (
    <DiaryFrame
      caption="dear future ❀"
      title={<span className="font-serif-italic text-[var(--lg-rose)]">late letters</span>}
    >
      <div className="flex items-center justify-between px-7 pt-6 pb-3 border-b border-dashed border-[var(--lg-border)]">
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
            }}
            className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-300"
            style={{ fontSize: "1.1rem" }}
          >
            {composing ? "← back to letters" : "+ write a letter"}
          </button>
        ) : (
          <a
            href="/auth"
            className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-300"
            style={{ fontSize: "1.1rem" }}
          >
            sign in
          </a>
        )}
      </div>

      {authLoading ? (
        <div className="px-7 py-6 min-h-[280px]">
          <EmptyState message="Checking your account." note="Late Letters need a signed-in account." />
        </div>
      ) : !authAvailable ? (
        <div className="px-7 py-6 min-h-[280px]">
          <EmptyState message="Accounts are not connected right now." note="Sign in is needed to schedule a Late Letter." />
        </div>
      ) : !signedIn ? (
        <div className="px-7 py-6 space-y-4 min-h-[280px]">
          <EmptyState message="Sign in to schedule a Late Letter." note="Recipient email is hidden after saving." />
          <div className="text-center">
            <a
              href="/auth"
              className="inline-flex items-center gap-2 bg-[var(--lg-rose)] text-white py-3 px-6 rounded-full hover:bg-[var(--lg-focus-rose)] transition-colors duration-300 shadow-[0_8px_22px_-12px_rgba(200,110,124,0.5)]"
              style={{ fontSize: "0.95rem", fontWeight: 600 }}
            >
              <img src={decor.envelopeMini} alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
              open account access
            </a>
          </div>
        </div>
      ) : composing ? (
        <form onSubmit={saveLetter} className="px-7 py-6 space-y-4 min-h-[280px]">
          <div className="bg-[var(--lg-cream)] border border-dashed border-[var(--lg-rose-soft)] rounded-2xl px-4 py-3">
            <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
              Recipient email is hidden after saving. Cancel before it is sent.
            </p>
          </div>

          <Row label="to (name)">
            <input
              value={draft.recipientName}
              onChange={(event) => updateDraft("recipientName", event.target.value)}
              placeholder="amma, ravi, future me..."
              className="w-full bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-2 focus:outline-none focus:border-[var(--lg-rose)] font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45"
              style={{ fontSize: "1.3rem" }}
            />
          </Row>

          <Row label="recipient email">
            <FieldBlock error={fieldErrors.recipientEmail}>
              <input
                value={draft.recipientEmail}
                onChange={(event) => updateDraft("recipientEmail", event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-2 focus:outline-none focus:border-[var(--lg-rose)] font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45"
                style={{ fontSize: "1.2rem" }}
              />
            </FieldBlock>
          </Row>

          <Row label="subject">
            <input
              value={draft.subject}
              onChange={(event) => updateDraft("subject", event.target.value)}
              placeholder="optional"
              className="w-full bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-2 focus:outline-none focus:border-[var(--lg-rose)] font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45"
              style={{ fontSize: "1.2rem" }}
            />
          </Row>

          <Row label="save for">
            <FieldBlock error={fieldErrors.scheduledFor}>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  value={draft.date}
                  onChange={(event) => updateDraft("date", event.target.value)}
                  type="date"
                  className="bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-2 focus:outline-none focus:border-[var(--lg-rose)] text-[var(--lg-ink)]"
                  style={{ fontSize: "1.05rem" }}
                />
                <input
                  value={draft.time}
                  onChange={(event) => updateDraft("time", event.target.value)}
                  type="time"
                  className="bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-2 focus:outline-none focus:border-[var(--lg-rose)] text-[var(--lg-ink)]"
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
                rows={6}
                placeholder="dear ..."
                className="w-full bg-transparent border-0 focus:outline-none resize-none font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45"
                style={{ fontSize: "1.4rem", lineHeight: "32px" }}
              />
            </FieldBlock>
          </Row>

          <div className="pt-2 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setComposing(false);
                setFieldErrors({});
                setStatus("");
              }}
              className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)]"
              style={{ fontSize: "1.1rem" }}
            >
              close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[var(--lg-rose)] text-white py-3 px-6 rounded-full hover:bg-[var(--lg-focus-rose)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-300 shadow-[0_8px_22px_-12px_rgba(200,110,124,0.5)]"
              style={{ fontSize: "0.95rem", fontWeight: 600 }}
            >
              <img src={decor.envelopeMini} alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
              {saving ? "saving..." : "save late letter"}
            </button>
          </div>
        </form>
      ) : (
        <div className="px-7 py-6 space-y-4 min-h-[280px]">
          <div className="bg-[var(--lg-cream)] border border-dashed border-[var(--lg-rose-soft)] rounded-2xl px-4 py-3">
            <p className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
              Recipient email is hidden after saving. Delivery uses the configured server job.
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
                className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)]"
                style={{ fontSize: "1rem" }}
              >
                try again
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
                  selected={selectedLetterId === letter.id}
                  onView={() => {
                    setSelectedLetterId((current) => (current === letter.id ? null : letter.id));
                    setPendingCancelId(null);
                    setStatus("");
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

          {selectedLetter && <LetterDetail letter={selectedLetter} />}
        </div>
      )}

      {status && (
        <p className="px-7 pb-4 text-center font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem" }}>
          {status}
        </p>
      )}

      <div className="px-7 pt-2 pb-6 flex items-center justify-between border-t border-dashed border-[var(--lg-border)]">
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
  selected,
  onView,
  onCancel,
  onKeep,
}: {
  letter: LateLetterRecord;
  pendingCancel: boolean;
  selected: boolean;
  onView: () => void;
  onCancel: () => void;
  onKeep: () => void;
}) {
  return (
    <article className="bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-4 shadow-[0_8px_22px_-16px_rgba(120,80,70,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[var(--lg-ink)] truncate" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "1.05rem" }}>
            {letterTitle(letter)}
          </h3>
          <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
            {letter.recipient_name ? `${letter.recipient_name} · ` : ""}
            {letter.recipient_email_masked || "recipient email hidden"}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full border border-[var(--lg-rose-soft)] px-3 py-1 text-[var(--lg-rose)]"
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
          className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] transition-colors duration-500"
          style={{ fontSize: "1rem" }}
        >
          {selected ? "hide" : "view"}
        </button>
        {canCancel(letter.status) && (
          <button
            type="button"
            onClick={onCancel}
            className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
            style={{ fontSize: "1rem" }}
          >
            {pendingCancel ? "confirm cancel" : "cancel before it is sent"}
          </button>
        )}
        {pendingCancel && (
          <button
            type="button"
            onClick={onKeep}
            className="font-cute text-[var(--lg-cocoa)]/70 hover:text-[var(--lg-ink)] transition-colors duration-500"
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[var(--lg-ink)]" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "1.25rem" }}>
            {letterTitle(letter)}
          </h3>
          <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
            {letter.recipient_name ? `${letter.recipient_name} · ` : ""}
            {letter.recipient_email_masked || "recipient email hidden"}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full border border-[var(--lg-rose-soft)] px-3 py-1 text-[var(--lg-rose)]"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {letter.sent_at && <Meta label="sent" value={formatDateTime(letter.sent_at)} />}
        {letter.opened_at && <Meta label="opened" value={formatDateTime(letter.opened_at)} />}
        {letter.failed_at && <Meta label="failed" value={formatDateTime(letter.failed_at)} />}
        {letter.cancelled_at && <Meta label="cancelled" value={formatDateTime(letter.cancelled_at)} />}
      </div>
    </div>
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
