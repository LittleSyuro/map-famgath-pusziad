"use client";

import React, { useState, useEffect, useRef } from "react";
import { Waypoint, ALL_RUNDOWN_ITEMS } from "@/data/arrivals";
import {
  Edit3,
  Check,
  RotateCcw,
  Copy,
  Plus,
  Trash2,
  Play,
  Save,
  MousePointer,
  HelpCircle,
  X,
  Layers,
  Sparkles,
  Route,
} from "lucide-react";

export interface RouteActivity {
  id: string;
  name: string;
  timeRange: string;
  badge: string;
  color: string;
  defaultWaypoints: Waypoint[];
}

export const ROUTE_ACTIVITIES: RouteActivity[] = ALL_RUNDOWN_ITEMS.map((item) => ({
  id: item.id,
  name: `[H-${item.day}] ${item.title} → ${item.locationName || "Lokasi"}`,
  timeRange: `${item.startTime} - ${item.endTime} WIB`,
  badge: item.badge,
  color: item.color || "#eab308",
  defaultWaypoints: item.defaultWaypoints || [
    { x: 77.0, y: 32.0 },
    { x: 58.5, y: 22.5 },
  ],
}));

interface PathEditorOverlayProps {
  isEditorOpen: boolean;
  onToggleEditor: () => void;
  activeActivityId: string;
  onSelectActivity: (id: string) => void;
  currentWaypoints: Waypoint[];
  allCustomRoutes?: Record<string, Waypoint[]>;
  onUpdateWaypoints: (waypoints: Waypoint[]) => void;
  onTestRoute: () => void;
}

export const PathEditorOverlay: React.FC<PathEditorOverlayProps> = ({
  isEditorOpen,
  onToggleEditor,
  activeActivityId,
  onSelectActivity,
  currentWaypoints,
  allCustomRoutes = {},
  onUpdateWaypoints,
  onTestRoute,
}) => {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [draggedNodeIndex, setDraggedNodeIndex] = useState<number | null>(null);

  const activeActivity =
    ROUTE_ACTIVITIES.find((a) => a.id === activeActivityId) || ROUTE_ACTIVITIES[0];

  // Copy active waypoints array formatted as TypeScript / JSON
  const handleCopyCode = () => {
    const code = JSON.stringify(
      currentWaypoints.map((pt) => ({
        x: Number(pt.x.toFixed(1)),
        y: Number(pt.y.toFixed(1)),
      })),
      null,
      2
    );

    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Copy ALL routes across all agenda items as JSON
  const handleCopyAllRoutes = () => {
    const combined: Record<string, any> = {
      ...allCustomRoutes,
      [activeActivityId]: currentWaypoints,
    };
    navigator.clipboard.writeText(JSON.stringify(combined, null, 2));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Save to LocalStorage and Permanent Source File (data/arrivals.ts)
  const handleSaveToStorage = async () => {
    try {
      const combined: Record<string, Waypoint[]> = {
        ...allCustomRoutes,
        [activeActivityId]: currentWaypoints,
      };

      // Save each to localStorage
      Object.entries(combined).forEach(([actId, pts]) => {
        localStorage.setItem(`famgath_route_${actId}`, JSON.stringify(pts));
      });

      // Call API to write permanently to data/arrivals.ts in the codebase
      const res = await fetch("/api/save-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: activeActivityId,
          waypoints: currentWaypoints,
          allRoutes: combined,
        }),
      });

      const data = await res.json();
      if (data?.success) {
        setSavedMessage("Tersimpan ke Default (arrivals.ts)! ✓");
      } else {
        setSavedMessage("Tersimpan di Browser ✓");
      }
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);
    } catch (e) {
      console.error(e);
      setSavedMessage("Tersimpan di Browser ✓");
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);
    }
  };

  // Reset to default preset
  const handleResetToDefault = () => {
    onUpdateWaypoints(activeActivity.defaultWaypoints);
    setSelectedNodeIndex(null);
    try {
      localStorage.removeItem(`famgath_route_${activeActivityId}`);
    } catch (e) {}
  };

  // Delete specific node
  const handleDeleteNode = (index: number) => {
    if (currentWaypoints.length <= 2) {
      alert("Rute minimal harus memiliki 2 titik (Titik Awal & Titik Akhir).");
      return;
    }
    const updated = currentWaypoints.filter((_, i) => i !== index);
    onUpdateWaypoints(updated);
    setSelectedNodeIndex(null);
  };

  if (!isEditorOpen) {
    return null;
  }

  return (
    <div className="absolute top-4 inset-x-4 z-50 flex flex-col items-center pointer-events-none no-print">
      {/* Main Floating Editor Control Bar */}
      <div className="w-full max-w-4xl bg-slate-950/98 text-white border border-emerald-500/40 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl pointer-events-auto space-y-3 shadow-emerald-950/50">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/30">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Editor Titik Pinpoint & Jalur Rute
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Mode Interaktif Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Klik pada peta untuk menambah titik, atau geser (drag) titik bulat untuk mengatur posisinya.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTestRoute}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
              title="Jalankan pion untuk menguji rute yang baru diedit"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Test Animasi</span>
            </button>

            <button
              type="button"
              onClick={onToggleEditor}
              title="Tutup Mode Editor"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-red-500 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Row 1: Activity Selector Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-emerald-400 shrink-0 flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pilih Agenda Rute:</span>
          </span>
          <select
            value={activeActivityId}
            onChange={(e) => onSelectActivity(e.target.value)}
            className="w-full flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
          >
            {ROUTE_ACTIVITIES.map((act) => (
              <option key={act.id} value={act.id}>
                {act.name} ({act.timeRange})
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: Action Tools (Save, Copy, Reset, Delete) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToStorage}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer hover:scale-105"
              title="Simpan permanen ke file proyek (data/arrivals.ts) agar menjadi default untuk SEMUA DEVICE dan Netlify"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedToast ? (savedMessage || "Tersimpan ke File! ✓") : "💾 Simpan Permanen (Semua Device)"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              title="Salin koordinat rute agenda aktif ini"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Salin Rute Ini</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyAllRoutes}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              title="Salin SELURUH rute semua agenda dalam bentuk JSON"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Semua Tersalin!</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  <span>Salin Semua Rute (JSON)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              title="Kembalikan ke rute default bawaan"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Default</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Delete Node Buttons */}
            {selectedNodeIndex !== null ? (
              <button
                type="button"
                onClick={() => handleDeleteNode(selectedNodeIndex)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg border border-red-400 transition-all cursor-pointer animate-pulse"
                title={`Hapus Titik No. ${selectedNodeIndex + 1} (Atau tekan tombol Delete di keyboard)`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Titik #{selectedNodeIndex + 1}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleDeleteNode(currentWaypoints.length - 1)}
                disabled={currentWaypoints.length <= 2}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  currentWaypoints.length <= 2
                    ? "bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed"
                    : "bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/40 shadow-sm"
                }`}
                title="Hapus / kurangi titik paling akhir dari rute"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kurangi Titik Terakhir</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Nodes Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-[11px] font-mono">
          <span className="text-zinc-400 font-sans text-xs shrink-0 mr-1">
            Daftar Titik ({currentWaypoints.length} nodes):
          </span>
          {currentWaypoints.map((pt, i) => (
            <div
              key={i}
              className={`inline-flex items-center rounded-lg border shrink-0 transition-all overflow-hidden ${
                i === selectedNodeIndex
                  ? "bg-amber-400 text-resort-950 border-amber-300 ring-2 ring-amber-300 font-black"
                  : i === 0
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
                  : i === currentWaypoints.length - 1
                  ? "bg-red-500/20 text-red-300 border-red-500/40 font-bold"
                  : "bg-white/10 text-zinc-300 border-white/10 hover:border-gold-400 font-medium"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedNodeIndex(i === selectedNodeIndex ? null : i)}
                className="px-2 py-1 text-left cursor-pointer"
                title={`Pilih Titik #${i + 1}`}
              >
                #{i + 1}: ({pt.x.toFixed(1)}%, {pt.y.toFixed(1)}%)
              </button>
              {currentWaypoints.length > 2 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNode(i);
                  }}
                  className="px-1.5 py-1 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer border-l border-white/10"
                  title={`Hapus Titik #${i + 1}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
