import { useState } from "react";
import { motion } from "motion/react";
import { DiaryFrame } from "./DiaryFrame";
import { blooms, decor } from "../BrandAssets";
import { EmptyState } from "../shared/EmptyState";
import {
  designPreviewKeepsakeLategrams,
  designPreviewKeepsakeLetters,
  designPreviewKeepsakeTimers,
  designPreviewKeepsakeCards,
} from "../../fixtures/designPreviewData";

const tabs = [
  { id: "lategrams", label: "My Lategrams" },
  { id: "letters", label: "Late Letters" },
  { id: "time", label: "Time Since" },
  { id: "cards", label: "Saved Cards" },
  { id: "received", label: "Received" },
];

/**
 * Design preview only — fixture data used to preserve layout shape.
 * Do not treat as real user data.
 * Will be replaced with real saved content in Phase 5/6.
 */
const previewData: Record<string, { title: string; preview: string; date: string; bloom: string }[]> = {
  lategrams: designPreviewKeepsakeLategrams,
  letters: designPreviewKeepsakeLetters,
  time: designPreviewKeepsakeTimers,
  cards: designPreviewKeepsakeCards,
  received: [],
};

export function KeepPrivateView() {
  const [tab, setTab] = useState("lategrams");
  const items = previewData[tab];

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
              onClick={() => setTab(t.id)}
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
          {items.length === 0 ? (
            <EmptyState
              message="This box is quiet for now."
              note="Saving is not connected yet."
            />
          ) : (
            <>
              <p
                className="font-cute text-[var(--lg-cocoa)]/60 text-center mb-4"
                style={{ fontSize: "0.9rem" }}
              >
                design preview — no saved content yet
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((it, i) => (
                  <button
                    key={`${tab}-${i}`}
                    className="group text-left bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-4 hover:-translate-y-0.5 transition-transform duration-300 shadow-[0_8px_22px_-16px_rgba(120,80,70,0.4)]"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={it.bloom}
                        alt=""
                        aria-hidden="true"
                        className="w-10 h-10 object-contain shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-[var(--lg-ink)] truncate"
                          style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "1.05rem" }}
                        >
                          {it.title}
                        </h3>
                        <p
                          className="font-cute text-[var(--lg-cocoa)] mt-1 line-clamp-2"
                          style={{ fontSize: "1.1rem", lineHeight: 1.3 }}
                        >
                          {it.preview}
                        </p>
                        <p
                          className="text-[var(--lg-rose)] mt-2"
                          style={{ fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
                        >
                          {it.date}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-7 pt-2 pb-6 flex items-center justify-between border-t border-dashed border-[var(--lg-border)]">
        <span
          className="font-cute text-[var(--lg-cocoa)]"
          style={{ fontSize: "1.05rem" }}
        >
          saving is not connected yet
        </span>
        <span
          className="font-cute text-[var(--lg-cocoa)]/50"
          style={{ fontSize: "1.1rem" }}
        >
          export keepsake
        </span>
      </div>
    </DiaryFrame>
  );
}
