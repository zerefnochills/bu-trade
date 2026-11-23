'use client';

// ============================================================================
// BU Trade — Category Chips Component
// ============================================================================

import React from 'react';
import {
  Tag,
  BookOpen,
  Laptop,
  Bike,
  BedDouble,
  Armchair,
  Shirt,
  FlaskConical,
  Package,
} from 'lucide-react';

export const CATEGORY_ITEMS = [
  { label: 'All', Icon: Tag },
  { label: 'Books & notes', Icon: BookOpen },
  { label: 'Electronics', Icon: Laptop },
  { label: 'Cycles & transport', Icon: Bike },
  { label: 'Hostel essentials', Icon: BedDouble },
  { label: 'Furniture', Icon: Armchair },
  { label: 'Clothing', Icon: Shirt },
  { label: 'Stationery & lab gear', Icon: FlaskConical },
  { label: 'Other', Icon: Package },
] as const;

export type CategoryLabel = (typeof CATEGORY_ITEMS)[number]['label'];

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryChips({
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  return (
    <div
      className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto touch-scroll pb-2 py-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0"
      role="tablist"
      aria-label="Filter listings by category"
    >
      {CATEGORY_ITEMS.map((item) => {
        const isSelected =
          selectedCategory === item.label ||
          (item.label === 'All' && (!selectedCategory || selectedCategory === 'All'));
        const IconComp = item.Icon;

        return (
          <button
            key={item.label}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectCategory(item.label)}
            className={`whitespace-nowrap px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14.5px] font-semibold transition-all duration-150 flex items-center gap-2 border shrink-0 active:scale-95 ${
              isSelected
                ? 'bg-[#062a6e] text-white border-[#062a6e] shadow-sm font-bold'
                : 'bg-white text-[#14203b] border-[#e1e6f0] hover:bg-[#f3f5fa] hover:border-[#062a6e]/30'
            }`}
          >
            <IconComp className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
