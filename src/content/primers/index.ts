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
        id: 'why',
        title: 'Why signs matter',
        body: [
          { p: 'Minus numbers are everyday business: a loss of ₹3,000 is $-3000$, a fall in sales of 40 units is a change of $-40$, an overdrawn account has a minus balance.' },
          { p: 'Matrices and determinants are full of minus signs, and **one lost sign makes the whole answer wrong**. Two short rules are all you need.' },
        ],
      },
      {
        id: 'add',
        title: 'Adding and subtracting: think of money',
        body: [
          { p: 'Think of your bank balance. A plus number is money in; a minus number is money out (or money owed).' },
          { list: ['$5 + (-3)$: you have ₹5 and spend ₹3. You are left with **2**.', '$5 - (-3)$: you have ₹5 and the bank **cancels** a ₹3 charge. You end with **8**. Taking away a minus is the same as adding.', '$-4 - 6$: you owe ₹4 and spend ₹6 more. Now you owe ₹10: **−10**.', '$-4 + 6$: you owe ₹4 and ₹6 comes in. You have **2**.'] },
          { tip: 'Two signs side by side: same signs make $+$, different signs make $-$. So $-(-3) = +3$ and $+(-3) = -3$.' },
        ],
      },
      {
        id: 'mul',
        title: 'Multiplying and dividing',
        body: [
          { p: 'Only the sign needs a rule; the numbers multiply as usual.' },
          { list: ['plus × plus = **plus**', 'minus × minus = **plus**', 'plus × minus = **minus**'] },
          { eg: 'A shop loses ₹3 a day for 4 days: $4 \\times (-3) = -12$, a loss of ₹12. If those 4 losses are **removed** (minus × minus), the shop is ₹12 better off: $(-4) \\times (-3) = +12$.' },
          { math: '(-3) \\times (-4) = 12 \\qquad (-3) \\times 4 = -12 \\qquad \\frac{-12}{-4} = 3' },
          { tip: 'In a determinant like $\\det{-2 & 3 \\\\ 4 & -1}$, put every number in brackets first: $(-2)(-1) - (3)(4) = 2 - 12 = -10$.' },
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
          { p: 'An equation says two amounts are **equal**, like the two pans of a balanced weighing scale. You may do anything you like to one side, as long as you do **the same to the other side**: the scale stays balanced.' },
          { eg: '3 pens plus ₹5 delivery cost ₹20. What does one pen cost? Call the price $x$: $3x + 5 = 20$. ($3x$ means 3 times $x$.)' },
          { list: ['Take 5 away from both sides: $3x = 15$.', 'Divide both sides by 3: $x = 5$. A pen costs ₹5.', 'Check: $3 \\times 5 + 5 = 20$ ✓.'], ordered: true },
          { p: 'Another one: $\\frac{x}{4} - 2 = 1$. Add 2 to both sides: $\\frac{x}{4} = 3$. Multiply both sides by 4: $x = 12$.' },
          { tip: 'Undo things in reverse order: whatever was done to $x$ last, undo first.' },
        ],
      },
      {
        id: 'standard',
        title: 'Lining up two-unknown equations',
        body: [
          { p: 'Cramer\'s rule needs every equation in the same shape: the $x$ part, then the $y$ part, on the left; the plain number on the right.' },
          { math: 'ax + by = h' },
          { p: 'To move a term to the other side, do the **opposite** to both sides:' },
          { list: ['$2y = 17 - 3x$: add $3x$ to both sides, giving $3x + 2y = 17$.', '$5x = 4y - 1$: take $4y$ from both sides, giving $5x - 4y = -1$.'] },
          { tip: 'Shortcut: a term that jumps across the = sign **changes its sign**.' },
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
          { p: '**Decimal places** are the digits after the point: 337.11 has 2 decimal places. To round to 2 places, look at the **third** digit after the point: 5 or more, round up; less than 5, leave it.' },
          { eg: 'Money is always rounded to 2 places (paise): ₹337.114 is ₹337.11, and ₹2.345 is ₹2.35.' },
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
        title: 'Which part to work out first',
        body: [
          { p: 'When a line has several operations, the order is fixed (often remembered as **BODMAS**):' },
          { list: ['**B**rackets first.', '**O**rders: powers and roots.', '**D**ivision and **M**ultiplication, left to right.', '**A**ddition and **S**ubtraction, left to right.'], ordered: true },
          { math: '2 + 3 \\times 4^2 = 2 + 3 \\times 16 = 2 + 48 = 50' },
          { math: '(2 + 3) \\times 4 = 5 \\times 4 = 20' },
          { eg: 'A bill of 3 shirts at ₹400 plus ₹50 delivery is $3 \\times 400 + 50 = 1250$, not $3 \\times 450$. Multiplication comes before addition.' },
        ],
      },
      {
        id: 'pow',
        title: 'Powers and square roots',
        body: [
          { p: 'A **power** is repeated multiplication: $4^2$ means $4 \\times 4 = 16$ (not $4 \\times 2$), and $2^3 = 2 \\times 2 \\times 2 = 8$.' },
          { eg: 'Compound interest uses powers: ₹1,000 growing 10% a year for 2 years is $1000 \\times 1.1^2 = 1000 \\times 1.21 = 1210$.' },
          { p: 'Watch the brackets: $(-3)^2 = (-3) \\times (-3) = 9$, but $-3^2 = -(3 \\times 3) = -9$.' },
          { p: 'A **square root** undoes a square: $\\sqrt{49} = 7$ because $7 \\times 7 = 49$. Also $\\sqrt{2.25} = 1.5$.' },
          { tip: 'No number times itself gives a minus number, so the square root of a minus number has no ordinary value. You will meet this in quadratic equations.' },
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
