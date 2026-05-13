import { useState } from "react";
import { motion } from "motion/react";
import { decor } from "./BrandAssets";

const easeSoft = [0.22, 1, 0.36, 1] as const;

interface DiaryComposerProps {
  active: string;
}

const titles: Record<string, string> = {
  write: "write a Lategram",
  private: "keep it private",
  garden: "plant in the Garden",
  later: "send it later",
  time: "mark a Time Since",
  memory: "make a Memory Card",
};

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function DiaryComposer({ active }: DiaryComposerProps) {
  const [text, setText] = useState("");
  const [to, setTo] = useState("");

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
          aria-hidden
          className="pointer-events-none absolute -top-6 left-8 w-14 h-14 object-contain rotate-[-8deg]"
        />
        {/* Wax seal */}
        <img
          src={decor.heartWaxSeal}
          alt=""
          aria-hidden
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
                onChange={(e) => setTo(e.target.value)}
                placeholder="to: someone, or me"
                className="bg-transparent border-0 text-right text-[var(--lg-cocoa)] placeholder:text-[var(--lg-cocoa)]/40 focus:outline-none font-cute"
                style={{ fontSize: "1.15rem", width: "12rem" }}
              />
              <img
                src={decor.softHeart}
                alt=""
                aria-hidden
                className="w-5 h-5 object-contain"
              />
            </div>
          </div>

          {/* Red margin + ruled lines + textarea */}
          <div className="relative">
            {/* Pink left margin line */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-12 top-0 bottom-0 w-px"
              style={{ background: "var(--lg-rose-soft)" }}
            />
            {/* Ruled lines */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(transparent 0, transparent 33px, var(--lg-border) 33px, var(--lg-border) 34px)",
                backgroundPosition: "0 36px",
              }}
            />

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
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
          <div className="px-7 pt-2 pb-6 flex items-center justify-between border-t border-dashed border-[var(--lg-border)]">
            <span
              className="font-cute text-[var(--lg-cocoa)]"
              style={{ fontSize: "1.05rem" }}
            >
              with love,
            </span>
            <div className="flex items-center gap-2">
              <span
                className="font-cute text-[var(--lg-rose)]"
                style={{ fontSize: "1.15rem" }}
              >
                {text.length}/∞
              </span>
              <img
                src={decor.pastelStarSparkles}
                alt=""
                aria-hidden
                className="w-5 h-5 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Bottom decor */}
        <div className="mt-6 flex items-center justify-center gap-4 opacity-80">
          <img src={decor.envelopeMini} alt="" aria-hidden className="w-7 h-7 object-contain" />
          <span
            className="font-cute text-[var(--lg-rose)]"
            style={{ fontSize: "1.15rem" }}
          >
            sealed softly ✿
          </span>
          <img
            src={decor.foldedLetterHeart}
            alt=""
            aria-hidden
            className="w-7 h-7 object-contain"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
        <button className="group inline-flex items-center gap-3 bg-[var(--lg-ink)] text-[var(--lg-cream)] py-4 px-7 rounded-full hover:bg-[var(--lg-rose)] transition-colors duration-700">
          <span
            style={{
              fontSize: "0.78rem",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
            }}
          >
            Save Lategram
          </span>
          <span className="block w-6 h-px bg-[var(--lg-cream)] transition-all duration-500 group-hover:w-10" />
        </button>
        <button
          className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
          style={{ fontSize: "1.2rem" }}
        >
          keep as draft →
        </button>
      </div>
    </motion.div>
  );
}
