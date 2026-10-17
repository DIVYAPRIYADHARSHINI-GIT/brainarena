"use client";
// Silly sound effects synthesized live with the Web Audio API. No audio files
// are downloaded, so there are no licensing issues and nothing to preload.
// Sounds: boing, fail trumpet ("wah wah wah"), crowd cheer, slide whistle,
// pop, tick, click, ding, buzz and a fanfare for new high scores.
import { getPrefs } from "./store";

export type SoundName = "boing" | "fail" | "cheer" | "slide" | "slideDown" | "pop" | "tick" | "click" | "ding" | "buzz" | "fanfare" | "flip";

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(c: AudioContext, opts: { type?: OscillatorType; from: number; to?: number; start?: number; dur: number; vol?: number; curve?: "exp" | "lin" }) {
  const t0 = c.currentTime + (opts.start ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.from, t0);
  if (opts.to !== undefined) {
    if (opts.curve === "lin") osc.frequency.linearRampToValueAtTime(opts.to, t0 + opts.dur);
    else osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.to), t0 + opts.dur);
  }
  const v = opts.vol ?? 0.18;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(v, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + opts.dur + 0.05);
  return { osc, g, t0 };
}

function noise(c: AudioContext, { start = 0, dur = 1, vol = 0.15, freq = 1200 }) {
  const t0 = c.currentTime + start;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = 0.7;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp).connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

export function play(name: SoundName) {
  if (getPrefs().muted) return;
  const c = ac();
  if (!c) return;
  try {
    switch (name) {
      case "boing": {
        // Springy wobble: pitch bends with a fast vibrato.
        const { osc, t0 } = tone(c, { type: "triangle", from: 180, to: 520, dur: 0.45, vol: 0.25 });
        const lfo = c.createOscillator();
        const lg = c.createGain();
        lfo.frequency.value = 22;
        lg.gain.value = 60;
        lfo.connect(lg).connect(osc.frequency);
        lfo.start(t0);
        lfo.stop(t0 + 0.5);
        break;
      }
      case "fail": {
        // Cartoon "wah wah wah wahhh" trumpet.
        const notes = [392, 370, 349, 330];
        notes.forEach((f, i) => {
          const last = i === notes.length - 1;
          const { osc, t0 } = tone(c, { type: "sawtooth", from: f, to: last ? f * 0.92 : f * 0.97, start: i * 0.32, dur: last ? 0.9 : 0.3, vol: 0.09 });
          if (last) {
            const lfo = c.createOscillator();
            const lg = c.createGain();
            lfo.frequency.value = 6;
            lg.gain.value = 8;
            lfo.connect(lg).connect(osc.frequency);
            lfo.start(t0);
            lfo.stop(t0 + 0.95);
          }
        });
        break;
      }
      case "cheer": {
        // Crowd: filtered noise swell + a few "yay" chirps.
        noise(c, { dur: 1.6, vol: 0.12, freq: 1400 });
        noise(c, { start: 0.1, dur: 1.4, vol: 0.08, freq: 2600 });
        [0.05, 0.25, 0.45, 0.7].forEach((s, i) => tone(c, { type: "triangle", from: 700 + i * 90, to: 1100 + i * 80, start: s, dur: 0.18, vol: 0.05 }));
        break;
      }
      case "slide":
        tone(c, { type: "sine", from: 300, to: 1800, dur: 0.6, vol: 0.2, curve: "lin" });
        break;
      case "slideDown":
        tone(c, { type: "sine", from: 1600, to: 250, dur: 0.7, vol: 0.2, curve: "lin" });
        break;
      case "pop":
        tone(c, { type: "sine", from: 900, to: 300, dur: 0.12, vol: 0.2 });
        break;
      case "flip":
        tone(c, { type: "triangle", from: 500, to: 800, dur: 0.08, vol: 0.12 });
        break;
      case "tick":
        tone(c, { type: "square", from: 1500, dur: 0.04, vol: 0.05 });
        break;
      case "click":
        tone(c, { type: "triangle", from: 700, dur: 0.05, vol: 0.08 });
        break;
      case "ding":
        tone(c, { type: "sine", from: 880, dur: 0.25, vol: 0.18 });
        tone(c, { type: "sine", from: 1320, start: 0.08, dur: 0.3, vol: 0.14 });
        break;
      case "buzz":
        tone(c, { type: "square", from: 140, to: 110, dur: 0.3, vol: 0.08 });
        break;
      case "fanfare":
        [523, 659, 784, 1047].forEach((f, i) => tone(c, { type: "triangle", from: f, start: i * 0.12, dur: i === 3 ? 0.6 : 0.16, vol: 0.16 }));
        noise(c, { start: 0.45, dur: 1.2, vol: 0.07, freq: 1800 });
        break;
    }
  } catch {
    /* never let audio break the game */
  }
}
