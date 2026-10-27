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
    { name: 'Addition', math: 'A + B = [a_{ij} + b_{ij}]', use: 'Only for matrices of the same size. $A + B = B + A$.' },
    { name: 'Subtraction', math: 'A - B = [a_{ij} - b_{ij}]', use: 'Same size only. $A - B \\ne B - A$.' },
  ],
};
