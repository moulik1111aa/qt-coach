// Unit 2 · Addition and subtraction of matrices (book pp. 3–4 of the unit).

import type { Rng } from '../../core/rng.ts';
import { elementMcq, mcq } from '../kit.ts';
import type { Generator, Topic } from '../types.ts';
import { addSubQ, comboQ } from './build.ts';

const T = 'm-addsub';

/** Random matrix with entries in [lo, hi]. */
export function randMat(rng: Rng, rows: number, cols: number, lo: number, hi: number): number[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => rng.int(lo, hi)));
}

const gen: Generator = {
  id: 'g-addsub',
  topic: T,
  levels: ['basic', 'exam'],
  make(rng, level) {
    const seed = Math.floor(rng.next() * 1e9);
    const op = rng.chance(0.5) ? '+' : '-';
    if (level === 'basic') {
      const a = randMat(rng, 2, 2, 0, 9);
      const b = randMat(rng, 2, 2, 0, 9);
      return addSubQ({ id: `${T}:g:${seed}`, topic: T, level, source: 'generated', title: op === '+' ? 'Add two matrices' : 'Subtract two matrices', gen: { id: 'g-addsub', seed } }, a, b, op);
    }
    const rows = rng.pick([2, 3]);
    const cols = rows === 2 ? 3 : rng.pick([2, 3]);
    const a = randMat(rng, rows, cols, -12, 30);
    const b = randMat(rng, rows, cols, -12, 30);
    return addSubQ({ id: `${T}:g:${seed}`, topic: T, level, source: 'generated', title: op === '+' ? 'Add two matrices' : 'Subtract two matrices', gen: { id: 'g-addsub', seed } }, a, b, op);
  },
  mcq(rng, level) {
    const q = this.make(rng, level);
    return elementMcq(q, rng, q.prompt.match(/\$(A [+-] B)\$/)?.[1] ?? 'A + B');
  },
};

const A1 = [[3, 5], [1, 0]];
const B1 = [[4, 9], [5, 7]];

export const addsub: Topic = {
  id: T,
  chapter: 2,
  title: 'Addition and subtraction',
  blurb: 'Same size only; work element by element',
  kind: 'numeric',
  pages: [3, 4],
  primers: ['p-signs'],
  cards: [
    {
      id: 'rule',
      title: 'When can two matrices be added?',
      page: 3,
      body: [
        { p: 'Two matrices can be added or subtracted **only when they are the same size** (same number of rows and same number of columns).' },
        { p: 'You then work **element by element**: the element in row 1, column 1 of the first matrix goes with the element in row 1, column 1 of the second, and so on.' },
        { p: 'The answer has the **same size** as the matrices you started with.' },
        { eg: 'Two shops record weekly sales of 3 products over 2 weeks, each as a $2 \\times 3$ matrix. Adding the matrices gives the combined sales of both shops, product by product and week by week.' },
      ],
    },
    {
      id: 'add',
      title: 'Addition',
      page: 3,
      body: [
        { p: 'Add the corresponding elements:' },
        { math: '\\mat{a & b \\\\ c & d} + \\mat{w & x \\\\ y & z} = \\mat{a + w & b + x \\\\ c + y & d + z}' },
        { p: 'Book example:' },
        { math: '\\mat{3 & 5 \\\\ 1 & 0} + \\mat{4 & 9 \\\\ 5 & 7} = \\mat{7 & 14 \\\\ 6 & 7}' },
        { def: 'Addition is commutative', text: '$A + B = B + A$. Adding in either order gives the same matrix, just as $3 + 4 = 4 + 3$.' },
      ],
    },
    {
      id: 'sub',
      title: 'Subtraction',
      page: 4,
      body: [
        { p: 'Subtract each element of the second matrix from the element in the same position of the first:' },
        { math: '\\mat{a & b \\\\ c & d} - \\mat{w & x \\\\ y & z} = \\mat{a - w & b - x \\\\ c - y & d - z}' },
        { p: 'Book examples, using the same two matrices both ways round:' },
        { math: '\\mat{3 & 5 \\\\ 1 & 0} - \\mat{4 & 9 \\\\ 5 & 7} = \\mat{-1 & -4 \\\\ -4 & -7}' },
        { math: '\\mat{4 & 9 \\\\ 5 & 7} - \\mat{3 & 5 \\\\ 1 & 0} = \\mat{1 & 4 \\\\ 4 & 7}' },
        { def: 'Subtraction is not commutative', text: '$A - B \\ne B - A$. The two answers above have opposite signs, so the order matters.' },
        { tip: 'When the second number is bigger, the result is negative: $3 - 4 = -1$. Most mistakes in this topic are lost minus signs.' },
      ],
    },
    {
      id: 'combo',
      title: 'Combining with scalar multiplication',
      body: [
        { p: 'Exam questions often ask for something like $2A - 3B$. Multiply each matrix by its number first (every element), then add or subtract element by element.' },
        { tip: 'Scalar multiplication has its own topic next. Here you only need: $kA$ means every element of $A$ multiplied by $k$.' },
      ],
    },
  ],
  examples: [
    addSubQ({ id: `${T}:bk1`, topic: T, level: 'basic', source: 'book-example', title: 'Book example: addition', page: 3 }, A1, B1, '+'),
    addSubQ({ id: `${T}:bk2`, topic: T, level: 'basic', source: 'book-example', title: 'Book example: subtraction', page: 4 }, A1, B1, '-'),
    addSubQ(
      { id: `${T}:ex1`, topic: T, level: 'basic', source: 'written', title: 'Extra example: stock in two warehouses', prompt: 'Warehouse P holds the stock (in cartons) below; Warehouse Q holds the second matrix. Rows are products X and Y; columns are sizes S and L. Find the total stock $P + Q$.', meaning: 'For example, the company holds 37 cartons of product X in size S across both warehouses.' },
      [[25, 40], [18, 32]],
      [[12, 15], [20, 9]],
      '+',
      ['P', 'Q'],
    ),
    addSubQ(
      { id: `${T}:ex2`, topic: T, level: 'exam', source: 'written', title: 'Extra example: change in sales', prompt: 'Monthly sales (₹ thousand) of three products in two regions are given for March ($M$) and April ($N$). Rows are regions North and South; columns are products. Find the change in sales $N - M$ and say what a negative entry means.', meaning: 'A negative entry is a fall in sales: in the North, sales of the first product fell by ₹7 thousand.' },
      [[48, 35, 60], [52, 41, 38]],
      [[55, 31, 72], [50, 35, 45]],
      '-',
      ['N', 'M'],
    ),
    comboQ(
      { id: `${T}:ex3`, topic: T, level: 'tough', source: 'written', title: 'Extra example: 3A − 2B with negatives', prompt: 'Find $3A - 2B$.' },
      3,
      [[2, -1, 0], [4, 3, -2]],
      -2,
      [[1, -3, 5], [-2, 4, 1]],
    ),
  ],
  paper: [
    addSubQ({ id: `${T}:p1`, topic: T, level: 'basic', source: 'written', title: 'Add two 2 × 2 matrices' }, [[6, 2], [3, 8]], [[1, 7], [4, 0]], '+'),
    addSubQ({ id: `${T}:p2`, topic: T, level: 'basic', source: 'written', title: 'Subtract two 2 × 2 matrices' }, [[9, 4], [7, 2]], [[3, 6], [1, 5]], '-'),
    addSubQ(
      { id: `${T}:e1`, topic: T, level: 'exam', source: 'written', title: 'Total production of two plants', prompt: 'Plant I and Plant II produce three models (columns) in two shifts (rows). Daily output is given below. Find the combined daily output $I + II$.' },
      [[120, 85, 60], [110, 90, 45]],
      [[95, 70, 55], [100, 65, 40]],
      '+',
      ['I', 'II'],
    ),
    addSubQ(
      { id: `${T}:e2`, topic: T, level: 'exam', source: 'written', title: 'Profit = revenue − cost', prompt: 'Revenue $R$ and cost $C$ (₹ lakh) for two branches (rows) over three quarters (columns) are given. Find the profit matrix $R - C$.' },
      [[14.5, 16.2, 18], [11.8, 12.5, 13.4]],
      [[11.2, 12.9, 13.5], [12.1, 11.7, 12.6]],
      '-',
      ['R', 'C'],
    ),
    comboQ({ id: `${T}:e3`, topic: T, level: 'exam', source: 'written', title: 'Find 2A + B' }, 2, [[3, -1], [0, 5]], 1, [[-4, 6], [2, -3]]),
    comboQ({ id: `${T}:e4`, topic: T, level: 'exam', source: 'written', title: 'Find A − 3B' }, 1, [[10, 4, -2], [7, 0, 9]], -3, [[2, 1, -1], [3, -2, 4]]),
    comboQ(
      { id: `${T}:t1`, topic: T, level: 'tough', source: 'written', title: 'Find 5A − 4B (3 × 3)' },
      5,
      [[1, 0, -2], [3, -1, 4], [0, 2, 1]],
      -4,
      [[2, -1, 0], [1, 3, -2], [-3, 0, 5]],
    ),
    addSubQ(
      {
        id: `${T}:t2`,
        topic: T,
        level: 'tough',
        source: 'written',
        title: 'Find X from X + A = B',
        prompt: 'Find the matrix $X$ such that $X + A = B$. (Hint: $X = B - A$.)',
      },
      [[7, -2, 5], [0, 9, -6]],
      [[3, 4, -1], [-5, 2, 8]],
      '-',
      ['B', 'A'],
    ),
    comboQ(
      { id: `${T}:t3`, topic: T, level: 'tough', source: 'written', title: 'Decimals: 0.5A − 1.5B', prompt: 'Find $0.5A - 1.5B$.' },
      0.5,
      [[8, -6], [3, 10]],
      -1.5,
      [[2, -4], [1, 0.6]],
    ),
  ],
  gens: [gen],
  mcqs: [
    mcq('m-addsub:c1', T, 'basic', 'Matrices $A$ and $B$ can be added only when…', 'they have the same number of rows and the same number of columns', ['they are both square', 'the number of columns of $A$ equals the number of rows of $B$', 'they have the same number of elements'], 'Addition works element by element, so every position in $A$ needs a partner in the same position of $B$: same rows **and** same columns.'),
    mcq('m-addsub:c2', T, 'basic', 'If $A$ is $2 \\times 3$ and $B$ is $2 \\times 3$, the size of $A + B$ is…', '$2 \\times 3$', ['$4 \\times 6$', '$2 \\times 6$', '$3 \\times 2$'], 'Adding does not change the size.'),
    mcq('m-addsub:c3', T, 'basic', 'Which statement is always true for matrices of the same size?', '$A + B = B + A$', ['$A - B = B - A$', '$A + B = A - B$', '$A - B = -A + B$'], 'Addition is commutative; subtraction is not.'),
    mcq('m-addsub:c4', T, 'exam', 'For matrices of the same size, $A - B$ and $B - A$ are related by…', '$B - A = -(A - B)$: every element changes sign', ['They are always equal', '$B - A$ is the transpose of $A - B$', 'They have different sizes'], 'Each element $a - b$ becomes $b - a = -(a - b)$.'),
    mcq('m-addsub:c5', T, 'exam', 'If $A$ is $2 \\times 2$ and $B$ is $2 \\times 3$, then $A + B$…', 'does not exist', ['is $2 \\times 3$', 'is $2 \\times 2$', 'is $4 \\times 5$'], 'The sizes differ, so some elements would have no partner.'),
    mcq('m-addsub:c6', T, 'basic', '$\\mat{2 & 5 \\\\ 1 & 3} + \\mat{4 & -1 \\\\ 0 & 2} =$', '$\\mat{6 & 4 \\\\ 1 & 5}$', ['$\\mat{6 & 6 \\\\ 1 & 5}$', '$\\mat{8 & -5 \\\\ 0 & 6}$', '$\\mat{-2 & 6 \\\\ 1 & 1}$'], 'Add element by element: $2+4, 5+(-1), 1+0, 3+2$.'),
    mcq('m-addsub:c7', T, 'exam', '$\\mat{3 & 5 \\\\ 1 & 0} - \\mat{4 & 9 \\\\ 5 & 7} =$', '$\\mat{-1 & -4 \\\\ -4 & -7}$', ['$\\mat{1 & 4 \\\\ 4 & 7}$', '$\\mat{7 & 14 \\\\ 6 & 7}$', '$\\mat{-1 & 4 \\\\ -4 & 7}$'], 'Book example: subtract each element of the second from the first; all four results are negative.'),
    mcq('m-addsub:c8', T, 'exam', 'If $X + \\mat{1 & 2 \\\\ 3 & 4} = \\mat{5 & 5 \\\\ 5 & 5}$, then $X =$', '$\\mat{4 & 3 \\\\ 2 & 1}$', ['$\\mat{6 & 7 \\\\ 8 & 9}$', '$\\mat{-4 & -3 \\\\ -2 & -1}$', '$\\mat{5 & 10 \\\\ 15 & 20}$'], '$X = B - A$: subtract element by element.'),
    mcq('m-addsub:c9', T, 'basic', 'The matrix with every element zero is called the zero (null) matrix $O$. For any $A$ of the same size, $A + O =$', '$A$', ['$O$', '$2A$', '$-A$'], 'Adding zero to every element changes nothing. $O$ is the additive identity.'),
    mcq('m-addsub:c10', T, 'exam', 'Sales matrices $J$ (January) and $F$ (February) are the same size. What does $F - J$ show?', 'The change in sales from January to February, item by item', ['Total sales of both months', 'Average sales', 'January sales as a share of February sales'], 'Each element is February minus January for the same product and place: the change.'),
    mcq('m-addsub:c11', T, 'tough', 'If $A = \\mat{x & 3 \\\\ 2 & y}$, $B = \\mat{4 & -1 \\\\ z & 6}$ and $A + B = \\mat{9 & 2 \\\\ 0 & 1}$, then $x + y + z =$', '$-2$', ['$12$', '$6$', '$0$'], 'From the corners: $x + 4 = 9$ gives $x = 5$; $2 + z = 0$ gives $z = -2$; $y + 6 = 1$ gives $y = -5$. Sum $= 5 - 5 - 2 = -2$.'),
  ],
};
