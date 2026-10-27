// Topic progress rules (spec §3): the four stages, the practice ladder (Basic → Exam), mastery
// (3 Exam questions in a row with no wrong checkpoint and no revealed step), the Tough set,
// the quick check (4 of 5), and the mistake bank (out after 2 right answers on different days).

import type { Level, PaperQuestion, Topic } from '../content/types.ts';
import type { Mistake, SaveData, TopicProgress } from '../storage/save.ts';

export const MASTERY_STREAK = 3;
export const BASIC_BEFORE_EXAM = 2;
export const CHECK_PASS = 4;
export const CHECK_SIZE = 5;
export const SHORT_PASS = 0.7;
export const SHORT_NEEDED = 3;

/** Local calendar day "YYYY-MM-DD". */
export function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export interface PaperResult {
  /** Checkpoints answered wrong at least once. */
  wrong: number;
  /** Steps revealed with "Show this step" (or after a wrong answer). */
  revealed: number;
}

export const isClean = (r: PaperResult): boolean => r.wrong === 0 && r.revealed === 0;

/** Record a finished paper question. Returns what changed, for the summary screen. */
export function recordPaper(tp: TopicProgress, q: PaperQuestion, r: PaperResult, now: number): { masteredNow: boolean; streak: number } {
  const clean = isClean(r);
  const wasMastered = tp.mastered;
  tp.tried[q.level]++;
  if (clean) tp.clean[q.level]++;
  if (clean && q.source !== 'generated' && !tp.solved.includes(q.id)) tp.solved.push(q.id);
  if (q.level === 'basic' && clean) tp.basicClean++;
  if (q.level === 'exam') {
    tp.streak = clean ? tp.streak + 1 : 0;
    if (tp.streak >= MASTERY_STREAK) tp.mastered = true;
  }
  if (q.level === 'tough' && clean && !tp.tough.includes(q.id)) tp.tough.push(q.id);
  tp.last = now;
  return { masteredNow: !wasMastered && tp.mastered, streak: tp.streak };
}

/** The level the practice ladder serves next. */
export function ladderLevel(tp: TopicProgress): Level {
  return tp.basicClean < BASIC_BEFORE_EXAM && !tp.mastered ? 'basic' : 'exam';
}

/** Hand-written questions for a level, the unsolved ones first (in their written order). */
export function writtenFor(t: Topic, tp: TopicProgress, level: Level): PaperQuestion[] {
  const qs = t.paper.filter((q) => q.level === level);
  return [...qs.filter((q) => !tp.solved.includes(q.id)), ...qs.filter((q) => tp.solved.includes(q.id))];
}

export const toughUnlocked = (tp: TopicProgress): boolean => tp.mastered;
export const toughDone = (t: Topic, tp: TopicProgress): boolean => {
  const ids = t.paper.filter((q) => q.level === 'tough').map((q) => q.id);
  return ids.length > 0 && ids.every((id) => tp.tough.includes(id));
};

export function recordCheck(tp: TopicProgress, score: number, now: number): void {
  tp.checkBest = Math.max(tp.checkBest, score);
  if (score >= CHECK_PASS) tp.checkPassed = true;
  tp.last = now;
}

export function recordShort(tp: TopicProgress, id: string, share: number, now: number): void {
  tp.shortScores[id] = Math.max(tp.shortScores[id] ?? 0, share);
  tp.last = now;
}

/** Theory topics count as "practised" once enough short answers reach 70%. */
export function shortPassed(t: Topic, tp: TopicProgress): boolean {
  const need = Math.min(SHORT_NEEDED, t.short?.length ?? 0);
  return Object.values(tp.shortScores).filter((s) => s >= SHORT_PASS).length >= need;
}

export type StageId = 'learn' | 'examples' | 'paper' | 'check';
export type StageState = 'todo' | 'next' | 'done';

/** Each stage's state, with the first unfinished one marked "next". */
export function stages(t: Topic, tp: TopicProgress): Record<StageId, StageState> {
  const done: Record<StageId, boolean> = {
    learn: tp.learnDone,
    examples: t.examples.length === 0 || t.examples.every((e) => tp.examplesDone.includes(e.id)),
    paper: t.kind === 'theory' ? shortPassed(t, tp) : tp.mastered,
    check: tp.checkPassed,
  };
  const order: StageId[] = t.examples.length ? ['learn', 'examples', 'paper', 'check'] : ['learn', 'paper', 'check'];
  const out = { learn: 'todo', examples: 'todo', paper: 'todo', check: 'todo' } as Record<StageId, StageState>;
  let marked = false;
  for (const s of order) {
    if (done[s]) out[s] = 'done';
    else if (!marked) {
      out[s] = 'next';
      marked = true;
    }
  }
  return out;
}

export const topicComplete = (t: Topic, tp: TopicProgress): boolean => {
  const s = stages(t, tp);
  return s.learn === 'done' && s.paper === 'done' && s.check === 'done' && (t.examples.length === 0 || s.examples === 'done');
};

// ---- Mistake bank ----

export function addMistake(d: SaveData, m: Omit<Mistake, 'added' | 'rightDays'>, now: number): void {
  const existing = d.mistakes.find((x) => x.key === m.key);
  if (existing) {
    existing.rightDays = [];
    existing.note = m.note ?? existing.note;
    return;
  }
  d.mistakes.unshift({ ...m, added: dayKey(now), rightDays: [] });
  if (d.mistakes.length > 200) d.mistakes.length = 200;
}

/** A revision attempt. Right on two different days removes it; wrong starts the count again. */
export function reviseMistake(d: SaveData, key: string, right: boolean, now: number): 'cleared' | 'kept' {
  const m = d.mistakes.find((x) => x.key === key);
  if (!m) return 'cleared';
  if (!right) {
    m.rightDays = [];
    return 'kept';
  }
  const day = dayKey(now);
  if (!m.rightDays.includes(day)) m.rightDays.push(day);
  if (m.rightDays.length >= 2) {
    d.mistakes = d.mistakes.filter((x) => x.key !== key);
    return 'cleared';
  }
  return 'kept';
}
