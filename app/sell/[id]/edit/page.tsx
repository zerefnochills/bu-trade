import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireOnboardedUser } from '@/lib/auth/session';
import { getDatabaseService } from '@/lib/db';
import EditListingForm from './EditListingForm';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface EditPageProps {
  params: {
    id: string;
  };
}

export default async function EditListingPage({ params }: EditPageProps) {
  const user = await requireOnboardedUser(`/sell/${params.id}/edit`);
  const db = getDatabaseService();

  const listing = await db.getListingById(params.id, user.id);
  if (!listing) {
    notFound();
  }

  // Authorization check: owner or moderator
  if (listing.userId !== user.id && !user.profile?.isModerator) {
    return (
      <div className="w-full bg-white min-h-[60vh] py-16 px-4">
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#c8102e]/5 border border-[#c8102e]/30 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-[#c8102e] mx-auto" />
          <h2 className="text-xl font-bold text-[#14203b]">Unauthorized Access</h2>
          <p className="text-[14px] text-[#5a6580]">
            You can only edit listings that you have posted with your verified Bennett account.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex px-5 py-2.5 rounded-full bg-[#062a6e] text-white text-[13px] font-semibold"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeCount = await db.countActiveListings(user.id);

  return (
    <div className="w-full bg-white min-h-[80vh] py-6 sm:py-10 px-3.5 sm:px-4">
      <div className="max-w-[760px] mx-auto">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[12.5px] text-[#5a6580] mb-2">
            <Link href="/" className="hover:text-[#062a6e]">
              Home
            </Link>
            <span>/</span>
            <Link href={`/item/${listing.id}`} className="hover:text-[#062a6e] truncate max-w-[200px]">
              {listing.title}
            </Link>
            <span>/</span>
            <span className="text-[#14203b] font-medium">Edit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#062a6e] tracking-tight">
            Edit Listing
          </h1>
          <p className="text-[#5a6580] text-[14px] mt-1">
            Update pricing, description, photos, or change listing status.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-[#e1e6f0] p-6 sm:p-8 shadow-sm">
          <EditListingForm listing={listing} activeCount={activeCount} />
        </div>
      </div>
    </div>
  );
}
