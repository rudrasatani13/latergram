import { useState } from "react";
import { DiaryFrame } from "./DiaryFrame";
import { decor } from "../BrandAssets";

type Status = "scheduled" | "sent" | "opened";

const seed: { to: string; email: string; preview: string; date: string; status: Status }[] = [
  { to: "amma", email: "amma@home", preview: "for your birthday — a little late, like always.", date: "may 22 · 9:00 am", status: "scheduled" },
  { to: "ravi", email: "ravi@somewhere.com", preview: "i hope this finds you on a quiet morning.", date: "apr 30 · 7:30 pm", status: "opened" },
  { to: "future me", email: "self", preview: "open this when you forget you were brave.", date: "dec 31 · 11:59 pm", status: "scheduled" },
];

const statusColor: Record<Status, string> = {
  scheduled: "var(--lg-butter)",
  sent: "var(--lg-rose-soft)",
  opened: "var(--lg-sage)",
};

export function LateLettersView() {
  const [composing, setComposing] = useState(false);
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [body, setBody] = useState("");

  return (
    <DiaryFrame
      caption="dear future ❀"
      title={<span className="font-serif-italic text-[var(--lg-rose)]">late letters</span>}
    >
      {/* Header strip */}
      <div className="flex items-center justify-between px-7 pt-6 pb-3 border-b border-dashed border-[var(--lg-border)]">
        <span className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.15rem" }}>
          scheduled with love
        </span>
        <button
          onClick={() => setComposing((c) => !c)}
          className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-300"
          style={{ fontSize: "1.1rem" }}
        >
          {composing ? "← back to letters" : "+ new letter"}
        </button>
      </div>

      {!composing ? (
        <div className="px-7 py-6 space-y-3 min-h-[280px]">
          {seed.map((l, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-4 shadow-[0_8px_22px_-16px_rgba(120,80,70,0.4)]"
            >
              <img src={decor.envelopeHeartSeal} alt="" className="w-10 h-10 object-contain shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[var(--lg-ink)]"
                    style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "1.05rem" }}
                  >
                    to {l.to}
                  </span>
                  <span className="text-[var(--lg-cocoa)]/60" style={{ fontSize: "0.85rem" }}>
                    · {l.email}
                  </span>
                </div>
                <p
                  className="font-cute text-[var(--lg-cocoa)] mt-1"
                  style={{ fontSize: "1.15rem", lineHeight: 1.3 }}
                >
                  {l.preview}
                </p>
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <span
                    className="text-[var(--lg-rose)]"
                    style={{ fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
                  >
                    {l.date}
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-full"
                    style={{
                      background: statusColor[l.status],
                      color: "var(--lg-ink)",
                      fontSize: "0.72rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    {l.status}
                  </span>
                </div>
              </div>
              {l.status === "scheduled" && (
                <button
                  className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-error)] transition-colors duration-300 self-center"
                  style={{ fontSize: "1.05rem" }}
                >
                  cancel
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="px-7 py-6 space-y-4 min-h-[280px]">
          <Row label="to (name)">
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="amma, ravi, future me…"
              className="w-full bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-2 focus:outline-none focus:border-[var(--lg-rose)] font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45"
              style={{ fontSize: "1.3rem" }}
            />
          </Row>
          <Row label="when should it arrive">
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              className="bg-transparent border-0 border-b border-dashed border-[var(--lg-border)] py-2 focus:outline-none focus:border-[var(--lg-rose)] text-[var(--lg-ink)]"
              style={{ fontSize: "1.05rem" }}
            />
          </Row>
          <Row label="the letter">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="dear …,"
              className="w-full bg-transparent border-0 focus:outline-none resize-none font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45"
              style={{ fontSize: "1.4rem", lineHeight: "32px" }}
            />
          </Row>
          <div className="pt-2 flex items-center justify-end gap-4">
            <button
              onClick={() => setComposing(false)}
              className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)]"
              style={{ fontSize: "1.1rem" }}
            >
              keep as draft
            </button>
            <button
              className="inline-flex items-center gap-2 bg-[var(--lg-rose)] text-white py-3 px-6 rounded-full hover:bg-[var(--lg-focus-rose)] transition-colors duration-300 shadow-[0_8px_22px_-12px_rgba(200,110,124,0.5)]"
              style={{ fontSize: "0.95rem", fontWeight: 600 }}
            >
              <img src={decor.envelopeMini} alt="" className="w-4 h-4 object-contain" />
              schedule letter
            </button>
          </div>
        </div>
      )}

      <div className="px-7 pt-2 pb-6 flex items-center justify-between border-t border-dashed border-[var(--lg-border)]">
        <span className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.05rem" }}>
          delivered by a soft magic link, on the day you chose
        </span>
        <img src={decor.heartLockKey} alt="" className="w-7 h-7 object-contain opacity-80" />
      </div>
    </DiaryFrame>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-3 items-center">
      <label
        className="col-span-12 sm:col-span-3 font-cute text-[var(--lg-rose)]"
        style={{ fontSize: "1.15rem" }}
      >
        {label}
      </label>
      <div className="col-span-12 sm:col-span-9">{children}</div>
    </div>
  );
}
