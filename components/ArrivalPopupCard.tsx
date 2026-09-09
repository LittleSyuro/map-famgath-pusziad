"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  VIPArrival,
  RundownItem,
  AccommodationRoom,
  HighlightSpot,
  KeyEventPinpoint,
  DAY1_DINNER_MENU,
  DAY2_BREAKFAST_MENU,
  DAY1_GAMES_PJU,
  DAY1_GAMES_IBU_PJU,
  WALKING_ROUTES_DAY2,
  Waypoint,
} from "@/data/arrivals";
import {
  Clock,
  X,
  Sparkles,
  Building,
  Utensils,
  Trophy,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Route,
  Gift,
  Compass,
  Coffee,
  Camera,
  Crown,
  Plane,
  BedDouble,
  Mountain,
  Tent,
  Landmark,
  PartyPopper,
} from "lucide-react";

// Distinct icon per map pin, instead of the same generic building icon
// for every single stop — matched by KeyEventPinpoint.id.
const PIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "pin-helipad": Plane,
  "pin-alpine": BedDouble,
  "pin-cave": Mountain,
  "pin-mongolian": Tent,
  "pin-masjid": Landmark,
  "pin-resto": Utensils,
  "pin-ballroom": PartyPopper,
  "pin-bridge": Camera,
  "pin-kopihip": Coffee,
};

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
  const [activeTab, setActiveTab] = useState<"menu" | "games" | "rute" | "fasilitas">("fasilitas");
  const [activeWalkingRouteTab, setActiveWalkingRouteTab] = useState<"pju" | "anggota">("pju");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullFrame, setIsFullFrame] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMarkerHovered, setIsMarkerHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Room item from agenda or keyPinpoint
  const activeRoom = agendaItem?.roomSingle || roomData || null;

  // Determine images array
  const imageList = useMemo(() => {
    if (activeRoom) {
      if (activeRoom.detailImages && activeRoom.detailImages.length > 0) {
        return activeRoom.detailImages;
      }
      return [activeRoom.image];
    }
    if (agendaItem?.galleryImages && agendaItem.galleryImages.length > 0) {
      return agendaItem.galleryImages;
    }
    if (keyPinpoint?.galleryImages && keyPinpoint.galleryImages.length > 0) {
      return keyPinpoint.galleryImages;
    }
    if (keyPinpoint?.image) {
      return [keyPinpoint.image];
    }
    if (spotData?.image) {
      return [spotData.image];
    }
    return vip?.roomImage ? [vip.roomImage] : [];
  }, [activeRoom, agendaItem?.galleryImages, keyPinpoint?.galleryImages, keyPinpoint?.image, spotData?.image, vip?.roomImage]);

  const currentImage = imageList[activeImageIndex] || imageList[0] || activeRoom?.image || keyPinpoint?.image || vip?.roomImage || "";

  // Synchronize tabs when opened
  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
      if (agendaItem?.id === "d1-dinner" || agendaItem?.id === "d2-breakfast" || keyPinpoint?.id === "pin-resto") {
        setActiveTab("menu");
      } else if (agendaItem?.id === "d1-games" || agendaItem?.pjuGames) {
        setActiveTab("games");
      } else if (agendaItem?.id === "d2-jalan-sehat" || agendaItem?.walkingRoutes) {
        setActiveTab("rute");
      } else if (activeRoom?.facilities && activeRoom.facilities.length > 0) {
        setActiveTab("fasilitas");
      }
    }
  }, [isOpen, agendaItem?.id, keyPinpoint?.id, activeRoom]);

  // Photo slider arrow keys (ArrowLeft / ArrowRight) & Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullFrame) {
          setIsFullFrame(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFullFrame, imageList.length, onClose]);

  const pinX = keyPinpoint?.coords.x ?? roomData?.coords.x ?? spotData?.coords.x ?? vip?.roomX ?? 50;
  const pinY = keyPinpoint?.coords.y ?? roomData?.coords.y ?? spotData?.coords.y ?? vip?.roomY ?? 50;
  const offsetX = vip?.popupOffsetX || 0;
  const offsetY = vip?.popupOffsetY || 0;

  // Clean title without technical numbers ("No. 36a", "No. 25", etc.)
  const placeName = activeRoom?.name || agendaItem?.title || keyPinpoint?.name || roomData?.name || spotData?.name || vip?.mapLocationName || "";
  const subtitleText = activeRoom?.role ? `${activeRoom.role} (${activeRoom.totalUnits})` : agendaItem?.badge || keyPinpoint?.category || "";
  const isPJU = !!(activeRoom?.isPJU || keyPinpoint?.isPJU || agendaItem?.badge?.includes("PJU") || vip?.isPJU);
  // ArrivalMap only passes agendaItem for the pin that's the CURRENT agenda's
  // destination — so this marks "happening now / about to open" on the map,
  // distinct from every other pin that's just sitting there unrelated.
  const isCurrentAgendaPin = Boolean(agendaItem);

  const activeFocusCoords = activeRoom ? activeRoom.coords : { x: pinX, y: pinY };
  const timeRangeStr = agendaItem?.startTime && agendaItem?.endTime ? `${agendaItem.startTime} - ${agendaItem.endTime} WIB` : "";

  // Content flags
  const isDay1Dinner = agendaItem?.id === "d1-dinner" || (agendaItem?.day === 1 && keyPinpoint?.id === "pin-resto");
  const isDay2Breakfast = agendaItem?.id === "d2-breakfast" || (agendaItem?.day === 2 && keyPinpoint?.id === "pin-resto");
  const hasMenu = isDay1Dinner || isDay2Breakfast;

  const isGames = agendaItem?.id === "d1-games" || !!agendaItem?.pjuGames;
  const hasWalkingRoutes = agendaItem?.id === "d2-jalan-sehat" || !!agendaItem?.walkingRoutes;
  const facilitiesList = activeRoom?.facilities || keyPinpoint?.facilities || [];
  const hasFacilities = facilitiesList.length > 0;
  const hasTabs = Boolean(hasMenu || isGames || hasWalkingRoutes || hasFacilities);
  // These agenda items reuse a map pin (for waypoint routing only) whose own description
  // doesn't belong on the agenda card: "d2-prep-jalan-santai"/"d2-freetime" were inheriting
  // pin-helipad's "Selamat Datang..." arrival blurb, and "d2-jalan-santai" was inheriting
  // pin-bridge's "Titik akhir jalan santai..." — that's just the mid-route photo stopover
  // (Tangga Kolam), not a description of the walk itself; the per-route tabs below already
  // carry the real route descriptions, and the walk's distance/duration now lives on the
  // "Titik Start & Finish Jalan Santai" card instead. Suppress just for these three; every
  // other card keeps showing its pin's description as before.
  const suppressPinDescription =
    agendaItem?.id === "d2-prep-jalan-santai" ||
    agendaItem?.id === "d2-freetime" ||
    agendaItem?.id === "d2-jalan-santai";
  // pin-resto's description covers both Day 1 Dinner and Day 2 Breakfast ("...makan malam
  // dan sarapan pagi..."), so the Day 2 Breakfast card was showing a stray dinner mention.
  const descriptionOverrides: Record<string, string> = {
    "d2-breakfast": "Area Resto Lantai 2 untuk santap sarapan pagi bersama.",
  };
  const descriptionText =
    activeRoom?.description ||
    agendaItem?.description ||
    (agendaItem?.id ? descriptionOverrides[agendaItem.id] : undefined) ||
    (suppressPinDescription ? "" : keyPinpoint?.description) ||
    spotData?.description ||
    "";

  const activeWalkingRoute = WALKING_ROUTES_DAY2.find((r) => r.id === activeWalkingRouteTab) || WALKING_ROUTES_DAY2[0];
  const PinIcon = (keyPinpoint?.id && PIN_ICONS[keyPinpoint.id]) || Building;

  return (
    <>
      {/* On-Map Marker Pin — icon-only by default so many markers don't pile up into
          overlapping text pills; the name shows as a small tooltip on hover, or while open. */}
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
        onMouseEnter={() => setIsMarkerHovered(true)}
        onMouseLeave={() => setIsMarkerHovered(false)}
      >
        {/* Beacon ring: marks this pin as the CURRENT agenda's destination —
            "about to open" or "happening now" — so it reads apart from every
            other, unrelated pin sitting quietly on the map. */}
        {isCurrentAgendaPin && !isOpen && (
          <span className="absolute inset-0 rounded-full bg-cyan-400/50 animate-ping pointer-events-none" />
        )}
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title={`Buka detail ${placeName}`}
          aria-label={`Buka detail ${placeName}`}
          className={`relative flex items-center justify-center w-9 h-9 rounded-full shadow-2xl backdrop-blur-md border transition-all duration-200 ease-out ${
            isOpen
              ? "ring-4 ring-lime-400 scale-105"
              : isCurrentAgendaPin
              ? "ring-4 ring-cyan-300 scale-110"
              : ""
          } ${
            isCurrentAgendaPin && !isOpen
              ? "bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-slate-950 border-white shadow-[0_0_18px_rgba(34,211,238,0.75)]"
              : isPJU
              ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 border-white ring-2 ring-amber-400/70 shadow-glow-gold"
              : "bg-[#0b1f0c]/95 text-emerald-200 border-emerald-400/80 ring-1 ring-emerald-400/30 shadow-lg"
          }`}
        >
          <PinIcon
            className={`w-4 h-4 ${
              isCurrentAgendaPin && !isOpen ? "text-slate-950" : isPJU ? "text-slate-950" : "text-lime-400"
            }`}
          />
        </motion.div>

        {/* Name label: only appears on hover / while open, instead of always-on */}
        {(isMarkerHovered || isOpen) && (
          <div
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-bold shadow-2xl backdrop-blur-md border pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${
              isPJU
                ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 border-white font-black shadow-glow-gold"
                : "bg-[#0b1f0c]/95 text-emerald-200 border-emerald-400/80 shadow-lg"
            }`}
          >
            {placeName}
          </div>
        )}
      </div>

      {/* Presentation Modal Card */}
      {mounted && isOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none overflow-y-auto"
          onClick={onClose}
        >
          {!hasTabs ? (
            /* CLEAN VERTICAL CARD (Photo on top, text underneath, no empty blank spaces) */
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-[780px] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl border-2 bg-[#0e1d03]/98 border-lime-400/80 ring-4 ring-lime-400/20 flex flex-col my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Header Bar */}
              <div className="p-3.5 sm:p-4 border-b border-lime-500/20 bg-[#091502] flex items-center justify-between shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  {agendaItem?.day && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-md flex items-center gap-1 ${
                        agendaItem.day === 1
                          ? "bg-emerald-500 text-slate-950 border-emerald-300"
                          : "bg-amber-400 text-slate-950 border-amber-300"
                      }`}
                    >
                      <span>{agendaItem.day === 1 ? "🌿 Hari 1" : "☀️ Hari 2"}</span>
                    </span>
                  )}

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-md flex items-center gap-1.5 ${
                      isPJU
                        ? "bg-amber-400 text-slate-950 border-white shadow-glow-gold"
                        : "bg-[#18350a] text-lime-200 border-lime-400/50"
                    }`}
                  >
                    <span>{subtitleText}</span>
                  </span>

                  {timeRangeStr && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-slate-200 text-xs font-mono font-bold border border-white/10">
                      <Clock className="w-3 h-3 text-lime-400" />
                      <span>{timeRangeStr}</span>
                    </span>
                  )}
                </div>

                {/* Focus & Close Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onFocusPinPoint) onFocusPinPoint(activeFocusCoords);
                      onClose();
                    }}
                    title={`Fokuskan ${placeName} di Peta`}
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-lime-400 hover:text-slate-950 text-lime-300 border border-lime-400/40 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    title="Tutup Popup"
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-rose-500 text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Featured Photo Frame */}
              <div className="relative w-full bg-[#061002] p-3 sm:p-4 flex flex-col gap-2">
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[460px] rounded-2xl overflow-hidden border-2 border-lime-400/50 bg-black shadow-2xl group">
                  <AnimatePresence mode="wait">
                    {currentImage && isVideo(currentImage) ? (
                      <motion.div
                        key={currentImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                      </motion.div>
                    ) : currentImage ? (
                      <motion.div
                        key={currentImage}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full h-full bg-black"
                      >
                        <Image
                          src={currentImage}
                          alt={placeName}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="object-contain sm:object-cover object-center"
                        />
                      </motion.div>
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">
                        <Building className="w-12 h-12" />
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Left & Right Chevrons */}
                  {imageList.length > 1 && (
                    <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
                        }}
                        title="Foto Sebelumnya (Panah Kiri / ◀)"
                        className="w-10 h-10 rounded-full bg-black/85 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center border-2 border-lime-400/60 pointer-events-auto transition-all duration-200 shadow-glow-gold cursor-pointer hover:scale-110 active:scale-95"
                      >
                        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
                        }}
                        title="Foto Berikutnya (Panah Kanan / ▶)"
                        className="w-10 h-10 rounded-full bg-black/85 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center border-2 border-lime-400/60 pointer-events-auto transition-all duration-200 shadow-glow-gold cursor-pointer hover:scale-110 active:scale-95"
                      >
                        <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                      </button>
                    </div>
                  )}

                  {/* Fullscreen & Counter on top of photo */}
                  <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                    {imageList.length > 1 && (
                      <span className="px-2.5 py-1 rounded-full bg-black/80 text-amber-300 border border-amber-400/50 font-mono text-[11px] font-black shadow-md backdrop-blur-sm">
                        {activeImageIndex + 1} / {imageList.length}
                      </span>
                    )}
                    {imageList.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFullFrame(true);
                        }}
                        title="Perbesar Galeri (Fullscreen)"
                        className="p-1.5 rounded-full bg-black/70 hover:bg-lime-400 hover:text-slate-950 text-lime-300 border border-lime-400/40 transition-colors cursor-pointer shadow-md backdrop-blur-sm"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Thumbnails row if multiple images */}
                {imageList.length > 1 && (
                  <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 shrink-0">
                    {imageList.map((img, idx) => {
                      const isSelected = idx === activeImageIndex;
                      const isMediaVideo = isVideo(img);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex(idx);
                          }}
                          className={`relative w-14 h-11 rounded-lg overflow-hidden border transition-all shrink-0 cursor-pointer flex items-center justify-center bg-black ${
                            isSelected
                              ? "border-amber-400 ring-2 ring-amber-400/80 scale-105 shadow-glow-gold"
                              : "border-white/20 opacity-60 hover:opacity-100"
                          }`}
                        >
                          {isMediaVideo ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-950/90 to-black text-amber-300">
                              <span className="text-xs">🎬</span>
                              <span className="text-[7px] font-mono font-bold tracking-tight text-amber-200">VIDEO</span>
                            </div>
                          ) : (
                            <Image src={img} alt={`Foto ${idx + 1}`} fill unoptimized className="object-cover" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Info Section (Tulisan di Bawah) */}
              <div className="p-4 sm:p-5 border-t border-lime-500/20 bg-[#0d1c04] space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {placeName}
                  </h3>
                  {activeRoom?.totalUnits && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-400/50 text-amber-200 text-xs font-black">
                      <span>🏠 Total Unit: {activeRoom.totalUnits}</span>
                    </div>
                  )}
                </div>

                {descriptionText && (
                  <p className="text-xs sm:text-sm text-lime-100/90 leading-relaxed pt-1">
                    {descriptionText}
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            /* TABBED 2-COLUMN CARD (For rooms with facilities, menus, games, and routes) */
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-[1000px] max-h-[86vh] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl border-2 bg-[#0e1d03]/98 border-lime-400/80 ring-4 ring-lime-400/20 flex flex-col md:grid md:grid-cols-12 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* LEFT COLUMN: Simplified Hotel Information (Col 6) */}
              <div className="md:col-span-6 flex flex-col border-b md:border-b-0 md:border-r border-lime-500/25 overflow-hidden bg-[#0d1c04]">
                {/* Header Bar */}
                <div className="p-3.5 sm:p-4 border-b border-lime-500/20 bg-[#091502] flex items-center justify-between shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {agendaItem?.day && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-md flex items-center gap-1 ${
                          agendaItem.day === 1
                            ? "bg-emerald-500 text-slate-950 border-emerald-300"
                            : "bg-amber-400 text-slate-950 border-amber-300"
                        }`}
                      >
                        <span>{agendaItem.day === 1 ? "🌿 Hari 1" : "☀️ Hari 2"}</span>
                      </span>
                    )}

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-md flex items-center gap-1.5 ${
                        isPJU
                          ? "bg-amber-400 text-slate-950 border-white shadow-glow-gold"
                          : "bg-[#18350a] text-lime-200 border-lime-400/50"
                      }`}
                    >
                      <span>{subtitleText}</span>
                    </span>

                    {timeRangeStr && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-slate-200 text-xs font-mono font-bold border border-white/10">
                        <Clock className="w-3 h-3 text-lime-400" />
                        <span>{timeRangeStr}</span>
                      </span>
                    )}
                  </div>

                  {/* Focus & Close Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onFocusPinPoint) onFocusPinPoint(activeFocusCoords);
                        onClose();
                      }}
                      title={`Fokuskan ${placeName} di Peta`}
                      className="w-8 h-8 rounded-full bg-black/60 hover:bg-lime-400 hover:text-slate-950 text-lime-300 border border-lime-400/40 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      title="Tutup Popup"
                      className="w-8 h-8 rounded-full bg-black/60 hover:bg-rose-500 text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Description with Total Units */}
                <div className="p-4 pb-3 border-b border-lime-500/20 space-y-1.5 shrink-0 bg-[#122807]/50">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>{placeName}</span>
                  </h3>

                  {activeRoom?.totalUnits && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-400/50 text-amber-200 text-xs font-black">
                      <span>🏠 Total Unit: {activeRoom.totalUnits}</span>
                    </div>
                  )}

                  {descriptionText && (
                    <p className="text-xs sm:text-sm text-lime-100/90 leading-relaxed pt-1">
                      {descriptionText}
                    </p>
                  )}
                </div>

                {/* TABS (Fasilitas / Menu / Games / Rute) */}
                <div className="flex items-center bg-[#071102] border-b border-lime-500/20 px-3 py-1.5 gap-1.5 text-xs font-bold shrink-0 overflow-x-auto">
                  {hasFacilities && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("fasilitas")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        activeTab === "fasilitas"
                          ? "bg-amber-400 text-slate-950 font-black shadow-md"
                          : "text-lime-200 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fasilitas</span>
                    </button>
                  )}

                  {hasMenu && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("menu")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        activeTab === "menu"
                          ? "bg-amber-400 text-slate-950 font-black shadow-md"
                          : "text-lime-200 hover:text-white"
                      }`}
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>{isDay1Dinner ? "Menu Makan Malam" : "Menu Sarapan Pagi"}</span>
                    </button>
                  )}

                  {isGames && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("games")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        activeTab === "games"
                          ? "bg-amber-400 text-slate-950 font-black shadow-md"
                          : "text-lime-200 hover:text-white"
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Detail Games</span>
                    </button>
                  )}

                  {hasWalkingRoutes && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("rute")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        activeTab === "rute"
                          ? "bg-amber-400 text-slate-950 font-black shadow-md"
                          : "text-lime-200 hover:text-white"
                      }`}
                    >
                      <Route className="w-3.5 h-3.5" />
                      <span>Pilihan Rute</span>
                    </button>
                  )}
                </div>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-white">
                  {/* Fasilitas */}
                  {activeTab === "fasilitas" && hasFacilities && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        {facilitiesList.map((fac, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/40 border border-lime-500/20 text-xs text-lime-100"
                          >
                            <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">{fac}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Menu Makan */}
                  {activeTab === "menu" && hasMenu && (
                    <div className="space-y-3">
                      {(isDay1Dinner ? DAY1_DINNER_MENU : DAY2_BREAKFAST_MENU).map((cat, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-black/40 border border-lime-500/25 space-y-2"
                        >
                          <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                            {cat.category}
                          </span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {cat.items.map((item, itemIdx) => (
                              <div
                                key={itemIdx}
                                className="text-xs text-slate-200 flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Games */}
                  {activeTab === "games" && isGames && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-black/40 border border-lime-500/25 space-y-2">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                          Games PJU
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {DAY1_GAMES_PJU.items.map((g, idx) => (
                            <div key={idx} className="text-xs text-slate-200 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                              <span>{g}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-black/40 border border-lime-500/25 space-y-2">
                        <span className="text-xs font-black uppercase tracking-wider text-pink-300">
                          Games Ibu-Ibu PJU
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {DAY1_GAMES_IBU_PJU.items.map((g, idx) => (
                            <div key={idx} className="text-xs text-slate-200 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
                              <span>{g}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rute Jalan Sehat — both routes shown stacked (PJU on top,
                      Anggota below) instead of behind a tab switch, so
                      neither description stays hidden. */}
                  {activeTab === "rute" && hasWalkingRoutes && (
                    <div className="space-y-3">
                      {WALKING_ROUTES_DAY2.map((route) => (
                        <div
                          key={route.id}
                          className="p-3.5 rounded-2xl bg-black/40 border space-y-2.5"
                          style={{ borderColor: `${route.color}66` }}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-1.5">
                            <span
                              className={`text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                                route.id === "pju" ? "text-slate-950" : "text-white"
                              }`}
                              style={{ backgroundColor: route.color }}
                            >
                              <Route className="w-3.5 h-3.5" />
                              {route.title}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-lime-300">
                              <span>⏱️ {route.estimatedTime}</span>
                              <span>📏 {route.estimatedDistance}</span>
                            </div>
                          </div>
                          <p className="text-xs text-lime-100/90 leading-relaxed">
                            {route.description}
                          </p>

                          {route.specialNote && (
                            <div className="p-2 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-200 text-xs font-black">
                              {route.specialNote}
                            </div>
                          )}

                          <div className="space-y-1.5 pt-1">
                            {route.highlights.map((hl, hIdx) => (
                              <div key={hIdx} className="flex items-center gap-2 text-xs text-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shrink-0" />
                                <span>{hl}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Clean Photo Display (Col 6) */}
              <div className="md:col-span-6 relative bg-[#061002] flex flex-col justify-between overflow-hidden p-3.5 sm:p-4 gap-3 min-h-[340px] md:min-h-[460px]">
                {/* Top Bar Gallery */}
                <div className="flex items-center justify-between px-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-lime-300 tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-lime-400" />
                      Galeri Foto
                    </span>
                    {imageList.length > 1 && (
                      <span className="px-2 py-0.5 rounded-full bg-black/80 text-amber-300 border border-amber-400/50 font-mono text-[10px] font-black">
                        {activeImageIndex + 1} / {imageList.length}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {imageList.length > 1 && (
                      <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
                        Gunakan tombol panah ◀ ▶
                      </span>
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

                {/* Main Featured Photo Frame */}
                <div className="relative w-full flex-1 min-h-[220px] rounded-2xl overflow-hidden border-2 border-lime-400/50 bg-black shadow-2xl group">
                  <AnimatePresence mode="wait">
                    {currentImage && isVideo(currentImage) ? (
                      <motion.div
                        key={currentImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                      </motion.div>
                    ) : currentImage ? (
                      <motion.div
                        key={currentImage}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full h-full bg-black"
                      >
                        <Image
                          src={currentImage}
                          alt={placeName}
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

                  {/* Left & Right Chevrons (Prominent Arrow Buttons) */}
                  {imageList.length > 1 && (
                    <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
                        }}
                        title="Foto Sebelumnya (Panah Kiri / ◀)"
                        className="w-10 h-10 rounded-full bg-black/85 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center border-2 border-lime-400/60 pointer-events-auto transition-all duration-200 shadow-glow-gold cursor-pointer hover:scale-110 active:scale-95"
                      >
                        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
                        }}
                        title="Foto Berikutnya (Panah Kanan / ▶)"
                        className="w-10 h-10 rounded-full bg-black/85 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center border-2 border-lime-400/60 pointer-events-auto transition-all duration-200 shadow-glow-gold cursor-pointer hover:scale-110 active:scale-95"
                      >
                        <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {imageList.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
                    {imageList.map((img, idx) => {
                      const isSelected = idx === activeImageIndex;
                      const isMediaVideo = isVideo(img);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex(idx);
                          }}
                          className={`relative w-14 h-11 rounded-lg overflow-hidden border transition-all shrink-0 cursor-pointer flex items-center justify-center bg-black ${
                            isSelected
                              ? "border-amber-400 ring-2 ring-amber-400/80 scale-105 shadow-glow-gold"
                              : "border-white/20 opacity-60 hover:opacity-100"
                          }`}
                        >
                          {isMediaVideo ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-950/90 to-black text-amber-300">
                              <span className="text-xs">🎬</span>
                              <span className="text-[7px] font-mono font-bold tracking-tight text-amber-200">VIDEO</span>
                            </div>
                          ) : (
                            <Image src={img} alt={`Foto ${idx + 1}`} fill unoptimized className="object-cover" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>,
        document.body
      )}

      {/* Full Frame Modal */}
      {mounted && isFullFrame && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-150 select-none"
          onClick={() => setIsFullFrame(false)}
        >
          <button
            type="button"
            onClick={() => setIsFullFrame(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/70 hover:bg-rose-500 text-white border border-white/20 z-50 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Full-Frame Left & Right Arrow Buttons */}
          {imageList.length > 1 && (
            <div className="absolute inset-y-0 inset-x-6 flex items-center justify-between pointer-events-none z-50">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
                }}
                title="Foto Sebelumnya (◀)"
                className="w-12 h-12 rounded-full bg-black/80 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center border-2 border-lime-400 pointer-events-auto transition-all shadow-2xl cursor-pointer hover:scale-110"
              >
                <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
                }}
                title="Foto Berikutnya (▶)"
                className="w-12 h-12 rounded-full bg-black/80 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center border-2 border-lime-400 pointer-events-auto transition-all shadow-2xl cursor-pointer hover:scale-110"
              >
                <ChevronRight className="w-7 h-7 stroke-[2.5]" />
              </button>
            </div>
          )}

          <div className="relative w-full max-w-5xl h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {currentImage && (
              <Image src={currentImage} alt={placeName} fill unoptimized className="object-contain" />
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
