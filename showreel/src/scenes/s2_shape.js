// 02 — SHAPE + RHYTHM  [12.0 – 18.0 s]
import {
  W, H, CX, CY, C, F, E, TAU, clamp, prog, lerp, tw, spring, hit, kick, rgba, mix, ramp, text, typed, rrect, circle,
  glow, bgFill, camera, shake, hash,
} from '../core.js';

const COLS = 17, ROWS = 30, CW = W / COLS, CH = H / ROWS;
// 5×7 dot-matrix glyphs
const GLYPH = {
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
};
// "SYU" on rows 7–13, "RO" on rows 16–22 (vertical-first composition).
const LETTER = new Set();
const place = (ch, c0, r0) => GLYPH[ch].forEach((row, r) => [...row].forEach((b, c) => b === '1' && LETTER.add((r0 + r) * COLS + c0 + c)));
place('S', 0, 7); place('Y', 6, 7); place('U', 12, 7);
place('R', 3, 16); place('O', 9, 16);

const tiles = [];
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
  const x = (c + 0.5) * CW, y = (r + 0.5) * CH;
  const d = Math.hypot((x - CX) / CW, (y - CY) / CH);
  tiles.push({ c, r, x, y, d, letter: LETTER.has(r * COLS + c), h: hash(r * 31 + c * 7) });
}
const MAXD = Math.max(...tiles.map((t) => t.d));

export function drawShape(ctx, t) {
  bgFill(ctx, C.forest);
  // glowing modular grid lines
  ctx.save();
  ctx.strokeStyle = rgba(C.sage, 0.08 + 0.06 * kick(t)); ctx.lineWidth = 1.5;
  for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * CW, 0); ctx.lineTo(c * CW, H); ctx.stroke(); }
  for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * CH); ctx.lineTo(W, r * CH); ctx.stroke(); }
  ctx.restore();

  const sh = shake(t, 4 * hit(t, 15, 8) + 3 * kick(t) * (t > 14 && t < 15 ? 1 : 0));
  const irisZoom = 1 + 3 * E.inExpo(prog(t, 17.55, 18));
  ctx.save();
  const safe = lerp(1, 0.86, E.sig(prog(t, 15.0, 15.6)));
  camera(ctx, { zoom: (1 + 0.012 * kick(t)) * irisZoom * safe, x: sh[0], y: sh[1] });

  const base = 46; // tile size
  const morph = E.inOutCubic(prog(t, 13.0, 13.6));   // square → circle
  const turn = E.outBack(prog(t, 13.0, 13.5), 1.3) * Math.PI / 2;
  const form = E.sig(prog(t, 15.0, 15.6));           // dot-matrix organisation
  const liquid = prog(t, 17.0, 17.75);
  const field = Math.max(0, t - 16) * 0.35;

  for (const tl of tiles) {
    // ripple pop, quantised to 16ths
    const group = Math.floor((tl.d / MAXD) * 8);
    const t0 = 12 + group * 0.0625;
    let s = E.outBack(prog(t, t0, t0 + 0.28), 2.4);
    if (s <= 0) continue;
    // per-kick pulse from 14 s
    if (t >= 14) s *= 1 + 0.16 * kick(t, 7) * Math.exp(-tl.d * 0.08);
    let x = tl.x, y = tl.y;
    // reorganise swirl into the letter field
    const sw = (1 - form) * (t >= 15 ? 0.6 : 0) * Math.sin(tl.h * 6);
    if (t >= 15 && form < 1) {
      const a = sw * 0.6; const dx = x - CX, dy = y - CY;
      x = CX + dx * Math.cos(a) - dy * Math.sin(a); y = CY + dx * Math.sin(a) + dy * Math.cos(a);
    }
    // magnetic field rotation for the dim dots
    if (!tl.letter && field > 0) {
      const a = field * (0.6 + 0.4 / (1 + tl.d * 0.1));
      const dx = x - CX, dy = y - CY;
      x = CX + dx * Math.cos(a) - dy * Math.sin(a); y = CY + dx * Math.sin(a) + dy * Math.cos(a);
    }
    // liquefy → spiral into the centre
    if (liquid > 0) {
      const lk = E.inCubic(clamp(liquid * 1.5 - (tl.d / MAXD) * 0.5));
      const a = lk * 4.5;
      const dx = (x - CX) * (1 - lk), dy = (y - CY) * (1 - lk);
      x = CX + dx * Math.cos(a) - dy * Math.sin(a); y = CY + dx * Math.sin(a) + dy * Math.cos(a);
      s *= 1 - lk * 0.75;
    }

    // colour: deep → diagonal wave → letter / dim
    let col = mix(C.deep, C.moss, 0.25 + 0.2 * tl.h);
    if (t >= 14) {
      const diag = (tl.c + (ROWS - 1 - tl.r)) / (COLS + ROWS);
      const w = prog(t, 14, 14.2);
      col = mix(col, ramp([C.lime, C.sage, C.sageL, C.moss], diag * 1.4 - (t - 14) * 0.9), w * (1 - form));
    }
    let size = base * s;
    if (form > 0) {
      if (tl.letter) {
        col = mix(col, C.cream, form);
        const breathe = t >= 16 ? 1 + 0.18 * Math.sin((t - 16) * TAU * 2 - tl.d * 0.55) : 1;
        size = lerp(size, base * 1.02 * breathe * s, form);
      } else {
        col = mix(col, C.moss, form);
        size = lerp(size, 13 * s, form);
      }
    }
    const r = lerp(size * 0.12, size / 2, morph);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(turn);
    if (morph > 0 && form < 1) { // long shadow + bevel
      ctx.fillStyle = rgba(C.ink, 0.35 * morph * (1 - form));
      rrect(ctx, -size / 2 + 6, -size / 2 + 8, size, size, r); ctx.fill();
    }
    if (tl.letter && form > 0) {
      ctx.globalAlpha = form * (1 - liquid);
      glow(ctx, 0, 0, size * 1.25, C.lime, 0.55);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = col;
    rrect(ctx, -size / 2, -size / 2, size, size, r); ctx.fill();
    if (morph > 0 && !(tl.letter && form > 0.5)) {
      ctx.strokeStyle = rgba(C.cream, 0.18 * morph * (1 - form)); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, size / 2 - 3, Math.PI * 1.05, Math.PI * 1.6); ctx.stroke();
    }
    if (tl.letter && form > 0.4) {
      ctx.strokeStyle = rgba(C.lime, 0.9 * form); ctx.lineWidth = 3;
      rrect(ctx, -size / 2, -size / 2, size, size, r); ctx.stroke();
    }
    ctx.restore();
  }

  // particles collapsing into the core
  if (liquid > 0.3) glow(ctx, CX, CY, 260 * prog(t, 17.2, 17.6), C.lime, 0.5 * (1 - prog(t, 17.6, 17.9)));

  // label
  const lbl = 'SHAPE / RHYTHM / 120 BPM';
  const s = typed(lbl, t, 16.0, 40);
  if (s && liquid < 0.6) {
    const a = 1 - prog(t, 17, 17.3);
    ctx.fillStyle = rgba(C.forest, 0.85 * a); ctx.fillRect(CX - 300, 1555, 600, 64);
    text(ctx, s.padEnd(lbl.length), CX, 1600, { font: F.mono(32), fill: C.lime, track: 2, alpha: a });
  }

  // mist iris
  const ir = E.inCubic(prog(t, 17.45, 18.0));
  if (ir > 0) {
    ctx.fillStyle = C.mist;
    circle(ctx, CX, CY, ir * 1200); ctx.fill();
    ctx.strokeStyle = rgba(C.sageL, 0.8); ctx.lineWidth = 10;
    circle(ctx, CX, CY, ir * 1200 + 14); ctx.stroke();
  }
  ctx.restore();
}
