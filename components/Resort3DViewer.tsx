"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { LocationItem } from "@/data/locations";
import Image from "next/image";
import {
  Sun,
  Sunset,
  Moon,
  Compass,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Camera,
  Play,
  Pause,
  ChevronRight,
  Info,
  Layers,
} from "lucide-react";

interface Resort3DViewerProps {
  locations: LocationItem[];
  selectedLocation: LocationItem | null;
  onSelectLocation: (location: LocationItem) => void;
  focusedLocation: LocationItem | null;
}

type TimeOfDay = "day" | "sunset" | "night";

export const Resort3DViewer: React.FC<Resort3DViewerProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  focusedLocation,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const buildingsGroupRef = useRef<THREE.Group | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const waterMeshesRef = useRef<THREE.Mesh[]>([]);

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPins, setShowPins] = useState(true);
  const [hoveredLoc, setHoveredLoc] = useState<LocationItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Map world size: 8858 x 2669 clean map ratio (3.3188)
  const MAP_W = 140;
  const MAP_H = 140 / (8858 / 2669); // ~42.18

  // Convert (mapX%, mapY%) to 3D world (X, Z)
  const mapToWorld = useCallback((xPct: number, yPct: number) => {
    const x = (xPct / 100 - 0.5) * MAP_W;
    const z = (yPct / 100 - 0.5) * MAP_H;
    return { x, z };
  }, [MAP_W, MAP_H]);

  // Handle Fullscreen
  const handleToggleFullscreen = () => {
    if (!mountRef.current) return;
    if (!document.fullscreenElement) {
      mountRef.current.requestFullscreen().catch(() => {});
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

  // Update Lighting based on time of day
  useEffect(() => {
    if (!sceneRef.current || !lightsGroupRef.current) return;

    const lg = lightsGroupRef.current;
    lg.clear();

    const ambientLight = new THREE.AmbientLight();
    const dirLight = new THREE.DirectionalLight();
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 250;
    dirLight.shadow.camera.left = -70;
    dirLight.shadow.camera.right = 70;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.bias = -0.0005;

    const hemiLight = new THREE.HemisphereLight();

    if (timeOfDay === "day") {
      sceneRef.current.background = new THREE.Color(0x8bc34a).lerp(new THREE.Color(0x87ceeb), 0.7);
      if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color.setHex(0xb2ebf2);

      ambientLight.color.setHex(0xffffff);
      ambientLight.intensity = 0.85;

      dirLight.color.setHex(0xfffaed);
      dirLight.intensity = 1.6;
      dirLight.position.set(45, 75, 40);

      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0x2e7d32);
      hemiLight.intensity = 0.5;
    } else if (timeOfDay === "sunset") {
      sceneRef.current.background = new THREE.Color(0x2c1320).lerp(new THREE.Color(0xf57c00), 0.4);
      if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color.setHex(0xd87040);

      ambientLight.color.setHex(0xffa726);
      ambientLight.intensity = 0.65;

      dirLight.color.setHex(0xff7043);
      dirLight.intensity = 1.9;
      dirLight.position.set(-60, 30, 20);

      hemiLight.color.setHex(0xffb74d);
      hemiLight.groundColor.setHex(0x3e2723);
      hemiLight.intensity = 0.4;
    } else {
      // Night Mode
      sceneRef.current.background = new THREE.Color(0x050c08);
      if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color.setHex(0x06140d);

      ambientLight.color.setHex(0x1a3325);
      ambientLight.intensity = 0.45;

      dirLight.color.setHex(0x80cbc4);
      dirLight.intensity = 0.4;
      dirLight.position.set(20, 60, -20);

      hemiLight.color.setHex(0x26a69a);
      hemiLight.groundColor.setHex(0x004d40);
      hemiLight.intensity = 0.2;

      // Add warm point lights around key resort plazas at night
      const warmPlazas = [
        { x: -30, z: 20 },
        { x: 0, z: 0 },
        { x: 25, z: -10 },
        { x: 40, z: -15 },
      ];
      warmPlazas.forEach((p) => {
        const pl = new THREE.PointLight(0xffb300, 2.5, 30, 1.2);
        pl.position.set(p.x, 3, p.z);
        lg.add(pl);
      });
    }

    lg.add(ambientLight);
    lg.add(dirLight);
    lg.add(hemiLight);
  }, [timeOfDay]);

  // Smooth camera fly-to when focusedLocation changes
  useEffect(() => {
    if (!focusedLocation || focusedLocation.mapX === undefined || focusedLocation.mapY === undefined) {
      return;
    }
    if (!cameraRef.current || !controlsRef.current) return;

    const { x, z } = mapToWorld(focusedLocation.mapX, focusedLocation.mapY);
    const targetLookAt = new THREE.Vector3(x, 1, z);
    const targetCamPos = new THREE.Vector3(x + 12, 16, z + 16);

    const startPos = cameraRef.current.position.clone();
    const startTarget = controlsRef.current.target.clone();

    let progress = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animateFlyTo = (now: number) => {
      const elapsed = now - startTime;
      progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      cameraRef.current?.position.lerpVectors(startPos, targetCamPos, ease);
      controlsRef.current?.target.lerpVectors(startTarget, targetLookAt, ease);
      controlsRef.current?.update();

      if (progress < 1) {
        requestAnimationFrame(animateFlyTo);
      }
    };

    requestAnimationFrame(animateFlyTo);
  }, [focusedLocation, mapToWorld]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0xb2ebf2, 0.0035);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.5,
      1000
    );
    // Initial isometric view angle (Google Earth 3D perspective)
    camera.position.set(0, 55, 65);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
    controls.minDistance = 10;
    controls.maxDistance = 140;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Groups
    const lightsGroup = new THREE.Group();
    lightsGroupRef.current = lightsGroup;
    scene.add(lightsGroup);

    const buildingsGroup = new THREE.Group();
    buildingsGroupRef.current = buildingsGroup;
    scene.add(buildingsGroup);

    const pinsGroup = new THREE.Group();
    pinsGroupRef.current = pinsGroup;
    scene.add(pinsGroup);

    // 1. TERRAIN / GROUND PLANE WITH CLEAN MAP TEXTURE
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      "/map_clean_3d.jpg",
      (mapTexture) => {
        mapTexture.colorSpace = THREE.SRGBColorSpace;
        mapTexture.minFilter = THREE.LinearMipmapLinearFilter;
        mapTexture.magFilter = THREE.LinearFilter;
        mapTexture.generateMipmaps = true;

        const groundGeo = new THREE.PlaneGeometry(MAP_W, MAP_H, 64, 64);
        const groundMat = new THREE.MeshStandardMaterial({
          map: mapTexture,
          roughness: 0.5,
          metalness: 0.05,
        });

        const groundMesh = new THREE.Mesh(groundGeo, groundMat);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;
        scene.add(groundMesh);

        // 3D Architectural Foundation Base (Extruded Ground Slab)
        const slabGeo = new THREE.BoxGeometry(MAP_W + 4, 3, MAP_H + 4);
        const slabMat = new THREE.MeshStandardMaterial({
          color: 0x1d3c30,
          roughness: 0.9,
          metalness: 0.2,
        });
        const slabMesh = new THREE.Mesh(slabGeo, slabMat);
        slabMesh.position.y = -1.55;
        slabMesh.receiveShadow = true;
        scene.add(slabMesh);

        // Gold trim edge around slab
        const borderGeo = new THREE.BoxGeometry(MAP_W + 4.4, 0.4, MAP_H + 4.4);
        const borderMat = new THREE.MeshStandardMaterial({
          color: 0xd4a949,
          metalness: 0.8,
          roughness: 0.3,
        });
        const borderMesh = new THREE.Mesh(borderGeo, borderMat);
        borderMesh.position.y = -0.1;
        scene.add(borderMesh);
      },
      undefined,
      (err) => console.error("Error loading map texture in 3D:", err)
    );

    // 2. PROCEDURAL 3D BUILDINGS & STRUCTURES (Google Earth style)
    const buildingMaterials = {
      mongolianTent: new THREE.MeshStandardMaterial({
        color: 0xfaf9f6,
        roughness: 0.6,
        metalness: 0.1,
      }),
      mongolianRoof: new THREE.MeshStandardMaterial({
        color: 0xc5932e,
        roughness: 0.4,
        metalness: 0.2,
      }),
      apacheTipi: new THREE.MeshStandardMaterial({
        color: 0xdfcbb5,
        roughness: 0.7,
      }),
      woodTimber: new THREE.MeshStandardMaterial({
        color: 0x5d4037,
        roughness: 0.7,
      }),
      woodRoof: new THREE.MeshStandardMaterial({
        color: 0x8d6e63,
        roughness: 0.5,
      }),
      modernBallroom: new THREE.MeshStandardMaterial({
        color: 0x37474f,
        roughness: 0.3,
        metalness: 0.4,
      }),
      modernGlass: new THREE.MeshPhysicalMaterial({
        color: 0x80deea,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85,
        reflectivity: 0.9,
      }),
      goldAccent: new THREE.MeshStandardMaterial({
        color: 0xd4a949,
        metalness: 0.7,
        roughness: 0.3,
      }),
      water: new THREE.MeshPhysicalMaterial({
        color: 0x00bcd4,
        roughness: 0.05,
        metalness: 0.2,
        transparent: true,
        opacity: 0.88,
        transmission: 0.6,
        ior: 1.33,
      }),
      pineFoliage: new THREE.MeshStandardMaterial({
        color: 0x1b5e20,
        roughness: 0.8,
      }),
      pineTrunk: new THREE.MeshStandardMaterial({
        color: 0x3e2723,
        roughness: 0.9,
      }),
    };

    // Helper: Create 3D Mongolian Camp (Yurt)
    const createMongolianCamp = (x: number, z: number, scale = 1, locData: LocationItem) => {
      const campGroup = new THREE.Group();
      campGroup.position.set(x, 0, z);

      // White cylinder body
      const bodyGeo = new THREE.CylinderGeometry(1.6 * scale, 1.6 * scale, 1.2 * scale, 16);
      const bodyMesh = new THREE.Mesh(bodyGeo, buildingMaterials.mongolianTent);
      bodyMesh.position.y = (0.6 * scale);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      campGroup.add(bodyMesh);

      // Gold conical dome roof
      const roofGeo = new THREE.ConeGeometry(1.9 * scale, 1.0 * scale, 16);
      const roofMesh = new THREE.Mesh(roofGeo, buildingMaterials.mongolianRoof);
      roofMesh.position.y = 1.7 * scale;
      roofMesh.castShadow = true;
      campGroup.add(roofMesh);

      // Apex crown
      const crownGeo = new THREE.CylinderGeometry(0.3 * scale, 0.4 * scale, 0.2 * scale, 12);
      const crownMesh = new THREE.Mesh(crownGeo, buildingMaterials.goldAccent);
      crownMesh.position.y = 2.25 * scale;
      campGroup.add(crownMesh);

      // Doorway
      const doorGeo = new THREE.BoxGeometry(0.5 * scale, 0.8 * scale, 0.2 * scale);
      const doorMesh = new THREE.Mesh(doorGeo, buildingMaterials.woodTimber);
      doorMesh.position.set(0, 0.4 * scale, 1.55 * scale);
      campGroup.add(doorMesh);

      campGroup.userData = { location: locData };
      return campGroup;
    };

    // Helper: Create 3D Apache Tipi
    const createApacheTipi = (x: number, z: number, scale = 1, locData: LocationItem) => {
      const tipiGroup = new THREE.Group();
      tipiGroup.position.set(x, 0, z);

      const coneGeo = new THREE.ConeGeometry(1.5 * scale, 3.2 * scale, 10);
      const coneMesh = new THREE.Mesh(coneGeo, buildingMaterials.apacheTipi);
      coneMesh.position.y = 1.6 * scale;
      coneMesh.castShadow = true;
      tipiGroup.add(coneMesh);

      // Wooden top poles
      const poleGeo = new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, 4.0 * scale, 6);
      const p1 = new THREE.Mesh(poleGeo, buildingMaterials.woodTimber);
      p1.position.y = 2.0 * scale;
      p1.rotation.z = 0.15;
      tipiGroup.add(p1);

      const p2 = new THREE.Mesh(poleGeo, buildingMaterials.woodTimber);
      p2.position.y = 2.0 * scale;
      p2.rotation.x = -0.15;
      tipiGroup.add(p2);

      tipiGroup.userData = { location: locData };
      return tipiGroup;
    };

    // Helper: Create 3D Ballroom / Large Hall
    const createModernBuilding = (
      x: number,
      z: number,
      w: number,
      h: number,
      d: number,
      locData: LocationItem
    ) => {
      const bg = new THREE.Group();
      bg.position.set(x, 0, z);

      // Main Block
      const mainGeo = new THREE.BoxGeometry(w, h, d);
      const mainMesh = new THREE.Mesh(mainGeo, buildingMaterials.modernBallroom);
      mainMesh.position.y = h / 2;
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
      bg.add(mainMesh);

      // Glass Windows Strip
      const glassGeo = new THREE.BoxGeometry(w + 0.1, h * 0.45, d * 0.9);
      const glassMesh = new THREE.Mesh(glassGeo, buildingMaterials.modernGlass);
      glassMesh.position.y = h * 0.55;
      bg.add(glassMesh);

      // Cantilever Modern Roof
      const roofGeo = new THREE.BoxGeometry(w + 0.8, 0.4, d + 0.8);
      const roofMesh = new THREE.Mesh(roofGeo, buildingMaterials.goldAccent);
      roofMesh.position.y = h + 0.2;
      roofMesh.castShadow = true;
      bg.add(roofMesh);

      bg.userData = { location: locData };
      return bg;
    };

    // Helper: Create 3D Wooden / Sundanese Villa
    const createWoodenVilla = (
      x: number,
      z: number,
      scale = 1,
      locData: LocationItem
    ) => {
      const vg = new THREE.Group();
      vg.position.set(x, 0, z);

      // Timber Body
      const bodyGeo = new THREE.BoxGeometry(2.8 * scale, 1.6 * scale, 2.2 * scale);
      const bodyMesh = new THREE.Mesh(bodyGeo, buildingMaterials.woodTimber);
      bodyMesh.position.y = 0.8 * scale;
      bodyMesh.castShadow = true;
      vg.add(bodyMesh);

      // Traditional Pitched Triangular Roof
      const roofGeo = new THREE.ConeGeometry(2.4 * scale, 1.4 * scale, 4);
      const roofMesh = new THREE.Mesh(roofGeo, buildingMaterials.woodRoof);
      roofMesh.position.y = 2.2 * scale;
      roofMesh.rotation.y = Math.PI / 4;
      roofMesh.castShadow = true;
      vg.add(roofMesh);

      vg.userData = { location: locData };
      return vg;
    };

    // Helper: Create 3D Water Lake / Pool
    const createWaterArea = (x: number, z: number, radius: number, locData: LocationItem) => {
      const wg = new THREE.Group();
      wg.position.set(x, 0.05, z);

      const waterGeo = new THREE.CylinderGeometry(radius, radius, 0.1, 24);
      const waterMesh = new THREE.Mesh(waterGeo, buildingMaterials.water);
      waterMesh.receiveShadow = true;
      wg.add(waterMesh);
      waterMeshesRef.current.push(waterMesh);

      // Pool rim
      const rimGeo = new THREE.RingGeometry(radius, radius + 0.4, 24);
      const rimMesh = new THREE.Mesh(rimGeo, buildingMaterials.woodTimber);
      rimMesh.rotation.x = -Math.PI / 2;
      rimMesh.position.y = 0.06;
      wg.add(rimMesh);

      wg.userData = { location: locData };
      return wg;
    };

    // Helper: Create 3D Pine Tree
    const createPineTree = (x: number, z: number, scale = 1) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 0.8 * scale, 6);
      const trunkMesh = new THREE.Mesh(trunkGeo, buildingMaterials.pineTrunk);
      trunkMesh.position.y = 0.4 * scale;
      trunkMesh.castShadow = true;
      tree.add(trunkMesh);

      // Foliage tiers
      const tiers = [
        { r: 1.1 * scale, h: 1.2 * scale, y: 1.1 * scale },
        { r: 0.85 * scale, h: 1.0 * scale, y: 1.8 * scale },
        { r: 0.55 * scale, h: 0.8 * scale, y: 2.4 * scale },
      ];

      tiers.forEach((t) => {
        const cGeo = new THREE.ConeGeometry(t.r, t.h, 7);
        const cMesh = new THREE.Mesh(cGeo, buildingMaterials.pineFoliage);
        cMesh.position.y = t.y;
        cMesh.castShadow = true;
        tree.add(cMesh);
      });

      return tree;
    };

    // Helper: Create 3D Floating Pin Sprite
    const createPinSprite = (loc: LocationItem, x: number, z: number) => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const label = `${loc.number}${loc.suffix || ""}`;

      // Draw Gold Ring Badge
      ctx.beginPath();
      ctx.arc(64, 64, 52, 0, Math.PI * 2);
      ctx.fillStyle = "#1d3c30";
      ctx.fill();
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#d4a949";
      ctx.stroke();

      // Number Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 64, 66);

      const pinTex = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: pinTex,
        depthTest: false,
        transparent: true,
      });

      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(3.2, 3.2, 1);
      sprite.position.set(x, 4.8, z);
      sprite.userData = { location: loc };

      // 3D Glowing Vertical Stem connecting pin to ground
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.0, 6);
      const stemMat = new THREE.MeshStandardMaterial({
        color: 0xd4a949,
        emissive: 0xd4a949,
        emissiveIntensity: 0.5,
      });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.set(x, 2.0, z);

      const pinGroup = new THREE.Group();
      pinGroup.add(sprite);
      pinGroup.add(stemMesh);
      pinGroup.userData = { location: loc };

      return pinGroup;
    };

    // Iterate through all 86 locations and spawn realistic 3D building models!
    locations.forEach((loc) => {
      if (loc.mapX === undefined || loc.mapY === undefined) return;

      const { x, z } = mapToWorld(loc.mapX, loc.mapY);
      const lower = loc.name.toLowerCase();
      const num = parseInt(loc.number, 10);

      let bMesh: THREE.Group | null = null;

      if (lower.includes("mongolian") || lower.includes("superior camp") || lower.includes("deluxe camp") || lower.includes("suite camp") || lower.includes("standard camp")) {
        bMesh = createMongolianCamp(x, z, 1.1, loc);
      } else if (lower.includes("apache") || lower.includes("tipi") || (num >= 72 && num <= 75)) {
        bMesh = createApacheTipi(x, z, 1.1, loc);
      } else if (lower.includes("ballroom") || lower.includes("lobby") || lower.includes("resto") || lower.includes("meeting")) {
        bMesh = createModernBuilding(x, z, 4.8, 2.5, 3.8, loc);
      } else if (lower.includes("sundanese") || lower.includes("wooden") || lower.includes("alpine") || lower.includes("jerami") || lower.includes("dorm") || lower.includes("barrack") || lower.includes("villa")) {
        bMesh = createWoodenVilla(x, z, 1.1, loc);
      } else if (lower.includes("pool") || lower.includes("danau") || lower.includes("waterboom")) {
        bMesh = createWaterArea(x, z, 3.2, loc);
      } else {
        // Default architectural pavilion
        bMesh = createWoodenVilla(x, z, 0.9, loc);
      }

      if (bMesh) {
        buildingsGroup.add(bMesh);
      }

      // Add 3D Pin badge
      const pin = createPinSprite(loc, x, z);
      if (pin) {
        pinsGroup.add(pin);
      }
    });

    // Populate ambient 3D pine trees along roads and hills
    const treeScatter = [
      { x: -50, z: 22 }, { x: -45, z: 26 }, { x: -40, z: 18 },
      { x: -28, z: 12 }, { x: -22, z: 28 }, { x: -15, z: -15 },
      { x: -8, z: 14 }, { x: 5, z: 22 }, { x: 12, z: -20 },
      { x: 18, z: 15 }, { x: 28, z: 20 }, { x: 35, z: -22 },
      { x: 42, z: 18 }, { x: 48, z: -12 }, { x: 52, z: 2 },
    ];

    treeScatter.forEach((t) => {
      const tree = createPineTree(t.x, t.z, 0.8 + Math.random() * 0.5);
      scene.add(tree);
    });

    // Raycasting for Mouse Hover and Clicks on 3D Buildings/Pins
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let hoveredMesh: THREE.Mesh | null = null;
    let prevEmissive: THREE.Color | null = null;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Test intersections with pins and buildings
      const targets: THREE.Object3D[] = [];
      pinsGroup.traverse((c) => {
        if (c instanceof THREE.Sprite || c instanceof THREE.Mesh) targets.push(c);
      });
      buildingsGroup.traverse((c) => {
        if (c instanceof THREE.Mesh) targets.push(c);
      });

      const hits = raycaster.intersectObjects(targets, false);

      if (hits.length > 0) {
        let rootObj = hits[0].object;
        while (rootObj.parent && rootObj.parent !== scene && !rootObj.userData?.location) {
          rootObj = rootObj.parent;
        }

        const loc = rootObj.userData?.location as LocationItem | undefined;
        if (loc) {
          setHoveredLoc(loc);
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          container.style.cursor = "pointer";
          return;
        }
      }

      setHoveredLoc(null);
      setTooltipPos(null);
      container.style.cursor = "grab";
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const targets: THREE.Object3D[] = [];
      pinsGroup.traverse((c) => {
        if (c instanceof THREE.Sprite || c instanceof THREE.Mesh) targets.push(c);
      });
      buildingsGroup.traverse((c) => {
        if (c instanceof THREE.Mesh) targets.push(c);
      });

      const hits = raycaster.intersectObjects(targets, false);

      if (hits.length > 0) {
        let rootObj = hits[0].object;
        while (rootObj.parent && rootObj.parent !== scene && !rootObj.userData?.location) {
          rootObj = rootObj.parent;
        }

        const loc = rootObj.userData?.location as LocationItem | undefined;
        if (loc) {
          onSelectLocation(loc);
        }
      }
    };

    container.addEventListener("mousemove", onPointerMove);
    container.addEventListener("click", onClick);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Subtle water shimmer
      waterMeshesRef.current.forEach((wm, idx) => {
        wm.position.y = 0.05 + Math.sin(time * 2 + idx) * 0.02;
      });

      // Float pins subtly
      pinsGroup.children.forEach((pg, i) => {
        pg.position.y = Math.sin(time * 2.5 + i * 0.5) * 0.15;
      });

      // Auto rotation tour
      if (controls.autoRotate) {
        controls.update();
      } else {
        controls.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("click", onClick);
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [locations, mapToWorld, onSelectLocation]);

  // Update auto-rotate in controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
      controlsRef.current.autoRotateSpeed = 0.8;
    }
  }, [isAutoRotating]);

  // Sync showPins with pinsGroup visibility
  useEffect(() => {
    if (pinsGroupRef.current) {
      pinsGroupRef.current.visible = showPins;
    }
  }, [showPins]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full overflow-hidden rounded-3xl border border-gold-500/40 shadow-2xl bg-resort-950 select-none ${
        isFullscreen ? "h-screen rounded-none border-none" : "h-[68vh] sm:h-[78vh] min-h-[520px] max-h-[880px]"
      }`}
    >
      {/* Top 3D Control Toolbar */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 no-print">
        {/* Show / Hide Pin Numbers Toggle Button */}
        <div className="flex items-center bg-resort-950/90 dark:bg-resort-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-gold-500/40 p-1">
          <button
            type="button"
            onClick={() => setShowPins(!showPins)}
            title={showPins ? "Sembunyikan Pin Angka" : "Tampilkan Pin Angka"}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              showPins
                ? "bg-gold-500 text-resort-950 shadow-md ring-1 ring-gold-400"
                : "bg-zinc-800/80 text-zinc-300 hover:text-white"
            }`}
          >
            <span>{showPins ? "Pin Aktif" : "Pin Tersembunyi"}</span>
          </button>
        </div>

        {/* Time of Day Atmosphere Switcher (Day / Sunset / Night) */}
        <div className="flex items-center bg-resort-950/90 dark:bg-resort-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-gold-500/40 p-1 gap-1">
          <button
            type="button"
            onClick={() => setTimeOfDay("day")}
            title="Waktu Siang Cerah"
            className={`p-2 rounded-xl transition-all ${
              timeOfDay === "day"
                ? "bg-amber-400 text-resort-950 font-bold shadow-md"
                : "text-zinc-400 hover:text-gold-300"
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTimeOfDay("sunset")}
            title="Waktu Senja / Sunset"
            className={`p-2 rounded-xl transition-all ${
              timeOfDay === "sunset"
                ? "bg-orange-500 text-white font-bold shadow-md"
                : "text-zinc-400 hover:text-gold-300"
            }`}
          >
            <Sunset className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTimeOfDay("night")}
            title="Waktu Malam Lampu Resort"
            className={`p-2 rounded-xl transition-all ${
              timeOfDay === "night"
                ? "bg-indigo-600 text-yellow-300 font-bold shadow-md"
                : "text-zinc-400 hover:text-gold-300"
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Navigation Controls */}
        <div className="flex flex-col bg-resort-950/90 dark:bg-resort-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-gold-500/40 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title={isAutoRotating ? "Hentikan Tur Otomatis 360°" : "Mulai Tur Otomatis 360°"}
            className={`p-2.5 rounded-xl transition-colors ${
              isAutoRotating
                ? "bg-gold-500 text-resort-950 font-bold"
                : "text-zinc-300 hover:text-gold-400 hover:bg-gold-500/10"
            }`}
          >
            {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              if (controlsRef.current && cameraRef.current) {
                cameraRef.current.position.set(0, 55, 65);
                controlsRef.current.target.set(0, 0, 0);
                controlsRef.current.update();
              }
            }}
            title="Reset Sudut Pandang Kamera"
            className="p-2.5 rounded-xl text-zinc-300 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            className="p-2.5 rounded-xl text-zinc-300 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* 3D Google Earth Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-resort-950/90 text-gold-300 text-xs font-semibold border border-gold-500/40 shadow-md backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>3D Google Earth Mode</span>
        </div>
      </div>

      {/* Floating 3D Hover Tooltip */}
      {hoveredLoc && tooltipPos && (
        <div
          className="absolute z-50 pointer-events-none w-52 p-2.5 rounded-2xl bg-resort-950/95 text-white border border-gold-400 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${Math.min(tooltipPos.x + 15, (mountRef.current?.clientWidth || 800) - 225)}px`,
            top: `${Math.max(tooltipPos.y - 120, 15)}px`,
          }}
        >
          <div className="relative w-full h-24 rounded-xl overflow-hidden bg-resort-900/80 mb-2 border border-gold-500/30">
            <Image
              src={hoveredLoc.image}
              alt={hoveredLoc.name}
              fill
              sizes="200px"
              className="object-contain p-1"
            />
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-gold-500 text-resort-950 text-[10px] font-bold font-mono">
              #{hoveredLoc.number}{hoveredLoc.suffix || ""}
            </div>
          </div>
          <span className="block text-[9px] uppercase font-bold tracking-wider text-gold-400 truncate">
            {hoveredLoc.category}
          </span>
          <h4 className="text-xs font-bold text-white line-clamp-1">
            {hoveredLoc.name}
          </h4>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-gold-300 border-t border-gold-500/20 pt-1">
            <span>Klik untuk detail 3D</span>
            <ChevronRight className="w-3 h-3 text-gold-400" />
          </div>
        </div>
      )}

      {/* Navigation hints at bottom left */}
      <div className="absolute bottom-4 left-4 z-30 pointer-events-none no-print">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-resort-950/90 text-zinc-300 text-xs border border-gold-500/30 backdrop-blur-md shadow-lg">
          <Info className="w-4 h-4 text-gold-400 shrink-0" />
          <span className="hidden sm:inline">
            Drag Kiri untuk Putar 360° • Drag Kanan/2-Jari untuk Geser • Scroll untuk Zoom • Klik Gedung/Pin untuk Info
          </span>
          <span className="sm:hidden">
            Sentuh & Putar 360° • Pinch untuk Zoom • Ketuk Gedung
          </span>
        </div>
      </div>
    </div>
  );
};
