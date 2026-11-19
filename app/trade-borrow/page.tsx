import React from 'react';
import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { getTradeBorrowRequestsAction } from '@/app/actions/trade-borrow';
import TradeBorrowFeed from '@/components/TradeBorrowFeed';
import { ShieldCheck, Handshake, Repeat, Clock } from 'lucide-react';

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
        {/* University-Branded Hero Section */}
        <div className="bg-gradient-to-r from-[#062a6e] to-[#041b4d] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#dbe4ff] text-[12px] font-medium backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff9aa9]" />
              <span>Bennett Campus Exchange & Borrowing</span>
            </div>
            <h1 className="text-[26px] sm:text-[34px] font-extrabold tracking-tight text-white leading-tight">
              Trade & Borrow on Campus
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#dbe4ff] leading-relaxed">
              Need a scientific calculator for midterms, a lab coat for chemistry practicals, or a
              bicycle for a grocery run? Post a request or offer items to trade with fellow Bennett
              University students for a flexible duration.
            </p>
            <div className="flex items-center gap-4 pt-1 text-xs text-[#dbe4ff]/90 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Handshake className="w-4 h-4 text-[#ff9aa9]" />
                <span>Short & long-term borrows</span>
              </div>
              <span className="opacity-40">•</span>
              <div className="flex items-center gap-1.5">
                <Repeat className="w-4 h-4 text-[#ff9aa9]" />
                <span>Item-for-item trades</span>
              </div>
              <span className="opacity-40">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#ff9aa9]" />
                <span>Clear duration timeframes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Component */}
        <TradeBorrowFeed
          initialRequests={initialRequests}
          currentUser={currentUser}
        />
      </div>
    </main>
  );
}
