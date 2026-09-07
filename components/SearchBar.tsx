"use client";

import React, { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalResults: number;
  totalLocations: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Cari fasilitas berdasarkan nomor atau nama (contoh: camp, 44, mushola)...",
  totalResults,
  totalLocations,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey '/' or 'Ctrl+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || (e.ctrlKey && e.key === "k")) &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full space-y-2">
      <div className="relative flex items-center w-full">
        {/* Search Icon */}
        <div className="absolute left-4 text-zinc-400 dark:text-zinc-500 pointer-events-none">
          <Search className="w-5 h-5 text-gold-500" />
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-24 py-3.5 rounded-2xl bg-white/90 dark:bg-resort-900/90 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200 dark:border-resort-700/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all text-sm sm:text-base backdrop-blur-sm"
        />

        {/* Clear & Shortcut indicator */}
        <div className="absolute right-3.5 flex items-center gap-1.5">
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-resort-800 transition-colors"
              title="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-resort-800 rounded border border-zinc-200 dark:border-resort-700">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Results status */}
      <div className="flex items-center justify-between px-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          {value ? (
            <>
              Menemukan <strong className="text-gold-600 dark:text-gold-400">{totalResults}</strong> dari {totalLocations} fasilitas
            </>
          ) : (
            <>Menampilkan seluruh <strong>{totalLocations}</strong> fasilitas resort</>
          )}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-gold-600 dark:text-gold-400 hover:underline font-medium"
          >
            Reset pencarian
          </button>
        )}
      </div>
    </div>
  );
};
