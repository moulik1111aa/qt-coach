// Boards: the picture in a "Let's learn how" sheet that builds up with the steps.
// boardHtml() draws every item once; setBoardStep() shows, hides and highlights items for the
// current step from their data-at / data-until / data-hl / data-hlu attributes (like MN).

import type { Board, LinesBoard, MatsBoard, MatTerm, TableBoard, Timed } from '../teach/types.ts';
import { mathHtml, richHtml } from './math.ts';

const timed = (t: Timed): string => {
  let s = ' data-t';
  if (t.at !== undefined) s += ` data-at="${t.at}"`;
  if (t.until !== undefined) s += ` data-until="${t.until}"`;
  if (t.hl !== undefined) s += ` data-hl="${t.hl}"`;
  if (t.hlUntil !== undefined) s += ` data-hlu="${t.hlUntil}"`;
  return s;
};

function tableHtml(b: TableBoard): string {
  const head = b.head ? `<thead><tr>${b.head.map((h) => `<th>${richHtml(h)}</th>`).join('')}${b.rows.some((r) => r.note) ? '<th></th>' : ''}</tr></thead>` : '';
  const anyNote = b.rows.some((r) => r.note);
  const body = b.rows
    .map((r) => {
      const cells = r.cells
        .map((c, i) => {
          const cell = typeof c === 'string' ? { v: c } : c;
          const tag = b.label && i === 0 ? 'th' : 'td';
          const tone = 'tone' in cell && cell.tone ? ` class="tn-${cell.tone}"` : '';
          return `<${tag}${tone}${typeof c === 'string' ? '' : timed(c)}>${richHtml(cell.v)}</${tag}>`;
        })
        .join('');
      const note = anyNote ? `<td class="bd-note">${r.note ? richHtml(r.note) : ''}</td>` : '';
      return `<tr${timed(r)}>${cells}${note}</tr>`;
    })
    .join('');
  const cap = b.caption ? `<div class="bd-cap">${richHtml(b.caption)}</div>` : '';
  return `<div class="bd-tablewrap"><table class="bd-table">${head}<tbody>${body}</tbody></table></div>${cap}`;
}

function matHtml(t: MatTerm): string {
  const rows = t.cells.length;
  const cols = Math.max(...t.cells.map((r) => r.length));
  const fills = new Map((t.fill ?? []).map((f) => [`${f.r},${f.c}`, f]));
  let cells = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const f = fills.get(`${r},${c}`);
      cells += `<span class="bd-cell" style="grid-row:${r + 1};grid-column:${c + 1}"${f ? timed(f) : ''}>${mathHtml(t.cells[r][c] ?? '')}</span>`;
    }
  }
  let marks = '';
  let lines = '';
  for (const m of t.marks ?? []) {
    const tone = m.tone ? ` tone-${m.tone}` : '';
    if (m.type === 'strike-row' && m.j !== undefined) {
      // Grey out the row but leave the element at (i, j) visible.
      const r = (m.i ?? 0) + 1;
      if (m.j > 0) marks += `<span class="bd-mark ${m.type}" style="grid-row:${r};grid-column:1 / ${m.j + 1}"${timed(m)}></span>`;
      if (m.j < cols - 1) marks += `<span class="bd-mark ${m.type}" style="grid-row:${r};grid-column:${m.j + 2} / -1"${timed(m)}></span>`;
    } else if (m.type === 'strike-col' && m.i !== undefined) {
      const c = (m.j ?? 0) + 1;
      if (m.i > 0) marks += `<span class="bd-mark ${m.type}" style="grid-column:${c};grid-row:1 / ${m.i + 1}"${timed(m)}></span>`;
      if (m.i < rows - 1) marks += `<span class="bd-mark ${m.type}" style="grid-column:${c};grid-row:${m.i + 2} / -1"${timed(m)}></span>`;
    } else if (m.type === 'row' || m.type === 'strike-row') {
      marks += `<span class="bd-mark ${m.type}${tone}" style="grid-row:${(m.i ?? 0) + 1};grid-column:1 / -1"${timed(m)}></span>`;
    } else if (m.type === 'col' || m.type === 'strike-col') {
      marks += `<span class="bd-mark ${m.type}${tone}" style="grid-column:${(m.j ?? 0) + 1};grid-row:1 / -1"${timed(m)}></span>`;
    } else if (m.type === 'cell') {
      marks += `<span class="bd-mark cell${tone}" style="grid-row:${(m.i ?? 0) + 1};grid-column:${(m.j ?? 0) + 1}"${timed(m)}></span>`;
    } else {
      // 2×2 cross-multiplication: main diagonal or the other one.
      const [x1, y1, x2, y2] = m.type === 'diag' ? [18, 18, 82, 82] : [82, 18, 18, 82];
      lines += `<svg class="bd-x ${m.type}${tone}" viewBox="0 0 100 100" preserveAspectRatio="none"${timed(m)}><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/></svg>`;
    }
  }
  const name = t.name ? `<span class="bd-name">${richHtml(t.name)}</span>` : '';
  return `<span class="bd-term"${timed(t)}>${name}<span class="bd-mat br-${t.br}"><span class="bd-grid" style="--cols:${cols};--rows:${rows}">${marks}${cells}</span>${lines}</span></span>`;
}

function matsHtml(b: MatsBoard): string {
  const terms = b.terms
    .map((t) => (t.kind === 'op' ? `<span class="bd-op"${timed(t)}>${mathHtml(t.text)}</span>` : matHtml(t)))
    .join('');
  const cap = b.caption ? `<div class="bd-cap">${richHtml(b.caption)}</div>` : '';
  return `<div class="bd-mats">${terms}</div>${cap}`;
}

function linesHtml(b: LinesBoard): string {
  return `<div class="bd-lines">${b.lines
    .map((l) => `<div class="bd-line${l.tone ? ` tn-${l.tone}` : ''}"${timed(l)}>${mathHtml(l.math)}</div>`)
    .join('')}</div>`;
}

export function boardHtml(b: Board): string {
  const inner = b.kind === 'table' ? tableHtml(b) : b.kind === 'mats' ? matsHtml(b) : linesHtml(b);
  return `<div class="board board-${b.kind}">${inner}</div>`;
}

/** Show the board as it is at `step` (Infinity: everything, final state). */
export function setBoardStep(root: HTMLElement, step: number): void {
  for (const el of root.querySelectorAll<HTMLElement>('[data-t]')) {
    const d = el.dataset;
    const at = d.at ? Number(d.at) : 0;
    const until = d.until ? Number(d.until) : Infinity;
    const shown = at <= step && (until === Infinity || step < until);
    const hl = d.hl ? Number(d.hl) : Infinity;
    const hlu = d.hlu ? Number(d.hlu) : Infinity;
    el.classList.toggle('off', !shown);
    el.classList.toggle('lit', shown && hl <= step && (hlu === Infinity || step < hlu) && step !== Infinity);
  }
}

/**
 * Fit wide matrix boards to their box: shrink a little (to 85%); if that is not enough, let the
 * terms wrap onto a second line ("A + B" above "= C"); then shrink again (to 70%). Anything
 * still wider scrolls sideways.
 */
export function fitBoards(root: ParentNode): void {
  requestAnimationFrame(() => {
    for (const b of root.querySelectorAll<HTMLElement>('.board.board-mats')) {
      const inner = b.querySelector<HTMLElement>('.bd-mats');
      if (!inner) continue;
      inner.style.zoom = '';
      inner.classList.remove('wrap');
      const avail = b.clientWidth - 24;
      if (avail <= 0) continue;
      let need = inner.scrollWidth;
      if (need <= avail) continue;
      if (avail / need < 0.85) {
        inner.classList.add('wrap');
        // Width of the widest wrapped line: the terms' extents.
        const terms = [...inner.children] as HTMLElement[];
        const lines = new Map<number, number>();
        for (const t of terms) {
          if (t.offsetParent === null) continue;
          const r = t.getBoundingClientRect();
          const top = Math.round(r.top);
          const ext = lines.get(top) ?? 0;
          lines.set(top, ext + r.width + 4);
        }
        need = Math.max(...lines.values(), 0);
        if (need <= avail) continue;
      }
      inner.style.zoom = String(Math.max(0.7, avail / need));
    }
  });
}
