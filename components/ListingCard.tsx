'use client';

// ============================================================================
// BU Trade — Amazon-Style Product Listing Card Component
// Features Amazon-inspired layout, star ratings, delivery badges, stock urgency,
// wishlist storage, and support for both Grid & List search result views.
// ============================================================================

import React, { useState, useEffect } from 'react';
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
  Clock,
  Heart,
  Check,
  Star,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Listing } from '@/lib/db/types';
import { toggleSavedItem, isItemSaved, addRecentlyViewed } from '@/lib/storage';

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
  viewMode?: 'grid' | 'list';
}

export default function ListingCard({ listing, viewMode = 'grid' }: ListingCardProps) {
  const CategoryIcon = CATEGORY_ICON_MAP[listing.category] || Tag;
  const hasImage = Array.isArray(listing.images) && listing.images.length > 0 && !!listing.images[0];
  const isSold = listing.status === 'sold';
  const isDelisted = listing.status === 'delisted';

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isItemSaved(listing.id));
  }, [listing.id]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextSaved = toggleSavedItem(listing.id);
    setSaved(nextSaved);
  };

  const handleCardClick = () => {
    addRecentlyViewed({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      category: listing.category,
      image: hasImage ? listing.images[0] : undefined,
      age: listing.age,
      sellerCourse: listing.sellerCourse,
      sellerYear: listing.sellerYear,
    });
  };

  const sellerInfo = listing.sellerCourse
    ? `${listing.sellerCourse}${listing.sellerYear ? ` · Y${listing.sellerYear}` : ''}`
    : 'Bennett Student';

  // Amazon-style horizontal List View card
  if (viewMode === 'list') {
    return (
      <Link
        href={`/item/${listing.id}`}
        onClick={handleCardClick}
        className="group bg-white rounded-2xl border border-[#e1e6f0] hover:border-[#007185] hover:shadow-[0_8px_24px_rgba(6,42,110,0.08)] transition-all duration-200 flex flex-col sm:flex-row overflow-hidden active:scale-[0.99]"
      >
        {/* Left: Thumbnail & Badges */}
        <div className="w-full sm:w-56 md:w-64 h-48 sm:h-auto bg-[#f8fafc] relative overflow-hidden flex items-center justify-center shrink-0 border-b sm:border-b-0 sm:border-r border-[#e1e6f0]">
          {hasImage ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#e1e6f0] flex items-center justify-center text-[#062a6e] mb-1.5 shadow-2xs">
                <CategoryIcon className="w-6 h-6 text-[#062a6e]" />
              </div>
              <span className="text-[12px] font-medium text-[#5a6580]">
                {listing.category}
              </span>
            </div>
          )}

          {/* Condition / Age Badge */}
          {listing.age && (
            <span className="absolute top-2.5 left-2.5 bg-[#14203b]/85 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 shadow-2xs">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{listing.age}</span>
            </span>
          )}

          {/* Amazon Choice Banner */}
          <span className="absolute bottom-2.5 left-2.5 bg-[#232f3e] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-xs">
            <span className="text-[#ffa41c]">★</span> Campus Choice
          </span>

          {/* Save / Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleSave}
            title={saved ? 'Remove from saved' : 'Save for later'}
            aria-label={saved ? 'Saved' : 'Save item'}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#14203b] shadow-sm flex items-center justify-center transition-all hover:scale-110"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                saved ? 'fill-[#c8102e] text-[#c8102e]' : 'text-[#5a6580] hover:text-[#c8102e]'
              }`}
            />
          </button>
        </div>

        {/* Right: Product Details */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
          <div>
            {/* Category & Status */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold text-[#007185] hover:underline uppercase tracking-wider">
                {listing.category}
              </span>
              <span className="text-[#cbd5e1]">·</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10.5px] ${
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

            {/* Title */}
            <h3 className="font-bold text-[#0f1111] text-[16px] sm:text-[18px] group-hover:text-[#007185] transition-colors line-clamp-2 leading-snug mb-1.5">
              {listing.title}
            </h3>

            {/* Amazon Star Rating */}
            <div className="flex items-center gap-1.5 mb-2 text-[12.5px]">
              <div className="flex items-center text-[#de7921]">
                {'★'.repeat(5)}
              </div>
              <span className="font-bold text-[#007185] hover:underline">
                4.9
              </span>
              <span className="text-[#565959] text-[11.5px]">
                (Verified BU Student)
              </span>
            </div>

            {/* Description */}
            <p className="text-[13px] text-[#565959] line-clamp-2 mb-2 leading-relaxed">
              {listing.description || `Reason: ${listing.reason}`}
            </p>
          </div>

          <div className="pt-2 border-t border-[#f0f2f5] flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              {/* Amazon Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-[22px] sm:text-[25px] font-black text-[#0f1111] leading-none">
                  {listing.price === 0 ? 'Free' : `₹${listing.price.toLocaleString('en-IN')}`}
                </span>
                {listing.price > 0 && (
                  <span className="text-[11.5px] text-[#565959]">
                    0% platform fee
                  </span>
                )}
              </div>

              {/* Delivery Promise */}
              <div className="text-[12px] text-[#007185] font-semibold flex items-center gap-1 mt-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>FREE Campus Meetup Today</span>
                <span className="text-[#565959] font-normal text-[11px] hidden sm:inline">· CBC / Student Center</span>
              </div>

              {/* Stock Urgency */}
              <div className="text-[11px] font-semibold text-[#b12704] mt-0.5">
                Only 1 available · Verified student trade
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[12px] text-[#565959] truncate max-w-[150px]" title={sellerInfo}>
                Sold by <strong className="text-[#0f1111]">{sellerInfo}</strong>
              </span>
              <span className="px-4 py-2 rounded-xl bg-[#062a6e] hover:bg-[#007185] text-white text-[13px] font-bold shadow-xs transition-colors shrink-0">
                View Item &rarr;
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Amazon-style Grid View Card (Default)
  return (
    <Link
      href={`/item/${listing.id}`}
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-[#e1e6f0] overflow-hidden shadow-xs hover:shadow-[0_12px_28px_rgba(6,42,110,0.12)] hover:border-[#007185]/60 hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 flex flex-col h-full"
    >
      {/* Image Preview Area */}
      <div className="aspect-square sm:aspect-[4/3] bg-gradient-to-br from-[#f8fafc] to-[#e8edf5] relative overflow-hidden flex items-center justify-center">
        {hasImage ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-3 sm:p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/90 border border-[#e1e6f0] flex items-center justify-center text-[#062a6e] mb-1.5 shadow-xs group-hover:scale-105 transition-transform duration-200">
              <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#062a6e]" />
            </div>
            <span className="text-[11px] sm:text-[12px] font-medium text-[#5a6580] truncate max-w-[120px]">
              {listing.category}
            </span>
          </div>
        )}

        {/* Condition / Age Badge (Top Left) */}
        {listing.age && (
          <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-[#14203b]/85 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] sm:text-[12px] font-medium flex items-center gap-1.5 shadow-xs max-w-[55%] truncate">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate">{listing.age}</span>
          </span>
        )}

        {/* Amazon Choice Banner (Bottom Left on image) */}
        <span className="absolute bottom-2 left-2 bg-[#232f3e]/95 backdrop-blur-xs text-white text-[9.5px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
          <span className="text-[#ffa41c]">★</span> Choice
        </span>

        {/* Save / Wishlist Heart Button (Top Right) */}
        <button
          type="button"
          onClick={handleToggleSave}
          title={saved ? 'Remove from saved' : 'Save for later'}
          aria-label={saved ? 'Saved' : 'Save item'}
          className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#14203b] shadow-xs flex items-center justify-center transition-all hover:scale-110 z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              saved ? 'fill-[#c8102e] text-[#c8102e]' : 'text-[#5a6580] hover:text-[#c8102e]'
            }`}
          />
        </button>

        {/* Status Overlays */}
        {isSold && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-[#14203b] text-white px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-bold tracking-wide uppercase border border-white/20 shadow-md">
              Sold Out
            </span>
          </div>
        )}
        {isDelisted && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-800 text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-[12px] font-bold uppercase">
              Delisted
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body — Amazon Style */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Amazon Category & Status Row */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-bold text-[#007185] hover:underline truncate max-w-[70%]">
            {listing.category}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-[11px] shrink-0 ${
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

        {/* Title — Turns Amazon Link Blue on hover */}
        <h3 className="font-bold text-[#0f1111] text-[15px] sm:text-[16.5px] group-hover:text-[#007185] transition-colors line-clamp-1 sm:line-clamp-2 mb-1 leading-snug">
          {listing.title}
        </h3>

        {/* Amazon Star Rating */}
        <div className="flex items-center gap-1.5 mb-1.5 text-[12px]">
          <div className="flex items-center text-[#de7921] text-xs">
            {'★'.repeat(5)}
          </div>
          <span className="font-bold text-[#007185] text-[11.5px]">
            4.9
          </span>
          <span className="text-[#565959] text-[10.5px]">
            (BU Verified)
          </span>
        </div>

        {/* Amazon Price formatting */}
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-[20px] sm:text-[23px] font-black text-[#0f1111]">
            {listing.price === 0 ? 'Free' : `₹${listing.price.toLocaleString('en-IN')}`}
          </span>
          {listing.price > 0 && (
            <span className="text-[11px] text-[#565959] font-medium">
              0% fee
            </span>
          )}
        </div>

        {/* Amazon Delivery Promise */}
        <div className="text-[11px] sm:text-[11.5px] text-[#007185] font-semibold flex items-center gap-1 mb-1 truncate">
          <Check className="w-3 h-3 stroke-[3] shrink-0" />
          <span className="truncate">FREE Campus Pickup Today</span>
        </div>

        {/* Amazon Stock Urgency */}
        <div className="text-[10.5px] font-medium text-[#b12704] mb-2 truncate">
          Only 1 available · Order soon
        </div>

        {/* Clamped Description */}
        <p className="text-[12px] sm:text-[13px] text-[#565959] line-clamp-1 mb-2.5 flex-1 leading-normal">
          {listing.description || `Reason: ${listing.reason}`}
        </p>

        {/* Card Footer / Seller Metadata */}
        <div className="pt-2 border-t border-[#f0f2f5] flex items-center justify-between text-[11.5px] sm:text-[12.5px] text-[#565959]">
          <span className="truncate font-medium max-w-[130px] sm:max-w-[170px]" title={sellerInfo}>
            {sellerInfo}
          </span>
          <span className="text-[#007185] group-hover:text-[#0066c0] group-hover:underline text-[12px] sm:text-[12.5px] font-bold flex items-center gap-0.5">
            View &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
