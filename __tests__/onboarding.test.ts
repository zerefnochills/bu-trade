import {
  validateOnboardingInput,
  isValidWhatsApp,
  BENNETT_COURSES,
  RESIDENCES,
  VALID_YEARS,
} from '@/lib/auth/validation';
import { completeOnboarding } from '@/app/actions/auth';
import { _setTestSession, createSession, destroySession, getSession } from '@/lib/auth/session';
import { MockDatabaseService } from '@/lib/db/mock';

describe('Onboarding Input Validation', () => {
  it('accepts completely valid onboarding input with WhatsApp', () => {
    const result = validateOnboardingInput({
      fullName: 'Aarav Sharma',
      course: 'B.Tech Computer Science & Engineering (CSE)',
      year: 3,
      residence: 'Hostel',
      whatsapp: '+91 9876543210',
    });

    expect(result.isValid).toBe(true);
    expect(result.cleaned).toEqual({
      fullName: 'Aarav Sharma',
      course: 'B.Tech Computer Science & Engineering (CSE)',
      year: 3,
      residence: 'Hostel',
      whatsapp: '+91 9876543210',
    });
  });

  it('accepts valid Day scholar student without WhatsApp', () => {
    const result = validateOnboardingInput({
      fullName: 'Mehak Verma',
      course: 'BBA',
      year: 2,
      residence: 'Day scholar',
    });

    expect(result.isValid).toBe(true);
    expect(result.cleaned?.residence).toBe('Day scholar');
    expect(result.cleaned?.whatsapp).toBeUndefined();
  });

  it('accepts year boundaries 1 and 5', () => {
    const minYear = validateOnboardingInput({
      fullName: 'Student One',
      course: 'B.Tech CSE',
      year: 1,
      residence: 'Hostel',
    });
    expect(minYear.isValid).toBe(true);
    expect(minYear.cleaned?.year).toBe(1);

    const maxYear = validateOnboardingInput({
      fullName: 'Student Five',
      course: 'BA LLB (Hons)',
      year: 5,
      residence: 'Hostel',
    });
    expect(maxYear.isValid).toBe(true);
    expect(maxYear.cleaned?.year).toBe(5);
  });

  it('rejects year below 1 (year 0)', () => {
    const result = validateOnboardingInput({
      fullName: 'Student Zero',
      course: 'B.Tech CSE',
      year: 0,
      residence: 'Hostel',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.year).toBe('Academic year must be an integer between 1 and 5.');
  });

  it('rejects year above 5 (year 6)', () => {
    const result = validateOnboardingInput({
      fullName: 'Student Six',
      course: 'B.Tech CSE',
      year: 6,
      residence: 'Hostel',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.year).toBe('Academic year must be an integer between 1 and 5.');
  });

  it('rejects non-integer year (year 2.5)', () => {
    const result = validateOnboardingInput({
      fullName: 'Student Float',
      course: 'B.Tech CSE',
      year: 2.5,
      residence: 'Hostel',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.year).toBe('Academic year must be an integer between 1 and 5.');
  });

  it('rejects residence values outside allowed enum', () => {
    const result = validateOnboardingInput({
      fullName: 'Student OffCampus',
      course: 'B.Tech CSE',
      year: 3,
      residence: 'Off-Campus PG',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.residence).toBe("Residence must be 'Hostel' or 'Day scholar'.");
  });

  it('rejects empty or too short full name and course', () => {
    const result = validateOnboardingInput({
      fullName: ' ',
      course: ' ',
      year: 1,
      residence: 'Hostel',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.fullName).toBeDefined();
    expect(result.errors.course).toBeDefined();
  });

  it('validates WhatsApp phone number formats', () => {
    expect(isValidWhatsApp('+91 9876543210')).toBe(true);
    expect(isValidWhatsApp('9876543210')).toBe(true);
    expect(isValidWhatsApp('+919876543210')).toBe(true);
    expect(isValidWhatsApp('12345')).toBe(false);
    expect(isValidWhatsApp('abcdefghij')).toBe(false);
    expect(isValidWhatsApp('')).toBe(true);
    expect(isValidWhatsApp(undefined)).toBe(true);
  });

  it('provides Bennett courses list and residence options', () => {
    expect(BENNETT_COURSES.length).toBeGreaterThanOrEqual(10);
    expect(RESIDENCES).toEqual(['Hostel', 'Day scholar']);
    expect(VALID_YEARS).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('Onboarding Server Action', () => {
  let db: MockDatabaseService;

  beforeEach(() => {
    db = new MockDatabaseService();
    db.init(true);
  });

  afterEach(async () => {
    await destroySession();
  });

  it('rejects onboarding submission if caller is not authenticated', async () => {
    _setTestSession(null);
    const result = await completeOnboarding({
      fullName: 'Anonymous User',
      course: 'B.Tech CSE',
      year: 1,
      residence: 'Hostel',
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Authentication required/i);
  });

  it('creates profile and marks session as onboarded', async () => {
    await createSession({
      userId: 'test_student_new_1',
      email: 'newstudent@bennett.edu.in',
      onboardingNeeded: true,
    });

    const result = await completeOnboarding({
      fullName: 'Rohan Gupta',
      course: 'B.Tech Electronics & Communication Engineering (ECE)',
      year: 2,
      residence: 'Hostel',
      whatsapp: '+91 9811122233',
    });

    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/');

    // Verify DB persistence
    const saved = await db.getProfile('test_student_new_1');
    expect(saved).not.toBeNull();
    expect(saved?.fullName).toBe('Rohan Gupta');
    expect(saved?.course).toBe('B.Tech Electronics & Communication Engineering (ECE)');
    expect(saved?.year).toBe(2);
    expect(saved?.residence).toBe('Hostel');
    expect(saved?.whatsapp).toBe('+91 9811122233');

    // Verify session update
    const session = await getSession();
    expect(session?.onboardingNeeded).toBe(false);
    expect(session?.isOnboarded).toBe(true);
  });

  it('updates existing profile when onboarded student resubmits', async () => {
    // seed-user-1 is Aarav Sharma
    await createSession({
      userId: 'seed-user-1',
      email: 'aarav.sharma@bennett.edu.in',
      onboardingNeeded: false,
    });

    const result = await completeOnboarding({
      fullName: 'Aarav Sharma',
      course: 'B.Tech Computer Science & Engineering (CSE)',
      year: 4,
      residence: 'Day scholar',
    });

    expect(result.success).toBe(true);
    const updated = await db.getProfile('seed-user-1');
    expect(updated?.residence).toBe('Day scholar');
    expect(updated?.year).toBe(4);
  });
});
