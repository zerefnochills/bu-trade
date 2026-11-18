'use server';

// ============================================================================
// BU Trade — Authentication & Onboarding Server Actions
// ============================================================================

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getDatabaseService } from '@/lib/db';
import {
  isBennettEmail,
  normalizeEmail,
  validateOnboardingInput,
  OnboardingInput,
} from '@/lib/auth/validation';
import {
  createSession,
  getSession,
  updateSession,
  destroySession,
  PENDING_OTP_COOKIE_NAME,
  UserSession,
} from '@/lib/auth/session';

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful outside Next.js request context
  }
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  data?: T;
  redirectTo?: string;
  onboardingNeeded?: boolean;
}

/**
 * Step 1: Requests OTP for a Bennett email address.
 */
export async function requestOtpAction(
  prevState: unknown,
  payload?: FormData | { email: string }
): Promise<ActionResponse<{ email: string }>> {
  try {
    let email = '';
    if (payload instanceof FormData) {
      email = (payload.get('email') as string) || '';
    } else if (payload && typeof payload === 'object' && 'email' in payload) {
      email = payload.email || '';
    }

    email = email.trim();

    if (!email) {
      return { success: false, error: 'Please enter your Bennett University email address.' };
    }

    if (!isBennettEmail(email)) {
      return {
        success: false,
        error: 'Only @bennett.edu.in email addresses are permitted. External email domains are not allowed.',
      };
    }

    const normalized = normalizeEmail(email);
    const otpCode = '123456'; // Standard campus mock OTP for development & testing

    // Store pending OTP in short-lived cookie (10 minutes)
    try {
      const cookieStore = cookies();
      cookieStore.set(
        PENDING_OTP_COOKIE_NAME,
        JSON.stringify({ email: normalized, code: otpCode }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 10,
        }
      );
    } catch {
      // In non-header environments (e.g. unit tests)
    }

    return {
      success: true,
      message: 'Verification code sent to your Bennett email. (Mock code: 123456)',
      data: { email: normalized },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to request verification code. Please try again.',
    };
  }
}

/**
 * Step 2: Verifies OTP code and establishes authenticated user session.
 */
export async function verifyOtpAction(
  prevState: unknown,
  payload?: FormData | { email: string; code: string }
): Promise<ActionResponse<{ session: UserSession; onboardingNeeded: boolean; redirectTo: string }>> {
  try {
    let email = '';
    let code = '';

    if (payload instanceof FormData) {
      email = (payload.get('email') as string) || '';
      code = (payload.get('code') as string) || '';
    } else if (payload && typeof payload === 'object') {
      email = payload.email || '';
      code = payload.code || '';
    }

    email = email.trim();
    code = code.trim();

    if (!email || !isBennettEmail(email)) {
      return {
        success: false,
        error: 'Only @bennett.edu.in email addresses are permitted.',
      };
    }

    if (!code) {
      return { success: false, error: 'Please enter the 6-digit verification code.' };
    }

    const normalized = normalizeEmail(email);

    // Retrieve pending OTP from cookie
    let storedOtp = '123456';
    try {
      const cookieStore = cookies();
      const pendingCookie = cookieStore.get(PENDING_OTP_COOKIE_NAME);
      if (pendingCookie?.value) {
        const parsed = JSON.parse(pendingCookie.value);
        if (parsed.email === normalized && parsed.code) {
          storedOtp = parsed.code;
        }
      }
    } catch {
      // Handled gracefully
    }

    // Accept stored OTP or default mock OTP "123456"
    if (code !== storedOtp && code !== '123456') {
      return {
        success: false,
        error: 'Invalid verification code. Please check and try again (Mock code is 123456).',
      };
    }

    // Clean up pending OTP cookie
    try {
      const cookieStore = cookies();
      cookieStore.delete(PENDING_OTP_COOKIE_NAME);
    } catch {
      // Handled gracefully
    }

    // Check if profile exists for this Bennett email
    const db = getDatabaseService();
    const existingProfile = await db.getProfileByEmail(normalized);

    const userId = existingProfile
      ? existingProfile.id
      : `user_${normalized.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

    const onboardingNeeded = !existingProfile;

    // Create session cookie
    const session = await createSession({
      userId,
      email: normalized,
      onboardingNeeded,
    });

    const redirectTo = onboardingNeeded ? '/onboarding' : '/';

    safeRevalidate('/');
    return {
      success: true,
      onboardingNeeded,
      redirectTo,
      data: {
        session,
        onboardingNeeded,
        redirectTo,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to verify verification code.',
    };
  }
}

/**
 * Direct call / Server action to complete student onboarding.
 */
export async function completeOnboarding(
  input: OnboardingInput
): Promise<ActionResponse<{ profile: unknown; redirectTo: string }>> {
  try {
    const session = await getSession();
    if (!session || !session.userId || !session.email) {
      return {
        success: false,
        error: 'Authentication required. Please sign in with your Bennett email first.',
      };
    }

    const validation = validateOnboardingInput(input);
    if (!validation.isValid || !validation.cleaned) {
      return {
        success: false,
        error: 'Please correct the highlighted errors.',
        fieldErrors: validation.errors,
      };
    }

    const { fullName, course, year, residence, whatsapp } = validation.cleaned;
    const db = getDatabaseService();

    const existing = await db.getProfile(session.userId);
    let profile;

    if (existing) {
      profile = await db.updateProfile(session.userId, {
        fullName,
        course,
        year,
        residence,
        whatsapp,
      });
    } else {
      profile = await db.createProfile({
        id: session.userId,
        email: session.email,
        fullName,
        course,
        year,
        residence,
        whatsapp,
      });
    }

    // Mark session as onboarded
    await updateSession({
      onboardingNeeded: false,
      isOnboarded: true,
    });

    safeRevalidate('/');
    safeRevalidate('/profile');
    safeRevalidate('/sell');

    return {
      success: true,
      redirectTo: '/',
      data: {
        profile,
        redirectTo: '/',
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to complete profile onboarding.',
    };
  }
}

/**
 * Form action wrapper for completing onboarding.
 */
export async function completeOnboardingAction(
  prevState: unknown,
  payload?: FormData | OnboardingInput
): Promise<ActionResponse<{ redirectTo: string }>> {
  let input: OnboardingInput;

  if (payload instanceof FormData) {
    input = {
      fullName: (payload.get('fullName') as string) || '',
      course: (payload.get('course') as string) || '',
      year: Number(payload.get('year')) || 0,
      residence: (payload.get('residence') as string) || '',
      whatsapp: (payload.get('whatsapp') as string) || undefined,
    };
  } else if (payload && typeof payload === 'object') {
    input = payload;
  } else {
    input = { fullName: '', course: '', year: 0, residence: '' };
  }

  const result = await completeOnboarding(input);
  if (!result.success) {
    return {
      success: false,
      error: result.error,
      fieldErrors: result.fieldErrors,
    };
  }

  return {
    success: true,
    redirectTo: result.redirectTo || '/',
  };
}

/**
 * Destroys session and logs user out.
 */
export async function signOutAction(): Promise<ActionResponse<void>> {
  try {
    await destroySession();
    safeRevalidate('/');
    return {
      success: true,
      redirectTo: '/login',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to sign out.',
    };
  }
}
