// Unit 3 · Determinants and a pair of linear equations (book pp. 1–3 of the unit).

import type { Rng } from '../../core/rng.ts';
import { mcq, mcqFrom } from '../kit.ts';
import type { Generator, Topic } from '../types.ts';
import { cramer2Q, det2Q, singularQ } from './build.ts';

const T = 'd-2x2';

// Numbers used on the Learn cards (every value below is computed).
const W = [[5, 3], [2, 4]];
const DW = W[0][0] * W[1][1] - W[0][1] * W[1][0];
const N = [[-2, 3], [4, -1]];
const DN = N[0][0] * N[1][1] - N[0][1] * N[1][0];
// The pen-and-notebook pair: [x-number, y-number, answer].
const E1 = [2, 3, 120];
const E2 = [3, 2, 130];
const D = E1[0] * E2[1] - E1[1] * E2[0];
const DX = E1[2] * E2[1] - E1[1] * E2[2];
const DY = E1[0] * E2[2] - E1[2] * E2[0];
const X = DX / D;
const Y = DY / D;

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
      id: 'why',
      title: 'Why a manager needs determinants',
      page: 1,
      body: [
        { p: 'Managers often have **two unknown amounts** and **two facts** that link them. For example:' },
        { eg: `A shop sells pens and notebooks. ${E1[0]} pens and ${E1[1]} notebooks cost ₹${E1[2]}. ${E2[0]} pens and ${E2[1]} notebooks cost ₹${E2[2]}. What does one pen cost, and one notebook?` },
        { p: `Give the two unknown prices short names: $x$ for one pen and $y$ for one notebook. (A letter is only a label for "the number we do not know yet", like writing ? in a box.) The two facts become:` },
        { math: `${E1[0]}x + ${E1[1]}y = ${E1[2]}` },
        { math: `${E2[0]}x + ${E2[1]}y = ${E2[2]}` },
        { p: `Read $${E1[0]}x$ as "${E1[0]} times $x$": the cost of ${E1[0]} pens. So the first line says: ${E1[0]} pens plus ${E1[1]} notebooks cost ₹${E1[2]}.` },
        { p: 'The same pattern turns up all over business: two products sharing two machines, two raw materials in two blends, two kinds of staff on two shifts.' },
        { p: 'Determinants give a **fixed recipe** that finds $x$ and $y$ without guessing, called **Cramer\'s rule**. First, the next three cards show what a determinant is and how to work one out.' },
      ],
    },
    {
      id: 'what',
      title: 'A determinant is just one number',
      page: 1,
      body: [
        { p: 'You already know a **matrix**: a small table of numbers in brackets.' },
        { p: 'A **determinant** looks almost the same, but it is written between two **straight lines** instead of brackets. And it is not a table: it always works out to **one single number**.' },
        { math: `\\det{${W[0][0]} & ${W[0][1]} \\\\ ${W[1][0]} & ${W[1][1]}} = ${DW}` },
        { p: 'This one has 2 rows and 2 columns, so it is called a **2 × 2** (or "second-order") determinant. The next card shows how to get that number.' },
        { tip: 'Brackets ( ) mean a matrix, a table. Straight lines | | mean a determinant, a single number.' },
      ],
    },
    {
      id: 'rule',
      title: 'Working out a 2 × 2 determinant',
      page: 2,
      body: [
        { p: 'It takes three small steps. Use this one:' },
        { math: `\\det{${W[0][0]} & ${W[0][1]} \\\\ ${W[1][0]} & ${W[1][1]}}` },
        { p: `**Step 1.** Multiply the **top-left** number by the **bottom-right** number (the line going down to the right): $${W[0][0]} \\times ${W[1][1]} = ${W[0][0] * W[1][1]}$.` },
        { p: `**Step 2.** Multiply the **top-right** number by the **bottom-left** number (the other line): $${W[0][1]} \\times ${W[1][0]} = ${W[0][1] * W[1][0]}$.` },
        { p: `**Step 3.** Take the second answer away from the first: $${W[0][0] * W[1][1]} - ${W[0][1] * W[1][0]} = ${DW}$.` },
        { p: 'That is all. In letters, the same rule is written:' },
        { math: '\\det{a & b \\\\ c & d} = ad - bc' },
        { tip: 'Always **first line minus second line**. Doing it the other way round gives the right number with the wrong sign.' },
      ],
    },
    {
      id: 'signs',
      title: 'When there are minus numbers',
      page: 2,
      body: [
        { p: 'The steps do not change. Just put each minus number in brackets so you do not lose its sign.' },
        { math: `\\det{${N[0][0]} & ${N[0][1]} \\\\ ${N[1][0]} & ${N[1][1]}}` },
        { p: `**Step 1.** $(${N[0][0]}) \\times (${N[1][1]}) = ${N[0][0] * N[1][1]}$ (minus times minus is plus).` },
        { p: `**Step 2.** $${N[0][1]} \\times ${N[1][0]} = ${N[0][1] * N[1][0]}$.` },
        { p: `**Step 3.** $${N[0][0] * N[1][1]} - ${N[0][1] * N[1][0]} = ${DN}$.` },
        { tip: 'Not sure about minus numbers? Open the short "Working with negative numbers" card from the topic screen first.' },
      ],
    },
    {
      id: 'cramer',
      title: "Cramer's rule: the recipe",
      page: 3,
      body: [
        { p: 'Back to the pens and notebooks from the first card:' },
        { math: `${E1[0]}x + ${E1[1]}y = ${E1[2]}` },
        { math: `${E2[0]}x + ${E2[1]}y = ${E2[2]}` },
        { p: `**Step 1. Make $D$.** Copy the numbers in front of $x$ and $y$, keeping their places:` },
        { math: `D = \\det{${E1[0]} & ${E1[1]} \\\\ ${E2[0]} & ${E2[1]}} = ${E1[0] * E2[1]} - ${E1[1] * E2[0]} = ${D}` },
        { p: `**Step 2. Make $D_x$.** Same, but replace the **x-numbers** (first column) with the **answers** on the right, ${E1[2]} and ${E2[2]}:` },
        { math: `D_x = \\det{${E1[2]} & ${E1[1]} \\\\ ${E2[2]} & ${E2[1]}} = ${E1[2] * E2[1]} - ${E1[1] * E2[2]} = ${DX}` },
        { p: `**Step 3. Make $D_y$.** Go back to $D$ and this time replace the **y-numbers** (second column) with the answers:` },
        { math: `D_y = \\det{${E1[0]} & ${E1[2]} \\\\ ${E2[0]} & ${E2[2]}} = ${E1[0] * E2[2]} - ${E1[2] * E2[0]} = ${DY}` },
        { p: '**Step 4. Divide** each by $D$:' },
        { math: `x = \\frac{${DX}}{${D}} = ${X}, \\qquad y = \\frac{${DY}}{${D}} = ${Y}` },
        { p: `So a pen costs ₹${X} and a notebook ₹${Y}. Check with the first fact: $${E1[0]}(${X}) + ${E1[1]}(${Y}) = ${E1[0] * X + E1[1] * Y}$ ✓.` },
        { tip: 'To remember: $D$ uses only the x- and y-numbers. For $D_x$, the answers go in the **x** column; for $D_y$, in the **y** column.' },
      ],
    },
    {
      id: 'zero',
      title: 'When D is 0',
      page: 3,
      body: [
        { p: 'Step 4 divides by $D$. If $D$ comes out as **0**, you cannot divide, so Cramer\'s rule cannot give an answer.' },
        { p: 'This happens when one equation is just a multiple of the other, for example $x + 2y = 5$ and $2x + 4y = 10$. They are really the same fact said twice, so there is no single answer.' },
        { tip: 'In the exam, work out $D$ first. If it is 0, write: "$D = 0$, so there is no unique solution."' },
      ],
    },
    {
      id: 'recipe',
      title: 'Quick reference: both methods',
      body: [
        { p: '**A 2 × 2 determinant in 3 steps**' },
        { list: ['Top-left × bottom-right.', 'Top-right × bottom-left.', 'First answer minus second answer.'], ordered: true },
        { p: '**Cramer\'s rule in 4 steps**' },
        { list: ['Line up the equations: $x$ under $x$, $y$ under $y$, answers on the right. Make $D$ from the numbers in front of $x$ and $y$.', 'Make $D_x$: answers in place of the x-numbers.', 'Make $D_y$: answers in place of the y-numbers.', 'Divide: $x = D_x \\div D$ and $y = D_y \\div D$. Check in one equation.'], ordered: true },
        { tip: 'If $D = 0$, stop: there is no single answer.' },
      ],
    },
    {
      id: 'methods',
      title: 'Three ways to solve equations (book theory)',
      page: 3,
      body: [
        { p: 'The book names three methods for solving several equations together. You only need to know what each is good for:' },
        { list: ['**Determinants** (Cramer\'s rule): quickest when you need only one or two of the unknowns, as often happens in probability problems.', '**Row operations**: quickest for the complete solution. They also work when determinants give $0 \\div 0$.', '**Matrices**: most useful when many sets of equations share the same numbers in front of the unknowns. Computer programs prefer this method.'] },
        { p: 'All three can be done on a computer. For the exam, you will use determinants.' },
      ],
    },
    {
      id: 'elim',
      title: 'Why the recipe works, with numbers',
      page: 1,
      optional: true,
      body: [
        { p: 'The exam asks you to **use** the recipe, not to prove it. This card is here if you are curious why it works.' },
        { p: 'Without determinants, the usual way to solve two equations is to **remove one unknown**. Take the same equations:' },
        { math: `${E1[0]}x + ${E1[1]}y = ${E1[2]} \\quad (1)` },
        { math: `${E2[0]}x + ${E2[1]}y = ${E2[2]} \\quad (2)` },
        { p: `We want the x-parts to be the same size, so they cancel when we subtract. Multiply everything in (1) by ${E2[0]} and everything in (2) by ${E1[0]}. (Multiplying both sides of an equation by the same number keeps it true, like $2 = 2$ becoming $6 = 6$.)` },
        { math: `${E1[0] * E2[0]}x + ${E1[1] * E2[0]}y = ${E1[2] * E2[0]} \\quad (3)` },
        { math: `${E1[0] * E2[0]}x + ${E2[1] * E1[0]}y = ${E2[2] * E1[0]} \\quad (4)` },
        { p: `Now subtract (4) from (3). The $${E1[0] * E2[0]}x$ parts cancel and only $y$ is left:` },
        { math: `${E1[1] * E2[0] - E2[1] * E1[0]}y = ${E1[2] * E2[0] - E2[2] * E1[0]} \\Rightarrow y = ${Y}` },
        { p: 'Cramer\'s rule does exactly these steps in a fixed pattern, which is why it always works.' },
      ],
    },
    {
      id: 'derive',
      title: 'The book\'s general formula',
      page: 1,
      optional: true,
      body: [
        { p: 'The book repeats the last card with letters in place of numbers. $a_1$ means "the number in front of $x$ in the first equation", $b_1$ "the number in front of $y$", and $h_1$ "the answer on the right"; the 2s are the same for the second equation.' },
        { math: 'a_1x + b_1y = h_1' },
        { math: 'a_2x + b_2y = h_2' },
        { p: 'Doing the same steps (multiply, subtract, divide) gives:' },
        { math: 'x = \\frac{h_1b_2 - h_2b_1}{a_1b_2 - a_2b_1}' },
        { math: 'y = \\frac{a_1h_2 - a_2h_1}{a_1b_2 - a_2b_1}' },
        { p: 'The bottom of both fractions is the determinant $D$; the tops are $D_x$ and $D_y$. That is Cramer\'s rule.' },
      ],
    },
  ],
  examples: [
    det2Q({ id: `${T}:ex1`, topic: T, level: 'basic', source: 'written', title: 'Extra example: evaluate a 2 × 2 determinant' }, [[5, 3], [2, 4]]),
    cramer2Q({ id: `${T}:ex2`, topic: T, level: 'exam', source: 'written', title: 'Extra example: two products, two machines', prompt: 'Product $x$ needs 3 hours on machine I and 2 hours on machine II; product $y$ needs 4 hours on I and 5 on II. Machine I is available 48 hours and machine II 46 hours a week. How many of each should be made to use both machines fully?', setup: 'Turn each machine into one equation. **Machine I:** each $x$ takes 3 hours and each $y$ takes 4 hours, so making them uses $3x + 4y$ hours. Using the machine fully means this equals the 48 hours it has. **Machine II** works the same way: $2x + 5y = 46$.', meaning: 'Make 8 units of $x$ and 6 units of $y$ each week.' }, [[3, 4, 48], [2, 5, 46]]),
    singularQ({ id: `${T}:ex3`, topic: T, level: 'tough', source: 'written', title: 'Extra example: when D = 0' }, [[2, 3, 12], [4, 6, 20]], ['x', 'y']),
  ],
  paper: [
    det2Q({ id: `${T}:p1`, topic: T, level: 'basic', source: 'written', title: 'Evaluate |7 2; 3 4|' }, [[7, 2], [3, 4]]),
    det2Q({ id: `${T}:p2`, topic: T, level: 'basic', source: 'written', title: 'Evaluate with negatives' }, [[-3, 5], [2, -4]]),
    cramer2Q({ id: `${T}:p3`, topic: T, level: 'basic', source: 'written', title: 'Solve 2x + y = 7, x + 3y = 11' }, [[2, 1, 7], [1, 3, 11]]),
    cramer2Q({ id: `${T}:e1`, topic: T, level: 'exam', source: 'written', title: 'Tickets sold', prompt: 'A theatre sold adult tickets at ₹150 and student tickets at ₹90. In one show 400 tickets earned ₹51,600. Taking $x$ adults and $y$ students, the equations are $x + y = 400$ and $150x + 90y = 51600$. Solve by determinants.', setup: 'The equations are given. In words: the first counts **tickets** (adults + students = 400); the second counts **money** (₹150 for each adult ticket plus ₹90 for each student ticket = ₹51,600).', meaning: 'So 260 adult tickets and 140 student tickets were sold.' }, [[1, 1, 400], [150, 90, 51600]]),
    cramer2Q({ id: `${T}:e2`, topic: T, level: 'exam', source: 'written', title: 'Solve 5x − 2y = 4, 3x + 4y = 18' }, [[5, -2, 4], [3, 4, 18]]),
    cramer2Q({ id: `${T}:e3`, topic: T, level: 'exam', source: 'written', title: 'Mixing two blends', prompt: 'A blend uses $x$ kg of tea A at ₹300/kg and $y$ kg of tea B at ₹420/kg to make 60 kg costing ₹20,520 in all: $x + y = 60$ and $300x + 420y = 20520$. Find $x$ and $y$.', setup: 'The equations are given. In words: the first counts **kilograms** (tea A + tea B = 60 kg); the second counts **rupees** (₹300 for each kg of A plus ₹420 for each kg of B = ₹20,520).', meaning: 'So the blend uses 39 kg of tea A and 21 kg of tea B.' }, [[1, 1, 60], [300, 420, 20520]]),
    cramer2Q({ id: `${T}:t1`, topic: T, level: 'tough', source: 'written', title: 'Fractional answers', prompt: 'Solve by determinants: $4x + 3y = 5$ and $6x - 5y = 2$. Give answers to 2 decimal places.' }, [[4, 3, 5], [6, -5, 2]]),
    singularQ({ id: `${T}:t2`, topic: T, level: 'tough', source: 'written', title: 'Proportional rows' }, [[3, -6, 9], [-1, 2, -3]], ['x', 'y']),
    cramer2Q({ id: `${T}:t3`, topic: T, level: 'tough', source: 'written', title: 'Rearrange first', prompt: 'Solve by determinants: $2y = 17 - 3x$ and $5x = 4y - 1$. (Write both in the form $ax + by = h$ first.)', setup: 'First move the terms so that $x$ and $y$ are on the left, in that order, and the plain number is on the right. $2y = 17 - 3x$: add $3x$ to both sides. $5x = 4y - 1$: take $4y$ from both sides.' }, [[3, 2, 17], [5, -4, -1]]),
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
