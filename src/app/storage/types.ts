export type LocalDestination = "private" | "later" | "garden" | "memory";

export interface LocalLategram {
  id: string;
  body: string;
  to?: string;
  subject?: string;
  destination: LocalDestination;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  characterCount: number;
}

export interface LocalDraft {
  body: string;
  to?: string;
  subject?: string;
  destination: LocalDestination;
  updatedAt: string;
}

export interface LocalCounter {
  id: string;
  title: string;
  start: string;
  context?: string;
  createdAt: string;
  updatedAt: string;
}
