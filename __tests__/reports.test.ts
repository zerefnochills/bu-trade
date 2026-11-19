import { MockDatabaseService } from '@/lib/db/mock';
import { REPORT_VIOLATION_CATEGORIES } from '@/lib/reports/types';
import { submitReportAction } from '@/app/actions/reports';
import { _setTestSession } from '@/lib/auth/session';

describe('Moderation & Reports Database Service', () => {
  let db: MockDatabaseService;

  beforeEach(() => {
    db = new MockDatabaseService();
    db.init(true);
  });

  it('creates and persists a report with status pending', async () => {
    const report = await db.createReport({
      listingId: 'seed-listing-1',
      reporterId: 'seed-user-2',
      reason: 'Prohibited item',
      details: 'Seller is listing unapproved electronic heaters.',
    });

    expect(report.id).toMatch(/^rep-/);
    expect(report.listingId).toBe('seed-listing-1');
    expect(report.reporterId).toBe('seed-user-2');
    expect(report.reason).toBe('Prohibited item');
    expect(report.details).toBe('Seller is listing unapproved electronic heaters.');
    expect(report.status).toBe('pending');
    expect(new Date(report.createdAt).getTime()).not.toBeNaN();
  });

  it('throws an error if attempting to create report on non-existent listing', async () => {
    await expect(
      db.createReport({
        listingId: 'nonexistent-listing-9999',
        reporterId: 'seed-user-2',
        reason: 'Prohibited item',
        details: 'Fake listing report attempt',
      })
    ).rejects.toThrow('Listing not found: nonexistent-listing-9999');
  });

  it('retrieves reports in chronological descending order', async () => {
    await db.createReport({
      listingId: 'seed-listing-1',
      reporterId: 'seed-user-2',
      reason: 'Counterfeit/fake',
      details: 'Oldest report',
    });

    await db.createReport({
      listingId: 'seed-listing-2',
      reporterId: 'seed-user-3',
      reason: 'Safety concern',
      details: 'Newer report',
    });

    const reports = await db.getReports();
    expect(reports.length).toBe(2);
    expect(new Date(reports[0].createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(reports[1].createdAt).getTime()
    );
  });

  it('contains all 6 required violation categories in constants', () => {
    expect(REPORT_VIOLATION_CATEGORIES).toEqual([
      'Prohibited item',
      'Counterfeit/fake',
      'Inappropriate behavior/harassment',
      'Wrong category/spam',
      'Misleading price/condition',
      'Safety concern',
    ]);
  });
});

describe('Report Server Action', () => {
  beforeEach(() => {
    _setTestSession(null);
  });

  afterEach(() => {
    _setTestSession(null);
  });

  it('rejects report submission if reporter is not authenticated', async () => {
    _setTestSession(null);

    const result = await submitReportAction({
      listingId: 'seed-listing-1',
      reason: 'Prohibited item',
      details: 'Some violation',
      reporterId: '', // unauthenticated
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Authentication required/i);
  });

  it('rejects report submission even if client supplies reporterId when unauthenticated (spoofing prevention)', async () => {
    _setTestSession(null);

    const result = await submitReportAction({
      listingId: 'seed-listing-1',
      reason: 'Prohibited item',
      details: 'Attempted spoofed report',
      reporterId: 'attacker-spoofed-user-id',
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Authentication required/i);
  });

  it('strictly overrides client reporterId with authenticated session userId', async () => {
    _setTestSession({
      userId: 'seed-user-2',
      id: 'seed-user-2',
      email: 'rohan.gupta@bennett.edu.in',
      onboardingNeeded: false,
      isOnboarded: true,
    });

    const result = await submitReportAction({
      listingId: 'seed-listing-1',
      reason: 'Safety concern',
      details: 'Meetup concern',
      reporterId: 'malicious-spoofed-identity',
    });

    expect(result.success).toBe(true);
    expect(result.report).toBeDefined();
    expect(result.report?.reporterId).toBe('seed-user-2');
    expect(result.report?.reporterId).not.toBe('malicious-spoofed-identity');
  });

  it('rejects report submission on non-existent listing with "Listing not found."', async () => {
    _setTestSession({
      userId: 'seed-user-2',
      id: 'seed-user-2',
      email: 'rohan.gupta@bennett.edu.in',
      onboardingNeeded: false,
      isOnboarded: true,
    });

    const result = await submitReportAction({
      listingId: 'nonexistent-listing-9999',
      reason: 'Prohibited item',
      details: 'Dangling report attempt',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Listing not found.');
  });

  it('rejects report submission if listing ID is missing or empty', async () => {
    _setTestSession({
      userId: 'seed-user-2',
      id: 'seed-user-2',
      email: 'rohan.gupta@bennett.edu.in',
      onboardingNeeded: false,
      isOnboarded: true,
    });

    const result = await submitReportAction({
      listingId: '   ',
      reason: 'Prohibited item',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Listing ID is required.');
  });

  it('rejects invalid violation categories', async () => {
    _setTestSession({
      userId: 'seed-user-2',
      id: 'seed-user-2',
      email: 'rohan.gupta@bennett.edu.in',
      onboardingNeeded: false,
      isOnboarded: true,
    });

    const result = await submitReportAction({
      listingId: 'seed-listing-1',
      reason: 'Invalid category not in list',
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Invalid violation category/i);
  });

  it('successfully creates report with valid parameters for authenticated user', async () => {
    _setTestSession({
      userId: 'seed-user-2',
      id: 'seed-user-2',
      email: 'rohan.gupta@bennett.edu.in',
      onboardingNeeded: false,
      isOnboarded: true,
    });

    const result = await submitReportAction({
      listingId: 'seed-listing-1',
      reason: 'Safety concern',
      details: 'Seller asked to meet outside campus at midnight.',
    });

    expect(result.success).toBe(true);
    expect(result.report?.id).toBeDefined();
    expect(result.report?.status).toBe('pending');
    expect(result.report?.reporterId).toBe('seed-user-2');
  });
});
