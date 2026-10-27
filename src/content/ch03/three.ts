// Unit 3 · Third- and higher-order determinants: minors, cofactors and first-row expansion
// (book pp. 3–4 of the unit).

import { det, minorMat, M } from '../../core/num.ts';
import { customQ, mcq, mcqFrom, numCp, texMat, w } from '../kit.ts';
import type { Generator, Topic } from '../types.ts';
import { cofactorQ, det3Q } from './build.ts';
import { randMat } from '../ch02/addsub.ts';

const T = 'd-3x3';

const gen: Generator = {
  id: 'g-det3',
  topic: T,
  levels: ['basic', 'exam'],
  make(rng, level) {
    const seed = Math.floor(rng.next() * 1e9);
    const meta = { id: `${T}:g:${seed}`, topic: T, level, source: 'generated' as const, gen: { id: 'g-det3', seed } };
    const m = level === 'basic' ? randMat(rng, 3, 3, 0, 5) : randMat(rng, 3, 3, -6, 9);
    if (rng.chance(0.3)) return cofactorQ({ ...meta, title: 'Minor and cofactor' }, m, rng.int(0, 2), rng.int(0, 2));
    return det3Q({ ...meta, title: 'Evaluate a 3 × 3 determinant' }, m);
  },
  mcq(rng, level) {
    return mcqFrom(this.make(rng, level), rng);
  },
};

// A 4 × 4 with a column that is mostly zero (tough example).
const F4 = [
  [3, 1, 0, 2],
  [1, 4, 0, -1],
  [2, 0, 5, 3],
  [0, 2, 0, 1],
];
const F4m = minorMat(M(F4), 2, 2);
// det [[x,2,1],[3,1,0],[2,4,1]] = x + FX_Q (coefficient of x is 1).
const FX_Q = det([[0, 2, 1], [3, 1, 0], [2, 4, 1]]).n;

export const three: Topic = {
  id: T,
  chapter: 3,
  title: 'Third-order determinants',
  blurb: 'Minors, cofactors and expanding along the first row',
  kind: 'numeric',
  pages: [3, 4],
  primers: ['p-signs'],
  cards: [
    {
      id: 'rule',
      title: 'Expanding a 3 × 3 determinant',
      page: 3,
      body: [
        { p: 'A determinant with three rows and three columns is a **third-order** determinant. The book evaluates it by expanding along the **first row**:' },
        { math: '\\det{a_1 & b_1 & c_1 \\\\ a_2 & b_2 & c_2 \\\\ a_3 & b_3 & c_3} = a_1\\det{b_2 & c_2 \\\\ b_3 & c_3} - b_1\\det{a_2 & c_2 \\\\ a_3 & c_3} + c_1\\det{a_2 & b_2 \\\\ a_3 & b_3}' },
        { p: 'For each element of the first row: delete its row and column, evaluate the $2 \\times 2$ determinant that is left, multiply. Then combine with the signs **+, −, +**.' },
        { tip: 'The middle term is **subtracted**. Forgetting that minus is the most common error in this topic.' },
      ],
    },
    {
      id: 'minor',
      title: 'Minors and cofactors',
      page: 4,
      body: [
        { def: 'Minor', text: 'The smaller determinant left after deleting the row and column of an element.' },
        { def: 'Cofactor', text: 'The minor with its proper sign. For the element in row $j$ and column $k$, multiply the minor by $-1$ when $j + k$ is odd; leave it when $j + k$ is even.' },
        { math: '\\text{signs: } \\det{+ & - & + \\\\ - & + & - \\\\ + & - & +}' },
        { p: 'So the expansion is: each first-row element times its **cofactor**, added up.' },
        { eg: 'In the book\'s $4 \\times 4$ example, the cofactor of $b_1$ is $-\\det{a_2 & c_2 & d_2 \\\\ a_3 & c_3 & d_3 \\\\ a_4 & c_4 & d_4}$ (row 1 + column 2 = 3, odd).' },
      ],
    },
    {
      id: 'higher',
      title: 'Higher-order determinants',
      page: 4,
      body: [
        { p: 'The same rule works for any order $n$: multiply each of the $n$ elements in the first row by the smaller determinant obtained by deleting the first row and that element\'s column; then **add the odd-numbered products and subtract the even-numbered ones**.' },
        { math: '\\det{a_1 & b_1 & c_1 & d_1 \\\\ a_2 & b_2 & c_2 & d_2 \\\\ a_3 & b_3 & c_3 & d_3 \\\\ a_4 & b_4 & c_4 & d_4} = a_1(\\ldots) - b_1(\\ldots) + c_1(\\ldots) - d_1(\\ldots)' },
        { p: 'Each $(\\ldots)$ is a third-order determinant (a minor). A determinant always has as many rows and columns as there are equations and unknowns.' },
        { tip: 'Expanding a $4 \\times 4$ directly means four $3 \\times 3$ determinants. The properties in the next topic create zeros first, so most terms vanish.' },
      ],
    },
  ],
  examples: [
    det3Q({ id: `${T}:ex1`, topic: T, level: 'basic', source: 'written', title: 'Extra example: a 3 × 3 with small numbers' }, [[2, 1, 3], [0, 4, 1], [1, 2, 2]]),
    det3Q({ id: `${T}:ex2`, topic: T, level: 'exam', source: 'written', title: 'Extra example: with negatives' }, [[3, -2, 4], [1, 5, -3], [-2, 0, 6]]),
    customQ(
      { id: `${T}:ex3`, topic: T, level: 'tough', source: 'written', title: 'Extra example: a 4 × 4 with a helpful zero column' },
      `Evaluate $${texMat(F4, 'det')}$.`,
      [
        numCp('m', 'Minor', 'The $3 \\times 3$ minor of the element 5', det(F4m), 1),
        numCp('d', 'Value', 'Value of the determinant', det(F4), 2, { slips: [[-det(F4m).n * 5, 'Row 3 + column 3 = 6 is even, so the sign stays $+$.']] }),
      ],
      {
        steps: [
          { say: 'Column 3 has only one non-zero element (5, in row 3). Expanding along that column, every other term is $0 \\times (\\ldots) = 0$.', math: ['D = 5 \\times C_{33}'] },
          { say: 'Delete row 3 and column 3 for the minor, and expand it along its first row.', math: [`M_{33} = ${texMat(F4m, 'det')} = ${w(det(F4m))}`] },
          { say: 'Row 3 + column 3 = 6 is even, so the cofactor equals the minor. So the answer is:', math: [`D = 5 \\times ${w(det(F4m))} = ${w(det(F4))}`], end: true },
        ],
      },
    ),
  ],
  paper: [
    det3Q({ id: `${T}:p1`, topic: T, level: 'basic', source: 'written', title: 'Evaluate a 3 × 3' }, [[1, 2, 0], [3, 1, 2], [0, 1, 4]]),
    cofactorQ({ id: `${T}:p2`, topic: T, level: 'basic', source: 'written', title: 'Minor and cofactor of a middle element' }, [[2, 5, 1], [3, 0, 4], [1, 2, 6]], 0, 1),
    det3Q({ id: `${T}:e1`, topic: T, level: 'exam', source: 'written', title: 'Evaluate with negatives' }, [[4, -1, 2], [3, 2, -5], [-1, 6, 3]]),
    det3Q({ id: `${T}:e2`, topic: T, level: 'exam', source: 'written', title: 'Evaluate with decimals' }, [[1.5, 2, 0], [0.5, 4, 1], [2, -1, 3]]),
    cofactorQ({ id: `${T}:e3`, topic: T, level: 'exam', source: 'written', title: 'Cofactor of a corner element' }, [[6, -2, 3], [1, 4, -5], [2, 7, 0]], 2, 0),
    det3Q({ id: `${T}:t1`, topic: T, level: 'tough', source: 'written', title: 'A determinant that is 0', prompt: 'Evaluate $D$ and say why the answer could be predicted. $D = \\det{2 & 3 & 5 \\\\ 4 & 6 & 10 \\\\ 1 & 7 & 2}$.' }, [[2, 3, 5], [4, 6, 10], [1, 7, 2]]),
    customQ(
      { id: `${T}:t2`, topic: T, level: 'tough', source: 'written', title: 'Find x from a determinant' },
      'Find $x$ if $\\det{x & 2 & 1 \\\\ 3 & 1 & 0 \\\\ 2 & 4 & 1} = 3$.',
      [
        numCp('e', 'Constant term', 'The determinant has the form $x + q$. Enter $q$', FX_Q, 0, { slips: [[FX_Q + 12, 'The middle term is subtracted: $-2(3) = -6$.']] }),
        numCp('x', '$x$', 'Value of $x$', 3 - FX_Q, 1, { slips: [[3 - (FX_Q + 12), 'Check the sign of the middle term: $-2(3 \\times 1 - 0 \\times 2) = -6$.']] }),
      ],
      {
        steps: [
          { say: 'Expand along the first row with signs $+, -, +$.', math: ['x(1 \\times 1 - 0 \\times 4) - 2(3 \\times 1 - 0 \\times 2) + 1(3 \\times 4 - 1 \\times 2)', '= x - 6 + 10 = x + 4'] },
          { say: 'Set it equal to 3. So the answer is:', math: ['x + 4 = 3 \\Rightarrow x = -1'], end: true },
        ],
      },
    ),
    customQ(
      { id: `${T}:t3`, topic: T, level: 'tough', source: 'written', title: 'Expand along the best row' },
      'Evaluate $\\det{5 & 0 & 0 \\\\ 3 & 2 & 0 \\\\ -4 & 7 & 6}$ with as little work as possible.',
      [numCp('d', 'Value', 'Value of the determinant', det([[5, 0, 0], [3, 2, 0], [-4, 7, 6]]), 1, { slips: [[0, 'Only the elements above the diagonal are zero; the diagonal is not.']] })],
      {
        steps: [
          { say: 'Expanding along the first row, the second and third terms are multiplied by 0.', math: ['D = 5\\det{2 & 0 \\\\ 7 & 6} - 0 + 0 = 5(12 - 0)'] },
          { say: 'So the answer is:', math: ['D = 5 \\times 2 \\times 6 = 60'], after: 'For a triangular determinant the value is simply the product of the diagonal.', end: true },
        ],
      },
    ),
  ],
  gens: [gen],
  mcqs: [
    mcq(`${T}:c1`, T, 'basic', 'In the first-row expansion of a $3 \\times 3$ determinant, the signs of the three terms are…', '$+, -, +$', ['$+, +, +$', '$-, +, -$', '$+, -, -$'], 'Odd positions are added, even positions subtracted.'),
    mcq(`${T}:c2`, T, 'basic', 'The minor of an element is…', 'the determinant left after deleting its row and column', ['the smallest element in its row', 'the element with its sign changed', 'the product of its row'], 'Book: deleting the element\'s row and column gives its minor.'),
    mcq(`${T}:c3`, T, 'exam', 'The cofactor of the element in row 2, column 3 equals…', '$-1$ times its minor', ['its minor', 'zero', 'the element times its minor'], '$2 + 3 = 5$ is odd, so the sign changes.'),
    mcq(`${T}:c4`, T, 'exam', 'The cofactor of the element in row 3, column 1 equals…', 'its minor', ['$-1$ times its minor', '$3 \\times$ its minor', 'zero'], '$3 + 1 = 4$ is even.'),
    mcq(`${T}:c5`, T, 'basic', '$\\det{1 & 0 & 0 \\\\ 0 & 2 & 0 \\\\ 0 & 0 & 3} =$', '6', ['0', '1', '3'], 'Expanding, only $1 \\times (2 \\times 3)$ survives.'),
    mcq(`${T}:c6`, T, 'exam', 'Expanding a $4 \\times 4$ determinant along its first row gives…', 'four $3 \\times 3$ determinants', ['three $3 \\times 3$ determinants', 'four $2 \\times 2$ determinants', 'sixteen numbers to add'], 'One minor for each of the four first-row elements.'),
    mcq(`${T}:c7`, T, 'exam', '$\\det{2 & 1 & 3 \\\\ 0 & 4 & 1 \\\\ 1 & 2 & 2} =$', String(det([[2, 1, 3], [0, 4, 1], [1, 2, 2]]).n), ['13', '-1', '23'], 'First row: $2(8 - 2) - 1(0 - 1) + 3(0 - 4) = 12 + 1 - 12 = 1$.'),
    mcq(`${T}:c8`, T, 'tough', 'A determinant of order $n$ has how many elements?', '$n^2$', ['$2n$', '$n$', '$n!$'], '$n$ rows of $n$.'),
    mcq(`${T}:c9`, T, 'exam', 'The book calls the third-order determinants that appear when expanding a $4 \\times 4$…', 'minors of the original determinant', ['cofactors', 'transposes', 'identities'], 'With the proper sign they become cofactors.'),
    mcq(`${T}:c10`, T, 'tough', 'For a triangular determinant (zeros on one side of the diagonal), the value is…', 'the product of the diagonal elements', ['the sum of the diagonal elements', 'always 0', 'always 1'], 'Every other term in the expansion contains a zero.'),
    mcq(`${T}:c11`, T, 'basic', 'Which needs a $3 \\times 3$ determinant?', 'Solving three equations in three unknowns', ['Solving two equations in two unknowns', 'Adding two $3 \\times 3$ matrices', 'Finding the order of a matrix'], 'The order of the determinant equals the number of equations and unknowns.'),
  ],
};
