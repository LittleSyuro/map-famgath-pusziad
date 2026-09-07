"use client";

import React, { useState, Suspense } from "react";
import dynamic from "next/dynamic";

const ArrivalMap = dynamic(
  () => import("@/components/ArrivalMap").then((mod) => mod.ArrivalMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 w-full min-h-[600px] flex items-center justify-center bg-[#0d1c04]/90 rounded-3xl border border-lime-500/20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-lime-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-lime-300 font-bold tracking-wide text-sm font-mono">
            Memuat Peta Interaktif Resort...
          </span>
        </div>
      </div>
    ),
  }
);

const RundownModal = dynamic(
  () => import("@/components/RundownModal").then((mod) => mod.RundownModal),
  { ssr: false }
);

function PresentationContent() {
  const [isRundownModalOpen, setIsRundownModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#1c3307] via-[#122304] to-[#0a1502] text-slate-100 transition-colors">
      {/* Main Presentation Stage */}
      <main className="flex-1 w-full p-2 sm:p-3 flex flex-col">
        {/* Printable Header for PDF Export */}
        <div className="hidden print-only mb-6 text-center border-b pb-4">
          <h1 className="text-2xl font-bold font-serif text-gray-900">
            THE HIGHLAND PARK RESORT - HOTEL BOGOR
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Presentasi Rencana Kegiatan & Simulasi Kedatangan Tamu VIP (Famgath Pusziad)
          </p>
        </div>

        {/* Focused Arrival Map & Timeline Simulation */}
        <ArrivalMap onOpenRundownModal={() => setIsRundownModalOpen(true)} />
      </main>

      {/* Rencana Kegiatan (Rundown) Modal Poster */}
      <RundownModal
        isOpen={isRundownModalOpen}
        onClose={() => setIsRundownModalOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-lime-400 font-bold">Memuat Presentasi Resort...</div>}>
      <PresentationContent />
    </Suspense>
  );
}
