export interface DoorprizeItem {
  no: number;
  name: string;
  quantity: number;
  donor: string;
}

export interface DoorprizeSummary {
  totalItems: number;
  totalUnits: number;
  receivedUnits: number;
  pendingUnits: number;
  pendingNote: string;
  sourceDocument: string;
  gradeA: {
    itemsCount: number;
    unitsCount: number;
    description: string;
  };
  gradeB: {
    itemsCount: number;
    unitsCount: number;
    description: string;
  };
}

export const DOORPRIZE_SUMMARY: DoorprizeSummary = {
  totalItems: 139,
  totalUnits: 937,
  receivedUnits: 936,
  pendingUnits: 1,
  pendingNote: "1 unit yang belum diterima: Motor Honda Scoopy dari Bank Mandiri Pusziad (Grade A no. 5)",
  sourceDocument: "DOORPRIZE HUT ZENI Update.xlsx (Pusat Pendidikan Zeni — Panitia Doorprize)",
  gradeA: {
    itemsCount: 38,
    unitsCount: 90,
    description: "Harga di Atas 2 Juta (Motor, Sepeda Listrik, Smart TV, Kulkas, Mesin Cuci, Logam Mulia)"
  },
  gradeB: {
    itemsCount: 101,
    unitsCount: 847,
    description: "Harga di Bawah 2 Juta (Peralatan Rumah Tangga, Elektronik Kecil, Perlengkapan Harian)"
  }
};

export const DOORPRIZE_GRADE_A: DoorprizeItem[] = [
  {
    "no": 1,
    "name": "Motor Honda CB 150 Verza",
    "quantity": 1,
    "donor": "Kapusziad"
  },
  {
    "no": 2,
    "name": "Motor Honda Beat",
    "quantity": 1,
    "donor": "Pusdikzi"
  },
  {
    "no": 3,
    "name": "Motor Honda Beat",
    "quantity": 1,
    "donor": "Kapuskon"
  },
  {
    "no": 4,
    "name": "Motor Honda Beat",
    "quantity": 1,
    "donor": "Aslog Kostrad"
  },
  {
    "no": 5,
    "name": "Motor Honda Scoopy",
    "quantity": 1,
    "donor": "Bank Mandiri Pusziad"
  },
  {
    "no": 6,
    "name": "Sepeda Polygon",
    "quantity": 5,
    "donor": "Bank Mandiri Pusziad"
  },
  {
    "no": 7,
    "name": "Sepeda Listrik",
    "quantity": 2,
    "donor": "Dirbinkonbang"
  },
  {
    "no": 8,
    "name": "Sepeda",
    "quantity": 2,
    "donor": "Rekanan Pusziad"
  },
  {
    "no": 9,
    "name": "Sepeda MTB",
    "quantity": 4,
    "donor": "Dirbinmatzi"
  },
  {
    "no": 10,
    "name": "Smart TV Polytron 40\"",
    "quantity": 2,
    "donor": "Sdirbinfasjasa"
  },
  {
    "no": 11,
    "name": "Mesin cuci TCL",
    "quantity": 2,
    "donor": "Dircab"
  },
  {
    "no": 12,
    "name": "Sepeda Listrik",
    "quantity": 5,
    "donor": "Dircab"
  },
  {
    "no": 13,
    "name": "Sepeda MTB",
    "quantity": 10,
    "donor": "Dircab"
  },
  {
    "no": 14,
    "name": "Kulkas Polytron 1 pintu",
    "quantity": 3,
    "donor": "Dircab"
  },
  {
    "no": 15,
    "name": "Mesin cuci",
    "quantity": 2,
    "donor": "Dircab"
  },
  {
    "no": 16,
    "name": "Kulkas 2 pintu LG",
    "quantity": 2,
    "donor": "Dircab"
  },
  {
    "no": 17,
    "name": "Tv LG 43\"",
    "quantity": 3,
    "donor": "Dircab"
  },
  {
    "no": 18,
    "name": "Tv Polytron 32\"",
    "quantity": 3,
    "donor": "Kolonel Czi Yusa"
  },
  {
    "no": 19,
    "name": "Motor Honda Beat Cbs",
    "quantity": 1,
    "donor": "Dirbinsat"
  },
  {
    "no": 20,
    "name": "Tv Polytron 32\"",
    "quantity": 3,
    "donor": "Dirbinsat"
  },
  {
    "no": 21,
    "name": "Kulkas 1 Pintu Aqua",
    "quantity": 2,
    "donor": "Dirbinsat"
  },
  {
    "no": 22,
    "name": "Mesin cuci 2 Tabung Panasonic",
    "quantity": 1,
    "donor": "Dirbinsat"
  },
  {
    "no": 23,
    "name": "Sepeda MTB",
    "quantity": 4,
    "donor": "PT. Vadel KSI"
  },
  {
    "no": 24,
    "name": "Sepeda Listrik",
    "quantity": 1,
    "donor": "Yonzikon 13/KE"
  },
  {
    "no": 25,
    "name": "Televisi 32\" LED Sharp",
    "quantity": 1,
    "donor": "Yonzikon 13/KE"
  },
  {
    "no": 26,
    "name": "Sepeda MTB",
    "quantity": 1,
    "donor": "Yonzikon 13/KE"
  },
  {
    "no": 27,
    "name": "Tv Xiaomi 32\"",
    "quantity": 2,
    "donor": "Pusdikzi"
  },
  {
    "no": 28,
    "name": "Mesin Cuci",
    "quantity": 1,
    "donor": "Menzikon"
  },
  {
    "no": 29,
    "name": "Mesin Cuci",
    "quantity": 1,
    "donor": "Yonzikon 14"
  },
  {
    "no": 30,
    "name": "TV 32 Inch",
    "quantity": 2,
    "donor": "Yonzikon 14"
  },
  {
    "no": 31,
    "name": "LM 1 gr",
    "quantity": 5,
    "donor": "Ketua Persit KCK Koorcab"
  },
  {
    "no": 32,
    "name": "LM 2 gr",
    "quantity": 6,
    "donor": "Ketua Persit KCK Koorcab"
  },
  {
    "no": 33,
    "name": "Kulkas 1 Pintu",
    "quantity": 1,
    "donor": "Balakada"
  },
  {
    "no": 34,
    "name": "TV 32 Inch",
    "quantity": 2,
    "donor": "Balakada"
  },
  {
    "no": 35,
    "name": "Mesin Cuci 2 Tabung",
    "quantity": 1,
    "donor": "Balakada"
  },
  {
    "no": 36,
    "name": "Sepeda Listrik",
    "quantity": 2,
    "donor": "Dirkonbang"
  },
  {
    "no": 37,
    "name": "Kulkas 1 Pintu",
    "quantity": 2,
    "donor": "Menzikon"
  },
  {
    "no": 38,
    "name": "Motor Honda Beat",
    "quantity": 1,
    "donor": "Dircab"
  }
];

export const DOORPRIZE_GRADE_B: DoorprizeItem[] = [
  {
    "no": 1,
    "name": "Magic com miyako",
    "quantity": 10,
    "donor": "Dirbinfasjasa"
  },
  {
    "no": 2,
    "name": "Blender Miyako",
    "quantity": 10,
    "donor": "Dirbinfasjasa"
  },
  {
    "no": 3,
    "name": "Kipas angin Cosmos",
    "quantity": 10,
    "donor": "Dirbinfasjasa"
  },
  {
    "no": 4,
    "name": "Setrika Maspion",
    "quantity": 10,
    "donor": "Dirbinfasjasa"
  },
  {
    "no": 5,
    "name": "Handuk",
    "quantity": 20,
    "donor": "Dirbinfasjasa"
  },
  {
    "no": 6,
    "name": "Air Puri fire Toshiba",
    "quantity": 2,
    "donor": "Dircab"
  },
  {
    "no": 7,
    "name": "Rice cooker Kris",
    "quantity": 5,
    "donor": "Dircab"
  },
  {
    "no": 8,
    "name": "Kipas angin Krisbow (Portable)",
    "quantity": 5,
    "donor": "Dircab"
  },
  {
    "no": 9,
    "name": "Kompor Gas Rinnai 2 Tungku",
    "quantity": 2,
    "donor": "Dircab"
  },
  {
    "no": 10,
    "name": "Pemanas air infico",
    "quantity": 3,
    "donor": "Dircab"
  },
  {
    "no": 11,
    "name": "Setrika Krisbow",
    "quantity": 5,
    "donor": "Dircab"
  },
  {
    "no": 12,
    "name": "Rice cooker Philips dan Thosiba",
    "quantity": 4,
    "donor": "Dircab"
  },
  {
    "no": 13,
    "name": "Microwave Sharp",
    "quantity": 2,
    "donor": "Dircab"
  },
  {
    "no": 14,
    "name": "Setrika Philips",
    "quantity": 10,
    "donor": "Dircab"
  },
  {
    "no": 15,
    "name": "Spray mop",
    "quantity": 4,
    "donor": "Dircab"
  },
  {
    "no": 16,
    "name": "Pisau dapur",
    "quantity": 6,
    "donor": "Dircab"
  },
  {
    "no": 17,
    "name": "Chopper",
    "quantity": 11,
    "donor": "Dircab"
  },
  {
    "no": 18,
    "name": "Hair dryer",
    "quantity": 5,
    "donor": "Dircab"
  },
  {
    "no": 19,
    "name": "Pemans air",
    "quantity": 10,
    "donor": "Dircab"
  },
  {
    "no": 20,
    "name": "Pemanggang roti",
    "quantity": 10,
    "donor": "Dircab"
  },
  {
    "no": 21,
    "name": "Hair Dryer",
    "quantity": 8,
    "donor": "Dircab"
  },
  {
    "no": 22,
    "name": "Rice Cooker",
    "quantity": 15,
    "donor": "Dirbinsat"
  },
  {
    "no": 23,
    "name": "Blender Cosmos, welhome dan Renrei",
    "quantity": 20,
    "donor": "Dirbinsat"
  },
  {
    "no": 24,
    "name": "Kompor Gas Rinnai 2 Tungku",
    "quantity": 10,
    "donor": "Dirbinsat"
  },
  {
    "no": 25,
    "name": "Vacum cleaner",
    "quantity": 5,
    "donor": "Dirbinsat"
  },
  {
    "no": 26,
    "name": "Kipas angin Stand",
    "quantity": 10,
    "donor": "Dirbinsat"
  },
  {
    "no": 27,
    "name": "Kipas angin dinding",
    "quantity": 5,
    "donor": "Dirbinsat"
  },
  {
    "no": 28,
    "name": "Kipas angin meja",
    "quantity": 10,
    "donor": "Dirbinsat"
  },
  {
    "no": 29,
    "name": "Setrika Philips",
    "quantity": 20,
    "donor": "Dirbinsat"
  },
  {
    "no": 30,
    "name": "Dispenser kecil Sanex",
    "quantity": 3,
    "donor": "Yonzikon 13/KE"
  },
  {
    "no": 31,
    "name": "Magic Com Miyako",
    "quantity": 3,
    "donor": "Yonzikon 13/KE"
  },
  {
    "no": 32,
    "name": "Seterika Miyako",
    "quantity": 3,
    "donor": "Yonzikon 13/KE"
  },
  {
    "no": 33,
    "name": "Blender Miyako",
    "quantity": 3,
    "donor": "Yonzikon 13/KE"
  },
  {
    "no": 34,
    "name": "Kipas Angin (sstand)",
    "quantity": 3,
    "donor": "Yonzikon 13/KE"
  },
  {
    "no": 35,
    "name": "Kipas Angin",
    "quantity": 11,
    "donor": "Bu Atun Mitra Pusziad"
  },
  {
    "no": 36,
    "name": "Dispenser",
    "quantity": 11,
    "donor": "Bu Atun Mitra Pusziad"
  },
  {
    "no": 37,
    "name": "Payung",
    "quantity": 12,
    "donor": "Bu Atun Mitra Pusziad"
  },
  {
    "no": 38,
    "name": "Setrika",
    "quantity": 10,
    "donor": "Bu Atun Mitra Pusziad"
  },
  {
    "no": 39,
    "name": "Jam Dinding",
    "quantity": 11,
    "donor": "Bu Atun Mitra Pusziad"
  },
  {
    "no": 40,
    "name": "Tumbler",
    "quantity": 15,
    "donor": "Bu Atun Mitra Pusziad"
  },
  {
    "no": 41,
    "name": "Blender",
    "quantity": 11,
    "donor": "Bu Atun Mitra Pusziad"
  },
  {
    "no": 42,
    "name": "Kompor",
    "quantity": 17,
    "donor": "Pusdikzi"
  },
  {
    "no": 43,
    "name": "Kompor Gas 1 Tungku",
    "quantity": 2,
    "donor": "Pusdikzi"
  },
  {
    "no": 44,
    "name": "Kompor Portable",
    "quantity": 2,
    "donor": "Pusdikzi"
  },
  {
    "no": 45,
    "name": "Dispenser Galon Bawah",
    "quantity": 1,
    "donor": "Pusdikzi"
  },
  {
    "no": 46,
    "name": "Dispenser Galon Atas",
    "quantity": 3,
    "donor": "Pusdikzi"
  },
  {
    "no": 47,
    "name": "Blender",
    "quantity": 3,
    "donor": "Pusdikzi"
  },
  {
    "no": 48,
    "name": "Smartwacth",
    "quantity": 4,
    "donor": "Pusdikzi"
  },
  {
    "no": 49,
    "name": "Helm",
    "quantity": 1,
    "donor": "Pusdikzi"
  },
  {
    "no": 50,
    "name": "Tas Kerja/ Laptop",
    "quantity": 3,
    "donor": "Pusdikzi"
  },
  {
    "no": 51,
    "name": "Panggang Roti",
    "quantity": 4,
    "donor": "Pusdikzi"
  },
  {
    "no": 52,
    "name": "Jas hujan",
    "quantity": 5,
    "donor": "Pusdikzi"
  },
  {
    "no": 53,
    "name": "Payung",
    "quantity": 5,
    "donor": "Pusdikzi"
  },
  {
    "no": 54,
    "name": "Tempat makan (Food Container)",
    "quantity": 5,
    "donor": "Pusdikzi"
  },
  {
    "no": 55,
    "name": "Handuk",
    "quantity": 10,
    "donor": "Pusdikzi"
  },
  {
    "no": 56,
    "name": "Dispenser Galon Atas",
    "quantity": 50,
    "donor": "Bu Desi"
  },
  {
    "no": 57,
    "name": "Kipas Angin Standing",
    "quantity": 50,
    "donor": "Bu Desi"
  },
  {
    "no": 58,
    "name": "Setrika",
    "quantity": 60,
    "donor": "Bu Desi"
  },
  {
    "no": 59,
    "name": "Magic Com",
    "quantity": 30,
    "donor": "Bu Desi"
  },
  {
    "no": 60,
    "name": "Blender",
    "quantity": 10,
    "donor": "Bu Desi"
  },
  {
    "no": 61,
    "name": "Dispenser",
    "quantity": 15,
    "donor": "Kalabzi"
  },
  {
    "no": 62,
    "name": "Kompor",
    "quantity": 17,
    "donor": "Gudpuszi"
  },
  {
    "no": 63,
    "name": "Kompor Gas",
    "quantity": 3,
    "donor": "Yonzikon 14"
  },
  {
    "no": 64,
    "name": "Teko Listrik",
    "quantity": 2,
    "donor": "Yonzikon 14"
  },
  {
    "no": 65,
    "name": "Hp",
    "quantity": 1,
    "donor": "Yonzikon 14"
  },
  {
    "no": 66,
    "name": "Dispenser",
    "quantity": 1,
    "donor": "Yonzikon 14"
  },
  {
    "no": 67,
    "name": "Mixer",
    "quantity": 2,
    "donor": "Yonzikon 14"
  },
  {
    "no": 68,
    "name": "Kipas Angin Standing",
    "quantity": 3,
    "donor": "Yonzikon 14"
  },
  {
    "no": 69,
    "name": "Setrika",
    "quantity": 1,
    "donor": "Yonzikon 14"
  },
  {
    "no": 70,
    "name": "Rice Cooker",
    "quantity": 2,
    "donor": "Yonzikon 14"
  },
  {
    "no": 71,
    "name": "Spinmop Alat Pel Putar",
    "quantity": 2,
    "donor": "Yonzikon 14"
  },
  {
    "no": 72,
    "name": "Blander",
    "quantity": 2,
    "donor": "Yonzikon 14"
  },
  {
    "no": 73,
    "name": "Alat pijat Terapi",
    "quantity": 2,
    "donor": "Dirbinkonbang"
  },
  {
    "no": 74,
    "name": "Airfryer Xiaomi",
    "quantity": 6,
    "donor": "Fasjasa"
  },
  {
    "no": 75,
    "name": "Robot Facum Xiaomi",
    "quantity": 4,
    "donor": "Fasjasa"
  },
  {
    "no": 76,
    "name": "Kompor Induksi Modena",
    "quantity": 4,
    "donor": "Fasjasa"
  },
  {
    "no": 77,
    "name": "Head Set Sound Core",
    "quantity": 6,
    "donor": "Fasjasa"
  },
  {
    "no": 78,
    "name": "Air purifier Leka Ap 7707",
    "quantity": 4,
    "donor": "Fasjasa"
  },
  {
    "no": 79,
    "name": "Hair dryer Philips",
    "quantity": 1,
    "donor": "Fasjasa"
  },
  {
    "no": 80,
    "name": "Magicom Cosmos 2 L",
    "quantity": 1,
    "donor": "Fasjasa"
  },
  {
    "no": 81,
    "name": "Stand Mixer Miyako",
    "quantity": 1,
    "donor": "Fasjasa"
  },
  {
    "no": 82,
    "name": "Philips Iron Diva",
    "quantity": 1,
    "donor": "Fasjasa"
  },
  {
    "no": 83,
    "name": "Kiirin Wafle Toaster",
    "quantity": 1,
    "donor": "Fasjasa"
  },
  {
    "no": 84,
    "name": "Setrika Kiirin",
    "quantity": 1,
    "donor": "Fasjasa"
  },
  {
    "no": 85,
    "name": "Hand Blander Cosmos",
    "quantity": 1,
    "donor": "Fasjasa"
  },
  {
    "no": 86,
    "name": "Samono Air Fryer 3,5 L",
    "quantity": 1,
    "donor": "Fasjasa"
  },
  {
    "no": 87,
    "name": "Philips Dry Iron",
    "quantity": 1,
    "donor": "Fasjasa"
  },
  {
    "no": 88,
    "name": "Voucher menginap di Cabin Hotel",
    "quantity": 15,
    "donor": "Fasjasa"
  },
  {
    "no": 89,
    "name": "Rice Cooker",
    "quantity": 10,
    "donor": "Balakada"
  },
  {
    "no": 90,
    "name": "Blender",
    "quantity": 10,
    "donor": "Balakada"
  },
  {
    "no": 91,
    "name": "Kompor 2 Tungku",
    "quantity": 10,
    "donor": "Balakada"
  },
  {
    "no": 92,
    "name": "Setrika",
    "quantity": 10,
    "donor": "Balakada"
  },
  {
    "no": 93,
    "name": "Vakum Cleaner",
    "quantity": 5,
    "donor": "Balakada"
  },
  {
    "no": 94,
    "name": "Kipas Angin Berdiri",
    "quantity": 5,
    "donor": "Balakada"
  },
  {
    "no": 95,
    "name": "Kipas angin dinding",
    "quantity": 5,
    "donor": "Balakada"
  },
  {
    "no": 96,
    "name": "Kipas Angin Meja",
    "quantity": 5,
    "donor": "Balakada"
  },
  {
    "no": 97,
    "name": "Mangkok",
    "quantity": 20,
    "donor": "Bengpuszi"
  },
  {
    "no": 98,
    "name": "Panci",
    "quantity": 18,
    "donor": "Bengpuszi"
  },
  {
    "no": 99,
    "name": "Teko",
    "quantity": 10,
    "donor": "Bengpuszi"
  },
  {
    "no": 100,
    "name": "Panci Susu",
    "quantity": 20,
    "donor": "Bengpuszi"
  },
  {
    "no": 101,
    "name": "Jam Dinding",
    "quantity": 10,
    "donor": "Bengpuszi"
  }
];

export const ALL_DOORPRIZE_ITEMS: (DoorprizeItem & { grade: "A" | "B" })[] = [
  ...DOORPRIZE_GRADE_A.map(item => ({ ...item, grade: "A" as const })),
  ...DOORPRIZE_GRADE_B.map(item => ({ ...item, grade: "B" as const })),
];
