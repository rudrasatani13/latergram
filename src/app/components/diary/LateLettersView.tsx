import { useState } from "react";
import { DiaryFrame } from "./DiaryFrame";
import { decor } from "../BrandAssets";
import { FeatureUnavailableNote } from "../shared/FeatureUnavailableNote";
import { EmptyState } from "../shared/EmptyState";

export function LateLettersView() {
  const [composing, setComposing] = useState(false);
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [body, setBody] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(false);

  return (
    <DiaryFrame
      caption="dear future ❀"
      title={<span className="font-serif-italic text-[var(--lg-rose)]">late letters</span>}
    >
      {/* Header strip */}
      <div className="flex items-center justify-between px-7 pt-6 pb-3 border-b border-dashed border-[var(--lg-border)]">
        <span className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.15rem" }}>
          letters written with love
        </span>
        <button
          onClick={() => {
            setComposing((c) => !c);
            setShowUnavailable(false);
          }}
          className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-300"
          style={{ fontSize: "1.1rem" }}
        >
          {composing ? "← back to letters" : "+ write a letter"}
        </button>
      </div>

      {!composing ? (
        <div className="px-7 py-6 space-y-3 min-h-[280px]">
          <EmptyState
            message="No late letters are connected yet."
            note="Delivery is not connected yet."
          />
        </div>
      ) : (
        <div className="px-7 py-6 space-y-4 min-h-[280px]">
          <p
            className="font-cute text-[var(--lg-cocoa)] text-center mb-2"
            style={{ fontSize: "1rem" }}
          >
            you can write here, but delivery is not connected yet
          </p>
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
              close
            </button>
            <button
              onClick={() => setShowUnavailable(true)}
              className="inline-flex items-center gap-2 bg-[var(--lg-rose)] text-white py-3 px-6 rounded-full hover:bg-[var(--lg-focus-rose)] transition-colors duration-300 shadow-[0_8px_22px_-12px_rgba(200,110,124,0.5)]"
              style={{ fontSize: "0.95rem", fontWeight: 600 }}
            >
              <img src={decor.envelopeMini} alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
              keep writing here
            </button>
          </div>
          <FeatureUnavailableNote
            message="Delivery is not connected yet. Nothing leaves this page."
            visible={showUnavailable}
          />
        </div>
      )}

      <div className="px-7 pt-2 pb-6 flex items-center justify-between border-t border-dashed border-[var(--lg-border)]">
        <span className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.05rem" }}>
          delivery is not connected yet
        </span>
        <img src={decor.heartLockKey} alt="" aria-hidden="true" className="w-7 h-7 object-contain opacity-80" />
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
