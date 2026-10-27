// "Before you start" primers: skills the book uses without teaching them. Each has a few cards
// and five practice questions.

import { mcq } from '../kit.ts';
import type { Primer } from '../types.ts';

export const PRIMERS: Primer[] = [
  {
    id: 'p-signs',
    title: 'Working with negative numbers',
    blurb: 'Signs in adding, subtracting and multiplying',
    cards: [
      {
        id: 'add',
        title: 'Adding and subtracting with negatives',
        body: [
          { p: 'Think of a bank balance. Adding a negative number is the same as subtracting; subtracting a negative is the same as adding.' },
          { math: '5 + (-3) = 5 - 3 = 2 \\qquad 5 - (-3) = 5 + 3 = 8' },
          { math: '-4 - 6 = -10 \\qquad -4 + 6 = 2' },
          { tip: 'Two signs side by side: same signs give $+$, different signs give $-$. So $-(-3) = +3$ and $+(-3) = -3$.' },
        ],
      },
      {
        id: 'mul',
        title: 'Multiplying and dividing',
        body: [
          { list: ['positive × positive = positive', 'negative × negative = **positive**', 'positive × negative = negative'] },
          { math: '(-3) \\times (-4) = 12 \\qquad (-3) \\times 4 = -12 \\qquad \\frac{-12}{-4} = 3' },
          { tip: 'In a determinant like $\\det{-2 & 3 \\\\ 4 & -1}$, write each product in brackets first: $(-2)(-1) - (3)(4) = 2 - 12 = -10$.' },
        ],
      },
    ],
    practice: [
      mcq('p-signs:1', 'p-signs', 'basic', '$7 - (-2) =$', '9', ['5', '-9', '-5'], 'Subtracting a negative adds.'),
      mcq('p-signs:2', 'p-signs', 'basic', '$(-5) \\times (-6) =$', '30', ['-30', '-11', '11'], 'Negative × negative is positive.'),
      mcq('p-signs:3', 'p-signs', 'basic', '$-8 + 3 =$', '-5', ['5', '-11', '11'], 'Start at −8 and move 3 up.'),
      mcq('p-signs:4', 'p-signs', 'basic', '$(-2)(7) - (3)(-4) =$', '-2', ['-26', '26', '2'], '$-14 - (-12) = -14 + 12 = -2$.'),
      mcq('p-signs:5', 'p-signs', 'basic', '$\\frac{-18}{6} =$', '-3', ['3', '-12', '12'], 'Different signs give a negative.'),
    ],
  },
  {
    id: 'p-lineq',
    title: 'Solving a simple linear equation',
    blurb: 'Keep both sides balanced',
    cards: [
      {
        id: 'balance',
        title: 'An equation is a balance',
        body: [
          { p: 'Whatever you do to one side, do to the other. Undo operations in reverse order to get the unknown alone.' },
          { math: '3x + 5 = 20 \\Rightarrow 3x = 15 \\Rightarrow x = 5' },
          { math: '\\frac{x}{4} - 2 = 1 \\Rightarrow \\frac{x}{4} = 3 \\Rightarrow x = 12' },
          { tip: 'Check by substituting back: $3(5) + 5 = 20$ ✓.' },
        ],
      },
      {
        id: 'standard',
        title: 'Standard form for two unknowns',
        body: [
          { p: 'Determinant methods need each equation as $ax + by = h$: unknowns on the left in the same order, the number on the right.' },
          { math: '2y = 17 - 3x \\quad\\Rightarrow\\quad 3x + 2y = 17' },
          { math: '5x = 4y - 1 \\quad\\Rightarrow\\quad 5x - 4y = -1' },
          { tip: 'Moving a term across the = sign changes its sign.' },
        ],
      },
    ],
    practice: [
      mcq('p-lineq:1', 'p-lineq', 'basic', 'Solve $4x - 7 = 13$.', '$x = 5$', ['$x = 1.5$', '$x = 20$', '$x = 6$'], '$4x = 20$, so $x = 5$.'),
      mcq('p-lineq:2', 'p-lineq', 'basic', 'Solve $\\frac{x}{3} + 2 = 6$.', '$x = 12$', ['$x = 4$', '$x = 24$', '$x = 2$'], '$\\frac{x}{3} = 4$, so $x = 12$.'),
      mcq('p-lineq:3', 'p-lineq', 'basic', '$y = 10 - 2x$ in the form $ax + by = h$ is…', '$2x + y = 10$', ['$-2x + y = 10$', '$2x - y = 10$', '$x + 2y = 10$'], 'Add $2x$ to both sides.'),
      mcq('p-lineq:4', 'p-lineq', 'basic', 'Solve $5 - 2x = 11$.', '$x = -3$', ['$x = 3$', '$x = 8$', '$x = -8$'], '$-2x = 6$, so $x = -3$.'),
      mcq('p-lineq:5', 'p-lineq', 'basic', 'Solve $0.5x = 7.5$.', '$x = 15$', ['$x = 3.75$', '$x = 7$', '$x = 1.5$'], 'Divide by 0.5 (multiply by 2).'),
    ],
  },
  {
    id: 'p-round',
    title: 'Rounding and the app’s rule',
    blurb: 'Decimal places, and what the app accepts',
    cards: [
      {
        id: 'dp',
        title: 'Rounding to decimal places',
        body: [
          { p: 'To round to 2 decimal places, look at the third decimal digit: 5 or more rounds up, less than 5 leaves it.' },
          { math: '337.114 \\to 337.11 \\qquad 2.345 \\to 2.35 \\qquad 0.6667 \\to 0.67' },
          { tip: 'Round only at the end. Keep full values (or fractions) while you work, so rounding errors do not pile up.' },
        ],
      },
      {
        id: 'rule',
        title: 'What the app accepts',
        body: [
          { p: 'Each checkpoint says how many decimal places it wants. Your entry is right when, rounded to those places, it matches the answer.' },
          { list: ['For "2 decimal places", 337.11, 337.114 and 337.1100 are all right; 337.1 is not.', 'Fractions are fine: 2/3 is accepted for 0.67.', 'For values in the middle of the working, the app also accepts a difference of 1 in the last place, in case you rounded a little earlier.'] },
        ],
      },
    ],
    practice: [
      mcq('p-round:1', 'p-round', 'basic', '$12.3456$ to 2 decimal places is…', '12.35', ['12.34', '12.3', '12.346'], 'Third decimal 5 rounds up.'),
      mcq('p-round:2', 'p-round', 'basic', '$\\frac{1}{3}$ to 2 decimal places is…', '0.33', ['0.3', '0.34', '0.333'], '0.3333… rounds to 0.33.'),
      mcq('p-round:3', 'p-round', 'basic', '$45.996$ to 2 decimal places is…', '46.00', ['45.99', '45.10', '46.1'], 'Rounding up carries over.'),
      mcq('p-round:4', 'p-round', 'basic', 'An answer is 7.5 "to 1 decimal place". Which entry is NOT right?', '7.4', ['7.5', '7.50', '15/2'], '7.4 rounds to 7.4.'),
      mcq('p-round:5', 'p-round', 'basic', 'When should you round in a long calculation?', 'At the end', ['After every step', 'At the start', 'Never'], 'Rounding early piles up errors.'),
    ],
  },
  {
    id: 'p-powers',
    title: 'Powers, roots and order of operations',
    blurb: 'BODMAS, squares and square roots',
    cards: [
      {
        id: 'order',
        title: 'Order of operations',
        body: [
          { p: 'Brackets first, then powers and roots, then multiplication and division (left to right), then addition and subtraction (left to right).' },
          { math: '2 + 3 \\times 4^2 = 2 + 3 \\times 16 = 2 + 48 = 50' },
          { math: '(2 + 3) \\times 4 = 20' },
        ],
      },
      {
        id: 'pow',
        title: 'Powers and roots',
        body: [
          { math: 'a^2 = a \\times a, \\quad a^3 = a \\times a \\times a, \\quad (-3)^2 = 9, \\quad -3^2 = -9' },
          { math: '\\sqrt{49} = 7, \\quad \\sqrt{2.25} = 1.5, \\quad \\sqrt{a \\times b} = \\sqrt{a}\\sqrt{b}' },
          { tip: 'A negative number squared is positive, so $\\sqrt{\\ }$ of a negative number has no real value. You will meet this in quadratic equations.' },
        ],
      },
    ],
    practice: [
      mcq('p-powers:1', 'p-powers', 'basic', '$5 + 2 \\times 3^2 =$', '23', ['63', '41', '29'], '$3^2 = 9$, $2 \\times 9 = 18$, $5 + 18 = 23$.'),
      mcq('p-powers:2', 'p-powers', 'basic', '$(-4)^2 =$', '16', ['-16', '8', '-8'], 'Negative × negative.'),
      mcq('p-powers:3', 'p-powers', 'basic', '$\\sqrt{144} =$', '12', ['72', '14', '24'], '$12 \\times 12 = 144$.'),
      mcq('p-powers:4', 'p-powers', 'basic', '$2^3 \\times 2^2 =$', '32', ['64', '10', '16'], '$8 \\times 4 = 32$ (or $2^5$).'),
      mcq('p-powers:5', 'p-powers', 'basic', '$\\frac{6 + 4}{2} \\times 3 =$', '15', ['8', '10', '7'], 'Numerator first: $10 / 2 = 5$, then $\\times 3$.'),
    ],
  },
];
