import { motion } from "motion/react";
import { CuteFlower } from "./CuteFlower";

const easeSoft = [0.22, 1, 0.36, 1] as const;

export function EnvelopeBouquet() {
  return (
    <div className="relative w-full max-w-[460px] aspect-square">
      {/* gentle layered glow — single slow loop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--lg-blush)] via-[var(--lg-paper)] to-transparent blur-3xl"
      />

      {/* envelope — entrance only, then resting */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: 6 }}
        transition={{ duration: 1.1, ease: easeSoft, delay: 0.1 }}
        whileHover={{ rotate: 3, y: -4, transition: { duration: 0.6, ease: easeSoft } }}
        className="absolute right-2 top-4 w-[78%]"
        style={{ willChange: "transform" }}
      >
        {/* slow vertical breath */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="relative bg-white rounded-[22px] border border-[var(--lg-border)] shadow-[0_30px_70px_-20px_rgba(92,61,48,0.28)] p-7 pt-7"
        >
          <div className="absolute right-4 top-4 w-14 h-16 bg-[var(--lg-blush)] border-2 border-dashed border-[var(--lg-rose-soft)] rounded-md flex items-center justify-center">
            <CuteFlower size={28} color="rose" />
          </div>
          <div className="absolute right-3 top-3 w-16 h-16 rounded-full border border-[var(--lg-rose-soft)] opacity-30" />
          <div className="absolute right-1 top-1 w-20 h-20 rounded-full border border-[var(--lg-rose-soft)] opacity-20" />

          <div className="pr-20">
            <p
              className="text-[var(--lg-ink)]"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.7rem", lineHeight: 1.05, fontStyle: "italic" }}
            >
              A letter<br />for later
            </p>
            <p className="mt-3 text-[var(--lg-cocoa)] font-handwritten" style={{ fontSize: "1rem", lineHeight: 1.4 }}>
              A quiet note kept here<br />until it has a real path.
            </p>
          </div>
          <div className="mt-7 border-t border-dashed border-[var(--lg-border)] pt-3">
            <p className="font-handwritten text-[var(--lg-rose)]" style={{ fontSize: "1.05rem" }}>
              I kept this somewhere soft ❀
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* bouquet — entrance, then very subtle sway */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.35, ease: easeSoft }}
        className="absolute left-0 bottom-0 w-[64%]"
      >
        <motion.div
          animate={{ rotate: [-1.2, 1.2, -1.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 100%" }}
        >
          <svg viewBox="0 0 220 220" className="w-full h-full">
            <ellipse cx="60" cy="150" rx="44" ry="14" fill="#A9C9A4" opacity="0.7" transform="rotate(-30 60 150)" />
            <ellipse cx="135" cy="160" rx="40" ry="13" fill="#A9C9A4" opacity="0.6" transform="rotate(20 135 160)" />
            <ellipse cx="105" cy="180" rx="30" ry="10" fill="#8AB18A" opacity="0.6" />
            <path d="M85 120 C 85 155, 95 175, 105 190" stroke="#8AB18A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M150 90 C 140 130, 115 160, 105 190" stroke="#8AB18A" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M40 100 C 50 130, 80 165, 105 190" stroke="#8AB18A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>

          <div className="absolute" style={{ left: "30%", top: "32%" }}>
            <CuteFlower size={70} color="rose" />
          </div>
          <div className="absolute" style={{ left: "62%", top: "20%" }}>
            <CuteFlower size={48} color="lavender" />
          </div>
          <div className="absolute" style={{ left: "8%", top: "28%" }}>
            <CuteFlower size={40} color="butter" />
          </div>
          <div className="absolute" style={{ left: "50%", top: "5%" }}>
            <CuteFlower size={26} color="blush" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
