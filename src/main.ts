// Boot: restore the save (native mirror on Android), then the first-run screen or Home.

import { App } from './ui/app.ts';
import { nativeBridge, nativeStorage } from './platform/native.ts';
import { browserStorage } from './storage/save.ts';
import { firstRunScreen, homeScreen } from './ui/home.ts';

async function boot(): Promise<void> {
  const root = document.getElementById('app')!;
  const native = nativeBridge();
  const storage = native ? await nativeStorage(native) : browserStorage();
  const debug = /[?&]debug\b/.test(location.search);
  const app = new App(root, storage, native, debug);
  (globalThis as { __app?: App }).__app = app;
  app.reset(app.save.data.started ? homeScreen : firstRunScreen);
}

boot().catch((e) => {
  const root = document.getElementById('app');
  if (root) root.innerHTML = `<p style="padding:24px">Aiio could not start: ${String(e?.message ?? e)}</p>`;
});
