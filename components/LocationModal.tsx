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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-resort-950 rounded-3xl shadow-2xl border border-gold-500/30 overflow-hidden text-zinc-900 dark:text-zinc-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-resort-800 bg-zinc-50/80 dark:bg-resort-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-gold-500 text-resort-950 shadow-sm">
              #{label}
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-gold-600 dark:text-gold-400">
              The Highland Park Resort
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              title="Salin Tautan Lokasi"
              className="p-2 rounded-full text-zinc-500 hover:text-gold-600 dark:text-zinc-400 dark:hover:text-gold-400 hover:bg-zinc-100 dark:hover:bg-resort-800 transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-resort-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* Main Photo / Video display */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-resort-900 dark:to-resort-950 border border-gold-500/20 shadow-inner flex items-center justify-center">
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
          </div>

          {/* Title & Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-resort-100 text-resort-800 dark:bg-resort-800 dark:text-resort-200 border border-resort-300 dark:border-resort-700">
                <Tag className="w-3.5 h-3.5 text-gold-500" />
                {location.category}
              </span>
              {location.mapX !== undefined && location.mapY !== undefined ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <MapPin className="w-3.5 h-3.5" /> Peta: {location.mapX.toFixed(1)}%, {location.mapY.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <Compass className="w-3.5 h-3.5" /> Titik Peta Tersedia
                </span>
              )}
            </div>

            <h2 id="modal-location-title" className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-resort-900 dark:text-white">
              {location.name}
            </h2>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {location.description ||
                `Fasilitas ${location.name} bernomor ${label} yang terletak di kawasan ${location.category}, The Highland Park Resort - Hotel Bogor.`}
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {onFocusOnMap && (
              <button
                type="button"
                onClick={() => {
                  onFocusOnMap(location);
                  onClose();
                }}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-resort-800 to-resort-700 hover:from-resort-700 hover:to-resort-600 text-white font-medium text-sm shadow-md transition-all hover:shadow-glow-emerald cursor-pointer"
              >
                <Compass className="w-4 h-4 text-gold-400" />
                Fokuskan Titik di Peta
              </button>
            )}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-200 dark:border-resort-800 bg-zinc-50/80 dark:bg-resort-900/80 backdrop-blur-sm">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!hasPrev}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              hasPrev
                ? "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-resort-800 cursor-pointer"
                : "text-zinc-400 dark:text-zinc-600 opacity-50 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            {currentIndex + 1} / {locations.length}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={!hasNext}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              hasNext
                ? "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-resort-800 cursor-pointer"
                : "text-zinc-400 dark:text-zinc-600 opacity-50 cursor-not-allowed"
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
