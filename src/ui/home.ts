// First run and Home. Home reads like the book's contents page: unit numbers in the margin,
// chapter titles, and how many topics are complete.

import { h, escapeHtml, type App, type Screen } from './app.ts';
import { ICONS } from './icons.ts';
import { CHAPTERS, topicById } from '../content/index.ts';
import { topicComplete } from '../core/progress.ts';
import { chapterScreen, topicScreen } from './course.ts';
import { revisionScreen } from './revision.ts';
import { settingsScreen } from './settings.ts';
import type { Chapter } from '../content/types.ts';

/** Build 1 chapters still to come in later updates (book unit, title). */
export const UPCOMING: [number, string][] = [
  [4, 'Functions'],
  [5, 'Equations'],
  [6, 'Progression'],
  [8, 'Data and graphs'],
  [9, 'Central tendency'],
  [10, 'Dispersion'],
];

const STAGE_NAME = { learn: 'Learn', examples: 'Worked examples', paper: 'Solve on paper', check: 'Quick check', tough: 'Tough set' } as const;

export function firstRunScreen(app: App): Screen {
  const el = h(`<div class="pg first">
    <main class="first-main">
      <div class="first-mark" aria-hidden="true">Aiio</div>
      <h1>Learn Quantitative Techniques the way the exam asks for it.</h1>
      <p class="muted">Every topic from <i>Quantitative Techniques for Managers</i>, explained from the start, with worked examples at three levels.</p>
      <ol class="first-how ruled">
        <li><span class="cp-n">1</span><div><b>Read</b> short cards that explain the book in plain language.</div></li>
        <li><span class="cp-n">2</span><div><b>Watch</b> worked examples, one step at a time.</div></li>
        <li><span class="cp-n">3</span><div><b>Solve on paper</b> and enter the key values. If one is off, you see exactly which step went wrong.</div></li>
      </ol>
      <p class="first-kit">${ICONS.pen}<span>Keep paper, a pen and your calculator beside you.</span></p>
    </main>
    <footer class="first-foot"><button class="btn solid wide" data-go>Start with Chapter 1</button></footer>
  </div>`);
  el.querySelector('[data-go]')!.addEventListener('click', () => {
    app.save.update((d) => {
      d.started = true;
    });
    app.reset(homeScreen);
  });
  return { el };
}

function chapterDone(app: App, ch: Chapter): number {
  return ch.topics.filter((t) => topicComplete(t, app.save.topic(t.id))).length;
}

export function homeScreen(app: App): Screen {
  const el = h(`<div class="pg home">
    <header class="home-top">
      <div>
        <div class="brand">Aiio</div>
        <div class="faint small">Quantitative Techniques for Managers</div>
      </div>
      <button class="icon-btn" data-settings aria-label="Settings">${ICONS.settings}</button>
    </header>
    <main>
      <div class="continue-slot"></div>
      <h2 class="sec">Contents</h2>
      <ol class="contents ruled"></ol>
      <h2 class="sec">Revision</h2>
      <div class="rev-links"></div>
    </main>
  </div>`);
  el.querySelector('[data-settings]')!.addEventListener('click', () => app.push(settingsScreen));

  const draw = () => {
    const slot = el.querySelector<HTMLElement>('.continue-slot')!;
    const place = app.save.data.place;
    const t = place ? topicById(place.topic) : undefined;
    slot.replaceChildren();
    if (t && place) {
      const c = h(`<button class="continue">
        <span class="continue-k">Continue</span>
        <span class="continue-t">${escapeHtml(t.title)}</span>
        <span class="continue-s muted">${STAGE_NAME[place.stage]}</span>
        <span class="continue-go">${ICONS.next}</span>
      </button>`);
      c.addEventListener('click', () => app.push(topicScreen(t)));
      slot.append(c);
    }
    const list = el.querySelector<HTMLElement>('.contents')!;
    const rows = [
      ...CHAPTERS.map((ch) => ({ unit: ch.unit, title: ch.title, ch })),
      ...UPCOMING.filter(([u]) => !CHAPTERS.some((c) => c.unit === u)).map(([unit, title]) => ({ unit, title, ch: undefined as Chapter | undefined })),
    ].sort((a, b) => a.unit - b.unit);
    list.innerHTML = rows
      .map((r) => {
        if (!r.ch) return `<li class="toc soon"><span class="cp-n">${r.unit}</span><div class="toc-body"><span class="toc-t">${escapeHtml(r.title)}</span><span class="toc-s faint">Coming in the next update</span></div></li>`;
        const done = chapterDone(app, r.ch);
        const n = r.ch.topics.length;
        return `<li class="toc"><button data-ch="${r.ch.n}"><span class="cp-n">${r.unit}</span><span class="toc-body"><span class="toc-t">${escapeHtml(r.title)}</span><span class="toc-s muted">${done ? `${done} of ${n} topics complete` : `${n} topic${n === 1 ? '' : 's'}`}</span></span><span class="toc-bar" style="--p:${n ? done / n : 0}"></span></button></li>`;
      })
      .join('');
    list.querySelectorAll<HTMLElement>('[data-ch]').forEach((b) =>
      b.addEventListener('click', () => {
        const ch = CHAPTERS.find((c) => c.n === Number(b.dataset.ch))!;
        app.push(chapterScreen(ch));
      }),
    );
    const rev = el.querySelector<HTMLElement>('.rev-links')!;
    const m = app.save.data.mistakes.length;
    rev.innerHTML = `<button class="rev" data-rev="formulas">${ICONS.sigma}<span><b>Formula sheets</b><span class="muted small">Every formula, chapter by chapter</span></span></button>
      <button class="rev" data-rev="mistakes">${ICONS.flag}<span><b>Mistake bank</b><span class="muted small">${m ? `${m} to revise` : 'Values you got wrong come here'}</span></span></button>`;
    rev.querySelectorAll<HTMLElement>('[data-rev]').forEach((b) => b.addEventListener('click', () => app.push(revisionScreen(b.dataset.rev as 'formulas' | 'mistakes'))));
  };
  draw();
  return { el, resumed: draw };
}
