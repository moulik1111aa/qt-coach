// The "Let's learn how" sheet (adapted from MN's lesson): the question, what was entered and the
// answer, the slip's note, a board that builds up, and numbered steps in the answer-book margin.
//
// Modes:
//   walk — a worked example: steps appear one at a time ("Try this step on paper, then tap").
//   help — after a wrong checkpoint (or "Show this step"): the steps that lead to that value.
//   full — the whole solution.

import { h, escapeHtml, type App } from './app.ts';
import { boardHtml, fitBoards, setBoardStep } from './boards.ts';
import { fitMath } from './fit.ts';
import { mathBlock, mathHtml, richHtml, spokenText } from './math.ts';
import { ICONS } from './icons.ts';
import { answerText, matRows } from '../core/grade.ts';
import { LEVEL_NAME, type Answer, type Checkpoint, type PaperQuestion } from '../content/types.ts';
import type { Slip, Step } from '../teach/types.ts';

export interface SheetOpts {
  mode: 'walk' | 'help' | 'full';
  /** help: the checkpoint being explained, what was entered (none for "Show this step"), its slip. */
  cp?: Checkpoint;
  given?: string;
  slip?: Slip | null;
  /** help: steps before this index are folded away as "earlier steps". */
  fromStep?: number;
  /** Close label (default "Got it"). */
  doneLabel?: string;
  onDone?: () => void;
  /** Offer "Try a similar one" (generated questions). */
  onSimilar?: () => void;
}

/** A value as the app shows it: numbers, a matrix, or a choice. */
export function valueHtml(a: Answer, v: string): string {
  if (a.kind === 'matrix') {
    const rows = matRows(v);
    return mathHtml(`\\mat{${rows.map((r) => r.map((x) => x || '?').join(' & ')).join(' \\\\ ')}}`);
  }
  if (a.kind === 'num') return mathHtml(v.replace(/^-/, '−'));
  return escapeHtml(v);
}

function stepHtml(s: Step, i: number): string {
  const math = (s.math ?? []).map((m) => mathBlock(m)).join('');
  return `<li class="step${s.end ? ' end' : ''}" data-i="${i}">
    <span class="step-n" aria-hidden="true">${s.end ? ICONS.check : i + 1}</span>
    <div class="step-body">
      <p class="step-say">${richHtml(s.say)}</p>
      ${math ? `<div class="step-math">${math}</div>` : ''}
      ${s.after ? `<p class="step-after">${richHtml(s.after)}</p>` : ''}
      ${s.bookNote ? `<div class="booknote"><b>Book note.</b> ${richHtml(s.bookNote)}</div>` : ''}
    </div>
  </li>`;
}

export function showSheet(app: App, q: PaperQuestion, o: SheetOpts): void {
  const steps = q.lesson.steps;
  const last = steps.length - 1;
  // Which steps to show.
  let shownTo = o.mode === 'walk' ? 0 : o.mode === 'help' ? (o.cp?.step ?? last) : last;
  const from = o.mode === 'help' ? Math.min(o.fromStep ?? 0, shownTo) : 0;

  const chips =
    o.mode === 'help' && o.cp && o.given !== undefined
      ? `<div class="chips"><span class="chip said">You said ${valueHtml(o.cp.answer, o.given)}</span><span class="chip ans">Answer ${valueHtml(o.cp.answer, answerText(o.cp.answer))}</span></div>`
      : '';
  const note = o.slip ? `<div class="slipnote">${richHtml(o.slip.note)}</div>` : '';
  const heading =
    o.mode === 'help' && o.cp
      ? `<h2 class="sheet-q">${richHtml(o.cp.ask)}</h2>`
      : `<h2 class="sheet-q">${escapeHtml(q.title)} <span class="lvl ${q.level}">${LEVEL_NAME[q.level]}</span></h2>`;
  const prompt = o.mode === 'help' ? '' : `<div class="sheet-prompt">${richHtml(q.prompt)}</div>${q.data && !q.lesson.board ? boardHtml(q.data) : ''}`;
  const bookNote = q.bookNote && o.mode !== 'help' ? `<div class="booknote"><b>Book note.</b> ${richHtml(q.bookNote)}</div>` : '';
  const folded =
    from > 0 ? `<button class="earlier" type="button">Show the ${from} earlier step${from > 1 ? 's' : ''}</button>` : '';

  const el = h(`<div class="sheet-back">
    <section class="sheet" role="dialog" aria-modal="true" aria-label="Let's learn how">
      <header class="sheet-top">
        <span class="sheet-kicker">Let's learn how</span>
        <span class="sheet-tools">
          ${app.voice.available && app.save.data.settings.readAloud ? `<button class="icon-btn" data-speak aria-label="Read aloud">${ICONS.speaker}</button>` : ''}
          <button class="icon-btn" data-close aria-label="Close">${ICONS.close}</button>
        </span>
      </header>
      <div class="sheet-scroll">
        ${heading}
        ${chips}
        ${note}
        ${prompt}
        ${bookNote}
        ${q.lesson.board ? `<div class="sheet-board">${boardHtml(q.lesson.board)}</div>` : ''}
        ${folded}
        <ol class="steps ruled">${steps.map(stepHtml).join('')}</ol>
      </div>
      <footer class="sheet-foot"></footer>
    </section>
  </div>`);

  const foot = el.querySelector<HTMLElement>('.sheet-foot')!;
  const boardEl = el.querySelector<HTMLElement>('.sheet-board');
  const stepEls = [...el.querySelectorAll<HTMLElement>('.step')];
  let showEarlier = false;

  const render = (scroll: boolean) => {
    stepEls.forEach((s, i) => {
      const visible = i <= shownTo && (i >= from || showEarlier);
      s.hidden = !visible;
      s.classList.toggle('current', o.mode === 'walk' && i === shownTo);
    });
    if (boardEl) setBoardStep(boardEl, shownTo);
    fitMath(el);
    foot.replaceChildren();
    if (o.mode === 'walk' && shownTo < last) {
      foot.append(
        h(`<p class="foot-hint">Try step ${shownTo + 2} on paper, then tap to check.</p>`),
        button(`Show step ${shownTo + 2}`, 'solid wide', () => {
          shownTo++;
          render(true);
          if (app.save.data.settings.readAloud) speakStep(shownTo);
        }),
      );
    } else {
      const row = h('<div class="foot-row"></div>');
      if (o.onSimilar) row.append(button('Try a similar one', 'line', () => finish(o.onSimilar)));
      row.append(button(o.doneLabel ?? 'Got it', 'solid', () => finish(o.onDone)));
      foot.append(row);
    }
    if (scroll) {
      const cur = stepEls[shownTo];
      cur?.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'ease-out' });
      cur?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };
  const speakStep = (i: number) => {
    const s = steps[i];
    app.voice.say(spokenText(`${s.say} ${s.after ?? ''}`));
  };
  const finish = (fn?: () => void) => {
    app.voice.stop();
    closeOverlay();
    fn?.();
  };
  const closeOverlay = app.openOverlay(el, () => finish(o.mode === 'help' ? o.onDone : undefined));
  el.querySelector('[data-close]')!.addEventListener('click', () => finish(o.mode === 'help' ? o.onDone : undefined));
  el.querySelector('[data-speak]')?.addEventListener('click', () => speakStep(shownTo));
  el.querySelector('.earlier')?.addEventListener('click', (e) => {
    showEarlier = true;
    (e.currentTarget as HTMLElement).remove();
    render(false);
  });
  render(false);
  fitBoards(el);
  el.querySelector('.sheet')!.animate([{ transform: 'translateY(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }], {
    duration: 260,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  });
  if (o.mode === 'help' && app.save.data.settings.readAloud && o.slip) app.voice.say(spokenText(o.slip.note));
}

export function button(label: string, cls: string, onClick: () => void): HTMLElement {
  const b = h(`<button class="btn ${cls}" type="button">${escapeHtml(label)}</button>`);
  b.addEventListener('click', onClick);
  return b;
}
