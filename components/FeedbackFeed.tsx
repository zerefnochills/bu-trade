'use client';

// ============================================================================
// BU Trade — FeedbackFeed Component
// Feed of student item reviews with Reddit-style voting and sorting
// ============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  TrendingUp,
  Clock,
  PlusCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { FeedbackPost } from '@/lib/db/types';
import { voteFeedbackAction } from '@/app/actions/feedback';
import FeedbackCard from './FeedbackCard';
import CreateFeedbackModal from './CreateFeedbackModal';

export interface FeedbackFeedProps {
  initialFeedbacks?: FeedbackPost[];
  currentUser?: { id: string; email?: string } | null;
}

export default function FeedbackFeed({
  initialFeedbacks = [],
  currentUser,
}: FeedbackFeedProps) {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<FeedbackPost[]>(initialFeedbacks);
  const [sort, setSort] = useState<'top' | 'newest'>('top');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [votingFeedbackId, setVotingFeedbackId] = useState<string | null>(null);

  // Voting handler with optimistic UI updates
  const handleVote = async (feedbackId: string, voteType: 1 | -1) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (votingFeedbackId === feedbackId) return;
    setVotingFeedbackId(feedbackId);

    // Save previous state for rollback
    const previousFeedbacks = [...feedbacks];

    // Apply optimistic update
    setFeedbacks((prev) =>
      prev.map((post) => {
        if (post.id !== feedbackId) return post;

        const currentVote = post.userVote || 0;
        let nextVote: 1 | -1 | 0 = 0;
        let nextScore = post.score;
        let nextUpvotes = post.upvotesCount;
        let nextDownvotes = post.downvotesCount;

        if (currentVote === 0) {
          nextVote = voteType;
          if (voteType === 1) {
            nextScore += 1;
            nextUpvotes += 1;
          } else {
            nextScore -= 1;
            nextDownvotes += 1;
          }
        } else if (currentVote === voteType) {
          // Toggle off
          nextVote = 0;
          if (voteType === 1) {
            nextScore -= 1;
            nextUpvotes = Math.max(0, nextUpvotes - 1);
          } else {
            nextScore += 1;
            nextDownvotes = Math.max(0, nextDownvotes - 1);
          }
        } else {
          // Flip
          nextVote = voteType;
          if (voteType === 1) {
            nextScore += 2;
            nextUpvotes += 1;
            nextDownvotes = Math.max(0, nextDownvotes - 1);
          } else {
            nextScore -= 2;
            nextUpvotes = Math.max(0, nextUpvotes - 1);
            nextDownvotes += 1;
          }
        }

        return {
          ...post,
          score: nextScore,
          userVote: nextVote,
          upvotesCount: nextUpvotes,
          downvotesCount: nextDownvotes,
        };
      })
    );

    try {
      const res = await voteFeedbackAction(feedbackId, voteType);
      if (res.success) {
        setFeedbacks((prev) =>
          prev.map((post) => {
            if (post.id !== feedbackId) return post;
            return {
              ...post,
              score: res.score ?? post.score,
              userVote: res.userVote ?? post.userVote,
              upvotesCount: res.upvotesCount ?? post.upvotesCount,
              downvotesCount: res.downvotesCount ?? post.downvotesCount,
            };
          })
        );
      } else {
        // Rollback
        setFeedbacks(previousFeedbacks);
      }
    } catch {
      // Rollback on network/server error
      setFeedbacks(previousFeedbacks);
    } finally {
      setVotingFeedbackId(null);
    }
  };

  const handleFeedbackCreated = (newFeedback: FeedbackPost) => {
    setFeedbacks((prev) => [newFeedback, ...prev]);
  };

  // Filter and sort items
  const filteredFeedbacks = feedbacks.filter((post) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.itemTitle.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q) ||
      (post.authorName && post.authorName.toLowerCase().includes(q))
    );
  });

  const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // 'top': score desc, then createdAt desc
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="w-full space-y-6">
      {/* Feed Controls Header */}
      <div className="bg-white border border-[#e1e6f0] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-[20px] font-bold text-[#062a6e] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#c8102e]" />
              <span>Student Feedbacks</span>
            </h2>
            <p className="text-[13px] text-[#5a6580]">
              Real reviews and pictures of items bought from fellow Bennett students
            </p>
          </div>

          {/* Post Feedback CTA */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#062a6e] hover:bg-[#041b4d] text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-full shadow-sm transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-[#ff9aa9]" />
            <span>Post Feedback</span>
          </button>
        </div>

        {/* Search & Sort Pills Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-[#f3f5fa]">
          {/* Sort Buttons */}
          <div className="flex items-center gap-1.5 bg-[#f3f5fa] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSort('top')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
                sort === 'top'
                  ? 'bg-white text-[#062a6e] shadow-xs'
                  : 'text-[#5a6580] hover:text-[#14203b]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Top Voted</span>
            </button>

            <button
              type="button"
              onClick={() => setSort('newest')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
                sort === 'newest'
                  ? 'bg-white text-[#062a6e] shadow-xs'
                  : 'text-[#5a6580] hover:text-[#14203b]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Newest</span>
            </button>
          </div>

          {/* Keyword Search */}
          <div className="relative min-w-[220px] max-w-xs flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-[#5a6580] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews or items..."
              className="w-full pl-9 pr-3.5 py-1.5 text-[13px] border border-[#e1e6f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062a6e] transition-all bg-white"
            />
          </div>
        </div>
      </div>

      {/* Feedbacks List */}
      {sortedFeedbacks.length > 0 ? (
        <div className="space-y-3.5">
          {sortedFeedbacks.map((post) => (
            <FeedbackCard
              key={post.id}
              feedback={post}
              onVote={handleVote}
              currentUser={currentUser}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-[#e1e6f0] rounded-2xl p-8 sm:p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#f3f5fa] text-[#5a6580] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-[#062a6e]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[17px] font-bold text-[#14203b]">
              No feedback posts yet
            </h3>
            <p className="text-[13px] text-[#5a6580] max-w-sm mx-auto">
              Be the first Bennett student to share your review and experience of an item you bought!
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#062a6e] hover:bg-[#041b4d] text-white text-[13px] font-semibold px-4 py-2 rounded-full shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#ff9aa9]" />
            <span>Share first review</span>
          </button>
        </div>
      )}

      {/* Submission Modal */}
      <CreateFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        onFeedbackCreated={handleFeedbackCreated}
      />
    </div>
  );
}
