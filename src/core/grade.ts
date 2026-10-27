// Grading checkpoint entries and MCQs. Pure.
//
// Rule (spec §6): an entry is right when, rounded to the stated places, it equals the answer
// rounded the same way. Fractions and decimals are interchangeable. Intermediate ("loose")
// checkpoints also accept ±1 in the last stated place, so rounding earlier is not punished.

import { eq, fmtFixed, fmtFrac, places, parseEntry, roundTo, sub, cmp, fr, type Frac } from './num.ts';
import type { Answer, Checkpoint } from '../content/types.ts';
import type { Slip } from '../teach/types.ts';

export type Verdict = 'right' | 'wrong' | 'invalid';

/** Grade one number against an answer with `dp` places. */
export function gradeNumber(given: string, answer: Frac, dp: number, loose = false): Verdict {
  const g = parseEntry(given);
  if (!g) return 'invalid';
  const a = roundTo(answer, dp);
  const r = roundTo(g, dp);
  if (eq(a, r)) return 'right';
  if (loose) {
    const unit = fr(1, 10 ** dp);
    const diff = sub(a, r);
    if (cmp(diff, unit) <= 0 && cmp(diff, fr(-1, 10 ** dp)) >= 0) return 'right';
  }
  return 'wrong';
}

/** A matrix entry: rows of strings. Wrong size → wrong. */
export function gradeMatrix(given: string[][], answer: Frac[][], dp: number, loose = false): Verdict {
  if (given.length !== answer.length || given.some((r, i) => r.length !== answer[i].length)) return 'wrong';
  let bad = false;
  for (let i = 0; i < answer.length; i++) {
    for (let j = 0; j < answer[i].length; j++) {
      const v = gradeNumber(given[i][j], answer[i][j], dp, loose);
      if (v === 'invalid') return 'invalid';
      if (v === 'wrong') bad = true;
    }
  }
  return bad ? 'wrong' : 'right';
}

/** Matrices are passed around as text "a,b;c,d". */
export const matText = (rows: string[][]): string => rows.map((r) => r.join(',')).join(';');
export const matRows = (s: string): string[][] => s.split(';').map((r) => r.split(','));

/** Grade an entry for a checkpoint. Matrix entries arrive as "a,b;c,d". */
export function gradeCheckpoint(cp: Checkpoint, given: string): Verdict {
  return gradeAnswer(cp.answer, given, !!cp.loose);
}

export function gradeAnswer(a: Answer, given: string, loose = false): Verdict {
  switch (a.kind) {
    case 'num':
      return gradeNumber(given, a.v, a.dp, loose);
    case 'matrix':
      return gradeMatrix(matRows(given), a.v, a.dp, loose);
    case 'choice':
      return given === a.v ? 'right' : a.options.includes(given) ? 'wrong' : 'invalid';
  }
}

/** The slip a wrong entry matches (graded with the answer's own rounding), if any. */
export function matchSlip(a: Answer, given: string, slips: Slip[] | undefined): Slip | null {
  if (!slips) return null;
  for (const s of slips) {
    if (a.kind === 'choice') {
      if (s.v === given) return s;
      continue;
    }
    if (a.kind === 'num') {
      const v = parseEntry(s.v);
      if (v && gradeNumber(given, v, a.dp) === 'right') return s;
    } else {
      const rows = matRows(s.v).map((r) => r.map((x) => parseEntry(x)));
      if (rows.some((r) => r.some((x) => !x))) continue;
      if (gradeMatrix(matRows(given), rows as Frac[][], a.dp) === 'right') return s;
    }
  }
  return null;
}

/** The answer as the app shows it ("337.11", "−3/4" stays as decimal when it terminates). */
export function answerText(a: Answer): string {
  switch (a.kind) {
    case 'num':
      return showNum(a.v, a.dp);
    case 'matrix':
      return matText(a.v.map((r) => r.map((x) => showNum(x, a.dp))));
    case 'choice':
      return a.v;
  }
}

/** A number for display under a rounding rule: exact if it fits, else rounded to dp. */
export function showNum(x: Frac, dp: number): string {
  if (places(x) <= dp) return fmtFixed(x, places(x));
  return fmtFixed(x, dp);
}

/** Exact text of a value for slips ("−14", "2.5", or "7/3" when it doesn't terminate). */
export function slipText(x: Frac): string {
  return Number.isFinite(places(x)) ? fmtFixed(x, places(x)) : fmtFrac(x);
}
