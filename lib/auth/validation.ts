// ============================================================================
// BU Trade — Authentication & Email Domain Validation
// Enforces @bennett.edu.in email domain restriction and student onboarding
// ============================================================================

export const BENNETT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@bennett\.edu\.in$/i;

/**
 * Validates whether an email address strictly belongs to Bennett University (@bennett.edu.in).
 */
export function isBennettEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return BENNETT_EMAIL_REGEX.test(email);
}

/**
 * Normalizes email address for consistent case-insensitive storage and lookups.
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

export const RESIDENCES = ['Hostel', 'Day scholar'] as const;
export type Residence = (typeof RESIDENCES)[number];

export const VALID_YEARS = [1, 2, 3, 4, 5] as const;

export const BENNETT_COURSES = [
  'B.Tech Computer Science & Engineering (CSE)',
  'B.Tech Electronics & Communication Engineering (ECE)',
  'B.Tech Biotechnology',
  'BCA / MCA',
  'BBA',
  'MBA',
  'BA LLB (Hons)',
  'BBA LLB (Hons)',
  'BA Journalism & Mass Communication (BA JMC)',
  'B.Des',
  'Ph.D.',
] as const;

/**
 * Validates optional Indian mobile/WhatsApp numbers (10 digits, optional +91 prefix).
 */
export function isValidWhatsApp(phone?: string): boolean {
  if (!phone || phone.trim() === '') return true;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
}

export interface OnboardingInput {
  fullName: string;
  course: string;
  year: number | string;
  residence: string;
  whatsapp?: string;
}

export interface OnboardingValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  cleaned?: {
    fullName: string;
    course: string;
    year: number;
    residence: Residence;
    whatsapp?: string;
  };
}

/**
 * Validates student onboarding input data.
 */
export function validateOnboardingInput(data: OnboardingInput): OnboardingValidationResult {
  const errors: Record<string, string> = {};

  const fullName = (data.fullName || '').trim();
  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2 || fullName.length > 60) {
    errors.fullName = 'Full name must be between 2 and 60 characters.';
  }

  const course = (data.course || '').trim();
  if (!course) {
    errors.course = 'Course / Program is required.';
  } else if (course.length < 2 || course.length > 100) {
    errors.course = 'Course must be between 2 and 100 characters.';
  }

  const numYear = Number(data.year);
  if (!Number.isInteger(numYear) || numYear < 1 || numYear > 5) {
    errors.year = 'Academic year must be an integer between 1 and 5.';
  }

  const res = data.residence;
  if (res !== 'Hostel' && res !== 'Day scholar') {
    errors.residence = "Residence must be 'Hostel' or 'Day scholar'.";
  }

  const wa = (data.whatsapp || '').trim();
  if (wa && !isValidWhatsApp(wa)) {
    errors.whatsapp = 'Please enter a valid 10-digit WhatsApp number (e.g. +91 9876543210).';
  }

  const isValid = Object.keys(errors).length === 0;
  return {
    isValid,
    errors,
    cleaned: isValid
      ? {
          fullName,
          course,
          year: numYear,
          residence: res as Residence,
          whatsapp: wa || undefined,
        }
      : undefined,
  };
}

export interface SignUpInput {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName: string;
  enrollmentNo?: string;
  course: string;
  section?: string;
  year: number | string;
  residence: string;
  whatsapp: string;
}

export interface SignUpValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  cleaned?: {
    email: string;
    password: string;
    fullName: string;
    enrollmentNo: string;
    course: string;
    section: string;
    year: number;
    residence: Residence;
    whatsapp: string;
  };
}

/**
 * Validates complete student account creation input.
 */
export function validateSignUpInput(data: SignUpInput): SignUpValidationResult {
  const errors: Record<string, string> = {};

  const rawEmail = (data.email || '').trim();
  if (!rawEmail) {
    errors.email = 'Bennett University email is required.';
  } else if (!isBennettEmail(rawEmail)) {
    errors.email = 'Only @bennett.edu.in email addresses are permitted.';
  }

  const password = data.password || '';
  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (data.confirmPassword !== undefined && data.confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  const fullName = (data.fullName || '').trim();
  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2 || fullName.length > 60) {
    errors.fullName = 'Full name must be between 2 and 60 characters.';
  }

  const enrollmentNo = (data.enrollmentNo || '').trim().toUpperCase();
  const course = (data.course || '').trim();
  if (!course) {
    errors.course = 'Course / Program is required.';
  }

  const section = (data.section || '').trim().toUpperCase();

  const numYear = Number(data.year);
  if (!Number.isInteger(numYear) || numYear < 1 || numYear > 5) {
    errors.year = 'Academic year must be between 1 and 5.';
  }

  const res = data.residence;
  if (res !== 'Hostel' && res !== 'Day scholar') {
    errors.residence = "Residence must be 'Hostel' or 'Day scholar'.";
  }

  const wa = (data.whatsapp || '').trim();
  if (!wa) {
    errors.whatsapp = 'WhatsApp number is required to coordinate campus trades.';
  } else if (!isValidWhatsApp(wa)) {
    errors.whatsapp = 'Please enter a valid 10-digit Indian WhatsApp number (e.g. 9876543210).';
  }

  const isValid = Object.keys(errors).length === 0;
  return {
    isValid,
    errors,
    cleaned: isValid
      ? {
          email: normalizeEmail(rawEmail),
          password,
          fullName,
          enrollmentNo: enrollmentNo || rawEmail.split('@')[0].toUpperCase(),
          course,
          section,
          year: numYear,
          residence: res as Residence,
          whatsapp: wa.startsWith('+91') ? wa : `+91 ${wa.replace(/\s+/g, '')}`,
        }
      : undefined,
  };
}
