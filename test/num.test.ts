import { test } from 'node:test';
import assert from 'node:assert/strict';
import { add, det, eq, fmt, fmtFixed, fmtFrac, fr, fromDecimal, matMul, M, mul, parseEntry, places, roundTo, sub, transpose, val } from '../src/core/num.ts';

test('fractions are exact', () => {
  assert.ok(eq(add(0.1, 0.2), fromDecimal('0.3')));
  assert.ok(eq(mul(fr(2, 3), 3), 2));
  assert.deepEqual(fr(6, -8), { n: -3, d: 4 });
  assert.equal(fmtFrac(fr(-7, 2)), '−7/2');
});

test('rounding is half away from zero', () => {
  assert.equal(fmtFixed(roundTo(fromDecimal('2.345'), 2), 2), '2.35');
  assert.equal(fmtFixed(roundTo(fromDecimal('-2.345'), 2), 2), '−2.35');
  assert.equal(fmtFixed(roundTo(fromDecimal('0.005'), 2), 2), '0.01');
  assert.equal(fmtFixed(roundTo(fromDecimal('-0.5'), 0), 0), '−1');
  assert.equal(fmtFixed(fr(1, 3), 2), '0.33');
  assert.equal(fmtFixed(fr(2, 3), 3), '0.667');
  assert.equal(fmtFixed(fromDecimal('-0.004'), 2), '0.00');
});

test('formatting uses only the places needed', () => {
  assert.equal(fmt(fromDecimal('336.620')), '336.62');
  assert.equal(fmt(fr(-14)), '−14');
  assert.equal(places(fr(1, 3)), Infinity);
  assert.equal(places(fromDecimal('18.325')), 3);
});

test('learner entries parse', () => {
  assert.ok(eq(parseEntry('−3.5')!, fr(-7, 2)));
  assert.ok(eq(parseEntry('-7/2')!, fr(-7, 2)));
  assert.ok(eq(parseEntry('.5')!, fr(1, 2)));
  assert.ok(eq(parseEntry('12.')!, fr(12)));
  assert.equal(parseEntry('1/0'), null);
  assert.equal(parseEntry('abc'), null);
  assert.equal(parseEntry(''), null);
  assert.equal(parseEntry('--2'), null);
});

test('matrix helpers', () => {
  const a = M([[3, 5], [1, 0]]);
  const b = M([[4, 9], [5, 7]]);
  assert.deepEqual(matMul(a, b).map((r) => r.map(val)), [[37, 62], [4, 9]]);
  assert.deepEqual(transpose([[1, 2, 3], [4, 5, 6]]), [[1, 4], [2, 5], [3, 6]]);
  assert.throws(() => matMul(M([[1, 2]]), M([[1, 2]])));
});

test('determinants match the book (ONGC: 225)', () => {
  const D = det([[7, 5, 14, 26], [3, 0, 6, 9], [2.5, 1.5, 9, 11], [1.5, 0.5, 3.5, 1.5]]);
  assert.equal(val(D), 225);
  const Da = det([[420, 5, 14, 26], [120, 0, 6, 9], [180, 1.5, 9, 11], [60, 0.5, 3.5, 1.5]]);
  assert.equal(val(Da) / val(D), 11);
  assert.equal(val(det([[12, -28, 9, 1], [-10, -22, 7, 0], [0, 0, 1, 0], [1, 5, -2, 15]])), -8188);
  assert.equal(val(sub(det([[1, 2], [3, 4]]), -2)), 0);
});
