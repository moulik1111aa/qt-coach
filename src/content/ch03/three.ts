// Unit 3 · Third- and higher-order determinants: minors, cofactors and first-row expansion
// (book pp. 3–4 of the unit).

import { det, minorMat, M } from '../../core/num.ts';
import { customQ, mcq, mcqFrom, numCp, texMat, w } from '../kit.ts';
import type { Generator, Topic } from '../types.ts';
import type { Board } from '../../teach/types.ts';
import { cofactorQ, det3Q, expandWork } from './build.ts';
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

// The Learn cards' worked 3 × 3 (all minors positive, so the first look stays gentle).
const K = [
  [4, 2, 1],
  [1, 3, 2],
  [0, 1, 5],
];
const KM = [0, 1, 2].map((j) => det(minorMat(M(K), 0, j)));
const KD = det(M(K));
/** K with row 1 and column j covered, and the top-row number lit. */
const cover = (j: number): Board => ({
  kind: 'mats',
  terms: [
    { kind: 'mat', br: 'bar', cells: K.map((r) => r.map(String)), marks: [{ type: 'strike-row', i: 0, j }, { type: 'strike-col', j, i: 0 }, { type: 'cell', i: 0, j, hl: 0 }] },
    { kind: 'op', text: '\\to' },
    { kind: 'mat', br: 'bar', cells: K.slice(1).map((r) => r.filter((_, c) => c !== j).map(String)) },
  ],
});

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
      id: 'why',
      title: 'Why a manager needs 3 × 3 determinants',
      body: [
        { p: 'Many business problems have **three unknowns**: three products sharing three machines, three ingredients in a blend, three grades of staff on a budget. Three unknowns need three facts, so three equations.' },
        { p: 'Cramer\'s rule still works, but now the determinants are **3 × 3** (three rows, three columns). The exam also asks you to work out 3 × 3 determinants on their own.' },
        { p: 'Good news: a 3 × 3 determinant is just **three 2 × 2 determinants** put together, and you already know how to do those.' },
      ],
    },
    {
      id: 'rule',
      title: 'A 3 × 3 determinant, step by step',
      page: 3,
      body: [
        { p: 'We will work out this one. We use the three numbers in the **top row**: 4, 2 and 1.' },
        { math: `\\det{${K[0].join(' & ')} \\\\ ${K[1].join(' & ')} \\\\ ${K[2].join(' & ')}}` },
        { p: `**Step 1.** Take the first top-row number, **${K[0][0]}**. Cover its row and its column. Four numbers are left. Work out that 2 × 2 the usual way (top-left × bottom-right, minus top-right × bottom-left): $${K[1][1]} \\times ${K[2][2]} - ${K[1][2]} \\times ${K[2][1]} = ${KM[0].n}$.` },
        { board: cover(0) },
        { p: `**Step 2.** The second top-row number, **${K[0][1]}**. Cover its row and column: $${K[1][0]} \\times ${K[2][2]} - ${K[1][2]} \\times ${K[2][0]} = ${KM[1].n}$.` },
        { board: cover(1) },
        { p: `**Step 3.** The third, **${K[0][2]}**. Cover its row and column: $${K[1][0]} \\times ${K[2][1]} - ${K[1][1]} \\times ${K[2][0]} = ${KM[2].n}$.` },
        { board: cover(2) },
        { p: '**Step 4.** Multiply each top-row number by its small answer, and combine them with **plus, minus, plus**:' },
        { math: `${K[0][0]} \\times ${KM[0].n} - ${K[0][1]} \\times ${KM[1].n} + ${K[0][2]} \\times ${KM[2].n} = ${K[0][0] * Number(KM[0].n)} - ${K[0][1] * Number(KM[1].n)} + ${K[0][2] * Number(KM[2].n)} = ${KD.n}` },
        { tip: 'The middle one is **taken away**. Forgetting that minus is the most common mistake in this topic.' },
      ],
    },
    {
      id: 'minor',
      title: 'Two words the book uses: minor and cofactor',
      page: 4,
      body: [
        { def: 'Minor', text: 'The small determinant left when you cover a number\'s row and column. Above, the minor of 2 is $\\det{1 & 2 \\\\ 0 & 5} = 5$.' },
        { def: 'Cofactor', text: 'The minor with a sign attached. It decides whether that number\'s part is added or taken away.' },
        { p: 'Which sign? Add the row number and the column number of that number\'s place:' },
        { list: ['**Even** total (2, 4, 6): keep the minor as it is.', '**Odd** total (3, 5): change its sign.'] },
        { p: 'The number 2 sits in row 1, column 2: $1 + 2 = 3$, odd. So its cofactor is $-5$. That is where the minus in "plus, minus, plus" comes from.' },
        { p: 'An easier way to see all the signs at once is a chessboard that starts with + in the top-left corner:' },
        { math: '\\det{+ & - & + \\\\ - & + & - \\\\ + & - & +}' },
        { p: `So the determinant is each top-row number times its **cofactor**, all added: $${K[0][0]}(${KM[0].n}) + ${K[0][1]}(-${KM[1].n}) + ${K[0][2]}(${KM[2].n}) = ${KD.n}$. Same answer as before.` },
      ],
    },
    {
      id: 'higher',
      title: 'Bigger determinants: 4 × 4 and more',
      page: 4,
      body: [
        { p: 'The same idea keeps going. For a 4 × 4, use the four top-row numbers; for each, cover its row and column, which leaves a **3 × 3** minor. Combine with **plus, minus, plus, minus**.' },
        { math: '\\det{a_1 & b_1 & c_1 & d_1 \\\\ a_2 & b_2 & c_2 & d_2 \\\\ a_3 & b_3 & c_3 & d_3 \\\\ a_4 & b_4 & c_4 & d_4} = a_1(\\ldots) - b_1(\\ldots) + c_1(\\ldots) - d_1(\\ldots)' },
        { p: 'Each $(\\ldots)$ is the 3 × 3 minor. The book\'s rule in words: **add the odd-numbered products, take away the even-numbered ones**.' },
        { tip: 'Doing a 4 × 4 this way means four 3 × 3s, which is long. The "Properties" topic shows how to create zeros first so that most parts disappear.' },
        { p: 'One more fact from the book: the determinant always has as many rows and columns as there are equations (and unknowns).' },
      ],
    },
    {
      id: 'recipe',
      title: 'The method in 4 steps',
      body: [
        { list: ['Take the **first** top-row number. Cover its row and column; work out the 2 × 2 left.', 'Do the same for the **second** top-row number.', 'And for the **third**.', 'Multiply each top-row number by its 2 × 2 answer and combine: **first − second + third**.'], ordered: true },
        { tip: 'Write each 2 × 2 answer down before combining. Most errors come from doing too much in your head.' },
      ],
    },
    {
      id: 'letters',
      title: 'The book\'s formula in letters',
      page: 3,
      optional: true,
      body: [
        { p: 'The book writes the same four steps with letters. $a_1, b_1, c_1$ are the top-row numbers; the small determinants are their minors:' },
        { math: '\\det{a_1 & b_1 & c_1 \\\\ a_2 & b_2 & c_2 \\\\ a_3 & b_3 & c_3} = a_1\\det{b_2 & c_2 \\\\ b_3 & c_3} - b_1\\det{a_2 & c_2 \\\\ a_3 & c_3} + c_1\\det{a_2 & b_2 \\\\ a_3 & b_3}' },
        { p: 'In the book\'s 4 × 4 example, the cofactor of $b_1$ is $-\\det{a_2 & c_2 & d_2 \\\\ a_3 & c_3 & d_3 \\\\ a_4 & c_4 & d_4}$: row 1 + column 2 = 3, odd, so the sign changes.' },
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
        numCp('m', 'Minor of 5', 'The 3 × 3 left when you cover the row and column of the 5', det(F4m), 1),
        numCp('d', 'Value', 'Value of the determinant', det(F4), 2, { slips: [[-det(F4m).n * 5, 'Row 3 + column 3 = 6 is even, so the sign stays $+$.']] }),
      ],
      {
        steps: [
          { say: 'A 4 × 4 done the long way needs four 3 × 3s. Look for a shortcut first: in **column 3** every number is 0 except the **5** (in row 3). Every other part would be 0 × something = 0, so only the 5 matters.', math: ['D = 5 \\times (\\text{its minor, with its sign})'] },
          { say: 'Cover row 3 and column 3 (the row and column of the 5). A 3 × 3 is left. Work it out with the top-row method you know:', math: [`${texMat(F4m, 'det')}`, `= ${expandWork(F4m)} = ${w(det(F4m))}`] },
          { say: 'The sign: row 3 + column 3 = 6, which is even, so the sign stays +. So the answer is:', math: [`D = 5 \\times ${w(det(F4m))} = ${w(det(F4))}`], end: true },
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
          { say: 'Use the top-row method: each top-row number times its small 2 × 2, combined plus, minus, plus. The $x$ simply comes along as a letter.', math: ['x(1 \\times 1 - 0 \\times 4) - 2(3 \\times 1 - 0 \\times 2) + 1(3 \\times 4 - 1 \\times 2)', '= x - 6 + 10 = x + 4'] },
          { say: 'The question says the value is 3, so $x + 4 = 3$. Take 4 from both sides. So the answer is:', math: ['x + 4 = 3 \\Rightarrow x = 3 - 4 = -1'], end: true },
        ],
      },
    ),
    customQ(
      { id: `${T}:t3`, topic: T, level: 'tough', source: 'written', title: 'Expand along the best row' },
      'Evaluate $\\det{5 & 0 & 0 \\\\ 3 & 2 & 0 \\\\ -4 & 7 & 6}$ with as little work as possible.',
      [numCp('d', 'Value', 'Value of the determinant', det([[5, 0, 0], [3, 2, 0], [-4, 7, 6]]), 1, { slips: [[0, 'Only the elements above the diagonal are zero; the diagonal is not.']] })],
      {
        steps: [
          { say: 'Use the top-row method. The second and third top-row numbers are 0, and 0 × anything is 0, so only the 5 matters:', math: ['D = 5\\det{2 & 0 \\\\ 7 & 6} - 0 + 0 = 5 \\times (12 - 0)'] },
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
