"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  Pause,
  Trees,
  Coffee,
  Camera,
  Crown,
  LayoutGrid,
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
  isTourAutoplay?: boolean;
  onSlideCycleComplete?: () => void;
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
  isTourAutoplay,
  onSlideCycleComplete,
}) => {
  const [activeTab, setActiveTab] = useState<"detail" | "menu" | "games" | "fasilitas">("detail");
  const [menuFilter, setMenuFilter] = useState<"all" | "lunch" | "coffeebreak">("all");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullFrame, setIsFullFrame] = useState(false);
  const [isAutoSlideActive, setIsAutoSlideActive] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if this popup is for accommodation checkin or any of the 3 rooms
  const isAccommodation = useMemo(() => {
    if (agendaItem?.id === "d1-checkin") return true;
    if (roomData) return true;
    if (keyPinpoint?.id === "pin-alpine" || keyPinpoint?.id === "pin-cave" || keyPinpoint?.id === "pin-mongolian") return true;
    const cat = (keyPinpoint?.category || "").toLowerCase();
    const nm = (keyPinpoint?.name || "").toLowerCase();
    if (cat.includes("kamar") || cat.includes("penginapan") || nm.includes("alpine") || nm.includes("cave") || nm.includes("mongolian")) return true;
    return false;
  }, [agendaItem?.id, roomData?.id, keyPinpoint?.id, keyPinpoint?.category, keyPinpoint?.name]);

  // Initial room selection index based on incoming props
  const initialRoomIdx = useMemo(() => {
    if (keyPinpoint?.id === "pin-mongolian" || roomData?.id === "room-mongolian" || keyPinpoint?.name?.toLowerCase().includes("mongolian")) return 1;
    if (keyPinpoint?.id === "pin-cave" || roomData?.id === "room-the-cave" || keyPinpoint?.name?.toLowerCase().includes("cave")) return 2;
    return 0; // Alpine House (PJU) by default
  }, [keyPinpoint?.id, keyPinpoint?.name, roomData?.id]);

  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);

  // Synchronize initial room selection when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedRoomIndex(initialRoomIdx);
      setActiveImageIndex(0);
      setIsAutoSlideActive(true);
      if ((keyPinpoint?.menuCategories && keyPinpoint.menuCategories.length > 0) || (agendaItem?.menuCategories && agendaItem.menuCategories.length > 0)) {
        setActiveTab("menu");
      } else {
        setActiveTab("detail");
      }
    }
  }, [isOpen, initialRoomIdx, keyPinpoint?.id, agendaItem?.id]);

  const activeRoom = isAccommodation ? ACCOMMODATION_ROOMS[selectedRoomIndex] : null;

  // Determine images / videos array
  const imageList = useMemo(() => {
    if (activeRoom) {
      if (activeRoom.detailImages && activeRoom.detailImages.length > 0) {
        return activeRoom.detailImages;
      }
      return [activeRoom.image];
    }
    if (keyPinpoint?.galleryImages && keyPinpoint.galleryImages.length > 0) {
      return keyPinpoint.galleryImages;
    }
    if (agendaItem?.galleryImages && agendaItem.galleryImages.length > 0) {
      return agendaItem.galleryImages;
    }
    if (keyPinpoint?.image) {
      return [keyPinpoint.image];
    }
    if (roomData?.detailImages && roomData.detailImages.length > 0) {
      return roomData.detailImages;
    }
    if (spotData?.image) {
      return [spotData.image];
    }
    return vip?.roomImage ? [vip.roomImage] : [];
  }, [activeRoom?.id, keyPinpoint?.id, agendaItem?.id, roomData?.id, spotData?.id, vip?.roomImage]);

  const currentImage = imageList[activeImageIndex] || imageList[0] || (activeRoom ? activeRoom.image : keyPinpoint?.image) || vip?.roomImage || "";

  // Reliable Auto-slide and Task-Done Cycle Progression across Collage
  useEffect(() => {
    if (!isOpen || !isAutoSlideActive) return;

    if (imageList.length <= 1) {
      if (isTourAutoplay && isAccommodation && selectedRoomIndex < ACCOMMODATION_ROOMS.length - 1) {
        const roomTimer = setTimeout(() => {
          setSelectedRoomIndex((prev) => prev + 1);
          setActiveImageIndex(0);
        }, 3200);
        return () => clearTimeout(roomTimer);
      } else if (isTourAutoplay) {
        const doneTimer = setTimeout(() => {
          onSlideCycleComplete?.();
        }, 4000);
        return () => clearTimeout(doneTimer);
      }
      return;
    }

    const timer = setInterval(() => {
      setActiveImageIndex((prev) => {
        if (prev < imageList.length - 1) {
          return prev + 1;
        } else {
          // Reached end of photos in collage!
          if (isTourAutoplay) {
            if (isAccommodation && selectedRoomIndex < ACCOMMODATION_ROOMS.length - 1) {
              // Seamlessly switch to next room (Alpine -> Mongolian -> The Cave)
              setSelectedRoomIndex((r) => r + 1);
              return 0;
            } else {
              // Entire spot / accommodation tour done!
              setTimeout(() => {
                onSlideCycleComplete?.();
              }, 600);
              return 0;
            }
          }
          return 0; // Continuous loop for manual browsing
        }
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [isOpen, isAutoSlideActive, imageList.length, isTourAutoplay, isAccommodation, selectedRoomIndex, onSlideCycleComplete]);

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

  const pinLegendNum = keyPinpoint?.legendNumber || roomData?.legendNumber || spotData?.legendNumber || vip?.roomLegendNumber || "";
  const pinPlaceName = keyPinpoint?.name || roomData?.name || spotData?.name || vip?.mapLocationName || "";
  const pinTitleText = `No. ${pinLegendNum} ${pinPlaceName}`;
  const pinSubtitleText = keyPinpoint?.category || roomData?.role || spotData?.category || vip?.title || "";
  const pinIsPJU = !!(keyPinpoint?.isPJU || roomData?.isPJU || vip?.isPJU || pinPlaceName.toLowerCase().includes("alpine"));

  // Modal dialog specific data (dynamic room switcher when accommodation is active)
  const legendNum = activeRoom?.legendNumber || pinLegendNum;
  const placeName = activeRoom?.name || pinPlaceName;
  const titleText = `No. ${legendNum} ${placeName}`;

  const subtitleText = activeRoom?.role || pinSubtitleText;
  const descriptionText = activeRoom?.description || keyPinpoint?.description || spotData?.description || roomData?.description || agendaItem?.description || vip?.title || "";

  const menuList = keyPinpoint?.menuCategories || agendaItem?.menuCategories;
  const hasMenu = !activeRoom && !!(menuList && menuList.length > 0);

  const gamesList = keyPinpoint?.subActivities || agendaItem?.subActivities;
  const hasGames = !activeRoom && !!(gamesList && gamesList.length > 0);

  const facilitiesList = activeRoom?.facilities || keyPinpoint?.facilities || roomData?.facilities;
  const hasFacilities = !!(facilitiesList && facilitiesList.length > 0);

  const isPJU = activeRoom ? activeRoom.isPJU : pinIsPJU;
  const activeFocusCoords = activeRoom ? activeRoom.coords : { x: pinX, y: pinY };

  const timeRangeStr = agendaItem?.startTime && agendaItem?.endTime ? `${agendaItem.startTime} - ${agendaItem.endTime}` : "";

  return (
    <>
      {/* On-Map Badge Pin (Circular Iconography by default, expands on hover) */}
      <div
        className="absolute pointer-events-auto z-40 select-none cursor-pointer group hover:z-50"
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
          const combinedName = `${pinTitleText} ${pinPlaceName} ${pinSubtitleText}`.toLowerCase();
          const isResto = combinedName.includes("resto") || combinedName.includes("anthurium");
          const isMasjid = combinedName.includes("masjid") || combinedName.includes("mushola");
          const isBallroom = combinedName.includes("ballroom") || combinedName.includes("aster");
          const isHelipad = combinedName.includes("helipad") || combinedName.includes("gerbera");
          const isSpot = !!spotData || combinedName.includes("bridge") || combinedName.includes("noah") || combinedName.includes("pinus") || combinedName.includes("tangga") || combinedName.includes("foto");

          return (
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              title={`Klik untuk membuka detail ${pinTitleText}`}
              className={`relative flex items-center h-10 px-2.5 rounded-full shadow-2xl backdrop-blur-md border text-xs font-bold transition-all duration-300 ease-out group-hover:px-3.5 group-hover:rounded-2xl ${
                isOpen
                  ? "ring-4 ring-lime-400 shadow-glow-lime scale-105"
                  : ""
              } ${
                pinIsPJU
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
              <div className="flex items-center justify-center shrink-0">
                {pinIsPJU ? (
                  <Building className="w-4 h-4 text-slate-950" />
                ) : isResto ? (
                  <Utensils className="w-4 h-4 text-emerald-400" />
                ) : isMasjid ? (
                  <Compass className="w-4 h-4 text-indigo-400" />
                ) : isBallroom ? (
                  <Building className="w-4 h-4 text-purple-400" />
                ) : isHelipad ? (
                  <MapPin className="w-4 h-4 text-amber-400" />
                ) : isSpot ? (
                  <Camera className="w-4 h-4 text-cyan-400 animate-pulse" />
                ) : (
                  <Building className="w-4 h-4 text-emerald-400" />
                )}
              </div>

              {pinLegendNum && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black shadow-md border group-hover:opacity-0 group-hover:scale-50 transition-all pointer-events-none bg-slate-950 text-white border-white/40">
                  {pinLegendNum}
                </span>
              )}

              <div className="max-w-0 opacity-0 group-hover:max-w-[280px] group-hover:opacity-100 transition-all duration-300 ease-out overflow-hidden flex items-center gap-1.5 whitespace-nowrap ml-0 group-hover:ml-2">
                <span className="font-mono font-black opacity-90 text-[11px]">
                  No. {pinLegendNum}
                </span>
                <span className="font-extrabold text-xs truncate">
                  {pinPlaceName}
                </span>
              </div>

              <span
                className={`w-2 h-2 rounded-full shrink-0 ml-0.5 group-hover:ml-1.5 ${
                  pinIsPJU
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

      {/* Centered 2-Column Split Modal Popup Card with Artistic Mosaic Photo Collage */}
      {mounted && isOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-[1040px] lg:max-w-[1140px] max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl border-2 bg-[#102306]/98 border-lime-400/90 ring-4 ring-lime-400/25 shadow-glow-lime flex flex-col md:grid md:grid-cols-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT COLUMN: Content, Tabs, Menus, Activities & Controls (Col 6) */}
            <div className="md:col-span-6 flex flex-col border-b md:border-b-0 md:border-r border-lime-500/30 overflow-hidden bg-[#102306]/95">
              {/* Header Bar */}
              <div className="p-4 sm:p-4.5 border-b border-lime-500/25 bg-[#0b1a03]/90 flex items-center justify-between shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#18350a] text-butter-200 border border-lime-400/60 text-xs font-black font-mono shadow-md flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-lime-400" />
                    <span>No. {legendNum}</span>
                  </span>

                  {subtitleText && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-md ${
                        isPJU
                          ? "bg-butter-pill text-lime-950 border-amber-300 shadow-glow-butter"
                          : "bg-[#18350a]/90 text-lime-200 border-lime-500/40"
                      }`}
                    >
                      {subtitleText}
                    </span>
                  )}

                  {timeRangeStr && (
                    <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 text-slate-300 text-xs font-mono font-bold border border-white/15">
                      <Clock className="w-3 h-3 text-lime-400" />
                      <span>{timeRangeStr}</span>
                    </span>
                  )}
                </div>

                {/* Compact Control Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onFocusPinPoint) {
                        onFocusPinPoint(activeFocusCoords);
                      }
                      onClose();
                    }}
                    title={`Fokuskan Titik ${placeName} di Peta`}
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-lime-400 hover:text-slate-950 text-lime-300 border border-lime-400/50 flex items-center justify-center transition-colors cursor-pointer shadow-md"
                  >
                    <Compass className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    title="Kecilkan Popup"
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-butter-pill hover:text-lime-950 text-butter-300 border border-amber-400/50 flex items-center justify-center transition-colors cursor-pointer shadow-md"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    title="Tutup Popup"
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-rose-500 text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Description Overview */}
              <div className="p-4 sm:p-5 pb-3 border-b border-lime-500/20 space-y-1.5 shrink-0 bg-[#122807]/70">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{titleText}</span>
                  {isPJU && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase shadow-sm">
                      👑 PJU
                    </span>
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-lime-100/90 leading-relaxed line-clamp-3">
                  {descriptionText}
                </p>
              </div>

              {/* 3 KAMAR PENGINAPAN SWITCHER (Khusus Check-in / Kamar) */}
              {isAccommodation && (
                <div className="bg-[#0b1a03] p-3 sm:p-3.5 border-b border-lime-500/30 space-y-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-lime-300 tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-lime-400" />
                      Pilihan 3 Kamar Penginapan
                    </span>
                    <span className="text-[10px] font-bold text-butter-300 bg-black/50 px-2 py-0.5 rounded-full border border-lime-500/30">
                      Beralih Kamar
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
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
                          className={`relative p-1.5 sm:p-2 rounded-2xl border transition-all text-left flex flex-col gap-1 cursor-pointer select-none group ${
                            isSelected
                              ? "bg-[#1c3a0b] border-lime-400 ring-2 ring-lime-400/80 shadow-glow-lime scale-[1.02]"
                              : "bg-black/50 border-lime-500/25 hover:border-lime-400/60 hover:bg-[#142807]/80 opacity-80 hover:opacity-100"
                          }`}
                        >
                          <div className="relative w-full h-14 sm:h-16 rounded-xl overflow-hidden bg-black border border-lime-500/30">
                            <Image
                              src={room.image}
                              alt={room.name}
                              fill
                              unoptimized
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <span
                              className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black font-mono shadow ${
                                room.isPJU
                                  ? "bg-amber-400 text-slate-950 font-black shadow-glow-gold"
                                  : "bg-black/85 text-white border border-white/20"
                              }`}
                            >
                              No. {room.legendNumber}
                            </span>
                            {isSelected && (
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-lime-400 text-slate-950 text-[8px] font-black shadow flex items-center gap-0.5">
                                ✓ Aktif
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tight truncate ${
                                room.isPJU ? "text-amber-300" : "text-lime-200"
                              }`}
                            >
                              {room.role}
                            </span>
                            <span className="text-[11px] sm:text-xs font-extrabold text-white truncate">
                              {room.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-Tabs Selector */}
              {(hasMenu || hasGames || hasFacilities) && (
                <div className="flex items-center bg-[#091502] border-b border-lime-500/25 px-4 py-2 gap-2 text-xs font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab("detail")}
                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "detail"
                        ? "bg-butter-pill text-lime-950 font-black shadow-md"
                        : "text-lime-200 hover:text-white"
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Detail Info</span>
                  </button>

                  {hasMenu && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("menu")}
                      className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
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
                      className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === "games"
                          ? "bg-butter-pill text-lime-950 font-black shadow-md"
                          : "text-lime-200 hover:text-white"
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Games & Acara</span>
                    </button>
                  )}

                  {hasFacilities && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("fasilitas")}
                      className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === "fasilitas"
                          ? "bg-butter-pill text-lime-950 font-black shadow-md"
                          : "text-lime-200 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fasilitas ({facilitiesList?.length || 0})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Tab Contents Area (Scrollable with max height) */}
              <div className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto custom-scrollbar bg-[#102306]">
                {/* 1. DETAIL TAB */}
                {activeTab === "detail" && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-lime-500/20 space-y-2">
                      <span className="text-xs font-black uppercase text-lime-300 tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                        Informasi Utama Lokasi
                      </span>
                      <p className="text-xs sm:text-sm text-lime-100/90 leading-relaxed">
                        {descriptionText}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center gap-2 text-xs text-lime-200">
                        <Building className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Titik Legenda: No. {legendNum}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center gap-2 text-xs text-lime-200">
                        <Camera className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Kolase Foto: {imageList.length} Media</span>
                      </div>
                    </div>

                    {isPJU && (
                      <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                        <span><strong>Catatan PJU:</strong> Diperuntukkan bagi Pejabat Utama Pusziad beserta Keluarga.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. MENU TAB */}
                {activeTab === "menu" && hasMenu && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-lime-500/20 text-xs font-bold">
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

                    {(menuFilter === "all" || menuFilter === "lunch") && (
                      <div className="rounded-2xl overflow-hidden border-2 border-[#1c4e25] shadow-lg bg-[#faf8f2]">
                        <div className="bg-[#1c4e25] px-3.5 py-2 flex items-center justify-between">
                          <span className="font-black text-white text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5">
                            <Utensils className="w-4 h-4 text-lime-300" />
                            LUNCH (PAKET B)
                          </span>
                          <span className="bg-[#a3442a] text-white font-black text-xs px-2.5 py-0.5 rounded shadow-sm">
                            B
                          </span>
                        </div>

                        <div className="p-3 text-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                          {["Steamed Rice", "Cream Potato Soup", "Capcay", "Gepuk Chicken", "Sweet and Sour Snapper", "Mixed Fruits", "Pudding"].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(menuFilter === "all" || menuFilter === "coffeebreak") && (
                      <div className="rounded-2xl overflow-hidden border-2 border-[#1c4e25] shadow-lg bg-[#faf8f2]">
                        <div className="bg-[#1c4e25] px-3.5 py-2 flex items-center justify-between">
                          <span className="font-black text-white text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5">
                            <Coffee className="w-4 h-4 text-lime-300" />
                            COFFEE BREAK (PAKET B)
                          </span>
                          <span className="bg-[#a3442a] text-white font-black text-xs px-2.5 py-0.5 rounded shadow-sm">
                            B
                          </span>
                        </div>

                        <div className="p-3 text-slate-900 space-y-2.5">
                          <div>
                            <span className="text-[11px] font-black text-emerald-900 uppercase">CB 1 (Morning):</span>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 pl-2">
                              {["Chicken Nugget", "Panettone", "Velvet Roll", "Assorted Chips", "Coffee & Tea"].map((item, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-800">
                                  <span className="w-1 h-1 rounded-full bg-slate-800" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-[11px] font-black text-emerald-900 uppercase">CB 2 (Afternoon):</span>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 pl-2">
                              {["Marble Green Tea Cake", "Black Forest Roll", "Sausage Orly", "Assorted Chips", "Coffee & Tea"].map((item, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-800">
                                  <span className="w-1 h-1 rounded-full bg-slate-800" />
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

                {/* 3. GAMES TAB */}
                {activeTab === "games" && hasGames && (
                  <div className="space-y-3">
                    {gamesList?.map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-2"
                      >
                        <div className="flex items-center gap-2.5">
                          {sub.image && (
                            <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-emerald-500/30">
                              <Image src={sub.image} alt={sub.title} fill unoptimized className="object-cover" />
                            </div>
                          )}
                          <div className="text-xs sm:text-sm font-black text-emerald-300">{sub.title}</div>
                        </div>
                        {sub.items && (
                          <div className="flex flex-wrap gap-1.5">
                            {sub.items.map((it, itIdx) => (
                              <span
                                key={itIdx}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-slate-200"
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

                {/* 4. FASILITAS TAB */}
                {activeTab === "fasilitas" && hasFacilities && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {facilitiesList?.map((fac, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                        <span className="font-semibold">{fac}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Natural Widescreen Spotlight + Multi-Photo Mosaic Grid (Col 6) */}
            <div className="md:col-span-6 relative bg-[#061002] flex flex-col justify-between overflow-hidden p-3 sm:p-4 gap-3 min-h-[380px] md:min-h-[520px]">
              {/* Top Bar: Header + Auto-Slide Play/Pause & Fullscreen Button */}
              <div className="flex items-center justify-between px-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-lime-300 tracking-wider flex items-center gap-1.5">
                    <LayoutGrid className="w-4 h-4 text-lime-400" />
                    Galeri Kolase ({imageList.length} Foto)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/15 text-[10px] font-mono font-bold text-lime-200">
                    Foto {activeImageIndex + 1} dari {imageList.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {imageList.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAutoSlideActive((prev) => !prev);
                      }}
                      title={isAutoSlideActive ? "Jeda Sorotan Kolase" : "Mulai Sorotan Kolase Otomatis"}
                      className="px-2.5 py-1 rounded-full bg-black/70 hover:bg-lime-400 hover:text-slate-950 text-lime-300 border border-lime-400/40 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-md"
                    >
                      {isAutoSlideActive ? (
                        <>
                          <Pause className="w-3 h-3 text-lime-400" />
                          <span>Auto</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Play</span>
                        </>
                      )}
                    </button>
                  )}

                  {imageList.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFullFrame(true);
                      }}
                      title="Perbesar Galeri (Fullscreen)"
                      className="p-1.5 rounded-full bg-black/70 hover:bg-lime-400 hover:text-slate-950 text-lime-300 border border-lime-400/40 transition-colors cursor-pointer shadow-md"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 1. MAIN FEATURED WIDESCREEN STAGE (Natural 16:10 Frame - Minimizes Cropping) */}
              <div className="relative w-full h-[220px] sm:h-[260px] md:h-[280px] rounded-2xl overflow-hidden border-2 border-lime-400/60 bg-black shadow-2xl shrink-0 group">
                <AnimatePresence mode="wait">
                  {currentImage && isVideo(currentImage) ? (
                    <motion.div
                      key={currentImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="relative w-full h-full bg-black flex items-center justify-center"
                    >
                      <video
                        src={currentImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain bg-black"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 text-butter-200 text-xs font-bold border border-lime-500/40 flex items-center gap-1.5 z-10">
                        <Video className="w-3.5 h-3.5 text-lime-400" />
                        <span>Video Sinematik</span>
                      </div>
                    </motion.div>
                  ) : currentImage ? (
                    <motion.div
                      key={currentImage}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                      className="relative w-full h-full bg-black"
                    >
                      <Image
                        src={currentImage}
                        alt={titleText}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 600px"
                        className="object-cover object-center"
                      />
                    </motion.div>
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">
                      <Building className="w-12 h-12" />
                    </div>
                  )}
                </AnimatePresence>

                {/* Left & Right Chevron Navigation */}
                {imageList.length > 1 && (
                  <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
                      }}
                      className="w-8 h-8 rounded-full bg-black/75 hover:bg-lime-400 text-white hover:text-slate-950 flex items-center justify-center border border-white/20 pointer-events-auto transition-colors shadow-lg cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
                      }}
                      className="w-8 h-8 rounded-full bg-black/75 hover:bg-lime-400 text-white hover:text-slate-950 flex items-center justify-center border border-white/20 pointer-events-auto transition-colors shadow-lg cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* 2. BALANCED MOSAIC GRID TILES (Semua Foto Tertata Proporsional Tanpa Terpotong Ekstrim) */}
              <div className="flex-1 flex flex-col justify-center space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase text-lime-300 tracking-wider">
                    Pilihan Koleksi Foto ({imageList.length})
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Klik foto untuk sorotan
                  </span>
                </div>

                <div className={`grid gap-2 ${
                  imageList.length <= 2
                    ? "grid-cols-2"
                    : imageList.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-4"
                }`}>
                  {imageList.slice(0, 4).map((img, idx) => {
                    const isSelected = idx === activeImageIndex;
                    const isMoreCount = imageList.length > 4 && idx === 3;
                    const remainingCount = imageList.length - 4;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(idx);
                        }}
                        className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer group select-none ${
                          isSelected
                            ? "border-lime-400 ring-2 ring-lime-400/90 shadow-glow-lime scale-[1.03] z-10"
                            : "border-lime-500/30 opacity-75 hover:opacity-100 hover:scale-[1.02] hover:border-lime-400/60"
                        }`}
                      >
                        {isVideo(img) ? (
                          <div className="w-full h-full bg-black flex items-center justify-center">
                            <Video className="w-5 h-5 text-lime-400" />
                          </div>
                        ) : (
                          <Image
                            src={img}
                            alt={`Kolase ${idx + 1}`}
                            fill
                            unoptimized
                            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                          />
                        )}

                        {isSelected && (
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-lime-400 text-slate-950 font-mono font-black text-[9px] shadow-md flex items-center gap-0.5">
                            ✓ Aktif
                          </div>
                        )}

                        {isMoreCount && remainingCount > 0 && (
                          <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-white font-black text-xs backdrop-blur-xs">
                            +{remainingCount} Foto
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Info Footer */}
              <div className="flex items-center justify-between px-1 text-[11px] text-zinc-300 shrink-0 border-t border-lime-500/20 pt-2">
                <span className="font-medium truncate max-w-[280px]">
                  {placeName} • Format Widescreen HD
                </span>
                <span className="text-lime-300 font-mono font-bold text-[10px]">
                  {isAutoSlideActive ? "⚡ Auto-Slide Aktif" : "⏸ Dijeda"}
                </span>
              </div>
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
              className="w-full flex items-center justify-between border-b border-lime-500/30 pb-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-lime-400 text-slate-950 font-black shadow-lg">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-white font-display leading-tight">
                    {titleText}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    The Highland Park Resort - Hotel Bogor • Galeri Foto Kolase & Video
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-xl bg-black/80 border border-lime-400/40 text-lime-300 font-mono text-xs font-bold shadow-md">
                  {activeImageIndex + 1} / {imageList.length}
                </span>

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
              {imageList.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1))
                  }
                  className="absolute left-2 sm:left-6 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/80 hover:bg-lime-400 text-white hover:text-slate-950 border border-lime-400/50 flex items-center justify-center transition-all shadow-2xl cursor-pointer hover:scale-110"
                  title="Sebelumnya (←)"
                >
                  <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
              )}

              <div className="relative w-full h-full max-h-[75vh] flex items-center justify-center">
                {currentImage && isVideo(currentImage) ? (
                  <video
                    key={currentImage}
                    src={currentImage}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl border border-lime-400/40 bg-black"
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

              {imageList.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-2 sm:right-6 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/80 hover:bg-lime-400 text-white hover:text-slate-950 border border-lime-400/50 flex items-center justify-center transition-all shadow-2xl cursor-pointer hover:scale-110"
                  title="Berikutnya (→)"
                >
                  <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
              )}
            </div>

            {/* Bottom Filmstrip Thumbnail Row */}
            <div
              className="w-full bg-black/80 backdrop-blur-md rounded-2xl border border-lime-500/30 p-2.5 space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs text-zinc-300 text-center line-clamp-1">
                {descriptionText}
              </p>

              {imageList.length > 1 && (
                <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 px-2 custom-scrollbar">
                  {imageList.map((mediaUrl, fIdx) => (
                    <button
                      key={fIdx}
                      type="button"
                      onClick={() => setActiveImageIndex(fIdx)}
                      className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        fIdx === activeImageIndex
                          ? "border-lime-400 ring-2 ring-lime-400 shadow-glow-lime scale-105"
                          : "border-zinc-700 opacity-60 hover:opacity-100 hover:border-lime-400"
                      }`}
                    >
                      {isVideo(mediaUrl) ? (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <Video className="w-4 h-4 text-lime-400" />
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
