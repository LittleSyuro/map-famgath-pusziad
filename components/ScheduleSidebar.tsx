"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Play,
  RotateCcw,
  Calendar,
  MapPin,
  Sparkles,
  Gamepad2,
  Edit3,
  EyeOff,
  Navigation,
  Clock,
  FileText,
} from "lucide-react";
import {
  RundownItem,
  RUNDOWN_SCHEDULE_DAY_1,
  RUNDOWN_SCHEDULE_DAY_2,
} from "@/data/arrivals";

interface ScheduleSidebarProps {
  activeAgendaId: string;
  isAnimating: boolean;
  onSelectAgenda: (agendaId: string) => void;
  onReplayAnimation: () => void;
  onToggleEditor?: () => void;
  isEditorOpen?: boolean;
  onHide?: () => void;
  onOpenRundownModal?: () => void;
}

export const ScheduleSidebar: React.FC<ScheduleSidebarProps> = ({
  activeAgendaId,
  isAnimating,
  onSelectAgenda,
  onReplayAnimation,
  onToggleEditor,
  isEditorOpen,
  onHide,
  onOpenRundownModal,
}) => {
  const [selectedDay, setSelectedDay] = useState<1 | 2>(() => {
    return activeAgendaId.startsWith("d2-") ? 2 : 1;
  });

  React.useEffect(() => {
    if (activeAgendaId.startsWith("d2-")) {
      setSelectedDay(2);
    } else if (activeAgendaId.startsWith("d1-")) {
      setSelectedDay(1);
    }
  }, [activeAgendaId]);

  const scheduleList =
    selectedDay === 1 ? RUNDOWN_SCHEDULE_DAY_1 : RUNDOWN_SCHEDULE_DAY_2;

  const handleItemClick = (item: RundownItem) => {
    onSelectAgenda(item.id);
  };

  return (
    <div className="w-full lg:w-[290px] xl:w-[320px] flex flex-col bg-white/98 border-2 border-lime-500/70 rounded-3xl p-3 sm:p-3.5 shadow-2xl backdrop-blur-2xl shrink-0 space-y-2.5 select-none text-slate-900">
      {/* Top Header Card in Fresh White/Lime Theme */}
      <div className="bg-lime-50/95 rounded-2xl p-2.5 border border-lime-300 shadow-sm space-y-2">
        {/* Day Switcher & Hide Button */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-lime-500 to-amber-300 p-0.5 flex items-center justify-center shadow-sm">
              <div className="w-full h-full bg-white rounded-[8px] flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-lime-800" />
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-lime-950 font-black flex items-center gap-1 font-fun">
                <span>🌱 RUNDOWN ACARA</span>
              </div>
              <div className="text-[11px] font-black text-slate-950 tracking-tight">
                {selectedDay === 1 ? "Hari 1 (Jumat)" : "Hari 2 (Sabtu)"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Day 1 / Day 2 Pill Tabs */}
            <div className="flex items-center bg-white rounded-full p-0.5 border border-lime-300 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setSelectedDay(1);
                  onSelectAgenda(RUNDOWN_SCHEDULE_DAY_1[0].id);
                }}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                  selectedDay === 1
                    ? "bg-butter-pill text-slate-950 shadow-sm shadow-amber-300/40 border border-amber-300"
                    : "text-slate-700 hover:text-lime-900 font-bold"
                }`}
              >
                Hari I
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDay(2);
                  onSelectAgenda(RUNDOWN_SCHEDULE_DAY_2[0].id);
                }}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                  selectedDay === 2
                    ? "bg-butter-pill text-slate-950 shadow-sm shadow-amber-300/40 border border-amber-300"
                    : "text-slate-700 hover:text-lime-900 font-bold"
                }`}
              >
                Hari II
              </button>
            </div>

            {/* Hide Sidebar Button */}
            {onHide && (
              <button
                type="button"
                onClick={onHide}
                title="Sembunyikan Panel Jadwal"
                className="p-1.5 rounded-xl bg-white hover:bg-lime-100 text-slate-800 hover:text-lime-900 border border-lime-300 transition-colors cursor-pointer shadow-sm"
              >
                <EyeOff className="w-3.5 h-3.5 text-lime-800" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons: Play Route Animation, Edit Nodes & Open Poster */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-lime-200/90">
          {/* Replay / Play Route Animation */}
          <button
            type="button"
            onClick={onReplayAnimation}
            className={`py-1.5 px-1.5 rounded-full text-[11px] font-black flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer ${
              isAnimating
                ? "bg-amber-400 text-slate-950 ring-2 ring-amber-400 animate-pulse font-black"
                : "bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-400 hover:to-lime-500 text-slate-950 shadow-lime-500/25 hover:scale-[1.02]"
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="line-clamp-1">{isAnimating ? "Simulasi..." : "Putar"}</span>
          </button>

          {/* Edit Nodes Button */}
          {onToggleEditor && (
            <button
              type="button"
              onClick={onToggleEditor}
              className={`py-1.5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer ${
                isEditorOpen
                  ? "bg-butter-pill text-slate-950 ring-1 ring-amber-400 font-black border border-amber-300"
                  : "bg-white hover:bg-lime-50 text-slate-900 border border-slate-300"
              }`}
            >
              <Edit3 className="w-3 h-3 text-lime-800" />
              <span className="line-clamp-1">{isEditorOpen ? "Tutup" : "Nodes"}</span>
            </button>
          )}

          {/* Poster Modal Button */}
          {onOpenRundownModal && (
            <button
              type="button"
              onClick={onOpenRundownModal}
              title="Buka Rundown Acara Lengkap"
              className="py-1.5 px-1.5 rounded-full text-[11px] font-black flex items-center justify-center gap-1 bg-butter-pill hover:bg-butter-300 text-slate-950 border border-amber-400/90 shadow-xs cursor-pointer"
            >
              <FileText className="w-3 h-3 text-slate-950" />
              <span className="line-clamp-1">Poster</span>
            </button>
          )}
        </div>
      </div>

      {/* Schedule Items List Title Banner */}
      <div className="flex items-center justify-between bg-lime-100/90 border border-lime-300/90 rounded-2xl px-3 py-1.5 shadow-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-lime-600 text-white flex items-center justify-center shadow-xs">
            <Navigation className="w-3 h-3" />
          </div>
          <span className="text-xs font-black text-slate-950 uppercase tracking-wide font-fun">
            Rundown Agenda
          </span>
        </div>
        <span className="text-[10px] font-black text-lime-900 bg-white px-2 py-0.5 rounded-full border border-lime-300 shadow-xs">
          Klik rute
        </span>
      </div>

      {/* Interactive Schedule List with Clean White Cards */}
      <div className="space-y-2.5 max-h-[62vh] lg:max-h-[calc(88vh-160px)] overflow-y-auto px-1 py-1 pb-6 select-none custom-scrollbar">
        {scheduleList.map((item) => {
          const isItemActive = activeAgendaId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`group relative rounded-2xl p-3 transition-all cursor-pointer border ${
                isItemActive
                  ? "bg-lime-50/90 text-slate-950 border-2 border-lime-500 ring-2 ring-lime-400 shadow-md"
                  : "bg-white text-slate-900 border border-slate-200/95 shadow-sm hover:border-lime-400 hover:shadow-md"
              }`}
            >
              {/* Split Pill Header: Butter Yellow Time Pill + Category Badge */}
              <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Yellow Time Pill */}
                  <span className="font-mono text-xs font-black px-3 py-1 rounded-full border shadow-sm flex items-center gap-1.5 bg-butter-pill text-slate-950 border-amber-300 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-950" />
                    <span>{item.startTime} - {item.endTime}</span>
                  </span>

                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full border bg-lime-100 text-lime-950 border-lime-400">
                    {item.badge}
                  </span>
                </div>

                {/* Active Indicator */}
                {isItemActive && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-slate-950 bg-lime-300 px-2.5 py-0.5 rounded-full border border-lime-500 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-lime-800 animate-ping" />
                    <span>Aktif</span>
                  </span>
                )}
              </div>

              {/* Title & Location */}
              <div className="space-y-1.5">
                <h4 className="text-sm sm:text-base font-black tracking-tight leading-snug text-slate-950 group-hover:text-lime-800 transition-colors">
                  {item.title}
                </h4>

                {item.locationName && (
                  <div className="flex items-start gap-1.5 text-xs font-black text-emerald-950">
                    <MapPin className="w-3.5 h-3.5 text-lime-700 shrink-0 mt-0.5" />
                    <span className="break-words">{item.locationName}</span>
                  </div>
                )}

                {item.description && (
                  <p className="text-xs text-slate-800 font-medium leading-relaxed break-words">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Sub-Activities / Games List if Available */}
              {item.subActivities && item.subActivities.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200/90 space-y-2">
                  {item.subActivities.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="rounded-xl p-2.5 border bg-lime-50/90 border-lime-300 shadow-inner"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {sub.image && (
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-lime-400 shadow">
                            <Image
                              src={sub.image}
                              alt={sub.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="text-xs font-black flex items-center gap-1.5 text-slate-950 break-words">
                          {!sub.image && <Gamepad2 className="w-3.5 h-3.5 text-lime-700 shrink-0" />}
                          <span>{sub.title}</span>
                        </div>
                      </div>
                      {sub.items && (
                        <div className="flex flex-wrap gap-1.5">
                          {sub.items.map((it, itIdx) => (
                            <span
                              key={itIdx}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-white text-slate-950 border-slate-300 shadow-sm"
                            >
                              • {it}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
