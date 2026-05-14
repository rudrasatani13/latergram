import { Routes, Route, Navigate, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useAuth } from "./auth/useAuth";

const easeSoft = [0.22, 1, 0.36, 1] as const;

export default function App() {
  const location = useLocation();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--lg-cream)] flex items-center justify-center">
        <p className="font-cute text-[var(--lg-rose)] animate-pulse" style={{ fontSize: "1.2rem", letterSpacing: "0.1em" }}>
          loading softly ✿
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.55, ease: easeSoft }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/app" element={<HomePage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
