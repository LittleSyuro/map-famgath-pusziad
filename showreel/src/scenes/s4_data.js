// 04 — DATA + UI  [25.0 – 32.0 s]
import {
  W, H, CX, CY, C, F, E, TAU, clamp, prog, lerp, tw, spring, hit, hits, kick, rgba, mix, text, rrect, circle,
  glow, star4, bgFill, camera, shake,
} from '../core.js';

const MX = 70, PW = W - MX * 2;
const PANELS = [
  { id: 'line', x: MX, y: 175, w: PW, h: 330 },
  { id: 'count', x: MX, y: 525, w: PW / 2 - 10, h: 250 },
  { id: 'spec', x: MX + PW / 2 + 10, y: 525, w: PW / 2 - 10, h: 250 },
  { id: 'bars', x: MX, y: 795, w: PW, h: 320 },
  { id: 'rings', x: MX, y: 1135, w: PW, h: 280 },
  { id: 'keys', x: MX, y: 1435, w: PW, h: 300 },
];
const DATA = [0.18, 0.22, 0.2, 0.31, 0.28, 0.36, 0.42, 0.39, 0.5, 0.47, 0.58, 0.66, 0.62, 0.74, 0.83, 0.92];

function panelBox(ctx, p, active) {
  rrect(ctx, p.x, p.y, p.w, p.h, 24);
  const g = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
  g.addColorStop(0, rgba(C.deep, 0.62)); g.addColorStop(1, rgba(C.forest, 0.5));
  ctx.fillStyle = g; ctx.fill();
  // frosted sheen
  const s = ctx.createLinearGradient(p.x, p.y, p.x + p.w * 0.6, p.y + p.h);
  s.addColorStop(0, rgba(C.mist, 0.1)); s.addColorStop(0.5, rgba(C.mist, 0)); ctx.fillStyle = s; ctx.fill();
  ctx.strokeStyle = rgba(C.cream, 0.42); ctx.lineWidth = 2; ctx.stroke();
  // lime active corner
  ctx.strokeStyle = active ? C.lime : rgba(C.lime, 0.4); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(p.x + 24, p.y); ctx.lineTo(p.x + 84, p.y); ctx.stroke();
}
const label = (ctx, s, x, y, col = C.sageL) => text(ctx, s, x, y, { font: F.mono(24), fill: col, align: 'left', track: 2 });

function linePanel(ctx, p, t) {
  label(ctx, 'GROWTH / LIVE', p.x + 28, p.y + 48);
  const k = E.inOutCubic(prog(t, 26.0, 27.0));
  const x0 = p.x + 30, x1 = p.x + p.w - 30, y0 = p.y + p.h - 34, y1 = p.y + 80;
  ctx.strokeStyle = rgba(C.sage, 0.18); ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) { const y = lerp(y0, y1, i / 3); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
  const pts = DATA.map((v, i) => [lerp(x0, x1, i / (DATA.length - 1)), lerp(y0, y1, v + 0.02 * Math.sin(t * 3 + i))]);
  const n = (DATA.length - 1) * k;
  if (k <= 0) return;
  const path = [];
  for (let i = 0; i <= Math.floor(n); i++) path.push(pts[i]);
  if (n < DATA.length - 1) { const i = Math.floor(n), f = n - i; path.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]); }
  const head = path[path.length - 1];
  // area fill
  const g = ctx.createLinearGradient(0, y1, 0, y0);
  g.addColorStop(0, rgba(C.sage, 0.55)); g.addColorStop(1, rgba(C.sage, 0.02));
  ctx.beginPath(); ctx.moveTo(path[0][0], y0); path.forEach((q) => ctx.lineTo(q[0], q[1])); ctx.lineTo(head[0], y0); ctx.closePath();
  ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); path.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
  ctx.strokeStyle = C.sageL; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  glow(ctx, head[0], head[1], 70, C.lime, 0.8);
  ctx.fillStyle = C.lime; circle(ctx, head[0], head[1], 11 + 3 * kick(t)); ctx.fill();
  ctx.strokeStyle = rgba(C.lime, 0.5); ctx.lineWidth = 2; circle(ctx, head[0], head[1], 22 + 10 * kick(t)); ctx.stroke();
}

function countPanel(ctx, p, t) {
  label(ctx, 'ENGAGEMENT', p.x + 28, p.y + 48);
  const v = Math.round(248 * E.outCubic(prog(t, 26.0, 27.2)));
  const pop = 1 + 0.08 * hit(t, 27.2, 8);
  ctx.save(); ctx.translate(p.x + p.w / 2, p.y + 180); ctx.scale(pop, pop);
  text(ctx, `+${v}%`, 0, 0, { font: F.anton(118), fill: v >= 248 ? C.lime : C.cream });
  ctx.restore();
}

function specPanel(ctx, p, t) {
  const rows = ['60 FPS', '120 BPM', '60 SEC'];
  rows.forEach((r, i) => {
    const a = E.outCubic(prog(t, 25.6 + i * 0.125, 25.9 + i * 0.125));
    const y = p.y + 72 + i * 66;
    const [num, unit] = r.split(' ');
    text(ctx, num, p.x + 34 + (1 - a) * 40, y + 8, { font: F.anton(60), fill: C.cream, align: 'left', alpha: a });
    text(ctx, unit, p.x + p.w - 34, y + 4, { font: F.mono(30), fill: i === 1 ? C.lime : C.sageL, align: 'right', alpha: a });
    if (i < 2) { ctx.fillStyle = rgba(C.sage, 0.25); ctx.fillRect(p.x + 30, y + 26, p.w - 60, 2); }
  });
}

function barsPanel(ctx, p, t) {
  label(ctx, 'RHYTHM / KICK', p.x + 28, p.y + 48);
  const N = 12, hero = 8, gap = 18;
  const bw = (p.w - 60 - gap * (N - 1)) / N, base = p.y + p.h - 30;
  for (let i = 0; i < N; i++) {
    const tv = 0.3 + 0.45 * Math.abs(Math.sin(i * 1.7 + 0.4)) * (i === hero ? 0 : 1) + (i === hero ? 0.92 : 0);
    const rise = spring(t - 27.5 - i * 0.03, 2.2, 7);
    const pulse = t > 27.5 ? 1 + 0.12 * kick(t) * (i === hero ? 1.3 : 0.6) : 1;
    const h = (p.h - 120) * Math.min(1.02, tv) * rise * pulse;
    const x = p.x + 30 + i * (bw + gap);
    ctx.fillStyle = i === hero ? C.lime : rgba(C.sage, 0.85);
    rrect(ctx, x, base - Math.max(0, h), bw, Math.max(0, h), 6); ctx.fill();
    if (i === hero && rise > 0.6) {
      const a = E.outCubic(prog(t, 27.8, 28.1));
      text(ctx, 'PEAK / 120', x + bw / 2, base - h - 18, { font: F.mono(24), fill: C.lime, alpha: a });
    }
  }
}

function ringsPanel(ctx, p, t) {
  const names = ['EASE', 'FLOW', 'DETAIL'];
  for (let i = 0; i < 3; i++) {
    const cx = p.x + p.w * (i + 0.5) / 3, cy = p.y + 120, r = 76;
    const t0 = 28.5 + i * 0.125;
    const k = E.inOutCubic(prog(t, t0, t0 + 0.75));
    ctx.strokeStyle = rgba(C.sage, 0.22); ctx.lineWidth = 16; circle(ctx, cx, cy, r); ctx.stroke();
    ctx.strokeStyle = k >= 1 ? C.lime : C.sageL; ctx.lineCap = 'round';
    if (k > 0) { ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke(); }
    ctx.lineCap = 'butt';
    text(ctx, `${Math.round(k * 100)}`, cx, cy + 20, { font: F.anton(54), fill: C.cream });
    text(ctx, names[i], cx, p.y + p.h - 32, { font: F.mono(26), fill: C.sageL, track: 2 });
    // sparkle at completion
    const sp = prog(t, t0 + 0.75, t0 + 1.15);
    if (sp > 0 && sp < 1) {
      const ex = cx, ey = cy - r;
      glow(ctx, ex, ey, 60, C.lime, 0.8 * (1 - sp));
      ctx.fillStyle = C.lime; star4(ctx, ex, ey, 34 * E.outBack(clamp(sp * 3)) * (1 - sp), sp * 2, 0.2); ctx.fill();
    }
  }
}

function keysPanel(ctx, p, t) {
  const rows = ['POSITION', 'SCALE', 'OPACITY'];
  const tx0 = p.x + 250, tx1 = p.x + p.w - 36;
  const ph = E.inOutCubic(prog(t, 29.5, 30.8));
  const px = lerp(tx0, tx1, ph);
  // ruler
  ctx.strokeStyle = rgba(C.sage, 0.5); ctx.lineWidth = 2;
  for (let i = 0; i <= 20; i++) { const x = lerp(tx0, tx1, i / 20); ctx.beginPath(); ctx.moveTo(x, p.y + 30); ctx.lineTo(x, p.y + (i % 5 ? 42 : 52)); ctx.stroke(); }
  rows.forEach((r, i) => {
    const y = p.y + 105 + i * 70;
    const keys = [[0.05, 0.38, 0.72, 0.95], [0.12, 0.5, 0.88], [0.2, 0.6, 0.8]][i];
    const lit = px > tx0 + 2 && ph > 0;
    const rowLit = keys.some((kk) => lerp(tx0, tx1, kk) <= px) && lit;
    text(ctx, r, p.x + 30, y + 10, { font: F.mono(26), fill: rowLit ? C.lime : C.sageL, align: 'left', track: 1 });
    ctx.strokeStyle = rgba(C.sage, 0.3); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx0, y); ctx.lineTo(tx1, y); ctx.stroke();
    for (const kk of keys) {
      const x = lerp(tx0, tx1, kk);
      const on = x <= px && lit;
      const pop = on ? 1 + 0.5 * Math.exp(-(px - x) / 30) : 1;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.scale(pop, pop);
      ctx.fillStyle = on ? C.lime : C.deep; ctx.fillRect(-11, -11, 22, 22);
      ctx.strokeStyle = on ? C.lime : C.sageL; ctx.lineWidth = 2.5; ctx.strokeRect(-11, -11, 22, 22);
      ctx.restore();
      if (on) glow(ctx, x, y, 36, C.lime, 0.5 * Math.exp(-(px - x) / 60));
    }
  });
  if (t >= 29.3) {
    ctx.fillStyle = C.lime; ctx.fillRect(px - 2, p.y + 26, 4, p.h - 46);
    ctx.beginPath(); ctx.moveTo(px - 12, p.y + 22); ctx.lineTo(px + 12, p.y + 22); ctx.lineTo(px, p.y + 38); ctx.closePath(); ctx.fill();
  }
}

const DRAW = { line: linePanel, count: countPanel, spec: specPanel, bars: barsPanel, rings: ringsPanel, keys: keysPanel };

export function drawData(ctx, t) {
  bgFill(ctx, C.bg);
  // green glass ambience
  for (const [x, y, r, c, a] of [[200, 400, 700, C.sage, 0.22], [900, 1300, 800, C.moss, 0.3], [600, 1900, 600, C.lime, 0.08]]) {
    const g = ctx.createRadialGradient(x + Math.sin(t) * 40, y, 0, x, y, r);
    g.addColorStop(0, rgba(c, a)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  // technical grid
  ctx.strokeStyle = rgba(C.sage, 0.07); ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 45) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 45) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  const sh = shake(t, 3 * hits(t, [25, 27.5, 28.5], 9) + 14 * prog(t, 31, 31.6));
  const drift = Math.sin((t - 25) * 0.6) * 10;
  const intro = hit(t, 25, 5);
  ctx.save();
  camera(ctx, { zoom: 1 + 0.06 * intro + 0.008 * kick(t), x: sh[0], y: sh[1] + drift });
  PANELS.forEach((p, i) => {
    const t0 = 25.0 + i * 0.125;
    const k = t - t0;
    if (k < 0) return;
    const s = spring(k, 1.8, 7.5);
    const dir = i % 2 ? 1 : -1;
    const dx = (1 - s) * 1150 * dir;
    // collapse into horizontal bands at 31.0
    const col = E.inCubic(prog(t, 31.0, 31.55));
    ctx.save();
    ctx.translate(dx, 0);
    if (col > 0) { ctx.translate(0, p.y + p.h / 2); ctx.scale(1 + col * 0.15, 1 - col * 0.94); ctx.translate(0, -(p.y + p.h / 2)); }
    panelBox(ctx, p, t > t0 + 0.4);
    ctx.save(); rrect(ctx, p.x, p.y, p.w, p.h, 24); ctx.clip();
    DRAW[p.id](ctx, p, t);
    ctx.restore();
    ctx.restore();
  });
  ctx.restore();

  // final lime band wipes upward
  const wp = E.inOutCubic(prog(t, 31.55, 32.0));
  if (wp > 0) {
    const top = lerp(H + 40, -40, wp);
    ctx.fillStyle = C.lime; ctx.fillRect(0, top, W, H - top + 50);
    ctx.fillStyle = rgba(C.cream, 0.8); ctx.fillRect(0, top - 6, W, 6);
  }
  const gk = prog(t, 31.0, 31.55) * (t < 31.6 ? 1 : 0);
  return { slice: 70 * gk + 30 * hit(t, 31, 14), rgb: 12 * gk, bands: 22 };
}
