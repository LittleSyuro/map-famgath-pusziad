"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LocationItem, LOCATIONS } from "@/data/locations";
import {
  X,
  Maximize2,
  Minus,
  Compass,
  Building,
  Tag,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Video,
  Eye,
} from "lucide-react";

interface LegendMapPopupProps {
  location: LocationItem | null;
  onClose: () => void;
  onFocusOnMap: (loc: LocationItem) => void;
  onSelectNextLocation?: (loc: LocationItem) => void;
}

const isVideo = (url?: string) => {
  if (!url) return false;
  return /\.(mp4|mov|webm|ogg)$/i.test(url);
};

export const LegendMapPopup: React.FC<LegendMapPopupProps> = ({
  location,
  onClose,
  onFocusOnMap,
  onSelectNextLocation,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard escape & arrow navigation for full screen
  useEffect(() => {
    if (!isFullScreen || !location) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullScreen(false);
      } else if (e.key === "ArrowLeft") {
        const curIdx = LOCATIONS.findIndex((l) => l.id === location.id);
        if (curIdx > 0) {
          onSelectNextLocation?.(LOCATIONS[curIdx - 1]);
        }
      } else if (e.key === "ArrowRight") {
        const curIdx = LOCATIONS.findIndex((l) => l.id === location.id);
        if (curIdx < LOCATIONS.length - 1) {
          onSelectNextLocation?.(LOCATIONS[curIdx + 1]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen, location, onSelectNextLocation]);

  if (!location || location.mapX === undefined || location.mapY === undefined) {
    return null;
  }

  const label = `${location.number}${location.suffix || ""}`;
  const isTopHalf = location.mapY < 45;
  const curIdx = LOCATIONS.findIndex((l) => l.id === location.id);
  const hasPrev = curIdx > 0;
  const hasNext = curIdx < LOCATIONS.length - 1;

  return (
    <>
      {/* Centered Screen Modal Dialog (Always perfectly centered in screen) */}
      {mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 select-none"
          onClick={onClose}
        >
          <motion.div
            key={`legend-popup-${location.id}`}
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-[380px] sm:max-w-[420px] max-h-[88vh] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl border-2 bg-[#142807]/98 border-lime-400/90 ring-4 ring-lime-400/25 shadow-glow-lime flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-3xl overflow-hidden flex flex-col">
              {/* Media Area (Photo or Video) */}
              <div
                className="relative w-full h-44 sm:h-48 bg-[#0b1a03] overflow-hidden group cursor-pointer shrink-0"
                onClick={() => setIsFullScreen(true)}
                title="Klik untuk memperbesar (Full Screen)"
              >
                {isVideo(location.image) ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={location.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-[#0b1a03]/90 text-butter-200 text-[10px] font-bold border border-lime-500/40 flex items-center gap-1 z-10">
                      <Video className="w-3 h-3 text-lime-400" />
                      <span>Video Media</span>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={location.image}
                    alt={location.name}
                    fill
                    unoptimized
                    sizes="450px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* Hover Full Screen Overlay Prompt */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-black">
                  <div className="px-3 py-1.5 rounded-full bg-[#0b1a03]/90 border border-lime-400/60 shadow-lg flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-lime-400" />
                    <span>Klik untuk Full Screen</span>
                  </div>
                </div>

                {/* Gradient Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#142807] via-transparent to-black/40 pointer-events-none" />

                {/* Top Controls */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                  <span className="px-3 py-1 rounded-full bg-butter-pill text-slate-950 font-black font-mono text-xs shadow-lg border border-white flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-950" />
                    <span>No. {label}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Full Screen Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFullScreen(true);
                      }}
                      className="w-8 h-8 rounded-full bg-[#0b1a03]/90 hover:bg-lime-500 hover:text-slate-950 text-lime-300 backdrop-blur-md border border-lime-400/40 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                      title="Perbesar Galeri (Full Screen)"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="w-8 h-8 rounded-full bg-[#0b1a03]/90 hover:bg-rose-500 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                      title="Tutup Popup"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Description & Details */}
              <div className="p-4 space-y-2.5 bg-[#142807]">
                <div>
                  <h4 className="text-base font-extrabold text-white tracking-tight leading-snug">
                    No. {label} {location.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-lg bg-lime-900/60 text-lime-200 border border-lime-400/40 text-[11px] font-bold">
                    <Tag className="w-3 h-3 text-butter-300" />
                    {location.category}
                  </span>
                </div>

                <p className="text-xs text-lime-100/90 leading-relaxed max-h-28 overflow-y-auto custom-scrollbar bg-[#0d1d03]/90 p-2.5 rounded-xl border border-lime-500/25">
                  {location.description ||
                    `Fasilitas ${location.name} bernomor ${label} yang terletak di ${location.category}, The Highland Park Resort.`}
                </p>

                {/* Action Buttons Row */}
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFullScreen(true)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0b1a03] hover:bg-lime-800 text-lime-200 border border-lime-500/40 text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    <Eye className="w-3.5 h-3.5 text-lime-400" />
                    <span>Lihat Full Screen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onFocusOnMap(location);
                      onClose();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black text-xs shadow-md transition-all hover:scale-[1.02] cursor-pointer border border-lime-200"
                  >
                    <Compass className="w-3.5 h-3.5 text-slate-950" />
                    <span>Fokus Titik</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Full Screen Lightbox Modal */}
      {mounted && isFullScreen && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex flex-col justify-between p-3 sm:p-6 bg-black/95 backdrop-blur-3xl select-none overflow-hidden animate-in fade-in duration-200"
          onClick={() => setIsFullScreen(false)}
        >
          {/* Top Bar */}
          <div
            className="w-full flex items-center justify-between border-b border-lime-500/30 pb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-butter-pill text-slate-950 font-black shadow-lg">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold text-white font-display leading-tight">
                  No. {label} {location.name}
                </h3>
                <p className="text-xs text-lime-300">
                  {location.category} • The Highland Park Resort Bogor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-[#0b1a03] border border-lime-500/40 text-lime-300 font-mono text-xs font-bold shadow-md">
                {curIdx + 1} / {LOCATIONS.length}
              </span>

              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-lg"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Stage: Media Display with Left/Right Arrows */}
          <div
            className="relative flex-1 w-full flex items-center justify-center my-3 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Arrow */}
            {hasPrev && (
              <button
                type="button"
                onClick={() => onSelectNextLocation?.(LOCATIONS[curIdx - 1])}
                className="absolute left-2 sm:left-6 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0b1a03]/90 hover:bg-lime-500 text-white hover:text-slate-950 border border-lime-400/50 flex items-center justify-center transition-all shadow-2xl cursor-pointer hover:scale-110"
                title="Sebelumnya (←)"
              >
                <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
            )}

            {/* Main Media */}
            <div className="relative w-full h-full max-h-[75vh] flex items-center justify-center">
              {isVideo(location.image) ? (
                <video
                  src={location.image}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl border border-lime-400/40 bg-black"
                />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    key={location.image}
                    src={location.image}
                    alt={location.name}
                    fill
                    unoptimized
                    priority
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            {/* Next Arrow */}
            {hasNext && (
              <button
                type="button"
                onClick={() => onSelectNextLocation?.(LOCATIONS[curIdx + 1])}
                className="absolute right-2 sm:right-6 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0b1a03]/90 hover:bg-lime-500 text-white hover:text-slate-950 border border-lime-400/50 flex items-center justify-center transition-all shadow-2xl cursor-pointer hover:scale-110"
                title="Berikutnya (→)"
              >
                <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
            )}
          </div>

          {/* Bottom Info Bar */}
          <div
            className="w-full bg-[#0e1d03]/95 backdrop-blur-md rounded-2xl border border-lime-500/30 p-3 flex flex-col sm:flex-row items-center justify-between gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs sm:text-sm text-lime-100 line-clamp-2">
              {location.description ||
                `Fasilitas ${location.name} bernomor ${label} yang terletak di kawasan ${location.category}, The Highland Park Resort - Hotel Bogor.`}
            </p>

            <button
              type="button"
              onClick={() => {
                setIsFullScreen(false);
                onFocusOnMap(location);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-butter-pill text-slate-950 font-black text-xs shadow-md hover:scale-105 transition-transform shrink-0 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>Fokuskan di Peta</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
