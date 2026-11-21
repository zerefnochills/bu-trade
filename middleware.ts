import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = request.cookies.get('bu_trade_session');

  let session: {
    userId?: string;
    id?: string;
    email?: string;
    onboardingNeeded?: boolean;
    isOnboarded?: boolean;
  } | null = null;

  if (sessionCookie?.value) {
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch {
      session = null;
    }
  }

  const isUserAuthenticated = Boolean(session && (session.userId || session.id) && session.email);
  const isOnboarded = Boolean(
    isUserAuthenticated &&
      (session?.onboardingNeeded === false || session?.isOnboarded === true)
  );

  const isMockMode =
    process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.trim() === '';

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isInvalidLiveSession =
    session && !isMockMode && session.userId && !UUID_REGEX.test(session.userId);

  if (isInvalidLiveSession) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('bu_trade_session');
    return response;
  }

  const isProtectedPath = pathname.startsWith('/profile') || pathname.includes('/edit');
  const isOnboardingPath = pathname === '/onboarding';
  const isLoginPath = pathname === '/login';

  // 1. Protected paths (/profile, /sell/:id/edit): require authentication + completed onboarding
  if (isProtectedPath) {
    if (!isUserAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    if (!isOnboarded) {
      const onboardingUrl = new URL('/onboarding', request.url);
      onboardingUrl.searchParams.set('redirectTo', pathname + search);
      return NextResponse.redirect(onboardingUrl);
    }
  }

  // 2. /onboarding path:
  // - If unauthenticated -> redirect to /login
  // - If already onboarded -> redirect to /profile
  if (isOnboardingPath) {
    if (!isUserAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', '/onboarding');
      return NextResponse.redirect(loginUrl);
    }

    if (isOnboarded) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  // 3. /login path:
  // - If authenticated and onboarded -> redirect to /
  // - If authenticated but not onboarded -> redirect to /onboarding
  if (isLoginPath && isUserAuthenticated) {
    if (isOnboarded) {
      return NextResponse.redirect(new URL('/', request.url));
    } else {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/sell/:id/edit', '/onboarding', '/login'],
};
