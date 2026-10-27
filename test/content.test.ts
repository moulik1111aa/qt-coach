import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../src/content/index.ts';
import { checkCourse, checkQuestion, type Problem } from '../src/content/check.ts';
import { addSubQ } from '../src/content/ch02/build.ts';
import { gradeCheckpoint } from '../src/core/grade.ts';

test('the course passes its content checks', () => {
  const problems = checkCourse(CHAPTERS, 60);
  assert.deepEqual(problems.slice(0, 8), []);
});

test('the checker catches a broken question', () => {
  const q = addSubQ({ id: 'x', topic: 'm-addsub', level: 'basic', source: 'written', title: 't' }, [[1, 2], [3, 4]], [[5, 6], [7, 8]], '+');
  // A lesson whose last step no longer states the answer.
  const broken = { ...q, lesson: { ...q.lesson, steps: q.lesson.steps.map((s, i, a) => (i === a.length - 1 ? { ...s, math: ['A + B = ?'] } : s)) } };
  const out: Problem[] = [];
  checkQuestion(broken, out);
  assert.ok(out.some((p) => p.issue.includes('does not state')));
  // A slip equal to the answer.
  const out2: Problem[] = [];
  checkQuestion({ ...q, checkpoints: [{ ...q.checkpoints[1], slips: [{ v: '6,8;10,12', note: 'x' }] }] }, out2);
  assert.ok(out2.some((p) => p.issue.includes('equals the answer')));
  // Undefined in text.
  const out3: Problem[] = [];
  checkQuestion({ ...q, prompt: 'Find undefined' }, out3);
  assert.ok(out3.length > 0);
});

test('the book addition example: 7, 14, 6, 7', () => {
  const t = CHAPTERS[0].topics[0];
  const bk = t.examples.find((e) => e.id === 'm-addsub:bk1')!;
  const res = bk.checkpoints[bk.checkpoints.length - 1];
  assert.equal(gradeCheckpoint(res, '7,14;6,7'), 'right');
  assert.equal(gradeCheckpoint(res, '7,14;6,8'), 'wrong');
});
