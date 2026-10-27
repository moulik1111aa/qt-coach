// Unit 2 · What a matrix is, its order (size) and its elements (book pp. 1–2 of the unit).

import { cellsOf, customQ, mcq, mcqFrom, numCp } from '../kit.ts';
import type { Generator, Topic } from '../types.ts';
import { orderQ } from './build.ts';
import { randMat } from './addsub.ts';

const T = 'm-intro';

const gen: Generator = {
  id: 'g-order',
  topic: T,
  levels: ['basic', 'exam'],
  make(rng, level) {
    const seed = Math.floor(rng.next() * 1e9);
    let m = rng.int(1, 3);
    let n = rng.int(2, 4);
    if (level === 'exam') {
      m = rng.int(2, 4);
      n = rng.int(2, 4);
      if (m === n && rng.chance(0.6)) n = m === 4 ? 3 : m + 1;
    }
    const rows = randMat(rng, m, n, level === 'basic' ? 0 : -20, level === 'basic' ? 20 : 60);
    const pick: [number, number] = [rng.int(0, m - 1), rng.int(0, n - 1)];
    // Make sure the swapped element differs, so the "row/column swap" slip is meaningful.
    if (pick[0] !== pick[1] && rows[pick[1]]?.[pick[0]] === rows[pick[0]][pick[1]]) rows[pick[0]][pick[1]] += 1;
    return orderQ({ id: `${T}:g:${seed}`, topic: T, level, source: 'generated', title: 'Order and elements', gen: { id: 'g-order', seed } }, rows, rng.pick(['A', 'B', 'P', 'Q']), pick);
  },
  mcq(rng, level) {
    const q = this.make(rng, level);
    return mcqFrom(q, rng, `${q.prompt.replace(/Find .*$/, '')}What is the element $${q.checkpoints[2].label.replace(/\$/g, '')}$ of the matrix?`.replace(/^\s+/, ''), 2);
  },
};

// The book's family matrix (members by type; nutrients by family).
const FAMILY = [
  [2, 2, 3],
  [3, 2, 1],
];

export const intro: Topic = {
  id: T,
  chapter: 2,
  title: 'What a matrix is',
  blurb: 'Rows, columns, order (m × n) and elements',
  kind: 'numeric',
  pages: [1, 2],
  cards: [
    {
      id: 'what',
      title: 'A matrix is a table of numbers',
      page: 1,
      body: [
        { p: 'A **matrix** is a rectangular array of related values, arranged in **rows** and **columns** and enclosed in brackets.' },
        { math: '\\mat{40 & 30 \\\\ 25 & 30}' },
        { p: 'The numbers inside are called the **elements** (or entries) of the matrix. A matrix is named with a capital letter, such as $A$ or $B$.' },
        { eg: 'You already use matrices in business without calling them that: a sales report with products down the side and months across the top is a matrix.' },
      ],
    },
    {
      id: 'uses',
      title: 'What the rows and columns stand for',
      page: 1,
      body: [
        { p: 'The book shows two families described by a matrix. Each **row** is a family, and each **column** is a type of member:' },
        { table: { head: ['', 'Male', 'Female', 'Child'], rows: [['Family 1', '2', '2', '3'], ['Family 2', '3', '2', '1']] } },
        { p: 'Written as a matrix, the labels are dropped but the positions keep their meaning:' },
        { math: '\\mat{2 & 2 & 3 \\\\ 3 & 2 & 1}' },
        { p: 'A second matrix gives the nutrients each family needs (protein, vitamin, fats):' },
        { math: '\\mat{20 & 12 & 5 \\\\ 35 & 6 & 8}' },
        { tip: 'Always know what a row means and what a column means. Every operation later depends on keeping positions straight.' },
      ],
    },
    {
      id: 'order',
      title: 'The order (size) of a matrix: m × n',
      page: 1,
      body: [
        { p: 'The **order** or **size** of a matrix is written $m \\times n$ (read "m by n"), where' },
        { list: ['$m$ = the number of **rows** (horizontal lines)', '$n$ = the number of **columns** (vertical lines)'] },
        { p: 'Rows always come first.' },
        { math: '\\mat{40 & 30 \\\\ 25 & 30} \\text{ is } 2 \\times 2, \\qquad \\mat{20 & 12 & 5 \\\\ 35 & 6 & 8} \\text{ is } 2 \\times 3' },
        { p: 'A $2 \\times 3$ matrix has $2 \\times 3 = 6$ elements. In general an $m \\times n$ matrix has $mn$ elements.' },
        { tip: 'A $2 \\times 3$ matrix and a $3 \\times 2$ matrix are different shapes: 2 rows of 3, versus 3 rows of 2.' },
      ],
    },
    {
      id: 'aij',
      title: 'Naming an element: aᵢⱼ',
      page: 2,
      body: [
        { p: 'Each element has an address. In matrix $A$, the element in row $i$ and column $j$ is written $a_{ij}$: the **first subscript is the row**, the second is the column.' },
        { math: 'A = \\mat{a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23}}' },
        { p: 'For the family matrix above, $a_{13} = 3$ (row 1, column 3: children in Family 1) and $a_{21} = 3$ (row 2, column 1: males in Family 2).' },
        { def: 'Short form', text: 'A matrix is sometimes written $A = [a_{ij}]$, meaning "the matrix whose elements are $a_{ij}$".' },
      ],
    },
  ],
  examples: [
    orderQ({ id: `${T}:bk1`, topic: T, level: 'basic', source: 'book-example', title: 'Book example: the family matrix', page: 1, prompt: 'The book records the members of two families as a matrix $F$ (rows: families; columns: male, female, child). Find its order and $a_{23}$.' }, FAMILY, 'F', [1, 2]),
    orderQ({ id: `${T}:ex1`, topic: T, level: 'basic', source: 'written', title: 'Extra example: a price list', prompt: 'A shop lists prices (₹) of 3 items (rows) in 2 pack sizes (columns) as matrix $P$. Find its order and $a_{31}$.' }, [[45, 80], [120, 210], [30, 55]], 'P', [2, 0]),
    orderQ({ id: `${T}:ex2`, topic: T, level: 'exam', source: 'written', title: 'Extra example: a 3 × 4 sales matrix', prompt: 'Matrix $S$ gives units sold by 3 salespeople (rows) in 4 quarters (columns). Find the order of $S$ and $a_{24}$, and say what $a_{24}$ means.' }, [[120, 95, 140, 160], [88, 102, 97, 131], [150, 120, 118, 144]], 'S', [1, 3]),
    customQ(
      { id: `${T}:ex3`, topic: T, level: 'tough', source: 'written', title: 'Extra example: build a matrix from a rule' },
      'Write down the $2 \\times 3$ matrix $A = [a_{ij}]$ whose elements are $a_{ij} = 2i - j$. Then find $a_{23}$ and the sum of all elements.',
      [
        numCp('a23', '$a_{23}$', 'Element $a_{23}$', 2 * 2 - 3, 1, { slips: [[2 * 3 - 2, 'That uses $i = 3, j = 2$. In $a_{23}$, $i = 2$ (row) and $j = 3$ (column).']] }),
        numCp('sum', 'Sum of all elements', 'Sum of all six elements', [1, 2].flatMap((i) => [1, 2, 3].map((j) => 2 * i - j)).reduce((a, b) => a + b, 0), 2),
      ],
      {
        board: { kind: 'mats', terms: [{ kind: 'mat', name: '$A =$', br: 'paren', cells: cellsOf([[1, 0, -1], [3, 2, 1]]), marks: [{ type: 'cell', i: 1, j: 2, at: 1, hl: 1 }] }] },
        steps: [
          { say: 'Work out each element from the rule, using its row number $i$ and column number $j$.', math: ['a_{11} = 2(1) - 1 = 1,\\quad a_{12} = 2(1) - 2 = 0,\\quad a_{13} = 2(1) - 3 = -1', 'a_{21} = 2(2) - 1 = 3,\\quad a_{22} = 2(2) - 2 = 2,\\quad a_{23} = 2(2) - 3 = 1'] },
          { say: '$a_{23}$ is row 2, column 3: $i = 2, j = 3$.', math: ['a_{23} = 2(2) - 3 = 1'] },
          { say: 'Add all six elements. So the answer is:', math: ['1 + 0 + (-1) + 3 + 2 + 1 = 6'], end: true },
        ],
      },
    ),
  ],
  paper: [
    orderQ({ id: `${T}:p1`, topic: T, level: 'basic', source: 'written', title: 'Order of a 2 × 3 matrix' }, [[7, 1, 4], [0, 9, 2]], 'A', [0, 1]),
    orderQ({ id: `${T}:p2`, topic: T, level: 'basic', source: 'written', title: 'Order of a column matrix' }, [[12], [8], [15]], 'B', [1, 0]),
    orderQ({ id: `${T}:e1`, topic: T, level: 'exam', source: 'written', title: 'Inventory matrix', prompt: 'A distributor holds stock of 4 products (rows) in 3 warehouses (columns), given by matrix $W$. Find the order of $W$ and $a_{32}$.' }, [[240, 180, 95], [60, 75, 130], [410, 385, 200], [55, 0, 48]], 'W', [2, 1]),
    orderQ({ id: `${T}:e2`, topic: T, level: 'exam', source: 'written', title: 'Marks matrix', prompt: 'Marks of 3 students (rows) in 5 papers (columns) are given as matrix $M$. Find its order and $a_{25}$.' }, [[62, 71, 58, 80, 66], [75, 69, 82, 77, 91], [55, 60, 48, 70, 64]], 'M', [1, 4]),
    orderQ({ id: `${T}:e3`, topic: T, level: 'exam', source: 'written', title: 'Element with negatives', prompt: 'Matrix $R$ shows monthly returns (%) of 3 funds (rows) over 3 months (columns). Find its order and $a_{31}$.' }, [[1.2, -0.8, 2.5], [0.4, 1.1, -1.6], [-2.3, 0.9, 1.7]], 'R', [2, 0]),
    customQ(
      { id: `${T}:t1`, topic: T, level: 'tough', source: 'written', title: 'How many elements?' },
      'A matrix has 24 elements and 4 rows. How many columns does it have? If the rows are doubled and the columns halved, how many elements are there then?',
      [
        numCp('n', 'Columns', 'Number of columns', 24 / 4, 0, { slips: [[4, 'That is the number of rows.'], [20, 'Elements = rows × columns, so divide: 24 ÷ 4.']] }),
        numCp('new', 'New number of elements', 'Elements after the change', 8 * 3, 1, { slips: [[48, 'Doubling rows and halving columns leaves rows × columns unchanged.']] }),
      ],
      {
        steps: [
          { say: 'An $m \\times n$ matrix has $m \\times n$ elements. Here $m = 4$ and $mn = 24$.', math: ['n = 24 \\div 4 = 6'] },
          { say: 'Doubling the rows gives 8; halving the columns gives 3. So the answer is:', math: ['8 \\times 3 = 24 \\text{ elements}'], after: 'The number of elements does not change.', end: true },
        ],
      },
    ),
    customQ(
      { id: `${T}:t2`, topic: T, level: 'tough', source: 'written', title: 'Matrix from a rule, 3 × 3' },
      'Construct the $3 \\times 3$ matrix $A = [a_{ij}]$ with $a_{ij} = i \\times j - 1$. What is the sum of the elements on the main diagonal ($a_{11} + a_{22} + a_{33}$)?',
      [
        numCp('a32', '$a_{32}$', 'Element $a_{32}$', 3 * 2 - 1, 0),
        numCp('tr', 'Diagonal sum', 'Sum of the diagonal elements', 0 + 3 + 8, 1, { slips: [[1 + 4 + 9, 'The rule subtracts 1 from each product.']] }),
      ],
      {
        board: { kind: 'mats', terms: [{ kind: 'mat', name: '$A =$', br: 'paren', cells: cellsOf([[0, 1, 2], [1, 3, 5], [2, 5, 8]]), marks: [0, 1, 2].map((k) => ({ type: 'cell' as const, i: k, j: k, at: 1, hl: 1 })) }] },
        steps: [
          { say: 'Fill each element with $i \\times j - 1$ (row number times column number, minus 1).', math: ['\\text{Row 1: } 0, 1, 2 \\quad \\text{Row 2: } 1, 3, 5 \\quad \\text{Row 3: } 2, 5, 8', 'a_{32} = 3 \\times 2 - 1 = 5'] },
          { say: 'The main diagonal runs from top left to bottom right: $a_{11}, a_{22}, a_{33}$. So the answer is:', math: ['0 + 3 + 8 = 11'], end: true },
        ],
      },
    ),
    customQ(
      { id: `${T}:t3`, topic: T, level: 'tough', source: 'written', title: 'Possible orders' },
      'A matrix has 12 elements. How many different orders $m \\times n$ are possible?',
      [numCp('k', 'Number of orders', 'How many orders are possible', 6, 0, { slips: [[3, 'Count $m \\times n$ and $n \\times m$ separately: $3 \\times 4$ and $4 \\times 3$ are different shapes.'], [5, 'Do not forget $1 \\times 12$ and $12 \\times 1$.']] })],
      {
        steps: [
          { say: 'List the factor pairs of 12, taking rows first. Each pair in either order is a different shape.', math: ['1 \\times 12,\\ 12 \\times 1,\\ 2 \\times 6,\\ 6 \\times 2,\\ 3 \\times 4,\\ 4 \\times 3'] },
          { say: 'So the answer is: there are 6 possible orders.', math: ['6'], end: true },
        ],
      },
    ),
  ],
  gens: [gen],
  mcqs: [
    mcq(`${T}:c1`, T, 'basic', 'A matrix with 3 rows and 4 columns has order…', '$3 \\times 4$', ['$4 \\times 3$', '$7$', '$12$'], 'Order is rows × columns: $3 \\times 4$.'),
    mcq(`${T}:c2`, T, 'basic', 'How many elements does a $4 \\times 5$ matrix have?', '20', ['9', '45', '4'], 'An $m \\times n$ matrix has $mn$ elements: $4 \\times 5 = 20$.'),
    mcq(`${T}:c3`, T, 'basic', 'In $a_{ij}$, the subscript $i$ tells you the…', 'row', ['column', 'value', 'order'], 'The first subscript is the row; the second is the column.'),
    mcq(`${T}:c4`, T, 'basic', 'For $A = \\mat{4 & 9 & 1 \\\\ 6 & 2 & 7}$, the element $a_{21}$ is…', '6', ['9', '2', '7'], 'Row 2, column 1.'),
    mcq(`${T}:c5`, T, 'exam', 'For $A = \\mat{4 & 9 & 1 \\\\ 6 & 2 & 7}$, which is true?', '$a_{12} = 9$ and $a_{23} = 7$', ['$a_{12} = 6$ and $a_{23} = 7$', '$a_{12} = 9$ and $a_{23} = 1$', '$a_{21} = 9$ and $a_{32} = 7$'], '$a_{12}$: row 1, column 2 is 9. $a_{23}$: row 2, column 3 is 7. There is no row 3.'),
    mcq(`${T}:c6`, T, 'basic', 'A matrix is…', 'a rectangular array of numbers arranged in rows and columns', ['a single number calculated from a table', 'a list of numbers in one line only', 'a graph of a function'], 'Book definition: a rectangular array of related values in rows and columns, enclosed in brackets.'),
    mcq(`${T}:c7`, T, 'exam', 'Sales of 5 products over 12 months are recorded with one row per product. The order of the matrix is…', '$5 \\times 12$', ['$12 \\times 5$', '$17 \\times 1$', '$60 \\times 1$'], 'One row per product (5 rows), one column per month (12 columns).'),
    mcq(`${T}:c8`, T, 'exam', 'Which of these orders is NOT possible for a matrix with 18 elements?', '$4 \\times 5$', ['$2 \\times 9$', '$3 \\times 6$', '$1 \\times 18$'], '$4 \\times 5 = 20$, not 18.'),
    mcq(`${T}:c9`, T, 'basic', 'In the book\'s family matrix $\\mat{2 & 2 & 3 \\\\ 3 & 2 & 1}$ (rows: families; columns: male, female, child), what does $a_{13} = 3$ mean?', 'Family 1 has 3 children', ['Family 3 has 1 child', 'Family 1 has 3 males', 'There are 3 families'], 'Row 1 is Family 1; column 3 is children.'),
    mcq(`${T}:c10`, T, 'tough', 'If $A = [a_{ij}]$ is $2 \\times 2$ with $a_{ij} = i + j$, then $A =$', '$\\mat{2 & 3 \\\\ 3 & 4}$', ['$\\mat{1 & 2 \\\\ 2 & 3}$', '$\\mat{2 & 3 \\\\ 4 & 5}$', '$\\mat{1 & 1 \\\\ 2 & 2}$'], '$a_{11} = 2, a_{12} = 3, a_{21} = 3, a_{22} = 4$.'),
    mcq(`${T}:c11`, T, 'exam', 'A matrix has order $m \\times n$. Its number of columns is…', '$n$', ['$m$', '$mn$', '$m + n$'], 'Rows first ($m$), then columns ($n$).'),
  ],
};
