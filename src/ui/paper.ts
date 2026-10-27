// Solve on paper: the question, then its checkpoints one by one. The learner works on paper and
// enters each value as they reach it. A wrong value opens the sheet for that step; after "Got it"
// the right value is filled in and they carry on. "Show this step" reveals a step (it counts as
// help for mastery). At the end: a summary, the full solution, and the next question.

import { h, escapeHtml, type App, type Screen } from './app.ts';
import { boardHtml, fitBoards, setBoardStep } from './boards.ts';
import { richHtml } from './math.ts';
import { ICONS } from './icons.ts';
import { openKeypad } from './keypad.ts';
import { button, showSheet, valueHtml } from './sheet.ts';
import { answerText, gradeCheckpoint, matchSlip } from '../core/grade.ts';
import { addMistake, isClean, MASTERY_STREAK, recordPaper, reviseMistake } from '../core/progress.ts';
import { pickQuestion, regenerate, type PracticeSource } from '../core/practice.ts';
import { LEVEL_NAME, type Checkpoint, type PaperQuestion, type Topic } from '../content/types.ts';

export interface PaperOpts {
  topic: Topic;
  /** A practice session (next questions are picked automatically)… */
  src?: PracticeSource;
  /** …or one given question (mistake bank, a listed question). */
  question?: PaperQuestion;
  mistakeKey?: string;
  heading?: string;
}

type CpState = { kind: 'right' | 'fixed' | 'shown'; value: string };

let seedCounter = 0;
const newSeed = () => (Date.now() % 1e9) + 7919 * ++seedCounter;

export function paperScreen(o: PaperOpts): (app: App) => Screen {
  return (app) => {
    const t = o.topic;
    const recent: string[] = [];
    const el = h(`<div class="pg paper-pg">
      <header class="bar">
        <button class="icon-btn" data-back aria-label="Back">${ICONS.back}</button>
        <div class="bar-title"><span class="bar-kicker">${escapeHtml(t.title)}</span><span>${escapeHtml(o.heading ?? 'Solve on paper')}</span></div>
        <span class="bar-right"></span>
      </header>
      <main class="paper"></main>
    </div>`);
    el.querySelector('[data-back]')!.addEventListener('click', () => app.handleBack());
    const main = el.querySelector<HTMLElement>('.paper')!;
    const levelSlot = el.querySelector<HTMLElement>('.bar-right')!;

    const next = (): PaperQuestion | null => {
      if (o.src) return pickQuestion(t, app.save.topic(t.id), o.src, newSeed(), recent);
      return null;
    };

    const run = (q: PaperQuestion) => {
      recent.push(q.id);
      if (recent.length > 12) recent.shift();
      levelSlot.innerHTML = `<span class="lvl ${q.level}">${LEVEL_NAME[q.level]}</span>`;
      const states: (CpState | null)[] = q.checkpoints.map(() => null);
      let wrong = 0;
      let revealed = 0;
      main.innerHTML = `
        <article class="qcard">
          <h1 class="q-title">${escapeHtml(q.title)}</h1>
          <div class="q-prompt">${richHtml(q.prompt)}</div>
          ${q.data ? boardHtml(q.data) : ''}
          ${q.bookNote ? `<div class="booknote"><b>Book note.</b> ${richHtml(q.bookNote)}</div>` : ''}
        </article>
        <p class="paper-hint">${ICONS.pen}<span>Work it out on paper. Enter each value as you reach it.</span></p>
        <ol class="cps ruled"></ol>
        <div class="paper-end"></div>`;
      main.querySelectorAll<HTMLElement>('.board').forEach((b) => setBoardStep(b, Infinity));
      fitBoards(main);
      const list = main.querySelector<HTMLElement>('.cps')!;
      const end = main.querySelector<HTMLElement>('.paper-end')!;

      const current = () => states.findIndex((s) => s === null);
      const prevStep = (i: number) => (i > 0 ? q.checkpoints[i - 1].step + 1 : 0);

      const draw = () => {
        const cur = current();
        list.innerHTML = q.checkpoints
          .map((cp, i) => {
            const st = states[i];
            if (st) {
              const mark = st.kind === 'right' ? `<span class="cp-mark ok">${ICONS.check}</span>` : `<span class="cp-mark fix">${st.kind === 'shown' ? 'shown' : 'corrected'}</span>`;
              return `<li class="cp done ${st.kind}"><span class="cp-n">${i + 1}</span><div class="cp-body"><span class="cp-label">${richHtml(cp.label)}</span><span class="cp-val ink">${valueHtml(cp.answer, st.value)}</span>${mark}</div></li>`;
            }
            if (i === cur) {
              const a = cp.answer;
              const input =
                a.kind === 'choice'
                  ? `<div class="cp-choices">${a.options.map((op) => `<button class="choice" data-choice="${escapeHtml(op)}">${richHtml(op)}</button>`).join('')}</div>`
                  : `<button class="cp-entry" data-entry>${ICONS.pen}<span>Enter ${a.kind === 'matrix' ? 'the matrix' : 'the value'}</span></button>`;
              const dbg = app.debug ? ` data-kind="${a.kind}" data-answer="${escapeHtml(answerText(a))}"` : '';
              return `<li class="cp now"${dbg}><span class="cp-n">${i + 1}</span><div class="cp-body">
                <p class="cp-ask">${richHtml(cp.ask)}${a.kind === 'num' && a.dp > 0 ? ` <span class="faint small">(${a.dp} d.p.)</span>` : ''}</p>
                ${input}
                <button class="link" data-show>${ICONS.eye}<span>Show this step</span></button>
              </div></li>`;
            }
            return `<li class="cp later"><span class="cp-n">${i + 1}</span><div class="cp-body"><span class="cp-label">${richHtml(cp.label)}</span></div></li>`;
          })
          .join('');
        list.querySelector('[data-entry]')?.addEventListener('click', () => {
          const cp = q.checkpoints[cur];
          openKeypad(app, cp, '', (v) => submit(cp, cur, v));
        });
        list.querySelectorAll<HTMLElement>('[data-choice]').forEach((b) => b.addEventListener('click', () => submit(q.checkpoints[cur], cur, b.dataset.choice!)));
        list.querySelector('[data-show]')?.addEventListener('click', () => {
          revealed++;
          const cp = q.checkpoints[cur];
          showSheet(app, q, {
            mode: 'help',
            cp,
            fromStep: prevStep(cur),
            onDone: () => {
              states[cur] = { kind: 'shown', value: answerText(cp.answer) };
              advance();
            },
          });
        });
        if (cur >= 0) list.children[cur]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };

      const submit = (cp: Checkpoint, i: number, given: string) => {
        const v = gradeCheckpoint(cp, given);
        if (v === 'invalid') {
          app.toast('Enter a number like 12, −3.5 or 3/4.');
          return;
        }
        if (v === 'right') {
          states[i] = { kind: 'right', value: given };
          advance();
          return;
        }
        wrong++;
        const slip = matchSlip(cp.answer, given, cp.slips);
        app.save.update((d) =>
          addMistake(
            d,
            {
              key: `${t.id}/${q.gen ? q.gen.id : q.id}/${cp.id}`,
              topic: t.id,
              qid: q.gen ? undefined : q.id,
              gen: q.gen ? { id: q.gen.id, level: q.level } : undefined,
              label: `${q.title}: ${cp.ask}`,
              note: slip?.note,
            },
            app.now(),
          ),
        );
        showSheet(app, q, {
          mode: 'help',
          cp,
          given,
          slip,
          fromStep: prevStep(i),
          doneLabel: 'Got it, carry on',
          onDone: () => {
            states[i] = { kind: 'fixed', value: answerText(cp.answer) };
            advance();
          },
        });
      };

      const advance = () => {
        draw();
        if (current() === -1) finish();
      };

      const finish = () => {
        const result = { wrong, revealed };
        const clean = isClean(result);
        let info = { masteredNow: false, streak: 0 };
        app.save.update((d) => {
          info = recordPaper(app.save.topic(t.id), q, result, app.now());
          if (o.mistakeKey) reviseMistake(d, o.mistakeKey, clean, app.now());
          d.place = { topic: t.id, stage: q.level === 'tough' ? 'tough' : 'paper', at: app.now() };
        });
        const right = states.filter((s) => s?.kind === 'right').length;
        const tp = app.save.topic(t.id);
        const line = clean
          ? q.level === 'exam' && !info.masteredNow && !tp.mastered
            ? `Exam streak: ${info.streak} of ${MASTERY_STREAK}.`
            : 'Every value right, with no help.'
          : `${right} of ${q.checkpoints.length} right first time.${q.level === 'exam' && !tp.mastered ? ' The Exam streak starts again.' : ''}`;
        end.innerHTML = `<div class="summary ${clean ? 'clean' : ''}">
          <h2>${clean ? 'Clean solve' : 'Solved with help'}</h2>
          <p class="muted">${escapeHtml(line)}</p>
          ${info.masteredNow ? `<p class="mastered">${ICONS.flag}<span><b>Topic mastered.</b> The Tough set is now open.</span></p>` : ''}
          <div class="summary-row"></div>
        </div>`;
        const row = end.querySelector<HTMLElement>('.summary-row')!;
        row.append(button('Full solution', 'line', () => showSheet(app, q, { mode: 'full' })));
        if (o.src) row.append(button('Next question', 'solid', () => go()));
        else row.append(button('Done', 'solid', () => app.pop()));
        end.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };

      draw();
    };

    const go = () => {
      const q = o.question && !recent.length ? o.question : next();
      if (!q) {
        main.innerHTML = `<p class="empty">No questions here yet.</p>`;
        return;
      }
      run(q);
      window.scrollTo({ top: 0 });
    };

    go();
    return { el };
  };
}

/** Rebuild a generated question for the mistake bank (a fresh seed each time). */
export function freshFromGen(t: Topic, genId: string, level: PaperQuestion['level']): PaperQuestion | null {
  return regenerate(t, genId, level, newSeed());
}
