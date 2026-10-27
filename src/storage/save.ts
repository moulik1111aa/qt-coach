// Versioned save for one learner: settings, topic progress, the mistake bank and test history.
// Written to a primary and a backup key; mirrored natively in the Android app (platform/native.ts).
// Adapted from MN's save store.

import type { Level } from '../content/types.ts';

export const SAVE_VERSION = 1;
const PRIMARY = 'aiio.save';
const BACKUP = 'aiio.save.bak';

export type ThemeChoice = 'system' | 'light' | 'dark';
export type TextSize = 'small' | 'normal' | 'large' | 'xl';

export interface Settings {
  theme: ThemeChoice;
  textSize: TextSize;
  /** Read steps aloud in the "Let's learn how" sheet. */
  readAloud: boolean;
}

export interface TopicProgress {
  /** Furthest Learn card reached (index), and whether the last one was reached. */
  learnAt: number;
  learnDone: boolean;
  /** Worked examples walked through to the end. */
  examplesDone: string[];
  /** Clean Basic questions solved (the practice ladder moves to Exam after 2). */
  basicClean: number;
  /** Exam-level questions solved clean in a row (no wrong checkpoint, no revealed step). */
  streak: number;
  mastered: boolean;
  /** Paper questions tried and solved clean, per level. */
  tried: Record<Level, number>;
  clean: Record<Level, number>;
  /** Hand-written questions solved clean (ids), so practice moves on to new ones. */
  solved: string[];
  /** Tough questions solved clean (ids). */
  tough: string[];
  /** Quick check: best score out of 5, and passed (4+). */
  checkBest: number;
  checkPassed: boolean;
  /** Theory topics: short answers and the share of key points covered (0–1). */
  shortScores: Record<string, number>;
  /** Last activity (ms). */
  last: number;
}

export interface Mistake {
  /** topic/question/checkpoint (generated questions: topic/gen id/checkpoint). */
  key: string;
  topic: string;
  /** Hand-written question id, or the generator to make a fresh one. */
  qid?: string;
  gen?: { id: string; level: Level };
  /** MCQ id (concept MCQs come back as they are). */
  mcq?: string;
  /** What went wrong, for the bank's list. */
  label: string;
  note?: string;
  added: string;
  /** Days on which it was answered right since being added. */
  rightDays: string[];
}

export interface TestResult {
  id: string;
  kind: 'chapter' | 'mock';
  chapter?: number;
  at: number;
  score: number;
  total: number;
  /** Per-topic right/total, for "weak topics". */
  byTopic: Record<string, [number, number]>;
}

export interface Place {
  topic: string;
  stage: 'learn' | 'examples' | 'paper' | 'check' | 'tough';
  at: number;
}

export interface SaveData {
  version: number;
  started: boolean;
  settings: Settings;
  topics: Record<string, TopicProgress>;
  primersSeen: string[];
  mistakes: Mistake[];
  tests: TestResult[];
  /** Where to continue from. */
  place?: Place;
}

export function freshSettings(): Settings {
  return { theme: 'system', textSize: 'normal', readAloud: false };
}

export function freshTopic(): TopicProgress {
  return {
    learnAt: 0,
    learnDone: false,
    examplesDone: [],
    basicClean: 0,
    streak: 0,
    mastered: false,
    tried: { basic: 0, exam: 0, tough: 0 },
    clean: { basic: 0, exam: 0, tough: 0 },
    solved: [],
    tough: [],
    checkBest: 0,
    checkPassed: false,
    shortScores: {},
    last: 0,
  };
}

export function freshSave(): SaveData {
  return { version: SAVE_VERSION, started: false, settings: freshSettings(), topics: {}, primersSeen: [], mistakes: [], tests: [] };
}

/** Parse a stored save; null if it is damaged or not ours. Fills fields added later. */
export function parse(raw: string | null): SaveData | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as Partial<SaveData>;
    if (!d || typeof d !== 'object' || typeof d.version !== 'number' || d.version > SAVE_VERSION || typeof d.topics !== 'object') return null;
    const base = freshSave();
    const out: SaveData = {
      ...base,
      ...d,
      settings: { ...base.settings, ...(d.settings ?? {}) },
      topics: {},
      mistakes: Array.isArray(d.mistakes) ? d.mistakes : [],
      tests: Array.isArray(d.tests) ? d.tests : [],
      primersSeen: Array.isArray(d.primersSeen) ? d.primersSeen : [],
    };
    for (const [id, t] of Object.entries(d.topics ?? {})) out.topics[id] = { ...freshTopic(), ...t };
    return out;
  } catch {
    return null;
  }
}

export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

export interface LoadResult {
  data: SaveData;
  source: 'primary' | 'backup' | 'new' | 'reset';
}

export class SaveStore {
  private readonly store: StorageAdapter;
  data: SaveData;
  readonly loadedFrom: LoadResult['source'];

  constructor(store: StorageAdapter) {
    this.store = store;
    const r = SaveStore.load(store);
    this.data = r.data;
    this.loadedFrom = r.source;
  }

  static load(store: StorageAdapter): LoadResult {
    const primaryRaw = store.get(PRIMARY);
    const backupRaw = store.get(BACKUP);
    const primary = parse(primaryRaw);
    if (primary) return { data: primary, source: 'primary' };
    const backup = parse(backupRaw);
    if (backup) return { data: backup, source: 'backup' };
    if (primaryRaw === null && backupRaw === null) return { data: freshSave(), source: 'new' };
    return { data: freshSave(), source: 'reset' };
  }

  save(): void {
    const json = JSON.stringify(this.data);
    const prev = this.store.get(PRIMARY);
    if (prev && parse(prev)) this.store.set(BACKUP, prev);
    this.store.set(PRIMARY, json);
    if (!prev) this.store.set(BACKUP, json);
  }

  update(fn: (d: SaveData) => void): void {
    fn(this.data);
    this.save();
  }

  /** A topic's progress (created on first use). */
  topic(id: string): TopicProgress {
    return (this.data.topics[id] ??= freshTopic());
  }

  /** Start again: everything except settings. */
  reset(): void {
    const settings = this.data.settings;
    this.data = { ...freshSave(), settings, started: true };
    this.save();
  }
}

/** localStorage adapter that never throws (private mode, blocked storage, previews). */
export function browserStorage(): StorageAdapter {
  const mem = new Map<string, string>();
  return {
    get(key) {
      try {
        return localStorage.getItem(key) ?? mem.get(key) ?? null;
      } catch {
        return mem.get(key) ?? null;
      }
    },
    set(key, value) {
      mem.set(key, value);
      try {
        localStorage.setItem(key, value);
      } catch {
        /* memory only */
      }
    },
  };
}

/** In-memory storage (tests). */
export function memoryStorage(init: Record<string, string> = {}): StorageAdapter & { dump(): Record<string, string> } {
  const m = new Map(Object.entries(init));
  return {
    get: (k) => m.get(k) ?? null,
    set: (k, v) => void m.set(k, v),
    dump: () => Object.fromEntries(m),
  };
}
