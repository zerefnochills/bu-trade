'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

export default function ShareButton({
  title,
  text = 'Check out this item on BU Trade (Bennett University Marketplace)',
  url,
  className = '',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    // 1. Try native Web Share API on mobile / Android / iOS
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${text}\n${title}`,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        // User cancelled or share dismissed
        if (err.name === 'AbortError') return;
      }
    }

    // 2. Fallback to clipboard copy
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Share listing with Bennett peers"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e1e6f0] bg-white hover:bg-[#f3f5fa] text-[#14203b] text-xs font-semibold shadow-xs transition-all active:scale-95 ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[#0a8a4a]" />
          <span className="text-[#0a8a4a]">Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-[#062a6e]" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}
