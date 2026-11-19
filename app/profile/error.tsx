'use client';

// ============================================================================
// BU Trade — Profile Section Error Boundary
// Catches unexpected errors in /profile and provides a retry mechanism
// ============================================================================

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ProfileErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProfileError({ error, reset }: ProfileErrorProps) {
  useEffect(() => {
    // Log unexpected errors for observability
    console.error('Profile Error Boundary caught error:', error);
  }, [error]);

  return (
    <div className="w-full bg-white min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#e1e6f0] p-6 sm:p-8 shadow-sm text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#c8102e]/10 text-[#c8102e] flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-extrabold text-[#062a6e] tracking-tight">
          Unable to Load Listings
        </h2>

        <p className="text-[13.5px] text-[#5a6580] mt-2 leading-relaxed">
          {error?.message ||
            'Something went wrong while loading your campus profile and listings. Please try again.'}
        </p>

        {error?.digest && (
          <p className="text-[11px] font-mono text-gray-400 mt-2 bg-[#f3f5fa] py-1 px-2 rounded inline-block">
            Digest: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold text-[13px] shadow-sm transition-all active:scale-98"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#e1e6f0] hover:bg-[#f3f5fa] text-[#14203b] font-medium text-[13px] transition-colors"
          >
            <Home className="w-4 h-4 text-[#5a6580]" />
            <span>Campus Feed</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
