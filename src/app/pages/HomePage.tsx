import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "../components/Header";
import { Grain } from "../components/Grain";
import { BackgroundPetals } from "../components/BackgroundPetals";
import { DiaryComposer } from "../components/DiaryComposer";
import { KeepPrivateView } from "../components/diary/KeepPrivateView";
import { GardenView } from "../components/diary/GardenView";
import { LateLettersView } from "../components/diary/LateLettersView";
import { TimeSinceView } from "../components/diary/TimeSinceView";
import { MemoryCardView } from "../components/diary/MemoryCardView";

interface HomePageProps {
  onNavigate: (page: "landing" | "auth" | "home") => void;
}

const easeSoft = [0.22, 1, 0.36, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 18, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.95, ease: easeSoft },
};

const categories = [
  { id: "write", label: "Write", glyph: "✿" },
  { id: "private", label: "Keep Private", glyph: "❀" },
  { id: "garden", label: "The Garden", glyph: "✾" },
  { id: "later", label: "Late Letters", glyph: "❁" },
  { id: "time", label: "Time Since", glyph: "❃" },
  { id: "memory", label: "Memory Cards", glyph: "❀" },
];

const quickAreas = [
  {
    title: "The Garden",
    desc: "plant a feeling anonymously, or read what others have planted.",
    cta: "open the Garden",
    glyph: "✾",
  },
  {
    title: "Late Letters",
    desc: "schedule a letter to arrive on a date that feels right.",
    cta: "write a letter",
    glyph: "❁",
  },
  {
    title: "Time Since",
    desc: "a quiet counter for the days since something mattered.",
    cta: "add a counter",
    glyph: "❃",
  },
  {
    title: "Memory Cards",
    desc: "turn a message into a small card you can keep softly.",
    cta: "create a card",
    glyph: "❀",
  },
];

export function HomePage({ onNavigate }: HomePageProps) {
  const [active, setActive] = useState("write");

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--lg-cream)]">
      <BackgroundPetals />
      <Grain />
      <div className="relative z-10">
        <Header current="home" onNavigate={onNavigate} variant="minimal" />

        <main className="px-6 md:px-12 pb-24">
          <div className="max-w-[960px] mx-auto pt-8">
            {/* Hero */}
            <motion.div {...reveal} className="text-center pt-6 pb-14">
              <p
                className="font-cute text-[var(--lg-rose)] mb-5"
                style={{ fontSize: "1.5rem" }}
              >
                today, may 12 ✿
              </p>
              <h1
                className="text-[var(--lg-ink)]"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 300,
                  fontSize: "clamp(2.6rem, 6vw, 5rem)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.03em",
                }}
              >
                write something
                <br />
                <span className="font-serif-italic text-[var(--lg-rose)]">that arrived late.</span>
              </h1>

              <div className="my-10 flex items-center justify-center gap-3">
                <span className="w-10 h-px bg-[var(--lg-rose-soft)]" />
                <span className="text-[var(--lg-rose)]" style={{ fontSize: "1.2rem" }}>
                  ❀
                </span>
                <span className="w-10 h-px bg-[var(--lg-rose-soft)]" />
              </div>

              <p
                className="text-[var(--lg-cocoa)] leading-[1.8] max-w-xl mx-auto"
                style={{ fontSize: "1.02rem" }}
              >
                open with the feeling. choose where it should belong. Lategram will hold it for as
                long as you need.
              </p>
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easeSoft, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 border-y border-[var(--lg-border)] py-6 mb-14"
            >
              {categories.map((c) => {
                const isActive = active === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActive(c.id)}
                    className={`group relative pb-1 transition-colors duration-500 inline-flex items-baseline gap-1.5 ${
                      isActive
                        ? "text-[var(--lg-ink)]"
                        : "text-[var(--lg-cocoa)] hover:text-[var(--lg-ink)]"
                    }`}
                    style={{
                      fontSize: "0.74rem",
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                    }}
                  >
                    {c.label}
                    <span
                      className={`transition-colors duration-500 ${
                        isActive ? "text-[var(--lg-rose)]" : "text-[var(--lg-rose-soft)]"
                      }`}
                      style={{ fontSize: "0.85rem" }}
                    >
                      {c.glyph}
                    </span>
                    <span
                      className={`absolute -bottom-px left-0 h-px bg-[var(--lg-ink)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </button>
                );
              })}
            </motion.div>

            {/* Composer */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
              >
                {active === "write" && <DiaryComposer active={active} />}
                {active === "private" && <KeepPrivateView />}
                {active === "garden" && <GardenView />}
                {active === "later" && <LateLettersView />}
                {active === "time" && <TimeSinceView />}
                {active === "memory" && <MemoryCardView />}
              </motion.div>
            </AnimatePresence>

            {/* Quick areas */}
            <div className="mt-24 text-center">
              <p
                className="font-cute text-[var(--lg-rose)] mb-3"
                style={{ fontSize: "1.4rem" }}
              >
                other little places ✿
              </p>
              <h2
                className="text-[var(--lg-ink)]"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 300,
                  fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.025em",
                }}
              >
                where words can{" "}
                <span className="font-serif-italic text-[var(--lg-rose)]">live.</span>
              </h2>
            </div>

            <div className="mt-12 border-t border-[var(--lg-border)]">
              {quickAreas.map((q, i) => (
                <motion.div
                  key={q.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.85, ease: easeSoft, delay: i * 0.06 }}
                  className="group grid grid-cols-12 gap-4 py-7 md:py-9 border-b border-[var(--lg-border)] hover:bg-[var(--lg-paper)]/40 transition-colors duration-700 px-2"
                >
                  <div className="col-span-12 md:col-span-4">
                    <h3
                      className="text-[var(--lg-ink)] inline-flex items-baseline gap-2 transition-transform duration-700 group-hover:translate-x-2"
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 400,
                        fontSize: "clamp(1.4rem, 2.4vw, 1.8rem)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {q.title}
                      <span
                        className="text-[var(--lg-rose-soft)] group-hover:text-[var(--lg-rose)] transition-colors duration-500"
                        style={{ fontSize: "0.7em" }}
                      >
                        {q.glyph}
                      </span>
                    </h3>
                  </div>
                  <div className="col-span-12 md:col-span-6 md:col-start-5">
                    <p
                      className="text-[var(--lg-cocoa)] leading-[1.7]"
                      style={{ fontSize: "0.98rem" }}
                    >
                      {q.desc}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-2 md:col-start-11 md:text-right">
                    <button
                      className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
                      style={{ fontSize: "1.1rem" }}
                    >
                      {q.cta} →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Keepsake */}
            <motion.div
              initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.95, ease: easeSoft }}
              className="mt-24 text-center max-w-2xl mx-auto pt-16"
            >
              <p
                className="font-cute text-[var(--lg-rose)] mb-4"
                style={{ fontSize: "1.4rem" }}
              >
                keepsake box ❀
              </p>
              <h3
                className="text-[var(--lg-ink)]"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 300,
                  fontSize: "clamp(1.8rem, 3.6vw, 2.4rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.025em",
                }}
              >
                quiet, <span className="font-serif-italic text-[var(--lg-rose)]">just for you.</span>
              </h3>
              <p
                className="mt-5 text-[var(--lg-cocoa)] leading-[1.7]"
                style={{ fontSize: "1rem" }}
              >
                things saved here never leave this device. open it when you're ready to read what
                you wrote.
              </p>
              <button
                className="group mt-8 inline-flex items-center gap-3 bg-[var(--lg-ink)] text-[var(--lg-cream)] py-4 px-7 rounded-full hover:bg-[var(--lg-rose)] transition-colors duration-700"
              >
                <span
                  style={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                  }}
                >
                  Open Keepsake
                </span>
                <span className="block w-6 h-px bg-[var(--lg-cream)] transition-all duration-500 group-hover:w-10" />
              </button>
              <div
                className="mt-12 text-[var(--lg-rose-soft)]"
                style={{ fontSize: "1.4rem" }}
              >
                ✿ ❀ ✿
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Composer({ active }: { active: string }) {
  const titles: Record<string, string> = {
    write: "write a Lategram",
    private: "keep it private",
    garden: "plant in the Garden",
    later: "send it later",
    time: "mark a Time Since",
    memory: "make a Memory Card",
  };

  return (
    <div className="max-w-[760px] mx-auto">
      <p
        className="text-center font-cute text-[var(--lg-rose)] mb-3"
        style={{ fontSize: "1.3rem" }}
      >
        composing ✿
      </p>
      <h2
        className="text-center text-[var(--lg-ink)] mb-8"
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 300,
          fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          letterSpacing: "-0.02em",
        }}
      >
        <span className="font-serif-italic text-[var(--lg-rose)]">{titles[active]}</span>
      </h2>

      <div className="border-t border-b border-[var(--lg-border)] py-7">
        <textarea
          placeholder="start with the feeling, not the form…"
          rows={9}
          className="w-full bg-transparent border-0 text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/50 focus:outline-none resize-none leading-relaxed"
          style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem" }}
        />
      </div>

      <p
        className="mt-3 text-center font-cute text-[var(--lg-cocoa)]"
        style={{ fontSize: "1.05rem" }}
      >
        drafts are kept softly on this device ❀
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <SmallField label="who is it for" placeholder="yourself, or a name" />
        <SmallField label="when should it arrive" placeholder="a date, or never" />
        <SmallField label="a title, if it has one" placeholder="optional" />
      </div>

      <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
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
    </div>
  );
}

function SmallField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label
        className="block font-cute text-[var(--lg-rose)] mb-1"
        style={{ fontSize: "1.05rem" }}
      >
        {label}
      </label>
      <input
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-[var(--lg-border)] py-2 text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/50 focus:outline-none focus:border-[var(--lg-rose)] transition-colors duration-500"
        style={{ fontSize: "0.95rem" }}
      />
    </div>
  );
}
