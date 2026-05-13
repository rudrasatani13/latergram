import { ReactNode } from "react";

interface TextLinkButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

/**
 * Text-link-style button matching Latergram's cute underline interaction.
 * Uses font-cute + rose color + soft underline from the design system.
 */
export function TextLinkButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
}: TextLinkButtonProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`font-cute transition-colors duration-500 ${
        disabled
          ? "text-[var(--lg-cocoa)]/60 cursor-not-allowed"
          : "text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4"
      }`}
      style={{ fontSize: "1.2rem" }}
    >
      {children}
    </button>
  );
}
