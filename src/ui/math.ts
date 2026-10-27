// A tiny maths renderer: a LaTeX subset → HTML + CSS (no dependencies), and the app's text
// markup (**bold**, $maths$, line breaks).
//
// Supported in maths: \frac{a}{b}, \sqrt{x}, x^2, x^{n-1}, a_1, a_{ij}, \sum_{i=1}^{n},
// \bar{x}, \text{…}, \mat{a & b \\ c & d} ( ), \smat{…} [ ], \det{…} | |, \vec{…} (column),
// greek and symbol commands (\times \div \pm \le \ge \ne \cdot \to \infty \Sigma \sigma \mu
// \Delta …), \, \; \quad spacing, and \left \right (ignored). "-" is drawn as a true minus.

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SYMBOLS: Record<string, [string, 'op' | 'rel' | 'id' | 'big']> = {
  times: ['×', 'op'],
  div: ['÷', 'op'],
  pm: ['±', 'op'],
  cdot: ['·', 'op'],
  le: ['≤', 'rel'],
  leq: ['≤', 'rel'],
  ge: ['≥', 'rel'],
  geq: ['≥', 'rel'],
  ne: ['≠', 'rel'],
  neq: ['≠', 'rel'],
  approx: ['≈', 'rel'],
  to: ['→', 'rel'],
  Rightarrow: ['⇒', 'rel'],
  infty: ['∞', 'id'],
  Sigma: ['Σ', 'id'],
  sigma: ['σ', 'id'],
  mu: ['μ', 'id'],
  Delta: ['Δ', 'id'],
  delta: ['δ', 'id'],
  alpha: ['α', 'id'],
  beta: ['β', 'id'],
  lambda: ['λ', 'id'],
  pi: ['π', 'id'],
  theta: ['θ', 'id'],
  ldots: ['…', 'id'],
  dots: ['…', 'id'],
  cdots: ['⋯', 'id'],
  vdots: ['⋮', 'id'],
  prime: ['′', 'id'],
  sum: ['Σ', 'big'],
};

class Parser {
  i = 0;
  readonly s: string;
  constructor(s: string) {
    this.s = s;
  }
  peek(): string {
    return this.s[this.i] ?? '';
  }
  eof(): boolean {
    return this.i >= this.s.length;
  }
  /** A {…} group, or a single token. Returns raw source. */
  group(): string {
    this.ws();
    if (this.peek() === '{') {
      let depth = 0;
      const start = this.i + 1;
      for (; this.i < this.s.length; this.i++) {
        const c = this.s[this.i];
        if (c === '\\') {
          this.i++;
          continue;
        }
        if (c === '{') depth++;
        else if (c === '}') {
          depth--;
          if (depth === 0) {
            const out = this.s.slice(start, this.i);
            this.i++;
            return out;
          }
        }
      }
      throw new Error(`unclosed { in maths: ${this.s}`);
    }
    if (this.peek() === '\\') {
      const m = /^\\([A-Za-z]+|.)/.exec(this.s.slice(this.i));
      if (m) {
        this.i += m[0].length;
        return m[0];
      }
    }
    const c = this.peek();
    this.i++;
    return c;
  }
  ws(): void {
    while (this.peek() === ' ') this.i++;
  }
}

/** Render maths source to HTML (no surrounding wrapper). */
function render(src: string): string {
  const p = new Parser(src);
  let out = '';
  const st: { last: 'start' | 'op' | 'atom'; pos: number } = { last: 'start', pos: 0 };
  const atom = (h: string) => {
    st.pos = out.length;
    out += h;
    st.last = 'atom';
  };
  const scripts = () => {
    // Attach ^ and _ to the previous atom.
    let sup = '';
    let sub = '';
    for (;;) {
      p.ws();
      const c = p.peek();
      if (c === '^') {
        p.i++;
        sup = render(p.group());
      } else if (c === '_') {
        p.i++;
        sub = render(p.group());
      } else break;
    }
    if (sup || sub) {
      // Wrap the base and its scripts together, so scripts sit against the base, not the line.
      const base = out.slice(st.pos);
      const scr = `<span class="mss${sup ? '' : ' only-sub'}${sub ? '' : ' only-sup'}">${sup ? `<span class="msup">${sup}</span>` : ''}${sub ? `<span class="msub">${sub}</span>` : ''}</span>`;
      out = `${out.slice(0, st.pos)}<span class="msx">${base}${scr}</span>`;
    }
  };
  while (!p.eof()) {
    const c = p.peek();
    if (c === ' ') {
      p.i++;
      continue;
    }
    if (c === '\\') {
      const m = /^\\([A-Za-z]+|.)/.exec(src.slice(p.i));
      if (!m) {
        p.i++;
        continue;
      }
      p.i += m[0].length;
      const cmd = m[1];
      if (cmd === 'frac' || cmd === 'dfrac' || cmd === 'tfrac') {
        const a = render(p.group());
        const b = render(p.group());
        atom(`<span class="mfrac"><span class="mnum">${a}</span><span class="mden">${b}</span></span>`);
      } else if (cmd === 'sqrt') {
        atom(`<span class="msqrt"><span class="mrad">√</span><span class="mrd">${render(p.group())}</span></span>`);
      } else if (cmd === 'bar' || cmd === 'overline') {
        atom(`<span class="mbar">${render(p.group())}</span>`);
      } else if (cmd === 'text' || cmd === 'mathrm' || cmd === 'textrm') {
        atom(`<span class="mtext">${esc(p.group())}</span>`);
      } else if (cmd === 'mat' || cmd === 'smat' || cmd === 'det' || cmd === 'vec') {
        const body = p.group();
        const rows = body.split(/\\\\/).map((r) => r.split('&').map((x) => x.trim()));
        const cols = Math.max(...rows.map((r) => r.length));
        const br = cmd === 'mat' || cmd === 'vec' ? 'paren' : cmd === 'smat' ? 'square' : 'bar';
        const cells = rows
          .map((r) => Array.from({ length: cols }, (_, j) => `<span class="mcell">${render(r[j] ?? '')}</span>`).join(''))
          .join('');
        atom(`<span class="mmat br-${br}" style="--cols:${cols}"><span class="mgrid">${cells}</span></span>`);
      } else if (cmd === ',' || cmd === ';' || cmd === ':' || cmd === ' ') {
        out += '<span class="msp"></span>';
      } else if (cmd === 'quad' || cmd === 'qquad') {
        out += `<span class="mquad"${cmd === 'qquad' ? ' style="width:2em"' : ''}></span>`;
      } else if (cmd === 'left' || cmd === 'right') {
        // Delimiters scale naturally with flex alignment; the next char is drawn as usual.
      } else if (cmd === '{' || cmd === '}' || cmd === '%' || cmd === '&' || cmd === '_' || cmd === '$') {
        atom(`<span class="mo">${esc(cmd)}</span>`);
      } else if (SYMBOLS[cmd]) {
        const [ch, kind] = SYMBOLS[cmd];
        if (kind === 'big') {
          // Σ with limits under/over.
          let sup = '';
          let sub = '';
          for (;;) {
            p.ws();
            if (p.peek() === '^') {
              p.i++;
              sup = render(p.group());
            } else if (p.peek() === '_') {
              p.i++;
              sub = render(p.group());
            } else break;
          }
          atom(`<span class="mbig">${sup ? `<span class="mlim">${sup}</span>` : ''}<span class="mbigc">${ch}</span>${sub ? `<span class="mlim">${sub}</span>` : ''}</span>`);
          continue;
        }
        if (kind === 'id') atom(`<span class="mi up">${ch}</span>`);
        else {
          out += `<span class="mo ${kind === 'rel' ? 'rel' : 'bin'}">${ch}</span>`;
          st.last = 'op';
        }
      } else {
        // Unknown command: show its name upright so mistakes are visible, never silently dropped.
        UNKNOWN_COMMANDS.add(cmd);
        atom(`<span class="mtext">${esc(cmd)}</span>`);
      }
      scripts();
      continue;
    }
    if (c === '{') {
      atom(`<span class="mg">${render(p.group())}</span>`);
      scripts();
      continue;
    }
    const num = /[0-9.]/.test(c) ? /^[0-9]*\.?[0-9]+|^[0-9]+\.?/.exec(src.slice(p.i)) : null;
    if (num) {
      const m = num;
      p.i += m[0].length;
      atom(`<span class="mn">${m[0]}</span>`);
      scripts();
      continue;
    }
    if (/[A-Za-z]/.test(c)) {
      p.i++;
      atom(`<span class="mi">${c}</span>`);
      scripts();
      continue;
    }
    p.i++;
    if (c === '-' || c === '−') {
      // Unary minus (at the start or after an operator/bracket) hugs its number.
      const unary = st.last !== 'atom';
      out += `<span class="mo ${unary ? 'un' : 'bin'}">−</span>`;
      st.last = 'op';
      continue;
    }
    if (c === '+' || c === '×' || c === '÷' || c === '±') {
      const unary = st.last !== 'atom';
      out += `<span class="mo ${unary ? 'un' : 'bin'}">${c}</span>`;
      st.last = 'op';
      continue;
    }
    if (c === '=' || c === '<' || c === '>' || c === '≤' || c === '≥' || c === '≠' || c === '≈') {
      out += `<span class="mo rel">${esc(c)}</span>`;
      st.last = 'op';
      continue;
    }
    if (c === '(' || c === '[') {
      out += `<span class="mo open">${c}</span>`;
      st.last = 'op';
      continue;
    }
    if (c === ')' || c === ']') {
      atom(`<span class="mo close">${c}</span>`);
      scripts();
      continue;
    }
    if (c === ',' || c === ';') {
      out += `<span class="mo punct">${c}</span>`;
      st.last = 'op';
      continue;
    }
    if (c === "'") {
      atom('<span class="mo">′</span>');
      scripts();
      continue;
    }
    atom(`<span class="mo">${esc(c)}</span>`);
    scripts();
  }
  return out;
}

/** Inline maths. */
export function mathHtml(src: string): string {
  return `<span class="m">${render(src)}</span>`;
}

/** Display maths (its own line, larger). */
export function mathBlock(src: string): string {
  return `<div class="m mblock">${render(src)}</div>`;
}

/**
 * The app's text markup: **bold**, $inline maths$, and line breaks. Everything else is escaped.
 * A literal dollar (rupees are written ₹) is never needed.
 */
/** Commands the renderer did not know (the content checker reports them). */
export const UNKNOWN_COMMANDS = new Set<string>();

export function richHtml(text: string): string {
  const parts = text.split('$');
  if (parts.length % 2 === 0) throw new Error(`unbalanced $ in: ${text}`);
  // Bold may span inline maths ("**Step 1. Make $D$.**"), so its state carries across the parts.
  let bold = false;
  let out = '';
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      out += mathHtml(part);
      return;
    }
    esc(part)
      .split('**')
      .forEach((seg, k) => {
        if (k > 0) {
          out += bold ? '</b>' : '<b>';
          bold = !bold;
        }
        out += seg.replace(/\n/g, '<br>');
      });
  });
  return bold ? `${out}</b>` : out;
}

/** Plain words for reading aloud (maths spoken simply). */
export function spokenText(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\$([^$]*)\$/g, (_, m: string) => spokenMath(m));
}

export function spokenMath(m: string): string {
  return m
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1 over $2')
    .replace(/\\sqrt\{([^{}]*)\}/g, 'root of $1')
    .replace(/\\times/g, ' times ')
    .replace(/\\div/g, ' divided by ')
    .replace(/\\sum/g, 'sum of')
    .replace(/\\bar\{x\}/g, 'x bar')
    .replace(/\\(mat|smat|det|vec)\{[^]*?\}/g, 'the matrix')
    .replace(/\\[A-Za-z]+/g, ' ')
    .replace(/[{}^_]/g, ' ')
    .replace(/-/g, ' minus ')
    .replace(/=/g, ' equals ')
    .replace(/\s+/g, ' ')
    .trim();
}
