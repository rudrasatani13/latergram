import { ReactNode } from "react";

interface PaperCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** When true, renders as a clickable button element */
  interactive?: boolean;
}

/**
 * Soft paper card surface matching Latergram's diary card style.
 * Uses --lg-paper background, --lg-border, rounded corners and gentle shadow.
 */
export function PaperCard({
  children,
  className = "",
  onClick,
  interactive = false,
}: PaperCardProps) {
  const base =
    "bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-4 shadow-[0_8px_22px_-16px_rgba(120,80,70,0.4)]";
  const interactiveStyles = interactive
    ? "hover:-translate-y-0.5 transition-transform duration-300 text-left"
    : "";

  if (interactive || onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} ${interactiveStyles} ${className}`}
      >
        {children}
      </button>
    );
  }

  return <div className={`${base} ${className}`}>{children}</div>;
}
