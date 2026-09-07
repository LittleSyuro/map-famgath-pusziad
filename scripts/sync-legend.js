const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'legend_rounded');
const destDir = path.join(projectRoot, 'public', 'legend');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  let count = 0;
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.webp') || file.endsWith('.jpg')) {
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
      count++;
    }
  }
  console.log(`Synced ${count} legend images from legend_rounded/ to public/legend/!`);
}
