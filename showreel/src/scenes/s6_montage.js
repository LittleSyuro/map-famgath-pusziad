// 06 — SKILL MONTAGE  [38.0 – 47.0 s]
import {
  W, H, CX, CY, C, F, E, TAU, DEG, clamp, prog, lerp, tw, spring, hit, hits, kick, rgba, mix, text, measure, fit,
  layout, rrect, circle, glow, star4, bgFill, camera, shake, hash,
} from '../core.js';

const SEG = [
  { w: 'TYPE', bg: C.lime, fg: C.forest },
  { w: 'SHAPE', bg: C.forest, fg: C.cream },
  { w: '3D', bg: C.mist, fg: C.forest },
  { w: 'LOOP', bg: C.deep, fg: C.cream },
  { w: 'EASE', bg: C.cream, fg: C.forest },
  { w: 'FRAME', bg: C.sage, fg: C.forest },
  { w: 'FLOW', bg: C.ink, fg: C.cream },
  { w: 'DETAIL', bg: C.forest, fg: C.cream },
  { w: 'SYURO', bg: C.ink, fg: C.cream },
];

function title(ctx, s, k, col, y = 360) {
  const a = E.outExpo(clamp(k / 0.25));
  ctx.save();
  ctx.translate(CX, y); ctx.scale(1, lerp(1.6, 1, a));
  text(ctx, s, 0, 0, { font: F.anton(170), fill: col, alpha: clamp(a * 1.5), track: 4 });
  ctx.restore();
}

function segType(ctx, t, k) {
  const font = F.anton(fit(ctx, F.anton, 'TYPE', 820));
  const lay = layout(ctx, font, 'TYPE', CX, 18);
  const m = measure(ctx, font, 'T');
  for (let i = 0; i < 4; i++) {
    const c = lay.chars[i];
    const k1 = k - i * 0.0625;
    const k2 = k - 0.5 - i * 0.0625;
    let sy = k1 < 0 ? 0 : 0.15 + 0.85 * spring(k1, 2.6, 6.5);
    if (k2 > 0) sy *= 1 + 0.45 * Math.exp(-k2 * 7) * Math.sin(k2 * 30);
    const sx = 1 / Math.sqrt(Math.max(0.3, sy));
    ctx.save();
    ctx.translate(c.cx, CY + m.asc / 2);
    ctx.scale(sx, sy);
    for (let d = 14; d >= 1; d--) text(ctx, c.ch, d * 1.6, d * 1.6, { font, fill: C.forest });
    text(ctx, c.ch, 0, 0, { font, fill: C.cream });
    ctx.restore();
  }
}

function segShape(ctx, t, k) {
  title(ctx, 'SHAPE', k, C.cream);
  const morph = E.inOutCubic(prog(k, 0.3, 0.7));
  ctx.fillStyle = C.lime; star4(ctx, CX, CY + 60, 150 * E.outBack(clamp(k * 4), 2), k * 3, 0.24); ctx.fill();
  glow(ctx, CX, CY + 60, 260, C.lime, 0.25);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU + k * 2.6;
    const x = CX + Math.cos(a) * 340, y = CY + 60 + Math.sin(a) * 340;
    const s = 120 * E.outBack(clamp(k * 5 - i * 0.12), 2);
    ctx.save(); ctx.translate(x, y); ctx.rotate(-a * 1.5);
    ctx.strokeStyle = i % 2 ? C.cream : C.sageL; ctx.lineWidth = 7;
    rrect(ctx, -s / 2, -s / 2, s, s, lerp(4, s / 2, morph)); ctx.stroke();
    ctx.restore();
  }
}

function seg3D(ctx, t, k) {
  title(ctx, '3D', k, C.forest);
  const size = fit(ctx, F.syne, 'SYURO', 860), font = F.syne(size);
  const m = measure(ctx, font, 'S');
  const th = lerp(-38, 38, E.inOutCubic(k)) * DEG;
  const sx = Math.cos(th);
  // floor shadow
  const sg = ctx.createRadialGradient(CX, CY + 230, 0, CX, CY + 230, 460);
  sg.addColorStop(0, rgba(C.forest, 0.4)); sg.addColorStop(1, rgba(C.forest, 0));
  ctx.save(); ctx.translate(CX, CY + 230); ctx.scale(1, 0.16); ctx.translate(-CX, -(CY + 230));
  ctx.fillStyle = sg; ctx.fillRect(CX - 460, CY - 230, 920, 920); ctx.restore();
  const D = 26;
  for (let d = D; d >= 0; d--) {
    const ox = Math.sin(th) * d * 3.4, oy = d * 2.2;
    const col = d === 0 ? C.forest : mix(C.sage, C.deep, d / D);
    ctx.save(); ctx.translate(CX + ox, CY + m.asc / 2 + oy); ctx.scale(sx, 1 - Math.abs(Math.sin(th)) * 0.05);
    text(ctx, 'SYURO', 0, 0, { font, fill: col });
    if (d === 0) text(ctx, 'SYURO', 0, 0, { font, stroke: C.lime, lw: 2.5 });
    ctx.restore();
  }
}

function segLoop(ctx, t, k) {
  const font = F.anton(300), lay = layout(ctx, font, 'LOOP', CX, 24);
  const m = measure(ctx, font, 'L');
  const rowH = 360, scroll = (k * rowH * 2) % rowH;
  for (let r = -1; r < 8; r++) {
    const y = r * rowH + 160 - scroll + m.asc;
    const hero = r === 3;
    for (let i = 0; i < 4; i++) {
      const c = lay.chars[i];
      const ph = (k * 4 + i * 0.25 + r * 0.5) % 1;
      const by = -Math.abs(Math.sin(Math.PI * ph)) * 70;
      const v = Math.cos(Math.PI * ph) * 26;
      if (hero) {
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        text(ctx, c.ch, c.cx - v * 0.3, y + by + v, { font, fill: 'rgba(255,60,60,0.55)' });
        text(ctx, c.ch, c.cx + v * 0.3, y + by - v, { font, fill: 'rgba(60,200,255,0.55)' });
        ctx.restore();
        text(ctx, c.ch, c.cx, y + by, { font, fill: C.lime });
      } else if (r % 2) text(ctx, c.ch, c.cx, y + by, { font, stroke: rgba(C.sageL, 0.7), lw: 4 });
      else text(ctx, c.ch, c.cx, y + by, { font, fill: rgba(C.cream, 0.9) });
    }
  }
}

function segEase(ctx, t, k) {
  title(ctx, 'EASE', k, C.forest);
  const bx = CX - 380, by = CY + 320, s = 760;
  ctx.strokeStyle = rgba(C.sage, 0.6); ctx.lineWidth = 2;
  ctx.strokeRect(bx, by - s, s, s);
  ctx.beginPath(); ctx.moveTo(bx, by - s); ctx.lineTo(bx + s, by - s); ctx.setLineDash([10, 12]); ctx.stroke(); ctx.setLineDash([]);
  const d = E.outCubic(prog(k, 0.0, 0.45));
  ctx.strokeStyle = C.forest; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 100 * d; i++) { const u = i / 100, v = E.outBack(u, 2.2); const x = bx + u * s, y = by - v * s * 0.86; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke(); ctx.lineCap = 'butt';
  const u = d, v = E.outBack(u, 2.2);
  ctx.fillStyle = C.lime; circle(ctx, bx + u * s, by - v * s * 0.86, 20); ctx.fill(); ctx.strokeStyle = C.forest; ctx.lineWidth = 4; ctx.stroke();
  // ball on a track using the same easing, twice on the beat
  const kk = k < 0.5 ? k / 0.5 : (k - 0.5) / 0.5;
  const bxp = lerp(bx + 40, bx + s - 40, E.outBack(clamp(kk * 1.6), 2.2));
  ctx.fillStyle = rgba(C.forest, 0.2); ctx.fillRect(bx, by + 120, s, 6);
  ctx.fillStyle = C.forest; circle(ctx, bxp, by + 123, 34); ctx.fill();
  ctx.fillStyle = C.lime; circle(ctx, bxp, by + 123, 14); ctx.fill();
}

const CROPS = [[0.05, 0.25, 0.4, 0.5], [0.5, 0.2, 0.45, 0.6], [0.15, 0.1, 0.7, 0.35], [0.3, 0.35, 0.4, 0.45], [0.0, 0.3, 1, 0.4], [0.55, 0.05, 0.4, 0.9], [0.1, 0.05, 0.35, 0.9], [0.2, 0.2, 0.6, 0.6]];
function segFrame(ctx, t, k) {
  title(ctx, 'FRAME', k, C.forest);
  const size = fit(ctx, F.syne, 'SYURO', 1500), font = F.syne(size);
  const m = measure(ctx, font, 'S');
  const box = { x: 40, y: CY - 380, w: W - 80, h: 760 };
  const i = Math.min(7, Math.floor(k * 8));
  const prev = CROPS[(i + 7) % 8], cur = CROPS[i];
  const e = E.outExpo(clamp((k * 8 - i) * 3));
  const cr = cur.map((v, j) => lerp(prev[j], v, e));
  const r = { x: box.x + cr[0] * box.w, y: box.y + cr[1] * box.h, w: cr[2] * box.w, h: cr[3] * box.h };
  const drift = (k - 0.5) * 260;
  text(ctx, 'SYURO', CX - drift, CY + m.asc / 2, { font, fill: rgba(C.forest, 0.14) });
  ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
  ctx.fillStyle = C.mist; ctx.fillRect(r.x, r.y, r.w, r.h);
  text(ctx, 'SYURO', CX - drift, CY + m.asc / 2, { font, fill: C.forest });
  ctx.restore();
  ctx.strokeStyle = C.lime; ctx.lineWidth = 7; const L = 46;
  for (const [x, y, sx, sy] of [[r.x, r.y, 1, 1], [r.x + r.w, r.y, -1, 1], [r.x, r.y + r.h, 1, -1], [r.x + r.w, r.y + r.h, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke();
  }
  ctx.strokeStyle = rgba(C.forest, 0.5); ctx.lineWidth = 2; ctx.strokeRect(r.x, r.y, r.w, r.h);
}

const FLOW_PATHS = [
  [[-1, 2], [3, 2], [3, 6], [6, 6], [6, 9], [9, 9]],
  [[19, 3], [15, 3], [15, 7], [12, 7], [12, 9], [9, 9]],
  [[2, 33], [2, 26], [5, 26], [5, 22], [7, 22], [7, 18], [9, 18], [9, 16]],
  [[16, 33], [16, 28], [13, 28], [13, 23], [11, 23], [11, 18], [9, 18], [9, 16]],
  [[-1, 14], [4, 14], [4, 16], [9, 16]],
  [[19, 20], [14, 20], [14, 16], [9, 16]],
];
function segFlow(ctx, t, k) {
  title(ctx, 'FLOW', k, C.cream);
  const G = 60, ox = CX - 9 * G, oy = 0;
  // faint maze
  ctx.strokeStyle = rgba(C.sage, 0.12); ctx.lineWidth = 2;
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(hash(i) * 18) * G + ox, y = Math.floor(hash(i + 50) * 30) * G + 480;
    ctx.beginPath(); ctx.moveTo(x, y); hash(i + 9) > 0.5 ? ctx.lineTo(x + G * 3, y) : ctx.lineTo(x, y + G * 3); ctx.stroke();
  }
  const pts = (p) => p.map(([x, y]) => [ox + x * G, oy + y * G + 0]);
  const pr = E.inOutCubic(prog(k, 0.0, 0.62));
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const path of FLOW_PATHS) {
    const P = pts(path);
    let total = 0; const segL = [];
    for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); segL.push(l); total += l; }
    let rem = total * pr;
    ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
    let head = P[0];
    for (let i = 1; i < P.length && rem > 0; i++) {
      const l = segL[i - 1], f = Math.min(1, rem / l);
      head = [lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f)];
      ctx.lineTo(head[0], head[1]); rem -= l;
    }
    ctx.strokeStyle = rgba(C.lime, 0.25); ctx.lineWidth = 22; ctx.stroke();
    ctx.strokeStyle = C.lime; ctx.lineWidth = 9; ctx.stroke();
    if (pr < 1) { glow(ctx, head[0], head[1], 50, C.lime, 0.8); }
  }
  ctx.lineCap = 'butt';
  const sp = E.outBack(prog(k, 0.55, 0.8), 2);
  if (sp > 0) {
    const cx = ox + 9 * G, cy = 12.5 * G;
    glow(ctx, cx, cy, 330 * sp, C.lime, 0.45);
    ctx.fillStyle = C.lime; star4(ctx, cx, cy, 230 * sp, (k - 0.55) * 1.5, 0.24); ctx.fill();
  }
}

function segDetail(ctx, t, k) {
  title(ctx, 'DETAIL', k, C.cream);
  const z = lerp(1, 1.25, E.outCubic(k));
  ctx.save(); camera(ctx, { zoom: z, py: CY + 80 });
  // fine grid
  ctx.strokeStyle = rgba(C.sage, 0.14); ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 520); ctx.lineTo(x, 1500); ctx.stroke(); }
  for (let y = 520; y <= 1500; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // ruler
  const ry = CY + 360, off = k * 180;
  ctx.fillStyle = rgba(C.ink, 0.5); ctx.fillRect(0, ry - 70, W, 110);
  ctx.strokeStyle = C.sageL; ctx.lineWidth = 2;
  for (let i = -2; i < 60; i++) {
    const x = i * 30 - (off % 30); const n = i + Math.floor(off / 30);
    const L = n % 10 === 0 ? 50 : n % 5 === 0 ? 32 : 16;
    ctx.beginPath(); ctx.moveTo(x, ry - 60); ctx.lineTo(x, ry - 60 + L); ctx.stroke();
    if (n % 10 === 0) text(ctx, String(n * 10).padStart(3, '0'), x + 6, ry + 22, { font: F.mono(22), fill: C.sageL, align: 'left' });
  }
  // alignment guides
  const gx = lerp(220, 540, E.sig(prog(k, 0.0, 0.5))), gy = lerp(1300, CY, E.sig(prog(k, 0.1, 0.6)));
  ctx.setLineDash([14, 10]); ctx.strokeStyle = C.lime; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(gx, 480); ctx.lineTo(gx, 1520); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); ctx.setLineDash([]);
  // keyframe diamond with bezier handles
  const kx = gx, ky = gy;
  const hl = 200 * E.outBack(prog(k, 0.25, 0.6), 2);
  ctx.strokeStyle = C.cream; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(kx - hl, ky + hl * 0.35); ctx.lineTo(kx + hl, ky - hl * 0.35); ctx.stroke();
  for (const s of [-1, 1]) { ctx.fillStyle = C.forest; circle(ctx, kx + s * hl, ky - s * hl * 0.35, 16); ctx.fill(); ctx.stroke(); }
  ctx.save(); ctx.translate(kx, ky); ctx.rotate(Math.PI / 4 + k * 0.5);
  const ds = 46 * (1 + 0.2 * kick(t));
  ctx.fillStyle = C.lime; ctx.fillRect(-ds / 2, -ds / 2, ds, ds); ctx.strokeStyle = C.forest; ctx.lineWidth = 4; ctx.strokeRect(-ds / 2, -ds / 2, ds, ds);
  ctx.restore();
  // crosshair ring
  ctx.strokeStyle = rgba(C.cream, 0.7); ctx.lineWidth = 2;
  circle(ctx, kx, ky, 110 + 20 * Math.sin(k * 12)); ctx.stroke();
  text(ctx, `X ${Math.round(gx)}  Y ${Math.round(gy)}`, kx + 130, ky - 120, { font: F.mono(26), fill: C.cream, align: 'left' });
  ctx.restore();
}

function segFinale(ctx, t, k) {
  // grid + rings + star: all systems combine
  ctx.strokeStyle = rgba(C.sage, 0.12); ctx.lineWidth = 1.5;
  for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let i = 0; i < 4; i++) {
    const rk = ((k * 2 + i / 4) % 1);
    ctx.strokeStyle = rgba(i % 2 ? C.lime : C.sage, 0.6 * (1 - rk)); ctx.lineWidth = 4;
    circle(ctx, CX, CY, 120 + rk * 900); ctx.stroke();
  }
  ctx.fillStyle = C.lime; star4(ctx, CX, CY - 380, 70, k * 6, 0.24); ctx.fill();
  const cols = [C.cream, C.sageL, C.lime];
  const col = cols[Math.floor(k * 8) % 3];
  const size = fit(ctx, F.syne, 'SYURO', 960), font = F.syne(size);
  const m = measure(ctx, font, 'S');
  const s = 1 + 0.06 * kick(t, 12) + 0.04 * Math.exp(-((k * 8) % 1) * 8);
  ctx.save(); ctx.translate(CX, CY); ctx.scale(s, s);
  text(ctx, 'SYURO', 0, m.asc / 2, { font, fill: col });
  ctx.restore();
  ctx.fillStyle = C.lime; ctx.fillRect(CX - 450, CY + m.asc / 2 + 40, 900 * E.outExpo(clamp(k * 3)), 8);
}

const DRAWS = [segType, segShape, seg3D, segLoop, segEase, segFrame, segFlow, segDetail, segFinale];

export function drawMontage(ctx, t, canvas, quiet = false) {
  const i = clamp(Math.floor(t - 38), 0, 8);
  const k = t - 38 - i;
  const sg = SEG[i];
  bgFill(ctx, sg.bg);
  const cut = 38 + i;
  const amt = hit(t, cut, 9) * 10 + hits(t, [cut + 0.5], 12) * 5;
  const sh = shake(t, amt);
  ctx.save();
  camera(ctx, { zoom: 1 + 0.07 * hit(t, cut, 7) + 0.03 * hit(t, cut + 0.5, 9), x: sh[0], y: sh[1], rot: sh[2] });
  DRAWS[i](ctx, t, k);
  ctx.restore();
  if (quiet) return {};
  const fin = i === 8 ? hit(t, 46.75, 6) * (t >= 46.75 ? 1 : 0) : 0;
  return {
    flash: 0.55 * hit(t, cut, 20) + 0.25 * hit(t, cut + 0.5, 22),
    flashColor: i === 8 ? C.lime : C.cream,
    slice: 18 * hit(t, cut, 16) + 90 * fin,
    rgb: 6 * hit(t, cut, 12) + 18 * fin,
    bands: 18,
  };
}
