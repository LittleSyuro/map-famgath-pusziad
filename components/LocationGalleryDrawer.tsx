"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { LocationItem } from "@/data/locations";
import {
  Search,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  Compass,
  Filter,
} from "lucide-react";

interface LocationGalleryDrawerProps {
  locations: LocationItem[];
  isOpen: boolean;
  selectedLocation: LocationItem | null;
  onClose: () => void;
  onSelectLocation: (loc: LocationItem) => void;
  onFocusOnMap?: (loc: LocationItem) => void;
  onOpenFlatMapModal?: () => void;
}

const QUICK_FILTERS = [
  { id: "all", label: "Semua Fasilitas" },
  { id: "kamar", label: "Kamar & Villa", keywords: ["house", "camp", "cave", "dorm", "barrack", "villa", "superior", "deluxe"] },
  { id: "resto", label: "Resto & Dining", keywords: ["resto", "kopi", "cafe", "lounge", "food", "dining", "sky", "anthurium"] },
  { id: "wahana", label: "Wahana & Wisata", keywords: ["waterboom", "flying fox", "berkuda", "equestrian", "kelinci", "archery", "golf", "mini zoo", "danau"] },
  { id: "ballroom", label: "Ballroom & Meeting", keywords: ["ballroom", "meeting", "plenary", "hall", "lobby"] },
  { id: "fasilitas", label: "Fasilitas Umum", keywords: ["masjid", "pos", "gate", "parkir", "toilet", "himart", "medical"] },
];

export const LocationGalleryDrawer: React.FC<LocationGalleryDrawerProps> = ({
  locations,
  isOpen,
  selectedLocation,
  onClose,
  onSelectLocation,
  onFocusOnMap,
  onOpenFlatMapModal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      // 1. Quick Filter matching
      if (activeFilter !== "all") {
        const filterObj = QUICK_FILTERS.find((f) => f.id === activeFilter);
        if (filterObj && filterObj.keywords) {
          const text = `${loc.name} ${loc.category} ${loc.description || ""}`.toLowerCase();
          const match = filterObj.keywords.some((kw) => text.includes(kw));
          if (!match) return false;
        }
      }

      // 2. Search query matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const label = `${loc.number}${loc.suffix || ""}`.toLowerCase();
        const name = loc.name.toLowerCase();
        const cat = loc.category.toLowerCase();
        return label.includes(q) || name.includes(q) || cat.includes(q);
      }

      return true;
    });
  }, [locations, activeFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center select-none pointer-events-none transition-all duration-300">
      {/* Container Drawer with Pointer Events Auto */}
      <div className="pointer-events-auto w-full max-w-[98%] xl:max-w-7xl mx-auto rounded-t-3xl bg-[#081402]/95 backdrop-blur-2xl border-t-2 border-x-2 border-lime-400/80 shadow-[0_-10px_40px_rgba(0,0,0,0.7)] text-white overflow-hidden transition-all duration-300">
        
        {/* Header Bar */}
        <div className="px-4 py-2.5 bg-[#0f2305]/90 border-b border-lime-500/30 flex flex-wrap items-center justify-between gap-2.5">
          {/* Title & Badge */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-lime-500/20 border border-lime-400/60 text-lime-300">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase font-fun">
                  Galeri Lokasi & Fasilitas Resort
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 font-mono text-[11px] font-bold">
                  {filteredLocations.length} Titik
                </span>
              </div>
              <p className="text-[10px] text-slate-300 hidden sm:block">
                Klik kartu foto lokasi untuk memperbesar peta & melihat detail fasilitas
              </p>
            </div>
          </div>

          {/* Controls: Search, Open Flat Map 2D Popup & Collapse */}
          <div className="flex items-center gap-2">
            {/* Search Input Box */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-lime-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama / no..."
                className="w-32 sm:w-44 pl-8 pr-2.5 py-1 rounded-xl bg-black/60 border border-lime-400/40 text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-lime-300 focus:ring-1 focus:ring-lime-300 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Open 2D Flat Map in Popup Modal Button */}
            {onOpenFlatMapModal && (
              <button
                type="button"
                onClick={onOpenFlatMapModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 font-black text-xs border border-amber-400/50 shadow-sm transition-all cursor-pointer"
                title="Buka Peta Denah Asli / 2D Flat dalam Popup"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>🗺️ Peta Denah 2D</span>
              </button>
            )}

            {/* Expand / Collapse Height Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Kecilkan Panel" : "Perbesar Panel Galeri"}
              className="p-1.5 rounded-xl bg-lime-900/40 hover:bg-lime-800/60 border border-lime-500/40 text-lime-300 transition-colors cursor-pointer"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            {/* Close Drawer Button */}
            <button
              type="button"
              onClick={onClose}
              title="Tutup Panel Galeri"
              className="p-1.5 rounded-xl bg-black/40 hover:bg-rose-600/80 border border-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Filter Category Chips */}
        <div className="px-4 py-1.5 bg-[#091703]/80 border-b border-lime-500/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Filter className="w-3 h-3 text-lime-400 shrink-0 mr-1" />
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-black shrink-0 transition-all cursor-pointer ${
                activeFilter === f.id
                  ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md border border-amber-300"
                  : "bg-black/50 text-slate-300 hover:text-white hover:bg-lime-900/40 border border-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Cards Gallery Carousel / Grid */}
        <div
          className={`p-3 overflow-x-auto overflow-y-hidden flex items-center gap-3 custom-scrollbar transition-all duration-300 ${
            isExpanded ? "h-[320px] overflow-y-auto flex-wrap items-start" : "h-[175px]"
          }`}
        >
          {filteredLocations.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-8 text-center text-slate-400">
              <p className="text-sm font-bold text-slate-300">Tidak ada lokasi yang cocok dengan filter pencarian.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="mt-2 px-3 py-1 rounded-full bg-lime-500/20 text-lime-300 text-xs font-bold border border-lime-400/40 cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const isSelected = selectedLocation?.id === loc.id;
              const label = `${loc.number}${loc.suffix || ""}`;

              return (
                <div
                  key={`gal-item-${loc.id}`}
                  onClick={() => {
                    onSelectLocation(loc);
                    if (onFocusOnMap) onFocusOnMap(loc);
                  }}
                  className={`group relative shrink-0 w-[150px] sm:w-[170px] flex flex-col justify-between p-2 rounded-2xl bg-[#0d2004]/90 border transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 backdrop-blur-md ${
                    isSelected
                      ? "border-amber-400 ring-2 ring-amber-400/80 shadow-glow-gold bg-[#163306]"
                      : "border-lime-500/40 hover:border-lime-300 hover:bg-[#122b06]"
                  }`}
                >
                  {/* Top Header Badge */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-butter-pill text-slate-950 shadow-sm border border-amber-300">
                      #{label}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-lime-400 truncate max-w-[90px]">
                      {loc.category.replace("Area ", "")}
                    </span>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="relative w-full h-[78px] rounded-xl overflow-hidden bg-[#061002] border border-lime-500/30 flex items-center justify-center">
                    <Image
                      src={loc.image}
                      alt={loc.name}
                      fill
                      unoptimized
                      sizes="170px"
                      className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Location Title */}
                  <div className="mt-1.5 space-y-0.5">
                    <h4 className="text-xs font-black text-white line-clamp-1 group-hover:text-lime-300 transition-colors">
                      {loc.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-white/10">
                      <span className="flex items-center gap-1 text-butter-300 font-bold group-hover:text-amber-300">
                        <Sparkles className="w-2.5 h-2.5" /> Detail
                      </span>
                      {loc.mapX !== undefined && (
                        <span className="flex items-center gap-0.5 text-emerald-400 font-mono text-[9px]">
                          <MapPin className="w-2.5 h-2.5" /> Peta
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
