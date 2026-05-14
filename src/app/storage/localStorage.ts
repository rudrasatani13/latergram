import type { LocalCounter, LocalDestination, LocalDraft, LocalLategram } from "./types";

export const LOCAL_STORAGE_SCHEMA_VERSION = 1;
export const LOCAL_STORAGE_NAMESPACE = "latergram:v1";

export const LOCAL_STORAGE_KEYS = {
  lategrams: `${LOCAL_STORAGE_NAMESPACE}:lategrams`,
  draft: `${LOCAL_STORAGE_NAMESPACE}:draft`,
  counters: `${LOCAL_STORAGE_NAMESPACE}:counters`,
} as const;

type StorageEnvelope<T> = {
  schemaVersion: typeof LOCAL_STORAGE_SCHEMA_VERSION;
  value: T;
};

type StorageWriteResult = {
  ok: boolean;
};

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStorageEnvelope(value: unknown): value is StorageEnvelope<unknown> {
  return (
    isRecord(value) &&
    value.schemaVersion === LOCAL_STORAGE_SCHEMA_VERSION &&
    Object.prototype.hasOwnProperty.call(value, "value")
  );
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isLocalDestination(value: unknown): value is LocalDestination {
  return value === "private" || value === "later" || value === "garden" || value === "memory";
}

function isLocalLategram(value: unknown): value is LocalLategram {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.body) &&
    isOptionalString(value.to) &&
    isOptionalString(value.subject) &&
    isLocalDestination(value.destination) &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    isNumber(value.wordCount) &&
    isNumber(value.characterCount)
  );
}

function isLocalDraft(value: unknown): value is LocalDraft {
  return (
    isRecord(value) &&
    isString(value.body) &&
    isOptionalString(value.to) &&
    isOptionalString(value.subject) &&
    isLocalDestination(value.destination) &&
    isString(value.updatedAt)
  );
}

function isLocalCounter(value: unknown): value is LocalCounter {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.title) &&
    isString(value.start) &&
    isOptionalString(value.context) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function isLocalLategramList(value: unknown): value is LocalLategram[] {
  return Array.isArray(value) && value.every(isLocalLategram);
}

function isLocalCounterList(value: unknown): value is LocalCounter[] {
  return Array.isArray(value) && value.every(isLocalCounter);
}

export function createLocalId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function safeRead<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T
): T {
  const storage = getLocalStorage();

  if (!storage) {
    return fallback;
  }

  try {
    const raw = storage.getItem(key);

    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!isStorageEnvelope(parsed)) {
      return fallback;
    }

    return validate(parsed.value) ? parsed.value : fallback;
  } catch {
    return fallback;
  }
}

export function safeWrite<T>(key: string, value: T): StorageWriteResult {
  const storage = getLocalStorage();

  if (!storage) {
    return { ok: false };
  }

  try {
    const envelope: StorageEnvelope<T> = {
      schemaVersion: LOCAL_STORAGE_SCHEMA_VERSION,
      value,
    };

    storage.setItem(key, JSON.stringify(envelope));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function safeDelete(key: string): StorageWriteResult {
  const storage = getLocalStorage();

  if (!storage) {
    return { ok: false };
  }

  try {
    storage.removeItem(key);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function readLocalLategrams() {
  return safeRead(LOCAL_STORAGE_KEYS.lategrams, [] as LocalLategram[], isLocalLategramList);
}

export function writeLocalLategrams(lategrams: LocalLategram[]) {
  return safeWrite(LOCAL_STORAGE_KEYS.lategrams, lategrams);
}

export function addLocalLategram(lategram: LocalLategram) {
  const lategrams = readLocalLategrams();
  return writeLocalLategrams([lategram, ...lategrams]);
}

export function removeLocalLategram(id: string) {
  const lategrams = readLocalLategrams();
  return writeLocalLategrams(lategrams.filter((lategram) => lategram.id !== id));
}

export function readLocalDraft() {
  return safeRead(LOCAL_STORAGE_KEYS.draft, null as LocalDraft | null, (value): value is LocalDraft | null => {
    return value === null || isLocalDraft(value);
  });
}

export function writeLocalDraft(draft: LocalDraft) {
  return safeWrite(LOCAL_STORAGE_KEYS.draft, draft);
}

export function deleteLocalDraft() {
  return safeDelete(LOCAL_STORAGE_KEYS.draft);
}

export function readLocalCounters() {
  return safeRead(LOCAL_STORAGE_KEYS.counters, [] as LocalCounter[], isLocalCounterList);
}

export function writeLocalCounters(counters: LocalCounter[]) {
  return safeWrite(LOCAL_STORAGE_KEYS.counters, counters);
}

export function addLocalCounter(counter: LocalCounter) {
  const counters = readLocalCounters();
  return writeLocalCounters([counter, ...counters]);
}

export function removeLocalCounter(id: string) {
  const counters = readLocalCounters();
  return writeLocalCounters(counters.filter((counter) => counter.id !== id));
}
