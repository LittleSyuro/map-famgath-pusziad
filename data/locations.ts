export interface LocationItem {
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

export const CATEGORIES = [
  "Area Depan & Fasilitas Utama",
  "Area Danau & Ballroom",
  "Area Berkuda & Equestrian",
  "Area Outbound & Infinity Pool",
  "Area Sundanese & Wooden House",
  "Area Archery & Rekreasi",
  "Area Lobby & Hiburan Indoor",
  "Area Golf & Mongolian Superior",
  "Area Waterboom & Wahana Outbound",
  "Area Mongolian Camp & Kebun Bunga",
  "Area Apache Camp & Barrack"
] as const;

export const LOCATIONS: LocationItem[] = [
  {
    "id": "1",
    "number": "1",
    "name": "Welcome Gate",
    "image": "/legend/01_Welcome_Gate.png",
    "category": "Area Depan & Fasilitas Utama",
    "description": "Fasilitas Welcome Gate di The Highland Park Resort - Hotel Bogor.",
    "mapX": 77.0,
    "mapY": 32.0
  },
  {
    "id": "1a",
    "number": "1",
    "suffix": "a",
    "name": "Pos Security",
    "image": "/legend/01a_Pos_Security.png",
    "category": "Area Depan & Fasilitas Utama",
    "description": "Fasilitas Pos Security di The Highland Park Resort - Hotel Bogor.",
    "mapX": 75.8,
    "mapY": 30.8
  },
  {
    "id": "2",
    "number": "2",
    "name": "Kopi Hip",
    "image": "/resort_media/kopi_hip/Foto/DSCF0423.jpg",
    "category": "Area Depan & Fasilitas Utama",
    "description": "Fasilitas Kopi Hip di The Highland Park Resort - Hotel Bogor.",
    "mapX": 75.5,
    "mapY": 29.5
  },
  {
    "id": "3",
    "number": "3",
    "name": "Hutan Pinus",
    "image": "/legend/03_Hutan_Pinus.png",
    "category": "Area Depan & Fasilitas Utama",
    "description": "Fasilitas Hutan Pinus di The Highland Park Resort - Hotel Bogor.",
    "mapX": 13,
    "mapY": 86
  },
  {
    "id": "4",
    "number": "4",
    "name": "Masjid",
    "image": "/legend/04_Masjid.png",
    "category": "Area Depan & Fasilitas Utama",
    "description": "Fasilitas Masjid di The Highland Park Resort - Hotel Bogor.",
    "mapX": 80.0,
    "mapY": 33.2
  },
  {
    "id": "5",
    "number": "5",
    "name": "Himart Depan Hotel",
    "image": "/legend/05_Himart_Depan_Hotel.png",
    "category": "Area Depan & Fasilitas Utama",
    "description": "Fasilitas Himart Depan Hotel di The Highland Park Resort - Hotel Bogor.",
    "mapX": 14.5,
    "mapY": 77
  },
  {
    "id": "6",
    "number": "6",
    "name": "Danau",
    "image": "/legend/06_Danau.png",
    "category": "Area Danau & Ballroom",
    "description": "Fasilitas Danau di The Highland Park Resort - Hotel Bogor.",
    "mapX": 69.5,
    "mapY": 44.5
  },
  {
    "id": "7",
    "number": "7",
    "name": "Grand Ballroom",
    "image": "/legend/07_Grand_Ballroom.png",
    "category": "Area Danau & Ballroom",
    "description": "Fasilitas Grand Ballroom di The Highland Park Resort - Hotel Bogor.",
    "mapX": 87.7,
    "mapY": 29.5
  },
  {
    "id": "8",
    "number": "8",
    "name": "Dorm",
    "image": "/legend/08_Dorm.png",
    "category": "Area Danau & Ballroom",
    "description": "Fasilitas Dorm di The Highland Park Resort - Hotel Bogor.",
    "mapX": 24.5,
    "mapY": 78.5
  },
  {
    "id": "9",
    "number": "9",
    "name": "Highland Equestrian Club",
    "image": "/legend/09_Highland_Equestrian_Club.png",
    "category": "Area Berkuda & Equestrian",
    "description": "Fasilitas Highland Equestrian Club di The Highland Park Resort - Hotel Bogor.",
    "mapX": 83,
    "mapY": 13.5
  },
  {
    "id": "10",
    "number": "10",
    "name": "Lapangan Berkuda",
    "image": "/legend/10_Lapangan_Berkuda.png",
    "category": "Area Berkuda & Equestrian",
    "description": "Fasilitas Lapangan Berkuda di The Highland Park Resort - Hotel Bogor.",
    "mapX": 85.5,
    "mapY": 14
  },
  {
    "id": "11",
    "number": "11",
    "name": "Peternakan",
    "image": "/legend/11_Peternakan.png",
    "category": "Area Berkuda & Equestrian",
    "description": "Fasilitas Peternakan di The Highland Park Resort - Hotel Bogor.",
    "mapX": 88,
    "mapY": 14.5
  },
  {
    "id": "12",
    "number": "12",
    "name": "Lapangan Helipad",
    "image": "/legend/12_Lapangan_Helipad.png",
    "category": "Area Berkuda & Equestrian",
    "description": "Fasilitas Lapangan Helipad di The Highland Park Resort - Hotel Bogor.",
    "mapX": 82.0,
    "mapY": 16.9
  },
  {
    "id": "13",
    "number": "13",
    "name": "Low Rope Geobound",
    "image": "/legend/13_Low_Rope_Geobound.png",
    "category": "Area Outbound & Infinity Pool",
    "description": "Fasilitas Low Rope Geobound di The Highland Park Resort - Hotel Bogor.",
    "mapX": 65,
    "mapY": 27.5
  },
  {
    "id": "14",
    "number": "14",
    "name": "Tangga Spot Foto Bersama (Samping Kolam)",
    "image": "/resort_media/spots/foto_bersama_jembatan.jpg",
    "category": "Titik Akhir & Spot Foto Bersama",
    "description": "Area tangga samping kolam renang / waterboom, spot foto bersama seluruh keluarga besar rombongan Famgath Pusziad.",
    "mapX": 54.1,
    "mapY": 43.5
  },
  {
    "id": "15",
    "number": "15",
    "name": "Invisible Bridge",
    "image": "/legend/15_Invisible_Bridge.png",
    "category": "Area Outbound & Infinity Pool",
    "description": "Fasilitas Invisible Bridge (Jembatan Kaca) di The Highland Park Resort - Hotel Bogor.",
    "mapX": 54.0,
    "mapY": 47.0
  },
  {
    "id": "16",
    "number": "16",
    "name": "Spider Web",
    "image": "/legend/16_Spider_Web.png",
    "category": "Area Outbound & Infinity Pool",
    "description": "Fasilitas Spider Web di The Highland Park Resort - Hotel Bogor.",
    "mapX": 66.5,
    "mapY": 26
  },
  {
    "id": "17",
    "number": "17",
    "name": "Playground Geobound",
    "image": "/legend/17_Playground_Geobound.png",
    "category": "Area Outbound & Infinity Pool",
    "description": "Fasilitas Playground Geobound di The Highland Park Resort - Hotel Bogor.",
    "mapX": 67.5,
    "mapY": 28
  },
  {
    "id": "18",
    "number": "18",
    "name": "Cafe Infinity",
    "image": "/legend/18_Cafe_Infinity.png",
    "category": "Area Outbound & Infinity Pool",
    "description": "Fasilitas Cafe Infinity di The Highland Park Resort - Hotel Bogor.",
    "mapX": 56.5,
    "mapY": 48
  },
  {
    "id": "19",
    "number": "19",
    "name": "Infinity Pool",
    "image": "/legend/19_Infinity_Pool.png",
    "category": "Area Outbound & Infinity Pool",
    "description": "Fasilitas Infinity Pool di The Highland Park Resort - Hotel Bogor.",
    "mapX": 55.5,
    "mapY": 46.5
  },
  {
    "id": "20",
    "number": "20",
    "name": "Noah Ark",
    "image": "/legend/20_Noah_Ark.png",
    "category": "Area Outbound & Infinity Pool",
    "description": "Fasilitas Noah Ark di The Highland Park Resort - Hotel Bogor.",
    "mapX": 72,
    "mapY": 16.5
  },
  {
    "id": "21",
    "number": "21",
    "name": "Sundanese",
    "image": "/legend/21_Sundanese.png",
    "category": "Area Sundanese & Wooden House",
    "description": "Fasilitas Sundanese di The Highland Park Resort - Hotel Bogor.",
    "mapX": 83.5,
    "mapY": 28.5
  },
  {
    "id": "22",
    "number": "22",
    "name": "Aula Sundanese",
    "image": "/legend/22_Aula_Sundanese.png",
    "category": "Area Sundanese & Wooden House",
    "description": "Fasilitas Aula Sundanese di The Highland Park Resort - Hotel Bogor.",
    "mapX": 82.5,
    "mapY": 30
  },
  {
    "id": "23",
    "number": "23",
    "name": "Barrack Sundanese",
    "image": "/legend/23_Barrack_Sundanese.png",
    "category": "Area Sundanese & Wooden House",
    "description": "Fasilitas Barrack Sundanese di The Highland Park Resort - Hotel Bogor.",
    "mapX": 84.5,
    "mapY": 27
  },
  {
    "id": "24",
    "number": "24",
    "name": "The Cave",
    "image": "/legend/24_The_Cave.png",
    "category": "Area Sundanese & Wooden House",
    "description": "Fasilitas The Cave di The Highland Park Resort - Hotel Bogor.",
    "mapX": 64.0,
    "mapY": 17.5
  },
  {
    "id": "25",
    "number": "25",
    "name": "Alpine House",
    "image": "/legend/25_Alpine_House.png",
    "category": "Area Sundanese & Wooden House",
    "description": "Fasilitas Alpine House di The Highland Park Resort - Hotel Bogor.",
    "mapX": 58.5,
    "mapY": 22.5
  },
  {
    "id": "26",
    "number": "26",
    "name": "Aula Bata Merah",
    "image": "/legend/26_Aula_Bata_Merah.png",
    "category": "Area Sundanese & Wooden House",
    "description": "Fasilitas Aula Bata Merah di The Highland Park Resort - Hotel Bogor.",
    "mapX": 29.5,
    "mapY": 66
  },
  {
    "id": "27",
    "number": "27",
    "name": "Wooden House",
    "image": "/legend/27_Wooden_House.png",
    "category": "Area Sundanese & Wooden House",
    "description": "Fasilitas Wooden House di The Highland Park Resort - Hotel Bogor.",
    "mapX": 26.5,
    "mapY": 68.5
  },
  {
    "id": "28",
    "number": "28",
    "name": "Resto Wooden",
    "image": "/resort_media/resto_wooden/FOTO/Resto Wooden 1.jpg",
    "category": "Area Sundanese & Wooden House",
    "description": "Fasilitas Resto Wooden di The Highland Park Resort - Hotel Bogor.",
    "mapX": 25.5,
    "mapY": 70
  },
  {
    "id": "29",
    "number": "29",
    "name": "Jerami House",
    "image": "/legend/29_Jerami_House.png",
    "category": "Area Sundanese & Wooden House",
    "description": "Fasilitas Jerami House di The Highland Park Resort - Hotel Bogor.",
    "mapX": 30.5,
    "mapY": 65
  },
  {
    "id": "30",
    "number": "30",
    "name": "Camping Ground",
    "image": "/legend/30_Camping_Ground.png",
    "category": "Area Sundanese & Wooden House",
    "description": "Fasilitas Camping Ground di The Highland Park Resort - Hotel Bogor.",
    "mapX": 33,
    "mapY": 62
  },
  {
    "id": "31",
    "number": "31",
    "name": "Archery",
    "image": "/legend/31_Archery.png",
    "category": "Area Archery & Rekreasi",
    "description": "Fasilitas Archery di The Highland Park Resort - Hotel Bogor.",
    "mapX": 49,
    "mapY": 52
  },
  {
    "id": "32",
    "number": "32",
    "name": "Shooting Target",
    "image": "/legend/32_Shooting_Target.png",
    "category": "Area Archery & Rekreasi",
    "description": "Fasilitas Shooting Target di The Highland Park Resort - Hotel Bogor.",
    "mapX": 51,
    "mapY": 50
  },
  {
    "id": "33",
    "number": "33",
    "name": "Mako",
    "image": "/legend/33_Mako.png",
    "category": "Area Archery & Rekreasi",
    "description": "Fasilitas Mako di The Highland Park Resort - Hotel Bogor.",
    "mapX": 52,
    "mapY": 48
  },
  {
    "id": "34",
    "number": "34",
    "name": "Pos Security",
    "image": "/legend/34_Pos_Security.png",
    "category": "Area Depan & Fasilitas Utama",
    "description": "Fasilitas Pos Security di The Highland Park Resort - Hotel Bogor.",
    "mapX": 71,
    "mapY": 37
  },
  {
    "id": "35",
    "number": "35",
    "name": "Hi Mart Dalam Hotel",
    "image": "/legend/35_Hi_Mart_Dalam_Hotel.png",
    "category": "Area Archery & Rekreasi",
    "description": "Fasilitas Hi Mart Dalam Hotel di The Highland Park Resort - Hotel Bogor.",
    "mapX": 64.5,
    "mapY": 42
  },
  {
    "id": "36",
    "number": "36",
    "name": "Lobby",
    "image": "/legend/36_Lobby.png",
    "category": "Area Lobby & Hiburan Indoor",
    "description": "Fasilitas Lobby di The Highland Park Resort - Hotel Bogor.",
    "mapX": 65.5,
    "mapY": 41
  },
  {
    "id": "36a",
    "number": "36",
    "suffix": "a",
    "name": "Resto Anthurium Lt. 2",
    "image": "/resort_media/anthurium/DSCF3443.jpg",
    "category": "Area Lobby & Hiburan Indoor",
    "description": "Fasilitas Resto Anthurium Lantai 2 di The Highland Park Resort - Hotel Bogor.",
    "mapX": 60.8,
    "mapY": 50.0
  },
  {
    "id": "36b",
    "number": "36",
    "suffix": "b",
    "name": "Mountain Lounge",
    "image": "/resort_media/mountain_lounge/Foto/SKY LOUNGE RESTAURANT.jpg",
    "category": "Area Lobby & Hiburan Indoor",
    "description": "Fasilitas Mountain Lounge di The Highland Park Resort - Hotel Bogor.",
    "mapX": 67,
    "mapY": 40
  },
  {
    "id": "37",
    "number": "37",
    "name": "Bicycle Rental",
    "image": "/legend/37_Bicycle_Rental.png",
    "category": "Area Lobby & Hiburan Indoor",
    "description": "Fasilitas Bicycle Rental di The Highland Park Resort - Hotel Bogor.",
    "mapX": 68,
    "mapY": 42
  },
  {
    "id": "38",
    "number": "38",
    "name": "Danau Love",
    "image": "/legend/38_Danau_Love.png",
    "category": "Area Danau & Ballroom",
    "description": "Fasilitas Danau Love di The Highland Park Resort - Hotel Bogor.",
    "mapX": 70.5,
    "mapY": 45
  },
  {
    "id": "39",
    "number": "39",
    "name": "Game Station",
    "image": "/legend/39_Game_Station.png",
    "category": "Area Lobby & Hiburan Indoor",
    "description": "Fasilitas Game Station di The Highland Park Resort - Hotel Bogor.",
    "mapX": 63.5,
    "mapY": 45
  },
  {
    "id": "39a",
    "number": "39",
    "suffix": "a",
    "name": "Kids Zone",
    "image": "/legend/39a_Kids_Zone.png",
    "category": "Area Lobby & Hiburan Indoor",
    "description": "Fasilitas Kids Zone di The Highland Park Resort - Hotel Bogor.",
    "mapX": 64,
    "mapY": 46
  },
  {
    "id": "39b",
    "number": "39",
    "suffix": "b",
    "name": "Karaoke Room",
    "image": "/legend/39b_Karaoke_Room.png",
    "category": "Area Lobby & Hiburan Indoor",
    "description": "Fasilitas Karaoke Room di The Highland Park Resort - Hotel Bogor.",
    "mapX": 64.5,
    "mapY": 44
  },
  {
    "id": "39c",
    "number": "39",
    "suffix": "c",
    "name": "Carnation Meeting Room",
    "image": "/legend/39c_Carnation_Meeting_Room.png",
    "category": "Area Lobby & Hiburan Indoor",
    "description": "Fasilitas Carnation Meeting Room di The Highland Park Resort - Hotel Bogor.",
    "mapX": 63,
    "mapY": 46.5
  },
  {
    "id": "40",
    "number": "40",
    "name": "Gert Ballroom",
    "image": "/legend/40_Gert_Ballroom.png",
    "category": "Area Danau & Ballroom",
    "description": "Fasilitas Gert Ballroom di The Highland Park Resort - Hotel Bogor.",
    "mapX": 61.5,
    "mapY": 44
  },
  {
    "id": "41",
    "number": "41",
    "name": "Mushola",
    "image": "/legend/41_Mushola.png",
    "category": "Area Lobby & Hiburan Indoor",
    "description": "Fasilitas Mushola di The Highland Park Resort - Hotel Bogor.",
    "mapX": 62,
    "mapY": 41.5
  },
  {
    "id": "42",
    "number": "42",
    "name": "Mongolian Superior Camp",
    "image": "/legend/42_Mongolian_Superior_Camp.png",
    "category": "Area Golf & Mongolian Superior",
    "description": "Fasilitas Mongolian Superior Camp di The Highland Park Resort - Hotel Bogor.",
    "mapX": 15,
    "mapY": 84
  },
  {
    "id": "43",
    "number": "43",
    "name": "Barrack Superior",
    "image": "/legend/43_Barrack_Superior.png",
    "category": "Area Golf & Mongolian Superior",
    "description": "Fasilitas Barrack Superior di The Highland Park Resort - Hotel Bogor.",
    "mapX": 17.5,
    "mapY": 86.5
  },
  {
    "id": "44",
    "number": "44",
    "name": "Golf Meeting Room",
    "image": "/legend/44_Golf_Meeting_Room.png",
    "category": "Area Golf & Mongolian Superior",
    "description": "Fasilitas Golf Meeting Room di The Highland Park Resort - Hotel Bogor.",
    "mapX": 52.5,
    "mapY": 56
  },
  {
    "id": "44a",
    "number": "44",
    "suffix": "a",
    "name": "Resto Golf",
    "image": "/legend/44a_Resto_Golf.png",
    "category": "Area Golf & Mongolian Superior",
    "description": "Fasilitas Resto Golf di The Highland Park Resort - Hotel Bogor.",
    "mapX": 53.5,
    "mapY": 57.5
  },
  {
    "id": "44b",
    "number": "44",
    "suffix": "b",
    "name": "Mini Golf",
    "image": "/legend/44b_Mini_Golf.png",
    "category": "Area Golf & Mongolian Superior",
    "description": "Fasilitas Mini Golf di The Highland Park Resort - Hotel Bogor.",
    "mapX": 50,
    "mapY": 58.5
  },
  {
    "id": "44c",
    "number": "44",
    "suffix": "c",
    "name": "Driving Range",
    "image": "/legend/44c_Driving_Range.png",
    "category": "Area Golf & Mongolian Superior",
    "description": "Fasilitas Driving Range di The Highland Park Resort - Hotel Bogor.",
    "mapX": 48,
    "mapY": 60.5
  },
  {
    "id": "45",
    "number": "45",
    "name": "Lapangan Gerbera",
    "image": "/legend/45_Lapangan_Gerbera.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Lapangan Gerbera di The Highland Park Resort - Hotel Bogor.",
    "mapX": 61,
    "mapY": 53
  },
  {
    "id": "46",
    "number": "46",
    "name": "Playground",
    "image": "/legend/46_Playground.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Playground di The Highland Park Resort - Hotel Bogor.",
    "mapX": 58,
    "mapY": 46
  },
  {
    "id": "47",
    "number": "47",
    "name": "Bundaran HL",
    "image": "/legend/47_Bundaran_HL.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Bundaran HL di The Highland Park Resort - Hotel Bogor.",
    "mapX": 70,
    "mapY": 39
  },
  {
    "id": "48",
    "number": "48",
    "name": "Waterboom",
    "image": "/legend/48_Waterboom.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Waterboom di The Highland Park Resort - Hotel Bogor.",
    "mapX": 74.5,
    "mapY": 20
  },
  {
    "id": "49",
    "number": "49",
    "name": "Lapangan Futsal",
    "image": "/legend/49_Lapangan_Futsal.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Lapangan Futsal di The Highland Park Resort - Hotel Bogor.",
    "mapX": 21,
    "mapY": 74
  },
  {
    "id": "50",
    "number": "50",
    "name": "Lapangan Kampung Ground",
    "image": "/legend/50_Lapangan_Kampung_Ground.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Lapangan Kampung Ground di The Highland Park Resort - Hotel Bogor.",
    "mapX": 35,
    "mapY": 64
  },
  {
    "id": "51",
    "number": "51",
    "name": "Mini Zoo",
    "image": "/legend/51_Mini_Zoo.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Mini Zoo di The Highland Park Resort - Hotel Bogor.",
    "mapX": 77,
    "mapY": 23
  },
  {
    "id": "52",
    "number": "52",
    "name": "Low Rope",
    "image": "/legend/52_Low_Rope.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Low Rope di The Highland Park Resort - Hotel Bogor.",
    "mapX": 66,
    "mapY": 25
  },
  {
    "id": "53",
    "number": "53",
    "name": "Tree House",
    "image": "/legend/53_Tree_House.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Tree House di The Highland Park Resort - Hotel Bogor.",
    "mapX": 67,
    "mapY": 24
  },
  {
    "id": "54",
    "number": "54",
    "name": "Lapangan Undakan",
    "image": "/legend/54_Lapangan_Undakan.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Lapangan Undakan di The Highland Park Resort - Hotel Bogor.",
    "mapX": 78.5,
    "mapY": 25
  },
  {
    "id": "55",
    "number": "55",
    "name": "Rusa",
    "image": "/legend/55_Rusa.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Rusa di The Highland Park Resort - Hotel Bogor.",
    "mapX": 76,
    "mapY": 24.5
  },
  {
    "id": "56",
    "number": "56",
    "name": "Flying Fox",
    "image": "/legend/56_Flying_Fox.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Flying Fox di The Highland Park Resort - Hotel Bogor.",
    "mapX": 73,
    "mapY": 22
  },
  {
    "id": "57",
    "number": "57",
    "name": "Saung",
    "image": "/legend/57_Saung.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Saung di The Highland Park Resort - Hotel Bogor.",
    "mapX": 37,
    "mapY": 66.5
  },
  {
    "id": "58",
    "number": "58",
    "name": "Lapangan UPWB",
    "image": "/legend/58_Lapangan_UPWB.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Lapangan UPWB di The Highland Park Resort - Hotel Bogor.",
    "mapX": 79.5,
    "mapY": 26
  },
  {
    "id": "59",
    "number": "59",
    "name": "Zip Bike",
    "image": "/legend/59_Zip_Bike.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Zip Bike di The Highland Park Resort - Hotel Bogor.",
    "mapX": 74,
    "mapY": 23.5
  },
  {
    "id": "60",
    "number": "60",
    "name": "Pedi Cab",
    "image": "/legend/60_Pedi_Cab.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas Pedi Cab di The Highland Park Resort - Hotel Bogor.",
    "mapX": 69,
    "mapY": 41
  },
  {
    "id": "60a",
    "number": "60",
    "suffix": "a",
    "name": "View",
    "image": "/legend/60a_View.png",
    "category": "Area Waterboom & Wahana Outbound",
    "description": "Fasilitas View di The Highland Park Resort - Hotel Bogor.",
    "mapX": 71,
    "mapY": 43
  },
  {
    "id": "61",
    "number": "61",
    "name": "Mongolian Standard Camp",
    "image": "/legend/61_Mongolian_Standard_Camp.png",
    "category": "Area Mongolian Camp & Kebun Bunga",
    "description": "Fasilitas Mongolian Standard Camp di The Highland Park Resort - Hotel Bogor.",
    "mapX": 44,
    "mapY": 55
  },
  {
    "id": "62",
    "number": "62",
    "name": "Mongolian Deluxe Camp",
    "image": "/legend/62_Mongolian_Deluxe_Camp.png",
    "category": "Area Mongolian Camp & Kebun Bunga",
    "description": "Fasilitas Mongolian Deluxe Camp di The Highland Park Resort - Hotel Bogor.",
    "mapX": 45.5,
    "mapY": 53.5
  },
  {
    "id": "63",
    "number": "63",
    "name": "Gerbera Meeting Camp",
    "image": "/legend/63_Gerbera_Meeting_Camp.png",
    "category": "Area Mongolian Camp & Kebun Bunga",
    "description": "Fasilitas Gerbera Meeting Camp di The Highland Park Resort - Hotel Bogor.",
    "mapX": 46.5,
    "mapY": 52
  },
  {
    "id": "64",
    "number": "64",
    "name": "Mongolian Suite Camp",
    "image": "/legend/64_Mongolian_Suite_Camp.png",
    "category": "Area Mongolian Camp & Kebun Bunga",
    "description": "Fasilitas Mongolian Suite Camp di The Highland Park Resort - Hotel Bogor.",
    "mapX": 47.5,
    "mapY": 50.5
  },
  {
    "id": "65",
    "number": "65",
    "name": "Pos Security",
    "image": "/legend/65_Pos_Security.png",
    "category": "Area Depan & Fasilitas Utama",
    "description": "Fasilitas Pos Security di The Highland Park Resort - Hotel Bogor.",
    "mapX": 63,
    "mapY": 25
  },
  {
    "id": "66",
    "number": "66",
    "name": "Barrack Standard",
    "image": "/legend/66_Barrack_Standard.png",
    "category": "Area Mongolian Camp & Kebun Bunga",
    "description": "Fasilitas Barrack Standard di The Highland Park Resort - Hotel Bogor.",
    "mapX": 18.5,
    "mapY": 85
  },
  {
    "id": "67",
    "number": "67",
    "name": "Kebun Bunga Gerbera",
    "image": "/legend/67_Kebun_Bunga_Gerbera.png",
    "category": "Area Mongolian Camp & Kebun Bunga",
    "description": "Fasilitas Kebun Bunga Gerbera di The Highland Park Resort - Hotel Bogor.",
    "mapX": 32.5,
    "mapY": 71
  },
  {
    "id": "68",
    "number": "68",
    "name": "Kebun Sayur",
    "image": "/legend/68_Kebun_Sayur.png",
    "category": "Area Mongolian Camp & Kebun Bunga",
    "description": "Fasilitas Kebun Sayur di The Highland Park Resort - Hotel Bogor.",
    "mapX": 33.5,
    "mapY": 69.5
  },
  {
    "id": "69",
    "number": "69",
    "name": "Kebun Bunga Anthurium",
    "image": "/legend/69_Kebun_Bunga_Anthurium.png",
    "category": "Area Lobby & Hiburan Indoor",
    "description": "Fasilitas Kebun Bunga Anthurium di The Highland Park Resort - Hotel Bogor.",
    "mapX": 34.5,
    "mapY": 68
  },
  {
    "id": "70",
    "number": "70",
    "name": "Dak Aster",
    "image": "/legend/70_Dak_Aster.png",
    "category": "Area Mongolian Camp & Kebun Bunga",
    "description": "Fasilitas Dak Aster di The Highland Park Resort - Hotel Bogor.",
    "mapX": 87,
    "mapY": 24.5
  },
  {
    "id": "71",
    "number": "71",
    "name": "Aster Meeting Room",
    "image": "/legend/71_Aster_Meeting_Room.png",
    "category": "Area Mongolian Camp & Kebun Bunga",
    "description": "Fasilitas Aster Meeting Room di The Highland Park Resort - Hotel Bogor.",
    "mapX": 88.5,
    "mapY": 23.5
  },
  {
    "id": "72",
    "number": "72",
    "name": "Lapangan Apache",
    "image": "/legend/72_Lapangan_Apache.png",
    "category": "Area Apache Camp & Barrack",
    "description": "Fasilitas Lapangan Apache di The Highland Park Resort - Hotel Bogor.",
    "mapX": 58.5,
    "mapY": 23
  },
  {
    "id": "73",
    "number": "73",
    "name": "Apache Camp",
    "image": "/legend/73_Apache_Camp.png",
    "category": "Area Apache Camp & Barrack",
    "description": "Fasilitas Apache Camp di The Highland Park Resort - Hotel Bogor.",
    "mapX": 60,
    "mapY": 21.5
  },
  {
    "id": "74",
    "number": "74",
    "name": "Apache Meeting Room",
    "image": "/legend/74_Apache_Meeting_Room.png",
    "category": "Area Apache Camp & Barrack",
    "description": "Fasilitas Apache Meeting Room di The Highland Park Resort - Hotel Bogor.",
    "mapX": 61.5,
    "mapY": 20
  },
  {
    "id": "74a",
    "number": "74",
    "suffix": "a",
    "name": "Resto Apache",
    "image": "/resort_media/resto_apache/Foto/Resto Apache.JPG",
    "category": "Area Apache Camp & Barrack",
    "description": "Fasilitas Resto Apache di The Highland Park Resort - Hotel Bogor.",
    "mapX": 62.5,
    "mapY": 18.5
  },
  {
    "id": "75",
    "number": "75",
    "name": "Barrack Apache",
    "image": "/legend/75_Barrack_Apache.png",
    "category": "Area Apache Camp & Barrack",
    "description": "Fasilitas Barrack Apache di The Highland Park Resort - Hotel Bogor.",
    "mapX": 57,
    "mapY": 24
  }
];
