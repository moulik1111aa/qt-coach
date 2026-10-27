// App shell: the save, read-aloud, the screen stack with a quiet slide between screens, the
// Android back button, theme and text size, and toasts.

import { SaveStore, type StorageAdapter } from '../storage/save.ts';
import { Voice } from '../platform/voice.ts';
import { quietly, setSystemBarStyle, type AiioPlugin } from '../platform/native.ts';

export interface Screen {
  el: HTMLElement;
  mounted?(): void;
  /** Called when the screen comes back to the top of the stack (progress may have changed). */
  resumed?(): void;
  destroy?(): void;
  /** Android back. Return true if handled. */
  back?(): boolean;
}

export type ScreenMaker = (app: App) => Screen;

/** Build an element from an HTML string (one root). */
export function h(html: string): HTMLElement {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild as HTMLElement;
}

export const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export class App {
  readonly root: HTMLElement;
  readonly save: SaveStore;
  readonly voice: Voice;
  readonly native: AiioPlugin | null;
  readonly debug: boolean;
  /** Injectable clock (tests). */
  now: () => number = () => Date.now();
  private stack: Screen[] = [];
  private overlays: { el: HTMLElement; close: () => void }[] = [];

  constructor(root: HTMLElement, storage: StorageAdapter, native: AiioPlugin | null, debug: boolean) {
    this.root = root;
    this.save = new SaveStore(storage);
    this.native = native;
    this.voice = new Voice(native);
    this.debug = debug;
    this.applySettings();
    if (native) {
      quietly(native.addListener('back', () => this.handleBack()));
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.handleBack();
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => this.applySettings());
  }

  applySettings(): void {
    const s = this.save.data.settings;
    const dark = s.theme === 'dark' || (s.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    const de = document.documentElement;
    de.dataset.theme = dark ? 'dark' : 'light';
    if (s.textSize === 'normal') delete de.dataset.size;
    else de.dataset.size = s.textSize;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#12151C' : '#F2F4F1');
    setSystemBarStyle(dark);
  }

  get top(): Screen | undefined {
    return this.stack[this.stack.length - 1];
  }

  /** Open a screen on top. */
  push(make: ScreenMaker): void {
    const s = make(this);
    const prev = this.top;
    this.stack.push(s);
    this.mount(s, prev, 'forward');
  }

  /** Replace the top screen. */
  replace(make: ScreenMaker): void {
    const old = this.stack.pop();
    const s = make(this);
    this.stack.push(s);
    this.mount(s, old, 'none');
    old?.destroy?.();
  }

  /** Clear the stack and show this screen (e.g. Home). */
  reset(make: ScreenMaker): void {
    for (const s of this.stack) s.destroy?.();
    this.stack = [];
    this.root.replaceChildren();
    this.push(make);
  }

  /** Go back one screen. */
  pop(): void {
    if (this.stack.length <= 1) return;
    const old = this.stack.pop()!;
    const s = this.top!;
    this.voice.stop();
    this.mount(s, old, 'back');
    old.destroy?.();
    s.resumed?.();
  }

  private mount(s: Screen, prev: Screen | undefined, dir: 'forward' | 'back' | 'none'): void {
    s.el.classList.add('screen');
    this.root.replaceChildren(s.el);
    if (dir !== 'none' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      s.el.animate(
        [
          { transform: `translateX(${dir === 'forward' ? 24 : -24}px)`, opacity: 0.4 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: 220, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
      );
    }
    window.scrollTo(0, 0);
    s.mounted?.();
    void prev;
  }

  /** An overlay (sheet, keypad, dialog) that the back button closes first. */
  openOverlay(el: HTMLElement, close: () => void): () => void {
    document.body.appendChild(el);
    const entry = { el, close };
    this.overlays.push(entry);
    return () => {
      const i = this.overlays.indexOf(entry);
      if (i >= 0) this.overlays.splice(i, 1);
      el.remove();
    };
  }

  handleBack(): void {
    const o = this.overlays[this.overlays.length - 1];
    if (o) {
      o.close();
      return;
    }
    if (this.top?.back?.()) return;
    if (this.stack.length > 1) this.pop();
    else if (this.native) quietly(this.native.exit());
  }

  toast(text: string): void {
    const el = h(`<div class="toast" role="status">${escapeHtml(text)}</div>`);
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('out'), 2200);
    setTimeout(() => el.remove(), 2600);
  }

  /** A yes/no question. */
  confirm(title: string, text: string, yes: string, no = 'Cancel'): Promise<boolean> {
    return new Promise((resolve) => {
      const el = h(`<div class="dialog-back"><div class="dialog" role="dialog" aria-modal="true">
        <h2>${escapeHtml(title)}</h2><p class="muted">${escapeHtml(text)}</p>
        <div class="dialog-row"><button class="btn line" data-no>${escapeHtml(no)}</button><button class="btn solid" data-yes>${escapeHtml(yes)}</button></div>
      </div></div>`);
      const done = (v: boolean) => {
        close();
        resolve(v);
      };
      const close = this.openOverlay(el, () => done(false));
      el.querySelector('[data-no]')!.addEventListener('click', () => done(false));
      el.querySelector('[data-yes]')!.addEventListener('click', () => done(true));
      el.addEventListener('click', (e) => {
        if (e.target === el) done(false);
      });
    });
  }
}
