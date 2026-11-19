import React from 'react';
import Link from 'next/link';
import { requireOnboardedUser } from '@/lib/auth/session';
import { getDatabaseService } from '@/lib/db';
import SellListingForm from './SellListingForm';
import { ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SellPage() {
  const user = await requireOnboardedUser('/sell');
  const db = getDatabaseService();
  const activeCount = await db.countActiveListings(user.id);
  const isCapReached = activeCount >= 10;

  return (
    <div className="w-full bg-white min-h-[80vh] py-10 px-4">
      <div className="max-w-[760px] mx-auto">
        {/* Header Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[12.5px] text-[#5a6580] mb-2">
            <Link href="/" className="hover:text-[#062a6e]">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#14203b] font-medium">Sell an item</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#062a6e] tracking-tight">
            List an item on BU Trade
          </h1>
          <p className="text-[#5a6580] text-[14px] mt-1">
            Free to list for Bennett students. Active listings: <strong>{activeCount} / 10</strong>.
          </p>
        </div>

        {/* 10 Active Listing Limit Alert Banner if >= 10 */}
        {isCapReached ? (
          <div className="p-6 rounded-2xl bg-[#c8102e]/5 border border-[#c8102e]/30 text-center space-y-4 my-8">
            <div className="w-12 h-12 rounded-full bg-[#c8102e]/10 text-[#c8102e] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#14203b]">
                Active Listing Limit Reached (10 / 10)
              </h2>
              <p className="text-[14px] text-[#5a6580] max-w-md mx-auto mt-1">
                To maintain a high-quality campus marketplace, each Bennett student can have at most 10 active listings at a time.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold text-[13.5px] shadow-sm transition-colors"
              >
                <span>Manage My Listings (Mark Sold or Delist)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e1e6f0] p-6 sm:p-8 shadow-sm">
            <SellListingForm user={user} activeCount={activeCount} />
          </div>
        )}

        {/* Campus Trade Policy Note */}
        <div className="mt-8 p-4 rounded-xl bg-[#f3f5fa] border border-[#e1e6f0] text-[12.5px] text-[#5a6580] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#062a6e] shrink-0 mt-0.5" />
          <p>
            <strong>Campus Safety Reminder:</strong> Prohibited items (weapons, contraband, alcoholic beverages, hazardous chemicals) are strictly monitored. All trades must be conducted on Bennett University premises in public areas. Read our{' '}
            <Link href="/rules" className="text-[#062a6e] underline font-medium">
              Safety Rules
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
