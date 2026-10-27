import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mathHtml, richHtml, spokenText } from '../src/ui/math.ts';

const count = (h: string, cls: string) => h.split(`class="${cls}`).length - 1;

test('fractions, roots and scripts', () => {
  const h = mathHtml('\\frac{N}{2} - F + \\sqrt{b^2 - 4ac}');
  assert.equal(count(h, 'mfrac'), 1);
  assert.equal(count(h, 'msqrt'), 1);
  assert.ok(h.includes('class="msup"><span class="mn">2</span>'));
  assert.ok(h.includes('−'));
});

test('matrices and determinants keep their shape', () => {
  const h = mathHtml('\\det{a_1 & b_1 \\\\ a_2 & b_2}');
  assert.ok(h.includes('br-bar'));
  assert.equal(count(h, 'mcell'), 4);
  const m = mathHtml('\\mat{1 & 2 & 3 \\\\ 4 & 5 & 6}');
  assert.ok(m.includes('--cols:3'));
  assert.equal(count(m, 'mcell'), 6);
  // A fraction inside a determinant.
  const f = mathHtml('\\det{\\frac{1}{2} & 0 \\\\ 0 & 1}');
  assert.equal(count(f, 'mfrac'), 1);
});

test('sums with limits and symbols', () => {
  const h = mathHtml('\\sum_{i=1}^{n} f_i x_i \\ge 0');
  assert.equal(count(h, 'mlim'), 2);
  assert.ok(h.includes('≥'));
});

test('unary minus hugs, binary minus spaces', () => {
  assert.ok(mathHtml('-3').includes('mo un'));
  assert.ok(mathHtml('2 - 3').includes('mo bin'));
  assert.ok(mathHtml('(-3)').includes('mo un'));
});

test('text markup escapes HTML and renders bold and maths', () => {
  const h = richHtml('**Note:** a <b> tag & $x^2$');
  assert.ok(h.startsWith('<b>Note:</b>'));
  assert.ok(h.includes('&lt;b&gt;'));
  assert.ok(h.includes('class="m"'));
  assert.throws(() => richHtml('one $ only'));
  assert.equal(spokenText('Find $\\frac{a}{b}$'), 'Find a over b');
});

test('stray dots and unknown commands never throw', () => {
  assert.doesNotThrow(() => mathHtml('a . b'));
  assert.ok(mathHtml('\\foo').includes('foo'));
});
