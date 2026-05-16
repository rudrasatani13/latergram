import { motion } from "motion/react";
import { useNavigate, Navigate } from "react-router";
import { Header } from "../components/Header";
import { Grain } from "../components/Grain";
import { BackgroundPetals } from "../components/BackgroundPetals";
import { TrustFooter } from "../components/TrustFooter";
import { useAuth } from "../auth/useAuth";

const easeSoft = [0.22, 1, 0.36, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 18, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.95, ease: easeSoft },
};

const fates = [
  { title: "Write", desc: "open with the feeling, not the form.", glyph: "✿" },
  { title: "Keep Private", desc: "stay close to yourself, only.", glyph: "❀" },
  { title: "Late Letters", desc: "schedule words to arrive later.", glyph: "❁" },
  { title: "The Garden", desc: "closed in the product UI until it is intentionally opened.", glyph: "✾" },
  { title: "Time Since", desc: "a soft counter for what mattered.", glyph: "❃" },
  { title: "Memory Cards", desc: "export a PNG from saved writing or a saved counter.", glyph: "❀" },
];

const ritual = [
  { step: "one", title: "open softly", desc: "no prompts, no metrics — just a page that waits." },
  { step: "two", title: "say it", desc: "type the thing you didn't, or wouldn't, or couldn't." },
  { step: "three", title: "let it rest", desc: "save it on this device, keep shaping, or leave other paths for later." },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();

  if (session || user) {
    // User is logged in; redirect them to the app
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--lg-cream)]">
      <BackgroundPetals />
      <Grain />
      <div className="relative z-10">
        <Header current="landing" variant="full" />

        <main className="px-4 sm:px-6 md:px-12">
          <section className="max-w-[960px] mx-auto pt-14 sm:pt-16 pb-24 sm:pb-28 text-center">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: easeSoft }}
              className="font-cute text-[var(--lg-rose)] mb-5"
              style={{ fontSize: "1.5rem" }}
            >
              for the words you almost said ✿
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: easeSoft, delay: 0.1 }}
              className="text-[var(--lg-ink)]"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 300,
                fontSize: "clamp(3rem, 8vw, 6.5rem)",
                lineHeight: 0.96,
                letterSpacing: "-0.035em",
              }}
            >
              messages,
              <br />
              <span className="font-serif-italic text-[var(--lg-rose)]">said late.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="my-10 flex items-center justify-center gap-3"
            >
              <span className="w-12 h-px bg-[var(--lg-rose-soft)]" />
              <span className="text-[var(--lg-rose)]" style={{ fontSize: "1.2rem" }}>❀</span>
              <span className="w-12 h-px bg-[var(--lg-rose-soft)]" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: easeSoft, delay: 0.5 }}
              className="text-[var(--lg-cocoa)] leading-[1.8] max-w-xl mx-auto"
              style={{ fontSize: "1.05rem" }}
            >
              Latergram is a quiet place for the things you didn't say in time. write them down,
              keep them close, or let them find a gentle home.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: easeSoft, delay: 0.7 }}
              className="mt-10 flex items-center justify-center gap-7 flex-wrap"
            >
              <button
                onClick={() => navigate("/auth")}
                className="group min-h-12 inline-flex items-center gap-3 bg-[var(--lg-ink)] text-[var(--lg-cream)] py-4 px-7 rounded-full hover:bg-[var(--lg-rose)] transition-colors duration-700"
              >
                <span style={{ fontSize: "0.78rem", letterSpacing: "0.32em", textTransform: "uppercase" }}>
                  Begin softly
                </span>
                <span className="block w-6 h-px bg-[var(--lg-cream)] transition-all duration-500 group-hover:w-10" />
              </button>
              <button
                onClick={() => navigate("/app")}
                className="min-h-11 inline-flex items-center font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
                style={{ fontSize: "1.25rem" }}
              >
                or wander in →
              </button>
            </motion.div>
          </section>

          <motion.section
            {...reveal}
            className="max-w-[780px] mx-auto py-24 text-center border-t border-[var(--lg-border)]"
          >
            <p
              className="font-cute text-[var(--lg-rose)] mb-4"
              style={{ fontSize: "1.4rem" }}
            >
              a soft promise ❀
            </p>
            <h2
              className="text-[var(--lg-ink)]"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 300,
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
              }}
            >
              not everything needs an audience.{" "}
              <span className="font-serif-italic text-[var(--lg-rose)]">some things just need a place.</span>
            </h2>
          </motion.section>

          <section className="max-w-[1100px] mx-auto py-20 border-t border-[var(--lg-border)]">
            <div className="text-center mb-16">
              <p
                className="font-cute text-[var(--lg-rose)] mb-3"
                style={{ fontSize: "1.4rem" }}
              >
                six little fates ✿
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14">
              {fates.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.85, ease: easeSoft, delay: i * 0.05 }}
                  className="text-center"
                >
                  <span
                    className="block text-[var(--lg-rose)] mb-3"
                    style={{ fontSize: "1.6rem" }}
                  >
                    {f.glyph}
                  </span>
                  <h3
                    className="text-[var(--lg-ink)] mb-2"
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontWeight: 400,
                      fontSize: "1.5rem",
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-[var(--lg-cocoa)] leading-[1.6]"
                    style={{ fontSize: "0.98rem" }}
                  >
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="max-w-[1000px] mx-auto py-24 border-t border-[var(--lg-border)]">
            <div className="text-center mb-16">
              <p
                className="font-cute text-[var(--lg-rose)] mb-3"
                style={{ fontSize: "1.4rem" }}
              >
                a small ritual ❀
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
                three soft{" "}
                <span className="font-serif-italic text-[var(--lg-rose)]">steps.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {ritual.map((r, i) => (
                <motion.div
                  key={r.step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.85, ease: easeSoft, delay: i * 0.08 }}
                  className="text-center"
                >
                  <p
                    className="font-cute text-[var(--lg-rose)] mb-2"
                    style={{ fontSize: "1.3rem" }}
                  >
                    {r.step}
                  </p>
                  <h3
                    className="text-[var(--lg-ink)] mb-2"
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontWeight: 400,
                      fontSize: "1.4rem",
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {r.title}
                  </h3>
                  <p
                    className="text-[var(--lg-cocoa)] leading-[1.7]"
                    style={{ fontSize: "0.98rem" }}
                  >
                    {r.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <motion.section
            {...reveal}
            className="max-w-[780px] mx-auto py-28 text-center border-t border-[var(--lg-border)]"
          >
            <p
              className="font-cute text-[var(--lg-rose)] mb-5"
              style={{ fontSize: "1.5rem" }}
            >
              when you're ready ✿
            </p>
            <h2
              className="text-[var(--lg-ink)]"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 300,
                fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
              }}
            >
              say it now,
              <br />
              <span className="font-serif-italic text-[var(--lg-rose)]">even if it's late.</span>
            </h2>
            <button
              onClick={() => navigate("/auth")}
              className="group mt-10 min-h-12 inline-flex items-center gap-3 bg-[var(--lg-ink)] text-[var(--lg-cream)] py-4 px-7 rounded-full hover:bg-[var(--lg-rose)] transition-colors duration-700"
            >
              <span style={{ fontSize: "0.78rem", letterSpacing: "0.32em", textTransform: "uppercase" }}>
                Begin softly
              </span>
              <span className="block w-6 h-px bg-[var(--lg-cream)] transition-all duration-500 group-hover:w-10" />
            </button>
          </motion.section>

          <footer className="max-w-[1100px] mx-auto py-12 border-t border-[var(--lg-border)] text-center">
            <p
              className="font-cute text-[var(--lg-cocoa)] mb-4"
              style={{ fontSize: "1.15rem" }}
            >
              made gently — © Latergram ✿
            </p>
            <TrustFooter />
          </footer>
        </main>
      </div>
    </div>
  );
}
