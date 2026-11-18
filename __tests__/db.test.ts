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
});
