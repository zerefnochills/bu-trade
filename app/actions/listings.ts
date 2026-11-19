'use server';

// ============================================================================
// BU Trade — Listing Management Server Actions
// ============================================================================

import { getDatabaseService } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { CATEGORIES, ContactMethod, Listing, ListingCategory, ListingStatus } from '@/lib/db/types';
import { revalidatePath } from 'next/cache';

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful outside Next.js request context
  }
}

export interface CreateListingInput {
  title: string;
  price: number;
  category: ListingCategory;
  age: string;
  reason: string;
  description?: string;
  contactMethod: ContactMethod;
  contactValue: string;
  images?: string[];
}

export interface UpdateListingInput {
  id: string;
  title?: string;
  price?: number;
  category?: ListingCategory;
  age?: string;
  reason?: string;
  description?: string;
  contactMethod?: ContactMethod;
  contactValue?: string;
  status?: ListingStatus;
  images?: string[];
}

export interface ListingActionResult {
  success: boolean;
  listing?: Listing;
  error?: string;
}

export async function createListingAction(
  input: CreateListingInput
): Promise<ListingActionResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return {
        success: false,
        error: 'Authentication required. Please sign in with your Bennett email to create a listing.',
      };
    }

    const title = (input.title || '').trim();
    if (!title) {
      return { success: false, error: 'Title is required and cannot be empty' };
    }
    if (title.length > 120) {
      return { success: false, error: 'Title cannot exceed 120 characters' };
    }

    const price = Number(input.price);
    if (isNaN(price) || price < 0) {
      return { success: false, error: 'Price cannot be negative' };
    }

    if (!input.category || !CATEGORIES.includes(input.category)) {
      return {
        success: false,
        error: `Invalid category selected. Must be one of: ${CATEGORIES.join(', ')}`,
      };
    }

    const age = (input.age || '').trim();
    if (!age) {
      return { success: false, error: 'Age of item is required' };
    }

    const reason = (input.reason || '').trim();
    if (!reason) {
      return { success: false, error: 'Reason for selling is required' };
    }

    const validMethods: ContactMethod[] = ['WhatsApp', 'Phone', 'Email'];
    if (!validMethods.includes(input.contactMethod)) {
      return { success: false, error: 'Invalid contact method. Must be WhatsApp, Phone, or Email' };
    }

    const contactValue = (input.contactValue || '').trim();
    if (!contactValue) {
      return { success: false, error: 'Contact detail is required' };
    }

    const db = getDatabaseService();
    const activeCount = await db.countActiveListings(session.userId);
    if (activeCount >= 10) {
      return {
        success: false,
        error: 'Active listing limit reached: Each student can have a maximum of 10 active listings. Active listing limit of 10 reached',
      };
    }

    const images = Array.isArray(input.images) ? input.images.slice(0, 5) : [];

    const created = await db.createListing({
      userId: session.userId,
      title,
      price,
      category: input.category,
      age,
      reason,
      description: (input.description || '').trim(),
      contactMethod: input.contactMethod,
      contactValue,
      status: 'active',
      images,
    });

    safeRevalidate('/');
    safeRevalidate('/sell');
    safeRevalidate('/profile');

    return { success: true, listing: created };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create listing' };
  }
}

export async function updateListingAction(
  input: UpdateListingInput
): Promise<ListingActionResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return {
        success: false,
        error: 'Authentication required. Please sign in to update listing.',
      };
    }

    const db = getDatabaseService();
    const existing = await db.getListingById(input.id, session.userId);
    if (!existing) {
      return { success: false, error: `Listing not found: ${input.id}` };
    }

    const profile = await db.getProfile(session.userId);
    if (existing.userId !== session.userId && !profile?.isModerator) {
      return {
        success: false,
        error: 'Unauthorized: Only the listing owner can update this listing',
      };
    }

    if (input.price !== undefined && (isNaN(Number(input.price)) || Number(input.price) < 0)) {
      return { success: false, error: 'Price cannot be negative' };
    }

    if (input.title !== undefined) {
      const trimmed = input.title.trim();
      if (!trimmed) {
        return { success: false, error: 'Title is required and cannot be empty' };
      }
      if (trimmed.length > 120) {
        return { success: false, error: 'Title cannot exceed 120 characters' };
      }
    }

    if (input.category !== undefined && !CATEGORIES.includes(input.category)) {
      return { success: false, error: 'Invalid category selected' };
    }

    if (input.status === 'active' && existing.status !== 'active') {
      const activeCount = await db.countActiveListings(session.userId);
      if (activeCount >= 10) {
        return {
          success: false,
          error: 'Active listing limit reached: Each student can have a maximum of 10 active listings. Active listing limit of 10 reached',
        };
      }
    }

    const updates: Partial<Listing> = {};
    if (input.title !== undefined) updates.title = input.title.trim();
    if (input.price !== undefined) updates.price = Number(input.price);
    if (input.category !== undefined) updates.category = input.category;
    if (input.age !== undefined) updates.age = input.age.trim();
    if (input.reason !== undefined) updates.reason = input.reason.trim();
    if (input.description !== undefined) updates.description = input.description.trim();
    if (input.contactMethod !== undefined) updates.contactMethod = input.contactMethod;
    if (input.contactValue !== undefined) updates.contactValue = input.contactValue.trim();
    if (input.status !== undefined) updates.status = input.status;
    if (input.images !== undefined) updates.images = input.images.slice(0, 5);

    const updated = await db.updateListing(input.id, updates, session.userId);

    safeRevalidate('/');
    safeRevalidate('/sell');
    safeRevalidate('/profile');
    safeRevalidate(`/item/${input.id}`);
    safeRevalidate(`/sell/${input.id}/edit`);

    return { success: true, listing: updated };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update listing' };
  }
}

export async function changeListingStatusAction(
  id: string,
  status: ListingStatus
): Promise<ListingActionResult> {
  return updateListingAction({ id, status });
}

export async function deleteListingAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: 'Authentication required.' };
    }

    const db = getDatabaseService();
    await db.deleteListing(id, session.userId);

    safeRevalidate('/');
    safeRevalidate('/profile');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete listing' };
  }
}
