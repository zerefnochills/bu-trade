'use client';

// ============================================================================
// BU Trade — Multi-Image Product Gallery Component
// ============================================================================

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface ImageGalleryProps {
  images?: string[];
  title: string;
  category: string;
}

export default function ImageGallery({ images = [], title, category }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const validImages = Array.isArray(images)
    ? images.filter((img) => typeof img === 'string' && img.trim().length > 0)
    : [];

  const hasImages = validImages.length > 0;
  const currentImage = hasImages ? validImages[selectedIndex] : null;
  const categoryEmoji = CATEGORY_EMOJI_MAP[category] || '🏷️';

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full space-y-3">
      {/* Primary Display Frame */}
      <div className="aspect-[4/3] bg-gradient-to-br from-[#f3f5fa] to-[#e1e6f0] rounded-2xl border border-[#e1e6f0] overflow-hidden relative flex items-center justify-center shadow-sm">
        {hasImages && currentImage ? (
          <img
            src={currentImage}
            alt={`${title} - Photo ${selectedIndex + 1}`}
            className="w-full h-full object-cover select-none"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <span className="text-6xl sm:text-7xl mb-2 select-none">{categoryEmoji}</span>
            <span className="text-[13px] font-semibold text-[#062a6e] bg-white/80 px-3 py-1 rounded-full border border-[#e1e6f0]">
              {category}
            </span>
          </div>
        )}

        {/* Counter Badge if multiple images */}
        {validImages.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {selectedIndex + 1} / {validImages.length}
          </span>
        )}

        {/* Chevron Controls */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#14203b] flex items-center justify-center shadow-md transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#14203b] flex items-center justify-center shadow-md transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                selectedIndex === idx
                  ? 'border-[#062a6e] ring-2 ring-[#062a6e]/20 scale-102'
                  : 'border-[#e1e6f0] opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
