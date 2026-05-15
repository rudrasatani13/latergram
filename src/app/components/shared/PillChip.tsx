import { ReactNode } from "react";

interface PillChipProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Filter chip / pill toggle matching Latergram's rose-highlighted style.
 * Used in Garden categories, Memory Card formats, etc.
 */
export function PillChip({ children, active, onClick, disabled = false }: PillChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      disabled={disabled}
      className={`min-h-11 font-cute px-4 py-2 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--lg-rose-soft)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-55 ${
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
