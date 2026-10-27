import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshSave, freshTopic, memoryStorage, SaveStore } from '../src/storage/save.ts';
import { addMistake, ladderLevel, recordCheck, recordPaper, reviseMistake, stages, toughUnlocked } from '../src/core/progress.ts';
import { topicById } from '../src/content/index.ts';
import type { PaperQuestion } from '../src/content/types.ts';

const topic = topicById('m-addsub')!;
const examQ = topic.paper.find((q) => q.level === 'exam')!;
const basicQ = topic.paper.find((q) => q.level === 'basic')!;
const toughQ = topic.paper.find((q) => q.level === 'tough')!;
const clean = { wrong: 0, revealed: 0 };
const DAY = 86_400_000;

test('the ladder moves from Basic to Exam after two clean Basics', () => {
  const tp = freshTopic();
  assert.equal(ladderLevel(tp), 'basic');
  recordPaper(tp, basicQ, clean, 0);
  recordPaper(tp, basicQ, { wrong: 1, revealed: 0 }, 0);
  assert.equal(ladderLevel(tp), 'basic');
  recordPaper(tp, basicQ, clean, 0);
  assert.equal(ladderLevel(tp), 'exam');
});

test('mastery needs three clean Exam questions in a row; a revealed step resets the streak', () => {
  const tp = freshTopic();
  recordPaper(tp, examQ, clean, 0);
  recordPaper(tp, examQ, clean, 0);
  recordPaper(tp, examQ, { wrong: 0, revealed: 1 }, 0);
  assert.equal(tp.streak, 0);
  assert.equal(tp.mastered, false);
  recordPaper(tp, examQ, clean, 0);
  recordPaper(tp, examQ, clean, 0);
  const r = recordPaper(tp, examQ, clean, 0);
  assert.equal(r.masteredNow, true);
  assert.ok(toughUnlocked(tp));
  // A later slip does not take mastery away.
  recordPaper(tp, examQ, { wrong: 2, revealed: 0 }, 0);
  assert.ok(tp.mastered);
});

test('tough questions are counted once each', () => {
  const tp = freshTopic();
  recordPaper(tp, toughQ, clean, 0);
  recordPaper(tp, toughQ, clean, 0);
  assert.deepEqual(tp.tough, [toughQ.id]);
  const gen: PaperQuestion = { ...toughQ, id: 'g', source: 'generated' };
  recordPaper(tp, gen, clean, 0);
  assert.ok(!tp.solved.includes('g'));
});

test('stages: the first unfinished stage is next', () => {
  const tp = freshTopic();
  assert.equal(stages(topic, tp).learn, 'next');
  tp.learnDone = true;
  assert.equal(stages(topic, tp).examples, 'next');
  tp.examplesDone = topic.examples.map((e) => e.id);
  assert.equal(stages(topic, tp).paper, 'next');
  tp.mastered = true;
  recordCheck(tp, 3, 0);
  assert.equal(stages(topic, tp).check, 'next');
  recordCheck(tp, 4, 0);
  assert.equal(stages(topic, tp).check, 'done');
});

test('mistake bank: out after right answers on two different days', () => {
  const d = freshSave();
  addMistake(d, { key: 'k', topic: 't', label: 'x' }, 0);
  assert.equal(reviseMistake(d, 'k', true, 10 * DAY), 'kept');
  assert.equal(reviseMistake(d, 'k', true, 10 * DAY + 1000), 'kept');
  assert.equal(d.mistakes[0].rightDays.length, 1);
  assert.equal(reviseMistake(d, 'k', false, 11 * DAY), 'kept');
  assert.equal(d.mistakes[0].rightDays.length, 0);
  reviseMistake(d, 'k', true, 12 * DAY);
  assert.equal(reviseMistake(d, 'k', true, 13 * DAY), 'cleared');
  assert.equal(d.mistakes.length, 0);
});

test('a damaged primary save loads the backup', () => {
  const mem = memoryStorage();
  const a = new SaveStore(mem);
  a.update((d) => {
    d.started = true;
  });
  a.update((d) => {
    d.primersSeen.push('p');
  });
  mem.set('aiio.save', '{broken');
  const b = new SaveStore(mem);
  assert.equal(b.loadedFrom, 'backup');
  assert.equal(b.data.started, true);
  // Fields added later are filled in.
  mem.set('aiio.save', JSON.stringify({ version: 1, topics: { x: { mastered: true } } }));
  const c = new SaveStore(mem);
  assert.equal(c.data.topics.x.mastered, true);
  assert.deepEqual(c.data.topics.x.tried, { basic: 0, exam: 0, tough: 0 });
});
