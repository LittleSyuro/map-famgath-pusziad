// 07 — FINAL LOGO LOCKUP / OUTRO  [48.0 – 60.0 s]
import {
  W, H, CX, CY, C, F, E, TAU, DEG, clamp, prog, lerp, tw, spring, hit, rgba, mix, text, measure, fit, layout, typed,
  circle, glow, star4, bgFill, camera, smear, rng, flash, buffer,
} from '../core.js';

const R = rng(4807);
const PARTS = Array.from({ length: 220 }, () => {
  const a = R() * TAU, sp = 300 + R() * 1500;
  return { a, sp, r: 1.5 + R() * 4, col: R() < 0.35 ? C.lime : R() < 0.6 ? C.sageL : C.cream, drift: R() * TAU, life: 0.6 + R() * 0.4 };
});
const SCATTER = [[-260, -820, -1.1, 70], [180, 760, 0.9, -60], [-120, -980, 1.3, 40], [300, 880, -0.8, -80], [120, -760, 1.6, 50]];

export function drawOutro(ctx, t, canvas) {
  // Forest → Ink radial background
  const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, 1150);
  g.addColorStop(0, C.forest); g.addColorStop(1, C.ink);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // subtle grid
  ctx.save();
  const ga = 0.07 * E.outCubic(prog(t, 48.2, 49.5));
  ctx.strokeStyle = rgba(C.sage, ga); ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();

  const push = 1 + 0.07 * E.inOutCubic(prog(t, 56, 59.2)) + 0.05 * hit(t, 48, 3);
  const settle = 1 - 0.035 * E.sig(prog(t, 59, 60)) ;
  ctx.save();
  camera(ctx, { zoom: push * settle });

  // shockwave rings
  for (const [t0, col, w] of [[48, C.lime, 10], [48.06, C.sage, 6], [48.16, C.sageL, 3], [48.5, C.moss, 3]]) {
    const k = prog(t, t0, t0 + 1.4);
    if (k <= 0 || k >= 1) continue;
    ctx.strokeStyle = rgba(col, 0.85 * (1 - k)); ctx.lineWidth = w * (1 - k) + 1;
    circle(ctx, CX, CY, E.outCubic(k) * 1100); ctx.stroke();
  }
  // particles: burst then slow drift
  for (const p of PARTS) {
    const k = t - 48; if (k < 0) break;
    const d = p.sp * (1 - Math.exp(-k * 3.2)) / 3.2 * 1.6;
    const x = CX + Math.cos(p.a) * d + Math.sin(t * 0.4 + p.drift) * 20;
    const y = CY + Math.sin(p.a) * d - k * 9 + Math.cos(t * 0.3 + p.drift) * 16;
    const a = clamp(1 - k * 0.04) * (0.35 + 0.65 * Math.exp(-k * 0.6)) * p.life;
    ctx.fillStyle = rgba(p.col, a); circle(ctx, x, y, p.r); ctx.fill();
  }
  glow(ctx, CX, CY, 700, C.sage, 0.12 + 0.3 * hit(t, 48, 2));

  // wordmark: letters fly in and spring into alignment
  const size = fit(ctx, F.syne, 'SYURO', 900), font = F.syne(size);
  const lay = layout(ctx, font, 'SYURO', CX, 0);
  const m = measure(ctx, font, 'S');
  const baseY = CY + m.asc / 2 - 40;
  const [wb, wx] = buffer('outro_word');
  wx.setTransform(ctx.getTransform());
  for (let i = 0; i < 5; i++) {
    const c = lay.chars[i];
    const k = t - (48.5 + i * 0.09);
    if (k < 0) continue;
    const s = spring(k, 1.5, 5.2);
    const [sx0, sy0, rot0, ry0] = SCATTER[i];
    const pos = (kk) => { const ss = spring(kk, 1.5, 5.2); return [sx0 * (1 - ss), sy0 * (1 - ss)]; };
    const [dx, dy] = pos(k), [px, py] = pos(k - 1 / 60);
    const ry = ry0 * DEG * (1 - s) * 3;
    smear(wx, (dx - px) * 2, (dy - py) * 2, (ox, oy) => {
      wx.save();
      wx.translate(c.cx + dx + ox, baseY - m.asc / 2 + dy + oy);
      wx.rotate(rot0 * (1 - s));
      wx.scale(Math.cos(ry), 1 - 0.3 * Math.abs(Math.sin(ry)));
      text(wx, c.ch, 0, m.asc / 2, { font, fill: C.cream });
      wx.restore();
    }, 8);
  }
  // shine sweep across the wordmark (55.0): tints only the letter pixels
  const sk = prog(t, 55.0, 55.85);
  if (sk > 0 && sk < 1) {
    wx.save();
    wx.globalCompositeOperation = 'source-atop';
    const x = lerp(CX - 700, CX + 700, E.inOutCubic(sk));
    const sg = wx.createLinearGradient(x - 180, 0, x + 180, 0);
    sg.addColorStop(0, rgba(C.sage, 0)); sg.addColorStop(0.35, rgba(C.sage, 0.65)); sg.addColorStop(0.5, rgba(C.lime, 1));
    sg.addColorStop(0.65, rgba(C.sage, 0.65)); sg.addColorStop(1, rgba(C.sage, 0));
    wx.translate(x, CY); wx.transform(1, 0, -0.35, 1, 0, 0); wx.translate(-x, -CY);
    wx.fillStyle = sg; wx.fillRect(x - 200, 0, 400, H);
    wx.restore();
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(wb, 0, 0); ctx.restore();
  if (sk > 0 && sk < 1) {
    const x = lerp(CX - 700, CX + 700, E.inOutCubic(sk));
    ctx.save(); ctx.globalAlpha = 0.25 * Math.sin(Math.PI * sk); glow(ctx, x, baseY - m.asc / 2, 220, C.lime, 0.8); ctx.restore();
  }

  // underline + star (50.0)
  const ul = E.sig(prog(t, 50.0, 50.5));
  const uy = baseY + 46, ux0 = lay.chars[0].x, uw = lay.w;
  if (ul > 0) { ctx.fillStyle = C.lime; ctx.fillRect(ux0, uy, uw * ul, 9); }
  const sp = E.outBack(prog(t, 50.45, 50.8), 3);
  if (sp > 0) {
    const sx = ux0 + uw + 34, sy = uy + 4;
    const rot = (t - 50.45) * 0.35 + E.inOutCubic(prog(t, 57, 58.5)) * Math.PI / 2;
    glow(ctx, sx, sy, 90 * sp, C.lime, 0.45 + 0.15 * Math.sin(t * 3));
    ctx.fillStyle = C.lime; star4(ctx, sx, sy, 34 * sp, rot, 0.24); ctx.fill();
  }

  // typewriter lines
  const l1 = 'MOTION DESIGNER';
  const s1 = typed(l1, t, 51.0, 16);
  const ty = uy + 110;
  if (s1) {
    text(ctx, s1.padEnd(l1.length), CX, ty, { font: F.mono(50), fill: C.cream, track: 8 });
    if (s1.length < l1.length) {
      const wv = measure(ctx, F.mono(50), l1).w + 8 * (l1.length - 1);
      ctx.fillStyle = C.lime; ctx.fillRect(CX - wv / 2 + (wv / l1.length) * s1.length + 4, ty - 40, 26, 48);
    }
  }
  const l2full = 'SHOWREEL · 2026 · TYPE · SHAPE · 3D · UI', l2end = 'SHOWREEL · 2026';
  let s2 = typed(l2full, t, 52.5, 32);
  if (t >= 59.0) { // trim to the final clean line
    const n = Math.round(lerp(l2full.length, l2end.length, E.inOutCubic(prog(t, 59.0, 59.4))));
    s2 = l2full.slice(0, n);
  }
  if (s2) {
    const target = t >= 59.0 ? (s2.length <= l2end.length ? l2end : s2) : l2full;
    text(ctx, s2.padEnd(target.length), CX, ty + 68, { font: F.mono(30, false), fill: C.sageL, track: 3 });
  }
  ctx.restore();

  // gentle settle into ink at the very end (not a fade-out)
  flash(ctx, C.ink, 0.22 * E.inOutCubic(prog(t, 59.0, 60.0)));
  return { flash: hit(t, 48, 5.5), flashColor: C.cream, rgb: 8 * hit(t, 48, 9) };
}
