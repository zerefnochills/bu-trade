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
      className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none py-1"
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
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-150 flex items-center gap-1.5 border shrink-0 ${
              isSelected
                ? 'bg-[#062a6e] text-white border-[#062a6e] shadow-sm font-semibold'
                : 'bg-white text-[#14203b] border-[#e1e6f0] hover:bg-[#f3f5fa] hover:border-[#062a6e]/30'
            }`}
          >
            <IconComp className="w-3.5 h-3.5 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
