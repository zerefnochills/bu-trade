'use client';

// ============================================================================
// BU Trade — Sell Listing Client Form
// ============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, ContactMethod, ListingCategory } from '@/lib/db/types';
import ImageUploader from '@/components/ImageUploader';
import { createListingAction } from '@/app/actions/listings';
import { Loader2, PlusCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SellListingFormProps {
  user: {
    id: string;
    email: string;
    profile: {
      fullName: string;
      whatsapp?: string;
    };
  };
  activeCount: number;
}

export default function SellListingForm({ user, activeCount }: SellListingFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<ListingCategory>('Books & notes');
  const [age, setAge] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>(
    user.profile.whatsapp ? 'WhatsApp' : 'Email'
  );
  const [contactValue, setContactValue] = useState(
    user.profile.whatsapp || user.email || ''
  );
  const [images, setImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update contactValue default when contactMethod switches if empty
  const handleContactMethodChange = (newMethod: ContactMethod) => {
    setContactMethod(newMethod);
    if (!contactValue || contactValue === user.email || contactValue === user.profile.whatsapp) {
      if (newMethod === 'Email') {
        setContactValue(user.email);
      } else if (newMethod === 'WhatsApp' && user.profile.whatsapp) {
        setContactValue(user.profile.whatsapp);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required and cannot be empty.');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Price cannot be negative.');
      return;
    }

    if (!age.trim()) {
      setError('Age of item is required.');
      return;
    }

    if (!reason.trim()) {
      setError('Reason for selling is required.');
      return;
    }

    if (!contactValue.trim()) {
      setError('Contact detail is required.');
      return;
    }

    setLoading(true);

    try {
      const res = await createListingAction({
        title: trimmedTitle,
        price: numPrice,
        category,
        age: age.trim(),
        reason: reason.trim(),
        description: description.trim(),
        contactMethod,
        contactValue: contactValue.trim(),
        images,
      });

      if (!res.success) {
        setError(res.error || 'Failed to create listing.');
        setLoading(false);
        return;
      }

      // Success: redirect to newly created item or profile
      if (res.listing?.id) {
        router.push(`/item/${res.listing.id}`);
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while creating listing.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-[#c8102e]/10 border border-[#c8102e]/20 text-[#c8102e] text-[13.5px] flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Listing Title */}
      <div>
        <label className="block text-[13.5px] font-semibold text-[#14203b] mb-1.5">
          Item Title <span className="text-[#c8102e]">*</span>
        </label>
        <input
          type="text"
          required
          maxLength={80}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Hero Sprint Cycle 21-Speed / Data Structures Textbook"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e1e6f0] bg-white text-[14px] text-[#14203b] placeholder-[#5a6580] focus:outline-none focus:border-[#062a6e] focus:ring-1 focus:ring-[#062a6e]"
        />
        <p className="text-[11.5px] text-[#5a6580] mt-1 text-right">{title.length} / 80 characters</p>
      </div>

      {/* Price & Category row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Price */}
        <div>
          <label className="block text-[13.5px] font-semibold text-[#14203b] mb-1.5">
            Price (₹ INR) <span className="text-[#c8102e]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a6580] font-semibold">
              ₹
            </span>
            <input
              type="number"
              required
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0 (Free giveaway) or enter amount"
              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#e1e6f0] bg-white text-[14px] text-[#14203b] placeholder-[#5a6580] focus:outline-none focus:border-[#062a6e] focus:ring-1 focus:ring-[#062a6e]"
            />
          </div>
          <p className="text-[11.5px] text-[#5a6580] mt-1">Enter 0 for free giveaways.</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[13.5px] font-semibold text-[#14203b] mb-1.5">
            Category <span className="text-[#c8102e]">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ListingCategory)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e1e6f0] bg-white text-[14px] text-[#14203b] focus:outline-none focus:border-[#062a6e] cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Age & Reason row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Age of item */}
        <div>
          <label className="block text-[13.5px] font-semibold text-[#14203b] mb-1.5">
            Age of Item / Condition <span className="text-[#c8102e]">*</span>
          </label>
          <input
            type="text"
            required
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 6 months / 1 semester / Like new"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e1e6f0] bg-white text-[14px] text-[#14203b] placeholder-[#5a6580] focus:outline-none focus:border-[#062a6e] focus:ring-1 focus:ring-[#062a6e]"
          />
        </div>

        {/* Reason for selling */}
        <div>
          <label className="block text-[13.5px] font-semibold text-[#14203b] mb-1.5">
            Reason for Selling <span className="text-[#c8102e]">*</span>
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Semester finished / Moving out / Upgraded"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e1e6f0] bg-white text-[14px] text-[#14203b] placeholder-[#5a6580] focus:outline-none focus:border-[#062a6e] focus:ring-1 focus:ring-[#062a6e]"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[13.5px] font-semibold text-[#14203b] mb-1.5">
          Description
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mention key details, working condition, hostel block, or pick-up preferences..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e1e6f0] bg-white text-[14px] text-[#14203b] placeholder-[#5a6580] focus:outline-none focus:border-[#062a6e] focus:ring-1 focus:ring-[#062a6e]"
        />
      </div>

      {/* Image Uploader with WebP compression */}
      <div className="pt-2 border-t border-[#f3f5fa]">
        <ImageUploader images={images} onChange={setImages} maxImages={5} />
      </div>

      {/* Contact Details (Protected Privacy) */}
      <div className="pt-4 border-t border-[#f3f5fa] bg-[#f3f5fa]/60 p-4 rounded-xl border border-[#e1e6f0]">
        <h4 className="text-[14px] font-bold text-[#062a6e] mb-1">Protected Contact Method</h4>
        <p className="text-[12px] text-[#5a6580] mb-3">
          Your contact detail is hidden from outside visitors and revealed only to authenticated Bennett students who send an enquiry.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[12.5px] font-semibold text-[#14203b] mb-1">
              Contact Method
            </label>
            <select
              value={contactMethod}
              onChange={(e) => handleContactMethodChange(e.target.value as ContactMethod)}
              className="w-full px-3 py-2 rounded-lg border border-[#e1e6f0] bg-white text-[13.5px] text-[#14203b] focus:outline-none focus:border-[#062a6e]"
            >
              <option value="WhatsApp">WhatsApp</option>
              <option value="Phone">Phone Call</option>
              <option value="Email">Email</option>
            </select>
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-[#14203b] mb-1">
              Contact Detail <span className="text-[#c8102e]">*</span>
            </label>
            <input
              type="text"
              required
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={contactMethod === 'Email' ? 'name@bennett.edu.in' : '+91 9876543210'}
              className="w-full px-3 py-2 rounded-lg border border-[#e1e6f0] bg-white text-[13.5px] text-[#14203b] focus:outline-none focus:border-[#062a6e]"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full border border-[#e1e6f0] text-[#5a6580] hover:text-[#14203b] hover:bg-[#f3f5fa] text-[13.5px] font-medium transition-colors"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold text-[14px] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 text-[#ff9aa9]" />
              <span>Publish Listing</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
