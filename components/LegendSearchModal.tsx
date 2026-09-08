"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { LocationItem, LOCATIONS } from "@/data/locations";
import {
  Search,
  X,
  MapPin,
  Compass,
  Building,
  Utensils,
  Trees,
  Sparkles,
  ChevronRight,
  Eye,
  Filter,
} from "lucide-react";

interface LegendSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: LocationItem) => void;
}

const CATEGORY_FILTERS = [
  { id: "all", label: "Semua (86)" },
  { id: "kamar", label: "🏨 Kamar & Camp" },
  { id: "resto", label: "🍽️ Resto & Lounge" },
  { id: "ballroom", label: "🎭 Ballroom & Aula" },
  { id: "wahana", label: "🎡 Wahana & Wisata" },
  { id: "outdoor", label: "🌲 Outbound & Olahraga" },
  { id: "fasilitas", label: "✨ Fasilitas Utama" },
];

export const LegendSearchModal: React.FC<LegendSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setSelectedIndex(0);
    } else {
      setSearchQuery("");
      setActiveCategory("all");
    }
  }, [isOpen]);

  // Filter locations
  const filteredLocations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return LOCATIONS.filter((loc) => {
      // Category filter
      if (activeCategory !== "all") {
        const catName = loc.category.toLowerCase();
        const locName = loc.name.toLowerCase();
        if (activeCategory === "kamar") {
          const isKamar =
            catName.includes("camp") ||
            catName.includes("house") ||
            catName.includes("barrack") ||
            locName.includes("camp") ||
            locName.includes("house") ||
            locName.includes("cottage") ||
            locName.includes("cave") ||
            locName.includes("barrack");
          if (!isKamar) return false;
        } else if (activeCategory === "resto") {
          const isResto =
            catName.includes("resto") ||
            locName.includes("resto") ||
            locName.includes("anthurium") ||
            locName.includes("kopi") ||
            locName.includes("dining") ||
            locName.includes("lounge");
          if (!isResto) return false;
        } else if (activeCategory === "ballroom") {
          const isBallroom =
            catName.includes("ballroom") ||
            locName.includes("ballroom") ||
            locName.includes("hall") ||
            locName.includes("aster") ||
            locName.includes("plaza");
          if (!isBallroom) return false;
        } else if (activeCategory === "wahana") {
          const isWahana =
            catName.includes("wahana") ||
            catName.includes("waterboom") ||
            catName.includes("rekreasi") ||
            locName.includes("noah") ||
            locName.includes("bridge") ||
            locName.includes("satwa") ||
            locName.includes("flying") ||
            locName.includes("archery");
          if (!isWahana) return false;
        } else if (activeCategory === "outdoor") {
          const isOutdoor =
            catName.includes("outbound") ||
            catName.includes("golf") ||
            catName.includes("berkuda") ||
            locName.includes("helipad") ||
            locName.includes("lapangan") ||
            locName.includes("pinus") ||
            locName.includes("equestrian");
          if (!isOutdoor) return false;
        } else if (activeCategory === "fasilitas") {
          const isFasilitas =
            catName.includes("utama") ||
            catName.includes("lobby") ||
            locName.includes("gate") ||
            locName.includes("masjid") ||
            locName.includes("mushola") ||
            locName.includes("security") ||
            locName.includes("parkir");
          if (!isFasilitas) return false;
        }
      }

      if (!query) return true;

      const numStr = `${loc.number}${loc.suffix || ""}`.toLowerCase();
      const nameMatch = loc.name.toLowerCase().includes(query);
      const numMatch = numStr === query || numStr.includes(query);
      const catMatch = loc.category.toLowerCase().includes(query);
      const descMatch = (loc.description || "").toLowerCase().includes(query);

      return numMatch || nameMatch || catMatch || descMatch;
    });
  }, [searchQuery, activeCategory]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredLocations.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredLocations.length - 1
        );
      } else if (e.key === "Enter") {
        if (filteredLocations[selectedIndex]) {
          e.preventDefault();
          onSelectLocation(filteredLocations[selectedIndex]);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredLocations, selectedIndex, onSelectLocation, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0b1a03]/98 rounded-3xl shadow-2xl border-2 border-lime-400/80 overflow-hidden text-white flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-200 shadow-glow-lime"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Header */}
        <div className="p-4 border-b border-lime-500/30 bg-[#142807]/90 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-butter-pill text-slate-950 font-black shadow-md">
            <Search className="w-5 h-5 text-slate-950" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Cari nomor legenda (misal: 25, 4, 36a) atau nama tempat (Resto, Ballroom, dll)..."
              className="w-full bg-[#071302] border border-lime-500/50 rounded-2xl px-4 py-3 text-sm sm:text-base font-bold text-lime-100 placeholder-lime-300/40 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-lime-800 text-lime-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-[#071302] hover:bg-rose-500 hover:text-white text-lime-300 border border-lime-500/40 transition-colors cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0e1d03] border-b border-lime-500/20 overflow-x-auto custom-scrollbar shrink-0">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-butter-pill text-slate-950 font-black shadow-md border border-amber-300"
                  : "bg-[#071302] text-lime-200 hover:bg-lime-800/60 border border-lime-500/30"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-[#091502]"
        >
          {filteredLocations.length > 0 ? (
            filteredLocations.map((loc, idx) => {
              const label = `${loc.number}${loc.suffix || ""}`;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={loc.id}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none group ${
                    isSelected
                      ? "bg-gradient-to-r from-[#173007] to-[#1e3d09] border-lime-400 text-white ring-2 ring-lime-400/40 shadow-lg scale-[1.01]"
                      : "bg-[#0d1d03]/90 border-lime-500/20 hover:border-lime-400/60 text-lime-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Number Badge */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black font-mono text-sm shadow-md border shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected
                          ? "bg-butter-pill text-slate-950 border-white shadow-glow-butter"
                          : "bg-[#071302] text-lime-300 border-lime-400/50"
                      }`}
                    >
                      #{label}
                    </div>

                    {/* Image Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#071302] border border-lime-500/30 shrink-0">
                      <Image
                        src={loc.image}
                        alt={loc.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    {/* Title & Category */}
                    <div className="space-y-0.5">
                      <div className="text-sm font-extrabold text-white flex items-center gap-2">
                        <span>{loc.name}</span>
                        {loc.mapX !== undefined && loc.mapY !== undefined && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            {loc.mapX.toFixed(0)}%, {loc.mapY.toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-lime-300/80 font-medium">
                        {loc.category}
                      </div>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        isSelected
                          ? "bg-butter-pill text-slate-950 shadow-md"
                          : "bg-lime-900/40 text-lime-300 group-hover:bg-butter-pill group-hover:text-slate-950"
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Lihat di Peta</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-lime-300/60 space-y-2">
              <Search className="w-10 h-10 mx-auto opacity-40 text-lime-400" />
              <p className="text-sm font-bold">
                Tidak ditemukan legenda dengan kata kunci &quot;{searchQuery}&quot;
              </p>
              <p className="text-xs text-lime-400/50">
                Coba cari berdasarkan nomor tempat (misal: 25, 4, 36a) atau nama fasilitas.
              </p>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-[#071302] border-t border-lime-500/30 flex items-center justify-between text-xs text-lime-300/70 shrink-0">
          <div className="flex items-center gap-2">
            <span>Ditemukan: <strong className="text-lime-200">{filteredLocations.length}</strong> titik legenda</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span>Gunakan <kbd className="px-1.5 py-0.5 rounded bg-[#142807] border border-lime-500/40 font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[#142807] border border-lime-500/40 font-mono text-[10px]">↓</kbd> untuk navigasi</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#142807] border border-lime-500/40 font-mono text-[10px]">Enter</kbd> untuk memilih</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#142807] border border-lime-500/40 font-mono text-[10px]">Esc</kbd> untuk keluar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
