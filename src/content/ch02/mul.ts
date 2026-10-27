// Unit 2 · Multiplication of matrices (book p. 4 of the unit).

import { M, matMul, val } from '../../core/num.ts';
import { choiceCp, customQ, elementMcq, matCp, mcq, mcqFrom, numCp } from '../kit.ts';
import type { Generator, Topic } from '../types.ts';
import { existsQ, mulQ } from './build.ts';
import { randMat } from './addsub.ts';

const T = 'm-mul';

const gen: Generator = {
  id: 'g-mul',
  topic: T,
  levels: ['basic', 'exam'],
  make(rng, level) {
    const seed = Math.floor(rng.next() * 1e9);
    const meta = { id: `${T}:g:${seed}`, topic: T, level, source: 'generated' as const, gen: { id: 'g-mul', seed } };
    if (level === 'basic') {
      if (rng.chance(0.25)) {
        const n = rng.int(2, 3);
        return mulQ({ ...meta, title: 'Row × column' }, randMat(rng, 1, n, 1, 9), randMat(rng, n, 1, 1, 9));
      }
      return mulQ({ ...meta, title: 'Multiply two 2 × 2 matrices' }, randMat(rng, 2, 2, 0, 6), randMat(rng, 2, 2, 0, 6));
    }
    if (rng.chance(0.2)) {
      const a: [number, number] = [rng.int(1, 4), rng.int(2, 4)];
      const b: [number, number] = [rng.chance(0.5) ? a[1] : rng.int(1, 4), rng.int(1, 4)];
      if (b[0] === a[1] && rng.chance(0.3)) b[0] = a[1] === 4 ? 3 : a[1] + 1;
      return existsQ({ ...meta, title: 'Does the product exist?' }, a, b);
    }
    const shape = rng.pick([
      [2, 3, 2],
      [3, 2, 2],
      [2, 2, 3],
      [2, 3, 1],
    ]);
    return mulQ({ ...meta, title: `Multiply ${shape[0]} × ${shape[1]} by ${shape[1]} × ${shape[2]}` }, randMat(rng, shape[0], shape[1], -5, 9), randMat(rng, shape[1], shape[2], -5, 9));
  },
  mcq(rng, level) {
    for (;;) {
      const q = this.make(rng, level);
      const last = q.checkpoints[q.checkpoints.length - 1];
      if (last.answer.kind === 'matrix') return elementMcq(q, rng, 'AB');
      if (last.answer.kind === 'num') return mcqFrom(q, rng, q.prompt);
      // Yes/no questions make poor four-option MCQs: make another.
    }
  },
};

const BA = [[3, 5], [1, 0]];
// Values quoted in the stories are computed, never typed.
const BILL = val(matMul(M([[3, 2, 5]]), M([[60], [110], [40]]))[0][0]);
const SV = matMul(M([[10, 25, 5], [20, 15, 12]]), M([[80, 20], [50, 10], [80, 16]])).map((r) => r.map(val));
const inr = (x: number) => x.toLocaleString('en-IN');
const BB = [[4, 9], [5, 7]];

export const mul: Topic = {
  id: T,
  chapter: 2,
  title: 'Matrix multiplication',
  blurb: 'Row × column, then add; AB ≠ BA',
  kind: 'numeric',
  pages: [4],
  cards: [
    {
      id: 'why',
      title: 'Why a manager multiplies matrices: the bill',
      body: [
        { p: 'A customer buys 10 pens, 4 notebooks and 6 erasers. Prices are ₹25, ₹60 and ₹15. You already know how to make the bill:' },
        { math: '10 \\times 25 + 4 \\times 60 + 6 \\times 15 = 250 + 240 + 90 = 580' },
        { p: 'Look at what you did: you took the **quantities** (written across, as a row) and the **prices** (written down, as a column), multiplied **first with first, second with second, third with third**, then **added**. That is exactly matrix multiplication:' },
        { math: '\\mat{10 & 4 & 6} \\times \\mat{25 \\\\ 60 \\\\ 15} = \\mat{580}' },
        { p: 'With many customers and several price lists, one matrix multiplication makes **every bill at once**. Costing, payroll and stock valuation all work this way.' },
      ],
    },
    {
      id: 'how',
      title: 'Row times column, then add',
      page: 4,
      body: [
        { p: 'Every number in the answer comes from **one row** of the first matrix and **one column** of the second, exactly like the bill. Here is the book\'s example, one place at a time:' },
        { math: '\\mat{3 & 5 \\\\ 1 & 0} \\times \\mat{4 & 9 \\\\ 5 & 7}' },
        { list: ['**Top-left:** row 1 $(3, 5)$ with column 1 $(4, 5)$: $3 \\times 4 + 5 \\times 5 = 12 + 25 = 37$', '**Top-right:** row 1 $(3, 5)$ with column 2 $(9, 7)$: $3 \\times 9 + 5 \\times 7 = 27 + 35 = 62$', '**Bottom-left:** row 2 $(1, 0)$ with column 1 $(4, 5)$: $1 \\times 4 + 0 \\times 5 = 4$', '**Bottom-right:** row 2 $(1, 0)$ with column 2 $(9, 7)$: $1 \\times 9 + 0 \\times 7 = 9$'] },
        { math: '= \\mat{37 & 62 \\\\ 4 & 9}' },
        { tip: 'The place tells you which row and which column to use: row 1, column 2 of the answer uses **row 1** of the first matrix and **column 2** of the second.' },
        { bookNote: 'The printed answer shows **52** in the top right, and a minus sign between the matrices. $3 \\times 9 + 5 \\times 7 = 27 + 35 = 62$, and the matrices are multiplied.' },
      ],
    },
    {
      id: 'when',
      title: 'When is multiplying allowed?',
      page: 4,
      body: [
        { p: 'In the bill, 3 quantities were paired with 3 prices. If there were 3 quantities but only 2 prices, one item would have no price, and the bill could not be made.' },
        { p: 'So: the **number of columns in the first** matrix must equal the **number of rows in the second**. Easy way to check: write the two sizes side by side.' },
        { math: '(1 \\times 3) \\quad (3 \\times 1)' },
        { list: ['The two **middle** numbers must be equal (here 3 and 3). If they are not, the product does not exist.', 'The two **outside** numbers give the size of the answer (here $1 \\times 1$: one bill).'] },
        { p: 'The book calls matching sizes **conformable** (or "congruent dimensions"). In letters: an $m \\times n$ matrix times an $n \\times p$ matrix gives an $m \\times p$ matrix.' },
      ],
    },
    {
      id: 'bigger',
      title: 'Many bills at once',
      body: [
        { p: 'Two customers (rows) buy pens, notebooks and erasers. There are two price lists (columns): regular and sale.' },
        { math: '\\mat{10 & 4 & 6 \\\\ 5 & 8 & 2} \\times \\mat{25 & 20 \\\\ 60 & 50 \\\\ 15 & 12}' },
        { p: 'The first matrix is the quantities: 2 customers × 3 items. The second is the prices: 3 items × 2 price lists (₹ per unit).' },
        { p: 'Sizes: $(2 \\times 3)(3 \\times 2)$. Middle numbers match (3 items). Answer size: $2 \\times 2$, one bill for each customer under each price list.' },
        { list: ['Customer 1, regular: $10 \\times 25 + 4 \\times 60 + 6 \\times 15 = 580$', 'Customer 1, sale: $10 \\times 20 + 4 \\times 50 + 6 \\times 12 = 472$', 'Customer 2, regular: $5 \\times 25 + 8 \\times 60 + 2 \\times 15 = 635$', 'Customer 2, sale: $5 \\times 20 + 8 \\times 50 + 2 \\times 12 = 524$'] },
        { math: '= \\mat{580 & 472 \\\\ 635 & 524}' },
        { tip: 'Each answer has a meaning: row 2, column 1 is "customer 2 at regular prices".' },
      ],
    },
    {
      id: 'rules',
      title: 'Rules to remember',
      page: 4,
      body: [
        { def: 'Order matters', text: '$AB$ and $BA$ are usually different, and one may exist while the other does not. Quantities × prices is a bill; prices × quantities is a different table altogether. (The book: multiplication is **not commutative**.)' },
        { def: 'Grouping does not matter', text: 'With three matrices, $(AB)C = A(BC)$: you may multiply either pair first, as long as the left-to-right order stays the same. (The book: **associative**.)' },
        { def: 'The identity works like 1', text: '$AI = IA = A$.' },
        { p: 'The book also mentions row operations and the inverse of a matrix in its summary; they come up later with determinants.' },
      ],
    },
    {
      id: 'recipe',
      title: 'The method in 4 steps',
      body: [
        { list: ['**Write the sizes** side by side. Middle numbers equal? Then go on; if not, the product does not exist.', '**Draw an empty answer** of the outside size (rows of the first × columns of the second).', '**Fill each place:** for row $i$, column $j$, take row $i$ of the first and column $j$ of the second; multiply first with first, second with second, and so on; then **add**.', '**Check one place** again, especially minus signs.'], ordered: true },
        { tip: 'Say "across, then down": read the row across, read the column down.' },
      ],
    },
    {
      id: 'general',
      title: 'The book\'s general form',
      optional: true,
      page: 4,
      body: [
        { p: 'The book writes the rule for any $2 \\times 2$ matrices in letters. It is the same "row times column, then add" you used above:' },
        { math: '\\mat{a & b \\\\ c & d} \\times \\mat{w & x \\\\ y & z} = \\mat{aw + by & ax + bz \\\\ cw + dy & cx + dz}' },
        { bookNote: 'The printed general form has the second row as $cw + cy$ and $dx + dz$. It should be $cw + dy$ and $cx + dz$.' },
        { p: 'Row matrix times column matrix (book example):' },
        { math: '\\mat{4 & 3} \\times \\mat{3 \\\\ 2} = (4 \\times 3 + 3 \\times 2) = (12 + 6) = (18)' },
        { bookNote: 'The printed working leaves out the plus sign: "(4 × 3   3 × 2)". The products are added.' },
      ],
    },
  ],
  examples: [
    mulQ({ id: `${T}:bk1`, topic: T, level: 'basic', source: 'book-example', title: 'Book example: two 2 × 2 matrices', page: 4, bookNote: 'The printed answer has 52 in the top right; the correct value is 62.' }, BA, BB),
    mulQ({ id: `${T}:bk2`, topic: T, level: 'basic', source: 'book-example', title: 'Book example: row × column', page: 4 }, [[4, 3]], [[3], [2]]),
    mulQ({ id: `${T}:ex1`, topic: T, level: 'basic', source: 'written', title: 'Extra example: a shopping bill', prompt: 'A customer buys 3 kg rice, 2 kg dal and 5 kg flour, written $Q = \\mat{3 & 2 & 5}$. Prices (₹/kg) are $P$ (a column). Find the bill $QP$.', meaning: `The bill is ₹${inr(BILL)}.` }, [[3, 2, 5]], [[60], [110], [40]], ['Q', 'P']),
    mulQ({ id: `${T}:ex2`, topic: T, level: 'exam', source: 'written', title: 'Extra example: revenue of two shops', prompt: 'Units sold by two shops (rows) of three products (columns) are matrix $S$. Price and profit per unit (₹) of each product are the columns of $V$. Find $SV$: each shop\'s revenue and profit.', meaning: `Shop 1 earns ₹${inr(SV[0][0])} revenue and ₹${inr(SV[0][1])} profit; Shop 2 earns ₹${inr(SV[1][0])} and ₹${inr(SV[1][1])}.` }, [[10, 25, 5], [20, 15, 12]], [[80, 20], [50, 10], [80, 16]], ['S', 'V']),
    customQ(
      { id: `${T}:ex3`, topic: T, level: 'tough', source: 'written', title: 'Extra example: AB and BA are different' },
      'For $A = \\mat{1 & 2 \\\\ 0 & 3}$ and $B = \\mat{2 & 0 \\\\ 1 & 4}$, find $AB$ and $BA$. Are they equal?',
      [
        matCp('ab', '$AB$', 'The product $AB$', matMul(M([[1, 2], [0, 3]]), M([[2, 0], [1, 4]])), 0),
        matCp('ba', '$BA$', 'The product $BA$', matMul(M([[2, 0], [1, 4]]), M([[1, 2], [0, 3]])), 1, { slips: [[[[4, 8], [3, 12]], 'That is $AB$ again. For $BA$, use rows of $B$ and columns of $A$.']] }),
        choiceCp('eq', 'Equal?', 'Is $AB = BA$?', ['Yes', 'No'], 'No', 2),
      ],
      {
        steps: [
          { say: '**$AB$**: use the row × column rule for each of the four places, with $A$ first. For example, top-left is row 1 of $A$ (1, 2) with column 1 of $B$ (2, 1): $1 \\times 2 + 2 \\times 1 = 4$.', math: ['AB = \\mat{1 \\times 2 + 2 \\times 1 & 1 \\times 0 + 2 \\times 4 \\\\ 0 \\times 2 + 3 \\times 1 & 0 \\times 0 + 3 \\times 4} = \\mat{4 & 8 \\\\ 3 & 12}'] },
          { say: '**$BA$**: the same rule, but now $B$ comes first: rows of $B$ with columns of $A$.', math: ['BA = \\mat{2 \\times 1 + 0 \\times 0 & 2 \\times 2 + 0 \\times 3 \\\\ 1 \\times 1 + 4 \\times 0 & 1 \\times 2 + 4 \\times 3} = \\mat{2 & 4 \\\\ 1 & 14}'] },
          { say: 'Compare them place by place: 4 and 2 already differ. So the answer is: **No**, $AB \\ne BA$.', after: 'Swapping the order changed the answer. With matrices, the order of multiplication matters (the book: multiplication is not commutative).', end: true },
        ],
      },
    ),
  ],
  paper: [
    mulQ({ id: `${T}:p1`, topic: T, level: 'basic', source: 'written', title: 'Multiply two 2 × 2 matrices' }, [[2, 1], [3, 4]], [[1, 5], [2, 0]]),
    mulQ({ id: `${T}:p2`, topic: T, level: 'basic', source: 'written', title: 'Row × column' }, [[2, 5, 1]], [[4], [3], [6]]),
    existsQ({ id: `${T}:p3`, topic: T, level: 'basic', source: 'written', title: 'Does AB exist? (2 × 3, 3 × 4)' }, [2, 3], [3, 4]),
    mulQ({ id: `${T}:e1`, topic: T, level: 'exam', source: 'written', title: 'Cost of materials', prompt: 'Two products need materials X, Y, Z (kg per unit) as in matrix $R$ (rows: products). Costs (₹/kg) of X, Y, Z are column $C$. Find the cost per unit of each product, $RC$.' }, [[2, 3, 1], [4, 1, 2]], [[25], [40], [15]], ['R', 'C']),
    mulQ({ id: `${T}:e2`, topic: T, level: 'exam', source: 'written', title: '2 × 3 times 3 × 2 with negatives' }, [[1, -2, 3], [0, 4, -1]], [[2, 1], [-1, 3], [4, 0]]),
    existsQ({ id: `${T}:e3`, topic: T, level: 'exam', source: 'written', title: 'Does AB exist? (3 × 2, 3 × 2)' }, [3, 2], [3, 2]),
    mulQ({ id: `${T}:e4`, topic: T, level: 'exam', source: 'written', title: '3 × 2 times 2 × 2' }, [[3, 1], [-2, 4], [0, 5]], [[2, -1], [1, 3]]),
    customQ(
      { id: `${T}:t1`, topic: T, level: 'tough', source: 'written', title: 'A² − 5A' },
      'If $A = \\mat{2 & 3 \\\\ 1 & 4}$, find $A^2 - 5A$. ($A^2$ means $A \\times A$.)',
      [
        matCp('a2', '$A^2$', 'The matrix $A^2$', [[7, 18], [6, 19]], 0, { slips: [[[[4, 9], [1, 16]], 'Squaring each element is not $A \\times A$. Multiply row by column.']] }),
        matCp('r', '$A^2 - 5A$', 'The matrix $A^2 - 5A$', [[-3, 3], [1, -1]], 1),
      ],
      {
        steps: [
          { say: '$A^2$ means $A \\times A$: multiply $A$ by itself with the row × column rule (it is **not** squaring each number). For example, top-left: row 1 (2, 3) with column 1 (2, 1) gives $2 \\times 2 + 3 \\times 1 = 7$.', math: ['A^2 = \\mat{2 \\times 2 + 3 \\times 1 & 2 \\times 3 + 3 \\times 4 \\\\ 1 \\times 2 + 4 \\times 1 & 1 \\times 3 + 4 \\times 4} = \\mat{7 & 18 \\\\ 6 & 19}'] },
          { say: '$5A$ is every number in $A$ times 5. Then take it away place by place. So the answer is:', math: ['A^2 - 5A = \\mat{7 & 18 \\\\ 6 & 19} - \\mat{10 & 15 \\\\ 5 & 20} = \\mat{-3 & 3 \\\\ 1 & -1}'], end: true },
        ],
      },
    ),
    customQ(
      { id: `${T}:t2`, topic: T, level: 'tough', source: 'written', title: 'Find x from a product' },
      'Find $x$ if $\\mat{1 & x & 1} \\mat{1 & 3 & 2 \\\\ 2 & 5 & 1 \\\\ 15 & 3 & 2} \\mat{1 \\\\ 2 \\\\ x} = (0)$. Give the larger value.',
      [
        numCp('b', 'Coefficient of $x$', 'In the quadratic $x^2 + bx + c = 0$, the value of $b$', 16, 1),
        numCp('c', 'Constant term', 'The constant term $c$', 28, 1, { slips: [[16, 'Collect every number without $x$: $16 + 12$.']] }),
        numCp('x', 'Larger $x$', 'The larger value of $x$', -2, 2, { slips: [[-14, 'That is the smaller root: $-2 > -14$.'], [2, 'The factors are $(x + 2)$ and $(x + 14)$, so the roots are negative.']] }),
      ],
      {
        steps: [
          { say: 'Work from the left, one multiplication at a time (allowed, because the grouping does not matter). First the row times the $3 \\times 3$ matrix, using each column in turn. The $x$ simply comes along as a letter:', math: ['\\mat{1 + 2x + 15 & 3 + 5x + 3 & 2 + x + 2} = \\mat{16 + 2x & 6 + 5x & 4 + x}'] },
          { say: 'Now multiply that row by the column $\\mat{1 \\\\ 2 \\\\ x}$: first with first, second with second, third with third, then add. Collect the $x^2$ part, the $x$ parts and the plain numbers.', math: ['(16 + 2x)(1) + (6 + 5x)(2) + (4 + x)(x)', '= 16 + 2x + 12 + 10x + 4x + x^2 = x^2 + 16x + 28'] },
          { say: 'The product must be 0, so $x^2 + 16x + 28 = 0$. To solve it, find two numbers that **multiply to 28** and **add to 16**: 2 and 14. So the equation splits into $(x + 2)(x + 14) = 0$, and one of the brackets must be 0. So the answer is:', math: ['x + 2 = 0 \\Rightarrow x = -2', 'x + 14 = 0 \\Rightarrow x = -14'], after: 'The larger value is $x = -2$ (−2 is bigger than −14: it is closer to zero).', end: true },
        ],
      },
    ),
    customQ(
      { id: `${T}:t3`, topic: T, level: 'tough', source: 'written', title: 'Which products exist?' },
      '$A$ is $2 \\times 3$, $B$ is $3 \\times 3$ and $C$ is $3 \\times 2$. What is the size of $ABC$?',
      [
        choiceCp('ab', 'Size of $AB$', 'Size of $AB$', ['2 × 3', '3 × 3', '2 × 2', '3 × 2'], '2 × 3', 0, [['3 × 3', 'Outer numbers of $(2 \\times 3)(3 \\times 3)$: rows of $A$, columns of $B$.']]),
        choiceCp('abc', 'Size of $ABC$', 'Size of $ABC$', ['2 × 2', '3 × 3', '2 × 3', 'It does not exist'], '2 × 2', 1, [['It does not exist', '$(2 \\times 3)(3 \\times 2)$: the inner numbers match.']]),
      ],
      {
        steps: [
          { say: 'Multiply two at a time. $AB$: sizes $(2 \\times 3)(3 \\times 3)$. The middle numbers (3 and 3) match, so it exists, and its size is the outside numbers: $2 \\times 3$.' },
          { say: 'Then $(AB)C$: sizes $(2 \\times 3)(3 \\times 2)$. The middle numbers match again; the outside numbers give the size. So $ABC$ is **2 × 2**.', end: true },
        ],
      },
    ),
  ],
  gens: [gen],
  mcqs: [
    mcq(`${T}:c1`, T, 'basic', '$AB$ exists only when…', 'the number of columns of $A$ equals the number of rows of $B$', ['$A$ and $B$ are the same size', 'both are square', 'the number of rows of $A$ equals the number of columns of $B$'], 'The inner numbers must match.'),
    mcq(`${T}:c2`, T, 'basic', 'If $A$ is $2 \\times 3$ and $B$ is $3 \\times 4$, then $AB$ is…', '$2 \\times 4$', ['$3 \\times 3$', '$4 \\times 2$', 'not defined'], 'Outer numbers: $2 \\times 4$.'),
    mcq(`${T}:c3`, T, 'exam', 'If $A$ is $2 \\times 3$ and $B$ is $3 \\times 4$, then $BA$…', 'does not exist', ['is $4 \\times 2$', 'is $3 \\times 3$', 'equals $AB$'], '$(3 \\times 4)(2 \\times 3)$: inner numbers 4 and 2 differ.'),
    mcq(`${T}:c4`, T, 'basic', '$\\mat{2 & 3} \\mat{4 \\\\ 1} =$', '$(11)$', ['$\\mat{8 & 3}$', '$\\mat{8 \\\\ 3}$', '$(10)$'], '$2 \\times 4 + 3 \\times 1 = 11$.'),
    mcq(`${T}:c5`, T, 'exam', 'In the book\'s example $\\mat{3 & 5 \\\\ 1 & 0}\\mat{4 & 9 \\\\ 5 & 7}$, the top-right element is…', '62', ['52', '37', '45'], '$3 \\times 9 + 5 \\times 7 = 27 + 35 = 62$. (The book prints 52 by mistake.)'),
    mcq(`${T}:c6`, T, 'exam', 'Which is true in general?', '$AB \\ne BA$', ['$AB = BA$', '$A + B \\ne B + A$', '$AI \\ne A$'], 'Multiplication is not commutative.'),
    mcq(`${T}:c7`, T, 'exam', 'Matrix multiplication is…', 'associative but not commutative', ['commutative but not associative', 'both commutative and associative', 'neither'], 'Book summary: associative, strongly denied to be commutative.'),
    mcq(`${T}:c8`, T, 'basic', 'For any square matrix $A$ and identity $I$ of the same size, $AI =$', '$A$', ['$I$', '$2A$', '$0$'], '$I$ is the multiplicative identity.'),
    mcq(`${T}:c9`, T, 'tough', 'If $A = \\mat{0 & 1 \\\\ 0 & 0}$, then $A^2 =$', 'the $2 \\times 2$ zero matrix', ['$A$', '$I$', '$\\mat{0 & 1 \\\\ 0 & 1}$'], '$A^2 = \\mat{0(0) + 1(0) & 0(1) + 1(0) \\\\ 0 & 0} = O$. A non-zero matrix can square to zero.'),
    mcq(`${T}:c10`, T, 'exam', 'Quantities (row, $1 \\times 4$) times prices (column, $4 \\times 1$) gives…', 'a single number: the total cost', ['a $4 \\times 4$ matrix', 'a $1 \\times 4$ matrix of costs', 'nothing: the product does not exist'], '$(1 \\times 4)(4 \\times 1)$ is $1 \\times 1$.'),
    mcq(`${T}:c11`, T, 'tough', 'If $A$ is $3 \\times 2$, which of these exists?', "$AA'$", ['$A^2$', "$A + A'$", "$A' + A'A$"], "$A'$ is $2 \\times 3$; $AA'$ is $(3 \\times 2)(2 \\times 3) = 3 \\times 3$. $A^2$ needs $A$ square."),
  ],
};

