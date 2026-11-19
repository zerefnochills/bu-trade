'use client';

// ============================================================================
// BU Trade — Profile Dashboard Client Component
// Handles Active, Sold, Delisted tabs and lifecycle actions
// ============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Listing, ListingStatus, Profile } from '@/lib/db/types';
import {
  changeListingStatusAction,
  deleteListingAction,
} from '@/app/actions/listings';
import {
  Package,
  CheckCircle,
  EyeOff,
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface ProfileDashboardProps {
  profile: Profile;
  initialListings?: Listing[];
}

export default function ProfileDashboard({
  profile,
  initialListings = [],
}: ProfileDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'sold' | 'delisted'>('active');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [listingsData, setListingsData] = useState<Listing[]>(
    Array.isArray(initialListings) ? initialListings : []
  );

  useEffect(() => {
    setListingsData(Array.isArray(initialListings) ? initialListings : []);
  }, [initialListings]);

  const safeListings = Array.isArray(listingsData) ? listingsData : [];
  const activeListings = safeListings.filter((l) => l?.status === 'active');
  const soldListings = safeListings.filter((l) => l?.status === 'sold');
  const delistedListings = safeListings.filter((l) => l?.status === 'delisted');

  const activeCount = activeListings.length;
  const isCapReached = activeCount >= 10;

  const currentTabListings =
    activeTab === 'active'
      ? activeListings
      : activeTab === 'sold'
      ? soldListings
      : delistedListings;

  const handleStatusChange = async (id: string, newStatus: ListingStatus) => {
    setStatusError(null);
    setActionLoadingId(id);

    // Save previous snapshot for rollback if server update fails
    const previousListings = [...listingsData];

    // Optimistically update local state for immediate UI feedback
    setListingsData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      const res = await changeListingStatusAction(id, newStatus);
      if (!res.success) {
        setListingsData(previousListings);
        setStatusError(res.error || 'Failed to update listing status.');
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setListingsData(previousListings);
      setStatusError(err?.message || 'Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) {
      return;
    }

    setStatusError(null);
    setActionLoadingId(id);

    // Save previous snapshot for rollback if server update fails
    const previousListings = [...listingsData];

    // Optimistically remove from local state
    setListingsData((prev) => prev.filter((item) => item.id !== id));

    try {
      const res = await deleteListingAction(id);
      if (!res.success) {
        setListingsData(previousListings);
        setStatusError(res.error || 'Failed to delete listing.');
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setListingsData(previousListings);
      setStatusError(err?.message || 'Failed to delete listing.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 10 Active Listings Limit Indicator */}
      <div className="bg-white rounded-2xl border border-[#e1e6f0] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#14203b] text-[15px]">Active Listings Cap</span>
              <span
                className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${
                  isCapReached
                    ? 'bg-[#c8102e]/10 text-[#c8102e]'
                    : 'bg-[#062a6e]/10 text-[#062a6e]'
                }`}
              >
                {activeCount} / 10 active
              </span>
            </div>
            <p className="text-[12.5px] text-[#5a6580] mt-0.5">
              Each student can have up to 10 active listings on campus simultaneously.
            </p>
          </div>

          <Link
            href="/sell"
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-[13px] shadow-sm transition-all shrink-0 ${
              isCapReached
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                : 'bg-[#062a6e] hover:bg-[#041b4d] text-white active:scale-98'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#ff9aa9]" />
            <span>Post New Listing</span>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#f3f5fa] rounded-full overflow-hidden border border-[#e1e6f0]">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isCapReached ? 'bg-[#c8102e]' : 'bg-[#062a6e]'
            }`}
            style={{ width: `${Math.min(100, (activeCount / 10) * 100)}%` }}
          />
        </div>

        {isCapReached && (
          <div className="mt-3 p-3 rounded-xl bg-[#c8102e]/5 border border-[#c8102e]/20 text-[12.5px] text-[#c8102e] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Cap reached (10/10). Mark an existing item as sold or delist it to post or relist another item.
            </span>
          </div>
        )}
      </div>

      {statusError && (
        <div className="p-3.5 rounded-xl bg-[#c8102e]/10 border border-[#c8102e]/20 text-[#c8102e] text-[13px]">
          {statusError}
        </div>
      )}

      {/* Status Tabs Navigation */}
      <div className="border-b border-[#e1e6f0] flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 text-[14px] font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'active'
              ? 'border-[#062a6e] text-[#062a6e]'
              : 'border-transparent text-[#5a6580] hover:text-[#14203b]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Active Listings</span>
          <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#f3f5fa] text-[#14203b]">
            {activeListings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sold')}
          className={`pb-3 px-4 text-[14px] font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'sold'
              ? 'border-[#062a6e] text-[#062a6e]'
              : 'border-transparent text-[#5a6580] hover:text-[#14203b]'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Sold Items</span>
          <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#f3f5fa] text-[#14203b]">
            {soldListings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('delisted')}
          className={`pb-3 px-4 text-[14px] font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'delisted'
              ? 'border-[#062a6e] text-[#062a6e]'
              : 'border-transparent text-[#5a6580] hover:text-[#14203b]'
          }`}
        >
          <EyeOff className="w-4 h-4" />
          <span>Delisted</span>
          <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#f3f5fa] text-[#14203b]">
            {delistedListings.length}
          </span>
        </button>
      </div>

      {/* Tab Listings Grid / List */}
      {currentTabListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentTabListings.map((item) => {
            const isLoading = actionLoadingId === item.id;
            const firstImage = item.images?.[0];
            const hasImage = Boolean(firstImage);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#e1e6f0] p-4 flex flex-col justify-between shadow-xs hover:border-[#062a6e]/40 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl bg-[#f3f5fa] border border-[#e1e6f0] overflow-hidden shrink-0 flex items-center justify-center text-2xl">
                    {hasImage ? (
                      <img
                        src={firstImage}
                        alt={item.title || 'Listing'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>🏷️</span>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#062a6e] bg-[#f3f5fa] px-2 py-0.5 rounded-full border border-[#e1e6f0]">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          item.status === 'active'
                            ? 'text-[#0a8a4a] bg-[#0a8a4a]/10'
                            : item.status === 'sold'
                            ? 'text-gray-600 bg-gray-100'
                            : 'text-amber-700 bg-amber-50'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-[#14203b] text-[15px] truncate mt-1">
                      {item.title}
                    </h4>

                    <div className="text-[16px] font-bold text-[#c8102e] mt-0.5">
                      {item.price === 0 ? 'Free' : `₹${Number(item.price || 0).toLocaleString('en-IN')}`}
                    </div>
                  </div>
                </div>

                {/* Lifecycle Action Buttons */}
                <div className="pt-3 mt-3 border-t border-[#f3f5fa] flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/item/${item.id}`}
                      className="px-3 py-1.5 rounded-lg border border-[#e1e6f0] hover:bg-[#f3f5fa] text-[12px] font-medium text-[#14203b] flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#5a6580]" />
                      <span>View</span>
                    </Link>

                    {item.status !== 'sold' && (
                      <Link
                        href={`/sell/${item.id}/edit`}
                        className="px-3 py-1.5 rounded-lg border border-[#e1e6f0] hover:bg-[#f3f5fa] text-[12px] font-medium text-[#062a6e] flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    )}
                  </div>

                  {/* Status Toggles */}
                  <div className="flex items-center gap-1.5">
                    {item.status === 'active' && (
                      <>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleStatusChange(item.id, 'sold')}
                          className="px-3 py-1.5 rounded-lg bg-[#0a8a4a]/10 hover:bg-[#0a8a4a]/20 text-[#0a8a4a] text-[12px] font-semibold transition-colors flex items-center gap-1"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Mark Sold</span>
                        </button>

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleStatusChange(item.id, 'delisted')}
                          className="px-3 py-1.5 rounded-lg border border-[#e1e6f0] hover:bg-gray-100 text-[#5a6580] text-[12px] font-medium transition-colors"
                        >
                          Delist
                        </button>
                      </>
                    )}

                    {(item.status === 'sold' || item.status === 'delisted') && (
                      <button
                        type="button"
                        disabled={isLoading || isCapReached}
                        onClick={() => handleStatusChange(item.id, 'active')}
                        title={isCapReached ? 'Cap reached (10/10)' : 'Relist item as active'}
                        className="px-3 py-1.5 rounded-lg bg-[#062a6e] hover:bg-[#041b4d] text-white text-[12px] font-semibold transition-colors flex items-center gap-1 disabled:opacity-40"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        <span>Relist</span>
                      </button>
                    )}

                    {item.status === 'delisted' && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-[#c8102e] hover:bg-[#c8102e]/10 transition-colors"
                        title="Delete listing"
                        aria-label="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 px-4 rounded-2xl bg-[#f3f5fa]/60 border border-dashed border-[#e1e6f0] text-center">
          <p className="text-[14px] text-[#5a6580] mb-4">
            No {activeTab} listings found.
          </p>
          {activeTab === 'active' && !isCapReached && (
            <Link
              href="/sell"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white text-[13px] font-semibold"
            >
              <PlusCircle className="w-4 h-4 text-[#ff9aa9]" />
              <span>Post your first listing</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
