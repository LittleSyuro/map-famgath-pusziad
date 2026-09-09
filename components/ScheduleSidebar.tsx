"use client";

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  EyeOff,
  Navigation,
  Clock,
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
  onSelectAgenda,
  onHide,
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
    <div className="w-full lg:w-[280px] xl:w-[310px] flex flex-col bg-white/98 border-2 border-lime-500/70 rounded-3xl p-3 shadow-2xl backdrop-blur-2xl shrink-0 space-y-2.5 select-none text-slate-900">
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
              <div className="text-[9px] uppercase tracking-wider text-lime-950 font-black">
                RUNDOWN ACARA
              </div>
              <div className="text-[11px] font-black text-slate-950 tracking-tight">
                {selectedDay === 1 ? "Hari 1 (Jumat, 9 Okt)" : "Hari 2 (Sabtu, 10 Okt)"}
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
                    ? "bg-amber-400 text-slate-950 shadow-sm border border-amber-300"
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
                    ? "bg-amber-400 text-slate-950 shadow-sm border border-amber-300"
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
                title="Sembunyikan Panel Rundown"
                className="p-1.5 rounded-xl bg-white hover:bg-lime-100 text-slate-800 hover:text-lime-900 border border-lime-300 transition-colors cursor-pointer shadow-sm"
              >
                <EyeOff className="w-3.5 h-3.5 text-lime-800" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Items List Title Banner */}
      <div className="flex items-center justify-between bg-lime-100/90 border border-lime-300/90 rounded-2xl px-3 py-1.5 shadow-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-lime-600 text-white flex items-center justify-center shadow-xs">
            <Navigation className="w-3 h-3" />
          </div>
          <span className="text-xs font-black text-slate-950 uppercase tracking-wide">
            Agenda Kegiatan
          </span>
        </div>
        <span className="text-[10px] font-black text-lime-900 bg-white px-2 py-0.5 rounded-full border border-lime-300 shadow-xs">
          Klik Agenda
        </span>
      </div>

      {/* Interactive Schedule List: Waktu, Judul Besar & Tempat Saja */}
      <div className="space-y-2 max-h-[62vh] lg:max-h-[calc(88vh-160px)] overflow-y-auto px-1 py-1 pb-6 select-none custom-scrollbar">
        {scheduleList.map((item) => {
          const isItemActive = activeAgendaId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`group relative rounded-2xl p-2.5 transition-all cursor-pointer border ${
                isItemActive
                  ? "bg-lime-50/95 text-slate-950 border-2 border-lime-500 ring-2 ring-lime-400 shadow-md"
                  : "bg-white text-slate-900 border border-slate-200 shadow-sm hover:border-lime-400 hover:shadow-md"
              }`}
            >
              {/* Time Pill + Badge */}
              <div className="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
                <span className="font-mono text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-sm flex items-center gap-1 bg-amber-300/80 text-slate-950 border-amber-300 shrink-0">
                  <Clock className="w-3 h-3 text-slate-950" />
                  <span>{item.startTime} - {item.endTime}</span>
                </span>

                <span className="text-[9px] font-black px-2 py-0.5 rounded-full border bg-lime-100 text-lime-950 border-lime-400">
                  {item.badge}
                </span>
              </div>

              {/* Title & Location (Without Long Description) */}
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black tracking-tight leading-snug text-slate-950 group-hover:text-lime-800 transition-colors">
                  {item.title}
                </h4>

                {item.locationName && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-950">
                    <MapPin className="w-3 h-3 text-lime-700 shrink-0" />
                    <span className="truncate">{item.locationName}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
