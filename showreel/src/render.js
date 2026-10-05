// Parallel renderer: N workers each render a contiguous frame range into an H.264 segment,
// then segments are concatenated and muxed with the AAC soundtrack.
//   node src/render.js                      full 3600-frame render → build/SYURO_Showreel_2026_1080x1920_60fps.mp4
//   WORKERS=4 FROM=0 TO=600 node src/render.js   partial render (frames [FROM, TO))
import { fork, spawn, spawnSync } from 'node:child_process';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __file = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__file), '..');
const BUILD = path.join(ROOT, 'build');
const W = 1080, H = 1920, FPS = 60, FRAMES = 3600;
const OUT = path.join(BUILD, 'SYURO_Showreel_2026_1080x1920_60fps.mp4');

// Encode-time finishing: subtle chromatic aberration + animated luma film grain.
const VF = 'rgbashift=rh=-1:bh=1,format=yuv420p,noise=c0s=5:c0f=t';
const X264 = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-maxrate', '11M', '-bufsize', '22M', '-profile:v', 'high', '-level:v', '4.2',
  '-pix_fmt', 'yuv420p', '-g', '120', '-bf', '2', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709'];

async function worker(from, to, file) {
  const { renderFrame } = await import('./frame.js');
  const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba',
    '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-vf', VF, ...X264, '-threads', '2', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  for (let f = from; f < to; f++) {
    renderFrame(canvas, ctx, f / FPS);
    const buf = Buffer.from(canvas.data());
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if ((f - from) % 60 === 0) process.send?.({ f, from, to });
  }
  ff.stdin.end();
  await done;
}

async function main() {
  fs.mkdirSync(BUILD, { recursive: true });
  const from = +(process.env.FROM || 0), to = +(process.env.TO || FRAMES);
  const n = +(process.env.WORKERS || Math.max(1, Math.min(4, os.cpus().length)));
  const audio = path.join(BUILD, 'audio.wav');
  if (!fs.existsSync(audio)) spawnSync('node', [path.join(ROOT, 'src/audio.js')], { stdio: 'inherit' });

  const per = Math.ceil((to - from) / n), jobs = [];
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const a = from + i * per, b = Math.min(to, a + per);
    if (a >= b) continue;
    const file = path.join(BUILD, `seg_${String(i).padStart(2, '0')}.mp4`);
    jobs.push({ a, b, file });
  }
  const progress = new Map();
  await Promise.all(jobs.map((j) => new Promise((res, rej) => {
    const cp = fork(__file, ['--worker', j.a, j.b, j.file]);
    cp.on('message', (m) => {
      progress.set(j.file, m.f - j.a);
      const doneF = [...progress.values()].reduce((s, v) => s + v, 0);
      process.stdout.write(`\r  frames ~${doneF}/${to - from}  (${((Date.now() - t0) / 1000).toFixed(0)}s)   `);
    });
    cp.on('exit', (c) => (c === 0 ? res() : rej(new Error('worker failed ' + c))));
  })));
  console.log(`\n  rendered in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

  const list = path.join(BUILD, 'segments.txt');
  fs.writeFileSync(list, jobs.map((j) => `file '${j.file}'`).join('\n'));
  const out = from === 0 && to === FRAMES ? OUT : path.join(BUILD, `partial_${from}_${to}.mp4`);
  const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
    '-ss', (from / FPS).toFixed(4), '-t', ((to - from) / FPS).toFixed(4), '-i', audio,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-ac', '2',
    '-movflags', '+faststart', '-shortest', out], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('mux failed');
  jobs.forEach((j) => fs.rmSync(j.file, { force: true })); fs.rmSync(list, { force: true });
  console.log('  wrote', path.relative(ROOT, out));
}

if (process.argv[2] === '--worker') {
  const [, , , a, b, file] = process.argv;
  worker(+a, +b, file).then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
} else {
  main().catch((e) => { console.error(e); process.exit(1); });
}
