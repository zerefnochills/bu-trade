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
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#062a6e] to-[#041b4d] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#dbe4ff] text-[12px] font-medium backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff9aa9]" />
              <span>Bennett Community Verified</span>
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight text-white leading-tight">
              Student Feedbacks & Reviews
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#dbe4ff] leading-relaxed">
              Read transparent reviews from fellow Bennett University students who bought cycles,
              calculators, lab coats, and books right here on campus. Upvote helpful feedback!
            </p>
          </div>
        </div>

        {/* Feed Component */}
        <FeedbackFeed
          initialFeedbacks={initialFeedbacks}
          currentUser={currentUser}
        />
      </div>
    </main>
  );
}
