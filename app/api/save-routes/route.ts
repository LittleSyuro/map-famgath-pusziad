import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { activityId, waypoints, allRoutes } = body;

    const arrivalsFilePath = path.join(process.cwd(), "data", "arrivals.ts");
    let fileContent = await fs.readFile(arrivalsFilePath, "utf-8");

    const routesToUpdate: Record<string, any[]> = {};
    if (activityId && Array.isArray(waypoints)) {
      routesToUpdate[activityId] = waypoints;
    }
    if (allRoutes && typeof allRoutes === "object") {
      Object.assign(routesToUpdate, allRoutes);
    }

    // Update defaultWaypoints for each activity in the file content
    for (const [id, pts] of Object.entries(routesToUpdate)) {
      if (!Array.isArray(pts) || pts.length === 0) continue;

      const formattedPoints = pts
        .map((p) => `      { x: ${Number(p.x).toFixed(1)}, y: ${Number(p.y).toFixed(1)} },`)
        .join("\n");

      // Regex matching the specific item object by id and replacing its defaultWaypoints array
      const itemRegex = new RegExp(
        `(id:\\s*["']${id}["'][\\s\\S]*?defaultWaypoints:\\s*\\[)([\\s\\S]*?)(\\])`,
        "m"
      );

      if (itemRegex.test(fileContent)) {
        fileContent = fileContent.replace(
          itemRegex,
          `$1\n${formattedPoints}\n    $3`
        );
      }
    }

    await fs.writeFile(arrivalsFilePath, fileContent, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Rute berhasil disimpan permanen ke data/arrivals.ts!",
      updatedActivities: Object.keys(routesToUpdate),
    });
  } catch (error: any) {
    console.error("Error saving routes to arrivals.ts:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal menyimpan rute ke file." },
      { status: 500 }
    );
  }
}

