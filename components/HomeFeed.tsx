'use client';

// ============================================================================
// BU Trade — Client Home Feed & Discovery Coordinator
// ============================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, PlusCircle, PackageSearch, ShieldCheck, Tag, Users, Sparkles } from 'lucide-react';
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

  // Compute active count from initial listings
  const totalActiveInitial = useMemo(() => {
    return initialListings.filter((l) => l.status === 'active').length;
  }, [initialListings]);

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
      // Default: newest first by createdAt
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
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-[#f3f5fa] to-white border-b border-[#e1e6f0] py-12 sm:py-16 px-4">
        <div className="max-w-[1160px] mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#e1e6f0] shadow-sm mb-5 text-[13px] text-[#062a6e] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#0a8a4a] animate-pulse" />
            Bennett University Verified Student Marketplace
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#062a6e] tracking-tight leading-tight max-w-3xl mx-auto mb-4">
            Buy & sell on campus with students you <span className="text-[#c8102e]">trust</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-[#5a6580] text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Notes, electronics, hostel gear, cycles, and more. Restricted to verified @bennett.edu.in students. Zero fees.
          </p>

          {/* Live Hero Search Bar */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#e1e6f0] shadow-[0_8px_24px_rgba(6,42,110,0.08)] mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a6580]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleHeroSearchClick();
                }}
                placeholder="Search notes, cycles, kettles, electronics..."
                className="w-full pl-12 pr-4 py-3 bg-transparent text-[15px] text-[#14203b] placeholder-[#5a6580] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleHeroSearchClick}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold text-[14px] shadow-sm transition-colors"
              >
                Search
              </button>
              <Link
                href="/sell"
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-[#c8102e] hover:bg-[#a60d26] text-white font-semibold text-[14px] shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Sell</span>
              </Link>
            </div>
          </div>

          {/* Floating Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4 text-left">
            <div className="bg-white/80 p-3 rounded-xl border border-[#e1e6f0] shadow-xs">
              <div className="text-[20px] font-bold text-[#062a6e]">{totalActiveInitial}</div>
              <div className="text-[12px] text-[#5a6580] font-medium">Items listed</div>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-[#e1e6f0] shadow-xs">
              <div className="text-[20px] font-bold text-[#062a6e]">8</div>
              <div className="text-[12px] text-[#5a6580] font-medium">Categories</div>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-[#e1e6f0] shadow-xs">
              <div className="text-[20px] font-bold text-[#062a6e]">₹0</div>
              <div className="text-[12px] text-[#5a6580] font-medium">Platform fees</div>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-[#e1e6f0] shadow-xs">
              <div className="text-[20px] font-bold text-[#062a6e]">10 max</div>
              <div className="text-[12px] text-[#5a6580] font-medium">Active per student</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Discovery Feed Section */}
      <section id="listings-feed" className="max-w-[1160px] mx-auto px-4 pt-10">
        {/* Category Filter Chips */}
        <div className="mb-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-[#f3f5fa]/60 rounded-2xl border border-dashed border-[#e1e6f0]">
            <PackageSearch className="w-12 h-12 text-[#5a6580] mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-[#14203b] mb-1">No items found</h3>
            <p className="text-[14px] text-[#5a6580] max-w-md mx-auto mb-5">
              {searchQuery || selectedCategory !== 'All'
                ? `No active items match "${searchQuery || selectedCategory}". Try adjusting your query or category filter.`
                : 'There are currently no active listings available on the campus feed.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-full border border-[#062a6e] text-[#062a6e] hover:bg-[#062a6e] hover:text-white transition-colors text-[13px] font-semibold"
                >
                  Clear filters
                </button>
              )}
              <Link
                href="/sell"
                className="px-4 py-2 rounded-full bg-[#c8102e] hover:bg-[#a60d26] text-white transition-colors text-[13px] font-semibold"
              >
                Be the first to list one
              </Link>
            </div>
          </div>
        )}

        {/* How BU Trade Works (Educational 3-step section from prototype) */}
        <div className="mt-20 pt-12 border-t border-[#e1e6f0]">
          <div className="text-center mb-10">
            <span className="text-[12px] font-bold tracking-wider text-[#c8102e] uppercase">
              How BU Trade Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#062a6e] mt-1">
              Campus commerce in 3 simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#f3f5fa] p-6 rounded-2xl border border-[#e1e6f0] flex flex-col">
              <div className="w-10 h-10 rounded-full bg-[#062a6e] text-white flex items-center justify-center font-bold text-[16px] mb-4">
                1
              </div>
              <h3 className="font-bold text-[#14203b] text-[16px] mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#062a6e]" />
                Sign in with BU email
              </h3>
              <p className="text-[13.5px] text-[#5a6580] leading-relaxed">
                Only students with an active @bennett.edu.in address can sign in. Outside visitors cannot view seller contact details or message you.
              </p>
            </div>

            <div className="bg-[#f3f5fa] p-6 rounded-2xl border border-[#e1e6f0] flex flex-col">
              <div className="w-10 h-10 rounded-full bg-[#062a6e] text-white flex items-center justify-center font-bold text-[16px] mb-4">
                2
              </div>
              <h3 className="font-bold text-[#14203b] text-[16px] mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#062a6e]" />
                List or browse items
              </h3>
              <p className="text-[13.5px] text-[#5a6580] leading-relaxed">
                Upload up to 5 photos with automatic compression. Set your price and campus contact method. Active listings are capped at 10 items per student.
              </p>
            </div>

            <div className="bg-[#f3f5fa] p-6 rounded-2xl border border-[#e1e6f0] flex flex-col">
              <div className="w-10 h-10 rounded-full bg-[#062a6e] text-white flex items-center justify-center font-bold text-[16px] mb-4">
                3
              </div>
              <h3 className="font-bold text-[#14203b] text-[16px] mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#062a6e]" />
                Connect and meet safely
              </h3>
              <p className="text-[13.5px] text-[#5a6580] leading-relaxed">
                Enquire to unlock WhatsApp or phone details. Always inspect items in daylight at safe designated campus zones like CBC Cafeteria or the Student Center.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
