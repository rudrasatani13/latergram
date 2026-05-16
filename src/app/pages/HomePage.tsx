import { useCallback } from "react";
import { Link, useSearchParams } from "react-router";
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
import { useAuth } from "../auth/useAuth";
import { SUPPORT_EMAIL_CONFIGURED } from "../constants";

const easeSoft = [0.22, 1, 0.36, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 18, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.95, ease: easeSoft },
};

const VALID_SECTIONS = ["write", "private", "garden", "later", "time", "memory"] as const;
type Section = (typeof VALID_SECTIONS)[number];

function resolveSection(raw: string | null): Section {
  if (raw && (VALID_SECTIONS as readonly string[]).includes(raw)) {
    return raw as Section;
  }
  return "write";
}

const categories = [
  { id: "write" as Section, label: "Write", glyph: "✿" },
  { id: "private" as Section, label: "Keep Private", glyph: "❀" },
  { id: "later" as Section, label: "Late Letters", glyph: "❁" },
  { id: "time" as Section, label: "Time Since", glyph: "❃" },
  { id: "garden" as Section, label: "The Garden", glyph: "✾", status: "closed" },
  { id: "memory" as Section, label: "Memory Cards", glyph: "❀" },
];

const mobileNavItems = [
  { id: "write" as Section, label: "Write", glyph: "✿" },
  { id: "private" as Section, label: "Keep", glyph: "❀" },
  { id: "later" as Section, label: "Letters", glyph: "❁" },
  { id: "time" as Section, label: "Time", glyph: "❃" },
];

const quickAreas = [
  {
    title: "The Garden",
    desc: "a quiet anonymous space where posts are reviewed before they are shown. it is still closed for now.",
    cta: "view closed Garden",
    glyph: "✾",
    target: "garden" as Section,
  },
  {
    title: "Late Letters",
    desc: "letters can be scheduled, sent, and opened through secure links when delivery is configured.",
    cta: "view letters space",
    glyph: "❁",
    target: "later" as Section,
  },
  {
    title: "Time Since",
    desc: "a quiet counter for the days since something mattered.",
    cta: "view counter space",
    glyph: "❃",
    target: "time" as Section,
  },
  {
    title: "Memory Cards",
    desc: "export a real PNG from one saved Lategram or Time Since counter you choose.",
    cta: "make a card",
    glyph: "❀",
    target: "memory" as Section,
  },
];

function formatTodayLabel() {
  const monthDay = new Date()
    .toLocaleDateString("en-US", { month: "long", day: "numeric" })
    .toLowerCase();

  return `today, ${monthDay} ✿`;
}

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = resolveSection(searchParams.get("section"));
  const todayLabel = formatTodayLabel();
  const { session } = useAuth();
  const isSignedIn = Boolean(session?.user);
  const heroStorageCopy = isSignedIn
    ? "Signed in. Private saves can live in your account, and device-only saves are still available when you choose them."
    : "You can write locally without an account. Saved words stay only in this browser until you sign in.";
  const keepsakeCopy = isSignedIn
    ? "a place for the things you choose to keep. account saves stay with your sign-in, and device-only saves remain separate."
    : "a place for the things you choose to keep. local saves stay on this device unless you sign in and import them.";

  const setActive = useCallback(
    (section: Section) => {
      if (section === "write") {
        // "write" is the default, so we remove the param for a clean URL
        setSearchParams({}, { replace: false });
      } else {
        setSearchParams({ section }, { replace: false });
      }
    },
    [setSearchParams]
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--lg-cream)]">
      <BackgroundPetals />
      <Grain />
      <div className="relative z-10">
        <Header current="home" variant="minimal" />

        <main className="px-4 sm:px-6 md:px-12 pb-36 md:pb-24">
          <div className="max-w-[960px] mx-auto pt-8">
            {/* Hero */}
            <motion.div {...reveal} className="text-center pt-6 pb-14">
              <p
                className="font-cute text-[var(--lg-rose)] mb-5"
                style={{ fontSize: "1.5rem" }}
              >
                {todayLabel}
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
                {heroStorageCopy}
              </p>

              <div className="mt-7 mx-auto max-w-[640px] rounded-2xl border border-[var(--lg-border)] bg-[var(--lg-paper)]/75 px-5 py-4 text-left">
                <p className="font-cute text-[var(--lg-rose)] mb-1" style={{ fontSize: "1.08rem" }}>
                  private beta
                </p>
                <p className="text-[var(--lg-cocoa)] leading-[1.7]" style={{ fontSize: "0.94rem" }}>
                  Please test real writing, account saves, Memory Cards, and Late Letter delivery with yourself or trusted testers only. The Garden remains closed, and{" "}
                  {SUPPORT_EMAIL_CONFIGURED ? "support is configured for issue reports" : "the support inbox is still pending before public launch"}.{" "}
                  <Link to="/beta" className="text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline underline-offset-4">
                    Read beta notes
                  </Link>
                  .
                </p>
              </div>
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easeSoft, delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-y border-[var(--lg-border)] py-4 sm:py-6 mb-10 sm:mb-14"
            >
              {categories.map((c) => {
                const isActive = active === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActive(c.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`group min-h-11 rounded-full border px-3 py-2 transition-colors duration-500 inline-flex items-center justify-center gap-1.5 text-center ${
                      isActive
                        ? "border-[var(--lg-rose-soft)] bg-[var(--lg-paper)] text-[var(--lg-ink)]"
                        : "border-transparent text-[var(--lg-cocoa)] hover:border-[var(--lg-border)] hover:text-[var(--lg-ink)]"
                    }`}
                    style={{
                      fontSize: "0.74rem",
                      letterSpacing: "0.08em",
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
                    {"status" in c && (
                      <span className="sr-only">{c.status}</span>
                    )}
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
                {active === "write" && <DiaryComposer active={active} onViewSection={setActive} />}
                {active === "private" && <KeepPrivateView onViewSection={setActive} />}
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
                      onClick={() => setActive(q.target)}
                      className="min-h-11 inline-flex items-center font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
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
                {keepsakeCopy}
              </p>
              <button
                onClick={() => setActive("private")}
                className="group mt-8 min-h-12 inline-flex items-center gap-3 bg-[var(--lg-ink)] text-[var(--lg-cream)] py-4 px-7 rounded-full hover:bg-[var(--lg-rose)] transition-colors duration-700"
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
      <nav
        className="fixed inset-x-0 bottom-0 z-30 md:hidden border-t border-[var(--lg-border)] bg-[var(--lg-cream)]/95 px-3 pt-2 pb-[calc(0.65rem+env(safe-area-inset-bottom))] shadow-[0_-14px_34px_-28px_rgba(92,61,48,0.45)] backdrop-blur"
        aria-label="Main app sections"
      >
        <div className="mx-auto grid max-w-[420px] grid-cols-4 gap-1">
          {mobileNavItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`min-h-14 rounded-2xl border px-2 py-2 text-center transition-colors duration-300 ${
                  isActive
                    ? "border-[var(--lg-border)] bg-[var(--lg-paper)] text-[var(--lg-ink)]"
                    : "border-transparent text-[var(--lg-cocoa)] hover:bg-[var(--lg-paper)]/70"
                }`}
              >
                <span className="block text-[var(--lg-rose)]" aria-hidden="true">
                  {item.glyph}
                </span>
                <span className="block text-[0.72rem] font-semibold leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
