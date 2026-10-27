// Unit 3 · Solving three equations in three unknowns by determinants (book pp. 3–4 of the unit).

import type { Rng } from '../../core/rng.ts';
import { det } from '../../core/num.ts';
import { mcq, mcqFrom } from '../kit.ts';
import type { Generator, PaperQuestion, Topic } from '../types.ts';
import { cramer3Q, singularQ } from './build.ts';

const T = 'd-cramer3';

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
      id: 'setup',
      title: 'The same idea with three unknowns',
      page: 3,
      body: [
        { p: 'For three equations' },
        { math: 'a_1x + b_1y + c_1z = h_1, \\quad a_2x + b_2y + c_2z = h_2, \\quad a_3x + b_3y + c_3z = h_3' },
        { p: 'the denominator is the third-order determinant of the coefficients, and each numerator replaces one column with the right-hand sides:' },
        { math: 'x = \\frac{\\det{h_1 & b_1 & c_1 \\\\ h_2 & b_2 & c_2 \\\\ h_3 & b_3 & c_3}}{\\det{a_1 & b_1 & c_1 \\\\ a_2 & b_2 & c_2 \\\\ a_3 & b_3 & c_3}}, \\quad y = \\frac{\\det{a_1 & h_1 & c_1 \\\\ a_2 & h_2 & c_2 \\\\ a_3 & h_3 & c_3}}{D}, \\quad z = \\frac{\\det{a_1 & b_1 & h_1 \\\\ a_2 & b_2 & h_2 \\\\ a_3 & b_3 & h_3}}{D}' },
        { bookNote: 'The printed formula for $x$ has $h_3$ in the bottom-left of the denominator; it should be $a_3$. The printed expansion also shows "$-\\,c_1(\\ldots)$" for the last term; it is $+\\,c_1(\\ldots)$, as in the rule on the same page.' },
      ],
    },
    {
      id: 'steps',
      title: 'Step by step',
      body: [
        { list: ['Write all three equations with $x, y, z$ in the same order. Put 0 for a missing unknown.', 'Evaluate $D$. If $D = 0$, stop: there is no unique solution.', 'Evaluate $D_x$, $D_y$, $D_z$ by replacing the x-, y- and z-column in turn.', 'Divide: $x = D_x/D$, $y = D_y/D$, $z = D_z/D$.', 'Check the answers in one of the original equations.'], ordered: true },
        { tip: 'An equation like $x + 2z = 7$ has no $y$: write it as $x + 0y + 2z = 7$, so the 0 goes in the y-column.' },
      ],
    },
  ],
  examples: [
    cramer3Q({ id: `${T}:ex1`, topic: T, level: 'basic', source: 'written', title: 'Extra example: three unknowns' }, [[1, 1, 1, 6], [2, 1, 0, 4], [1, 0, 2, 7]]),
    cramer3Q({ id: `${T}:ex2`, topic: T, level: 'exam', source: 'written', title: 'Extra example: three investments', prompt: 'A trust invests ₹10 lakh in schemes paying 6%, 8% and 10% ($x$, $y$, $z$ in ₹ lakh). The annual interest is ₹0.84 lakh, and the 8% investment is twice the 6% one: $x + y + z = 10$, $6x + 8y + 10z = 84$ (interest × 100), $-2x + y = 0$. Find the investments.', meaning: 'So ₹2 lakh at 6%, ₹4 lakh at 8% and ₹4 lakh at 10%.' }, [[1, 1, 1, 10], [6, 8, 10, 84], [-2, 1, 0, 0]]),
    singularQ({ id: `${T}:ex3`, topic: T, level: 'tough', source: 'written', title: 'Extra example: a dependent system' }, [[1, 2, 3, 6], [2, 4, 6, 12], [1, -1, 2, 2]], ['x', 'y', 'z']),
  ],
  paper: [
    cramer3Q({ id: `${T}:p1`, topic: T, level: 'basic', source: 'written', title: 'Solve a 3 × 3 system' }, [[1, 1, 0, 5], [0, 1, 1, 7], [1, 0, 1, 6]]),
    cramer3Q({ id: `${T}:e1`, topic: T, level: 'exam', source: 'written', title: 'Three products, three resources', prompt: 'Products $x$, $y$, $z$ use labour, material and machine time. Fully using all three gives $2x + y + z = 12$, $x + 3y + 2z = 19$, $3x + y + 2z = 17$. Find the daily output of each.' }, [[2, 1, 1, 12], [1, 3, 2, 19], [3, 1, 2, 17]]),
    cramer3Q({ id: `${T}:e2`, topic: T, level: 'exam', source: 'written', title: 'With negatives' }, [[1, -1, 2, 9], [2, 1, -1, 0], [3, 2, 1, 7]]),
    cramer3Q({ id: `${T}:e3`, topic: T, level: 'exam', source: 'written', title: 'Prices of three items', prompt: '2 pens, 3 notebooks and 1 file cost ₹170; 1 pen, 2 notebooks and 2 files cost ₹135; 3 pens, 1 notebook and 2 files cost ₹125. Find the price of each.' }, [[2, 3, 1, 170], [1, 2, 2, 135], [3, 1, 2, 125]]),
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
