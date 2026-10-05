// 03 — 3D + DEPTH  [18.0 – 25.0 s]
import {
  W, H, CX, CY, C, F, E, TAU, DEG, clamp, prog, lerp, tw, hit, hits, kick, rgba, mix, text, measure,
  star4, glow, bgFill, camera, shake, rotX, rotY, rotZ, proj, quadTransform, poly, circle,
} from '../core.js';

const HS = 190; // half size of the cube
const FOCAL = 1800, OY = 900;
const FACES = [
  { id: 'S', n: [0, 0, -1], v: [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1]] },
  { id: 'Y', n: [1, 0, 0], v: [[1, -1, -1], [1, -1, 1], [1, 1, 1], [1, 1, -1]] },
  { id: 'U', n: [0, 0, 1], v: [[1, -1, 1], [-1, -1, 1], [-1, 1, 1], [1, 1, 1]] },
  { id: 'R', n: [-1, 0, 0], v: [[-1, -1, 1], [-1, -1, -1], [-1, 1, -1], [-1, 1, 1]] },
  { id: 'O', n: [0, -1, 0], v: [[-1, -1, 1], [1, -1, 1], [1, -1, -1], [-1, -1, -1]] },
  { id: '*', n: [0, 1, 0], v: [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]] },
];
// face alignment keys (time, yaw°, pitch°)
const KEYS = [[20.0, 0, 0], [20.5, 90, 0], [21.0, 180, 0], [21.5, 270, 0], [22.0, 270, 90], [22.5, 270, -90], [23.0, 360, 0]];
const ALIGN_HITS = KEYS.map((k) => k[0]);

function orientation(t) {
  if (t < 19.68) return [-38 + (t - 18) * 16 + Math.sin(t * 1.3) * 4, -6 + Math.sin(t * 0.9) * 4];
  if (t < 20.0) {
    const k = E.inOutCubic(prog(t, 19.68, 20.0));
    const a = orientation(19.6799);
    return [lerp(a[0], 0, k), lerp(a[1], 0, k)];
  }
  for (let i = 1; i < KEYS.length; i++) {
    const [t1, y1, p1] = KEYS[i], [t0, y0, p0] = KEYS[i - 1];
    if (t < t1) {
      const k = E.inOutQuart(prog(t, t1 - 0.34, t1));
      return [lerp(y0, y1, k), lerp(p0, p1, k)];
    }
  }
  return [360, 0];
}

function cubeCam(t) {
  const camPitch = t < 23 ? lerp(22, 9, E.sig(prog(t, 19.6, 20.2))) * (1 - E.sig(prog(t, 22.6, 23.0))) : 0;
  const bob = t < 23 ? Math.sin(t * 2.2) * 14 : 0;
  return { camPitch: camPitch * DEG, bob };
}

const xf = (p, yaw, pitch, camPitch, bob) => {
  let q = rotX(rotY(p, yaw), pitch);
  q = rotX(q, camPitch);
  return [q[0], q[1] + bob, q[2]];
};

function ringPoint(R, u, tilt) {
  let p = [R * Math.cos(u), R * Math.sin(u), 0];
  p = rotX(p, tilt[0]); p = rotY(p, tilt[1]); p = rotZ(p, tilt[2]);
  return p;
}

function ringsState(t, i) {
  const base = [[72, 10, 0], [64, -38, 30], [80, 42, -24]][i];
  const col = prog(t, 23.0, 23.6);
  const ck = E.inOutCubic(col);
  const spin = (t - 19) * [0.5, -0.38, 0.3][i];
  const tilt = [lerp(base[0], 0, ck) * DEG, lerp(base[1], 0, ck) * DEG, lerp(base[2], 0, ck) * DEG + spin * (1 - ck)];
  const R = lerp([360, 420, 480][i], [300, 324, 348][i], ck);
  return { tilt, R };
}

function floor(ctx, t, camPitch) {
  const a = E.outCubic(prog(t, 21.5, 22.3));
  if (a <= 0) return;
  ctx.save();
  ctx.lineWidth = 2;
  const Y = 360;
  const zs = []; for (let z = -400; z <= 5200; z += 160) zs.push(z);
  const pr = (x, z) => { const q = rotX([x, Y, z], camPitch); return proj(q, FOCAL, CX, OY); };
  for (const z of zs) {
    const p0 = pr(-3000, z), p1 = pr(3000, z);
    const fade = clamp(1 - z / 5200) * a;
    ctx.strokeStyle = rgba(C.moss, 0.45 * fade); ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
  }
  for (let x = -3000; x <= 3000; x += 160) {
    const p0 = pr(x, -400), p1 = pr(x, 5200);
    const g = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
    g.addColorStop(0, rgba(C.moss, 0.45 * a)); g.addColorStop(1, rgba(C.moss, 0));
    ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
  }
  ctx.restore();
}

function depthWord(ctx, t, camPitch) {
  const a = E.sig(prog(t, 21.5, 22.2));
  if (a <= 0) return;
  const letters = 'DEPTH', zs = [700, 1050, 820, 1150, 900];
  const size = 560, font = F.anton(size);
  // even spacing on screen; each letter sits at its own Z depth
  const track = 0.62, m = measure(ctx, font, 'DEPTH');
  let x = -m.w * track / 2;
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const lw = measure(ctx, font, letters[i]).w * track;
    const z = zs[i] + (1 - a) * 1400 + Math.sin(t * 1.5 + i) * 40;
    const s = FOCAL / (FOCAL + z);
    const q = rotX([(x + lw / 2) / s, -120, z], camPitch);
    const p = proj(q, FOCAL, CX, OY);
    ctx.save();
    ctx.translate(p[0], p[1]); ctx.scale(p[2], p[2]);
    text(ctx, letters[i], 0, size * 0.36, { font, stroke: rgba(C.forest, 0.55 * a), lw: 4 / p[2] });
    ctx.restore();
    x += lw;
  }
  ctx.restore();
}

function glassUI(ctx, s, k) {
  // abstract dashboard graphics inside the glass face (local coords 0..s)
  ctx.save();
  ctx.globalAlpha *= k;
  ctx.strokeStyle = rgba(C.cream, 0.35); ctx.lineWidth = 2;
  for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(i * s / 6, 0); ctx.lineTo(i * s / 6, s); ctx.stroke(); }
  ctx.strokeStyle = C.lime; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 12; i++) { const x = 30 + i * (s - 60) / 12, y = s * 0.42 - Math.sin(i * 0.7) * 40 - i * 7; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const h = 30 + ((i * 37) % 70) + (i === 4 ? 50 : 0);
    ctx.fillStyle = i === 4 ? C.lime : rgba(C.sage, 0.8);
    ctx.fillRect(40 + i * 46, s - 40 - h, 30, h);
  }
  ctx.strokeStyle = C.lime; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(s - 70, 70, 34, -Math.PI / 2, Math.PI * 1.1); ctx.stroke();
  ctx.restore();
}

export function drawDepth(ctx, t) {
  bgFill(ctx, C.mist);
  // sage + forest gradient shadows
  let g = ctx.createRadialGradient(CX, H * 0.95, 0, CX, H * 0.95, 1300);
  g.addColorStop(0, rgba(C.sage, 0.55)); g.addColorStop(1, rgba(C.sage, 0));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  g = ctx.createLinearGradient(0, 0, 0, 500);
  g.addColorStop(0, rgba(C.forest, 0.18)); g.addColorStop(1, rgba(C.forest, 0));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 500);

  const [yawD, pitchD] = orientation(t);
  const yaw = yawD * DEG, pitch = pitchD * DEG;
  const { camPitch, bob } = cubeCam(t);
  const push = 1 + 0.05 * hits(t, ALIGN_HITS, 7) + 0.03 * hit(t, 18, 4);
  const intro = E.sig(prog(t, 17.9, 18.6));
  const fly = E.inExpo(prog(t, 24.0, 25.0));
  const zoom = lerp(1.6, 1, intro) * push * Math.pow(26, fly) * (1 + 0.03 * prog(t, 23, 24));
  const sh = shake(t, 6 * hits(t, ALIGN_HITS, 9) + 10 * hit(t, 24, 5));
  ctx.save();
  camera(ctx, { zoom, x: sh[0], y: sh[1], px: CX, py: OY });

  floor(ctx, t, camPitch);
  depthWord(ctx, t, camPitch);

  // contact shadow
  const shp = proj(rotX([0, 330, 0], camPitch), FOCAL, CX, OY);
  const sg = ctx.createRadialGradient(shp[0], shp[1], 0, shp[0], shp[1], 300);
  sg.addColorStop(0, rgba(C.forest, 0.38 - bob * 0.006)); sg.addColorStop(1, rgba(C.forest, 0));
  ctx.save(); ctx.translate(shp[0], shp[1]); ctx.scale(1, 0.22); ctx.translate(-shp[0], -shp[1]);
  ctx.fillStyle = sg; ctx.fillRect(shp[0] - 300, shp[1] - 300, 600, 600); ctx.restore();

  // orbit rings: back halves first
  const ringA = E.sig(prog(t, 19.0, 19.6));
  const ringSegs = [];
  if (ringA > 0) {
    for (let i = 0; i < 3; i++) {
      const { tilt, R } = ringsState(t, i);
      const N = 96, drawn = Math.ceil(N * ringA);
      for (let j = 0; j < drawn; j++) {
        const u0 = (j / N) * TAU, u1 = ((j + 1) / N) * TAU;
        const a = xf(ringPoint(R, u0, tilt), 0, 0, camPitch, bob), b = xf(ringPoint(R, u1, tilt), 0, 0, camPitch, bob);
        ringSegs.push({ a, b, z: (a[2] + b[2]) / 2, i });
      }
      // orbiting dots
      for (let d = 0; d < 2; d++) {
        const u = (t - 19) * [2.2, -1.8, 1.5][i] + d * Math.PI + i;
        const pts = [];
        for (let k = 0; k < 6; k++) pts.push(xf(ringPoint(R, u - k * 0.05 * Math.sign([2.2, -1.8, 1.5][i]), tilt), 0, 0, camPitch, bob));
        ringSegs.push({ dot: pts, z: pts[0][2], col: d ? C.sageL : C.lime });
      }
    }
  }
  const drawSeg = (s) => {
    if (s.dot) {
      for (let k = s.dot.length - 1; k >= 0; k--) {
        const p = proj(s.dot[k], FOCAL, CX, OY);
        ctx.fillStyle = rgba(s.col, k ? 0.25 * (1 - k / 6) : 1);
        circle(ctx, p[0], p[1], 12 * p[2] * ringA * (k ? 0.8 : 1)); ctx.fill();
      }
      return;
    }
    const p0 = proj(s.a, FOCAL, CX, OY), p1 = proj(s.b, FOCAL, CX, OY);
    const col = t >= 23 ? mix(C.cream, C.forest, prog(t, 23, 23.5)) : C.cream;
    ctx.strokeStyle = rgba(col, 0.95); ctx.lineWidth = 3 * p0[2];
    ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
  };
  // a soft halo so cream rings read on the mist background
  ctx.save(); ctx.shadowColor = rgba(C.forest, 0.35); ctx.shadowBlur = 8;
  ringSegs.filter((s) => s.z > 0).forEach(drawSeg);
  ctx.restore();

  // cube
  const glass = E.sig(prog(t, 23.0, 23.6));
  const L = (() => { const v = [-0.45, -0.7, -0.55]; const n = Math.hypot(...v); return v.map((c) => c / n); })();
  const faces = FACES.map((f) => {
    const pts = f.v.map((v) => xf([v[0] * HS, v[1] * HS, v[2] * HS], yaw, pitch, camPitch, bob));
    const n = xf(f.n, yaw, pitch, camPitch, 0);
    const pp = pts.map((p) => proj(p, FOCAL, CX, OY));
    const cross = (pp[1][0] - pp[0][0]) * (pp[3][1] - pp[0][1]) - (pp[1][1] - pp[0][1]) * (pp[3][0] - pp[0][0]);
    const lam = clamp(-(n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) * 0.6 + 0.45);
    return { f, pp, vis: cross > 0, z: pts.reduce((s, p) => s + p[2], 0) / 4, lam };
  }).filter((f) => f.vis).sort((a, b) => b.z - a.z);

  for (const fc of faces) {
    const { pp, f, lam } = fc;
    const isFront = f.id === 'S' && t >= 23;
    ctx.save();
    poly(ctx, pp);
    const fill = isFront ? mix(C.cream, C.bg, glass * lerp(0.9, 1, fly)) : C.cream;
    ctx.fillStyle = fill; ctx.fill();
    if (!isFront) { ctx.fillStyle = rgba(C.forest, (1 - lam) * 0.45); ctx.fill(); }
    ctx.clip();
    ctx.save();
    quadTransform(ctx, pp[0], pp[1], pp[3], HS * 2, HS * 2);
    if (isFront && glass > 0) {
      // glass reflection + dashboard
      const gg = ctx.createLinearGradient(0, 0, HS * 2, HS * 2);
      gg.addColorStop(0, rgba(C.sageL, 0.25 * glass)); gg.addColorStop(0.5, rgba(C.sageL, 0)); gg.addColorStop(1, rgba(C.lime, 0.08 * glass));
      ctx.fillStyle = gg; ctx.fillRect(0, 0, HS * 2, HS * 2);
      glassUI(ctx, HS * 2, glass);
      ctx.globalAlpha = 1 - glass;
    }
    if (f.id === '*') {
      ctx.fillStyle = C.lime; star4(ctx, HS, HS, HS * 0.72, 0, 0.24); ctx.fill();
      ctx.strokeStyle = C.forest; ctx.lineWidth = 6; ctx.stroke();
    } else {
      text(ctx, f.id, HS, HS + 92, { font: F.syne(270), fill: C.forest });
    }
    ctx.restore();
    ctx.restore();
    // lime edge accent
    ctx.strokeStyle = C.lime; ctx.lineWidth = 5; ctx.lineJoin = 'round';
    poly(ctx, pp); ctx.stroke();
    ctx.strokeStyle = rgba(C.forest, 0.5); ctx.lineWidth = 1.5; ctx.stroke();
  }

  // rings: front halves
  ctx.save(); ctx.shadowColor = rgba(C.forest, 0.35); ctx.shadowBlur = 8;
  ringSegs.filter((s) => s.z <= 0).forEach(drawSeg);
  ctx.restore();

  // portal glow once rings collapse
  const pg = prog(t, 23.4, 24.0);
  if (pg > 0) glow(ctx, CX, OY + bob * 0, 420, C.lime, 0.25 * pg);
  ctx.restore();

  const out = prog(t, 24.75, 25.0);
  return { rgb: 10 * hit(t, 24.0, 10) + 16 * out };
}
