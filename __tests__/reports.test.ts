import { MockDatabaseService } from '@/lib/db/mock';
import { REPORT_VIOLATION_CATEGORIES } from '@/lib/reports/types';
import { submitReportAction } from '@/app/actions/reports';

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
  it('rejects report submission if reporter is not authenticated', async () => {
    const result = await submitReportAction({
      listingId: 'seed-listing-1',
      reason: 'Prohibited item',
      details: 'Some violation',
      reporterId: '', // unauthenticated
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Authentication required/i);
  });

  it('rejects invalid violation categories', async () => {
    const result = await submitReportAction({
      listingId: 'seed-listing-1',
      reason: 'Invalid category not in list',
      reporterId: 'seed-user-2',
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Invalid violation category/i);
  });

  it('successfully creates report with valid parameters', async () => {
    const result = await submitReportAction({
      listingId: 'seed-listing-1',
      reason: 'Safety concern',
      details: 'Seller asked to meet outside campus at midnight.',
      reporterId: 'seed-user-2',
    });

    expect(result.success).toBe(true);
    expect(result.report?.id).toBeDefined();
    expect(result.report?.status).toBe('pending');
  });
});
