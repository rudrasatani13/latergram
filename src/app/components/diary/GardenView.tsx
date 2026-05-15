import { useState } from "react";
import { DiaryFrame } from "./DiaryFrame";
import { decor } from "../BrandAssets";
import { PillChip } from "../shared/PillChip";
import { EmptyState } from "../shared/EmptyState";

const categories = [
  "I miss you",
  "I am sorry",
  "I never told you",
  "Goodbye",
  "To myself",
  "Hope",
  "Grief",
  "Almost love",
  "Memory",
];

export function GardenView() {
  const [filter, setFilter] = useState<string | null>(null);

  return (
    <DiaryFrame
      caption="dear garden ✿"
      title={<span className="font-serif-italic text-[var(--lg-rose)]">the garden</span>}
    >
      {/* Search */}
      <div className="px-7 pt-6 pb-3 border-b border-dashed border-[var(--lg-border)]">
        <label
          className="font-cute text-[var(--lg-rose)] block mb-1.5"
          style={{ fontSize: "1.15rem" }}
        >
          search by person
        </label>
        <div className="flex items-center gap-2 bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-full px-4 py-2">
          <img src={decor.softHeart} alt="" aria-hidden="true" className="w-4 h-4 object-contain opacity-80" />
          <input
            disabled
            placeholder="the Garden is closed for now"
            className="flex-1 bg-transparent border-0 focus:outline-none font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45 cursor-not-allowed"
            style={{ fontSize: "1.15rem" }}
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-7 pt-4 pb-4 border-b border-dashed border-[var(--lg-border)]">
        <div className="flex flex-wrap gap-2">
          <PillChip active={filter === null} onClick={() => setFilter(null)}>all</PillChip>
          {categories.map((c) => (
            <PillChip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {c.toLowerCase()}
            </PillChip>
          ))}
        </div>
      </div>

      {/* Closed Garden state */}
      <div className="px-7 py-6 min-h-[280px]">
        <EmptyState
          message="The Garden is not open yet."
          note="Posts are reviewed before they are shown."
        />
      </div>

      {/* Footer */}
      <div className="px-7 pt-2 pb-6 flex items-center justify-between border-t border-dashed border-[var(--lg-border)]">
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
