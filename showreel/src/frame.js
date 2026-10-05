// Frame compositor: picks scenes by time, handles cross-scene portals, HUD and frame finishing.
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, TAU, E, prog, hit, rgba, buffer, rgbSplit, sliceGlitch, flash, bgFill, clamp, glow } from './core.js';
import { drawHUD } from './hud.js';
import { drawIntro, portalEllipse } from './scenes/s0_intro.js';
import { drawKinetic } from './scenes/s1_kinetic.js';
import { drawShape } from './scenes/s2_shape.js';
import { drawDepth } from './scenes/s3_depth.js';
import { drawData } from './scenes/s4_data.js';
import { drawSystem } from './scenes/s5_system.js';
import { drawMontage } from './scenes/s6_montage.js';
import { drawOutro } from './scenes/s7_outro.js';

// Static finishing layers: vignette + scanlines (grain & chroma are added at encode time).
let finish = null;
function finishing() {
  if (finish) return finish;
  const c = createCanvas(W, H), x = c.getContext('2d');
  const g = x.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.68);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(4,8,5,0.55)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(0,0,0,0.045)';
  for (let y = 0; y < H; y += 4) x.fillRect(0, y, W, 2);
  finish = c;
  return c;
}

export function renderFrame(canvas, ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  let fx = { rgb: 0, slice: 0, seed: Math.floor(t * 60) };

  if (t < 5) {
    const info = drawIntro(ctx, t, canvas);
    fx.rgb = 14 * info.glitch; fx.slice = 60 * info.glitch;
    if (t >= 4.45) {
      // next scene visible only inside the "O"
      const e = portalEllipse(t, info);
      ctx.save();
      ctx.beginPath(); ctx.ellipse(e.x, e.y, e.rx, e.ry, 0, 0, TAU); ctx.clip();
      const [b, bx] = buffer('portal');
      drawKinetic(bx, t);
      const z = 0.7 + 0.3 * E.inCubic(prog(t, 4.45, 5));
      ctx.translate(e.x, e.y); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      ctx.drawImage(b, 0, 0);
      ctx.restore();
      ctx.save(); ctx.strokeStyle = rgba(C.lime, 0.9); ctx.lineWidth = 6 + 20 * prog(t, 4.5, 5);
      ctx.shadowColor = C.lime; ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.ellipse(e.x, e.y, e.rx, e.ry, 0, 0, TAU); ctx.stroke(); ctx.restore();
    }
  } else if (t < 12) drawKinetic(ctx, t);
  else if (t < 18) drawShape(ctx, t);
  else if (t < 25) fx = { ...fx, ...drawDepth(ctx, t, canvas) };
  else if (t < 32) fx = { ...fx, ...drawData(ctx, t, canvas) };
  else if (t < 38) fx = { ...fx, ...drawSystem(ctx, t, canvas) };
  else if (t < 47) fx = { ...fx, ...drawMontage(ctx, t, canvas) };
  else if (t < 48) bgFill(ctx, '#000000');
  else fx = { ...fx, ...drawOutro(ctx, t, canvas) };

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (fx.slice) sliceGlitch(canvas, ctx, fx.seed * 7 + 3, fx.slice, fx.bands || 14);
  if (fx.rgb) rgbSplit(canvas, ctx, fx.rgb, fx.rgbY || 0);
  if (!(t >= 47 && t < 48)) ctx.drawImage(finishing(), 0, 0);
  drawHUD(ctx, t);
  if (fx.flash) flash(ctx, fx.flashColor || C.cream, fx.flash);
}
