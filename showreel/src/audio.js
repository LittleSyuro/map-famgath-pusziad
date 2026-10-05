// Original 120 BPM A-minor future-house score + sync'd sound design, fully synthesised.
// Output: build/audio.wav (48 kHz, stereo, 16-bit)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SR = 48000, DUR = 60, N = SR * DUR, BEAT = 0.5;
const L = new Float32Array(N), R = new Float32Array(N);       // dry mix
const VL = new Float32Array(N), VR = new Float32Array(N);     // reverb send
const SC = new Float32Array(N).fill(1);                         // sidechain gain (ducked by kick)

let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const noise = () => rnd() * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const TAU = Math.PI * 2;

// ------------------------------------------------------------ biquad (RBJ)
class Biquad {
  constructor(type, f, q = 0.707) { this.type = type; this.q = q; this.x1 = this.x2 = this.y1 = this.y2 = 0; this.set(f); }
  set(f) {
    const w = TAU * Math.min(f, SR * 0.45) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * this.q);
    let b0, b1, b2; const a0 = 1 + a, a1 = -2 * c, a2 = 1 - a;
    if (this.type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
    else if (this.type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
    else { b0 = a; b1 = 0; b2 = -a; } // band-pass (0 dB peak)
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0;
  }
  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y; return y;
  }
}

// ------------------------------------------------------------ mixing helpers
// Render `len` seconds of fn(t, i) at time t0 into the bus with gain/pan/send.
function voice(t0, len, fn, { gain = 1, pan = 0, send = 0, duck = 0 } = {}) {
  const i0 = Math.round(t0 * SR), n = Math.round(len * SR);
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let k = 0; k < n; k++) {
    const i = i0 + k; if (i < 0) continue; if (i >= N) break;
    let v = fn(k / SR, k);
    if (duck) v *= 1 - duck * (1 - SC[i]);
    L[i] += v * gl; R[i] += v * gr;
    if (send) { VL[i] += v * gl * send; VR[i] += v * gr * send; }
  }
}
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));

// ------------------------------------------------------------ instruments
function kick(t0, amp = 1) {
  let ph = 0;
  voice(t0, 0.5, (t) => {
    const f = 46 + 120 * Math.exp(-t * 32);
    ph += TAU * f / SR;
    const click = t < 0.004 ? noise() * 0.5 * (1 - t / 0.004) : 0;
    return (Math.sin(ph) * Math.exp(-t * 6.5) + click) * 0.95 * amp;
  });
  // sidechain envelope
  const i0 = Math.round(t0 * SR);
  for (let k = 0; k < SR * 0.4; k++) { const i = i0 + k; if (i >= N) break; const g = 0.12 + 0.88 * Math.min(1, k / (SR * 0.28)) ** 1.6; SC[i] = Math.min(SC[i], g); }
}
function clap(t0, amp = 1) {
  const bp = new Biquad('bp', 1300, 1.2), hp = new Biquad('hp', 600);
  voice(t0, 0.35, (t) => {
    const bursts = [0, 0.011, 0.022].reduce((s, o) => s + (t >= o ? Math.exp(-(t - o) * (o === 0.022 ? 18 : 140)) : 0), 0);
    return hp.run(bp.run(noise() * bursts)) * 1.1 * amp;
  }, { send: 0.35, pan: 0.05 });
}
function snare(t0, amp = 1) {
  const bp = new Biquad('bp', 2200, 0.8);
  let ph = 0;
  voice(t0, 0.25, (t) => { ph += TAU * 190 / SR; return (bp.run(noise()) * 1.2 * Math.exp(-t * 22) + Math.sin(ph) * 0.4 * Math.exp(-t * 30)) * amp; }, { send: 0.25 });
}
function hat(t0, open = false, amp = 1, pan = 0.2) {
  const hp = new Biquad('hp', 8000, 0.9);
  voice(t0, open ? 0.25 : 0.06, (t) => hp.run(noise()) * Math.exp(-t * (open ? 14 : 70)) * 0.32 * amp, { pan, send: 0.05 });
}
function bassNote(t0, midi, len, amp = 1) {
  const lp = new Biquad('lp', 400, 2.2);
  let p1 = 0, p2 = 0; const f = mtof(midi);
  voice(t0, len, (t) => {
    p1 = (p1 + f / SR) % 1; p2 = (p2 + f * 1.005 / SR) % 1;
    lp.set(180 + 900 * Math.exp(-t * 14));
    const saw = (2 * p1 - 1) * 0.5 + (2 * p2 - 1) * 0.5;
    return lp.run(saw) * env(t, 0.004, len * 0.6) * 0.5 * amp + Math.sin(TAU * f * t) * 0.35 * amp * env(t, 0.004, len);
  }, { duck: 0.9 });
}
function subNote(t0, f, len, amp = 1) {
  voice(t0, len, (t) => Math.sin(TAU * f * t) * Math.min(1, t / 0.05) * Math.min(1, (len - t) / 0.2) * 0.55 * amp, { duck: 0.6 });
}
function padChord(t0, notes, len, amp = 1, bright = 1400) {
  notes.forEach((m, j) => {
    const lp = new Biquad('lp', bright, 0.8);
    const f = mtof(m);
    const det = [0.996, 1, 1.004];
    const ph = [rnd(), rnd(), rnd()];
    voice(t0, len + 0.6, (t) => {
      let s = 0;
      for (let v = 0; v < 3; v++) { ph[v] = (ph[v] + f * det[v] / SR) % 1; s += 2 * ph[v] - 1; }
      const a = Math.min(1, t / 0.35) * (t > len ? Math.exp(-(t - len) / 0.2) : 1);
      return lp.run(s / 3) * a * 0.09 * amp;
    }, { pan: (j / (notes.length - 1)) * 1.2 - 0.6, send: 0.5, duck: 0.55 });
  });
}
function pluck(t0, midi, amp = 1, pan = 0, dec = 0.18) {
  const f = mtof(midi), lp = new Biquad('lp', 5000, 1.4);
  let p = 0;
  voice(t0, 0.6, (t) => {
    p = (p + f / SR) % 1;
    lp.set(600 + 6000 * Math.exp(-t * 18));
    const sq = (p < 0.5 ? 1 : -1) * 0.6 + (2 * p - 1) * 0.4;
    return lp.run(sq) * Math.exp(-t / dec) * 0.22 * amp;
  }, { pan, send: 0.35 });
}
function bell(t0, midi, amp = 1, pan = 0, dec = 1.6) {
  const f = mtof(midi);
  voice(t0, dec * 3, (t) => {
    const m = Math.sin(TAU * f * 3.5 * t) * 2.2 * Math.exp(-t * 3);
    return (Math.sin(TAU * f * t + m) * 0.7 + Math.sin(TAU * f * 2.01 * t) * 0.15) * env(t, 0.002, dec) * 0.22 * amp;
  }, { pan, send: 0.6 });
}
function blip(t0, f = 2400, amp = 1, pan = 0, len = 0.05) {
  voice(t0, len, (t) => Math.sin(TAU * f * t) * env(t, 0.002, len / 4) * 0.16 * amp, { pan, send: 0.15 });
}
function tick(t0, amp = 1, pan = 0) {
  const hp = new Biquad('hp', 3000);
  voice(t0, 0.02, (t) => hp.run(noise()) * Math.exp(-t * 400) * 0.35 * amp, { pan });
}
function whoosh(t0, len, f0, f1, amp = 1, pan = 0, panTo = pan) {
  const bp = new Biquad('bp', f0, 1.3);
  voice(t0, len, (t) => {
    const k = t / len;
    bp.set(f0 * Math.pow(f1 / f0, k));
    const e = Math.sin(Math.PI * Math.pow(k, 0.7));
    return bp.run(noise()) * e * e * 0.55 * amp;
  }, { pan: (pan + panTo) / 2, send: 0.3 });
}
function riser(t0, len, amp = 1) {
  const bp = new Biquad('bp', 300, 2);
  let ph = 0;
  voice(t0, len, (t) => {
    const k = t / len;
    bp.set(300 + 7000 * k * k);
    ph += TAU * (200 + 1400 * k * k) / SR;
    return (bp.run(noise()) * 0.6 + Math.sin(ph) * 0.06) * k * k * amp;
  }, { send: 0.4 });
}
function reverseSwell(tEnd, len, amp = 1) {
  const lp = new Biquad('lp', 2000);
  voice(tEnd - len, len, (t) => { const k = t / len; lp.set(400 + 6000 * k); return lp.run(noise()) * Math.pow(k, 3) * 0.6 * amp; }, { send: 0.6 });
}
function impact(t0, amp = 1, low = 52) {
  let ph = 0;
  voice(t0, 2.2, (t) => {
    ph += TAU * (low * Math.exp(-t * 0.8) + 18) / SR;
    return Math.sin(ph) * Math.exp(-t * 1.6) * 0.9 * amp;
  }, { duck: 0 });
  const lp = new Biquad('lp', 3500);
  voice(t0, 1.5, (t) => lp.run(noise()) * Math.exp(-t * 5) * 0.5 * amp, { send: 0.8 });
}
function crash(t0, amp = 1) {
  const hp = new Biquad('hp', 4000, 0.6);
  voice(t0, 2.6, (t) => hp.run(noise()) * env(t, 0.002, 0.9) * 0.35 * amp, { send: 0.6, pan: -0.15 });
}
function whoom(t0, amp = 1) {
  let ph = 0; const lp = new Biquad('lp', 300);
  voice(t0, 1.4, (t) => { ph += TAU * (38 + 30 * Math.sin(Math.PI * t / 1.4)) / SR; return (Math.sin(ph) * 0.8 + lp.run(noise()) * 0.5) * Math.sin(Math.PI * Math.min(1, t / 1.4)) * 0.8 * amp; }, { send: 0.4 });
}
function glitch(t0, len, amp = 1) {
  let hold = 0, v = 0, f = 800, ph = 0;
  voice(t0, len, (t, k) => {
    if (k % 600 === 0) { f = 200 + rnd() * 3000; hold = rnd() < 0.3 ? 0 : 1; }
    ph += TAU * f / SR;
    if (k % 6 === 0) v = (Math.sin(ph) > 0 ? 1 : -1) * 0.5 + noise() * 0.5;
    return Math.round(v * 4) / 4 * hold * 0.22 * amp * (1 - t / len * 0.5);
  }, { pan: 0, send: 0.1 });
}
function subDrop(t0, amp = 1) {
  let ph = 0;
  voice(t0, 1.6, (t) => { ph += TAU * (90 * Math.exp(-t * 1.8) + 28) / SR; return Math.sin(ph) * env(t, 0.01, 0.9) * 0.8 * amp; });
}
function zap(t0, amp = 1) {
  let ph = 0;
  voice(t0, 0.25, (t) => { ph += TAU * (3000 * Math.exp(-t * 18) + 120) / SR; return (Math.sin(ph) > 0 ? 1 : -1) * Math.exp(-t * 14) * 0.12 * amp; }, { send: 0.3 });
}

// ------------------------------------------------------------ harmony
// Am7 → Fmaj7 → Cmaj7 → G6, one bar (2 s) each.
const CHORDS = [
  { root: 45, pad: [57, 60, 64, 67] }, // Am7
  { root: 41, pad: [57, 60, 64, 65] }, // Fmaj7 (F A C E voiced A C E F)
  { root: 48, pad: [55, 59, 60, 64] }, // Cmaj7
  { root: 43, pad: [55, 59, 62, 64] }, // G6
];
const chordAt = (t) => CHORDS[Math.floor(t / 2) % 4];

// ------------------------------------------------------------ arrangement
const beats = (a, b, step = BEAT) => { const out = []; for (let t = a; t < b - 1e-6; t += step) out.push(+t.toFixed(4)); return out; };

// 0–5: intro
subNote(0, 55, 4.8, 0.7); bell(0, 81, 1.2, 0, 2.5); bell(0.02, 69, 0.6, -0.2, 2.5);
tick(0.12, 0.8); whoosh(0.5, 0.5, 600, 5000, 0.5, -0.8, 0.8);
[0.3, 0.55, 0.8].forEach((t, i) => blip(t, 1800 + i * 400, 0.6, i - 1));
[69, 72, 76, 79, 81].forEach((m, i) => pluck(1.0 + i * 0.125, m, 1.3, (i - 2) * 0.35, 0.25));
for (let i = 0; i < 19; i++) tick(2.5 + i / 34, 0.5, -0.3);
for (let i = 0; i < 25; i++) tick(2.85 + i / 40, 0.35, 0.3);
padChord(0.5, [57, 60, 64, 71], 4.5, 0.55, 900);
glitch(3.5, 0.28, 1.2); blip(3.5, 3200, 0.6);
reverseSwell(5.0, 1.6, 0.8); riser(3.0, 2.0, 0.35);
whoosh(4.45, 0.55, 300, 3000, 0.9); subNote(3.6, 41.2, 1.3, 0.6);

// 5–47: main groove (with breakdown colour in 18–25)
for (const t of beats(5, 47)) {
  const brk = t >= 18 && t < 25;
  if (!brk || Math.abs((t - 18) % 1) < 1e-6) kick(t, brk ? 0.85 : 1);
  if (Math.abs((t % 1) - 0.5) < 1e-6 && !brk) clap(t, 0.9);
  hat(t + 0.25, (t * 2) % 4 === 3, brk ? 0.5 : 1);
  if (t >= 38 || (t >= 12 && t < 18)) { hat(t + 0.125, false, 0.45, -0.3); hat(t + 0.375, false, 0.45, -0.3); }
  if (!brk) {
    const c = chordAt(t);
    bassNote(t + 0.25, c.root - 12 + 12, 0.22, 0.9);
  }
}
// sub under the breakdown
for (let t = 18; t < 25; t += 2) subNote(t, mtof(chordAt(t).root - 12), 2, 0.8);
// pads per bar
for (let t = 5; t < 47; t += 2) padChord(t, chordAt(t).pad, 2, t >= 18 && t < 25 ? 1.1 : 0.8, t >= 38 ? 2200 : 1400);
// slams + stripes
[5, 6, 7, 8].forEach((t, i) => { whoosh(t - 0.18, 0.3, 400, 4000, 1, [-0.9, 0.9, 0, 0][i], [0.2, -0.2, 0, 0][i]); impact(t, 0.35, 70); });
impact(9, 0.5, 60); crash(9, 0.4);
[10, 10.25, 10.5, 10.75].forEach((t, i) => { blip(t, 1500 + i * 300, 0.8, i % 2 ? 0.5 : -0.5); tick(t, 0.7); });
whoosh(10.85, 0.4, 200, 2000, 0.6); bell(11, 76, 0.6, 0.3);
[11.5, 11.575, 11.65, 11.725].forEach((t, i) => whoosh(t - 0.05, 0.38, 250 + i * 150, 3000 + i * 1500, 0.9, -0.9, 0.9));

// 12–18: arpeggio + tile pops + iris
const ARP = [0, 3, 7, 10, 12, 10, 7, 3];
for (let t = 12; t < 17.5; t += 0.125) {
  const c = chordAt(t), i = Math.round((t - 12) / 0.125);
  const m = c.root + 24 + ARP[i % 8] + (c.root === 41 ? 4 - 3 : 0) * 0;
  pluck(t, m, 0.9, i % 2 ? 0.7 : -0.7, 0.12);
}
for (let i = 0; i < 9; i++) blip(12 + i * 0.0625, 900 + i * 180, 0.7, (i % 3) - 1, 0.04);
whoosh(12.95, 0.5, 500, 2500, 0.6);
for (let i = 0; i < 8; i++) tick(14 + i * 0.125, 0.5, i % 2 ? 0.5 : -0.5);
bell(15, 81, 0.8, 0); bell(15.02, 88, 0.4, 0.4);
whoosh(16.9, 0.8, 2000, 200, 0.8, 0.8, -0.8);
whoosh(17.4, 0.65, 300, 6000, 0.9); reverseSwell(18, 0.8, 0.5);

// 18–25: 3D depth
whoom(18, 1); impact(18, 0.4, 45);
whoosh(19, 1.6, 300, 900, 0.5, -1, 1); whoosh(19.4, 1.6, 900, 300, 0.4, 1, -1);
[20, 20.5, 21, 21.5, 22, 22.5, 23].forEach((t, i) => { whoosh(t - 0.34, 0.36, 300, 2600, 0.7, i % 2 ? 0.6 : -0.6); impact(t, 0.22, 85); blip(t, 2600, 0.35); });
subNote(21.5, 41.2, 1.5, 0.4); bell(21.5, 76, 0.5, -0.3);
whoosh(23, 1.0, 3000, 200, 0.6); // portal suction
whoom(24, 1.1); reverseSwell(25.0, 1.0, 0.8);

// 25–32: data + UI
impact(25, 0.5, 60);
for (let i = 0; i < 6; i++) { blip(25 + i * 0.125, 1200 + i * 220, 0.9, i % 2 ? 0.6 : -0.6); whoosh(25 + i * 0.125 - 0.05, 0.2, 800, 4000, 0.35, i % 2 ? 1 : -1, 0); }
for (let i = 0; i < 24; i++) tick(26 + i * 0.05, 0.55, 0.3);
voice(26, 1.0, (t) => Math.sin(TAU * (600 + 900 * t) * t) * 0.05 * Math.sin(Math.PI * t), { send: 0.2, pan: -0.3 }); // graph scan
blip(27.2, 3200, 0.8); bell(27.2, 84, 0.4);
impact(27.5, 0.3, 70);
[29.25, 29.375, 29.5].forEach((t, i) => { bell(t, [84, 88, 91][i], 0.6, i - 1, 0.6); });
{
  const keys = [[0.05, 0.38, 0.72, 0.95], [0.12, 0.5, 0.88], [0.2, 0.6, 0.8]];
  const inv = (k) => { let lo = 0, hi = 1; for (let j = 0; j < 30; j++) { const m = (lo + hi) / 2; const e = m < 0.5 ? 4 * m * m * m : 1 - Math.pow(-2 * m + 2, 3) / 2; e < k ? (lo = m) : (hi = m); } return lo; };
  keys.forEach((row, r) => row.forEach((k) => blip(29.5 + 1.3 * inv(k), 1800 + r * 500, 0.8, r - 1, 0.05)));
  for (let i = 0; i < 26; i++) tick(29.5 + i * 0.05, 0.25);
}
glitch(31.0, 0.55, 1.3); impact(31, 0.3, 90);
whoosh(31.5, 0.5, 300, 6000, 0.9);

// 32–38: transitions
[32, 33, 34, 35, 36, 37].forEach((t, i) => { whoosh(t - 0.2, 0.35, 300, 5000, 0.8, i % 2 ? 1 : -1, i % 2 ? -1 : 1); impact(t, 0.25, 80); });
blip(32.36, 900, 0.8); blip(32.42, 1200, 0.8); blip(32.48, 1500, 0.8); whoosh(32.6, 0.35, 1000, 3000, 0.5);
[33, 33.07, 33.14, 33.21].forEach((t, i) => whoosh(t, 0.3, 1500, 600, 0.5, (i - 1.5) / 1.5));
for (let i = 0; i < 6; i++) tick(34 + i * 0.06, 0.8, i % 2 ? 0.7 : -0.7);
bell(34.45, 79, 0.5);
whoosh(35.0, 0.45, 200, 1200, 0.7); impact(35.42, 0.25, 90);
riser(35.4, 0.6, 0.5);
voice(36.1, 0.6, (t) => Math.sin(TAU * (200 * t + 1500 * t * t)) * 0.08 * Math.min(1, t * 20) * (1 - t / 0.6), { send: 0.3 }); // bezier rising
riser(37.0, 0.42, 0.6); glitch(37.4, 0.1, 1.2); crash(37.4, 0.3);
zap(37.5, 1.2); whoosh(37.6, 0.42, 200, 4000, 0.9, -1, 1);

// 38–47: montage
for (let s = 0; s < 9; s++) {
  const t = 38 + s;
  impact(t, 0.35, 75); pluck(t, chordAt(t).pad[3] + 12, 1.2, 0, 0.12); pluck(t + 0.5, chordAt(t).pad[2] + 12, 0.8, 0.3, 0.1);
  whoosh(t - 0.15, 0.25, 500, 6000, 0.6, s % 2 ? 1 : -1, 0);
}
[38.5, 39.3, 41.0, 42.5, 43.125, 43.25, 43.375, 43.5, 43.625, 43.75, 43.875].forEach((t) => tick(t, 0.6));
for (let t = 45; t < 46; t += 0.25) snare(t, 0.7);
for (let t = 46; t < 46.75; t += 0.125) snare(t, 0.9);
for (let t = 46.5; t < 47; t += 0.0625) snare(t, 0.6 + (t - 46.5));
riser(43.5, 3.5, 0.9);
glitch(46.75, 0.25, 1.5);

// 48–60: outro
reverseSwell(48.0, 0.3, 1.0);
impact(48, 1.4, 55); crash(48, 1.0); subDrop(48, 1.1);
padChord(48, [45, 57, 60, 64, 71], 11.0, 1.4, 1600); // Am(add9)
subNote(48, 55, 11.5, 0.5);
[0, 1, 2, 3, 4].forEach((i) => whoosh(48.4 + i * 0.09, 0.32, 600, 3500, 0.5, (i - 2) / 2));
[48.62, 48.71, 48.8, 48.89, 48.98].forEach((t, i) => pluck(t + 0.08, [69, 72, 76, 79, 83][i], 0.8, (i - 2) * 0.3, 0.3));
whoosh(50, 0.5, 800, 4000, 0.5, -0.8, 0.8); bell(50.45, 88, 0.9, 0.6);
for (let i = 0; i < 15; i++) tick(51 + i / 16, 0.6);
for (let i = 0; i < 39; i++) tick(52.5 + i / 32, 0.3, 0.2);
blip(54, 2000, 0.7); blip(54.06, 3000, 0.6);
bell(55, 93, 0.9, 0.2, 2.2); bell(55.05, 88, 0.5, -0.3, 2.2);
voice(55, 1.0, (t) => { let s = 0; for (let h = 0; h < 5; h++) s += Math.sin(TAU * (6000 + h * 700 + 400 * t) * t + h); return s * 0.01 * Math.sin(Math.PI * t); }, { send: 0.6 }); // shimmer
[56, 57.5, 59].forEach((t, i) => bell(t, [81, 76, 81][i], 0.55, [-0.4, 0.4, 0][i], 2.4));
for (let t = 56; t < 59.5; t += 0.5) pluck(t, [69, 71, 72, 76][Math.round((t - 56) * 2) % 4] + 12, 0.25, ((t * 2) % 2) - 0.5, 0.35);
tick(59.5, 0.6);
// room tone throughout (very low)
voice(0, 60, () => noise() * 0.0012);

// ------------------------------------------------------------ reverb (Freeverb-style)
function reverb(inp, sizes, damp = 0.35, fb = 0.84) {
  const out = new Float32Array(N);
  const combs = sizes.map((s) => ({ b: new Float32Array(s), i: 0, f: 0 }));
  const aps = [556, 441, 341, 225].map((s) => ({ b: new Float32Array(Math.round(s * SR / 44100)), i: 0 }));
  for (let n = 0; n < N; n++) {
    const x = inp[n] * 0.015;
    let y = 0;
    for (const c of combs) {
      const o = c.b[c.i]; c.f = o * (1 - damp) + c.f * damp; c.b[c.i] = x + c.f * fb; c.i = (c.i + 1) % c.b.length; y += o;
    }
    for (const a of aps) { const o = a.b[a.i]; const v = -y + o; a.b[a.i] = y + o * 0.5; a.i = (a.i + 1) % a.b.length; y = v; }
    out[n] = y;
  }
  return out;
}
const sz = (arr, sp = 0) => arr.map((s) => Math.round((s + sp) * SR / 44100));
const RL = reverb(VL, sz([1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617])), RRv = reverb(VR, sz([1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], 23));

// ------------------------------------------------------------ master
const out = Buffer.alloc(44 + N * 4);
let peak = 0;
const mixL = new Float32Array(N), mixR = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let l = L[i] + RL[i] * 2.2, r = R[i] + RRv[i] * 2.2;
  // hard musical silence 47.0–47.7 (room tone only), swell resumes into 48
  if (t >= 47.0 && t < 47.7) { const k = Math.min(1, (t - 47.0) / 0.004); l = l * (1 - k) + noise() * 0.0006 * k; r = r * (1 - k) + noise() * 0.0006 * k; }
  // gentle resolved tail
  if (t > 59.2) { const g = Math.cos((t - 59.2) / 0.8 * Math.PI / 2) ** 2; l *= g; r *= g; }
  l = Math.tanh(l * 0.9); r = Math.tanh(r * 0.9);
  mixL[i] = l; mixR[i] = r; peak = Math.max(peak, Math.abs(l), Math.abs(r));
}
// The silence window must stay silent even after reverb tails: re-apply hard gate.
const norm = 0.89 / peak;
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(mixL[i] * norm * 32767))), 44 + i * 4);
  out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(mixR[i] * norm * 32767))), 46 + i * 4);
}
fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'build/audio.wav'), out);
console.log('audio.wav written, peak', peak.toFixed(3));
