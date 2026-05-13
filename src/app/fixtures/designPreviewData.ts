/**
 * Design preview only. Do not treat as real user data. These fixtures preserve UI shape until the relevant features are replaced with real data.
 */

import { blooms } from "../components/BrandAssets";

export type DesignPreviewCounter = {
  title: string;
  start: string;
  context: string;
  bloom: string;
};

export const designPreviewKeepsakeLategrams = [
  {
    title: "to the version of me at 19",
    preview: "you didn't know yet, but it gets softer…",
    date: "may 04",
    bloom: blooms.softPeony,
  },
];

export const designPreviewKeepsakeLetters = [
  {
    title: "for amma — on her birthday",
    preview: "i'll be late saying it, but here it is.",
    date: "may 22",
    bloom: blooms.sunflower,
  },
];

export const designPreviewKeepsakeTimers = [
  {
    title: "since i started writing again",
    preview: "47 quiet days.",
    date: "started mar 26",
    bloom: blooms.pinkDaisy,
  },
];

export const designPreviewKeepsakeCards = [
  {
    title: "memory card · soft sundays",
    preview: "saved as a square",
    date: "apr 30",
    bloom: blooms.apricotRose,
  },
];

export const designPreviewCounters: DesignPreviewCounter[] = [
  {
    title: "since i started writing again",
    start: "2026-03-26",
    context: "small notebook, pink pen.",
    bloom: blooms.pinkDaisy,
  },
  {
    title: "since dadi's last call",
    start: "2025-11-02",
    context: "she said: eat something warm.",
    bloom: blooms.softPeony,
  },
];

export const designPreviewCardSources = [
  {
    id: "s1",
    label: "Lategram · 'soft sundays'",
    body: "soft sundays are a kind of forgiveness.",
  },
  {
    id: "s2",
    label: "Time Since · started writing again",
    body: "47 days of small, brave pages.",
  },
];
