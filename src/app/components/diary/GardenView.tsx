import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { DiaryFrame } from "./DiaryFrame";
import { blooms, decor } from "../BrandAssets";

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

const posts = [
  { to: "Amma", cat: "I miss you", body: "the lamp by your side of the bed still hums at 11pm. i let it.", felt: 124, bloom: blooms.softPeony },
  { to: "Ravi", cat: "I am sorry", body: "i should have asked how your day really was. i was too tired to listen.", felt: 88, bloom: blooms.blushPetal },
  { to: "Dadi", cat: "I never told you", body: "you taught me how to peel oranges in one ribbon. i think of you whenever i do.", felt: 211, bloom: blooms.coralCarnation },
  { to: "myself", cat: "To myself", body: "you're allowed to outgrow people who only loved a smaller version of you.", felt: 302, bloom: blooms.apricotRose },
  { to: "Sana", cat: "Goodbye", body: "i kept the receipt from our last coffee. it's not a goodbye, it's a bookmark.", felt: 76, bloom: blooms.pinkDaisy },
  { to: "future me", cat: "Hope", body: "small things still feel like small things. that's a kind of healing.", felt: 159, bloom: blooms.sunflower },
];

export function GardenView() {
  const [filter, setFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [reacted, setReacted] = useState<Record<number, boolean>>({});

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (!filter || p.cat === filter) &&
        (!q || p.to.toLowerCase().includes(q))
    );
  }, [filter, query]);

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
        <div className="flex items-center gap-2 bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-full px-4 py-2 focus-within:border-[var(--lg-rose)] transition-colors duration-300">
          <img src={decor.softHeart} alt="" aria-hidden className="w-4 h-4 object-contain opacity-80" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="amma, ravi, future me…"
            className="flex-1 bg-transparent border-0 focus:outline-none font-cute text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/45"
            style={{ fontSize: "1.15rem" }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="font-cute text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)]"
              style={{ fontSize: "1rem" }}
              aria-label="clear search"
            >
              clear
            </button>
          )}
        </div>
        {query && (
          <p
            className="font-cute text-[var(--lg-cocoa)] mt-2"
            style={{ fontSize: "1rem" }}
          >
            {list.length} {list.length === 1 ? "letter" : "letters"} for "{query}"
          </p>
        )}
      </div>

      {/* Filter chips */}
      <div className="px-7 pt-4 pb-4 border-b border-dashed border-[var(--lg-border)]">
        <div className="flex flex-wrap gap-2">
          <Chip active={filter === null} onClick={() => setFilter(null)}>all</Chip>
          {categories.map((c) => (
            <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {c.toLowerCase()}
            </Chip>
          ))}
        </div>
      </div>

      {/* Feed */}
      <motion.div
        key={`${filter ?? "all"}-${query}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="px-7 py-6 space-y-4 min-h-[280px]"
      >
        {list.map((p, i) => (
          <article
            key={`${p.cat}-${i}`}
            className="bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-5 shadow-[0_8px_22px_-16px_rgba(120,80,70,0.4)]"
          >
              <div className="flex items-start gap-3">
                <img src={p.bloom} alt="" className="w-10 h-10 object-contain shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <p
                      className="text-[var(--lg-rose)]"
                      style={{ fontSize: "0.74rem", letterSpacing: "0.22em", textTransform: "uppercase" }}
                    >
                      {p.cat}
                    </p>
                    <span className="text-[var(--lg-cocoa)]/50" style={{ fontSize: "0.78rem" }}>·</span>
                    <span
                      className="font-cute text-[var(--lg-cocoa)]"
                      style={{ fontSize: "1.05rem" }}
                    >
                      to {p.to}
                    </span>
                  </div>
                  <p
                    className="font-cute text-[var(--lg-ink)] leading-snug"
                    style={{ fontSize: "1.45rem" }}
                  >
                    {p.body}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      onClick={() => setReacted((r) => ({ ...r, [i]: !r[i] }))}
                      className="inline-flex items-center gap-2 text-[var(--lg-cocoa)] hover:text-[var(--lg-rose)] transition-colors duration-300"
                    >
                      <img
                        src={decor.softHeart}
                        alt=""
                        className={`w-5 h-5 object-contain transition-transform duration-300 ${
                          reacted[i] ? "scale-110" : ""
                        }`}
                      />
                      <span className="font-cute" style={{ fontSize: "1.1rem" }}>
                        felt this · {p.felt + (reacted[i] ? 1 : 0)}
                      </span>
                    </button>
                    <button
                      className="ml-auto text-[var(--lg-cocoa)]/70 hover:text-[var(--lg-error)] transition-colors duration-300"
                      style={{ fontSize: "0.85rem" }}
                    >
                      report softly
                    </button>
                  </div>
                </div>
              </div>
          </article>
        ))}
      </motion.div>

      {/* Footer compose */}
      <div className="px-7 pt-2 pb-6 flex items-center justify-between border-t border-dashed border-[var(--lg-border)]">
        <span className="font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.05rem" }}>
          posts here are anonymous, gently moderated
        </span>
        <button
          className="inline-flex items-center gap-2 bg-[var(--lg-rose)] text-white py-2.5 px-5 rounded-full hover:bg-[var(--lg-focus-rose)] transition-colors duration-300 shadow-[0_8px_22px_-12px_rgba(200,110,124,0.5)]"
          style={{ fontSize: "0.9rem", fontWeight: 600 }}
        >
          <img src={blooms.pinkDaisy} alt="" className="w-4 h-4 object-contain" />
          plant a feeling
        </button>
      </div>
    </DiaryFrame>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-cute px-3.5 py-1.5 rounded-full border transition-all duration-300 ${
        active
          ? "bg-[var(--lg-rose)] border-[var(--lg-rose)] text-white"
          : "bg-[var(--lg-cream)] border-[var(--lg-border)] text-[var(--lg-cocoa)] hover:border-[var(--lg-rose-soft)]"
      }`}
      style={{ fontSize: "1.05rem" }}
    >
      {children}
    </button>
  );
}
