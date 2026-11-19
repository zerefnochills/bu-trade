'use client';

// ============================================================================
// BU Trade — Edit Listing Client Form
// ============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, ContactMethod, Listing, ListingCategory, ListingStatus } from '@/lib/db/types';
import ImageUploader from '@/components/ImageUploader';
import { updateListingAction } from '@/app/actions/listings';
import { Loader2, Save, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditListingFormProps {
  listing: Listing;
  activeCount: number;
}

export default function EditListingForm({ listing, activeCount }: EditListingFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState<string>(String(listing.price));
  const [category, setCategory] = useState<ListingCategory>(listing.category);
  const [age, setAge] = useState(listing.age);
  const [reason, setReason] = useState(listing.reason);
  const [description, setDescription] = useState(listing.description || '');
  const [contactMethod, setContactMethod] = useState<ContactMethod>(listing.contactMethod);
  const [contactValue, setContactValue] = useState(listing.contactValue || '');
  const [status, setStatus] = useState<ListingStatus>(listing.status);
  const [images, setImages] = useState<string[]>(listing.images || []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRelistingBlocked =
    status === 'active' && listing.status !== 'active' && activeCount >= 10;

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

    if (isRelistingBlocked) {
      setError('Cannot relist to active: Active listing limit of 10 reached.');
      return;
    }

    setLoading(true);

    try {
      const res = await updateListingAction({
        id: listing.id,
        title: trimmedTitle,
        price: numPrice,
        category,
        age: age.trim(),
        reason: reason.trim(),
        description: description.trim(),
        contactMethod,
        contactValue: contactValue.trim(),
        status,
        images,
      });

      if (!res.success) {
        setError(res.error || 'Failed to update listing.');
        setLoading(false);
        return;
      }

      router.push(`/item/${listing.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while updating listing.');
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

      {/* Listing Status Controls */}
      <div className="p-4 rounded-xl bg-[#f3f5fa] border border-[#e1e6f0]">
        <label className="block text-[13.5px] font-semibold text-[#14203b] mb-1.5">
          Listing Lifecycle Status
        </label>
        <div className="flex flex-wrap gap-3">
          {(['active', 'sold', 'delisted'] as ListingStatus[]).map((st) => (
            <label
              key={st}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[13px] font-medium cursor-pointer transition-colors ${
                status === st
                  ? 'bg-white border-[#062a6e] text-[#062a6e] font-semibold shadow-xs ring-1 ring-[#062a6e]'
                  : 'bg-white/60 border-[#e1e6f0] text-[#5a6580] hover:bg-white'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={st}
                checked={status === st}
                onChange={() => setStatus(st)}
                className="hidden"
              />
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  st === 'active'
                    ? 'bg-[#0a8a4a]'
                    : st === 'sold'
                    ? 'bg-[#5a6580]'
                    : 'bg-[#c8102e]'
                }`}
              />
              <span className="capitalize">{st}</span>
            </label>
          ))}
        </div>
        {isRelistingBlocked && (
          <p className="text-[12px] text-[#c8102e] font-medium mt-2">
            ⚠️ You already have 10 active listings. Marking this listing active is disabled until an existing item is sold or delisted.
          </p>
        )}
      </div>

      {/* Title */}
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
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e1e6f0] bg-white text-[14px] text-[#14203b] focus:outline-none focus:border-[#062a6e]"
        />
        <p className="text-[11.5px] text-[#5a6580] mt-1 text-right">{title.length} / 80 characters</p>
      </div>

      {/* Price & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#e1e6f0] bg-white text-[14px] text-[#14203b] focus:outline-none focus:border-[#062a6e]"
            />
          </div>
        </div>

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

      {/* Age & Reason */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13.5px] font-semibold text-[#14203b] mb-1.5">
            Age of Item / Condition <span className="text-[#c8102e]">*</span>
          </label>
          <input
            type="text"
            required
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e1e6f0] bg-white text-[14px] text-[#14203b] focus:outline-none focus:border-[#062a6e]"
          />
        </div>

        <div>
          <label className="block text-[13.5px] font-semibold text-[#14203b] mb-1.5">
            Reason for Selling <span className="text-[#c8102e]">*</span>
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e1e6f0] bg-white text-[14px] text-[#14203b] focus:outline-none focus:border-[#062a6e]"
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
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e1e6f0] bg-white text-[14px] text-[#14203b] focus:outline-none focus:border-[#062a6e]"
        />
      </div>

      {/* Image Uploader */}
      <div className="pt-2 border-t border-[#f3f5fa]">
        <ImageUploader images={images} onChange={setImages} maxImages={5} />
      </div>

      {/* Contact Method & Detail */}
      <div className="pt-4 border-t border-[#f3f5fa] bg-[#f3f5fa]/60 p-4 rounded-xl border border-[#e1e6f0]">
        <h4 className="text-[14px] font-bold text-[#062a6e] mb-1">Protected Contact Method</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[12.5px] font-semibold text-[#14203b] mb-1">
              Contact Method
            </label>
            <select
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value as ContactMethod)}
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
              className="w-full px-3 py-2 rounded-lg border border-[#e1e6f0] bg-white text-[13.5px] text-[#14203b] focus:outline-none focus:border-[#062a6e]"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-between gap-4">
        <Link
          href={`/item/${listing.id}`}
          className="px-5 py-2.5 rounded-full border border-[#e1e6f0] text-[#5a6580] hover:text-[#14203b] hover:bg-[#f3f5fa] text-[13.5px] font-medium transition-colors"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading || isRelistingBlocked}
          className="px-6 py-2.5 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold text-[14px] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#ff9aa9]" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
