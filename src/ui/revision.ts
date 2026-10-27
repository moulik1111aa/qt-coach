// Revision: formula sheets and the mistake bank.

import { h, escapeHtml, type App, type Screen } from './app.ts';
import { ICONS } from './icons.ts';
import { mathBlock, richHtml } from './math.ts';
import { bar } from './course.ts';
import { paperScreen, freshFromGen } from './paper.ts';
import { checkScreen } from './check.ts';
import { CHAPTERS, mcqById, questionById, topicById } from '../content/index.ts';
import type { Chapter } from '../content/types.ts';

export function formulaScreen(ch: Chapter): (app: App) => Screen {
  return (app) => {
    const el = h(`<div class="pg"><main class="formulas">
      <p class="unit-k">Unit ${ch.unit}</p>
      <h1>${escapeHtml(ch.title)}: formula sheet</h1>
      <dl class="fsheet">${ch.formulas.map((f) => `<div class="f"><dt>${escapeHtml(f.name)}</dt><dd>${mathBlock(f.math)}<p class="muted">${richHtml(f.use)}</p></dd></div>`).join('')}</dl>
    </main></div>`);
    el.prepend(bar(app, ch.title, 'Formula sheet'));
    return { el };
  };
}

export function revisionScreen(kind: 'formulas' | 'mistakes'): (app: App) => Screen {
  return (app) => {
    if (kind === 'formulas') {
      const el = h(`<div class="pg"><main class="revision"><h1>Formula sheets</h1><ol class="contents ruled">${CHAPTERS.map(
        (c) => `<li class="toc"><button data-ch="${c.n}"><span class="cp-n">${c.unit}</span><span class="toc-body"><span class="toc-t">${escapeHtml(c.title)}</span><span class="toc-s muted">${c.formulas.length} formulas</span></span></button></li>`,
      ).join('')}</ol></main></div>`);
      el.prepend(bar(app, 'Revision', 'Formula sheets'));
      el.querySelectorAll<HTMLElement>('[data-ch]').forEach((b) => b.addEventListener('click', () => app.push(formulaScreen(CHAPTERS.find((c) => c.n === Number(b.dataset.ch))!))));
      return { el };
    }
    const el = h(`<div class="pg"><main class="revision">
      <h1>Mistake bank</h1>
      <p class="muted">Every value you got wrong is kept here. Answer it right on two different days and it leaves the bank.</p>
      <div class="mk-list"></div>
    </main></div>`);
    el.prepend(bar(app, 'Revision', 'Mistake bank'));
    const draw = () => {
      const list = el.querySelector<HTMLElement>('.mk-list')!;
      const ms = app.save.data.mistakes;
      if (!ms.length) {
        list.innerHTML = `<p class="empty">Nothing to revise. Values you get wrong in practice and quick checks will appear here.</p>`;
        return;
      }
      const byTopic = new Map<string, typeof ms>();
      for (const m of ms) byTopic.set(m.topic, [...(byTopic.get(m.topic) ?? []), m]);
      list.innerHTML = [...byTopic]
        .map(([tid, items]) => `<h3>${escapeHtml(topicById(tid)?.title ?? tid)}</h3><ol class="ex-list ruled">${items
          .map((m) => `<li class="ex"><button data-key="${escapeHtml(m.key)}"><span class="cp-n">${ICONS.flag}</span><span class="ex-body"><span class="ex-t">${richHtml(m.label)}</span>${m.note ? `<span class="ex-s muted small">${richHtml(m.note)}</span>` : ''}<span class="faint small">${m.rightDays.length ? 'Right once. One more day to clear it.' : `Added ${m.added}`}</span></span></button></li>`)
          .join('')}</ol>`)
        .join('');
      list.querySelectorAll<HTMLElement>('[data-key]').forEach((b) =>
        b.addEventListener('click', () => {
          const m = app.save.data.mistakes.find((x) => x.key === b.dataset.key);
          const t = m ? topicById(m.topic) : undefined;
          if (!m || !t) return;
          if (m.mcq) {
            const q = mcqById(m.mcq);
            if (q) app.push(checkScreen(null, { title: 'Revise', items: [q], mistakeKey: m.key }));
            return;
          }
          const q = m.gen ? freshFromGen(t, m.gen.id, m.gen.level) : m.qid ? questionById(m.qid) : undefined;
          if (q) app.push(paperScreen({ topic: t, question: q, mistakeKey: m.key, heading: 'Revise' }));
        }),
      );
    };
    draw();
    return { el, resumed: draw };
  };
}
