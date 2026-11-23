import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDatabaseService } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import ImageGallery from '@/components/ImageGallery';
import EnquiryModal from '@/components/EnquiryModal';
import ReportModal from '@/components/ReportModal';
import ShareButton from '@/components/ShareButton';
import TrackRecentlyViewed from '@/components/TrackRecentlyViewed';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  MapPin,
  Calendar,
  AlertCircle,
  Edit,
  ExternalLink,
  MessageSquare,
  Phone,
  Mail,
  Flag,
  ArrowLeft,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ContactMethod } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

interface ItemPageProps {
  params: {
    id: string;
  };
}

export default async function ItemPage({ params }: ItemPageProps) {
  const session = await getSession();
  const db = getDatabaseService();

  const listing = await db.getListingById(params.id, session?.userId);
  if (!listing) {
    return (
      <div className="w-full bg-white min-h-[60vh] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md text-center p-8 rounded-2xl bg-[#f3f5fa] border border-[#e1e6f0]">
          <AlertCircle className="w-12 h-12 text-[#c8102e] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#062a6e] mb-1">Listing Not Found</h2>
          <p className="text-[14px] text-[#5a6580] mb-6">
            This item may have been removed or the link is incorrect.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white text-[13.5px] font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Campus Marketplace</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = session?.userId ? listing.userId === session.userId : false;
  const isEnquired = Boolean(listing.hasUnlockedContact);
  const sellerInitial = listing.sellerName
    ? listing.sellerName.charAt(0).toUpperCase()
    : 'B';

  const sellerDetails = listing.sellerCourse
    ? `${listing.sellerCourse}${listing.sellerYear ? ` · Year ${listing.sellerYear}` : ''}`
    : 'Verified Bennett Student';

  // Helper for generating external contact links
  const getActionHref = (method: ContactMethod, value: string) => {
    const cleanNumber = value.replace(/[^0-9+]/g, '');
    if (method === 'WhatsApp') {
      const waNumber = cleanNumber.startsWith('+')
        ? cleanNumber.slice(1)
        : cleanNumber.startsWith('91')
        ? cleanNumber
        : `91${cleanNumber}`;
      const msg = encodeURIComponent(`Hi! I enquired about "${listing.title}" on BU Trade. Is it still available?`);
      return `https://wa.me/${waNumber}?text=${msg}`;
    }
    if (method === 'Phone') {
      return `tel:${cleanNumber}`;
    }
    return `mailto:${value}?subject=${encodeURIComponent(`BU Trade: Enquiry for ${listing.title}`)}`;
  };

  return (
    <div className="w-full bg-white min-h-[80vh] py-4 sm:py-8 px-3.5 sm:px-4 pb-28 lg:pb-12">
      <TrackRecentlyViewed
        item={{
          id: listing.id,
          title: listing.title,
          price: listing.price,
          category: listing.category,
          image: listing.images?.[0],
          age: listing.age,
          sellerCourse: listing.sellerCourse,
          sellerYear: listing.sellerYear,
        }}
      />
      <div className="max-w-[1160px] mx-auto">
        {/* Top Header: Breadcrumbs & Share Button */}
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <nav className="flex items-center gap-2 text-[12px] sm:text-[13px] text-[#5a6580] flex-wrap">
            <Link href="/" className="hover:text-[#062a6e] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#5a6580]">{listing.category}</span>
            <span>/</span>
            <span className="text-[#14203b] font-medium truncate max-w-[160px] sm:max-w-[240px]">
              {listing.title}
            </span>
          </nav>

          <ShareButton title={listing.title} />
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* Left Column: Gallery & Campus Safety Card */}
          <div className="lg:col-span-7 space-y-6">
            <ImageGallery
              images={listing.images}
              title={listing.title}
              category={listing.category}
            />

            {/* Bennett Safe Exchange Zone */}
            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e1e6f0]">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 text-[#062a6e] font-bold text-xs sm:text-[13px]">
                  <MapPin className="w-3.5 h-3.5 text-[#c8102e]" />
                  <span>Campus Meetup Spots</span>
                </div>
                <Link
                  href="/rules"
                  className="text-[11px] text-[#062a6e] font-semibold hover:underline"
                >
                  Safety &rarr;
                </Link>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#e1e6f0] text-xs text-[#14203b] font-medium shadow-2xs">
                  ☕ CBC Cafeteria
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#e1e6f0] text-xs text-[#14203b] font-medium shadow-2xs">
                  🏃 Student Center
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#e1e6f0] text-xs text-[#14203b] font-medium shadow-2xs">
                  📚 Library Plaza
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Details, Seller Profile, and 4-State Privacy Contact Card */}
          <div className="lg:col-span-5 space-y-5">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[12px] font-semibold text-[#062a6e] bg-[#f3f5fa] border border-[#e1e6f0]">
                  {listing.category}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                    listing.status === 'active'
                      ? 'bg-[#0a8a4a]/10 text-[#0a8a4a]'
                      : listing.status === 'sold'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {listing.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14203b] tracking-tight leading-snug">
                {listing.title}
              </h1>

              {/* Price */}
              <div className="text-3xl font-extrabold text-[#c8102e] mt-2.5">
                {listing.price === 0 ? 'Free giveaway' : `₹${listing.price.toLocaleString('en-IN')}`}
              </div>
            </div>

            {/* Key Item Attributes */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#f8fafc] border border-[#e1e6f0] text-[13px]">
              <div>
                <span className="text-[#5a6580] block text-[11px] font-semibold uppercase tracking-wider mb-0.5">
                  Age / Condition
                </span>
                <span className="font-semibold text-[#14203b]">{listing.age}</span>
              </div>
              <div>
                <span className="text-[#5a6580] block text-[11px] font-semibold uppercase tracking-wider mb-0.5">
                  Reason for Selling
                </span>
                <span className="font-semibold text-[#14203b]">{listing.reason}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-[#e1e6f0] flex items-center gap-1.5 text-[12px] text-[#5a6580]">
                <Calendar className="w-3.5 h-3.5" />
                <span>Listed on {new Date(listing.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-[12px] font-bold text-[#5a6580] uppercase tracking-wider mb-1.5">
                Description
              </h3>
              <p className="text-[14px] text-[#14203b] whitespace-pre-line leading-relaxed">
                {listing.description || 'Verified Bennett University student listing.'}
              </p>
            </div>

            {/* Seller Profile Card */}
            <div className="p-4 rounded-xl border border-[#e1e6f0] bg-white flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#062a6e] text-white flex items-center justify-center font-bold text-[16px] shadow-sm">
                  {sellerInitial}
                </div>
                <div>
                  <h4 className="font-bold text-[#14203b] text-[15px]">
                    {listing.sellerName || 'Bennett Student'}
                  </h4>
                  <p className="text-[12.5px] text-[#5a6580]">{sellerDetails}</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 bg-[#0a8a4a]/10 text-[#0a8a4a] px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </div>
            </div>

            {/* 4-State Protected Privacy Contact Box */}
            <div className="rounded-2xl border border-[#e1e6f0] overflow-hidden bg-white shadow-sm">
              {/* State 1: Unauthenticated Visitor */}
              {!session?.userId ? (
                <div className="p-5 text-center space-y-3 bg-[#f3f5fa]/80">
                  <div className="w-10 h-10 rounded-full bg-[#062a6e]/10 text-[#062a6e] flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#062a6e] text-[15px]">
                      Seller Contact Protected
                    </h4>
                    <p className="text-[12px] text-[#5a6580] max-w-xs mx-auto mt-0.5">
                      Sign in to view verified seller contact.
                    </p>
                  </div>
                  <div className="pt-1">
                    <Link
                      href={`/login?redirectTo=${encodeURIComponent(`/item/${listing.id}`)}`}
                      className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold text-[13.5px] shadow-sm transition-colors"
                    >
                      Sign in to Enquire
                    </Link>
                  </div>
                </div>
              ) : isOwner ? (
                /* State 2: Listing Owner */
                <div className="p-5 space-y-3 bg-[#f3f5fa]/80">
                  <div className="flex items-center gap-2 text-[#0a8a4a] font-bold text-[14px]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>This is your listing</span>
                  </div>
                  <p className="text-[12.5px] text-[#5a6580]">
                    Your listed contact method: <strong>{listing.contactMethod}</strong> ({listing.contactValue})
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <Link
                      href={`/sell/${listing.id}/edit`}
                      className="flex-1 py-2 px-4 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white text-center font-semibold text-[13px] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Listing</span>
                    </Link>
                    <Link
                      href="/profile"
                      className="flex-1 py-2 px-4 rounded-full border border-[#e1e6f0] bg-white hover:bg-[#f3f5fa] text-[#14203b] text-center font-medium text-[13px] transition-colors"
                    >
                      Manage in My Listings
                    </Link>
                  </div>
                </div>
              ) : isEnquired && listing.contactValue ? (
                /* State 4: Authenticated Student (Enquired & Unlocked) */
                <div className="p-5 space-y-3 bg-[#0a8a4a]/5 border-l-4 border-[#0a8a4a]">
                  <div className="flex items-center gap-2 text-[#0a8a4a] font-bold text-[14px]">
                    <Unlock className="w-4 h-4" />
                    <span>Seller Contact Unlocked</span>
                  </div>
                  <div className="text-[18px] font-bold text-[#062a6e]">
                    {listing.contactValue}
                  </div>
                  <p className="text-[12px] text-[#5a6580]">
                    Method: <strong>{listing.contactMethod}</strong>
                  </p>
                  <a
                    href={getActionHref(listing.contactMethod, listing.contactValue)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold text-[13.5px] shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {listing.contactMethod === 'WhatsApp' ? (
                      <MessageSquare className="w-4 h-4 text-[#ff9aa9]" />
                    ) : listing.contactMethod === 'Phone' ? (
                      <Phone className="w-4 h-4 text-[#ff9aa9]" />
                    ) : (
                      <Mail className="w-4 h-4 text-[#ff9aa9]" />
                    )}
                    <span>Connect via {listing.contactMethod}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                </div>
              ) : (
                /* State 3: Authenticated Student (Not yet enquired) */
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[#062a6e] font-bold text-[14px]">
                    <Lock className="w-4 h-4" />
                    <span>Contact details protected</span>
                  </div>
                  <p className="text-[12px] text-[#5a6580]">
                    Enquire to reveal {listing.sellerName || 'the seller'}&apos;s verified {listing.contactMethod} contact.
                  </p>
                  <EnquiryModal
                    listingId={listing.id}
                    listingTitle={listing.title}
                    sellerName={listing.sellerName}
                    currentUser={session}
                  />
                </div>
              )}
            </div>

            {/* Moderation / Report Listing trigger */}
            <div className="pt-2 flex items-center justify-between text-[12px] text-[#5a6580]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0a8a4a]" />
                Zero commission platform
              </span>

              <ReportModal
                listingId={listing.id}
                listingTitle={listing.title}
                currentUser={session}
                trigger={
                  <button
                    type="button"
                    className="text-[#5a6580] hover:text-[#c8102e] transition-colors flex items-center gap-1"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report listing</span>
                  </button>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Sticky Bottom Quick Action Bar on Android & Mobile phones */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#e1e6f0] px-4 py-2.5 shadow-[0_-4px_16px_rgba(6,42,110,0.08)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#5a6580] block">Price</span>
          <span className="text-lg font-black text-[#c8102e]">
            {listing.price === 0 ? 'Free' : `₹ ${listing.price.toLocaleString('en-IN')}`}
          </span>
        </div>

        <div className="flex-1 max-w-[220px]">
          {!session?.userId ? (
            <Link
              href={`/login?redirectTo=${encodeURIComponent(`/item/${listing.id}`)}`}
              className="w-full py-2 px-3.5 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold text-xs text-center block shadow-sm active:scale-95 transition-all"
            >
              Login to Enquire
            </Link>
          ) : isOwner ? (
            <Link
              href={`/sell/${listing.id}/edit`}
              className="w-full py-2 px-3.5 rounded-full bg-[#062a6e] text-white font-semibold text-xs text-center block shadow-sm active:scale-95 transition-all"
            >
              Edit Item
            </Link>
          ) : isEnquired && listing.contactValue ? (
            <a
              href={getActionHref(listing.contactMethod, listing.contactValue)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3.5 rounded-full bg-[#062a6e] text-white font-semibold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#ff9aa9]" />
              <span>Open {listing.contactMethod}</span>
            </a>
          ) : (
            <EnquiryModal
              listingId={listing.id}
              listingTitle={listing.title}
              sellerName={listing.sellerName}
              currentUser={session}
              trigger={
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-full bg-[#c8102e] hover:bg-[#a60d26] text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enquire Now</span>
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
