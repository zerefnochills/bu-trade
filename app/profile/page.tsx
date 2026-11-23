import React from 'react';
import Link from 'next/link';
import { requireOnboardedUser } from '@/lib/auth/session';
import { getDatabaseService } from '@/lib/db';
import { Listing } from '@/lib/db/types';
import ProfileDashboard from './ProfileDashboard';
import {
  GraduationCap,
  Building,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await requireOnboardedUser('/profile');
  const db = getDatabaseService();

  let listings: Listing[] = [];
  try {
    const fetched = await db.getListings({ userId: user.id, viewerId: user.id });
    listings = Array.isArray(fetched) ? fetched : [];
  } catch (err) {
    console.error('Failed to load user listings in ProfilePage:', err);
    listings = [];
  }

  const initial = (user.profile?.fullName || user.email || 'U').trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="w-full bg-white min-h-[85vh] py-6 sm:py-10 px-3.5 sm:px-4">
      <div className="max-w-[1160px] mx-auto space-y-6 sm:space-y-8">
        {/* Student Profile Summary Header Card */}
        <div className="bg-gradient-to-r from-[#f3f5fa] via-white to-[#f3f5fa] rounded-2xl border border-[#e1e6f0] p-4 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Avatar Initial Circle */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#062a6e] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-md border-2 border-white">
                {initial}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#062a6e] tracking-tight">
                    {user.profile?.fullName || user.email}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-[#0a8a4a]/10 text-[#0a8a4a] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Bennett Verified</span>
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-1.5 text-[13.5px] text-[#5a6580] mt-1">
                  <Mail className="w-4 h-4 text-[#062a6e]" />
                  <span>{user.email}</span>
                </div>

                {/* Academic Metadata Chips */}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[12px] text-[#14203b]">
                  {user.profile?.course && (
                    <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#e1e6f0]">
                      <GraduationCap className="w-3.5 h-3.5 text-[#062a6e]" />
                      <span>{user.profile.course}</span>
                    </span>
                  )}

                  {user.profile?.year && (
                    <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#e1e6f0]">
                      <Calendar className="w-3.5 h-3.5 text-[#062a6e]" />
                      <span>Year {user.profile.year}</span>
                    </span>
                  )}

                  {user.profile?.residence && (
                    <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#e1e6f0]">
                      <Building className="w-3.5 h-3.5 text-[#062a6e]" />
                      <span>{user.profile.residence}</span>
                    </span>
                  )}

                  {user.profile?.whatsapp && (
                    <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#e1e6f0]">
                      <Phone className="w-3.5 h-3.5 text-[#0a8a4a]" />
                      <span>{user.profile.whatsapp}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Platform Trust Tag */}
            <div className="text-left sm:text-right text-[12px] text-[#5a6580] bg-white px-3 py-2 rounded-xl border border-[#e1e6f0] shrink-0">
              <span className="font-semibold text-[#062a6e] block">Student Account</span>
              <span>Bennett Verified</span>
            </div>
          </div>
        </div>

        {/* Listings Lifecycle Management Dashboard */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#062a6e]">My Listings</h2>
            <p className="text-[12.5px] text-[#5a6580]">
              Manage your active, sold, and delisted items.
            </p>
          </div>

          <ProfileDashboard profile={user.profile} initialListings={listings || []} />
        </div>
      </div>
    </div>
  );
}
