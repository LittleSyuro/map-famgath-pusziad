"use client";

import React from "react";
import { LocationItem } from "@/data/locations";
import { Layers } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  locations: LocationItem[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  locations,
}) => {
  // Count items per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    locations.forEach((loc) => {
      counts[loc.category] = (counts[loc.category] || 0) + 1;
    });
    return counts;
  }, [locations]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {/* All Button */}
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
            selectedCategory === null
              ? "bg-gradient-to-r from-resort-900 to-resort-800 text-gold-300 ring-2 ring-gold-500/50 dark:from-gold-600 dark:to-gold-500 dark:text-resort-950"
              : "bg-white/80 dark:bg-resort-900/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-resort-800 border border-zinc-200 dark:border-resort-700/50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Semua Area</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
            {locations.length}
          </span>
        </button>

        {/* Category Chips */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] || 0;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(isSelected ? null : cat)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-sm ${
                isSelected
                  ? "bg-gradient-to-r from-resort-900 to-resort-800 text-gold-300 ring-2 ring-gold-500/50 dark:from-gold-600 dark:to-gold-500 dark:text-resort-950 font-semibold"
                  : "bg-white/80 dark:bg-resort-900/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-resort-800 border border-zinc-200 dark:border-resort-700/50"
              }`}
            >
              <span>{cat}</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
