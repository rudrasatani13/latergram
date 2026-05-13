import { useState } from "react";
import { motion } from "motion/react";
import { DiaryFrame } from "./DiaryFrame";
import { blooms, decor } from "../BrandAssets";
import { PillChip } from "../shared/PillChip";
import { FeatureUnavailableNote } from "../shared/FeatureUnavailableNote";
import { designPreviewCardSources } from "../../fixtures/designPreviewData";

const formats = [
  { id: "square", label: "square", w: 280, h: 280 },
  { id: "story", label: "story", w: 200, h: 320 },
  { id: "wallpaper", label: "wallpaper", w: 320, h: 220 },
] as const;

const themeBlooms = [
  { id: "peony", bloom: blooms.softPeony, bg: "linear-gradient(160deg,#FBE3DF,#FFF3DE)" },
  { id: "rose", bloom: blooms.coralCarnation, bg: "linear-gradient(160deg,#FFE2E5,#FFF8ED)" },
  { id: "sun", bloom: blooms.sunflower, bg: "linear-gradient(160deg,#FFF1C9,#FFF8ED)" },
  { id: "daisy", bloom: blooms.pinkDaisy, bg: "linear-gradient(160deg,#FFE6E0,#FFF3DE)" },
  { id: "anemone", bloom: blooms.blueAnemone, bg: "linear-gradient(160deg,#E5E0F4,#FFF8ED)" },
  { id: "apricot", bloom: blooms.apricotRose, bg: "linear-gradient(160deg,#FFE0CF,#FFF8ED)" },
];

/**
 * Design preview only — fixture sources used to preserve layout shape.
 * Memory Cards need real saved memories first.
 * Will be replaced with real content in Phase 6 + Phase 16.
 */
const sources = designPreviewCardSources;

export function MemoryCardView() {
  const [format, setFormat] = useState<typeof formats[number]>(formats[0]);
  const [theme, setTheme] = useState(themeBlooms[0]);
  const [source, setSource] = useState(sources[0]);
  const [showUnavailable, setShowUnavailable] = useState(false);

  return (
    <DiaryFrame
      caption="dear keepsake card ❀"
      title={<span className="font-serif-italic text-[var(--lg-rose)]">memory cards</span>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-7 py-6 min-h-[360px]">
        {/* Preview */}
        <div className="lg:col-span-7 flex items-center justify-center">
          <motion.div
            animate={{
              width: format.w,
              height: format.h,
              background: theme.bg,
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative rounded-[24px] overflow-hidden"
            style={{
              boxShadow:
                "0 30px 60px -30px rgba(120,80,70,0.45), inset 0 0 0 1px rgba(234,213,196,0.6)",
            }}
          >
            <img
              src={theme.bloom}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 object-contain opacity-90"
            />
            <img
              src={decor.pastelStarSparkles}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 left-3 w-7 h-7 object-contain opacity-80"
            />
            <div className="relative h-full w-full p-5 flex flex-col">
              <p
                className="font-cute text-[var(--lg-rose)] mb-2"
                style={{ fontSize: "1.05rem" }}
              >
                a Lategram keepsake ✿
              </p>
              <p
                className="text-[var(--lg-ink)] flex-1"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 400,
                  fontSize: "1.15rem",
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                }}
              >
                {source.body}
              </p>
              <p
                className="font-cute text-[var(--lg-cocoa)] mt-3"
                style={{ fontSize: "1rem" }}
              >
                — Lategram
              </p>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <p className="font-cute text-[var(--lg-rose)] mb-2" style={{ fontSize: "1.15rem" }}>
              choose a memory
            </p>
            <p
              className="font-cute text-[var(--lg-cocoa)]/60 mb-2"
              style={{ fontSize: "0.85rem" }}
            >
              design preview — no saved memories yet
            </p>
            <div className="space-y-2">
              {sources.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSource(s)}
                  className={`w-full text-left rounded-xl border px-3 py-2 transition-colors duration-300 ${
                    source.id === s.id
                      ? "border-[var(--lg-rose)] bg-[var(--lg-blush)]/40"
                      : "border-[var(--lg-border)] bg-[var(--lg-paper)] hover:border-[var(--lg-rose-soft)]"
                  }`}
                >
                  <span
                    className="block text-[var(--lg-ink)]"
                    style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "0.95rem" }}
                  >
                    {s.label}
                  </span>
                  <span
                    className="font-cute text-[var(--lg-cocoa)] line-clamp-1"
                    style={{ fontSize: "1rem" }}
                  >
                    {s.body}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-cute text-[var(--lg-rose)] mb-2" style={{ fontSize: "1.15rem" }}>
              format
            </p>
            <div className="flex gap-2 flex-wrap">
              {formats.map((f) => (
                <PillChip
                  key={f.id}
                  active={format.id === f.id}
                  onClick={() => setFormat(f)}
                >
                  {f.label}
                </PillChip>
              ))}
            </div>
          </div>

          <div>
            <p className="font-cute text-[var(--lg-rose)] mb-2" style={{ fontSize: "1.15rem" }}>
              flower
            </p>
            <div className="flex gap-2 flex-wrap">
              {themeBlooms.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t)}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center transition-transform duration-300 ${
                    theme.id === t.id
                      ? "border-[var(--lg-rose)] scale-110"
                      : "border-[var(--lg-border)] hover:scale-105"
                  }`}
                  style={{ background: t.bg }}
                  aria-label={`${t.id} flower theme`}
                >
                  <img src={t.bloom} alt="" aria-hidden="true" className="w-7 h-7 object-contain" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-7 pt-2 pb-6 flex items-center justify-between border-t border-dashed border-[var(--lg-border)]">
        <span className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.05rem" }}>
          export is not connected yet
        </span>
        <button
          onClick={() => setShowUnavailable(true)}
          className="inline-flex items-center gap-2 bg-[var(--lg-border)] text-[var(--lg-cocoa)] py-2.5 px-5 rounded-full cursor-not-allowed opacity-70"
          style={{ fontSize: "0.9rem", fontWeight: 600 }}
          disabled
          aria-label="Download card — not available yet"
        >
          <img src={decor.keepsakeBoxHeart} alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
          download card
        </button>
      </div>

      <FeatureUnavailableNote
        message="Download is not connected yet. Memory Cards need a real saved memory first."
        visible={showUnavailable}
      />
    </DiaryFrame>
  );
}
