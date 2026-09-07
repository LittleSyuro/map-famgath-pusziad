"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, Crown, Shield } from "lucide-react";

interface PawnAvatarProps {
  name: string;
  photo?: string;
  size?: number;
  ringColor?: string;
  isPJU?: boolean;
  isArrived?: boolean;
}

export const PawnAvatar: React.FC<PawnAvatarProps> = ({
  name,
  photo,
  size = 50,
  ringColor = "#d4a949",
  isPJU = false,
  isArrived = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Generate Initials from name
  const initials = isPJU
    ? "PJU"
    : name
        .replace(/^(Mayjen|Brigjen|Kolonel|Letkol|Mayor|Kapten|TNI|AD|AL|AU|Inf)\s+/gi, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("") || "VIP";

  return (
    <div
      className="relative rounded-full flex items-center justify-center select-none transition-transform duration-300"
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Outer Glow Aura (Extra prominent for PJU) */}
      <div
        className={`absolute -inset-1.5 rounded-full blur-[3px] transition-all duration-300 ${
          isPJU
            ? "bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 opacity-90 animate-pulse"
            : isArrived
            ? "opacity-80"
            : "opacity-60"
        }`}
        style={
          !isPJU
            ? {
                backgroundColor: ringColor,
              }
            : undefined
        }
      />

      {/* Main Circular Container */}
      <div
        className={`relative w-full h-full rounded-full shadow-2xl overflow-hidden bg-resort-900 flex items-center justify-center ${
          isPJU
            ? "border-[3.5px] border-yellow-300 ring-2 ring-amber-500/80 shadow-glow-gold"
            : "border-[3px] border-white ring-1 ring-black/20"
        }`}
      >
        {photo && !imageError ? (
          <Image
            src={photo}
            alt={name}
            fill
            unoptimized
            sizes="128px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center text-white font-bold font-mono text-xs tracking-wider ${
              isPJU
                ? "bg-gradient-to-tr from-amber-700 via-yellow-600 to-amber-500 text-resort-950 font-black"
                : "bg-gradient-to-tr from-resort-950 via-resort-800 to-zinc-700"
            }`}
          >
            {initials}
          </div>
        )}
      </div>

      {/* PJU Label Badge strictly BELOW the avatar icon */}
      {isPJU && (
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-black text-[10px] font-black tracking-widest uppercase shadow-xl border-1.5 border-white ring-1 ring-black/40 flex items-center justify-center whitespace-nowrap z-20 select-none">
          <span className="text-black font-black">PJU</span>
        </div>
      )}

      {/* Star badge when arrived */}
      {isArrived && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white text-white flex items-center justify-center text-[9px] font-bold shadow-md z-20">
          ✓
        </div>
      )}
    </div>
  );
};
