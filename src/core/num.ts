// Exact arithmetic for the content (rationals), half-up rounding as students do it, and
// number display. Pure: no DOM.
//
// Content computes every answer with Frac so 0.1 + 0.2 really is 0.3, then rounds once for
// display or grading.

export interface Frac {
  readonly n: number;
  readonly d: number;
}

const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

/** A reduced fraction n/d (d > 0). */
export function fr(n: number, d = 1): Frac {
  if (!Number.isInteger(n) || !Number.isInteger(d)) return fromDecimal(String(n / d));
  if (d === 0) throw new Error('fraction with zero denominator');
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d);
  const out = { n: n / g || 0, d: d / g };
  if (!Number.isSafeInteger(out.n) || !Number.isSafeInteger(out.d)) throw new Error('fraction overflow');
  return out;
}

/** Anything numeric that content may pass around. */
export type Num = Frac | number;

export const F = (x: Num): Frac => (typeof x === 'number' ? (Number.isInteger(x) ? fr(x) : fromDecimal(String(x))) : x);

/** Exact value of a decimal or fraction string ("−2.35", "3/4", "1e-3" not supported). */
export function fromDecimal(s: string): Frac {
  const t = s.trim().replace(/−/g, '-');
  const m = /^(-)?(\d*)(?:\.(\d*))?$/.exec(t);
  if (!m || (m[2] === '' && (m[3] ?? '') === '')) throw new Error(`not a decimal: ${s}`);
  const whole = m[2] || '0';
  const frac = m[3] ?? '';
  const n = Number(whole + frac) * (m[1] ? -1 : 1);
  return fr(n, 10 ** frac.length);
}

export const add = (a: Num, b: Num): Frac => {
  const x = F(a), y = F(b);
  return fr(x.n * y.d + y.n * x.d, x.d * y.d);
};
export const sub = (a: Num, b: Num): Frac => add(a, neg(b));
export const neg = (a: Num): Frac => {
  const x = F(a);
  return { n: -x.n || 0, d: x.d };
};
export const mul = (a: Num, b: Num): Frac => {
  const x = F(a), y = F(b);
  return fr(x.n * y.n, x.d * y.d);
};
export const div = (a: Num, b: Num): Frac => {
  const x = F(a), y = F(b);
  if (y.n === 0) throw new Error('division by zero');
  return fr(x.n * y.d, x.d * y.n);
};
export const sum = (xs: Num[]): Frac => xs.reduce<Frac>((s, x) => add(s, x), fr(0));
export const eq = (a: Num, b: Num): boolean => {
  const x = F(a), y = F(b);
  return x.n === y.n && x.d === y.d;
};
export const cmp = (a: Num, b: Num): number => {
  const x = F(a), y = F(b);
  return Math.sign(x.n * y.d - y.n * x.d);
};
export const isZero = (a: Num): boolean => F(a).n === 0;
export const isInt = (a: Num): boolean => F(a).d === 1;
export const val = (a: Num): number => {
  const x = F(a);
  return x.n / x.d;
};

/** Does this fraction have a terminating decimal (denominator 2^a·5^b)? */
export function terminates(a: Num): boolean {
  let d = F(a).d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

/** Number of decimal places needed to write it exactly (Infinity if it doesn't terminate). */
export function places(a: Num): number {
  if (!terminates(a)) return Infinity;
  let x = F(a);
  let p = 0;
  while (x.d !== 1) {
    x = mul(x, 10);
    p++;
  }
  return p;
}

/**
 * Round half away from zero to `dp` places, exactly ("2.345" → 2.35, "−0.125" → −0.13).
 * Returns a Frac, so the result can be compared exactly.
 */
export function roundTo(a: Num, dp: number): Frac {
  const x = F(a);
  const scale = 10 ** dp;
  // n/d · scale, rounded half away from zero, with integer arithmetic.
  const num = Math.abs(x.n) * scale;
  const q = Math.floor(num / x.d);
  const r = num - q * x.d;
  const up = 2 * r >= x.d ? 1 : 0;
  const mag = q + up;
  return fr(x.n < 0 ? -mag : mag, scale);
}

/** A number written with exactly the places it needs, up to `maxDp` (rounded), minus as "−". */
export function fmt(a: Num, maxDp = 4): string {
  const p = Math.min(places(a), maxDp);
  return fmtFixed(roundTo(a, p), p);
}

/** Written with exactly `dp` places ("2.50"). */
export function fmtFixed(a: Num, dp: number): string {
  const x = roundTo(a, dp);
  const neg = x.n < 0;
  const scaled = Math.round((Math.abs(x.n) * 10 ** dp) / x.d);
  let s = String(scaled);
  if (dp > 0) {
    s = s.padStart(dp + 1, '0');
    s = `${s.slice(0, -dp)}.${s.slice(-dp)}`;
  }
  return (neg && scaled !== 0 ? '−' : '') + s;
}

/** As a fraction "3/4", "−7/2", or an integer "5". */
export function fmtFrac(a: Num): string {
  const x = F(a);
  const s = x.d === 1 ? String(Math.abs(x.n)) : `${Math.abs(x.n)}/${x.d}`;
  return (x.n < 0 ? '−' : '') + s;
}

/** Shown in working: exact decimal when short, else a fraction. */
export function fmtWork(a: Num): string {
  return places(a) <= 4 ? fmt(a) : fmtFrac(a);
}

/** Parse what a learner typed: "12", "−3.5", "-3.5", "3/4", "-7/2", ".5". Null if not a number. */
export function parseEntry(s: string): Frac | null {
  const t = s.trim().replace(/−/g, '-').replace(/\s+/g, '').replace(/,/g, '');
  if (!t) return null;
  const f = /^(-?)(\d+(?:\.\d+)?|\.\d+)\/(\d+(?:\.\d+)?)$/.exec(t);
  try {
    if (f) {
      const top = fromDecimal((f[1] ?? '') + f[2]);
      const bot = fromDecimal(f[3]);
      return isZero(bot) ? null : div(top, bot);
    }
    if (/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return fromDecimal(t.endsWith('.') ? t.slice(0, -1) : t);
  } catch {
    return null;
  }
  return null;
}

/** Decimal places the learner actually typed (for "3/4" or an integer: 0). */
export function typedPlaces(s: string): number {
  const t = s.trim().replace(/−/g, '-');
  if (t.includes('/')) return 0;
  const i = t.indexOf('.');
  return i < 0 ? 0 : t.length - i - 1;
}

// ---- Small matrix helpers (exact) ----

export type Mat = Frac[][];

export const M = (rows: Num[][]): Mat => rows.map((r) => r.map(F));

export function dims(m: Num[][]): [number, number] {
  return [m.length, m[0]?.length ?? 0];
}

export function matAdd(a: Mat, b: Mat, sign: 1 | -1 = 1): Mat {
  return a.map((r, i) => r.map((x, j) => (sign === 1 ? add(x, b[i][j]) : sub(x, b[i][j]))));
}

export function matScale(k: Num, a: Mat): Mat {
  return a.map((r) => r.map((x) => mul(k, x)));
}

export function matMul(a: Mat, b: Mat): Mat {
  const [m, n] = dims(a);
  const [n2, p] = dims(b);
  if (n !== n2) throw new Error(`cannot multiply ${m}×${n} by ${n2}×${p}`);
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: p }, (_, j) => sum(Array.from({ length: n }, (_, k) => mul(a[i][k], b[k][j])))),
  );
}

export function transpose<T>(a: T[][]): T[][] {
  return a[0].map((_, j) => a.map((r) => r[j]));
}

/** The matrix with row i and column j removed. */
export function minorMat<T>(a: T[][], i: number, j: number): T[][] {
  return a.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
}

/** Determinant by first-row (Laplace) expansion, exactly. */
export function det(a: Num[][]): Frac {
  const m = M(a);
  const n = m.length;
  if (m.some((r) => r.length !== n)) throw new Error('determinant of a non-square matrix');
  if (n === 1) return m[0][0];
  if (n === 2) return sub(mul(m[0][0], m[1][1]), mul(m[0][1], m[1][0]));
  let s = fr(0);
  for (let j = 0; j < n; j++) {
    const term = mul(m[0][j], det(minorMat(m, 0, j)));
    s = j % 2 === 0 ? add(s, term) : sub(s, term);
  }
  return s;
}

export const matEq = (a: Num[][], b: Num[][]): boolean =>
  a.length === b.length && a.every((r, i) => r.length === b[i].length && r.every((x, j) => eq(x, b[i][j])));
