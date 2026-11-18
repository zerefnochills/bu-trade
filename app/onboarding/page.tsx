import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getDatabaseService } from '@/lib/db';
import OnboardingForm from './OnboardingForm';

interface OnboardingPageProps {
  searchParams: {
    redirectTo?: string;
  };
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const session = await getSession();

  // If not authenticated, redirect to login
  if (!session) {
    const target = searchParams?.redirectTo
      ? `/login?redirectTo=${encodeURIComponent(searchParams.redirectTo)}`
      : '/login?redirectTo=/onboarding';
    redirect(target);
  }

  // If already onboarded, verify with DB
  if (!session.onboardingNeeded) {
    const db = getDatabaseService();
    const profile = await db.getProfile(session.userId);
    if (profile) {
      redirect(searchParams?.redirectTo || '/profile');
    }
  }

  return (
    <div className="flex-1 bg-white py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <OnboardingForm
        userEmail={session.email}
        redirectTo={searchParams?.redirectTo || '/'}
      />
    </div>
  );
}
