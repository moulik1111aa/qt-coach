// Unit 3 · Applications in management: the ONGC machine-mix problem (determinants) and brand
// switching (matrix × vector) (book pp. 5–7 of the unit).

import { det, div, type Num } from '../../core/num.ts';
import type { Step } from '../../teach/types.ts';
import { customQ, mcq, mcqFrom, numCp, texMat, w } from '../kit.ts';
import type { Generator, PaperQuestion, Topic } from '../types.ts';
import { cramer2Q, cramer3Q, opsSteps } from './build.ts';
import { mulQ } from '../ch02/build.ts';
import { pair } from './two.ts';
import { triple } from './cramer3.ts';

const T = 'd-apps';

// ONGC workshop: minutes per bracket on drilling, turning, milling, grinding (rows) for types A–D.
const ONGC = [
  [7, 5, 14, 26],
  [3, 0, 6, 9],
  [2.5, 1.5, 9, 11],
  [1.5, 0.5, 3.5, 1.5],
];
const CAP = [420, 120, 180, 60]; // 7, 2, 3, 1 machines × 60 minutes
const TYPES = ['A', 'B', 'C', 'D'];
const withCol = (c: number) => ONGC.map((r, i) => r.map((x, j) => (j === c ? CAP[i] : x)));
const D_ONGC = det(ONGC);

function ongcQ(meta: { id: string; level: 'exam' | 'tough'; source: 'book-example' | 'written'; title: string; page?: number; bookNote?: string }, col: number): PaperQuestion {
  const num = opsSteps(withCol(col));
  const den = opsSteps(ONGC);
  const count = div(num.value, D_ONGC);
  const setup: Step[] = [
    {
      say: 'Each machine type gives one equation: total minutes of work per hour. There are 7 drilling machines (7 × 60 = 420 minutes), 2 turning (120), 3 milling (180) and 1 grinding (60). Let $A, B, C, D$ be the brackets per hour.',
      math: ['7A + 5B + 14C + 26D = 420', '3A + 0B + 6C + 9D = 120', '2.5A + 1.5B + 9C + 11D = 180', '1.5A + 0.5B + 3.5C + 1.5D = 60'],
    },
  ];
  const denSteps: Step[] = col === 0 ? den.steps.map((s, i) => (i === 0 ? { ...s, say: `**The denominator.** ${s.say}` } : s)) : [{ say: `**The denominator** is the same for every type (see the book example): $D = ${w(D_ONGC)}$.`, math: [`D = ${texMat(ONGC, 'det')} = ${w(D_ONGC)}`] }];
  const numSteps = num.steps.map((s, i) => (i === 0 ? { ...s, say: `**The numerator for ${TYPES[col]}**: replace the ${TYPES[col]}-column with 420, 120, 180, 60. ${s.say}` } : s));
  const steps: Step[] = [
    ...setup,
    ...denSteps,
    ...numSteps.map((s) => ({ ...s, math: s.math?.map((m) => m.replace(/^D =/, `D_${TYPES[col]} =`)) })),
    { say: `Divide. So the answer is:`, math: [`${TYPES[col]} = \\frac{D_${TYPES[col]}}{D} = \\frac{${w(num.value)}}{${w(D_ONGC)}} = ${w(count)}`], after: `${w(count)} brackets of type ${TYPES[col]} per hour.`, end: true },
  ];
  const dStep = setup.length + denSteps.length - 1;
  const nStep = steps.length - 2;
  return customQ(
    { ...meta, topic: T },
    `In an ONGC workshop there are 7 machines for drilling, 2 for turning, 3 for milling and 1 for grinding. Minutes needed per bracket: type A: 7 (D), 3 (T), 2.5 (M), 1.5 (G); B: 5, 0, 1.5, 0.5; C: 14, 6, 9, 3.5; D: 26, 9, 11, 1.5. How many brackets of type ${TYPES[col]} should be made per hour so that all machines are fully occupied?`,
    [
      numCp('D', '$D$', 'The determinant of the coefficients, $D$', D_ONGC, dStep),
      numCp('N', `$D_${TYPES[col]}$`, `The numerator determinant $D_${TYPES[col]}$`, num.value, nStep),
      numCp('n', TYPES[col], `Brackets of type ${TYPES[col]} per hour`, count, steps.length - 1),
    ],
    { steps },
  );
}

// Brand switching: column j = where last week's buyers of brand j go this week.
const SWITCH = [
  [0.5, 0.1, 0.05],
  [0.15, 0.6, 0.1],
  [0.35, 0.3, 0.85],
];
const SHARE0 = [[40], [50], [10]];

function switchQ(meta: { id: string; level: 'basic' | 'exam' | 'tough'; source: 'book-example' | 'written'; title: string; prompt?: string; meaning?: string; page?: number; bookNote?: string }, s: Num[][], v: Num[][]): PaperQuestion {
  return mulQ({ ...meta, topic: T, prompt: meta.prompt }, s, v, ['S', 'm']);
}

const week1 = (s: Num[][], v: Num[][]) => s.map((r) => [Number(r.reduce<number>((t, x, j) => t + Number(x) * Number(v[j][0]), 0).toFixed(6))]);
const TEL = week1([[0.8, 0.3], [0.2, 0.7]], [[70], [30]]);

const gen: Generator = {
  id: 'g-apps',
  topic: T,
  levels: ['basic', 'exam'],
  make(rng, level) {
    const seed = Math.floor(rng.next() * 1e9);
    const meta = { id: `${T}:g:${seed}`, topic: T, level, source: 'generated' as const, gen: { id: 'g-apps', seed } };
    if (level === 'basic') {
      const eqs = pair(rng, 1, 6, 2, 12);
      return cramer2Q({ ...meta, title: 'Full use of two machines', prompt: `Products $x$ and $y$ use two machines. Machine I: ${w(eqs[0][0])} h per unit of $x$, ${w(eqs[0][1])} h per unit of $y$, ${w(eqs[0][2])} h available. Machine II: ${w(eqs[1][0])} h and ${w(eqs[1][1])} h per unit, ${w(eqs[1][2])} h available. How many units of each use both machines fully?` }, eqs);
    }
    const eqs = triple(rng, 1, 5, 2, 10);
    return cramer3Q({ ...meta, title: 'Full use of three departments', prompt: `Products $x$, $y$, $z$ pass through three departments. Hours per unit and hours available: ${eqs.map((r, i) => `Dept ${i + 1}: ${w(r[0])}, ${w(r[1])}, ${w(r[2])} h, ${w(r[3])} h available`).join('; ')}. Find the output that uses every department fully.` }, eqs);
  },
  mcq(rng, level) {
    const q = this.make(rng, level);
    return mcqFrom({ ...q, checkpoints: [q.checkpoints[0]] }, rng, `${q.prompt} What is the coefficient determinant $D$?`, 0);
  },
};

export const apps: Topic = {
  id: T,
  chapter: 3,
  title: 'Applications in management',
  blurb: 'Machine mix (ONGC) and brand switching',
  kind: 'numeric',
  pages: [5, 6, 7],
  cards: [
    {
      id: 'why',
      title: 'Why managers use determinants',
      page: 5,
      body: [
        { p: 'Determinants solve sets of simultaneous linear equations, and a computer can do the arithmetic, "removing the drudgery". A manager still needs to understand what determinants are and their main properties, to know what the computer is doing and why it may fail (for example when $D = 0$).' },
        { p: 'The book\'s typical problem: find the **product mix** that keeps every machine fully occupied.' },
      ],
    },
    {
      id: 'ongc',
      title: 'The ONGC machine-mix problem',
      page: 5,
      body: [
        { p: 'A workshop has 7 drilling, 2 turning, 3 milling and 1 grinding machine, and makes four types of bracket. Minutes per bracket:' },
        { table: { head: ['', 'A', 'B', 'C', 'D', 'Minutes/hour'], rows: [['Drilling', '7', '5', '14', '26', '420'], ['Turning', '3', '0', '6', '9', '120'], ['Milling', '2.5', '1.5', '9', '11', '180'], ['Grinding', '1.5', '0.5', '3.5', '1.5', '60']] } },
        { p: 'Each row is one equation. The right-hand side is (number of machines) × 60 minutes. The coefficient determinant is the denominator; replacing a type\'s column with 420, 120, 180, 60 gives its numerator.' },
        { p: 'The book finds $D = 225$ and the numerator for type A $= 225 \\times 11$, so **11 brackets of type A** per hour. It leaves B, C and D to the student; you will solve them in the Tough set.' },
        { bookNote: 'The printed reduction has slips: a sign ($-\\frac{3}{4}$ where the factor is $+\\frac{3}{4}$), the second row of the numerator printed as "12 0 0 69" (it is 120, 0, 6, 9), and factors shown as 60 and 50 before 15. The final values 225 and 11 are correct; the worked example here shows clean working.' },
      ],
    },
    {
      id: 'brand',
      title: 'Brand switching with matrices',
      page: 6,
      body: [
        { p: 'Three brands of oil hold 40%, 50% and 10% of the market. Each week some customers switch:' },
        { list: ['Of last week\'s Brand A buyers, 50% buy A again, 15% switch to B, 35% to C.', 'Of Brand B buyers, 60% stay, 10% switch to A, 30% to C.', 'Of Brand C buyers, 85% stay, 5% switch to A, 10% to B.'] },
        { p: 'Write the switching rates as decimals in a matrix whose **column $j$ shows where brand $j$\'s buyers go**. Each column adds up to 1. Multiply by the share vector:' },
        { math: '\\mat{0.50 & 0.10 & 0.05 \\\\ 0.15 & 0.60 & 0.10 \\\\ 0.35 & 0.30 & 0.85}\\mat{40 \\\\ 50 \\\\ 10} = \\mat{25.5 \\\\ 37.0 \\\\ 37.5}' },
        { p: 'Multiplying the new vector by the same matrix gives week 2: $(18.325, 29.775, 51.9)$. Brand C keeps growing but cannot reach a monopoly: its eventual share lies between 51.9% and 75%.' },
        { bookNote: 'The printed first product shows the initial share of Brand C as 15; it is 10.' },
        { p: 'The book notes two drawbacks: repeated multiplication produces fractions of customers, and real switching patterns change (sales campaigns, market forces). The same model is more realistic for probabilities.' },
      ],
    },
  ],
  examples: [
    ongcQ({ id: `${T}:bk1`, level: 'exam', source: 'book-example', title: 'Book example 1: ONGC brackets of type A', page: 5, bookNote: 'The printed working has sign and factor slips; the values D = 225 and A = 11 are correct.' }, 0),
    switchQ({ id: `${T}:bk2`, level: 'basic', source: 'book-example', title: 'Book example 2: brand shares after week 1', page: 6, prompt: 'Using the switching matrix $S$ and the starting shares $m$ (A 40%, B 50%, C 10%), find the shares after one week, $Sm$.', bookNote: 'The printed vector shows 15 for Brand C; the starting share is 10.' }, SWITCH, SHARE0),
    switchQ({ id: `${T}:bk3`, level: 'basic', source: 'book-example', title: 'Book example 2: shares after week 2', page: 6, prompt: 'Multiply the week-1 shares $m = (25.5, 37.0, 37.5)$ by the same switching matrix $S$ to get the shares after week 2.', meaning: 'Brand C leads within two weeks with 51.9% of the market.' }, SWITCH, week1(SWITCH, SHARE0)),
    cramer2Q({ id: `${T}:ex1`, topic: T, level: 'basic', source: 'written', title: 'Extra example: two products, two machines', prompt: 'Chairs ($x$) and tables ($y$) use a lathe and a polisher. A chair needs 2 h lathe and 1 h polishing; a table 3 h lathe and 4 h polishing. The lathe has 36 h and the polisher 38 h a week. Find the mix that uses both fully.', meaning: 'Make 6 chairs and 8 tables a week.' }, [[2, 3, 36], [1, 4, 38]]),
    switchQ({ id: `${T}:ex2`, level: 'exam', source: 'written', title: 'Extra example: two telecom brands', prompt: 'Two mobile networks P and Q hold 70% and 30% of subscribers. Each month 80% of P\'s subscribers stay and 20% move to Q; 70% of Q\'s stay and 30% move to P. With $S = \\mat{0.8 & 0.3 \\\\ 0.2 & 0.7}$ (columns: where P\'s and Q\'s subscribers go) and $m = \\mat{70 \\\\ 30}$, find next month\'s shares $Sm$.', meaning: `P falls to ${TEL[0][0]}% and Q rises to ${TEL[1][0]}%; the shares still total 100.` }, [[0.8, 0.3], [0.2, 0.7]], [[70], [30]]),
    ongcQ({ id: `${T}:ex3`, level: 'tough', source: 'written', title: 'Extra example: ONGC brackets of type B' }, 1),
  ],
  paper: [
    cramer2Q({ id: `${T}:p1`, topic: T, level: 'basic', source: 'written', title: 'Bakery mix', prompt: 'A bakery makes cakes ($x$) and pastries ($y$). Mixing: 3 min per cake, 2 min per pastry, 120 min available. Baking: 4 min per cake, 5 min per pastry, 230 min available. Find the mix that uses both stages fully.' }, [[3, 2, 120], [4, 5, 230]]),
    switchQ({ id: `${T}:p2`, level: 'basic', source: 'written', title: 'Two brands, one week', prompt: 'Brands X and Y hold 50% each. Switching matrix (columns: where X\'s and Y\'s buyers go) $S = \\mat{0.9 & 0.2 \\\\ 0.1 & 0.8}$. Find next week\'s shares $Sm$, $m = \\mat{50 \\\\ 50}$.' }, [[0.9, 0.2], [0.1, 0.8]], [[50], [50]]),
    cramer3Q({ id: `${T}:e1`, topic: T, level: 'exam', source: 'written', title: 'Three departments', prompt: 'Products $x, y, z$ need hours in cutting, sewing and packing. Cutting: 1, 2, 1 h per unit, 23 h available; sewing: 2, 1, 3 h, 30 h; packing: 1, 1, 1 h, 16 h. Find the output that uses all departments fully.' }, [[1, 2, 1, 23], [2, 1, 3, 30], [1, 1, 1, 16]]),
    switchQ({ id: `${T}:e2`, level: 'exam', source: 'written', title: 'Three brands of tea, one week', prompt: 'Shares of tea brands A, B, C are 30%, 45%, 25%. $S = \\mat{0.7 & 0.1 & 0.2 \\\\ 0.2 & 0.8 & 0.1 \\\\ 0.1 & 0.1 & 0.7}$ (column $j$: where brand $j$\'s buyers go). Find next week\'s shares.' }, [[0.7, 0.1, 0.2], [0.2, 0.8, 0.1], [0.1, 0.1, 0.7]], [[30], [45], [25]]),
    switchQ({ id: `${T}:e3`, level: 'exam', source: 'written', title: 'Week 3 of the book example', prompt: 'Continue the book\'s brand-switching example: multiply the week-2 shares $(18.325, 29.775, 51.9)$ by $S$ to get week 3.' }, SWITCH, week1(SWITCH, week1(SWITCH, SHARE0))),
    ongcQ({ id: `${T}:t1`, level: 'tough', source: 'written', title: 'ONGC: brackets of type C' }, 2),
    ongcQ({ id: `${T}:t2`, level: 'tough', source: 'written', title: 'ONGC: brackets of type D' }, 3),
    customQ(
      { id: `${T}:t3`, topic: T, level: 'tough', source: 'written', title: 'Check the ONGC answer' },
      `The ONGC solution is $A = ${w(div(det(withCol(0)), D_ONGC))}$, $B = ${w(div(det(withCol(1)), D_ONGC))}$, $C = ${w(div(det(withCol(2)), D_ONGC))}$, $D = ${w(div(det(withCol(3)), D_ONGC))}$ brackets per hour. Check that the grinding machine (1 machine) is fully used.`,
      [numCp('g', 'Grinding minutes', 'Grinding minutes used per hour', [0, 1, 2, 3].reduce((s, c) => s + Number(ONGC[3][c]) * Number(div(det(withCol(c)), D_ONGC).n), 0), 0, { slips: [[60 * 4, 'Use the grinding times 1.5, 0.5, 3.5, 1.5 minutes per bracket.']] })],
      {
        steps: [
          { say: 'Multiply each type\'s grinding time by its number of brackets, and add.', math: [`1.5(${w(div(det(withCol(0)), D_ONGC))}) + 0.5(${w(div(det(withCol(1)), D_ONGC))}) + 3.5(${w(div(det(withCol(2)), D_ONGC))}) + 1.5(${w(div(det(withCol(3)), D_ONGC))}) = 60`] },
          { say: 'So the answer is: 60 minutes, exactly the capacity of one grinding machine.', math: ['60'], end: true },
        ],
      },
    ),
  ],
  gens: [gen],
  mcqs: [
    mcq(`${T}:c1`, T, 'basic', 'In the ONGC problem, why is the right-hand side for drilling 420?', '7 machines × 60 minutes per hour', ['7 brackets × 60 minutes', '420 brackets are needed', 'it is the sum of the drilling times'], 'Each equation is total minutes of work per hour on that machine type.'),
    mcq(`${T}:c2`, T, 'exam', 'In the ONGC problem, $D = 225$ and the numerator for type A is $2475$. Type A brackets per hour =', '11', ['2475', '225', '0.09'], '$2475 / 225 = 11$.'),
    mcq(`${T}:c3`, T, 'basic', 'In the book\'s brand-switching matrix, each column adds up to…', '1', ['100', '0', 'the number of brands'], 'A column shares out all of one brand\'s customers.'),
    mcq(`${T}:c4`, T, 'exam', 'In brand switching, the shares after one week are found by…', 'multiplying the switching matrix by the share vector', ['adding the switching matrix to the share vector', 'taking the determinant of the switching matrix', 'transposing the share vector'], 'Matrix × vector.'),
    mcq(`${T}:c5`, T, 'exam', 'Which brand leads after two weeks in the book example?', 'Brand C (51.9%)', ['Brand A (18.325%)', 'Brand B (29.775%)', 'No brand: all equal'], 'Week-2 vector: $(18.325, 29.775, 51.9)$.'),
    mcq(`${T}:c6`, T, 'exam', 'The book gives which drawback of the brand-switching model?', 'Repeated multiplication produces fractions of customers', ['It cannot handle three brands', 'The matrix is never square', 'It needs determinants'], 'Also: switching patterns rarely stay the same.'),
    mcq(`${T}:c7`, T, 'tough', 'The book says Brand C\'s eventual share lies between…', '51.9% and 75%', ['10% and 37.5%', '0% and 100%', '37.5% and 51.9%'], 'It keeps rising past 51.9% but cannot exceed 75%.'),
    mcq(`${T}:c8`, T, 'exam', 'Why must a manager understand determinants if computers do the arithmetic?', 'To know what the computer is doing and why it may fail', ['Computers cannot evaluate determinants', 'Determinants are needed only for reports', 'Because exams forbid computers'], 'Book: it is still necessary to understand their nature and properties.'),
    mcq(`${T}:c9`, T, 'tough', 'For a product-mix problem, $D = 0$ means…', 'no unique mix uses every machine exactly fully', ['every product count is 0', 'the machines are idle', 'the mix is unique'], 'Cramer\'s rule cannot give a unique solution.'),
    mcq(`${T}:c10`, T, 'basic', 'In the ONGC data, type B needs 0 minutes of turning. In the turning equation this appears as…', '$0B$', ['nothing: B is left out of the determinant', '$1B$', '$B = 0$'], 'Keep a 0 in the B-column so the determinant stays $4 \\times 4$.'),
  ],
};

