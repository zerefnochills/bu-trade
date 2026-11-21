'use client';

// ============================================================================
// BU Trade — Modular Listing Card Component
// ============================================================================

import React from 'react';
import Link from 'next/link';
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
import { Listing } from '@/lib/db/types';

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'Books & notes': BookOpen,
  'Electronics': Laptop,
  'Cycles & transport': Bike,
  'Hostel essentials': BedDouble,
  'Furniture': Armchair,
  'Clothing': Shirt,
  'Stationery & lab gear': FlaskConical,
  'Other': Package,
};

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const CategoryIcon = CATEGORY_ICON_MAP[listing.category] || Tag;
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
      <div className="aspect-square sm:aspect-[4/3] bg-gradient-to-br from-[#f3f5fa] to-[#e1e6f0] relative overflow-hidden flex items-center justify-center">
        {hasImage ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-3 sm:p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/80 border border-[#e1e6f0] flex items-center justify-center text-[#062a6e] mb-1 shadow-xs group-hover:scale-105 transition-transform duration-200">
              <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#062a6e]" />
            </div>
            <span className="text-[11px] sm:text-[12px] font-medium text-[#5a6580] truncate max-w-[120px]">{listing.category}</span>
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-white/95 backdrop-blur-sm px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold text-[#062a6e] border border-[#e1e6f0] shadow-sm flex items-center gap-1 sm:gap-1.5 max-w-[85%] truncate">
          <CategoryIcon className="w-3 h-3 text-[#062a6e] shrink-0" />
          <span className="truncate">{listing.category}</span>
        </span>

        {/* Status Overlays */}
        {isSold && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-[#14203b] text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-[13px] font-bold tracking-wide uppercase border border-white/20">
              Sold Out
            </span>
          </div>
        )}
        {isDelisted && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-700 text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-[13px] font-bold uppercase">
              Delisted
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Price in Bennett Red */}
        <div className="text-[17px] sm:text-[20px] font-bold text-[#c8102e] mb-0.5 sm:mb-1">
          {listing.price === 0 ? 'Free' : `₹${listing.price.toLocaleString('en-IN')}`}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[#14203b] text-[13.5px] sm:text-[15px] group-hover:text-[#062a6e] transition-colors line-clamp-1 sm:line-clamp-2 mb-1">
          {listing.title}
        </h3>

        {/* Clamped Description */}
        <p className="text-[12px] sm:text-[13px] text-[#5a6580] line-clamp-1 sm:line-clamp-2 mb-2 sm:mb-3 flex-1">
          {listing.description || 'Verified Bennett University student listing.'}
        </p>

        {/* Card Footer / Seller Metadata */}
        <div className="pt-2 border-t border-[#f3f5fa] flex items-center justify-between text-[11px] sm:text-[12px]">
          <span className="text-[#5a6580] truncate max-w-[100px] sm:max-w-[150px]" title={sellerInfo}>
            {sellerInfo}
          </span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full font-medium text-[10px] sm:text-[11px] shrink-0 ${
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
