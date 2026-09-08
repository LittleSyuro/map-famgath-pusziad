import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyPinpoints } = body;

    if (!keyPinpoints || typeof keyPinpoints !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid keyPinpoints payload" },
        { status: 400 }
      );
    }

    const arrivalsFilePath = path.join(process.cwd(), "data", "arrivals.ts");
    let fileContent = await fs.readFile(arrivalsFilePath, "utf-8");

    // Update coords for each pinpoint in KEY_EVENT_PINPOINTS in arrivals.ts
    for (const [id, coords] of Object.entries(keyPinpoints)) {
      const { x, y } = coords as { x: number; y: number };
      if (typeof x !== "number" || typeof y !== "number") continue;

      // Regex matching the pinpoint object by id and updating its coords: { x: ..., y: ... }
      const pinRegex = new RegExp(
        `(id:\\s*["']${id}["'][\\s\\S]*?coords:\\s*\\{\\s*x:\\s*)[0-9.]+(\\s*,\\s*y:\\s*)[0-9.]+(\\s*\\})`,
        "m"
      );

      if (pinRegex.test(fileContent)) {
        fileContent = fileContent.replace(
          pinRegex,
          `$1${Number(x).toFixed(1)}$2${Number(y).toFixed(1)}$3`
        );
      }
    }

    await fs.writeFile(arrivalsFilePath, fileContent, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Koordinat pin point berhasil disimpan permanen ke data/arrivals.ts!",
      updatedCount: Object.keys(keyPinpoints).length,
    });
  } catch (error: any) {
    console.error("Error saving pinpoints to arrivals.ts:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal menyimpan koordinat ke file." },
      { status: 500 }
    );
  }
}
