'use client';

// ============================================================================
// BU Trade — FeedbackCard Component with Reddit-Style Voting
// ============================================================================

import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, Star, CheckCircle, Clock } from 'lucide-react';
import { FeedbackPost } from '@/lib/db/types';

export interface FeedbackCardProps {
  feedback: FeedbackPost;
  onVote?: (feedbackId: string, voteType: 1 | -1) => void;
  currentUser?: { id: string; email?: string } | null;
}

export default function FeedbackCard({
  feedback,
  onVote,
  currentUser,
}: FeedbackCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleVote = (voteType: 1 | -1) => {
    if (onVote) {
      onVote(feedback.id, voteType);
    }
  };

  const isUpvoted = feedback.userVote === 1;
  const isDownvoted = feedback.userVote === -1;

  // Format creation timestamp
  const timeString = (() => {
    try {
      const date = new Date(feedback.createdAt);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  })();

  const authorInitials = feedback.authorName
    ? feedback.authorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'BU';

  return (
    <article className="bg-white border border-[#e1e6f0] rounded-2xl shadow-xs hover:shadow-md transition-shadow p-4 sm:p-5 flex gap-3 sm:gap-4">
      {/* Reddit-Style Voting Column */}
      <div className="flex flex-col items-center justify-start pt-0.5 select-none min-w-[36px]">
        <button
          type="button"
          onClick={() => handleVote(1)}
          aria-label="Upvote"
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
            isUpvoted
              ? 'text-orange-600 bg-orange-50 font-bold active'
              : 'text-[#5a6580] hover:text-orange-600 hover:bg-orange-50/60'
          }`}
          title="Upvote"
        >
          <ArrowBigUp
            className={`w-5 h-5 sm:w-6 sm:h-6 ${
              isUpvoted ? 'fill-orange-600 text-orange-600' : 'stroke-[1.75]'
            }`}
          />
        </button>

        <span
          className={`text-[13px] sm:text-[14px] font-bold py-1 ${
            isUpvoted
              ? 'text-orange-600 font-extrabold'
              : isDownvoted
              ? 'text-blue-600 font-extrabold'
              : 'text-[#14203b]'
          }`}
        >
          {feedback.score}
        </span>

        <button
          type="button"
          onClick={() => handleVote(-1)}
          aria-label="Downvote"
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
            isDownvoted
              ? 'text-blue-600 bg-blue-50 font-bold active'
              : 'text-[#5a6580] hover:text-blue-600 hover:bg-blue-50/60'
          }`}
          title="Downvote"
        >
          <ArrowBigDown
            className={`w-5 h-5 sm:w-6 sm:h-6 ${
              isDownvoted ? 'fill-blue-600 text-blue-600' : 'stroke-[1.75]'
            }`}
          />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Author Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-[12.5px] sm:text-[13px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#062a6e] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
              {authorInitials}
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-[#14203b]">
                <span>{feedback.authorName || 'Bennett Student'}</span>
                <span className="inline-flex items-center text-[#062a6e]" title="Verified Bennett Student">
                  <CheckCircle className="w-3.5 h-3.5 fill-[#062a6e] text-white" />
                </span>
              </div>
              <p className="text-[11.5px] text-[#5a6580]">
                <span>{feedback.authorCourse || 'B.Tech CSE'}</span>
                <span className="mx-1">·</span>
                <span>Y{feedback.authorYear || 2}</span>
              </p>
            </div>
          </div>

          {timeString && (
            <div className="flex items-center gap-1 text-[11.5px] text-[#5a6580]">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeString}</span>
            </div>
          )}
        </div>

        {/* Rating Stars (1 to 5) */}
        {typeof feedback.rating === 'number' && feedback.rating > 0 && (
          <div className="flex items-center gap-1 pt-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= (feedback.rating || 0)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-[#e1e6f0]'
                }`}
              />
            ))}
            <span className="text-[12px] font-semibold text-[#5a6580] ml-1">
              {feedback.rating}/5
            </span>
          </div>
        )}

        {/* Item Title */}
        <h3 className="text-[15px] sm:text-[16px] font-bold text-[#062a6e] leading-snug">
          {feedback.itemTitle}
        </h3>

        {/* Review Body */}
        <p className="text-[13.5px] sm:text-[14px] text-[#14203b] leading-relaxed whitespace-pre-wrap">
          {feedback.content}
        </p>

        {/* Attached Photos Gallery */}
        {feedback.images && feedback.images.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-2.5">
            {feedback.images.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(imgUrl)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-[#e1e6f0] overflow-hidden bg-[#f3f5fa] cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-[#062a6e] transition-all relative"
              >
                <img
                  src={imgUrl}
                  alt={feedback.itemTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white p-2">
            <img
              src={selectedImage}
              alt={feedback.itemTitle}
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </article>
  );
}
