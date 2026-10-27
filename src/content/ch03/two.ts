// Unit 3 · Determinants and a pair of linear equations (book pp. 1–3 of the unit).

import type { Rng } from '../../core/rng.ts';
import { mcq, mcqFrom } from '../kit.ts';
import type { Generator, Topic } from '../types.ts';
import { cramer2Q, det2Q, singularQ } from './build.ts';

const T = 'd-2x2';

/** Two equations with a whole-number solution and D ≠ 0. */
export function pair(rng: Rng, lo: number, hi: number, solLo: number, solHi: number): number[][] {
  for (;;) {
    const a = [rng.int(lo, hi), rng.int(lo, hi), rng.int(lo, hi), rng.int(lo, hi)];
    if (a[0] * a[3] - a[1] * a[2] === 0 || a.includes(0)) continue;
    const x = rng.int(solLo, solHi);
    const y = rng.int(solLo, solHi);
    return [
      [a[0], a[1], a[0] * x + a[1] * y],
      [a[2], a[3], a[2] * x + a[3] * y],
    ];
  }
}

const gen: Generator = {
  id: 'g-det2',
  topic: T,
  levels: ['basic', 'exam'],
  make(rng, level) {
    const seed = Math.floor(rng.next() * 1e9);
    const meta = { id: `${T}:g:${seed}`, topic: T, level, source: 'generated' as const, gen: { id: 'g-det2', seed } };
    if (level === 'basic') {
      if (rng.chance(0.5)) return det2Q({ ...meta, title: 'Evaluate a 2 × 2 determinant' }, [[rng.int(1, 9), rng.int(1, 9)], [rng.int(1, 9), rng.int(1, 9)]]);
      return cramer2Q({ ...meta, title: "Cramer's rule, 2 unknowns" }, pair(rng, 1, 6, 1, 8));
    }
    if (rng.chance(0.3)) return det2Q({ ...meta, title: 'Evaluate a 2 × 2 determinant' }, [[rng.int(-12, 15), rng.int(-12, 15)], [rng.int(-12, 15), rng.int(-12, 15)]]);
    return cramer2Q({ ...meta, title: "Cramer's rule, 2 unknowns" }, pair(rng, -7, 9, -6, 12));
  },
  mcq(rng, level) {
    return mcqFrom(this.make(rng, level), rng);
  },
};

export const two: Topic = {
  id: T,
  chapter: 3,
  title: 'Determinants and a pair of equations',
  blurb: '2 × 2 determinants; Cramer’s rule for two unknowns',
  kind: 'numeric',
  pages: [1, 2, 3],
  primers: ['p-signs', 'p-lineq'],
  cards: [
    {
      id: 'what',
      title: 'What a determinant is',
      page: 1,
      body: [
        { p: 'A **determinant** is a square array of numbers written between **vertical lines**. Unlike a matrix, a determinant has a **single numerical value**.' },
        { math: '\\det{a_1 & b_1 \\\\ a_2 & b_2} \\quad\\text{(determinant)} \\qquad \\mat{a_1 & b_1 \\\\ a_2 & b_2} \\quad\\text{(matrix)}' },
        { p: 'Only a **square** matrix has a determinant. One with two rows and two columns is a **second-order** determinant.' },
        { tip: 'Brackets ( ) or [ ] mean a matrix: a table. Vertical bars | | mean a determinant: a number.' },
      ],
    },
    {
      id: 'derive',
      title: 'Where determinants come from',
      page: 1,
      body: [
        { p: 'The book starts from a pair of simultaneous equations:' },
        { math: 'a_1x + b_1y = h_1 \\quad (1) \\qquad a_2x + b_2y = h_2 \\quad (2)' },
        { p: 'Multiply (1) by $a_2$ and (2) by $a_1$, then subtract to eliminate $x$:' },
        { math: 'a_1b_2y - a_2b_1y = a_1h_2 - a_2h_1 \\Rightarrow y = \\frac{a_1h_2 - a_2h_1}{a_1b_2 - a_2b_1}' },
        { p: 'Substituting back gives' },
        { math: 'x = \\frac{h_1b_2 - h_2b_1}{a_1b_2 - a_2b_1}' },
        { p: 'Both answers share the denominator $a_1b_2 - a_2b_1$. Writing it as a determinant makes the formula easy to remember.' },
      ],
    },
    {
      id: 'rule',
      title: 'Evaluating a 2 × 2 determinant',
      page: 2,
      body: [
        { math: '\\det{a_1 & b_1 \\\\ a_2 & b_2} = a_1b_2 - a_2b_1' },
        { p: '**Leading diagonal** (top left × bottom right) **minus** the **other diagonal** (top right × bottom left).' },
        { math: '\\det{5 & 3 \\\\ 2 & 4} = 5 \\times 4 - 3 \\times 2 = 20 - 6 = 14' },
        { tip: 'With negatives, put them in brackets before multiplying: $\\det{-2 & 3 \\\\ 4 & -1} = (-2)(-1) - (3)(4) = 2 - 12 = -10$.' },
      ],
    },
    {
      id: 'cramer',
      title: "Cramer's rule for two unknowns",
      page: 3,
      body: [
        { p: 'Take the four coefficients on the left as the denominator $D$. For the numerator of $x$, replace the **x-coefficients** with the right-hand sides; for $y$, replace the **y-coefficients**.' },
        { math: 'x = \\frac{D_x}{D} = \\frac{\\det{h_1 & b_1 \\\\ h_2 & b_2}}{\\det{a_1 & b_1 \\\\ a_2 & b_2}}, \\qquad y = \\frac{D_y}{D} = \\frac{\\det{a_1 & h_1 \\\\ a_2 & h_2}}{\\det{a_1 & b_1 \\\\ a_2 & b_2}}' },
        { p: 'First write the equations in standard form: unknowns on the left in the same order, constants on the right.' },
        { def: 'If D = 0', text: 'There is no unique solution: the method would divide by zero. Always evaluate $D$ first when you are not sure.' },
      ],
    },
    {
      id: 'methods',
      title: 'Three ways to solve linear equations',
      page: 3,
      body: [
        { p: 'The book lists three structured methods for simultaneous linear equations:' },
        { list: ['**Determinants** (Cramer\'s rule): usually quickest when you need only a few unknowns, as often in probability problems.', '**Row operations**: the quickest way to get a complete solution for all unknowns. They also handle the case where determinants give 0 ÷ 0, expressing the unknowns in terms of one another when there is no unique solution.', '**Matrices**: most valuable when many sets of equations share the same coefficient matrix. Computer programs prefer matrix methods because matrices have wider uses.'] },
        { p: 'All three can be run on a computer; the exam expects determinants and the matrix ideas from Unit 2.' },
      ],
    },
  ],
  examples: [
    det2Q({ id: `${T}:ex1`, topic: T, level: 'basic', source: 'written', title: 'Extra example: evaluate a 2 × 2 determinant' }, [[5, 3], [2, 4]]),
    cramer2Q({ id: `${T}:ex2`, topic: T, level: 'exam', source: 'written', title: 'Extra example: two products, two machines', prompt: 'Product $x$ needs 3 hours on machine I and 2 hours on machine II; product $y$ needs 4 hours on I and 5 on II. Machine I is available 48 hours and machine II 46 hours a week. How many of each should be made to use both machines fully?', meaning: 'Make 8 units of $x$ and 6 units of $y$ each week.' }, [[3, 4, 48], [2, 5, 46]]),
    singularQ({ id: `${T}:ex3`, topic: T, level: 'tough', source: 'written', title: 'Extra example: when D = 0' }, [[2, 3, 12], [4, 6, 20]], ['x', 'y']),
  ],
  paper: [
    det2Q({ id: `${T}:p1`, topic: T, level: 'basic', source: 'written', title: 'Evaluate |7 2; 3 4|' }, [[7, 2], [3, 4]]),
    det2Q({ id: `${T}:p2`, topic: T, level: 'basic', source: 'written', title: 'Evaluate with negatives' }, [[-3, 5], [2, -4]]),
    cramer2Q({ id: `${T}:p3`, topic: T, level: 'basic', source: 'written', title: 'Solve 2x + y = 7, x + 3y = 11' }, [[2, 1, 7], [1, 3, 11]]),
    cramer2Q({ id: `${T}:e1`, topic: T, level: 'exam', source: 'written', title: 'Tickets sold', prompt: 'A theatre sold adult tickets at ₹150 and student tickets at ₹90. In one show 400 tickets earned ₹51,600. Taking $x$ adults and $y$ students, the equations are $x + y = 400$ and $150x + 90y = 51600$. Solve by determinants.' }, [[1, 1, 400], [150, 90, 51600]]),
    cramer2Q({ id: `${T}:e2`, topic: T, level: 'exam', source: 'written', title: 'Solve 5x − 2y = 4, 3x + 4y = 18' }, [[5, -2, 4], [3, 4, 18]]),
    cramer2Q({ id: `${T}:e3`, topic: T, level: 'exam', source: 'written', title: 'Mixing two blends', prompt: 'A blend uses $x$ kg of tea A at ₹300/kg and $y$ kg of tea B at ₹420/kg to make 60 kg costing ₹20,520 in all: $x + y = 60$ and $300x + 420y = 20520$. Find $x$ and $y$.' }, [[1, 1, 60], [300, 420, 20520]]),
    cramer2Q({ id: `${T}:t1`, topic: T, level: 'tough', source: 'written', title: 'Fractional answers', prompt: 'Solve by determinants: $4x + 3y = 5$ and $6x - 5y = 2$. Give answers to 2 decimal places.' }, [[4, 3, 5], [6, -5, 2]]),
    singularQ({ id: `${T}:t2`, topic: T, level: 'tough', source: 'written', title: 'Proportional rows' }, [[3, -6, 9], [-1, 2, -3]], ['x', 'y']),
    cramer2Q({ id: `${T}:t3`, topic: T, level: 'tough', source: 'written', title: 'Rearrange first', prompt: 'Solve by determinants: $2y = 17 - 3x$ and $5x = 4y - 1$. (Write both in the form $ax + by = h$ first.)' }, [[3, 2, 17], [5, -4, -1]]),
  ],
  gens: [gen],
  mcqs: [
    mcq(`${T}:c1`, T, 'basic', '$\\det{a & b \\\\ c & d} =$', '$ad - bc$', ['$ab - cd$', '$ad + bc$', '$ac - bd$'], 'Leading diagonal minus the other diagonal.'),
    mcq(`${T}:c2`, T, 'basic', '$\\det{6 & 2 \\\\ 3 & 5} =$', '24', ['36', '28', '-24'], '$6 \\times 5 - 2 \\times 3 = 30 - 6 = 24$.'),
    mcq(`${T}:c3`, T, 'basic', 'The main difference between a determinant and a matrix is that…', 'a determinant has a numerical value; a matrix does not', ['a matrix must be square; a determinant need not be', 'they are the same thing written differently', 'a determinant uses brackets ( )'], 'Book: a determinant contains a numerical value, while a matrix does not.'),
    mcq(`${T}:c4`, T, 'exam', "In Cramer's rule for $a_1x + b_1y = h_1$, $a_2x + b_2y = h_2$, the numerator for $x$ is…", '$\\det{h_1 & b_1 \\\\ h_2 & b_2}$', ['$\\det{a_1 & h_1 \\\\ a_2 & h_2}$', '$\\det{a_1 & b_1 \\\\ a_2 & b_2}$', '$\\det{h_1 & a_1 \\\\ h_2 & a_2}$'], 'Replace the x-column (the $a$s) with the $h$s.'),
    mcq(`${T}:c5`, T, 'exam', 'If the coefficient determinant $D = 0$, then…', 'there is no unique solution', ['$x = y = 0$', 'the solution is $x = D_x$, $y = D_y$', 'the equations are solved by adding them'], 'Cramer\'s rule would divide by zero.'),
    mcq(`${T}:c6`, T, 'exam', 'Which method does the book call quickest for finding a few unknowns, as in probability problems?', 'Determinants', ['Row operations', 'Matrices', 'Graphs'], 'Book: the method of determinants is usually the quickest if one requires the value of a few unknowns.'),
    mcq(`${T}:c7`, T, 'exam', 'Which method does the book call quickest for a complete solution, and able to handle 0 ÷ 0?', 'Row operations', ['Determinants', 'Matrices', 'Trial and error'], 'Book: row operations give the whole solution and also handle the case where determinants give 0/0.'),
    mcq(`${T}:c8`, T, 'tough', 'For $2x + 3y = 8$ and $kx + 6y = 5$ to have no unique solution, $k =$', '4', ['3', '2', '-4'], '$D = 2(6) - 3k = 12 - 3k = 0$ gives $k = 4$.'),
    mcq(`${T}:c9`, T, 'exam', 'For $x + 2y = 5$, $3x + 4y = 11$: $D =$', '-2', ['2', '10', '-10'], '$1 \\times 4 - 2 \\times 3 = 4 - 6 = -2$.'),
    mcq(`${T}:c10`, T, 'basic', '$\\det{-2 & 3 \\\\ 4 & -1} =$', '-10', ['14', '10', '-14'], '$(-2)(-1) - (3)(4) = 2 - 12 = -10$.'),
    mcq(`${T}:c11`, T, 'tough', 'If $D = 7$ and $D_y = -21$, then $y =$', '-3', ['3', '-1/3', '-147'], '$y = D_y / D = -21 / 7$.'),
  ],
};
