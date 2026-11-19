import React from 'react';
import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { getTradeBorrowRequestsAction } from '@/app/actions/trade-borrow';
import TradeBorrowFeed from '@/components/TradeBorrowFeed';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trade & Borrow Requests | BU Trade',
  description: 'Borrow or trade items with fellow Bennett University students for short or semester-long durations.',
};

export default async function TradeBorrowPage() {
  const session = await getSession();
  const initialRequests = await getTradeBorrowRequestsAction();

  const currentUser = session
    ? {
        id: session.userId,
        email: session.email,
      }
    : null;

  return (
    <main className="min-h-screen bg-[#f8fafc] py-6 sm:py-8">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 space-y-6">
        {/* Clean & Minimal Hero Section */}
        <div className="bg-gradient-to-r from-[#062a6e] to-[#041b4d] rounded-2xl p-5 sm:p-7 text-white shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#dbe4ff] text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff9aa9]" />
              <span>Campus Exchange</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Trade & Borrow
            </h1>
            <p className="text-xs sm:text-sm text-[#dbe4ff]">
              Request or offer items to trade and borrow on campus for any duration.
            </p>
          </div>
        </div>

        {/* Trade/Borrow Requests Interactive Client Feed */}
        <TradeBorrowFeed
          initialRequests={initialRequests}
          currentUser={currentUser}
        />
      </div>
    </main>
  );
}
