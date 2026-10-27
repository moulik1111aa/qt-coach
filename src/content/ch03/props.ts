// Unit 3 · Properties of determinants, and using them on higher orders (book pp. 2, 4–5 of the unit).

import type { Rng } from '../../core/rng.ts';
import { det } from '../../core/num.ts';
import { customQ, mcq, mcqFrom, numCp, texMat, w } from '../kit.ts';
import type { Generator, Topic } from '../types.ts';
import { byOpsQ, propQ, type PropKind } from './build.ts';
import { randMat } from '../ch02/addsub.ts';

const T = 'd-props';

function base(rng: Rng, n: number): number[][] {
  for (;;) {
    const m = randMat(rng, n, n, -4, 6);
    const d = det(m);
    if (d.n !== 0 && Math.abs(d.n) < 200) return m;
  }
}

const gen: Generator = {
  id: 'g-props',
  topic: T,
  levels: ['basic', 'exam'],
  make(rng, level) {
    const seed = Math.floor(rng.next() * 1e9);
    const meta = { id: `${T}:g:${seed}`, topic: T, level, source: 'generated' as const, gen: { id: 'g-props', seed } };
    const kinds: PropKind[] = level === 'basic' ? ['transpose', 'swap', 'zeroRow', 'factor'] : ['swap', 'factor', 'addMultiple', 'equalRows', 'transpose'];
    const kind = rng.pick(kinds);
    return propQ({ ...meta, title: 'Use a property' }, base(rng, level === 'basic' ? 2 : 3), kind, rng.pick([2, 3, -2, 5]));
  },
  mcq(rng, level) {
    return mcqFrom(this.make(rng, level), rng);
  },
};

// The book's first property-8 example, corrected (see the Book note).
const P8 = [
  [12, -28, 9, 1],
  [-10, -22, 7, 0],
  [0, 0, 1, 0],
  [1, 5, -2, 15],
];

export const props: Topic = {
  id: T,
  chapter: 3,
  title: 'Properties of determinants',
  blurb: 'Eight properties that make evaluation short',
  kind: 'numeric',
  pages: [2, 4, 5],
  cards: [
    {
      id: 'p123',
      title: 'Properties 1–3',
      page: 4,
      body: [
        { def: '1. Rows and columns', text: 'Interchanging the rows and columns (transposing) does not change the value.' },
        { math: '\\det{a_1 & b_1 \\\\ a_2 & b_2} = \\det{a_1 & a_2 \\\\ b_1 & b_2}' },
        { def: '2. Swapping two rows', text: 'Interchanging two rows multiplies the value by $-1$. The same is true of two columns.' },
        { math: '\\det{a_2 & b_2 \\\\ a_1 & b_1} = -\\det{a_1 & b_1 \\\\ a_2 & b_2}' },
        { def: '3. Adding a multiple of a row', text: 'Adding (or subtracting) any multiple of one row to another row leaves the value unchanged. The same holds for columns. (A row cannot be added to a column.)' },
        { math: '\\det{a_1 + pa_2 & b_1 + pb_2 \\\\ a_2 & b_2} = \\det{a_1 & b_1 \\\\ a_2 & b_2}' },
      ],
    },
    {
      id: 'p456',
      title: 'Properties 4–6',
      page: 4,
      body: [
        { def: '4. Common factor', text: 'If every element of a row (or column) has a common factor $p$, it can be taken outside.' },
        { math: '\\det{a_1 & b_1 & c_1 \\\\ pa_2 & pb_2 & pc_2 \\\\ a_3 & b_3 & c_3} = p\\det{a_1 & b_1 & c_1 \\\\ a_2 & b_2 & c_2 \\\\ a_3 & b_3 & c_3}' },
        { def: '5. A row of zeros', text: 'From (4): a row or column of zeros makes the value 0.' },
        { def: '6. Equal rows', text: 'From (3) and (5): if one row equals another (or is a multiple of it), the value is 0. The same for columns.' },
        { tip: 'Before expanding, scan for a zero row, two equal rows, or proportional columns. The answer may be 0 at a glance.' },
      ],
    },
    {
      id: 'p78',
      title: 'Properties 7 and 8',
      page: 5,
      body: [
        { def: '7. Moving a row', text: 'Moving a row up or down past others an even number of times leaves the value unchanged; an odd number of times multiplies it by $-1$. (Each move past one row is a swap.) The same for columns.' },
        { def: '8. One non-zero element', text: 'If a row or column has every element 0 except one, the determinant equals that element times its **cofactor**. The cofactor is the minor (delete the element\'s row $j$ and column $k$), multiplied by $-1$ when $j + k$ is odd.' },
        { p: 'Strategy for big determinants, used in the book\'s ONGC example: take out common factors (4), use (3) to create zeros in one column, then expand along it with (8). Repeat until $2 \\times 2$.' },
        { p: 'The book adds: the proofs interest mathematicians; a manager should know the properties hold for determinants of any order and use them.' },
      ],
    },
    {
      id: 'note',
      title: "The book's property-8 examples",
      page: 5,
      body: [
        { p: 'The book shows three reductions. The third is right:' },
        { math: '\\det{2 & 7 & 0 & 5 \\\\ -1 & 3 & 0 & 4 \\\\ 4 & 2 & 0 & -2 \\\\ 5 & -4 & 7 & 1} = -7\\det{2 & 7 & 5 \\\\ -1 & 3 & 4 \\\\ 4 & 2 & -2}' },
        { p: '(Row 4 + column 3 = 7 is odd, hence $-7$. This $3 \\times 3$ determinant is in fact 0.)' },
        { bookNote: 'In the first example, after deleting row 3 and column 3 the last row should read $1, 5, 15$, not $-1, 5, 15$. The next step also halves row 2 without keeping the factor 2. The correct value of that determinant is $-8188$; the worked example in this topic shows the full working.' },
      ],
    },
  ],
  examples: [
    { ...byOpsQ({ id: `${T}:bk1`, topic: T, level: 'exam', source: 'book-example', title: 'Book example: a 4 × 4 by property 8 (corrected)', page: 5, bookNote: 'The printed working has a sign slip (−1 for 1) and drops a factor of 2; the correct value is −8188.' }, P8) },
    propQ({ id: `${T}:ex1`, topic: T, level: 'basic', source: 'written', title: 'Extra example: swapping two rows' }, [[3, 1], [4, 5]], 'swap'),
    propQ({ id: `${T}:ex2`, topic: T, level: 'exam', source: 'written', title: 'Extra example: a factor in one row' }, [[2, 1, 3], [1, 0, 2], [4, 1, 1]], 'factor', 4),
    byOpsQ({ id: `${T}:ex3`, topic: T, level: 'tough', source: 'written', title: 'Extra example: a 4 × 4 with a common factor' }, [[2, 4, 6, 8], [1, 0, 2, 1], [3, 1, 0, 2], [0, 2, 1, 3]]),
  ],
  paper: [
    propQ({ id: `${T}:p1`, topic: T, level: 'basic', source: 'written', title: 'A row of zeros' }, [[4, 7], [2, 9]], 'zeroRow'),
    propQ({ id: `${T}:p2`, topic: T, level: 'basic', source: 'written', title: 'Rows and columns interchanged' }, [[5, 2], [3, 4]], 'transpose'),
    propQ({ id: `${T}:e1`, topic: T, level: 'exam', source: 'written', title: 'A multiple of a row added' }, [[1, 2, 0], [3, 1, 4], [2, 0, 5]], 'addMultiple', 3),
    propQ({ id: `${T}:e2`, topic: T, level: 'exam', source: 'written', title: 'Proportional rows' }, [[2, -1, 3], [4, 0, 1], [5, 2, -2]], 'equalRows', 3),
    byOpsQ({ id: `${T}:e3`, topic: T, level: 'exam', source: 'written', title: 'Evaluate a 3 × 3 using properties' }, [[1, 2, 3], [2, 5, 7], [3, 7, 11]]),
    byOpsQ({ id: `${T}:t1`, topic: T, level: 'tough', source: 'written', title: 'A 4 × 4 by row operations' }, [[1, 2, 1, 3], [2, 5, 3, 7], [1, 3, 4, 2], [3, 6, 4, 10]]),
    customQ(
      { id: `${T}:t2`, topic: T, level: 'tough', source: 'written', title: 'Every row multiplied by k' },
      `If $${texMat([[1, 2, 0], [3, 1, 4], [0, 2, 1]], 'det')} = ${w(det([[1, 2, 0], [3, 1, 4], [0, 2, 1]]))}$, find $${texMat([[3, 6, 0], [9, 3, 12], [0, 6, 3]], 'det')}$ without expanding.`,
      [numCp('v', 'Value', 'Value of the new determinant', det([[3, 6, 0], [9, 3, 12], [0, 6, 3]]), 1, { slips: [[3 * det([[1, 2, 0], [3, 1, 4], [0, 2, 1]]).n, 'All three rows carry the factor 3, so it comes out three times: $3^3 = 27$.']] })],
      {
        steps: [
          { say: 'Every element of every row has been multiplied by 3. Take 3 out of each row in turn (property 4).', math: ['3 \\times 3 \\times 3 = 27'] },
          { say: 'So the answer is:', math: [`27 \\times ${w(det([[1, 2, 0], [3, 1, 4], [0, 2, 1]]))} = ${w(det([[3, 6, 0], [9, 3, 12], [0, 6, 3]]))}`], end: true },
        ],
      },
    ),
    customQ(
      { id: `${T}:t3`, topic: T, level: 'tough', source: 'written', title: 'Show a determinant is 0' },
      'Without expanding, find $\\det{1 & 4 & 9 \\\\ 1 & 6 & 7 \\\\ 1 & 8 & 5}$. (Hint: add column 2 to column 3.)',
      [numCp('v', 'Value', 'Value of the determinant', det([[1, 4, 9], [1, 6, 7], [1, 8, 5]]), 1)],
      {
        steps: [
          { say: 'Add column 2 to column 3 (property 3: no change in value).', math: ['\\det{1 & 4 & 13 \\\\ 1 & 6 & 13 \\\\ 1 & 8 & 13}'] },
          { say: 'Column 3 is now 13 times column 1: proportional columns (property 6). So the answer is:', math: ['0'], end: true },
        ],
      },
    ),
  ],
  gens: [gen],
  mcqs: [
    mcq(`${T}:c1`, T, 'basic', 'Interchanging two rows of a determinant…', 'multiplies its value by $-1$', ['leaves the value unchanged', 'makes the value 0', 'doubles the value'], 'Property 2.'),
    mcq(`${T}:c2`, T, 'basic', 'If two rows of a determinant are identical, its value is…', '0', ['1', 'the square of a row', 'unchanged by the rows'], 'Property 6.'),
    mcq(`${T}:c3`, T, 'basic', 'Interchanging rows and columns of a determinant…', 'does not change its value', ['changes its sign', 'makes it 0', 'multiplies it by its order'], 'Property 1.'),
    mcq(`${T}:c4`, T, 'exam', 'If $D = 6$ and every element of one row is multiplied by 4, the new value is…', '24', ['6', '96', '10'], 'Property 4: one row multiplied by 4 multiplies $D$ by 4.'),
    mcq(`${T}:c5`, T, 'exam', 'If a $3 \\times 3$ determinant has value 5 and every element is doubled, the new value is…', '40', ['10', '30', '20'], 'Each of the 3 rows gives a factor 2: $2^3 \\times 5 = 40$.'),
    mcq(`${T}:c6`, T, 'exam', 'Which operation does NOT change the value of a determinant?', 'Adding 3 times row 1 to row 2', ['Swapping rows 1 and 2', 'Multiplying row 2 by 3', 'Replacing row 2 by row 1'], 'Property 3.'),
    mcq(`${T}:c7`, T, 'exam', 'Moving the last row of a $4 \\times 4$ determinant to the top (past 3 rows) multiplies the value by…', '$-1$', ['$+1$', '$-3$', '$3$'], 'Three swaps: an odd number (property 7).'),
    mcq(`${T}:c8`, T, 'exam', 'If column 2 has every element 0 except a 6 in row 3, the determinant equals…', '6 times the cofactor of that element', ['6', '0', '6 times the sum of its row'], 'Property 8.'),
    mcq(`${T}:c9`, T, 'tough', 'The sign of the cofactor for the element in row 4, column 3 is…', 'negative ($j + k = 7$ is odd)', ['positive', 'positive because 4 > 3', 'the same as for row 1, column 1'], 'Odd row + column means multiply the minor by $-1$.'),
    mcq(`${T}:c10`, T, 'tough', '$\\det{a & b & c \\\\ 2a & 2b & 2c \\\\ x & y & z} =$', '0', ['$2(az - cx)$', '$2abc$', '$xyz$'], 'Row 2 is twice row 1 (property 6).'),
    mcq(`${T}:c11`, T, 'basic', 'A determinant with a column of zeros has value…', '0', ['1', 'the product of the diagonal', 'not defined'], 'Property 5.'),
  ],
};
