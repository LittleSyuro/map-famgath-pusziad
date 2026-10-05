// Core: format, palette, timing, easing, math, 3D projection and drawing helpers.
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/Syne-ExtraBold.ttf'), 'Syne');
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/Anton-Regular.ttf'), 'Anton');
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/JetBrainsMono-Regular.ttf'), 'JBM');
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/JetBrainsMono-Bold.ttf'), 'JBM');

// ---------------------------------------------------------------- format
export const W = 1080, H = 1920, CX = W / 2, CY = H / 2;
export const FPS = 60, DUR = 60, FRAMES = FPS * DUR;
export const BPM = 120, BEAT = 60 / BPM; // 0.5 s = 30 frames

// ---------------------------------------------------------------- palette
export const C = {
  ink: '#0A100C', bg: '#111A14', forest: '#1B2820', deep: '#2D4034', moss: '#56715D',
  sage: '#8FAE8B', sageL: '#B8CCAE', mist: '#E3EBDB', cream: '#F3F1E7', lime: '#D6F25F',
};
export const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const rgba = (h, a = 1) => { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; };
export const mix = (h1, h2, k) => {
  const a = hex2rgb(h1), b = hex2rgb(h2);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * clamp(k)));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
};
// Sample a multi-stop palette gradient, u in [0,1], wraps.
export const ramp = (stops, u) => {
  u = ((u % 1) + 1) % 1;
  const n = stops.length, f = u * n, i = Math.floor(f) % n;
  return mix(stops[i], stops[(i + 1) % n], smooth(f - Math.floor(f)));
};

// ---------------------------------------------------------------- math
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, k) => a + (b - a) * k;
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const smooth = (k) => k * k * (3 - 2 * k);
export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

export function rng(seed) { // mulberry32
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
export const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------------------------------------------------------- easing
export const E = {
  linear: (k) => k,
  inCubic: (k) => k * k * k,
  outCubic: (k) => 1 - Math.pow(1 - k, 3),
  inOutCubic: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  inQuart: (k) => k * k * k * k,
  outQuart: (k) => 1 - Math.pow(1 - k, 4),
  inOutQuart: (k) => (k < 0.5 ? 8 * k ** 4 : 1 - Math.pow(-2 * k + 2, 4) / 2),
  outExpo: (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
  inExpo: (k) => (k <= 0 ? 0 : Math.pow(2, 10 * k - 10)),
  inOutExpo: (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2),
  outBack: (k, s = 1.70158) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2),
  inBack: (k, s = 1.70158) => (s + 1) * k * k * k - s * k * k,
  outElastic: (k) => (k <= 0 ? 0 : k >= 1 ? 1 : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (TAU / 3)) + 1),
  // signature curve: cubic-bezier(0.16, 1, 0.3, 1)
  sig: bezier(0.16, 1, 0.3, 1),
  snap: bezier(0.7, 0, 0.2, 1),
};
export function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (u) => ((ax * u + bx) * u + cx) * u;
  const sy = (u) => ((ay * u + by) * u + cy) * u;
  const dx = (u) => (3 * ax * u + 2 * bx) * u + cx;
  return (k) => {
    if (k <= 0) return 0; if (k >= 1) return 1;
    let u = k;
    for (let i = 0; i < 8; i++) { const e = sx(u) - k; const d = dx(u); if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break; u -= e / d; }
    return sy(clamp(u));
  };
}
// Damped spring from 0 → 1 (elastic settle). t in seconds since start.
export const spring = (t, freq = 3.2, damp = 6) => (t <= 0 ? 0 : 1 - Math.exp(-damp * t) * Math.cos(TAU * freq * t));
// Eased tween between a and b over [t0, t1].
export const tw = (t, t0, t1, a, b, ease = E.sig) => lerp(a, b, ease(prog(t, t0, t1)));
// Decaying impulse after a hit at time h.
export const hit = (t, h, decay = 10) => (t < h ? 0 : Math.exp(-(t - h) * decay));
// Sum of impulses for a list of hit times.
export const hits = (t, list, decay = 10) => list.reduce((s, h) => s + hit(t, h, decay), 0);
// Kick pulse: decaying impulse on every beat.
export const kick = (t, decay = 9) => { const b = t / BEAT; return Math.exp(-(b - Math.floor(b)) * BEAT * decay); };
// Handheld micro-shake (deterministic) scaled by amount.
export function shake(t, amt) {
  if (amt <= 0.001) return [0, 0, 0];
  const f = t * 60;
  return [
    (Math.sin(f * 1.7) + Math.sin(f * 3.1 + 1.3) * 0.6) * amt,
    (Math.cos(f * 2.3) + Math.sin(f * 2.9 + 0.7) * 0.6) * amt,
    Math.sin(f * 1.3 + 2.1) * amt * 0.0012,
  ];
}

// ---------------------------------------------------------------- canvas pool
const pool = new Map();
export function buffer(name, w = W, h = H) {
  let c = pool.get(name);
  if (!c || c.width !== w || c.height !== h) { c = createCanvas(w, h); pool.set(name, c); }
  const x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none';
  x.clearRect(0, 0, w, h);
  return [c, x];
}

// ---------------------------------------------------------------- type
export const F = {
  syne: (s) => `800 ${s}px Syne`,
  anton: (s) => `400 ${s}px Anton`,
  mono: (s, b = true) => `${b ? 700 : 400} ${s}px JBM`,
};
const measureCache = new Map();
export function measure(ctx, font, str) {
  const k = font + '|' + str;
  let m = measureCache.get(k);
  if (!m) {
    ctx.save(); ctx.font = font; const r = ctx.measureText(str); ctx.restore();
    m = { w: r.width, asc: r.actualBoundingBoxAscent, desc: r.actualBoundingBoxDescent };
    measureCache.set(k, m);
  }
  return m;
}
// Font size so that `str` spans `width` pixels.
export function fit(ctx, fontFn, str, width) { const m = measure(ctx, fontFn(100), str); return (100 * width) / m.w; }

// Draw text with tracking (in px). align: 'left'|'center'|'right'. Baseline alphabetic unless set.
export function text(ctx, str, x, y, o = {}) {
  const { font, fill, stroke, lw = 2, align = 'center', base = 'alphabetic', track = 0, alpha } = o;
  ctx.save();
  if (alpha !== undefined) ctx.globalAlpha *= alpha;
  ctx.font = font; ctx.textBaseline = base; ctx.textAlign = 'left';
  ctx.letterSpacing = `${track}px`;
  const w = ctx.measureText(str).width - (track ? track : 0);
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  if (fill) { ctx.fillStyle = fill; ctx.fillText(str, x0, y); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.strokeText(str, x0, y); }
  ctx.restore();
  return w;
}
// Per-character layout (x positions centred on cx) using real advances.
export function layout(ctx, font, str, cx, track = 0) {
  const total = measure(ctx, font, str).w + track * (str.length - 1);
  let x = cx - total / 2; const out = [];
  for (const ch of str) {
    const m = measure(ctx, font, ch);
    out.push({ ch, x, w: m.w, cx: x + m.w / 2 });
    x += m.w + track;
  }
  return { chars: out, w: total };
}
// Typewriter: visible substring at time t, `rate` chars per second.
export const typed = (str, t, t0, rate) => str.slice(0, clamp(Math.floor((t - t0) * rate), 0, str.length));

// ---------------------------------------------------------------- shapes
export function star4(ctx, x, y, r, rot = 0, inner = 0.26) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = rot + (i * Math.PI) / 4 - Math.PI / 2;
    const rr = i % 2 ? r * inner : r;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}
export function rrect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}
export function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); }
export function glow(ctx, x, y, r, color, a = 0.6) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, a)); g.addColorStop(0.4, rgba(color, a * 0.35)); g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
// Motion-blur smear: calls draw(dx, dy, alpha) several times along a velocity vector.
export function smear(ctx, vx, vy, draw, n = 6) {
  const sp = Math.hypot(vx, vy);
  if (sp < 2) { draw(0, 0, 1); return; }
  const steps = Math.min(n, 2 + Math.floor(sp / 18));
  for (let i = steps; i >= 1; i--) {
    const k = i / steps;
    ctx.save(); ctx.globalAlpha *= 0.22 * (1 - k) + 0.04; draw(-vx * k, -vy * k, 1); ctx.restore();
  }
  draw(0, 0, 1);
}

// ---------------------------------------------------------------- 3D
export const v3 = (x, y, z) => [x, y, z];
export function rotX([x, y, z], a) { const c = Math.cos(a), s = Math.sin(a); return [x, y * c - z * s, y * s + z * c]; }
export function rotY([x, y, z], a) { const c = Math.cos(a), s = Math.sin(a); return [x * c + z * s, y, -x * s + z * c]; }
export function rotZ([x, y, z], a) { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c, z]; }
// Perspective projection; camera at z = -focal looking +z, screen centre (ox, oy).
export function proj([x, y, z], focal = 1800, ox = CX, oy = CY) {
  const s = focal / (focal + z);
  return [ox + x * s, oy + y * s, s, z];
}
// Affine transform mapping local rect (0..w,0..h) onto projected quad corners p0 (tl), p1 (tr), p3 (bl).
export function quadTransform(ctx, p0, p1, p3, w, h) {
  ctx.transform((p1[0] - p0[0]) / w, (p1[1] - p0[1]) / w, (p3[0] - p0[0]) / h, (p3[1] - p0[1]) / h, p0[0], p0[1]);
}
export function poly(ctx, pts) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); }

// ---------------------------------------------------------------- frame FX
// Full-frame RGB split (subtle glitch separation), amount in px.
export function rgbSplit(canvas, ctx, amt, dy = 0) {
  if (amt < 0.5) return;
  const [b, bx] = buffer('rgb_src'); bx.drawImage(canvas, 0, 0);
  const chan = (col, ox, oy) => {
    const [c, x] = buffer('rgb_' + col); x.drawImage(b, 0, 0);
    x.globalCompositeOperation = 'multiply'; x.fillStyle = col; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'destination-in'; x.drawImage(b, 0, 0);
    ctx.drawImage(c, ox, oy);
  };
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  chan('#ff0000', -amt, -dy); chan('#00ff00', 0, 0); chan('#0000ff', amt, dy);
  ctx.restore();
}
// Horizontal slice displacement glitch.
export function sliceGlitch(canvas, ctx, seed, amt, bands = 14) {
  if (amt < 0.5) return;
  const r = rng(seed);
  const [b, bx] = buffer('slice_src'); bx.drawImage(canvas, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < bands; i++) {
    const y = Math.floor(r() * H), h = Math.floor(8 + r() * r() * 160);
    const dx = (r() - 0.5) * 2 * amt;
    ctx.drawImage(b, 0, y, W, h, dx, y, W, h);
  }
  ctx.restore();
}
// Flash overlay.
export function flash(ctx, color, a) {
  if (a <= 0.003) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a); ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore();
}
export function bgFill(ctx, color) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore(); }

// Camera: centred zoom/rotate/offset about (px, py) on screen.
export function camera(ctx, { zoom = 1, rot = 0, x = 0, y = 0, px = CX, py = CY, sx = 1, sy = 1 } = {}) {
  ctx.translate(px + x, py + y); ctx.rotate(rot); ctx.scale(zoom * sx, zoom * sy); ctx.translate(-px, -py);
}
