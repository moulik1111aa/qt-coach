// Quick check (5 MCQs: concept questions plus numerical ones built from the generators) and
// short-answer practice for theory topics.

import { h, type App, type Screen } from './app.ts';
import { ICONS } from './icons.ts';
import { richHtml } from './math.ts';
import { bar } from './course.ts';
import { button } from './sheet.ts';
import { createRng, type Rng } from '../core/rng.ts';
import { addMistake, CHECK_PASS, CHECK_SIZE, recordCheck, recordShort, reviseMistake, SHORT_PASS } from '../core/progress.ts';
import { LEVEL_NAME, type Mcq, type ShortAnswer, type Topic } from '../content/types.ts';

/** Five questions: up to two numerical ones from generators, the rest concept MCQs. */
export function buildCheck(t: Topic, rng: Rng): { m: Mcq; gen?: { id: string; level: 'basic' | 'exam' | 'tough' } }[] {
  const out: { m: Mcq; gen?: { id: string; level: 'basic' | 'exam' | 'tough' } }[] = [];
  const gens = t.gens.filter((g) => g.mcq);
  for (let i = 0; i < Math.min(2, gens.length ? 2 : 0); i++) {
    const g = gens[i % gens.length];
    const level = g.levels.includes('exam') ? 'exam' : g.levels[0];
    try {
      out.push({ m: g.mcq!(createRng(rng.int(1, 1e9)), level), gen: { id: g.id, level } });
    } catch {
      /* fall back to concept questions */
    }
  }
  const concept = rng.shuffle([...t.mcqs]);
  for (const m of concept) {
    if (out.length >= CHECK_SIZE) break;
    out.push({ m });
  }
  return rng.shuffle(out);
}

interface CheckOpts {
  title: string;
  items: Mcq[];
  mistakeKey?: string;
}

export function checkScreen(t: Topic | null, o?: CheckOpts): (app: App) => Screen {
  return (app) => {
    const rng = createRng(app.now() % 1e9);
    const items = t ? buildCheck(t, rng) : (o?.items ?? []).map((m) => ({ m, gen: undefined }));
    const title = t ? 'Quick check' : (o?.title ?? 'Practice');
    const el = h(`<div class="pg"><main class="mcq-pg"></main></div>`);
    el.prepend(bar(app, t ? t.title : 'Practice', title));
    const main = el.querySelector<HTMLElement>('.mcq-pg')!;
    let i = 0;
    let score = 0;

    const draw = () => {
      if (i >= items.length) return finish();
      const { m, gen } = items[i];
      const order = rng.shuffle(m.options.map((_, k) => k));
      main.innerHTML = `<div class="card-count faint small">Question ${i + 1} of ${items.length}<span class="lvl ${m.level}">${LEVEL_NAME[m.level]}</span></div>
        <div class="mcq-stem">${richHtml(m.stem)}</div>
        <div class="mcq-opts">${order.map((k, n) => `<button class="opt" data-k="${k}"><span class="opt-l">${'ABCD'[n] ?? n + 1}</span><span class="opt-t">${richHtml(m.options[k])}</span></button>`).join('')}</div>
        <div class="mcq-after"></div>`;
      main.querySelectorAll<HTMLButtonElement>('.opt').forEach((b) =>
        b.addEventListener('click', () => {
          const k = Number(b.dataset.k);
          const right = k === m.answer;
          if (right) score++;
          main.querySelectorAll<HTMLButtonElement>('.opt').forEach((x) => {
            x.disabled = true;
            const kk = Number(x.dataset.k);
            if (kk === m.answer) x.classList.add('right');
            else if (kk === k) x.classList.add('wrong');
          });
          if (!right && t) {
            app.save.update((d) =>
              addMistake(d, gen ? { key: `${t.id}/${gen.id}/mcq`, topic: t.id, gen, label: 'Quick check numerical question' } : { key: `${t.id}/mcq/${m.id}`, topic: t.id, mcq: m.id, label: plain(m.stem) }, app.now()),
            );
          }
          if (o?.mistakeKey) app.save.update((d) => void reviseMistake(d, o.mistakeKey!, right, app.now()));
          const after = main.querySelector<HTMLElement>('.mcq-after')!;
          after.innerHTML = `<div class="why ${right ? 'ok' : 'no'}"><b>${right ? 'Right.' : 'Not quite.'}</b> ${richHtml(m.why)}</div>`;
          after.append(button(i < items.length - 1 ? 'Next question' : 'See your score', 'solid wide', () => ((i += 1), draw(), window.scrollTo(0, 0))));
          after.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }),
      );
    };

    const finish = () => {
      if (t) app.save.update(() => recordCheck(app.save.topic(t.id), score, app.now()));
      const passed = score >= CHECK_PASS;
      main.innerHTML = `<div class="score">
        <div class="score-n">${score}<span>/${items.length}</span></div>
        <h2>${t ? (passed ? 'Quick check passed' : 'Not yet') : 'Done'}</h2>
        <p class="muted">${t ? (passed ? 'This topic is complete once Solve on paper is mastered too.' : `You need ${CHECK_PASS} of ${CHECK_SIZE}. The questions you missed are in the mistake bank.`) : ''}</p>
      </div>`;
      const row = h('<div class="foot-row"></div>');
      if (t) row.append(button('Try again', 'line', () => app.replace(checkScreen(t))));
      row.append(button('Done', 'solid', () => app.pop()));
      main.append(row);
    };
    draw();
    return { el };
  };
}

const plain = (s: string) => s.replace(/\$[^$]*\$/g, '…').replace(/\*\*/g, '').slice(0, 90);

// ---- Short answers (theory topics) ----

export function shortListScreen(t: Topic): (app: App) => Screen {
  return (app) => {
    const el = h(`<div class="pg"><main class="short-pg">
      <h1>Write short answers</h1>
      <p class="muted">Write each answer on paper as you would in the exam. Then compare it with the model answer and tick the points you covered.</p>
      <ol class="ex-list ruled"></ol>
    </main></div>`);
    el.prepend(bar(app, t.title, 'Short answers'));
    const draw = () => {
      const tp = app.save.topic(t.id);
      const list = el.querySelector<HTMLElement>('.ex-list')!;
      list.innerHTML = (t.short ?? [])
        .map((s, i) => {
          const sc = tp.shortScores[s.id];
          return `<li class="ex"><button data-s="${i}"><span class="cp-n">${i + 1}</span><span class="ex-body"><span class="ex-t">${richHtml(s.prompt)}</span><span class="ex-s faint small">${s.marks ? `${s.marks} marks` : ''}${sc !== undefined ? `<span>${Math.round(sc * 100)}% of points</span>` : ''}</span></span>${sc !== undefined && sc >= SHORT_PASS ? `<span class="st done">${ICONS.check}</span>` : '<span class="st"></span>'}</button></li>`;
        })
        .join('');
      list.querySelectorAll<HTMLElement>('[data-s]').forEach((b) => b.addEventListener('click', () => app.push(shortScreen(t, t.short![Number(b.dataset.s)]))));
    };
    draw();
    return { el, resumed: draw };
  };
}

export function shortScreen(t: Topic, s: ShortAnswer): (app: App) => Screen {
  return (app) => {
    const el = h(`<div class="pg"><main class="short-one">
      <div class="mcq-stem">${richHtml(s.prompt)}</div>
      <p class="paper-hint">${ICONS.pen}<span>Write your answer on paper first.</span></p>
      <div class="short-model"></div>
    </main></div>`);
    el.prepend(bar(app, t.title, 'Short answer'));
    const model = el.querySelector<HTMLElement>('.short-model')!;
    model.append(
      button('Show the model answer', 'solid wide', () => {
        model.innerHTML = `<h3>Model answer</h3><div class="model">${richHtml(s.model)}</div>
          <h3>Tick the points your answer covered</h3>
          <div class="points">${s.points.map((p, i) => `<label class="pt"><input type="checkbox" data-p="${i}"><span>${richHtml(p)}</span></label>`).join('')}</div>`;
        model.append(
          button('Save', 'solid wide', () => {
            const ticked = model.querySelectorAll('input:checked').length;
            const share = ticked / s.points.length;
            app.save.update(() => recordShort(app.save.topic(t.id), s.id, share, app.now()));
            app.toast(share >= SHORT_PASS ? `${ticked} of ${s.points.length} points: well answered.` : `${ticked} of ${s.points.length} points. Read the model answer once more.`);
            app.pop();
          }),
        );
      }),
    );
    return { el };
  };
}

