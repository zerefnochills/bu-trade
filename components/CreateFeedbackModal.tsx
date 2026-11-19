'use client';

// ============================================================================
// BU Trade — CreateFeedbackModal Component
// Modal for submitting reviews with star rating and image attachment
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Star, Loader2, LogIn, MessageSquarePlus } from 'lucide-react';
import { createFeedbackAction } from '@/app/actions/feedback';
import ImageUploader from './ImageUploader';
import { FeedbackPost } from '@/lib/db/types';

export interface CreateFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { id: string; email?: string } | null;
  onFeedbackCreated?: (feedback: FeedbackPost) => void;
}

export default function CreateFeedbackModal({
  isOpen,
  onClose,
  currentUser,
  onFeedbackCreated,
}: CreateFeedbackModalProps) {
  const [itemTitle, setItemTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!itemTitle.trim()) {
      setErrorMessage('Item Title is required.');
      return;
    }

    if (!content.trim()) {
      setErrorMessage('Review content is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createFeedbackAction({
        itemTitle: itemTitle.trim(),
        content: content.trim(),
        rating: rating > 0 ? rating : undefined,
        images,
      });

      if (res.success && res.feedback) {
        if (onFeedbackCreated) {
          onFeedbackCreated(res.feedback);
        }
        // Reset state & close
        setItemTitle('');
        setContent('');
        setRating(5);
        setImages([]);
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to submit feedback.');
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
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-[#e1e6f0] p-5 sm:p-6 overflow-hidden">
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 text-[#5a6580] hover:text-[#14203b] hover:bg-[#f3f5fa] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Unauthenticated View: Sign-in Required */}
        {!currentUser ? (
          <div className="text-center py-6 px-2 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#f3f5fa] text-[#062a6e] flex items-center justify-center mx-auto">
              <LogIn className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-[18px] font-bold text-[#062a6e]">Sign-in Required</h3>
              <p className="text-[13.5px] text-[#5a6580] max-w-xs mx-auto">
                Log in with your Bennett University email address to share feedback and reviews.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#5a6580] hover:bg-[#f3f5fa] transition-colors"
              >
                Cancel
              </button>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 bg-[#062a6e] hover:bg-[#041b4d] text-white text-[13px] font-semibold px-5 py-2 rounded-xl shadow-xs transition-colors"
              >
                Sign in to continue
              </Link>
            </div>
          </div>
        ) : (
          /* Authenticated Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 pb-1 border-b border-[#e1e6f0]">
              <div className="w-8 h-8 rounded-lg bg-[#062a6e]/10 text-[#062a6e] flex items-center justify-center">
                <MessageSquarePlus className="w-4 h-4 text-[#062a6e]" />
              </div>
              <div>
                <h3 id="modal-title" className="text-[17px] font-bold text-[#062a6e]">
                  Share Feedback
                </h3>
                <p className="text-[12px] text-[#5a6580]">
                  Help fellow Bennett students by reviewing items you bought on campus
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#c8102e] text-[12.5px]">
                {errorMessage}
              </div>
            )}

            {/* Item Title Input */}
            <div>
              <label
                htmlFor="itemTitle"
                className="block text-[13px] font-semibold text-[#14203b] mb-1"
              >
                Item Title <span className="text-[#c8102e]">*</span>
              </label>
              <input
                id="itemTitle"
                type="text"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="e.g. Hero Sprint cycle, Casio fx-991EX calculator"
                maxLength={120}
                className="w-full px-3.5 py-2 text-[13.5px] border border-[#e1e6f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062a6e] transition-all bg-white"
                required
              />
              <span className="text-[11px] text-[#5a6580] float-right mt-0.5">
                {itemTitle.length}/120
              </span>
            </div>

            {/* Rating Stars Selector */}
            <div className="pt-1">
              <label className="block text-[13px] font-semibold text-[#14203b] mb-1">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    aria-label={`${star} star rating`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-[#e1e6f0] hover:text-amber-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-[13px] font-bold text-[#14203b] ml-2">
                  {rating} / 5
                </span>
              </div>
            </div>

            {/* Review Content Textarea */}
            <div>
              <label
                htmlFor="content"
                className="block text-[13px] font-semibold text-[#14203b] mb-1"
              >
                Review <span className="text-[#c8102e]">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your honest experience: condition, performance, pricing, and how useful it was on campus..."
                rows={4}
                maxLength={2000}
                className="w-full px-3.5 py-2 text-[13.5px] border border-[#e1e6f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062a6e] transition-all bg-white resize-y"
                required
              />
              <span className="text-[11px] text-[#5a6580] float-right mt-0.5">
                {content.length}/2000
              </span>
            </div>

            {/* Image Uploader */}
            <div className="pt-1">
              <ImageUploader
                images={images}
                onChange={setImages}
                maxImages={3}
                disabled={submitting}
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#e1e6f0] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#5a6580] hover:bg-[#f3f5fa] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 bg-[#062a6e] hover:bg-[#041b4d] text-white text-[13px] font-semibold px-5 py-2 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
