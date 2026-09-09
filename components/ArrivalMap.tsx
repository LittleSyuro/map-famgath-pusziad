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
  RUNDOWN_SCHEDULE_DAY_1,
  RUNDOWN_SCHEDULE_DAY_2,
  KEY_EVENT_PINPOINTS,
  KeyEventPinpoint,
} from "@/data/arrivals";
import { LOCATIONS, LocationItem } from "@/data/locations";
import { Pawn } from "./Pawn";
import { ScheduleSidebar } from "./ScheduleSidebar";
import { ArrivalPopupCard } from "./ArrivalPopupCard";
import { LocationMarker } from "./LocationMarker";
import { LocationModal } from "./LocationModal";
import { LegendSearchModal } from "./LegendSearchModal";
import { LegendMapPopup } from "./LegendMapPopup";
import { LocationGalleryDrawer } from "./LocationGalleryDrawer";
import { PinPointCalibrator } from "./PinPointCalibrator";
import { PathEditorOverlay, ROUTE_ACTIVITIES } from "./PathEditorOverlay";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Route,
  Edit3,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  Sparkles,
  X,
  Users,
  UserCheck,
  Search,
  Crosshair,
  ChevronLeft,
  ChevronRight,
  Compass,
  Layers,
} from "lucide-react";

interface ArrivalMapProps {
  onOpenRundownModal?: () => void;
}

type PresentationPhase = "overview" | "pinpoint_focus" | "popup_open";

export const ArrivalMap: React.FC<ArrivalMapProps> = ({ onOpenRundownModal }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const mapCanvasRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Opening Intro Cover Slide State
  const [showIntroSlide, setShowIntroSlide] = useState<boolean>(true);

  // Route animation progress: 0 (Start) to 1 (Destination)
  const [animProgress, setAnimProgress] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showPaths, setShowPaths] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [avatarMode, setAvatarMode] = useState<"circle" | "squad">("squad");
  const [showF11Toast, setShowF11Toast] = useState<boolean>(false);
  const f11TimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active Agenda State
  const [activeActivityId, setActiveActivityId] = useState<string>("d1-arrival");
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  
  // Sidebar default hidden when opening maps
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  // Presentation State Machine: "overview" (Peta Utama) ➔ "pinpoint_focus" (Stay di Titik) ➔ "popup_open" (Buka Popup)
  const [presentationPhase, setPresentationPhase] = useState<PresentationPhase>("overview");

  // Clickable Resort Places & Master Gallery State
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [selectedLegendLocation, setSelectedLegendLocation] = useState<LocationItem | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [showAllLocations, setShowAllLocations] = useState<boolean>(false);
  const [showMasterGallery, setShowMasterGallery] = useState<boolean>(false);
  const [showFlatMapModal, setShowFlatMapModal] = useState<boolean>(false);
  const [showPJUWalkVideo, setShowPJUWalkVideo] = useState<boolean>(false);

  // Active room & pinpoint popups
  const [openPopupIds, setOpenPopupIds] = useState<Record<string, boolean>>({});
  const [openKeyPinpointIds, setOpenKeyPinpointIds] = useState<Record<string, boolean>>({ __closed__: true });

  // Pin Point Visual Calibrator State
  const [isCalibratorOpen, setIsCalibratorOpen] = useState<boolean>(false);
  const [selectedCalibratePinId, setSelectedCalibratePinId] = useState<string>("pin-alpine");
  const [draggedPinId, setDraggedPinId] = useState<string | null>(null);

  const [customPinCoords, setCustomPinCoords] = useState<Record<string, Waypoint>>(() => {
    const initial: Record<string, Waypoint> = {};
    KEY_EVENT_PINPOINTS.forEach((p) => {
      initial[p.id] = p.coords;
    });
    return initial;
  });

  // Load custom pin coordinates from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("famgath_pin_coords");
      if (saved) {
        setCustomPinCoords((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.error("Error loading pin coords:", e);
    }
  }, []);

  const handleUpdatePinCoord = useCallback((id: string, coords: Waypoint) => {
    setCustomPinCoords((prev) => ({ ...prev, [id]: coords }));
  }, []);

  const handleSavePinCoords = useCallback(async () => {
    localStorage.setItem("famgath_pin_coords", JSON.stringify(customPinCoords));
    try {
      await fetch("/api/save-pinpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyPinpoints: customPinCoords }),
      });
    } catch (e) {
      console.error("Error saving pinpoints to API:", e);
    }
  }, [customPinCoords]);

  const handleResetPinCoords = useCallback(() => {
    localStorage.removeItem("famgath_pin_coords");
    const initial: Record<string, Waypoint> = {};
    KEY_EVENT_PINPOINTS.forEach((p) => {
      initial[p.id] = p.coords;
    });
    setCustomPinCoords(initial);
  }, []);

  // Keyboard shortcut for search (Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      } else if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const activeWaypoints = useMemo(() => {
    return customRoutes[activeActivityId] || ROUTE_ACTIVITIES[0].defaultWaypoints;
  }, [customRoutes, activeActivityId]);

  const mappedLocations = useMemo(() => {
    return LOCATIONS.filter((l) => l.mapX !== undefined && l.mapY !== undefined);
  }, []);

  // Smooth Focus & Zoom to coordinate
  const focusOnCoordinate = useCallback((coord: Waypoint, zoomFactor = 2.1, duration = 750) => {
    if (transformRef.current && containerRef.current && mapCanvasRef.current) {
      const { setTransform } = transformRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();
      const canvasEl = mapCanvasRef.current;
      
      const canvasWidth = canvasEl.offsetWidth;
      const canvasHeight = canvasEl.offsetHeight;
      const canvasOffsetLeft = canvasEl.offsetLeft || 0;
      const canvasOffsetTop = canvasEl.offsetTop || 0;

      const pointInElementX = canvasOffsetLeft + (coord.x / 100) * canvasWidth;
      const pointInElementY = canvasOffsetTop + (coord.y / 100) * canvasHeight;
      
      const isTopHalf = coord.y < 45;
      const cardCenterOffset = isTopHalf ? 90 : -90;

      const posX = containerRect.width / 2 - pointInElementX * zoomFactor;
      const posY = (containerRect.height / 2 - cardCenterOffset) - pointInElementY * zoomFactor;
      setTransform(posX, posY, zoomFactor, duration, "easeInOutQuad");
    }
  }, []);

  // Reset View to Overview Map
  const resetToOverviewMap = useCallback((duration = 700) => {
    if (transformRef.current) {
      transformRef.current.resetTransform(duration, "easeInOutQuad");
    }
  }, []);

  // Helper mapping agenda activity ID to key event pinpoint ID
  const getPinIdForAgenda = useCallback((agendaId: string): string => {
    switch (agendaId) {
      case "d1-arrival":
        return "pin-helipad";
      case "d1-checkin-pju":
        return "pin-alpine";
      case "d1-checkin-the-cave":
        return "pin-cave";
      case "d1-checkin-mongolian":
        return "pin-mongolian";
      case "d1-worship":
        return "pin-masjid";
      case "d1-dinner":
        return "pin-resto";
      case "d1-games":
        return "pin-ballroom";
      case "d2-breakfast":
        return "pin-resto";
      case "d2-prep-jalan-santai":
        return "pin-helipad";
      case "d2-jalan-santai":
        return "pin-bridge";
      case "d2-kopi-hip":
        return "pin-kopihip";
      case "d2-ballroom-grandprize":
      case "d2-lunch":
        return "pin-ballroom";
      case "d2-freetime":
        return "pin-helipad";
      default:
        return "pin-alpine";
    }
  }, []);

  const currentAgendaIndex = useMemo(() => {
    const idx = ALL_RUNDOWN_ITEMS.findIndex((item) => item.id === activeActivityId);
    return idx >= 0 ? idx : 0;
  }, [activeActivityId]);

  const currentAgendaItem = useMemo(() => {
    return ALL_RUNDOWN_ITEMS[currentAgendaIndex] || ALL_RUNDOWN_ITEMS[0];
  }, [currentAgendaIndex]);

  const activeOpenPinId = useMemo(() => {
    if (selectedLegendLocation) return null;
    if (openKeyPinpointIds["__closed__"]) return null;

    for (const pin of KEY_EVENT_PINPOINTS) {
      if (openKeyPinpointIds[pin.id]) return pin.id;
    }

    return null;
  }, [openKeyPinpointIds, selectedLegendLocation]);

  const handleSelectLegend = useCallback(
    (loc: LocationItem) => {
      setOpenKeyPinpointIds({ __closed__: true });
      setSelectedLegendLocation(loc);
      if (loc.mapX !== undefined && loc.mapY !== undefined) {
        focusOnCoordinate({ x: loc.mapX, y: loc.mapY }, 1.85);
      }
    },
    [focusOnCoordinate]
  );

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

  // Route movement animation: Only animates walking for d1-checkin-pju (PJU to Villa Alpine House)
  const startRouteAnimation = useCallback((targetAgendaId?: string) => {
    const agendaId = targetAgendaId || activeActivityId;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    // The PJU pawn is only ever rendered during these two steps (see the
    // activeActivityId check further below) — walk it smoothly for both,
    // instead of only "d1-checkin-pju". Every other agenda has no visible
    // pawn, so snapping progress to 1 there is harmless.
    const hasAnimatedPawn = agendaId === "d1-arrival" || agendaId === "d1-checkin-pju";
    if (!hasAnimatedPawn) {
      setIsAnimating(false);
      setAnimProgress(1);
      return;
    }

    setIsAnimating(true);
    setAnimProgress(0);
    setOpenPopupIds({});
    setOpenKeyPinpointIds({ __closed__: true });

    const startTime = performance.now();
    const duration = 2200;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      setAnimProgress(progress);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setAnimProgress(1);
        // Auto-start the "PJU Berjalan" video the instant the walk-in
        // animation finishes, so it always plays right after the avatar
        // arrives — never cutting the walk short from an early Space press.
        if (agendaId === "d1-checkin-pju") {
          setShowPJUWalkVideo(true);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [activeActivityId]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // 1. Zoom to location and stay at pinpoint (without opening popup)
  const focusOnAgendaPinpoint = useCallback(
    (agendaId: string) => {
      setActiveActivityId(agendaId);
      setPresentationPhase("pinpoint_focus");

      // Don't show the "PJU Berjalan" video yet — it used to pop up here
      // immediately, before the avatar had even started walking on the map.
      // It's now triggered by startRouteAnimation once the walk-in
      // animation actually finishes (see its completion branch below).
      setShowPJUWalkVideo(false);

      const pinId = getPinIdForAgenda(agendaId);
      const item = ALL_RUNDOWN_ITEMS.find((a) => a.id === agendaId) || ALL_RUNDOWN_ITEMS[0];

      const targetPinCoords =
        customPinCoords[pinId] ||
        KEY_EVENT_PINPOINTS.find((p) => p.id === pinId)?.coords;
      const waypoints =
        customRoutes[agendaId] ||
        item.defaultWaypoints ||
        [];
      const start = waypoints[0];
      const dest =
        targetPinCoords ||
        waypoints[waypoints.length - 1] ||
        item.destCoordinates;

      const zoom =
        agendaId === "d2-jalan-sehat"
          ? 2.25
          : agendaId === "d1-checkin-pju"
          ? 2.2
          : 2.1;

      const focusPoint =
        start && (agendaId === "d1-arrival" || agendaId === "d1-checkin-pju")
          ? {
              x: (start.x + (dest?.x || start.x)) / 2,
              y: (start.y + (dest?.y || start.y)) / 2,
            }
          : dest || start;

      if (focusPoint) {
        focusOnCoordinate(focusPoint, zoom);
      }

      startRouteAnimation(agendaId);
    },
    [customRoutes, customPinCoords, focusOnCoordinate, getPinIdForAgenda, startRouteAnimation, resetToOverviewMap]
  );

  // 2. Open popup for current agenda
  const openAgendaPopup = useCallback(() => {
    setPresentationPhase("popup_open");
    setShowPJUWalkVideo(false);
    const pinId = getPinIdForAgenda(activeActivityId);
    setOpenKeyPinpointIds({ [pinId]: true });
  }, [activeActivityId, getPinIdForAgenda]);

  // 3. Return to Overview Map
  const returnToOverviewMap = useCallback(() => {
    setPresentationPhase("overview");
    setOpenKeyPinpointIds({ __closed__: true });
    setOpenPopupIds({});
    setShowPJUWalkVideo(false);
    setSelectedLegendLocation(null);
    resetToOverviewMap();
  }, [resetToOverviewMap]);

  // Main Step-by-Step Spacebar Controller
  const handleSpacebarAction = useCallback(() => {
    // 1. Intro Slide ➔ Enter Main Overview Map
    if (showIntroSlide) {
      setShowIntroSlide(false);
      setPresentationPhase("overview");
      return;
    }

    // 2. Video Playing ➔ Skip/Finish Video & Open Villa Popup
    if (showPJUWalkVideo) {
      setShowPJUWalkVideo(false);
      openAgendaPopup();
      return;
    }

    // 3. Popup is Open (Alpine House, Legend, or Pinpoint Detail Card)
    // ➔ Close popup, return smoothly to Overview Map, and advance to next agenda
    if (Boolean(activeOpenPinId) || Boolean(selectedLegendLocation) || presentationPhase === "popup_open") {
      returnToOverviewMap();
      // activeVIPs recomputes its pathWaypoints the instant activeActivityId
      // changes below, but animProgress (still 1 from the step we're leaving)
      // wouldn't reset until the next startRouteAnimation call — leaving the
      // pawn flashed at the END of the new route for a frame, before later
      // snapping back to its start once the walk animation actually begins.
      // Reset progress here too so it just stays put at the route's start.
      setAnimProgress(0);
      const nextIdx = (currentAgendaIndex + 1) % ALL_RUNDOWN_ITEMS.length;
      setActiveActivityId(ALL_RUNDOWN_ITEMS[nextIdx].id);
      return;
    }

    // 4. Pinpoint Focus (Zoomed in on pin, but popup not yet opened)
    if (presentationPhase === "pinpoint_focus") {
      // Avatar still walking on the map — ignore extra presses and let it
      // finish; the video auto-starts right after (see startRouteAnimation).
      if (isAnimating) {
        return;
      }
      if (activeActivityId === "d1-checkin-pju" && !showPJUWalkVideo) {
        setShowPJUWalkVideo(true);
      } else {
        openAgendaPopup();
      }
      return;
    }

    // 5. Overview Map ➔ Focus & Zoom in on current agenda pin point
    focusOnAgendaPinpoint(activeActivityId);
  }, [
    showIntroSlide,
    showPJUWalkVideo,
    activeOpenPinId,
    selectedLegendLocation,
    presentationPhase,
    activeActivityId,
    currentAgendaIndex,
    isAnimating,
    openAgendaPopup,
    returnToOverviewMap,
    focusOnAgendaPinpoint,
  ]);

  const handleStepBackward = useCallback(() => {
    if (presentationPhase === "popup_open" || Boolean(activeOpenPinId) || Boolean(selectedLegendLocation)) {
      setPresentationPhase("pinpoint_focus");
      setOpenKeyPinpointIds({ __closed__: true });
      setSelectedLegendLocation(null);
    } else if (presentationPhase === "pinpoint_focus") {
      returnToOverviewMap();
    } else {
      const prevIdx = currentAgendaIndex > 0 ? currentAgendaIndex - 1 : ALL_RUNDOWN_ITEMS.length - 1;
      const prevItem = ALL_RUNDOWN_ITEMS[prevIdx];
      focusOnAgendaPinpoint(prevItem.id);
    }
  }, [presentationPhase, activeOpenPinId, selectedLegendLocation, currentAgendaIndex, returnToOverviewMap, focusOnAgendaPinpoint]);

  const handleNextAgenda = useCallback(() => {
    const nextIdx = (currentAgendaIndex + 1) % ALL_RUNDOWN_ITEMS.length;
    focusOnAgendaPinpoint(ALL_RUNDOWN_ITEMS[nextIdx].id);
  }, [currentAgendaIndex, focusOnAgendaPinpoint]);

  const handlePrevAgenda = useCallback(() => {
    const prevIdx = currentAgendaIndex > 0 ? currentAgendaIndex - 1 : ALL_RUNDOWN_ITEMS.length - 1;
    focusOnAgendaPinpoint(ALL_RUNDOWN_ITEMS[prevIdx].id);
  }, [currentAgendaIndex, focusOnAgendaPinpoint]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      
      // Editor / Calibrator / Search / Legend modal blocking
      if (isEditorOpen || isCalibratorOpen || isSearchModalOpen || isLocationModalOpen || showFlatMapModal) {
        if (e.key === "Escape") {
          setIsSearchModalOpen(false);
          setIsLocationModalOpen(false);
          setShowFlatMapModal(false);
        }
        return;
      }

      // SPACEBAR: Always handles presentation step progression (Intro -> Map -> Pinpoint -> Video -> Popup -> Return to Map)
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        e.stopPropagation();
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        handleSpacebarAction();
        return;
      }

      // If a popup or video is open, Arrow keys belong to photo gallery slider inside the modal
      if (Boolean(activeOpenPinId) || showPJUWalkVideo || Boolean(selectedLegendLocation)) {
        if (e.key === "Escape") {
          e.preventDefault();
          returnToOverviewMap();
        }
        return;
      }

      // Map Overview Arrow Key navigation
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        handleNextAgenda();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevAgenda();
      } else if (e.key === "Escape" || e.key === "Home") {
        e.preventDefault();
        returnToOverviewMap();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleSpacebarAction,
    handleNextAgenda,
    handlePrevAgenda,
    returnToOverviewMap,
    activeOpenPinId,
    showPJUWalkVideo,
    showFlatMapModal,
    isSearchModalOpen,
    isLocationModalOpen,
    isEditorOpen,
    isCalibratorOpen,
    selectedLegendLocation,
  ]);

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

  const handleTogglePopup = (vipId: string) => {
    setOpenPopupIds((prev) => ({
      ...prev,
      [vipId]: !prev[vipId],
    }));
  };

  const handleUpdateWaypoints = (newWaypoints: Waypoint[]) => {
    setCustomRoutes((prev) => ({
      ...prev,
      [activeActivityId]: newWaypoints,
    }));

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`famgath_route_${activeActivityId}`, JSON.stringify(newWaypoints));
      } catch (e) {
        console.error("Error auto-saving route to localStorage", e);
      }
    }
  };

  const handleDeleteNode = (index: number) => {
    if (activeWaypoints.length <= 2) {
      alert("Rute minimal harus memiliki 2 titik.");
      return;
    }
    const updated = activeWaypoints.filter((_, i) => i !== index);
    handleUpdateWaypoints(updated);
    setSelectedNodeIndex(null);
  };

  const handleNodePointerDown = (index: number, e: React.PointerEvent) => {
    if (!isEditorOpen) return;
    e.stopPropagation();
    e.preventDefault();
    setDraggedNodeIndex(index);
    setSelectedNodeIndex(index);
  };

  const handleMapPointerMove = (e: React.PointerEvent) => {
    if (draggedPinId && mapCanvasRef.current) {
      const rect = mapCanvasRef.current.getBoundingClientRect();
      const xPct = Math.max(1, Math.min(99, ((e.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(1, Math.min(99, ((e.clientY - rect.top) / rect.height) * 100));
      handleUpdatePinCoord(draggedPinId, {
        x: Number(xPct.toFixed(1)),
        y: Number(yPct.toFixed(1)),
      });
      return;
    }

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
    if (draggedPinId) setDraggedPinId(null);
    if (draggedNodeIndex !== null) setDraggedNodeIndex(null);
  };

  const handleMapCanvasClick = (e: React.MouseEvent) => {
    if (isCalibratorOpen && selectedCalibratePinId && mapCanvasRef.current) {
      const rect = mapCanvasRef.current.getBoundingClientRect();
      const xPct = Math.max(1, Math.min(99, ((e.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(1, Math.min(99, ((e.clientY - rect.top) / rect.height) * 100));
      handleUpdatePinCoord(selectedCalibratePinId, {
        x: Number(xPct.toFixed(1)),
        y: Number(yPct.toFixed(1)),
      });
      return;
    }

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

  const handleToggleFullscreen = useCallback(() => {
    setShowF11Toast(true);
    if (f11TimerRef.current) clearTimeout(f11TimerRef.current);
    f11TimerRef.current = setTimeout(() => {
      setShowF11Toast(false);
    }, 4000);

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
        if (elem?.requestFullscreen) elem.requestFullscreen();
      } else {
        if (doc?.exitFullscreen) doc.exitFullscreen();
      }
    } catch (e) {
      console.error("Toggle fullscreen error:", e);
    }
  }, []);

  const activeActivity = ROUTE_ACTIVITIES.find((a) => a.id === activeActivityId) || ROUTE_ACTIVITIES[0];

  return (
    <div className="w-full flex flex-col lg:flex-row items-stretch gap-3">
      {/* 1. SLIDE PEMBUKA (OPENING INTRO COVER SLIDE) */}
      <AnimatePresence>
        {showIntroSlide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0e1d03] via-[#091502] to-[#040a01] text-white select-none overflow-hidden cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label="Mulai Presentasi (Tekan Spasi)"
            onClick={() => setShowIntroSlide(false)}
          >
            {/* Background Decorative Panorama */}
            <div className="absolute inset-0 opacity-25 pointer-events-none">
              <Image
                src="/maps-area.png"
                alt="Highland Park Resort"
                fill
                priority
                unoptimized
                className="object-cover object-center filter blur-[2px] scale-105"
              />
            </div>

            {/* Subtle Gradient Glow */}
            <div className="absolute w-[600px] h-[600px] rounded-full bg-lime-500/10 blur-[120px] pointer-events-none" />

            {/* Slide Pembuka Content — no boxed card, text sits directly on the
                background so it can run bigger/more prominent. */}
            <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center space-y-6 px-6">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight uppercase font-fun drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
                  RUNDOWN FAMILY GATHERING PUSZIAD 2026
                </h1>
                <h2 className="text-xl sm:text-3xl font-extrabold text-lime-300 tracking-wide uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                  THE HIGHLAND RESORT BOGOR
                </h2>
                <div className="text-base sm:text-lg font-bold text-slate-300 pt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                  9 - 10 OKTOBER 2026
                </div>
              </div>

              {/* Start "button" is intentionally invisible — no text, no icon.
                  The whole slide is clickable (see onClick above) and Space
                  still works; sr-only label keeps it announced for a11y. */}
              <div className="pt-4">
                <span className="sr-only">Mulai Presentasi (Tekan Spasi)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Schedule List (Collapsible / Default Hidden) */}
      {showSidebar && (
        <ScheduleSidebar
          activeAgendaId={activeActivityId}
          isAnimating={isAnimating}
          onSelectAgenda={(id) => focusOnAgendaPinpoint(id)}
          onReplayAnimation={() => focusOnAgendaPinpoint(activeActivityId)}
          onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
          isEditorOpen={isEditorOpen}
          onHide={() => setShowSidebar(false)}
          onOpenRundownModal={onOpenRundownModal}
        />
      )}

      {/* Full Map Canvas Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full overflow-hidden rounded-3xl border-2 border-lime-400/30 shadow-2xl bg-[#0b1803] select-none h-[calc(100vh-28px)] min-h-[640px] max-h-[1100px]"
      >
        {/* TOP HUD: Simplified Manual Navigation Bar with Clear Day 1 / Day 2 Switcher */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 no-print flex items-center gap-2 select-none">
          <div className="flex items-center gap-2 p-1.5 px-3 rounded-full bg-[#081402]/95 border-2 border-lime-400/80 shadow-2xl backdrop-blur-xl">
            {/* Direct Day 1 / Day 2 Pill Switcher */}
            <div className="flex items-center bg-black/60 p-0.5 rounded-full border border-white/15">
              <button
                type="button"
                onClick={() => {
                  returnToOverviewMap();
                  setActiveActivityId(RUNDOWN_SCHEDULE_DAY_1[0].id);
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                  currentAgendaItem.day === 1
                    ? "bg-gradient-to-r from-emerald-500 to-lime-500 text-slate-950 shadow-md shadow-lime-900/40 border border-lime-300"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Beralih ke Rangkaian Hari 1 (Jumat, 9 Okt)"
              >
                <span>🌿 Hari I</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  returnToOverviewMap();
                  setActiveActivityId(RUNDOWN_SCHEDULE_DAY_2[0].id);
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                  currentAgendaItem.day === 2
                    ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-amber-900/40 border border-amber-300"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Beralih ke Rangkaian Hari 2 (Sabtu, 10 Okt)"
              >
                <span>☀️ Hari II</span>
              </button>
            </div>

            {/* Prev Step Button */}
            <button
              type="button"
              onClick={handleStepBackward}
              title="Langkah Sebelumnya (Arrow Left / PageUp)"
              className="p-1.5 rounded-full hover:bg-lime-500/20 text-slate-200 hover:text-lime-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Current Step Pill with Day & Title */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-bold text-lime-300 shrink-0">
              <span className="text-[10px] font-mono text-amber-300 uppercase">
                {currentAgendaIndex + 1}/{ALL_RUNDOWN_ITEMS.length}
              </span>
              <span className="max-w-[110px] lg:max-w-[170px] truncate text-white">{currentAgendaItem.title}</span>
            </div>

            {/* Dynamic Spacebar Action Button */}
            <button
              type="button"
              onClick={handleSpacebarAction}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-black transition-all shadow-lg border cursor-pointer min-w-0 ${
                presentationPhase === "overview"
                  ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 border-white shadow-glow-gold hover:scale-[1.02]"
                  : presentationPhase === "pinpoint_focus"
                  ? "bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-950 border-white shadow-glow-lime hover:scale-[1.02]"
                  : "bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 border-white hover:scale-[1.02]"
              }`}
              title="Tekan Tombol Spasi pada keyboard untuk lanjut"
            >
              <span className="shrink-0 px-1.5 py-0.5 rounded bg-black/80 text-amber-300 font-mono text-[10px] font-bold">
                SPASI
              </span>
              <span className="truncate max-w-[120px] sm:max-w-[220px] lg:max-w-[360px]">
                {presentationPhase === "overview"
                  ? `Next: ${currentAgendaItem.title}`
                  : presentationPhase === "pinpoint_focus"
                  ? "Buka Detail Info"
                  : "Kembali ke Peta Utama"}
              </span>
            </button>

            {/* Direct Back to Overview Map Button */}
            {presentationPhase !== "overview" && (
              <button
                type="button"
                onClick={returnToOverviewMap}
                title="Kembali ke Peta Utama (Esc / Home)"
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-lime-200 font-bold transition-colors cursor-pointer flex items-center gap-1 border border-white/10"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Peta Utama</span>
              </button>
            )}

            {/* Next Step Button */}
            <button
              type="button"
              onClick={handleNextAgenda}
              title="Agenda Berikutnya (Arrow Right / PageDown)"
              className="p-1.5 rounded-full hover:bg-lime-500/20 text-slate-200 hover:text-lime-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top-Left: Discreet Toggle Rundown Sidebar Button & Galeri Lokasi Button */}
        {!showSidebar && (
          <div className="absolute top-3 left-3 z-40 no-print flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSidebar(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#081402]/95 hover:bg-[#122807] text-lime-200 border border-lime-400/60 text-xs font-bold shadow-xl backdrop-blur-md transition-all cursor-pointer hover:scale-105"
            >
              <Calendar className="w-3.5 h-3.5 text-lime-400" />
              <span>📋 Rundown Acara</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextState = !showMasterGallery;
                setShowMasterGallery(nextState);
                setShowAllLocations(nextState);
                if (nextState) {
                  returnToOverviewMap();
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black shadow-xl backdrop-blur-md transition-all cursor-pointer hover:scale-105 border ${
                showMasterGallery || showAllLocations
                  ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 border-white shadow-glow-gold"
                  : "bg-[#081402]/95 hover:bg-[#122807] text-lime-200 border-lime-400/60"
              }`}
              title="Tampilkan Peta Penuh & Galeri 86 Fasilitas Resort"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>🗺️ Galeri Lokasi</span>
            </button>

            {/* Tombol Buat Rute Manual */}
            <button
              type="button"
              onClick={() => setIsEditorOpen(!isEditorOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black shadow-xl backdrop-blur-md transition-all cursor-pointer hover:scale-105 border ${
                isEditorOpen
                  ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 border-white shadow-glow-gold"
                  : "bg-[#081402]/95 hover:bg-[#122807] text-lime-200 border-lime-400/60"
              }`}
              title="Buka / Tutup Editor Rute Manual (Klik di peta untuk tambah titik)"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>✏️ Buat Rute Manual</span>
            </button>
          </div>
        )}

        {/* Full Interactive Path Editor Overlay (if active) */}
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
          disabled={isEditorOpen}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Floating Right Map Toolbar */}
              <div className="absolute top-3 right-3 z-40 flex flex-col gap-1.5 no-print">
                <div className="flex flex-col bg-[#081402]/95 backdrop-blur-md rounded-2xl shadow-xl border border-lime-400/40 p-1.5 gap-1">
                  {/* Search Button */}
                  <button
                    type="button"
                    onClick={() => setIsSearchModalOpen(true)}
                    title="🔍 Cari Fasilitas (Ctrl+K)"
                    className="p-2 rounded-xl text-lime-200 hover:text-white hover:bg-lime-800/40 transition-colors cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  {/* Toggle Schedule Sidebar */}
                  <button
                    type="button"
                    onClick={() => setShowSidebar(!showSidebar)}
                    title={showSidebar ? "Sembunyikan Panel Rundown" : "Buka Panel Rundown"}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      showSidebar ? "text-amber-300 bg-lime-800/60" : "text-lime-300 hover:text-white"
                    }`}
                  >
                    {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                  </button>

                  {/* Open Rundown Poster Modal */}
                  {onOpenRundownModal && (
                    <button
                      type="button"
                      onClick={onOpenRundownModal}
                      title="Buka Poster Rundown Acara"
                      className="p-2 rounded-xl text-lime-200 hover:text-white hover:bg-lime-800/40 transition-colors cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  )}

                  {/* Zoom Controls */}
                  <button
                    type="button"
                    onClick={() => zoomIn(0.4)}
                    title="Perbesar Peta (+)"
                    className="p-2 rounded-xl text-lime-200 hover:text-white hover:bg-lime-800/40 transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => zoomOut(0.4)}
                    title="Perkecil Peta (-)"
                    className="p-2 rounded-xl text-lime-200 hover:text-white hover:bg-lime-800/40 transition-colors cursor-pointer"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => returnToOverviewMap()}
                    title="Kembali ke Peta Utama"
                    className="p-2 rounded-xl text-lime-200 hover:text-white hover:bg-lime-800/40 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Toggle Master Gallery & All Locations */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !showMasterGallery;
                      setShowMasterGallery(next);
                      setShowAllLocations(next);
                      if (next) returnToOverviewMap();
                    }}
                    title={showMasterGallery ? "Tutup Galeri Lokasi" : "Buka Galeri Lokasi & Peta Lengkap"}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      showMasterGallery || showAllLocations
                        ? "text-slate-950 bg-amber-400 font-bold shadow-glow-gold"
                        : "text-slate-400 hover:text-white hover:bg-lime-800/40"
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                  </button>

                  {/* Open 2D Flat Map Modal Button */}
                  <button
                    type="button"
                    onClick={() => setShowFlatMapModal(true)}
                    title="Buka Peta Denah Asli (2D Flat) dalam Popup"
                    className="p-2 rounded-xl text-amber-300 hover:text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                  </button>

                  {/* Toggle Walking Paths */}
                  <button
                    type="button"
                    onClick={() => setShowPaths(!showPaths)}
                    title={showPaths ? "Sembunyikan Garis Rute" : "Tampilkan Garis Rute"}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      showPaths ? "text-slate-950 bg-amber-400 font-bold" : "text-slate-400 hover:text-white hover:bg-lime-800/40"
                    }`}
                  >
                    <Route className="w-4 h-4" />
                  </button>

                  {/* Toggle Manual Route Editor */}
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(!isEditorOpen)}
                    title={isEditorOpen ? "Tutup Editor Rute" : "Buka Editor Rute Manual (Edit Titik di Peta)"}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isEditorOpen
                        ? "text-slate-950 bg-amber-400 font-bold shadow-glow-gold"
                        : "text-slate-400 hover:text-white hover:bg-lime-800/40"
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Avatar Model Switcher */}
                  <button
                    type="button"
                    onClick={() => setAvatarMode(avatarMode === "squad" ? "circle" : "squad")}
                    title={
                      avatarMode === "squad"
                        ? "Model Avatar: PJU Squad (Klik untuk Ganti ke Lingkaran)"
                        : "Model Avatar: Pin Lingkaran (Klik untuk Ganti ke PJU Squad)"
                    }
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      avatarMode === "squad" ? "text-amber-300 bg-lime-800/70" : "text-lime-300 hover:text-white"
                    }`}
                  >
                    {avatarMode === "squad" ? <Users className="w-4 h-4 text-amber-300" /> : <UserCheck className="w-4 h-4 text-lime-300" />}
                  </button>

                  {/* Fullscreen */}
                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    title="Tekan F11 untuk Full Screen"
                    className="p-2 rounded-xl text-lime-200 hover:text-white hover:bg-lime-800/40 transition-colors cursor-pointer"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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
                  className={`relative w-[1500px] lg:w-[2000px] aspect-[16/9] flex items-center justify-center rounded-2xl overflow-visible ${
                    isEditorOpen ? "cursor-crosshair ring-4 ring-amber-400/50" : "cursor-grab active:cursor-grabbing"
                  }`}
                >
                  {/* Clean 3D Master Isometric Diorama Map Background (Always 3D Isometric) */}
                  <Image
                    src="/maps-area.png"
                    alt="Peta Kawasan Highland Park Resort (3D Isometric)"
                    fill
                    priority
                    unoptimized
                    sizes="100vw"
                    className="object-contain pointer-events-none drop-shadow-2xl"
                  />

                  {/* SVG Waypoint Paths */}
                  {(showPaths || isEditorOpen) && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none z-20"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      {activeVIPs.map((vip) => {
                        const points = vip.pathWaypoints.map((p) => `${p.x},${p.y}`).join(" ");
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
                                r={pIdx === 0 || pIdx === vip.pathWaypoints.length - 1 ? "0.6" : "0.38"}
                                fill={vip.color}
                                stroke="#ffffff"
                                strokeWidth="0.18"
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
                          className={`absolute z-40 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-move select-none transition-transform ${
                            isSelected ? "scale-125 z-50" : "hover:scale-115"
                          }`}
                          style={{
                            left: `${pt.x}%`,
                            top: `${pt.y}%`,
                          }}
                          title={`Titik #${idx + 1} (${pt.x.toFixed(1)}%, ${pt.y.toFixed(1)}%) - Drag untuk geser, Klik untuk pilih, Klik Kanan untuk hapus`}
                        >
                          <div
                            className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xl border-2 transition-all ${
                              isSelected
                                ? "bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400 shadow-glow-gold"
                                : isFirst
                                ? "bg-emerald-500 text-white border-white ring-2 ring-emerald-400"
                                : isLast
                                ? "bg-rose-500 text-white border-white ring-2 ring-rose-400"
                                : "bg-[#081402] text-amber-300 border-amber-400 ring-1 ring-black/40"
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
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-[10px] font-black shadow-lg border border-white cursor-pointer z-50 animate-pulse"
                                title={`Hapus Titik #${idx + 1}`}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {/* All 86 Locations (only when user manually toggles master gallery or searches) */}
                  {!isEditorOpen && (showAllLocations || showMasterGallery) && !activeOpenPinId && !selectedLegendLocation && (
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

                  {/* Selected Searched Legend Popup Card */}
                  {!isEditorOpen && selectedLegendLocation && (
                    <LegendMapPopup
                      location={selectedLegendLocation}
                      onClose={() => {
                        setSelectedLegendLocation(null);
                        setOpenKeyPinpointIds({});
                      }}
                      onFocusOnMap={(loc) => {
                        if (loc.mapX !== undefined && loc.mapY !== undefined) {
                          focusOnCoordinate({ x: loc.mapX, y: loc.mapY }, 1.85);
                        }
                      }}
                      onSelectNextLocation={handleSelectLegend}
                    />
                  )}

                  {/* Key Event Pin Points & Popups */}
                  {!isEditorOpen &&
                    !isCalibratorOpen &&
                    !showAllLocations &&
                    !showMasterGallery &&
                    !selectedLegendLocation &&
                    KEY_EVENT_PINPOINTS.map((pin) => {
                      const pinActualCoords = customPinCoords[pin.id] || pin.coords;
                      const isDestinationOfCurrentAgenda = pin.id === getPinIdForAgenda(activeActivityId);
                      const isOpen = activeOpenPinId ? pin.id === activeOpenPinId : false;

                      return (
                        <ArrivalPopupCard
                          key={`keypin-${pin.id}`}
                          keyPinpoint={{ ...pin, coords: pinActualCoords }}
                          agendaItem={isDestinationOfCurrentAgenda ? currentAgendaItem : undefined}
                          isOpen={isOpen}
                          onClose={() => setOpenKeyPinpointIds({ __closed__: true })}
                          onOpen={() => {
                            setSelectedLegendLocation(null);
                            setOpenKeyPinpointIds({ [pin.id]: true });
                            setPresentationPhase("popup_open");
                            focusOnCoordinate(pinActualCoords, 1.85);
                          }}
                          onFocusPinPoint={() => focusOnCoordinate(pinActualCoords, 1.85)}
                        />
                      );
                    })}

                  {/* Animated Pawns: Hanya tampil saat Kedatangan di Helipad dan Berjalan ke Villa Alpine House */}
                  {!isEditorOpen &&
                    (activeActivityId === "d1-arrival" || activeActivityId === "d1-checkin-pju") &&
                    activeVIPs.map((vip, idx) => (
                      <Pawn
                        key={vip.id}
                        vip={vip}
                        progress={animProgress}
                        isWalking={isAnimating}
                        isArrived={animProgress >= 1}
                        offsetIndex={idx}
                        avatarMode={avatarMode}
                        isPopupOpen={!!openPopupIds[vip.id]}
                        onTogglePopup={handleTogglePopup}
                      />
                    ))}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>

        {/* Location Gallery Drawer (Master Interactive Gallery for all 86 points) */}
        <LocationGalleryDrawer
          locations={LOCATIONS}
          isOpen={showMasterGallery}
          selectedLocation={selectedLocation}
          onClose={() => {
            setShowMasterGallery(false);
            setShowAllLocations(false);
          }}
          onSelectLocation={handleSelectLocation}
          onFocusOnMap={(loc) => {
            if (loc.mapX !== undefined && loc.mapY !== undefined) {
              focusOnCoordinate({ x: loc.mapX, y: loc.mapY }, 1.85);
            }
          }}
          onOpenFlatMapModal={() => setShowFlatMapModal(true)}
        />
      </div>

      {/* 2D Flat Denah Map Popup Modal */}
      <AnimatePresence>
        {showFlatMapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[125] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl select-none"
            onClick={() => setShowFlatMapModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl bg-[#081402] border-2 border-lime-400/80 ring-4 ring-lime-400/20 flex flex-col text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Header */}
              <div className="px-5 py-3.5 bg-[#0f2305] border-b border-lime-500/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 font-fun uppercase tracking-wider shadow-sm border border-amber-300">
                    🗺️ PETA DENAH ASLI (2D)
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white">
                      The Highland Park Resort - Hotel Bogor
                    </h3>
                    <p className="text-[11px] text-lime-300 hidden sm:block">
                      Gunakan scroll mouse atau pinch untuk perbesar (zoom) & geser peta
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFlatMapModal(false)}
                  title="Tutup Peta Denah (Esc)"
                  className="p-2 rounded-full bg-black/60 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/20 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Zoomable / Pannable 2D Map Container */}
              <div className="relative flex-1 w-full bg-black overflow-hidden flex items-center justify-center">
                <TransformWrapper
                  initialScale={1.0}
                  minScale={0.6}
                  maxScale={6}
                  centerOnInit={true}
                  wheel={{ step: 0.15 }}
                  pinch={{ step: 5 }}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      {/* Floating Zoom Controls inside modal */}
                      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/80 backdrop-blur-md border border-lime-400/40 shadow-xl">
                        <button
                          type="button"
                          onClick={() => zoomIn(0.4)}
                          title="Perbesar Peta (+)"
                          className="p-1.5 rounded-xl text-lime-200 hover:text-white hover:bg-lime-800/40 transition-colors"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => zoomOut(0.4)}
                          title="Perkecil Peta (-)"
                          className="p-1.5 rounded-xl text-lime-200 hover:text-white hover:bg-lime-800/40 transition-colors"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => resetTransform()}
                          title="Reset Tampilan"
                          className="p-1.5 rounded-xl text-lime-200 hover:text-white hover:bg-lime-800/40 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>

                      <TransformComponent
                        wrapperStyle={{ width: "100%", height: "100%" }}
                        contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <div className="relative w-[1500px] lg:w-[2000px] aspect-[16/9] flex items-center justify-center cursor-grab active:cursor-grabbing">
                          <Image
                            src="/map_only_clean.jpg"
                            alt="Peta Denah Asli 2D"
                            fill
                            unoptimized
                            sizes="100vw"
                            className="object-contain"
                          />
                        </div>
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Modal */}
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

      {/* PJU Walking Video Modal (Plays Before Alpine House Villa Popup) */}
      <AnimatePresence>
        {showPJUWalkVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl select-none"
            onClick={() => {
              setShowPJUWalkVideo(false);
              openAgendaPopup();
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl bg-[#081402] border-2 border-lime-400/80 ring-4 ring-lime-400/20 shadow-[0_0_80px_rgba(163,230,53,0.3)] flex flex-col text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Header */}
              <div className="px-5 py-3.5 bg-[#0f2305] border-b border-lime-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-fun uppercase tracking-wider shadow-sm border border-amber-300">
                    🎬 PJU BERJALAN
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white">
                      Mayjen TNI Budi Hariswanto & Rombongan PJU
                    </h3>
                    <p className="text-[11px] text-lime-300">
                      Menuju Villa Alpine House (Kamar Utama PJU)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowPJUWalkVideo(false);
                    openAgendaPopup();
                  }}
                  title="Lewati Video (Esc)"
                  className="p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/20 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video Container (16:9 Aspect Ratio) */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                <video
                  src="/videos/pju_berjalan.mp4"
                  autoPlay
                  controls
                  playsInline
                  onEnded={() => {
                    setShowPJUWalkVideo(false);
                    openAgendaPopup();
                  }}
                  className="w-full h-full object-contain bg-black"
                />
              </div>

              {/* Footer Action Bar */}
              <div className="px-5 py-3.5 bg-[#0a1703] border-t border-lime-500/30 flex items-center justify-end gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPJUWalkVideo(false);
                      openAgendaPopup();
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-glow-gold transition-all cursor-pointer hover:scale-105 border border-white"
                  >
                    <span className="px-1.5 py-0.5 rounded bg-black/80 text-amber-300 font-mono text-[10px] font-bold">
                      SPASI
                    </span>
                    <span>Lanjut ke Info Villa Alpine House</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* F11 Toast Notification */}
      <AnimatePresence>
        {showF11Toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] px-4 py-2.5 rounded-2xl bg-[#081402]/95 backdrop-blur-2xl border border-lime-400 text-white shadow-2xl flex items-center gap-3 select-none"
          >
            <div className="px-2.5 py-1 rounded-lg bg-lime-400 text-slate-950 font-mono font-black text-xs">
              F11
            </div>
            <span className="text-xs font-bold text-white">
              Tekan <span className="text-amber-300 font-black">F11</span> untuk Layar Penuh (Full Screen)
            </span>
            <button
              type="button"
              onClick={() => setShowF11Toast(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <LegendSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectLocation={handleSelectLegend}
      />

      {/* Pin Point Calibrator */}
      <PinPointCalibrator
        isCalibrating={isCalibratorOpen}
        onToggleCalibrating={() => setIsCalibratorOpen(!isCalibratorOpen)}
        pinpoints={KEY_EVENT_PINPOINTS}
        customPinCoords={customPinCoords}
        selectedPinId={selectedCalibratePinId}
        onSelectPin={(id) => {
          setSelectedCalibratePinId(id);
          const coords = customPinCoords[id] || KEY_EVENT_PINPOINTS.find((p) => p.id === id)?.coords;
          if (coords) focusOnCoordinate(coords, 1.85);
        }}
        onUpdatePinCoord={handleUpdatePinCoord}
        onSavePermanent={handleSavePinCoords}
        onResetDefaults={handleResetPinCoords}
      />
    </div>
  );
};
