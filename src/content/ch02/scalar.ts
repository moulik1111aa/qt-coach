// Unit 2 · Scalar multiplication (book p. 4 of the unit).

import { customQ, elementMcq, matCp, mcq, numCp } from '../kit.ts';
import type { Generator, Topic } from '../types.ts';
import { comboQ, scalarQ } from './build.ts';
import { randMat } from './addsub.ts';

const T = 'm-scalar';

const gen: Generator = {
  id: 'g-scalar',
  topic: T,
  levels: ['basic', 'exam'],
  make(rng, level) {
    const seed = Math.floor(rng.next() * 1e9);
    const meta = { id: `${T}:g:${seed}`, topic: T, level, source: 'generated' as const, gen: { id: 'g-scalar', seed } };
    if (level === 'basic') {
      const k = rng.int(2, 9);
      return scalarQ({ ...meta, title: 'Multiply by a scalar' }, k, randMat(rng, 2, rng.pick([2, 3]), 0, 12));
    }
    if (rng.chance(0.4)) {
      const k = rng.pick([-3, -2, 0.5, 1.5, 4, -5]);
      const a = randMat(rng, rng.pick([2, 3]), rng.pick([2, 3]), -10, 20).map((r) => r.map((x) => (k === 0.5 || k === 1.5 ? x * 2 : x)));
      return scalarQ({ ...meta, title: 'Multiply by a scalar' }, k, a);
    }
    const rows = rng.pick([2, 3]);
    const cols = rng.pick([2, 3]);
    const k = rng.pick([2, 3, 4]);
    const l = rng.pick([-2, -3, 2, 3, -1]);
    return comboQ({ ...meta, title: 'Combine: kA ± lB' }, k, randMat(rng, rows, cols, -8, 12), l, randMat(rng, rows, cols, -8, 12));
  },
  mcq(rng, level) {
    const q = this.make(rng, level);
    const name = /\$([^$]*)\$\.$/.exec(q.prompt)?.[1] ?? 'kA';
    return elementMcq(q, rng, name);
  },
};

export const scalar: Topic = {
  id: T,
  chapter: 2,
  title: 'Scalar multiplication',
  blurb: 'Multiply every element by the same number',
  kind: 'numeric',
  pages: [4],
  cards: [
    {
      id: 'rule',
      title: 'Multiplying a matrix by a number',
      page: 4,
      body: [
        { p: 'When a matrix is multiplied by a constant (a **scalar**), **each element** of the matrix is multiplied by that constant.' },
        { math: 'k \\times \\mat{a & b \\\\ c & d} = \\mat{ka & kb \\\\ kc & kd}' },
        { p: 'Book example:' },
        { math: '5 \\times \\mat{4 & 9 \\\\ 5 & 7} = \\mat{20 & 45 \\\\ 25 & 35}' },
        { p: 'The size of the matrix does not change.' },
        { eg: 'A price matrix in rupees multiplied by 1.18 gives prices including 18% GST, item by item.' },
      ],
    },
    {
      id: 'neg',
      title: 'Negative and fractional scalars',
      body: [
        { p: 'The rule is the same for any number. Multiplying by $-1$ changes the sign of every element: $(-1)A$ is written $-A$.' },
        { math: '-2 \\times \\mat{3 & -1 \\\\ 0 & 4} = \\mat{-6 & 2 \\\\ 0 & -8}' },
        { p: 'Multiplying by $\\frac{1}{2}$ (or 0.5) halves every element.' },
        { tip: 'A negative times a negative is positive: $-2 \\times -1 = 2$. Watch every sign.' },
      ],
    },
    {
      id: 'combo',
      title: 'Combinations: 2A + 3B, A − 2B',
      body: [
        { p: 'To find something like $2A - 3B$:' },
        { list: ['Multiply every element of $A$ by 2.', 'Multiply every element of $B$ by 3.', 'Subtract element by element (the matrices must be the same size).'], ordered: true },
        { p: 'Useful rules, true for any numbers $k, l$ and same-size matrices $A, B$:' },
        { math: 'k(A + B) = kA + kB, \\qquad (k + l)A = kA + lA' },
        { def: 'Zero and identity', text: 'Multiplying any matrix by 0 gives the zero matrix; multiplying by 1 leaves it unchanged.' },
      ],
    },
  ],
  examples: [
    scalarQ({ id: `${T}:bk1`, topic: T, level: 'basic', source: 'book-example', title: 'Book example: 5 × A', page: 4 }, 5, [[4, 9], [5, 7]]),
    scalarQ({ id: `${T}:ex1`, topic: T, level: 'basic', source: 'written', title: 'Extra example: doubling an order', prompt: 'A retailer\'s weekly order (cartons) of 2 brands (rows) in 3 sizes (columns) is matrix $A$. Next week the order doubles. Find $2A$.', meaning: 'Every quantity in the order is doubled.' }, 2, [[12, 20, 8], [15, 9, 6]]),
    scalarQ({ id: `${T}:ex2`, topic: T, level: 'exam', source: 'written', title: 'Extra example: adding 18% GST', prompt: 'Prices (₹) before tax of 2 items (rows) in 2 pack sizes (columns) are given by $P$. Find the prices including 18% GST, $1.18P$.', meaning: 'For example, the first item in the first pack size costs ₹118 with GST.' }, 1.18, [[100, 250], [40, 75]], 'P'),
    comboQ({ id: `${T}:ex3`, topic: T, level: 'tough', source: 'written', title: 'Extra example: 3A − 2B with negatives' }, 3, [[2, -1, 4], [0, 5, -3]], -2, [[-1, 2, 0], [3, -4, 1]]),
  ],
  paper: [
    scalarQ({ id: `${T}:p1`, topic: T, level: 'basic', source: 'written', title: '3 × A' }, 3, [[2, 7], [4, 1]]),
    scalarQ({ id: `${T}:p2`, topic: T, level: 'basic', source: 'written', title: '−1 × A' }, -1, [[5, -2], [0, 8]]),
    scalarQ({ id: `${T}:e1`, topic: T, level: 'exam', source: 'written', title: 'Wages after a 10% rise', prompt: 'Daily wages (₹) of 3 grades of worker (rows) in 2 shifts (columns) are matrix $W$. Every wage rises by 10%. Find $1.1W$.' }, 1.1, [[500, 650], [700, 850], [900, 1100]], 'W'),
    comboQ({ id: `${T}:e2`, topic: T, level: 'exam', source: 'written', title: 'Find 2A + 3B' }, 2, [[1, 4], [-2, 3]], 3, [[2, -1], [5, 0]]),
    comboQ({ id: `${T}:e3`, topic: T, level: 'exam', source: 'written', title: 'Find 4A − B' }, 4, [[3, 0, -2], [1, 5, 2]], -1, [[6, -3, 1], [4, 9, -7]]),
    customQ(
      { id: `${T}:t1`, topic: T, level: 'tough', source: 'written', title: 'Solve for X: 2X + A = B' },
      'Find $X$ if $2X + \\mat{3 & -1 \\\\ 4 & 6} = \\mat{9 & 5 \\\\ -2 & 10}$.',
      [
        matCp('d', '$B - A$', 'The matrix $2X = B - A$', [[6, 6], [-6, 4]], 0, { slips: [[[[12, 4], [2, 16]], 'Move $A$ across by subtracting it, not adding.']] }),
        matCp('x', '$X$', 'The matrix $X$', [[3, 3], [-3, 2]], 1, { slips: [[[[12, 12], [-12, 8]], 'Divide by 2, do not multiply.']] }),
      ],
      {
        steps: [
          { say: 'Subtract $A$ from both sides, just as with numbers.', math: ['2X = \\mat{9 & 5 \\\\ -2 & 10} - \\mat{3 & -1 \\\\ 4 & 6} = \\mat{6 & 6 \\\\ -6 & 4}'] },
          { say: 'Multiply by $\\frac{1}{2}$ (halve every element). So the answer is:', math: ['X = \\frac{1}{2}\\mat{6 & 6 \\\\ -6 & 4} = \\mat{3 & 3 \\\\ -3 & 2}'], end: true },
        ],
      },
    ),
    customQ(
      { id: `${T}:t2`, topic: T, level: 'tough', source: 'written', title: 'Find k from kA = B' },
      'If $k\\mat{4 & -6 \\\\ 2 & 10} = \\mat{-10 & 15 \\\\ -5 & -25}$, find $k$.',
      [numCp('k', '$k$', 'Value of $k$', -2.5, 1, { slips: [[2.5, 'Check the sign: $4k = -10$ gives a negative $k$.'], [-0.4, 'That is $4 \\div (-10)$. Divide the new element by the old one.']] })],
      {
        steps: [
          { say: 'Every element of the first matrix is multiplied by the same $k$. Use any non-zero element, say the first:', math: ['4k = -10'] },
          { say: 'Solve, then check with another element. So the answer is:', math: ['k = \\frac{-10}{4} = -2.5'], after: 'Check: $-6 \\times -2.5 = 15$ ✓, $10 \\times -2.5 = -25$ ✓.', end: true },
        ],
      },
    ),
    customQ(
      { id: `${T}:t3`, topic: T, level: 'tough', source: 'written', title: 'Two unknown matrices' },
      'Find $X$ and $Y$ if $X + Y = \\mat{7 & 0 \\\\ 2 & 5}$ and $X - Y = \\mat{3 & 0 \\\\ 0 & 3}$. Give $X$.',
      [
        matCp('s', '$2X$', 'The matrix $2X$ (add the two equations)', [[10, 0], [2, 8]], 0),
        matCp('x', '$X$', 'The matrix $X$', [[5, 0], [1, 4]], 1, { slips: [[[[2, 0], [1, 1]], 'That is $Y$. Adding the equations gives $2X$.']] }),
      ],
      {
        steps: [
          { say: 'Add the two equations: $Y$ cancels, leaving $2X$.', math: ['2X = \\mat{7 & 0 \\\\ 2 & 5} + \\mat{3 & 0 \\\\ 0 & 3} = \\mat{10 & 0 \\\\ 2 & 8}'] },
          { say: 'Halve every element. So the answer is:', math: ['X = \\mat{5 & 0 \\\\ 1 & 4}'], after: 'Then $Y = \\mat{7 & 0 \\\\ 2 & 5} - X = \\mat{2 & 0 \\\\ 1 & 1}$.', end: true },
        ],
      },
    ),
  ],
  gens: [gen],
  mcqs: [
    mcq(`${T}:c1`, T, 'basic', 'In scalar multiplication $kA$, the scalar $k$ multiplies…', 'every element of $A$', ['only the diagonal elements', 'only the first row', 'the order of $A$'], 'Book rule: each element is multiplied by the constant.'),
    mcq(`${T}:c2`, T, 'basic', '$3\\mat{2 & 0 \\\\ -1 & 4} =$', '$\\mat{6 & 0 \\\\ -3 & 12}$', ['$\\mat{5 & 3 \\\\ 2 & 7}$', '$\\mat{6 & 0 \\\\ -1 & 4}$', '$\\mat{6 & 3 \\\\ -3 & 12}$'], 'Multiply each element by 3: $0 \\times 3 = 0$.'),
    mcq(`${T}:c3`, T, 'basic', 'If $A$ is $3 \\times 2$, then $5A$ is…', '$3 \\times 2$', ['$15 \\times 10$', '$3 \\times 10$', '$5 \\times 2$'], 'Scalar multiplication does not change the size.'),
    mcq(`${T}:c4`, T, 'exam', '$-A$ means…', 'every element of $A$ with its sign changed', ['the transpose of $A$', 'a matrix with all negative elements', 'the inverse of $A$'], '$-A = (-1)A$.'),
    mcq(`${T}:c5`, T, 'exam', 'Which is always true for same-size matrices $A, B$ and number $k$?', '$k(A + B) = kA + kB$', ['$k(A + B) = kA + B$', '$kA = A + k$', '$k(AB) = (kA)(kB)$'], 'The scalar multiplies every element of the sum.'),
    mcq(`${T}:c6`, T, 'exam', 'If $2X = \\mat{8 & -2 \\\\ 6 & 0}$, then $X =$', '$\\mat{4 & -1 \\\\ 3 & 0}$', ['$\\mat{16 & -4 \\\\ 12 & 0}$', '$\\mat{6 & -4 \\\\ 4 & -2}$', '$\\mat{4 & 1 \\\\ 3 & 0}$'], 'Halve every element.'),
    mcq(`${T}:c7`, T, 'exam', 'Prices matrix $P$ is in rupees. A 5% discount on every price gives…', '$0.95P$', ['$0.05P$', '$P - 5$', '$1.05P$'], 'Paying 95% of each price: multiply by 0.95.'),
    mcq(`${T}:c8`, T, 'basic', '$0 \\times A$ gives…', 'the zero matrix of the same size as $A$', ['the number 0', 'the identity matrix', '$A$'], 'Every element becomes 0; the size stays the same.'),
    mcq(`${T}:c9`, T, 'tough', 'If $A = \\mat{1 & 2 \\\\ 3 & 4}$, the element in row 2, column 1 of $2A - 3I$ is…', '6', ['3', '-3', '0'], '$2A$ has $6$ there and $3I$ has $0$ off the diagonal: $6 - 0 = 6$.'),
    mcq(`${T}:c10`, T, 'tough', 'If $kA = A$ for a non-zero matrix $A$, then $k =$', '1', ['0', '-1', 'any number'], 'Each non-zero element $a$ satisfies $ka = a$, so $k = 1$.'),
    mcq(`${T}:c11`, T, 'exam', '$\\frac{1}{2}\\mat{6 & -4 \\\\ 10 & 3} =$', '$\\mat{3 & -2 \\\\ 5 & 1.5}$', ['$\\mat{3 & -4 \\\\ 10 & 3}$', '$\\mat{12 & -8 \\\\ 20 & 6}$', '$\\mat{3 & 2 \\\\ 5 & 1.5}$'], 'Halve every element, keeping signs.'),
  ],
};
