"use client";

import React, { useState } from "react";
import { KeyEventPinpoint, Waypoint } from "@/data/arrivals";
import {
  MapPin,
  Save,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  X,
  Sparkles,
  MousePointerClick,
} from "lucide-react";

interface PinPointCalibratorProps {
  isCalibrating: boolean;
  onToggleCalibrating: () => void;
  pinpoints: KeyEventPinpoint[];
  customPinCoords: Record<string, Waypoint>;
  selectedPinId: string | null;
  onSelectPin: (id: string) => void;
  onUpdatePinCoord: (id: string, coords: Waypoint) => void;
  onSavePermanent: () => Promise<void>;
  onResetDefaults: () => void;
}

export const PinPointCalibrator: React.FC<PinPointCalibratorProps> = ({
  isCalibrating,
  onToggleCalibrating,
  pinpoints,
  customPinCoords,
  selectedPinId,
  onSelectPin,
  onUpdatePinCoord,
  onSavePermanent,
  onResetDefaults,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [stepSize, setStepSize] = useState<number>(0.5);

  if (!isCalibrating) return null;

  const currentPin = pinpoints.find((p) => p.id === selectedPinId) || pinpoints[0];
  const activeCoords = (selectedPinId && customPinCoords[selectedPinId])
    ? customPinCoords[selectedPinId]
    : (currentPin ? currentPin.coords : { x: 50, y: 50 });

  const handleNudge = (dx: number, dy: number) => {
    if (!currentPin) return;
    const newX = Math.max(0, Math.min(100, Number((activeCoords.x + dx).toFixed(1))));
    const newY = Math.max(0, Math.min(100, Number((activeCoords.y + dy).toFixed(1))));
    onUpdatePinCoord(currentPin.id, { x: newX, y: newY });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSavePermanent();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[80] w-[95%] max-w-2xl bg-[#0b1803]/98 backdrop-blur-2xl rounded-3xl border-2 border-amber-400 shadow-2xl p-3 sm:p-4 text-white animate-in fade-in zoom-in-95 duration-200 select-none shadow-glow-gold">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-amber-400/30 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black shadow-md">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <span>Mode Kalibrasi Posisi Pin Point</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                Live Edit
              </span>
            </h3>
            <p className="text-[11px] text-lime-200/80">
              Drag pin di peta atau klik lokasi bangunan untuk menyesuaikan posisi.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleCalibrating}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500 text-white transition-colors cursor-pointer"
          title="Tutup Mode Kalibrasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selector & Direction Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        {/* Pin Dropdown Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Pilih Pin Point yang Ingin Digeser:
          </label>
          <select
            value={currentPin?.id || ""}
            onChange={(e) => onSelectPin(e.target.value)}
            className="w-full bg-[#061202] border-2 border-amber-400/60 rounded-xl px-3 py-2 text-xs font-black text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
          >
            {pinpoints.map((pin) => {
              const coords = customPinCoords[pin.id] || pin.coords;
              return (
                <option key={pin.id} value={pin.id} className="bg-[#0b1803] text-white">
                  {pin.name} ({coords.x}%, {coords.y}%)
                </option>
              );
            })}
          </select>

          <div className="flex items-center justify-between text-xs font-mono font-bold bg-[#061202] px-3 py-1.5 rounded-xl border border-lime-500/30 text-lime-300">
            <span>Koordinat Aktif:</span>
            <span className="text-amber-300 font-black">
              X: {activeCoords.x.toFixed(1)}% | Y: {activeCoords.y.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Micro-Nudge D-Pad Controls */}
        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#061202] border border-amber-400/30 space-y-1.5">
          <div className="flex items-center justify-between w-full px-2 text-[10px] font-bold text-lime-300/80">
            <span>Geser Presisi ({stepSize}%):</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setStepSize(0.2)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  stepSize === 0.2 ? "bg-amber-400 text-slate-950" : "bg-white/10 text-white"
                }`}
              >
                0.2%
              </button>
              <button
                type="button"
                onClick={() => setStepSize(0.5)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  stepSize === 0.5 ? "bg-amber-400 text-slate-950" : "bg-white/10 text-white"
                }`}
              >
                0.5%
              </button>
              <button
                type="button"
                onClick={() => setStepSize(1.0)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  stepSize === 1.0 ? "bg-amber-400 text-slate-950" : "bg-white/10 text-white"
                }`}
              >
                1.0%
              </button>
            </div>
          </div>

          {/* D-Pad Buttons */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => handleNudge(0, -stepSize)}
              className="p-1.5 rounded-lg bg-[#142807] hover:bg-amber-400 hover:text-slate-950 text-amber-200 border border-amber-400/40 transition-colors shadow-sm cursor-pointer"
              title="Geser Ke Atas"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleNudge(-stepSize, 0)}
                className="p-1.5 rounded-lg bg-[#142807] hover:bg-amber-400 hover:text-slate-950 text-amber-200 border border-amber-400/40 transition-colors shadow-sm cursor-pointer"
                title="Geser Ke Kiri"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-4 h-4 rounded-full bg-amber-400/40" />
              <button
                type="button"
                onClick={() => handleNudge(stepSize, 0)}
                className="p-1.5 rounded-lg bg-[#142807] hover:bg-amber-400 hover:text-slate-950 text-amber-200 border border-amber-400/40 transition-colors shadow-sm cursor-pointer"
                title="Geser Ke Kanan"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleNudge(0, stepSize)}
              className="p-1.5 rounded-lg bg-[#142807] hover:bg-amber-400 hover:text-slate-950 text-amber-200 border border-amber-400/40 transition-colors shadow-sm cursor-pointer"
              title="Geser Ke Bawah"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-3 pt-2.5 border-t border-amber-400/30 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onResetDefaults}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-rose-900/60 text-rose-200 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
          title="Kembalikan semua koordinat ke setelan awal"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Default</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs shadow-xl transition-all cursor-pointer border select-none ${
            savedSuccess
              ? "bg-emerald-500 text-white border-white shadow-glow-emerald"
              : "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 border-white shadow-glow-gold hover:scale-105"
          }`}
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Tersimpan Permanen!</span>
            </>
          ) : isSaving ? (
            <span>Menyimpan...</span>
          ) : (
            <>
              <Save className="w-4 h-4 text-slate-950" />
              <span>Simpan Posisi Pin Permanen</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
