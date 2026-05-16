import { Link } from "react-router";

interface TrustFooterProps {
  className?: string;
}

export function TrustFooter({ className = "" }: TrustFooterProps) {
  return (
    <footer className={`text-center py-10 ${className}`}>
      <nav
        aria-label="Legal and support"
        className="flex items-center justify-center gap-5 flex-wrap"
      >
        <Link
          to="/privacy"
          className="text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-300"
          style={{ fontSize: "0.88rem" }}
        >
          Privacy
        </Link>
        <span className="text-[var(--lg-border)]" aria-hidden="true">
          ·
        </span>
        <Link
          to="/terms"
          className="text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-300"
          style={{ fontSize: "0.88rem" }}
        >
          Terms
        </Link>
        <span className="text-[var(--lg-border)]" aria-hidden="true">
          ·
        </span>
        <Link
          to="/support"
          className="text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-300"
          style={{ fontSize: "0.88rem" }}
        >
          Support
        </Link>
      </nav>
    </footer>
  );
}
