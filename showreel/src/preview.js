// Render still frames at given times to PNG (and an optional contact sheet).
// usage: node src/preview.js out_dir t1 t2 ...
import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { W, H } from './core.js';
import { renderFrame } from './frame.js';

const [out, ...times] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
const sheetCols = Math.min(6, times.length), sheetRows = Math.ceil(times.length / sheetCols), sc = 0.25;
const sheet = createCanvas(W * sc * sheetCols, H * sc * sheetRows), sx = sheet.getContext('2d');
times.forEach((ts, i) => {
  const t = parseFloat(ts);
  const t0 = Date.now();
  renderFrame(canvas, ctx, t);
  const ms = Date.now() - t0;
  sx.drawImage(canvas, (i % sheetCols) * W * sc, Math.floor(i / sheetCols) * H * sc, W * sc, H * sc);
  sx.fillStyle = '#ff00ff'; sx.font = '700 22px JBM'; sx.fillText(`${t.toFixed(2)}s`, (i % sheetCols) * W * sc + 6, Math.floor(i / sheetCols) * H * sc + 24);
  if (process.env.FULL) fs.writeFileSync(path.join(out, `f_${t.toFixed(3)}.png`), canvas.toBuffer('image/png'));
  console.log(t, ms + 'ms');
});
fs.writeFileSync(path.join(out, 'sheet.png'), sheet.toBuffer('image/png'));
