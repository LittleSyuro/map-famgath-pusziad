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
    "/videos/pju_berjalan.mp4",
    "/resort_media/alpine/alpine_1.png",
    "/resort_media/alpine/alpine_2.png",
    "/resort_media/alpine/alpine_3.png",
    "/resort_media/alpine/alpine_4.png",
    "/resort_media/alpine/alpine_6.png",
    "/resort_media/alpine/alpine_7.png"
  ],
  coords: { x: 58.5, y: 22.5 },
  description: "Kamar Utama bergaya Alpine Eropa dengan panorama asri Gunung Salak untuk Pejabat Utama (PJU) Pusziad.",
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
    note: "Sajian Buffet Makan Malam di Resto Anthurium Lantai 2"
  }
];

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

// ----------------------------------------------------
// 3. DATA GAMES MALAM HARI KE-1 (OUTDOOR VS INDOOR RESTO)
// ----------------------------------------------------

export const DAY1_GAMES_PJU = {
  title: "Games PJU",
  area: "Area Outdoor Resto",
  icon: "♟️",
  description: "Turnamen keakraban santai antar Pejabat Utama (PJU) di area outdoor Restoran Anthurium.",
  items: [
    "Catur",
    "Gaple",
    "Pantulan Rejeki"
  ]
};

export const DAY1_GAMES_IBU_PJU = {
  title: "Games Ibu-Ibu PJU",
  area: "Area Indoor Resto",
  icon: "🎁",
  description: "Keseruan lomba berhadiah dan keceriaan interaktif untuk Ibu-Ibu PJU di area indoor Restoran Anthurium.",
  items: [
    "Serok Rejeki",
    "Botol Rejeki",
    "Kotak Sultan",
    "Pantulan Rejeki"
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
    specialNote: "☕ Setelah Jalan Santai: Ada Coffee Morning di Kopi HIP (Khusus PJU)",
    highlights: [
      "Start: Area Lapangan Helipad",
      "Jalur Teduh Hutan Pinus",
      "Finish: Tangga Samping Kolam Renang (Sesi Foto Bersama)",
      "☕ Lanjut: Coffee Morning di Kopi HIP (Khusus PJU)"
    ],
    waypoints: [
      { x: 83.8, y: 16.2 },
      { x: 86.6, y: 19.7 },
      { x: 74.7, y: 29.6 },
      { x: 65.9, y: 37 },
      { x: 68, y: 38.8 },
      { x: 66.7, y: 43.1 },
      { x: 61, y: 48 },
      { x: 53.4, y: 54.3 },
      { x: 40.2, y: 65.1 },
      { x: 41.3, y: 67.8 },
      { x: 31.1, y: 75.5 },
      { x: 29.1, y: 72.1 },
      { x: 38.3, y: 63 },
      { x: 42.8, y: 59.7 },
      { x: 48.7, y: 55 },
      { x: 50.1, y: 50.5 },
      { x: 51.4, y: 47 },
      { x: 54.6, y: 43.8 },
      { x: 59.8, y: 40.7 },
      { x: 70.9, y: 30.1 },
      { x: 72.3, y: 26.6 },
      { x: 70.5, y: 22.4 },
      { x: 80.4, y: 12.6 },
    ],
    color: "#dc2626",
  },
  {
    id: "anggota",
    title: "Rute Jalan Santai Anggota",
    targetGroup: "Seluruh Anggota & Rombongan Keluarga",
    estimatedTime: "± 8 - 12 Menit",
    estimatedDistance: "± 350 Meter",
    description: "Sebelum mencapai titik finish, peserta atau anggota mengisi spot-spot area tangga untuk foto bersama (akan diarahkan oleh tim EO, sambil menunggu kedatangan PJU).",
    highlights: [
      "Start: Area Lapangan Helipad",
      "Hutan Pinus Resort (Spot Foto Sejuk)",
      "Wahana Edukasi Noah AR & Satwa",
      "Lapangan Gerbera (Area Hijau Luas)",
      "Finish: Tangga Samping Kolam Renang (Sesi Foto Bersama)"
    ],
    waypoints: [
      { x: 67.7, y: 29.2 },
      { x: 70.8, y: 23.8 },
      { x: 71.1, y: 19.7 },
      { x: 73.6, y: 16.7 },
      { x: 77.5, y: 13.9 },
      { x: 81.8, y: 13.3 },
      { x: 86.5, y: 14.5 },
      { x: 87.3, y: 18.6 },
      { x: 85.5, y: 20.9 },
      { x: 81.1, y: 23.6 },
      { x: 76.4, y: 26.1 },
      { x: 71.7, y: 28.7 },
      { x: 66.8, y: 32.6 },
      { x: 62.0, y: 37.0 },
      { x: 57.0, y: 42.0 },
      { x: 52.0, y: 46.4 },
      { x: 46.3, y: 50.2 },
      { x: 42.8, y: 58.3 },
      { x: 38.2, y: 63.0 },
      { x: 35.7, y: 66.3 },
      { x: 36.0, y: 67.9 },
      { x: 39.1, y: 67.8 },
      { x: 42.8, y: 63.2 },
      { x: 47.4, y: 58.8 },
      { x: 52.0, y: 54.5 },
      { x: 56.0, y: 51.5 },
      { x: 58.9, y: 53.6 },
      { x: 54.1, y: 43.5 },
    ],
    color: "#10b981",
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
    name: "Wahana Edukasi Noah & Satwa",
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
    id: "pin-helipad",
    name: "Kedatangan PJU",
    category: "Pimpinan PJU Pusziad",
    isPJU: true,
    image: "/resort_media/helipad/kedatangan_pju_gate.jpg",
    galleryImages: [
      "/resort_media/helipad/kedatangan_pju_gate.jpg"
    ],
    coords: { x: 82.0, y: 16.9 },
    description: "Selamat Datang di Family Gathering Pusziad 2026: Mayjen TNI Budi Hariswanto & Rombongan PJU di The Highland Park Resort Bogor.",
    badge: "Kedatangan PJU",
    color: "#eab308",
  },
  {
    id: "pin-alpine",
    name: "Alpine House",
    category: "Kamar PJU (6 buah)",
    isPJU: true,
    image: "/resort_media/alpine/alpine_1.png",
    galleryImages: [
      "/videos/pju_berjalan.mp4",
      "/resort_media/alpine/alpine_1.png",
      "/resort_media/alpine/alpine_2.png",
      "/resort_media/alpine/alpine_3.png",
      "/resort_media/alpine/alpine_4.png",
      "/resort_media/alpine/alpine_6.png"
    ],
    coords: { x: 58.5, y: 22.5 },
    description: "Kamar Utama PJU bergaya Alpine Eropa berpanorama Gunung Salak (Total 6 buah).",
    badge: "Kamar PJU",
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
    description: "Area Resto Lantai 2 untuk santap makan malam dan sarapan pagi bersama.",
    badge: "Resto Anthurium Lt. 2",
    color: "#10b981",
    menuCategories: DAY1_DINNER_MENU,
  },
  {
    id: "pin-ballroom",
    name: "Grand Ballroom",
    category: "Area Ball Room",
    image: "/resort_media/grand_ballroom/grand_ballroom_1.jpg",
    galleryImages: [
      "/resort_media/grand_ballroom/grand_ballroom_1.jpg",
      "/resort_media/grand_ballroom/grand_ballroom_2.jpg"
    ],
    coords: { x: 87.7, y: 29.5 },
    description: "Area gedung pertemuan utama untuk acara sambutan, pengundian Grand Prize, dan makan siang.",
    badge: "Grand Ballroom",
    color: "#a855f7",
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
    id: "pin-kopihip",
    name: "Kopi Hip",
    category: "Coffee Break PJU",
    isPJU: true,
    image: "/resort_media/kopi_hip/Foto/DSCF0423.jpg",
    galleryImages: [
      "/resort_media/kopi_hip/Foto/DSCF0423.jpg",
      "/resort_media/kopi_hip/Foto/DSCF0426.jpg",
      "/resort_media/kopi_hip/Foto/DSCF0432.jpg"
    ],
    coords: { x: 75.5, y: 29.5 },
    description: "Setelah sampai di finish line, PJU menuju Kopi Hip untuk coffee break.",
    badge: "Coffee Break PJU",
    color: "#ca8a04",
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
    title: "Kedatangan PJU",
    locationName: "Area Helipad (Tampilkan 5 PJU)",
    badge: "Kedatangan PJU",
    color: "#eab308",
    destImage: "/resort_media/helipad/kedatangan_pju_gate.jpg",
    destCoordinates: { x: 82.0, y: 16.9 },
    galleryImages: [
      "/resort_media/helipad/kedatangan_pju_gate.jpg"
    ],
    defaultWaypoints: [
      { x: 84.6, y: 15.9 },
      { x: 86.4, y: 19.9 },
      { x: 68.6, y: 34.9 },
    ],
  },
  {
    id: "d1-checkin-pju",
    day: 1,
    startTime: "17.00",
    endTime: "18.00",
    startMinutes: 1020, // 17:00
    endMinutes: 1080, // 18:00
    title: "Menempati Kamar PJU - Alpine House (6 buah)",
    locationName: "Alpine House",
    badge: "Kamar PJU",
    color: "#eab308",
    destImage: "/resort_media/alpine/alpine_1.png",
    destCoordinates: { x: 58.5, y: 22.5 },
    roomSingle: ROOM_ALPINE_HOUSE,
    galleryImages: [
      "/videos/pju_berjalan.mp4",
      "/resort_media/alpine/alpine_1.png",
      "/resort_media/alpine/alpine_2.png",
      "/resort_media/alpine/alpine_3.png",
      "/resort_media/alpine/alpine_4.png",
      "/resort_media/alpine/alpine_6.png"
    ],
    defaultWaypoints: [
      { x: 82.0, y: 16.9 },
      { x: 74.5, y: 21.0 },
      { x: 67.0, y: 22.5 },
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
    title: "Ibadah",
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
    destImage: "/resort_media/anthurium/DSCF3443.jpg",
    destCoordinates: { x: 60.8, y: 50.0 },
    menuCategories: DAY1_DINNER_MENU,
    galleryImages: [
      "/resort_media/anthurium/DSCF3443.jpg",
      "/resort_media/mountain_lounge/Foto/SKY LOUNGE RESTAURANT.jpg"
    ],
    defaultWaypoints: [
      { x: 57.5, y: 26.2 },
      { x: 62.3, y: 21.4 },
      { x: 68.3, y: 17.6 },
      { x: 71.0, y: 20.3 },
      { x: 71.9, y: 26.1 },
      { x: 70.9, y: 29.0 },
      { x: 71.4, y: 32.4 },
      { x: 65.7, y: 37.0 },
      { x: 66.9, y: 39.7 },
      { x: 63.0, y: 42.7 },
    ],
  },
  {
    id: "d1-games",
    day: 1,
    startTime: "20.00",
    endTime: "22.30",
    startMinutes: 1200, // 20:00
    endMinutes: 1350, // 22:30
    title: "Games (PJU & Ibu-Ibu PJU)",
    locationName: "Grand Ballroom",
    badge: "Games",
    color: "#a855f7",
    destImage: "/resort_media/grand_ballroom/grand_ballroom_1.jpg",
    destCoordinates: { x: 87.7, y: 29.5 },
    pjuGames: DAY1_GAMES_PJU,
    ibuGames: DAY1_GAMES_IBU_PJU,
    galleryImages: [
      "/resort_media/grand_ballroom/grand_ballroom_1.jpg",
      "/resort_media/grand_ballroom/grand_ballroom_2.jpg"
    ],
    defaultWaypoints: [
      { x: 63.2, y: 42.6 },
      { x: 68.7, y: 37.9 },
      { x: 75.0, y: 33.4 },
      { x: 73.9, y: 30.1 },
      { x: 79.0, y: 26.2 },
      { x: 83.5, y: 23.3 },
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
    title: "Titik Start & Finish Jalan Santai",
    locationName: "Area Helipad (Titik Awal)",
    description: "Keterangan Jalan Santai: Jarak +- 2.5 KM dengan estimasi durasi 45 menit - 1 jam.",
    badge: "Persiapan",
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
      { x: 83.8, y: 16.2 },
      { x: 86.6, y: 19.7 },
      { x: 74.7, y: 29.6 },
      { x: 65.9, y: 37.0 },
      { x: 68.0, y: 38.8 },
      { x: 66.7, y: 43.1 },
      { x: 61.0, y: 48.0 },
      { x: 53.4, y: 54.3 },
      { x: 45.7, y: 60.1 },
      { x: 43.4, y: 62.6 },
      { x: 39.9, y: 65.6 },
      { x: 38.3, y: 63.2 },
      { x: 40.5, y: 60.9 },
      { x: 42.8, y: 59.7 },
      { x: 48.7, y: 55.0 },
      { x: 50.1, y: 50.5 },
      { x: 51.4, y: 47.0 },
      { x: 54.6, y: 43.8 },
      { x: 59.8, y: 40.7 },
      { x: 70.9, y: 30.1 },
      { x: 72.3, y: 26.6 },
      { x: 70.5, y: 22.4 },
      { x: 80.4, y: 12.6 },
      { x: 82.6, y: 15.2 },
    ],
  },
  {
    id: "d2-kopi-hip",
    day: 2,
    startTime: "08.45",
    endTime: "09.00",
    startMinutes: 525, // 08:45
    endMinutes: 540, // 09:00
    title: "Kopi Hip (Coffee Break PJU)",
    locationName: "Kopi Hip",
    description: "Setelah sampai di finish line, PJU menuju Kopi Hip untuk coffee break.",
    badge: "Coffee Break PJU",
    color: "#ca8a04",
    destImage: "/resort_media/kopi_hip/Foto/DSCF0423.jpg",
    destCoordinates: { x: 75.5, y: 29.5 },
    galleryImages: [
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
    endTime: "12.00",
    startMinutes: 540, // 09:00
    endMinutes: 720, // 12:00
    title: "Acara di Ball Room (Sambutan & Grand Prize)",
    locationName: "Area Ball Room",
    badge: "Acara Ball Room",
    color: "#a855f7",
    destImage: "/resort_media/grand_ballroom/grand_ballroom_1.jpg",
    destCoordinates: { x: 87.7, y: 29.5 },
    galleryImages: [
      "/resort_media/grand_ballroom/grand_ballroom_1.jpg",
      "/resort_media/grand_ballroom/grand_ballroom_2.jpg"
    ],
    defaultWaypoints: [
      { x: 75.5, y: 29.5 },
      { x: 82.0, y: 29.5 },
      { x: 87.7, y: 29.5 },
    ],
  },
  {
    id: "d2-lunch",
    day: 2,
    startTime: "12.00",
    endTime: "13.00",
    startMinutes: 720, // 12:00
    endMinutes: 780, // 13:00
    title: "Makan Siang",
    locationName: "Area Ball Room",
    badge: "Makan Siang",
    color: "#10b981",
    destImage: "/resort_media/grand_ballroom/grand_ballroom_1.jpg",
    destCoordinates: { x: 87.7, y: 29.5 },
    galleryImages: [
      "/resort_media/grand_ballroom/grand_ballroom_1.jpg"
    ],
    defaultWaypoints: [
      { x: 78.5, y: 24.5 },
      { x: 71.5, y: 27.5 },
      { x: 66.0, y: 32.5 },
      { x: 58.0, y: 38.0 },
      { x: 48.5, y: 43.5 },
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

export const WELCOME_GATE_COORDS: Waypoint = HELIPAD_COORDS;
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
      SPAWN_BEHIND_HELIPAD,
      HELIPAD_COORDS,
      { x: 74.5, y: 31.0 },
      { x: 71.5, y: 27.5 },
      { x: 67.0, y: 24.5 },
      { x: 62.0, y: 23.0 },
      { x: 58.5, y: 22.5 },
    ],
  },
];
