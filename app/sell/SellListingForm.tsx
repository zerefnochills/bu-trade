'use client';

// ============================================================================
// BU Trade — Sell Listing Client Form
// Clean & minimal listing submission with instant student authentication
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, ContactMethod, ListingCategory } from '@/lib/db/types';
import ImageUploader from '@/components/ImageUploader';
import { createListingAction } from '@/app/actions/listings';
import { demoLoginAction } from '@/app/actions/auth';
import { Loader2, PlusCircle, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SellListingFormProps {
  user?: {
    id: string;
    email: string;
    profile: {
      fullName: string;
      whatsapp?: string;
    };
  } | null;
  activeCount: number;
}

export default function SellListingForm({ user, activeCount }: SellListingFormProps) {
  const [currentUser, setCurrentUser] = useState(user || null);
  const [authLoading, setAuthLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<ListingCategory>('Books & notes');
  const [age, setAge] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>(
    currentUser?.profile?.whatsapp ? 'WhatsApp' : 'Email'
  );
  const [contactValue, setContactValue] = useState(
    currentUser?.profile?.whatsapp || currentUser?.email || ''
  );
  const [images, setImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInstantSignIn = async () => {
    setAuthLoading(true);
    setError(null);
    try {
      const res = await demoLoginAction('/sell');
      if (res.success && res.data) {
        setCurrentUser({
          id: res.data.session.userId,
          email: res.data.session.email,
          profile: {
            fullName: 'Bennett Student',
            whatsapp: '+91 98765 43210',
          },
        });
        if (!contactValue) {
          setContactValue('+91 98765 43210');
        }
      } else {
        setError(res.error || 'Failed to sign in.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleContactMethodChange = (newMethod: ContactMethod) => {
    setContactMethod(newMethod);
    if (!contactValue || contactValue === currentUser?.email || contactValue === currentUser?.profile?.whatsapp) {
      if (newMethod === 'Email' && currentUser?.email) {
        setContactValue(currentUser.email);
      } else if (newMethod === 'WhatsApp' && currentUser?.profile?.whatsapp) {
        setContactValue(currentUser.profile.whatsapp);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Price cannot be negative.');
      return;
    }

    if (!age.trim()) {
      setError('Condition or age of item is required.');
      return;
    }

    if (!reason.trim()) {
      setError('Reason for selling is required.');
      return;
    }

    const trimmedContact = contactValue.trim();
    if (!trimmedContact) {
      setError('Contact detail is required.');
      return;
    }

    setLoading(true);

    try {
      // Auto-authenticate if user hasn't signed in yet
      if (!currentUser) {
        const authRes = await demoLoginAction('/sell');
        if (!authRes.success) {
          setError('Please sign in with your Bennett email before publishing.');
          setLoading(false);
          return;
        }
      }

      const res = await createListingAction({
        title: trimmedTitle,
        price: numPrice,
        category,
        age: age.trim(),
        reason: reason.trim(),
        description: description.trim(),
        contactMethod,
        contactValue: trimmedContact,
        images,
      });

      if (!res.success) {
        setError(res.error || 'Failed to create listing.');
        setLoading(false);
        return;
      }

      if (res.listing?.id) {
        window.location.href = `/item/${res.listing.id}`;
      } else {
        window.location.href = '/profile';
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while creating listing.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Quick Sign-In Banner if Guest */}
      {!currentUser ? (
        <div className="p-3.5 rounded-xl bg-[#f3f5fa] border border-[#e1e6f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#14203b]">
            <ShieldCheck className="w-4 h-4 text-[#062a6e] shrink-0" />
            <span>Posting requires a verified Bennett account.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstantSignIn}
              disabled={authLoading}
              className="px-3.5 py-1.5 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-medium text-xs transition-colors flex items-center gap-1.5"
            >
              {authLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              <span>1-Click Sign In (Student)</span>
            </button>
            <Link
              href="/login?redirectTo=/sell"
              className="px-3 py-1.5 rounded-full border border-[#e1e6f0] bg-white hover:bg-gray-50 text-xs font-medium text-[#14203b]"
            >
              OTP Login
            </Link>
          </div>
        </div>
      ) : (
        <div className="py-1 px-3 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-xs text-[#166534] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
          <span>Listing as <strong>{currentUser.profile.fullName || currentUser.email}</strong></span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-[#c8102e]/10 border border-[#c8102e]/20 text-[#c8102e] text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Item Title */}
      <div>
        <label className="block text-xs font-semibold text-[#14203b] mb-1">
          Item Title <span className="text-[#c8102e]">*</span>
        </label>
        <input
          type="text"
          required
          maxLength={80}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Hero Sprint Cycle 21-Speed / Engineering Mechanics Book"
          className="w-full px-3.5 py-2 rounded-xl border border-[#e1e6f0] bg-white text-sm text-[#14203b] placeholder-[#5a6580]/50 focus:outline-none focus:border-[#062a6e]"
        />
      </div>

      {/* Price & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-[#14203b] mb-1">
            Price (₹ INR) <span className="text-[#c8102e]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#5a6580] font-semibold">
              ₹
            </span>
            <input
              type="number"
              required
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0 (Free) or amount"
              className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#e1e6f0] bg-white text-sm text-[#14203b] placeholder-[#5a6580]/50 focus:outline-none focus:border-[#062a6e]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#14203b] mb-1">
            Category <span className="text-[#c8102e]">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ListingCategory)}
            className="w-full px-3 py-2 rounded-xl border border-[#e1e6f0] bg-white text-sm text-[#14203b] focus:outline-none focus:border-[#062a6e] cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Age & Reason */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-[#14203b] mb-1">
            Age / Condition <span className="text-[#c8102e]">*</span>
          </label>
          <input
            type="text"
            required
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 6 months / 1 sem / Like new"
            className="w-full px-3.5 py-2 rounded-xl border border-[#e1e6f0] bg-white text-sm text-[#14203b] placeholder-[#5a6580]/50 focus:outline-none focus:border-[#062a6e]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#14203b] mb-1">
            Reason for Selling <span className="text-[#c8102e]">*</span>
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Semester over / Moving hostel"
            className="w-full px-3.5 py-2 rounded-xl border border-[#e1e6f0] bg-white text-sm text-[#14203b] placeholder-[#5a6580]/50 focus:outline-none focus:border-[#062a6e]"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-[#14203b] mb-1">
          Description (Optional)
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Condition, hostel block, or pick-up preferences..."
          className="w-full px-3.5 py-2 rounded-xl border border-[#e1e6f0] bg-white text-sm text-[#14203b] placeholder-[#5a6580]/50 focus:outline-none focus:border-[#062a6e]"
        />
      </div>

      {/* Photos */}
      <div>
        <label className="block text-xs font-semibold text-[#14203b] mb-1">
          Photos (Up to 5)
        </label>
        <ImageUploader images={images} onChange={setImages} maxImages={5} />
      </div>

      {/* Contact Method */}
      <div className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#14203b] mb-1">
              Contact Method
            </label>
            <select
              value={contactMethod}
              onChange={(e) => handleContactMethodChange(e.target.value as ContactMethod)}
              className="w-full px-3 py-2 rounded-xl border border-[#e1e6f0] bg-white text-sm text-[#14203b] focus:outline-none focus:border-[#062a6e]"
            >
              <option value="WhatsApp">WhatsApp</option>
              <option value="Phone">Phone</option>
              <option value="Email">Email</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14203b] mb-1">
              Contact Detail <span className="text-[#c8102e]">*</span>
            </label>
            <input
              type="text"
              required
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={contactMethod === 'Email' ? 'name@bennett.edu.in' : '+91 9876543210'}
              className="w-full px-3.5 py-2 rounded-xl border border-[#e1e6f0] bg-white text-sm text-[#14203b] placeholder-[#5a6580]/50 focus:outline-none focus:border-[#062a6e]"
            />
          </div>
        </div>
        <p className="text-[11px] text-[#5a6580] mt-1">
          Protected: Revealed only to verified Bennett students upon enquiry.
        </p>
      </div>

      {/* Actions */}
      <div className="pt-3 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="px-4 py-2 rounded-full border border-[#e1e6f0] text-xs font-medium text-[#5a6580] hover:text-[#14203b] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-3.5 h-3.5 text-[#ff9aa9]" />
              <span>Publish Listing</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
