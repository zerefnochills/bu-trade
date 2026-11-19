'use client';

// ============================================================================
// BU Trade — Protected Enquiry Modal Component
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { submitEnquiryAction } from '@/app/actions/enquiries';
import { ContactMethod } from '@/lib/db/types';
import {
  MessageSquare,
  ShieldCheck,
  X,
  Loader2,
  CheckCircle2,
  Phone,
  Mail,
  Send,
  ExternalLink,
  Info,
} from 'lucide-react';

export interface EnquiryModalProps {
  listingId: string;
  listingTitle: string;
  sellerName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: React.ReactNode;
  currentUser?: {
    id: string;
    email: string;
    fullName?: string;
  } | null;
  onSuccess?: (contact: { contactMethod: ContactMethod; contactValue: string }) => void;
}

const QUICK_QUESTION_CHIPS = [
  'Hi, is this still available?',
  'Can I inspect it at Student Center / CBC Cafeteria?',
  'Is the price negotiable?',
];

export default function EnquiryModal({
  listingId,
  listingTitle,
  sellerName = 'Bennett Student',
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  trigger,
  currentUser,
  onSuccess,
}: EnquiryModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isModalOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const [message, setMessage] = useState('Hi, is this still available?');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockedContact, setUnlockedContact] = useState<{
    contactMethod: ContactMethod;
    contactValue: string;
  } | null>(null);

  const openModal = () => {
    setError(null);
    if (!isControlled) setInternalIsOpen(true);
  };

  const closeModal = () => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleChipClick = (chipText: string) => {
    setMessage(chipText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setError(null);
    setLoading(true);

    try {
      const res = await submitEnquiryAction({
        listingId,
        message: message.trim() || 'Hi, is this still available?',
      });

      if (!res.success || !res.contact) {
        setError(res.error || 'Failed to submit enquiry. Please try again.');
        setLoading(false);
        return;
      }

      setUnlockedContact(res.contact);
      setLoading(false);
      if (onSuccess) {
        onSuccess(res.contact);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  // Helper for generating external contact links
  const getContactActionHref = (method: ContactMethod, value: string) => {
    const cleanNumber = value.replace(/[^0-9+]/g, '');
    if (method === 'WhatsApp') {
      const waNumber = cleanNumber.startsWith('+')
        ? cleanNumber.slice(1)
        : cleanNumber.startsWith('91')
        ? cleanNumber
        : `91${cleanNumber}`;
      const msg = encodeURIComponent(`Hi, I enquired about "${listingTitle}" on BU Trade.`);
      return `https://wa.me/${waNumber}?text=${msg}`;
    }
    if (method === 'Phone') {
      return `tel:${cleanNumber}`;
    }
    return `mailto:${value}?subject=${encodeURIComponent(`BU Trade: Enquiry for ${listingTitle}`)}`;
  };

  return (
    <>
      {/* Trigger element (if provided or fallback button) */}
      {trigger ? (
        <span onClick={openModal} className="cursor-pointer">
          {trigger}
        </span>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="w-full py-3 px-6 rounded-full bg-[#c8102e] hover:bg-[#a60d26] text-white font-bold text-[15px] shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Is this still available?</span>
        </button>
      )}

      {/* Modal Backdrop & Dialog */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 relative shadow-2xl border border-[#e1e6f0] animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#5a6580] hover:text-[#14203b] hover:bg-[#f3f5fa] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Unauthenticated View */}
            {!currentUser ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#062a6e]/10 text-[#062a6e] flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#062a6e]">
                    Bennett University Sign-in Required
                  </h3>
                  <p className="text-[13.5px] text-[#5a6580] max-w-sm mx-auto mt-1">
                    To protect seller privacy and maintain verified campus safety, only students with an active @bennett.edu.in account can enquire and reveal contact details.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href={`/login?redirectTo=${encodeURIComponent(`/item/${listingId}`)}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold text-[14px] shadow-sm transition-colors"
                  >
                    <span>Sign in with Bennett Email</span>
                  </Link>
                </div>
              </div>
            ) : unlockedContact ? (
              /* Success & Contact Revealed View */
              <div className="py-2 space-y-5">
                <div className="p-4 rounded-xl bg-[#0a8a4a]/10 border border-[#0a8a4a]/20 flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#0a8a4a] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[15px] font-bold text-[#0a8a4a]">
                      Enquiry Sent & Contact Unlocked!
                    </h4>
                    <p className="text-[12.5px] text-[#14203b] mt-0.5">
                      Your enquiry was delivered to {sellerName}. You can now connect directly:
                    </p>
                  </div>
                </div>

                {/* Contact Card */}
                <div className="p-5 rounded-xl bg-[#f3f5fa] border border-[#e1e6f0] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#5a6580] uppercase tracking-wider">
                      {unlockedContact.contactMethod} Contact
                    </span>
                    <span className="text-[11px] font-bold text-[#0a8a4a] bg-[#0a8a4a]/10 px-2.5 py-0.5 rounded-full">
                      Verified Seller
                    </span>
                  </div>

                  <div className="text-[18px] sm:text-[20px] font-bold text-[#062a6e] tracking-tight">
                    {unlockedContact.contactValue}
                  </div>

                  <a
                    href={getContactActionHref(
                      unlockedContact.contactMethod,
                      unlockedContact.contactValue
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#062a6e] hover:bg-[#041b4d] text-white font-semibold text-[13.5px] shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {unlockedContact.contactMethod === 'WhatsApp' ? (
                      <MessageSquare className="w-4 h-4 text-[#ff9aa9]" />
                    ) : unlockedContact.contactMethod === 'Phone' ? (
                      <Phone className="w-4 h-4 text-[#ff9aa9]" />
                    ) : (
                      <Mail className="w-4 h-4 text-[#ff9aa9]" />
                    )}
                    <span>
                      Open {unlockedContact.contactMethod} ({unlockedContact.contactValue})
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2 rounded-full border border-[#e1e6f0] text-[#5a6580] hover:bg-[#f3f5fa] text-[13px] font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Authenticated Form View */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#062a6e] bg-[#062a6e]/10 px-2.5 py-0.5 rounded-full mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Campus Protected Privacy</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#062a6e]">
                    Enquire to Unlock Contact
                  </h3>
                  <p className="text-[13px] text-[#5a6580] mt-0.5">
                    Sending an enquiry immediately unlocks {sellerName}&apos;s contact details.
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-[#c8102e]/10 border border-[#c8102e]/20 text-[#c8102e] text-[12.5px]">
                    {error}
                  </div>
                )}

                {/* Quick Chips */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#5a6580] mb-1.5">
                    Quick campus questions:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_QUESTION_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleChipClick(chip)}
                        className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors text-left ${
                          message === chip
                            ? 'bg-[#062a6e] text-white border-[#062a6e] font-medium'
                            : 'bg-[#f3f5fa] text-[#14203b] border-[#e1e6f0] hover:bg-[#e1e6f0]'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Textarea */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#14203b] mb-1">
                    Your message
                  </label>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about condition, pick-up location, or price..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e1e6f0] bg-white text-[13.5px] text-[#14203b] focus:outline-none focus:border-[#062a6e] focus:ring-1 focus:ring-[#062a6e]"
                  />
                  <div className="text-[11px] text-[#5a6580] text-right mt-0.5">
                    {message.length} / 300 characters
                  </div>
                </div>

                {/* Safety Note */}
                <p className="text-[11.5px] text-[#5a6580] bg-[#f3f5fa] p-2.5 rounded-xl border border-[#e1e6f0] flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#062a6e] shrink-0" />
                  <span><strong>Campus Tip:</strong> Always meet in public campus areas (CBC Cafeteria, Student Center, or Central Library) during daylight hours.</span>
                </p>

                {/* Modal Actions */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-full border border-[#e1e6f0] text-[#5a6580] hover:bg-[#f3f5fa] text-[13px] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-full bg-[#c8102e] hover:bg-[#a60d26] text-white font-semibold text-[13.5px] shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send & Unlock Contact</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
