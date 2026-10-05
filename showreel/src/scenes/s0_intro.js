// 00 — INTRO / SIGNAL  [0.0 – 5.0 s]
import {
  W, H, CX, CY, C, F, E, TAU, clamp, prog, lerp, tw, spring, hit, rgba, text, layout, measure, fit, typed,
  circle, glow, smear, bgFill, camera, shake,
} from '../core.js';

export const WORD = 'SYURO';
export const wordFont = (ctx) => { const s = fit(ctx, F.syne, WORD, 900); return { size: s, font: F.syne(s) }; };

function grid(ctx, t) {
  const r = 1500 * E.outCubic(prog(t, 0.15, 2.2)); // reveal radius
  if (r < 2) return;
  const persp = lerp(0.75, 1, E.sig(prog(t, 0.15, 2.6)));
  ctx.save();
  ctx.translate(CX, CY); ctx.scale(persp, persp * 0.92); ctx.translate(-CX, -CY);
  const step = 60;
  for (let i = -12; i <= 12; i++) {
    for (const vert of [true, false]) {
      const off = i * step;
      const d = Math.abs(off);
      if (d > r) continue;
      const a = 0.16 * (1 - d / 1500) * (i % 5 === 0 ? 1.8 : 1);
      ctx.strokeStyle = rgba(C.sage, a); ctx.lineWidth = i % 5 === 0 ? 2 : 1;
      const ext = Math.sqrt(Math.max(0, r * r - d * d));
      ctx.beginPath();
      if (vert) { ctx.moveTo(CX + off, CY - ext * 1.8); ctx.lineTo(CX + off, CY + ext * 1.8); }
      else { ctx.moveTo(CX - ext, CY + off * 1.6); ctx.lineTo(CX + ext, CY + off * 1.6); }
      ctx.stroke();
    }
  }
  ctx.restore();
}

function rulers(ctx, t) {
  const rev = E.outCubic(prog(t, 0.25, 1.4)) * 1000;
  if (rev < 1) return;
  ctx.save();
  // vertical ruler ticks along the centre line
  ctx.strokeStyle = rgba(C.cream, 0.55); ctx.lineWidth = 2;
  for (let y = -960; y <= 960; y += 20) {
    if (Math.abs(y) > rev) continue;
    const len = y % 100 === 0 ? 22 : 9;
    ctx.beginPath(); ctx.moveTo(CX - len, CY + y); ctx.lineTo(CX - 3, CY + y); ctx.stroke();
    if (y % 200 === 0 && y !== 0) text(ctx, String(960 + y).padStart(4, '0'), CX - 32, CY + y + 7, { font: F.mono(17, false), fill: rgba(C.sageL, 0.7), align: 'right' });
  }
  // horizontal ruler
  for (let x = -520; x <= 520; x += 20) {
    if (Math.abs(x) > rev * 0.6) continue;
    const len = x % 100 === 0 ? 20 : 8;
    ctx.beginPath(); ctx.moveTo(CX + x, CY + 3); ctx.lineTo(CX + x, CY + len); ctx.stroke();
  }
  // crosshair marks
  const ck = E.outBack(prog(t, 0.5, 1.0));
  ctx.strokeStyle = rgba(C.cream, 0.8); ctx.lineWidth = 2;
  for (const [dx, dy] of [[-300, -420], [300, -420], [-300, 420], [300, 420]]) {
    const x = CX + dx * ck, y = CY + dy * ck, s = 16 * ck;
    ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); ctx.stroke();
    circle(ctx, x, y, 6 * ck); ctx.stroke();
    text(ctx, `${dx > 0 ? '+' : '-'}${Math.abs(dx)} ${dy > 0 ? '+' : '-'}${Math.abs(dy)}`, x + (dx > 0 ? -22 : 22), y - 18, { font: F.mono(16, false), fill: rgba(C.sageL, 0.7 * ck), align: dx > 0 ? 'right' : 'left' });
  }
  ctx.restore();
}

// Draw the wordmark (used by intro and by the portal frame). Returns geometry.
export function drawWordmark(ctx, t, opts = {}) {
  const { size, font } = wordFont(ctx);
  const lay = layout(ctx, font, WORD, CX, 0);
  const m = measure(ctx, font, 'S');
  const baseY = CY + m.asc / 2;
  const geo = { size, font, lay, baseY, asc: m.asc };
  for (let i = 0; i < 5; i++) {
    const c = lay.chars[i];
    const t0 = 1.0 + i * 0.125; // 16th-note stagger
    const k = t - t0;
    if (k < 0) continue;
    const sp = spring(k, 2.4, 7.5);
    const yOff = (1 - sp) * size * 1.15;
    const rot = (1 - sp) * (i % 2 ? -0.22 : 0.2);
    const skew = (1 - sp) * 0.35;
    const vy = (spring(k, 2.4, 7.5) - spring(k - 1 / 60, 2.4, 7.5)) * size * 1.15;
    if (opts.skip === i) continue;
    ctx.save();
    // masked band per letter
    ctx.beginPath(); ctx.rect(c.x - 20, baseY - m.asc - 26, c.w + 40, m.asc + 52); ctx.clip();
    smear(ctx, 0, -vy * 3, (dx, dy) => {
      ctx.save();
      ctx.translate(c.cx + dx, baseY - m.asc / 2 + yOff + dy);
      ctx.rotate(rot); ctx.transform(1, 0, -skew, 1, 0, 0);
      ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = opts.color || C.cream;
      ctx.fillText(c.ch, 0, m.asc / 2);
      ctx.restore();
    }, 7);
    ctx.restore();
  }
  return geo;
}

// Approximate counter (hole) of the "O" in screen-local coords.
export function oCounter(ctx) {
  const { font } = wordFont(ctx);
  const lay = layout(ctx, font, WORD, CX, 0);
  const m = measure(ctx, font, 'O');
  const o = lay.chars[4];
  return { x: o.cx, y: CY, rx: o.w * 0.27, ry: m.asc * 0.21, w: o.w, h: m.asc };
}

export function drawIntro(ctx, t, canvas, drawNext) {
  bgFill(ctx, C.ink);
  const oc = oCounter(ctx);
  // camera: pull back on 3.5, then accelerate into the O from 4.5
  const pull = tw(t, 3.5, 4.5, 1, 0.93, E.sig);
  const dive = E.inExpo(prog(t, 4.5, 5.0));
  const zoom = pull * Math.pow(60, dive);
  const sh = shake(t, 9 * hit(t, 3.5, 8) + 5 * hit(t, 0, 6) + 4 * hit(t, 4.5, 6));
  ctx.save();
  const ck = E.inOutCubic(prog(t, 4.3, 4.85));
  camera(ctx, { zoom, px: oc.x, py: CY, x: (CX - oc.x) * ck + sh[0], y: sh[1] + dive * 160 * (1 - dive) });

  grid(ctx, t);

  // shockwave rings from the dot
  for (const [t0, col] of [[0, C.sage], [0.25, C.sageL], [0.5, C.sage], [1.0, C.moss]]) {
    const k = prog(t, t0, t0 + 1.6);
    if (k <= 0 || k >= 1) continue;
    ctx.strokeStyle = rgba(col, 0.7 * (1 - k)); ctx.lineWidth = 3 * (1 - k) + 1;
    circle(ctx, CX, CY, E.outCubic(k) * 760); ctx.stroke();
  }

  // vertical cream line draws top → bottom
  const vl = E.sig(prog(t, 0.12, 0.7));
  if (vl > 0) {
    ctx.fillStyle = rgba(C.cream, 0.9);
    ctx.fillRect(CX - 1.5, 0 - 200, 3, (H + 400) * vl);
  }
  rulers(ctx, t);

  // horizontal scan line
  const sc = prog(t, 0.55, 0.95);
  if (sc > 0 && sc < 1) {
    const y = lerp(-40, H + 40, E.inOutCubic(sc));
    const g = ctx.createLinearGradient(0, y - 90, 0, y);
    g.addColorStop(0, rgba(C.cream, 0)); g.addColorStop(1, rgba(C.cream, 0.18));
    ctx.fillStyle = g; ctx.fillRect(0, y - 90, W, 90);
    ctx.fillStyle = C.cream; ctx.fillRect(0, y - 1.5, W, 3);
  }

  // central dot
  const dk = E.outBack(prog(t, 0, 0.3), 3);
  const dp = 1 + 0.25 * hit(t, 0.5, 6) + 0.25 * hit(t, 1, 6);
  if (t < 1.4) {
    glow(ctx, CX, CY, 70 * dk, C.lime, 0.5);
    ctx.fillStyle = C.lime; circle(ctx, CX, CY, 11 * dk * dp * (1 - E.inCubic(prog(t, 1.0, 1.4)))); ctx.fill();
  }

  // glitch duplicates of the wordmark at 3.5
  const gk = hit(t, 3.5, 7) * (t < 3.85 ? 1 : 0);
  const geo = wordFont(ctx);
  if (gk > 0.02) {
    const fr = Math.floor(t * 60);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (const [dx, col] of [[-18, '#ff3a3a'], [18, '#35d0ff']]) {
      ctx.save(); ctx.globalAlpha = 0.55 * gk;
      ctx.translate(dx * gk * (fr % 2 ? 1 : -0.6), (fr % 3 - 1) * 4 * gk);
      drawWordmark(ctx, t, { color: col });
      ctx.restore();
    }
    ctx.restore();
  }

  const g = drawWordmark(ctx, t, { skip: undefined });

  // lime underline (grows from centre)
  const ul = E.sig(prog(t, 2.5, 3.1));
  if (ul > 0) {
    const y = g.baseY + 34;
    ctx.fillStyle = C.lime; ctx.fillRect(CX - (g.lay.w / 2) * ul, y, g.lay.w * ul, 8);
  }
  // typewriter lines
  const l1 = '[ MOTION DESIGNER ]', l2 = 'SHOWREEL · 2026 · REEL 01';
  const s1 = typed(l1, t, 2.5, 34), s2 = typed(l2, t, 2.85, 40);
  const ty = g.baseY + 120;
  if (s1) {
    text(ctx, s1.padEnd(l1.length, ' '), CX, ty, { font: F.mono(40), fill: C.sageL, track: 2 });
    if (s1.length < l1.length || Math.floor(t * 4) % 2 === 0) {
      const lw = measure(ctx, F.mono(40), l1).w + 2 * (l1.length - 1);
      const cx0 = CX - lw / 2 + (lw / l1.length) * s1.length;
      if (t < 3.4) { ctx.fillStyle = C.lime; ctx.fillRect(cx0 + 4, ty - 32, 20, 38); }
    }
  }
  if (s2) text(ctx, s2.padEnd(l2.length, ' '), CX, ty + 58, { font: F.mono(28, false), fill: rgba(C.sageL, 0.85), track: 2 });

  // portal: glowing counter inside the "O" from 4.2
  const pk = prog(t, 4.2, 4.6);
  if (pk > 0) {
    ctx.save();
    ctx.beginPath(); ctx.ellipse(oc.x, oc.y, oc.rx * 1.02, oc.ry * 1.02, 0, 0, TAU); ctx.clip();
    glow(ctx, oc.x, oc.y, oc.ry * 1.6, C.lime, 0.9 * pk);
    ctx.restore();
  }
  ctx.restore();

  // slice glitch frame fx at 3.5
  return { glitch: gk, oc, zoom, ck };
}

// The "O" counter in screen space after the camera, for the portal reveal.
export function portalEllipse(t, info) {
  const { oc, zoom, ck } = info;
  const dive = E.inExpo(prog(t, 4.5, 5.0));
  const yoff = dive * 160 * (1 - dive);
  return {
    x: oc.x + (CX - oc.x) * ck,
    y: CY + yoff + (oc.y - CY) * zoom,
    rx: oc.rx * zoom, ry: oc.ry * zoom,
  };
}
