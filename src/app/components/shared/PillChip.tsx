import { ReactNode } from "react";

interface PillChipProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}

/**
 * Filter chip / pill toggle matching Latergram's rose-highlighted style.
 * Used in Garden categories, Memory Card formats, etc.
 */
export function PillChip({ children, active, onClick }: PillChipProps) {
  return (
    <button
      onClick={onClick}
      className={`font-cute px-3.5 py-1.5 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--lg-rose-soft)] focus:ring-offset-1 ${
        active
          ? "bg-[var(--lg-rose)] border-[var(--lg-rose)] text-white"
          : "bg-[var(--lg-cream)] border-[var(--lg-border)] text-[var(--lg-cocoa)] hover:border-[var(--lg-rose-soft)]"
      }`}
      style={{ fontSize: "1.05rem" }}
    >
      {children}
    </button>
  );
}
