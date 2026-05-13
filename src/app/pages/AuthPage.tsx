import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "../components/Header";
import { Grain } from "../components/Grain";
import { BackgroundPetals } from "../components/BackgroundPetals";

interface AuthPageProps {
  onNavigate: (page: "landing" | "auth" | "home") => void;
}

const easeSoft = [0.22, 1, 0.36, 1] as const;

export function AuthPage({ onNavigate }: AuthPageProps) {
  const [mode, setMode] = useState<"signin" | "create">("signin");

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--lg-cream)]">
      <BackgroundPetals />
      <Grain />
      <div className="relative z-10">
        <Header current="auth" onNavigate={onNavigate} variant="minimal" />

        <main className="px-6 md:px-12 pb-24 pt-12">
          <div className="max-w-[560px] mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: easeSoft }}
              className="font-cute text-[var(--lg-rose)] mb-5"
              style={{ fontSize: "1.5rem" }}
            >
              {mode === "signin" ? "welcome back ✿" : "begin softly ❀"}
            </motion.p>

            <AnimatePresence mode="wait">
              <motion.h1
                key={mode}
                initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
                transition={{ duration: 0.7, ease: easeSoft }}
                className="text-[var(--lg-ink)]"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 300,
                  fontSize: "clamp(2.4rem, 5.4vw, 4rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                {mode === "signin" ? (
                  <>
                    sign in,
                    <br />
                    <span className="font-serif-italic text-[var(--lg-rose)]">softly.</span>
                  </>
                ) : (
                  <>
                    a place for
                    <br />
                    <span className="font-serif-italic text-[var(--lg-rose)]">late words.</span>
                  </>
                )}
              </motion.h1>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="my-8 flex items-center justify-center gap-3"
            >
              <span className="w-10 h-px bg-[var(--lg-rose-soft)]" />
              <span className="text-[var(--lg-rose)]" style={{ fontSize: "1.1rem" }}>
                ✿
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
              {mode === "signin"
                ? "continue where you left off — your letters and gardens are waiting."
                : "create a small, private archive for the things you didn't say in time."}
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, ease: easeSoft, delay: 0.5 }}
              className="mt-12 text-left"
              onSubmit={(e) => {
                e.preventDefault();
                onNavigate("home");
              }}
            >
              <AnimatePresence>
                {mode === "create" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, ease: easeSoft }}
                  >
                    <Field label="your name" placeholder="what should we call you" type="text" />
                  </motion.div>
                )}
              </AnimatePresence>

              <Field label="email" placeholder="you@somewhere" type="email" />
              <Field label="password" placeholder="••••••••" type="password" />

              <div className="flex items-center justify-between mt-7">
                {mode === "signin" ? (
                  <>
                    <button
                      type="button"
                      className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500"
                      style={{ fontSize: "1.2rem" }}
                    >
                      reset password
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("create")}
                      className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
                      style={{ fontSize: "1.2rem" }}
                    >
                      create account →
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500 ml-auto"
                    style={{ fontSize: "1.2rem" }}
                  >
                    ← sign in instead
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="group mt-8 w-full inline-flex items-center justify-center gap-3 bg-[var(--lg-ink)] text-[var(--lg-cream)] py-4 px-7 rounded-full hover:bg-[var(--lg-rose)] transition-colors duration-700"
              >
                <span style={{ fontSize: "0.78rem", letterSpacing: "0.32em", textTransform: "uppercase" }}>
                  {mode === "signin" ? "Enter softly" : "Create my place"}
                </span>
                <span className="block w-6 h-px bg-[var(--lg-cream)] transition-all duration-500 group-hover:w-10" />
              </button>

              <p
                className="mt-6 font-cute text-center text-[var(--lg-cocoa)]"
                style={{ fontSize: "1.05rem" }}
              >
                by continuing you agree to our soft terms ✿
              </p>
            </motion.form>

            <div
              className="mt-16 text-[var(--lg-rose-soft)]"
              style={{ fontSize: "1.4rem" }}
            >
              ✿ ❀ ✿
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  placeholder,
}: {
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div className="mt-6">
      <label
        className="block font-cute text-[var(--lg-rose)] mb-1"
        style={{ fontSize: "1.15rem" }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-[var(--lg-border)] py-3 text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/50 focus:outline-none focus:border-[var(--lg-rose)] transition-colors duration-500"
        style={{ fontSize: "1rem" }}
      />
    </div>
  );
}
