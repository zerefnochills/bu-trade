'use client';

// ============================================================================
// BU Trade — Client Home Feed & Discovery Coordinator
// Clean & Minimal Campus Discovery
// ============================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, PlusCircle, PackageSearch, ShieldCheck, X } from 'lucide-react';
import { Listing } from '@/lib/db/types';
import CategoryChips from './CategoryChips';
import SearchAndSort, { SortOption } from './SearchAndSort';
import ListingCard from './ListingCard';

interface HomeFeedProps {
  initialListings: Listing[];
}

export default function HomeFeed({ initialListings }: HomeFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Compute filtered & sorted listings in real time
  const filteredListings = useMemo(() => {
    let result = initialListings.filter((item) => item.status === 'active');

    // 1. Category Filter
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // 2. Search Query Filter across title, description, and category
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    if (sortBy === 'price_asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [initialListings, selectedCategory, searchQuery, sortBy]);

  const handleHeroSearchClick = () => {
    const el = document.getElementById('listings-feed');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('newest');
  };

  return (
    <div className="w-full bg-white pb-16">
      {/* Hero Banner Section — Clean & Minimal */}
      <section className="bg-[#f8fafc] border-b border-[#e1e6f0] py-7 sm:py-11 px-4">
        <div className="max-w-[1160px] mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-black text-[#062a6e] tracking-tight max-w-2xl mx-auto mb-2">
            Bennett Campus <span className="text-[#c8102e]">Marketplace</span>
          </h1>

          <p className="text-[#5a6580] text-[13.5px] sm:text-[15.5px] max-w-lg mx-auto mb-5 font-medium">
            Verified students only · 0% fees · Safe campus trades
          </p>

          {/* Clean Search Bar */}
          <div className="max-w-xl mx-auto flex items-center gap-2 p-2 rounded-2xl bg-white border border-[#e1e6f0] shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6580]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleHeroSearchClick();
                }}
                placeholder="Search items, notes, cycles..."
                className="w-full pl-10 pr-3 py-2 bg-transparent text-[15px] sm:text-[16px] text-[#14203b] placeholder-[#5a6580]/60 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleHeroSearchClick}
              className="px-5 py-2.5 rounded-xl bg-[#062a6e] hover:bg-[#041b4d] text-white font-bold text-[13.5px] sm:text-[14px] transition-colors shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Main Discovery Feed Section */}
      <section id="listings-feed" className="max-w-[1160px] mx-auto px-3.5 sm:px-4 pt-6 sm:pt-8">
        {/* Category Filter Chips */}
        <div className="mb-3">
          <CategoryChips
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Search & Sort Controls */}
        <SearchAndSort
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCount={filteredListings.length}
        />

        {/* Active Filters Pill Bar */}
        {(searchQuery.trim() !== '' || selectedCategory !== 'All') && (
          <div className="flex items-center gap-2 mb-3.5 flex-wrap text-[13px] sm:text-[14px]">
            <span className="text-[#5a6580] font-medium">Active filters:</span>
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f3f5fa] text-[#062a6e] font-semibold border border-[#e1e6f0] hover:bg-[#e1e6f0] active:scale-95 transition-all"
              >
                <span>{selectedCategory}</span>
                <X className="w-3 h-3 text-[#5a6580]" />
              </button>
            )}
            {searchQuery.trim() !== '' && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f3f5fa] text-[#062a6e] font-semibold border border-[#e1e6f0] hover:bg-[#e1e6f0] active:scale-95 transition-all"
              >
                <span>&ldquo;{searchQuery}&rdquo;</span>
                <X className="w-3 h-3 text-[#5a6580]" />
              </button>
            )}
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-[#c8102e] hover:underline font-semibold ml-1 text-xs"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Listings Grid: 2 columns on mobile, 3 columns on iPad, 4 columns on desktop */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-14 px-4 bg-[#f8fafc] rounded-2xl border border-dashed border-[#e1e6f0]">
            <PackageSearch className="w-10 h-10 text-[#5a6580] mx-auto mb-2 opacity-50" />
            <h3 className="text-base font-semibold text-[#14203b] mb-1">No items found</h3>
            <p className="text-xs text-[#5a6580] max-w-sm mx-auto mb-4">
              {searchQuery || selectedCategory !== 'All'
                ? `No items match "${searchQuery || selectedCategory}".`
                : 'No active listings currently.'}
            </p>
            <div className="flex items-center justify-center gap-2">
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3.5 py-1.5 rounded-full border border-[#062a6e] text-[#062a6e] hover:bg-[#062a6e] hover:text-white transition-colors text-xs font-semibold"
                >
                  Clear filters
                </button>
              )}
              <Link
                href="/sell"
                className="px-3.5 py-1.5 rounded-full bg-[#c8102e] hover:bg-[#a60d26] text-white transition-colors text-xs font-semibold"
              >
                List an item
              </Link>
            </div>
          </div>
        )}

        {/* Campus Commerce 3 Steps — Clean & Minimal */}
        <div className="mt-14 pt-8 border-t border-[#e1e6f0]">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#062a6e]">
              Campus commerce in 3 simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#f8fafc] p-5 rounded-xl border border-[#e1e6f0] text-center">
              <div className="w-8 h-8 rounded-full bg-[#062a6e] text-white flex items-center justify-center font-bold text-sm mx-auto mb-2.5">
                1
              </div>
              <h3 className="font-bold text-[#14203b] text-[15px] sm:text-[16px] mb-1.5 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#062a6e]" />
                BU Email Access
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#5a6580]">
                Verified @bennett.edu.in student exclusivity.
              </p>
            </div>

            <div className="bg-[#f8fafc] p-5 rounded-xl border border-[#e1e6f0] text-center">
              <div className="w-8 h-8 rounded-full bg-[#062a6e] text-white flex items-center justify-center font-bold text-sm mx-auto mb-2.5">
                2
              </div>
              <h3 className="font-bold text-[#14203b] text-[15px] sm:text-[16px] mb-1.5">
                Browse & Connect
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#5a6580]">
                Explore campus listings and enquiry instantly.
              </p>
            </div>

            <div className="bg-[#f8fafc] p-5 rounded-xl border border-[#e1e6f0] text-center">
              <div className="w-8 h-8 rounded-full bg-[#062a6e] text-white flex items-center justify-center font-bold text-sm mx-auto mb-2.5">
                3
              </div>
              <h3 className="font-bold text-[#14203b] text-[15px] sm:text-[16px] mb-1.5">
                Meet on Campus
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#5a6580]">
                Meet in public spots on campus and trade directly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
