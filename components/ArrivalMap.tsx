"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import {
  VIPArrival,
  VIP_ARRIVALS,
  WELCOME_GATE_COORDS,
  Waypoint,
  ALL_RUNDOWN_ITEMS,
  ACCOMMODATION_ROOMS,
  DAY2_HIGHLIGHT_SPOTS,
  AccommodationRoom,
  HighlightSpot,
} from "@/data/arrivals";
import { LOCATIONS, LocationItem } from "@/data/locations";
import { Pawn } from "./Pawn";
import { ScheduleSidebar } from "./ScheduleSidebar";
import { ArrivalPopupCard } from "./ArrivalPopupCard";
import { LocationMarker } from "./LocationMarker";
import { LocationModal } from "./LocationModal";
import { PathEditorOverlay, ROUTE_ACTIVITIES } from "./PathEditorOverlay";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  Route,
  Edit3,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  Sparkles,
  Bed,
  Compass,
  X,
  Users,
  UserCheck,
  Eye,
  EyeOff,
} from "lucide-react";

interface ArrivalMapProps {
  onOpenRundownModal?: () => void;
}

export const ArrivalMap: React.FC<ArrivalMapProps> = ({ onOpenRundownModal }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const mapCanvasRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Direct Route Animation Progress: 0 (Start) to 1 (Destination)
  const [animProgress, setAnimProgress] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showPaths, setShowPaths] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [avatarMode, setAvatarMode] = useState<"circle" | "squad">("squad");
  const [showF11Toast, setShowF11Toast] = useState<boolean>(false);
  const f11TimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active Agenda State - Starts from Agenda 1 (Kedatangan PJU Pusziad)
  const [activeActivityId, setActiveActivityId] = useState<string>("d1-arrival");
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  // Clickable Resort Places State
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [showAllLocations, setShowAllLocations] = useState<boolean>(true);

  // Active room & spot popups
  const [openRoomPopupIds, setOpenRoomPopupIds] = useState<Record<string, boolean>>({});
  const [openSpotPopupIds, setOpenSpotPopupIds] = useState<Record<string, boolean>>({});

  const [customRoutes, setCustomRoutes] = useState<Record<string, Waypoint[]>>(() => {
    const initial: Record<string, Waypoint[]> = {};
    ROUTE_ACTIVITIES.forEach((act) => {
      initial[act.id] = act.defaultWaypoints;
    });
    return initial;
  });

  const [draggedNodeIndex, setDraggedNodeIndex] = useState<number | null>(null);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);

  // Load custom routes from LocalStorage on mount
  useEffect(() => {
    try {
      const loaded: Record<string, Waypoint[]> = {};
      ROUTE_ACTIVITIES.forEach((act) => {
        const saved = localStorage.getItem(`famgath_route_${act.id}`);
        if (saved) {
          loaded[act.id] = JSON.parse(saved);
        } else {
          loaded[act.id] = act.defaultWaypoints;
        }
      });
      setCustomRoutes((prev) => ({ ...prev, ...loaded }));
    } catch (e) {
      console.error("Error loading routes from localStorage", e);
    }
  }, []);

  // Popup state: map of which VIP popups are open
  const [openPopupIds, setOpenPopupIds] = useState<Record<string, boolean>>({});

  // Active waypoints for current selected activity in editor
  const activeWaypoints = useMemo(() => {
    return customRoutes[activeActivityId] || ROUTE_ACTIVITIES[0].defaultWaypoints;
  }, [customRoutes, activeActivityId]);

  // All 86 Mapped Locations with valid coordinates
  const mappedLocations = useMemo(() => {
    return LOCATIONS.filter((l) => l.mapX !== undefined && l.mapY !== undefined);
  }, []);

  // Smooth Focus & Zoom to a specific coordinate on map with smart framing
  const focusOnCoordinate = useCallback((coord: Waypoint, zoomFactor = 1.55) => {
    if (transformRef.current && containerRef.current) {
      const { setTransform } = transformRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();
      const targetX = (coord.x / 100) * containerRect.width;
      const targetY = (coord.y / 100) * containerRect.height;
      
      // Smart camera framing: when card expands below pin (coord.y < 45), position pin higher so card has ample bottom space
      const verticalFrameOffset = coord.y < 45 ? containerRect.height * 0.15 : -containerRect.height * 0.10;

      const posX = containerRect.width / 2 - targetX * zoomFactor;
      const posY = containerRect.height / 2 - targetY * zoomFactor - verticalFrameOffset;
      setTransform(posX, posY, zoomFactor, 700, "easeOutQuad");
    }
  }, []);

  // Find active agenda item
  const currentAgendaItem = useMemo(() => {
    return (
      ALL_RUNDOWN_ITEMS.find((item) => item.id === activeActivityId) ||
      ALL_RUNDOWN_ITEMS[0]
    );
  }, [activeActivityId]);

  // Dynamically attach updated waypoints & destination to VIP
  const activeVIPs: VIPArrival[] = useMemo(() => {
    const agendaWaypoints =
      customRoutes[activeActivityId] ||
      currentAgendaItem.defaultWaypoints ||
      ROUTE_ACTIVITIES[0].defaultWaypoints;

    const dest =
      agendaWaypoints[agendaWaypoints.length - 1] ||
      currentAgendaItem.destCoordinates || { x: 58.5, y: 22.5 };

    return VIP_ARRIVALS.map((vip) => ({
      ...vip,
      mapLocationName: currentAgendaItem.locationName || vip.mapLocationName,
      roomLegendNumber:
        currentAgendaItem.destLegendNumber || vip.roomLegendNumber,
      roomImage: currentAgendaItem.destImage || vip.roomImage,
      roomX: dest.x,
      roomY: dest.y,
      gateArrivalMinutes: currentAgendaItem.startMinutes,
      gateArrivalTimeStr: currentAgendaItem.startTime,
      walkStartMinutes: currentAgendaItem.startMinutes,
      walkStartTimeStr: currentAgendaItem.startTime,
      roomArrivalMinutes: currentAgendaItem.endMinutes,
      roomArrivalTimeStr: currentAgendaItem.endTime,
      pathWaypoints: agendaWaypoints,
      color: currentAgendaItem.color || vip.color,
    }));
  }, [customRoutes, activeActivityId, currentAgendaItem]);

  const startPoint = useMemo(() => {
    const waypoints =
      customRoutes[activeActivityId] ||
      currentAgendaItem.defaultWaypoints ||
      ROUTE_ACTIVITIES[0].defaultWaypoints;
    return waypoints[0] || WELCOME_GATE_COORDS;
  }, [customRoutes, activeActivityId, currentAgendaItem]);

  // Play Continuous Smooth Animation along waypoints (from 0 to 1)
  const startRouteAnimation = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    if (currentAgendaItem.disablePawn) {
      setIsAnimating(false);
      setAnimProgress(1);
      setOpenPopupIds({ [VIP_ARRIVALS[0].id]: true });
      return;
    }

    setIsAnimating(true);
    setAnimProgress(0);
    setOpenPopupIds({});
    setOpenRoomPopupIds({});
    setOpenSpotPopupIds({});

    const startTime = performance.now();
    const duration = 2800; // Continuous smooth movement

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      setAnimProgress(progress);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setAnimProgress(1);
        // Automatically open destination location photo card on arrival (except Kedatangan PJU)
        if (activeActivityId !== "d1-arrival") {
          setOpenPopupIds({ [VIP_ARRIVALS[0].id]: true });
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [currentAgendaItem, activeActivityId]);

  // When active activity changes, start animation immediately
  useEffect(() => {
    startRouteAnimation();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeActivityId, startRouteAnimation]);

  // Handle Select Agenda from Sidebar: Zoom in & focus on destination
  const handleSelectAgenda = (agendaId: string) => {
    setActiveActivityId(agendaId);
    setSelectedNodeIndex(null);
    const item = ALL_RUNDOWN_ITEMS.find((a) => a.id === agendaId);
    if (item) {
      const dest =
        customRoutes[agendaId]?.[customRoutes[agendaId].length - 1] ||
        item.destCoordinates ||
        item.defaultWaypoints?.[item.defaultWaypoints.length - 1];
      if (dest) {
        focusOnCoordinate(dest, 1.75);
      }
    }
  };

  // Handle Select Location directly from Map pin
  const handleSelectLocation = useCallback(
    (loc: LocationItem) => {
      setSelectedLocation(loc);
      setIsLocationModalOpen(true);
      if (loc.mapX !== undefined && loc.mapY !== undefined) {
        focusOnCoordinate({ x: loc.mapX, y: loc.mapY }, 1.75);
      }
    },
    [focusOnCoordinate]
  );

  // Toggle Popup manually
  const handleTogglePopup = (vipId: string) => {
    setOpenPopupIds((prev) => ({
      ...prev,
      [vipId]: !prev[vipId],
    }));
  };

  const handleOpenPopup = (vipId: string) => {
    setOpenPopupIds((prev) => ({
      ...prev,
      [vipId]: true,
    }));
  };

  const handleClosePopup = (vipId: string) => {
    setOpenPopupIds((prev) => ({
      ...prev,
      [vipId]: false,
    }));
  };

  // Update Waypoints from Editor with Instant Auto-Save
  const handleUpdateWaypoints = (newWaypoints: Waypoint[]) => {
    setCustomRoutes((prev) => ({
      ...prev,
      [activeActivityId]: newWaypoints,
    }));

    // Auto-save instantly so changes are never lost across reloads/rebuilds
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `famgath_route_${activeActivityId}`,
          JSON.stringify(newWaypoints)
        );
      } catch (e) {
        console.error("Error auto-saving route to localStorage", e);
      }
    }
  };

  // Delete specific node
  const handleDeleteNode = (index: number) => {
    if (activeWaypoints.length <= 2) {
      alert("Rute minimal harus memiliki 2 titik (Titik Awal & Titik Akhir).");
      return;
    }
    const updated = activeWaypoints.filter((_, i) => i !== index);
    handleUpdateWaypoints(updated);
    setSelectedNodeIndex(null);
  };

  // Keyboard shortcut: Delete or Backspace to delete selected node
  useEffect(() => {
    if (!isEditorOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeIndex !== null) {
        if (activeWaypoints.length > 2) {
          e.preventDefault();
          handleDeleteNode(selectedNodeIndex);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditorOpen, selectedNodeIndex, activeWaypoints]);

  // Interactive Node Dragging on Map Canvas
  const handleNodePointerDown = (index: number, e: React.PointerEvent) => {
    if (!isEditorOpen) return;
    e.stopPropagation();
    e.preventDefault();
    setDraggedNodeIndex(index);
    setSelectedNodeIndex(index);
  };

  const handleMapPointerMove = (e: React.PointerEvent) => {
    if (!isEditorOpen || draggedNodeIndex === null || !mapCanvasRef.current) return;

    const rect = mapCanvasRef.current.getBoundingClientRect();
    const xPct = Math.max(1, Math.min(99, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(1, Math.min(99, ((e.clientY - rect.top) / rect.height) * 100));

    const updated = [...activeWaypoints];
    updated[draggedNodeIndex] = {
      x: Number(xPct.toFixed(1)),
      y: Number(yPct.toFixed(1)),
    };

    handleUpdateWaypoints(updated);
  };

  const handleMapPointerUp = () => {
    if (draggedNodeIndex !== null) {
      setDraggedNodeIndex(null);
    }
  };

  // Click on Map to Add Waypoint Node
  const handleMapCanvasClick = (e: React.MouseEvent) => {
    if (!isEditorOpen || draggedNodeIndex !== null || !mapCanvasRef.current) return;

    const rect = mapCanvasRef.current.getBoundingClientRect();
    const xPct = Math.max(1, Math.min(99, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(1, Math.min(99, ((e.clientY - rect.top) / rect.height) * 100));

    const newPoint: Waypoint = {
      x: Number(xPct.toFixed(1)),
      y: Number(yPct.toFixed(1)),
    };

    const updated = [...activeWaypoints];
    if (selectedNodeIndex !== null && selectedNodeIndex < updated.length - 1) {
      updated.splice(selectedNodeIndex + 1, 0, newPoint);
      setSelectedNodeIndex(selectedNodeIndex + 1);
    } else {
      updated.push(newPoint);
      setSelectedNodeIndex(updated.length - 1);
    }

    handleUpdateWaypoints(updated);
  };

  // Handle Fullscreen & Trigger "Tekan F11 untuk Full Screen" notification
  const handleToggleFullscreen = useCallback(() => {
    // Show stylish instruction toast
    setShowF11Toast(true);
    if (f11TimerRef.current) clearTimeout(f11TimerRef.current);
    f11TimerRef.current = setTimeout(() => {
      setShowF11Toast(false);
    }, 4500);

    try {
      const doc = typeof document !== "undefined" ? (document as any) : null;
      if (!doc) return;

      const isFs =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement;

      if (!isFs) {
        const elem = (doc.documentElement || doc.body || containerRef.current) as any;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch((err: any) => console.warn("Fullscreen request error:", err));
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          doc.exitFullscreen().catch((err: any) => console.warn("Exit fullscreen error:", err));
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          doc.msExitFullscreen();
        }
      }
    } catch (e) {
      console.error("Toggle fullscreen error:", e);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      const doc = document as any;
      setIsFullscreen(
        !!(
          doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
        )
      );
    };

    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    document.addEventListener("mozfullscreenchange", onFsChange);
    document.addEventListener("MSFullscreenChange", onFsChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      document.removeEventListener("mozfullscreenchange", onFsChange);
      document.removeEventListener("MSFullscreenChange", onFsChange);
    };
  }, []);

  const activeActivity =
    ROUTE_ACTIVITIES.find((a) => a.id === activeActivityId) || ROUTE_ACTIVITIES[0];

  return (
    <div className="w-full flex flex-col lg:flex-row items-stretch gap-4">
      {/* Side Schedule List */}
      {showSidebar && (
        <ScheduleSidebar
          activeAgendaId={activeActivityId}
          isAnimating={isAnimating}
          onSelectAgenda={handleSelectAgenda}
          onReplayAnimation={startRouteAnimation}
          onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
          isEditorOpen={isEditorOpen}
          onHide={() => setShowSidebar(false)}
          onOpenRundownModal={onOpenRundownModal}
        />
      )}

      {/* Full-Width Giant Map Stage Canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full overflow-hidden rounded-3xl border-2 border-lime-400/40 shadow-2xl bg-[#0e1d03] select-none h-[88vh] sm:h-[91vh] min-h-[680px] max-h-[1400px]"
      >
        {/* Floating Button to Re-open Schedule Sidebar when Hidden */}
        {!showSidebar && (
          <div className="absolute top-4 left-4 z-40 no-print flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSidebar(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-lime-50 text-slate-900 border-2 border-lime-400/80 text-xs font-black shadow-xl backdrop-blur-md transition-all cursor-pointer hover:scale-105"
            >
              <Calendar className="w-4 h-4 text-lime-700" />
              <span>📋 Buka Rundown</span>
            </button>
          </div>
        )}

        {/* Full Interactive Path & Node Editor Overlay Bar */}
        <PathEditorOverlay
          isEditorOpen={isEditorOpen}
          onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
          activeActivityId={activeActivityId}
          onSelectActivity={(id) => {
            setActiveActivityId(id);
            setSelectedNodeIndex(null);
          }}
          currentWaypoints={activeWaypoints}
          allCustomRoutes={customRoutes}
          onUpdateWaypoints={handleUpdateWaypoints}
          onTestRoute={startRouteAnimation}
        />

        <TransformWrapper
          ref={transformRef}
          initialScale={1.0}
          minScale={0.6}
          maxScale={6}
          centerOnInit={true}
          wheel={{ step: 0.15 }}
          pinch={{ step: 5 }}
          doubleClick={{ mode: "zoomIn", step: 0.7 }}
          disabled={isEditorOpen} // Disable pan/zoom drag when editing nodes so user can drag nodes easily
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Floating Quick Toggle Pill: Angka Legenda (Hide / Show) */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-35 no-print">
                <button
                  type="button"
                  onClick={() => setShowAllLocations(!showAllLocations)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black shadow-2xl backdrop-blur-md transition-all duration-200 cursor-pointer border-2 select-none hover:scale-105 active:scale-95 ${
                    showAllLocations
                      ? "bg-[#0e1d03]/95 text-lime-300 border-lime-400/80 shadow-glow-lime ring-2 ring-lime-400/30"
                      : "bg-[#1f1304]/95 text-amber-300 border-amber-400/80 shadow-glow-butter ring-2 ring-amber-400/30"
                  }`}
                  title={
                    showAllLocations
                      ? "Klik untuk menyembunyikan angka legenda (86 titik pin lokasi)"
                      : "Klik untuk menampilkan angka legenda (86 titik pin lokasi)"
                  }
                >
                  {showAllLocations ? (
                    <>
                      <Eye className="w-4 h-4 text-lime-400" />
                      <span className="tracking-wide">Hide Angka Legenda</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 text-amber-400" />
                      <span className="tracking-wide">Show Angka Legenda</span>
                    </>
                  )}
                </button>
              </div>

              {/* Floating Map Toolbar */}
              <div className="absolute top-4 right-4 z-40 flex flex-col gap-1.5 no-print">
                <div className="flex flex-col bg-[#0b1a03]/95 backdrop-blur-md rounded-2xl shadow-xl border-2 border-lime-400/40 p-1.5 gap-1">
                  {/* Toggle All Location Pins (Angka Legenda) Button */}
                  <button
                    type="button"
                    onClick={() => setShowAllLocations(!showAllLocations)}
                    title={
                      showAllLocations
                        ? "Sembunyikan Angka Legenda (86 Titik Lokasi)"
                        : "Tampilkan Angka Legenda (86 Titik Lokasi)"
                    }
                    className={`p-2.5 rounded-xl transition-all cursor-pointer relative ${
                      showAllLocations
                        ? "text-slate-950 bg-butter-pill ring-2 ring-amber-300 shadow-md font-black"
                        : "text-slate-400 hover:text-white hover:bg-lime-800/40"
                    }`}
                  >
                    {showAllLocations ? (
                      <Eye className="w-5 h-5 text-slate-950" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>

                  {/* Edit Nodes Mode Button */}
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(!isEditorOpen)}
                    title={isEditorOpen ? "Tutup Editor Nodes" : "🛠️ Edit Titik / Nodes Rute"}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                      isEditorOpen
                        ? "text-lime-950 bg-butter-pill ring-2 ring-amber-300 shadow-md font-black"
                        : "text-lime-300 hover:text-white hover:bg-lime-800/40"
                    }`}
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>

                  {/* Toggle Schedule Sidebar */}
                  <button
                    type="button"
                    onClick={() => setShowSidebar(!showSidebar)}
                    title={showSidebar ? "Sembunyikan Daftar Jadwal" : "Tampilkan Daftar Jadwal"}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer ${showSidebar
                        ? "text-butter-pill bg-lime-800/60"
                        : "text-lime-300 hover:text-white"
                      }`}
                  >
                    {showSidebar ? (
                      <PanelLeftClose className="w-5 h-5" />
                    ) : (
                      <PanelLeftOpen className="w-5 h-5" />
                    )}
                  </button>

                  {/* Open Rundown Poster Modal directly from toolbar */}
                  {onOpenRundownModal && (
                    <button
                      type="button"
                      onClick={onOpenRundownModal}
                      title="Buka Poster Rundown Acara"
                      className="p-2.5 rounded-xl text-butter-200 hover:text-white hover:bg-lime-800/40 transition-colors cursor-pointer"
                    >
                      <Calendar className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => zoomIn(0.5)}
                    title="Perbesar Peta (+)"
                    className="p-2.5 rounded-xl text-lime-200 hover:text-white hover:bg-lime-800/40 transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => zoomOut(0.5)}
                    title="Perkecil Peta (-)"
                    className="p-2.5 rounded-xl text-lime-200 hover:text-white hover:bg-lime-800/40 transition-colors cursor-pointer"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => resetTransform(400)}
                    title="Reset Posisi Peta"
                    className="p-2.5 rounded-xl text-lime-200 hover:text-white hover:bg-lime-800/40 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaths(!showPaths)}
                    title={
                      showPaths
                        ? "Sembunyikan Garis Rute (Jalur Lintasan)"
                        : "Tampilkan Garis Rute (Jalur Lintasan)"
                    }
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                      showPaths
                        ? "text-slate-950 bg-butter-pill ring-2 ring-amber-300 shadow-md font-black"
                        : "text-slate-400 hover:text-white hover:bg-lime-800/40"
                    }`}
                  >
                    <Route className="w-5 h-5" />
                  </button>
                  {/* Pilihan Model Karakter: 4 PJU Berdampingan vs Avatar Pin Lingkaran */}
                  <button
                    type="button"
                    onClick={() => setAvatarMode(avatarMode === "squad" ? "circle" : "squad")}
                    title={
                      avatarMode === "squad"
                        ? "Model Avatar: 4 PJU Berdampingan (Klik untuk Ganti ke Pin Lingkaran)"
                        : "Model Avatar: Pin Lingkaran 1 Orang (Klik untuk Ganti ke 4 PJU Berdampingan)"
                    }
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer ${avatarMode === "squad"
                        ? "text-butter-pill bg-lime-800/70 shadow-sm ring-1 ring-lime-400/40"
                        : "text-lime-300 hover:text-white hover:bg-lime-800/40"
                      }`}
                  >
                    {avatarMode === "squad" ? (
                      <Users className="w-5 h-5 text-butter-300" />
                    ) : (
                      <UserCheck className="w-5 h-5 text-lime-300" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    title="Tekan F11 untuk Full Screen"
                    className="p-2.5 rounded-xl text-lime-200 hover:text-white hover:bg-lime-800/40 transition-colors cursor-pointer"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-5 h-5" />
                    ) : (
                      <Maximize2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Map Canvas */}
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
                  ref={mapCanvasRef}
                  onClick={handleMapCanvasClick}
                  onPointerMove={handleMapPointerMove}
                  onPointerUp={handleMapPointerUp}
                  className={`relative w-[1500px] lg:w-[2000px] aspect-[16/9] flex items-center justify-center rounded-2xl overflow-visible ${isEditorOpen
                      ? "cursor-crosshair ring-4 ring-amber-400/50"
                      : "cursor-grab active:cursor-grabbing"
                    }`}
                >
                  {/* 3D Master Diorama Map Background */}
                  <Image
                    src="/maps-area.png"
                    alt="Peta Jalur Kedatangan Tamu VIP"
                    fill
                    priority
                    unoptimized
                    sizes="100vw"
                    className="object-contain pointer-events-none drop-shadow-2xl"
                  />

                  {/* SVG Waypoint Paths / Tracks */}
                  {showPaths && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none z-20"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      {/* Render Active Activity Path in Editor */}
                      {isEditorOpen && (
                        <g>
                          <polyline
                            points={activeWaypoints.map((p) => `${p.x},${p.y}`).join(" ")}
                            fill="none"
                            stroke={activeActivity.color}
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeOpacity="0.4"
                          />
                          <polyline
                            points={activeWaypoints.map((p) => `${p.x},${p.y}`).join(" ")}
                            fill="none"
                            stroke={activeActivity.color}
                            strokeWidth="1.2"
                            strokeDasharray="2 1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeOpacity="1"
                            className="animate-pulse drop-shadow-lg"
                          />
                        </g>
                      )}

                      {/* Regular Simulation Path Tracks */}
                      {!isEditorOpen &&
                        activeVIPs.map((vip) => {
                          const points = vip.pathWaypoints
                            .map((p) => `${p.x},${p.y}`)
                            .join(" ");

                          return (
                            <g key={vip.id}>
                              <polyline
                                points={points}
                                fill="none"
                                stroke={vip.color}
                                strokeWidth="2.0"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeOpacity="0.25"
                              />
                              <polyline
                                points={points}
                                fill="none"
                                stroke={vip.color}
                                strokeWidth="0.8"
                                strokeDasharray="1.2 1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeOpacity="0.9"
                                className="drop-shadow-md"
                              />
                              {vip.pathWaypoints.map((pt, pIdx) => (
                                <circle
                                  key={pIdx}
                                  cx={pt.x}
                                  cy={pt.y}
                                  r={
                                    pIdx === 0 || pIdx === vip.pathWaypoints.length - 1
                                      ? "0.6"
                                      : "0.38"
                                  }
                                  fill={vip.color}
                                  stroke="#ffffff"
                                  strokeWidth="0.18"
                                  className="drop-shadow"
                                />
                              ))}
                            </g>
                          );
                        })}
                    </svg>
                  )}

                  {/* Interactive Draggable Waypoint Nodes in Editor Mode */}
                  {isEditorOpen &&
                    activeWaypoints.map((pt, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === activeWaypoints.length - 1;
                      const isSelected = idx === selectedNodeIndex;

                      return (
                        <div
                          key={`editor-node-${idx}`}
                          onPointerDown={(e) => handleNodePointerDown(idx, e)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNodeIndex(idx === selectedNodeIndex ? null : idx);
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (activeWaypoints.length > 2) {
                              handleDeleteNode(idx);
                            }
                          }}
                          className={`absolute z-40 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-move select-none transition-transform ${isSelected ? "scale-125 z-50" : "hover:scale-115"
                            }`}
                          style={{
                            left: `${pt.x}%`,
                            top: `${pt.y}%`,
                          }}
                          title={`Titik #${idx + 1} (${pt.x.toFixed(1)}%, ${pt.y.toFixed(1)}%) - Klik untuk pilih, Klik Kanan untuk hapus`}
                        >
                          <div
                            className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xl border-2 transition-all ${isSelected
                                ? "bg-amber-400 text-resort-950 border-white ring-4 ring-amber-400 shadow-glow-gold"
                                : isFirst
                                  ? "bg-emerald-500 text-white border-white ring-2 ring-emerald-400"
                                  : isLast
                                    ? "bg-rose-500 text-white border-white ring-2 ring-rose-400"
                                    : "bg-resort-950 text-gold-300 border-gold-400 ring-1 ring-black/40"
                              }`}
                          >
                            {isFirst ? "S" : isLast ? "E" : idx + 1}

                            {/* Quick Delete Cross Button on Selected Node */}
                            {isSelected && activeWaypoints.length > 2 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNode(idx);
                                }}
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-[10px] font-black shadow-lg border border-white cursor-pointer z-50 animate-bounce"
                                title={`Hapus Titik #${idx + 1}`}
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Node Coordinate Pill */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded-md bg-resort-950/95 border border-gold-500/40 text-[9px] font-mono font-bold text-gold-300 shadow-lg whitespace-nowrap pointer-events-none">
                            #{idx + 1} ({pt.x.toFixed(1)}%, {pt.y.toFixed(1)}%)
                          </div>
                        </div>
                      );
                    })}

                  {/* Interactive 86 Resort Location Markers (Clickable places across map) */}
                  {!isEditorOpen && showAllLocations && (
                    <div className="absolute inset-0 pointer-events-none z-15">
                      {mappedLocations.map((loc) => (
                        <div key={`loc-pin-${loc.id}`} className="pointer-events-auto">
                          <LocationMarker
                            location={loc}
                            isSelected={selectedLocation?.id === loc.id}
                            isHighlighted={true}
                            onClick={handleSelectLocation}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Starting Point Marker on Map (Only when PJU arrival/check-in is active) */}
                  {!isEditorOpen &&
                    !currentAgendaItem.disablePawn &&
                    (activeActivityId === "d1-arrival" || activeActivityId === "d1-checkin") &&
                    startPoint && (
                      <div
                        className="absolute z-20 -translate-x-1/2 -translate-y-full pointer-events-none"
                        style={{
                          left: `${startPoint.x}%`,
                          top: `${startPoint.y}%`,
                        }}
                      >
                        <div className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-bold shadow-md border border-white flex items-center gap-1 animate-bounce mb-1">
                          <MapPin className="w-3 h-3" /> Titik Awal ({currentAgendaItem.badge})
                        </div>
                      </div>
                    )}

                  {/* Render Destination Room Popups / Collapsed Badges */}
                  {!isEditorOpen &&
                    activeActivityId !== "d1-arrival" &&
                    activeActivityId !== "d2-jalan-sehat" &&
                    activeVIPs.map((vip) => (
                      <ArrivalPopupCard
                        key={`popup-${vip.id}-${activeActivityId}`}
                        vip={vip}
                        agendaItem={currentAgendaItem}
                        roomData={
                          activeActivityId === "d1-checkin"
                            ? ACCOMMODATION_ROOMS.find((r) => r.isPJU)
                            : undefined
                        }
                        isOpen={!!openPopupIds[vip.id]}
                        onClose={() => handleClosePopup(vip.id)}
                        onOpen={() => handleOpenPopup(vip.id)}
                      />
                    ))}

                  {/* Render 2 Additional Rombongan Accommodation Rooms on Check-in */}
                  {activeActivityId === "d1-checkin" &&
                    !isEditorOpen &&
                    ACCOMMODATION_ROOMS.filter((r) => !r.isPJU).map((room) => {
                      const dummyVip: VIPArrival = {
                        id: room.id,
                        name: room.name,
                        title: room.role,
                        isPJU: false,
                        photo: "",
                        color: "#f59e0b",
                        gateArrivalTimeStr: "17:00",
                        gateArrivalMinutes: 1020,
                        walkStartTimeStr: "17:00",
                        walkStartMinutes: 1020,
                        roomArrivalTimeStr: "18:00",
                        roomArrivalMinutes: 1080,
                        internalNumber: room.internalNumber,
                        roomLegendNumber: room.legendNumber,
                        roomImage: room.image,
                        mapLocationName: room.name,
                        roomX: room.coords.x,
                        roomY: room.coords.y,
                        pathWaypoints: [room.coords],
                      };

                      return (
                        <ArrivalPopupCard
                          key={room.id}
                          vip={dummyVip}
                          roomData={room}
                          isOpen={!!openRoomPopupIds[room.id]}
                          onClose={() =>
                            setOpenRoomPopupIds((prev) => ({
                              ...prev,
                              [room.id]: false,
                            }))
                          }
                          onOpen={() =>
                            setOpenRoomPopupIds((prev) => ({
                              ...prev,
                              [room.id]: true,
                            }))
                          }
                        />
                      );
                    })}

                  {/* Render 4 Highlight Spots on Day 2 Jalan Sehat */}
                  {activeActivityId === "d2-jalan-sehat" &&
                    !isEditorOpen &&
                    DAY2_HIGHLIGHT_SPOTS.map((spot) => {
                      const dummyVip: VIPArrival = {
                        id: spot.id,
                        name: spot.name,
                        title: spot.category,
                        isPJU: false,
                        photo: "",
                        color: "#14b8a6",
                        gateArrivalTimeStr: "07:45",
                        gateArrivalMinutes: 465,
                        walkStartTimeStr: "07:45",
                        walkStartMinutes: 465,
                        roomArrivalTimeStr: "08:45",
                        roomArrivalMinutes: 525,
                        internalNumber: spot.legendNumber,
                        roomLegendNumber: spot.legendNumber,
                        roomImage: spot.image,
                        mapLocationName: spot.name,
                        roomX: spot.coords.x,
                        roomY: spot.coords.y,
                        pathWaypoints: [spot.coords],
                      };

                      return (
                        <ArrivalPopupCard
                          key={spot.id}
                          vip={dummyVip}
                          spotData={spot}
                          agendaItem={currentAgendaItem}
                          isOpen={!!openSpotPopupIds[spot.id]}
                          onClose={() =>
                            setOpenSpotPopupIds((prev) => ({
                              ...prev,
                              [spot.id]: false,
                            }))
                          }
                          onOpen={() =>
                            setOpenSpotPopupIds((prev) => ({
                              ...prev,
                              [spot.id]: true,
                            }))
                          }
                        />
                      );
                    })}

                  {/* Render All Animated Continuous Pawns: Only active for d1-arrival and d1-checkin (until entering room) */}
                  {!isEditorOpen &&
                    !currentAgendaItem.disablePawn &&
                    (activeActivityId === "d1-arrival" || activeActivityId === "d1-checkin") &&
                    activeVIPs.map((vip, idx) => (
                      <Pawn
                        key={vip.id}
                        vip={vip}
                        progress={animProgress}
                        isWalking={isAnimating}
                        isArrived={animProgress >= 1}
                        offsetIndex={idx}
                        avatarMode={avatarMode}
                        isPopupOpen={activeActivityId !== "d1-arrival" && !!openPopupIds[vip.id]}
                        onTogglePopup={activeActivityId === "d1-arrival" ? () => { } : handleTogglePopup}
                      />
                    ))}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Location Details Modal when clicking any place on the map */}
      <LocationModal
        location={selectedLocation}
        locations={LOCATIONS}
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleSelectLocation}
        onFocusOnMap={(loc) => {
          if (loc.mapX !== undefined && loc.mapY !== undefined) {
            focusOnCoordinate({ x: loc.mapX, y: loc.mapY }, 1.75);
          }
        }}
      />

      {/* F11 Full Screen Notification Banner Toast */}
      <AnimatePresence>
        {showF11Toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[120] px-5 py-3 rounded-2xl bg-[#0b1803]/95 backdrop-blur-2xl border-2 border-lime-400 text-white shadow-2xl flex items-center gap-3.5 ring-4 ring-lime-400/25 select-none"
          >
            <div className="px-3 py-1.5 rounded-xl bg-lime-400 text-lime-950 font-mono font-black text-sm shadow-md border border-lime-300 flex items-center justify-center">
              F11
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-lime-300 font-bold uppercase tracking-wider">
                Mode Layar Penuh
              </span>
              <span className="text-sm font-extrabold text-white">
                Tekan <span className="text-butter-pill underline decoration-lime-400">F11</span> pada keyboard untuk Full Screen
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowF11Toast(false)}
              className="ml-2 p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
