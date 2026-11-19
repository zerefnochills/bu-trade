'use server';

// ============================================================================
// BU Trade — Feedback & Reddit Voting Server Actions
// ============================================================================

import { getDatabaseService } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { FeedbackPost } from '@/lib/db/types';
import { revalidatePath } from 'next/cache';

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful outside Next.js request context (e.g. during test suites)
  }
}

export interface CreateFeedbackInput {
  itemTitle: string;
  content: string;
  rating?: number;
  images?: string[];
  listingId?: string;
}

export interface FeedbackActionResult {
  success: boolean;
  feedback?: FeedbackPost;
  error?: string;
}

export interface VoteActionResult {
  success: boolean;
  score?: number;
  userVote?: 1 | -1 | 0;
  upvotesCount?: number;
  downvotesCount?: number;
  error?: string;
}

/**
 * Retrieves feedback posts with joined author info and current viewer's vote status.
 */
export async function getFeedbacksAction(
  sort?: 'top' | 'newest'
): Promise<FeedbackPost[]> {
  const session = await getSession();
  const db = getDatabaseService();

  if (typeof db.getFeedbackPosts === 'function') {
    return await db.getFeedbackPosts({
      sort: sort || 'top',
      viewerId: session?.userId,
    });
  }

  return [];
}

/**
 * Creates a new student feedback post for a bought item.
 * Requires authenticated session with Bennett University email.
 */
export async function createFeedbackAction(
  input: CreateFeedbackInput
): Promise<FeedbackActionResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return {
        success: false,
        error: 'Authentication required. Please sign in with your Bennett email to share feedback.',
      };
    }

    const { itemTitle, content, rating, images, listingId } = input;

    // Validate itemTitle
    if (!itemTitle || typeof itemTitle !== 'string' || !itemTitle.trim()) {
      return {
        success: false,
        error: 'Title is required.',
      };
    }

    if (itemTitle.trim().length > 120) {
      return {
        success: false,
        error: 'Title cannot exceed 120 characters.',
      };
    }

    // Validate content
    if (!content || typeof content !== 'string' || !content.trim()) {
      return {
        success: false,
        error: 'Content is required.',
      };
    }

    if (content.trim().length > 2000) {
      return {
        success: false,
        error: 'Content cannot exceed 2000 characters.',
      };
    }

    // Validate rating (optional 1-5 integer)
    if (rating !== undefined && rating !== null) {
      if (typeof rating !== 'number' || !Number.isInteger(rating)) {
        return {
          success: false,
          error: 'Rating must be an integer between 1 and 5.',
        };
      }
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: 'Rating must be between 1 and 5.',
        };
      }
    }

    // Validate & cap images at 3
    const safeImages = Array.isArray(images)
      ? images.filter((img) => typeof img === 'string' && img.trim().length > 0).slice(0, 3)
      : [];

    const db = getDatabaseService();
    if (typeof db.createFeedbackPost !== 'function') {
      return {
        success: false,
        error: 'Feedback service is unavailable.',
      };
    }

    const createdPost = await db.createFeedbackPost({
      userId: session.userId,
      itemTitle: itemTitle.trim(),
      content: content.trim(),
      rating: rating ?? undefined,
      images: safeImages,
      listingId: listingId?.trim() || undefined,
    });

    safeRevalidate('/feedbacks');

    return {
      success: true,
      feedback: createdPost,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to submit feedback. Please try again.',
    };
  }
}

/**
 * Casts, flips, or toggles off a Reddit-style upvote (+1) or downvote (-1).
 * Requires authenticated session.
 */
export async function voteFeedbackAction(
  feedbackId: string,
  voteType: 1 | -1
): Promise<VoteActionResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return {
        success: false,
        error: 'Authentication required. Please sign in with your Bennett email to vote on feedback.',
      };
    }

    if (!feedbackId || typeof feedbackId !== 'string') {
      return {
        success: false,
        error: 'Feedback ID is required.',
      };
    }

    if (voteType !== 1 && voteType !== -1) {
      return {
        success: false,
        error: 'Invalid vote type. Must be 1 (upvote) or -1 (downvote).',
      };
    }

    const db = getDatabaseService();
    if (typeof db.voteFeedbackPost !== 'function') {
      return {
        success: false,
        error: 'Voting service is unavailable.',
      };
    }

    const result = await db.voteFeedbackPost(feedbackId, session.userId, voteType);
    safeRevalidate('/feedbacks');

    return {
      success: true,
      score: result.score,
      userVote: result.userVote,
      upvotesCount: result.upvotesCount,
      downvotesCount: result.downvotesCount,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Feedback not found or vote failed.',
    };
  }
}
