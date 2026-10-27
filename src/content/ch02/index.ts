// Unit 2 · Matrix and its Operation.

import type { Chapter } from '../types.ts';
import { addsub } from './addsub.ts';
import { intro } from './intro.ts';
import { types } from './types.ts';
import { scalar } from './scalar.ts';
import { mul } from './mul.ts';

export const ch02: Chapter = {
  n: 2,
  unit: 2,
  title: 'Matrices',
  blurb: 'Order, types, addition, scalar and matrix multiplication',
  topics: [intro, types, addsub, scalar, mul],
  formulas: [
    { name: 'Order', math: 'm \\times n', use: '$m$ rows, $n$ columns; $mn$ elements. $a_{ij}$ is in row $i$, column $j$.' },
    { name: 'Transpose', math: "A = [a_{ij}] \\Rightarrow A' = [a_{ji}]", use: "Rows become columns; an $m \\times n$ matrix becomes $n \\times m$. $(A')' = A$." },
    { name: 'Symmetric / skew-symmetric', math: "A' = A \\qquad A' = -A", use: 'Symmetric: $a_{ij} = a_{ji}$. Skew-symmetric: $a_{ij} = -a_{ji}$, diagonal all 0.' },
    { name: 'Addition', math: 'A + B = [a_{ij} + b_{ij}]', use: 'Only for matrices of the same size. $A + B = B + A$.' },
    { name: 'Subtraction', math: 'A - B = [a_{ij} - b_{ij}]', use: 'Same size only. $A - B \\ne B - A$.' },
    { name: 'Scalar multiple', math: 'kA = [k\\,a_{ij}]', use: 'Every element times $k$; size unchanged. $k(A + B) = kA + kB$.' },
    { name: 'Product', math: '(AB)_{ij} = a_{i1}b_{1j} + a_{i2}b_{2j} + \\cdots + a_{in}b_{nj}', use: '$A$ is $m \\times n$, $B$ is $n \\times p$; $AB$ is $m \\times p$. Row × column, then add. $AB \\ne BA$ in general.' },
    { name: 'Identity', math: 'AI = IA = A', use: '$I$: 1 on the diagonal, 0 elsewhere.' },
  ],
};
