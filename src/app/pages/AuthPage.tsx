import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "../components/Header";
import { Grain } from "../components/Grain";
import { BackgroundPetals } from "../components/BackgroundPetals";
import { FeatureUnavailableNote } from "../components/shared";
import { SoftField } from "../components/shared";
import { useAuth } from "../auth/useAuth";

const easeSoft = [0.22, 1, 0.36, 1] as const;

export function AuthPage() {
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [statusMsg, setStatusMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { authAvailable, session, user, signIn, signUp, resetPassword, signOut } = useAuth();
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!email) {
      setIsError(true);
      setStatusMsg("Please enter your email to reset password.");
      return;
    }
    setIsSubmitting(true);
    setStatusMsg("");
    const { error } = await resetPassword(email);
    setIsSubmitting(false);
    if (error) {
      setIsError(true);
      setStatusMsg(error);
    } else {
      setIsError(false);
      setStatusMsg("Reset link sent. Check your email.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authAvailable) return;
    
    setIsSubmitting(true);
    setStatusMsg("");
    setIsError(false);

    if (mode === "signin") {
      const { error } = await signIn(email, password);
      setIsSubmitting(false);
      if (error) {
        setIsError(true);
        setStatusMsg(error);
      } else {
        navigate("/app");
      }
    } else {
      const { error, needsEmailConfirmation } = await signUp(email, password, { name });
      setIsSubmitting(false);
      if (error) {
        setIsError(true);
        setStatusMsg(error);
      } else if (needsEmailConfirmation) {
        setIsError(false);
        setStatusMsg("Check your email to continue.");
      } else {
        navigate("/app");
      }
    }
  };

  if (session || user) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[var(--lg-cream)]">
        <BackgroundPetals />
        <Grain />
        <div className="relative z-10">
          <Header current="auth" variant="minimal" />
          <main className="px-4 sm:px-6 md:px-12 pb-24 pt-8 sm:pt-12">
            <div className="max-w-[560px] mx-auto text-center">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: easeSoft }}
                className="font-cute text-[var(--lg-rose)] mb-5"
                style={{ fontSize: "1.5rem" }}
              >
                already here ✿
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
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
                You are signed in.
              </motion.h1>
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
              <p className="text-[var(--lg-cocoa)] mb-8">
                {user?.email || "signed in"}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => navigate("/app")}
                  className="min-h-12 bg-[var(--lg-ink)] text-[var(--lg-cream)] py-3 px-6 rounded-full hover:bg-[var(--lg-rose)] transition-colors duration-500 font-cute"
                >
                  Go to app
                </button>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                  className="min-h-12 bg-transparent border border-[var(--lg-rose-soft)] text-[var(--lg-rose)] py-3 px-6 rounded-full hover:bg-[var(--lg-rose-soft)] hover:text-white transition-colors duration-500 font-cute"
                >
                  Sign out
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--lg-cream)]">
      <BackgroundPetals />
      <Grain />
      <div className="relative z-10">
        <Header current="auth" variant="minimal" />

        <main className="px-4 sm:px-6 md:px-12 pb-24 pt-8 sm:pt-12">
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
              {!authAvailable 
                ? "Accounts are not connected in this environment. You can explore the local writing space for now." 
                : mode === "signin"
                  ? "Sign in to your Latergram account to access your private archive."
                  : "Create your Latergram account. Signed-in users can save private writing to their account."}
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, ease: easeSoft, delay: 0.5 }}
              className="mt-8 sm:mt-12 text-left"
              onSubmit={handleSubmit}
            >
              <AnimatePresence>
                {mode === "create" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, ease: easeSoft }}
                  >
                    <SoftField 
                      label="your name" 
                      placeholder="what should we call you" 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!authAvailable || isSubmitting}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <SoftField 
                label="email" 
                placeholder="you@somewhere" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!authAvailable || isSubmitting}
                required
              />
              <SoftField 
                label="password" 
                placeholder="••••••••" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!authAvailable || isSubmitting}
                required
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mt-7">
                {mode === "signin" ? (
                  <>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={!authAvailable || isSubmitting}
                      className="min-h-11 inline-flex items-center font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-500 disabled:opacity-50"
                      style={{ fontSize: "1.2rem" }}
                    >
                      reset password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("create");
                        setStatusMsg("");
                        setIsError(false);
                      }}
                      className="min-h-11 inline-flex items-center font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
                      style={{ fontSize: "1.2rem" }}
                    >
                      create account →
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setStatusMsg("");
                      setIsError(false);
                    }}
                    className="min-h-11 inline-flex items-center font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500 sm:ml-auto"
                    style={{ fontSize: "1.2rem" }}
                  >
                    ← sign in instead
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!authAvailable || isSubmitting}
                className="group mt-8 min-h-12 w-full inline-flex items-center justify-center gap-3 bg-[var(--lg-ink)] text-[var(--lg-cream)] py-4 px-7 rounded-full hover:bg-[var(--lg-rose)] transition-colors duration-700 disabled:opacity-50"
              >
                <span style={{ fontSize: "0.78rem", letterSpacing: "0.32em", textTransform: "uppercase" }}>
                  {isSubmitting ? "wait softly..." : mode === "signin" ? "Enter softly" : "Create my place"}
                </span>
                <span className="block w-6 h-px bg-[var(--lg-cream)] transition-all duration-500 group-hover:w-10" />
              </button>

              {statusMsg && (
                <div className={`mt-6 text-center ${isError ? "text-red-800" : "text-green-800"}`}>
                  <p className="font-cute text-lg">{statusMsg}</p>
                </div>
              )}

              {!authAvailable && (
                <div className="mt-6">
                  <FeatureUnavailableNote
                    message="Accounts are not connected in this environment."
                    visible={true}
                  />
                </div>
              )}

              <p
                className="mt-6 font-cute text-center text-[var(--lg-cocoa)]"
                style={{ fontSize: "1.05rem" }}
              >
                by continuing you agree to our{" "}
                <Link to="/terms" className="text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline underline-offset-2">
                  terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline underline-offset-2">
                  privacy policy
                </Link>
                {" "}✿
              </p>
            </motion.form>

            <div className="mt-16 text-[var(--lg-rose-soft)]" style={{ fontSize: "1.4rem" }}>
              ✿ ❀ ✿
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
