import { DiaryFrame } from "./DiaryFrame";
import { decor } from "../BrandAssets";
import { EmptyState } from "../shared/EmptyState";

export function GardenView() {
  return (
    <DiaryFrame
      caption="dear garden ✿"
      title={<span className="font-serif-italic text-[var(--lg-rose)]">the garden</span>}
    >
      {/* Closed Garden state */}
      <div className="px-4 sm:px-7 py-6 min-h-[320px]">
        <div className="rounded-[24px] border border-dashed border-[var(--lg-rose-soft)] bg-[var(--lg-paper)]/70 px-5 py-6 text-center">
          <img
            src={decor.softHeart}
            alt=""
            aria-hidden="true"
            className="mx-auto mb-4 h-10 w-10 object-contain opacity-80"
          />
          <EmptyState
            message="The Garden is not open yet."
            note="No public Garden activity or anonymous browsing is shown in the product UI."
          />
          <p className="mx-auto mt-4 max-w-[34rem] font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1rem", lineHeight: 1.55 }}>
            Safety and moderation are in place for future authenticated testing. The public Garden stays closed here until it is intentionally opened.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-7 pt-2 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 border-t border-dashed border-[var(--lg-border)]">
        <span className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.05rem" }}>
          no public posts are shown yet
        </span>
        <span
          className="inline-flex items-center gap-2 text-[var(--lg-cocoa)]/50 py-2.5 px-5"
          style={{ fontSize: "0.9rem", fontWeight: 600 }}
        >
          Garden closed
        </span>
      </div>
    </DiaryFrame>
  );
}
