'use server';

// ============================================================================
// BU Trade — Protected Enquiry Server Actions
// ============================================================================

import { getDatabaseService } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { ContactMethod } from '@/lib/db/types';
import { revalidatePath } from 'next/cache';

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful outside Next.js request context
  }
}

export interface SubmitEnquiryInput {
  listingId: string;
  message?: string;
}

export interface SubmitEnquiryResult {
  success: boolean;
  contact?: {
    contactMethod: ContactMethod;
    contactValue: string;
  };
  error?: string;
}

export async function submitEnquiryAction(
  input: SubmitEnquiryInput
): Promise<SubmitEnquiryResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return {
        success: false,
        error: 'Authentication required. Please sign in with your Bennett email to contact the seller.',
      };
    }

    const { listingId } = input;
    if (!listingId || typeof listingId !== 'string') {
      return { success: false, error: 'Listing ID is required.' };
    }

    const db = getDatabaseService();
    const listing = await db.getListingById(listingId, session.userId);
    if (!listing) {
      return { success: false, error: 'Listing not found.' };
    }

    // If viewer is owner, return contact directly without enquiry
    if (listing.userId === session.userId) {
      const ownerContact = await db.getListingContact(listingId, session.userId);
      return {
        success: true,
        contact: ownerContact || undefined,
      };
    }

    const message = (input.message || '').trim() || 'Hi, is this still available?';

    // Avoid duplicate enquiry insertions if user already enquired
    const alreadyEnquired = await db.hasEnquired(listingId, session.userId);
    if (!alreadyEnquired) {
      await db.createEnquiry({
        listingId,
        buyerId: session.userId,
        message,
      });
    }

    // Now contact details are unlocked
    const contact = await db.getListingContact(listingId, session.userId);
    if (!contact) {
      return {
        success: false,
        error: 'Unable to retrieve seller contact details at this time.',
      };
    }

    safeRevalidate(`/item/${listingId}`);

    return {
      success: true,
      contact,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to submit enquiry.',
    };
  }
}
