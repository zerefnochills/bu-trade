import { createListingAction, updateListingAction, deleteListingAction } from '@/app/actions/listings';
import { _setTestSession } from '@/lib/auth/session';
import { getDatabaseService } from '@/lib/db';
import { ListingCategory } from '@/lib/db/types';

describe('Listing Management Server Actions', () => {
  beforeEach(() => {
    // Reset test session
    _setTestSession(null);
  });

  describe('createListingAction', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await createListingAction({
        title: 'Test Listing',
        price: 100,
        category: 'Electronics',
        age: '1 year',
        reason: 'Upgrading',
        contactMethod: 'WhatsApp',
        contactValue: '+91 9999999999',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Authentication required/i);
    });

    it('rejects empty or whitespace-only title', async () => {
      _setTestSession({
        userId: 'student-test-1',
        id: 'student-test-1',
        email: 'test@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      const res = await createListingAction({
        title: '   ',
        price: 500,
        category: 'Books & notes',
        age: '1 year',
        reason: 'Finished course',
        contactMethod: 'Phone',
        contactValue: '9876543210',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Title is required/i);
    });

    it('rejects negative price', async () => {
      _setTestSession({
        userId: 'student-test-1',
        id: 'student-test-1',
        email: 'test@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      const res = await createListingAction({
        title: 'Valid Title',
        price: -50,
        category: 'Books & notes',
        age: '1 year',
        reason: 'Finished course',
        contactMethod: 'Phone',
        contactValue: '9876543210',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Price cannot be negative/i);
    });

    it('rejects invalid category', async () => {
      _setTestSession({
        userId: 'student-test-1',
        id: 'student-test-1',
        email: 'test@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      const res = await createListingAction({
        title: 'Valid Title',
        price: 500,
        category: 'InvalidCategory' as ListingCategory,
        age: '1 year',
        reason: 'Finished course',
        contactMethod: 'Phone',
        contactValue: '9876543210',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Invalid category/i);
    });

    it('successfully creates listing with valid data and caps images at 5', async () => {
      _setTestSession({
        userId: 'student-creator-1',
        id: 'student-creator-1',
        email: 'creator@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      const imagesArray = [
        'img1.webp',
        'img2.webp',
        'img3.webp',
        'img4.webp',
        'img5.webp',
        'img6.webp', // 6th image should be truncated
      ];

      const res = await createListingAction({
        title: 'Scientific Calculator Casio fx-991EX',
        price: 800,
        category: 'Electronics',
        age: '6 months',
        reason: 'Calculus cleared',
        contactMethod: 'WhatsApp',
        contactValue: '+91 9123456789',
        images: imagesArray,
      });

      expect(res.success).toBe(true);
      expect(res.listing).toBeDefined();
      expect(res.listing?.title).toBe('Scientific Calculator Casio fx-991EX');
      expect(res.listing?.images).toHaveLength(5);
    });

    it('strictly enforces active listing limit of 10 items per user', async () => {
      const powerUserId = `power-user-${Date.now()}`;
      _setTestSession({
        userId: powerUserId,
        id: powerUserId,
        email: 'poweruser@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      // Create 10 listings
      for (let i = 1; i <= 10; i++) {
        const createRes = await createListingAction({
          title: `Item #${i} for 10-cap test`,
          price: 100 * i,
          category: 'Hostel essentials',
          age: '1 year',
          reason: 'Test',
          contactMethod: 'WhatsApp',
          contactValue: '9876543210',
        });
        expect(createRes.success).toBe(true);
      }

      // 11th listing should be rejected
      const overflowRes = await createListingAction({
        title: 'Item #11 should fail',
        price: 500,
        category: 'Hostel essentials',
        age: '1 year',
        reason: 'Test',
        contactMethod: 'WhatsApp',
        contactValue: '9876543210',
      });

      expect(overflowRes.success).toBe(false);
      expect(overflowRes.error).toMatch(/Active listing limit of 10 reached/i);
    });
  });

  describe('updateListingAction', () => {
    it('prevents non-owner from updating a listing', async () => {
      const db = getDatabaseService();
      const listing = await db.createListing({
        userId: 'original-owner-user',
        title: 'Original Listing',
        price: 1000,
        category: 'Furniture',
        age: '1 year',
        reason: 'Graduating',
        description: 'Study table',
        contactMethod: 'WhatsApp',
        contactValue: '9876543210',
        status: 'active',
        images: [],
      });

      // Different student tries to update
      _setTestSession({
        userId: 'other-student-user',
        id: 'other-student-user',
        email: 'other@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      const res = await updateListingAction({
        id: listing.id,
        price: 200,
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Unauthorized/i);
    });

    it('allows owner to update title, price, and status to sold', async () => {
      const ownerId = `owner-${Date.now()}`;
      _setTestSession({
        userId: ownerId,
        id: ownerId,
        email: 'owner@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      const createRes = await createListingAction({
        title: 'Mattress for hostel bed',
        price: 1200,
        category: 'Hostel essentials',
        age: '1 year',
        reason: 'Leaving hostel',
        contactMethod: 'WhatsApp',
        contactValue: '9876543210',
      });
      expect(createRes.success).toBe(true);
      const listingId = createRes.listing!.id;

      const updateRes = await updateListingAction({
        id: listingId,
        price: 1000,
        status: 'sold',
      });

      expect(updateRes.success).toBe(true);
      expect(updateRes.listing?.price).toBe(1000);
      expect(updateRes.listing?.status).toBe('sold');
    });
  });

  describe('deleteListingAction', () => {
    it('allows owner to delete their listing', async () => {
      const ownerId = `owner-del-${Date.now()}`;
      _setTestSession({
        userId: ownerId,
        id: ownerId,
        email: 'del@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      const createRes = await createListingAction({
        title: 'Item to delete',
        price: 100,
        category: 'Other',
        age: '1 year',
        reason: 'Testing',
        contactMethod: 'WhatsApp',
        contactValue: '9876543210',
      });
      const listingId = createRes.listing!.id;

      const deleteRes = await deleteListingAction(listingId);
      expect(deleteRes.success).toBe(true);

      const db = getDatabaseService();
      const fetched = await db.getListingById(listingId);
      expect(fetched).toBeNull();
    });
  });
});
