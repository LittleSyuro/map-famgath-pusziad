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
  MenuItem,
  DAY1_DINNER_MENU,
  DAY2_BREAKFAST_MENU,
  DAY1_GAMES_PJU,
  DAY1_GAMES_IBU_PJU,
  WALKING_ROUTES_DAY2,
  Waypoint,
  GRAND_PRIZE_ITEMS,
} from "@/data/arrivals";
import {
  DOORPRIZE_SUMMARY,
  DOORPRIZE_GRADE_A,
  DOORPRIZE_GRADE_B,
} from "@/data/doorprize";
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
  DoorOpen,
  Flag,
  HeartPulse,
  Search,
} from "lucide-react";

// Distinct icon per map pin, instead of the same generic building icon
// for every single stop — matched by KeyEventPinpoint.id.
const PIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "pin-gate": DoorOpen,
  "pin-helipad": Flag,
  "pin-alpine": BedDouble,
  "pin-cave": Mountain,
  "pin-mongolian": Tent,
  "pin-masjid": Landmark,
  "pin-resto": Utensils,
  "pin-ballroom": PartyPopper,
  "pin-bridge": Camera,
  "pin-kopihip": Coffee,
  "pin-k3": HeartPulse,
  "pin-doorprize": Gift,
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
  const [activeTab, setActiveTab] = useState<"menu" | "games" | "rute" | "fasilitas" | "grandprize">("fasilitas");
  const [activeWalkingRouteTab, setActiveWalkingRouteTab] = useState<"pju" | "anggota">("pju");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullFrame, setIsFullFrame] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMarkerHovered, setIsMarkerHovered] = useState(false);
  const [doorprizeSubTab, setDoorprizeSubTab] = useState<"grand" | "gradeA" | "gradeB">("grand");
  const [doorprizeSearch, setDoorprizeSearch] = useState<string>("");

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
      if (agendaItem?.id === "d2-doorprize") {
        setActiveTab("grandprize");
      } else if (
        agendaItem?.menuCategories ||
        keyPinpoint?.menuCategories ||
        agendaItem?.id === "d1-dinner" ||
        agendaItem?.id === "d2-breakfast" ||
        agendaItem?.id === "d2-lunch" ||
        agendaItem?.id === "d2-kopi-hip" ||
        agendaItem?.id === "d2-ballroom-grandprize" ||
        keyPinpoint?.id === "pin-resto" ||
        keyPinpoint?.id === "pin-kopihip"
      ) {
        setActiveTab("menu");
      } else if (agendaItem?.id === "d1-games" || agendaItem?.pjuGames) {
        setActiveTab("games");
      } else if (agendaItem?.id === "d2-jalan-santai" || agendaItem?.id === "d2-jalan-sehat" || agendaItem?.walkingRoutes) {
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

  const effectiveMenuCategories: MenuItem[] | undefined =
    agendaItem?.menuCategories ||
    keyPinpoint?.menuCategories ||
    (isDay1Dinner ? DAY1_DINNER_MENU : isDay2Breakfast ? DAY2_BREAKFAST_MENU : undefined);

  const hasMenu = Boolean(effectiveMenuCategories && effectiveMenuCategories.length > 0);

  const isGames = agendaItem?.id === "d1-games" || !!agendaItem?.pjuGames;
  const hasWalkingRoutes = agendaItem?.id === "d2-jalan-santai" || agendaItem?.id === "d2-jalan-sehat" || !!agendaItem?.walkingRoutes;
  const facilitiesList = activeRoom?.facilities || keyPinpoint?.facilities || [];
  const hasFacilities = facilitiesList.length > 0;
  // Flag: this is the Welcome Gate popup — shows special Selamat Datang section with PJU photos
  const isGateWelcome = keyPinpoint?.id === "pin-gate" || agendaItem?.id === "d1-arrival";
  const isK3Evakuasi = keyPinpoint?.id === "pin-k3" || agendaItem?.id === "d2-k3-evakuasi";
  const hasGrandPrizes = Boolean(
    (agendaItem?.grandPrizes && agendaItem.grandPrizes.length > 0) ||
    agendaItem?.id === "d2-ballroom-grandprize" ||
    agendaItem?.id === "d2-doorprize" ||
    keyPinpoint?.id === "pin-ballroom"
  );

  const hasTabs = Boolean(hasMenu || isGames || hasWalkingRoutes || hasFacilities || hasGrandPrizes);
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
    agendaItem?.id === "d2-jalan-santai" ||
    agendaItem?.id === "d2-doorprize" ||
    agendaItem?.id === "d2-k3-evakuasi";
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

                {/* Gate Special: Selamat Datang Family Gathering + Foto 5 PJU */}
                {isGateWelcome && (
                  <div className="mt-3 space-y-3">
                    <div className="text-center py-2 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-amber-500/20 border border-amber-400/50">
                      <p className="text-base sm:text-lg font-black text-amber-300 tracking-wide uppercase">
                        🎉 Selamat Datang
                      </p>
                      <p className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                        Family Gathering Pusziad 2026
                      </p>
                      <p className="text-xs text-lime-300/90 font-bold mt-1">
                        The Highland Park Resort, Bogor — 9-10 Oktober 2026
                      </p>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { src: "/avatars/budi_hariswanto.png", name: "Mayjen TNI Budi Hariswanto" },
                        { src: "/avatars/nurdihin.png", name: "Brigjen TNI Nurdihin" },
                        { src: "/avatars/faried_dh.png", name: "Brigjen TNI Faried DH" },
                        { src: "/avatars/sujadi.png", name: "Brigjen TNI Sujadi" },
                        { src: "/avatars/faizal.png", name: "Brigjen TNI Faizal" },
                      ].map((pju, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-amber-400/70 shadow-lg ring-2 ring-amber-400/30">
                            <Image
                              src={pju.src}
                              alt={pju.name}
                              fill
                              unoptimized
                              className="object-cover object-top"
                            />
                          </div>
                          <p className="text-[9px] text-amber-200/80 font-semibold text-center leading-tight px-0.5 line-clamp-2">
                            {pju.name.split(" ").slice(-1)[0]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* K3 & Jalur Evakuasi Special Section */}
                {isK3Evakuasi && (
                  <div className="mt-3 space-y-2.5">
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-red-900/40 via-rose-900/30 to-red-900/40 border border-red-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-rose-300">
                          Pusat Pendidikan Zeni TNI AD
                        </p>
                        <h4 className="text-sm sm:text-base font-black text-white">
                          Urusan Kesehatan (K3 & Posko Medis)
                        </h4>
                      </div>
                      <div className="px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 text-right">
                        <p className="text-[9px] text-slate-300 font-bold">Perwira Urusan Kesehatan</p>
                        <p className="text-[10px] text-amber-300 font-black">dr. Mindou Dipendri Datka S</p>
                        <p className="text-[9px] text-slate-400 font-mono">Kapten Ckm NRP 11210003740594</p>
                      </div>
                    </div>

                    {/* Jalur Darurat Critical Alert */}
                    <div className="p-2.5 rounded-xl bg-red-950/80 border-2 border-red-500 shadow-lg flex items-start gap-2">
                      <span className="text-base shrink-0">🚨</span>
                      <div className="text-[11px] leading-relaxed text-red-100">
                        <span className="font-black text-red-300 uppercase tracking-wide mr-1">
                          JALUR DARURAT:
                        </span>
                        Kondisi darurat kritis langsung dievakuasi via Ambulans dari TKP menuju <strong>Rumkit Tk. III Salak dr. H. Sadjiman Bogor</strong>.
                      </div>
                    </div>

                    {/* Alur Evakuasi Rantai Medis */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5">
                      <div className="p-2 rounded-xl bg-black/50 border border-lime-500/30 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-300">
                            Tahap 1
                          </span>
                          <p className="text-xs font-black text-white mt-1">TKP ➔ KESLAP</p>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1">
                          Pertolongan pertama medis di lokasi acara resort
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-black/50 border border-lime-500/30 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300">
                            ⏱️ 10 Menit
                          </span>
                          <p className="text-xs font-black text-white mt-1">Klinik Pratama Aisyah</p>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1">
                          Rawat Inap fasilitas kesehatan terdekat
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-black/50 border border-lime-500/30 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                            ⏱️ 40 Menit
                          </span>
                          <p className="text-xs font-black text-white mt-1">Rumkit Tk. III Salak</p>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1">
                          dr. H. Sadjiman Bogor (Rujukan Wilayah)
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-black/50 border border-lime-500/30 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-400/20 text-rose-300">
                            ⏱️ 1 Jam 20 Mnt
                          </span>
                          <p className="text-xs font-black text-white mt-1">RSPAD Gatot Soebroto</p>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1">
                          Pusat Rujukan Tertinggi TNI AD di Jakarta
                        </p>
                      </div>
                    </div>
                  </div>
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
                      <span>
                        {agendaItem?.id === "d1-dinner"
                          ? "Menu Makan Malam"
                          : agendaItem?.id === "d1-games"
                          ? "Coffee Break Malam"
                          : agendaItem?.id === "d1-coffee-break"
                          ? "Coffee Break Malam"
                          : agendaItem?.id === "d2-breakfast"
                          ? "Menu Sarapan Pagi"
                          : agendaItem?.id === "d2-lunch"
                          ? "Menu Makan Siang"
                          : agendaItem?.id === "d2-kopi-hip"
                          ? "Menu Coffee Heat"
                          : agendaItem?.id === "d2-ballroom-grandprize"
                          ? "Menu Sajian Ballroom"
                          : keyPinpoint?.id === "pin-resto"
                          ? "Menu Resto & CB Malam"
                          : keyPinpoint?.id === "pin-kopihip"
                          ? "Menu Coffee Heat"
                          : keyPinpoint?.id === "pin-ballroom"
                          ? "Menu Makan Siang Ballroom"
                          : "Menu Sajian"}
                      </span>
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

                  {hasGrandPrizes && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("grandprize")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        activeTab === "grandprize"
                          ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black shadow-glow-gold"
                          : "text-lime-200 hover:text-white"
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Grand Prize</span>
                    </button>
                  )}
                </div>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-white">
                  {/* Fasilitas */}
                  {activeTab === "fasilitas" && hasFacilities && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {facilitiesList.map((fac, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-black/50 border border-lime-500/30 text-xs text-lime-100 hover:border-lime-400/60 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                            <span className="leading-snug font-medium">{fac}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Menu Makan */}
                  {activeTab === "menu" && hasMenu && effectiveMenuCategories && (
                    <div className="space-y-3">
                      {effectiveMenuCategories.map((cat, idx) => {
                        const isBallroomSnack = cat.category.includes("SNACK SETELAH JALAN SANTAI");
                        const isKopiHip = cat.category.includes("COFFEE HEAT");
                        const isCBMalam = cat.category.includes("COFFEE BREAK (REBUSAN");
                        const catImage = isBallroomSnack
                          ? "/resort_media/grand_ballroom/snack_setelah_jalan_santai.jpg"
                          : isKopiHip
                          ? "/resort_media/kopi_hip/menu_kopi_hip.jpg"
                          : isCBMalam
                          ? "/games/pisang_rebus.jpg"
                          : null;

                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-black/40 border border-lime-500/25 space-y-2.5"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                                <span>🍽️</span>
                                <span>{cat.category}</span>
                              </span>
                              {cat.note && (
                                <span className="text-[10px] text-lime-300/90 font-medium italic">
                                  {cat.note}
                                </span>
                              )}
                            </div>

                            {/* Foto sajian jika ada */}
                            {catImage && (
                              <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden border border-amber-400/40 shadow-lg">
                                <Image
                                  src={catImage}
                                  alt={cat.category}
                                  fill
                                  unoptimized
                                  className="object-cover object-center"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-2.5">
                                  <span className="text-[11px] font-bold text-amber-200 flex items-center gap-1">
                                    <span>📸</span>
                                    <span>
                                      {isBallroomSnack
                                        ? "Sajian Snack Setelah Jalan Santai di Ballroom"
                                        : isKopiHip
                                        ? "Sajian Rebusan & Kelapa Muda Segar Kopi Hip"
                                        : "Sajian Coffee Break Malam"}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 gap-1.5">
                              {cat.items.map((item, itemIdx) => (
                                <div
                                  key={itemIdx}
                                  className="text-xs text-slate-200 flex items-center gap-2 bg-black/30 px-2.5 py-1 rounded-lg border border-white/5"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Games */}
                  {activeTab === "games" && isGames && (
                    <div className="space-y-3">
                      {/* Games PJU (Outdoor) */}
                      <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/40 space-y-2.5 shadow-lg">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                            <span>♟️</span>
                            <span>Games PJU</span>
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 border border-amber-400/50 text-amber-200">
                            berlokasi di outdoor area resto
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            { name: "Catur", icon: "♟️", desc: "Turnamen taktik meja" },
                            { name: "Gaple", icon: "🀄", desc: "Adu keakraban domino" },
                            { name: "Pantulan Rezeki", icon: "🎾", desc: "Tangkas pantul bola" },
                          ].map((g, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-slate-100 flex flex-col gap-0.5 p-2 rounded-xl bg-[#14260a] border border-amber-400/30 font-semibold"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{g.icon}</span>
                                <span className="text-amber-200 font-bold">{g.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-300 font-normal">{g.desc}</span>
                            </div>
                          ))}
                        </div>
                        <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden border border-amber-400/30">
                          <Image
                            src="/games/pju_games.jpg"
                            alt="Kolase Foto Games PJU"
                            fill
                            unoptimized
                            className="object-cover object-center"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                            <span className="text-[10px] font-bold text-amber-200">
                              📸 Ilustrasi PJU Games (Outdoor Resto)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Games Ibu-Ibu (Indoor) */}
                      <div className="p-3.5 rounded-2xl bg-black/50 border border-pink-500/40 space-y-2.5 shadow-lg">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="text-xs font-black uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                            <span>🎁</span>
                            <span>Games Ibu-Ibu</span>
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-400/20 border border-pink-400/50 text-pink-200">
                            berlokasi di indoor area resto
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            { name: "Botol Rezeki", icon: "🍾", desc: "Sasaran gelang botol" },
                            { name: "Tebak Lagu", icon: "🎵", desc: "Tebak irama & lirik" },
                            { name: "Pantulan Rezeki", icon: "🎾", desc: "Pantul bola berhadiah" },
                          ].map((g, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-slate-100 flex flex-col gap-0.5 p-2 rounded-xl bg-[#260e1d] border border-pink-400/30 font-semibold"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{g.icon}</span>
                                <span className="text-pink-200 font-bold">{g.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-300 font-normal">{g.desc}</span>
                            </div>
                          ))}
                        </div>
                        <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden border border-pink-400/30">
                          <Image
                            src="/games/ibu_pju_games.jpg"
                            alt="Kolase Foto Games Ibu-Ibu"
                            fill
                            unoptimized
                            className="object-cover object-center"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                            <span className="text-[10px] font-bold text-pink-200">
                              📸 Ilustrasi Games Ibu-Ibu (Indoor Resto)
                            </span>
                          </div>
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

                  {/* Grand Prize & Doorprize Complete Display */}
                  {activeTab === "grandprize" && hasGrandPrizes && (
                    <div className="space-y-3">
                      {/* Summary Dashboard Banner */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-amber-500/20 border border-amber-400/50 space-y-2 text-center shadow-lg">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                            HUT KE-81 ZENI TNI AD — PANITIA DOORPRIZE
                          </p>
                          <h4 className="text-base sm:text-lg font-black text-white">
                            Daftar Item Doorprize & Grand Prize
                          </h4>
                          <p className="text-[10px] text-lime-300/80">
                            Sumber: {DOORPRIZE_SUMMARY.sourceDocument}
                          </p>
                        </div>

                        {/* 4 Stat Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                          <div className="p-2 rounded-xl bg-black/60 border border-amber-400/30">
                            <p className="text-xl sm:text-2xl font-black text-amber-300 leading-none">
                              {DOORPRIZE_SUMMARY.totalItems}
                            </p>
                            <p className="text-[10px] text-slate-300 font-bold mt-0.5">Jenis Item</p>
                          </div>
                          <div className="p-2 rounded-xl bg-black/60 border border-amber-400/30">
                            <p className="text-xl sm:text-2xl font-black text-white leading-none">
                              {DOORPRIZE_SUMMARY.totalUnits}
                            </p>
                            <p className="text-[10px] text-slate-300 font-bold mt-0.5">Total Unit</p>
                          </div>
                          <div className="p-2 rounded-xl bg-black/60 border border-amber-400/30">
                            <p className="text-xl sm:text-2xl font-black text-yellow-300 leading-none">
                              {DOORPRIZE_SUMMARY.gradeA.itemsCount}
                            </p>
                            <p className="text-[10px] text-slate-300 font-bold mt-0.5">Grade A (90 Unit)</p>
                          </div>
                          <div className="p-2 rounded-xl bg-black/60 border border-amber-400/30">
                            <p className="text-xl sm:text-2xl font-black text-emerald-400 leading-none">
                              {DOORPRIZE_SUMMARY.gradeB.itemsCount}
                            </p>
                            <p className="text-[10px] text-slate-300 font-bold mt-0.5">Grade B (847 Unit)</p>
                          </div>
                        </div>

                        {/* Status Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-1 px-2 py-1 rounded-xl bg-black/40 border border-white/10 text-[10px]">
                          <span className="text-emerald-300 font-bold">
                            ✅ {DOORPRIZE_SUMMARY.receivedUnits} Unit Sudah Diterima
                          </span>
                          <span className="text-amber-300 font-medium">
                            ⏳ {DOORPRIZE_SUMMARY.pendingNote}
                          </span>
                        </div>
                      </div>

                      {/* Sub-Tab Selector Buttons */}
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-white/10">
                        <button
                          type="button"
                          onClick={() => setDoorprizeSubTab("grand")}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            doorprizeSubTab === "grand"
                              ? "bg-amber-400 text-slate-950 shadow-md"
                              : "text-slate-300 hover:text-white"
                          }`}
                        >
                          🏆 5 Grand Prize
                        </button>
                        <button
                          type="button"
                          onClick={() => setDoorprizeSubTab("gradeA")}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            doorprizeSubTab === "gradeA"
                              ? "bg-amber-400 text-slate-950 shadow-md"
                              : "text-slate-300 hover:text-white"
                          }`}
                        >
                          💎 Grade A (38 Item)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDoorprizeSubTab("gradeB")}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            doorprizeSubTab === "gradeB"
                              ? "bg-amber-400 text-slate-950 shadow-md"
                              : "text-slate-300 hover:text-white"
                          }`}
                        >
                          🎁 Grade B (101 Item)
                        </button>
                      </div>

                      {/* SubTab 1: 5 Grand Prize Cards */}
                      {doorprizeSubTab === "grand" && (
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {GRAND_PRIZE_ITEMS.map((prize, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-2xl bg-black/60 border border-amber-400/35 hover:border-amber-400/80 transition-all flex flex-col gap-2 group shadow-lg"
                              >
                                <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-gradient-to-b from-white/10 to-black/50 border border-white/10 flex items-center justify-center p-2">
                                  <Image
                                    src={prize.image}
                                    alt={prize.name}
                                    fill
                                    unoptimized
                                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase shadow-md">
                                    {prize.badge}
                                  </span>
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-sm font-black text-amber-200 group-hover:text-amber-300 transition-colors">
                                    {prize.name}
                                  </h4>
                                  <p className="text-[11px] text-lime-200/80">
                                    {prize.category}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SubTab 2: Grade A Table */}
                      {doorprizeSubTab === "gradeA" && (
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                              type="text"
                              value={doorprizeSearch}
                              onChange={(e) => setDoorprizeSearch(e.target.value)}
                              placeholder="Cari item Grade A atau donatur (contoh: TV, Kulkas, Kapusziad)..."
                              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/60 border border-amber-400/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div className="max-h-72 overflow-y-auto rounded-xl border border-amber-400/25 custom-scrollbar">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#122608] text-amber-300 sticky top-0 font-black border-b border-amber-400/30 z-10">
                                <tr>
                                  <th className="p-2 w-10 text-center">No</th>
                                  <th className="p-2">Nama Barang</th>
                                  <th className="p-2 w-16 text-center">Jml</th>
                                  <th className="p-2">Donatur</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 bg-black/40">
                                {DOORPRIZE_GRADE_A
                                  .filter(item =>
                                    doorprizeSearch === "" ||
                                    item.name.toLowerCase().includes(doorprizeSearch.toLowerCase()) ||
                                    item.donor.toLowerCase().includes(doorprizeSearch.toLowerCase())
                                  )
                                  .map((item) => (
                                    <tr key={item.no} className="hover:bg-amber-400/10 transition-colors">
                                      <td className="p-2 text-center text-slate-400 font-mono">{item.no}</td>
                                      <td className="p-2 text-white font-medium">{item.name}</td>
                                      <td className="p-2 text-center">
                                        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-[10px]">
                                          {item.quantity}
                                        </span>
                                      </td>
                                      <td className="p-2 text-lime-200/90">{item.donor}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* SubTab 3: Grade B Table */}
                      {doorprizeSubTab === "gradeB" && (
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                              type="text"
                              value={doorprizeSearch}
                              onChange={(e) => setDoorprizeSearch(e.target.value)}
                              placeholder="Cari item Grade B atau donatur (contoh: Magic Com, Setrika, Pusdikzi)..."
                              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/60 border border-amber-400/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div className="max-h-72 overflow-y-auto rounded-xl border border-amber-400/25 custom-scrollbar">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#122608] text-amber-300 sticky top-0 font-black border-b border-amber-400/30 z-10">
                                <tr>
                                  <th className="p-2 w-10 text-center">No</th>
                                  <th className="p-2">Nama Barang</th>
                                  <th className="p-2 w-16 text-center">Jml</th>
                                  <th className="p-2">Donatur</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 bg-black/40">
                                {DOORPRIZE_GRADE_B
                                  .filter(item =>
                                    doorprizeSearch === "" ||
                                    item.name.toLowerCase().includes(doorprizeSearch.toLowerCase()) ||
                                    item.donor.toLowerCase().includes(doorprizeSearch.toLowerCase())
                                  )
                                  .map((item) => (
                                    <tr key={item.no} className="hover:bg-amber-400/10 transition-colors">
                                      <td className="p-2 text-center text-slate-400 font-mono">{item.no}</td>
                                      <td className="p-2 text-white font-medium">{item.name}</td>
                                      <td className="p-2 text-center">
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-bold text-[10px]">
                                          {item.quantity}
                                        </span>
                                      </td>
                                      <td className="p-2 text-lime-200/90">{item.donor}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
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
