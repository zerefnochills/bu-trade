import { MockDatabaseService } from '@/lib/db/mock';
import { isBennettEmail } from '@/lib/auth/validation';

describe('Auth Domain Validation', () => {
  it('allows valid @bennett.edu.in emails', () => {
    expect(isBennettEmail('student@bennett.edu.in')).toBe(true);
    expect(isBennettEmail('aarav.sharma@bennett.edu.in')).toBe(true);
    expect(isBennettEmail('faculty_12@bennett.edu.in')).toBe(true);
  });

  it('rejects external or malformed emails', () => {
    expect(isBennettEmail('user@gmail.com')).toBe(false);
    expect(isBennettEmail('user@yahoo.com')).toBe(false);
    expect(isBennettEmail('user@bennett.edu')).toBe(false);
    expect(isBennettEmail('user@otherbennett.edu.in')).toBe(false);
    expect(isBennettEmail('')).toBe(false);
    expect(isBennettEmail('invalid-email')).toBe(false);
    // T2.01.6: Untrimmed emails with leading or trailing whitespace must return false
    expect(isBennettEmail(' user@bennett.edu.in ')).toBe(false);
    expect(isBennettEmail('user@bennett.edu.in ')).toBe(false);
    expect(isBennettEmail(' user@bennett.edu.in')).toBe(false);
  });
});

describe('Database Service & Privacy Protection', () => {
  let db: MockDatabaseService;

  beforeEach(() => {
    db = new MockDatabaseService();
    db.init(true); // force reset to pristine seed state
  });

  it('initializes with seed profiles and listings', async () => {
    const listings = await db.getListings();
    expect(listings.length).toBeGreaterThanOrEqual(6);

    const profile = await db.getProfile('seed-user-1');
    expect(profile).not.toBeNull();
    expect(profile?.email).toBe('aarav.sharma@bennett.edu.in');
  });

  it('redacts seller contact value for unauthenticated visitors', async () => {
    const listings = await db.getListings({ viewerId: undefined });
    expect(listings.length).toBeGreaterThan(0);

    for (const listing of listings) {
      expect(listing.contactValue).toBeUndefined();
      expect(listing.hasUnlockedContact).toBe(false);
    }
  });

  it('reveals seller contact value to the listing owner', async () => {
    const listing = await db.getListingById('seed-listing-1', 'seed-user-1');
    expect(listing).not.toBeNull();
    expect(listing?.contactValue).toBe('+91 98765 43210');
    expect(listing?.hasUnlockedContact).toBe(true);
  });

  it('reveals seller contact value only after buyer submits an enquiry', async () => {
    const buyerId = 'seed-user-2';
    const listingId = 'seed-listing-1';

    // Prior to enquiry: contact is hidden
    const beforeListing = await db.getListingById(listingId, buyerId);
    expect(beforeListing?.contactValue).toBeUndefined();
    expect(beforeListing?.hasUnlockedContact).toBe(false);

    // Attempting to call getListingContact directly throws access denied
    await expect(db.getListingContact(listingId, buyerId)).rejects.toThrow(
      'Access denied: You must enquire on this listing before viewing seller contact details.'
    );

    // Buyer creates an enquiry
    await db.createEnquiry({
      listingId,
      buyerId,
      message: 'Hi Aarav, is the Hero Sprint cycle still available on campus?',
    });

    // Check hasEnquired returns true
    const hasEnquired = await db.hasEnquired(listingId, buyerId);
    expect(hasEnquired).toBe(true);

    // After enquiry: listing includes unmasked contactValue
    const afterListing = await db.getListingById(listingId, buyerId);
    expect(afterListing?.contactValue).toBe('+91 98765 43210');
    expect(afterListing?.hasUnlockedContact).toBe(true);

    // getListingContact returns contact method and value
    const contactInfo = await db.getListingContact(listingId, buyerId);
    expect(contactInfo).toEqual({
      contactMethod: 'WhatsApp',
      contactValue: '+91 98765 43210',
    });
  });

  it('enforces active listing cap (maximum 10 active listings per user)', async () => {
    const testUserId = 'test-cap-user';
    await db.createProfile({
      id: testUserId,
      email: 'cap.test@bennett.edu.in',
      fullName: 'Cap Tester',
      course: 'B.Tech CSE',
      year: 2,
      residence: 'Hostel',
    });

    // User creates 10 active listings
    for (let i = 1; i <= 10; i++) {
      await db.createListing({
        userId: testUserId,
        title: `Test Item ${i}`,
        price: 100 * i,
        category: 'Books & notes',
        age: '1 year',
        reason: 'Testing limit',
        description: `Description for item ${i}`,
        contactMethod: 'Email',
        contactValue: 'cap.test@bennett.edu.in',
        status: 'active',
        images: [],
      });
    }

    const count = await db.countActiveListings(testUserId);
    expect(count).toBe(10);

    // 11th active listing must throw active listing limit reached
    await expect(
      db.createListing({
        userId: testUserId,
        title: 'Test Item 11',
        price: 1100,
        category: 'Books & notes',
        age: '1 year',
        reason: 'Testing limit overflow',
        description: 'Should fail',
        contactMethod: 'Email',
        contactValue: 'cap.test@bennett.edu.in',
        status: 'active',
        images: [],
      })
    ).rejects.toThrow(
      'Active listing limit reached: Each student can have a maximum of 10 active listings.'
    );
  });

  it('enforces active listing cap under concurrent Promise.all bursts', async () => {
    const concurrentUserId = 'test-concurrent-user';
    await db.createProfile({
      id: concurrentUserId,
      email: 'concurrent@bennett.edu.in',
      fullName: 'Concurrent Tester',
      course: 'B.Tech CSE',
      year: 3,
      residence: 'Hostel',
    });

    // Seed 9 active items
    for (let i = 1; i <= 9; i++) {
      await db.createListing({
        userId: concurrentUserId,
        title: `Pre Item ${i}`,
        price: 100 * i,
        category: 'Books & notes',
        age: '1 year',
        reason: 'Testing',
        description: 'Desc',
        contactMethod: 'Email',
        contactValue: 'concurrent@bennett.edu.in',
        status: 'active',
        images: [],
      });
    }

    const initialCount = await db.countActiveListings(concurrentUserId);
    expect(initialCount).toBe(9);

    // Launch 5 concurrent createListing calls via Promise.allSettled
    const results = await Promise.allSettled(
      Array.from({ length: 5 }, (_, i) =>
        db.createListing({
          userId: concurrentUserId,
          title: `Concurrent Burst ${i}`,
          price: 100,
          category: 'Books & notes',
          age: '1 year',
          reason: 'Burst test',
          description: 'Desc',
          contactMethod: 'Email',
          contactValue: 'concurrent@bennett.edu.in',
          status: 'active',
          images: [],
        })
      )
    );

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(4);

    const finalCount = await db.countActiveListings(concurrentUserId);
    expect(finalCount).toBe(10);
  });

  it('validates database trigger constraints on listings and profiles', async () => {
    const validUserId = 'seed-user-1';

    // Negative price rejection
    await expect(
      db.createListing({
        userId: validUserId,
        title: 'Negative Price Item',
        price: -50,
        category: 'Electronics',
        age: '1 year',
        reason: 'Testing',
        description: 'Desc',
        contactMethod: 'Email',
        contactValue: 'test@bennett.edu.in',
        status: 'active',
        images: [],
      })
    ).rejects.toThrow('Price cannot be negative');

    // Empty or whitespace title rejection
    await expect(
      db.createListing({
        userId: validUserId,
        title: '   ',
        price: 50,
        category: 'Electronics',
        age: '1 year',
        reason: 'Testing',
        description: 'Desc',
        contactMethod: 'Email',
        contactValue: 'test@bennett.edu.in',
        status: 'active',
        images: [],
      })
    ).rejects.toThrow('Title is required and cannot be empty');

    // Invalid status enum rejection
    await expect(
      db.createListing({
        userId: validUserId,
        title: 'Invalid Status Item',
        price: 50,
        category: 'Electronics',
        age: '1 year',
        reason: 'Testing',
        description: 'Desc',
        contactMethod: 'Email',
        contactValue: 'test@bennett.edu.in',
        status: 'corrupted' as any,
        images: [],
      })
    ).rejects.toThrow("Invalid status: must be 'active', 'sold', or 'delisted'");

    // 6 images truncated to 5
    const listingWith6Images = await db.createListing({
      userId: validUserId,
      title: 'Six Images Item',
      price: 150,
      category: 'Electronics',
      age: '1 year',
      reason: 'Testing',
      description: 'Desc',
      contactMethod: 'Email',
      contactValue: 'test@bennett.edu.in',
      status: 'active',
      images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'],
    });
    expect(listingWith6Images.images.length).toBe(5);
    expect(listingWith6Images.images).toEqual(['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg']);

    // Academic year bounds
    await expect(
      db.createProfile({
        id: 'user-invalid-year-0',
        email: 'year0@bennett.edu.in',
        fullName: 'Year Zero',
        course: 'B.Tech',
        year: 0,
        residence: 'Hostel',
      })
    ).rejects.toThrow('Academic year must be an integer between 1 and 5');

    await expect(
      db.createProfile({
        id: 'user-invalid-year-6',
        email: 'year6@bennett.edu.in',
        fullName: 'Year Six',
        course: 'B.Tech',
        year: 6,
        residence: 'Hostel',
      })
    ).rejects.toThrow('Academic year must be an integer between 1 and 5');

    // Residence enum
    await expect(
      db.createProfile({
        id: 'user-invalid-res',
        email: 'invalidres@bennett.edu.in',
        fullName: 'Invalid Res',
        course: 'B.Tech',
        year: 2,
        residence: 'Off-Campus' as any,
      })
    ).rejects.toThrow("Residence must be 'Hostel' or 'Day scholar'");
  });

  it('supports deleteListing lifecycle with authorization checks', async () => {
    const ownerId = 'seed-user-1';
    const nonOwnerId = 'seed-user-2';

    const item = await db.createListing({
      userId: ownerId,
      title: 'Item to delete',
      price: 200,
      category: 'Books & notes',
      age: '1 year',
      reason: 'Testing delete',
      description: 'Desc',
      contactMethod: 'Email',
      contactValue: 'test@bennett.edu.in',
      status: 'active',
      images: [],
    });

    // Non-owner delete throws Unauthorized
    await expect(db.deleteListing(item.id, nonOwnerId)).rejects.toThrow(
      'Unauthorized: Only the listing owner can delete this listing'
    );

    // Owner delete succeeds
    const deleted = await db.deleteListing(item.id, ownerId);
    expect(deleted).toBe(true);

    // Fetching deleted item returns null
    const fetched = await db.getListingById(item.id);
    expect(fetched).toBeNull();
  });

  it('supports updateReportStatus with auto-delisting on resolved', async () => {
    const listingId = 'seed-listing-1';
    const report = await db.createReport({
      listingId,
      reporterId: 'seed-user-3',
      reason: 'Policy violation',
      details: 'Counterfeit notes',
    });
    expect(report.status).toBe('pending');

    // Invalid status throws error
    await expect(db.updateReportStatus(report.id, 'closed' as any)).rejects.toThrow(
      'Invalid report status: closed'
    );

    // Update to investigating
    const investigatingReport = await db.updateReportStatus(report.id, 'investigating');
    expect(investigatingReport.status).toBe('investigating');

    // Update to resolved auto-delists listing
    const resolvedReport = await db.updateReportStatus(report.id, 'resolved');
    expect(resolvedReport.status).toBe('resolved');

    const updatedListing = await db.getListingById(listingId);
    expect(updatedListing?.status).toBe('delisted');
  });
});
