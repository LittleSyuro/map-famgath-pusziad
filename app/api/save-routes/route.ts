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

    // Update defaultWaypoints (or, for Jalan Santai's Anggota/PJU sub-routes,
    // WalkingRouteOption.waypoints) for each activity in the file content
    for (const [rawId, pts] of Object.entries(routesToUpdate)) {
      if (!Array.isArray(pts) || pts.length === 0) continue;

      const formattedPoints = pts
        .map((p) => `      { x: ${Number(p.x).toFixed(1)}, y: ${Number(p.y).toFixed(1)} },`)
        .join("\n");

      // "d2-jalan-santai::pju" / "d2-jalan-santai::anggota" target the
      // WalkingRouteOption entries in WALKING_ROUTES_DAY2 (field: waypoints)
      // instead of a RundownItem's defaultWaypoints.
      const subRouteMatch = rawId.match(/^d2-jalan-santai::(pju|anggota)$/);
      const id = subRouteMatch ? subRouteMatch[1] : rawId;
      const fieldName = subRouteMatch ? "waypoints" : "defaultWaypoints";

      // Regex matching the specific item object by id and replacing its waypoints array.
      // The trailing comma after the id is required so this only matches an
      // actual object literal (id: "pju",) — "pju"/"anggota" are also a TS
      // union type elsewhere (id: "pju" | "anggota";), which has no comma
      // there and must NOT match, or the lazy [\s\S]*? would span from that
      // type declaration all the way to the real waypoints array and wipe
      // out everything in between.
      const itemRegex = new RegExp(
        `(id:\\s*["']${id}["']\\s*,[\\s\\S]*?${fieldName}:\\s*\\[)([\\s\\S]*?)(\\])`,
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

