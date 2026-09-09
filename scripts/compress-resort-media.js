/**
 * One-off/manual utility: shrinks large resort_media photos in place.
 * Resizes anything wider/taller than MAX_DIM and re-encodes as JPEG/PNG
 * at a web-friendly quality. Skips files already small enough.
 *
 * Usage: node scripts/compress-resort-media.js
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "public", "resort_media");
const MAX_DIM = 1920; // long-edge cap, plenty for the popup/gallery viewers
const SKIP_UNDER_BYTES = 400 * 1024; // don't bother re-encoding files already this small
const JPEG_QUALITY = 78;
const PNG_QUALITY = 78;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function compressOne(file) {
  const before = fs.statSync(file).size;
  if (before <= SKIP_UNDER_BYTES) {
    return { file, before, after: before, skipped: true };
  }

  // Read into a buffer first rather than handing sharp the file path: on
  // Windows, libvips' own file-open occasionally EPERMs/UNKNOWNs on files a
  // watcher briefly touched, even though a plain fs read succeeds.
  const img = sharp(fs.readFileSync(file)).rotate();
  const meta = await img.metadata();
  const needsResize = (meta.width || 0) > MAX_DIM || (meta.height || 0) > MAX_DIM;

  let pipeline = img;
  if (needsResize) {
    pipeline = pipeline.resize(MAX_DIM, MAX_DIM, { fit: "inside", withoutEnlargement: true });
  }

  const isPng = /\.png$/i.test(file);
  pipeline = isPng
    ? pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9, palette: true })
    : pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

  const buffer = await pipeline.toBuffer();

  // Only overwrite if we actually made it smaller (mozjpeg re-encode of an
  // already-tiny file can occasionally grow it back).
  if (buffer.length < before) {
    // Write directly to the target path. A write-to-tmp-then-rename was tried
    // first, but on Windows the rename step got EPERM'd on files another
    // process (e.g. the Next.js dev server's watcher) had open — a direct
    // overwrite doesn't hit that lock.
    fs.writeFileSync(file, buffer);
    return { file, before, after: buffer.length, skipped: false };
  }
  return { file, before, after: before, skipped: true };
}

async function run() {
  const files = walk(ROOT);
  let totalBefore = 0;
  let totalAfter = 0;
  let processed = 0;

  for (const file of files) {
    let result;
    try {
      result = await compressOne(file);
    } catch (e) {
      console.warn(`SKIP (unreadable/corrupt): ${path.relative(ROOT, file)} — ${e.message}`);
      const before = fs.statSync(file).size;
      totalBefore += before;
      totalAfter += before;
      continue;
    }
    totalBefore += result.before;
    totalAfter += result.after;
    if (!result.skipped) {
      processed++;
      console.log(
        `${path.relative(ROOT, file)}: ${(result.before / 1024).toFixed(0)}KB -> ${(result.after / 1024).toFixed(0)}KB`
      );
    }
  }

  console.log(
    `\nDone. ${processed}/${files.length} files re-encoded. Total: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
