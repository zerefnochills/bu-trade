'use client';

// ============================================================================
// BU Trade — Modular Listing Card Component
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Listing } from '@/lib/db/types';

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  'Books & notes': '📚',
  'Electronics': '💻',
  'Cycles & transport': '🚲',
  'Hostel essentials': '🛏️',
  'Furniture': '🪑',
  'Clothing': '👕',
  'Stationery & lab gear': '🧪',
  'Other': '📦',
};

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const emoji = CATEGORY_EMOJI_MAP[listing.category] || '🏷️';
  const hasImage = Array.isArray(listing.images) && listing.images.length > 0 && !!listing.images[0];
  const isSold = listing.status === 'sold';
  const isDelisted = listing.status === 'delisted';

  const sellerInfo = listing.sellerCourse
    ? `${listing.sellerCourse}${listing.sellerYear ? ` · Y${listing.sellerYear}` : ''}`
    : 'Bennett Student';

  return (
    <Link
      href={`/item/${listing.id}`}
      className="group bg-white rounded-xl border border-[#e1e6f0] overflow-hidden shadow-sm hover:shadow-[0_14px_30px_rgba(6,42,110,0.12)] hover:-translate-y-1 transition-all duration-200 flex flex-col h-full"
    >
      {/* Image Preview Area */}
      <div className="aspect-[4/3] bg-gradient-to-br from-[#f3f5fa] to-[#e1e6f0] relative overflow-hidden flex items-center justify-center">
        {hasImage ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <span className="text-5xl select-none mb-1 group-hover:scale-110 transition-transform duration-200">
              {emoji}
            </span>
            <span className="text-[12px] font-medium text-[#5a6580]">{listing.category}</span>
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#062a6e] border border-[#e1e6f0] shadow-sm">
          {emoji} {listing.category}
        </span>

        {/* Status Overlays */}
        {isSold && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-[#14203b] text-white px-3 py-1 rounded-full text-[13px] font-bold tracking-wide uppercase border border-white/20">
              Sold Out
            </span>
          </div>
        )}
        {isDelisted && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-[13px] font-bold uppercase">
              Delisted
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Price in Bennett Red */}
        <div className="text-[20px] font-bold text-[#c8102e] mb-1">
          {listing.price === 0 ? 'Free' : `₹${listing.price.toLocaleString('en-IN')}`}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[#14203b] text-[15px] group-hover:text-[#062a6e] transition-colors line-clamp-1 mb-1">
          {listing.title}
        </h3>

        {/* Clamped Description */}
        <p className="text-[13px] text-[#5a6580] line-clamp-2 mb-3 flex-1">
          {listing.description || 'Verified Bennett University student listing.'}
        </p>

        {/* Card Footer / Seller Metadata */}
        <div className="pt-2 border-t border-[#f3f5fa] flex items-center justify-between text-[12px]">
          <span className="text-[#5a6580] truncate max-w-[150px]" title={sellerInfo}>
            {sellerInfo}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${
              isSold
                ? 'text-gray-600 bg-gray-100'
                : isDelisted
                ? 'text-amber-700 bg-amber-50'
                : 'text-[#0a8a4a] bg-[#0a8a4a]/10'
            }`}
          >
            {isSold ? 'Sold' : isDelisted ? 'Delisted' : 'Active'}
          </span>
        </div>
      </div>
    </Link>
  );
}
