// ============================================================================
// BU Trade — Authentication & Email Domain Validation
// Enforces @bennett.edu.in email domain restriction
// ============================================================================

export const BENNETT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@bennett\.edu\.in$/i;

/**
 * Validates whether an email address strictly belongs to Bennett University (@bennett.edu.in).
 */
export function isBennettEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return BENNETT_EMAIL_REGEX.test(email.trim());
}
