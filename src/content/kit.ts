// Helpers for writing content: checkpoints from computed values, slips that never equal the
// answer, maths strings for working, and numerical MCQs built from a paper question.

import { F, eq, fmtFixed, fmtWork, places, roundTo, type Frac, type Num } from '../core/num.ts';
import { showNum, slipText } from '../core/grade.ts';
import type { Rng } from '../core/rng.ts';
import type { Slip } from '../teach/types.ts';
import type { Answer, Checkpoint, Level, Mcq, PaperQuestion } from './types.ts';

/** Default rounding: exact when it fits in 4 places, else 2. */
export const dpFor = (v: Num): number => {
  const p = places(v);
  return p <= 4 ? p : 2;
};

/** Slips as [value, note]; values equal to the answer (after rounding) and duplicates are dropped. */
function numSlips(answer: Frac, dp: number, raw: [Num | string, string][] | undefined): Slip[] {
  const out: Slip[] = [];
  const seen = new Set<string>();
  const ans = fmtFixed(roundTo(answer, dp), dp);
  for (const [v, note] of raw ?? []) {
    const text = typeof v === 'string' ? v : slipText(F(v));
    const key = typeof v === 'string' ? v : fmtFixed(roundTo(F(v), dp), dp);
    if (key === ans || seen.has(key)) continue;
    seen.add(key);
    out.push({ v: text, note });
  }
  return out;
}

export interface CpOpts {
  dp?: number;
  slips?: [Num | string, string][];
  loose?: boolean;
}

/** A number checkpoint. `step` is the lesson step that produces it. */
export function numCp(id: string, label: string, ask: string, v: Num, step: number, o: CpOpts = {}): Checkpoint {
  const value = F(v);
  const dp = o.dp ?? dpFor(value);
  return { id, label, ask, answer: { kind: 'num', v: value, dp }, slips: numSlips(value, dp, o.slips), step, loose: o.loose };
}

const matKey = (m: Num[][]) => m.map((r) => r.map((x) => slipText(F(x))).join(',')).join(';');

/** A matrix checkpoint, entered in a grid. */
export function matCp(
  id: string,
  label: string,
  ask: string,
  v: Num[][],
  step: number,
  o: { dp?: number; slips?: [Num[][], string][] } = {},
): Checkpoint {
  const value = v.map((r) => r.map(F));
  const dp = o.dp ?? Math.max(0, ...value.flat().map(dpFor));
  const ans = matKey(value);
  const seen = new Set<string>([ans]);
  const slips: Slip[] = [];
  for (const [m, note] of o.slips ?? []) {
    if (m.length !== value.length || m.some((r, i) => r.length !== value[i].length)) continue;
    const k = matKey(m);
    if (seen.has(k)) continue;
    seen.add(k);
    slips.push({ v: k, note });
  }
  return { id, label, ask, answer: { kind: 'matrix', v: value, dp }, slips, step };
}

/** A choice checkpoint ("Which class is the median class?", "Does AB exist?"). */
export function choiceCp(
  id: string,
  label: string,
  ask: string,
  options: string[],
  v: string,
  step: number,
  slips: [string, string][] = [],
): Checkpoint {
  if (!options.includes(v)) throw new Error(`${id}: answer "${v}" is not an option`);
  return {
    id,
    label,
    ask,
    answer: { kind: 'choice', options, v },
    slips: slips.filter(([s]) => s !== v && options.includes(s)).map(([s, note]) => ({ v: s, note })),
    step,
  };
}

// ---- Maths strings for working ----

/** A number in working: short exact decimal, else a fraction. Negative numbers keep their sign. */
export const w = (x: Num): string => texNum(fmtWork(F(x)));
/** In brackets when negative: "(−3)". For substituting into a formula. */
export const pw = (x: Num): string => (F(x).n < 0 ? `(${w(x)})` : w(x));
/** Rounded to dp places for display. */
export const wr = (x: Num, dp: number): string => texNum(showNum(F(x), dp));

/** "7/3" → \frac{7}{3} so fractions stack in working. */
function texNum(s: string): string {
  const m = /^(−?)(\d+)\/(\d+)$/.exec(s);
  return m ? `${m[1]}\\frac{${m[2]}}{${m[3]}}` : s;
}

/** A matrix in maths markup. br: mat ( ), smat [ ], det | |. */
export function texMat(rows: (Num | string)[][], br: 'mat' | 'smat' | 'det' = 'mat'): string {
  return `\\${br}{${rows.map((r) => r.map((x) => (typeof x === 'string' ? x : w(x))).join(' & ')).join(' \\\\ ')}}`;
}

/** Cells for a board matrix. */
export const cellsOf = (rows: (Num | string)[][]): string[][] => rows.map((r) => r.map((x) => (typeof x === 'string' ? x : w(x))));

// ---- Numerical MCQs from a paper question ----

/**
 * An MCQ from a paper question's checkpoint: the answer plus three wrong options, taken from
 * the checkpoint's slips first and then from near misses. Option 0 is the answer.
 */
export function mcqFrom(q: PaperQuestion, rng: Rng, stem?: string, cpIndex = q.checkpoints.length - 1): Mcq {
  const cp = q.checkpoints[cpIndex];
  const a = cp.answer;
  if (a.kind === 'matrix') throw new Error(`${q.id}: matrix checkpoints make poor MCQs`);
  const right = a.kind === 'num' ? showNum(a.v, a.dp) : a.v;
  const opts: string[] = [right];
  const add = (s: string) => {
    if (opts.length < 4 && !opts.includes(s)) opts.push(s);
  };
  for (const s of cp.slips ?? []) add(a.kind === 'num' ? showNum(F(parseOr(s.v, a.v)), a.dp) : s.v);
  if (a.kind === 'choice') for (const o of a.options) add(o);
  if (a.kind === 'num') {
    const near = nearMisses(a.v, a.dp, rng);
    for (const n of near) add(showNum(n, a.dp));
  }
  if (opts.length < 4) throw new Error(`${q.id}: could not make 4 options`);
  const notes = (cp.slips ?? []).map((s) => s.note);
  const why = `The working gives ${a.kind === 'num' ? `$${texNum(right)}$` : right}.${notes.length ? ` Common slip: ${notes[0]}` : ''}`;
  return {
    id: `${q.id}:mcq`,
    topic: q.topic,
    level: q.level,
    stem: stem ?? `${q.prompt}\n\n${cp.ask}?`,
    options: opts.map((o) => (a.kind === 'num' ? `$${texNum(o)}$` : o)),
    answer: 0,
    why,
  };
}

function parseOr(s: string, fallback: Frac): Frac {
  const t = s.replace(/−/g, '-');
  const m = /^(-?\d+)\/(\d+)$/.exec(t);
  try {
    if (m) return F(Number(m[1]) / Number(m[2]));
    return F(Number(t));
  } catch {
    return fallback;
  }
}

function nearMisses(v: Frac, dp: number, rng: Rng): Frac[] {
  const x = Number(fmtFixed(v, Math.max(dp, 0)).replace('−', '-'));
  const unit = 10 ** -dp;
  const cands = [
    -x,
    x + unit * rng.int(1, 3),
    x - unit * rng.int(1, 3),
    x * 2,
    x / 2,
    x + 10 * unit * rng.int(1, 5),
    x - 10 * unit * rng.int(1, 5),
  ].map((c) => roundTo(F(Number(c.toFixed(Math.max(dp, 0) + 2))), dp));
  return rng.shuffle(cands.filter((c) => !eq(c, roundTo(v, dp))));
}

/** A concept MCQ: write the right option first. */
export function mcq(id: string, topic: string, level: Level, stem: string, right: string, wrong: string[], why: string): Mcq {
  return { id, topic, level, stem, options: [right, ...wrong], answer: 0, why };
}

/** Answer text for checking that the lesson states it. */
export function answerShown(a: Answer): string[] {
  if (a.kind === 'num') return [showNum(a.v, a.dp), fmtWork(a.v)];
  if (a.kind === 'choice') return [a.v];
  return a.v.flat().map((x) => showNum(x, a.dp));
}
