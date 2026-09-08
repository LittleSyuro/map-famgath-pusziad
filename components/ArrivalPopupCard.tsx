"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { VIPArrival, RundownItem, AccommodationRoom, MenuItem, HighlightSpot } from "@/data/arrivals";
import {
  Clock,
  X,
  Sparkles,
  Building,
  Minus,
  Utensils,
  Trophy,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Gift,
  Compass,
  MapPin,
  Video,
  Play,
} from "lucide-react";

interface ArrivalPopupCardProps {
  vip: VIPArrival;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  agendaItem?: RundownItem;
  roomData?: AccommodationRoom;
  spotData?: HighlightSpot;
  autoCollapseMs?: number;
}

const isVideo = (url?: string) => {
  if (!url) return false;
  return /\.(mp4|mov|webm|ogg)$/i.test(url);
};

export const ArrivalPopupCard: React.FC<ArrivalPopupCardProps> = ({
  vip,
  isOpen,
  onClose,
  onOpen,
  agendaItem,
  roomData,
  spotData,
  autoCollapseMs = 6000,
}) => {
  const [activeTab, setActiveTab] = useState<"foto" | "menu" | "games" | "fasilitas">("foto");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullFrame, setIsFullFrame] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Edge detection reference & shift offset
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [edgeShift, setEdgeShift] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine images / videos array
  const imageList = React.useMemo(() => {
    if (agendaItem?.galleryImages && agendaItem.galleryImages.length > 0) {
      return agendaItem.galleryImages;
    }
    if (roomData?.detailImages && roomData.detailImages.length > 0) {
      return roomData.detailImages;
    }
    if (spotData?.image) {
      return [spotData.image];
    }
    return [vip.roomImage];
  }, [agendaItem, roomData, spotData, vip.roomImage]);

  const currentImage = imageList[activeImageIndex] || imageList[0] || vip.roomImage;

  // Auto-collapse timer (disabled when user is inspecting menu, games, or full frame)
  useEffect(() => {
    if (!isOpen || isFullFrame || activeTab !== "foto") return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCollapseMs);

    return () => clearTimeout(timer);
  }, [isOpen, isFullFrame, activeTab, autoCollapseMs, onClose]);

  // Keyboard navigation for Full Frame Slideshow
  useEffect(() => {
    if (!isFullFrame) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullFrame(false);
      } else if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
      } else if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullFrame, imageList.length]);

  const isTopHalf = vip.roomY < 45;
  const offsetX = vip.popupOffsetX || 0;
  const offsetY = vip.popupOffsetY || 0;

  const titleText = spotData
    ? `${spotData.legendNumber}. ${spotData.name}`
    : roomData
    ? `${roomData.legendNumber}. ${roomData.name}`
    : `${vip.roomLegendNumber}. ${vip.mapLocationName}`;

  const hasMenu = agendaItem?.menuCategories && agendaItem.menuCategories.length > 0;
  const hasGames = agendaItem?.subActivities && agendaItem.subActivities.length > 0;
  const hasFacilities = roomData?.facilities && roomData.facilities.length > 0;

  return (
    <>
      {/* Main Map Card */}
      <div
        className="absolute pointer-events-auto z-50 select-none"
        style={{
          left: `calc(${vip.roomX}% + ${offsetX}px)`,
          top: `calc(${vip.roomY}% + ${offsetY}px)`,
          transform: isTopHalf ? "translate(-50%, 20px)" : "translate(-50%, -100%)",
        }}
      >
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              key="full-popup"
              initial={{ scale: 0.3, opacity: 0, y: isTopHalf ? -15 : 15 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: isTopHalf ? 0 : -10,
              }}
              exit={{ scale: 0.4, opacity: 0, y: isTopHalf ? -10 : 10 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 26,
              }}
              className="relative w-[320px] sm:w-[360px] max-h-[82vh] rounded-3xl overflow-visible shadow-2xl backdrop-blur-2xl border-2 bg-[#142807]/98 border-lime-400/80 ring-2 ring-lime-400/30 shadow-glow-lime"
            >
              {/* Top Pointer Triangle */}
              {isTopHalf && (
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-t border-l z-20 bg-[#142807] border-lime-400/80" />
              )}

              {/* Inner container */}
              <div className="rounded-3xl overflow-hidden flex flex-col max-h-[82vh]">
                {/* Photo Area / Video / Carousel */}
                <div className="relative w-full h-40 sm:h-44 bg-[#0b1a03] overflow-hidden group shrink-0">
                  {isVideo(currentImage) ? (
                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                      <video
                        src={currentImage}
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
                      src={currentImage}
                      alt={titleText}
                      fill
                      unoptimized
                      sizes="400px"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  )}

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#142807] via-transparent to-black/40 pointer-events-none" />

                  {/* Top Bar: Badges & Window Controls */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5">
                      <span className="px-3 py-1 rounded-full bg-[#0b1a03]/95 backdrop-blur-md text-butter-200 border border-lime-500/40 text-xs font-black font-mono shadow-lg flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-lime-400" />
                        <span>No. {roomData?.legendNumber || spotData?.legendNumber || vip.roomLegendNumber}</span>
                      </span>

                      {roomData?.role && (
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-md ${
                            roomData.isPJU
                              ? "bg-butter-pill text-lime-950 border-amber-300 shadow-glow-butter"
                              : "bg-[#0b1a03]/90 text-lime-200 border-lime-500/40"
                          }`}
                        >
                          {roomData.role}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Fullscreen Zoom / Slideshow Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFullFrame(true);
                        }}
                        title="Perbesar Galeri Foto & Video (Full Screen)"
                        className="w-8 h-8 rounded-full bg-[#0b1a03]/90 hover:bg-lime-500 hover:text-lime-950 text-lime-300 backdrop-blur-md border border-lime-400/40 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Minimize Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                        }}
                        title="Kecilkan Popup (Minimize)"
                        className="w-8 h-8 rounded-full bg-[#0b1a03]/90 hover:bg-butter-pill hover:text-lime-950 text-butter-300 backdrop-blur-md border border-amber-400/40 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      {/* Close Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                        }}
                        title="Tutup Popup"
                        className="w-8 h-8 rounded-full bg-[#0b1a03]/90 hover:bg-rose-500 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Multi-Photo Carousel Navigation Arrows */}
                  {imageList.length > 1 && (
                    <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
                        }}
                        className="w-7 h-7 rounded-full bg-[#0b1a03]/90 hover:bg-lime-500 text-white hover:text-lime-950 flex items-center justify-center border border-lime-500/40 pointer-events-auto transition-colors shadow-md cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
                        }}
                        className="w-7 h-7 rounded-full bg-[#0b1a03]/90 hover:bg-lime-500 text-white hover:text-lime-950 flex items-center justify-center border border-lime-500/40 pointer-events-auto transition-colors shadow-md cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Photo Index Dots */}
                  {imageList.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                      {imageList.map((img, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex(pIdx);
                          }}
                          className={`h-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                            pIdx === activeImageIndex
                              ? "w-5 bg-lime-400 shadow-glow-lime"
                              : "w-1.5 bg-white/50 hover:bg-white"
                          }`}
                        >
                          {isVideo(img) && <span className="w-1 h-1 rounded-full bg-red-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-Navigation Tabs if Menu / Games / Facilities are available */}
                {(hasMenu || hasGames || hasFacilities) && (
                  <div className="flex items-center bg-[#0b1a03] border-t border-b border-lime-500/25 px-3 py-1.5 gap-1.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveTab("foto")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === "foto"
                          ? "bg-butter-pill text-lime-950 font-black shadow-md"
                          : "text-lime-200 hover:text-white"
                      }`}
                    >
                      <span>Foto ({imageList.length})</span>
                    </button>

                    {hasMenu && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("menu")}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeTab === "menu"
                            ? "bg-butter-pill text-lime-950 font-black shadow-md"
                            : "text-lime-200 hover:text-white"
                        }`}
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Menu Makanan</span>
                      </button>
                    )}

                    {hasGames && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("games")}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeTab === "games"
                            ? "bg-butter-pill text-lime-950 font-black shadow-md"
                            : "text-lime-200 hover:text-white"
                        }`}
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Games</span>
                      </button>
                    )}

                    {hasFacilities && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("fasilitas")}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeTab === "fasilitas"
                            ? "bg-butter-pill text-lime-950 font-black shadow-md"
                            : "text-lime-200 hover:text-white"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Fasilitas</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Tab Contents */}
                <div className="p-3.5 space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar bg-[#142807]">
                  {/* FOTO TAB */}
                  {activeTab === "foto" && (
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-extrabold text-white tracking-tight">
                          {titleText}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {spotData?.description || roomData?.description || agendaItem?.description || vip.title}
                        </p>
                      </div>

                      {/* Info Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {roomData?.role && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] font-bold">
                            🏠 {roomData.role}
                          </span>
                        )}
                        {spotData?.category && (
                          <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[10px] font-bold">
                            🧭 {spotData.category}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MENU TAB */}
                  {activeTab === "menu" && hasMenu && (
                    <div className="space-y-3">
                      {agendaItem?.menuCategories?.map((cat, cIdx) => (
                        <div key={cIdx} className="space-y-1.5">
                          <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <span>{cat.category}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.items.map((item, iIdx) => (
                              <span
                                key={iIdx}
                                className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>{item}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* GAMES TAB */}
                  {activeTab === "games" && hasGames && (
                    <div className="space-y-2.5">
                      {agendaItem?.subActivities?.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-1.5"
                        >
                          <div className="flex items-center gap-2">
                            {sub.image && (
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-emerald-500/30">
                                <Image src={sub.image} alt={sub.title} fill unoptimized className="object-cover" />
                              </div>
                            )}
                            <div className="text-xs font-bold text-emerald-300">{sub.title}</div>
                          </div>
                          {sub.items && (
                            <div className="flex flex-wrap gap-1">
                              {sub.items.map((it, itIdx) => (
                                <span
                                  key={itIdx}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300"
                                >
                                  • {it}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* FASILITAS TAB */}
                  {activeTab === "fasilitas" && hasFacilities && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {roomData?.facilities?.map((fac, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-medium text-[11px]">{fac}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Pointer Triangle */}
              {!isTopHalf && (
                <div className="w-4 h-4 mx-auto -mt-2 rotate-45 border-b border-r bg-slate-950 border-emerald-400/70" />
              )}
            </motion.div>
          ) : (
            /* Collapsed Badge Pin */
            <motion.button
              key="collapsed-badge"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              title={`Klik untuk melihat ${titleText}`}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md border text-xs font-bold transition-all ${
                  spotData
                    ? "bg-slate-950/95 text-cyan-200 border-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                    : roomData?.isPJU
                    ? "bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 border-white ring-2 ring-amber-400/50 font-black shadow-glow-gold"
                    : roomData
                    ? "bg-slate-950/95 text-emerald-300 border-emerald-400/80 ring-1 ring-emerald-400/30 shadow-lg shadow-emerald-950/50"
                    : "bg-slate-950/95 text-emerald-200 border-emerald-400/80 ring-1 ring-emerald-400/30 shadow-lg shadow-emerald-950/50"
                }`}
              >
                {spotData ? (
                  <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow shrink-0" />
                ) : roomData?.isPJU ? (
                  <Building className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                ) : (
                  <Building className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}

                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="font-mono font-black opacity-90">
                    No. {roomData?.legendNumber || spotData?.legendNumber || vip.roomLegendNumber}
                  </span>
                  <span className="font-extrabold max-w-[150px] truncate">
                    {roomData?.name || spotData?.name || vip.mapLocationName}
                  </span>
                </div>

                <span
                  className={`w-2 h-2 rounded-full animate-ping ${
                    spotData ? "bg-cyan-400" : roomData?.isPJU ? "bg-white" : "bg-emerald-400"
                  }`}
                />
              </div>

              {/* Pin Arrow Pointing down to node */}
              <div
                className={`w-2.5 h-2.5 rotate-45 -mt-1 border-r border-b ${
                  spotData
                    ? "bg-slate-950 border-cyan-400"
                    : roomData?.isPJU
                    ? "bg-amber-400 border-amber-300"
                    : "bg-slate-950 border-emerald-400"
                }`}
              />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Full Screen Slideshow Gallery Modal (High Resolution Photos & Videos) */}
      {mounted && isFullFrame && createPortal(
        <AnimatePresence>
          <div
            className="fixed inset-0 z-[99999] flex flex-col justify-between p-3 sm:p-6 bg-black/95 backdrop-blur-3xl select-none overflow-hidden"
            onClick={() => setIsFullFrame(false)}
          >
            {/* Top Bar: Title & Counter & Close */}
            <div
              className="w-full flex items-center justify-between border-b border-gold-500/30 pb-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-resort-950 font-black shadow-lg">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-white font-display leading-tight">
                    {titleText}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    The Highland Park Resort - Hotel Bogor • Galeri Foto & Video
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Media Counter Pill */}
                <span className="px-3 py-1.5 rounded-xl bg-resort-900 border border-gold-500/40 text-gold-300 font-mono text-xs font-bold shadow-md">
                  {activeImageIndex + 1} / {imageList.length}
                </span>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsFullFrame(false)}
                  className="p-2.5 rounded-2xl bg-white/10 hover:bg-red-500 text-white transition-colors cursor-pointer shadow-lg"
                  title="Tutup Galeri (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Stage: Large Responsive Media (Photo or Video Player) with Navigation */}
            <div
              className="relative flex-1 w-full flex items-center justify-center my-3 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Button */}
              {imageList.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1))
                  }
                  className="absolute left-2 sm:left-6 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-resort-950/90 hover:bg-gold-500 text-white hover:text-resort-950 border border-gold-500/50 flex items-center justify-center transition-all shadow-2xl cursor-pointer hover:scale-110"
                  title="Sebelumnya (←)"
                >
                  <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
              )}

              {/* Active Display */}
              <div className="relative w-full h-full max-h-[75vh] flex items-center justify-center">
                {isVideo(currentImage) ? (
                  <video
                    key={currentImage}
                    src={currentImage}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl border border-gold-400/40 bg-black"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      key={currentImage}
                      src={currentImage}
                      alt={titleText}
                      fill
                      unoptimized
                      priority
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Next Button */}
              {imageList.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-2 sm:right-6 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-resort-950/90 hover:bg-gold-500 text-white hover:text-resort-950 border border-gold-500/50 flex items-center justify-center transition-all shadow-2xl cursor-pointer hover:scale-110"
                  title="Berikutnya (→)"
                >
                  <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
              )}
            </div>

            {/* Bottom Filmstrip Thumbnail Row */}
            <div
              className="w-full bg-resort-950/90 backdrop-blur-md rounded-2xl border border-gold-500/30 p-2.5 space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Description Caption */}
              <p className="text-xs text-zinc-300 text-center line-clamp-1">
                {spotData?.description || roomData?.description || agendaItem?.description}
              </p>

              {/* Filmstrip Strip */}
              {imageList.length > 1 && (
                <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 px-2 custom-scrollbar">
                  {imageList.map((mediaUrl, fIdx) => (
                    <button
                      key={fIdx}
                      type="button"
                      onClick={() => setActiveImageIndex(fIdx)}
                      className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        fIdx === activeImageIndex
                          ? "border-amber-400 ring-2 ring-amber-400 shadow-glow-gold scale-105"
                          : "border-zinc-700 opacity-60 hover:opacity-100 hover:border-gold-400"
                      }`}
                    >
                      {isVideo(mediaUrl) ? (
                        <div className="w-full h-full bg-resort-900 flex items-center justify-center">
                          <Video className="w-4 h-4 text-gold-400" />
                        </div>
                      ) : (
                        <Image
                          src={mediaUrl}
                          alt={`Thumbnail ${fIdx + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
