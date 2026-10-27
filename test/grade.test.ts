import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fr, fromDecimal } from '../src/core/num.ts';
import { gradeAnswer, gradeMatrix, gradeNumber, matchSlip } from '../src/core/grade.ts';

const x = (s: string) => fromDecimal(s);

test('right when equal after rounding to the stated places', () => {
  assert.equal(gradeNumber('337.11', x('337.11'), 2), 'right');
  assert.equal(gradeNumber('337.1100', x('337.11'), 2), 'right');
  assert.equal(gradeNumber('337.114', x('337.11'), 2), 'right');
  assert.equal(gradeNumber('337.1', x('337.11'), 2), 'wrong');
  assert.equal(gradeNumber('2.5', x('2.50'), 2), 'right');
  assert.equal(gradeNumber('2/3', fr(2, 3), 2), 'right');
  assert.equal(gradeNumber('0.67', fr(2, 3), 2), 'right');
  assert.equal(gradeNumber('0.66', fr(2, 3), 2), 'wrong');
  assert.equal(gradeNumber('−14', fr(-14), 0), 'right');
  assert.equal(gradeNumber('14', fr(-14), 0), 'wrong');
  assert.equal(gradeNumber('x', fr(1), 0), 'invalid');
});

test('loose checkpoints accept ±1 in the last place', () => {
  assert.equal(gradeNumber('336.61', x('336.62'), 2, true), 'right');
  assert.equal(gradeNumber('336.63', x('336.62'), 2, true), 'right');
  assert.equal(gradeNumber('336.64', x('336.62'), 2, true), 'wrong');
  assert.equal(gradeNumber('336.61', x('336.62'), 2, false), 'wrong');
});

test('matrices grade cell by cell and need the right size', () => {
  const a = [[fr(37), fr(62)], [fr(4), fr(9)]];
  assert.equal(gradeMatrix([['37', '62'], ['4', '9']], a, 0), 'right');
  assert.equal(gradeMatrix([['37', '52'], ['4', '9']], a, 0), 'wrong');
  assert.equal(gradeMatrix([['37', '62']], a, 0), 'wrong');
  assert.equal(gradeMatrix([['37', ''], ['4', '9']], a, 0), 'invalid');
});

test('choices', () => {
  const a = { kind: 'choice' as const, options: ['A', 'B'], v: 'B' };
  assert.equal(gradeAnswer(a, 'B'), 'right');
  assert.equal(gradeAnswer(a, 'A'), 'wrong');
  assert.equal(gradeAnswer(a, 'C'), 'invalid');
});

test('slips match under the same rounding', () => {
  const a = { kind: 'num' as const, v: fr(-2), dp: 0 };
  const slips = [{ v: '10', note: 'added the cross term' }];
  assert.equal(matchSlip(a, '10', slips)?.note, 'added the cross term');
  assert.equal(matchSlip(a, '11', slips), null);
  const m = { kind: 'matrix' as const, v: [[fr(1), fr(2)]], dp: 0 };
  assert.ok(matchSlip(m, '2,1', [{ v: '2,1', note: 'swapped' }]));
});
