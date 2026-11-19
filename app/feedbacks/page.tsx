import React from 'react';
import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { getDatabaseService } from '@/lib/db';
import { FeedbackPost } from '@/lib/db/types';
import FeedbackFeed from '@/components/FeedbackFeed';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Feedbacks & Reviews | BU Trade',
  description: 'Verified student reviews and photos of campus marketplace items at Bennett University.',
};

export default async function FeedbacksPage() {
  const session = await getSession();
  const db = getDatabaseService();

  let initialFeedbacks: FeedbackPost[] = [];
  if (typeof db.getFeedbackPosts === 'function') {
    initialFeedbacks = await db.getFeedbackPosts({
      sort: 'top',
      viewerId: session?.userId,
    });
  }

  const currentUser = session
    ? {
        id: session.userId,
        email: session.email,
      }
    : null;

  return (
    <main className="min-h-screen bg-[#f8fafc] py-6 sm:py-8">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 space-y-6">
        {/* Clean & Minimal Hero Section */}
        <div className="bg-gradient-to-r from-[#062a6e] to-[#041b4d] rounded-2xl p-5 sm:p-7 text-white shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#dbe4ff] text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff9aa9]" />
              <span>Community Reviews</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Student Feedbacks
            </h1>
            <p className="text-xs sm:text-sm text-[#dbe4ff]">
              Verified peer reviews and item photos from Bennett campus transactions.
            </p>
          </div>
        </div>

        {/* Feedback Feed Client Component */}
        <FeedbackFeed
          initialFeedbacks={initialFeedbacks}
          currentUser={currentUser}
        />
      </div>
    </main>
  );
}
