'use server';

// ============================================================================
// BU Trade — Trade/Borrow Server Actions (Milestone 4)
// Handling borrow & trade request submissions, filtering, and status updates
// ============================================================================

import { getDatabaseService } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import {
  BorrowTradeStatus,
  BorrowTradeType,
  CATEGORIES,
  ContactMethod,
  GetTradeBorrowOptions,
  ListingCategory,
  TradeBorrowRequest,
} from '@/lib/db/types';
import { revalidatePath } from 'next/cache';

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful outside Next.js request context (e.g. during test suites)
  }
}

export interface CreateTradeBorrowInput {
  title: string;
  description: string;
  requestType: BorrowTradeType;
  duration: string;
  category: ListingCategory;
  contactMethod: ContactMethod;
  contactValue: string;
  images?: string[];
}

export interface TradeBorrowActionResult {
  success: boolean;
  request?: TradeBorrowRequest;
  error?: string;
}

/**
 * Retrieves trade and borrow requests with optional filtering by type, category, or search keyword.
 */
export async function getTradeBorrowRequestsAction(
  filter?: GetTradeBorrowOptions
): Promise<TradeBorrowRequest[]> {
  try {
    const db = getDatabaseService();
    if (typeof db.getTradeBorrowRequests === 'function') {
      return await db.getTradeBorrowRequests(filter);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Creates a new borrow or trade request on the BU Trade campus marketplace.
 * Requires authenticated session with Bennett University credentials.
 */
export async function createTradeBorrowRequestAction(
  input: CreateTradeBorrowInput
): Promise<TradeBorrowActionResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return {
        success: false,
        error: 'Authentication required. Please sign in with your Bennett email to post requests.',
      };
    }

    const {
      title,
      description,
      requestType,
      duration,
      category,
      contactMethod,
      contactValue,
      images,
    } = input;

    // Validate title
    if (!title || typeof title !== 'string' || !title.trim()) {
      return {
        success: false,
        error: 'Title is required.',
      };
    }

    if (title.trim().length > 120) {
      return {
        success: false,
        error: 'Title cannot exceed 120 characters.',
      };
    }

    // Validate description
    if (!description || typeof description !== 'string' || !description.trim()) {
      return {
        success: false,
        error: 'Description is required.',
      };
    }

    // Validate requestType
    if (requestType !== 'borrow' && requestType !== 'trade') {
      return {
        success: false,
        error: 'Request type must be borrow or trade.',
      };
    }

    // Validate duration
    if (!duration || typeof duration !== 'string' || !duration.trim()) {
      return {
        success: false,
        error: 'Duration is required.',
      };
    }

    const trimmedDuration = duration.trim();

    if (trimmedDuration.length > 60) {
      return {
        success: false,
        error: 'Duration cannot exceed 60 characters.',
      };
    }

    if (/^-\s*\d/.test(trimmedDuration) || /-\d+/.test(trimmedDuration)) {
      return {
        success: false,
        error: 'Duration cannot be negative timeframe.',
      };
    }

    if (/^\s*0(\s+[a-zA-Z]+)?\s*$/.test(trimmedDuration)) {
      return {
        success: false,
        error: 'Duration cannot be zero timeframe.',
      };
    }

    // Validate category
    if (!category || !CATEGORIES.includes(category)) {
      return {
        success: false,
        error: 'Invalid category selected.',
      };
    }

    // Validate contactMethod
    if (contactMethod !== 'WhatsApp' && contactMethod !== 'Phone' && contactMethod !== 'Email') {
      return {
        success: false,
        error: 'Invalid contact method selected.',
      };
    }

    // Validate contactValue
    if (!contactValue || typeof contactValue !== 'string' || !contactValue.trim()) {
      return {
        success: false,
        error: 'Contact detail is required.',
      };
    }

    // Validate & clamp images to max 5
    const safeImages = Array.isArray(images)
      ? images.filter((img) => typeof img === 'string' && img.trim().length > 0).slice(0, 5)
      : [];

    const db = getDatabaseService();
    if (typeof db.createTradeBorrowRequest !== 'function') {
      return {
        success: false,
        error: 'Trade/Borrow service is unavailable.',
      };
    }

    const createdRequest = await db.createTradeBorrowRequest({
      userId: session.userId,
      title: title.trim(),
      description: description.trim(),
      requestType,
      duration: trimmedDuration,
      category,
      contactMethod,
      contactValue: contactValue.trim(),
      status: 'active',
      images: safeImages,
    });

    safeRevalidate('/trade-borrow');

    return {
      success: true,
      request: createdRequest,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to create request. Please try again.',
    };
  }
}

/**
 * Updates the status of an existing trade/borrow request (e.g. 'active', 'fulfilled', 'closed').
 * Requires authenticated owner.
 */
export async function updateTradeBorrowRequestStatusAction(
  id: string,
  status: BorrowTradeStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return {
        success: false,
        error: 'Authentication required. Please sign in to update request status.',
      };
    }

    if (!id || typeof id !== 'string') {
      return {
        success: false,
        error: 'Request ID is required.',
      };
    }

    const validStatuses: BorrowTradeStatus[] = ['active', 'fulfilled', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return {
        success: false,
        error: 'Invalid status transition.',
      };
    }

    const db = getDatabaseService();

    // Verify ownership
    if (typeof db.getTradeBorrowRequestById === 'function') {
      const existing = await db.getTradeBorrowRequestById(id);
      if (!existing) {
        return {
          success: false,
          error: 'Trade/Borrow request not found.',
        };
      }
      if (existing.userId !== session.userId) {
        return {
          success: false,
          error: 'Unauthorized: only the owner can modify request status.',
        };
      }
    }

    if (typeof db.updateTradeBorrowRequestStatus !== 'function') {
      return {
        success: false,
        error: 'Trade/Borrow service is unavailable.',
      };
    }

    await db.updateTradeBorrowRequestStatus(id, status, session.userId);
    safeRevalidate('/trade-borrow');

    return {
      success: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to update request status.',
    };
  }
}

/**
 * Deletes an existing trade/borrow request.
 * Requires authenticated owner.
 */
export async function deleteTradeBorrowRequestAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return {
        success: false,
        error: 'Authentication required. Please sign in to delete request.',
      };
    }

    if (!id || typeof id !== 'string') {
      return {
        success: false,
        error: 'Request ID is required.',
      };
    }

    const db = getDatabaseService();

    // Verify ownership
    if (typeof db.getTradeBorrowRequestById === 'function') {
      const existing = await db.getTradeBorrowRequestById(id);
      if (!existing) {
        return {
          success: false,
          error: 'Trade/Borrow request not found.',
        };
      }
      if (existing.userId !== session.userId) {
        return {
          success: false,
          error: 'Unauthorized: only the owner can delete request.',
        };
      }
    }

    if (typeof db.deleteTradeBorrowRequest !== 'function') {
      return {
        success: false,
        error: 'Trade/Borrow service is unavailable.',
      };
    }

    await db.deleteTradeBorrowRequest(id, session.userId);
    safeRevalidate('/trade-borrow');

    return {
      success: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to delete request.',
    };
  }
}
