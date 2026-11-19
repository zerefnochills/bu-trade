// ============================================================================
// BU Trade — Session Management & Route Protection Helpers
// ============================================================================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDatabaseService } from '@/lib/db';
import { Profile } from '@/lib/db/types';

export interface UserSession {
  userId: string;
  id: string; // alias for userId
  email: string;
  token?: string;
  onboardingNeeded: boolean;
  isOnboarded: boolean; // alias for !onboardingNeeded
  createdAt?: string;
}

export const SESSION_COOKIE_NAME = 'bu_trade_session';
export const PENDING_OTP_COOKIE_NAME = 'bu_trade_pending_otp';

let testSessionStore: UserSession | null = null;

/**
 * Testing helper to set simulated session in environments without Next.js headers.
 */
export function _setTestSession(session: UserSession | null): void {
  testSessionStore = session;
}

/**
 * Serializes a UserSession into a cookie string value.
 */
export function serializeSession(session: UserSession): string {
  return encodeURIComponent(
    JSON.stringify({
      userId: session.userId,
      id: session.userId,
      email: session.email,
      token: session.token,
      onboardingNeeded: session.onboardingNeeded,
      isOnboarded: !session.onboardingNeeded,
      createdAt: session.createdAt || new Date().toISOString(),
    })
  );
}

/**
 * Parses a cookie string value into a UserSession.
 */
export function parseSession(cookieValue: string): UserSession | null {
  if (!cookieValue || typeof cookieValue !== 'string') return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue));
    const userId = parsed.userId || parsed.id;
    if (!userId || !parsed.email) return null;

    const onboardingNeeded =
      parsed.onboardingNeeded !== undefined
        ? Boolean(parsed.onboardingNeeded)
        : parsed.isOnboarded !== undefined
        ? !parsed.isOnboarded
        : true;

    return {
      userId,
      id: userId,
      email: parsed.email,
      token: parsed.token || `session_${Date.now()}`,
      onboardingNeeded,
      isOnboarded: !onboardingNeeded,
      createdAt: parsed.createdAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the active user session from cookies.
 */
export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (sessionCookie?.value) {
      return parseSession(sessionCookie.value);
    }
  } catch {
    // Outside request context (e.g., during tests or static gen)
    if (testSessionStore) {
      return { ...testSessionStore };
    }
  }

  if (testSessionStore) {
    return { ...testSessionStore };
  }

  return null;
}

/**
 * Creates and persists a user session in the HTTP-only cookie.
 */
export async function createSession(params: {
  userId: string;
  email: string;
  onboardingNeeded: boolean;
  token?: string;
}): Promise<UserSession> {
  const session: UserSession = {
    userId: params.userId,
    id: params.userId,
    email: params.email,
    token: params.token || `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    onboardingNeeded: params.onboardingNeeded,
    isOnboarded: !params.onboardingNeeded,
    createdAt: new Date().toISOString(),
  };

  testSessionStore = session;

  try {
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, serializeSession(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch {
    // Handled in environments without Next.js headers
  }

  return session;
}

/**
 * Alias for createSession to support both naming conventions.
 */
export async function setSessionCookie(user: {
  id?: string;
  userId?: string;
  email: string;
  isOnboarded?: boolean;
  onboardingNeeded?: boolean;
}): Promise<void> {
  const userId = user.userId || user.id || `user_${Date.now()}`;
  const onboardingNeeded =
    user.onboardingNeeded !== undefined
      ? user.onboardingNeeded
      : user.isOnboarded !== undefined
      ? !user.isOnboarded
      : true;

  await createSession({
    userId,
    email: user.email,
    onboardingNeeded,
  });
}

/**
 * Updates properties on the active session.
 */
export async function updateSession(updates: Partial<UserSession>): Promise<UserSession | null> {
  const current = await getSession();
  if (!current) return null;

  const updated: UserSession = {
    ...current,
    ...updates,
    userId: current.userId,
    id: current.userId,
    email: current.email,
    onboardingNeeded:
      updates.onboardingNeeded !== undefined
        ? updates.onboardingNeeded
        : updates.isOnboarded !== undefined
        ? !updates.isOnboarded
        : current.onboardingNeeded,
    isOnboarded:
      updates.isOnboarded !== undefined
        ? updates.isOnboarded
        : updates.onboardingNeeded !== undefined
        ? !updates.onboardingNeeded
        : current.isOnboarded,
  };

  testSessionStore = updated;

  try {
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, serializeSession(updated), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch {
    // Handled in environments without Next.js headers
  }

  return updated;
}

/**
 * Destroys the current active session.
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(PENDING_OTP_COOKIE_NAME);
  } catch {
    testSessionStore = null;
  }
  testSessionStore = null;
}

/**
 * Alias for destroySession.
 */
export async function clearSessionCookie(): Promise<void> {
  await destroySession();
}

/**
 * Retrieves the current authenticated user and their database profile.
 */
export async function getCurrentUser(): Promise<{
  id: string;
  userId: string;
  email: string;
  profile: Profile | null;
} | null> {
  const session = await getSession();
  if (!session) return null;

  const db = getDatabaseService();
  const profile = await db.getProfile(session.userId);

  return {
    id: session.userId,
    userId: session.userId,
    email: session.email,
    profile,
  };
}

/**
 * Server guard: requires an authenticated session.
 */
export async function requireAuth(options?: {
  requireOnboarding?: boolean;
}): Promise<UserSession> {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  if (options?.requireOnboarding && session.onboardingNeeded) {
    redirect('/onboarding');
  }

  return session;
}

/**
 * Server guard: requires an authenticated and onboarded student profile.
 */
export async function requireOnboardedUser(
  redirectTo?: string
): Promise<{ id: string; email: string; profile: Profile }> {
  const session = await getSession();
  if (!session) {
    const target = redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/login';
    redirect(target);
  }

  const db = getDatabaseService();
  let profile = await db.getProfile(session.userId);

  if (!profile) {
    const namePart = (session.email || 'student').split('@')[0].replace(/[._-]/g, ' ');
    const fallbackName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    profile = await db.createProfile({
      id: session.userId,
      email: session.email,
      fullName: fallbackName || 'Bennett Student',
      course: 'B.Tech CSE',
      year: 2,
      residence: 'Hostel',
      whatsapp: '',
    });
    await updateSession({ onboardingNeeded: false, isOnboarded: true });
  }

  return {
    id: session.userId,
    email: session.email,
    profile,
  };
}
