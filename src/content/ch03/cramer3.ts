// Unit 3 · Solving three equations in three unknowns by determinants (book pp. 3–4 of the unit).

import type { Rng } from '../../core/rng.ts';
import { det } from '../../core/num.ts';
import { mcq, mcqFrom } from '../kit.ts';
import type { Generator, PaperQuestion, Topic } from '../types.ts';
import { cramer3Q, singularQ } from './build.ts';

const T = 'd-cramer3';

// The Learn cards' café example: 2 teas + 1 coffee + 1 sandwich = ₹120, 1 tea + 2 coffees = ₹80,
// 1 coffee + 1 sandwich = ₹80.
const CF = [
  [2, 1, 1],
  [1, 2, 0],
  [0, 1, 1],
];
const CH = [120, 80, 80];
const withCol = (c: number) => CF.map((r, i) => r.map((x, j) => (j === c ? CH[i] : x)));
const CD = det(CF);
const CDS = [0, 1, 2].map((c) => det(withCol(c)));
const CX = CDS.map((d) => Number(d.n) / Number(CD.n));
/** First-row expansion of a 3 × 3, written out with its three 2 × 2 answers. */
const ex3 = (m: number[][]) => {
  const md = [0, 1, 2].map((j) => {
    const r = m.slice(1).map((row) => row.filter((_, c) => c !== j));
    return r[0][0] * r[1][1] - r[0][1] * r[1][0];
  });
  const t = [m[0][0] * md[0], -m[0][1] * md[1], m[0][2] * md[2]];
  const sum = t.map((x, i) => (i === 0 ? `${x}` : x < 0 ? ` - ${-x}` : ` + ${x}`)).join('');
  return `${m[0][0]}(${md[0]}) - ${m[0][1]}(${md[1]}) + ${m[0][2]}(${md[2]}) = ${sum} = ${det(m).n}`;
};
const dm = (m: number[][]) => `\\det{${m.map((r) => r.join(' & ')).join(' \\\\ ')}}`;

/** Three equations with whole-number solutions and D ≠ 0. */
export function triple(rng: Rng, lo: number, hi: number, solLo: number, solHi: number, zeros = 0): number[][] {
  for (;;) {
    const a = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => rng.int(lo, hi)));
    for (let z = 0; z < zeros; z++) a[rng.int(0, 2)][rng.int(0, 2)] = 0;
    const d = det(a);
    if (d.n === 0 || Math.abs(d.n) > 120) continue;
    const s = [rng.int(solLo, solHi), rng.int(solLo, solHi), rng.int(solLo, solHi)];
    return a.map((r) => [...r, r.reduce((t, c, i) => t + c * s[i], 0)]);
  }
}

const gen: Generator = {
  id: 'g-cramer3',
  topic: T,
  levels: ['basic', 'exam'],
  make(rng, level) {
    const seed = Math.floor(rng.next() * 1e9);
    const meta = { id: `${T}:g:${seed}`, topic: T, level, source: 'generated' as const, gen: { id: 'g-cramer3', seed }, title: "Cramer's rule, 3 unknowns" };
    return level === 'basic' ? cramer3Q(meta, triple(rng, 0, 3, 1, 5, 2)) : cramer3Q(meta, triple(rng, -3, 5, -4, 8, 1));
  },
  mcq(rng, level) {
    const q = this.make(rng, level);
    // Ask for D (the first checkpoint): a number.
    return mcqFrom({ ...q, checkpoints: [q.checkpoints[0]] } as PaperQuestion, rng, `${q.prompt.replace('Solve by determinants', 'For the equations')} What is the coefficient determinant $D$?`, 0);
  },
};

export const cramer3: Topic = {
  id: T,
  chapter: 3,
  title: 'Three equations in three unknowns',
  blurb: 'Cramer’s rule with D, Dₓ, D_y and D_z',
  kind: 'numeric',
  pages: [3, 4],
  primers: ['p-lineq'],
  cards: [
    {
      id: 'why',
      title: 'Why a manager needs three equations',
      body: [
        { p: 'A café owner checks three bills to work out the price of a tea, a coffee and a sandwich:' },
        { list: [`2 teas, 1 coffee and 1 sandwich cost ₹${CH[0]}.`, `1 tea and 2 coffees cost ₹${CH[1]}.`, `1 coffee and 1 sandwich cost ₹${CH[2]}.`] },
        { p: 'Call the unknown prices $x$ (tea), $y$ (coffee) and $z$ (sandwich). Each bill becomes one equation:' },
        { math: `2x + y + z = ${CH[0]}` },
        { math: `x + 2y = ${CH[1]}` },
        { math: `y + z = ${CH[2]}` },
        { p: 'Three unknowns, three facts. The same shape appears with three products on three machines, or three investments with three conditions. Cramer\'s rule solves all of them with the same recipe you used for two unknowns.' },
      ],
    },
    {
      id: 'setup',
      title: 'Line the equations up first',
      page: 3,
      body: [
        { p: 'Write every equation with $x$, $y$, $z$ in the **same order**. If a letter is missing, its number is **0** (no sandwiches on the second bill means $0z$).' },
        { math: `2x + 1y + 1z = ${CH[0]}` },
        { math: `1x + 2y + 0z = ${CH[1]}` },
        { math: `0x + 1y + 1z = ${CH[2]}` },
        { p: 'A letter on its own, like $y$, means $1y$: one coffee.' },
        { tip: 'This lining-up step is where most marks are lost. Take your time with it.' },
      ],
    },
    {
      id: 'worked',
      title: 'Cramer\'s rule, worked through',
      page: 3,
      body: [
        { p: '**Step 1. Make $D$** from the numbers in front of the letters, and work it out (top-row numbers times their small 2 × 2s, combined plus, minus, plus):' },
        { math: `D = ${dm(CF)}` },
        { math: `= ${ex3(CF)}` },
        { p: '**Step 2. Make $D_x$:** start from $D$ and put the bill totals in place of the **x-column**:' },
        { math: `D_x = ${dm(withCol(0))}` },
        { math: `= ${ex3(withCol(0))}` },
        { p: '**Step 3. Make $D_y$:** totals in place of the **y-column**:' },
        { math: `D_y = ${dm(withCol(1))}` },
        { math: `= ${ex3(withCol(1))}` },
        { p: '**Step 4. Make $D_z$:** totals in place of the **z-column**:' },
        { math: `D_z = ${dm(withCol(2))}` },
        { math: `= ${ex3(withCol(2))}` },
        { p: '**Step 5. Divide** each by $D$:' },
        { math: `x = \\frac{${CDS[0].n}}{${CD.n}} = ${CX[0]}, \\quad y = \\frac{${CDS[1].n}}{${CD.n}} = ${CX[1]}, \\quad z = \\frac{${CDS[2].n}}{${CD.n}} = ${CX[2]}` },
        { p: `So tea costs ₹${CX[0]}, coffee ₹${CX[1]} and a sandwich ₹${CX[2]}. **Check** with the first bill: $2(${CX[0]}) + ${CX[1]} + ${CX[2]} = ${2 * CX[0] + CX[1] + CX[2]}$ ✓.` },
      ],
    },
    {
      id: 'recipe',
      title: 'The method in 5 steps',
      body: [
        { list: ['**Line up** the equations: $x$, $y$, $z$ in the same order, 0 for a missing letter, totals on the right.', '**Make $D$** from the numbers in front of the letters. If $D = 0$, stop: there is no single answer.', '**Make $D_x$, $D_y$, $D_z$**: each time, put the totals in place of that letter\'s column.', '**Divide**: $x = D_x \\div D$, $y = D_y \\div D$, $z = D_z \\div D$.', '**Check** the answers in one of the original equations.'], ordered: true },
        { tip: 'If only one unknown is asked for (say $y$), you need only $D$ and $D_y$. That saves time in the exam.' },
      ],
    },
    {
      id: 'letters',
      title: 'The book\'s formula in letters',
      page: 3,
      optional: true,
      body: [
        { p: 'The book writes the same rule with letters. For the equations' },
        { math: 'a_1x + b_1y + c_1z = h_1' },
        { math: 'a_2x + b_2y + c_2z = h_2' },
        { math: 'a_3x + b_3y + c_3z = h_3' },
        { p: 'the bottom of each fraction is $D$, made from the numbers in front of the letters ($a$, $b$, $c$); the top swaps one column for the totals ($h$):' },
        { math: 'x = \\frac{\\det{h_1 & b_1 & c_1 \\\\ h_2 & b_2 & c_2 \\\\ h_3 & b_3 & c_3}}{\\det{a_1 & b_1 & c_1 \\\\ a_2 & b_2 & c_2 \\\\ a_3 & b_3 & c_3}}, \\quad y = \\frac{\\det{a_1 & h_1 & c_1 \\\\ a_2 & h_2 & c_2 \\\\ a_3 & h_3 & c_3}}{D}, \\quad z = \\frac{\\det{a_1 & b_1 & h_1 \\\\ a_2 & b_2 & h_2 \\\\ a_3 & b_3 & h_3}}{D}' },
        { bookNote: 'The printed formula for $x$ has $h_3$ in the bottom-left of the denominator; it should be $a_3$. The printed expansion also shows "$-\\,c_1(\\ldots)$" for the last term; it is $+\\,c_1(\\ldots)$, as in the rule on the same page.' },
      ],
    },
  ],
  examples: [
    cramer3Q({ id: `${T}:ex1`, topic: T, level: 'basic', source: 'written', title: 'Extra example: three unknowns' }, [[1, 1, 1, 6], [2, 1, 0, 4], [1, 0, 2, 7]]),
    cramer3Q({ id: `${T}:ex2`, topic: T, level: 'exam', source: 'written', title: 'Extra example: three investments', prompt: 'A trust invests ₹10 lakh in schemes paying 6%, 8% and 10% ($x$, $y$, $z$ in ₹ lakh). The annual interest is ₹0.84 lakh, and the 8% investment is twice the 6% one: $x + y + z = 10$, $6x + 8y + 10z = 84$ (interest × 100), $-2x + y = 0$. Find the investments.', setup: 'The equations are given. In words: the three amounts add up to ₹10 lakh; the interest is 6% of $x$ plus 8% of $y$ plus 10% of $z$, which is 0.84 (multiplying every part by 100 removes the decimals: $6x + 8y + 10z = 84$); and "$y$ is twice $x$" means $y = 2x$, which lined up is $-2x + y = 0$.', meaning: 'So ₹2 lakh at 6%, ₹4 lakh at 8% and ₹4 lakh at 10%.' }, [[1, 1, 1, 10], [6, 8, 10, 84], [-2, 1, 0, 0]]),
    singularQ({ id: `${T}:ex3`, topic: T, level: 'tough', source: 'written', title: 'Extra example: a dependent system' }, [[1, 2, 3, 6], [2, 4, 6, 12], [1, -1, 2, 2]], ['x', 'y', 'z']),
  ],
  paper: [
    cramer3Q({ id: `${T}:p1`, topic: T, level: 'basic', source: 'written', title: 'Solve a 3 × 3 system' }, [[1, 1, 0, 5], [0, 1, 1, 7], [1, 0, 1, 6]]),
    cramer3Q({ id: `${T}:e1`, topic: T, level: 'exam', source: 'written', title: 'Three products, three resources', prompt: 'Products $x$, $y$, $z$ use labour, material and machine time. Fully using all three gives $2x + y + z = 12$, $x + 3y + 2z = 19$, $3x + y + 2z = 17$. Find the daily output of each.', setup: 'The equations are given; each one says: resource used = resource available.', meaning: 'So make 3 units of $x$, 4 of $y$ and 2 of $z$ a day.' }, [[2, 1, 1, 12], [1, 3, 2, 19], [3, 1, 2, 17]]),
    cramer3Q({ id: `${T}:e2`, topic: T, level: 'exam', source: 'written', title: 'With negatives' }, [[1, -1, 2, 9], [2, 1, -1, 0], [3, 2, 1, 7]]),
    cramer3Q({ id: `${T}:e3`, topic: T, level: 'exam', source: 'written', title: 'Prices of three items', prompt: '2 pens, 3 notebooks and 1 file cost ₹170; 1 pen, 2 notebooks and 2 files cost ₹135; 3 pens, 1 notebook and 2 files cost ₹125. Find the price of each.', setup: 'Each bill gives one equation. Call the price of a pen $x$, a notebook $y$ and a file $z$. The first bill says $2x + 3y + z = 170$; the other two work the same way.', meaning: 'So a pen costs ₹15, a notebook ₹40 and a file ₹20.' }, [[2, 3, 1, 170], [1, 2, 2, 135], [3, 1, 2, 125]]),
    cramer3Q({ id: `${T}:t1`, topic: T, level: 'tough', source: 'written', title: 'Missing unknowns', prompt: 'Solve by determinants: $x + 2z = 11$, $3y - z = 2$, $2x + y = 8$. (Put 0 for each missing unknown.)' }, [[1, 0, 2, 11], [0, 3, -1, 2], [2, 1, 0, 8]]),
    cramer3Q({ id: `${T}:t2`, topic: T, level: 'tough', source: 'written', title: 'Fractional solutions', prompt: 'Solve by determinants, answers to 2 decimal places: $2x + y - z = 3$, $x - y + 2z = 4$, $3x + 2y + z = 8$.' }, [[2, 1, -1, 3], [1, -1, 2, 4], [3, 2, 1, 8]]),
    singularQ({ id: `${T}:t3`, topic: T, level: 'tough', source: 'written', title: 'Is there a unique solution?' }, [[1, 1, 1, 4], [2, -1, 3, 1], [3, 0, 4, 6]], ['x', 'y', 'z']),
  ],
  gens: [gen],
  mcqs: [
    mcq(`${T}:c1`, T, 'basic', 'For three equations in $x, y, z$, the numerator for $y$ is the coefficient determinant with…', 'the y-column replaced by the right-hand sides', ['the x-column replaced', 'the y-column deleted', 'the y-row replaced'], 'Replace the column of the unknown you want.'),
    mcq(`${T}:c2`, T, 'basic', 'The equation $x + 2z = 7$ written for Cramer\'s rule in $x, y, z$ is…', '$x + 0y + 2z = 7$', ['$x + 2y + 0z = 7$', '$x + 2z + 0 = 7$', '$0x + y + 2z = 7$'], 'Keep the order $x, y, z$ and put 0 for the missing $y$.'),
    mcq(`${T}:c3`, T, 'exam', 'If $D = 5$, $D_x = 10$, $D_y = -5$, $D_z = 15$, then $(x, y, z) =$', '$(2, -1, 3)$', ['$(10, -5, 15)$', '$(0.5, -1, 1/3)$', '$(50, -25, 75)$'], 'Divide each by $D$.'),
    mcq(`${T}:c4`, T, 'exam', 'The book advises evaluating the coefficient determinant first when…', 'it is unclear whether a unique solution exists', ['the answers are fractions', 'there are only two equations', 'the right-hand sides are zero'], 'If $D = 0$ there is no unique solution.'),
    mcq(`${T}:c5`, T, 'exam', 'If $D = 0$ for three equations, Cramer\'s rule…', 'cannot give a unique solution', ['gives $x = y = z = 0$', 'gives $x = D_x$, $y = D_y$, $z = D_z$', 'still works if $D_x = 0$'], 'Division by zero.'),
    mcq(`${T}:c6`, T, 'exam', 'In the printed book\'s formula for $x$, the bottom-left of the denominator reads $h_3$. It should be…', '$a_3$', ['$h_1$', '$b_3$', '$c_3$'], 'The denominator holds only coefficients of the unknowns.'),
    mcq(`${T}:c7`, T, 'tough', 'How many $2 \\times 2$ determinants are evaluated in solving 3 equations by Cramer\'s rule (first-row expansion each time)?', '12', ['3', '4', '9'], 'Four $3 \\times 3$ determinants ($D, D_x, D_y, D_z$), each needing three $2 \\times 2$ minors.'),
    mcq(`${T}:c8`, T, 'basic', 'After finding $x$, $y$, $z$, a sensible final step is…', 'substitute them into an original equation to check', ['evaluate $D$ again', 'take the transpose', 'add $D_x + D_y + D_z$'], 'A quick check catches sign slips.'),
    mcq(`${T}:c9`, T, 'tough', 'For $x + y + z = 6$, $x - y = 0$, $y - z = 0$: $x =$', '2', ['6', '3', '0'], 'All three are equal, and they add to 6.'),
    mcq(`${T}:c10`, T, 'exam', 'Which determinant is $D_z$ for $x + 2y + 3z = 14$, $2x + y + z = 7$, $x + y + 2z = 9$?', '$\\det{1 & 2 & 14 \\\\ 2 & 1 & 7 \\\\ 1 & 1 & 9}$', ['$\\det{14 & 2 & 3 \\\\ 7 & 1 & 1 \\\\ 9 & 1 & 2}$', '$\\det{1 & 14 & 3 \\\\ 2 & 7 & 1 \\\\ 1 & 9 & 2}$', '$\\det{1 & 2 & 3 \\\\ 2 & 1 & 1 \\\\ 14 & 7 & 9}$'], 'Replace the third (z) column with 14, 7, 9.'),
  ],
};
