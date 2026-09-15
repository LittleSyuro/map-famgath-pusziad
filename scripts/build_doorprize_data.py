import pymupdf
import re
import json

doc = pymupdf.open(r'C:\Users\AXIO\.gemini\antigravity-ide\brain\30b1cb44-0798-4664-be5d-ea483071dd2a\.user_uploaded\media_1789453338386.pdf')

def extract_from_pages(pages):
    items = []
    for p_num in pages:
        lines = [l.strip() for l in doc[p_num - 1].get_text().split('\n') if l.strip()]
        i = 0
        while i < len(lines):
            # Check if this line is an integer number (item number)
            if re.match(r'^\d+$', lines[i]):
                num = int(lines[i])
                if i + 3 < len(lines):
                    name = lines[i+1]
                    if re.match(r'^\d+$', lines[i+2]):
                        qty = int(lines[i+2])
                        donor = lines[i+3]
                        if not name.startswith('Item') and not name.startswith('Grade') and not name.startswith('Halaman') and not donor.startswith('Halaman') and not donor.startswith('Bagian'):
                            items.append({'no': num, 'name': name, 'quantity': qty, 'donor': donor})
                            i += 4
                            continue
            i += 1
    unique_items = {}
    for item in items:
        unique_items[item['no']] = item
    return [unique_items[k] for k in sorted(unique_items.keys())]

grade_a = extract_from_pages([3, 4])
grade_b = extract_from_pages([5, 6, 7, 8])

print(f"Grade A count: {len(grade_a)}, units: {sum(x['quantity'] for x in grade_a)}")
print(f"Grade B count: {len(grade_b)}, units: {sum(x['quantity'] for x in grade_b)}")

# Generate TypeScript file
ts_content = '''export interface DoorprizeItem {
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

export const DOORPRIZE_GRADE_A: DoorprizeItem[] = ''' + json.dumps(grade_a, indent=2) + ''';

export const DOORPRIZE_GRADE_B: DoorprizeItem[] = ''' + json.dumps(grade_b, indent=2) + ''';

export const ALL_DOORPRIZE_ITEMS: (DoorprizeItem & { grade: "A" | "B" })[] = [
  ...DOORPRIZE_GRADE_A.map(item => ({ ...item, grade: "A" as const })),
  ...DOORPRIZE_GRADE_B.map(item => ({ ...item, grade: "B" as const })),
];
'''

with open(r'data/doorprize.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Saved data/doorprize.ts successfully!")
