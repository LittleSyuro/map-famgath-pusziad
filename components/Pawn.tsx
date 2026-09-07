"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { VIPArrival } from "@/data/arrivals";
import { PawnAvatar } from "./PawnAvatar";
import { Crown, Sparkles, Users } from "lucide-react";

interface PawnProps {
  vip: VIPArrival;
  progress: number; // 0.0 (Titik A / Start) to 1.0 (Titik B / Destinasi)
  isWalking: boolean;
  isArrived: boolean;
  offsetIndex?: number;
  isPopupOpen: boolean;
  avatarMode?: "circle" | "squad";
  onTogglePopup: (vipId: string) => void;
}

export const Pawn: React.FC<PawnProps> = ({
  vip,
  progress,
  isWalking,
  isArrived,
  isPopupOpen,
  avatarMode = "squad",
  onTogglePopup,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate coordinates & jump height along waypoints
  const { currentX, currentY, hopY, hopScale } = useMemo(() => {
    const waypoints = vip.pathWaypoints || [];
    if (waypoints.length === 0) {
      return {
        currentX: vip.roomX,
        currentY: vip.roomY,
        hopY: 0,
        hopScale: 1,
      };
    }

    if (waypoints.length === 1 || progress <= 0) {
      return {
        currentX: waypoints[0].x,
        currentY: waypoints[0].y,
        hopY: 0,
        hopScale: 1,
      };
    }

    if (progress >= 1) {
      const lastPt = waypoints[waypoints.length - 1];
      return {
        currentX: lastPt.x,
        currentY: lastPt.y,
        hopY: 0,
        hopScale: 1,
      };
    }

    // Smooth continuous linear interpolation along multi-segment waypoint route
    const numSegments = waypoints.length - 1;
    const continuousSegment = Math.min(numSegments - 0.0001, progress * numSegments);
    const segmentIndex = Math.floor(continuousSegment);
    const segmentProgress = continuousSegment - segmentIndex;

    const p0 = waypoints[segmentIndex];
    const p1 = waypoints[segmentIndex + 1];

    const posX = p0.x + (p1.x - p0.x) * segmentProgress;
    const posY = p0.y + (p1.y - p0.y) * segmentProgress;

    return {
      currentX: posX,
      currentY: posY,
      hopY: 0,
      hopScale: 1,
    };
  }, [vip, progress]);

  return (
    <div
      className={`absolute select-none pointer-events-auto cursor-pointer transition-transform duration-75 ${
        vip.isPJU ? "z-40" : "z-30"
      }`}
      style={{
        left: `${currentX}%`,
        top: `${currentY}%`,
        transform: "translate(-50%, -50%)",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onTogglePopup(vip.id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Smooth Continuous Moving Avatar */}
      <motion.div
        className="relative flex flex-col items-center"
        animate={
          isArrived
            ? {
                y: [0, -3, 0],
                transition: { repeat: Infinity, duration: 2.8, ease: "easeInOut" },
              }
            : undefined
        }
      >
        {avatarMode === "squad" ? (
          <div className="relative flex flex-col items-center">
            {/* 4 PJU Standing Cutout (Walking animation when in motion) */}
            <motion.div
              animate={
                isWalking
                  ? {
                      y: [0, -5, 0],
                      rotate: [-1, 1, -1],
                      transition: { repeat: Infinity, duration: 0.55, ease: "easeInOut" },
                    }
                  : isArrived
                  ? {
                      y: [0, -3, 0],
                      transition: { repeat: Infinity, duration: 2.6, ease: "easeInOut" },
                    }
                  : undefined
              }
              className="relative w-28 sm:w-36 aspect-[972/658] drop-shadow-[0_10px_16px_rgba(0,0,0,0.75)] filter hover:brightness-110 transition-all cursor-pointer"
            >
              <Image
                src="/avatars/pju_squad_4.png"
                alt="4 Pimpinan PJU Pusziad"
                fill
                unoptimized
                className="object-contain"
                priority
              />
            </motion.div>

            {/* Ground shadow beneath squad */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/60 blur-[3px] pointer-events-none w-28 sm:w-32 h-4" />

            {/* PJU Tag Badge (Placed AT THE BOTTOM, high-contrast solid black text on bright gold pill) */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-black text-[11px] font-black tracking-widest uppercase shadow-2xl border-1.5 border-white ring-1 ring-black/40 flex items-center justify-center whitespace-nowrap z-20 select-none">
              <span className="text-black font-black">PJU</span>
            </div>
          </div>
        ) : (
          <>
            {/* Dynamic Ground Shadow */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 blur-[2px] pointer-events-none transition-all duration-75 w-9 h-3"
            />

            {/* Circular Avatar */}
            <PawnAvatar
              name={vip.name}
              photo={vip.photo}
              size={vip.isPJU ? 54 : 46}
              ringColor={vip.color}
              isPJU={vip.isPJU}
              isArrived={isArrived}
            />
          </>
        )}

        {/* Hover Tooltip */}
        {isHovered && !isPopupOpen && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 p-2.5 rounded-2xl bg-resort-950/98 text-white border border-lime-400 shadow-2xl backdrop-blur-md z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <span className="px-2 py-0.5 rounded-full bg-butter-pill text-slate-950 text-[10px] font-black uppercase tracking-wider">
                {avatarMode === "squad" ? "4 PIMPINAN PJU" : "PEJABAT UTAMA (PJU)"}
              </span>
            </div>

            <h4 className="text-xs font-bold text-white mt-1">
              {avatarMode === "squad"
                ? "Mayjen TNI Budi Hariswanto & Rombongan PJU"
                : vip.name}
            </h4>
            <p className="text-[10px] text-lime-300 mt-0.5">
              {isWalking ? "Sedang berjalan menuju lokasi..." : `Tiba di ${vip.mapLocationName}`}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
