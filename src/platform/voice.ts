// Read-aloud: Android's text-to-speech through the plugin, or the browser's speech synthesis.

import { quietly, type AiioPlugin } from './native.ts';

export class Voice {
  private readonly native: AiioPlugin | null;
  constructor(native: AiioPlugin | null) {
    this.native = native;
  }
  /** Is any speech available? */
  get available(): boolean {
    return !!this.native || typeof speechSynthesis !== 'undefined';
  }
  say(text: string): void {
    this.stop();
    if (!text.trim()) return;
    if (this.native) {
      quietly(this.native.speak({ text, rate: 1 }));
      return;
    }
    try {
      const u = new SpeechSynthesisUtterance(text);
      const v = speechSynthesis.getVoices().find((x) => x.lang === 'en-IN') ?? speechSynthesis.getVoices().find((x) => x.lang.startsWith('en'));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch {
      /* no speech */
    }
  }
  stop(): void {
    if (this.native) quietly(this.native.stopSpeaking());
    else {
      try {
        speechSynthesis.cancel();
      } catch {
        /* none */
      }
    }
  }
}
