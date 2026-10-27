// Chapter, topic, Learn cards and the worked-example list.

import { h, escapeHtml, type App, type Screen } from './app.ts';
import { ICONS } from './icons.ts';
import { boardHtml, fitBoards, setBoardStep } from './boards.ts';
import { mathBlock, richHtml } from './math.ts';
import { showSheet, button } from './sheet.ts';
import { paperScreen } from './paper.ts';
import { checkScreen, shortListScreen } from './check.ts';
import { formulaScreen } from './revision.ts';
import { PRIMERS } from '../content/primers/index.ts';
import { chapterOf } from '../content/index.ts';
import { MASTERY_STREAK, stages, toughDone, toughUnlocked, shortPassed, topicComplete, type StageState } from '../core/progress.ts';
import { LEVEL_NAME, LEVELS, type Block, type Card, type Chapter, type Topic } from '../content/types.ts';

export function bar(app: App, kicker: string, title: string, right = ''): HTMLElement {
  const b = h(`<header class="bar">
    <button class="icon-btn" data-back aria-label="Back">${ICONS.back}</button>
    <div class="bar-title"><span class="bar-kicker">${escapeHtml(kicker)}</span><span>${escapeHtml(title)}</span></div>
    <span class="bar-right">${right}</span>
  </header>`);
  b.querySelector('[data-back]')!.addEventListener('click', () => app.handleBack());
  return b;
}

const stateMark = (s: StageState) =>
  s === 'done' ? `<span class="st done" aria-label="done">${ICONS.check}</span>` : s === 'next' ? `<span class="st next">Next</span>` : `<span class="st"></span>`;

export function chapterScreen(ch: Chapter): (app: App) => Screen {
  return (app) => {
    const el = h(`<div class="pg"><main class="chapter">
      <p class="unit-k">Unit ${ch.unit}</p>
      <h1>${escapeHtml(ch.title)}</h1>
      <p class="muted">${escapeHtml(ch.blurb)}</p>
      <ol class="topics ruled"></ol>
      <div class="ch-more"></div>
    </main></div>`);
    el.prepend(bar(app, 'Contents', ch.title));
    const draw = () => {
      const list = el.querySelector<HTMLElement>('.topics')!;
      list.innerHTML = ch.topics
        .map((t, i) => {
          const tp = app.save.topic(t.id);
          const st = stages(t, tp);
          const pips = (['learn', 'examples', 'paper', 'check'] as const)
            .filter((s) => s !== 'examples' || t.examples.length)
            .map((s) => `<i class="pip ${st[s]}"></i>`)
            .join('');
          const tough = t.kind === 'numeric' && toughDone(t, tp) ? '<span class="lvl tough">Tough ✓</span>' : '';
          return `<li class="tp"><button data-t="${i}"><span class="cp-n">${ch.n}.${i + 1}</span><span class="tp-body"><span class="tp-t">${escapeHtml(t.title)}</span><span class="tp-s muted">${escapeHtml(t.blurb)}</span><span class="pips" aria-label="${topicComplete(t, tp) ? 'complete' : 'in progress'}">${pips}${tough}</span></span></button></li>`;
        })
        .join('');
      list.querySelectorAll<HTMLElement>('[data-t]').forEach((b) => b.addEventListener('click', () => app.push(topicScreen(ch.topics[Number(b.dataset.t)]))));
    };
    const more = el.querySelector<HTMLElement>('.ch-more')!;
    more.append(button('Formula sheet', 'line wide', () => app.push(formulaScreen(ch))));
    draw();
    return { el, resumed: draw };
  };
}

export function topicScreen(t: Topic): (app: App) => Screen {
  return (app) => {
    const ch = chapterOf(t);
    const el = h(`<div class="pg"><main class="topic"></main></div>`);
    el.prepend(bar(app, ch.title, t.title));
    const main = el.querySelector<HTMLElement>('.topic')!;
    const draw = () => {
      const tp = app.save.topic(t.id);
      const st = stages(t, tp);
      const primers = (t.primers ?? []).map((id) => PRIMERS.find((p) => p.id === id)).filter((p) => !!p);
      const toughN = t.paper.filter((q) => q.level === 'tough').length;
      const rows: string[] = [];
      let n = 0;
      rows.push(stageRow(++n, 'learn', 'Learn', `${t.cards.length} cards`, st.learn));
      if (t.examples.length) {
        const extra = t.examples.filter((e) => e.source !== 'book-example').length;
        const book = t.examples.length - extra;
        rows.push(stageRow(++n, 'examples', 'Worked examples', `${book ? `${book} from the book, ` : ''}${extra} more at three levels`, st.examples));
      }
      if (t.kind === 'theory') {
        const passed = Object.values(tp.shortScores).filter((s) => s >= 0.7).length;
        rows.push(stageRow(++n, 'paper', 'Write short answers', shortPassed(t, tp) ? 'Done' : `${passed} written well so far`, st.paper));
      } else {
        rows.push(stageRow(++n, 'paper', 'Solve on paper', tp.mastered ? 'Mastered' : `Exam streak ${tp.streak} of ${MASTERY_STREAK}`, st.paper));
      }
      rows.push(stageRow(++n, 'check', 'Quick check', tp.checkBest ? `Best ${tp.checkBest} of 5` : '5 questions', st.check));
      main.innerHTML = `
        <p class="unit-k">Unit ${ch.unit}, book pages ${t.pages.join('–')}</p>
        <h1>${escapeHtml(t.title)}</h1>
        <p class="muted">${escapeHtml(t.blurb)}</p>
        ${primers.length ? `<div class="primers">${primers.map((p) => `<button class="primer" data-primer="${p.id}"><span class="primer-k">Before you start</span><span>${escapeHtml(p.title)}</span></button>`).join('')}</div>` : ''}
        <ol class="stages ruled">${rows.join('')}</ol>
        ${t.kind === 'numeric' ? `
        <section class="tough-box ${toughUnlocked(tp) ? '' : 'locked'}">
          <div><h3>Tough set</h3><p class="muted small">${toughUnlocked(tp) ? `${tp.tough.length} of ${toughN} solved clean` : 'Opens when the topic is mastered'}</p></div>
          <button class="btn ${toughUnlocked(tp) ? 'line' : 'line'}" data-tough ${toughUnlocked(tp) ? '' : 'disabled'}>${toughUnlocked(tp) ? 'Open' : ICONS.lock}</button>
        </section>
        <section class="levels">
          <h3>Practise one level</h3>
          <div class="seg">${LEVELS.map((l) => `<button data-level="${l}" ${l === 'tough' && !toughUnlocked(tp) ? 'disabled' : ''}>${LEVEL_NAME[l]}</button>`).join('')}</div>
        </section>` : ''}`;
      main.querySelectorAll<HTMLElement>('[data-stage]').forEach((b) => b.addEventListener('click', () => openStage(b.dataset.stage!)));
      main.querySelectorAll<HTMLElement>('[data-primer]').forEach((b) =>
        b.addEventListener('click', () => {
          const p = PRIMERS.find((x) => x.id === b.dataset.primer)!;
          app.push(learnScreen({ title: p.title, kicker: 'Before you start', cards: p.cards, onDone: () => app.save.update((d) => void (d.primersSeen.includes(p.id) || d.primersSeen.push(p.id))), practice: p.practice }));
        }),
      );
      main.querySelector('[data-tough]')?.addEventListener('click', () => app.push(paperScreen({ topic: t, src: { kind: 'tough' }, heading: 'Tough set' })));
      main.querySelectorAll<HTMLElement>('[data-level]').forEach((b) =>
        b.addEventListener('click', () => app.push(paperScreen({ topic: t, src: { kind: 'level', level: b.dataset.level as 'basic' }, heading: `${LEVEL_NAME[b.dataset.level as 'basic']} practice` }))),
      );
    };
    const openStage = (s: string) => {
      const place = (stage: 'learn' | 'examples' | 'paper' | 'check') => app.save.update((d) => (d.place = { topic: t.id, stage, at: app.now() }));
      if (s === 'learn') {
        place('learn');
        app.push(
          learnScreen({
            title: t.title,
            kicker: 'Learn',
            cards: t.cards,
            startAt: Math.min(app.save.topic(t.id).learnAt, t.cards.length - 1),
            onCard: (i) => app.save.update(() => {
              const tp = app.save.topic(t.id);
              tp.learnAt = Math.max(tp.learnAt, i);
            }),
            onDone: () => app.save.update(() => void (app.save.topic(t.id).learnDone = true)),
            nextLabel: t.examples.length ? 'Done: on to worked examples' : 'Done',
          }),
        );
      } else if (s === 'examples') {
        place('examples');
        app.push(examplesScreen(t));
      } else if (s === 'paper') {
        place('paper');
        app.push(t.kind === 'theory' ? shortListScreen(t) : paperScreen({ topic: t, src: { kind: 'ladder' } }));
      } else if (s === 'check') {
        place('check');
        app.push(checkScreen(t));
      }
    };
    draw();
    return { el, resumed: draw };
  };
}

function stageRow(n: number, id: string, name: string, sub: string, st: StageState): string {
  return `<li class="stage ${st}"><button data-stage="${id}"><span class="cp-n">${n}</span><span class="stage-body"><span class="stage-t">${escapeHtml(name)}</span><span class="stage-s muted">${escapeHtml(sub)}</span></span>${stateMark(st)}</button></li>`;
}

// ---- Learn cards ----

export function blockHtml(b: Block): string {
  if ('p' in b) return `<p>${richHtml(b.p)}</p>`;
  if ('math' in b) return mathBlock(b.math);
  if ('list' in b) return `<${b.ordered ? 'ol' : 'ul'} class="card-list">${b.list.map((x) => `<li>${richHtml(x)}</li>`).join('')}</${b.ordered ? 'ol' : 'ul'}>`;
  if ('def' in b) return `<div class="def"><b>${richHtml(b.def)}</b><span>${richHtml(b.text)}</span></div>`;
  if ('eg' in b) return `<div class="eg"><span class="eg-k">In business</span>${richHtml(b.eg)}</div>`;
  if ('tip' in b) return `<div class="tip">${richHtml(b.tip)}</div>`;
  if ('bookNote' in b) return `<div class="booknote"><b>Book note.</b> ${richHtml(b.bookNote)}</div>`;
  if ('board' in b) return boardHtml(b.board);
  return `<div class="board"><div class="bd-tablewrap"><table class="bd-table">${b.table.head ? `<thead><tr>${b.table.head.map((x) => `<th>${richHtml(x)}</th>`).join('')}</tr></thead>` : ''}<tbody>${b.table.rows.map((r) => `<tr>${r.map((x) => `<td>${richHtml(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
}

interface LearnOpts {
  title: string;
  kicker: string;
  cards: Card[];
  startAt?: number;
  onCard?: (i: number) => void;
  onDone?: () => void;
  nextLabel?: string;
  practice?: import('../content/types.ts').Mcq[];
}

export function learnScreen(o: LearnOpts): (app: App) => Screen {
  return (app) => {
    let i = o.startAt ?? 0;
    const el = h(`<div class="pg learn-pg"><main class="learn"></main><footer class="learn-foot"></footer></div>`);
    el.prepend(bar(app, o.kicker, o.title));
    const main = el.querySelector<HTMLElement>('.learn')!;
    const foot = el.querySelector<HTMLElement>('.learn-foot')!;
    const draw = () => {
      const c = o.cards[i];
      o.onCard?.(i);
      main.innerHTML = `<div class="card-count faint small">${i + 1} of ${o.cards.length}${c.page ? `<span>Book page ${c.page}</span>` : ''}</div>
        <div class="dots" aria-hidden="true">${o.cards.map((_, k) => `<i class="${k < i ? 'seen' : k === i ? 'on' : ''}"></i>`).join('')}</div>
        <article class="card"><h1>${richHtml(c.title)}</h1>${c.body.map(blockHtml).join('')}</article>`;
      main.querySelectorAll<HTMLElement>('.board').forEach((b) => setBoardStep(b, Infinity));
      fitBoards(main);
      foot.replaceChildren();
      const row = h('<div class="foot-row"></div>');
      if (i > 0) row.append(button('Back', 'line', () => ((i -= 1), draw(), window.scrollTo(0, 0))));
      if (i < o.cards.length - 1) row.append(button('Next', 'solid', () => ((i += 1), draw(), window.scrollTo(0, 0))));
      else
        row.append(
          button(o.practice?.length ? 'Practise' : (o.nextLabel ?? 'Done'), 'solid', () => {
            o.onDone?.();
            if (o.practice?.length) app.replace(checkScreen(null, { title: o.title, items: o.practice }));
            else app.pop();
          }),
        );
      foot.append(row);
    };
    draw();
    return { el };
  };
}

// ---- Worked examples ----

export function examplesScreen(t: Topic): (app: App) => Screen {
  return (app) => {
    const el = h(`<div class="pg"><main class="examples">
      <h1>Worked examples</h1>
      <p class="muted">Each one is shown a step at a time. Try every step on paper before you tap to see it.</p>
      <ol class="ex-list ruled"></ol>
    </main></div>`);
    el.prepend(bar(app, t.title, 'Worked examples'));
    const draw = () => {
      const tp = app.save.topic(t.id);
      const list = el.querySelector<HTMLElement>('.ex-list')!;
      list.innerHTML = t.examples
        .map(
          (e, i) => `<li class="ex"><button data-e="${i}"><span class="cp-n">${i + 1}</span><span class="ex-body"><span class="ex-t">${escapeHtml(e.title)}</span><span class="ex-s"><span class="lvl ${e.level}">${LEVEL_NAME[e.level]}</span>${e.source === 'book-example' ? '<span class="faint small">From the book</span>' : ''}</span></span>${tp.examplesDone.includes(e.id) ? `<span class="st done">${ICONS.check}</span>` : '<span class="st"></span>'}</button></li>`,
        )
        .join('');
      list.querySelectorAll<HTMLElement>('[data-e]').forEach((b) =>
        b.addEventListener('click', () => {
          const e = t.examples[Number(b.dataset.e)];
          showSheet(app, e, {
            mode: 'walk',
            onDone: () => {
              app.save.update(() => {
                const tp2 = app.save.topic(t.id);
                if (!tp2.examplesDone.includes(e.id)) tp2.examplesDone.push(e.id);
              });
              draw();
            },
          });
        }),
      );
    };
    draw();
    return { el, resumed: draw };
  };
}
