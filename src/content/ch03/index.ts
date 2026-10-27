// Unit 3 · Determinants.

import type { Chapter } from '../types.ts';
import { two } from './two.ts';
import { three } from './three.ts';
import { cramer3 } from './cramer3.ts';
import { props } from './props.ts';
import { apps } from './apps.ts';

export const ch03: Chapter = {
  n: 3,
  unit: 3,
  title: 'Determinants',
  blurb: 'Values, Cramer’s rule, properties and management applications',
  topics: [two, three, cramer3, props, apps],
  formulas: [
    { name: 'Second-order determinant', math: '\\det{a_1 & b_1 \\\\ a_2 & b_2} = a_1b_2 - a_2b_1', use: 'Leading diagonal minus the other diagonal.' },
    { name: "Cramer's rule (2 unknowns)", math: 'x = \\frac{\\det{h_1 & b_1 \\\\ h_2 & b_2}}{\\det{a_1 & b_1 \\\\ a_2 & b_2}},\\quad y = \\frac{\\det{a_1 & h_1 \\\\ a_2 & h_2}}{\\det{a_1 & b_1 \\\\ a_2 & b_2}}', use: 'For $a_1x + b_1y = h_1$, $a_2x + b_2y = h_2$. Needs $D \\ne 0$.' },
    { name: 'Third-order determinant', math: '\\det{a_1 & b_1 & c_1 \\\\ a_2 & b_2 & c_2 \\\\ a_3 & b_3 & c_3} = a_1\\det{b_2 & c_2 \\\\ b_3 & c_3} - b_1\\det{a_2 & c_2 \\\\ a_3 & c_3} + c_1\\det{a_2 & b_2 \\\\ a_3 & b_3}', use: 'Expand along the first row with signs $+, -, +$.' },
    { name: 'Cofactor', math: 'C_{jk} = (-1)^{j + k} M_{jk}', use: 'The minor $M_{jk}$ (delete row $j$, column $k$), negated when $j + k$ is odd.' },
    { name: "Cramer's rule (3 unknowns)", math: 'x = \\frac{D_x}{D},\\quad y = \\frac{D_y}{D},\\quad z = \\frac{D_z}{D}', use: '$D_x$: replace the x-column of $D$ with the right-hand sides; similarly for $y$, $z$.' },
    { name: 'Properties', math: '|A\'| = |A|, \\quad \\text{swap} \\Rightarrow \\times(-1), \\quad R_i + kR_j \\Rightarrow \\text{no change}', use: 'Common factor of a row comes out; a zero row or two equal (proportional) rows give 0; one non-zero element: element × cofactor.' },
    { name: 'Brand switching', math: '\\text{shares next week} = S \\times \\text{shares this week}', use: 'Column $j$ of $S$: where brand $j$\'s buyers go; each column adds to 1.' },
  ],
};
