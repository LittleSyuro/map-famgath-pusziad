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
  Box,
  Sliders,
  Sparkles,
  Move3d,
} from "lucide-react";

interface MapViewerProps {
  locations: LocationItem[];
  selectedLocation: LocationItem | null;
  highlightedIds?: string[];
  onSelectLocation: (location: LocationItem) => void;
  focusedLocation: LocationItem | null;
}

// Inner Controls Toolbar Component
const MapControls: React.FC<{
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isCoordinateMode: boolean;
  onToggleCoordinateMode: () => void;
  showPins: boolean;
  onTogglePins: () => void;
  is3DMode: boolean;
  onToggle3DMode: () => void;
  show3DControls: boolean;
  onToggle3DControls: () => void;
  totalMarkers: number;
}> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  isFullscreen,
  onToggleFullscreen,
  isCoordinateMode,
  onToggleCoordinateMode,
  showPins,
  onTogglePins,
  is3DMode,
  onToggle3DMode,
  show3DControls,
  onToggle3DControls,
  totalMarkers,
}) => {
  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 no-print">
      {/* Show / Hide Pin Numbers Toggle Button */}
      <div className="flex items-center bg-white/95 dark:bg-resort-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-gold-500/40 p-1">
        <button
          type="button"
          onClick={onTogglePins}
          title={showPins ? "Sembunyikan Angka-angka Pin Legend" : "Tampilkan Angka-angka Pin Legend"}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            showPins
              ? "bg-gold-500 text-resort-950 shadow-md ring-1 ring-gold-400"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
          }`}
        >
          <span>{showPins ? "Pin Aktif" : "Pin Tersembunyi"}</span>
        </button>
      </div>

      {/* 3D Isometric View Mode Toggle */}
      <div className="flex items-center bg-white/95 dark:bg-resort-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-gold-500/40 p-1 gap-1">
        <button
          type="button"
          onClick={onToggle3DMode}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            is3DMode
              ? "bg-gradient-to-r from-gold-600 via-amber-500 to-yellow-400 text-resort-950 shadow-md shadow-gold-500/30 ring-1 ring-white/50"
              : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-resort-800"
          }`}
          title="Beralih antara Mode 3D Isometric dan 2D"
        >
          <Box className={`w-4 h-4 ${is3DMode ? "text-resort-950 animate-pulse" : "text-gold-500"}`} />
          <span>{is3DMode ? "3D Isometric" : "2D Flat"}</span>
        </button>

        {is3DMode && (
          <button
            type="button"
            onClick={onToggle3DControls}
            className={`p-2 rounded-xl transition-colors ${
              show3DControls
                ? "bg-resort-800 text-gold-300 dark:bg-gold-500 dark:text-resort-950"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-resort-800"
            }`}
            title="Pengaturan Sudut Kamera 3D"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Map Navigation Buttons */}
      <div className="flex flex-col bg-white/90 dark:bg-resort-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-gold-500/30 p-1.5 gap-1">
        <button
          type="button"
          onClick={onZoomIn}
          title="Perbesar Peta (+)"
          className="p-2.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onZoomOut}
          title="Perkecil Peta (-)"
          className="p-2.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
        >
          <ZoomOut className="w-5 h-5" />
        </button>

        <div className="h-[1px] bg-zinc-200 dark:bg-resort-800 my-0.5" />

        <button
          type="button"
          onClick={onReset}
          title="Reset Posisi & Zoom"
          className="p-2.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          className="p-2.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Coordinate Picker Tool Toggle */}
      <div className="bg-white/90 dark:bg-resort-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-gold-500/30 p-1.5">
        <button
          type="button"
          onClick={onToggleCoordinateMode}
          title={
            isCoordinateMode
              ? "Matikan Mode Deteksi Koordinat"
              : "Aktifkan Mode Deteksi Koordinat (Klik peta untuk tahu X & Y %)"
          }
          className={`p-2.5 rounded-xl transition-all ${
            isCoordinateMode
              ? "bg-gold-500 text-resort-950 font-bold shadow-md animate-pulse"
              : "text-zinc-700 dark:text-zinc-200 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gold-500/10"
          }`}
        >
          <Crosshair className="w-5 h-5" />
        </button>
      </div>

      {/* Total Pins Badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-resort-950/80 text-gold-300 text-xs font-medium border border-gold-500/30 shadow-md backdrop-blur-sm">
        <Compass className="w-3.5 h-3.5 text-gold-400" />
        <span>{totalMarkers} Titik Aktif</span>
      </div>
    </div>
  );
};

export const MapViewer: React.FC<MapViewerProps> = ({
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
  const [showPins, setShowPins] = useState(true);
  const [clickedCoord, setClickedCoord] = useState<{ x: number; y: number } | null>(null);
  const [copiedCoord, setCopiedCoord] = useState(false);

  // 3D Isometric View States (defaults to flat 2D for 2D Denah mode)
  const [is3DMode, setIs3DMode] = useState(false);
  const [show3DControls, setShow3DControls] = useState(false);
  const [tiltAngle, setTiltAngle] = useState(52); // X-axis tilt (deg)
  const [rotateAngle, setRotateAngle] = useState(-26); // Z-axis rotation (deg)
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });

  // Filter locations that have valid map coordinates
  const mappedLocations = locations.filter(
    (loc) => loc.mapX !== undefined && loc.mapY !== undefined
  );

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
      const zoomFactor = 2.4;
      const { setTransform } = transformRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();

      const targetX = (focusedLocation.mapX / 100) * containerRect.width;
      const targetY = (focusedLocation.mapY / 100) * containerRect.height;

      const posX = containerRect.width / 2 - targetX * zoomFactor;
      const posY = containerRect.height / 2 - targetY * zoomFactor;

      setTransform(posX, posY, zoomFactor, 600, "easeOutQuad");
    }
  }, [focusedLocation]);

  // Subtle 3D Mouse Parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3DMode || isCoordinateMode) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseParallax({
      x: nx * 4, // +/- 2 deg parallax
      y: ny * 4,
    });
  };

  const handleMouseLeave = () => {
    setMouseParallax({ x: 0, y: 0 });
  };

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

  // 3D Matrix Transformations
  const currentTilt = is3DMode ? tiltAngle + mouseParallax.y : 0;
  const currentRotate = is3DMode ? rotateAngle + mouseParallax.x : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-hidden rounded-3xl border border-gold-500/40 shadow-2xl bg-gradient-to-b from-resort-950 via-[#0d1d16] to-[#08140f] select-none transition-all ${
        isFullscreen ? "h-screen rounded-none border-none" : "h-[68vh] sm:h-[78vh] min-h-[500px] max-h-[880px]"
      }`}
      style={{
        perspective: is3DMode ? "1300px" : "none",
      }}
    >
      {/* Transform Wrapper for Smooth Zoom and Pan */}
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
            {/* Control Toolbar */}
            <MapControls
              onZoomIn={() => zoomIn(0.5)}
              onZoomOut={() => zoomOut(0.5)}
              onReset={() => {
                resetTransform(400);
                if (is3DMode) {
                  setTiltAngle(52);
                  setRotateAngle(-26);
                }
              }}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
              isCoordinateMode={isCoordinateMode}
              onToggleCoordinateMode={() => {
                setIsCoordinateMode(!isCoordinateMode);
                setClickedCoord(null);
              }}
              showPins={showPins}
              onTogglePins={() => setShowPins(!showPins)}
              is3DMode={is3DMode}
              onToggle3DMode={() => setIs3DMode(!is3DMode)}
              show3DControls={show3DControls}
              onToggle3DControls={() => setShow3DControls(!show3DControls)}
              totalMarkers={mappedLocations.length}
            />

            {/* 3D Camera Controls Popover */}
            {is3DMode && show3DControls && (
              <div className="absolute top-16 right-4 z-40 w-72 p-4 rounded-2xl bg-resort-950/95 text-white border border-gold-400/80 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 duration-150 space-y-4">
                <div className="flex items-center justify-between border-b border-gold-500/30 pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-gold-400 uppercase tracking-wide">
                    <Move3d className="w-4 h-4" /> Sudut 3D Isometric
                  </span>
                  <button
                    type="button"
                    onClick={() => setShow3DControls(false)}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Tutup
                  </button>
                </div>

                {/* Tilt Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span>Kemiringan (Tilt)</span>
                    <span className="font-mono text-gold-400 font-bold">{tiltAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="75"
                    value={tiltAngle}
                    onChange={(e) => setTiltAngle(Number(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer h-1.5 bg-resort-800 rounded-lg"
                  />
                </div>

                {/* Rotation Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span>Rotasi Sudut</span>
                    <span className="font-mono text-gold-400 font-bold">{rotateAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="60"
                    value={rotateAngle}
                    onChange={(e) => setRotateAngle(Number(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer h-1.5 bg-resort-800 rounded-lg"
                  />
                </div>

                {/* Presets */}
                <div className="pt-2 border-t border-gold-500/20 grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTiltAngle(52);
                      setRotateAngle(-26);
                    }}
                    className="px-2 py-1.5 rounded-lg bg-resort-900 hover:bg-gold-500/20 text-[10px] font-semibold text-gold-300 border border-gold-500/30"
                  >
                    Isometric
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTiltAngle(35);
                      setRotateAngle(-15);
                    }}
                    className="px-2 py-1.5 rounded-lg bg-resort-900 hover:bg-gold-500/20 text-[10px] font-semibold text-gold-300 border border-gold-500/30"
                  >
                    Bird-Eye
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTiltAngle(65);
                      setRotateAngle(-35);
                    }}
                    className="px-2 py-1.5 rounded-lg bg-resort-900 hover:bg-gold-500/20 text-[10px] font-semibold text-gold-300 border border-gold-500/30"
                  >
                    Dramatic
                  </button>
                </div>
              </div>
            )}

            {/* Mode & Navigation Hints at Bottom Left */}
            <div className="absolute bottom-4 left-4 z-30 pointer-events-none no-print">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-resort-950/90 text-zinc-300 text-xs border border-gold-500/30 backdrop-blur-md shadow-lg">
                <Info className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="hidden sm:inline">
                  {is3DMode ? "Mode 3D Isometric Aktif" : "Mode 2D Datar"} • Scroll/Pinch untuk Zoom • Drag untuk Geser
                </span>
                <span className="sm:hidden">
                  {is3DMode ? "3D Isometric" : "2D"} • Pinch untuk Zoom
                </span>
              </div>
            </div>

            {/* Coordinate Helper Floating Banner */}
            {isCoordinateMode && (
              <div className="absolute top-4 left-4 z-40 max-w-sm p-4 rounded-2xl bg-resort-900/95 text-white border border-gold-400 shadow-2xl backdrop-blur-md animate-in slide-in-from-top duration-200">
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
                  Klik titik manapun di peta untuk mendapatkan persentase koordinat (x%, y%).
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

            {/* Map Canvas with 3D Transforms */}
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transformStyle: is3DMode ? "preserve-3d" : "flat",
              }}
            >
              {/* 3D Isometric Map Stage Container */}
              <div
                className="relative transition-transform duration-300 ease-out flex items-center justify-center"
                style={{
                  transformStyle: is3DMode ? "preserve-3d" : "flat",
                  transform: is3DMode
                    ? `scale(0.88) rotateX(${currentTilt}deg) rotateZ(${currentRotate}deg)`
                    : "none",
                }}
              >
                {/* 3D Map Ground Plate with Realistic Depth & Drop Shadow */}
                {is3DMode && (
                  <div
                    className="absolute inset-0 -bottom-6 -right-6 rounded-3xl bg-resort-950/90 pointer-events-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.85)] border-b-8 border-r-8 border-gold-900/60"
                    style={{
                      transform: "translateZ(-20px)",
                    }}
                  />
                )}

                {/* Main Interactive Map Canvas */}
                <div
                  className={`relative cursor-grab active:cursor-grabbing w-[1400px] lg:w-[1800px] aspect-[8858/2669] flex items-center justify-center rounded-2xl overflow-visible transition-shadow ${
                    isCoordinateMode ? "cursor-crosshair active:cursor-crosshair" : ""
                  }`}
                  onClick={handleMapClick}
                  style={{
                    transformStyle: is3DMode ? "preserve-3d" : "flat",
                  }}
                >
                  {/* Clean 2D Map Image */}
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="/map_only_clean.jpg"
                      alt="Denah Area The Highland Park Resort Bogor"
                      fill
                      priority
                      unoptimized
                      sizes="100vw"
                      className="object-contain pointer-events-none"
                    />
                  </div>

                  {/* Render All Markers (Standing upright in 3D Mode!) */}
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
                          is3DMode={is3DMode}
                          tiltAngle={currentTilt}
                          rotateAngle={currentRotate}
                          onClick={onSelectLocation}
                        />
                      );
                    })}

                  {/* Temporary Crosshair Pin when clicking in coordinate mode */}
                  {isCoordinateMode && clickedCoord && (
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none animate-bounce"
                      style={{ left: `${clickedCoord.x}%`, top: `${clickedCoord.y}%` }}
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-gold-400 bg-gold-500/80 shadow-glow-gold flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};
