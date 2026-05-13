import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Grain } from "../components/Grain";
import { BackgroundPetals } from "../components/BackgroundPetals";

const easeSoft = [0.22, 1, 0.36, 1] as const;

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--lg-cream)]">
      <BackgroundPetals />
      <Grain />
      <div className="relative z-10">
        <Header current="landing" variant="minimal" />

        <main className="px-6 md:px-12 pb-24 pt-16">
          <div className="max-w-[560px] mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: easeSoft }}
              className="font-cute text-[var(--lg-rose)] mb-5"
              style={{ fontSize: "1.5rem" }}
            >
              a little lost ✿
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: easeSoft, delay: 0.1 }}
              className="text-[var(--lg-ink)]"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 300,
                fontSize: "clamp(2.4rem, 5.4vw, 4rem)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              this page doesn't
              <br />
              <span className="font-serif-italic text-[var(--lg-rose)]">exist yet.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="my-8 flex items-center justify-center gap-3"
            >
              <span className="w-10 h-px bg-[var(--lg-rose-soft)]" />
              <span className="text-[var(--lg-rose)]" style={{ fontSize: "1.1rem" }}>
                ❀
              </span>
              <span className="w-10 h-px bg-[var(--lg-rose-soft)]" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: easeSoft, delay: 0.4 }}
              className="text-[var(--lg-cocoa)] leading-[1.7]"
              style={{ fontSize: "1rem" }}
            >
              the page you're looking for isn't here. maybe it moved, or maybe it was never written.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: easeSoft, delay: 0.6 }}
              className="mt-10 flex items-center justify-center gap-7 flex-wrap"
            >
              <button
                onClick={() => navigate("/")}
                className="group inline-flex items-center gap-3 bg-[var(--lg-ink)] text-[var(--lg-cream)] py-4 px-7 rounded-full hover:bg-[var(--lg-rose)] transition-colors duration-700"
              >
                <span style={{ fontSize: "0.78rem", letterSpacing: "0.32em", textTransform: "uppercase" }}>
                  Go home
                </span>
                <span className="block w-6 h-px bg-[var(--lg-cream)] transition-all duration-500 group-hover:w-10" />
              </button>
              <button
                onClick={() => navigate("/app")}
                className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
                style={{ fontSize: "1.25rem" }}
              >
                or start writing →
              </button>
            </motion.div>

            <div className="mt-16 text-[var(--lg-rose-soft)]" style={{ fontSize: "1.4rem" }}>
              ✿ ❀ ✿
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
