const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const src = 'C:/Users/AXIO/.gemini/antigravity-ide/brain/f83dde41-6ff8-4daf-a68b-053b2e762e8d/.user_uploaded/media_1788701352309.jpg';
const avatarsDir = path.join(projectRoot, 'public', 'avatars');

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Box definitions for each officer's head/face (width: 1024, height: 686)
const officers = [
  {
    name: 'faried_dh.jpg',
    left: 45,
    top: 55,
    width: 180,
    height: 180
  },
  {
    name: 'budi_hariswanto.jpg',
    left: 275,
    top: 75,
    width: 190,
    height: 190
  },
  {
    name: 'faizal.jpg',
    left: 540,
    top: 55,
    width: 180,
    height: 180
  },
  {
    name: 'sujadi.jpg',
    left: 755,
    top: 35,
    width: 180,
    height: 180
  }
];

async function cropAll() {
  for (const off of officers) {
    const dest = path.join(avatarsDir, off.name);
    await sharp(src)
      .extract({ left: off.left, top: off.top, width: off.width, height: off.height })
      .resize(256, 256)
      .jpeg({ quality: 95 })
      .toFile(dest);
    console.log(`Cropped avatar saved to: ${dest}`);
  }
}

cropAll().catch(console.error);
