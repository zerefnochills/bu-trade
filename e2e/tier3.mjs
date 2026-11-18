/**
 * BU Trade — Tier 3: Pairwise Feature Integration Tests
 * 
 * Verifies multi-feature pairwise interaction flows from TEST_INFRA.md § 5.3:
 * - T3.01: Full Trade Flow (Listing -> Search -> Detail Redaction -> Enquiry -> Contact Unlock -> Sold -> Closed)
 * - T3.02: 10-Cap Saturation & Recycling (10 listings -> Cap reject -> Mark sold -> 11th succeeds -> Relist reject)
 * - T3.03: Search, Multi-Filter & Sort Composition (category + search query + price_asc / price_desc)
 * - T3.04: Unauthenticated Guest to Enquiring Buyer (Browse hidden -> OTP login -> Onboard -> Send enquiry -> Unlock)
 * - T3.05: Moderation Escalation Flow (Prohibited item -> Student report -> Moderation queue -> Moderator resolve -> Auto delist)
 * - T3.06: Profile Update Propagation (Onboard Aarav -> Create listing -> Update profile -> Joined listing reflects update)
 * - T3.07: Delist, Relist & Cap Interplay (9 active + 2 delisted -> Create 10th -> Relist fail -> Delist active -> Relist succeed)
 * - T3.08: Multi-Buyer Independent Privacy (Student A seller, Student B enquirer unlocks, Student C viewer still redacted, Student C enquirer unlocks, Guest still redacted)
 * - T3.09: Image Compression to Feed Gallery Integration (Multiple photos converted to WebP -> thumbnail on feed -> full gallery on detail)
 * - T3.10: Post-Transaction Feedback Loop (Unlock contact -> Mark sold -> Student B submits 5-star feedback)
 */

import assert from 'node:assert/strict';
import { registerTest as harnessRegisterTest } from './harness.mjs';

/**
 * Normalizes tier designation to ensure runner compatibility with
 * t.tier.toLowerCase() and summary table mapping.
 */
function registerTest(tier, id, name, fn) {
  const tierStr = typeof tier === 'number' ? `Tier ${tier}` : tier;
  harnessRegisterTest(tierStr, id, name, fn);
}

/* -------------------------------------------------------------------------- */
/*                                  TIER 3                                    */
/* -------------------------------------------------------------------------- */

/**
 * T3.01: Full Trade Flow
 * Listing -> Search -> Detail Redaction -> Enquiry -> Contact Unlock -> Sold -> Closed
 */
registerTest(3, 'T3.01', 'Full Trade Flow: Listing -> Search -> Redaction -> Enquiry -> Unlock -> Sold -> Closed', async (harness) => {
  // 1. Student A (seller@bennett.edu.in) requests and verifies OTP, onboards as 3rd year CSE Hostel
  const emailA = 'seller.aarav@bennett.edu.in';
  const otpResA = await harness.requestOTP(emailA);
  assert.equal(otpResA.success, true);

  const sessionA = await harness.verifyOTP(emailA, '123456');
  assert.equal(sessionA.onboardingNeeded, true);

  const profileA = await harness.createProfile({
    id: sessionA.userId,
    email: emailA,
    fullName: 'Aarav Singhal',
    course: 'B.Tech CSE',
    year: 3,
    residence: 'Hostel',
    whatsapp: '9876543210'
  });
  assert.equal(profileA.fullName, 'Aarav Singhal');

  // 2. Student A creates listing for Hero Sprint cycle
  const listingA = await harness.createListing({
    userId: sessionA.userId,
    title: 'Hero Sprint cycle 21-speed trade flow',
    price: 3800,
    category: 'Cycles & transport',
    age: '2 years',
    reason: 'Graduating this semester',
    description: 'Gears serviced last month. Lock and bell included.',
    contactMethod: 'WhatsApp',
    contactValue: '9876543210'
  });
  assert.ok(listingA.id);
  assert.equal(listingA.status, 'active');

  // 3. Student B (buyer@bennett.edu.in) logs in and onboards
  const emailB = 'buyer.kabir@bennett.edu.in';
  await harness.requestOTP(emailB);
  const sessionB = await harness.verifyOTP(emailB, '123456');
  await harness.createProfile({
    id: sessionB.userId,
    email: emailB,
    fullName: 'Kabir Thapar',
    course: 'B.Des',
    year: 1,
    residence: 'Hostel',
    whatsapp: '9712345615'
  });

  // 4. Student B searches feed for "cycle"
  const searchResults = await harness.getListings({
    search: 'cycle',
    viewerId: sessionB.userId
  });
  const foundListing = searchResults.find(l => l.id === listingA.id);
  assert.ok(foundListing, 'Created cycle listing must be discoverable in feed search');
  assert.equal(foundListing.contactValue, undefined, 'Contact value must be redacted in search results');
  assert.equal(foundListing.hasUnlockedContact, false);

  // 5. Student B views listing details -> contact info is REDACTED
  const preEnquiryDetail = await harness.getListingById(listingA.id, sessionB.userId);
  assert.ok(preEnquiryDetail);
  assert.equal(preEnquiryDetail.contactValue, undefined, 'Contact info must be redacted prior to enquiry');
  assert.equal(preEnquiryDetail.hasUnlockedContact, false);
  assert.equal(preEnquiryDetail.sellerName, 'Aarav Singhal');
  assert.equal(preEnquiryDetail.sellerCourse, 'B.Tech CSE');
  assert.equal(preEnquiryDetail.sellerYear, 3);

  // 6. Student B submits enquiry
  const enquiry = await harness.createEnquiry({
    listingId: listingA.id,
    buyerId: sessionB.userId,
    message: 'Can we meet at the food court?'
  });
  assert.ok(enquiry.id);
  assert.equal(await harness.hasEnquired(listingA.id, sessionB.userId), true);

  // 7. Contact info is UNLOCKED for Student B
  const postEnquiryDetail = await harness.getListingById(listingA.id, sessionB.userId);
  assert.equal(postEnquiryDetail.hasUnlockedContact, true);
  assert.equal(postEnquiryDetail.contactValue, '9876543210');

  const contactEndpoint = await harness.getListingContact(listingA.id, sessionB.userId);
  assert.ok(contactEndpoint);
  assert.equal(contactEndpoint.contactMethod, 'WhatsApp');
  assert.equal(contactEndpoint.contactValue, '9876543210');

  // 8. Student A marks listing as 'sold'
  const updatedListing = await harness.updateListing(listingA.id, { status: 'sold' }, sessionA.userId);
  assert.equal(updatedListing.status, 'sold');

  // 9. Student B refreshes; listing status is 'sold' and removed from active public feed
  const finalDetail = await harness.getListingById(listingA.id, sessionB.userId);
  assert.equal(finalDetail.status, 'sold');

  const activeFeed = await harness.getListings({ search: 'Hero Sprint cycle 21-speed trade flow' });
  assert.equal(activeFeed.length, 0, 'Sold listing must be excluded from active search feed');
});

/**
 * T3.02: 10-Cap Saturation & Recycling
 * 10 listings -> Cap reject -> Mark sold -> 11th succeeds -> Relist reject
 */
registerTest(3, 'T3.02', '10-Cap Saturation & Recycling: 10 listings -> Cap reject -> Mark sold -> 11th succeeds -> Relist reject', async (harness) => {
  const sellerId = 'seller_t3_02_recycler';
  await harness.createProfile({
    id: sellerId,
    email: 'recycler@bennett.edu.in',
    fullName: 'Power Seller Recycler',
    course: 'B.Tech CSE',
    year: 3,
    residence: 'Hostel'
  });

  // 1. Student creates 10 distinct active listings
  const createdListings = [];
  for (let i = 1; i <= 10; i++) {
    const l = await harness.createListing({
      userId: sellerId,
      title: `Recycler Active Item #${i}`,
      price: 100 * i,
      category: 'Other',
      description: `Test item number ${i}`
    });
    createdListings.push(l);
  }

  // Verify active count is 10
  assert.equal(await harness.countActiveListings(sellerId), 10);

  // 2. Student attempts to create listing #11 -> fails with cap error
  await assert.rejects(
    async () => {
      await harness.createListing({
        userId: sellerId,
        title: 'Recycler Overflow Item #11',
        price: 999,
        category: 'Other'
      });
    },
    /Active listing limit of 10 reached/
  );
  assert.equal(await harness.countActiveListings(sellerId), 10);

  // 3. Student marks listing #3 as 'sold'
  const item3 = createdListings[2];
  await harness.updateListing(item3.id, { status: 'sold' }, sellerId);
  assert.equal(await harness.countActiveListings(sellerId), 9);

  // 4. Student attempts to create listing #11 -> succeeds!
  const listing11 = await harness.createListing({
    userId: sellerId,
    title: 'Recycler Replacement Item #11',
    price: 1100,
    category: 'Other'
  });
  assert.ok(listing11.id);
  assert.equal(await harness.countActiveListings(sellerId), 10);

  // 5. Student tries to relist listing #3 -> fails because active count is back at 10
  await assert.rejects(
    async () => {
      await harness.updateListing(item3.id, { status: 'active' }, sellerId);
    },
    /Active listing limit of 10 reached/
  );
  assert.equal(await harness.countActiveListings(sellerId), 10);
});

/**
 * T3.03: Search, Multi-Filter & Sort Composition
 * category + search query + price_asc / price_desc
 */
registerTest(3, 'T3.03', 'Search, Multi-Filter & Sort Composition: category + search query + price_asc / price_desc', async (harness) => {
  const sellerId = 'seller_t3_03_filter';

  // 1. Seed electronics and books
  const e1 = await harness.createListing({
    userId: sellerId,
    title: 'MacBook Air M1 Laptop 2020 256GB',
    price: 28000,
    category: 'Electronics',
    description: 'Silver M1 laptop with original charger'
  });
  const e2 = await harness.createListing({
    userId: sellerId,
    title: 'Lenovo ThinkPad Laptop Core i5',
    price: 15000,
    category: 'Electronics',
    description: 'Durable business laptop for coding'
  });
  const e3 = await harness.createListing({
    userId: sellerId,
    title: 'Dell Laptop Cooling Pad with LED',
    price: 5000,
    category: 'Electronics',
    description: 'High airflow cooling pad for laptops'
  });
  const b1 = await harness.createListing({
    userId: sellerId,
    title: 'Laptop Architecture and OS Notes Bundle',
    price: 500,
    category: 'Books & notes',
    description: 'Handwritten notes covering laptop architecture'
  });

  // 2. Query with category: 'Electronics', search: 'laptop', sort: 'price_asc'
  const ascResults = await harness.getListings({
    category: 'Electronics',
    search: 'laptop',
    sort: 'price_asc'
  });

  // Verify only the 3 electronics items matched, and book is excluded
  assert.equal(ascResults.length, 3);
  assert.equal(ascResults.some(r => r.id === b1.id), false, 'Books item must be excluded by category filter');

  // Verify strictly ascending price order (5000, 15000, 28000)
  assert.equal(ascResults[0].id, e3.id);
  assert.equal(ascResults[0].price, 5000);
  assert.equal(ascResults[1].id, e2.id);
  assert.equal(ascResults[1].price, 15000);
  assert.equal(ascResults[2].id, e1.id);
  assert.equal(ascResults[2].price, 28000);

  // 3. Query with category: 'Electronics', search: 'laptop', sort: 'price_desc'
  const descResults = await harness.getListings({
    category: 'Electronics',
    search: 'laptop',
    sort: 'price_desc'
  });

  // Verify reverse ordering (28000, 15000, 5000)
  assert.equal(descResults.length, 3);
  assert.equal(descResults[0].id, e1.id);
  assert.equal(descResults[0].price, 28000);
  assert.equal(descResults[1].id, e2.id);
  assert.equal(descResults[1].price, 15000);
  assert.equal(descResults[2].id, e3.id);
  assert.equal(descResults[2].price, 5000);

  // 4. Non-matching category with same search returns empty array
  const emptyResults = await harness.getListings({
    category: 'Furniture',
    search: 'laptop'
  });
  assert.ok(Array.isArray(emptyResults));
  assert.equal(emptyResults.length, 0);
});

/**
 * T3.04: Unauthenticated Guest to Enquiring Buyer
 * Browse hidden -> OTP login -> Onboard -> Send enquiry -> Unlock
 */
registerTest(3, 'T3.04', 'Unauthenticated Guest to Enquiring Buyer: Browse hidden -> OTP login -> Onboard -> Send enquiry -> Unlock', async (harness) => {
  // 1. Unauthenticated visitor browses home feed and views listing #1 (Hero Sprint cycle)
  const guestFeed = await harness.getListings({ viewerId: undefined });
  const item1FromFeed = guestFeed.find(l => String(l.id) === '1');
  assert.ok(item1FromFeed);
  assert.equal(item1FromFeed.contactValue, undefined);
  assert.equal(item1FromFeed.hasUnlockedContact, false);

  const guestDetail = await harness.getListingById('1', undefined);
  assert.ok(guestDetail);
  assert.equal(guestDetail.contactValue, undefined, 'Contact must be redacted for unauthenticated visitor');
  assert.equal(guestDetail.hasUnlockedContact, false);

  // 2. Visitor signs in with Bennett email
  const guestEmail = 'guest.fresher@bennett.edu.in';
  const otpRes = await harness.requestOTP(guestEmail);
  assert.equal(otpRes.success, true);

  const session = await harness.verifyOTP(guestEmail, '123456');
  assert.ok(session.token);
  assert.equal(session.onboardingNeeded, true);

  // 3. Visitor completes onboarding
  const profile = await harness.createProfile({
    id: session.userId,
    email: guestEmail,
    fullName: 'Fresher Guest',
    course: 'B.Tech CSE',
    year: 1,
    residence: 'Hostel'
  });
  assert.equal(profile.fullName, 'Fresher Guest');

  // 4. Returning to listing #1, submits enquiry
  const enquiry = await harness.createEnquiry({
    listingId: '1',
    buyerId: session.userId,
    message: 'Hi, I saw this on the feed. Is it still available?'
  });
  assert.ok(enquiry.id);
  assert.equal(await harness.hasEnquired('1', session.userId), true);

  // 5. Contact is immediately revealed to the newly onboarded buyer
  const unlockedListing = await harness.getListingById('1', session.userId);
  assert.equal(unlockedListing.hasUnlockedContact, true);
  assert.equal(unlockedListing.contactValue, '9876543221');

  const unlockedContact = await harness.getListingContact('1', session.userId);
  assert.ok(unlockedContact);
  assert.equal(unlockedContact.contactValue, '9876543221');
});

/**
 * T3.05: Moderation Escalation Flow
 * Prohibited item -> Student report -> Moderation queue -> Moderator resolve -> Auto delist
 */
registerTest(3, 'T3.05', 'Moderation Escalation Flow: Prohibited item -> Student report -> Moderation queue -> Moderator resolve -> Auto delist', async (harness) => {
  // 1. Student lists prohibited item
  const listing = await harness.createListing({
    userId: 'user_seed_ishita',
    title: 'Mid-Sem Exam Answer Keys 2026',
    price: 2000,
    category: 'Other',
    description: 'Exclusive answer key leak for upcoming semester exams'
  });
  assert.ok(listing.id);
  assert.equal(listing.status, 'active');

  // Verify item is present in public feed
  const preReportFeed = await harness.getListings({ search: 'Exam Answer Keys' });
  assert.equal(preReportFeed.length, 1);

  // 2. Student B spots listing and submits Report
  const report = await harness.createReport({
    listingId: listing.id,
    reporterId: 'user_seed_mehak',
    reason: 'Prohibited item',
    details: 'Academic dishonesty item violating university regulations'
  });
  assert.ok(report.id);
  assert.equal(report.status, 'pending');

  // 3. Moderation queue registers report with status 'pending'
  const reportsInQueue = await harness.getReports();
  const foundReport = reportsInQueue.find(r => r.id === report.id);
  assert.ok(foundReport);
  assert.equal(foundReport.status, 'pending');
  assert.equal(foundReport.reason, 'Prohibited item');

  // 4. Moderator inspects queue, transitions report status to 'resolved'
  const updatedReport = await harness.updateReportStatus(report.id, 'resolved');
  assert.equal(updatedReport.status, 'resolved');

  // 5. Listing status is automatically updated to 'delisted'
  const delistedListing = await harness.getListingById(listing.id);
  assert.ok(delistedListing);
  assert.equal(delistedListing.status, 'delisted');

  // 6. Verified item is removed from public search feed
  const postReportFeed = await harness.getListings({ search: 'Exam Answer Keys' });
  assert.equal(postReportFeed.length, 0, 'Delisted item must vanish from public active feed');
});

/**
 * T3.06: Profile Update Propagation
 * Onboard Aarav -> Create listing -> Update profile -> Joined listing reflects update
 */
registerTest(3, 'T3.06', 'Profile Update Propagation: Onboard Aarav -> Create listing -> Update profile -> Joined listing reflects update', async (harness) => {
  const userId = 'user_t3_06_aarav_profile';

  // 1. Onboard student Aarav Sharma
  await harness.createProfile({
    id: userId,
    email: 'aarav.sharma@bennett.edu.in',
    fullName: 'Aarav Sharma',
    course: 'B.Tech CSE',
    year: 2,
    residence: 'Hostel'
  });

  // 2. Aarav creates listing
  const listing = await harness.createListing({
    userId,
    title: 'Casio Scientific Calculator fx-82MS',
    price: 650,
    category: 'Stationery & lab gear',
    description: 'Original Casio scientific calculator with slider case'
  });

  // 3. Listing join displays initial profile values
  const initialListing = await harness.getListingById(listing.id);
  assert.equal(initialListing.sellerName, 'Aarav Sharma');
  assert.equal(initialListing.sellerCourse, 'B.Tech CSE');
  assert.equal(initialListing.sellerYear, 2);

  // 4. Student updates profile name and course
  const updatedProfile = await harness.updateProfile(userId, {
    fullName: 'Aarav S. Singhal',
    course: 'B.Tech AI & Data Science',
    year: 3
  });
  assert.equal(updatedProfile.fullName, 'Aarav S. Singhal');
  assert.equal(updatedProfile.course, 'B.Tech AI & Data Science');
  assert.equal(updatedProfile.year, 3);

  // 5. Viewing listing displays updated seller profile attributes
  const refreshedListing = await harness.getListingById(listing.id);
  assert.equal(refreshedListing.sellerName, 'Aarav S. Singhal');
  assert.equal(refreshedListing.sellerCourse, 'B.Tech AI & Data Science');
  assert.equal(refreshedListing.sellerYear, 3);

  // Also verify feed search join propagation
  const feedListings = await harness.getListings({ search: 'Casio Scientific Calculator fx-82MS' });
  assert.equal(feedListings.length, 1);
  assert.equal(feedListings[0].sellerName, 'Aarav S. Singhal');
  assert.equal(feedListings[0].sellerCourse, 'B.Tech AI & Data Science');
});

/**
 * T3.07: Delist, Relist & Cap Interplay
 * 9 active + 2 delisted -> Create 10th -> Relist fail -> Delist active -> Relist succeed
 */
registerTest(3, 'T3.07', 'Delist, Relist & Cap Interplay: 9 active + 2 delisted -> Create 10th -> Relist fail -> Delist active -> Relist succeed', async (harness) => {
  const sellerId = 'seller_t3_07_delist_cap';
  await harness.createProfile({
    id: sellerId,
    email: 'delist.cap@bennett.edu.in',
    fullName: 'Delist Cap Seller',
    course: 'BBA',
    year: 2,
    residence: 'Day scholar'
  });

  // 1. Student has 9 active listings and 2 delisted listings
  const activeItems = [];
  for (let i = 1; i <= 9; i++) {
    const item = await harness.createListing({
      userId: sellerId,
      title: `Active Item #${i}`,
      price: 150 * i,
      category: 'Other'
    });
    activeItems.push(item);
  }

  // Create 2 delisted listings (created as delisted)
  const delisted1 = await harness.createListing({
    userId: sellerId,
    title: 'Delisted Dorm Rug',
    price: 300,
    category: 'Hostel essentials',
    status: 'delisted'
  });
  const delisted2 = await harness.createListing({
    userId: sellerId,
    title: 'Delisted Desk Mirror',
    price: 200,
    category: 'Hostel essentials',
    status: 'delisted'
  });

  assert.equal(await harness.countActiveListings(sellerId), 9);

  // 2. Student creates 1 new listing (now 10 active)
  const item10 = await harness.createListing({
    userId: sellerId,
    title: 'Active Item #10 New Addition',
    price: 800,
    category: 'Other'
  });
  assert.ok(item10.id);
  assert.equal(await harness.countActiveListings(sellerId), 10);

  // 3. Student attempts to relist one of the delisted listings -> rejected (at cap)
  await assert.rejects(
    async () => {
      await harness.updateListing(delisted1.id, { status: 'active' }, sellerId);
    },
    /Active listing limit of 10 reached/
  );
  assert.equal(await harness.countActiveListings(sellerId), 10);

  // 4. Student delists another active listing (active count drops to 9)
  await harness.updateListing(activeItems[0].id, { status: 'delisted' }, sellerId);
  assert.equal(await harness.countActiveListings(sellerId), 9);

  // 5. Relisting delisted1 now succeeds (active count reaches 10)
  const relisted = await harness.updateListing(delisted1.id, { status: 'active' }, sellerId);
  assert.equal(relisted.status, 'active');
  assert.equal(await harness.countActiveListings(sellerId), 10);
});

/**
 * T3.08: Multi-Buyer Independent Privacy
 * Student A seller, Student B enquirer unlocks, Student C viewer still redacted, Student C enquirer unlocks, Guest still redacted
 */
registerTest(3, 'T3.08', 'Multi-Buyer Independent Privacy: Multi-user contact isolation and independent enquiry unlocking', async (harness) => {
  const sellerA = 'seller_t3_08_privacy';
  const buyerB = 'buyer_t3_08_b';
  const buyerC = 'buyer_t3_08_c';

  // 1. Student A lists item with private phone number
  const listing = await harness.createListing({
    userId: sellerA,
    title: 'Private Phone Number Badminton Racket',
    price: 1400,
    category: 'Other',
    contactMethod: 'Phone',
    contactValue: '9988776655'
  });

  // 2. Student B enquires on item -> Student B unlocks contact
  await harness.createEnquiry({
    listingId: listing.id,
    buyerId: buyerB,
    message: 'Can I check the racket strings?'
  });
  const listingForB = await harness.getListingById(listing.id, buyerB);
  assert.equal(listingForB.hasUnlockedContact, true);
  assert.equal(listingForB.contactValue, '9988776655');

  const contactForB = await harness.getListingContact(listing.id, buyerB);
  assert.ok(contactForB);
  assert.equal(contactForB.contactValue, '9988776655');

  // 3. Student C (different student) views same item -> Student C still receives redacted contact
  const listingForCPre = await harness.getListingById(listing.id, buyerC);
  assert.equal(listingForCPre.hasUnlockedContact, false);
  assert.equal(listingForCPre.contactValue, undefined, 'Student C must NOT see contact before enquiring');

  const contactForCPre = await harness.getListingContact(listing.id, buyerC);
  assert.equal(contactForCPre, null);

  // 4. Student C enquires -> Student C also unlocks contact
  await harness.createEnquiry({
    listingId: listing.id,
    buyerId: buyerC,
    message: 'I want to purchase this today.'
  });
  const listingForCPost = await harness.getListingById(listing.id, buyerC);
  assert.equal(listingForCPost.hasUnlockedContact, true);
  assert.equal(listingForCPost.contactValue, '9988776655');

  const contactForCPost = await harness.getListingContact(listing.id, buyerC);
  assert.ok(contactForCPost);
  assert.equal(contactForCPost.contactValue, '9988776655');

  // 5. Unauthenticated visitor still sees redacted contact
  const listingForGuest = await harness.getListingById(listing.id, undefined);
  assert.equal(listingForGuest.hasUnlockedContact, false);
  assert.equal(listingForGuest.contactValue, undefined);

  const contactForGuest = await harness.getListingContact(listing.id, undefined);
  assert.equal(contactForGuest, null);
});

/**
 * T3.09: Image Compression to Feed Gallery Integration
 * Multiple photos converted to WebP -> thumbnail on feed -> full gallery on detail
 */
registerTest(3, 'T3.09', 'Image Compression to Feed Gallery Integration: WebP conversion, feed thumbnail, detail gallery slider', async (harness) => {
  const sellerId = 'seller_t3_09_images';

  // 1. User selects 3 raw photos converted client-side to WebP format
  const webpPhoto1 = 'data:image/webp;base64,UklGRmIAAABXRUJQVlA4TFkAAAAvAAAAECVAIiAgQG7137/VvgE=';
  const webpPhoto2 = 'data:image/webp;base64,UklGRmIAAABXRUJQVlA4TFkAAAAvAAAAECVAIiAgQG7137/VvgF=';
  const webpPhoto3 = 'data:image/webp;base64,UklGRmIAAABXRUJQVlA4TFkAAAAvAAAAECVAIiAgQG7137/VvgG=';

  // 2. Listing published with 3 WebP image URLs
  const listing = await harness.createListing({
    userId: sellerId,
    title: 'Sony Alpha Mirrorless Camera Body',
    price: 32000,
    category: 'Electronics',
    images: [webpPhoto1, webpPhoto2, webpPhoto3]
  });
  assert.ok(listing.id);
  assert.equal(listing.images.length, 3);

  // 3. Home feed renders primary thumbnail (1st image)
  const feedResults = await harness.getListings({ search: 'Sony Alpha Mirrorless Camera Body' });
  assert.equal(feedResults.length, 1);
  assert.equal(feedResults[0].images.length, 3);
  assert.equal(feedResults[0].images[0], webpPhoto1, 'First image must serve as primary thumbnail');

  // 4. Detail page renders complete 3-image slider gallery in exact order
  const detail = await harness.getListingById(listing.id);
  assert.ok(detail);
  assert.equal(detail.images.length, 3);
  assert.equal(detail.images[0], webpPhoto1);
  assert.equal(detail.images[1], webpPhoto2);
  assert.equal(detail.images[2], webpPhoto3);

  // 5. Max 5 images guardrail: passing 6 images truncates safely to 5
  const overflowListing = await harness.createListing({
    userId: sellerId,
    title: 'Overloaded Image Photo Album',
    price: 450,
    category: 'Other',
    images: ['img1.webp', 'img2.webp', 'img3.webp', 'img4.webp', 'img5.webp', 'img6.webp']
  });
  assert.equal(overflowListing.images.length, 5);
  assert.equal(overflowListing.images[4], 'img5.webp');
});

/**
 * T3.10: Post-Transaction Feedback Loop
 * Unlock contact -> Mark sold -> Student B submits 5-star feedback
 */
registerTest(3, 'T3.10', 'Post-Transaction Feedback Loop: Unlock contact -> Mark sold -> Student B submits 5-star feedback', async (harness) => {
  const sellerId = 'seller_t3_10_feedback';
  const buyerId = 'buyer_t3_10_feedback';

  // 1. Seller creates listing
  const listing = await harness.createListing({
    userId: sellerId,
    title: 'Hostel Table Lamp & Bookshelf Combo',
    price: 850,
    category: 'Hostel essentials',
    contactMethod: 'WhatsApp',
    contactValue: '9123456789'
  });

  // 2. Buyer unlocks contact via enquiry
  await harness.createEnquiry({
    listingId: listing.id,
    buyerId,
    message: 'I can pick this up right now at Hostel 4!'
  });
  const buyerListing = await harness.getListingById(listing.id, buyerId);
  assert.equal(buyerListing.hasUnlockedContact, true);
  assert.equal(buyerListing.contactValue, '9123456789');

  // 3. Physical transaction completes; seller marks item as 'sold'
  const soldListing = await harness.updateListing(listing.id, { status: 'sold' }, sellerId);
  assert.equal(soldListing.status, 'sold');

  // 4. Buyer accesses feedback form, submits 5-star rating with comment
  const feedback = await harness.createFeedback({
    listingId: listing.id,
    userId: buyerId,
    rating: 5,
    comment: 'Smooth transaction at hostel 4! Lamp is in mint condition.'
  });
  assert.ok(feedback.id);
  assert.equal(feedback.rating, 5);
  assert.equal(feedback.userId, buyerId);
  assert.equal(feedback.listingId, listing.id);
  assert.equal(feedback.comment, 'Smooth transaction at hostel 4! Lamp is in mint condition.');
  assert.ok(feedback.createdAt);
  assert.equal(new Date(feedback.createdAt).toString() !== 'Invalid Date', true);
});
