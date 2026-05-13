import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";

type Page = "landing" | "auth" | "home";

const easeSoft = [0.22, 1, 0.36, 1] as const;

export default function App() {
  const [page, setPage] = useState<Page>("landing");

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={page}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.55, ease: easeSoft }}
      >
        {page === "auth" && <AuthPage onNavigate={setPage} />}
        {page === "home" && <HomePage onNavigate={setPage} />}
        {page === "landing" && <LandingPage onNavigate={setPage} />}
      </motion.div>
    </AnimatePresence>
  );
}
