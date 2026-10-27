// Settings: theme, text size, read aloud, start again, and about.

import { h, escapeHtml, type App, type Screen } from './app.ts';
import { bar } from './course.ts';
import type { TextSize, ThemeChoice } from '../storage/save.ts';

export function settingsScreen(app: App): Screen {
  const el = h(`<div class="pg"><main class="settings"></main></div>`);
  el.prepend(bar(app, 'Aiio', 'Settings'));
  const main = el.querySelector<HTMLElement>('.settings')!;
  const draw = () => {
    const s = app.save.data.settings;
    const seg = (name: string, opts: [string, string][], cur: string) =>
      `<div class="seg" data-set="${name}">${opts.map(([v, l]) => `<button data-v="${v}" aria-pressed="${v === cur}">${escapeHtml(l)}</button>`).join('')}</div>`;
    const build = (globalThis as { __BUILD__?: { version: string; builtAt: string } }).__BUILD__;
    main.innerHTML = `
      <h1>Settings</h1>
      <section class="set"><h3>Look</h3>${seg('theme', [['system', 'Phone setting'], ['light', 'Light'], ['dark', 'Dark']], s.theme)}</section>
      <section class="set"><h3>Text size</h3>${seg('textSize', [['small', 'Small'], ['normal', 'Normal'], ['large', 'Large'], ['xl', 'Largest']], s.textSize)}</section>
      ${app.voice.available ? `<section class="set"><h3>Read steps aloud</h3>${seg('readAloud', [['off', 'Off'], ['on', 'On']], s.readAloud ? 'on' : 'off')}<p class="muted small">Adds a speaker button to every worked solution.</p></section>` : ''}
      <section class="set"><h3>Progress</h3><button class="btn line" data-reset>Start again from the beginning</button></section>
      <section class="set about"><h3>About</h3>
        <p class="muted small">Aiio follows <i>Quantitative Techniques for Managers</i> unit by unit. Where the printed book has a mistake, the app teaches the correct working and shows a <b>Book note</b> next to it.</p>
        <p class="faint small">Version ${escapeHtml(build?.version ?? 'dev')}${build ? `, built ${escapeHtml(build.builtAt.slice(0, 10))}` : ''}</p>
      </section>`;
    main.querySelectorAll<HTMLElement>('[data-set]').forEach((g) =>
      g.querySelectorAll<HTMLElement>('[data-v]').forEach((b) =>
        b.addEventListener('click', () => {
          const v = b.dataset.v!;
          app.save.update((d) => {
            if (g.dataset.set === 'theme') d.settings.theme = v as ThemeChoice;
            if (g.dataset.set === 'textSize') d.settings.textSize = v as TextSize;
            if (g.dataset.set === 'readAloud') d.settings.readAloud = v === 'on';
          });
          app.applySettings();
          draw();
        }),
      ),
    );
    main.querySelector('[data-reset]')!.addEventListener('click', async () => {
      if (await app.confirm('Start again?', 'All topic progress, test scores and the mistake bank will be cleared. Settings stay.', 'Clear progress')) {
        app.save.reset();
        app.toast('Progress cleared.');
        draw();
      }
    });
  };
  draw();
  return { el };
}
