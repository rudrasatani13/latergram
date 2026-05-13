interface DiarySectionHeaderProps {
  /** Left-side label text */
  label: string;
  /** Optional right-side element */
  right?: React.ReactNode;
}

/**
 * Standard header strip inside diary frame sections.
 * Matches the px-7 pt-6 pb-3 dashed border pattern used throughout.
 */
export function DiarySectionHeader({ label, right }: DiarySectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-7 pt-6 pb-3 border-b border-dashed border-[var(--lg-border)]">
      <span
        className="font-cute text-[var(--lg-rose)]"
        style={{ fontSize: "1.15rem" }}
      >
        {label}
      </span>
      {right}
    </div>
  );
}
