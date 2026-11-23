'use client';

// ============================================================================
// BU Trade — Amazon-Style Search & Sort Controls Bar Component
// Includes keyword search, result count, sort dropdown, and Grid/List view toggle
// ============================================================================

import React from 'react';
import { Search, X, ArrowUpDown, LayoutGrid, List } from 'lucide-react';

export type SortOption = 'newest' | 'price_asc' | 'price_desc';

export interface SearchAndSortProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export default function SearchAndSort({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalCount,
  viewMode = 'grid',
  onViewModeChange,
}: SearchAndSortProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 py-2.5 sm:py-3 border-b border-[#e1e6f0] mb-4 sm:mb-6">
      {/* Search Input Bar */}
      <div className="relative flex-1 w-full sm:max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6580]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by title, keywords or category..."
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#e1e6f0] bg-white text-[15px] sm:text-[15.5px] text-[#14203b] placeholder-[#5a6580] focus:outline-none focus:border-[#007185] focus:ring-1 focus:ring-[#007185] transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5a6580] hover:text-[#14203b] transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Item Count, Sort Select & Amazon Grid/List View Switcher */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 text-[13.5px] sm:text-[14.5px] text-[#5a6580]">
        <span className="font-medium whitespace-nowrap">
          <strong className="text-[#062a6e]">{totalCount}</strong> verified item{totalCount === 1 ? '' : 's'}
        </span>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-4 h-4 text-[#5a6580]" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort listings"
            className="bg-white border border-[#e1e6f0] text-[#14203b] rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-semibold focus:outline-none focus:border-[#007185] cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        {/* Amazon-Style View Mode Switcher */}
        {onViewModeChange && (
          <div className="flex items-center border border-[#e1e6f0] rounded-lg overflow-hidden bg-white shrink-0 p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              title="Grid view"
              aria-label="Switch to grid view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#062a6e] text-white shadow-2xs'
                  : 'text-[#5a6580] hover:text-[#14203b] hover:bg-[#f3f5fa]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              title="List view (Amazon style)"
              aria-label="Switch to list view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#062a6e] text-white shadow-2xs'
                  : 'text-[#5a6580] hover:text-[#14203b] hover:bg-[#f3f5fa]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
