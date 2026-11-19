'use client';

// ============================================================================
// BU Trade — CreateTradeBorrowModal Component (Milestone 4)
// Modal dialog for posting campus Borrow or Trade requests
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Clock,
  Repeat,
  Handshake,
  Loader2,
  LogIn,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import {
  BorrowTradeType,
  CATEGORIES,
  ContactMethod,
  ListingCategory,
  TradeBorrowRequest,
} from '@/lib/db/types';
import { createTradeBorrowRequestAction } from '@/app/actions/trade-borrow';
import ImageUploader from './ImageUploader';

export interface CreateTradeBorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { id: string; email?: string } | null;
  onRequestCreated?: (request: TradeBorrowRequest) => void;
}

export default function CreateTradeBorrowModal({
  isOpen,
  onClose,
  currentUser,
  onRequestCreated,
}: CreateTradeBorrowModalProps) {
  const [requestType, setRequestType] = useState<BorrowTradeType>('borrow');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ListingCategory>('Electronics');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('WhatsApp');
  const [contactValue, setContactValue] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Title is required.');
      return;
    }

    if (!duration.trim()) {
      setErrorMessage('Duration is required.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Description is required.');
      return;
    }

    if (!contactValue.trim()) {
      setErrorMessage('Contact detail is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createTradeBorrowRequestAction({
        title: title.trim(),
        description: description.trim(),
        requestType,
        duration: duration.trim(),
        category,
        contactMethod,
        contactValue: contactValue.trim(),
        images,
      });

      if (res.success && res.request) {
        if (onRequestCreated) {
          onRequestCreated(res.request);
        }
        // Reset state
        setTitle('');
        setDuration('');
        setDescription('');
        setContactValue('');
        setImages([]);
        setRequestType('borrow');
        setCategory('Electronics');
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to submit request.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-2xs"
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#e1e6f0] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#062a6e] px-6 py-4 flex items-center justify-between text-white border-b border-[#041b4d]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/10 text-[#dbe4ff]">
              <PlusCircle className="w-5 h-5 text-[#ff9aa9]" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold leading-tight">
                Create Borrow or Trade Request
              </h2>
              <p className="text-xs text-[#dbe4ff]">
                Post a campus request for items you need to borrow or trade
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unauthenticated View */}
        {!currentUser ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#062a6e] flex items-center justify-center mx-auto">
              <LogIn className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#062a6e]">
                Sign in with your Bennett Email
              </h3>
              <p className="text-sm text-[#4b5563] max-w-sm mx-auto">
                Only verified Bennett University students can create borrow and trade requests on BU Trade.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#062a6e] text-white text-sm font-semibold hover:bg-[#041b4d] transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-[#e1e6f0] text-[#4b5563] text-sm font-medium hover:bg-[#f3f5fa]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[80vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Request Type Segmented Toggle */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#374151]">
                <label htmlFor="request-type-borrow">I want to</label>
              </span>
              <div className="grid grid-cols-2 gap-3">
                <label
                  htmlFor="request-type-borrow"
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold cursor-pointer transition-all ${
                    requestType === 'borrow'
                      ? 'border-[#062a6e] bg-blue-50/80 text-[#062a6e] shadow-2xs'
                      : 'border-[#e1e6f0] hover:bg-[#f8fafc] text-[#4b5563]'
                  }`}
                >
                  <input
                    type="radio"
                    id="request-type-borrow"
                    name="requestType"
                    value="borrow"
                    checked={requestType === 'borrow'}
                    onChange={() => setRequestType('borrow')}
                    className="sr-only"
                  />
                  <Handshake className="w-4 h-4 text-[#062a6e]" />
                  <span>Borrow</span>
                </label>

                <label
                  htmlFor="request-type-trade"
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold cursor-pointer transition-all ${
                    requestType === 'trade'
                      ? 'border-amber-600 bg-amber-50/80 text-amber-900 shadow-2xs'
                      : 'border-[#e1e6f0] hover:bg-[#f8fafc] text-[#4b5563]'
                  }`}
                >
                  <input
                    type="radio"
                    id="request-type-trade"
                    name="requestType"
                    value="trade"
                    checked={requestType === 'trade'}
                    onChange={() => setRequestType('trade')}
                    className="sr-only"
                  />
                  <Repeat className="w-4 h-4 text-amber-700" />
                  <span>Trade</span>
                </label>
              </div>
            </div>

            {/* Title & Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label htmlFor="item-title" className="block text-xs font-semibold text-[#374151]">
                  Item title <span className="text-red-500">*</span>
                </label>
                <input
                  id="item-title"
                  type="text"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Casio fx-991EX Calculator"
                  className="w-full px-3 py-2 rounded-lg border border-[#ccd5e4] text-sm text-[#1f2937] focus:outline-hidden focus:ring-2 focus:ring-[#062a6e] focus:border-transparent placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="category" className="block text-xs font-semibold text-[#374151]">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ListingCategory)}
                  className="w-full px-3 py-2 rounded-lg border border-[#ccd5e4] text-sm text-[#1f2937] focus:outline-hidden focus:ring-2 focus:ring-[#062a6e] focus:border-transparent bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="duration" className="block text-xs font-semibold text-[#374151]">
                  Duration <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-500">How long do you need it?</span>
              </div>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="duration"
                  type="text"
                  required
                  maxLength={60}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 3 days, 1 weekend, End-term exams, Full semester"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#ccd5e4] text-sm text-[#1f2937] focus:outline-hidden focus:ring-2 focus:ring-[#062a6e] focus:border-transparent placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1">
              <label htmlFor="description" className="block text-xs font-semibold text-[#374151]">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  requestType === 'borrow'
                    ? 'Explain what you need it for and how you will return it...'
                    : 'Explain what item you have to offer in exchange and its condition...'
                }
                className="w-full px-3 py-2 rounded-lg border border-[#ccd5e4] text-sm text-[#1f2937] focus:outline-hidden focus:ring-2 focus:ring-[#062a6e] focus:border-transparent placeholder:text-gray-400"
              />
            </div>

            {/* Contact Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label htmlFor="contact-method" className="block text-xs font-semibold text-[#374151]">
                  Contact method <span className="text-red-500">*</span>
                </label>
                <select
                  id="contact-method"
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value as ContactMethod)}
                  className="w-full px-3 py-2 rounded-lg border border-[#ccd5e4] text-sm text-[#1f2937] focus:outline-hidden focus:ring-2 focus:ring-[#062a6e] focus:border-transparent bg-white"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-detail" className="block text-xs font-semibold text-[#374151]">
                  Contact detail <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact-detail"
                  type="text"
                  required
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={
                    contactMethod === 'Email'
                      ? 'e.g. yourname@bennett.edu.in'
                      : 'e.g. +91 98765 43210'
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#ccd5e4] text-sm text-[#1f2937] focus:outline-hidden focus:ring-2 focus:ring-[#062a6e] focus:border-transparent placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Image Uploader */}
            <div className="space-y-1 pt-1">
              <label className="block text-xs font-semibold text-[#374151]">
                Photos (Optional, max 5)
              </label>
              <ImageUploader
                images={images}
                onChange={setImages}
                maxImages={5}
                disabled={submitting}
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-[#f0f2f5] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-lg border border-[#ccd5e4] text-sm font-medium text-[#4b5563] hover:bg-[#f3f5fa] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#062a6e] text-white text-sm font-semibold hover:bg-[#041b4d] transition-colors disabled:opacity-50 shadow-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <span>Post Request</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
