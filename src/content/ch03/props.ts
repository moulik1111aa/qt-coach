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
      id: 'why',
      title: 'Why a manager needs these shortcuts',
      body: [
        { p: 'The properties are **shortcuts**. They tell you what happens to a determinant\'s value when you change it in simple ways, so you often get the answer **without working it out**.' },
        { list: ['In the exam, MCQs test them directly: "If two rows are swapped, the value…".', 'They turn a long 4 × 4 into a short 2 × 2, as in the book\'s ONGC machine problem.', 'They let you spot at a glance that a value is 0, which means a set of equations has no single answer.'] },
        { p: 'All the examples below use one small determinant whose value you know:' },
        { math: '\\det{5 & 3 \\\\ 2 & 4} = 5 \\times 4 - 3 \\times 2 = 14' },
      ],
    },
    {
      id: 'p123',
      title: 'Changes that keep the value (or just flip its sign)',
      page: 4,
      body: [
        { def: 'Property 1. Rows into columns', text: 'Turn the rows into columns: the value **stays the same**.' },
        { math: '\\det{5 & 2 \\\\ 3 & 4} = 20 - 6 = 14' },
        { def: 'Property 2. Swap two rows', text: 'Swap two rows (or two columns): the value **flips sign**.' },
        { math: '\\det{2 & 4 \\\\ 5 & 3} = 6 - 20 = -14' },
        { def: 'Property 3. Add a multiple of another row', text: 'Add (or subtract) a multiple of one row to another row: the value **stays the same**. Here row 1 gets 2 × row 2 added: $5 + 4 = 9$ and $3 + 8 = 11$.' },
        { math: '\\det{9 & 11 \\\\ 2 & 4} = 36 - 22 = 14' },
        { tip: 'Property 3 is the most useful one: it lets you **create zeros** without changing the value. (Rows go with rows and columns with columns; never add a row to a column.)' },
      ],
    },
    {
      id: 'p456',
      title: 'Factors, zero rows and repeated rows',
      page: 4,
      body: [
        { def: 'Property 4. A common factor', text: 'Multiply every number in one row by 3: the value is multiplied by 3. And the other way round: if a whole row shares a factor, you may **take it outside**.' },
        { math: '\\det{5 & 3 \\\\ 6 & 12} = 60 - 18 = 42 = 3 \\times 14' },
        { math: '\\det{10 & 6 \\\\ 2 & 4} = 2 \\det{5 & 3 \\\\ 2 & 4} = 2 \\times 14 = 28' },
        { def: 'Property 5. A row of zeros', text: 'If a whole row (or column) is zeros, the value is **0**.' },
        { math: '\\det{5 & 3 \\\\ 0 & 0} = 0 - 0 = 0' },
        { def: 'Property 6. Equal rows', text: 'If two rows are the same, or one is a multiple of the other, the value is **0**.' },
        { math: '\\det{5 & 3 \\\\ 10 & 6} = 30 - 30 = 0' },
        { tip: 'Before working anything out, look for a row of zeros or two rows that match. The answer may be 0 at a glance.' },
      ],
    },
    {
      id: 'p78',
      title: 'Moving rows, and one number left in a line',
      page: 5,
      body: [
        { def: 'Property 7. Moving a row', text: 'Moving a row past another is one swap, and each swap flips the sign. An **even** number of swaps leaves the value as it was; an **odd** number flips it.' },
        { eg: 'Moving the bottom row of a 3 × 3 to the top passes two rows: 2 swaps, so the value is unchanged.' },
        { def: 'Property 8. Only one number left', text: 'If a row (or column) is all zeros **except one number**, the determinant is just that number times the smaller determinant left when you cover its row and column, with the chessboard sign.' },
        { math: '\\det{4 & 2 & 1 \\\\ 0 & 3 & 0 \\\\ 5 & 1 & 2}' },
        { p: 'Row 2 has only the 3. Cover row 2 and column 2. The sign: row 2 + column 2 = 4, even, so it stays +.' },
        { math: '= 3 \\det{4 & 1 \\\\ 5 & 2} = 3 \\times (8 - 5) = 9' },
        { p: 'One 2 × 2 instead of three. That is why we create zeros first.' },
      ],
    },
    {
      id: 'recipe',
      title: 'Shrinking a big determinant: the method',
      page: 5,
      body: [
        { p: 'The book\'s strategy, used in its ONGC example:' },
        { list: ['**Look first.** A row of zeros, or two matching rows? Then the answer is 0.', '**Take out** any number that divides a whole row or column (property 4). Keep it outside; it multiplies the answer at the end.', '**Make zeros** in one column using property 3: take a multiple of one row away from the others.', '**Shrink**: the column now has one number left, so use property 8.', '**Repeat** until a 2 × 2 is left, work it out, and multiply by everything you kept outside.'], ordered: true },
        { p: 'The book adds that a manager need not prove these properties, only know that they hold for any size and use them.' },
      ],
    },
    {
      id: 'letters',
      title: 'The properties in the book\'s letters',
      page: 4,
      optional: true,
      body: [
        { p: 'The book writes properties 1–4 with letters. They say the same as the number examples:' },
        { math: '\\det{a_1 & b_1 \\\\ a_2 & b_2} = \\det{a_1 & a_2 \\\\ b_1 & b_2}' },
        { math: '\\det{a_2 & b_2 \\\\ a_1 & b_1} = -\\det{a_1 & b_1 \\\\ a_2 & b_2}' },
        { math: '\\det{a_1 + pa_2 & b_1 + pb_2 \\\\ a_2 & b_2} = \\det{a_1 & b_1 \\\\ a_2 & b_2}' },
        { math: '\\det{a_1 & b_1 & c_1 \\\\ pa_2 & pb_2 & pc_2 \\\\ a_3 & b_3 & c_3} = p\\det{a_1 & b_1 & c_1 \\\\ a_2 & b_2 & c_2 \\\\ a_3 & b_3 & c_3}' },
      ],
    },
    {
      id: 'note',
      title: "The book's property-8 examples",
      page: 5,
      optional: true,
      body: [
        { p: 'The book shows three reductions. The third is right:' },
        { math: '\\det{2 & 7 & 0 & 5 \\\\ -1 & 3 & 0 & 4 \\\\ 4 & 2 & 0 & -2 \\\\ 5 & -4 & 7 & 1} = -7\\det{2 & 7 & 5 \\\\ -1 & 3 & 4 \\\\ 4 & 2 & -2}' },
        { p: '(Column 3 has only the 7, in row 4. Row 4 + column 3 = 7 is odd, hence $-7$. This $3 \\times 3$ determinant is in fact 0.)' },
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
          { say: 'Compare with the one you know: every number in **every** row has been multiplied by 3. Each row multiplied by 3 multiplies the value by 3 (property 4), and there are 3 rows, so the value is multiplied 3 times over.', math: ['3 \\times 3 \\times 3 = 27'] },
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
