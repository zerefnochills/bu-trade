'use client';

// ============================================================================
// BU Trade — Reddit-Style FeedbackCard Component
// Authenticated Reddit-like review post with upvotes, photo gallery & flairs
// ============================================================================

import React, { useState } from 'react';
import {
  ArrowBigUp,
  ArrowBigDown,
  Star,
  CheckCircle,
  MessageSquare,
  Share2,
  Flag,
  Clock,
  Sparkles,
} from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const handleVote = (voteType: 1 | -1) => {
    if (onVote) {
      onVote(feedback.id, voteType);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `/feed`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isUpvoted = feedback.userVote === 1;
  const isDownvoted = feedback.userVote === -1;

  // Format creation timestamp into relative or date string
  const timeString = (() => {
    try {
      const date = new Date(feedback.createdAt);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  })();

  // Reddit-style username format: u/FirstnameLastname
  const redditUsername = feedback.authorName
    ? `u/${feedback.authorName.replace(/\s+/g, '')}`
    : 'u/BennettStudent';

  return (
    <article className="bg-white border border-[#e1e6f0] hover:border-[#cbd5e1] rounded-2xl shadow-xs transition-all overflow-hidden flex flex-row">
      {/* Reddit-Style Left Voting Pillar */}
      <div className="bg-[#f8fafc] border-r border-[#f1f5f9] flex flex-col items-center justify-start py-3 px-2 sm:px-2.5 select-none min-w-[42px] sm:min-w-[48px]">
        <button
          type="button"
          onClick={() => handleVote(1)}
          aria-label="Upvote"
          className={`p-1 rounded-md transition-colors flex items-center justify-center ${
            isUpvoted
              ? 'text-orange-600 bg-orange-100/70 font-bold active'
              : 'text-[#64748b] hover:text-orange-600 hover:bg-orange-50'
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
          className={`text-xs sm:text-[13px] font-bold py-1.5 tabular-nums ${
            isUpvoted
              ? 'text-orange-600 font-extrabold'
              : isDownvoted
              ? 'text-blue-600 font-extrabold'
              : 'text-[#1e293b]'
          }`}
        >
          {feedback.score}
        </span>

        <button
          type="button"
          onClick={() => handleVote(-1)}
          aria-label="Downvote"
          className={`p-1 rounded-md transition-colors flex items-center justify-center ${
            isDownvoted
              ? 'text-blue-600 bg-blue-100/70 font-bold active'
              : 'text-[#64748b] hover:text-blue-600 hover:bg-blue-50'
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

      {/* Main Reddit Post Content */}
      <div className="flex-1 min-w-0 p-3.5 sm:p-5 space-y-2.5">
        {/* Reddit Post Header / Subreddit & User Meta */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[#64748b]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#062a6e] hover:underline cursor-pointer">
              bu/feed
            </span>
            <span className="opacity-40">•</span>
            <span className="font-semibold text-[#1e293b]">{feedback.authorName || 'Bennett Student'}</span>
            <span className="text-[11px] text-[#64748b]">({redditUsername})</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#f1f5f9] text-[11px] font-medium text-[#062a6e]">
              <CheckCircle className="w-3 h-3 text-[#062a6e] fill-[#062a6e]/20" />
              <span>{feedback.authorCourse || 'B.Tech CSE'} {feedback.authorYear ? `Y${feedback.authorYear}` : ''}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11.5px] text-[#64748b]">
            <Clock className="w-3 h-3 opacity-70" />
            <span>{timeString}</span>
          </div>
        </div>

        {/* Item Title & Reddit Flair */}
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base sm:text-[17px] font-bold text-[#0f172a] leading-snug">
            {feedback.itemTitle}
          </h3>

          {/* Star Rating Flair */}
          {typeof feedback.rating === 'number' && feedback.rating > 0 && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>{feedback.rating}.0 Verified</span>
            </div>
          )}
        </div>

        {/* Review Text Body */}
        <p className="text-[13.5px] sm:text-[14px] text-[#334155] leading-relaxed whitespace-pre-wrap">
          {feedback.content}
        </p>

        {/* Attached Photos Gallery (Reddit Media Box) */}
        {feedback.images && feedback.images.length > 0 && (
          <div className="pt-1.5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl">
              {feedback.images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className="aspect-square rounded-xl border border-[#e2e8f0] overflow-hidden bg-[#f8fafc] cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-[#062a6e] transition-all relative group"
                >
                  <img
                    src={imgUrl}
                    alt={feedback.itemTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reddit Bottom Action Bar */}
        <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-[#64748b] border-t border-[#f1f5f9]">
          <div className="flex items-center gap-1.5 hover:text-[#062a6e] cursor-pointer py-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Campus Review</span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-[#062a6e] transition-colors py-1"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          <div className="flex items-center gap-1.5 hover:text-[#c8102e] cursor-pointer py-1">
            <Flag className="w-3.5 h-3.5" />
            <span>Report</span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white p-2">
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
