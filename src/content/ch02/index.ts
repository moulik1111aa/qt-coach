// Unit 2 · Matrix and its Operation.

import type { Chapter } from '../types.ts';
import { addsub } from './addsub.ts';

export const ch02: Chapter = {
  n: 2,
  unit: 2,
  title: 'Matrices',
  blurb: 'Order, types, addition, scalar and matrix multiplication',
  topics: [addsub],
  formulas: [
    { name: 'Addition', math: 'A + B = [a_{ij} + b_{ij}]', use: 'Only for matrices of the same size. $A + B = B + A$.' },
    { name: 'Subtraction', math: 'A - B = [a_{ij} - b_{ij}]', use: 'Same size only. $A - B \\ne B - A$.' },
  ],
};
