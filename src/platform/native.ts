// Bridge to the Android shell (Capacitor + the app's own `Aiio` plugin in
// native/android/java/com/aiio/app/AiioPlugin.java). In a browser `nativeBridge()` is null and
// web fallbacks are used (localStorage only, the web speech API). Adapted from MN.

import type { StorageAdapter } from '../storage/save.ts';
import { browserStorage } from '../storage/save.ts';

export interface AiioPlugin {
  keepAwake(o: { on: boolean }): Promise<void>;
  exit(): Promise<void>;
  readSave(): Promise<{ values?: Record<string, string> }>;
  writeSave(o: { key: string; value: string }): Promise<void>;
  speak(o: { text: string; rate?: number }): Promise<void>;
  stopSpeaking(): Promise<void>;
  addListener(event: 'back', cb: () => void): unknown;
}

interface SystemBarsPlugin {
  setStyle(o: { style: 'DARK' | 'LIGHT' | 'DEFAULT' }): Promise<void>;
}

interface CapacitorGlobal {
  isNativePlatform?(): boolean;
  Plugins?: { Aiio?: AiioPlugin; SystemBars?: SystemBarsPlugin };
}

function capacitor(): CapacitorGlobal | null {
  const cap = (globalThis as { Capacitor?: CapacitorGlobal }).Capacitor;
  try {
    return cap?.isNativePlatform?.() ? cap : null;
  } catch {
    return null;
  }
}

export function nativeBridge(): AiioPlugin | null {
  return capacitor()?.Plugins?.Aiio ?? null;
}

export function setSystemBarStyle(darkBackground: boolean): void {
  capacitor()
    ?.Plugins?.SystemBars?.setStyle({ style: darkBackground ? 'DARK' : 'LIGHT' })
    .catch(() => {});
}

/** Ignore a native call's failure (some calls give back a plain handle, not a promise). */
export function quietly(p: unknown): void {
  if (p && typeof (p as Promise<unknown>).catch === 'function') (p as Promise<unknown>).catch(() => {});
}

function timeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);
}

/** localStorage stays the main copy; every write is mirrored natively and restored if lost. */
export async function nativeStorage(plugin: AiioPlugin, web: StorageAdapter = browserStorage()): Promise<StorageAdapter> {
  try {
    const { values = {} } = await timeout(plugin.readSave(), 1500);
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === 'string' && web.get(key) === null) web.set(key, value);
    }
  } catch {
    /* mirror unavailable */
  }
  return {
    get: (key: string) => web.get(key),
    set(key: string, value: string) {
      web.set(key, value);
      quietly(plugin.writeSave({ key, value }));
    },
  };
}
