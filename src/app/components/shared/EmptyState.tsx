import { decor } from "../BrandAssets";

interface EmptyStateProps {
  /** Soft message to display, e.g. "No saved Lategrams yet." */
  message: string;
  /** Optional secondary message, e.g. "Saving is not connected yet." */
  note?: string;
}

/**
 * Standard empty-state component for sections with no content.
 * Preserves the soft visual language with envelope decoration.
 */
export function EmptyState({ message, note }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <img
        src={decor.envelopeMini}
        alt=""
        aria-hidden="true"
        className="w-12 h-12 object-contain mx-auto mb-3 opacity-70"
      />
      <p
        className="font-cute text-[var(--lg-cocoa)]"
        style={{ fontSize: "1.2rem" }}
      >
        {message}
      </p>
      {note && (
        <p
          className="font-cute text-[var(--lg-cocoa)]/70 mt-2"
          style={{ fontSize: "1rem" }}
        >
          {note}
        </p>
      )}
    </div>
  );
}
