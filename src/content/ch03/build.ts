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
  return `${pw(m[0][0])} \\times ${pw(m[1][1])} - ${pw(m[0][1])} \\times ${pw(m[1][0])}`;
}

// ---------------------------------------------------------------------------------------------
// 2 × 2 determinant

export function det2Q(meta: Meta, m: Num[][], name = 'D'): PaperQuestion {
  const [[a, b], [c, d]] = M(m);
  const ad = mul(a, d);
  const bc = mul(b, c);
  const D = sub(ad, bc);
  const steps: Step[] = [
    { say: 'A second-order determinant is the product of the **leading diagonal** (top left × bottom right) minus the product of the **other diagonal**.', math: [`\\det{a & b \\\\ c & d} = ad - bc`] },
    { say: 'Leading diagonal:', math: [`${pw(a)} \\times ${pw(d)} = ${w(ad)}`] },
    { say: 'Other diagonal:', math: [`${pw(b)} \\times ${pw(c)} = ${w(bc)}`] },
    { say: 'Subtract the second product from the first. So the answer is:', math: [`${name} = ${pw(ad)} - ${pw(bc)} = ${w(D)}`], after: meta.meaning, end: true },
  ];
  const board: MatsBoard = {
    kind: 'mats',
    terms: [detTerm(m, `$${name} =$`, [
      { type: 'diag', at: 1 },
      { type: 'anti', at: 2 },
    ])],
  };
  const cps = [
    numCp('ad', '$ad$', 'Product of the leading diagonal, $ad$', ad, 1, { slips: [[mul(a, b), 'That multiplies along the top row. The leading diagonal is top left × bottom right.']] }),
    numCp('bc', '$bc$', 'Product of the other diagonal, $bc$', bc, 2),
    numCp('d', `$${name}$`, `Value of $${name}$`, D, 3, {
      slips: [
        [add(ad, bc), 'The two products were added. A determinant **subtracts** the second diagonal: $ad - bc$.'],
        [sub(bc, ad), 'That is $bc - ad$: the subtraction is the wrong way round, so the sign flips.'],
        [sub(mul(a, b), mul(c, d)), 'Those are row products. Multiply along the diagonals.'],
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
    { say: 'Write the equations in the standard form $a_1x + b_1y = h_1$, $a_2x + b_2y = h_2$, and take the coefficients of the unknowns as the determinant $D$.', math: [eqText(eqs[0], vars), eqText(eqs[1], vars)] },
    { say: 'The denominator $D$: coefficients only.', math: [`D = ${texMat(coef, 'det')} = ${det2Work(coef)} = ${w(D)}`] },
    { say: `For $D_${vx}$, replace the **${vx}-column** with the right-hand sides.`, math: [`D_${vx} = ${texMat(dx, 'det')} = ${det2Work(dx)} = ${w(Dx)}`] },
    { say: `For $D_${vy}$, replace the **${vy}-column** with the right-hand sides.`, math: [`D_${vy} = ${texMat(dy, 'det')} = ${det2Work(dy)} = ${w(Dy)}`] },
    { say: `Divide each numerator by $D$.`, math: [`${vx} = \\frac{D_${vx}}{D} = \\frac{${w(Dx)}}{${w(D)}} = ${w(x)}`] },
    {
      say: 'And the second unknown. So the answer is:',
      math: [`${vy} = \\frac{D_${vy}}{D} = \\frac{${w(Dy)}}{${w(D)}} = ${w(y)}`],
      after: `${meta.meaning ? `${meta.meaning} ` : ''}Check in the first equation: ${checkLine(E[0], [x, y])}.`,
      end: true,
    },
  ];
  const board: MatsBoard = {
    kind: 'mats',
    terms: [
      detTerm(coef, '$D =$', [], { at: 1 }),
      detTerm(dx, `$D_${vx} =$`, [{ type: 'col', j: 0, at: 2, hl: 2, tone: 'a' }], { at: 2 }),
      detTerm(dy, `$D_${vy} =$`, [{ type: 'col', j: 1, at: 3, hl: 3, tone: 'a' }], { at: 3 }),
    ],
  };
  const dxWrong = swapCol(coef, h, 1);
  const cps = [
    numCp('D', '$D$', 'The determinant of the coefficients, $D$', D, 1, { slips: [[add(mul(coef[0][0], coef[1][1]), mul(coef[0][1], coef[1][0])), 'The cross products were added. $D = a_1b_2 - a_2b_1$.'], [neg(D), 'The subtraction was done the wrong way round.']] }),
    numCp('Dx', `$D_${vx}$`, `The determinant $D_${vx}$`, Dx, 2, { slips: [[det(dxWrong), `The ${vy}-column was replaced. For $D_${vx}$ replace the ${vx}-column.`], [neg(Dx), 'Sign slip: subtract the second diagonal product from the first.']] }),
    numCp('Dy', `$D_${vy}$`, `The determinant $D_${vy}$`, Dy, 3, { slips: [[Dx, `That is $D_${vx}$. For $D_${vy}$ replace the ${vy}-column.`], [neg(Dy), 'Sign slip: subtract the second diagonal product from the first.']] }),
    numCp('x', `$${vx}$`, `Value of $${vx}$`, x, 4, { slips: [[isZero(Dx) ? 1 : div(D, Dx), `That is $D / D_${vx}$, upside down. $${vx} = D_${vx} / D$.`]] }),
    numCp('y', `$${vy}$`, `Value of $${vy}$`, y, 5, { slips: [[isZero(Dy) ? 1 : div(D, Dy), `Upside down: $${vy} = D_${vy} / D$.`]] }),
  ];
  return q(meta, `Solve by determinants (Cramer's rule): $${eqText(eqs[0], vars)}$ and $${eqText(eqs[1], vars)}$.`, undefined, cps, { board, steps });
}

function checkLine(row: Frac[], vals: Frac[]): string {
  const lhs = row.slice(0, -1).reduce((s, c, i) => add(s, mul(c, vals[i])), F(0));
  return `$${row.slice(0, -1).map((c, i) => `${pw(c)}(${w(vals[i])})`).join(' + ')} = ${w(lhs)}$ ✓`;
}

/** A pair (or triple) with D = 0: Cramer's rule cannot give a unique solution. */
export function singularQ(meta: Meta, eqs: Num[][], vars: string[]): PaperQuestion {
  const E = M(eqs);
  const n = E.length;
  const coef = E.map((r) => r.slice(0, n));
  const D = det(coef);
  if (!isZero(D)) throw new Error(`${meta.id}: D is not 0`);
  const steps: Step[] = [
    { say: 'Write the coefficient determinant $D$ and evaluate it first, as the book advises when it is unclear whether a unique solution exists.', math: [`D = ${texMat(coef, 'det')} = ${n === 2 ? det2Work(coef) : '\\ldots'} = 0`] },
    {
      say: 'Every unknown would be $\\frac{\\text{something}}{0}$. Division by zero is impossible, so the equations have **no unique solution**: either no solution at all or infinitely many. So the answer is: **No**.',
      after: n === 2 ? `Look at the rows: one is a multiple of the other (property 6), which is why $D = 0$.` : undefined,
      end: true,
    },
  ];
  return q(
    meta,
    `Can these equations be solved uniquely by Cramer's rule? ${E.map((r) => `$${eqText(r, vars)}$`).join(', ')}`,
    undefined,
    [
      numCp('D', '$D$', 'The determinant of the coefficients, $D$', D, 0),
      choiceCp('u', 'Unique solution?', 'Is there a unique solution?', ['Yes', 'No'], 'No', 1, [['Yes', 'With $D = 0$, Cramer\'s rule divides by zero: no unique solution.']]),
    ],
    { steps },
  );
}

// ---------------------------------------------------------------------------------------------
// 3 × 3 determinant: first-row expansion with minors

const SIGNS = ['+', '-', '+'];

export function det3Q(meta: Meta, m: Num[][], name = 'D'): PaperQuestion {
  const A = M(m);
  const minors = [0, 1, 2].map((j) => minorMat(A, 0, j));
  const mins = minors.map((x) => det(x));
  const D = det(A);
  const steps: Step[] = [
    { say: 'Expand along the **first row**. Each element is multiplied by its **minor** (the 2 × 2 determinant left after deleting its row and column), with signs $+, -, +$.', math: [`${name} = a_1 \\det{b_2 & c_2 \\\\ b_3 & c_3} - b_1 \\det{a_2 & c_2 \\\\ a_3 & c_3} + c_1 \\det{a_2 & b_2 \\\\ a_3 & b_3}`] },
  ];
  for (let j = 0; j < 3; j++) {
    steps.push({
      say: `Delete row 1 and column ${j + 1} to get the minor of ${w(A[0][j])}.`,
      math: [`M_{1${j + 1}} = ${texMat(minors[j], 'det')} = ${det2Work(minors[j])} = ${w(mins[j])}`],
    });
  }
  const terms = [0, 1, 2].map((j) => `${j === 0 ? '' : ` ${SIGNS[j]} `}${pw(A[0][j])}(${w(mins[j])})`).join('');
  steps.push({ say: 'Combine with the signs $+, -, +$. So the answer is:', math: [`${name} = ${terms} = ${w(D)}`], after: meta.meaning, end: true });

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
    numCp('m11', '$M_{11}$', 'The minor of the first element, $M_{11}$', mins[0], 1, { slips: [[neg(mins[0]), 'Sign slip in the 2 × 2 determinant: leading diagonal minus the other diagonal.']] }),
    numCp('m12', '$M_{12}$', 'The minor of the second element, $M_{12}$', mins[1], 2, { slips: [[det(minorMat(A, 0, 0)), 'That is $M_{11}$ again: delete column 2 for this minor.']] }),
    numCp('m13', '$M_{13}$', 'The minor of the third element, $M_{13}$', mins[2], 3),
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
    { say: `Delete row ${i + 1} and column ${j + 1} (the row and column of ${w(A[i][j])}). The determinant that is left is the **minor**.`, math: [`M_{${i + 1}${j + 1}} = ${texMat(mi, 'det')} = ${det2Work(mi)} = ${w(minor)}`] },
    { say: `The sign depends on $j + k = ${i + 1} + ${j + 1} = ${i + j + 2}$: ${odd ? 'odd, so multiply by $-1$' : 'even, so the sign stays'}.`, math: ['\\det{+ & - & + \\\\ - & + & - \\\\ + & - & +}'] },
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
      numCp('min', 'Minor', `The minor $M_{${i + 1}${j + 1}}$`, minor, 0),
      numCp('cof', 'Cofactor', `The cofactor $C_{${i + 1}${j + 1}}$`, cof, 2, { slips: odd ? [[minor, `Row ${i + 1} + column ${j + 1} is odd, so the cofactor is $-1 \\times$ the minor.`]] : [[neg(minor), `Row ${i + 1} + column ${j + 1} is even, so the cofactor equals the minor.`]] }),
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
  const expand = (a: Frac[][]) => {
    const mins = [0, 1, 2].map((j) => det(minorMat(a, 0, j)));
    return `${pw(a[0][0])}(${w(mins[0])}) - ${pw(a[0][1])}(${w(mins[1])}) + ${pw(a[0][2])}(${w(mins[2])})`;
  };
  const steps: Step[] = [
    { say: 'Standard form: unknowns in the same order in every equation. Take the coefficients as $D$.', math: E.map((r) => eqText(r, vars)) },
    { say: 'Evaluate $D$ by expanding along the first row (minors with signs $+, -, +$).', math: [`D = ${texMat(coef, 'det')}`, `= ${expand(coef)} = ${w(D)}`] },
    ...[0, 1, 2].map((c): Step => {
      const dm = swapCol(coef, h, c);
      return { say: `$D_${vars[c]}$: replace the ${vars[c]}-column with the right-hand sides, then expand.`, math: [`D_${vars[c]} = ${texMat(dm, 'det')}`, `= ${expand(dm)} = ${w(Ds[c])}`] };
    }),
    {
      say: 'Divide each by $D$. So the answer is:',
      math: [vars.map((v, c) => `${v} = \\frac{${w(Ds[c])}}{${w(D)}} = ${w(sol[c])}`).join(',\\quad ')],
      after: meta.meaning,
      end: true,
    },
  ];
  const board: MatsBoard = {
    kind: 'mats',
    terms: [detTerm(coef, '$D =$', [], { at: 1, until: 2 }), ...[0, 1, 2].map((c) => detTerm(swapCol(coef, h, c), `$D_${vars[c]} =$`, [{ type: 'col', j: c, at: c + 2, hl: c + 2 }], { at: c + 2, until: c + 3 }))],
  };
  const solDp = Math.max(...sol.map(dpFor));
  const cps = [
    numCp('D', '$D$', 'The determinant of the coefficients, $D$', D, 1, { slips: [[[0, 1, 2].reduce((s, j) => add(s, mul(coef[0][j], det(minorMat(coef, 0, j)))), F(0)), 'All three terms were added. The middle term is subtracted.']] }),
    numCp('Dx', `$D_${vars[0]}$`, `The determinant $D_${vars[0]}$`, Ds[0], 2),
    numCp('Dy', `$D_${vars[1]}$`, `The determinant $D_${vars[1]}$`, Ds[1], 3, { slips: [[Ds[0], `That is $D_${vars[0]}$. Replace the ${vars[1]}-column this time.`]] }),
    numCp('Dz', `$D_${vars[2]}$`, `The determinant $D_${vars[2]}$`, Ds[2], 4),
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
  transpose: 'Property 1: interchanging rows and columns does not change the value.',
  swap: 'Property 2: interchanging two rows multiplies the value by $-1$.',
  factor: 'Property 4: a common factor of a row can be taken outside the determinant.',
  addMultiple: 'Property 3: adding a multiple of one row to another does not change the value.',
  zeroRow: 'Property 5: a row of zeros makes the value 0.',
  equalRows: 'Property 6: two identical (or proportional) rows make the value 0.',
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
    transpose: `The rows of the new determinant are the columns of the first. ${PROP_TEXT.transpose}`,
    swap: `Rows 1 and 2 have been interchanged. ${PROP_TEXT.swap}`,
    factor: `Every element of row 2 has been multiplied by ${w(k)}. ${PROP_TEXT.factor} So the value is multiplied by ${w(k)}.`,
    addMultiple: `Row 1 has become $R_1 + ${w(k)}R_2$. ${PROP_TEXT.addMultiple}`,
    zeroRow: `The last row is all zeros. ${PROP_TEXT.zeroRow}`,
    equalRows: `The last row is ${eq(k, 1) ? 'the same as' : `${w(k)} times`} row 1. ${PROP_TEXT.equalRows}`,
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
    { say: 'Compare the new determinant with the one whose value you know, row by row.' },
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
const colName = (j: number) => `C_${j + 1}`;
const gcdN = (a: number, b: number): number => (b ? gcdN(b, a % b) : Math.abs(a));
const absF = (x: Frac) => (x.n < 0 ? neg(x) : x);

export function opsSteps(A0: Num[][]): { steps: Step[]; value: Frac; last2: Frac | null } {
  let A = M(A0);
  let factor = F(1);
  const steps: Step[] = [];
  const show = () => `D = ${eq(factor, 1) ? '' : `${w(factor)} \\times `}${texMat(A, 'det')}`;

  // Clear fractions: multiply a row by its denominators' LCM and divide D by the same.
  const clears: string[] = [];
  A = A.map((r, i) => {
    const l = r.reduce((m, x) => (m * x.d) / gcdN(m, x.d), 1);
    if (l === 1) return r;
    factor = div(factor, l);
    clears.push(`${rowName(i)} \\times ${l}`);
    return r.map((x) => mul(x, l));
  });
  if (clears.length) steps.push({ say: 'Clear the fractions: multiply the rows shown, and divide the determinant by the same numbers (property 4).', math: [clears.join(',\\quad '), show()] });

  while (A.length > 2) {
    const n = A.length;
    // Common factors of rows, then of columns (property 4).
    const outs: string[] = [];
    A = A.map((r, i) => {
      const g = r.reduce((m, x) => gcdN(m, x.n), 0);
      if (r.some((x) => x.d !== 1) || g <= 1) return r;
      factor = mul(factor, g);
      outs.push(`${g} \\text{ from } ${rowName(i)}`);
      return r.map((x) => div(x, g));
    });
    for (let j = 0; j < n; j++) {
      const col = A.map((r) => r[j]);
      const g = col.reduce((m, x) => gcdN(m, x.n), 0);
      if (col.some((x) => x.d !== 1) || g <= 1) continue;
      factor = mul(factor, g);
      outs.push(`${g} \\text{ from } ${colName(j)}`);
      A = A.map((r) => r.map((x, jj) => (jj === j ? div(x, g) : x)));
    }
    if (outs.length) steps.push({ say: `Take out the common factor${outs.length > 1 ? 's' : ''} (property 4).`, math: [outs.join(',\\quad '), show()] });

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
      A = A.map((r, i) => {
        if (i === pr || isZero(r[pc])) return r;
        const k = div(r[pc], piv);
        ops.push(`${rowName(i)} \\to ${rowName(i)} ${k.n < 0 ? '+' : '-'} ${eq(absF(k), 1) ? '' : w(absF(k))}${rowName(pr)}`);
        return r.map((x, j) => sub(x, mul(k, A[pr][j])));
      });
      steps.push({ say: `Use row ${pr + 1} to make the rest of column ${pc + 1} zero (property 3: the value does not change).`, math: [ops.join(',\\quad '), show()] });
      line = { r: pr, c: pc, row: false };
    }
    const { r, c, row } = line;
    const odd = (r + c) % 2 === 1;
    const el = A[r][c];
    const minor = minorMat(A, r, c);
    factor = mul(factor, mul(odd ? -1 : 1, el));
    A = minor;
    steps.push({
      say: `In ${row ? `row ${r + 1}` : `column ${c + 1}`} only ${w(el)} is non-zero. Expand along it (property 8): the value is ${w(el)} times its cofactor. Row ${r + 1} + column ${c + 1} = ${r + c + 2} is ${odd ? 'odd, so multiply by −1' : 'even, so the sign stays'}.`,
      math: [show()],
    });
  }
  const d2 = det(A);
  const value = mul(factor, d2);
  steps.push({ say: 'Evaluate the last 2 × 2 determinant.', math: [`${texMat(A, 'det')} = ${det2Work(A)} = ${w(d2)}`, `D = ${pw(factor)} \\times ${pw(d2)} = ${w(value)}`] });
  return { steps, value, last2: d2 };
}

const cmpAbs = (a: Frac, b: Frac) => Math.abs(a.n / a.d) - Math.abs(b.n / b.d);

/** Evaluate a determinant (any order) using the properties, step by step. */
export function byOpsQ(meta: Meta, m: Num[][], name = 'D'): PaperQuestion {
  const { steps, value, last2: twoVal } = opsSteps(m);
  const all: Step[] = [
    { say: `Look for a row or column with zeros, common factors, or a 1 that can be used to create zeros. Use the properties to make the work small rather than expanding ${m.length} × ${m.length} directly.` },
    ...steps.map((s) => ({ ...s, math: s.math?.map((x) => x.replace(/^D =/, `${name} =`)) })),
  ];
  all[all.length - 1] = { ...all[all.length - 1], say: `${all[all.length - 1].say} So the answer is:`, end: true, after: meta.meaning };
  const cps: Checkpoint[] = [];
  if (twoVal) cps.push(numCp('two', 'Last 2 × 2', 'Value of the last $2 \\times 2$ determinant', twoVal, all.length - 1));
  cps.push(numCp('d', `$${name}$`, `Value of $${name}$`, value, all.length - 1, { slips: [[neg(value), 'A sign was lost: check each cofactor sign (odd row + column means multiply by −1).']] }));
  return q(meta, `Evaluate $${name} = ${texMat(m, 'det')}$ using the properties of determinants.`, undefined, cps, { steps: all });
}
