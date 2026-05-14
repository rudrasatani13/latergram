import { brand } from "./BrandAssets";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export function Logo({ size = "md" }: LogoProps) {
  const dim = size === "sm" ? 28 : size === "lg" ? 48 : 36;
  const fs = size === "sm" ? "1.05rem" : size === "lg" ? "1.7rem" : "1.3rem";
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={brand.logo}
        alt="Latergram"
        style={{ width: dim, height: dim }}
        className="object-contain"
      />
      <span
        className="font-display text-[var(--lg-ink)]"
        style={{ fontSize: fs, fontWeight: 500 }}
      >
        Latergram
      </span>
    </div>
  );
}
