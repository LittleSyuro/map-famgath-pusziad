export interface Waypoint {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
}

export interface RundownSubActivity {
  title: string;
  category?: string;
  items?: string[];
  description?: string;
  icon?: string;
  image?: string;
}

export interface MenuItem {
  category: string;
  items: string[];
  note?: string;
}

export interface HighlightSpot {
  id: string;
  name: string;
  legendNumber?: string;
  image: string;
  coords: Waypoint;
  description: string;
  category: string;
  distanceNote?: string;
}

export interface AccommodationRoom {
  id: string;
  name: string;
  role: string;
  isPJU?: boolean;
  totalUnits: string; // "6 buah", "16 buah", "2 buah"
  internalNumber?: string;
  legendNumber?: string;
  image: string;
  detailImages?: string[];
  coords: Waypoint;
  description: string;
  facilities: string[];
}

export interface WalkingRouteOption {
  id: "pju" | "anggota";
  title: string;
  targetGroup: string;
  estimatedTime: string;
  estimatedDistance: string;
  description: string;
  highlights: string[];
  specialNote?: string;
  waypoints: Waypoint[];
  color: string;
}

export interface GrandPrizeItem {
  id: string;
  name: string;
  category: string;
  image: string;
  badge: string;
}

export interface RundownItem {
  id: string;
  day: 1 | 2;
  startTime: string; // "16.00"
  endTime: string;   // "17.00"
  startMinutes: number;
  endMinutes: number;
  title: string;
  locationName?: string;
  locationNumber?: string;
  description?: string;
  badge: string;
  color?: string;
  destCoordinates?: Waypoint;
  destImage?: string;
  destLegendNumber?: string;
  defaultWaypoints?: Waypoint[];
  subActivities?: RundownSubActivity[];
  menuCategories?: MenuItem[];
  grandPrizes?: GrandPrizeItem[];
  galleryImages?: string[];
  highlightSpots?: HighlightSpot[];
  roomSingle?: AccommodationRoom;
  pjuGames?: { title: string; area: string; icon: string; items: string[]; description?: string };
  ibuGames?: { title: string; area: string; icon: string; items: string[]; description?: string };
  walkingRoutes?: WalkingRouteOption[];
  disablePawn?: boolean;
  distanceEstimate?: string;
  timeEstimate?: string;
}

// ----------------------------------------------------
// 1. DATA AKOMODASI (6 ALPINE HOUSE, 16 THE CAVE, 2 CAMP MONGOLIAN)
// ----------------------------------------------------

export const ROOM_ALPINE_HOUSE: AccommodationRoom = {
  id: "room-alpine-pju",
  name: "Alpine House",
  role: "Kamar PJU",
  isPJU: true,
  totalUnits: "6 buah",
  image: "/resort_media/alpine/alpine_1.png",
  detailImages: [
    "/resort_media/alpine/alpine_1.png",
    "/resort_media/alpine/alpine_2.png",
    "/resort_media/alpine/alpine_3.png",
    "/resort_media/alpine/alpine_4.png",
    "/resort_media/alpine/alpine_6.png",
    "/resort_media/alpine/alpine_7.png"
  ],
  coords: { x: 58.5, y: 22.5 },
  description: "Bergaya Alpin Eropa dengan panorama asri Gunung Salak untuk Pejabat Utama (PJU) Pusziad.",
  facilities: [
    "King Size Bed Luxury",
    "Balkon Panorama Gunung Salak",
    "Private Bathroom & Water Heater",
    "Smart TV & Free Wi-Fi",
    "Mini Bar & Coffee / Tea Set",
    "Living Room Area Santai"
  ],
};

export const ROOM_THE_CAVE: AccommodationRoom = {
  id: "room-the-cave-anggota",
  name: "The Cave",
  role: "Kamar Anggota",
  isPJU: false,
  totalUnits: "16 buah",
  image: "/resort_media/the_cave/the_cave_12.png",
  detailImages: [
    "/resort_media/the_cave/the_cave_12.png",
    "/resort_media/the_cave/the_cave_14.png",
    "/resort_media/the_cave/the_cave_16.png",
    "/resort_media/the_cave/the_cave_21.jpg"
  ],
  coords: { x: 43.0, y: 53.5 },
  description: "Penginapan tematik bertema goa alami eksotis dengan interior batu modern, dingin sejuk, dan kenyamanan resort bintang.",
  facilities: [
    "Double Bed Comfort",
    "Interior Batu Alami Eksotis",
    "Private Shower & Water Heater",
    "Full Amenities & Tea Set",
    "Dekat Area Rekreasi & Danau"
  ],
};

export const ROOM_MONGOLIAN_CAMP: AccommodationRoom = {
  id: "room-mongolian-anggota",
  name: "Camp Mongolian Superior",
  role: "Kamar Anggota",
  isPJU: false,
  totalUnits: "2 buah",
  image: "/resort_media/mongolian/mongolian_2.jpg",
  detailImages: [
    "/resort_media/mongolian/mongolian_2.jpg",
    "/resort_media/mongolian/mongolian_3.jpg",
    "/resort_media/mongolian/mongolian_4.jpg",
    "/resort_media/mongolian/mongolian_5.jpg"
  ],
  coords: { x: 57.5, y: 52.0 },
  description: "Kamar tematik tenda khas suku Mongolia berpendingin udara (AC) lengkap, bernuansa unik dekat lapangan hijau terbuka.",
  facilities: [
    "Twin / Double Bed",
    "Air Conditioning (AC)",
    "En-suite Bathroom & Water Heater",
    "Amenities Lengkap",
    "Dekat Area Lapangan & Resto"
  ],
};

// ----------------------------------------------------
// 2. DATA MENU MAKANAN
// ----------------------------------------------------

// Hari Ke-1: Hanya Makan Malam (Dinner)
export const DAY1_DINNER_MENU: MenuItem[] = [
  {
    category: "MENU MAKAN MALAM (BUFFET)",
    items: [
      "Nasi Putih (Steamed Rice)",
      "Cream Potato Soup Gurih",
      "Capcay Sayuran Segar",
      "Ayam Gepuk Spesial",
      "Kakap Asam Manis (Sweet & Sour Snapper)",
      "Aneka Buah Segar Potong",
      "Puding Dessert Manis",
      "Kopi, Teh & Air Mineral"
    ],
  }
];

// Hari Ke-1: Coffee Break saat Games di Resto Anthurium Lt. 2
export const DAY1_CB_EVENING_MENU: MenuItem[] = [
  {
    category: "MENU COFFEE BREAK (REBUSAN & HANGAT)",
    items: [
      "Pisang Rebus",
      "Jagung Rebus",
      "Kacang Rebus",
      "Assorted Chips",
      "Coffee & Tea"
    ],
  }
];
export const DAY1_CB3_EVENING_MENU = DAY1_CB_EVENING_MENU;

// Hari Ke-2: Menu Makan Pagi (Sarapan)
export const DAY2_BREAKFAST_MENU: MenuItem[] = [
  {
    category: "MENU SARAPAN PAGI (BUFFET)",
    items: [
      "Nasi Goreng Spesial Highland",
      "Bubur Ayam Komplit & Kerupuk",
      "Roti Bakar & Pilihan Selai",
      "Egg Station (Telur Dadar / Mata Sapi)",
      "Sosis Sapi & Nugget Crispy",
      "Aneka Buah Segar & Jus Pagi",
      "Kopi Panas, Teh & Susu Segar"
    ],
    note: "Disajikan di Resto Anthurium Lt. 2 (06.00 - 07.00)"
  }
];

// Hari Ke-2: Menu Setelah Jalan Pagi di Kopi Hip (Coffee Heat)
export const DAY2_AFTER_WALK_MENU: MenuItem[] = [
  {
    category: "MENU COFFEE HEAT (KOPI HIP)",
    items: [
      "Pisang Rebus",
      "Jagung Rebus",
      "Kacang Rebus",
      "Assorted Chips",
      "Kelapa Muda Segar",
      "Kopi Hitam & Teh Hangat"
    ],
    note: "Sajian rebusan tradisional, chips, kopi/teh & kelapa muda segar di Kopi Hip"
  }
];

// Hari Ke-2: Menu Makan Siang di Ball Room
export const DAY2_LUNCH_MENU: MenuItem[] = [
  {
    category: "MENU MAKAN SIANG (BUFFET)",
    items: [
      "Steamed Rice (Nasi Putih)",
      "Cream Potato Soup",
      "Capcay",
      "Gepuk Chicken (Ayam Gepuk)",
      "Sweet and Sour Snapper (Kakap Asam Manis)",
      "Mixed Fruits (Aneka Buah Potong)",
      "Pudding Dessert"
    ],
    note: "Sajian Buffet Makan Siang di Area Grand Ballroom"
  }
];

// Hari Ke-2: Snack Setelah Jalan Santai di Area Grand Ballroom
export const DAY2_BALLROOM_SNACK_MENU: MenuItem[] = [
  {
    category: "SNACK SETELAH JALAN SANTAI (BALLROOM)",
    items: [
      "Chicken Nuggets & Dipping Sauce",
      "Panettone (Fruit Bread Cake)",
      "Red Velvet Roll Cake",
      "Potato Chips & Potato Wedges",
      "Kopi Panas (Hot Coffee)",
      "Teh Lemon Hangat (Hot Lemon Tea)"
    ],
    note: "Sajian snack hangat & coffee break setelah jalan santai di Area Grand Ballroom"
  }
];

// Hadiah Grand Prize Family Gathering Pusziad 2026
export const GRAND_PRIZE_ITEMS: GrandPrizeItem[] = [
  {
    id: "gp-scoopy",
    name: "Honda Scoopy Prestige",
    category: "Hadiah Utama Motor Matic",
    image: "/grand_prize/honda_scoopy.png",
    badge: "Grand Prize"
  },
  {
    id: "gp-beat",
    name: "Honda BeAT Sporty",
    category: "Hadiah Utama Motor Matic",
    image: "/grand_prize/honda_beat.png",
    badge: "Grand Prize"
  },
  {
    id: "gp-verza",
    name: "Honda CB150 Verza",
    category: "Hadiah Utama Motor Sport",
    image: "/grand_prize/honda_verza.png",
    badge: "Grand Prize"
  },
  {
    id: "gp-emotor",
    name: "United E-Motor Sepeda Listrik",
    category: "Hadiah Motor Listrik Ramah Lingkungan",
    image: "/grand_prize/united_emotor.png",
    badge: "Grand Prize"
  },
  {
    id: "gp-polygon",
    name: "Polygon Mountain Bike",
    category: "Hadiah Sepeda Gunung",
    image: "/grand_prize/polygon_bike.png",
    badge: "Grand Prize"
  }
];

// ----------------------------------------------------
// 3. DATA GAMES MALAM HARI KE-1 (OUTDOOR VS INDOOR RESTO)
// ----------------------------------------------------

export const DAY1_GAMES_PJU = {
  title: "Games PJU",
  area: "Outdoor Area Resto",
  icon: "♟️",
  description: "berlokasi di outdoor area resto",
  items: [
    "Catur",
    "Gaple",
    "Pantulan Rezeki"
  ]
};

export const DAY1_GAMES_IBU_PJU = {
  title: "Games Ibu-Ibu",
  area: "Indoor Area Resto",
  icon: "🎁",
  description: "berlokasi di indoor area resto",
  items: [
    "Botol Rezeki",
    "Tebak Lagu",
    "Pantulan Rezeki"
  ]
};

// ----------------------------------------------------
// 4. DATA JALAN SANTAI HARI KE-2 (PJU & ANGGOTA)
// ----------------------------------------------------

export const WALKING_ROUTES_DAY2: WalkingRouteOption[] = [
  {
    id: "pju",
    title: "Rute Jalan Santai PJU",
    targetGroup: "Pejabat Utama (PJU) & Ibu",
    estimatedTime: "± 3 - 5 Menit",
    estimatedDistance: "± 150 Meter",
    description: "Untuk rute PJU, akan mengunjungi area kebun dan sayuran lalu menuju spot area tangga untuk foto bersama anggota.",
    highlights: [
      "Start: Area Lapangan Helipad",
      "Track Luar Dekat Kolam Renang / Resto",
      "Titik Balik Putar Dekat Bangunan Merah PJU",
      "Finish: Tangga Samping Kolam Renang (Sesi Foto Bersama)"
    ],
    waypoints: [
      { x: 80.5, y: 35.5 },
      { x: 74.7, y: 29.6 },
      { x: 65.9, y: 37.0 },
      { x: 61.0, y: 48.0 },
      { x: 53.4, y: 54.3 },
      { x: 45.7, y: 60.1 },
      { x: 43.4, y: 62.6 },
      { x: 40.5, y: 60.9 },
      { x: 48.7, y: 55.0 },
      { x: 54.6, y: 43.8 },
      { x: 65.7, y: 37.0 },
      { x: 70.8, y: 29.0 },
      { x: 71.8, y: 25.0 },
      { x: 67.0, y: 24.5 },
      { x: 62.0, y: 23.0 },
      { x: 58.5, y: 22.5 },
      { x: 54.1, y: 43.5 },
    ],
    color: "#eab308",
  },
  {
    id: "anggota",
    title: "Rute Jalan Santai Anggota",
    targetGroup: "Seluruh Anggota & Rombongan Keluarga",
    estimatedTime: "± 8 - 12 Menit",
    estimatedDistance: "± 350 Meter",
    description: "Sebelum mencapai titik finish, anggota mengisi spot-spot area tangga untuk foto bersama (akan diarahkan oleh tim EO, sambil menunggu kedatangan PJU).",
    highlights: [
      "Start: Area Lapangan Helipad",
      "Hutan Pinus Resort (Spot Foto Sejuk)",
      "Wahana Edukasi Noah Ark & Satwa",
      "Lapangan Gerbera (Area Hijau Luas)",
      "Finish: Tangga Samping Kolam Renang (Sesi Foto Bersama)"
    ],
    waypoints: [
      { x: 80.5, y: 35.5 },
      { x: 74.7, y: 29.6 },
      { x: 65.9, y: 37.0 },
      { x: 61.0, y: 48.0 },
      { x: 53.4, y: 54.3 },
      { x: 45.7, y: 60.1 },
      { x: 38.3, y: 63.2 },
      { x: 40.5, y: 60.9 },
      { x: 48.7, y: 55.0 },
      { x: 54.1, y: 43.5 },
    ],
    color: "#dc2626",
  }
];

export const DAY2_HIGHLIGHT_SPOTS: HighlightSpot[] = [
  {
    id: "spot-bridge",
    name: "Tangga Samping Kolam Renang",
    image: "/resort_media/spots/foto_bersama_jembatan.jpg",
    coords: { x: 54.1, y: 43.5 },
    category: "Spot Foto Bersama",
    description: "Titik akhir jalan santai untuk sesi foto bersama seluruh rombongan keluarga besar Pusziad.",
  },
  {
    id: "spot-pinus",
    name: "Hutan Pinus Resort",
    image: "/legend/03_Hutan_Pinus.png",
    coords: { x: 86.0, y: 22.0 },
    category: "Spot Foto Jalan Santai",
    description: "Deretan pohon pinus rindang nan sejuk untuk spot foto jalan santai.",
  },
  {
    id: "spot-noah",
    name: "Wahana Edukasi Noah Ark & Satwa",
    image: "/legend/51_Mini_Zoo.png",
    coords: { x: 31.0, y: 64.0 },
    category: "Spot Foto Jalan Santai",
    description: "Wahana edukasi ramah keluarga di rute jalan santai anggota.",
  },
];

// ----------------------------------------------------
// 5. DATA TITIK RESORT (PINPOINTS BERSIH)
// ----------------------------------------------------

export const HELIPAD_COORDS: Waypoint = { x: 80.5, y: 35.5 };
export const SPAWN_BEHIND_HELIPAD: Waypoint = { x: 82.5, y: 33.0 };

export interface KeyEventPinpoint {
  id: string;
  name: string;
  category: string;
  legendNumber?: string;
  image: string;
  galleryImages?: string[];
  coords: Waypoint;
  description: string;
  badge: string;
  color: string;
  isPJU?: boolean;
  facilities?: string[];
  menuCategories?: MenuItem[];
  distanceEstimate?: string;
  timeEstimate?: string;
}

export const KEY_EVENT_PINPOINTS: KeyEventPinpoint[] = [
  {
    id: "pin-gate",
    name: "Gate Utama",
    category: "Kedatangan PJU Pusziad",
    isPJU: true,
    image: "/legend/01_Welcome_Gate.png",
    galleryImages: [
      "/resort_media/helipad/kedatangan_pju_gate.jpg",
      "/legend/01_Welcome_Gate.png"
    ],
    coords: { x: 77.0, y: 32.0 },
    description: "Selamat Datang di Family Gathering Pusziad 2026: Mayjen TNI Budi Hariswanto & Rombongan PJU di The Highland Park Resort Bogor.",
    badge: "Gate Utama",
    color: "#ef4444",
  },
  {
    id: "pin-alpine",
    name: "Alpine House",
    category: "Kamar PJU (6 buah)",
    isPJU: true,
    image: "/resort_media/alpine/alpine_1.png",
    galleryImages: [
      "/resort_media/alpine/alpine_1.png",
      "/resort_media/alpine/alpine_2.png",
      "/resort_media/alpine/alpine_3.png",
      "/resort_media/alpine/alpine_4.png",
      "/resort_media/alpine/alpine_6.png"
    ],
    coords: { x: 58.5, y: 22.5 },
    description: "Bergaya Alpin Eropa berpanorama Gunung Salak (Total 6 buah).",
    badge: "Bergaya Alpin",
    color: "#eab308",
    facilities: [
      "King Size Bed Luxury",
      "Balkon Panorama Gunung Salak",
      "Private Bathroom & Water Heater",
      "Smart TV & Free Wi-Fi",
      "Mini Bar & Coffee / Tea Set",
      "Living Room Area Santai"
    ],
  },
  {
    id: "pin-cave",
    name: "The Cave",
    category: "Kamar Anggota (16 buah)",
    image: "/resort_media/the_cave/the_cave_12.png",
    galleryImages: [
      "/resort_media/the_cave/the_cave_12.png",
      "/resort_media/the_cave/the_cave_14.png",
      "/resort_media/the_cave/the_cave_16.png",
      "/resort_media/the_cave/the_cave_21.jpg"
    ],
    coords: { x: 64.0, y: 17.5 },
    description: "Kamar tematik goa alami eksotis berfasilitas modern (Total 16 buah).",
    badge: "Kamar Anggota (The Cave)",
    color: "#10b981",
    facilities: [
      "Double Bed Comfort",
      "Interior Batu Alami Eksotis",
      "Private Shower & Water Heater",
      "Full Amenities & Tea Set",
      "Dekat Area Rekreasi & Danau"
    ],
  },
  {
    id: "pin-mongolian",
    name: "Camp Mongolian Superior",
    category: "Kamar Anggota (2 buah)",
    image: "/resort_media/mongolian/mongolian_2.jpg",
    galleryImages: [
      "/resort_media/mongolian/mongolian_2.jpg",
      "/resort_media/mongolian/mongolian_3.jpg",
      "/resort_media/mongolian/mongolian_4.jpg"
    ],
    coords: { x: 57.5, y: 52.0 },
    description: "Kamar tematik tenda suku Mongolia dengan pendingin udara AC (Total 2 buah).",
    badge: "Kamar Anggota (Camp Mongolian)",
    color: "#10b981",
    facilities: [
      "Twin / Double Bed",
      "Air Conditioning (AC)",
      "En-suite Bathroom & Water Heater",
      "Amenities Lengkap",
      "Dekat Area Lapangan & Resto"
    ],
  },
  {
    id: "pin-masjid",
    name: "Tempat Ibadah (Masjid Resort)",
    category: "Fasilitas Ibadah",
    image: "/resort_media/masjid/masjid_1.jpg",
    galleryImages: [
      "/resort_media/masjid/masjid_1.jpg",
      "/resort_media/masjid/masjid_2.jpg"
    ],
    coords: { x: 80.0, y: 33.2 },
    description: "Fasilitas ibadah Sholat Maghrib & Isya dan istirahat mandiri peserta Famgath.",
    badge: "Tempat Ibadah",
    color: "#6366f1",
  },
  {
    id: "pin-resto",
    name: "Resto Anthurium Lt. 2",
    category: "Area Resto Lt. 2",
    image: "/resort_media/anthurium/DSCF3443.jpg",
    galleryImages: [
      "/resort_media/anthurium/DSCF3443.jpg",
      "/resort_media/mountain_lounge/Foto/SKY LOUNGE RESTAURANT.jpg"
    ],
    coords: { x: 60.8, y: 50.0 },
    description: "Area Resto Lantai 2 untuk santap makan malam serta sesi Games santai PJU & Ibu-Ibu.",
    badge: "Resto Anthurium Lt. 2",
    color: "#10b981",
    menuCategories: [...DAY1_DINNER_MENU, ...DAY1_CB_EVENING_MENU],
  },
  {
    id: "pin-ballroom",
    name: "Grand Ballroom",
    category: "Area Ball Room",
    image: "/resort_media/grand_ballroom/snack_setelah_jalan_santai.jpg",
    galleryImages: [
      "/resort_media/grand_ballroom/snack_setelah_jalan_santai.jpg",
      "/resort_media/grand_ballroom/ballroom_3d_4.jpg",
      "/resort_media/grand_ballroom/ballroom_3d_3.jpg",
      "/resort_media/grand_ballroom/ballroom_3d_5.jpg",
      "/resort_media/grand_ballroom/ballroom_3d_1.jpg",
      "/resort_media/grand_ballroom/ballroom_3d_2.jpg",
      "/resort_media/grand_ballroom/grand_ballroom_1.jpg"
    ],
    coords: { x: 87.7, y: 29.5 },
    description: "Area gedung pertemuan utama untuk acara sambutan, sajian snack setelah jalan santai, pengundian Grand Prize, dan makan siang buffet bersama.",
    badge: "Grand Ballroom",
    color: "#a855f7",
    menuCategories: [...DAY2_BALLROOM_SNACK_MENU, ...DAY2_LUNCH_MENU],
  },
  {
    id: "pin-bridge",
    name: "Tangga Samping Kolam Renang",
    category: "Spot Foto Bersama",
    image: "/resort_media/spots/foto_bersama_jembatan.jpg",
    galleryImages: [
      "/resort_media/spots/foto_bersama_jembatan.jpg"
    ],
    coords: { x: 54.1, y: 43.5 },
    description: "Titik akhir jalan santai untuk sesi foto bersama seluruh rombongan keluarga besar Pusziad.",
    badge: "Spot Foto Bersama",
    color: "#06b6d4",
  },
  {
    id: "pin-helipad",
    name: "Titik Awal & Akhir Jalan Santai",
    category: "Start & Finish Jalan Santai",
    image: "/resort_media/helipad/helipad_1.jpg",
    galleryImages: [
      "/resort_media/helipad/helipad_1.jpg",
      "/resort_media/helipad/helipad_2.jpg"
    ],
    coords: { x: 80.5, y: 35.5 },
    description: "Titik awal dan titik akhir / finish jalan santai. Jarak ± 2.5 KM dengan estimasi durasi 45 menit - 1 jam.",
    badge: "Start & Finish",
    color: "#eab308",
  },
  {
    id: "pin-kopihip",
    name: "Kopi Hip",
    category: "Coffee Break PJU",
    isPJU: true,
    image: "/resort_media/kopi_hip/menu_kopi_hip.jpg",
    galleryImages: [
      "/resort_media/kopi_hip/menu_kopi_hip.jpg",
      "/resort_media/kopi_hip/Foto/DSCF0423.jpg",
      "/resort_media/kopi_hip/Foto/DSCF0426.jpg",
      "/resort_media/kopi_hip/Foto/DSCF0432.jpg"
    ],
    coords: { x: 75.5, y: 29.5 },
    description: "Setelah sampai di finish line jalan santai, rombongan menikmati sajian Coffee Heat (Coffee Break) di Kopi Hip.",
    badge: "Coffee Heat",
    color: "#ca8a04",
    menuCategories: DAY2_AFTER_WALK_MENU,
  },
];

// ----------------------------------------------------
// 6. RUNDOWN RESMI HARI KE-1 (JUMAT, 9 OKTOBER 2026)
// ----------------------------------------------------

export const RUNDOWN_SCHEDULE_DAY_1: RundownItem[] = [
  {
    id: "d1-arrival",
    day: 1,
    startTime: "16.00",
    endTime: "17.00",
    startMinutes: 960,  // 16:00
    endMinutes: 1020,  // 17:00
    title: "Kedatangan di Gate Utama",
    locationName: "Gate Utama (Gerbang Masuk Resort)",
    badge: "Gate Utama",
    color: "#ef4444",
    destImage: "/legend/01_Welcome_Gate.png",
    destCoordinates: { x: 77.0, y: 32.0 },
    galleryImages: [
      "/resort_media/helipad/kedatangan_pju_gate.jpg",
      "/legend/01_Welcome_Gate.png"
    ],
    defaultWaypoints: [
      { x: 77.0, y: 32.0 },
      { x: 73.0, y: 32.0 },
      { x: 70.8, y: 29.0 },
      { x: 71.8, y: 25.0 },
      { x: 67.0, y: 24.5 },
      { x: 62.0, y: 23.0 },
      { x: 58.5, y: 22.5 },
    ],
  },
  {
    id: "d1-checkin-pju",
    day: 1,
    startTime: "17.00",
    endTime: "18.00",
    startMinutes: 1020, // 17:00
    endMinutes: 1080, // 18:00
    title: "Bergaya Alpin - Alpine House (6 buah)",
    locationName: "Alpine House",
    badge: "Bergaya Alpin",
    color: "#eab308",
    destImage: "/resort_media/alpine/alpine_1.png",
    destCoordinates: { x: 58.5, y: 22.5 },
    roomSingle: ROOM_ALPINE_HOUSE,
    galleryImages: [
      "/resort_media/alpine/alpine_1.png",
      "/resort_media/alpine/alpine_2.png",
      "/resort_media/alpine/alpine_3.png",
      "/resort_media/alpine/alpine_4.png",
      "/resort_media/alpine/alpine_6.png"
    ],
    defaultWaypoints: [
      { x: 77.0, y: 32.0 },
      { x: 73.0, y: 32.0 },
      { x: 70.8, y: 29.0 },
      { x: 71.8, y: 25.0 },
      { x: 67.0, y: 24.5 },
      { x: 62.0, y: 23.0 },
      { x: 58.5, y: 22.5 },
    ],
  },
  {
    id: "d1-checkin-the-cave",
    day: 1,
    startTime: "17.00",
    endTime: "18.00",
    startMinutes: 1020, // 17:00
    endMinutes: 1080, // 18:00
    title: "Kamar Anggota – The Cave (16 buah)",
    locationName: "The Cave",
    badge: "Kamar Anggota 1",
    color: "#10b981",
    destImage: "/resort_media/the_cave/the_cave_12.png",
    destCoordinates: { x: 64.0, y: 17.5 },
    roomSingle: ROOM_THE_CAVE,
    galleryImages: [
      "/resort_media/the_cave/the_cave_12.png",
      "/resort_media/the_cave/the_cave_14.png",
      "/resort_media/the_cave/the_cave_16.png",
      "/resort_media/the_cave/the_cave_21.jpg"
    ],
    defaultWaypoints: [
      { x: 58.5, y: 22.5 },
      { x: 64.0, y: 17.5 },
    ],
  },
  {
    id: "d1-checkin-mongolian",
    day: 1,
    startTime: "17.00",
    endTime: "18.00",
    startMinutes: 1020, // 17:00
    endMinutes: 1080, // 18:00
    title: "Kamar Anggota - Camp Mongolian Superior (2 buah)",
    locationName: "Camp Mongolian Superior",
    badge: "Kamar Anggota 2",
    color: "#10b981",
    destImage: "/resort_media/mongolian/mongolian_2.jpg",
    destCoordinates: { x: 57.5, y: 52.0 },
    roomSingle: ROOM_MONGOLIAN_CAMP,
    galleryImages: [
      "/resort_media/mongolian/mongolian_2.jpg",
      "/resort_media/mongolian/mongolian_3.jpg",
      "/resort_media/mongolian/mongolian_4.jpg"
    ],
    defaultWaypoints: [
      { x: 64.0, y: 17.5 },
      { x: 60.0, y: 35.0 },
      { x: 57.5, y: 52.0 },
    ],
  },
  {
    id: "d1-worship",
    day: 1,
    startTime: "18.00",
    endTime: "19.30",
    startMinutes: 1080, // 18:00
    endMinutes: 1170, // 19:30
    title: "Ibadah (ISOMA)",
    locationName: "Tempat Ibadah (Masjid Resort)",
    badge: "Ibadah",
    color: "#6366f1",
    destImage: "/resort_media/masjid/masjid_1.jpg",
    destCoordinates: { x: 80.0, y: 33.2 },
    galleryImages: [
      "/resort_media/masjid/masjid_1.jpg",
      "/resort_media/masjid/masjid_2.jpg"
    ],
    defaultWaypoints: [
      { x: 57.4, y: 26.0 },
      { x: 68.1, y: 16.4 },
      { x: 70.8, y: 20.9 },
      { x: 72.2, y: 27.3 },
      { x: 70.9, y: 32.2 },
      { x: 75.8, y: 32.0 },
      { x: 78.3, y: 35.7 },
    ],
  },
  {
    id: "d1-dinner",
    day: 1,
    startTime: "19.30",
    endTime: "20.00",
    startMinutes: 1170, // 19:30
    endMinutes: 1200, // 20:00
    title: "Makan Malam",
    locationName: "Resto Anthurium Lt. 2",
    badge: "Makan Malam",
    color: "#10b981",
    destImage: "/resort_media/pju_menuju_dinner.jpg",
    destCoordinates: { x: 60.8, y: 50.0 },
    menuCategories: DAY1_DINNER_MENU,
    galleryImages: [
      "/resort_media/pju_menuju_dinner.jpg",
      "/resort_media/anthurium/DSCF3443.jpg",
      "/resort_media/mountain_lounge/Foto/SKY LOUNGE RESTAURANT.jpg"
    ],
    defaultWaypoints: [
      { x: 58.5, y: 22.5 },
      { x: 67.0, y: 24.5 },
      { x: 71.8, y: 25.0 },
      { x: 70.8, y: 29.0 },
      { x: 70.0, y: 36.0 },
      { x: 65.5, y: 41.5 },
      { x: 60.8, y: 50.0 },
    ],
  },
  {
    id: "d1-games",
    day: 1,
    startTime: "20.00",
    endTime: "21.00",
    startMinutes: 1200, // 20:00
    endMinutes: 1260, // 21:00
    title: "Games (PJU & Ibu-Ibu PJU)",
    locationName: "Resto Anthurium Lt. 2",
    description: "Turnamen keakraban Games PJU (berlokasi di outdoor area resto) & Games Ibu-Ibu (berlokasi di indoor area resto).",
    badge: "Games PJU & Ibu",
    color: "#a855f7",
    destImage: "/games/pju_games.jpg",
    destCoordinates: { x: 60.8, y: 50.0 },
    pjuGames: DAY1_GAMES_PJU,
    ibuGames: DAY1_GAMES_IBU_PJU,
    galleryImages: [
      "/games/pju_games.jpg",
      "/games/ibu_pju_games.jpg"
    ],
    defaultWaypoints: [
      { x: 60.8, y: 50.0 },
    ],
  },
  {
    id: "d1-coffee-break",
    day: 1,
    startTime: "21.00",
    endTime: "22.30",
    startMinutes: 1260, // 21:00
    endMinutes: 1350, // 22:30
    title: "Coffee Break Malam",
    locationName: "Resto Anthurium Lt. 2",
    description: "Disajikan bersamaan dengan games PJU dan Ibu-Ibu PJU.",
    badge: "Coffee Break",
    color: "#ca8a04",
    destImage: "/games/pisang_rebus.jpg",
    destCoordinates: { x: 60.8, y: 50.0 },
    menuCategories: DAY1_CB_EVENING_MENU,
    galleryImages: [
      "/games/pisang_rebus.jpg",
      "/resort_media/anthurium/DSCF3443.jpg"
    ],
    defaultWaypoints: [
      { x: 60.8, y: 50.0 },
    ],
  },
];

// ----------------------------------------------------
// 7. RUNDOWN RESMI HARI KE-2 (SABTU, 10 OKTOBER 2026)
// ----------------------------------------------------

export const RUNDOWN_SCHEDULE_DAY_2: RundownItem[] = [
  {
    id: "d2-breakfast",
    day: 2,
    startTime: "06.00",
    endTime: "07.00",
    startMinutes: 360, // 06:00
    endMinutes: 420, // 07:00
    title: "Sarapan Pagi",
    locationName: "Area Resto Lt. 2",
    badge: "Sarapan Pagi",
    color: "#06b6d4",
    destImage: "/resort_media/anthurium/DSCF3443.jpg",
    destCoordinates: { x: 60.8, y: 50.0 },
    menuCategories: DAY2_BREAKFAST_MENU,
    galleryImages: [
      "/resort_media/anthurium/DSCF3443.jpg",
      "/resort_media/mountain_lounge/Foto/SKY LOUNGE RESTAURANT.jpg"
    ],
    defaultWaypoints: [
      { x: 56.7, y: 26.0 },
      { x: 68.2, y: 16.3 },
      { x: 70.9, y: 19.9 },
      { x: 70.3, y: 23.3 },
      { x: 72.5, y: 26.6 },
      { x: 70.7, y: 32.4 },
      { x: 63.3, y: 40.3 },
    ],
  },
  {
    id: "d2-prep-jalan-santai",
    day: 2,
    startTime: "07.00",
    endTime: "07.45",
    startMinutes: 420, // 07:00
    endMinutes: 465, // 07:45
    title: "Titik Awal & Titik Akhir Jalan Santai",
    locationName: "Area Helipad (Start & Finish)",
    description: "Titik awal dan titik akhir / finish jalan santai. Jarak ± 2.5 KM dengan estimasi durasi 45 menit - 1 jam.",
    badge: "Start & Finish",
    color: "#eab308",
    destImage: "/resort_media/helipad/helipad_1.jpg",
    destCoordinates: { x: 80.5, y: 35.5 },
    galleryImages: [
      "/resort_media/helipad/helipad_1.jpg",
      "/resort_media/helipad/helipad_2.jpg"
    ],
    defaultWaypoints: [
      { x: 60.8, y: 50.0 },
      { x: 70.0, y: 42.0 },
      { x: 80.5, y: 35.5 },
    ],
  },
  {
    id: "d2-jalan-santai",
    day: 2,
    startTime: "07.45",
    endTime: "08.45",
    startMinutes: 465, // 07:45
    endMinutes: 525, // 08:45
    title: "Jalan Santai (Rute PJU & Anggota)",
    locationName: "Kawasan Resort ➔ Tangga Kolam",
    description: "Area untuk spot foto",
    badge: "Jalan Santai",
    color: "#14b8a6",
    destImage: "/resort_media/spots/foto_bersama_jembatan.jpg",
    destCoordinates: { x: 54.1, y: 43.5 },
    highlightSpots: DAY2_HIGHLIGHT_SPOTS,
    walkingRoutes: WALKING_ROUTES_DAY2,
    galleryImages: [
      "/resort_media/spots/foto_bersama_jembatan.jpg",
      "/legend/03_Hutan_Pinus.png",
      "/legend/51_Mini_Zoo.png"
    ],
    defaultWaypoints: [
      { x: 80.5, y: 35.5 },
      { x: 74.7, y: 29.6 },
      { x: 65.9, y: 37.0 },
      { x: 61.0, y: 48.0 },
      { x: 53.4, y: 54.3 },
      { x: 45.7, y: 60.1 },
      { x: 43.4, y: 62.6 },
      { x: 40.5, y: 60.9 },
      { x: 48.7, y: 55.0 },
      { x: 54.6, y: 43.8 },
      { x: 65.7, y: 37.0 },
      { x: 70.8, y: 29.0 },
      { x: 71.8, y: 25.0 },
      { x: 67.0, y: 24.5 },
      { x: 62.0, y: 23.0 },
      { x: 58.5, y: 22.5 },
      { x: 54.1, y: 43.5 },
    ],
  },
  {
    id: "d2-kopi-hip",
    day: 2,
    startTime: "08.45",
    endTime: "09.00",
    startMinutes: 525, // 08:45
    endMinutes: 540, // 09:00
    title: "Coffee Heat (Coffee Break)",
    locationName: "Kopi Hip",
    description: "Setelah sampai di finish line jalan santai, rombongan menikmati sajian Coffee Heat (Coffee Break) di Kopi Hip.",
    badge: "Coffee Heat",
    color: "#ca8a04",
    destImage: "/resort_media/kopi_hip/menu_kopi_hip.jpg",
    destCoordinates: { x: 75.5, y: 29.5 },
    menuCategories: DAY2_AFTER_WALK_MENU,
    galleryImages: [
      "/resort_media/kopi_hip/menu_kopi_hip.jpg",
      "/resort_media/kopi_hip/Foto/DSCF0423.jpg",
      "/resort_media/kopi_hip/Foto/DSCF0426.jpg",
      "/resort_media/kopi_hip/Foto/DSCF0432.jpg"
    ],
    defaultWaypoints: [
      { x: 54.1, y: 43.5 },
      { x: 70.0, y: 36.0 },
      { x: 75.5, y: 29.5 },
    ],
  },
  {
    id: "d2-ballroom-grandprize",
    day: 2,
    startTime: "09.00",
    endTime: "13.00",
    startMinutes: 540, // 09:00
    endMinutes: 780, // 13:00
    title: "Acara di Ball Room (Snack & Makan Siang)",
    locationName: "Area Ball Room",
    description: "Puncak kemeriahan acara dengan sajian snack setelah jalan santai, sambutan pimpinan, pengundian Grand Prize, serta santap Makan Siang buffet bersama di Area Grand Ballroom.",
    badge: "Acara Ball Room",
    color: "#a855f7",
    destImage: "/resort_media/grand_ballroom/snack_setelah_jalan_santai.jpg",
    destCoordinates: { x: 87.7, y: 29.5 },
    menuCategories: [...DAY2_BALLROOM_SNACK_MENU, ...DAY2_LUNCH_MENU],
    grandPrizes: GRAND_PRIZE_ITEMS,
    galleryImages: [
      "/resort_media/grand_ballroom/snack_setelah_jalan_santai.jpg",
      "/resort_media/grand_ballroom/ballroom_3d_3.jpg",
      "/resort_media/grand_ballroom/ballroom_3d_4.jpg",
      "/resort_media/grand_ballroom/ballroom_3d_5.jpg",
      "/resort_media/grand_ballroom/ballroom_3d_1.jpg",
      "/resort_media/grand_ballroom/ballroom_3d_2.jpg"
    ],
    defaultWaypoints: [
      { x: 75.5, y: 29.5 },
      { x: 82.0, y: 29.5 },
      { x: 87.7, y: 29.5 },
    ],
  },
  {
    id: "d2-freetime",
    day: 2,
    startTime: "13.00",
    endTime: "17.00",
    startMinutes: 780, // 13:00
    endMinutes: 1020, // 17:00
    title: "Free Time (Menikmati Berbagai Fasilitas)",
    locationName: "Kawasan The Highland Park",
    badge: "Free Time",
    color: "#f59e0b",
    destImage: "/legend/01_Welcome_Gate.png",
    destCoordinates: { x: 50.0, y: 50.0 },
    galleryImages: [
      "/legend/01_Welcome_Gate.png",
      "/legend/15_Invisible_Bridge.png",
      "/legend/51_Mini_Zoo.png",
      "/legend/03_Hutan_Pinus.png"
    ],
    defaultWaypoints: [
      { x: 87.7, y: 29.5 },
      { x: 50.0, y: 50.0 },
    ],
  },
];

export const ALL_RUNDOWN_ITEMS: RundownItem[] = [
  ...RUNDOWN_SCHEDULE_DAY_1,
  ...RUNDOWN_SCHEDULE_DAY_2,
];

export const RUNDOWN_SCHEDULE: RundownItem[] = RUNDOWN_SCHEDULE_DAY_1;

// ----------------------------------------------------
// 8. DATA TOKOH 5 PJU (MAYJEN BUDI, PAK NURDIHIN & PJU)
// ----------------------------------------------------

export interface VIPArrival {
  id: string;
  name: string;
  title: string;              // "PJU"
  isPJU?: boolean;
  photo: string;
  internalNumber?: string;
  mapLocationName: string;
  roomImage: string;
  roomX: number;
  roomY: number;
  popupOffsetX?: number;
  popupOffsetY?: number;
  color: string;
  gateArrivalMinutes: number;
  gateArrivalTimeStr: string;
  walkStartMinutes: number;
  walkStartTimeStr: string;
  roomArrivalMinutes: number;
  roomArrivalTimeStr: string;
  pathWaypoints: Waypoint[];
}

export const WELCOME_GATE_COORDS: Waypoint = { x: 77.0, y: 32.0 };
export const TIMELINE_START_MINUTES = 960;
export const TIMELINE_END_MINUTES = 1080;

export const VIP_ARRIVALS: VIPArrival[] = [
  {
    id: "pju",
    name: "Mayjen TNI Budi Hariswanto & Rombongan PJU",
    title: "PJU",
    isPJU: true,
    photo: "/avatars/budi_hariswanto.jpg",
    internalNumber: "6",
    mapLocationName: "Alpine House",
    roomImage: "/resort_media/alpine/alpine_1.png",
    roomX: 58.5,
    roomY: 22.5,
    popupOffsetX: 0,
    popupOffsetY: 0,
    color: "#eab308",
    gateArrivalMinutes: 975,
    gateArrivalTimeStr: "16:15",
    walkStartMinutes: 1020,
    walkStartTimeStr: "17:00",
    roomArrivalMinutes: 1055,
    roomArrivalTimeStr: "17:35",
    pathWaypoints: [
      { x: 77.0, y: 32.0 },
      { x: 73.0, y: 32.0 },
      { x: 70.8, y: 29.0 },
      { x: 71.8, y: 25.0 },
      { x: 67.0, y: 24.5 },
      { x: 62.0, y: 23.0 },
      { x: 58.5, y: 22.5 },
    ],
  },
];
