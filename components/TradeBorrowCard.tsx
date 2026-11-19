'use client';

// ============================================================================
// BU Trade — TradeBorrowCard Component (Milestone 4)
// Card display for Borrow & Trade requests with prominent duration, category,
// requester details, and direct contact CTAs.
// ============================================================================

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Clock,
  Repeat,
  Handshake,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertCircle,
  Tag,
  User,
} from 'lucide-react';
import { BorrowTradeStatus, TradeBorrowRequest } from '@/lib/db/types';
import {
  updateTradeBorrowRequestStatusAction,
  deleteTradeBorrowRequestAction,
} from '@/app/actions/trade-borrow';

export interface TradeBorrowCardProps {
  request: TradeBorrowRequest;
  currentUser?: { id: string; email?: string } | null;
  onStatusChange?: (id: string, status: BorrowTradeStatus) => void;
  onDelete?: (id: string) => void;
}

export default function TradeBorrowCard({
  request,
  currentUser,
  onStatusChange,
  onDelete,
}: TradeBorrowCardProps) {
  const [status, setStatus] = useState<BorrowTradeStatus>(request.status);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isOwner = currentUser && currentUser.id === request.userId;
  const isBorrow = request.requestType === 'borrow';

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(isoString).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  const cleanContactNumber = (val: string) => {
    return val.replace(/[^0-9+]/g, '');
  };

  const getContactHref = () => {
    const val = request.contactValue.trim();
    if (request.contactMethod === 'WhatsApp') {
      const cleanNum = cleanContactNumber(val).replace('+', '');
      return `https://wa.me/${cleanNum}`;
    }
    if (request.contactMethod === 'Phone') {
      return `tel:${cleanContactNumber(val)}`;
    }
    if (request.contactMethod === 'Email') {
      return `mailto:${val}`;
    }
    return '#';
  };

  const handleStatusUpdate = async (nextStatus: BorrowTradeStatus) => {
    if (updating) return;
    setUpdating(true);
    setActionError(null);
    try {
      const res = await updateTradeBorrowRequestStatusAction(request.id, nextStatus);
      if (res.success) {
        setStatus(nextStatus);
        if (onStatusChange) {
          onStatusChange(request.id, nextStatus);
        }
      } else {
        setActionError(res.error || 'Failed to update status.');
      }
    } catch (err: any) {
      setActionError(err?.message || 'Error updating status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (updating) return;
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    setUpdating(true);
    setActionError(null);
    try {
      const res = await deleteTradeBorrowRequestAction(request.id);
      if (res.success) {
        if (onDelete) {
          onDelete(request.id);
        }
      } else {
        setActionError(res.error || 'Failed to delete request.');
      }
    } catch (err: any) {
      setActionError(err?.message || 'Error deleting request.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
        status === 'fulfilled'
          ? 'border-emerald-200 bg-emerald-50/20'
          : status === 'closed'
          ? 'border-gray-200 opacity-75'
          : 'border-[#e1e6f0]'
      }`}
    >
      <div className="p-5 space-y-4">
        {/* Top Badges Header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Request Type Badge */}
            {isBorrow ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-[#062a6e] border border-blue-200 shadow-2xs">
                <Handshake className="w-3.5 h-3.5 text-[#062a6e]" />
                BORROW
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs">
                <Repeat className="w-3.5 h-3.5 text-amber-800" />
                TRADE
              </span>
            )}

            {/* Category Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#f3f5fa] text-[#4b5563] border border-[#e5e7eb]">
              <Tag className="w-3 h-3 text-[#6b7280]" />
              {request.category}
            </span>

            {/* Status Indicator if not active */}
            {status === 'fulfilled' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                Fulfilled
              </span>
            )}
            {status === 'closed' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                <XCircle className="w-3 h-3" />
                Closed
              </span>
            )}
          </div>

          {/* Duration Pill Indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Duration: {request.duration}</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-[#062a6e] leading-snug tracking-tight">
            {request.title}
          </h2>
          <p className="text-[14px] text-[#374151] leading-relaxed whitespace-pre-line">
            {request.description}
          </p>
        </div>

        {/* Image Gallery */}
        {request.images && request.images.length > 0 && (
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
            {request.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-[#e5e7eb] flex-shrink-0 hover:opacity-90 transition-opacity focus:outline-hidden focus:ring-2 focus:ring-[#062a6e]"
              >
                {/* Fallback support for data URLs / plain img in test and browser */}
                <img
                  src={img}
                  alt={`${request.title} photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Requester Profile and Contact Banner */}
        <div className="pt-3 border-t border-[#f0f2f5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6b7280]">
          {/* Requester Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#062a6e] text-white font-bold flex items-center justify-center text-xs shadow-2xs">
              {request.requesterName ? request.requesterName.charAt(0).toUpperCase() : 'B'}
            </div>
            <div>
              <div className="font-semibold text-[#1f2937]">
                {request.requesterName || 'Bennett Student'}
              </div>
              <div className="text-[11px] text-[#6b7280]">
                {request.requesterCourse ? `${request.requesterCourse}` : 'Bennett University'}
                {request.requesterYear ? ` • Year ${request.requesterYear}` : ''}
                {' • '}
                <span>{formatRelativeTime(request.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Contact Details & CTA */}
          <div className="flex items-center gap-2">
            <a
              href={getContactHref()}
              target={request.contactMethod === 'WhatsApp' ? '_blank' : undefined}
              rel={request.contactMethod === 'WhatsApp' ? 'noopener noreferrer' : undefined}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs ${
                request.contactMethod === 'WhatsApp'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : request.contactMethod === 'Phone'
                  ? 'bg-[#062a6e] hover:bg-[#041b4d] text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {request.contactMethod === 'WhatsApp' && <MessageCircle className="w-3.5 h-3.5" />}
              {request.contactMethod === 'Phone' && <Phone className="w-3.5 h-3.5" />}
              {request.contactMethod === 'Email' && <Mail className="w-3.5 h-3.5" />}
              <span>{request.contactMethod}: {request.contactValue}</span>
            </a>
          </div>
        </div>

        {/* Owner Management Controls */}
        {isOwner && (
          <div className="pt-2 border-t border-dashed border-[#e5e7eb] flex items-center justify-between gap-2 flex-wrap text-xs">
            <span className="text-[#6b7280] font-medium">Manage your request:</span>
            <div className="flex items-center gap-2">
              {status === 'active' && (
                <>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusUpdate('fulfilled')}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium border border-emerald-200 transition-colors disabled:opacity-50"
                  >
                    Mark Fulfilled
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusUpdate('closed')}
                    className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium border border-gray-300 transition-colors disabled:opacity-50"
                  >
                    Close
                  </button>
                </>
              )}
              {status !== 'active' && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusUpdate('active')}
                  className="px-2.5 py-1 rounded-md bg-blue-50 text-[#062a6e] hover:bg-blue-100 font-medium border border-blue-200 transition-colors disabled:opacity-50"
                >
                  Re-open
                </button>
              )}
              <button
                type="button"
                disabled={updating}
                onClick={handleDelete}
                className="p-1 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                title="Delete request"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error message display if action failed */}
        {actionError && (
          <div className="p-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* Full Image Modal */}
      {selectedImage && (
        <div
          role="dialog"
          aria-label="Enlarged photo preview"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-transparent">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-gray-800 font-bold shadow-md flex items-center justify-center hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
