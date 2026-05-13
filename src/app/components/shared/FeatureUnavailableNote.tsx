import { motion, AnimatePresence } from "motion/react";

interface FeatureUnavailableNoteProps {
  message: string;
  visible?: boolean;
}

export function FeatureUnavailableNote({ message, visible = true }: FeatureUnavailableNoteProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 p-4 rounded-2xl border border-[var(--lg-border)] bg-[var(--lg-paper)]/50 text-center"
        >
          <p className="font-cute text-[var(--lg-cocoa)] m-0" style={{ fontSize: "1.05rem" }}>
            {message} <span className="text-[var(--lg-rose)] ml-1">✿</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
