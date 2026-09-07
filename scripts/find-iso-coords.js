const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function main() {
  const inputPath = path.join(__dirname, '../public/maps-3d-model.png');
  const metadata = await sharp(inputPath).metadata();
  console.log('Iso map size:', metadata.width, metadata.height);

  const outDir = path.join(__dirname, '../public/debug_iso');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const W = 1800;
  const H = Math.round((3072 / 5504) * 1800);

  const gridOverlaySvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      ${Array.from({ length: 11 }).map((_, i) => {
        const x = (i * 10 * W) / 100;
        return `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="yellow" stroke-width="2" stroke-dasharray="8,4" />
                <text x="${x + 8}" y="35" fill="yellow" font-size="24" font-weight="bold">${i * 10}%</text>`;
      }).join('')}
      ${Array.from({ length: 11 }).map((_, i) => {
        const y = (i * 10 * H) / 100;
        return `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="cyan" stroke-width="2" stroke-dasharray="8,4" />
                <text x="15" y="${y + 28}" fill="cyan" font-size="24" font-weight="bold">${i * 10}%</text>`;
      }).join('')}
    </svg>
  `;

  await sharp(inputPath)
    .resize(W, H)
    .composite([{ input: Buffer.from(gridOverlaySvg) }])
    .toFile(path.join(outDir, 'iso_map_grid.jpg'));

  console.log('Saved iso_map_grid.jpg with size:', W, H);
}

main().catch(console.error);

