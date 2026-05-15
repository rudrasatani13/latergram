import { ReactNode } from "react";
import { decor } from "../BrandAssets";

interface DiaryFrameProps {
  caption: string;
  title: ReactNode;
  children: ReactNode;
  ribbon?: boolean;
  seal?: boolean;
}

export function DiaryFrame({ caption, title, children, ribbon = true, seal = true }: DiaryFrameProps) {
  return (
    <div className="max-w-[860px] mx-auto">
      <p
        className="text-center font-cute text-[var(--lg-rose)] mb-3"
        style={{ fontSize: "1.3rem" }}
      >
        {caption}
      </p>
      <h2
        className="text-center text-[var(--lg-ink)] mb-6 sm:mb-8"
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 300,
          fontSize: "clamp(1.7rem, 3vw, 2.2rem)",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>

      <div
        className="relative rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 md:p-8"
        style={{
          background:
            "linear-gradient(180deg, var(--lg-blush) 0%, var(--lg-paper) 60%, var(--lg-linen) 100%)",
          boxShadow:
            "0 30px 70px -30px rgba(120,80,70,0.35), inset 0 0 0 1px rgba(234,213,196,0.6)",
        }}
      >
        {ribbon && (
          <img
            src={decor.pinkRibbonBow}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -top-5 left-5 sm:-top-6 sm:left-8 w-12 h-12 sm:w-14 sm:h-14 object-contain rotate-[-8deg]"
          />
        )}
        {seal && (
          <img
            src={decor.heartWaxSeal}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -top-4 -right-2 sm:-top-5 sm:-right-3 w-12 h-12 sm:w-14 sm:h-14 object-contain rotate-[10deg]"
          />
        )}

        <div
          className="relative rounded-[22px] overflow-hidden bg-[var(--lg-cream)]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(234,213,196,0.7)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
