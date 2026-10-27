// Unit 2 · Types of matrices (a)–(k) and the transpose (l) (book pp. 2–3 of the unit).

import type { Rng } from '../../core/rng.ts';
import { cellsOf, choiceCp, customQ, mcq, numCp, matCp, texMat } from '../kit.ts';
import type { Generator, Level, Topic } from '../types.ts';
import { bestType, transposeQ, typeQ, typesOf, type MType } from './build.ts';
import { randMat } from './addsub.ts';

const T = 'm-types';

const nz = (rng: Rng, lo: number, hi: number) => {
  let x = 0;
  while (x === 0) x = rng.int(lo, hi);
  return x;
};

/** A matrix whose most exact type is `t`. */
export function matrixOfType(rng: Rng, t: MType, level: Level): number[][] {
  const n = level === 'basic' ? rng.pick([2, 3]) : 3;
  const lo = level === 'basic' ? 1 : -9;
  const hi = level === 'basic' ? 9 : 20;
  const sq = () => randMat(rng, n, n, lo, hi).map((r) => r.map((x) => (x === 0 ? 1 : x)));
  for (let tries = 0; tries < 50; tries++) {
    let a: number[][];
    switch (t) {
      case 'row':
        a = [Array.from({ length: rng.int(2, 4) }, () => rng.int(lo, hi))];
        break;
      case 'column':
        a = Array.from({ length: rng.int(2, 4) }, () => [rng.int(lo, hi)]);
        break;
      case 'square':
        a = sq();
        break;
      case 'diagonal':
        a = sq().map((r, i) => r.map((x, j) => (i === j ? x : 0)));
        break;
      case 'scalar': {
        const k = rng.pick([2, 3, 4, 5, 7, 10, 115, -3]);
        a = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? k : 0)));
        break;
      }
      case 'identity':
        a = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
        break;
      case 'upper':
        a = sq().map((r, i) => r.map((x, j) => (i > j ? 0 : x)));
        break;
      case 'lower':
        a = sq().map((r, i) => r.map((x, j) => (i < j ? 0 : x)));
        break;
      case 'symmetric': {
        a = sq();
        for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) a[i][j] = a[j][i];
        break;
      }
      case 'skew': {
        a = Array.from({ length: n }, () => Array<number>(n).fill(0));
        for (let i = 0; i < n; i++)
          for (let j = i + 1; j < n; j++) {
            const v = nz(rng, -9, 9);
            a[i][j] = v;
            a[j][i] = -v;
          }
        break;
      }
    }
    if (bestType(typesOf(a)) === t) return a;
  }
  throw new Error(`could not make a ${t} matrix`);
}

const gen: Generator = {
  id: 'g-types',
  topic: T,
  levels: ['basic', 'exam'],
  make(rng, level) {
    const seed = Math.floor(rng.next() * 1e9);
    const meta = { id: `${T}:g:${seed}`, topic: T, level, source: 'generated' as const, gen: { id: 'g-types', seed } };
    if (rng.chance(0.3)) {
      const m = rng.int(2, 3);
      const n = m === 2 ? 3 : rng.pick([2, 4]);
      return transposeQ({ ...meta, title: 'Transpose' }, randMat(rng, m, n, level === 'basic' ? 0 : -15, level === 'basic' ? 9 : 30), rng.pick(['A', 'B']));
    }
    const pool: MType[] = level === 'basic' ? ['row', 'column', 'square', 'diagonal', 'scalar', 'identity'] : ['diagonal', 'scalar', 'upper', 'lower', 'symmetric', 'skew', 'square'];
    const t = rng.pick(pool);
    return typeQ({ ...meta, title: 'Name the type' }, matrixOfType(rng, t, level), rng.pick(['A', 'P', 'Q']), rng);
  },
  mcq(rng, level) {
    for (;;) {
      const q = this.make(rng, level);
      const cp = q.checkpoints[q.checkpoints.length - 1];
      if (cp.answer.kind !== 'choice') continue;
      const opts = [cp.answer.v, ...cp.answer.options.filter((o) => o !== cp.answer.v)];
      const name = /\$(\w)\$/.exec(q.prompt)?.[1] ?? 'A';
      const cells = (q.data as { terms: { cells: string[][] }[] }).terms[0].cells;
      return { id: `${q.id}:mcq`, topic: T, level, stem: `Give the most exact name for $${name} = ${texMat(cells)}$.`, options: opts, answer: 0, why: q.lesson.steps[1].say };
    }
  },
};

export const types: Topic = {
  id: T,
  chapter: 2,
  title: 'Types of matrices and the transpose',
  blurb: 'Square, row, column, diagonal, scalar, identity, triangular, symmetric',
  kind: 'numeric',
  pages: [2, 3],
  cards: [
    {
      id: 'why',
      title: 'Why a manager needs these names',
      body: [
        { p: 'The names in this topic are just **labels for shapes and patterns** that keep turning up in business tables. Knowing them lets you read a question quickly, and the exam asks them directly as MCQs.' },
        { list: ['A **distance chart** between cities reads the same both ways (Delhi→Mumbai = Mumbai→Delhi). That pattern has a name: **symmetric**.', 'A report with **one line** of figures (one product over 12 months) is a **row matrix**.', 'Turning a "products × months" report into a "months × products" report (as you would pivot in Excel) is the **transpose**.'] },
        { tip: 'Nothing is calculated in this topic except the transpose, and even that only moves numbers around.' },
      ],
    },
    {
      id: 'shape',
      title: 'Names that come from the shape',
      page: 2,
      body: [
        { def: 'Square matrix', text: 'Same number of rows and columns, like $3 \\times 3$. $\\mat{400 & 310 & 250 \\\\ 251 & 305 & 206 \\\\ 210 & 220 & 165}$' },
        { def: 'Row matrix', text: 'Just **one row**: $\\mat{21 & 22 & 16}$. Its order is $1 \\times 3$.' },
        { def: 'Column matrix', text: 'Just **one column**: $\\mat{40 \\\\ 25 \\\\ 20}$. Its order is $3 \\times 1$.' },
        { def: 'Similar matrices', text: 'Matrices of **the same size**, such as two $2 \\times 2$ matrices. Only these can be added or subtracted.' },
      ],
    },
    {
      id: 'diagonal',
      title: 'The main diagonal',
      page: 2,
      body: [
        { p: 'Most of the other names depend on one line inside a square matrix: the **main diagonal**. It runs from the **top-left corner to the bottom-right corner**.' },
        { board: { kind: 'mats', terms: [{ kind: 'mat', br: 'paren', cells: [['4', '7', '1'], ['2', '5', '8'], ['6', '3', '9']], marks: [0, 1, 2].map((k) => ({ type: 'cell' as const, i: k, j: k, at: 0, hl: 0 })) }] } },
        { p: 'Here the main diagonal is 4, 5, 9. Everything else is either **above** it (7, 1, 8) or **below** it (2, 6, 3).' },
        { tip: 'Only square matrices have a main diagonal that ends exactly in the corner.' },
      ],
    },
    {
      id: 'diag',
      title: 'Diagonal, scalar and identity',
      page: 2,
      body: [
        { def: 'Diagonal matrix', text: 'Square, and **every number off the diagonal is 0**. $\\mat{400 & 0 & 0 \\\\ 0 & 305 & 0 \\\\ 0 & 0 & 165}$' },
        { eg: 'Three salespeople each sell only their own product: person 1 sells only product 1, and so on. A sales table of "person × product" has numbers only on the diagonal.' },
        { def: 'Scalar matrix', text: 'A diagonal matrix whose diagonal numbers are **all equal**. $\\mat{115 & 0 & 0 \\\\ 0 & 115 & 0 \\\\ 0 & 0 & 115}$' },
        { def: 'Identity matrix ($I$)', text: 'A diagonal matrix whose diagonal numbers are **all 1**. $\\mat{1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1}$' },
        { p: 'They fit inside each other: every identity matrix is also scalar, and every scalar matrix is also diagonal. When asked to name one, give the **most exact** name.' },
        { tip: 'The identity matrix works like the number 1: multiplying by it changes nothing ($AI = A$).' },
      ],
    },
    {
      id: 'tri',
      title: 'Triangular matrices',
      page: 2,
      body: [
        { def: 'Upper triangular', text: 'Square, and **every number below the diagonal is 0**. The numbers form a triangle in the **upper** part. $\\mat{3 & 5 & 2 \\\\ 0 & 4 & 1 \\\\ 0 & 0 & 6}$' },
        { def: 'Lower triangular', text: 'Square, and **every number above the diagonal is 0**. The numbers form a triangle in the **lower** part. $\\mat{3 & 0 & 0 \\\\ 5 & 4 & 0 \\\\ 2 & 1 & 6}$' },
        { tip: 'Name it by where the **numbers** are, not where the zeros are: numbers in the upper part means upper triangular.' },
        { bookNote: 'The printed book defines both as "all the elements above the diagonal row are zero". Its pictures are right: upper triangular has zeros **below** the diagonal, lower triangular has zeros **above** it.' },
      ],
    },
    {
      id: 'sym',
      title: 'Symmetric and skew-symmetric',
      page: 2,
      body: [
        { def: 'Symmetric', text: 'Fold the matrix along its main diagonal: the numbers that land on each other are **equal**.' },
        { math: '\\mat{0 & 1400 & 2100 \\\\ 1400 & 0 & 1900 \\\\ 2100 & 1900 & 0}' },
        { eg: 'Distances (km) between Delhi, Mumbai and Chennai: Delhi→Mumbai is 1400 and Mumbai→Delhi is also 1400. A distance chart is always symmetric.' },
        { def: 'Skew-symmetric', text: 'Fold it the same way: the numbers that land on each other are **equal but with opposite signs** (5 and −5), and the diagonal is all **0**.' },
        { math: '\\mat{0 & 5 & -2 \\\\ -5 & 0 & 3 \\\\ 2 & -3 & 0}' },
        { eg: 'Profit of A on its deals with B, and of B with A: if A gains 5, B loses 5.' },
        { p: 'In the book\'s symbols: symmetric means $a_{ij} = a_{ji}$; skew-symmetric means $a_{ij} = -a_{ji}$.' },
      ],
    },
    {
      id: 'tr',
      title: 'The transpose: turn rows into columns',
      page: 3,
      body: [
        { p: 'The **transpose** of $A$, written $A\'$, is made by writing **row 1 as column 1, row 2 as column 2**, and so on. No arithmetic, only moving.' },
        { math: 'A = \\mat{4 & 7 & 1 \\\\ 2 & 5 & 8} \\quad\\Rightarrow\\quad A\' = \\mat{4 & 2 \\\\ 7 & 5 \\\\ 1 & 8}' },
        { p: 'So the size flips: $A$ is $2 \\times 3$, and $A\'$ is $3 \\times 2$.' },
        { eg: 'A report of 2 branches × 3 months becomes a report of 3 months × 2 branches. Same figures, turned round.' },
        { p: 'Two useful facts: transposing twice brings you back ($(A\')\' = A$), and a matrix is symmetric exactly when $A\' = A$.' },
        { bookNote: 'The printed example shows $A$ with second row $r, e, a$, but its $A\'$ has second column $f, e, d$. In the consistent version the second row of $A$ is $f, e, d$.' },
      ],
    },
    {
      id: 'recipe',
      title: 'Naming a matrix: 4 questions in order',
      body: [
        { list: ['**One row or one column?** Then it is a row matrix or a column matrix. Stop.', '**Rows = columns?** If yes, it is square; go on. If no, it is just rectangular.', '**Look off the diagonal.** All zeros → diagonal (then check: all diagonal numbers equal → scalar; all 1 → identity). Zeros only below → upper triangular. Zeros only above → lower triangular.', '**Fold along the diagonal.** Equal pairs → symmetric. Opposite pairs with 0s on the diagonal → skew-symmetric.'], ordered: true },
        { tip: 'Always give the most exact name. An identity matrix is also diagonal, but "identity" says more.' },
      ],
    },
  ],
  examples: [
    typeQ({ id: `${T}:bk1`, topic: T, level: 'basic', source: 'book-example', title: 'Book example: the scalar matrix', page: 2 }, [[115, 0, 0], [0, 115, 0], [0, 0, 115]], 'A'),
    transposeQ({ id: `${T}:ex0`, topic: T, level: 'basic', source: 'written', title: 'Extra example: transpose the nutrient matrix', page: 3, prompt: 'Write down the transpose of the book\'s $2 \\times 3$ nutrient matrix $N$ (rows: families; columns: protein, vitamin, fats).' }, [[20, 12, 5], [35, 6, 8]], 'N'),
    typeQ({ id: `${T}:ex1`, topic: T, level: 'basic', source: 'written', title: 'Extra example: a column of prices' }, [[45], [60], [32]], 'P'),
    typeQ({ id: `${T}:ex2`, topic: T, level: 'exam', source: 'written', title: 'Extra example: zeros below the diagonal' }, [[4, -2, 7], [0, 3, 5], [0, 0, -1]], 'U'),
    customQ(
      { id: `${T}:ex3`, topic: T, level: 'tough', source: 'written', title: 'Extra example: make it symmetric' },
      'Find $x$ and $y$ so that $A = \\mat{3 & x + 2 & 7 \\\\ 5 & 1 & 2y \\\\ 7 & 8 & 4}$ is symmetric.',
      [
        numCp('x', '$x$', 'Value of $x$', 3, 1, { slips: [[7, 'Use $a_{12} = a_{21}$: $x + 2 = 5$.']] }),
        numCp('y', '$y$', 'Value of $y$', 4, 2, { slips: [[16, 'Use $a_{23} = a_{32}$: $2y = 8$, so $y = 4$.']] }),
      ],
      {
        board: {
          kind: 'mats',
          terms: [
            {
              kind: 'mat',
              name: '$A =$',
              br: 'paren',
              cells: cellsOf([[3, 'x + 2', 7], [5, 1, '2y'], [7, 8, 4]]),
              marks: [
                { type: 'cell', i: 0, j: 1, at: 1, hl: 1, until: 2 },
                { type: 'cell', i: 1, j: 0, at: 1, hl: 1, until: 2 },
                { type: 'cell', i: 1, j: 2, at: 2, hl: 2, tone: 'b' },
                { type: 'cell', i: 2, j: 1, at: 2, hl: 2, tone: 'b' },
              ],
            },
          ],
        },
        steps: [
          { say: 'Symmetric means: fold the matrix along its main diagonal, and the numbers that land on each other are **equal**. So the number at row 1, column 2 must equal the number at row 2, column 1, and so on. The corner pair (7 and 7) already matches.' },
          { say: 'Row 1, column 2 holds $x + 2$; its partner at row 2, column 1 is 5. Set them equal and take 2 from both sides:', math: ['x + 2 = 5 \\Rightarrow x = 3'] },
          { say: 'Row 2, column 3 holds $2y$; its partner at row 3, column 2 is 8. Set them equal and divide both sides by 2. So the answer is:', math: ['2y = 8 \\Rightarrow y = 4'], after: 'Check: with $x = 3$ the top-middle number is $3 + 2 = 5$, matching its partner. $A$ now equals its own transpose.', end: true },
        ],
      },
    ),
  ],
  paper: [
    typeQ({ id: `${T}:p1`, topic: T, level: 'basic', source: 'written', title: 'Name the type: identity' }, [[1, 0], [0, 1]], 'I'),
    typeQ({ id: `${T}:p2`, topic: T, level: 'basic', source: 'written', title: 'Name the type: row' }, [[8, 3, 11, 6]], 'R'),
    transposeQ({ id: `${T}:p3`, topic: T, level: 'basic', source: 'written', title: 'Transpose of a 2 × 2' }, [[4, 9], [1, 6]], 'A'),
    typeQ({ id: `${T}:e1`, topic: T, level: 'exam', source: 'written', title: 'Name the type: lower triangular' }, [[2, 0, 0], [-3, 5, 0], [6, 1, 9]], 'L'),
    typeQ({ id: `${T}:e2`, topic: T, level: 'exam', source: 'written', title: 'Name the type: skew-symmetric' }, [[0, 4, -2], [-4, 0, 7], [2, -7, 0]], 'K'),
    transposeQ({ id: `${T}:e3`, topic: T, level: 'exam', source: 'written', title: 'Transpose of a sales matrix', prompt: 'Matrix $S$ gives sales of 2 products (rows) in 4 regions (columns). Write down $S\'$ and its order.' }, [[120, 85, 64, 150], [90, 110, 72, 135]], 'S'),
    typeQ({ id: `${T}:e4`, topic: T, level: 'exam', source: 'written', title: 'Name the type: symmetric' }, [[6, -1, 4], [-1, 2, 0], [4, 0, 9]], 'S'),
    customQ(
      { id: `${T}:t1`, topic: T, level: 'tough', source: 'written', title: 'Complete a skew-symmetric matrix' },
      '$A = \\mat{p & 3 & -5 \\\\ q & 0 & r \\\\ 5 & -8 & s}$ is skew-symmetric. Find $p + q + r + s$.',
      [
        numCp('q', '$q$', 'Value of $q$', -3, 1, { slips: [[3, 'Skew-symmetric: $a_{21} = -a_{12}$.']] }),
        numCp('r', '$r$', 'Value of $r$', 8, 1, { slips: [[-8, 'Skew-symmetric: $a_{23} = -a_{32} = -(-8)$.']] }),
        numCp('sum', '$p + q + r + s$', 'Value of $p + q + r + s$', 0 + -3 + 8 + 0, 2, { slips: [[-5, 'Check the signs: $q = -3$ and $r = +8$.']] }),
      ],
      {
        steps: [
          { say: 'In a skew-symmetric matrix the main diagonal (top-left to bottom-right) is all zeros, so $p$ and $s$ are 0.', math: ['p = 0,\\quad s = 0'] },
          { say: 'Fold along the diagonal: partners are equal but with **opposite signs**. $q$ is at row 2, column 1; its partner at row 1, column 2 is 3, so $q = -3$. $r$ is at row 2, column 3; its partner at row 3, column 2 is $-8$, so $r = 8$.', math: ['q = -3', 'r = -(-8) = 8'], after: 'Check one more pair: row 3, column 1 is 5 and its partner (row 1, column 3) is $-5$. Opposite signs ✓' },
          { say: 'So the answer is:', math: ['p + q + r + s = 0 - 3 + 8 + 0 = 5'], end: true },
        ],
      },
    ),
    customQ(
      { id: `${T}:t2`, topic: T, level: 'tough', source: 'written', title: 'A + A′ is symmetric' },
      'For $A = \\mat{2 & 5 \\\\ -1 & 4}$, find $A + A\'$ and say what type of matrix it is.',
      [
        matCp('s', "$A + A'$", "The matrix $A + A'$", [[4, 4], [4, 8]], 1, { slips: [[[[4, 10], [-2, 8]], "That is $2A$. Add $A$ to its transpose $A'$, not to itself."]] }),
        choiceCp('t', 'Type', "What type is $A + A'$?", ['Symmetric matrix', 'Skew-symmetric matrix', 'Diagonal matrix', 'Identity matrix'], 'Symmetric matrix', 2),
      ],
      {
        steps: [
          { say: "Transpose $A$: rows become columns.", math: ["A' = \\mat{2 & -1 \\\\ 5 & 4}"] },
          { say: 'Add element by element.', math: ["A + A' = \\mat{2 + 2 & 5 + (-1) \\\\ -1 + 5 & 4 + 4} = \\mat{4 & 4 \\\\ 4 & 8}"] },
          { say: "The two off-diagonal elements are equal (4 and 4), so $A + A'$ equals its own transpose. So it is a **Symmetric matrix**.", after: "This always happens: $A + A'$ is symmetric for every square $A$.", end: true },
        ],
      },
    ),
    customQ(
      { id: `${T}:t3`, topic: T, level: 'tough', source: 'written', title: 'Scalar or identity?' },
      '$D = \\mat{k - 2 & 0 & 0 \\\\ 0 & 3 & 0 \\\\ 0 & 0 & m + 1}$ is a scalar matrix. Find $k$ and $m$. For which value would it become an identity matrix instead?',
      [
        numCp('k', '$k$', 'Value of $k$', 5, 0, { slips: [[1, 'All diagonal elements must equal 3: $k - 2 = 3$.']] }),
        numCp('m', '$m$', 'Value of $m$', 2, 0, { slips: [[4, '$m + 1 = 3$, so $m = 2$.']] }),
        choiceCp('id', 'Identity?', 'What must the middle diagonal element be for an identity matrix?', ['0', '1', '3', 'Any number'], '1', 1),
      ],
      {
        steps: [
          { say: 'A scalar matrix has all diagonal elements equal. The middle one is 3, so the others must be 3 too.', math: ['k - 2 = 3 \\Rightarrow k = 5', 'm + 1 = 3 \\Rightarrow m = 2'] },
          { say: 'An identity matrix is the scalar matrix whose diagonal elements are all 1. So the middle element would have to be **1**, not 3.', end: true },
        ],
      },
    ),
  ],
  gens: [gen],
  mcqs: [
    mcq(`${T}:c1`, T, 'basic', 'A matrix with all non-diagonal elements zero is called…', 'a diagonal matrix', ['a scalar matrix', 'a row matrix', 'a symmetric matrix only'], 'Book definition (d).'),
    mcq(`${T}:c2`, T, 'basic', '$\\mat{1 & 0 \\\\ 0 & 1}$ is…', 'the identity matrix', ['a zero matrix', 'a row matrix', 'a skew-symmetric matrix'], 'Diagonal elements are all 1, the rest 0.'),
    mcq(`${T}:c3`, T, 'exam', 'Which statement is true?', 'Every identity matrix is a scalar matrix', ['Every scalar matrix is an identity matrix', 'Every diagonal matrix is a scalar matrix', 'Every square matrix is diagonal'], 'Identity is the scalar matrix with diagonal 1; the converse fails (e.g. diagonal 5, 5, 5).'),
    mcq(`${T}:c4`, T, 'exam', 'In an upper triangular matrix, the elements that must be zero are those…', 'below the main diagonal', ['above the main diagonal', 'on the main diagonal', 'in the first row'], 'The numbers sit in the upper triangle; zeros are below. (The printed book wrongly says "above" for both types.)'),
    mcq(`${T}:c5`, T, 'exam', 'The diagonal elements of a skew-symmetric matrix are always…', '0', ['1', 'equal to each other but not zero', 'negative'], '$a_{ii} = -a_{ii}$ forces $a_{ii} = 0$.'),
    mcq(`${T}:c6`, T, 'basic', 'If $A$ is $2 \\times 5$, then $A\'$ is…', '$5 \\times 2$', ['$2 \\times 5$', '$5 \\times 5$', '$10 \\times 1$'], 'Transposing swaps rows and columns.'),
    mcq(`${T}:c7`, T, 'exam', 'A matrix $A$ is symmetric when…', "$A' = A$", ["$A' = -A$", '$A = I$', 'all its elements are equal'], 'Symmetric: $a_{ij} = a_{ji}$, i.e. $A$ equals its transpose.'),
    mcq(`${T}:c8`, T, 'basic', '"Similar matrices" in the book means matrices that…', 'have the same size', ['have the same elements', 'are both square', 'have the same diagonal'], 'Book definition (g).'),
    mcq(`${T}:c9`, T, 'exam', 'Which matrix is both upper and lower triangular?', 'Any diagonal matrix', ['Any symmetric matrix', 'Any row matrix', 'No matrix can be both'], 'Zeros above and below the diagonal: that is a diagonal matrix.'),
    mcq(`${T}:c10`, T, 'tough', "For any matrix $A$, $(A')' =$", '$A$', ["$A'$", '$-A$', '$I$'], 'Swapping rows and columns twice brings you back.'),
    mcq(`${T}:c11`, T, 'tough', '$\\mat{0 & 2 \\\\ -2 & 0}$ is…', 'skew-symmetric', ['symmetric', 'scalar', 'identity'], '$a_{12} = 2 = -a_{21}$ and the diagonal is zero.'),
    mcq(`${T}:c12`, T, 'basic', 'A $1 \\times 4$ matrix is called…', 'a row matrix', ['a column matrix', 'a square matrix', 'a diagonal matrix'], 'One row, four columns.'),
  ],
};
