"use client";

import React, { useState } from "react";
import Image from "next/image";
import { LocationItem } from "@/data/locations";
import { ChevronRight, MapPin } from "lucide-react";

interface LocationMarkerProps {
  location: LocationItem;
  isSelected?: boolean;
  isHighlighted?: boolean;
  is3DMode?: boolean;
  tiltAngle?: number;
  rotateAngle?: number;
  onClick: (location: LocationItem) => void;
}

export const LocationMarker: React.FC<LocationMarkerProps> = ({
  location,
  isSelected = false,
  isHighlighted = true,
  is3DMode = false,
  tiltAngle = 50,
  rotateAngle = -25,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (location.mapX === undefined || location.mapY === undefined) {
    return null;
  }

  // Display label: e.g. "1", "1a", "39b"
  const label = `${location.number}${location.suffix || ""}`;

  // In 3D isometric mode, the marker counter-rotates (billboarding) to stand upright facing the viewer
  const transform3D = is3DMode
    ? `translate(-50%, -100%) rotateZ(${-rotateAngle}deg) rotateX(${-tiltAngle}deg) translateZ(16px) scale(${
        isSelected ? 1.3 : isHovered ? 1.2 : 1
      })`
    : `translate(-50%, -50%) scale(${isSelected ? 1.25 : isHovered ? 1.15 : 1})`;

  return (
    <div
      className={`absolute z-20 transition-all duration-200 ${
        is3DMode ? "origin-bottom" : "origin-center"
      }`}
      style={{
        left: `${location.mapX}%`,
        top: `${location.mapY}%`,
        opacity: isHighlighted ? 1 : 0.35,
        transform: transform3D,
        transformStyle: "preserve-3d",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Vertical Pin Stem & Ground Base Shadow (visible in 3D Mode) */}
      {is3DMode && (
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 pointer-events-none flex flex-col items-center">
          {/* Ground Contact Ring */}
          <div className="w-4 h-2 rounded-full bg-black/40 blur-[1px] border border-gold-500/40" />
          {/* Stem Line */}
          <div className="w-0.5 h-4 bg-gradient-to-t from-gold-600 via-amber-400 to-yellow-200 shadow-sm" />
        </div>
      )}

      {/* Marker Badge Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick(location);
        }}
        aria-label={`Lokasi ${label}: ${location.name}`}
        className={`group relative flex items-center justify-center min-w-[28px] h-[28px] px-1.5 rounded-full text-xs font-bold font-mono tracking-tight shadow-xl transition-all duration-300 border-2 cursor-pointer select-none ${
          is3DMode ? "mb-4" : ""
        } ${
          isSelected
            ? "bg-gradient-to-tr from-gold-600 via-amber-500 to-yellow-300 text-resort-950 border-white shadow-glow-gold ring-4 ring-gold-400/50 z-30"
            : isHovered
            ? "bg-gradient-to-tr from-gold-500 to-amber-400 text-resort-950 border-white shadow-lg ring-2 ring-gold-300 z-30"
            : "bg-gradient-to-tr from-resort-800 to-resort-600 text-white border-gold-400/80 hover:border-gold-300 shadow-md"
        }`}
      >
        <span className="leading-none">{label}</span>

        {/* Pulse indicator for selected or highlighted markers */}
        {isSelected && (
          <span className="absolute -inset-1 rounded-full bg-gold-400/30 animate-ping pointer-events-none" />
        )}
      </button>

      {/* Tooltip Popup on Hover */}
      {isHovered && (
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 ${
            is3DMode ? "mb-6" : "mb-2"
          } w-52 p-2.5 rounded-2xl bg-resort-950/98 text-white border border-gold-400 shadow-2xl backdrop-blur-md z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150`}
          style={{
            transformStyle: "flat",
            transform: is3DMode ? `rotateX(${tiltAngle}deg) rotateZ(${rotateAngle}deg)` : "none",
          }}
        >
          {/* Thumbnail photo */}
          <div className="relative w-full h-24 rounded-lg overflow-hidden bg-resort-900/60 mb-2 border border-gold-500/20">
            <Image
              src={location.image}
              alt={location.name}
              fill
              unoptimized
              sizes="200px"
              className="object-contain p-1"
            />
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-gold-500/90 text-resort-950 text-[10px] font-bold font-mono">
              #{label}
            </div>
          </div>

          {/* Details */}
          <div className="px-0.5">
            <p className="text-[10px] uppercase tracking-wider text-gold-400 font-medium truncate">
              {location.category}
            </p>
            <h4 className="text-xs font-bold text-white line-clamp-1">
              {location.name}
            </h4>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-300">
              <span className="flex items-center gap-1 text-gold-300">
                <MapPin className="w-3 h-3 text-gold-400" /> Klik detail
              </span>
              <ChevronRight className="w-3 h-3 text-gold-400" />
            </div>
          </div>

          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-resort-950" />
        </div>
      )}
    </div>
  );
};
