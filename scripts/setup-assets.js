const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const publicLegendDir = path.join(publicDir, 'legend');
const sourceLegendDir = path.join(projectRoot, 'legend_rounded');
const sourceMapFile = path.join(projectRoot, 'Maps Area Highland 2026.png');
const targetMapFile = path.join(publicDir, 'maps-area.png');

// Ensure directories
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(publicLegendDir)) fs.mkdirSync(publicLegendDir, { recursive: true });

// Copy map
if (fs.existsSync(sourceMapFile)) {
  fs.copyFileSync(sourceMapFile, targetMapFile);
  console.log('Copied map to public/maps-area.png');
}

// Read legend files
const files = fs.readdirSync(sourceLegendDir).filter(f => f.endsWith('.png') || f.endsWith('.webp'));
console.log(`Found ${files.length} legend files.`);

// Copy all legend files
for (const file of files) {
  fs.copyFileSync(path.join(sourceLegendDir, file), path.join(publicLegendDir, file));
}
console.log('Copied all legend images to public/legend/');

// Helper to determine cluster/category based on location number/name
function getCategory(numStr, name) {
  const num = parseInt(numStr, 10);
  const lower = name.toLowerCase();

  if (num <= 5 || lower.includes('gate') || lower.includes('security') || lower.includes('himart') || lower.includes('masjid')) {
    return 'Area Depan & Fasilitas Utama';
  }
  if ((num >= 6 && num <= 8) || lower.includes('ballroom') || lower.includes('dorm') || lower.includes('danau')) {
    return 'Area Danau & Ballroom';
  }
  if ((num >= 9 && num <= 12) || lower.includes('berkuda') || lower.includes('equestrian') || lower.includes('peternakan') || lower.includes('helipad')) {
    return 'Area Berkuda & Equestrian';
  }
  if ((num >= 13 && num <= 20) || lower.includes('geobound') || lower.includes('infinity') || lower.includes('noah') || lower.includes('bridge') || lower.includes('spider')) {
    return 'Area Outbound & Infinity Pool';
  }
  if ((num >= 21 && num <= 30) || lower.includes('sundanese') || lower.includes('wooden') || lower.includes('alpine') || lower.includes('jerami') || lower.includes('cave') || lower.includes('bata merah')) {
    return 'Area Sundanese & Wooden House';
  }
  if ((num >= 31 && num <= 35) || lower.includes('archery') || lower.includes('shooting') || lower.includes('mako')) {
    return 'Area Archery & Rekreasi';
  }
  if ((num >= 36 && num <= 41) || lower.includes('lobby') || lower.includes('anthurium') || lower.includes('lounge') || lower.includes('game') || lower.includes('karaoke') || lower.includes('mushola') || lower.includes('gert')) {
    return 'Area Lobby & Hiburan Indoor';
  }
  if ((num >= 42 && num <= 44) || lower.includes('golf') || lower.includes('driving')) {
    return 'Area Golf & Mongolian Superior';
  }
  if ((num >= 45 && num <= 60) || lower.includes('waterboom') || lower.includes('mini zoo') || lower.includes('flying fox') || lower.includes('futsal') || lower.includes('playground') || lower.includes('rusa') || lower.includes('tree house') || lower.includes('zip bike')) {
    return 'Area Waterboom & Wahana Outbound';
  }
  if ((num >= 61 && num <= 71) || lower.includes('mongolian') || lower.includes('gerbera') || lower.includes('kebun') || lower.includes('aster')) {
    return 'Area Mongolian Camp & Kebun Bunga';
  }
  if (num >= 72 || lower.includes('apache')) {
    return 'Area Apache Camp & Barrack';
  }
  return 'Fasilitas Lainnya';
}

// Generate locations data
const locations = files.map((filename, index) => {
  // Example filename: "01_Welcome_Gate.png", "01a_Pos_Security.png", "36b_Mountain_Lounge.png"
  const baseName = filename.replace(/\.(png|webp)$/i, '');
  const match = baseName.match(/^(\d+)([a-z]?)[-_](.+)$/i);

  let number = '';
  let suffix = '';
  let rawName = '';

  if (match) {
    number = match[1].replace(/^0+/, '') || match[1]; // remove leading 0 for display (e.g. "01" -> "1")
    suffix = match[2] ? match[2].toLowerCase() : '';
    rawName = match[3];
  } else {
    number = `${index + 1}`;
    rawName = baseName;
  }

  // Format readable name: replace underscores with spaces
  const name = rawName.replace(/_/g, ' ').trim();
  const id = `${number}${suffix ? suffix : ''}`;
  const category = getCategory(number, name);

  // Generate sample coordinates spread nicely across isometric map if needed,
  // with some sensible default anchor points based on cluster
  return {
    id,
    number,
    suffix: suffix || undefined,
    name,
    image: `/legend/${filename}`,
    category,
    description: `Fasilitas ${name} di The Highland Park Resort - Hotel Bogor.`,
    mapX: undefined,
    mapY: undefined
  };
});

// Provide some initial map coordinate pins for demo/starter so markers appear right away
const sampleCoordinates = {
  "1": { mapX: 9.8, mapY: 77.5 },
  "1a": { mapX: 11.2, mapY: 79.0 },
  "2": { mapX: 14.5, mapY: 74.2 },
  "4": { mapX: 17.8, mapY: 71.0 },
  "6": { mapX: 28.5, mapY: 65.4 },
  "7": { mapX: 35.0, mapY: 69.2 },
  "9": { mapX: 20.5, mapY: 52.0 },
  "18": { mapX: 42.0, mapY: 58.5 },
  "19": { mapX: 46.5, mapY: 54.0 },
  "21": { mapX: 52.0, mapY: 68.0 },
  "27": { mapX: 58.0, mapY: 62.5 },
  "36": { mapX: 48.0, mapY: 45.0 },
  "41": { mapX: 51.5, mapY: 42.0 },
  "44": { mapX: 62.0, mapY: 48.0 },
  "48": { mapX: 68.5, mapY: 38.0 },
  "51": { mapX: 74.0, mapY: 42.0 },
  "56": { mapX: 77.0, mapY: 32.0 },
  "61": { mapX: 63.0, mapY: 28.0 },
  "64": { mapX: 70.0, mapY: 22.0 },
  "73": { mapX: 82.0, mapY: 25.0 },
  "75": { mapX: 86.5, mapY: 21.0 }
};

locations.forEach(loc => {
  if (sampleCoordinates[loc.id]) {
    loc.mapX = sampleCoordinates[loc.id].mapX;
    loc.mapY = sampleCoordinates[loc.id].mapY;
  }
});

// Categories list
const categories = Array.from(new Set(locations.map(l => l.category)));

const tsContent = `export interface LocationItem {
  id: string;
  number: string;
  suffix?: string;
  name: string;
  image: string;
  mapX?: number; // Persentase koordinat horizontal (0 - 100) di peta
  mapY?: number; // Persentase koordinat vertikal (0 - 100) di peta
  category: string;
  description?: string;
}

export const CATEGORIES = ${JSON.stringify(categories, null, 2)} as const;

export const LOCATIONS: LocationItem[] = ${JSON.stringify(locations, null, 2)};
`;

const dataDir = path.join(projectRoot, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'locations.ts'), tsContent, 'utf-8');

console.log(`Successfully generated data/locations.ts with ${locations.length} locations and ${categories.length} categories.`);
