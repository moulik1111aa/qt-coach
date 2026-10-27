// Keep display maths inside the screen. A line wider than its box is first broken into
// shorter lines at its "=" signs (also after a label such as "Row 1:" and after ", " between
// separate results), the way working is written on paper:
//     D = 3 × 5 − 4 × 2
//       = 15 − 8 = 7
// A piece that is still too wide is broken again before a + or −. Anything still too wide is
// scaled down (to no less than 70%), and beyond that scrolls sideways.

const original = new WeakMap<HTMLElement, string>();
const BREAK_BEFORE = new Set(['=', '⇒', '→']);

export function fitMath(root: ParentNode): void {
  requestAnimationFrame(() => {
    for (const m of root.querySelectorAll<HTMLElement>('.mblock')) fitOne(m);
  });
}

function fitOne(m: HTMLElement): void {
  const box = m.parentElement;
  if (!box) return;
  const before = original.get(m);
  if (before !== undefined) {
    m.innerHTML = before;
    m.classList.remove('msplit');
    original.delete(m);
  }
  m.style.zoom = '';
  const avail = box.clientWidth - 2;
  if (avail <= 0 || m.scrollWidth <= avail + 2) return;
  const widest = split(m, avail) ?? m.scrollWidth;
  if (widest > avail) m.style.zoom = String(Math.max(0.7, avail / widest));
}

const isEl = (n: Node | undefined, cls: string): n is HTMLElement => n instanceof HTMLElement && n.classList.contains(cls);

/** Cut a run of nodes into pieces; `at(i)` says whether a new piece starts at node i, `skip` drops spacing. */
function cut(nodes: Node[], at: (n: Node, i: number) => 'start' | 'after' | null): Node[][] {
  const out: Node[][] = [[]];
  nodes.forEach((n, i) => {
    const k = at(n, i);
    if (k === 'start' && out[out.length - 1].length) out.push([]);
    out[out.length - 1].push(n);
    if (k === 'after') out.push([]);
  });
  return out.filter((p) => p.some((n) => !isEl(n, 'mquad') && !isEl(n, 'msp')));
}

/** Break the line into several; returns the widest new line, or null when it cannot be broken. */
function split(m: HTMLElement, avail: number): number | null {
  const kids = [...m.childNodes];
  // Level 1: before "=", after a "label:", after ", \quad".
  const parts = cut(kids, (n, i) => {
    if (isEl(n, 'rel') && BREAK_BEFORE.has(n.textContent?.trim() ?? '')) return 'start';
    if (isEl(n, 'mtext') && /:\s*$/.test(n.textContent ?? '')) return 'after';
    if (isEl(n, 'punct') && n.textContent === ',' && isEl(kids[i + 1], 'mquad')) return 'after';
    return null;
  }).map((p) => p.filter((n, i) => !(i === 0 && (isEl(n, 'mquad') || isEl(n, 'msp')))));
  if (parts.length < 2 && !kids.some((n) => isEl(n, 'bin'))) return null;

  original.set(m, m.innerHTML);
  m.replaceChildren();
  m.classList.add('msplit');
  const indent = parseFloat(getComputedStyle(m).fontSize) || 16;

  const piece = (nodes: Node[]) => {
    const s = document.createElement('span');
    s.className = 'mseg';
    s.append(...nodes);
    return s;
  };
  const widthOf = (spans: HTMLElement[]) => {
    const probe = document.createElement('div');
    probe.className = 'mline';
    probe.append(...spans);
    m.append(probe);
    const ws = spans.map((s) => s.getBoundingClientRect().width);
    probe.remove();
    return ws;
  };
  // Level 2: a piece wider than a line is cut again before its + and − signs.
  const spans: { s: HTMLElement; w: number }[] = [];
  const level1 = parts.map(piece);
  widthOf(level1).forEach((w, i) => {
    if (w <= avail - indent) return spans.push({ s: level1[i], w });
    const sub = cut([...level1[i].childNodes], (n) => (isEl(n, 'bin') ? 'start' : null)).map(piece);
    if (sub.length < 2) return spans.push({ s: level1[i], w });
    const ws = widthOf(sub);
    sub.forEach((s, k) => spans.push({ s, w: ws[k] }));
  });
  if (spans.length < 2) {
    m.innerHTML = original.get(m)!;
    m.classList.remove('msplit');
    original.delete(m);
    return null;
  }

  // Pack greedily into lines that fit; continuation lines are indented a little.
  let line: HTMLElement | null = null;
  let used = 0;
  let widest = 0;
  for (const { s, w } of spans) {
    const room = avail - (line && m.firstChild !== line ? indent : 0);
    if (!line || used + w > room) {
      line = document.createElement('div');
      line.className = m.childElementCount ? 'mline cont' : 'mline';
      m.append(line);
      used = 0;
    }
    line.append(s);
    used += w;
    widest = Math.max(widest, used + (line.classList.contains('cont') ? indent : 0));
  }
  return widest;
}
