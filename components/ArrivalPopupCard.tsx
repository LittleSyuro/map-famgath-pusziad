"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  VIPArrival,
  RundownItem,
  AccommodationRoom,
  MenuItem,
  HighlightSpot,
  KeyEventPinpoint,
  ACCOMMODATION_ROOMS,
  Waypoint,
} from "@/data/arrivals";
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
  Trees,
  Coffee,
} from "lucide-react";

interface ArrivalPopupCardProps {
  vip?: VIPArrival;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  agendaItem?: RundownItem;
  roomData?: AccommodationRoom;
  spotData?: HighlightSpot;
  keyPinpoint?: KeyEventPinpoint;
  onFocusPinPoint?: (coords?: Waypoint) => void;
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
  keyPinpoint,
  onFocusPinPoint,
}) => {
  const [activeTab, setActiveTab] = useState<"foto" | "menu" | "games" | "fasilitas">("foto");
  const [menuFilter, setMenuFilter] = useState<"all" | "lunch" | "coffeebreak">("all");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullFrame, setIsFullFrame] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if this popup is for accommodation checkin or any of the 3 rooms
  const isAccommodation = React.useMemo(() => {
    if (agendaItem?.id === "d1-checkin") return true;
    if (roomData) return true;
    if (keyPinpoint?.id === "pin-alpine" || keyPinpoint?.id === "pin-cave" || keyPinpoint?.id === "pin-mongolian") return true;
    const cat = (keyPinpoint?.category || "").toLowerCase();
    const nm = (keyPinpoint?.name || "").toLowerCase();
    if (cat.includes("kamar") || cat.includes("penginapan") || nm.includes("alpine") || nm.includes("cave") || nm.includes("mongolian")) return true;
    return false;
  }, [agendaItem, roomData, keyPinpoint]);

  // Initial room selection index based on incoming props
  const initialRoomIdx = React.useMemo(() => {
    if (keyPinpoint?.id === "pin-mongolian" || roomData?.id === "room-mongolian" || keyPinpoint?.name?.toLowerCase().includes("mongolian")) return 1;
    if (keyPinpoint?.id === "pin-cave" || roomData?.id === "room-the-cave" || keyPinpoint?.name?.toLowerCase().includes("cave")) return 2;
    return 0; // Alpine House (PJU) by default
  }, [keyPinpoint, roomData]);

  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);

  // Synchronize initial room selection when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedRoomIndex(initialRoomIdx);
      setActiveImageIndex(0);
    }
  }, [isOpen, initialRoomIdx]);

  const activeRoom = isAccommodation ? ACCOMMODATION_ROOMS[selectedRoomIndex] : null;

  // Determine images / videos array
  const imageList = React.useMemo(() => {
    if (activeRoom) {
      if (activeRoom.detailImages && activeRoom.detailImages.length > 0) {
        return activeRoom.detailImages;
      }
      return [activeRoom.image];
    }
    if (keyPinpoint?.galleryImages && keyPinpoint.galleryImages.length > 0) {
      return keyPinpoint.galleryImages;
    }
    if (keyPinpoint?.image) {
      return [keyPinpoint.image];
    }
    if (agendaItem?.galleryImages && agendaItem.galleryImages.length > 0) {
      return agendaItem.galleryImages;
    }
    if (roomData?.detailImages && roomData.detailImages.length > 0) {
      return roomData.detailImages;
    }
    if (spotData?.image) {
      return [spotData.image];
    }
    return vip?.roomImage ? [vip.roomImage] : [];
  }, [activeRoom, keyPinpoint, agendaItem, roomData, spotData, vip?.roomImage]);

  const currentImage = imageList[activeImageIndex] || imageList[0] || (activeRoom ? activeRoom.image : keyPinpoint?.image) || vip?.roomImage || "";


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

  const pinX = keyPinpoint?.coords.x ?? roomData?.coords.x ?? spotData?.coords.x ?? vip?.roomX ?? 50;
  const pinY = keyPinpoint?.coords.y ?? roomData?.coords.y ?? spotData?.coords.y ?? vip?.roomY ?? 50;
  const offsetX = vip?.popupOffsetX || 0;
  const offsetY = vip?.popupOffsetY || 0;

  const legendNum = activeRoom?.legendNumber || keyPinpoint?.legendNumber || roomData?.legendNumber || spotData?.legendNumber || vip?.roomLegendNumber || "";
  const placeName = activeRoom?.name || keyPinpoint?.name || roomData?.name || spotData?.name || vip?.mapLocationName || "";
  const titleText = `No. ${legendNum} ${placeName}`;

  const subtitleText = activeRoom?.role || keyPinpoint?.category || roomData?.role || spotData?.category || vip?.title || "";
  const descriptionText = activeRoom?.description || keyPinpoint?.description || spotData?.description || roomData?.description || agendaItem?.description || vip?.title || "";

  const menuList = keyPinpoint?.menuCategories || agendaItem?.menuCategories;
  const hasMenu = !activeRoom && !!(menuList && menuList.length > 0);

  const gamesList = keyPinpoint?.subActivities || agendaItem?.subActivities;
  const hasGames = !activeRoom && !!(gamesList && gamesList.length > 0);

  const facilitiesList = activeRoom?.facilities || keyPinpoint?.facilities || roomData?.facilities;
  const hasFacilities = !!(facilitiesList && facilitiesList.length > 0);

  const isPJU = activeRoom ? activeRoom.isPJU : !!(keyPinpoint?.isPJU || roomData?.isPJU || vip?.isPJU || placeName.toLowerCase().includes("alpine"));
  const activeFocusCoords = activeRoom ? activeRoom.coords : { x: pinX, y: pinY };

  return (
    <>
      {/* On-Map Badge Pin (Always anchored accurately at coordinates) */}
      <div
        className="absolute pointer-events-auto z-40 select-none cursor-pointer"
        style={{
          left: `calc(${pinX}% + ${offsetX}px)`,
          top: `calc(${pinY}% + ${offsetY}px)`,
          transform: "translate(-50%, -50%)",
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isOpen) {
            onClose();
          } else {
            onOpen();
          }
        }}
      >
        {(() => {
          const combinedName = `${titleText} ${placeName} ${subtitleText}`.toLowerCase();
          const isResto = combinedName.includes("resto") || combinedName.includes("anthurium");
          const isMasjid = combinedName.includes("masjid") || combinedName.includes("mushola");
          const isBallroom = combinedName.includes("ballroom") || combinedName.includes("aster");
          const isHelipad = combinedName.includes("helipad") || combinedName.includes("gerbera");
          const isSpot = !!spotData || combinedName.includes("bridge") || combinedName.includes("noah") || combinedName.includes("pinus");

          return (
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              title={`Klik untuk membuka detail ${titleText}`}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md border text-xs font-bold transition-all ${
                isOpen
                  ? "ring-4 ring-lime-400 shadow-glow-lime scale-105"
                  : ""
              } ${
                isPJU
                  ? "bg-gradient-to-r from-amber-400 via-lime-400 to-yellow-300 text-slate-950 border-white ring-2 ring-amber-400/60 font-black shadow-glow-gold"
                  : isResto
                  ? "bg-[#0b1f0c]/95 text-emerald-200 border-emerald-400/80 ring-1 ring-emerald-400/30 shadow-lg shadow-emerald-950/60"
                  : isMasjid
                  ? "bg-[#0d1527]/95 text-indigo-200 border-indigo-400/80 ring-1 ring-indigo-400/30 shadow-lg shadow-indigo-950/60"
                  : isBallroom
                  ? "bg-[#1c0d29]/95 text-purple-200 border-purple-400/80 ring-1 ring-purple-400/30 shadow-lg shadow-purple-950/60"
                  : isHelipad
                  ? "bg-[#241706]/95 text-amber-200 border-amber-400/80 ring-1 ring-amber-400/30 shadow-lg shadow-amber-950/60"
                  : isSpot
                  ? "bg-[#06181f]/95 text-cyan-200 border-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                  : "bg-[#062419]/95 text-emerald-300 border-emerald-400/80 ring-1 ring-emerald-400/30 shadow-lg shadow-emerald-950/60"
              }`}
            >
              {isPJU ? (
                <Building className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              ) : isResto ? (
                <Utensils className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : isMasjid ? (
                <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              ) : isBallroom ? (
                <Building className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              ) : isHelipad ? (
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : isSpot ? (
                <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow shrink-0" />
              ) : (
                <Building className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}

              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-mono font-black opacity-90">
                  No. {legendNum}
                </span>
                <span className="font-extrabold max-w-[150px] truncate">
                  {placeName}
                </span>
              </div>

              <span
                className={`w-2 h-2 rounded-full animate-ping ${
                  isPJU
                    ? "bg-slate-950"
                    : isResto
                    ? "bg-emerald-400"
                    : isMasjid
                    ? "bg-indigo-400"
                    : isBallroom
                    ? "bg-purple-400"
                    : isHelipad
                    ? "bg-amber-400"
                    : isSpot
                    ? "bg-cyan-400"
                    : "bg-emerald-400"
                }`}
              />
            </motion.div>
          );
        })()}
      </div>

      {/* Centered Screen Modal Popup Card (Large, Spacious, & Beautiful) */}
      {mounted && isOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 select-none"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="relative w-full max-w-[560px] sm:max-w-[640px] md:max-w-[700px] max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl border-2 bg-[#142807]/98 border-lime-400/90 ring-4 ring-lime-400/25 shadow-glow-lime flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo Area / Video / Carousel */}
            <div className="relative w-full h-56 sm:h-64 md:h-72 bg-[#0b1a03] overflow-hidden group shrink-0">
              {currentImage && isVideo(currentImage) ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <video
                    src={currentImage}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-[#0b1a03]/90 text-butter-200 text-xs font-bold border border-lime-500/40 flex items-center gap-1.5 z-10">
                    <Video className="w-3.5 h-3.5 text-lime-400" />
                    <span>Video Media</span>
                  </div>
                </div>
              ) : currentImage ? (
                <Image
                  src={currentImage}
                  alt={titleText}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 700px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">
                  <Building className="w-10 h-10" />
                </div>
              )}

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#142807] via-transparent to-black/50 pointer-events-none" />

              {/* Top Bar: Badges & Window Controls */}
              <div className="absolute top-3 inset-x-3 sm:inset-x-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#0b1a03]/95 backdrop-blur-md text-butter-200 border border-lime-500/50 text-xs font-black font-mono shadow-lg flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-lime-400" />
                    <span>No. {legendNum}</span>
                  </span>

                  {subtitleText && (
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-md ${
                        isPJU
                          ? "bg-butter-pill text-lime-950 border-amber-300 shadow-glow-butter"
                          : "bg-[#0b1a03]/90 text-lime-200 border-lime-500/40"
                      }`}
                    >
                      {subtitleText}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Fullscreen Zoom / Slideshow Button */}
                  {imageList.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFullFrame(true);
                      }}
                      title="Perbesar Galeri Foto & Video (Full Screen)"
                      className="w-9 h-9 rounded-full bg-[#0b1a03]/90 hover:bg-lime-500 hover:text-lime-950 text-lime-300 backdrop-blur-md border border-lime-400/50 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Minimize Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    title="Kecilkan Popup (Minimize)"
                    className="w-9 h-9 rounded-full bg-[#0b1a03]/90 hover:bg-butter-pill hover:text-lime-950 text-butter-300 backdrop-blur-md border border-amber-400/50 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
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
                    className="w-9 h-9 rounded-full bg-[#0b1a03]/90 hover:bg-rose-500 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Multi-Photo Carousel Navigation Arrows */}
              {imageList.length > 1 && (
                <div className="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
                    }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0b1a03]/90 hover:bg-lime-500 text-white hover:text-lime-950 flex items-center justify-center border border-lime-500/50 pointer-events-auto transition-colors shadow-lg cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
                    }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0b1a03]/90 hover:bg-lime-500 text-white hover:text-lime-950 flex items-center justify-center border border-lime-500/50 pointer-events-auto transition-colors shadow-lg cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Photo Index Dots */}
              {imageList.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                  {imageList.map((img, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(pIdx);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                        pIdx === activeImageIndex
                          ? "w-6 bg-lime-400 shadow-glow-lime"
                          : "w-2 bg-white/50 hover:bg-white"
                      }`}
                    >
                      {isVideo(img) && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3 KAMAR PENGINAPAN SELECTOR CARDS (Tampilkan Ketiga Card Kamar) */}
            {isAccommodation && (
              <div className="bg-[#0b1a03] p-3 sm:p-3.5 border-t border-b border-lime-500/30 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-lime-300 tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-lime-400" />
                    Pilihan 3 Kamar Penginapan
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-butter-300 bg-black/40 px-2.5 py-0.5 rounded-full border border-lime-500/30">
                    Klik untuk beralih kamar
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {ACCOMMODATION_ROOMS.map((room, rIdx) => {
                    const isSelected = rIdx === selectedRoomIndex;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoomIndex(rIdx);
                          setActiveImageIndex(0);
                        }}
                        className={`relative p-2 sm:p-2.5 rounded-2xl border transition-all text-left flex flex-col gap-1.5 cursor-pointer select-none group ${
                          isSelected
                            ? "bg-[#1c3a0b] border-lime-400 ring-2 ring-lime-400/80 shadow-glow-lime scale-[1.02]"
                            : "bg-black/50 border-lime-500/25 hover:border-lime-400/60 hover:bg-[#142807]/80 opacity-80 hover:opacity-100"
                        }`}
                      >
                        {/* Image Thumbnail */}
                        <div className="relative w-full h-16 sm:h-20 rounded-xl overflow-hidden bg-black border border-lime-500/30">
                          <Image
                            src={room.image}
                            alt={room.name}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <span
                            className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black font-mono shadow ${
                              room.isPJU
                                ? "bg-amber-400 text-slate-950 font-black shadow-glow-gold"
                                : "bg-black/85 text-white border border-white/20"
                            }`}
                          >
                            No. {room.legendNumber}
                          </span>
                          {isSelected && (
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-lime-400 text-slate-950 text-[9px] font-black shadow flex items-center gap-0.5">
                              ✓ Aktif
                            </span>
                          )}
                        </div>

                        {/* Room Info */}
                        <div className="flex flex-col">
                          <span
                            className={`text-[10px] sm:text-[11px] font-black uppercase tracking-tight truncate ${
                              room.isPJU ? "text-amber-300" : "text-lime-200"
                            }`}
                          >
                            {room.role}
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                            {room.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-Navigation Tabs if Menu / Games / Facilities are available */}
            {(hasMenu || hasGames || hasFacilities) && (
              <div className="flex items-center bg-[#0b1a03] border-t border-b border-lime-500/25 px-3.5 sm:px-4 py-2 gap-2 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("foto")}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
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
                    className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
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
                    className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
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
                    className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "fasilitas"
                        ? "bg-butter-pill text-lime-950 font-black shadow-md"
                        : "text-lime-200 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fasilitas ({facilitiesList.length})</span>
                  </button>
                )}
              </div>
            )}

            {/* Tab Contents (Spacious & Scrollable) */}
            <div className="p-4 sm:p-5 space-y-3 max-h-[42vh] sm:max-h-[48vh] overflow-y-auto custom-scrollbar bg-[#142807]">
              {/* FOTO TAB */}
              {activeTab === "foto" && (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {titleText}
                    </h4>
                    <p className="text-xs sm:text-sm text-lime-100/90 mt-1 leading-relaxed">
                      {descriptionText}
                    </p>
                  </div>

                  {/* Info Pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {subtitleText && (
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold">
                        ✨ {subtitleText}
                      </span>
                    )}
                    {isPJU && (
                      <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                        👑 Pejabat Utama (PJU)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* MENU TAB */}
              {activeTab === "menu" && hasMenu && (
                <div className="space-y-3">
                  {/* Sub-selector for Menu Filter */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-lime-500/20 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setMenuFilter("all")}
                      className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                        menuFilter === "all"
                          ? "bg-lime-400 text-slate-950 font-black shadow-md"
                          : "text-lime-200/80 hover:text-white"
                      }`}
                    >
                      Semua Menu
                    </button>
                    <button
                      type="button"
                      onClick={() => setMenuFilter("lunch")}
                      className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                        menuFilter === "lunch"
                          ? "bg-lime-400 text-slate-950 font-black shadow-md"
                          : "text-lime-200/80 hover:text-white"
                      }`}
                    >
                      <Utensils className="w-3.5 h-3.5" /> Lunch (B)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMenuFilter("coffeebreak")}
                      className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                        menuFilter === "coffeebreak"
                          ? "bg-lime-400 text-slate-950 font-black shadow-md"
                          : "text-lime-200/80 hover:text-white"
                      }`}
                    >
                      <Coffee className="w-3.5 h-3.5" /> Coffee Break
                    </button>
                  </div>

                  {/* 1. LUNCH TABLE */}
                  {(menuFilter === "all" || menuFilter === "lunch") && (
                    <div className="rounded-2xl overflow-hidden border-2 border-[#1c4e25] shadow-lg bg-[#faf8f2]">
                      {/* Header Bar */}
                      <div className="bg-[#1c4e25] px-3.5 py-2 flex items-center justify-between">
                        <span className="font-black text-white text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5">
                          <Utensils className="w-4 h-4 text-lime-300" />
                          LUNCH
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-[#a3442a] text-white font-black text-xs px-2.5 py-0.5 rounded shadow-sm">
                            B
                          </span>
                          <div className="w-4 h-4 rounded bg-white border border-slate-300 flex items-center justify-center shadow-inner">
                            <span className="text-[10px] font-black text-emerald-700">✓</span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items Table Content */}
                      <div className="p-3.5 text-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        <div className="space-y-1.5">
                          {["Steamed Rice", "Cream Potato Soup", "Capcay", "Gepuk Chicken", "Sweet and Sour Snapper"].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                              <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1.5">
                          {["Mixed Fruits", "Pudding"].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                              <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. COFFEE BREAK TABLE */}
                  {(menuFilter === "all" || menuFilter === "coffeebreak") && (
                    <div className="rounded-2xl overflow-hidden border-2 border-[#1c4e25] shadow-lg bg-[#faf8f2]">
                      {/* Header Bar */}
                      <div className="bg-[#1c4e25] px-3.5 py-2 flex items-center justify-between">
                        <span className="font-black text-white text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5">
                          <Coffee className="w-4 h-4 text-lime-300" />
                          COFFEE BREAK
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-[#a3442a] text-white font-black text-xs px-2.5 py-0.5 rounded shadow-sm">
                            B
                          </span>
                          <div className="w-4 h-4 rounded bg-white border border-slate-300 flex items-center justify-center shadow-inner">
                            <span className="text-[10px] font-black text-emerald-700">✓</span>
                          </div>
                        </div>
                      </div>

                      {/* Sessions in Cream Card */}
                      <div className="p-3.5 text-slate-900 space-y-3">
                        {/* CB 1 (MORNING) */}
                        <div className="space-y-1.5 pb-2.5 border-b border-slate-200">
                          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-900 uppercase">
                            <div className="w-4 h-4 rounded bg-white border border-slate-400 flex items-center justify-center shadow-inner">
                              <span className="text-[10px] font-black text-emerald-700">✓</span>
                            </div>
                            <span>CB 1 (MORNING)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pl-4">
                            {["Chicken Nugget", "Panettone", "Velvet Roll", "Assorted Chips", "Coffee & Tea"].map((item, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* CB 2 (AFTERNOON) */}
                        <div className="space-y-1.5 pb-2.5 border-b border-slate-200">
                          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-900 uppercase">
                            <div className="w-4 h-4 rounded bg-white border border-slate-400 flex items-center justify-center shadow-inner">
                              <span className="text-[10px] font-black text-emerald-700">✓</span>
                            </div>
                            <span>CB 2 (AFTERNOON)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pl-4">
                            {["Marble Green Tea Cake", "Black Forest Roll", "Sausage Orly", "Assorted Chips", "Coffee & Tea"].map((item, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* CB 3 (EVENING) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-900 uppercase">
                            <div className="w-4 h-4 rounded bg-white border border-slate-400 flex items-center justify-center shadow-inner">
                              <span className="text-[10px] font-black text-emerald-700">✓</span>
                            </div>
                            <span>CB 3 (EVENING)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pl-4">
                            {["Pisang Rebus", "Jagung Rebus", "Kacang Rebus", "Assorted Chips", "Coffee & Tea"].map((item, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* GAMES TAB */}
              {activeTab === "games" && hasGames && (
                <div className="space-y-3">
                  {gamesList?.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-2"
                    >
                      <div className="flex items-center gap-2.5">
                        {sub.image && (
                          <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-emerald-500/30">
                            <Image src={sub.image} alt={sub.title} fill unoptimized className="object-cover" />
                          </div>
                        )}
                        <div className="text-sm font-black text-emerald-300">{sub.title}</div>
                      </div>
                      {sub.items && (
                        <div className="flex flex-wrap gap-1.5">
                          {sub.items.map((it, itIdx) => (
                            <span
                              key={itIdx}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {facilitiesList?.map((fac, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold">{fac}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selalu Munculkan Tombol Menampilkan Pin Point */}
            <div className="p-3 sm:p-3.5 bg-[#0e1d03] border-t border-lime-500/30 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onFocusPinPoint) {
                    onFocusPinPoint(activeFocusCoords);
                  }
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all hover:scale-[1.01] cursor-pointer border border-lime-200 select-none"
              >
                <Compass className="w-4 h-4 text-slate-950 shrink-0" />
                <span className="truncate">Fokuskan & Jelajahi Titik {placeName} di Peta</span>
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

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
                {currentImage && isVideo(currentImage) ? (
                  <video
                    key={currentImage}
                    src={currentImage}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl border border-gold-400/40 bg-black"
                  />
                ) : currentImage ? (
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
                ) : null}
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
                {descriptionText}
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
