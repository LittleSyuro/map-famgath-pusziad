"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { VIPArrival } from "@/data/arrivals";
import { PawnAvatar } from "./PawnAvatar";
import {
  CheckCircle2,
  Footprints,
  Sparkles,
  Crown,
  ChevronRight,
  ShieldCheck,
  DoorOpen,
  Clock,
  Home,
  Hourglass,
} from "lucide-react";

interface ArrivalSummaryProps {
  arrivals: VIPArrival[];
  currentMinutes: number;
  onSelectVip: (vip: VIPArrival) => void;
  selectedVipId: string | null;
}

export const ArrivalSummary: React.FC<ArrivalSummaryProps> = ({
  arrivals,
  currentMinutes,
  onSelectVip,
  selectedVipId,
}) => {
  // Count arrived VIPs
  const arrivedCount = useMemo(() => {
    return arrivals.filter((v) => currentMinutes >= v.roomArrivalMinutes).length;
  }, [arrivals, currentMinutes]);

  const allArrived = arrivedCount === arrivals.length;

  return (
    <div className="w-full bg-white/95 dark:bg-resort-900/95 rounded-3xl border border-gold-500/40 p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-gold-600 via-amber-500 to-yellow-400 text-resort-950 shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-resort-950 dark:text-white font-display">
              Alokasi Kamar Tamu VIP
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {arrivedCount} dari {arrivals.length} Pejabat telah tiba di kamar
            </p>
          </div>
        </div>

        {allArrived && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Lengkap
          </span>
        )}
      </div>

      {/* List of VIPs */}
      <div className="space-y-2.5">
        {arrivals.map((vip) => {
          const isNotArrived = currentMinutes < vip.gateArrivalMinutes;
          const isAtGate =
            currentMinutes >= vip.gateArrivalMinutes &&
            currentMinutes < vip.walkStartMinutes;
          const isWalking =
            currentMinutes >= vip.walkStartMinutes &&
            currentMinutes < vip.roomArrivalMinutes;
          const isArrived = currentMinutes >= vip.roomArrivalMinutes;

          const isSelected = selectedVipId === vip.id;

          return (
            <div
              key={vip.id}
              onClick={() => onSelectVip(vip)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                vip.isPJU
                  ? isSelected
                    ? "bg-amber-50/90 dark:bg-resort-800 border-amber-400 ring-2 ring-amber-400 shadow-glow-gold"
                    : "bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border-amber-400/60 hover:border-amber-400 shadow-sm"
                  : isSelected
                  ? "bg-zinc-100 dark:bg-resort-800 border-gold-500 shadow-md ring-1 ring-gold-400"
                  : isArrived
                  ? "bg-emerald-50/40 dark:bg-resort-950/60 border-emerald-500/30 hover:border-gold-400"
                  : isWalking
                  ? "bg-amber-50/40 dark:bg-resort-950/60 border-amber-500/30 hover:border-amber-400"
                  : "bg-zinc-50/60 dark:bg-resort-950/40 border-zinc-200 dark:border-resort-800 hover:border-gold-400/60"
              }`}
            >
              {/* Left: Avatar & Info */}
              <div className="flex items-center gap-3 min-w-0">
                <PawnAvatar
                  name={vip.name}
                  photo={vip.photo}
                  size={46}
                  ringColor={vip.color}
                  isPJU={vip.isPJU}
                  isArrived={isArrived}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {vip.isPJU ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-500 text-resort-950 text-[9px] font-black uppercase tracking-wider">
                        <Crown className="w-2.5 h-2.5" /> PJU
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gold-600 dark:text-gold-400">
                        {vip.title}
                      </span>
                    )}
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                      {vip.name}
                    </h4>
                  </div>

                  {/* Room info: Internal event room name */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                    {vip.internalNumber && (
                      <>
                        <span className="font-bold text-gold-700 dark:text-gold-400">
                          Kamar No. {vip.internalNumber}
                        </span>
                        <span className="text-zinc-400">•</span>
                      </>
                    )}
                    <span className="text-zinc-500 dark:text-zinc-400 truncate">
                      {vip.mapLocationName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Status badge & Mini-thumbnail preview */}
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {isArrived && (
                  <div className="flex items-center gap-1.5">
                    {/* Mini thumbnail of room photo */}
                    <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-emerald-400/80 shadow-sm hidden sm:block">
                      <Image
                        src={vip.roomImage}
                        alt={vip.mapLocationName}
                        fill
                        unoptimized
                        sizes="28px"
                        className="object-cover"
                      />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Tiba di Kamar</span>
                    </span>
                  </div>
                )}

                {isWalking && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                    <Footprints className="w-3.5 h-3.5 text-amber-500" />
                    <span>Menuju Kamar</span>
                  </span>
                )}

                {isAtGate && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                    <DoorOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>Di Welcome Gate</span>
                  </span>
                )}

                {isNotArrived && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
                    <Hourglass className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Belum Tiba</span>
                  </span>
                )}

                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
