import { isBennettEmail, normalizeEmail } from '@/lib/auth/validation';
import {
  serializeSession,
  parseSession,
  _setTestSession,
  getSession,
  createSession,
  destroySession,
} from '@/lib/auth/session';
import { requestOtpAction, verifyOtpAction, signOutAction } from '@/app/actions/auth';
import { MockDatabaseService } from '@/lib/db/mock';

describe('Email Domain Validation', () => {
  it('accepts standard Bennett student emails', () => {
    expect(isBennettEmail('aarav.sharma@bennett.edu.in')).toBe(true);
    expect(isBennettEmail('e21cse001@bennett.edu.in')).toBe(true);
    expect(isBennettEmail('student+trade@bennett.edu.in')).toBe(true);
  });

  it('handles case insensitivity and rejects untrimmed whitespace infiltration', () => {
    expect(isBennettEmail('STUDENT@BENNETT.EDU.IN')).toBe(true);
    expect(isBennettEmail('  aarav.s@bennett.edu.in  ')).toBe(false);
  });

  it('rejects external commercial email domains', () => {
    expect(isBennettEmail('user@gmail.com')).toBe(false);
    expect(isBennettEmail('user@yahoo.co.in')).toBe(false);
    expect(isBennettEmail('user@outlook.com')).toBe(false);
  });

  it('rejects phishing subdomains and incomplete domains', () => {
    expect(isBennettEmail('user@bennett.edu.in.evil.com')).toBe(false);
    expect(isBennettEmail('user@bennett.edu')).toBe(false);
    expect(isBennettEmail('user@bennett')).toBe(false);
    expect(isBennettEmail('@bennett.edu.in')).toBe(false);
    expect(isBennettEmail('user @bennett.edu.in')).toBe(false);
  });

  it('rejects empty, null, or non-string inputs safely', () => {
    expect(isBennettEmail('')).toBe(false);
    expect(isBennettEmail(null as unknown as string)).toBe(false);
    expect(isBennettEmail(undefined as unknown as string)).toBe(false);
  });

  it('normalizes email addresses consistently', () => {
    expect(normalizeEmail('  AARAV.S@BENNETT.EDU.IN  ')).toBe('aarav.s@bennett.edu.in');
    expect(normalizeEmail('')).toBe('');
    expect(normalizeEmail(null as unknown as string)).toBe('');
  });
});

describe('Session Serialization & Deserialization', () => {
  afterEach(() => {
    _setTestSession(null);
  });

  it('serializes and deserializes session with accurate properties', () => {
    const raw = {
      userId: 'test-user-1',
      id: 'test-user-1',
      email: 'test@bennett.edu.in',
      onboardingNeeded: false,
      isOnboarded: true,
      token: 'session_test_token',
    };

    const cookieStr = serializeSession(raw);
    expect(typeof cookieStr).toBe('string');

    const parsed = parseSession(cookieStr);
    expect(parsed).not.toBeNull();
    expect(parsed?.userId).toBe('test-user-1');
    expect(parsed?.email).toBe('test@bennett.edu.in');
    expect(parsed?.onboardingNeeded).toBe(false);
    expect(parsed?.isOnboarded).toBe(true);
  });

  it('handles invalid or empty cookie values gracefully', () => {
    expect(parseSession('')).toBeNull();
    expect(parseSession('invalid-json')).toBeNull();
    expect(parseSession(encodeURIComponent(JSON.stringify({ empty: true })))).toBeNull();
  });

  it('manages in-memory fallback session in test environment', async () => {
    const session = await createSession({
      userId: 'user_fallback_1',
      email: 'fallback@bennett.edu.in',
      onboardingNeeded: true,
    });

    expect(session.userId).toBe('user_fallback_1');
    expect(session.onboardingNeeded).toBe(true);
    expect(session.isOnboarded).toBe(false);

    const fetched = await getSession();
    expect(fetched?.userId).toBe('user_fallback_1');

    await destroySession();
    const afterDestroy = await getSession();
    expect(afterDestroy).toBeNull();
  });
});

describe('Authentication Server Actions', () => {
  beforeEach(() => {
    const db = new MockDatabaseService();
    db.init(true);
  });

  afterEach(async () => {
    await destroySession();
  });

  it('rejects OTP request for external non-Bennett domain', async () => {
    const res = await requestOtpAction(null, { email: 'intruder@gmail.com' });
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Only @bennett\.edu\.in/i);
  });

  it('succeeds OTP request for valid Bennett email', async () => {
    const res = await requestOtpAction(null, { email: 'student@bennett.edu.in' });
    expect(res.success).toBe(true);
    expect(res.data?.email).toBe('student@bennett.edu.in');
  });

  it('rejects OTP verification for incorrect code', async () => {
    const res = await verifyOtpAction(null, {
      email: 'student@bennett.edu.in',
      code: '999999',
    });
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Invalid verification code/i);
  });

  it('verifies mock OTP 123456 and sets onboardingNeeded: true for new email', async () => {
    const res = await verifyOtpAction(null, {
      email: 'brandnew.student@bennett.edu.in',
      code: '123456',
    });
    expect(res.success).toBe(true);
    expect(res.onboardingNeeded).toBe(true);
    expect(res.redirectTo).toBe('/onboarding');
  });

  it('verifies mock OTP 123456 and sets onboardingNeeded: false for existing seed student', async () => {
    // seed-user-1 is aarav.sharma@bennett.edu.in
    const res = await verifyOtpAction(null, {
      email: 'aarav.sharma@bennett.edu.in',
      code: '123456',
    });
    expect(res.success).toBe(true);
    expect(res.onboardingNeeded).toBe(false);
    expect(res.redirectTo).toBe('/');
  });

  it('sign out action terminates session and returns redirect', async () => {
    const res = await signOutAction();
    expect(res.success).toBe(true);
    expect(res.redirectTo).toBe('/login');
  });
});
