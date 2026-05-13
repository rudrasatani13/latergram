import { ReactNode } from "react";

interface SoftButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  /** accessible label for screen readers when button text is insufficient */
  ariaLabel?: string;
}

/**
 * Primary pill button matching Latergram's ink-to-rose interaction style.
 * Reuses --lg-ink, --lg-cream, --lg-rose from the design token palette.
 */
export function SoftButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  ariaLabel,
}: SoftButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`group inline-flex items-center gap-3 py-4 px-7 rounded-full transition-colors duration-700 ${
        disabled
          ? "bg-[var(--lg-border)] text-[var(--lg-cocoa)] cursor-not-allowed opacity-70"
          : "bg-[var(--lg-ink)] text-[var(--lg-cream)] hover:bg-[var(--lg-rose)]"
      }`}
    >
      <span
        style={{
          fontSize: "0.78rem",
          letterSpacing: "0.32em",
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
      <span
        className={`block w-6 h-px transition-all duration-500 ${
          disabled
            ? "bg-[var(--lg-cocoa)]"
            : "bg-[var(--lg-cream)] group-hover:w-10"
        }`}
      />
    </button>
  );
}
