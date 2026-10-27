// Which paper question comes next. Hand-written questions come first (unsolved ones, in their
// written order); after them, generated ones give unlimited fresh practice. Pure.

import { createRng } from './rng.ts';
import { ladderLevel, writtenFor } from './progress.ts';
import type { Level, PaperQuestion, Topic } from '../content/types.ts';
import type { TopicProgress } from '../storage/save.ts';

export type PracticeSource = { kind: 'ladder' } | { kind: 'level'; level: Level } | { kind: 'tough' };

export function levelFor(tp: TopicProgress, src: PracticeSource): Level {
  return src.kind === 'ladder' ? ladderLevel(tp) : src.kind === 'level' ? src.level : 'tough';
}

/** Make a generated question again from its generator id and seed. */
export function regenerate(t: Topic, genId: string, level: Level, seed: number): PaperQuestion | null {
  const g = t.gens.find((x) => x.id === genId);
  if (!g || !g.levels.includes(level)) return null;
  return g.make(createRng(seed), level);
}

/**
 * The next question for a practice source. `recent` holds ids seen in this session (not repeated
 * while alternatives exist); `seed` makes generated questions.
 */
export function pickQuestion(t: Topic, tp: TopicProgress, src: PracticeSource, seed: number, recent: string[]): PaperQuestion | null {
  const level = levelFor(tp, src);
  const written = writtenFor(t, tp, level);
  const fresh = written.find((q) => !tp.solved.includes(q.id) && !recent.includes(q.id));
  if (fresh) return fresh;
  const gens = t.gens.filter((g) => g.levels.includes(level));
  if (gens.length) {
    const g = gens[seed % gens.length];
    for (let i = 0; i < 20; i++) {
      const q = g.make(createRng(seed + i * 7919), level);
      if (!recent.includes(q.id)) return q;
    }
  }
  const again = written.find((q) => !recent.includes(q.id)) ?? written[0];
  return again ?? null;
}

/** How many questions a level has to offer ("∞" when a generator makes them). */
export function levelSupply(t: Topic, level: Level): number {
  return t.gens.some((g) => g.levels.includes(level)) ? Infinity : t.paper.filter((q) => q.level === level).length;
}
