"use client";

import React, { useState } from "react";
import {
  RUNDOWN_SCHEDULE_DAY_1,
  RUNDOWN_SCHEDULE_DAY_2,
  RundownItem,
} from "@/data/arrivals";
import {
  Calendar,
  Clock,
  MapPin,
  X,
  Sparkles,
  Gamepad2,
  Trophy,
  Printer,
  Compass,
  Lightbulb,
  TreePine,
  Sun,
  Activity,
  Footprints,
  Utensils,
  ChevronRight,
} from "lucide-react";

interface RundownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusLocation?: (locationNumber: string) => void;
}

export const RundownModal: React.FC<RundownModalProps> = ({
  isOpen,
  onClose,
  onFocusLocation,
}) => {
  const [activeDay, setActiveDay] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const currentSchedule =
    activeDay === 1 ? RUNDOWN_SCHEDULE_DAY_1 : RUNDOWN_SCHEDULE_DAY_2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-lime-800 rounded-[32px] shadow-2xl border-4 border-lime-400/60 flex flex-col overflow-hidden text-lime-950"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poster Top Banner - Vibrant Lime Green Theme */}
        <div className="relative bg-gradient-to-b from-lime-600 via-lime-700 to-lime-800 p-5 sm:p-6 text-white overflow-hidden border-b-2 border-lime-500/60 select-none">
          {/* Decorative Corner Leaves & Floating Icons */}
          <div className="absolute -top-3 -left-3 w-16 h-16 opacity-35 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="#bef264">
              <path d="M10,90 Q10,10 90,10 Q90,90 10,90 Z" />
            </svg>
          </div>

          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Left: Organization / Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow">
                <Lightbulb className="w-4 h-4 text-butter-200" />
              </div>
              <span className="text-xs sm:text-sm font-black tracking-wide uppercase text-lime-100 font-fun">
                PUSZIAD & THE HIGHLAND PARK RESORT
              </span>
            </div>

            {/* Right: Date & Action Controls */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-white/15 text-butter-200 text-xs font-bold border border-white/20">
                10 - 11 Oktober 2026
              </span>

              <button
                type="button"
                onClick={() => window.print()}
                title="Cetak Jadwal"
                className="p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors border border-white/20 flex items-center gap-1 text-xs font-bold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Cetak</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                title="Tutup Jadwal"
                className="p-2 rounded-full bg-white/15 hover:bg-rose-500 text-white transition-colors border border-white/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Main Poster Typography */}
          <div className="text-center py-2 relative">
            <div className="inline-block text-butter-200 text-base sm:text-xl font-extrabold uppercase tracking-widest drop-shadow font-fun">
              RUNDOWN ACARA RESMI
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight drop-shadow-md mt-0.5 font-fun">
              &quot;FAMILY GATHERING PUSZIAD&quot;
            </h1>

            {/* Decorative Divider with Center Dot */}
            <div className="flex items-center justify-center gap-3 mt-3 max-w-xs mx-auto">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-white/50 to-white/90" />
              <div className="w-2 h-2 rounded-full bg-butter-200 shadow" />
              <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-white/50 to-white/90" />
            </div>
          </div>
        </div>

        {/* Poster Inner Body - Soft Lime/Mint Background */}
        <div className="flex-1 bg-gradient-to-b from-[#ecfccb] via-[#f7fee7] to-[#e4f8be] overflow-y-auto p-3 sm:p-6 space-y-4">
          {/* Day Selector Pill Tabs */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center bg-white/90 p-1.5 rounded-full shadow-md border-2 border-lime-400/50 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveDay(1)}
                className={`flex items-center gap-1.5 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeDay === 1
                    ? "bg-lime-700 text-white shadow-md shadow-lime-900/30 scale-105"
                    : "text-lime-900 hover:bg-lime-100 font-bold"
                }`}
              >
                <span>🌿 HARI KE-I (Jumat - Kedatangan)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDay(2)}
                className={`flex items-center gap-1.5 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeDay === 2
                    ? "bg-lime-700 text-white shadow-md shadow-lime-900/30 scale-105"
                    : "text-lime-900 hover:bg-lime-100 font-bold"
                }`}
              >
                <span>☀️ HARI KE-II (Sabtu - Kegiatan & Ballroom)</span>
              </button>
            </div>
          </div>

          {/* Schedule List - Split Pill Rows (Butter Yellow + Clean White) */}
          <div className="space-y-2.5 max-w-3xl mx-auto pt-2">
            {currentSchedule.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col md:flex-row items-stretch md:items-center gap-2 p-1.5 rounded-3xl transition-transform hover:scale-[1.01]"
              >
                {/* Left Butter Yellow Time Pill */}
                <div className="bg-butter-pill text-lime-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-full border border-amber-300 shadow-sm flex items-center justify-center gap-1.5 shrink-0 min-w-[160px] md:min-w-[180px]">
                  <Clock className="w-3.5 h-3.5 text-lime-900" />
                  <span className="font-mono">{item.startTime} - {item.endTime} WIB</span>
                </div>

                {/* Right White Pill Card */}
                <div className="bg-white rounded-2xl md:rounded-full px-4 sm:px-5 py-2.5 shadow-sm border border-lime-300/80 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-black text-lime-950">
                        {item.title}
                      </h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 border border-lime-300">
                        {item.badge}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Location Pin & Map Button */}
                  {item.locationName && (
                    <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-lime-900 bg-lime-50 px-2.5 py-1 rounded-full border border-lime-200">
                        <MapPin className="w-3 h-3 text-lime-600" />
                        <span>{item.locationName}</span>
                      </div>

                      {item.locationNumber && onFocusLocation && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onFocusLocation(item.locationNumber!);
                          }}
                          className="p-1 rounded-full bg-lime-100 hover:bg-lime-200 text-lime-900 transition-colors"
                          title={`Lihat Lokasi #${item.locationNumber}`}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cute Landscape Skyline City/Resort Illustration Banner at Bottom */}
          <div className="pt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-lime-300 text-lime-950 text-xs font-bold shadow-sm">
              <TreePine className="w-4 h-4 text-lime-600" />
              <span>The Highland Park Resort Hotel Bogor</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-lime-950 p-3 sm:px-6 text-white flex items-center justify-between text-xs border-t border-lime-800">
          <div className="flex items-center gap-2 text-lime-200 font-semibold">
            <Compass className="w-3.5 h-3.5 text-butter-300" />
            <span>Simulasi jalur & penempatan kamar tersedia di peta utama</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-full bg-butter-pill hover:bg-butter-300 text-lime-950 font-black transition-all shadow cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
