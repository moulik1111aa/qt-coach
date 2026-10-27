// Content checks (spec §10), shared by scripts/check-content.ts and the unit tests.
// Every lesson ends by stating the answer, checkpoints point at real steps in order, slips never
// equal the answer, MCQ options are distinct, board timings fit the lesson, no text contains
// "undefined"/"NaN", and every topic has its minimum content.

import { createRng, subSeed } from '../core/rng.ts';
import { gradeAnswer } from '../core/grade.ts';
import { mathHtml, richHtml } from '../ui/math.ts';
import { STEP_KEYS, type Board, type Lesson } from '../teach/types.ts';
import { answerShown } from './kit.ts';
import { LEVELS, type Chapter, type Generator, type Mcq, type PaperQuestion, type Topic } from './types.ts';

export interface Problem {
  where: string;
  issue: string;
}

const BAD = /undefined|NaN|\[object |Infinity/;

/** Normalise text for "does the last step state the answer". */
const norm = (s: string) =>
  s.replace(/\\times/g, '×').replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2').replace(/−/g, '-').replace(/\\,/g, '').replace(/[\s,{}$]/g, '').replace(/\\text/g, '');

function boardSteps(b: Board): number[] {
  const out: number[] = [];
  const visit = (o: unknown) => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) {
      o.forEach(visit);
      return;
    }
    for (const [k, v] of Object.entries(o)) {
      if ((STEP_KEYS as readonly string[]).includes(k) && typeof v === 'number') out.push(v);
      else visit(v);
    }
  };
  visit(b);
  return out;
}

/** Render every markup string so a malformed one fails here, not on a phone. */
function renders(where: string, text: string | undefined, maths: boolean, out: Problem[]): void {
  if (text === undefined) return;
  if (BAD.test(text)) out.push({ where, issue: `bad text: ${text.slice(0, 80)}` });
  try {
    if (maths) mathHtml(text);
    else richHtml(text);
  } catch (e) {
    out.push({ where, issue: `markup: ${(e as Error).message}` });
  }
}

export function checkLesson(where: string, l: Lesson, out: Problem[]): void {
  if (!l.steps.length) out.push({ where, issue: 'lesson has no steps' });
  const last = l.steps[l.steps.length - 1];
  if (last && !last.end) out.push({ where, issue: 'last step is not marked end' });
  l.steps.forEach((s, i) => {
    renders(`${where} step ${i}`, s.say, false, out);
    s.math?.forEach((m) => renders(`${where} step ${i} math`, m, true, out));
    renders(`${where} step ${i} after`, s.after, false, out);
    renders(`${where} step ${i} note`, s.bookNote, false, out);
  });
  if (l.board) {
    const max = boardSteps(l.board).reduce((a, b) => Math.max(a, b), 0);
    if (max > l.steps.length) out.push({ where, issue: `board timing ${max} beyond ${l.steps.length} steps` });
    try {
      JSON.stringify(l.board);
    } catch {
      out.push({ where, issue: 'board not serialisable' });
    }
    const text = JSON.stringify(l.board);
    if (BAD.test(text)) out.push({ where, issue: 'board contains undefined/NaN' });
  }
}

export function checkQuestion(q: PaperQuestion, out: Problem[]): void {
  const where = q.id;
  renders(`${where} prompt`, q.prompt, false, out);
  renders(`${where} note`, q.bookNote, false, out);
  checkLesson(where, q.lesson, out);
  if (q.data && BAD.test(JSON.stringify(q.data))) out.push({ where, issue: 'data contains undefined/NaN' });
  if (!q.checkpoints.length) out.push({ where, issue: 'no checkpoints' });
  if (q.checkpoints.length > 6) out.push({ where, issue: `${q.checkpoints.length} checkpoints (max 6)` });
  let prev = -1;
  const ids = new Set<string>();
  for (const cp of q.checkpoints) {
    if (ids.has(cp.id)) out.push({ where, issue: `duplicate checkpoint id ${cp.id}` });
    ids.add(cp.id);
    renders(`${where}/${cp.id} label`, cp.label, false, out);
    renders(`${where}/${cp.id} ask`, cp.ask, false, out);
    if (cp.step < 0 || cp.step >= q.lesson.steps.length) out.push({ where, issue: `checkpoint ${cp.id} points at step ${cp.step}` });
    if (cp.step < prev) out.push({ where, issue: `checkpoint ${cp.id} is out of order` });
    prev = cp.step;
    for (const s of cp.slips ?? []) {
      if (gradeAnswer(cp.answer, s.v) === 'right') out.push({ where, issue: `slip ${s.v} equals the answer of ${cp.id}` });
      renders(`${where}/${cp.id} slip`, s.note, false, out);
    }
    if (cp.answer.kind === 'num' && BAD.test(String(cp.answer.v.n / cp.answer.v.d))) out.push({ where, issue: `checkpoint ${cp.id} is not a number` });
  }
  // The final checkpoint's value is stated in the last step.
  const fin = q.checkpoints[q.checkpoints.length - 1];
  const last = q.lesson.steps[q.lesson.steps.length - 1];
  if (fin && last) {
    const text = norm([last.say, ...(last.math ?? []), last.after ?? ''].join(' '));
    const wanted = answerShown(fin.answer).map(norm);
    const ok = fin.answer.kind === 'matrix' ? wanted.every((x) => text.includes(x)) : wanted.some((x) => text.includes(x));
    if (!ok) out.push({ where, issue: `last step does not state ${fin.id} = ${wanted[0]}` });
  }
}

export function checkMcq(m: Mcq, out: Problem[]): void {
  const where = m.id;
  renders(`${where} stem`, m.stem, false, out);
  renders(`${where} why`, m.why, false, out);
  m.options.forEach((o) => renders(`${where} option`, o, false, out));
  if (m.options.length < 3) out.push({ where, issue: 'fewer than 3 options' });
  if (new Set(m.options.map((o) => o.trim())).size !== m.options.length) out.push({ where, issue: 'duplicate options' });
  if (m.answer < 0 || m.answer >= m.options.length) out.push({ where, issue: 'answer index out of range' });
}

/** Run a generator over many seeds per level. */
export function checkGenerator(g: Generator, seeds: number, out: Problem[]): void {
  for (const level of g.levels) {
    for (let i = 0; i < seeds; i++) {
      const seed = subSeed(0x5eed, i);
      try {
        const q = g.make(createRng(seed), level);
        if (q.level !== level) out.push({ where: `${g.id}#${i}`, issue: `asked for ${level}, made ${q.level}` });
        const before = out.length;
        checkQuestion(q, out);
        if (out.length > before) {
          // One failing seed is enough to report per level.
          out.splice(before + 1);
          out[before].where = `${g.id}[${level} seed ${i}] ${out[before].where}`;
          break;
        }
        if (g.mcq && i % 10 === 0) checkMcq(g.mcq(createRng(seed), level), out);
      } catch (e) {
        out.push({ where: `${g.id}[${level} seed ${i}]`, issue: `threw: ${(e as Error).message}` });
        break;
      }
    }
  }
}

/** Minimum content per topic (spec §4.2). */
export function checkTopic(t: Topic, out: Problem[]): void {
  const where = t.id;
  if (!t.cards.length) out.push({ where, issue: 'no Learn cards' });
  for (const c of t.cards) {
    renders(`${where}/${c.id} title`, c.title, false, out);
    for (const b of c.body) {
      if ('math' in b) renders(`${where}/${c.id}`, b.math, true, out);
      else if ('list' in b) b.list.forEach((x) => renders(`${where}/${c.id}`, x, false, out));
      else if ('table' in b) b.table.rows.flat().concat(b.table.head ?? []).forEach((x) => renders(`${where}/${c.id}`, x, false, out));
      else if ('def' in b) {
        renders(`${where}/${c.id}`, b.def, false, out);
        renders(`${where}/${c.id}`, b.text, false, out);
      } else if ('board' in b) {
        if (BAD.test(JSON.stringify(b.board))) out.push({ where: `${where}/${c.id}`, issue: 'board contains undefined/NaN' });
      } else renders(`${where}/${c.id}`, Object.values(b)[0] as string, false, out);
    }
  }
  const mcqs = t.mcqs.length;
  if (t.kind === 'theory') {
    if (mcqs < 15) out.push({ where, issue: `${mcqs} MCQs (theory needs 15)` });
    if ((t.short?.length ?? 0) < 4) out.push({ where, issue: `${t.short?.length ?? 0} short answers (needs 4)` });
  } else {
    if (mcqs < 10) out.push({ where, issue: `${mcqs} MCQs (needs 10)` });
    const extra = t.examples.filter((e) => e.source !== 'book-example');
    for (const lv of LEVELS) if (!extra.some((e) => e.level === lv)) out.push({ where, issue: `no extra ${lv} worked example` });
    const exam = t.paper.filter((q) => q.level === 'exam').length;
    const tough = t.paper.filter((q) => q.level === 'tough').length;
    if (exam < 3) out.push({ where, issue: `${exam} hand-written Exam questions (needs 3)` });
    if (tough < 3) out.push({ where, issue: `${tough} Tough questions (needs 3)` });
    if (!t.gens.length) out.push({ where, issue: 'no generator' });
  }
  for (const s of t.short ?? []) {
    renders(`${s.id} prompt`, s.prompt, false, out);
    renders(`${s.id} model`, s.model, false, out);
    s.points.forEach((p) => renders(`${s.id} point`, p, false, out));
    if (s.points.length < 2) out.push({ where: s.id, issue: 'fewer than 2 key points' });
  }
}

/** Check a whole course. */
export function checkCourse(chapters: Chapter[], seeds: number): Problem[] {
  const out: Problem[] = [];
  const ids = new Set<string>();
  const unique = (id: string) => {
    if (ids.has(id)) out.push({ where: id, issue: 'duplicate id' });
    ids.add(id);
  };
  for (const ch of chapters) {
    for (const f of ch.formulas) {
      renders(`ch${ch.n} formula ${f.name}`, f.math, true, out);
      renders(`ch${ch.n} formula ${f.name}`, f.use, false, out);
    }
    for (const t of ch.topics) {
      unique(t.id);
      checkTopic(t, out);
      for (const q of [...t.examples, ...t.paper]) {
        unique(q.id);
        if (q.topic !== t.id) out.push({ where: q.id, issue: `topic is ${q.topic}, listed under ${t.id}` });
        checkQuestion(q, out);
      }
      for (const m of t.mcqs) {
        unique(m.id);
        checkMcq(m, out);
      }
      for (const g of t.gens) {
        unique(g.id);
        checkGenerator(g, seeds, out);
      }
    }
  }
  return out;
}
