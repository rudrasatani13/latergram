export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-cute text-[var(--lg-rose)] mb-3"
      style={{ fontSize: "1.4rem" }}
    >
      {children}
    </p>
  );
}
