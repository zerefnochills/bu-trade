import React from 'react';

export default function Loading() {
  return (
    <div className="w-full bg-white min-h-[60vh] py-12 px-4">
      <div className="max-w-[1160px] mx-auto animate-pulse">
        {/* Hero Skeleton */}
        <div className="h-44 bg-[#f3f5fa] rounded-2xl mb-8 flex flex-col items-center justify-center p-6">
          <div className="h-6 w-48 bg-[#e1e6f0] rounded-full mb-4" />
          <div className="h-10 w-96 max-w-full bg-[#e1e6f0] rounded-lg mb-3" />
          <div className="h-4 w-72 max-w-full bg-[#e1e6f0] rounded-md" />
        </div>

        {/* Chips Skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-28 bg-[#f3f5fa] rounded-full shrink-0" />
          ))}
        </div>

        {/* Search Bar Skeleton */}
        <div className="h-12 w-full bg-[#f3f5fa] rounded-xl mb-8" />

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border border-[#e1e6f0] rounded-xl overflow-hidden">
              <div className="aspect-[4/3] bg-[#f3f5fa]" />
              <div className="p-4 space-y-3">
                <div className="h-6 w-20 bg-[#f3f5fa] rounded" />
                <div className="h-5 w-full bg-[#f3f5fa] rounded" />
                <div className="h-4 w-3/4 bg-[#f3f5fa] rounded" />
                <div className="h-4 w-1/2 bg-[#f3f5fa] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
