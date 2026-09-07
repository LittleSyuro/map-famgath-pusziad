"use client";

import React from "react";
import Image from "next/image";
import { LocationItem } from "@/data/locations";
import { MapPin, SearchX, Sparkles } from "lucide-react";

interface LegendGridProps {
  locations: LocationItem[];
  selectedLocation: LocationItem | null;
  onSelectLocation: (location: LocationItem) => void;
  onFocusOnMap?: (location: LocationItem) => void;
}

export const LegendGrid: React.FC<LegendGridProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onFocusOnMap,
}) => {
  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center glass-panel rounded-3xl">
        <div className="p-4 rounded-full bg-gold-500/10 text-gold-500 mb-4">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          Tidak ada fasilitas yang cocok
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
          Coba ubah kata kunci pencarian atau pilih kategori area lain.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
      {locations.map((loc) => {
        const isSelected = selectedLocation?.id === loc.id;
        const label = `${loc.number}${loc.suffix || ""}`;

        return (
          <div
            key={loc.id}
            onClick={() => onSelectLocation(loc)}
            className={`group relative flex flex-col justify-between p-3 rounded-2xl bg-white/90 dark:bg-resort-900/80 border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 legend-card-print backdrop-blur-sm ${
              isSelected
                ? "border-gold-500 ring-2 ring-gold-400/50 shadow-glow-gold bg-gold-50/50 dark:bg-resort-800"
                : "border-zinc-200/80 dark:border-resort-800/80 hover:border-gold-400/60"
            }`}
          >
            {/* Top Number Badge & Pin status */}
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-gold-500 text-resort-950 shadow-sm">
                #{label}
              </span>

              {loc.mapX !== undefined && loc.mapY !== undefined && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onFocusOnMap) onFocusOnMap(loc);
                  }}
                  title="Lihat di Peta"
                  className="p-1 rounded-full text-zinc-400 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Photo Thumbnail Container */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-resort-950/60 dark:to-resort-900/40 p-2 flex items-center justify-center border border-zinc-100 dark:border-resort-800/50">
              <Image
                src={loc.image}
                alt={loc.name}
                fill
                unoptimized
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw"
                className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Title & Category Info */}
            <div className="mt-2.5 space-y-1">
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-gold-600 dark:text-gold-400 truncate">
                {loc.category}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                {loc.name}
              </h3>
            </div>

            {/* Hover visual affordance */}
            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-resort-800/50 flex items-center justify-between text-[10px] text-zinc-400 group-hover:text-gold-500 transition-colors">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Detail
              </span>
              <span className="font-mono text-[9px]">{loc.id}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
