// 01 — KINETIC TYPE / MOVEMENT  [5.0 – 12.0 s]
import {
  W, H, CX, CY, C, F, E, TAU, DEG, clamp, prog, lerp, tw, spring, hit, hits, kick, rgba, text, measure, fit,
  smear, star4, bgFill, camera, shake, glow,
} from '../core.js';

const WORDS = [
  { s: 'MOTION', t0: 5.0, from: 'left', label: '(01)' },
  { s: 'THAT', t0: 6.0, from: 'right', label: '(02)' },
  { s: 'MOVES', t0: 7.0, from: 'below', label: '(03)' },
  { s: 'PEOPLE.', t0: 8.0, from: 'above', label: '(04)' },
];
const SLOT_Y = [560, 860, 1160, 1460]; // baseline-centre of each line in the stack
const LINE_H = 300;

// fill styles used by the 10.0 s fill ↔ outline swap
const STYLES = [
  { fill: C.forest },
  { fill: C.cream },
  { fill: C.sageL, shadow: C.forest },
  { stroke: C.cream, inner: C.sage },
  { stroke: C.forest },
];
const baseStyle = [0, 3, 1, 0];

function marquee(ctx, t, cam) {
  ctx.save();
  ctx.translate(CX, CY); ctx.rotate(-14 * DEG); ctx.translate(-CX, -CY);
  const row = 'SYURO / MOTION / DESIGN / ';
  const font = F.anton(150);
  const w = measure(ctx, font, row).w;
  for (let r = -2; r < 14; r++) {
    const y = -260 + r * 185 + cam.y * 0.4;
    const dir = r % 2 ? 1 : -1;
    const off = (((t - 5) * 260 * dir + r * 333) % w + w) % w;
    ctx.font = font; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = rgba(C.forest, r % 3 === 0 ? 0.32 : 0.18);
    for (let x = -w * 2 + off; x < W + w; x += w) ctx.strokeText(row, x - 200, y);
  }
  ctx.restore();
}

function persGrid(ctx, t) {
  ctx.save();
  ctx.translate(CX, CY + 300);
  ctx.rotate((t - 5) * 3 * DEG);
  ctx.scale(1, 0.55);
  ctx.strokeStyle = rgba(C.forest, 0.13); ctx.lineWidth = 2;
  const s = 120;
  for (let i = -14; i <= 14; i++) {
    ctx.beginPath(); ctx.moveTo(i * s, -1800); ctx.lineTo(i * s, 1800); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1800, i * s); ctx.lineTo(1800, i * s); ctx.stroke();
  }
  ctx.restore();
}

function shadows(ctx, t) {
  // drifting forest shadow shapes
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const x = CX + Math.sin(t * 0.6 + i * 2.1) * 420, y = 300 + i * 650 + Math.cos(t * 0.5 + i) * 120;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 700);
    g.addColorStop(0, rgba(C.deep, 0.32)); g.addColorStop(1, rgba(C.deep, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function wordPose(w, i, t) {
  const k = t - w.t0;
  const p = E.outExpo(clamp(k / 0.42));
  const st = spring(k, 2.2, 8);
  const off = 1 - st;
  let dx = 0, dy = 0;
  if (w.from === 'left') dx = -1300 * (1 - p);
  if (w.from === 'right') dx = 1300 * (1 - p);
  if (w.from === 'below') dy = 1100 * (1 - p);
  if (w.from === 'above') dy = -1100 * (1 - p);
  const skew = (w.from === 'left' ? -0.35 : w.from === 'right' ? 0.35 : 0) * (1 - p) + off * 0.08;
  const sy = w.from === 'below' || w.from === 'above' ? 1 + 0.35 * (1 - p) - off * 0.1 : 1;
  return { dx, dy, skew, sy, p };
}

function drawWord(ctx, w, i, t, style, alpha = 1) {
  const font = F.anton(fit(ctx, F.anton, w.s, w.s === 'THAT' ? 640 : 900));
  const m = measure(ctx, font, w.s);
  const pose = wordPose(w, i, t);
  const k1 = 1 / 60;
  const prev = wordPose(w, i, t - k1);
  const vx = (pose.dx - prev.dx) * 2.2, vy = (pose.dy - prev.dy) * 2.2;
  const y = SLOT_Y[i];
  ctx.save();
  ctx.globalAlpha *= alpha;
  smear(ctx, vx, vy, (ox, oy) => {
    ctx.save();
    ctx.translate(CX + pose.dx + ox, y + pose.dy + oy);
    ctx.transform(1, 0, pose.skew, 1, 0, 0);
    ctx.scale(1, pose.sy);
    ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const by = m.asc / 2;
    const isPeople = w.s === 'PEOPLE.';
    const main = isPeople ? 'PEOPLE' : w.s;
    const mw = measure(ctx, font, main).w;
    const left = -m.w / 2;
    const fillText = (dx, dy) => { ctx.textAlign = 'left'; ctx.fillText(main, left + dx, by + dy); };
    if (style.shadow) { ctx.fillStyle = style.shadow; fillText(14, 14); }
    if (style.inner) { ctx.fillStyle = style.inner; fillText(0, 0); }
    if (style.fill) { ctx.fillStyle = style.fill; fillText(0, 0); }
    if (style.stroke) { ctx.strokeStyle = style.stroke; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.textAlign = 'left'; ctx.strokeText(main, left, by); }
    if (isPeople) { ctx.fillStyle = C.lime; ctx.textAlign = 'left'; ctx.fillText('.', left + mw, by); }
    ctx.restore();
  }, 7);
  // mono label
  const la = E.outCubic(prog(t, w.t0 + 0.12, w.t0 + 0.35));
  if (la > 0) text(ctx, w.label, CX + m.w / 2 + pose.dx + 4, y - m.asc / 2 - 6 + pose.dy, { font: F.mono(30), fill: C.forest, align: 'right', alpha: la });
  ctx.restore();
}

function badge(ctx, t) {
  const k = E.outBack(prog(t, 11.0, 11.45), 1.6);
  if (k <= 0) return;
  const R = 468 * k, rot = (t - 11) * 0.9;
  ctx.save();
  ctx.translate(CX, CY - 50);
  ctx.globalAlpha = clamp(k);
  ctx.strokeStyle = rgba(C.forest, 0.6); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, R + 44, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, R - 44, 0, TAU); ctx.stroke();
  const str = 'SYURO • MOTION DESIGN • SHOWREEL 2026 • ';
  ctx.font = F.mono(40); ctx.fillStyle = C.forest; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const n = str.length;
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU;
    ctx.save(); ctx.rotate(a); ctx.translate(0, -R); ctx.fillText(str[i], 0, 0); ctx.restore();
  }
  ctx.fillStyle = C.lime; star4(ctx, 0, 0, 170 * k, -rot * 1.6, 0.22); ctx.fill();
  ctx.restore();
}

function stripes(ctx, t) {
  const a = -40 * DEG; // travel toward top-right
  const dx = Math.cos(a), dy = Math.sin(a);
  const span = 2600;
  const cols = [C.lime, C.cream, C.deep, C.forest];
  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(a);
  for (let i = 0; i < 4; i++) {
    const t0 = 11.5 + i * 0.075;
    const last = i === 3;
    const p = E.inOutCubic(prog(t, t0, last ? 12.0 : t0 + 0.32));
    if (p <= 0) continue;
    const bandW = [420, 300, 520][i];
    const lead = lerp(-span / 2 - 300, span / 2 + (last ? 900 : bandW + 300), p);
    const tail = last ? -span : lead - bandW;
    ctx.fillStyle = cols[i];
    ctx.beginPath();
    const sk = 260; // skew of the stripe edges
    ctx.moveTo(tail - sk, -span); ctx.lineTo(lead - sk, -span); ctx.lineTo(lead + sk, span); ctx.lineTo(tail + sk, span);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export function drawKinetic(ctx, t) {
  bgFill(ctx, C.sage);
  // camera follows the active word, then pulls back to the stack at 9.0
  let focus = 0;
  for (let i = 0; i < 4; i++) if (t >= WORDS[i].t0 - 0.08) focus = i;
  const pY = focus === 0 ? CY - SLOT_Y[0]
    : lerp(CY - SLOT_Y[focus - 1], CY - SLOT_Y[focus], E.sig(prog(t, WORDS[focus].t0 - 0.08, WORDS[focus].t0 + 0.35)));
  const pull = E.sig(prog(t, 8.92, 9.35));
  const zoom = lerp(1.18, 1, pull) * (1 + 0.025 * kick(t));
  const comp = t >= 9 ? 1 - 0.12 * Math.exp(-(t - 9) * 7) * Math.cos((t - 9) * 22) : 1; // compress & rebound
  const tilt = t >= 11 ? tw(t, 11, 11.5, 0, -3 * DEG, E.sig) : 0;
  const sh = shake(t, 7 * hits(t, [5, 6, 7, 8, 9], 9) + 3 * hits(t, [10, 10.25, 10.5, 10.75], 12));
  const camYAll = lerp(pY, 0, pull);

  shadows(ctx, t);
  ctx.save();
  camera(ctx, { zoom: 1 + (zoom - 1) * 0.4, y: camYAll * 0.4, rot: tilt * 0.5 });
  persGrid(ctx, t);
  marquee(ctx, t, { y: 0 });
  ctx.restore();

  ctx.save();
  camera(ctx, { zoom, y: camYAll * zoom + sh[1], x: sh[0], rot: tilt + sh[2], sy: comp, sx: 2 - comp });
  badge(ctx, t);
  for (let i = 0; i < 4; i++) {
    const w = WORDS[i];
    if (t < w.t0) continue;
    let si = baseStyle[i];
    if (t >= 10 && t < 11) si = (i + Math.floor((t - 10) * 4) + 1) % STYLES.length;
    if (t >= 11) si = [0, 3, 1, 0][i];
    const dim = t < 8.92 && i !== focus ? 0.55 : 1;
    drawWord(ctx, w, i, t, STYLES[si], dim);
  }
  ctx.restore();
  stripes(ctx, t);
}
