// The shape of the course: chapters → topics → cards, worked examples, paper questions with
// checkpoints, MCQs, short answers and generators. Pure data and functions: no DOM.
//
// Rule: every number a learner is told is computed by code. Hand-written questions supply their
// data to a builder (content/<chapter>/build.ts); the builder computes the checkpoints, the
// lesson and the slips. Generators pick data and call the same builders.

import type { Rng } from '../core/rng.ts';
import type { Frac } from '../core/num.ts';
import type { Board, Lesson, Slip } from '../teach/types.ts';

export type Level = 'basic' | 'exam' | 'tough';
export const LEVELS: Level[] = ['basic', 'exam', 'tough'];
export const LEVEL_NAME: Record<Level, string> = { basic: 'Basic', exam: 'Exam', tough: 'Tough' };

/** A block of Learn-card content. Strings use the app markup (**bold**, $maths$). */
export type Block =
  | { p: string }
  | { math: string }
  | { list: string[]; ordered?: boolean }
  | { def: string; text: string }
  | { eg: string }
  | { tip: string }
  | { bookNote: string }
  | { board: Board }
  | { table: { head?: string[]; rows: string[][] } };

export interface Card {
  id: string;
  title: string;
  body: Block[];
  /** Book page (as printed in the unit) for cross-checking. */
  page?: number;
  /** Extra depth (e.g. the book's derivation) that can be skipped; placed after the required cards. */
  optional?: boolean;
}

/** How a checkpoint answer is entered and graded. */
export type Answer =
  | { kind: 'num'; v: Frac; dp: number }
  | { kind: 'matrix'; v: Frac[][]; dp: number }
  | { kind: 'choice'; options: string[]; v: string };

export interface Checkpoint {
  id: string;
  /** Short label (markup): "$D$", "$x$", "Median class". */
  label: string;
  /** What to enter, in words: "Value of the determinant $D$". */
  ask: string;
  answer: Answer;
  slips?: Slip[];
  /** Index of the lesson step that produces this value. */
  step: number;
  /** Intermediate values allow ±1 in the last place (rounding earlier in the working). */
  loose?: boolean;
}

export type Source = 'book-example' | 'book-discussion' | 'written' | 'generated';

export interface PaperQuestion {
  id: string;
  topic: string;
  level: Level;
  source: Source;
  /** Short name for lists ("Cramer's rule, 2 unknowns"). */
  title: string;
  /** The question (markup). */
  prompt: string;
  /** Data shown with the question (a table or matrices). */
  data?: Board;
  checkpoints: Checkpoint[];
  lesson: Lesson;
  /** Generated questions: how to make it again. */
  gen?: { id: string; seed: number };
  /** Book page for book questions. */
  page?: number;
  /** A Book note shown with the question. */
  bookNote?: string;
}

export interface Mcq {
  id: string;
  topic: string;
  level: Level;
  /** Question (markup). */
  stem: string;
  /** Options (markup); `answer` indexes the right one. Shown shuffled. */
  options: string[];
  answer: number;
  /** Why the answer is right (markup). */
  why: string;
}

export interface ShortAnswer {
  id: string;
  topic: string;
  prompt: string;
  /** Key points an examiner looks for. */
  points: string[];
  /** A model answer (markup), written as a student would in the exam. */
  model: string;
  marks?: number;
}

export interface Generator {
  id: string;
  topic: string;
  /** Levels this generator can make. */
  levels: Level[];
  make(rng: Rng, level: Level): PaperQuestion;
  /** A numerical MCQ built from the same question: answer plus slips as wrong options. */
  mcq?(rng: Rng, level: Level): Mcq;
}

export interface Topic {
  id: string;
  chapter: number;
  title: string;
  /** One line under the title. */
  blurb: string;
  kind: 'numeric' | 'theory';
  pages: number[];
  /** "Before you start" primers this topic needs. */
  primers?: string[];
  cards: Card[];
  /** Worked examples: the book's first, then the extra ones (Basic, Exam, Tough). */
  examples: PaperQuestion[];
  /** Hand-written paper questions (all levels, including the Tough set). */
  paper: PaperQuestion[];
  gens: Generator[];
  mcqs: Mcq[];
  short?: ShortAnswer[];
}

export interface FormulaEntry {
  name: string;
  /** Maths markup (no $). */
  math: string;
  /** What the symbols mean and when to use it (markup). */
  use: string;
}

export interface Chapter {
  n: number;
  /** Book unit number. */
  unit: number;
  title: string;
  blurb: string;
  topics: Topic[];
  formulas: FormulaEntry[];
}

export interface Primer {
  id: string;
  title: string;
  blurb: string;
  cards: Card[];
  practice: Mcq[];
}
