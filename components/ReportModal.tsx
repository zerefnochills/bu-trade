'use client';

// ============================================================================
// BU Trade — Listing Report Dialog Component
// Allows students to report listings with structured violation categories
// ============================================================================

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  X,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  REPORT_VIOLATION_CATEGORIES,
  REPORT_CATEGORY_DESCRIPTIONS,
  ReportViolationCategory,
} from '@/lib/reports/types';
import { submitReportAction } from '@/app/actions/reports';

export interface ReportModalProps {
  listingId: string;
  listingTitle?: string;
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: React.ReactNode;
  currentUser?: {
    id: string;
    email: string;
    fullName?: string;
  } | null;
  onSuccess?: (reportId: string) => void;
}

export default function ReportModal({
  listingId,
  listingTitle,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  trigger,
  currentUser,
  onSuccess,
}: ReportModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isModalOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const [selectedCategory, setSelectedCategory] = useState<ReportViolationCategory | ''>('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
    // Reset state after transition
    setTimeout(() => {
      setSelectedCategory('');
      setDetails('');
      setError(null);
      setIsSubmitted(false);
    }, 200);
  };

  const handleOpen = () => {
    if (!isControlled) {
      setInternalIsOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setError(null);

    startTransition(async () => {
      const result = await submitReportAction({
        listingId,
        reason: selectedCategory,
        details: details.trim() || undefined,
        reporterId: currentUser?.id,
      });

      if (result.success && result.report) {
        setIsSubmitted(true);
        if (onSuccess) {
          onSuccess(result.report.id);
        }
      } else {
        setError(result.error || 'Failed to submit report. Please try again.');
      }
    });
  };

  return (
    <>
      {trigger && (
        <span onClick={handleOpen} className="inline-block cursor-pointer">
          {trigger}
        </span>
      )}

      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#e1e6f0] shadow-2xl p-6 sm:p-7 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 text-[#5a6580] hover:text-[#14203b] hover:bg-[#f3f5fa] rounded-full transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success State */}
            {isSubmitted ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-[#e6f4ea] text-[#0a8a4a] rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#062a6e]">
                  Report submitted to moderators
                </h3>
                <p className="text-sm text-[#5a6580] max-w-sm mx-auto">
                  Thank you for keeping Bennett University marketplace safe. Our team will review this listing.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-4 px-6 py-2 bg-[#062a6e] hover:bg-[#041b4d] text-white text-sm font-semibold rounded-full shadow-sm transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#fee2e2] text-[#c8102e] flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2
                      id="report-modal-title"
                      className="text-lg sm:text-xl font-bold text-[#062a6e]"
                    >
                      Report this listing
                    </h2>
                    {listingTitle && (
                      <p className="text-xs text-[#5a6580] font-medium line-clamp-1 mt-0.5">
                        Item: <span className="text-[#14203b] font-semibold">{listingTitle}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Authentication Gate */}
                {!currentUser ? (
                  <div className="my-6 p-4 bg-[#fff5f6] border border-[#ffccd3] rounded-xl text-center space-y-3">
                    <ShieldAlert className="w-8 h-8 text-[#c8102e] mx-auto" />
                    <div>
                      <p className="text-sm font-semibold text-[#14203b]">
                        Sign in required to report
                      </p>
                      <p className="text-xs text-[#5a6580] mt-1">
                        You must be signed in with your @bennett.edu.in email to report a listing.
                        This helps keep our community authentic and prevents misuse.
                      </p>
                    </div>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#062a6e] hover:bg-[#041b4d] text-white text-xs font-semibold rounded-full shadow-sm transition-all"
                    >
                      <span>Sign in with Bennett email</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Error Notice */}
                    {error && (
                      <div className="p-3 bg-[#fff1f2] border border-[#ffccd3] rounded-xl text-xs text-[#c8102e]">
                        {error}
                      </div>
                    )}

                    {/* Category Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-[#14203b] uppercase tracking-wide mb-2">
                        Why are you reporting this listing? <span className="text-[#c8102e]">*</span>
                      </label>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {REPORT_VIOLATION_CATEGORIES.map((cat) => {
                          const isSelected = selectedCategory === cat;
                          const desc = REPORT_CATEGORY_DESCRIPTIONS[cat];
                          return (
                            <label
                              key={cat}
                              className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-[#c8102e] bg-[#fff5f6]'
                                  : 'border-[#e1e6f0] hover:bg-[#f8fafc]'
                              }`}
                            >
                              <input
                                type="radio"
                                name="reportCategory"
                                value={cat}
                                checked={isSelected}
                                onChange={() => setSelectedCategory(cat)}
                                className="mt-0.5 text-[#c8102e] focus:ring-[#c8102e]"
                              />
                              <div className="flex-1">
                                <span className="font-semibold text-[#14203b] block">{cat}</span>
                                <span className="text-[#5a6580] text-[11px] block mt-0.5">
                                  {desc.hint}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Details Textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="report-details"
                          className="block text-xs font-semibold text-[#14203b] uppercase tracking-wide"
                        >
                          Additional details <span className="text-[#5a6580] font-normal lowercase">(optional)</span>
                        </label>
                        <span className="text-[11px] text-[#5a6580]">
                          {details.length}/500
                        </span>
                      </div>
                      <textarea
                        id="report-details"
                        rows={3}
                        maxLength={500}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Please provide specifics (e.g. what makes this suspicious, what was disclosed, or meetup concerns)..."
                        className="w-full p-2.5 bg-white border border-[#e1e6f0] focus:border-[#062a6e] focus:ring-2 focus:ring-[#062a6e]/10 rounded-xl text-xs text-[#14203b] placeholder-[#5a6580]/50 outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Modal Buttons */}
                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#e1e6f0]">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 bg-[#f3f5fa] hover:bg-[#e1e6f0] text-[#14203b] text-xs font-semibold rounded-full transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isPending || !selectedCategory}
                        className="px-5 py-2 bg-[#c8102e] hover:bg-[#a60d26] text-white text-xs font-semibold rounded-full shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <span>Submit report</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
