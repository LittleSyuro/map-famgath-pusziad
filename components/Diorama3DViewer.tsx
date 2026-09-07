"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { LocationItem } from "@/data/locations";
import { LocationMarker } from "./LocationMarker";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Crosshair,
  Copy,
  Check,
  Compass,
  Info,
  Sun,
  Sunset,
  Moon,
  Camera,
  Eye,
  EyeOff,
} from "lucide-react";

interface Diorama3DViewerProps {
  locations: LocationItem[];
  selectedLocation: LocationItem | null;
  highlightedIds?: string[];
  onSelectLocation: (location: LocationItem) => void;
  focusedLocation: LocationItem | null;
}

type LightingMode = "day" | "sunset" | "night";

export const Diorama3DViewer: React.FC<Diorama3DViewerProps> = ({
  locations,
  selectedLocation,
  highlightedIds,
  onSelectLocation,
  focusedLocation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCoordinateMode, setIsCoordinateMode] = useState(false);
  const [showPins, setShowPins] = useState(true); // Toggle to show/hide marker numbers!
  const [clickedCoord, setClickedCoord] = useState<{ x: number; y: number } | null>(null);
  const [copiedCoord, setCopiedCoord] = useState(false);
  const [lightingMode, setLightingMode] = useState<LightingMode>("day");
  const [isTiltShift, setIsTiltShift] = useState(false);
  const [activeZone, setActiveZone] = useState<string | null>(null);

  // Filter locations that have valid map coordinates
  const mappedLocations = locations.filter(
    (loc) => loc.mapX !== undefined && loc.mapY !== undefined
  );

  // Predefined Quick-Jump Zones across the 3D Diorama
  const RESORT_ZONES = [
    {
      id: "mongolian",
      name: "1. Welcome & Mongolian",
      desc: "Gate, Mongolian Camp & Futsal",
      x: 18,
      y: 78,
      zoom: 2.6,
    },
    {
      id: "golf",
      name: "2. Golf & Driving Range",
      desc: "Driving Range, Mini Golf & Cafe",
      x: 48,
      y: 62,
      zoom: 2.5,
    },
    {
      id: "ballroom",
      name: "3. Ballroom & Danau",
      desc: "Grand Ballroom, Lobby & Anthurium",
      x: 64,
      y: 44,
      zoom: 2.6,
    },
    {
      id: "waterboom",
      name: "4. Waterboom & Outbound",
      desc: "Waterboom, Kolam & Geobound",
      x: 75,
      y: 28,
      zoom: 2.6,
    },
    {
      id: "helipad",
      name: "5. Helipad & Apache",
      desc: "Helipad, Berkuda & Apache Camp",
      x: 84,
      y: 18,
      zoom: 2.6,
    },
  ];

  // Jump to specific zone
  const jumpToZone = (zone: typeof RESORT_ZONES[0]) => {
    setActiveZone(zone.id);
    if (transformRef.current && containerRef.current) {
      const { setTransform } = transformRef.current;
      const rect = containerRef.current.getBoundingClientRect();

      const targetX = (zone.x / 100) * rect.width;
      const targetY = (zone.y / 100) * rect.height;

      const posX = rect.width / 2 - targetX * zone.zoom;
      const posY = rect.height / 2 - targetY * zone.zoom;

      setTransform(posX, posY, zone.zoom, 600, "easeOutQuad");
    }
  };

  // Handle Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // When focusedLocation changes, zoom and center on it
  useEffect(() => {
    if (!focusedLocation || focusedLocation.mapX === undefined || focusedLocation.mapY === undefined) {
      return;
    }

    if (transformRef.current && containerRef.current) {
      const zoomFactor = 2.8;
      const { setTransform } = transformRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();

      const targetX = (focusedLocation.mapX / 100) * containerRect.width;
      const targetY = (focusedLocation.mapY / 100) * containerRect.height;

      const posX = containerRect.width / 2 - targetX * zoomFactor;
      const posY = containerRect.height / 2 - targetY * zoomFactor;

      setTransform(posX, posY, zoomFactor, 700, "easeOutQuad");
    }
  }, [focusedLocation]);

  // Handle Map Click in Coordinate Picker Mode
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCoordinateMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const roundedX = parseFloat(x.toFixed(1));
    const roundedY = parseFloat(y.toFixed(1));

    setClickedCoord({ x: roundedX, y: roundedY });
  };

  const copyCoordSnippet = () => {
    if (!clickedCoord) return;
    const snippet = `"mapX": ${clickedCoord.x}, "mapY": ${clickedCoord.y}`;
    navigator.clipboard.writeText(snippet);
    setCopiedCoord(true);
    setTimeout(() => setCopiedCoord(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-3xl border border-gold-500/40 shadow-2xl bg-[#132e22] select-none transition-all ${
        isFullscreen ? "h-screen rounded-none border-none" : "h-[70vh] sm:h-[80vh] min-h-[540px] max-h-[920px]"
      }`}
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.7}
        maxScale={6}
        centerOnInit={true}
        wheel={{ step: 0.15 }}
        pinch={{ step: 5 }}
        doubleClick={{ mode: "zoomIn", step: 0.7 }}
        alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Top Right Controls Toolbar */}
            <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 no-print">
              {/* Show / Hide Pin Numbers Toggle Button */}
              <div className="flex items-center bg-resort-950/90 dark:bg-resort-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-gold-500/40 p-1">
                <button
                  type="button"
                  onClick={() => setShowPins(!showPins)}
                  title={showPins ? "Sembunyikan Angka-angka Pin Legend" : "Tampilkan Angka-angka Pin Legend"}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    showPins
                      ? "bg-gold-500 text-resort-950 shadow-md ring-1 ring-gold-400"
                      : "bg-zinc-800/80 text-zinc-300 hover:text-white"
                  }`}
                >
                  {showPins ? (
                    <>
                      <Eye className="w-4 h-4 text-resort-950" />
                      <span>Pin Aktif</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 text-zinc-400" />
                      <span>Pin Tersembunyi</span>
                    </>
                  )}
                </button>
              </div>

              {/* Lighting Atmosphere Switcher (Day / Sunset / Night) */}
              <div className="flex items-center bg-resort-950/90 dark:bg-resort-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-gold-500/40 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setLightingMode("day")}
                  title="Pencahayaan Siang Hari"
                  className={`p-2 rounded-xl transition-all ${
                    lightingMode === "day"
                      ? "bg-amber-400 text-resort-950 font-bold shadow-md"
                      : "text-zinc-400 hover:text-gold-300"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightingMode("sunset")}
                  title="Pencahayaan Senja / Golden Hour"
                  className={`p-2 rounded-xl transition-all ${
                    lightingMode === "sunset"
                      ? "bg-orange-500 text-white font-bold shadow-md"
                      : "text-zinc-400 hover:text-gold-300"
                  }`}
                >
                  <Sunset className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightingMode("night")}
                  title="Pencahayaan Malam Hari Lampu Resort"
                  className={`p-2 rounded-xl transition-all ${
                    lightingMode === "night"
                      ? "bg-indigo-600 text-yellow-300 font-bold shadow-md"
                      : "text-zinc-400 hover:text-gold-300"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Controls */}
              <div className="flex flex-col bg-resort-950/90 dark:bg-resort-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-gold-500/40 p-1.5 gap-1">
                <button
                  type="button"
                  onClick={() => zoomIn(0.5)}
                  title="Perbesar Peta (+)"
                  className="p-2.5 rounded-xl text-zinc-200 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => zoomOut(0.5)}
                  title="Perkecil Peta (-)"
                  className="p-2.5 rounded-xl text-zinc-200 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>

                <div className="h-[1px] bg-zinc-700 my-0.5" />

                <button
                  type="button"
                  onClick={() => {
                    resetTransform(400);
                    setActiveZone(null);
                  }}
                  title="Reset Posisi & Zoom"
                  className="p-2.5 rounded-xl text-zinc-200 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsTiltShift(!isTiltShift)}
                  title={isTiltShift ? "Matikan Efek Miniatur Tilt-Shift" : "Aktifkan Efek Miniatur Tilt-Shift"}
                  className={`p-2.5 rounded-xl transition-colors ${
                    isTiltShift
                      ? "bg-gold-500 text-resort-950 font-bold"
                      : "text-zinc-200 hover:text-gold-400 hover:bg-gold-500/10"
                  }`}
                >
                  <Camera className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
                  className="p-2.5 rounded-xl text-zinc-200 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Coordinate Mode Toggle */}
              <div className="bg-resort-950/90 dark:bg-resort-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-gold-500/40 p-1.5">
                <button
                  type="button"
                  onClick={() => setIsCoordinateMode(!isCoordinateMode)}
                  title="Mode Pasang Titik Koordinat (Klik peta untuk salin x,y %)"
                  className={`p-2.5 rounded-xl transition-all ${
                    isCoordinateMode
                      ? "bg-gold-500 text-resort-950 font-bold shadow-md animate-pulse"
                      : "text-zinc-200 hover:text-gold-400 hover:bg-gold-500/10"
                  }`}
                >
                  <Crosshair className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Top Left Quick Zone Jump Chips */}
            <div className="absolute top-4 left-4 z-30 max-w-[calc(100%-140px)] flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar no-print">
              {RESORT_ZONES.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => jumpToZone(zone)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border shadow-md transition-all ${
                    activeZone === zone.id
                      ? "bg-gradient-to-r from-gold-500 to-amber-400 text-resort-950 border-white ring-2 ring-gold-400/50 scale-105"
                      : "bg-resort-950/85 text-zinc-200 hover:text-gold-300 border-gold-500/30 hover:border-gold-400"
                  }`}
                >
                  <span>{zone.name}</span>
                </button>
              ))}
            </div>

            {/* Hint Overlay at bottom left */}
            <div className="absolute bottom-4 left-4 z-30 pointer-events-none no-print">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-resort-950/90 text-zinc-300 text-xs border border-gold-500/30 backdrop-blur-md shadow-lg">
                <Info className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="hidden sm:inline">
                  Scroll/Pinch untuk Zoom • Drag untuk Menjelajah • {showPins ? "Klik pin untuk foto detail" : "Gunakan tombol 'Pin' untuk memunculkan angka"}
                </span>
                <span className="sm:hidden">
                  Pinch untuk Zoom • Drag untuk Menjelajah
                </span>
              </div>
            </div>

            {/* Coordinate Helper Floating Card */}
            {isCoordinateMode && (
              <div className="absolute top-16 left-4 z-40 max-w-sm p-4 rounded-2xl bg-resort-900/95 text-white border border-gold-400 shadow-2xl backdrop-blur-md animate-in slide-in-from-top duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-gold-500/30">
                  <span className="flex items-center gap-2 text-xs font-bold text-gold-400 uppercase tracking-wide">
                    <Crosshair className="w-4 h-4" /> Mode Pasang Koordinat
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCoordinateMode(false)}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Tutup
                  </button>
                </div>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  Klik titik manapun pada model 3D untuk mendapatkan persentase koordinat (x%, y%).
                </p>

                {clickedCoord && (
                  <div className="mt-3 p-2.5 rounded-xl bg-resort-950 border border-gold-500/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-gold-300">
                      <span>mapX: <strong>{clickedCoord.x}%</strong></span>
                      <span>mapY: <strong>{clickedCoord.y}%</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={copyCoordSnippet}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-resort-950 text-xs font-bold transition-all shadow"
                    >
                      {copiedCoord ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-resort-950" /> Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Salin Format JSON
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3D Diorama Canvas */}
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className={`relative cursor-grab active:cursor-grabbing w-[1300px] lg:w-[1700px] aspect-[16/9] flex items-center justify-center rounded-2xl overflow-visible transition-shadow ${
                  isCoordinateMode ? "cursor-crosshair active:cursor-crosshair" : ""
                } ${isTiltShift ? "filter drop-shadow-2xl" : ""}`}
                onClick={handleMapClick}
              >
                {/* 3D Architectural Diorama Ultra-HD Master Model */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/maps-3d-model.png"
                    alt="Model 3D Arsitektur The Highland Park Resort Bogor"
                    fill
                    priority
                    unoptimized
                    sizes="100vw"
                    className="object-contain pointer-events-none drop-shadow-2xl"
                  />

                  {/* Atmospheric Lighting Filters */}
                  {lightingMode === "sunset" && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/30 via-orange-600/25 to-yellow-500/20 mix-blend-color-burn pointer-events-none transition-opacity duration-500" />
                  )}

                  {lightingMode === "night" && (
                    <div className="absolute inset-0 bg-indigo-950/65 mix-blend-multiply pointer-events-none transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/15 to-transparent mix-blend-screen pointer-events-none" />
                    </div>
                  )}

                  {/* Tilt-Shift Miniature Depth of Field Effect */}
                  {isTiltShift && (
                    <>
                      <div className="absolute top-0 inset-x-0 h-1/4 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-[3px] pointer-events-none" />
                      <div className="absolute bottom-0 inset-x-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent backdrop-blur-[3px] pointer-events-none" />
                    </>
                  )}
                </div>

                {/* Render Standing 3D Pins only when showPins is TRUE */}
                {showPins &&
                  mappedLocations.map((loc) => {
                    const isHighlighted =
                      !highlightedIds ||
                      highlightedIds.length === 0 ||
                      highlightedIds.includes(loc.id);

                    return (
                      <LocationMarker
                        key={loc.id}
                        location={loc}
                        isSelected={selectedLocation?.id === loc.id}
                        isHighlighted={isHighlighted}
                        is3DMode={false}
                        onClick={onSelectLocation}
                      />
                    );
                  })}

                {/* Crosshair Pin when clicking in coordinate mode */}
                {isCoordinateMode && clickedCoord && (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none animate-bounce"
                    style={{ left: `${clickedCoord.x}%`, top: `${clickedCoord.y}%` }}
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-gold-400 bg-gold-500/90 shadow-glow-gold flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  </div>
                )}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};
