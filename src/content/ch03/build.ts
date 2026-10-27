// Unit 3 builders: determinants and Cramer's rule. Every value is computed with exact fractions.

import { add, det, div, eq, F, isZero, M, minorMat, mul, neg, sub, type Frac, type Num } from '../../core/num.ts';
import type { Lesson, Mark, MatsBoard, MatTerm, Step } from '../../teach/types.ts';
import { cellsOf, choiceCp, dpFor, matCp, numCp, pw, texMat, w } from '../kit.ts';
import type { Checkpoint, Level, PaperQuestion, Source } from '../types.ts';

export interface Meta {
  id: string;
  topic: string;
  level: Level;
  source: Source;
  title: string;
  prompt?: string;
  meaning?: string;
  page?: number;
  bookNote?: string;
  /** Word problems: how the story turns into the equations, in plain words (first step of Cramer's rule). */
  setup?: string;
  gen?: { id: string; seed: number };
}

function q(meta: Meta, prompt: string, data: PaperQuestion['data'], cps: Checkpoint[], lesson: Lesson): PaperQuestion {
  return { id: meta.id, topic: meta.topic, level: meta.level, source: meta.source, title: meta.title, prompt: meta.prompt ?? prompt, data, checkpoints: cps, lesson, page: meta.page, bookNote: meta.bookNote, gen: meta.gen };
}

const detTerm = (cells: Num[][] | string[][], name?: string, marks?: Mark[], extra: Partial<MatTerm> = {}): MatTerm => ({
  kind: 'mat',
  name,
  br: 'bar',
  cells: cellsOf(cells as (Num | string)[][]),
  marks,
  ...extra,
});

/** The working for a 2×2 determinant: "a × d − b × c". */
export function det2Work(m: Num[][]): string {
  return `${pw(m[0][0])} \\times ${pw(m[1][1])} - ${pw(m[0][1])} \\times ${pw(m[1][0])} = ${w(mul(m[0][0], m[1][1]))} - ${pw(mul(m[0][1], m[1][0]))}`;
}

/** First-row expansion of a 3 × 3 written out: "2(6) − 1(−1) + 3(−4) = 12 + 1 − 12". */
export function expandWork(m: Num[][]): string {
  const a = M(m);
  const mins = [0, 1, 2].map((j) => det(minorMat(a, 0, j)));
  const t = [mul(a[0][0], mins[0]), mul(mul(a[0][1], mins[1]), -1), mul(a[0][2], mins[2])];
  const sum = t.map((x, i) => (i === 0 ? w(x) : F(x).n < 0 ? ` - ${w(mul(x, -1))}` : ` + ${w(x)}`)).join('');
  return `${pw(a[0][0])}(${w(mins[0])}) - ${pw(a[0][1])}(${w(mins[1])}) + ${pw(a[0][2])}(${w(mins[2])}) = ${sum}`;
}

/** A reminder when a 2 × 2 has "minus a minus" in it. */
function minusMinus(...ms: Num[][][]): string | undefined {
  return ms.some((m) => F(mul(m[0][1], m[1][0])).n < 0) ? 'Taking away a minus number is the same as adding it: $5 - (-3) = 5 + 3$.' : undefined;
}

// ---------------------------------------------------------------------------------------------
// 2 × 2 determinant

export function det2Q(meta: Meta, m: Num[][], name = 'D'): PaperQuestion {
  const [[a, b], [c, d]] = M(m);
  const ad = mul(a, d);
  const bc = mul(b, c);
  const D = sub(ad, bc);
  const steps: Step[] = [
    { say: 'A 2 × 2 determinant always comes out as **one number**. It takes three small steps: two multiplications and one subtraction.', math: [`${name} = ${texMat(m, 'det')}`] },
    { say: '**Step 1.** Multiply the **top-left** number by the **bottom-right** number (the blue line going down to the right).', math: [`${pw(a)} \\times ${pw(d)} = ${w(ad)}`], after: (F(a).n < 0) !== (F(d).n < 0) && !isZero(ad) ? 'One of them is negative, so the answer is negative.' : (F(a).n < 0 && F(d).n < 0 ? 'Minus times minus gives plus.' : undefined) },
    { say: '**Step 2.** Multiply the **top-right** number by the **bottom-left** number (the red line).', math: [`${pw(b)} \\times ${pw(c)} = ${w(bc)}`] },
    { say: '**Step 3.** Take the Step 2 answer **away from** the Step 1 answer. So the answer is:', math: [`${name} = ${pw(ad)} - ${pw(bc)} = ${w(D)}`], after: [F(bc).n < 0 ? `Taking away a minus number is the same as adding it: $${w(ad)} - ${pw(bc)} = ${w(ad)} + ${w(neg(F(bc)))}$.` : '', meta.meaning ?? ''].filter(Boolean).join(' ') || undefined, end: true },
  ];
  const board: MatsBoard = {
    kind: 'mats',
    terms: [detTerm(m, `$${name} =$`, [
      { type: 'diag', at: 1 },
      { type: 'anti', at: 2 },
    ])],
  };
  const cps = [
    numCp('ad', 'Top-left × bottom-right', 'Step 1: top-left × bottom-right', ad, 1, { slips: [[mul(a, b), 'That multiplies along the top row. Use top-left × bottom-right (the line going down to the right).']] }),
    numCp('bc', 'Top-right × bottom-left', 'Step 2: top-right × bottom-left', bc, 2, { slips: [[mul(c, d), 'That multiplies along the bottom row. Use top-right × bottom-left.']] }),
    numCp('d', `$${name}$`, `Value of $${name}$`, D, 3, {
      slips: [
        [add(ad, bc), 'The two products were added. A determinant **takes away** the second product: first product minus second.'],
        [sub(bc, ad), 'The subtraction is the wrong way round (second minus first), so the sign flipped. It is always first product minus second.'],
        [sub(mul(a, b), mul(c, d)), 'Those multiply along the rows. Multiply along the crossing lines: top-left × bottom-right, then top-right × bottom-left.'],
      ],
    }),
  ];
  return q(meta, `Evaluate $${name} = ${texMat(m, 'det')}$.`, undefined, cps, { board, steps });
}

// ---------------------------------------------------------------------------------------------
// Cramer's rule, 2 unknowns:  a1 x + b1 y = h1,  a2 x + b2 y = h2

export function eqText(row: Num[], vars: string[]): string {
  const terms: string[] = [];
  row.slice(0, -1).forEach((c, i) => {
    const f = F(c);
    if (f.n === 0) return;
    const mag = f.n < 0 ? neg(f) : f;
    const coef = eq(mag, 1) ? '' : w(mag);
    const sign = f.n < 0 ? '-' : '+';
    terms.push(terms.length === 0 ? `${f.n < 0 ? '-' : ''}${coef}${vars[i]}` : `${sign} ${coef}${vars[i]}`);
  });
  return `${terms.join(' ')} = ${w(row[row.length - 1])}`;
}

/** Replace column `col` of the coefficient matrix with the right-hand sides. */
const swapCol = (coef: Frac[][], h: Frac[], col: number): Frac[][] => coef.map((r, i) => r.map((x, j) => (j === col ? h[i] : x)));

export function cramer2Q(meta: Meta, eqs: Num[][], vars: [string, string] = ['x', 'y']): PaperQuestion {
  const E = M(eqs);
  const coef = E.map((r) => r.slice(0, 2));
  const h = E.map((r) => r[2]);
  const D = det(coef);
  if (isZero(D)) throw new Error(`${meta.id}: D = 0, use singularQ`);
  const Dx = det(swapCol(coef, h, 0));
  const Dy = det(swapCol(coef, h, 1));
  const x = div(Dx, D);
  const y = div(Dy, D);
  const [vx, vy] = vars;
  const dx = swapCol(coef, h, 0);
  const dy = swapCol(coef, h, 1);
  const steps: Step[] = [
    {
      say: meta.setup
        ? `${meta.setup} Written neatly, one under the other, with the plain numbers (the **answers**) on the right:`
        : `First write the two equations neatly, one under the other: the $${vx}$ parts lined up, the $${vy}$ parts lined up, and the plain numbers (the **answers**) on the right.`,
      math: [eqText(eqs[0], vars), eqText(eqs[1], vars)],
    },
    { say: `**Step 1. Make $D$.** Copy only the numbers in front of $${vx}$ and $${vy}$, keeping their places. Then work it out: top-left × bottom-right, minus top-right × bottom-left.`, math: [`D = ${texMat(coef, 'det')}`, `= ${det2Work(coef)} = ${w(D)}`], after: minusMinus(coef) },
    { say: `**Step 2. Make $D_${vx}$.** Start from $D$, but swap the **${vx}-numbers** (first column) for the answers on the right. Work it out the same way.`, math: [`D_${vx} = ${texMat(dx, 'det')}`, `= ${det2Work(dx)} = ${w(Dx)}`], after: minusMinus(coef) ? undefined : minusMinus(dx) },
    { say: `**Step 3. Make $D_${vy}$.** Go back to $D$, and this time swap the **${vy}-numbers** (second column) for the answers.`, math: [`D_${vy} = ${texMat(dy, 'det')}`, `= ${det2Work(dy)} = ${w(Dy)}`], after: minusMinus(coef, dx) ? undefined : minusMinus(dy) },
    { say: `**Step 4.** Divide. $${vx}$ is $D_${vx}$ divided by $D$.`, math: [`${vx} = \\frac{D_${vx}}{D} = \\frac{${w(Dx)}}{${w(D)}} = ${w(x)}`] },
    {
      say: `And $${vy}$ is $D_${vy}$ divided by $D$. So the answer is:`,
      math: [`${vy} = \\frac{D_${vy}}{D} = \\frac{${w(Dy)}}{${w(D)}} = ${w(y)}`],
      after: `${meta.meaning ? `${meta.meaning} ` : ''}Always check by putting the answers back into the first equation: ${checkLine(E[0], [x, y])}.`,
      end: true,
    },
  ];
  const board: MatsBoard = {
    kind: 'mats',
    terms: [
      detTerm(coef, '$D =$', [], { at: 0, until: 2 }),
      detTerm(dx, `$D_${vx} =$`, [{ type: 'col', j: 0, at: 2, hl: 2, tone: 'a' }], { at: 2, until: 3 }),
      detTerm(dy, `$D_${vy} =$`, [{ type: 'col', j: 1, at: 3, hl: 3, tone: 'a' }], { at: 3, until: 4 }),
      detTerm(coef, '$D =$', [], { at: 4 }),
    ],
  };
  const dxWrong = swapCol(coef, h, 1);
  const cps = [
    numCp('D', '$D$', `$D$ (from the numbers in front of $${vx}$ and $${vy}$)`, D, 1, { slips: [[add(mul(coef[0][0], coef[1][1]), mul(coef[0][1], coef[1][0])), 'The two products were added. A determinant **takes away** the second product: (top-left × bottom-right) − (top-right × bottom-left).'], [neg(D), 'The subtraction was done the wrong way round: it is always the first product minus the second.']] }),
    numCp('Dx', `$D_${vx}$`, `$D_${vx}$ (answers in place of the ${vx}-numbers)`, Dx, 2, { slips: [[det(dxWrong), `The ${vy}-numbers were swapped out. For $D_${vx}$, put the answers in the **${vx}-column** (first column).`], [neg(Dx), 'Sign slip: it is the first product minus the second, not the other way round.']] }),
    numCp('Dy', `$D_${vy}$`, `$D_${vy}$ (answers in place of the ${vy}-numbers)`, Dy, 3, { slips: [[Dx, `That is $D_${vx}$. For $D_${vy}$, put the answers in the **${vy}-column** instead.`], [neg(Dy), 'Sign slip: it is the first product minus the second, not the other way round.']] }),
    numCp('x', `$${vx}$`, `Value of $${vx}$`, x, 4, { slips: [[isZero(Dx) ? 1 : div(D, Dx), `That is $D \\div D_${vx}$, upside down. $${vx} = D_${vx} \\div D$.`]] }),
    numCp('y', `$${vy}$`, `Value of $${vy}$`, y, 5, { slips: [[isZero(Dy) ? 1 : div(D, Dy), `Upside down: $${vy} = D_${vy} \\div D$.`]] }),
  ];
  return q(meta, `Solve by determinants (Cramer's rule): $${eqText(eqs[0], vars)}$ and $${eqText(eqs[1], vars)}$.`, undefined, cps, { board, steps });
}

function checkLine(row: Frac[], vals: Frac[]): string {
  const lhs = row.slice(0, -1).reduce((s, c, i) => add(s, mul(c, vals[i])), F(0));
  const terms = row
    .slice(0, -1)
    .map((c, i) => [F(c), vals[i]] as const)
    .filter(([c]) => !isZero(c))
    .map(([c, v], k) => {
      const mag = c.n < 0 ? neg(c) : c;
      const body = eq(mag, 1) ? pw(v) : `${w(mag)} \\times ${pw(v)}`;
      return k === 0 ? `${c.n < 0 ? '-' : ''}${body}` : ` ${c.n < 0 ? '-' : '+'} ${body}`;
    })
    .join('');
  return `$${terms} = ${w(lhs)}$ ✓`;
}

/** A pair (or triple) with D = 0: Cramer's rule cannot give a unique solution. */
export function singularQ(meta: Meta, eqs: Num[][], vars: string[]): PaperQuestion {
  const E = M(eqs);
  const n = E.length;
  const coef = E.map((r) => r.slice(0, n));
  const D = det(coef);
  if (!isZero(D)) throw new Error(`${meta.id}: D is not 0`);
  const steps: Step[] = [
    { say: 'Start by making $D$ from the numbers in front of the unknowns, and work it out. (The book advises doing this first whenever you are not sure an answer exists.)', math: [`D = ${texMat(coef, 'det')} = ${n === 2 ? det2Work(coef) : '\\ldots'} = 0`] },
    {
      say: 'Cramer\'s rule finishes by dividing by $D$, and you cannot divide by 0. So these equations have **no single answer** (no unique solution). So the answer is: **No**.',
      after: n === 2 ? 'Look closely: one equation is just the other one multiplied by a number. They are really the same fact twice, so there is not enough information for one answer.' : 'One equation can be made from the others, so there is not enough information for one answer.',
      end: true,
    },
  ];
  return q(
    meta,
    `Can these equations be solved uniquely by Cramer's rule? ${E.map((r) => `$${eqText(r, vars)}$`).join(', ')}`,
    undefined,
    [
      numCp('D', '$D$', '$D$ (from the numbers in front of the letters)', D, 0),
      choiceCp('u', 'Unique solution?', 'Is there a unique solution?', ['Yes', 'No'], 'No', 1, [['Yes', 'With $D = 0$, Cramer\'s rule divides by zero: no unique solution.']]),
    ],
    { steps },
  );
}

// ---------------------------------------------------------------------------------------------
// 3 × 3 determinant: first-row expansion with minors


export function det3Q(meta: Meta, m: Num[][], name = 'D'): PaperQuestion {
  const A = M(m);
  const minors = [0, 1, 2].map((j) => minorMat(A, 0, j));
  const mins = minors.map((x) => det(x));
  const D = det(A);
  const steps: Step[] = [
    { say: 'A 3 × 3 determinant is broken into three small 2 × 2 ones. We use the three numbers in the **top row**, one at a time. For each, cover up its row and its column; the four numbers left form a small 2 × 2 determinant (called its **minor**).', after: 'At the end the three parts are combined with the signs **plus, minus, plus**.' },
  ];
  for (let j = 0; j < 3; j++) {
    steps.push({
      say: `${['First', 'Second', 'Third'][j]} top-row number: ${w(A[0][j])}. Cover the top row and column ${j + 1}. Work out the 2 × 2 that is left (top-left × bottom-right, minus top-right × bottom-left).`,
      math: [`${texMat(minors[j], 'det')} = ${det2Work(minors[j])} = ${w(mins[j])}`],
    });
  }
  const midNeg = F(mul(A[0][1], mins[1])).n < 0;
  steps.push({
    say: 'Multiply each top-row number by its minor, then combine with **plus, minus, plus** (the middle one is taken away). So the answer is:',
    math: [`${name} = ${expandWork(m)} = ${w(D)}`],
    after: [midNeg ? `The middle part is $${pw(A[0][1])} \\times ${pw(mins[1])} = ${w(mul(A[0][1], mins[1]))}$, and taking away a minus number adds it.` : '', meta.meaning ?? ''].filter(Boolean).join(' ') || undefined,
    end: true,
  });

  const board: MatsBoard = {
    kind: 'mats',
    terms: [
      detTerm(m, `$${name} =$`, [
        { type: 'row', i: 0, at: 0, hl: 0, until: 4 },
        ...[0, 1, 2].flatMap((j): Mark[] => [
          { type: 'cell', i: 0, j, at: j + 1, hl: j + 1, until: j + 2, tone: 'b' },
          { type: 'strike-col', j, i: 0, at: j + 1, until: j + 2 },
        ]),
      ]),
    ],
  };
  const plusAll = [0, 1, 2].reduce((s, j) => add(s, mul(A[0][j], mins[j])), F(0));
  const cps = [
    numCp('m11', 'First small 2 × 2', `The 2 × 2 left when you cover the row and column of ${w(A[0][0])} (the first top-row number)`, mins[0], 1, { slips: [[neg(mins[0]), 'Sign slip in the 2 × 2: it is (top-left × bottom-right) − (top-right × bottom-left).']] }),
    numCp('m12', 'Second small 2 × 2', `The 2 × 2 left when you cover the row and column of ${w(A[0][1])} (the second top-row number)`, mins[1], 2, { slips: [[det(minorMat(A, 0, 0)), 'That is the first one again. This time cover column 2 (the column of the second number).']] }),
    numCp('m13', 'Third small 2 × 2', `The 2 × 2 left when you cover the row and column of ${w(A[0][2])} (the third top-row number)`, mins[2], 3),
    numCp('d', `$${name}$`, `Value of $${name}$`, D, 4, {
      slips: [
        [plusAll, 'All three terms were added. The signs go $+, -, +$: subtract the middle term.'],
        [neg(D), 'Every sign is reversed. The first term is $+$.'],
      ],
    }),
  ];
  return q(meta, `Evaluate $${name} = ${texMat(m, 'det')}$.`, undefined, cps, { board, steps });
}

/** The cofactor of element (i, j) of a 3 × 3 determinant. */
export function cofactorQ(meta: Meta, m: Num[][], i: number, j: number): PaperQuestion {
  const A = M(m);
  const mi = minorMat(A, i, j);
  const minor = det(mi);
  const odd = (i + j + 2) % 2 === 1;
  const cof = odd ? neg(minor) : minor;
  const steps: Step[] = [
    { say: `Cover row ${i + 1} and column ${j + 1} (the row and column that ${w(A[i][j])} sits in). The four numbers left make a 2 × 2 determinant: that is the **minor**. Work it out.`, math: [`M_{${i + 1}${j + 1}} = ${texMat(mi, 'det')} = ${det2Work(mi)} = ${w(minor)}`] },
    { say: `The **cofactor** is the minor with a sign. Add the row number and column number: $${i + 1} + ${j + 1} = ${i + j + 2}$. ${odd ? 'That is odd, so **change the sign** of the minor.' : 'That is even, so the sign **stays the same**.'}`, math: ['\\det{+ & - & + \\\\ - & + & - \\\\ + & - & +}'], after: 'The chessboard of signs shows the same thing: start with + in the top-left corner and alternate.' },
    { say: 'So the answer is:', math: [`C_{${i + 1}${j + 1}} = ${odd ? `-(${w(minor)})` : w(minor)} = ${w(cof)}`], end: true },
  ];
  const board: MatsBoard = {
    kind: 'mats',
    terms: [detTerm(m, '', [
      { type: 'cell', i, j, at: 0, hl: 0 },
      { type: 'strike-row', i, j, at: 0 },
      { type: 'strike-col', j, i, at: 0 },
    ])],
  };
  return q(
    meta,
    `In $${texMat(m, 'det')}$, find the minor and the cofactor of the element ${w(A[i][j])} (row ${i + 1}, column ${j + 1}).`,
    undefined,
    [
      numCp('min', 'Minor', `The minor of ${w(A[i][j])} (cover row ${i + 1} and column ${j + 1})`, minor, 0),
      numCp('cof', 'Cofactor', `The cofactor of ${w(A[i][j])} (the minor with its sign)`, cof, 2, { slips: odd ? [[minor, `Row ${i + 1} + column ${j + 1} is odd, so the cofactor is $-1 \\times$ the minor.`]] : [[neg(minor), `Row ${i + 1} + column ${j + 1} is even, so the cofactor equals the minor.`]] }),
    ],
    { board, steps },
  );
}

// ---------------------------------------------------------------------------------------------
// Cramer's rule, 3 unknowns

export function cramer3Q(meta: Meta, eqs: Num[][], vars: [string, string, string] = ['x', 'y', 'z']): PaperQuestion {
  const E = M(eqs);
  const coef = E.map((r) => r.slice(0, 3));
  const h = E.map((r) => r[3]);
  const D = det(coef);
  if (isZero(D)) throw new Error(`${meta.id}: D = 0`);
  const Ds = [0, 1, 2].map((c) => det(swapCol(coef, h, c)));
  const sol = Ds.map((d) => div(d, D));
  const expand = expandWork;
  const steps: Step[] = [
    {
      say: meta.setup
        ? `${meta.setup} Written neatly, with ${vars.join(', ')} in the same order and the answers on the right (a missing letter counts as 0):`
        : `Write the three equations neatly, with ${vars.join(', ')} in the same order in each and the answers on the right. A missing letter counts as 0.`,
      math: E.map((r) => eqText(r, vars)),
    },
    { say: '**Step 1. Make $D$** from the numbers in front of the letters, and work it out: each top-row number times its little 2 × 2 (minor), combined **plus, minus, plus**.', math: [`D = ${texMat(coef, 'det')}`, `= ${expand(coef)} = ${w(D)}`] },
    ...[0, 1, 2].map((c): Step => {
      const dm = swapCol(coef, h, c);
      return { say: `**Step ${c + 2}. Make $D_${vars[c]}$.** Start from $D$ and swap the **${vars[c]}-column** for the answers. Work it out the same way.`, math: [`D_${vars[c]} = ${texMat(dm, 'det')}`, `= ${expand(dm)} = ${w(Ds[c])}`] };
    }),
    {
      say: '**Step 5.** Divide each one by $D$. So the answer is:',
      math: [vars.map((v, c) => `${v} = \\frac{${w(Ds[c])}}{${w(D)}} = ${w(sol[c])}`).join(',\\quad ')],
      after: [meta.meaning ?? '', sol.every((x) => x.d === 1) ? `Check in the first equation: ${checkLine(E[0], sol)}.` : ''].filter(Boolean).join(' ') || undefined,
      end: true,
    },
  ];
  const board: MatsBoard = {
    kind: 'mats',
    terms: [detTerm(coef, '$D =$', [], { at: 0, until: 2 }), ...[0, 1, 2].map((c) => detTerm(swapCol(coef, h, c), `$D_${vars[c]} =$`, [{ type: 'col', j: c, at: c + 2, hl: c + 2 }], { at: c + 2, until: c + 3 })), detTerm(coef, '$D =$', [], { at: 5 })],
  };
  const solDp = Math.max(...sol.map(dpFor));
  const cps = [
    numCp('D', '$D$', '$D$ (from the numbers in front of the letters)', D, 1, { slips: [[[0, 1, 2].reduce((s, j) => add(s, mul(coef[0][j], det(minorMat(coef, 0, j)))), F(0)), 'All three parts were added. The middle part is **taken away**: plus, minus, plus.']] }),
    numCp('Dx', `$D_${vars[0]}$`, `$D_${vars[0]}$ (answers in place of the ${vars[0]}-column)`, Ds[0], 2),
    numCp('Dy', `$D_${vars[1]}$`, `$D_${vars[1]}$ (answers in place of the ${vars[1]}-column)`, Ds[1], 3, { slips: [[Ds[0], `That is $D_${vars[0]}$. This time put the answers in the ${vars[1]}-column.`]] }),
    numCp('Dz', `$D_${vars[2]}$`, `$D_${vars[2]}$ (answers in place of the ${vars[2]}-column)`, Ds[2], 4),
    matCp('sol', `$(${vars.join(', ')})$`, `The solution, as $(${vars.join(', ')})$`, [sol], 5, {
      dp: solDp,
      slips: Ds.every((d) => !isZero(d)) ? [[[Ds.map((d) => div(D, d))], 'Upside down: each unknown is its own determinant divided by $D$.']] : [],
    }),
  ];
  return q(meta, `Solve by determinants: ${E.map((r) => `$${eqText(r, vars)}$`).join(', ')}.`, undefined, cps, { board, steps });
}

// ---------------------------------------------------------------------------------------------
// Properties: the value of a changed determinant, given the original

export type PropKind = 'transpose' | 'swap' | 'factor' | 'addMultiple' | 'zeroRow' | 'equalRows';

export const PROP_TEXT: Record<PropKind, string> = {
  transpose: 'Property 1: turning rows into columns (and columns into rows) does **not** change the value.',
  swap: 'Property 2: swapping two rows only **flips the sign** of the value (plus becomes minus, minus becomes plus).',
  factor: 'Property 4: if every number in one row is multiplied by a number, the whole value is multiplied by that number (and the other way round: a common number can be taken outside).',
  addMultiple: 'Property 3: adding a multiple of one row to another row does **not** change the value.',
  zeroRow: 'Property 5: if a whole row is zeros, the value is 0.',
  equalRows: 'Property 6: if two rows are the same (or one is a multiple of the other), the value is 0.',
};

export function propQ(meta: Meta, base: Num[][], kind: PropKind, k = 2): PaperQuestion {
  const A = M(base);
  const D = det(A);
  let B: Frac[][];
  switch (kind) {
    case 'transpose':
      B = A[0].map((_, j) => A.map((r) => r[j]));
      break;
    case 'swap':
      B = [A[1], A[0], ...A.slice(2)];
      break;
    case 'factor':
      B = A.map((r, i) => (i === 1 ? r.map((x) => mul(x, k)) : r));
      break;
    case 'addMultiple':
      B = A.map((r, i) => (i === 0 ? r.map((x, j) => add(x, mul(k, A[1][j]))) : r));
      break;
    case 'zeroRow':
      B = A.map((r, i) => (i === A.length - 1 ? r.map(() => F(0)) : r));
      break;
    case 'equalRows':
      B = A.map((r, i) => (i === A.length - 1 ? A[0].map((x) => mul(x, k)) : r));
      break;
  }
  const value = det(B);
  const rule: Record<PropKind, string> = {
    transpose: `What changed: the rows of the new one are the columns of the old one. ${PROP_TEXT.transpose}`,
    swap: `What changed: rows 1 and 2 have swapped places. ${PROP_TEXT.swap}`,
    factor: `What changed: every number in row 2 has been multiplied by ${w(k)}. ${PROP_TEXT.factor} So the value is multiplied by ${w(k)}.`,
    addMultiple: `What changed: row 1 is now (row 1) + ${w(k)} × (row 2). ${PROP_TEXT.addMultiple}`,
    zeroRow: `What changed: the last row is all zeros. ${PROP_TEXT.zeroRow}`,
    equalRows: `What changed: the last row is ${eq(k, 1) ? 'exactly the same as' : `${w(k)} times`} row 1. ${PROP_TEXT.equalRows}`,
  };
  const calc: Record<PropKind, string> = {
    transpose: `${w(D)}`,
    swap: `-1 \\times ${pw(D)} = ${w(value)}`,
    factor: `${w(k)} \\times ${pw(D)} = ${w(value)}`,
    addMultiple: `${w(D)}`,
    zeroRow: '0',
    equalRows: '0',
  };
  const wrong: [Num, string][] =
    kind === 'swap'
      ? [[D, 'Swapping two rows changes the sign (property 2).']]
      : kind === 'factor'
        ? [[D, 'Multiplying one row by $k$ multiplies the whole determinant by $k$.'], [mul(D, mul(k, k)), 'Only one row was multiplied, so multiply the value by $k$ once.']]
        : kind === 'addMultiple'
          ? [[add(D, mul(k, D)), 'Adding a multiple of another row leaves the value unchanged (property 3).']]
          : kind === 'transpose'
            ? [[neg(D), 'Transposing does not change the sign (property 1).']]
            : [[D, 'Look at the new rows: the value is forced to 0.']];
  const steps: Step[] = [
    { say: 'You do not need to work anything out from scratch. Compare the new determinant with the one you already know, row by row, and spot what changed.' },
    { say: rule[kind] },
    { say: 'So the answer is:', math: [`\\text{new value} = ${calc[kind]}`], end: true },
  ];
  return q(
    meta,
    `Given $${texMat(base, 'det')} = ${w(D)}$, find without expanding: $${texMat(B, 'det')}$.`,
    undefined,
    [
      choiceCp('p', 'Property', 'Which property applies?', ['Value unchanged', 'Value changes sign', 'Value multiplied by a factor', 'Value is 0'].sort(), kind === 'transpose' || kind === 'addMultiple' ? 'Value unchanged' : kind === 'swap' ? 'Value changes sign' : kind === 'factor' ? 'Value multiplied by a factor' : 'Value is 0', 1),
      numCp('v', 'Value', 'Value of the new determinant', value, 2, { slips: wrong }),
    ],
    { steps },
  );
}


// ---------------------------------------------------------------------------------------------
// Evaluating by row operations (as the book does for the ONGC example): take out common factors
// (property 4), expand along a row or column with a single non-zero element (property 8), or
// create zeros with property 3 first; repeat down to 2 × 2.

const rowName = (i: number) => `R_${i + 1}`;
const listWords = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const gcdN = (a: number, b: number): number => (b ? gcdN(b, a % b) : Math.abs(a));
const absF = (x: Frac) => (x.n < 0 ? neg(x) : x);

export function opsSteps(A0: Num[][]): { steps: Step[]; value: Frac; last2: Frac | null } {
  let A = M(A0);
  let factor = F(1);
  const steps: Step[] = [];
  const show = () => `D = ${eq(factor, 1) ? '' : `${w(factor)} \\times `}${texMat(A, 'det')}`;

  // Clear fractions: multiply a row by its denominators' LCM and divide D by the same.
  const clears: string[] = [];
  const clearWords: string[] = [];
  let grow = 1;
  A = A.map((r, i) => {
    const l = r.reduce((m, x) => (m * x.d) / gcdN(m, x.d), 1);
    if (l === 1) return r;
    factor = div(factor, l);
    grow *= l;
    clears.push(`${rowName(i)} \\times ${l}`);
    clearWords.push(`row ${i + 1} by ${l}`);
    return r.map((x) => mul(x, l));
  });
  if (clears.length)
    steps.push({
      say: `Fractions and decimals are awkward, so turn them into whole numbers: multiply ${listWords(clearWords)}. That makes the value ${grow} times bigger (property 4), so put $${w(div(1, grow))}$ outside to keep it the same.`,
      math: [clears.join(',\\quad '), show()],
    });

  while (A.length > 2) {
    const n = A.length;
    // Common factors of rows, then of columns (property 4).
    const outs: string[] = [];
    const before = factor;
    A = A.map((r, i) => {
      const g = r.reduce((m, x) => gcdN(m, x.n), 0);
      if (r.some((x) => x.d !== 1) || g <= 1) return r;
      factor = mul(factor, g);
      outs.push(`\\text{${g} out of row ${i + 1}}`);
      return r.map((x) => div(x, g));
    });
    for (let j = 0; j < n; j++) {
      const col = A.map((r) => r[j]);
      const g = col.reduce((m, x) => gcdN(m, x.n), 0);
      if (col.some((x) => x.d !== 1) || g <= 1) continue;
      factor = mul(factor, g);
      outs.push(`\\text{${g} out of column ${j + 1}}`);
      A = A.map((r) => r.map((x, jj) => (jj === j ? div(x, g) : x)));
    }
    if (outs.length)
      steps.push({
        say: `Make the numbers smaller: when every number in a row (or column) can be divided by the same number, take that number outside (property 4). It multiplies the answer at the end.${eq(before, 1) ? '' : ` The number outside becomes ${pw(before)} × ${w(div(factor, before))} = ${w(factor)}.`}`,
        math: [outs.join(',\\quad '), show()],
      });

    // A line with a single non-zero element: expand along it directly (property 8).
    let line: { r: number; c: number; row: boolean } | null = null;
    for (let i = 0; i < n && !line; i++) {
      const nz = A[i].map((x, j) => (isZero(x) ? -1 : j)).filter((j) => j >= 0);
      if (nz.length === 1) line = { r: i, c: nz[0], row: true };
    }
    for (let j = 0; j < n && !line; j++) {
      const nz = A.map((r, i) => (isZero(r[j]) ? -1 : i)).filter((i) => i >= 0);
      if (nz.length === 1) line = { r: nz[0], c: j, row: false };
    }
    if (!line) {
      // Pick a pivot: ±1 (column 1 first), else the smallest non-zero in column 1.
      let pr = -1;
      let pc = 0;
      for (let j = 0; j < n && pr < 0; j++)
        for (let i = 0; i < n; i++)
          if (eq(absF(A[i][j]), 1)) {
            pr = i;
            pc = j;
            break;
          }
      if (pr < 0) {
        const cands = A.map((r, i) => ({ i, v: r[0] })).filter((x) => !isZero(x.v));
        if (!cands.length) {
          steps.push({ say: 'Column 1 is all zeros, so the determinant is 0 (property 5).', end: false });
          return { steps, value: F(0), last2: null };
        }
        cands.sort((a, b) => cmpAbs(a.v, b.v));
        pr = cands[0].i;
      }
      const piv = A[pr][pc];
      const ops: string[] = [];
      let first = '';
      A = A.map((r, i) => {
        if (i === pr || isZero(r[pc])) return r;
        const k = div(r[pc], piv);
        const times = eq(absF(k), 1) ? '' : `${w(absF(k))}`;
        ops.push(`${rowName(i)} \\to ${rowName(i)} ${k.n < 0 ? '+' : '-'} ${times}${rowName(pr)}`);
        if (!first) first = `$${ops[0]}$ means: new row ${i + 1} = row ${i + 1} ${k.n < 0 ? 'plus' : 'minus'} ${times ? `${times} × ` : ''}row ${pr + 1}, number by number.`;
        return r.map((x, j) => sub(x, mul(k, A[pr][j])));
      });
      steps.push({
        say: `Now create zeros, because zeros make the work disappear. Use row ${pr + 1} (it has ${w(piv)} in column ${pc + 1}) and add or take away multiples of it from the other rows, so that the rest of column ${pc + 1} becomes 0. This does not change the value (property 3).`,
        math: [ops.join(',\\quad '), show()],
        after: first,
      });
      // A row (or column) of zeros: the value is 0 at once (property 5).
      const zr = A.findIndex((r) => r.every(isZero));
      const zc = A[0].findIndex((_, j) => A.every((r) => isZero(r[j])));
      if (zr >= 0 || zc >= 0) {
        steps.push({ say: `Look: ${zr >= 0 ? `row ${zr + 1}` : `column ${zc + 1}`} is now all zeros. A row (or column) of zeros makes the whole determinant 0 (property 5), so there is nothing more to work out.`, math: ['D = 0'] });
        return { steps, value: F(0), last2: null };
      }
      line = { r: pr, c: pc, row: false };
    }
    const { r, c, row } = line;
    const odd = (r + c) % 2 === 1;
    const el = A[r][c];
    const minor = minorMat(A, r, c);
    const prev = factor;
    factor = mul(factor, mul(odd ? -1 : 1, el));
    A = minor;
    steps.push({
      say: `Now ${row ? `row ${r + 1}` : `column ${c + 1}`} has only one number that is not 0: ${w(el)}. So the determinant is just ${w(el)} times the smaller determinant left when you cover its row and column (property 8). Sign: row ${r + 1} + column ${c + 1} = ${r + c + 2}, which is ${odd ? 'odd, so change the sign' : 'even, so the sign stays'}.${eq(prev, factor) ? '' : ` The number outside becomes ${eq(prev, 1) ? '' : `${pw(prev)} × `}${pw(el)}${odd ? ' × (−1)' : ''} = ${w(factor)}.`}`,
      math: [show()],
    });
  }
  const d2 = det(A);
  const value = mul(factor, d2);
  steps.push({ say: 'Only a 2 × 2 is left. Work it out (top-left × bottom-right, minus top-right × bottom-left), then multiply by everything collected outside.', math: [`${texMat(A, 'det')} = ${det2Work(A)} = ${w(d2)}`, `D = ${pw(factor)} \\times ${pw(d2)} = ${w(value)}`] });
  return { steps, value, last2: d2 };
}

const cmpAbs = (a: Frac, b: Frac) => Math.abs(a.n / a.d) - Math.abs(b.n / b.d);

/** Evaluate a determinant (any order) using the properties, step by step. */
export function byOpsQ(meta: Meta, m: Num[][], name = 'D'): PaperQuestion {
  const { steps, value, last2: twoVal } = opsSteps(m);
  const all: Step[] = [
    { say: `Working out a ${m.length} × ${m.length} directly is long. Instead we use the properties to shrink it step by step: take out common numbers, make zeros, and cut the size down until only a 2 × 2 is left.` },
    ...steps.map((s) => ({ ...s, math: s.math?.map((x) => x.replace(/^D =/, `${name} =`)) })),
  ];
  all[all.length - 1] = { ...all[all.length - 1], say: `${all[all.length - 1].say} So the answer is:`, end: true, after: meta.meaning };
  const cps: Checkpoint[] = [];
  if (twoVal) cps.push(numCp('two', 'Last 2 × 2', 'Value of the last $2 \\times 2$ determinant', twoVal, all.length - 1));
  cps.push(numCp('d', `$${name}$`, `Value of $${name}$`, value, all.length - 1, { slips: [[neg(value), 'A sign was lost: check each cofactor sign (odd row + column means multiply by −1).']] }));
  return q(meta, `Evaluate $${name} = ${texMat(m, 'det')}$ using the properties of determinants.`, undefined, cps, { steps: all });
}
