const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const src = path.join(projectRoot, 'map_only_clean.jpg');
const dest = path.join(projectRoot, 'public', 'map_clean_3d.jpg');

async function processTexture() {
  if (!fs.existsSync(src)) {
    console.error('Source file not found:', src);
    return;
  }

  const metadata = await sharp(src).metadata();
  console.log('Original map dimensions:', metadata.width, 'x', metadata.height);

  // Resize to 4096 width (standard maximum WebGL texture supported by 100% of devices)
  const targetWidth = 4096;
  const targetHeight = Math.round(targetWidth / (metadata.width / metadata.height));

  await sharp(src)
    .resize(targetWidth, targetHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill',
    })
    .jpeg({
      quality: 95,
      chromaSubsampling: '4:4:4',
    })
    .toFile(dest);

  console.log(`Successfully generated WebGL 4K texture at ${dest} (${targetWidth}x${targetHeight})!`);
}

processTexture().catch(console.error);
