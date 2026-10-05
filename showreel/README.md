# SYURO — Motion Design Showreel (60 s, vertical)

A fully code-driven 60-second vertical showreel for the **SYURO** personal brand.
Every frame is drawn procedurally. Every sound is synthesised. Nothing comes from stock footage, samples or templates.

| Spec | Value |
|---|---|
| Format | 1080 × 1920 (9:16), 60 fps, 3,600 frames, 60.0 s |
| Video | H.264 High @ L4.2, yuv420p, BT.709 |
| Audio | AAC-LC 320 kb/s, 48 kHz stereo |
| Music | Original 120 BPM, A minor, Am7 → Fmaj7 → Cmaj7 → G6 (outro: Am add9) |
| Grid | 1 beat = 0.5 s = 30 frames; every cut/slam/transition lands on a beat or 8th/16th |

## Build

```bash
cd showreel
npm install
npm run build          # synthesises build/audio.wav, renders and muxes the MP4
```

Output: `build/SYURO_Showreel_2026_1080x1920_60fps.mp4` (about 8 min on 4 cores).

Useful while iterating:

```bash
node src/preview.js /tmp/frames 1.2 9.0 20.5 48.6    # contact sheet of stills (FULL=1 also writes PNGs)
FROM=1500 TO=1920 node src/render.js                 # render a frame range with audio (build/partial_*.mp4)
```

Requires Node 18+ and `ffmpeg` with libx264.

## How it works

```
src/core.js        format, palette, timing, easing (incl. cubic-bezier(0.16,1,0.3,1)), springs, 3D projection, FX
src/hud.js         persistent HUD: brackets, REC, scene label, timecode, progress bar + scene ticks
src/frame.js       compositor: picks the scene by time, does the portal reveal, glitch FX, vignette/scanlines, HUD
src/scenes/s0..s7  one module per section of the brief
src/audio.js       synth + arrangement + sound design + reverb + master → build/audio.wav
src/render.js      4 parallel workers → H.264 segments → concat + AAC mux
```

* Rendering uses `@napi-rs/canvas` (Skia). Each worker pipes raw RGBA frames into its own ffmpeg.
* Film grain and subtle chromatic aberration are added at encode time (`noise`, `rgbashift`).
  Vignette and scanlines are a static overlay in the compositor.
* The 3D sections (cube, orbit rings, floor grid, folding cube) use a small perspective projector.
  Face content is mapped onto the projected quads with affine transforms.
* Fonts: Syne ExtraBold, Anton and JetBrains Mono (SIL Open Font License) are in `fonts/`.

## Timeline

| Time | Scene | Highlights |
|---|---|---|
| 0.0–5.0 | 00 SIGNAL | Lime dot and shockwaves, centre line, rulers, scan line, perspective grid. SYURO rises in masked 16th-note bands. Typewriter labels, lime underline, RGB glitch at 3.5 s, then a dive through the O's glowing counter, which shows the next scene. |
| 5.0–12.0 | 01 KINETIC TYPE | MOTION / THAT / MOVES / PEOPLE. slam in from four directions while the camera follows each word. The words stack at 9.0 s with a compress-and-rebound camera, then swap fill and outline on 8ths. Rotating badge and lime star, then 4 diagonal stripes with the forest stripe becoming the next background. |
| 12.0–18.0 | 02 SHAPE + RHYTHM | 17×30 = 510 tiles ripple-pop on 16ths, rotate and morph into circles. Kick pulses, then a diagonal colour wave. A 5×7 dot-matrix SYURO forms (stacked SYU / RO for the vertical frame), breathes, and liquefies into a spiral. Mist iris. |
| 18.0–25.0 | 03 3D + DEPTH | Cube with S/Y/U/R/O/star faces, orbit rings and contact shadow. Faces align on each beat with push-ins. Floor grid and a Z-staggered DEPTH. The rings collapse into a portal, the front face turns to glass, and the camera flies through it. |
| 25.0–32.0 | 04 DATA + UI | Glass panels stagger in. Line chart with glowing head, +248% counter, 60 FPS / 120 BPM / 60 SEC, bar chart with lime PEAK / 120, EASE / FLOW / DETAIL rings with sparkles, and a keyframe timeline with playhead. Ends in a glitch-band collapse and a lime wipe. |
| 32.0–38.0 | 05 TRANSITIONS | Rect → offset layers → grid → 3D flip into TYPE → strips → shapes → paper-fold cube → kaleidoscopic tunnel → cubic-bezier handles → line sketches SYURO → glitch → laser door. |
| 38.0–47.0 | 06 SKILL MONTAGE | TYPE · SHAPE · 3D · LOOP · EASE · FRAME · FLOW · DETAIL, one second each, cut on the beat with flash and shake. SYURO strobes on 8ths and gets a final glitch hit, then a hard cut. |
| 47.0–48.0 | SILENCE | Black. No HUD. True digital silence 47.0–47.7 s (grain and room tone only), then a reverse swell. |
| 48.0–60.0 | 07 FINAL LOCKUP | Cream flash, shockwaves and particles. Letters fly in and spring into place. Underline and star, then MOTION DESIGNER and the secondary line type on. The HUD returns at 54 s and the shine sweep runs at 55 s. Slow push-in. At 59 s the line trims to SHOWREEL · 2026, REC turns off and the progress bar hits 100%. |

## Notes on the brief

* The HUD scene counter uses `0X / 07`, consistent with the brief's final `07 / 07 — FINAL LOCKUP` (scenes 00–07).
* The only on-screen copy is the brief's phrases plus HUD metadata: timecode, frame counter, percentages and coordinate labels.
* Colours stay in the palette. The only exception is the brief-sanctioned RGB separation during glitch hits.
