'use server';

// ============================================================================
// BU Trade — Listing Moderation Report Server Actions
// ============================================================================

import { getDatabaseService } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { REPORT_VIOLATION_CATEGORIES, ReportViolationCategory } from '@/lib/reports/types';
import { Report } from '@/lib/db/types';

export interface SubmitReportInput {
  listingId: string;
  reason: string;
  details?: string;
  reporterId?: string;
}

export interface SubmitReportResult {
  success: boolean;
  report?: Report;
  error?: string;
}

export async function submitReportAction(
  input: SubmitReportInput
): Promise<SubmitReportResult> {
  try {
    const { listingId, reason, details } = input;

    // 1. Validate listing ID
    if (!listingId || typeof listingId !== 'string' || listingId.trim() === '') {
      return { success: false, error: 'Listing ID is required.' };
    }

    // 2. Validate violation category
    if (!reason || !REPORT_VIOLATION_CATEGORIES.includes(reason as ReportViolationCategory)) {
      return {
        success: false,
        error: `Invalid violation category. Must be one of: ${REPORT_VIOLATION_CATEGORIES.join(', ')}`,
      };
    }

    // 3. Authenticate reporter
    let effectiveReporterId = input.reporterId?.trim();
    if (!effectiveReporterId) {
      const session = await getSession();
      if (session?.userId) {
        effectiveReporterId = session.userId;
      }
    }

    if (!effectiveReporterId) {
      return {
        success: false,
        error: 'Authentication required. You must be signed in with your Bennett email to report a listing.',
      };
    }

    // 4. Sanitize details
    const sanitizedDetails = details ? details.trim().slice(0, 500) : undefined;

    // 5. Persist via IDatabaseService
    const db = getDatabaseService();
    const createdReport = await db.createReport({
      listingId: listingId.trim(),
      reporterId: effectiveReporterId,
      reason,
      details: sanitizedDetails,
    });

    return {
      success: true,
      report: createdReport,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred while submitting your report.',
    };
  }
}
