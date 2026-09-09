"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { LocationItem } from "@/data/locations";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Tag,
  Share2,
  Check,
  Compass,
} from "lucide-react";

interface LocationModalProps {
  location: LocationItem | null;
  locations: LocationItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationItem) => void;
  onFocusOnMap?: (location: LocationItem) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  location,
  locations,
  isOpen,
  onClose,
  onSelectLocation,
  onFocusOnMap,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Find index for prev/next
  const currentIndex = location
    ? locations.findIndex((loc) => loc.id === location.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < locations.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      onSelectLocation(locations[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, locations, onSelectLocation]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      onSelectLocation(locations[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, locations, onSelectLocation]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Handle Share / Copy link
  const handleShare = () => {
    if (!location) return;
    const url = `${window.location.origin}${window.location.pathname}?loc=${location.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !location) return null;

  const label = `${location.number}${location.suffix || ""}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-location-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0e1d03] rounded-3xl shadow-2xl border-2 border-lime-400/60 overflow-hidden text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-lime-500/30 bg-[#142807]/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center px-3 py-1 rounded-full text-xs font-mono font-black bg-butter-pill text-slate-950 shadow-sm border border-amber-300">
              #{label}
            </span>
            <span className="text-xs uppercase tracking-wider font-extrabold text-lime-300 font-fun">
              THE HIGHLAND PARK RESORT
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              title="Salin Tautan Lokasi"
              className="p-2 rounded-full bg-[#0b1a03] hover:bg-lime-500 hover:text-slate-950 text-lime-300 border border-lime-500/40 transition-colors cursor-pointer shadow-sm"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Tutup Popup"
              className="p-2 rounded-full bg-[#0b1a03] hover:bg-rose-500 hover:text-white text-lime-200 border border-lime-500/40 transition-colors cursor-pointer shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Main Photo / Video display */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-[#142807] border-2 border-lime-500/30 shadow-xl flex items-center justify-center group">
            {location.image.endsWith(".mp4") || location.image.endsWith(".mov") ? (
              <video
                src={location.image}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-full object-cover"
              />
            ) : location.image.startsWith("/legend/") ? (
              <div className="relative w-full h-full p-4 flex items-center justify-center">
                <Image
                  src={location.image}
                  alt={location.name}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            ) : (
              <Image
                src={location.image}
                alt={location.name}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover drop-shadow-md hover:scale-105 transition-transform duration-500"
                priority
              />
            )}

            {/* Left & Right Arrow Buttons Overlay */}
            <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-20">
              {hasPrev ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  title="Lokasi Sebelumnya (Panah Kiri / ◀)"
                  className="w-10 h-10 rounded-full bg-black/80 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center border-2 border-lime-400/60 pointer-events-auto transition-all duration-200 shadow-glow-gold cursor-pointer hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>
              ) : (
                <div className="w-10" />
              )}

              {hasNext ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  title="Lokasi Berikutnya (Panah Kanan / ▶)"
                  className="w-10 h-10 rounded-full bg-black/80 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center border-2 border-lime-400/60 pointer-events-auto transition-all duration-200 shadow-glow-gold cursor-pointer hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                </button>
              ) : (
                <div className="w-10" />
              )}
            </div>
          </div>

          {/* Title & Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-lime-900/90 text-lime-200 border border-lime-400/50 shadow-sm">
                <Tag className="w-3.5 h-3.5 text-butter-300" />
                {location.category}
              </span>
              {location.mapX !== undefined && location.mapY !== undefined ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-400/50 shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Peta: {location.mapX.toFixed(1)}%, {location.mapY.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-400/50 shadow-sm">
                  <Compass className="w-3.5 h-3.5" /> Titik Peta Tersedia
                </span>
              )}
            </div>

            <h2 id="modal-location-title" className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {location.name}
            </h2>

            <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed bg-[#142807]/90 p-4 rounded-2xl border border-lime-500/30 shadow-inner">
              {location.description ||
                `Fasilitas ${location.name} bernomor ${label} yang terletak di kawasan ${location.category}, The Highland Park Resort - Hotel Bogor.`}
            </p>
          </div>

          {/* Action button */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
            {onFocusOnMap && (
              <button
                type="button"
                onClick={() => {
                  onFocusOnMap(location);
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black text-sm shadow-xl transition-all hover:scale-[1.02] cursor-pointer border border-lime-200"
              >
                <Compass className="w-4 h-4 text-slate-950" />
                <span>Fokuskan Titik di Peta</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-lime-500/30 bg-[#142807]/90 backdrop-blur-md">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!hasPrev}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
              hasPrev
                ? "text-butter-200 hover:text-white bg-[#0b1a03] hover:bg-lime-800 border border-lime-500/40 shadow-sm cursor-pointer"
                : "text-slate-500 bg-black/20 border border-white/5 opacity-40 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          <span className="text-xs text-lime-300 font-mono font-bold bg-[#0b1a03] px-3 py-1 rounded-full border border-lime-500/40">
            {currentIndex + 1} / {locations.length}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={!hasNext}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
              hasNext
                ? "text-butter-200 hover:text-white bg-[#0b1a03] hover:bg-lime-800 border border-lime-500/40 shadow-sm cursor-pointer"
                : "text-slate-500 bg-black/20 border border-white/5 opacity-40 cursor-not-allowed"
            }`}
          >
            Berikutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
