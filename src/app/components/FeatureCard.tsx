import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

export function FeatureCard({ icon, title, description, onClick }: FeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-6 bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-3xl shadow-[0_14px_40px_rgba(92,61,48,0.10)] hover:shadow-[0_18px_60px_rgba(92,61,48,0.14)] transition-all duration-300 hover:scale-[1.02] text-left"
    >
      <div className="mb-4 text-[var(--lg-rose)]">
        {icon}
      </div>
      <h3 className="mb-2 text-[var(--lg-ink)]">{title}</h3>
      <p className="text-sm text-[var(--lg-cocoa)] leading-relaxed">
        {description}
      </p>
    </button>
  );
}
