import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "./auth/useAuth";

const easeSoft = [0.22, 1, 0.36, 1] as const;
const LandingPage = lazy(() => import("./pages/LandingPage").then((module) => ({ default: module.LandingPage })));
const AuthPage = lazy(() => import("./pages/AuthPage").then((module) => ({ default: module.AuthPage })));
const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const RecipientLetterPage = lazy(() => import("./pages/RecipientLetterPage").then((module) => ({ default: module.RecipientLetterPage })));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[var(--lg-cream)] flex items-center justify-center px-4">
      <p className="font-cute text-[var(--lg-rose)] animate-pulse" style={{ fontSize: "1.2rem" }}>
        Loading...
      </p>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const { loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
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
        <Suspense fallback={<LoadingFallback />}>
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/app" element={<HomePage />} />
            <Route path="/letter/:token" element={<RecipientLetterPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
