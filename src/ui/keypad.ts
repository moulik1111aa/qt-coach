// Entry for checkpoints: a number pad (digits, point, minus, fraction bar, backspace) and a
// matrix grid filled cell by cell with the same pad. Values are written in blue ink, as the
// learner's own work. A physical keyboard works too.

import { h, escapeHtml, type App } from './app.ts';
import { ICONS } from './icons.ts';
import { mathHtml, richHtml } from './math.ts';
import type { Checkpoint } from '../content/types.ts';
import { matText } from '../core/grade.ts';

const KEYS = ['7', '8', '9', 'bk', '4', '5', '6', '−', '1', '2', '3', '/', '0', '.', 'next', 'ok'];

/** Apply one key to an entry string. */
export function applyKey(cur: string, k: string): string {
  if (k === 'bk') return cur.slice(0, -1);
  if (k === '−') return cur.startsWith('−') ? cur.slice(1) : `−${cur}`;
  if (k === '.') {
    const part = cur.split('/').pop() ?? '';
    return part.includes('.') ? cur : cur + (part === '' || part === '−' ? '0.' : '.');
  }
  if (k === '/') return cur.includes('/') || cur === '' || cur === '−' ? cur : `${cur}/`;
  if (/^\d$/.test(k)) return cur.length >= 14 ? cur : cur + k;
  return cur;
}

const show = (s: string) => (s ? mathHtml(s.replace(/\//g, '/')) : '<span class="kp-ph">tap the keys</span>');

export function openKeypad(app: App, cp: Checkpoint, initial: string, onSubmit: (v: string) => void): void {
  const a = cp.answer;
  if (a.kind === 'choice') throw new Error('choices are answered inline');
  const isMat = a.kind === 'matrix';
  const rows = isMat ? a.v.length : 1;
  const cols = isMat ? a.v[0].length : 1;
  const cells: string[][] = isMat
    ? (initial ? initial.split(';').map((r) => r.split(',')) : Array.from({ length: rows }, () => Array<string>(cols).fill('')))
    : [[initial]];
  let fr = 0;
  let fc = 0;

  const el = h(`<div class="kp-back">
    <div class="kp" role="dialog" aria-label="Enter ${escapeHtml(cp.ask.replace(/\$/g, ''))}">
      <div class="kp-head">
        <div class="kp-ask">${richHtml(cp.ask)}${a.kind === 'num' && a.dp > 0 ? `<span class="kp-dp">to ${a.dp} decimal place${a.dp > 1 ? 's' : ''}</span>` : ''}</div>
        <button class="icon-btn" data-close aria-label="Close">${ICONS.close}</button>
      </div>
      <div class="kp-show ${isMat ? 'mat' : ''}"></div>
      <div class="kp-keys">${KEYS.map((k) => {
        if (k === 'next') return isMat ? `<button class="kp-k fn" data-k="next">Next</button>` : '';
        if (k === 'ok') return `<button class="kp-k ok${isMat ? '' : ' wide'}" data-k="ok">Check</button>`;
        if (k === 'bk') return `<button class="kp-k fn" data-k="bk" aria-label="Delete">${ICONS.backspace}</button>`;
        return `<button class="kp-k${/\d/.test(k) ? '' : ' fn'}" data-k="${k}">${k}</button>`;
      }).join('')}</div>
    </div>
  </div>`);
  const showEl = el.querySelector<HTMLElement>('.kp-show')!;
  const okBtn = el.querySelector<HTMLButtonElement>('[data-k="ok"]')!;

  const draw = () => {
    if (isMat) {
      showEl.innerHTML = `<div class="kp-mat" style="--cols:${cols}">${cells
        .map((r, i) => r.map((c, j) => `<button class="kp-cell${i === fr && j === fc ? ' on' : ''}" data-r="${i}" data-c="${j}">${c ? mathHtml(c) : '<span class="kp-ph">·</span>'}</button>`).join(''))
        .join('')}</div>`;
      showEl.querySelectorAll<HTMLElement>('.kp-cell').forEach((b) =>
        b.addEventListener('click', () => {
          fr = Number(b.dataset.r);
          fc = Number(b.dataset.c);
          draw();
        }),
      );
      okBtn.disabled = cells.some((r) => r.some((c) => !c || c === '−'));
    } else {
      showEl.innerHTML = `<div class="kp-val">${show(cells[0][0])}</div>`;
      okBtn.disabled = !cells[0][0] || cells[0][0] === '−';
    }
  };
  const nextCell = () => {
    fc++;
    if (fc >= cols) {
      fc = 0;
      fr = (fr + 1) % rows;
    }
  };
  const press = (k: string) => {
    if (k === 'ok') {
      if (okBtn.disabled) return;
      close();
      onSubmit(isMat ? matText(cells.map((r) => r.map((c) => c.replace(/−/g, '-')))) : cells[0][0].replace(/−/g, '-'));
      return;
    }
    if (k === 'next') nextCell();
    else cells[fr][fc] = applyKey(cells[fr][fc], k);
    draw();
  };
  el.querySelectorAll<HTMLElement>('[data-k]').forEach((b) => b.addEventListener('click', () => press(b.dataset.k!)));
  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, string> = { Backspace: 'bk', Enter: 'ok', '-': '−', Tab: 'next', ' ': 'next' };
    const k = map[e.key] ?? (/^[\d./]$/.test(e.key) ? e.key : '');
    if (k) {
      e.preventDefault();
      press(k);
    }
  };
  document.addEventListener('keydown', onKey);
  const closeOverlay = app.openOverlay(el, () => close());
  function close() {
    document.removeEventListener('keydown', onKey);
    closeOverlay();
  }
  el.querySelector('[data-close]')!.addEventListener('click', close);
  el.addEventListener('click', (e) => {
    if (e.target === el) close();
  });
  draw();
  el.querySelector('.kp')!.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 200, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
}
