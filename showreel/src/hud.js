// Persistent modular HUD: corner brackets, REC, scene label, timecode, progress, ticks, micro grid.
import { W, H, C, FPS, DUR, F, text, rgba, clamp, prog, E, lerp, kick } from './core.js';

export const SCENES = [
  { t: 0, name: 'SIGNAL' },
  { t: 5, name: 'KINETIC TYPE' },
  { t: 12, name: 'SHAPE + RHYTHM' },
  { t: 18, name: '3D + DEPTH' },
  { t: 25, name: 'DATA + UI' },
  { t: 32, name: 'TRANSITIONS' },
  { t: 38, name: 'SKILL MONTAGE' },
  { t: 48, name: 'FINAL LOCKUP' },
];

// HUD colour by background (set per scene/segment for contrast).
export function hudColor(t) {
  if (t < 5) return C.cream;
  if (t < 12) return t >= 11.5 ? C.cream : C.forest;
  if (t < 18) return C.sageL;
  if (t < 25) return C.forest;
  if (t < 32) return C.sageL;
  if (t < 38) return [C.lime, C.forest, C.forest, C.forest, C.cream, C.forest][Math.min(5, Math.floor(t - 32))];
  if (t < 47) return [C.forest, C.lime, C.forest, C.lime, C.forest, C.forest, C.lime, C.lime, C.lime][Math.min(8, Math.floor(t - 38))];
  return C.cream;
}
export function hudAccent(t) {
  const c = hudColor(t);
  if (t >= 32 && t < 47) return c; // keep monochrome over the rapid backgrounds
  return c === C.forest ? C.forest : C.lime;
}

const pad = (n) => String(Math.floor(n)).padStart(2, '0');
export const timecode = (t) => {
  const f = Math.round(t * FPS);
  return `00:${pad(f / (FPS * 60))}:${pad((f / FPS) % 60)}:${pad(f % FPS)}`;
};

export function drawHUD(ctx, t, opts = {}) {
  // Hidden during silence + outro until 54 s.
  if (t >= 47 && t < 54) return;
  const appear = t < 54 ? E.outCubic(prog(t, 0.05, 0.9)) : E.sig(prog(t, 54, 54.8));
  if (appear <= 0) return;
  const col = hudColor(t), acc = hudAccent(t);
  const si = SCENES.reduce((a, s, i) => (t >= s.t ? i : a), 0);
  const M = 44; // margin
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = appear;

  // corner brackets (grow in)
  const L = lerp(10, 54, appear) + kick(t) * (t > 5 && t < 47 ? 4 : 0);
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'square';
  for (const [x, y, sx, sy] of [[M, M, 1, 1], [W - M, M, -1, 1], [M, H - M, 1, -1], [W - M, H - M, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke();
  }

  // top-left: title + scene label
  const ty = M + 46;
  text(ctx, 'SYURO MOTION REEL — 2026', M + 22, ty, { font: F.mono(25), fill: col, align: 'left', track: 1 });
  const label = `${String(si).padStart(2, '0')} / 07 — ${SCENES[si].name}`;
  const lp = E.outCubic(prog(t, SCENES[si].t, SCENES[si].t + 0.35));
  const shown = label.slice(0, Math.ceil(label.length * (t >= 54 ? 1 : lp)));
  text(ctx, shown, M + 22, ty + 36, { font: F.mono(23, false), fill: col, align: 'left', alpha: 0.85 });

  // top-right: REC + timecode
  const recOn = t < 59.5 && (t >= 54 || Math.floor(t * 2) % 2 === 0 || t < 1);
  text(ctx, 'REC', W - M - 58, ty, { font: F.mono(25), fill: col, align: 'right', track: 1 });
  ctx.beginPath(); ctx.arc(W - M - 36, ty - 9, 10, 0, Math.PI * 2);
  if (recOn) { ctx.fillStyle = acc; ctx.fill(); } else { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); }
  text(ctx, timecode(Math.min(t, 59.999)), W - M - 22, ty + 36, { font: F.mono(23, false), fill: col, align: 'right', alpha: 0.85 });

  // micro grid crosses + coordinate labels
  ctx.strokeStyle = rgba(col, 0.55); ctx.lineWidth = 2;
  for (const [x, y] of [[M + 22, 300], [W - M - 22, 300], [M + 22, H - 300], [W - M - 22, H - 300]]) {
    ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x + 9, y); ctx.moveTo(x, y - 9); ctx.lineTo(x, y + 9); ctx.stroke();
  }
  text(ctx, 'X 0540', M + 40, 308, { font: F.mono(18, false), fill: col, align: 'left', alpha: 0.6 });
  text(ctx, 'Y 0960', W - M - 40, 308, { font: F.mono(18, false), fill: col, align: 'right', alpha: 0.6 });
  // vertical side ruler ticks (left edge)
  ctx.strokeStyle = rgba(col, 0.35); ctx.lineWidth = 2;
  for (let i = 0; i <= 20; i++) {
    const y = 420 + i * 54, len = i % 5 === 0 ? 16 : 8;
    ctx.beginPath(); ctx.moveTo(M - 6, y); ctx.lineTo(M - 6 + len, y); ctx.stroke();
  }

  // bottom: progress bar with scene ticks
  const by = H - M - 34, bx0 = M + 22, bx1 = W - M - 22;
  const p = t < 59 ? clamp(t / DUR) : lerp(59 / DUR, 1, E.sig(prog(t, 59, 59.5)));
  ctx.fillStyle = rgba(col, 0.22); ctx.fillRect(bx0, by - 2, bx1 - bx0, 4);
  ctx.fillStyle = acc; ctx.fillRect(bx0, by - 3, (bx1 - bx0) * p, 6);
  for (const s of SCENES) {
    const x = bx0 + (bx1 - bx0) * (s.t / DUR);
    ctx.fillStyle = s.t <= t ? acc : rgba(col, 0.6);
    ctx.fillRect(x - 1.5, by - 13, 3, 26);
  }
  // playhead
  const px = bx0 + (bx1 - bx0) * p;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(px, by - 8); ctx.lineTo(px + 8, by - 18); ctx.lineTo(px - 8, by - 18); ctx.closePath(); ctx.fill();
  text(ctx, `${String(Math.floor(p * 100)).padStart(3, '0')}%`, bx1, by - 26, { font: F.mono(20), fill: col, align: 'right', alpha: 0.85 });
  text(ctx, `F ${String(Math.min(3600, Math.round(p * 3600))).padStart(4, '0')} / 3600`, bx0, by - 26, { font: F.mono(20, false), fill: col, align: 'left', alpha: 0.7 });
  ctx.restore();
}
