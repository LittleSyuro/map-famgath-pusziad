// 05 — TRANSITIONS / SYSTEM  [32.0 – 38.0 s]
import {
  W, H, CX, CY, C, F, E, TAU, DEG, clamp, prog, lerp, tw, spring, hit, hits, kick, rgba, mix, text, measure, fit,
  rrect, circle, glow, star4, bgFill, camera, shake, buffer, rotX, rotY, proj, poly, quadTransform, layout,
} from '../core.js';
import { drawMontage } from './s6_montage.js';

const BGS = [C.ink, C.cream, C.sage, C.lime, C.ink, C.cream];
const COLW = 200, GAP = 26, COLH = 760;
const colX = (i) => CX - (4 * COLW + 3 * GAP) / 2 + i * (COLW + GAP);
const TYPE = 'TYPE';

function label(ctx, s, t, t0, col) {
  const a = E.outCubic(prog(t, t0, t0 + 0.2));
  if (a <= 0) return;
  ctx.save();
  ctx.translate(0, (1 - a) * 30);
  text(ctx, s, CX, CY + 640, { font: F.mono(52), fill: col, track: 10, alpha: a });
  ctx.fillStyle = col; ctx.globalAlpha = a;
  ctx.fillRect(CX - 40 * a, CY + 668, 80 * a, 5);
  ctx.restore();
}

function stretchedLetter(ctx, ch, x, y, w, h, color) {
  const font = F.anton(400);
  const m = measure(ctx, font, ch);
  ctx.save();
  ctx.translate(x, y + h); ctx.scale(w / m.w, h / m.asc);
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(ch, 0, 0);
  ctx.restore();
}

function seg0(ctx, t) { // 32: lime rect → offset layers → modular grid
  const shrink = E.sig(prog(t, 32.0, 32.32));
  const rw = lerp(W, 520, shrink), rh = lerp(H, COLH, shrink);
  const split = E.outBack(prog(t, 32.36, 32.58), 2);
  const grid = E.sig(prog(t, 32.6, 32.95));
  const cols = [C.moss, C.sage, C.sageL, C.lime];
  for (let i = 0; i < 4; i++) {
    const off = (i - 1.5) * 46 * split;
    let x = CX - rw / 2 + off, y = CY - rh / 2 - off, w = rw, h = rh;
    x = lerp(x, colX(i), grid); y = lerp(y, CY - COLH / 2, grid); w = lerp(w, COLW, grid);
    ctx.fillStyle = shrink < 1 && i < 3 && split === 0 ? 'rgba(0,0,0,0)' : cols[i];
    rrect(ctx, x, y, w, h, 14 * shrink); ctx.fill();
    if (split > 0) { ctx.strokeStyle = rgba(C.ink, 0.6); ctx.lineWidth = 3; ctx.stroke(); }
  }
}

function seg1(ctx, t) { // 33: grid flips in 3D → tall TYPE blocks
  const cols = [C.moss, C.sage, C.sageL, C.lime];
  for (let i = 0; i < 4; i++) {
    const f = E.inOutCubic(prog(t, 33.0 + i * 0.07, 33.38 + i * 0.07));
    const a = f * Math.PI;
    const sx = Math.abs(Math.cos(a));
    const x = colX(i), y = CY - COLH / 2;
    ctx.save();
    ctx.translate(x + COLW / 2, CY);
    ctx.transform(1, Math.sin(a) * 0.18 * (f < 0.5 ? 1 : -1), 0, 1, 0, 0);
    ctx.scale(Math.max(0.02, sx), 1 + Math.sin(a) * 0.08);
    ctx.translate(-(x + COLW / 2), -CY);
    if (f < 0.5) { ctx.fillStyle = cols[i]; rrect(ctx, x, y, COLW, COLH, 14); ctx.fill(); }
    else stretchedLetter(ctx, TYPE[i], x, y, COLW, COLH, C.forest);
    ctx.restore();
  }
}

function typeBlocks(ctx) { for (let i = 0; i < 4; i++) stretchedLetter(ctx, TYPE[i], colX(i), CY - COLH / 2, COLW, COLH, C.forest); }

function shapeCluster(ctx, t, s, rot) {
  ctx.save();
  ctx.fillStyle = C.cream; circle(ctx, CX - 210, CY + 230, 150 * s); ctx.fill();
  ctx.save(); ctx.translate(CX + 210, CY - 230); ctx.rotate(rot * 0.5 + 0.2);
  ctx.fillStyle = C.forest; ctx.fillRect(-130 * s, -130 * s, 260 * s, 260 * s); ctx.restore();
  ctx.fillStyle = C.lime; star4(ctx, CX, CY, 230 * s, rot, 0.24); ctx.fill();
  ctx.strokeStyle = C.forest; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
}

function seg2(ctx, t) { // 34: TYPE slices into strips → circles, squares, star
  const [b, bx] = buffer('typeblocks'); typeBlocks(bx);
  const slide = E.inOutCubic(prog(t, 34.0, 34.35));
  const gone = E.inCubic(prog(t, 34.3, 34.6));
  const N = 18, x0 = colX(0), tw_ = 4 * COLW + 3 * GAP, sw = tw_ / N;
  for (let i = 0; i < N; i++) {
    const dy = (i % 2 ? -1 : 1) * 260 * slide * (0.6 + 0.4 * Math.sin(i * 1.3));
    const sy = 1 - gone;
    const x = x0 + i * sw;
    ctx.save();
    ctx.translate(x + sw / 2, CY + dy); ctx.scale(1 - gone * 0.6, sy); ctx.translate(-(x + sw / 2), -CY);
    ctx.drawImage(b, x, 0, sw + 1, H, x, 0, sw + 1, H);
    ctx.restore();
  }
  const s = E.outBack(prog(t, 34.42, 34.75), 2);
  if (s > 0) shapeCluster(ctx, t, s, (t - 34.4) * 2.2);
  label(ctx, 'SHAPE', t, 34.45, C.forest);
}

// cube net folding into a cube (front/top/right/left/bottom)
function seg3(ctx, t) {
  const fold = E.inOutCubic(prog(t, 35.0, 35.42)) * Math.PI / 2;
  const tun = prog(t, 35.4, 36.0);
  const hs = 150;
  const spinY = lerp(0, -32, E.sig(prog(t, 35.1, 35.45))) * DEG + E.inCubic(tun) * 4.5;
  const spinX = lerp(0, 24, E.sig(prog(t, 35.1, 35.45))) * DEG + E.inCubic(tun) * 2.2;
  const vx = (p) => proj(rotX(rotY(p, spinY), spinX), 1500, CX, CY - 40);
  const faces = [
    { id: 'front', q: (u, v) => [u - hs, v - hs, -hs] },
    { id: 'top', q: (u, v) => [u - hs, -hs - (hs * 2 - v) * Math.cos(fold), -hs + (hs * 2 - v) * Math.sin(fold)] },
    { id: 'right', q: (u, v) => [hs + u * Math.cos(fold), v - hs, -hs + u * Math.sin(fold)] },
    { id: 'left', q: (u, v) => [-hs - (hs * 2 - u) * Math.cos(fold), v - hs, -hs + (hs * 2 - u) * Math.sin(fold)] },
    { id: 'bottom', q: (u, v) => [u - hs, hs + v * Math.cos(fold), -hs + v * Math.sin(fold)] },
  ];
  // kaleidoscopic tunnel behind
  if (tun > 0) {
    ctx.save();
    for (let i = 0; i < 16; i++) {
      const z = ((i / 16 + tun * 1.6) % 1);
      const sc = Math.pow(z, 2.2) * 2600;
      ctx.save(); ctx.translate(CX, CY); ctx.rotate(z * 2.5 + tun * 3 + (i % 2) * Math.PI / 4);
      ctx.strokeStyle = rgba(i % 3 ? C.forest : C.ink, clamp(z * 1.4) * 0.85); ctx.lineWidth = 3 + z * 14;
      ctx.strokeRect(-sc / 2, -sc / 2, sc, sc);
      ctx.restore();
    }
    ctx.restore();
  }
  const cubeScale = 1 - E.inCubic(prog(t, 35.6, 36.0));
  ctx.save(); ctx.translate(CX, CY); ctx.scale(cubeScale, cubeScale); ctx.translate(-CX, -CY);
  const drawn = faces.map((f) => {
    const p0 = vx(f.q(0, 0)), p1 = vx(f.q(hs * 2, 0)), p2 = vx(f.q(hs * 2, hs * 2)), p3 = vx(f.q(0, hs * 2));
    const cross = (p1[0] - p0[0]) * (p3[1] - p0[1]) - (p1[1] - p0[1]) * (p3[0] - p0[0]);
    return { f, pp: [p0, p1, p2, p3], z: (p0[3] + p1[3] + p2[3] + p3[3]) / 4, vis: cross > 0 };
  }).filter((d) => d.vis).sort((a, b) => b.z - a.z);
  for (const d of drawn) {
    poly(ctx, d.pp);
    ctx.fillStyle = d.f.id === 'front' ? C.forest : d.f.id === 'top' ? C.deep : C.moss; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    ctx.save(); ctx.clip();
    quadTransform(ctx, d.pp[0], d.pp[1], d.pp[3], hs * 2, hs * 2);
    if (d.f.id === 'front') { ctx.fillStyle = C.lime; star4(ctx, hs, hs, hs * 0.8, 0, 0.24); ctx.fill(); }
    if (d.f.id === 'top') { ctx.fillStyle = C.cream; circle(ctx, hs, hs, hs * 0.6); ctx.fill(); }
    if (d.f.id === 'right') { ctx.fillStyle = C.sageL; ctx.fillRect(hs * 0.45, hs * 0.45, hs * 1.1, hs * 1.1); }
    if (d.f.id === 'left' || d.f.id === 'bottom') { ctx.fillStyle = C.sage; circle(ctx, hs, hs, hs * 0.35); ctx.fill(); }
    ctx.restore();
  }
  ctx.restore();
  label(ctx, '3D', t, 35.12, C.forest);
}

const BZ = { x: CX - 380, y: CY + 300, s: 760 };
const bzPt = (p) => [BZ.x + p[0] * BZ.s, BZ.y - p[1] * BZ.s];
function bezierAt(P, u) {
  const m = 1 - u;
  return [0, 1].map((k) => m * m * m * P[0][k] + 3 * m * m * u * P[1][k] + 3 * m * u * u * P[2][k] + u * u * u * P[3][k]);
}

function seg4(ctx, t) { // 36: tunnel → bezier curve with handles
  const col = 1 - E.inCubic(prog(t, 36.0, 36.14));
  if (col > 0) { ctx.strokeStyle = rgba(C.lime, col); ctx.lineWidth = 6; ctx.strokeRect(CX - 400 * col, CY - 400 * col, 800 * col, 800 * col); }
  const pull = spring(t - 36.12, 1.6, 6);
  const P1 = [lerp(0.33, 0.16, pull), lerp(0.33, 1, pull)], P2 = [lerp(0.66, 0.3, pull), lerp(0.66, 1, pull)];
  const P = [[0, 0], P1, P2, [1, 1]];
  const draw = E.outCubic(prog(t, 36.1, 36.55));
  // graph frame
  const fa = E.outCubic(prog(t, 36.05, 36.25));
  ctx.save(); ctx.globalAlpha = fa;
  ctx.strokeStyle = rgba(C.sage, 0.35); ctx.lineWidth = 2;
  for (let i = 0; i <= 4; i++) {
    const a = bzPt([i / 4, 0]), b = bzPt([i / 4, 1]), c = bzPt([0, i / 4]), d = bzPt([1, i / 4]);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.stroke();
  }
  ctx.restore();
  if (draw > 0) {
    // handles
    ctx.strokeStyle = C.lime; ctx.lineWidth = 4;
    for (const [a, b] of [[P[0], P[1]], [P[3], P[2]]]) {
      const pa = bzPt(a), pb = bzPt(b);
      ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
      ctx.fillStyle = C.ink; circle(ctx, pb[0], pb[1], 22); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.lime; circle(ctx, pb[0], pb[1], 9); ctx.fill();
    }
    // curve
    ctx.strokeStyle = C.cream; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath();
    const N = 80;
    for (let i = 0; i <= N * draw; i++) { const q = bzPt(bezierAt(P, i / N)); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
    ctx.stroke(); ctx.lineCap = 'butt';
    const hd = bzPt(bezierAt(P, draw));
    glow(ctx, hd[0], hd[1], 60, C.lime, 0.7);
    ctx.fillStyle = C.lime; circle(ctx, hd[0], hd[1], 12); ctx.fill();
  }
  const s = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const n = Math.floor(clamp((t - 36.2) * 70, 0, s.length));
  if (n > 0) text(ctx, s.slice(0, n), CX, BZ.y + 110, { font: F.mono(40), fill: C.lime });
  // EASE label above the graph
  const a = E.outCubic(prog(t, 36.15, 36.35));
  if (a > 0) text(ctx, 'EASE', CX, BZ.y - BZ.s - 120, { font: F.mono(52), fill: C.cream, track: 10, alpha: a });
}

function sketchSYURO(ctx, t, k, color, lw = 4) {
  const size = fit(ctx, F.syne, 'SYURO', 900), font = F.syne(size);
  const m = measure(ctx, font, 'SYURO');
  ctx.save();
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round';
  ctx.setLineDash([1400 * k, 4000]);
  ctx.strokeText('SYURO', CX, CY + m.asc / 2);
  ctx.setLineDash([]);
  ctx.restore();
}

function seg5(ctx, t) { // 37: curve accelerates upward → outlines SYURO
  const up = E.inExpo(prog(t, 37.0, 37.14));
  if (t < 37.2) { // the continuous line shooting upward
    const top = lerp(H, -100, up), bot = lerp(H + 50, CY + 300, up) - 600 * prog(t, 37.12, 37.2) * 2;
    ctx.fillStyle = C.forest; ctx.fillRect(CX - 4, top, 8, Math.max(0, bot - top));
  }
  const k = E.inOutCubic(prog(t, 37.08, 37.4));
  if (k > 0) sketchSYURO(ctx, t, k, C.forest, 5);
}

export function drawSystem(ctx, t, canvas) {
  const seg = Math.min(5, Math.floor(t - 32));
  // micro flash between rapid background swaps
  bgFill(ctx, BGS[seg]);
  const sh = shake(t, 7 * hits(t, [32, 33, 34, 35, 36, 37], 10) + 16 * hit(t, 37.4, 9));
  ctx.save();
  camera(ctx, { zoom: 1 + 0.04 * hits(t, [32, 33, 34, 35, 36, 37], 8), x: sh[0], y: sh[1], rot: sh[2] });
  [seg0, seg1, seg2, seg3, seg4, seg5][seg](ctx, t);
  ctx.restore();

  let fx = { flash: 0.5 * hit(t, Math.floor(t), 22) * (t >= 33 ? 1 : 0), flashColor: seg % 2 ? C.ink : C.cream };
  const gk = hit(t, 37.4, 9) * (t >= 37.4 && t < 37.5 ? 1 : 0);
  if (gk > 0) fx = { flash: 0.85 * hit(t, 37.4, 18), flashColor: C.cream, slice: 80 * gk, rgb: 14 * gk };

  if (t >= 37.5) {
    // laser cut + door opening into the montage
    const [cut, cx_] = buffer('door');
    bgFill(cx_, C.cream); sketchSYURO(cx_, t, 1, C.forest, 5);
    const laser = E.outExpo(prog(t, 37.5, 37.6));
    const open = E.inOutCubic(prog(t, 37.62, 38.0));
    if (open > 0) drawMontage(ctx, 38.0001, canvas, true);
    else bgFill(ctx, C.cream);
    const a = open * 82 * DEG;
    for (const side of [-1, 1]) {
      const sx = Math.cos(a);
      ctx.save();
      const hinge = side < 0 ? 0 : W;
      ctx.translate(hinge, CY);
      ctx.scale(sx, 1 + Math.sin(a) * 0.12);
      ctx.translate(-hinge, -CY);
      ctx.drawImage(cut, side < 0 ? 0 : CX, 0, CX, H, side < 0 ? 0 : CX, 0, CX, H);
      ctx.fillStyle = rgba(C.ink, 0.35 * open); ctx.fillRect(side < 0 ? 0 : CX, 0, CX, H);
      ctx.restore();
    }
    // laser line
    const lx = CX;
    if (open < 1) {
      const h = H * laser;
      glow(ctx, lx, CY, 220, C.lime, 0.4 * (1 - open));
      ctx.fillStyle = C.lime; ctx.fillRect(lx - 4 - open * 40, 0, 8 + open * 80, h);
      ctx.fillStyle = C.cream; ctx.fillRect(lx - 1.5, 0, 3, h);
    }
    fx = { flash: 0.4 * hit(t, 37.5, 16), flashColor: C.lime };
  }
  return fx;
}
