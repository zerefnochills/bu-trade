import React from 'react';
import Link from 'next/link';
import { getSession, updateSession } from '@/lib/auth/session';
import { getDatabaseService } from '@/lib/db';
import SellListingForm from './SellListingForm';
import { ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SellPage() {
  const session = await getSession();
  const db = getDatabaseService();

  let user: {
    id: string;
    email: string;
    profile: {
      fullName: string;
      whatsapp?: string;
    };
  } | null = null;
  let activeCount = 0;

  if (session) {
    let profile = await db.getProfile(session.userId);
    if (!profile) {
      try {
        const namePart = (session.email || 'student').split('@')[0].replace(/[._-]/g, ' ');
        const fallbackName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        profile = await db.createProfile({
          id: session.userId,
          email: session.email,
          fullName: fallbackName || 'Bennett Student',
          course: 'B.Tech CSE',
          year: 2,
          residence: 'Hostel',
          whatsapp: '',
        });
        await updateSession({ onboardingNeeded: false, isOnboarded: true });
      } catch {
        profile = null;
      }
    }
    if (profile) {
      activeCount = await db.countActiveListings(session.userId);
      user = {
        id: session.userId,
        email: session.email,
        profile: {
          fullName: profile.fullName,
          whatsapp: profile.whatsapp,
        },
      };
    }
  }

  const isCapReached = activeCount >= 10;

  return (
    <div className="w-full bg-white min-h-[80vh] py-8 px-4">
      <div className="max-w-[720px] mx-auto">
        {/* Header Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-[#5a6580] mb-2">
            <Link href="/" className="hover:text-[#062a6e]">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#14203b] font-medium">Sell an item</span>
          </div>
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#062a6e] tracking-tight">
              List an item
            </h1>
            <span className="text-xs text-[#5a6580]">
              Active: <strong className="text-[#14203b]">{activeCount} / 10</strong>
            </span>
          </div>
        </div>

        {/* 10 Active Listing Limit Alert Banner if >= 10 */}
        {isCapReached ? (
          <div className="p-6 rounded-2xl bg-[#c8102e]/5 border border-[#c8102e]/20 text-center space-y-3 my-6">
            <AlertTriangle className="w-6 h-6 text-[#c8102e] mx-auto" />
            <h2 className="text-base font-bold text-[#14203b]">
              Active Listing Limit Reached (10 / 10)
            </h2>
            <p className="text-xs text-[#5a6580] max-w-sm mx-auto">
              Each student can have at most 10 active listings at a time.
            </p>
            <div className="pt-2">
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#062a6e] text-white text-xs font-semibold"
              >
                <span>Manage My Listings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e1e6f0] p-6 sm:p-7 shadow-xs">
            <SellListingForm user={user} activeCount={activeCount} />
          </div>
        )}

        {/* Minimal Campus Safety Note */}
        <div className="mt-6 flex items-center justify-between text-xs text-[#5a6580]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#062a6e]" />
            Verified campus trades only
          </span>
          <Link href="/rules" className="text-[#062a6e] hover:underline">
            Safety rules &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
