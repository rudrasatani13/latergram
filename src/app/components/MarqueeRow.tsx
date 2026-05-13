import { motion } from "motion/react";

interface MarqueeRowProps {
  items: string[];
  duration?: number;
}

export function MarqueeRow({ items, duration = 60 }: MarqueeRowProps) {
  const seq = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-[var(--lg-border)] bg-[var(--lg-paper)]/40 py-5">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {seq.map((s, i) => (
          <span
            key={i}
            className="font-serif-italic text-[var(--lg-cocoa)] flex items-center gap-12"
            style={{ fontSize: "1.5rem" }}
          >
            {s}
            <span className="text-[var(--lg-rose-soft)]">✿</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
