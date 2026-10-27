// Unit 2 builders: each takes the data of a matrix question and computes everything shown —
// checkpoints, the step-by-step lesson, the board and the slips.

import { add, F, M, matAdd, matMul, matScale, mul, sub, transpose, type Num } from '../../core/num.ts';
import type { Lesson, MatsBoard, Mark, Step } from '../../teach/types.ts';
import { cellsOf, choiceCp, dpFor, matCp, numCp, pw, texMat, w, wn } from '../kit.ts';
import type { Checkpoint, Level, PaperQuestion, Source } from '../types.ts';

export interface Meta {
  id: string;
  topic: string;
  level: Level;
  source: Source;
  title: string;
  /** Question text before the data (markup). Default depends on the builder. */
  prompt?: string;
  /** A sentence after the answer giving its meaning in the story (markup). */
  meaning?: string;
  page?: number;
  bookNote?: string;
  gen?: { id: string; seed: number };
}

const ROW = ['first', 'second', 'third', 'fourth'];
const ROW_NAME = (i: number, rows: number) => (rows === 1 ? 'The row' : i === 0 ? 'Top row' : i === rows - 1 ? 'Bottom row' : `${cap(ROW[i] ?? `row ${i + 1}`)} row`);

/** A one-line reminder for the first sign trap in a list of (x op y) sums, if there is one. */
export function signHint(work: [Num, '+' | '-', Num][]): string | undefined {
  const neg = (x: Num) => F(x).n < 0;
  for (const [x, op, y] of work) {
    if (op === '-' && neg(y)) return `Taking away a minus number is the same as adding it: $${pw(x)} - ${pw(y)} = ${w(x)} + ${w(mul(y, -1))} = ${w(sub(x, y))}$.`;
    if (op === '+' && neg(y)) return `Adding a minus number is the same as taking it away: $${w(x)} + ${pw(y)} = ${w(x)} - ${w(mul(y, -1))} = ${w(add(x, y))}$.`;
    if (op === '-' && neg(sub(x, y))) return `Taking away a bigger number takes you below zero: $${pw(x)} - ${pw(y)} = ${w(sub(x, y))}$ (like spending more than you have).`;
  }
  return undefined;
}
const sizeText = (m: unknown[][]) => `${m.length} \\times ${m[0].length}`;
const sizeWords = (m: unknown[][]) => `${m.length} × ${m[0].length}`;

function q(meta: Meta, defaultPrompt: string, data: MatsBoard | undefined, checkpoints: Checkpoint[], lesson: Lesson): PaperQuestion {
  return {
    id: meta.id,
    topic: meta.topic,
    level: meta.level,
    source: meta.source,
    title: meta.title,
    prompt: meta.prompt ?? defaultPrompt,
    data,
    checkpoints,
    lesson,
    page: meta.page,
    bookNote: meta.bookNote,
    gen: meta.gen,
  };
}

// ---------------------------------------------------------------------------------------------
// Order of a matrix and its elements

export function orderQ(meta: Meta, rows: Num[][], name: string, pick: [number, number]): PaperQuestion {
  const m = rows.length;
  const n = rows[0].length;
  const [pi, pj] = pick;
  const el = F(rows[pi][pj]);
  const sub = `${pi + 1}${pj + 1}`;
  const board: MatsBoard = {
    kind: 'mats',
    terms: [
      {
        kind: 'mat',
        name: `$${name} =$`,
        br: 'paren',
        cells: cellsOf(rows),
        marks: [
          ...Array.from({ length: m }, (_, i): Mark => ({ type: 'row', i, at: 0, hl: 0, until: 1, tone: i % 2 ? 'b' : 'a' })),
          ...Array.from({ length: n }, (_, j): Mark => ({ type: 'col', j, at: 1, hl: 1, until: 2, tone: j % 2 ? 'b' : 'a' })),
          { type: 'row', i: pi, at: 3, hl: 3 },
          { type: 'col', j: pj, at: 3, hl: 3, tone: 'b' },
        ],
      },
    ],
  };
  const steps: Step[] = [
    { say: `Count the **rows**: the lines of numbers going **across**. There are ${m}. (The book calls this number $m$.)`, math: [`m = ${m}`] },
    { say: `Count the **columns**: the lines going **down**. There are ${n}. (The book calls this $n$.)`, math: [`n = ${n}`] },
    { say: `The order (size) is written **rows × columns**, rows always first.`, math: [`\\text{order} = ${m} \\times ${n}`] },
    {
      say: `$a_{${sub}}$ is the number at **row ${pi + 1}, column ${pj + 1}** (the small numbers are its address, not something to multiply). Go along row ${pi + 1} and down column ${pj + 1}; they meet at ${w(el)}. So the answer is:`,
      math: [`a_{${sub}} = ${w(el)}`],
      after: meta.meaning,
      end: true,
    },
  ];
  const cps = [
    numCp('m', 'Rows $m$', 'Number of rows $m$', m, 0, { slips: [[n, 'That counts the columns. Rows go across, one line per row.']] }),
    numCp('n', 'Columns $n$', 'Number of columns $n$', n, 1, { slips: [[m, 'That counts the rows. Columns go down.']] }),
    numCp('el', `$a_{${sub}}$`, `Element $a_{${sub}}$`, el, 3, {
      slips: rows[pj]?.[pi] !== undefined ? [[rows[pj][pi], `That is $a_{${pj + 1}${pi + 1}}$. The first subscript is the row.`]] : [],
    }),
  ];
  return q(
    meta,
    `Find the order of matrix $${name}$ and the element $a_{${sub}}$.`,
    { kind: 'mats', terms: [{ kind: 'mat', name: `$${name} =$`, br: 'paren', cells: cellsOf(rows) }] },
    cps,
    { board, steps },
  );
}

// ---------------------------------------------------------------------------------------------
// Addition and subtraction

export function addSubQ(meta: Meta, a: Num[][], b: Num[][], op: '+' | '-', names: [string, string] = ['A', 'B']): PaperQuestion {
  const A = M(a);
  const B = M(b);
  const C = matAdd(A, B, op === '+' ? 1 : -1);
  const [na, nb] = names;
  const rows = A.length;
  const cols = A[0].length;
  const sign = op === '+' ? '+' : '-';
  const steps: Step[] = [
    {
      say: `Check the sizes. $${na}$ is $${sizeText(a)}$ and $${nb}$ is $${sizeText(b)}$. Same size, so they can be ${op === '+' ? 'added' : 'subtracted'}, and the answer is also $${sizeText(a)}$.`,
    },
  ];
  let hinted = false;
  for (let i = 0; i < rows; i++) {
    const work = Array.from({ length: cols }, (_, j) => `${pw(A[i][j])} ${sign} ${pw(B[i][j])} = ${w(C[i][j])}`);
    const hint = hinted ? undefined : signHint(A[i].map((x, j) => [x, op, B[i][j]]));
    if (hint) hinted = true;
    steps.push({
      say:
        op === '+'
          ? `${ROW_NAME(i, rows)}: add each number in $${na}$ to the number in the **same place** in $${nb}$.`
          : `${ROW_NAME(i, rows)}: from each number in $${na}$, take away the number in the **same place** in $${nb}$.`,
      math: work,
      after: hint,
    });
  }
  const res = `${na} ${sign} ${nb}`;
  steps.push({ say: `So ${meta.meaning ? '' : 'the answer is'}`, math: [`${res} = ${texMat(C)}`], end: true, after: meta.meaning });
  steps[steps.length - 1].say = meta.meaning ? 'Put the rows together.' : 'Put the rows together. So the answer is:';

  const fills = [];
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) fills.push({ r: i, c: j, at: i + 1 });
  const board: MatsBoard = {
    kind: 'mats',
    terms: [
      { kind: 'mat', br: 'paren', cells: cellsOf(a), marks: rowMarks(rows) },
      { kind: 'op', text: sign },
      { kind: 'mat', br: 'paren', cells: cellsOf(b), marks: rowMarks(rows, 'b') },
      { kind: 'op', text: '=' },
      { kind: 'mat', br: 'paren', cells: cellsOf(C), fill: fills, marks: rowMarks(rows) },
    ],
  };
  const slips: [Num[][], string][] =
    op === '-'
      ? [
          [matAdd(B, A, -1), `That is $${nb} - ${na}$. Subtraction is not commutative: take $${nb}$'s elements away from $${na}$'s.`],
          [matAdd(A, B, 1), 'Those elements were added. Here they must be subtracted.'],
          [A.map((r, i) => r.map((x, j) => absF(sub(x, B[i][j])))), 'Watch the signs: when the second number is bigger, the result is negative.'],
        ]
      : [
          [A.map((r, i) => r.map((x, j) => mul(x, B[i][j]))), 'Those elements were multiplied. Addition adds the elements in the same position.'],
          [matAdd(A, B, -1), 'Those elements were subtracted. Here they must be added.'],
        ];
  const cps = [
    choiceCp('size', 'Size of the answer', `Size of $${res}$`, sizeChoices(rows, cols), sizeWords(a), 0, [
      [`${rows + cols} × ${rows + cols}`, 'Adding or subtracting does not change the size: the answer has the same size as each matrix.'],
    ]),
    matCp('res', `$${res}$`, `The matrix $${res}$`, C, steps.length - 1, { slips }),
  ];
  return q(
    meta,
    `Find $${res}$.`,
    {
      kind: 'mats',
      terms: [
        { kind: 'mat', name: `$${na} =$`, br: 'paren', cells: cellsOf(a) },
        { kind: 'op', text: '\\quad' },
        { kind: 'mat', name: `$${nb} =$`, br: 'paren', cells: cellsOf(b) },
      ],
    },
    cps,
    { board, steps },
  );
}

function rowMarks(rows: number, tone: 'a' | 'b' = 'a'): Mark[] {
  return Array.from({ length: rows }, (_, i): Mark => ({ type: 'row', i, at: i + 1, hl: i + 1, until: i + 2, tone }));
}

function sizeChoices(rows: number, cols: number): string[] {
  const set = new Set([`${rows} × ${cols}`, `${cols} × ${rows}`, `${rows + cols} × ${rows + cols}`, `${rows} × ${rows + cols}`, `${2 * rows} × ${2 * cols}`]);
  return [...set].slice(0, 4).sort();
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const absF = (x: Num) => (F(x).n < 0 ? mul(x, -1) : F(x));

// ---------------------------------------------------------------------------------------------
// Scalar multiplication, and combinations kA ± lB

export function scalarQ(meta: Meta, k: Num, a: Num[][], name = 'A'): PaperQuestion {
  const A = M(a);
  const R = matScale(k, A);
  const rows = A.length;
  const steps: Step[] = [{ say: `Multiplying a matrix by a single number (a **scalar**) is easy: multiply **every number inside** by ${w(k)}, like changing every price on a price list in one go. The size stays $${sizeText(a)}$.` }];
  for (let i = 0; i < rows; i++) {
    steps.push({
      say: `${ROW_NAME(i, rows)}: multiply each number by ${w(k)}.`,
      math: A[i].map((x, j) => `${pw(k)} \\times ${pw(x)} = ${w(R[i][j])}`),
    });
  }
  steps.push({ say: meta.meaning ? 'Put the rows together.' : 'Put the rows together. So the answer is:', math: [`${w(k)}${name} = ${texMat(R)}`], after: meta.meaning, end: true });
  const fills = [];
  for (let i = 0; i < rows; i++) for (let j = 0; j < A[0].length; j++) fills.push({ r: i, c: j, at: i + 1 });
  const board: MatsBoard = {
    kind: 'mats',
    terms: [
      { kind: 'op', text: `${w(k)} \\times` },
      { kind: 'mat', br: 'paren', cells: cellsOf(a), marks: rowMarks(rows) },
      { kind: 'op', text: '=' },
      { kind: 'mat', br: 'paren', cells: cellsOf(R), fill: fills, marks: rowMarks(rows) },
    ],
  };
  const slips: [Num[][], string][] = [
    [A.map((r) => r.map((x) => add(x, k))), `${w(k)} was added to each element. A scalar multiplies every element.`],
    [A.map((r, i) => r.map((x, j) => (i === 0 && j === 0 ? mul(x, k) : x))), 'Only the first element was multiplied. Every element is multiplied by the scalar.'],
    [A.map((r, i) => r.map((x) => (i === 0 ? mul(x, k) : x))), 'Only the first row was multiplied. Every row is multiplied by the scalar.'],
  ];
  return q(
    meta,
    `Find $${w(k)}${name}$.`,
    { kind: 'mats', terms: [{ kind: 'mat', name: `$${name} =$`, br: 'paren', cells: cellsOf(a) }] },
    [matCp('res', `$${w(k)}${name}$`, `The matrix $${w(k)}${name}$`, R, steps.length - 1, { slips })],
    { board, steps },
  );
}

/** kA + lB (l may be negative: kA − |l|B). */
export function comboQ(meta: Meta, k: Num, a: Num[][], l: Num, b: Num[][], names: [string, string] = ['A', 'B']): PaperQuestion {
  const A = M(a);
  const B = M(b);
  const kA = matScale(k, A);
  const lB = matScale(l, B);
  const R = matAdd(kA, lB);
  const [na, nb] = names;
  const lNeg = F(l).n < 0;
  const absL = lNeg ? mul(l, -1) : F(l);
  const expr = `${coef(k)}${na} ${lNeg ? '-' : '+'} ${coef(absL)}${nb}`;
  const steps: Step[] = [
    { say: `Do it in two easy parts. **Part 1:** multiply every number in each matrix by the number in front of it.`, math: [`${coef(k)}${na} = ${texMat(kA)}`] },
    { say: `Now the second matrix, every number times ${w(absL)}.`, math: [`${coef(absL)}${nb} = ${texMat(matScale(absL, B))}`] },
    {
      say: `**Part 2:** both are $${sizeText(a)}$, so ${lNeg ? 'take away' : 'add'} the numbers sitting in the **same place** (top-left with top-left, and so on), row by row.`,
      math: R.map((r, i) => r.map((_, j) => `${pw(kA[i][j])} ${lNeg ? '-' : '+'} ${pw(matScale(absL, B)[i][j])} = ${w(R[i][j])}`).join(',\\quad ')),
      after: signHint(R.flatMap((r, i) => r.map((_, j): [Num, '+' | '-', Num] => [kA[i][j], lNeg ? '-' : '+', matScale(absL, B)[i][j]]))),
    },
    { say: meta.meaning ? 'So:' : 'So the answer is:', math: [`${expr} = ${texMat(R)}`], after: meta.meaning, end: true },
  ];
  const board: MatsBoard = {
    kind: 'mats',
    terms: [
      { kind: 'mat', br: 'paren', cells: cellsOf(kA), at: 0 },
      { kind: 'op', text: lNeg ? '-' : '+', at: 1 },
      { kind: 'mat', br: 'paren', cells: cellsOf(matScale(absL, B)), at: 1 },
      { kind: 'op', text: '=', at: 2 },
      { kind: 'mat', br: 'paren', cells: cellsOf(R), at: 2, marks: [{ type: 'row', i: 0, at: 2, hl: 2, until: 3 }] },
    ],
  };
  const slips: [Num[][], string][] = [
    [matAdd(A, B, lNeg ? -1 : 1), 'The matrices were combined before multiplying by their numbers. Multiply first.'],
    [matAdd(kA, matScale(absL, B), lNeg ? 1 : -1), lNeg ? 'The second matrix was added. The question subtracts it.' : 'The second matrix was subtracted. The question adds it.'],
    [matAdd(matScale(k, A), B, lNeg ? -1 : 1), `$${nb}$ was not multiplied by ${w(absL)}.`],
  ];
  return q(
    meta,
    `Find $${expr}$.`,
    {
      kind: 'mats',
      terms: [
        { kind: 'mat', name: `$${na} =$`, br: 'paren', cells: cellsOf(a) },
        { kind: 'op', text: '\\quad' },
        { kind: 'mat', name: `$${nb} =$`, br: 'paren', cells: cellsOf(b) },
      ],
    },
    [
      matCp('ka', `$${coef(k)}${na}$`, `The matrix $${coef(k)}${na}$`, kA, 0, { slips: [[A.map((r) => r.map((x) => add(x, k))), `${w(k)} was added to each element instead of multiplying.`]] }),
      matCp('res', `$${expr}$`, `The matrix $${expr}$`, R, 3, { slips }),
    ],
    { board, steps },
  );
}

const coef = (k: Num) => (F(k).n === F(k).d ? '' : w(k));

// ---------------------------------------------------------------------------------------------
// Transpose

export function transposeQ(meta: Meta, a: Num[][], name = 'A'): PaperQuestion {
  const A = M(a);
  const T = transpose(A);
  const steps: Step[] = [
    { say: `The **transpose** just turns rows into columns. $${name}$ is $${sizeText(a)}$, so its transpose $${name}'$ is $${sizeText(T)}$. Nothing is calculated; numbers only move.` },
    ...A.map((r, i): Step => ({
      say: `Row ${i + 1} of $${name}$ (read left to right) is written as **column ${i + 1}** of $${name}'$ (top to bottom).`,
      math: [`(${r.map(w).join(',\\ ')}) \\to \\text{column } ${i + 1}`],
    })),
    { say: meta.meaning ? 'So:' : 'So the transpose is:', math: [`${name}' = ${texMat(T)}`], after: meta.meaning, end: true },
  ];
  const fills = [];
  for (let i = 0; i < A.length; i++) for (let j = 0; j < A[0].length; j++) fills.push({ r: j, c: i, at: i + 1 });
  const board: MatsBoard = {
    kind: 'mats',
    terms: [
      { kind: 'mat', name: `$${name} =$`, br: 'paren', cells: cellsOf(a), marks: rowMarks(A.length) },
      { kind: 'op', text: '\\quad' },
      {
        kind: 'mat',
        name: `$${name}' =$`,
        br: 'paren',
        cells: cellsOf(T),
        fill: fills,
        marks: A.map((_, i): Mark => ({ type: 'col', j: i, at: i + 1, hl: i + 1, until: i + 2 })),
      },
    ],
  };
  const tSizes = [...new Set([sizeWords(T), sizeWords(a), `${T.length} × ${T.length}`, `${A.length + 1} × ${A[0].length + 1}`, `${T.length + 1} × ${T[0].length}`])].slice(0, 4).sort();
  const cps: Checkpoint[] = [
    choiceCp('size', `Size of $${name}'$`, `Size of $${name}'$`, tSizes, sizeWords(T), 0, sizeWords(a) === sizeWords(T) ? [] : [[sizeWords(a), `That is the size of $${name}$. The transpose swaps rows and columns.`]]),
    matCp('t', `$${name}'$`, `The matrix $${name}'$`, T, steps.length - 1, { slips: A.length === A[0].length ? [[A, `That is $${name}$ unchanged. Rows must become columns.`]] : [] }),
  ];
  return q(meta, `Write down the transpose $${name}'$.`, { kind: 'mats', terms: [{ kind: 'mat', name: `$${name} =$`, br: 'paren', cells: cellsOf(a) }] }, cps, { board, steps });
}

// ---------------------------------------------------------------------------------------------
// Multiplication

export function mulQ(meta: Meta, a: Num[][], b: Num[][], names: [string, string] = ['A', 'B']): PaperQuestion {
  const A = M(a);
  const B = M(b);
  const [na, nb] = names;
  const [m, n] = [A.length, A[0].length];
  const [n2, p] = [B.length, B[0].length];
  if (n !== n2) throw new Error(`${meta.id}: not conformable`);
  const C = matMul(A, B);
  const resDp = Math.min(3, Math.max(0, ...C.flat().map(dpFor)));
  const Cshow = C.map((r) => r.map((x) => wn(x, resDp)));
  const steps: Step[] = [
    {
      say: `First check that multiplying is allowed. Write the sizes side by side: $${na}$ is $${m} \\times ${n}$ and $${nb}$ is $${n2} \\times ${p}$. The two **middle** numbers are equal (${n} = ${n2}), so yes, it works. The answer's size is the two **outside** numbers: $${m} \\times ${p}$.`,
      after: 'Why the middle numbers must match: each row of the first matrix gets paired, number by number, with a column of the second. The pairs only line up if the row and the column are equally long.',
    },
  ];
  const fills: { r: number; c: number; at: number }[] = [];
  const marksA: Mark[] = [];
  const marksB: Mark[] = [];
  const marksC: Mark[] = [];
  // One step per row of the answer (each element: row of A times column of B, then add).
  for (let i = 0; i < m; i++) {
    const s = steps.length;
    const work = Array.from({ length: p }, (_, j) => {
      const terms = Array.from({ length: n }, (_, k) => `${pw(A[i][k])} \\times ${pw(B[k][j])}`).join(' + ');
      const prods = Array.from({ length: n }, (_, k) => mul(A[i][k], B[k][j]));
      const sum = prods.map((x, k) => (k === 0 ? wn(x, 4) : F(x).n < 0 ? ` - ${wn(mul(x, -1), 4)}` : ` + ${wn(x, 4)}`)).join('');
      const label = p === 1 && m === 1 ? '' : `\\text{${p === 1 ? `Row ${i + 1}` : m === 1 ? `Column ${j + 1}` : `Row ${i + 1}, column ${j + 1}`}: }\\;`;
      return `${label}${terms} = ${sum} = ${wn(C[i][j], resDp)}`;
    });
    steps.push({
      say: `Take **row ${i + 1}** of $${na}$ (read across)${p > 1 ? ` with each column of $${nb}$ in turn` : ` with the column of $${nb}$`} (read down). Multiply first with first, second with second${n > 2 ? ', and so on' : ''}, then **add**. ${p > 1 ? `The answers fill row ${i + 1} of the product.` : `The answer goes in row ${i + 1} of the product.`}`,
      math: work,
    });
    for (let j = 0; j < p; j++) fills.push({ r: i, c: j, at: s });
    marksA.push({ type: 'row', i, at: s, hl: s, until: s + 1 });
    marksC.push({ type: 'row', i, at: s, hl: s, until: s + 1 });
  }
  if (p === 1) marksB.push({ type: 'col', j: 0, at: 1, hl: 1, until: m + 1, tone: 'b' });
  steps.push({ say: meta.meaning ? 'Put the rows together.' : 'Put the rows together. So the product is:', math: [`${na}${nb} = ${texMat(Cshow)}`], after: meta.meaning, end: true });

  const elementwise = m === n2 && n === p ? A.map((r, i) => r.map((x, j) => mul(x, B[i]?.[j] ?? 0))) : null;
  const reversed = p === m ? (() => {
    try {
      return matMul(B, A);
    } catch {
      return null;
    }
  })() : null;
  const rowByRow = m === n2 && n === p ? A.map((r, i) => B.map((_, j) => r.reduce((s, x, k) => add(s, mul(x, B[j]?.[k] ?? 0)), F(0)))) : null;
  const slips: [Num[][], string][] = [];
  if (elementwise) slips.push([elementwise, 'Those are element-by-element products. Matrix multiplication is **row × column**, then add.']);
  if (reversed && reversed.length === C.length && reversed[0].length === C[0].length) slips.push([reversed, `That is $${nb}${na}$. The order matters: $${na}${nb} \\ne ${nb}${na}$.`]);
  if (rowByRow) slips.push([rowByRow, `Rows of $${nb}$ were used. Use the **columns** of the second matrix.`]);

  const board: MatsBoard = {
    kind: 'mats',
    terms: [
      { kind: 'mat', br: 'paren', cells: cellsOf(a), marks: marksA },
      { kind: 'op', text: '\\times' },
      { kind: 'mat', br: 'paren', cells: cellsOf(b), marks: marksB },
      { kind: 'op', text: '=' },
      { kind: 'mat', br: 'paren', cells: Cshow, fill: fills, marks: marksC },
    ],
  };
  const sizes = new Set([`${m} × ${p}`, `${n} × ${n2}`, `${p} × ${m}`, `${m} × ${n}`, `${n2} × ${p}`, `${m + 1} × ${p}`]);
  const cps: Checkpoint[] = [
    choiceCp('size', `Size of $${na}${nb}$`, `Size of $${na}${nb}$`, [...sizes].slice(0, 4).sort(), `${m} × ${p}`, 0, [
      [`${n} × ${n2}`, 'Those are the inner numbers; they only have to match. The size of the product is the outer numbers.'],
      [`${p} × ${m}`, 'Rows come from the first matrix and columns from the second: rows × columns.'],
    ]),
  ];
  if (p === 1 && m === 1) {
    cps.push(numCp('res', `$${na}${nb}$`, `The product $${na}${nb}$ (a single number)`, C[0][0], steps.length - 1, {
      slips: [[A[0].reduce((s, x, k) => add(s, x), B.reduce((s, r) => add(s, r[0]), F(0))), 'All the numbers were added. Multiply the pairs first, then add the products.']],
    }));
  } else {
    // A checkpoint for the first element, then the whole product.
    cps.push(
      numCp('c11', 'Top-left number', `The top-left number of the product (row 1 with column 1)`, C[0][0], 1, {
        slips: [
          [mul(A[0][0], B[0][0]), 'Only the first pair was multiplied. Multiply every pair in row 1 and column 1, then add them.'],
          [A[0].reduce((s, x, k) => add(s, mul(x, B[0][k] ?? 0)), F(0)), 'Row 1 of the second matrix was used. Use its **column** 1.'],
        ],
      }),
      matCp('res', `$${na}${nb}$`, `The product $${na}${nb}$`, C, steps.length - 1, { slips, dp: resDp }),
    );
  }
  return q(
    meta,
    `Find the product $${na}${nb}$.`,
    {
      kind: 'mats',
      terms: [
        { kind: 'mat', name: `$${na} =$`, br: 'paren', cells: cellsOf(a) },
        { kind: 'op', text: '\\quad' },
        { kind: 'mat', name: `$${nb} =$`, br: 'paren', cells: cellsOf(b) },
      ],
    },
    cps,
    { board, steps },
  );
}

/** Does AB exist? Checkpoints: yes/no, and the size if it does. */
export function existsQ(meta: Meta, sa: [number, number], sb: [number, number], names: [string, string] = ['A', 'B']): PaperQuestion {
  const [na, nb] = names;
  const ok = sa[1] === sb[0];
  const steps: Step[] = [
    { say: `Write the sizes side by side, first matrix first. Size means rows × columns.`, math: [`${sa[0]} \\times ${sa[1]} \\quad\\text{and}\\quad ${sb[0]} \\times ${sb[1]}`] },
    {
      say: ok
        ? `Look at the two **middle** numbers: ${sa[1]} and ${sb[0]}. They are equal, so $${na}${nb}$ **exists**.`
        : `Look at the two **middle** numbers: ${sa[1]} and ${sb[0]}. They are not equal, so $${na}${nb}$ **does not exist**. Each row of $${na}$ has ${sa[1]} numbers but each column of $${nb}$ has ${sb[0]}, so they cannot be paired.`,
    },
    ok
      ? { say: `Its size is the two **outside** numbers.`, math: [`${na}${nb} \\text{ is } ${sa[0]} \\times ${sb[1]}`], end: true }
      : { say: `So the answer is **No**: $${na}${nb}$ does not exist.`, end: true },
  ];
  const cps: Checkpoint[] = [
    choiceCp('ex', `Does $${na}${nb}$ exist?`, `Does $${na}${nb}$ exist?`, ['Yes', 'No'], ok ? 'Yes' : 'No', 1, [
      [ok ? 'No' : 'Yes', ok ? 'Compare the inner numbers: columns of the first with rows of the second. They match.' : `Compare the **inner** numbers (${sa[1]} and ${sb[0]}). They must be equal.`],
    ]),
  ];
  if (ok) {
    const sizes = [...new Set([`${sa[0]} × ${sb[1]}`, `${sa[1]} × ${sb[0]}`, `${sb[1]} × ${sa[0]}`, `${sa[0]} × ${sa[1]}`, `${sb[0]} × ${sb[1]}`, `${sa[0] + 1} × ${sb[1] + 1}`])].slice(0, 4).sort();
    if (!sizes.includes(`${sa[0]} × ${sb[1]}`)) sizes[0] = `${sa[0]} × ${sb[1]}`;
    cps.push(choiceCp('size', `Size of $${na}${nb}$`, `Size of $${na}${nb}$`, sizes.sort(), `${sa[0]} × ${sb[1]}`, 2, [[`${sa[1]} × ${sb[0]}`, 'Those are the inner numbers. The size is the outer numbers.']]));
  }
  return q(meta, `$${na}$ is a $${sa[0]} \\times ${sa[1]}$ matrix and $${nb}$ is a $${sb[0]} \\times ${sb[1]}$ matrix. Does $${na}${nb}$ exist? If it does, what is its size?`, undefined, cps, { steps });
}


// ---------------------------------------------------------------------------------------------
// Types of matrices

export type MType = 'row' | 'column' | 'square' | 'diagonal' | 'scalar' | 'identity' | 'upper' | 'lower' | 'symmetric' | 'skew';
export const TYPE_NAME: Record<MType, string> = {
  row: 'Row matrix',
  column: 'Column matrix',
  square: 'Square matrix',
  diagonal: 'Diagonal matrix',
  scalar: 'Scalar matrix',
  identity: 'Identity matrix',
  upper: 'Upper triangular matrix',
  lower: 'Lower triangular matrix',
  symmetric: 'Symmetric matrix',
  skew: 'Skew-symmetric matrix',
};

/** Every type name that is true of a matrix. */
export function typesOf(a: Num[][]): Set<MType> {
  const A = M(a);
  const m = A.length;
  const n = A[0].length;
  const z = (x: Num) => F(x).n === 0;
  const out = new Set<MType>();
  if (m === 1 && n > 1) out.add('row');
  if (n === 1 && m > 1) out.add('column');
  if (m !== n || m < 2) return out;
  out.add('square');
  let below = true;
  let above = true;
  let sym = true;
  let skew = true;
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++) {
      if (i > j && !z(A[i][j])) below = false;
      if (i < j && !z(A[i][j])) above = false;
      if (F(sub(A[i][j], A[j][i])).n !== 0) sym = false;
      if (F(add(A[i][j], A[j][i])).n !== 0) skew = false;
    }
  if (below) out.add('upper');
  if (above) out.add('lower');
  if (sym) out.add('symmetric');
  if (skew) out.add('skew');
  if (below && above) {
    out.add('diagonal');
    const d = A.map((r, i) => r[i]);
    if (d.every((x) => F(sub(x, d[0])).n === 0)) {
      out.add('scalar');
      if (F(d[0]).n === 1 && F(d[0]).d === 1) out.add('identity');
    }
  }
  return out;
}

/** The most exact name, in the order the book's definitions narrow down. */
export function bestType(t: Set<MType>): MType | null {
  for (const k of ['identity', 'scalar', 'diagonal', 'upper', 'lower', 'skew', 'symmetric', 'row', 'column', 'square'] as MType[]) if (t.has(k)) return k;
  return null;
}

/** "a, b and c". */
const listing = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

const WHY: Record<MType, string> = {
  row: 'It has a **single row**.',
  column: 'It has a **single column**.',
  square: 'It has as many rows as columns, and none of the special patterns applies.',
  diagonal: 'Every number **off** the main diagonal is 0.',
  scalar: 'Every number off the diagonal is 0, and the diagonal numbers are **all equal**.',
  identity: 'Every number off the diagonal is 0, and every diagonal number is **1**.',
  upper: 'Every number **below** the main diagonal is 0, so the numbers sit in the upper part.',
  lower: 'Every number **above** the main diagonal is 0, so the numbers sit in the lower part.',
  symmetric: 'Fold it along the diagonal: the numbers that land on each other are **equal** (row 1, column 2 matches row 2, column 1, and so on).',
  skew: 'Fold it along the diagonal: the numbers that land on each other are **equal with opposite signs**, and the diagonal is all 0.',
};

export function typeQ(meta: Meta, a: Num[][], name: string, rng?: { shuffle<T>(x: T[]): T[] }): PaperQuestion {
  const t = typesOf(a);
  const best = bestType(t);
  if (!best) throw new Error(`${meta.id}: no type`);
  const m = a.length;
  const n = a[0].length;
  const square = m === n;
  const falseTypes = (Object.keys(TYPE_NAME) as MType[]).filter((k) => !t.has(k));
  const pickFrom = rng ? rng.shuffle([...falseTypes]) : falseTypes;
  const options = [best, ...pickFrom.slice(0, 3)].map((k) => TYPE_NAME[k]).sort();
  const also = [...t].filter((k) => k !== best && k !== 'square');
  const diagMarks: Mark[] = square ? Array.from({ length: m }, (_, i): Mark => ({ type: 'cell', i, j: i, at: 1, hl: 1 })) : [];
  const steps: Step[] = [
    {
      say: square
        ? `Count the rows and columns: $${m} \\times ${n}$. They are equal, so it is a **square** matrix. Now look for a pattern.`
        : `Count the rows and columns: $${m} \\times ${n}$. They are not equal, so it is **not square**.`,
    },
    square
      ? { say: `Look at the **main diagonal** (top-left corner to bottom-right corner, lit up), then at the numbers above it and below it. ${WHY[best]}` }
      : { say: WHY[best] },
    {
      say: `So the most exact name is: **${TYPE_NAME[best]}**.`,
      after: also.length ? `It also fits ${listing([...also.map((k) => TYPE_NAME[k].toLowerCase().replace(/ matrix$/, '')), ...(square ? ['square'] : [])])}, but "${TYPE_NAME[best].toLowerCase()}" is the most exact name.` : undefined,
      end: true,
    },
  ];
  const cps: Checkpoint[] = [
    choiceCp('sq', 'Square?', 'Is it a square matrix?', ['Yes', 'No'], square ? 'Yes' : 'No', 0, [[square ? 'No' : 'Yes', 'Square means rows = columns. Count both.']]),
    choiceCp('type', 'Type', 'Which name describes it most exactly?', options, TYPE_NAME[best], 2),
  ];
  return q(
    meta,
    `What type of matrix is $${name}$?`,
    { kind: 'mats', terms: [{ kind: 'mat', name: `$${name} =$`, br: 'paren', cells: cellsOf(a) }] },
    cps,
    { board: { kind: 'mats', terms: [{ kind: 'mat', name: `$${name} =$`, br: 'paren', cells: cellsOf(a), marks: diagMarks }] }, steps },
  );
}
