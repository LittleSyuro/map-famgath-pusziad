const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function main() {
  const inputPath = path.join(__dirname, '../Maps Area Highland 2026.png');
  const metadata = await sharp(inputPath).metadata();
  console.log('Master map size:', metadata.width, metadata.height);

  const outDir = path.join(__dirname, '../public/debug_crops');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Let's crop 6 key sections of the map across the canvas:
  // 1. Far Left (0% - 33% X, 50% - 100% Y)
  // 2. Mid Left (20% - 50% X, 30% - 80% Y)
  // 3. Center (40% - 70% X, 20% - 70% Y)
  // 4. Far Right / Top Right (60% - 100% X, 0% - 50% Y)
  // 5. Far Right Bottom (60% - 100% X, 40% - 90% Y)

  const W = metadata.width;
  const H = metadata.height;

  const crops = [
    { name: 'left_bottom', left: 0, top: Math.floor(H * 0.5), width: Math.floor(W * 0.35), height: Math.floor(H * 0.5) },
    { name: 'left_top', left: 0, top: 0, width: Math.floor(W * 0.35), height: Math.floor(H * 0.5) },
    { name: 'center', left: Math.floor(W * 0.3), top: Math.floor(H * 0.2), width: Math.floor(W * 0.4), height: Math.floor(H * 0.6) },
    { name: 'right_top', left: Math.floor(W * 0.6), top: 0, width: Math.floor(W * 0.4), height: Math.floor(H * 0.5) },
    { name: 'right_bottom', left: Math.floor(W * 0.6), top: Math.floor(H * 0.4), width: Math.floor(W * 0.4), height: Math.floor(H * 0.6) },
  ];

  for (const c of crops) {
    await sharp(inputPath)
      .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
      .resize(1000)
      .toFile(path.join(outDir, `${c.name}.jpg`));
    console.log(`Saved crop ${c.name}`);
  }
}

main().catch(console.error);
