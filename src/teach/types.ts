// Lessons: how to work out one question, step by step, with a picture (board) that builds up as
// the steps go. Adapted from MN's teach model for adult QT content. Pure data: no DOM.
//
// Text fields use the app's light markup (see ui/math.ts): **bold**, and maths between $…$
// written in a small LaTeX subset (\frac, \sqrt, ^, _, \sum, \mat, \det, \times …).

export interface Lesson {
  /** A picture that builds up with the steps. */
  board?: Board;
  steps: Step[];
}

export interface Step {
  /** One or two short sentences (markup). */
  say: string;
  /** Working shown large under the sentence, one entry per line (maths markup, no $). */
  math?: string[];
  /** A short line after the working ("So the median class is 335.15 – 340.05."). */
  after?: string;
  /** The last step: states the answer (shown in green). */
  end?: boolean;
  /** A Book note attached to this step (where the printed book differs). */
  bookNote?: string;
}

/** A likely wrong answer and the note that names the mistake. */
export interface Slip {
  /** The wrong value as the learner would type it ("−14", "3/4"); for matrices, rows joined by ";" and cells by ",". */
  v: string;
  note: string;
}

/**
 * Board items are timed by step index (0 = the first step): an item shows from step `at`
 * (default 0) until before step `until` (default: stays), and is highlighted from step `hl`
 * (until `hlUntil`, default: stays).
 */
export interface Timed {
  at?: number;
  until?: number;
  hl?: number;
  hlUntil?: number;
}
/** Every field that holds a step number (checked against the lesson length). */
export const STEP_KEYS = ['at', 'until', 'hl', 'hlUntil'] as const;

export type Board = TableBoard | MatsBoard | LinesBoard;

/** A table: frequency tables, working columns, ratio tables. */
export interface TableBoard {
  kind: 'table';
  head?: string[];
  rows: TableRow[];
  /** First column holds row labels (bold). */
  label?: boolean;
  caption?: string;
}
export interface TableRow extends Timed {
  cells: (string | TableCell)[];
  note?: string;
}
export interface TableCell extends Timed {
  v: string;
  tone?: 'good' | 'bad' | 'dim' | 'key';
}

/**
 * Matrices and determinants side by side with operators between them:
 * A + B = C, a row-by-column product, a determinant with its expansion.
 */
export interface MatsBoard {
  kind: 'mats';
  terms: (MatTerm | OpTerm)[];
  caption?: string;
}
export interface OpTerm extends Timed {
  kind: 'op';
  /** Maths markup, e.g. "+", "\\times", "=", "3 \\times". */
  text: string;
}
export interface MatTerm extends Timed {
  kind: 'mat';
  /** Name shown before it ("A =", "D ="). Markup. */
  name?: string;
  /** paren ( ), square [ ], bar | | (determinant). */
  br: 'paren' | 'square' | 'bar';
  /** Cell contents (maths markup). */
  cells: string[][];
  /** Cells that appear later (a result being filled in). */
  fill?: (Timed & { r: number; c: number })[];
  marks?: Mark[];
}
export interface Mark extends Timed {
  /** row/col/cell: highlight; strike-row/strike-col: grey out (minor); diag/anti: 2×2 cross-multiplication lines. */
  type: 'row' | 'col' | 'cell' | 'strike-row' | 'strike-col' | 'diag' | 'anti';
  i?: number;
  j?: number;
  tone?: 'a' | 'b';
}

/** Lines of working that build up (a formula, then the values substituted, then the result). */
export interface LinesBoard {
  kind: 'lines';
  lines: (Timed & { math: string; tone?: 'key' | 'good' })[];
}

/** Is a timed item visible at this step? */
export const shownAt = (t: Timed, step: number): boolean => (t.at ?? 0) <= step && (t.until === undefined || step < t.until);
/** Is it highlighted at this step? */
export const litAt = (t: Timed, step: number): boolean =>
  t.hl !== undefined && t.hl <= step && (t.hlUntil === undefined || step < t.hlUntil) && shownAt(t, step);
