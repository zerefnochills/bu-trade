'use client';

// ============================================================================
// BU Trade — CreateFeedbackModal Component (Reddit-Style Review Creator)
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Star, Loader2, LogIn, MessageSquarePlus, ImageIcon, ShieldCheck } from 'lucide-react';
import { createFeedbackAction } from '@/app/actions/feedback';
import { demoLoginAction } from '@/app/actions/auth';
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
  currentUser: initialUser,
  onFeedbackCreated,
}: CreateFeedbackModalProps) {
  const [currentUser, setCurrentUser] = useState(initialUser || null);
  const [itemTitle, setItemTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDemoSignIn = async () => {
    setDemoLoading(true);
    setErrorMessage(null);
    try {
      const res = await demoLoginAction('/feed');
      if (res.success && res.data) {
        setCurrentUser({
          id: res.data.session.userId,
          email: res.data.session.email,
        });
      } else {
        setErrorMessage(res.error || 'Failed to sign in.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to sign in.');
    } finally {
      setDemoLoading(false);
    }
  };

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
      if (!currentUser) {
        const demoRes = await demoLoginAction('/feed');
        if (!demoRes.success) {
          setErrorMessage('Please sign in before submitting feedback.');
          setSubmitting(false);
          return;
        }
      }

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
              <h3 className="text-lg font-bold text-[#062a6e]">Sign-in Required</h3>
              <p className="text-xs sm:text-sm text-[#5a6580] max-w-xs mx-auto">
                Sign in with your Bennett University email address to post reviews and photos.
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[#c8102e] text-xs">
                {errorMessage}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={demoLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>1-Click Student Sign In</span>
              </button>
              <Link
                href="/login?redirectTo=/feed"
                className="w-full sm:w-auto px-4 py-2 rounded-full border border-[#e1e6f0] hover:bg-[#f3f5fa] text-xs font-medium text-[#14203b] transition-colors"
              >
                OTP Login
              </Link>
            </div>
          </div>
        ) : (
          /* Authenticated Reddit Review Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-[#e1e6f0]">
              <div className="w-8 h-8 rounded-lg bg-[#062a6e]/10 text-[#062a6e] flex items-center justify-center">
                <MessageSquarePlus className="w-4 h-4 text-[#062a6e]" />
              </div>
              <div>
                <h3 id="modal-title" className="text-base font-bold text-[#062a6e]">
                  Share Feedback
                </h3>
                <p className="text-[11.5px] text-[#5a6580]">
                  Post a review with photos for fellow Bennett students
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[#c8102e] text-xs">
                {errorMessage}
              </div>
            )}

            {/* Item Title Input */}
            <div>
              <label
                htmlFor="itemTitle"
                className="block text-xs font-semibold text-[#14203b] mb-1"
              >
                Item Title <span className="text-[#c8102e]">*</span>
              </label>
              <input
                id="itemTitle"
                type="text"
                required
                maxLength={100}
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="e.g. Hero Sprint Cycle / Casio fx-991EX / Electric Kettle"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#e1e6f0] rounded-xl focus:outline-none focus:border-[#062a6e] bg-white text-[#14203b]"
              />
            </div>

            {/* Star Rating Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#14203b] mb-1">
                Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-[#e1e6f0] hover:text-amber-400 transition-colors focus:outline-none"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-[#e1e6f0]'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-[#062a6e] ml-1">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Review Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-xs font-semibold text-[#14203b] mb-1"
              >
                Review <span className="text-[#c8102e]">*</span>
              </label>
              <textarea
                id="content"
                required
                rows={3}
                maxLength={1000}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="How was the condition? Did it match the listing? Describe the transaction..."
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#e1e6f0] rounded-xl focus:outline-none focus:border-[#062a6e] bg-white text-[#14203b]"
              />
            </div>

            {/* Picture Uploader (Reddit Post Images) */}
            <div>
              <label className="block text-xs font-semibold text-[#14203b] mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-[#062a6e]" />
                <span>Photos of Bought Item (Up to 3)</span>
              </label>
              <ImageUploader
                images={images}
                onChange={setImages}
                maxImages={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-[#e1e6f0] text-xs font-medium text-[#5a6580] hover:bg-[#f3f5fa] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <span>Post Feedback</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
