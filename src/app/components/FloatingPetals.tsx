import { motion } from "motion/react";
import { useMemo } from "react";

interface FloatingPetalsProps {
  count?: number;
}

export function FloatingPetals({ count = 8 }: FloatingPetalsProps) {
  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const hues = ["#F3B8BF", "#C9B7E8", "#F7D978", "#FBE3DF"] as const;
        return {
          id: i,
          left: 5 + Math.random() * 90,
          top: -10 - Math.random() * 20,
          delay: -Math.random() * 30,
          duration: 28 + Math.random() * 18,
          size: 10 + Math.random() * 14,
          drift: 30 + Math.random() * 50,
          rotate: Math.random() * 360,
          rotateEnd: 180 + Math.random() * 360,
          hue: hues[i % hues.length],
        };
      }),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      {items.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            y: "0vh",
            x: 0,
            opacity: 0,
            rotate: p.rotate,
          }}
          animate={{
            y: ["0vh", "115vh"],
            x: [0, p.drift, -p.drift * 0.6, p.drift * 0.4, 0],
            opacity: [0, 0.55, 0.55, 0.4, 0],
            rotate: [p.rotate, p.rotateEnd],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: [0.4, 0.0, 0.2, 1],
            times: [0, 0.15, 0.5, 0.85, 1],
          }}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            willChange: "transform, opacity",
          }}
        >
          <Petal color={p.hue} />
        </motion.div>
      ))}
    </div>
  );
}

function Petal({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full" style={{ filter: "blur(0.3px)" }}>
      <path
        d="M12 3 C 16 7, 19 11, 12 21 C 5 11, 8 7, 12 3 Z"
        fill={color}
        opacity="0.7"
      />
    </svg>
  );
}
