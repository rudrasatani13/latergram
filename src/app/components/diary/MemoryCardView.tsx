import { DiaryFrame } from "./DiaryFrame";
import { blooms, decor } from "../BrandAssets";
import { EmptyState } from "../shared/EmptyState";

export function MemoryCardView() {
  return (
    <DiaryFrame
      caption="dear keepsake card ❀"
      title={<span className="font-serif-italic text-[var(--lg-rose)]">memory cards</span>}
    >
      <div className="px-4 sm:px-7 py-6 min-h-[320px]">
        <div className="relative overflow-hidden rounded-[24px] border border-dashed border-[var(--lg-rose-soft)] bg-[var(--lg-paper)]/70 px-5 py-6 text-center">
          <img
            src={blooms.softPeony}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 object-contain opacity-45"
          />
          <img
            src={decor.keepsakeBoxHeart}
            alt=""
            aria-hidden="true"
            className="mx-auto mb-4 h-12 w-12 object-contain opacity-85"
          />
          <EmptyState
            message="Memory Cards are not live yet."
            note="No card generation, download, sharing, export, or placeholder card sources are available here."
          />
          <p className="mx-auto mt-4 max-w-[34rem] font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem", lineHeight: 1.55 }}>
            When this opens, cards should come from real saved writing only. For now, your words can stay in the writer or Keepsake Box.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-7 pt-2 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 border-t border-dashed border-[var(--lg-border)]">
        <span className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.05rem" }}>
          card output is not connected yet
        </span>
        <span
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-[var(--lg-border)] px-5 py-2.5 text-[var(--lg-cocoa)]/70"
          style={{ fontSize: "0.9rem", fontWeight: 600 }}
          aria-label="Memory Cards unavailable"
        >
          <img src={decor.keepsakeBoxHeart} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
          unavailable
        </span>
      </div>
    </DiaryFrame>
  );
}
