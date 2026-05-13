import type { Variants, Transition } from "motion/react";

export const easeSoft = [0.22, 1, 0.36, 1] as const;
export const easeGentle = [0.4, 0, 0.2, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: easeSoft },
  },
};

export const stagger = (delayChildren = 0, stagger = 0.08): Transition => ({
  delayChildren,
  staggerChildren: stagger,
});

export const container: Variants = {
  hidden: {},
  show: { transition: stagger(0.05, 0.1) },
};

export const cardIn: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.85, ease: easeSoft },
  },
};

export const softHover = {
  whileHover: { y: -4, transition: { type: "spring" as const, stiffness: 200, damping: 18 } },
  whileTap: { scale: 0.98 },
};
