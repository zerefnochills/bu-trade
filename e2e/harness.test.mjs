/**
 * BU Trade — Core E2E Test Suite (Harness Verification)
 * 
 * Verifies core functionality across Tiers 1-4 using the E2E Test Harness:
 * - Tier 1: Feature Coverage (Auth, Profiles, Listings, Contact Protection, Reports, Feedback)
 * - Tier 2: Boundary & Corner Cases (Domain Regex, 10-Cap Constraints, Validation Errors)
 * - Tier 3: Cross-Feature Interactions (Full Trade Flow, Moderation, Privacy Isolation)
 * - Tier 4: Real-World Scenarios (Hostel Clearance, Scammer Rejection)
 */

import assert from 'node:assert/strict';
import { registerTest } from './harness.mjs';

/* -------------------------------------------------------------------------- */
/*                                  TIER 1                                    */
/* -------------------------------------------------------------------------- */

registerTest('Tier 1', 'T1.01.1', 'Standard Bennett email format username@bennett.edu.in returns true', async (harness) => {
  assert.equal(harness.isBennettEmail('aarav.singhal@bennett.edu.in'), true);
});

registerTest('Tier 1', 'T1.01.2', 'Numbered student roll email returns true', async (harness) => {
  assert.equal(harness.isBennettEmail('e21cse001@bennett.edu.in'), true);
});

registerTest('Tier 1', 'T1.01.3', 'Dot-separated student email returns true', async (harness) => {
  assert.equal(harness.isBennettEmail('first.last@bennett.edu.in'), true);
});

registerTest('Tier 1', 'T1.01.4', 'Capitalized email STUDENT@BENNETT.EDU.IN is recognized as valid', async (harness) => {
  assert.equal(harness.isBennettEmail('STUDENT@BENNETT.EDU.IN'), true);
});

registerTest('Tier 1', 'T1.01.5', 'Tagged email student+trade@bennett.edu.in returns true', async (harness) => {
  assert.equal(harness.isBennettEmail('student+trade@bennett.edu.in'), true);
});

registerTest('Tier 1', 'T1.02.1', 'OTP request succeeds for Bennett email', async (harness) => {
  const res = await harness.requestOTP('student@bennett.edu.in');
  assert.equal(res.success, true);
});

registerTest('Tier 1', 'T1.02.2', 'OTP verification returns session with user ID and email', async (harness) => {
  await harness.requestOTP('newstudent@bennett.edu.in');
  const session = await harness.verifyOTP('newstudent@bennett.edu.in', '123456');
  assert.ok(session.userId);
  assert.equal(session.email, 'newstudent@bennett.edu.in');
});

registerTest('Tier 1', 'T1.02.3', 'Session marks onboardingNeeded: true when profile does not exist', async (harness) => {
  const session = await harness.verifyOTP('brandnew@bennett.edu.in', '123456');
  assert.equal(session.onboardingNeeded, true);
});

registerTest('Tier 1', 'T1.02.4', 'Session marks onboardingNeeded: false when profile already exists', async (harness) => {
  const session = await harness.verifyOTP('aarav.s@bennett.edu.in', '123456');
  assert.equal(session.onboardingNeeded, false);
});

registerTest('Tier 1', 'T1.02.5', 'Sign out invalidates active session', async (harness) => {
  const session = await harness.verifyOTP('aarav.s@bennett.edu.in', '123456');
  assert.ok(await harness.getSession(session.token));
  await harness.signOut(session.token);
  assert.equal(await harness.getSession(session.token), null);
});

registerTest('Tier 1', 'T1.03.1', 'Create profile with complete valid data', async (harness) => {
  const profile = await harness.createProfile({
    id: 'user_t1_03',
    email: 't1_student@bennett.edu.in',
    fullName: 'Test Student',
    course: 'B.Tech CSE',
    year: 3,
    residence: 'Hostel',
    whatsapp: '9876543210'
  });
  assert.equal(profile.fullName, 'Test Student');
  assert.equal(profile.course, 'B.Tech CSE');
  assert.equal(profile.year, 3);
  assert.equal(profile.residence, 'Hostel');
  assert.ok(profile.createdAt);
});

registerTest('Tier 1', 'T1.03.3', 'Retrieve profile by user ID returns exact persisted attributes', async (harness) => {
  const profile = await harness.getProfile('user_seed_aarav');
  assert.ok(profile);
  assert.equal(profile.fullName, 'Aarav S.');
  assert.equal(profile.course, 'B.Tech CSE');
  assert.equal(profile.year, 3);
});

registerTest('Tier 1', 'T1.03.4', 'Update profile modifies course, year, residence, and WhatsApp', async (harness) => {
  const updated = await harness.updateProfile('user_seed_aarav', {
    course: 'Integrated B.Tech-MBA',
    year: 4,
    residence: 'Day scholar',
    whatsapp: '9998887776'
  });
  assert.equal(updated.course, 'Integrated B.Tech-MBA');
  assert.equal(updated.year, 4);
  assert.equal(updated.residence, 'Day scholar');
  assert.equal(updated.whatsapp, '9998887776');
});

registerTest('Tier 1', 'T1.04.1', 'Create listing with valid Books & notes data', async (harness) => {
  const listing = await harness.createListing({
    userId: 'user_seed_aarav',
    title: 'Operating Systems Concepts 10th Ed',
    price: 450,
    category: 'Books & notes',
    age: '6 months',
    reason: 'Semester finished',
    description: 'Clean pages, no markings.',
    contactMethod: 'WhatsApp',
    contactValue: '9876543221'
  });
  assert.ok(listing.id);
  assert.equal(listing.title, 'Operating Systems Concepts 10th Ed');
  assert.equal(listing.price, 450);
  assert.equal(listing.status, 'active');
});

registerTest('Tier 1', 'T1.05.1', 'Active listing count increments upon listing creation', async (harness) => {
  const before = await harness.countActiveListings('user_t1_count');
  assert.equal(before, 0);
  await harness.createListing({
    userId: 'user_t1_count',
    title: 'Item 1',
    price: 100
  });
  const after = await harness.countActiveListings('user_t1_count');
  assert.equal(after, 1);
});

registerTest('Tier 1', 'T1.05.4', 'countActiveListings accurately returns 1 for seed user Aarav', async (harness) => {
  const count = await harness.countActiveListings('user_seed_aarav');
  assert.equal(count, 1);
});

registerTest('Tier 1', 'T1.06.1', 'Owner edits listing title, price, and description', async (harness) => {
  const updated = await harness.updateListing('1', {
    title: 'Hero Sprint cycle, 21-speed (Price dropped)',
    price: 3200,
    description: 'Fresh tune-up done yesterday.'
  }, 'user_seed_aarav');
  assert.equal(updated.title, 'Hero Sprint cycle, 21-speed (Price dropped)');
  assert.equal(updated.price, 3200);
  assert.equal(updated.description, 'Fresh tune-up done yesterday.');
});

registerTest('Tier 1', 'T1.06.2', 'Owner marks active listing as sold', async (harness) => {
  const updated = await harness.updateListing('1', { status: 'sold' }, 'user_seed_aarav');
  assert.equal(updated.status, 'sold');
});

registerTest('Tier 1', 'T1.06.3', 'Owner delists active listing', async (harness) => {
  const updated = await harness.updateListing('1', { status: 'delisted' }, 'user_seed_aarav');
  assert.equal(updated.status, 'delisted');
});

registerTest('Tier 1', 'T1.06.4', 'Owner relists a delisted listing', async (harness) => {
  await harness.updateListing('1', { status: 'delisted' }, 'user_seed_aarav');
  const relisted = await harness.updateListing('1', { status: 'active' }, 'user_seed_aarav');
  assert.equal(relisted.status, 'active');
});

registerTest('Tier 1', 'T1.07.1', 'getListings() without filters returns all 6 active seed listings', async (harness) => {
  const listings = await harness.getListings();
  assert.equal(listings.length, 6);
});

registerTest('Tier 1', 'T1.07.2', 'Category filter returns only matching category listings', async (harness) => {
  const cycles = await harness.getListings({ category: 'Cycles & transport' });
  assert.ok(cycles.length >= 1);
  assert.ok(cycles.every(l => l.category === 'Cycles & transport'));
});

registerTest('Tier 1', 'T1.07.3', 'Live search search: "Casio" returns matching calculator listing', async (harness) => {
  const results = await harness.getListings({ search: 'Casio' });
  assert.equal(results.length, 1);
  assert.ok(results[0].title.includes('Casio'));
});

registerTest('Tier 1', 'T1.07.4', 'Sort sort: "price_asc" returns listings in ascending order', async (harness) => {
  const results = await harness.getListings({ sort: 'price_asc' });
  for (let i = 1; i < results.length; i++) {
    assert.ok(results[i].price >= results[i - 1].price);
  }
});

registerTest('Tier 1', 'T1.07.5', 'Sort sort: "price_desc" returns listings in descending order', async (harness) => {
  const results = await harness.getListings({ sort: 'price_desc' });
  for (let i = 1; i < results.length; i++) {
    assert.ok(results[i].price <= results[i - 1].price);
  }
});

registerTest('Tier 1', 'T1.08.1', 'getListingById returns full listing metadata', async (harness) => {
  const listing = await harness.getListingById('1');
  assert.ok(listing);
  assert.equal(listing.title, 'Hero Sprint cycle, 21-speed');
  assert.equal(listing.category, 'Cycles & transport');
  assert.equal(listing.price, 3800);
});

registerTest('Tier 1', 'T1.08.2', 'Join metadata includes seller name, course, and year', async (harness) => {
  const listing = await harness.getListingById('1');
  assert.equal(listing.sellerName, 'Aarav S.');
  assert.equal(listing.sellerCourse, 'B.Tech CSE');
  assert.equal(listing.sellerYear, 3);
});

registerTest('Tier 1', 'T1.09.1', 'Unauthenticated request redacts contactValue', async (harness) => {
  const listing = await harness.getListingById('1', undefined);
  assert.equal(listing.contactValue, undefined);
  assert.equal(listing.hasUnlockedContact, false);
});

registerTest('Tier 1', 'T1.09.2', 'Authenticated non-enquiring student request redacts contactValue', async (harness) => {
  const listing = await harness.getListingById('1', 'user_other_student');
  assert.equal(listing.contactValue, undefined);
  assert.equal(listing.hasUnlockedContact, false);
});

registerTest('Tier 1', 'T1.09.5', 'Listing owner viewing own listing sees unredacted contactValue', async (harness) => {
  const listing = await harness.getListingById('1', 'user_seed_aarav');
  assert.equal(listing.hasUnlockedContact, true);
  assert.equal(listing.contactValue, '9876543221');
});

registerTest('Tier 1', 'T1.10.1', 'Authenticated student submits enquiry', async (harness) => {
  const enquiry = await harness.createEnquiry({
    listingId: '1',
    buyerId: 'user_seed_kabir',
    message: 'Can I test ride it near the sports complex?'
  });
  assert.ok(enquiry.id);
  assert.equal(enquiry.listingId, '1');
  assert.equal(enquiry.buyerId, 'user_seed_kabir');
});

registerTest('Tier 1', 'T1.10.3', 'hasEnquired returns true after enquiry submission', async (harness) => {
  await harness.createEnquiry({
    listingId: '2',
    buyerId: 'user_seed_rohan',
    message: 'Is the calculator still available?'
  });
  const has = await harness.hasEnquired('2', 'user_seed_rohan');
  assert.equal(has, true);
});

registerTest('Tier 1', 'T1.10.4', 'Submitting enquiry unlocks seller contact value', async (harness) => {
  await harness.createEnquiry({
    listingId: '2',
    buyerId: 'user_seed_rohan',
    message: 'Interested!'
  });
  const listing = await harness.getListingById('2', 'user_seed_rohan');
  assert.equal(listing.hasUnlockedContact, true);
  assert.equal(listing.contactValue, '9876543242');

  const contact = await harness.getListingContact('2', 'user_seed_rohan');
  assert.ok(contact);
  assert.equal(contact.contactMethod, 'WhatsApp');
  assert.equal(contact.contactValue, '9876543242');
});

registerTest('Tier 1', 'T1.12.1', 'Student submits report with reason and details', async (harness) => {
  const report = await harness.createReport({
    listingId: '3',
    reporterId: 'user_seed_ishita',
    reason: 'Misleading description',
    details: 'Photos do not match the lamp.'
  });
  assert.ok(report.id);
  assert.equal(report.status, 'pending');
  assert.equal(report.reason, 'Misleading description');
});

registerTest('Tier 1', 'T1.12.2', 'Report persists with status pending in moderation queue', async (harness) => {
  await harness.createReport({
    listingId: '4',
    reporterId: 'user_seed_kabir',
    reason: 'Prohibited item'
  });
  const reports = await harness.getReports();
  assert.ok(reports.some(r => r.listingId === '4' && r.status === 'pending'));
});

registerTest('Tier 1', 'T1.13.1', 'User submits feedback rating with comment', async (harness) => {
  const feedback = await harness.createFeedback({
    userId: 'user_seed_mehak',
    rating: 5,
    comment: 'Great campus platform!'
  });
  assert.ok(feedback.id);
  assert.equal(feedback.rating, 5);
  assert.equal(feedback.comment, 'Great campus platform!');
});

registerTest('Tier 1', 'T1.15.2', 'Mock service pre-populates 6 realistic seed campus listings', async (harness) => {
  const listings = await harness.getListings();
  assert.equal(listings.length, 6);
  const titles = listings.map(l => l.title);
  assert.ok(titles.some(t => t.includes('Hero Sprint')));
  assert.ok(titles.some(t => t.includes('Casio')));
  assert.ok(titles.some(t => t.includes('Dell Inspiron')));
});

/* -------------------------------------------------------------------------- */
/*                                  TIER 2                                    */
/* -------------------------------------------------------------------------- */

registerTest('Tier 2', 'T2.01.1', 'Rejects user@gmail.com', async (harness) => {
  assert.equal(harness.isBennettEmail('user@gmail.com'), false);
});

registerTest('Tier 2', 'T2.01.2', 'Rejects user@yahoo.co.in', async (harness) => {
  assert.equal(harness.isBennettEmail('user@yahoo.co.in'), false);
});

registerTest('Tier 2', 'T2.01.3', 'Rejects phishing subdomain user@bennett.edu.in.evil.com', async (harness) => {
  assert.equal(harness.isBennettEmail('user@bennett.edu.in.evil.com'), false);
});

registerTest('Tier 2', 'T2.01.4', 'Rejects incomplete domain user@bennett.edu', async (harness) => {
  assert.equal(harness.isBennettEmail('user@bennett.edu'), false);
});

registerTest('Tier 2', 'T2.01.5', 'Rejects missing TLD user@bennett', async (harness) => {
  assert.equal(harness.isBennettEmail('user@bennett'), false);
});

registerTest('Tier 2', 'T2.01.6', 'Rejects untrimmed email with whitespace infiltration', async (harness) => {
  assert.equal(harness.isBennettEmail(' user@bennett.edu.in '), false);
});

registerTest('Tier 2', 'T2.01.7', 'Rejects empty local part @bennett.edu.in', async (harness) => {
  assert.equal(harness.isBennettEmail('@bennett.edu.in'), false);
});

registerTest('Tier 2', 'T2.02.1', 'Student successfully creates exactly 10 active listings', async (harness) => {
  const uid = 'power_seller_10';
  for (let i = 1; i <= 10; i++) {
    await harness.createListing({
      userId: uid,
      title: `Active Item ${i}`,
      price: i * 50
    });
  }
  const count = await harness.countActiveListings(uid);
  assert.equal(count, 10);
});

registerTest('Tier 2', 'T2.02.2', '11th active listing attempt throws "Active listing limit of 10 reached"', async (harness) => {
  const uid = 'power_seller_11';
  for (let i = 1; i <= 10; i++) {
    await harness.createListing({
      userId: uid,
      title: `Active Item ${i}`,
      price: 100
    });
  }
  await assert.rejects(
    async () => {
      await harness.createListing({
        userId: uid,
        title: 'Forbidden 11th item',
        price: 100
      });
    },
    /Active listing limit of 10 reached/
  );
});

registerTest('Tier 2', 'T2.02.3', 'Sold item re-entry allows creating 11th listing', async (harness) => {
  const uid = 'seller_recycle';
  let firstId;
  for (let i = 1; i <= 10; i++) {
    const l = await harness.createListing({
      userId: uid,
      title: `Item ${i}`,
      price: 100
    });
    if (i === 1) firstId = l.id;
  }
  // Mark first as sold
  await harness.updateListing(firstId, { status: 'sold' }, uid);
  assert.equal(await harness.countActiveListings(uid), 9);

  // Now 11th creation succeeds
  const item11 = await harness.createListing({
    userId: uid,
    title: 'Recycled slot 11th item',
    price: 100
  });
  assert.ok(item11.id);
  assert.equal(await harness.countActiveListings(uid), 10);
});

registerTest('Tier 2', 'T2.02.5', 'Relist at cap throws "Active listing limit of 10 reached"', async (harness) => {
  const uid = 'seller_relist_cap';
  let delistedId;
  for (let i = 1; i <= 10; i++) {
    const l = await harness.createListing({
      userId: uid,
      title: `Item ${i}`,
      price: 100
    });
    if (i === 1) delistedId = l.id;
  }
  // Delist item 1
  await harness.updateListing(delistedId, { status: 'delisted' }, uid);
  // Add new item so active count is back to 10
  await harness.createListing({
    userId: uid,
    title: 'Item 11 replacement',
    price: 100
  });
  assert.equal(await harness.countActiveListings(uid), 10);

  // Attempt to relist old delisted item at cap
  await assert.rejects(
    async () => {
      await harness.updateListing(delistedId, { status: 'active' }, uid);
    },
    /Active listing limit of 10 reached/
  );
});

registerTest('Tier 2', 'T2.03.1', 'Negative price throws "Price cannot be negative"', async (harness) => {
  await assert.rejects(
    async () => {
      await harness.createListing({
        userId: 'user_seed_aarav',
        title: 'Negative Price Item',
        price: -50
      });
    },
    /Price cannot be negative/
  );
});

registerTest('Tier 2', 'T2.03.6', 'Empty or whitespace title throws validation error', async (harness) => {
  await assert.rejects(
    async () => {
      await harness.createListing({
        userId: 'user_seed_aarav',
        title: '   ',
        price: 100
      });
    },
    /Title is required/
  );
});

registerTest('Tier 2', 'T2.04.1', 'Creating listing with empty images: [] array succeeds', async (harness) => {
  const listing = await harness.createListing({
    userId: 'user_seed_aarav',
    title: 'Item without images',
    price: 100,
    images: []
  });
  assert.deepEqual(listing.images, []);
});

registerTest('Tier 2', 'T2.04.3', 'Uploading 6 images truncates to first 5', async (harness) => {
  const listing = await harness.createListing({
    userId: 'user_seed_aarav',
    title: '6 Images Item',
    price: 100,
    images: ['img1', 'img2', 'img3', 'img4', 'img5', 'img6']
  });
  assert.equal(listing.images.length, 5);
  assert.equal(listing.images[4], 'img5');
});

registerTest('Tier 2', 'T2.05.3', 'Academic year 0 throws validation error', async (harness) => {
  await assert.rejects(
    async () => {
      await harness.createProfile({
        id: 'bad_year_0',
        email: 'bad0@bennett.edu.in',
        fullName: 'Bad Year',
        course: 'CSE',
        year: 0
      });
    },
    /Academic year must be an integer between 1 and 5/
  );
});

registerTest('Tier 2', 'T2.05.4', 'Academic year 6 throws validation error', async (harness) => {
  await assert.rejects(
    async () => {
      await harness.createProfile({
        id: 'bad_year_6',
        email: 'bad6@bennett.edu.in',
        fullName: 'Bad Year 6',
        course: 'CSE',
        year: 6
      });
    },
    /Academic year must be an integer between 1 and 5/
  );
});

registerTest('Tier 2', 'T2.05.5', 'Invalid residence enum value throws validation error', async (harness) => {
  await assert.rejects(
    async () => {
      await harness.createProfile({
        id: 'bad_res',
        email: 'badres@bennett.edu.in',
        fullName: 'Bad Residence',
        course: 'CSE',
        residence: 'Off-Campus Apartment'
      });
    },
    /Residence must be 'Hostel' or 'Day scholar'/
  );
});

registerTest('Tier 2', 'T2.06.1', 'Empty search query returns all active items', async (harness) => {
  const all = await harness.getListings({ search: '' });
  assert.equal(all.length, 6);
});

registerTest('Tier 2', 'T2.06.3', 'Search with regex symbols does not crash backend', async (harness) => {
  const res = await harness.getListings({ search: '.*+?^${}()|[]\\' });
  assert.deepEqual(res, []);
});

registerTest('Tier 2', 'T2.06.4', 'Non-existent search returns empty array', async (harness) => {
  const res = await harness.getListings({ search: 'XYZNONEXISTENTQUERY999' });
  assert.deepEqual(res, []);
});

registerTest('Tier 2', 'T2.07.1', 'Non-owner edit throws Unauthorized error', async (harness) => {
  await assert.rejects(
    async () => {
      await harness.updateListing('1', { price: 10 }, 'malicious_user');
    },
    /Unauthorized/
  );
});

registerTest('Tier 2', 'T2.07.2', 'Non-owner delete throws Unauthorized error', async (harness) => {
  await assert.rejects(
    async () => {
      await harness.deleteListing('1', 'malicious_user');
    },
    /Unauthorized/
  );
});

registerTest('Tier 2', 'T2.08.1', 'Submitting report with empty reason throws validation error', async (harness) => {
  await assert.rejects(
    async () => {
      await harness.createReport({
        listingId: '1',
        reporterId: 'user_seed_mehak',
        reason: '   '
      });
    },
    /Report reason is required/
  );
});

registerTest('Tier 2', 'T2.08.5', 'Setting report status to invalid value throws error', async (harness) => {
  const rep = await harness.createReport({
    listingId: '1',
    reporterId: 'user_seed_mehak',
    reason: 'Prohibited'
  });
  await assert.rejects(
    async () => {
      await harness.updateReportStatus(rep.id, 'closed');
    },
    /Invalid report status/
  );
});

/* -------------------------------------------------------------------------- */
/*                                  TIER 3                                    */
/* -------------------------------------------------------------------------- */

registerTest('Tier 3', 'T3.01', 'Full trade flow from listing to enquiry unlock to sold status', async (harness) => {
  // 1. Seller creates listing
  const sellerId = 'seller_trade_flow';
  const buyerId = 'buyer_trade_flow';
  const listing = await harness.createListing({
    userId: sellerId,
    title: 'Hero Sprint cycle 21-speed trade flow',
    price: 3800,
    category: 'Cycles & transport',
    contactMethod: 'WhatsApp',
    contactValue: '9876543210'
  });

  // 2. Buyer searches feed for cycle
  const searchResults = await harness.getListings({ search: 'Hero Sprint cycle 21-speed trade flow' });
  assert.equal(searchResults.length, 1);

  // 3. Buyer views details -> contact is REDACTED
  const preEnquiry = await harness.getListingById(listing.id, buyerId);
  assert.equal(preEnquiry.contactValue, undefined);
  assert.equal(preEnquiry.hasUnlockedContact, false);

  // 4. Buyer submits enquiry
  await harness.createEnquiry({
    listingId: listing.id,
    buyerId,
    message: 'Can we meet at the food court?'
  });

  // 5. Contact is UNLOCKED for buyer
  const postEnquiry = await harness.getListingById(listing.id, buyerId);
  assert.equal(postEnquiry.hasUnlockedContact, true);
  assert.equal(postEnquiry.contactValue, '9876543210');

  // 6. Seller marks listing as sold
  await harness.updateListing(listing.id, { status: 'sold' }, sellerId);

  // 7. Verified item status is sold
  const soldListing = await harness.getListingById(listing.id, buyerId);
  assert.equal(soldListing.status, 'sold');
});

registerTest('Tier 3', 'T3.05', 'Moderation escalation: reported item resolved and delisted from feed', async (harness) => {
  // 1. Create listing
  const listing = await harness.createListing({
    userId: 'user_seed_aarav',
    title: 'Prohibited Exam Answer Key 2026',
    price: 500,
    category: 'Other'
  });

  // 2. Student reports listing
  const report = await harness.createReport({
    listingId: listing.id,
    reporterId: 'user_seed_mehak',
    reason: 'Prohibited item',
    details: 'Academic dishonesty item'
  });

  // 3. Moderator marks resolved
  await harness.updateReportStatus(report.id, 'resolved');

  // 4. Item is automatically delisted
  const updated = await harness.getListingById(listing.id);
  assert.equal(updated.status, 'delisted');

  // 5. Item does not appear in public active feed
  const activeFeed = await harness.getListings({ search: 'Prohibited Exam Answer Key 2026' });
  assert.equal(activeFeed.length, 0);
});

registerTest('Tier 3', 'T3.06', 'Profile update propagates seller name and course to listings', async (harness) => {
  // Update seed profile Aarav
  await harness.updateProfile('user_seed_aarav', {
    fullName: 'Aarav Sharma Updated',
    course: 'B.Tech AI'
  });

  // Fetch listing 1
  const listing = await harness.getListingById('1');
  assert.equal(listing.sellerName, 'Aarav Sharma Updated');
  assert.equal(listing.sellerCourse, 'B.Tech AI');
});

registerTest('Tier 3', 'T3.08', 'Multi-buyer independent privacy: contact unlocked only for enquirer', async (harness) => {
  const sellerId = 'seller_priv';
  const buyerB = 'buyer_b';
  const buyerC = 'buyer_c';

  const listing = await harness.createListing({
    userId: sellerId,
    title: 'Private Phone Item',
    price: 1500,
    contactMethod: 'Phone',
    contactValue: '9988776655'
  });

  // Buyer B enquires
  await harness.createEnquiry({ listingId: listing.id, buyerId: buyerB });

  // Buyer B sees contact
  const listingForB = await harness.getListingById(listing.id, buyerB);
  assert.equal(listingForB.hasUnlockedContact, true);
  assert.equal(listingForB.contactValue, '9988776655');

  // Buyer C has NOT enquired -> redacted
  const listingForC = await harness.getListingById(listing.id, buyerC);
  assert.equal(listingForC.hasUnlockedContact, false);
  assert.equal(listingForC.contactValue, undefined);

  // Unauthenticated user -> redacted
  const listingForGuest = await harness.getListingById(listing.id, undefined);
  assert.equal(listingForGuest.hasUnlockedContact, false);
  assert.equal(listingForGuest.contactValue, undefined);
});

/* -------------------------------------------------------------------------- */
/*                                  TIER 4                                    */
/* -------------------------------------------------------------------------- */

registerTest('Tier 4', 'T4.01', 'End-of-Semester Hostel Clearance Day-in-the-Life Scenario', async (harness) => {
  const seniorId = 'senior_aarav';
  // Senior lists 4 items
  const item1 = await harness.createListing({
    userId: seniorId,
    title: 'Hero Sprint 21-Speed Cycle',
    price: 3800,
    category: 'Cycles & transport',
    contactMethod: 'WhatsApp',
    contactValue: '9876543210'
  });
  await harness.createListing({
    userId: seniorId,
    title: 'Ergonomic Study Chair',
    price: 900,
    category: 'Furniture'
  });
  await harness.createListing({
    userId: seniorId,
    title: 'Casio Scientific Calculator',
    price: 700,
    category: 'Stationery & lab gear'
  });
  await harness.createListing({
    userId: seniorId,
    title: 'Extension Board with Surge Protector',
    price: 350,
    category: 'Hostel essentials'
  });

  assert.equal(await harness.countActiveListings(seniorId), 4);

  // Fresher Kabir searches cycle and buys it
  const fresherId = 'fresher_kabir';
  const cycleListing = (await harness.getListings({ search: 'Hero Sprint 21-Speed Cycle' }))[0];
  assert.ok(cycleListing);

  // Contact hidden before enquiry
  const cyclePre = await harness.getListingById(cycleListing.id, fresherId);
  assert.equal(cyclePre.contactValue, undefined);

  // Enquire
  await harness.createEnquiry({
    listingId: cycleListing.id,
    buyerId: fresherId,
    message: 'Can we meet at the campus main gate?'
  });

  // Contact unlocked
  const cyclePost = await harness.getListingById(cycleListing.id, fresherId);
  assert.equal(cyclePost.hasUnlockedContact, true);
  assert.equal(cyclePost.contactValue, '9876543210');

  // Senior marks cycle as sold
  await harness.updateListing(item1.id, { status: 'sold' }, seniorId);

  // Active listings for senior is now 3
  assert.equal(await harness.countActiveListings(seniorId), 3);
});

registerTest('Tier 4', 'T4.04', 'Outside Scammer Intrusion & Scraping Prevention Scenario', async (harness) => {
  // Attacker attempts to login with external email
  assert.equal(harness.isBennettEmail('intruder@gmail.com'), false);
  await assert.rejects(
    async () => {
      await harness.requestOTP('intruder@gmail.com');
    },
    /Only @bennett\.edu\.in emails permitted/
  );

  // Attacker attempts phishing domain
  assert.equal(harness.isBennettEmail('scammer@bennett.edu.in.phishing.org'), false);

  // Attacker attempts unauthenticated scraping of listings
  const scrapedFeed = await harness.getListings({ viewerId: undefined });
  for (const item of scrapedFeed) {
    assert.equal(item.contactValue, undefined, `Listing ${item.id} leaked contactValue!`);
    assert.equal(item.hasUnlockedContact, false);
  }
});
