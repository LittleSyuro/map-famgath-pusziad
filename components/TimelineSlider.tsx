"use client";

import React, { useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  FastForward,
  Sparkles,
  Calendar,
  Layers,
} from "lucide-react";
import {
  TIMELINE_START_MINUTES,
  TIMELINE_END_MINUTES,
  RUNDOWN_SCHEDULE,
} from "@/data/arrivals";

interface TimelineSliderProps {
  currentMinutes: number;
  isPlaying: boolean;
  speed: number; // 1, 2, 5, 10
  onTimeChange: (newMinutes: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onSpeedChange: (newSpeed: number) => void;
  onOpenRundownModal?: () => void;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  currentMinutes,
  isPlaying,
  speed,
  onTimeChange,
  onTogglePlay,
  onReset,
  onSpeedChange,
  onOpenRundownModal,
}) => {
  // Format current minutes to HH:MM WIB
  const formattedTime = useMemo(() => {
    const hours = Math.floor(currentMinutes / 60);
    const mins = Math.floor(currentMinutes % 60);
    const hStr = hours.toString().padStart(2, "0");
    const mStr = mins.toString().padStart(2, "0");
    return `${hStr}:${mStr}`;
  }, [currentMinutes]);

  // Determine current active rundown
  const activeRundown = useMemo(() => {
    return (
      RUNDOWN_SCHEDULE.find(
        (r) =>
          currentMinutes >= r.startMinutes && currentMinutes < r.endMinutes
      ) || RUNDOWN_SCHEDULE[RUNDOWN_SCHEDULE.length - 1]
    );
  }, [currentMinutes]);

  const progressPercent =
    ((currentMinutes - TIMELINE_START_MINUTES) /
      (TIMELINE_END_MINUTES - TIMELINE_START_MINUTES)) *
    100;

  return (
    <div className="w-full bg-white/95 dark:bg-resort-900/95 border border-gold-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-4 select-none">
      {/* Top Bar: Live Digital Clock + Active Rundown + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-500/20 pb-3">
        {/* Left: Digital Clock & Active Phase */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-resort-950 text-gold-400 border border-gold-500/50 shadow-inner flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-400 animate-pulse" />
            <span className="font-mono text-lg sm:text-xl font-black tracking-wider text-white">
              {formattedTime} <span className="text-xs text-gold-400 font-bold">WIB</span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gold-500/20 text-gold-700 dark:text-gold-300 border border-gold-500/40">
                {activeRundown.badge}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-resort-950 dark:text-white font-display">
                {activeRundown.title}
              </h4>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                {activeRundown.description}
              </p>
              {onOpenRundownModal && (
                <button
                  type="button"
                  onClick={onOpenRundownModal}
                  className="text-[10px] font-bold text-gold-600 dark:text-gold-400 hover:underline shrink-0 flex items-center gap-0.5"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Jadwal Lengkap</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls (Play/Pause, Reset, Speed) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              isPlaying
                ? "bg-resort-800 text-gold-300 hover:bg-resort-700 border border-gold-500/40"
                : "bg-gold-500 hover:bg-gold-400 text-resort-950 ring-2 ring-gold-400/50"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" /> Jeda
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Mulai
              </>
            )}
          </button>

          {/* Reset from 16:00 */}
          <button
            type="button"
            onClick={onReset}
            title="Putar Ulang dari Jam 16.00"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-2xl bg-zinc-100 dark:bg-resort-950 hover:bg-zinc-200 dark:hover:bg-resort-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold border border-zinc-200 dark:border-resort-800 transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gold-500" />
            <span className="hidden sm:inline">Ulang 16:00</span>
          </button>

          {/* Speed Presets (1x, 2x, 5x, 10x) */}
          <div className="flex items-center bg-zinc-100 dark:bg-resort-950 rounded-2xl p-1 border border-zinc-200 dark:border-resort-800">
            {[1, 2, 5, 10].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  speed === s
                    ? "bg-gold-500 text-resort-950 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-gold-500"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Timeline Slider Track */}
      <div className="space-y-2 pt-1">
        <div className="relative w-full flex items-center">
          {/* Background Track with Milestone Segments */}
          <div className="absolute inset-x-0 h-3 rounded-full bg-zinc-200 dark:bg-resort-950 overflow-hidden border border-zinc-300 dark:border-resort-800">
            {/* Phase 1: 16:00 - 17:00 (50% width) */}
            <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-blue-500/15 border-r border-dashed border-blue-500/40" />
            {/* Phase 2: 17:00 - 18:00 (50% width) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1/2 bg-emerald-500/15" />

            {/* Filled Progress Bar */}
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500 transition-all duration-75"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>

          {/* Draggable Range Input Overlay */}
          <input
            type="range"
            min={TIMELINE_START_MINUTES}
            max={TIMELINE_END_MINUTES}
            step={0.2}
            value={currentMinutes}
            onChange={(e) => onTimeChange(parseFloat(e.target.value))}
            className="w-full h-7 opacity-0 cursor-pointer z-20"
          />

          {/* Custom Glowing Slider Handle / Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gold-400 border-2 border-white shadow-glow-gold pointer-events-none z-10 flex items-center justify-center transition-all duration-75"
            style={{
              left: `${Math.min(99, Math.max(1, progressPercent))}%`,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-resort-950" />
          </div>
        </div>

        {/* Milestone Marks / Labels (16:00, 16:30, 17:00, 17:30, 18:00) */}
        <div className="flex justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 font-bold px-1">
          <div
            className="cursor-pointer hover:text-gold-500 transition-colors"
            onClick={() => onTimeChange(960)}
          >
            <span>16:00</span>
            <div className="text-[9px] font-sans font-normal text-blue-500 block">Tiba di Gate</div>
          </div>
          <div
            className="cursor-pointer hover:text-gold-500 transition-colors hidden sm:block"
            onClick={() => onTimeChange(990)}
          >
            <span>16:30</span>
          </div>
          <div
            className="cursor-pointer hover:text-gold-500 transition-colors text-center"
            onClick={() => onTimeChange(1020)}
          >
            <span className="text-amber-500 font-black">17:00</span>
            <div className="text-[9px] font-sans font-normal text-amber-500 block">Mulai ke Kamar</div>
          </div>
          <div
            className="cursor-pointer hover:text-gold-500 transition-colors hidden sm:block"
            onClick={() => onTimeChange(1050)}
          >
            <span>17:30</span>
          </div>
          <div
            className="cursor-pointer hover:text-gold-500 transition-colors text-right"
            onClick={() => onTimeChange(1080)}
          >
            <span className="text-emerald-500 font-black">18:00</span>
            <div className="text-[9px] font-sans font-normal text-emerald-500 block">Kamar Lengkap</div>
          </div>
        </div>
      </div>
    </div>
  );
};
