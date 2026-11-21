'use client';

// ============================================================================
// BU Trade — TradeBorrowFeed Component (Milestone 4)
// Feed coordinator with segmented type tabs, keyword search, category filters,
// and request creation modal integration.
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Search,
  PlusCircle,
  Handshake,
  Repeat,
  Layers,
  Filter,
  X,
  Sparkles,
  Inbox,
  Check,
} from 'lucide-react';
import {
  BorrowTradeStatus,
  BorrowTradeType,
  CATEGORIES,
  ListingCategory,
  TradeBorrowRequest,
} from '@/lib/db/types';
import TradeBorrowCard from './TradeBorrowCard';
import CreateTradeBorrowModal from './CreateTradeBorrowModal';

export interface TradeBorrowFeedProps {
  initialRequests?: TradeBorrowRequest[];
  currentUser?: { id: string; email?: string } | null;
}

export default function TradeBorrowFeed({
  initialRequests = [],
  currentUser,
}: TradeBorrowFeedProps) {
  const [requests, setRequests] = useState<TradeBorrowRequest[]>(initialRequests);
  const [typeFilter, setTypeFilter] = useState<BorrowTradeType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter requests based on type, category, and search keyword
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Type filter
      if (typeFilter !== 'all' && req.requestType !== typeFilter) {
        return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'All' && req.category !== selectedCategory) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = req.title.toLowerCase().includes(q);
        const matchesDescription = req.description.toLowerCase().includes(q);
        const matchesDuration = req.duration.toLowerCase().includes(q);
        const matchesRequester = req.requesterName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDescription && !matchesDuration && !matchesRequester) {
          return false;
        }
      }

      return true;
    });
  }, [requests, typeFilter, selectedCategory, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setSelectedCategory('All');
  };

  const handleStatusChange = (id: string, newStatus: BorrowTradeStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleDelete = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRequestCreated = (newReq: TradeBorrowRequest) => {
    setRequests((prev) => [newReq, ...prev]);
  };

  const counts = useMemo(() => {
    const borrowCount = requests.filter((r) => r.requestType === 'borrow').length;
    const tradeCount = requests.filter((r) => r.requestType === 'trade').length;
    return {
      all: requests.length,
      borrow: borrowCount,
      trade: tradeCount,
    };
  }, [requests]);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Type Tabs, Search, and Post Button */}
      <div className="bg-white rounded-2xl border border-[#e1e6f0] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Segmented Type Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter by request type"
            className="flex items-center p-1 rounded-xl bg-[#f3f5fa] border border-[#e5e7eb] max-w-full overflow-x-auto touch-scroll"
          >
            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-[#062a6e] shadow-xs'
                  : 'text-[#4b5563] hover:text-[#062a6e]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Requests</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-gray-100 text-gray-700 font-semibold">
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === 'borrow'}
              onClick={() => setTypeFilter('borrow')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'borrow'
                  ? 'bg-white text-[#062a6e] shadow-xs'
                  : 'text-[#4b5563] hover:text-[#062a6e]'
              }`}
            >
              <Handshake className="w-3.5 h-3.5 text-[#062a6e]" />
              <span>Borrow</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-50 text-[#062a6e] font-semibold">
                {counts.borrow}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === 'trade'}
              onClick={() => setTypeFilter('trade')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'trade'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-[#4b5563] hover:text-amber-900'
              }`}
            >
              <Repeat className="w-3.5 h-3.5 text-amber-700" />
              <span>Trade</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-50 text-amber-800 font-semibold">
                {counts.trade}
              </span>
            </button>
          </div>

          {/* Action Row: Search Bar & Post Button */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#ccd5e4] text-xs text-[#1f2937] focus:outline-hidden focus:ring-2 focus:ring-[#062a6e] focus:border-transparent placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Post Request Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#062a6e] hover:bg-[#041b4d] text-white text-xs font-bold shadow-sm transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 text-[#ff9aa9]" />
              <span>+ Post Request</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="pt-2 border-t border-[#f0f2f5] flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-[#062a6e] text-white shadow-2xs'
                : 'bg-[#f3f5fa] text-[#4b5563] hover:bg-[#e5e7eb]'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#062a6e] text-white shadow-2xs'
                  : 'bg-[#f3f5fa] text-[#4b5563] hover:bg-[#e5e7eb]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Feed List */}
      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => (
            <TradeBorrowCard
              key={req.id}
              request={req}
              currentUser={currentUser}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-[#e1e6f0] p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#062a6e] flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8 text-[#062a6e]" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-[#062a6e]">No requests found</h3>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              No borrow or trade requests matched your current filters. Try searching with different
              keywords or clear your active filters.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-xl border border-[#ccd5e4] text-xs font-semibold text-[#062a6e] hover:bg-[#f3f5fa] transition-colors"
            >
              Clear filters
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#062a6e] text-white text-xs font-semibold hover:bg-[#041b4d] transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Request</span>
            </button>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      <CreateTradeBorrowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        onRequestCreated={handleRequestCreated}
      />
    </div>
  );
}
