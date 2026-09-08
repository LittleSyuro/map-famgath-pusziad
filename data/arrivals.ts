export interface Waypoint {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
}

export interface RundownSubActivity {
  title: string;
  category?: string; // "PJU Games" | "Ibu-ibu PJU" | "Ballroom Session"
  items?: string[];
  description?: string;
  icon?: string;
  image?: string;
}

export interface MenuItem {
  category: string;
  items: string[];
}

export interface HighlightSpot {
  id: string;
  name: string;
  legendNumber: string;
  image: string;
  coords: Waypoint;
  description: string;
  category: string;
}

export interface AccommodationRoom {
  id: string;
  name: string;
  role: string;
  isPJU?: boolean;
  internalNumber: string;
  legendNumber: string;
  image: string;
  detailImages?: string[];
  coords: Waypoint;
  description: string;
  facilities: string[];
}

export interface RundownItem {
  id: string;
  day: 1 | 2;
  startTime: string; // "16.00"
  endTime: string;   // "17.00"
  startMinutes: number; // 960
  endMinutes: number;   // 1020
  title: string;
  locationName?: string;
  locationNumber?: string;
  description: string;
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
  rooms?: AccommodationRoom[];
  disablePawn?: boolean; // When true, no pawn walking, directly open location/spot modal
}

// 3 Plotting Kamar Penginapan Tamu & Rombongan
export const ACCOMMODATION_ROOMS: AccommodationRoom[] = [
  {
    id: "room-pju",
    name: "Alpine House",
    role: "Kamar Utama (PJU)",
    isPJU: true,
    internalNumber: "6",
    legendNumber: "25",
    image: "/resort_media/alpine/alpine_1.png",
    detailImages: [
      "/resort_media/alpine/alpine_1.png",
      "/resort_media/alpine/alpine_2.png",
      "/resort_media/alpine/alpine_3.png",
      "/resort_media/alpine/alpine_4.png",
      "/resort_media/alpine/alpine_5.png",
      "/resort_media/alpine/alpine_6.png",
      "/resort_media/alpine/alpine_7.png"
    ],
    coords: { x: 58.5, y: 22.5 },
    description: "Kamar Utama A-Frame bergaya Alpine Eropa dengan panorama asri Gunung Salak untuk Pejabat Utama (PJU).",
    facilities: [
      "King Size Bed Luxury",
      "Balkon Panorama Gunung",
      "Private Bathroom & Water Heater",
      "Smart TV & Free High Speed Wi-Fi",
      "Mini Bar & Coffee Maker",
      "Living Room Area"
    ],
  },
  {
    id: "room-mongolian",
    name: "Mongolian Superior Camp",
    role: "Kamar Rombongan 2",
    isPJU: false,
    internalNumber: "12",
    legendNumber: "42",
    image: "/resort_media/mongolian/mongolian_2.jpg",
    detailImages: [
      "/resort_media/mongolian/mongolian_2.jpg",
      "/resort_media/mongolian/mongolian_3.jpg",
      "/resort_media/mongolian/mongolian_4.jpg",
      "/resort_media/mongolian/mongolian_5.jpg",
      "/resort_media/mongolian/mongolian_12.mp4"
    ],
    coords: { x: 15.0, y: 84.0 },
    description: "Kamar tematik tenda khas suku Mongolia berfasilitas modern dan berpendingin udara lengkap.",
    facilities: [
      "Twin / Double Bed",
      "Air Conditioning (AC)",
      "En-suite Bathroom",
      "Water Heater & Amenities",
      "Dekat Lapangan Hijau & Resto"
    ],
  },
  {
    id: "room-the-cave",
    name: "The Cave",
    role: "Kamar Rombongan 3",
    isPJU: false,
    internalNumber: "16",
    legendNumber: "24",
    image: "/resort_media/the_cave/the_cave_12.png",
    detailImages: [
      "/resort_media/the_cave/the_cave_12.png",
      "/resort_media/the_cave/the_cave_14.png",
      "/resort_media/the_cave/the_cave_16.png",
      "/resort_media/the_cave/the_cave_21.jpg",
      "/resort_media/the_cave/the_cave_22.mp4"
    ],
    coords: { x: 43.0, y: 53.5 },
    description: "Penginapan unik bertema goa alami dengan interior batu eksotis dan kenyamanan hotel bintang.",
    facilities: [
      "Double Bed Comfort",
      "Batu Alami & Unique Ambiance",
      "Private Shower & Water Heater",
      "Full Amenities & Tea Set",
      "Dekat Area Rekreasi & Danau"
    ],
  },
];

// Menu Resmi Santap Bersama & Coffee Break di Resto Anthurium Lt. 2 (Highland Park Resort)
export const ANTHURIUM_MENU: MenuItem[] = [
  {
    category: "LUNCH (PAKET B)",
    items: [
      "Steamed Rice",
      "Cream Potato Soup",
      "Capcay",
      "Gepuk Chicken",
      "Sweet and Sour Snapper",
      "Mixed Fruits",
      "Pudding"
    ],
  },
  {
    category: "CB 1 (MORNING)",
    items: [
      "Chicken Nugget",
      "Panettone",
      "Velvet Roll",
      "Assorted Chips",
      "Coffee & Tea"
    ],
  },
  {
    category: "CB 2 (AFTERNOON)",
    items: [
      "Marble Green Tea Cake",
      "Black Forest Roll",
      "Sausage Orly",
      "Assorted Chips",
      "Coffee & Tea"
    ],
  },
  {
    category: "CB 3 (EVENING)",
    items: [
      "Pisang Rebus",
      "Jagung Rebus",
      "Kacang Rebus",
      "Assorted Chips",
      "Coffee & Tea"
    ],
  },
];

// Foto Galeri Resto Anthurium Lt. 2 (HD dari folder RESTO ANTHURIUM)
export const ANTHURIUM_GALLERY = [
  {
    title: "Resto Anthurium Lt. 2 (Utama)",
    image: "/resort_media/anthurium/DSCF3443.jpg",
    caption: "Foto HD suasana santap buffet dan tata meja di Resto Anthurium Lantai 2."
  },
  {
    title: "Sky Lounge & View Restaurant",
    image: "/resort_media/mountain_lounge/Foto/SKY LOUNGE RESTAURANT.jpg",
    caption: "Panorama perbukitan Gunung Salak dari area santap Mountain Sky Lounge."
  },
  {
    title: "Sofa & Lounge Area",
    image: "/resort_media/mountain_lounge/Foto/SOFA SKY LOUNGE.jpg",
    caption: "Area santai keluarga yang nyaman dengan sofa modern dan suasana sejuk."
  },
  {
    title: "Video Sinematik Resto Anthurium",
    image: "/resort_media/anthurium/Mountain Lounge.mp4",
    caption: "Video sinematik suasana Restoran Anthurium dan Mountain Lounge Lantai 2."
  }
];

// 4 Spot Menarik Day 2 (Jalan Sehat & Rekreasi)
export const DAY2_HIGHLIGHT_SPOTS: HighlightSpot[] = [
  {
    id: "spot-noah",
    name: "Wahana Edukasi Noah AR & Satwa",
    legendNumber: "51",
    image: "/legend/51_Rumah_Kelinci.png",
    coords: { x: 31.0, y: 64.0 },
    category: "Wahana Edukasi & Rekreasi",
    description: "Spot wisata interaktif bertema bahtera satwa dan Augmented Reality (AR) ramah anak & keluarga.",
  },
  {
    id: "spot-bridge",
    name: "Tangga Spot Foto Bersama (Samping Kolam)",
    legendNumber: "14",
    image: "/resort_media/spots/foto_bersama_jembatan.jpg",
    coords: { x: 54.1, y: 43.5 },
    category: "Titik Akhir & Spot Foto Bersama",
    description: "Titik akhir rute jalan santai di area tangga samping kolam renang untuk sesi foto bersama seluruh rombongan.",
  },
  {
    id: "spot-pinus",
    name: "Hutan Pinus Resort",
    legendNumber: "03",
    image: "/legend/03_Hutan_Pinus.png",
    coords: { x: 86.0, y: 22.0 },
    category: "Jalur Alam & Relaksasi",
    description: "Jalur jalan sehat berhawa sejuk diapit deretan pohon pinus rindang yang tenang dan menyegarkan.",
  },
  {
    id: "spot-gerbera",
    name: "Lapangan Gerbera",
    legendNumber: "45",
    image: "/resort_media/gerbera/gerbera_2.png",
    coords: { x: 37.0, y: 68.0 },
    category: "Area Olahraga & Senam SKJ",
    description: "Lapangan rumput hijau terbuka nan luas untuk pelaksanaan Senam SKJ 92 dan kebersamaan keluarga.",
  },
];

export const DAY2_GAMES_ACTIVITIES: RundownSubActivity[] = [
  {
    title: "Lomba Kekeluargaan & Outbound Seru",
    category: "Family Games",
    description: "Aneka lomba kekompakan tim, keceriaan anak & keluarga di Lapangan Helipad.",
    icon: "🎯",
    image: "/resort_media/helipad/helipad_2.jpg",
    items: [
      "Lomba Estafet Kelereng & Balon",
      "Tarik Tambang Kebersamaan",
      "Lomba Bakiak Raksasa Beregu",
      "Balap Karung Helm Lucu",
      "Fun Games Anak & Doorprize Ceria"
    ],
  },
];

// Helipad Coordinates (Posisi Awal Baru Sesuai Rakor)
export const HELIPAD_COORDS: Waypoint = { x: 80.5, y: 35.5 };
export const SPAWN_BEHIND_HELIPAD: Waypoint = { x: 82.5, y: 33.0 };

// 11 Pin Point Utama Seluruh Kegiatan Famgath (Resto, Masjid, Ballroom, Kamar PJU, Kamar Rombongan, Helipad, Spot Wisata)
export interface KeyEventPinpoint {
  id: string;
  name: string;
  category: string;
  legendNumber: string;
  image: string;
  galleryImages?: string[];
  coords: Waypoint;
  description: string;
  badge: string;
  color: string;
  isPJU?: boolean;
  facilities?: string[];
  menuCategories?: MenuItem[];
  subActivities?: RundownSubActivity[];
}

export const KEY_EVENT_PINPOINTS: KeyEventPinpoint[] = [
  {
    id: "pin-alpine",
    name: "Alpine House",
    category: "Kamar Utama PJU",
    legendNumber: "25",
    isPJU: true,
    image: "/resort_media/alpine/alpine_1.png",
    galleryImages: [
      "/resort_media/alpine/alpine_1.png",
      "/resort_media/alpine/alpine_2.png",
      "/resort_media/alpine/alpine_3.png",
      "/resort_media/alpine/alpine_4.png",
      "/resort_media/alpine/alpine_5.png",
      "/resort_media/alpine/alpine_6.png",
      "/resort_media/alpine/alpine_7.png"
    ],
    coords: { x: 58.5, y: 22.5 },
    description: "Kamar Utama A-Frame bergaya Alpine Eropa dengan panorama asri Gunung Salak untuk Pejabat Utama (PJU).",
    badge: "Kamar Utama PJU",
    color: "#eab308",
    facilities: [
      "King Size Bed Luxury",
      "Balkon Panorama Gunung",
      "Private Bathroom & Water Heater",
      "Smart TV & Free High Speed Wi-Fi",
      "Mini Bar & Coffee Maker",
      "Living Room Area"
    ],
  },
  {
    id: "pin-cave",
    name: "The Cave",
    category: "Kamar Rombongan 3",
    legendNumber: "24",
    image: "/resort_media/the_cave/the_cave_12.png",
    galleryImages: [
      "/resort_media/the_cave/the_cave_12.png",
      "/resort_media/the_cave/the_cave_14.png",
      "/resort_media/the_cave/the_cave_16.png",
      "/resort_media/the_cave/the_cave_21.jpg",
      "/resort_media/the_cave/the_cave_22.mp4"
    ],
    coords: { x: 43.0, y: 53.5 },
    description: "Penginapan unik bertema goa alami dengan interior batu eksotis dan kenyamanan hotel bintang.",
    badge: "Kamar Rombongan 3",
    color: "#10b981",
    facilities: [
      "Double Bed Comfort",
      "Batu Alami & Unique Ambiance",
      "Private Shower & Water Heater",
      "Full Amenities & Tea Set",
      "Dekat Area Rekreasi & Danau"
    ],
  },
  {
    id: "pin-mongolian",
    name: "Mongolian Superior Camp",
    category: "Kamar Rombongan 2",
    legendNumber: "42",
    image: "/resort_media/mongolian/mongolian_2.jpg",
    galleryImages: [
      "/resort_media/mongolian/mongolian_2.jpg",
      "/resort_media/mongolian/mongolian_3.jpg",
      "/resort_media/mongolian/mongolian_4.jpg",
      "/resort_media/mongolian/mongolian_5.jpg",
      "/resort_media/mongolian/mongolian_12.mp4"
    ],
    coords: { x: 15.0, y: 84.0 },
    description: "Kamar tematik tenda khas suku Mongolia berfasilitas modern dan berpendingin udara lengkap.",
    badge: "Kamar Rombongan 2",
    color: "#10b981",
    facilities: [
      "Twin / Double Bed",
      "Air Conditioning (AC)",
      "En-suite Bathroom",
      "Water Heater & Amenities",
      "Dekat Lapangan Hijau & Resto"
    ],
  },
  {
    id: "pin-resto",
    name: "Resto Anthurium Lt. 2",
    category: "Restoran & Sky Lounge",
    legendNumber: "36a",
    image: "/resort_media/anthurium/DSCF3443.jpg",
    galleryImages: [
      "/resort_media/anthurium/DSCF3443.jpg",
      "/resort_media/mountain_lounge/Foto/SKY LOUNGE RESTAURANT.jpg",
      "/resort_media/mountain_lounge/Foto/SOFA SKY LOUNGE.jpg",
      "/resort_media/mountain_lounge/Foto/SKY LOUNGE VIEW.jpg",
      "/resort_media/anthurium/Mountain Lounge.mp4"
    ],
    coords: { x: 60.8, y: 50.0 },
    description: "Restoran utama santap buffet makan malam dan sarapan pagi bersama seluruh rombongan.",
    badge: "Restoran Anthurium",
    color: "#10b981",
    menuCategories: ANTHURIUM_MENU,
  },
  {
    id: "pin-masjid",
    name: "Masjid / Mushola Resort",
    category: "Fasilitas Ibadah",
    legendNumber: "04",
    image: "/resort_media/masjid/masjid_1.jpg",
    galleryImages: [
      "/resort_media/masjid/masjid_1.jpg",
      "/resort_media/masjid/masjid_2.jpg",
      "/resort_media/masjid/masjid_3.jpg"
    ],
    coords: { x: 80.0, y: 33.2 },
    description: "Tempat ibadah Sholat Maghrib, Isya, Subuh, dan istirahat mandiri peserta Famgath.",
    badge: "Masjid Resort",
    color: "#6366f1",
  },
  {
    id: "pin-ballroom",
    name: "Grand Ballroom & Plaza Aster",
    category: "Aula Acara & Grand Prize",
    legendNumber: "07",
    image: "/resort_media/grand_ballroom/grand_ballroom_1.jpg",
    galleryImages: [
      "/resort_media/grand_ballroom/grand_ballroom_1.jpg",
      "/resort_media/grand_ballroom/grand_ballroom_2.jpg",
      "/games/pju_games.jpg",
      "/games/ibu_pju_games.jpg",
      "/resort_media/grand_ballroom/grand_ballroom_47.mp4"
    ],
    coords: { x: 87.7, y: 29.5 },
    description: "Gedung pertemuan megah untuk turnamen PJU Games, hiburan, dan pengundian Grand Prize.",
    badge: "Grand Ballroom",
    color: "#a855f7",
  },
  {
    id: "pin-helipad",
    name: "Lapangan Helipad",
    category: "Area Outdoor & SKJ",
    legendNumber: "12",
    image: "/resort_media/helipad/helipad_1.jpg",
    galleryImages: [
      "/resort_media/helipad/helipad_1.jpg",
      "/resort_media/helipad/helipad_2.jpg",
      "/resort_media/helipad/helipad_3.jpg"
    ],
    coords: { x: 82.0, y: 16.9 },
    description: "Area terbuka berumput hijau untuk penyambutan kedatangan, senam SKJ pagi, dan family games.",
    badge: "Lapangan Helipad",
    color: "#f59e0b",
  },
  {
    id: "pin-bridge",
    name: "Tangga Spot Foto Bersama (Samping Kolam)",
    category: "Titik Akhir Jalan Santai",
    legendNumber: "14",
    image: "/resort_media/spots/foto_bersama_jembatan.jpg",
    galleryImages: [
      "/resort_media/spots/foto_bersama_jembatan.jpg"
    ],
    coords: { x: 54.1, y: 43.5 },
    description: "Titik akhir rute jalan santai untuk sesi foto bersama seluruh keluarga besar rombongan di tangga samping kolam renang.",
    badge: "Spot Foto Bersama (No. 14)",
    color: "#06b6d4",
  },
  {
    id: "pin-noah",
    name: "Wahana Noah AR & Satwa",
    category: "Wahana Edukasi & Satwa",
    legendNumber: "51",
    image: "/legend/51_Rumah_Kelinci.png",
    coords: { x: 31.0, y: 64.0 },
    description: "Spot wisata interaktif bertema bahtera satwa dan Augmented Reality (AR) ramah keluarga.",
    badge: "Wahana Noah",
    color: "#06b6d4",
  },
  {
    id: "pin-pinus",
    name: "Hutan Pinus Resort",
    category: "Jalur Alam & Relaksasi",
    legendNumber: "03",
    image: "/legend/03_Hutan_Pinus.png",
    coords: { x: 86.0, y: 22.0 },
    description: "Jalur jalan sehat berhawa sejuk diapit deretan pohon pinus rindang yang asri dan tenang.",
    badge: "Hutan Pinus",
    color: "#10b981",
  },
  {
    id: "pin-gerbera",
    name: "Lapangan Gerbera",
    category: "Area Olahraga & Senam",
    legendNumber: "45",
    image: "/resort_media/gerbera/gerbera_2.png",
    coords: { x: 37.0, y: 68.0 },
    description: "Lapangan rumput hijau terbuka nan luas untuk rute jalan sehat dan kebersamaan keluarga.",
    badge: "Lapangan Gerbera",
    color: "#10b981",
  },
];

export const RUNDOWN_SCHEDULE_DAY_1: RundownItem[] = [
  {
    id: "d1-arrival",
    day: 1,
    startTime: "16.00",
    endTime: "17.00",
    startMinutes: 960,  // 16:00
    endMinutes: 1020,  // 17:00
    title: "Kedatangan PJU Pusziad",
    locationName: "Lapangan Helipad (Simbol H)",
    locationNumber: "12",
    description: "Penyambutan dan kedatangan PJU Pusziad di area Dekat Lapangan Helipad (Simbol H).",
    badge: "Kedatangan PJU",
    color: "#eab308",
    destLegendNumber: "12",
    destImage: "/resort_media/helipad/helipad_1.jpg",
    destCoordinates: HELIPAD_COORDS,
    galleryImages: [
      "/resort_media/helipad/helipad_1.jpg",
      "/resort_media/helipad/helipad_3.jpg",
      "/resort_media/helipad/helipad_14.png"
    ],
    defaultWaypoints: [
      { x: 84.6, y: 15.9 },
      { x: 86.4, y: 19.9 },
      { x: 68.6, y: 34.9 },
    ],
  },
  {
    id: "d1-checkin",
    day: 1,
    startTime: "17.00",
    endTime: "18.00",
    startMinutes: 1020, // 17:00
    endMinutes: 1080, // 18:00
    title: "Menempati Kamar",
    locationName: "Alpine House (Kamar Utama PJU)",
    locationNumber: "25",
    description: "PJU berjalan menuju Alpine House. Ada 2 jenis tipe kamar lain yang juga digunakan yaitu Mongolian Superior Camp dan The Cave.",
    badge: "Check-in 3 Kamar",
    color: "#eab308",
    destLegendNumber: "25",
    destImage: "/resort_media/alpine/alpine_1.png",
    destCoordinates: { x: 58.5, y: 22.5 },
    rooms: ACCOMMODATION_ROOMS,
    defaultWaypoints: [
      { x: 77.0, y: 32.0 },
      { x: 73.7, y: 30.6 },
      { x: 71.6, y: 32.2 },
      { x: 70.7, y: 28.7 },
      { x: 72.7, y: 27.1 },
      { x: 70.0, y: 22.8 },
      { x: 70.4, y: 19.3 },
      { x: 68.9, y: 17.1 },
      { x: 64.4, y: 20.7 },
      { x: 60.8, y: 23.3 },
      { x: 57.2, y: 25.7 },
    ],
  },
  {
    id: "d1-worship",
    day: 1,
    startTime: "18.00",
    endTime: "19.30",
    startMinutes: 1080, // 18:00
    endMinutes: 1170, // 19:30
    title: "Ibadah Masing-masing",
    locationName: "Masjid / Mushola Resort",
    locationNumber: "4",
    description: "Waktu ibadah sholat Maghrib & Isya dan istirahat mandiri di Masjid Resort (No. 4).",
    badge: "Ibadah Masjid",
    color: "#6366f1",
    destLegendNumber: "4",
    destImage: "/resort_media/masjid/masjid_1.jpg",
    destCoordinates: { x: 80.0, y: 33.2 },
    galleryImages: [
      "/resort_media/masjid/masjid_1.jpg",
      "/resort_media/masjid/masjid_2.jpg",
      "/resort_media/masjid/masjid_3.jpg"
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
    locationNumber: "36a",
    description: "Santap makan malam bersama seluruh rombongan di Resto Anthurium Lantai 2 dengan sajian buffet istimewa.",
    badge: "Makan Malam",
    color: "#10b981",
    destLegendNumber: "36a",
    destImage: "/resort_media/anthurium/DSCF3443.jpg",
    destCoordinates: { x: 60.8, y: 50.0 },
    menuCategories: ANTHURIUM_MENU,
    galleryImages: [
      "/resort_media/anthurium/DSCF3443.jpg",
      "/resort_media/mountain_lounge/Foto/SKY LOUNGE RESTAURANT.jpg",
      "/resort_media/mountain_lounge/Foto/SOFA SKY LOUNGE.jpg",
      "/resort_media/mountain_lounge/Foto/SKY LOUNGE VIEW.jpg",
      "/resort_media/anthurium/Mountain Lounge.mp4"
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
    title: "PJU Games & Ibu-ibu PJU",
    locationName: "Grand Ballroom",
    locationNumber: "7",
    description: "Perlombaan seru dan penuh keakraban.",
    badge: "PJU & Ibu-ibu Games",
    color: "#a855f7",
    destLegendNumber: "7",
    destImage: "/resort_media/grand_ballroom/grand_ballroom_1.jpg",
    destCoordinates: { x: 87.7, y: 29.5 },
    defaultWaypoints: [
      { x: 63.2, y: 42.6 },
      { x: 68.7, y: 37.9 },
      { x: 75.0, y: 33.4 },
      { x: 73.9, y: 30.1 },
      { x: 79.0, y: 26.2 },
      { x: 83.5, y: 23.3 },
    ],
    galleryImages: [
      "/resort_media/grand_ballroom/grand_ballroom_1.jpg",
      "/resort_media/grand_ballroom/grand_ballroom_2.jpg",
      "/games/pju_games.jpg",
      "/games/ibu_pju_games.jpg",
      "/resort_media/grand_ballroom/grand_ballroom_47.mp4"
    ],
    subActivities: [
      {
        title: "PJU Games (Turnamen Keakraban)",
        category: "PJU Games",
        description: "Turnamen asah strategi, konsentrasi, dan keakraban antar Pejabat Utama di Grand Ballroom.",
        icon: "♟️",
        image: "/games/pju_games.jpg",
        items: [
          "Catur Standar",
          "Turnamen Gaple / Domino",
          "Remi / Bridge Challenge"
        ],
      },
      {
        title: "Ibu-ibu PJU Games (Lomba Ketangkasan)",
        category: "Ibu-ibu PJU",
        description: "Lomba seru, ketangkasan, dan kekompakan dengan aneka hadiah kejutan menarik.",
        icon: "🎁",
        image: "/games/ibu_pju_games.jpg",
        items: [
          "Serok Rezeki (Mata Tertutup)",
          "Botol Rezeki Berhadiah",
          "Kotak Sultan Penuh Kejutan",
          "Pantulan Rezeki Bola Pingpong",
          "Jalur Tanpa Kepastian"
        ],
      },
    ],
  },
];

export const RUNDOWN_SCHEDULE_DAY_2: RundownItem[] = [
  {
    id: "d2-breakfast",
    day: 2,
    startTime: "06.00",
    endTime: "07.00",
    startMinutes: 360, // 06:00
    endMinutes: 420, // 07:00
    title: "Sarapan Pagi",
    locationName: "Resto Anthurium Lt. 2",
    locationNumber: "36a",
    description: "Sarapan pagi Buffet untuk seluruh peserta di Resto Anthurium Lantai 2 sebelum memulai kegiatan outdoor.",
    badge: "Sarapan Pagi",
    color: "#06b6d4",
    destLegendNumber: "36a",
    destImage: "/resort_media/anthurium/DSCF3443.jpg",
    destCoordinates: { x: 60.8, y: 50.0 },
    menuCategories: ANTHURIUM_MENU,
    galleryImages: [
      "/resort_media/anthurium/DSCF3443.jpg",
      "/resort_media/mountain_lounge/Foto/SKY LOUNGE RESTAURANT.jpg",
      "/resort_media/mountain_lounge/Foto/SOFA SKY LOUNGE.jpg",
      "/resort_media/anthurium/Mountain Lounge.mp4"
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
    id: "d2-skj",
    day: 2,
    startTime: "07.00",
    endTime: "07.45",
    startMinutes: 420, // 07:00
    endMinutes: 465, // 07:45
    title: "Senam Pagi (SKJ)",
    locationName: "Lapangan Helipad",
    locationNumber: "64",
    description: "Senam Kesegaran Jasmani (SKJ) bersama seluruh peserta di area terbuka Lapangan Helipad berlatar belakang Gunung Salak.",
    badge: "Senam Pagi",
    color: "#eab308",
    destLegendNumber: "64",
    destImage: "/resort_media/helipad/helipad_1.jpg",
    destCoordinates: { x: 82.0, y: 16.9 },
    galleryImages: [
      "/resort_media/helipad/helipad_1.jpg",
      "/resort_media/helipad/helipad_2.jpg",
      "/resort_media/helipad/helipad_3.jpg",
      "/resort_media/helipad/helipad_4.jpg",
      "/resort_media/helipad/helipad_5.jpg",
      "/resort_media/helipad/helipad_6.jpg",
      "/resort_media/helipad/helipad_7.jpg",
      "/resort_media/helipad/helipad_8.jpg",
      "/resort_media/helipad/helipad_9.jpg",
      "/resort_media/helipad/helipad_10.jpg",
      "/resort_media/helipad/helipad_11.jpg",
      "/resort_media/helipad/helipad_12.jpg",
      "/resort_media/helipad/helipad_13.jpg",
      "/resort_media/helipad/helipad_14.jpg",
      "/resort_media/helipad/helipad_15.jpg",
      "/resort_media/helipad/helipad_16.jpg"
    ],
    defaultWaypoints: [
      { x: 48.5, y: 43.5 },
      { x: 58.0, y: 38.0 },
      { x: 66.0, y: 30.0 },
      { x: 72.0, y: 26.0 },
      { x: 78.5, y: 24.5 },
    ],
  },
  {
    id: "d2-jalan-sehat",
    day: 2,
    startTime: "07.45",
    endTime: "08.45",
    startMinutes: 465, // 07:45
    endMinutes: 525, // 08:45
    title: "Jalan Santai & Foto Bersama",
    locationName: "Tangga Samping Kolam (No. 14)",
    locationNumber: "14",
    description: "Kegiatan jalan santai mengelilingi kawasan resort yang berakhir dengan sesi foto bersama seluruh rombongan di tangga samping kolam renang (No. 14).",
    badge: "Jalan Santai",
    color: "#14b8a6",
    destLegendNumber: "14",
    destImage: "/resort_media/spots/foto_bersama_jembatan.jpg",
    destCoordinates: { x: 54.1, y: 43.5 },
    highlightSpots: DAY2_HIGHLIGHT_SPOTS,
    galleryImages: [
      "/resort_media/spots/foto_bersama_jembatan.jpg",
      "/legend/03_Hutan_Pinus.png",
      "/legend/51_Rumah_Kelinci.png",
      "/resort_media/gerbera/gerbera_2.png"
    ],
    defaultWaypoints: [
      { x: 78.5, y: 24.5 },
      { x: 86.0, y: 22.0 },
      { x: 54.0, y: 47.0 },
      { x: 37.0, y: 68.0 },
      { x: 31.0, y: 64.0 },
      { x: 78.5, y: 24.5 },
    ],
  },
  {
    id: "d2-games",
    day: 2,
    startTime: "08.45",
    endTime: "10.00",
    startMinutes: 525, // 08:45
    endMinutes: 600, // 10:00
    title: "Family Games & Outbound",
    locationName: "Lapangan Helipad",
    locationNumber: "64",
    description: "Kegiatan aneka lomba kekeluargaan dan fun games seru untuk seluruh rombongan di Lapangan Helipad.",
    badge: "Fun Games",
    color: "#f97316",
    destLegendNumber: "64",
    destImage: "/resort_media/helipad/helipad_2.jpg",
    destCoordinates: { x: 82.0, y: 16.9 },
    subActivities: DAY2_GAMES_ACTIVITIES,
    galleryImages: [
      "/resort_media/helipad/helipad_2.jpg",
      "/resort_media/helipad/helipad_4.jpg",
      "/resort_media/helipad/helipad_6.jpg",
      "/resort_media/helipad/helipad_8.jpg",
      "/resort_media/helipad/helipad_10.jpg",
      "/resort_media/helipad/helipad_12.jpg",
      "/resort_media/helipad/helipad_14.jpg",
      "/resort_media/helipad/helipad_16.jpg"
    ],
    defaultWaypoints: [
      { x: 31.0, y: 64.0 },
      { x: 54.0, y: 47.0 },
      { x: 72.0, y: 30.0 },
      { x: 78.5, y: 24.5 },
    ],
  },
  {
    id: "d2-grandprize",
    day: 2,
    startTime: "10.00",
    endTime: "12.00",
    startMinutes: 600, // 10:00
    endMinutes: 720, // 12:00
    title: "Acara Hiburan & Pembagian Hadiah / Grand Prize",
    locationName: "Grand Ballroom & Plaza Aster",
    locationNumber: "7",
    description: "Puncak acara kekeluargaan Famgath Pusziad: Hiburan musik, santap kudapan, dan pengundian Grand Prize utama di Grand Ballroom & Plaza Aster.",
    badge: "Grand Prize & Hiburan",
    color: "#a855f7",
    destLegendNumber: "7",
    destImage: "/resort_media/grand_ballroom/grand_ballroom_1.jpg",
    destCoordinates: { x: 87.7, y: 29.5 },
    galleryImages: [
      "/resort_media/grand_ballroom/grand_ballroom_1.jpg",
      "/resort_media/grand_ballroom/grand_ballroom_2.jpg",
      "/resort_media/grand_ballroom/grand_ballroom_47.mp4"
    ],
    defaultWaypoints: [
      { x: 80.5, y: 35.5 },
      { x: 75.0, y: 30.0 },
      { x: 78.5, y: 24.5 },
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
    locationName: "Resto Anthurium Lt. 2",
    locationNumber: "36a",
    description: "Makan siang buffet bersama di Resto Anthurium Lt. 2 sebelum persiapan check-out dan kepulangan.",
    badge: "Makan Siang",
    color: "#10b981",
    destLegendNumber: "36a",
    destImage: "/resort_media/anthurium/DSCF3443.jpg",
    destCoordinates: { x: 60.8, y: 50.0 },
    menuCategories: ANTHURIUM_MENU,
    galleryImages: [
      "/resort_media/anthurium/DSCF3443.jpg",
      "/resort_media/mountain_lounge/Foto/SKY LOUNGE RESTAURANT.jpg",
      "/resort_media/mountain_lounge/Foto/SOFA SKY LOUNGE.jpg",
      "/resort_media/anthurium/Mountain Lounge.mp4"
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
    id: "d2-ballroom",
    day: 2,
    startTime: "13.00",
    endTime: "17.00",
    startMinutes: 780, // 13:00
    endMinutes: 1020, // 17:00
    title: "Waktu Keluarga",
    locationName: "Kawasan The Highland Park",
    description: "Acara bebas bersama keluarga atau kerabat, dapat menikmati suasana dan juga berbagai fasilitas di The Highland Park",
    badge: "Waktu Keluarga",
    color: "#f59e0b",
    destImage: "/legend/01_Lobby_Utama.png",
    destCoordinates: { x: 50.0, y: 50.0 },
    galleryImages: [
      "/legend/01_Lobby_Utama.png",
      "/legend/15_Invisible_Bridge.png",
      "/legend/51_Rumah_Kelinci.png",
      "/legend/03_Hutan_Pinus.png"
    ],
    defaultWaypoints: [
      { x: 48.5, y: 43.5 },
      { x: 50.0, y: 50.0 },
    ],
  },
];

// Combine all activities for easy route lookups
export const ALL_RUNDOWN_ITEMS: RundownItem[] = [
  ...RUNDOWN_SCHEDULE_DAY_1,
  ...RUNDOWN_SCHEDULE_DAY_2,
];

// Alias for simulation timeline
export const RUNDOWN_SCHEDULE: RundownItem[] = RUNDOWN_SCHEDULE_DAY_1;

export interface VIPArrival {
  id: string;
  name: string;
  title: string;              // "PJU"
  isPJU?: boolean;
  photo: string;
  internalNumber: string;     // "6"
  mapLocationName: string;    // "Alpine House"
  roomLegendNumber: string;   // "25"
  roomImage: string;          // "/legend/25_Alpine_House.png"
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

export const TIMELINE_START_MINUTES = 960;  // 16:00
export const TIMELINE_END_MINUTES = 1080;   // 18:00

// Single Character: "Si Bapak" (PJU)
export const VIP_ARRIVALS: VIPArrival[] = [
  {
    id: "pju",
    name: "Pejabat Utama (PJU)",
    title: "PJU",
    isPJU: true,
    photo: "/avatars/budi_hariswanto.jpg",
    internalNumber: "6",
    mapLocationName: "Alpine House",
    roomLegendNumber: "25",
    roomImage: "/legend/25_Alpine_House.png",
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
