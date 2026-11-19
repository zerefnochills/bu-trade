'use client';

// ============================================================================
// BU Trade — Client Home Feed & Discovery Coordinator
// Clean & Minimal Campus Discovery
// ============================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, PlusCircle, PackageSearch, ShieldCheck } from 'lucide-react';
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
      <section className="bg-[#fafbfc] border-b border-[#e1e6f0] py-10 sm:py-14 px-4">
        <div className="max-w-[1160px] mx-auto text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-[#062a6e] tracking-tight max-w-2xl mx-auto mb-2">
            Buy & sell on campus with students you <span className="text-[#c8102e]">trust</span>.
          </h1>

          <p className="text-[#5a6580] text-sm sm:text-base max-w-xl mx-auto mb-6">
            Verified @bennett.edu.in student marketplace. Zero fees.
          </p>

          {/* Clean Search Bar */}
          <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#e1e6f0] shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6580]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleHeroSearchClick();
                }}
                placeholder="Search notes, cycles, kettles, electronics..."
                className="w-full pl-10 pr-3 py-2 bg-transparent text-sm text-[#14203b] placeholder-[#5a6580]/60 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleHeroSearchClick}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold text-xs transition-colors"
              >
                Search
              </button>
              <Link
                href="/sell"
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#c8102e] hover:bg-[#a60d26] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Sell</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Discovery Feed Section */}
      <section id="listings-feed" className="max-w-[1160px] mx-auto px-4 pt-8">
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

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            <h2 className="text-lg font-bold text-[#062a6e]">
              Campus commerce in 3 simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e1e6f0] text-center">
              <div className="w-7 h-7 rounded-full bg-[#062a6e] text-white flex items-center justify-center font-bold text-xs mx-auto mb-2">
                1
              </div>
              <h3 className="font-semibold text-[#14203b] text-sm mb-1 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#062a6e]" />
                BU Email Access
              </h3>
              <p className="text-xs text-[#5a6580]">
                Verified @bennett.edu.in student exclusivity.
              </p>
            </div>

            <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e1e6f0] text-center">
              <div className="w-7 h-7 rounded-full bg-[#062a6e] text-white flex items-center justify-center font-bold text-xs mx-auto mb-2">
                2
              </div>
              <h3 className="font-semibold text-[#14203b] text-sm mb-1">
                Browse & Connect
              </h3>
              <p className="text-xs text-[#5a6580]">
                Explore campus listings and enquiry instantly.
              </p>
            </div>

            <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e1e6f0] text-center">
              <div className="w-7 h-7 rounded-full bg-[#062a6e] text-white flex items-center justify-center font-bold text-xs mx-auto mb-2">
                3
              </div>
              <h3 className="font-semibold text-[#14203b] text-sm mb-1">
                Meet on Campus
              </h3>
              <p className="text-xs text-[#5a6580]">
                Meet in public spots on campus and trade directly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
