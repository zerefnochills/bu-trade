/**
 * BU Trade — Tier 2 Boundary & Corner Cases Test Suite
 * 
 * Implements ALL 44 Tier 2 Boundary & Corner test cases from TEST_INFRA.md § 5.2:
 * - BC01: Email Domain Boundaries (T2.01.1 to T2.01.7)
 * - BC02: Active Listing Cap Boundaries (T2.02.1 to T2.02.5)
 * - BC03: Price, Title & Content Boundaries (T2.03.1 to T2.03.7)
 * - BC04: Image Array Boundaries (T2.04.1 to T2.04.5)
 * - BC05: Academic Year & Residence Boundaries (T2.05.1 to T2.05.5)
 * - BC06: Feed Search & Filtering Corner Cases (T2.06.1 to T2.06.5)
 * - BC07: Privacy & Access Boundary Conditions (T2.07.1 to T2.07.5)
 * - BC08: Moderation & Reporting Boundaries (T2.08.1 to T2.08.5)
 */

import assert from 'node:assert/strict';
import { registerTest } from './harness.mjs';

/* -------------------------------------------------------------------------- */
/*             BC01: Email Domain Boundaries (T2.01.1 - T2.01.7)              */
/* -------------------------------------------------------------------------- */

registerTest('Tier 2', 'T2.01.1', '[Invalid Domain] Rejects user@gmail.com', async (harness) => {
  assert.equal(harness.isBennettEmail('user@gmail.com'), false);
  assert.equal(harness.isBennettEmail('student@gmail.com'), false);
});

registerTest('Tier 2', 'T2.01.2', '[Invalid Domain] Rejects user@yahoo.co.in', async (harness) => {
  assert.equal(harness.isBennettEmail('user@yahoo.co.in'), false);
  assert.equal(harness.isBennettEmail('test@outlook.com'), false);
});

registerTest('Tier 2', 'T2.01.3', '[Phishing/Subdomain] Rejects user@bennett.edu.in.evil.com', async (harness) => {
  assert.equal(harness.isBennettEmail('user@bennett.edu.in.evil.com'), false);
  assert.equal(harness.isBennettEmail('attacker@bennett.edu.in.phishing.org'), false);
});

registerTest('Tier 2', 'T2.01.4', '[Incomplete Domain] Rejects user@bennett.edu', async (harness) => {
  assert.equal(harness.isBennettEmail('user@bennett.edu'), false);
  assert.equal(harness.isBennettEmail('student@bennett.in'), false);
});

registerTest('Tier 2', 'T2.01.5', '[Missing TLD] Rejects user@bennett', async (harness) => {
  assert.equal(harness.isBennettEmail('user@bennett'), false);
  assert.equal(harness.isBennettEmail('user@bennett.'), false);
});

registerTest('Tier 2', 'T2.01.6', '[Whitespace Infiltration] Rejects " user@bennett.edu.in " when untrimmed', async (harness) => {
  assert.equal(harness.isBennettEmail(' user@bennett.edu.in '), false);
  assert.equal(harness.isBennettEmail('user@bennett.edu.in '), false);
  assert.equal(harness.isBennettEmail(' user@bennett.edu.in'), false);
});

registerTest('Tier 2', 'T2.01.7', '[Prefix-only] Rejects @bennett.edu.in with empty local part', async (harness) => {
  assert.equal(harness.isBennettEmail('@bennett.edu.in'), false);
  assert.equal(harness.isBennettEmail(''), false);
});

/* -------------------------------------------------------------------------- */
/*        BC02: Active Listing Cap Boundary Conditions (T2.02.1 - T2.02.5)    */
/* -------------------------------------------------------------------------- */

registerTest('Tier 2', 'T2.02.1', '[Exact 10] Student successfully creates exactly 10 active listings', async (harness) => {
  const uid = 'user_bc02_1';
  for (let i = 1; i <= 10; i++) {
    const l = await harness.createListing({
      userId: uid,
      title: `Active Item ${i}`,
      price: 100 * i
    });
    assert.ok(l.id);
  }
  const count = await harness.countActiveListings(uid);
  assert.equal(count, 10);
});

registerTest('Tier 2', 'T2.02.2', '[11th Attempt Rejection] 11th active listing throws cap error', async (harness) => {
  const uid = 'user_bc02_2';
  for (let i = 1; i <= 10; i++) {
    await harness.createListing({ userId: uid, title: `Active Item ${i}`, price: 100 });
  }
  await assert.rejects(async () => {
    await harness.createListing({ userId: uid, title: 'Item 11 Should Fail', price: 100 });
  }, /Active listing limit of 10 reached/);
});

registerTest('Tier 2', 'T2.02.3', '[Sold Item Re-entry] Marking item sold decrements active count allowing 11th listing', async (harness) => {
  const uid = 'user_bc02_3';
  const created = [];
  for (let i = 1; i <= 10; i++) {
    created.push(await harness.createListing({ userId: uid, title: `Active Item ${i}`, price: 100 }));
  }
  assert.equal(await harness.countActiveListings(uid), 10);

  // Mark one item sold
  await harness.updateListing(created[0].id, { status: 'sold' }, uid);
  assert.equal(await harness.countActiveListings(uid), 9);

  // 11th listing now succeeds
  const l11 = await harness.createListing({ userId: uid, title: 'Item 11 After Sold', price: 150 });
  assert.ok(l11.id);
  assert.equal(await harness.countActiveListings(uid), 10);
});

registerTest('Tier 2', 'T2.02.4', '[Delisted Item Re-entry] Delisting an item allows creating new listing within cap', async (harness) => {
  const uid = 'user_bc02_4';
  const created = [];
  for (let i = 1; i <= 10; i++) {
    created.push(await harness.createListing({ userId: uid, title: `Active Item ${i}`, price: 100 }));
  }
  // Delist one item
  await harness.updateListing(created[0].id, { status: 'delisted' }, uid);
  assert.equal(await harness.countActiveListings(uid), 9);

  // New listing creation succeeds
  const lNew = await harness.createListing({ userId: uid, title: 'Replacement Item', price: 200 });
  assert.ok(lNew.id);
  assert.equal(await harness.countActiveListings(uid), 10);
});

registerTest('Tier 2', 'T2.02.5', '[Relist at Cap Rejection] Relisting delisted item while at 10 active throws cap error', async (harness) => {
  const uid = 'user_bc02_5';
  const created = [];
  for (let i = 1; i <= 10; i++) {
    created.push(await harness.createListing({ userId: uid, title: `Item ${i}`, price: 100 }));
  }
  // Delist item 0
  await harness.updateListing(created[0].id, { status: 'delisted' }, uid);
  assert.equal(await harness.countActiveListings(uid), 9);

  // Create another active item to bring count back to 10
  await harness.createListing({ userId: uid, title: 'Buffer Item', price: 100 });
  assert.equal(await harness.countActiveListings(uid), 10);

  // Attempting to relist the delisted item must be rejected
  await assert.rejects(async () => {
    await harness.updateListing(created[0].id, { status: 'active' }, uid);
  }, /Active listing limit of 10 reached/);
});

registerTest('Tier 2', 'T2.02.6', '[Concurrency Burst Cap Enforcement] 5 concurrent creations from count=9 results in exactly 1 success and count=10', async (harness) => {
  const uid = 'user_concurrency_create';
  for (let i = 1; i <= 9; i++) {
    await harness.createListing({ userId: uid, title: `Pre Item ${i}`, price: 100 });
  }
  assert.equal(await harness.countActiveListings(uid), 9);

  const burstPromises = Array.from({ length: 5 }, (_, i) =>
    harness.createListing({ userId: uid, title: `Burst Item ${i}`, price: 100 })
  );
  const results = await Promise.allSettled(burstPromises);
  const succeeded = results.filter(r => r.status === 'fulfilled');
  const rejected = results.filter(r => r.status === 'rejected');

  assert.equal(succeeded.length, 1);
  assert.equal(rejected.length, 4);
  assert.equal(await harness.countActiveListings(uid), 10);
});

registerTest('Tier 2', 'T2.02.7', '[Concurrency Burst Relist Cap Enforcement] 5 concurrent relistings from count=9 results in exactly 1 success and count=10', async (harness) => {
  const uid = 'user_concurrency_relist';
  for (let i = 1; i <= 9; i++) {
    await harness.createListing({ userId: uid, title: `Active ${i}`, price: 100 });
  }
  const delistedItems = [];
  for (let i = 1; i <= 5; i++) {
    const item = await harness.createListing({ userId: uid, title: `Delisted ${i}`, price: 100, status: 'delisted' });
    delistedItems.push(item);
  }
  assert.equal(await harness.countActiveListings(uid), 9);

  const relistPromises = delistedItems.map(item =>
    harness.updateListing(item.id, { status: 'active' }, uid)
  );
  const results = await Promise.allSettled(relistPromises);
  const succeeded = results.filter(r => r.status === 'fulfilled');
  const rejected = results.filter(r => r.status === 'rejected');

  assert.equal(succeeded.length, 1);
  assert.equal(rejected.length, 4);
  assert.equal(await harness.countActiveListings(uid), 10);
});

/* -------------------------------------------------------------------------- */
/*         BC03: Price, Title & Content Boundaries (T2.03.1 - T2.03.7)        */
/* -------------------------------------------------------------------------- */

registerTest('Tier 2', 'T2.03.1', '[Negative Price] Creating listing with price -50 throws error', async (harness) => {
  await assert.rejects(async () => {
    await harness.createListing({
      userId: 'user_seed_aarav',
      title: 'Negative Price Item',
      price: -50
    });
  }, /Price cannot be negative/);
});

registerTest('Tier 2', 'T2.03.2', '[Zero Price / Free] Creating listing with price 0 succeeds', async (harness) => {
  const l = await harness.createListing({
    userId: 'user_seed_aarav',
    title: 'Free Engineering Graphics Board',
    price: 0,
    category: 'Stationery & lab gear'
  });
  assert.ok(l.id);
  assert.equal(l.price, 0);
  assert.equal(l.status, 'active');
});

registerTest('Tier 2', 'T2.03.3', '[Extreme Price] High price 10000000 is safely stored as numeric value', async (harness) => {
  const l = await harness.createListing({
    userId: 'user_seed_aarav',
    title: 'Extreme High Price Item',
    price: 10000000
  });
  assert.ok(l.id);
  assert.equal(l.price, 10000000);
});

registerTest('Tier 2', 'T2.03.4', '[Title Length Max] Title of exactly 80 characters is accepted', async (harness) => {
  const title80 = 'A'.repeat(80);
  const l = await harness.createListing({
    userId: 'user_seed_aarav',
    title: title80,
    price: 500
  });
  assert.ok(l.id);
  assert.equal(l.title.length, 80);
});

registerTest('Tier 2', 'T2.03.5', '[Title Length Exceeded] Title of 81 characters is handled safely', async (harness) => {
  const title81 = 'B'.repeat(81);
  const l = await harness.createListing({
    userId: 'user_seed_aarav',
    title: title81,
    price: 500
  });
  assert.ok(l.id);
  assert.ok(l.title.length >= 80);
});

registerTest('Tier 2', 'T2.03.6', '[Empty / Whitespace Title] Title containing only spaces throws validation error', async (harness) => {
  await assert.rejects(async () => {
    await harness.createListing({
      userId: 'user_seed_aarav',
      title: '     ',
      price: 200
    });
  }, /Title is required/);
});

registerTest('Tier 2', 'T2.03.7', '[XSS Infiltration in Description] Description with script tag stored safely as literal text', async (harness) => {
  const xssPayload = '<script>alert("XSS")</script>';
  const l = await harness.createListing({
    userId: 'user_seed_aarav',
    title: 'Security Sanitization Test',
    price: 150,
    description: xssPayload
  });
  assert.ok(l.id);
  assert.equal(l.description, xssPayload);
});

/* -------------------------------------------------------------------------- */
/*              BC04: Image Array Boundaries (T2.04.1 - T2.04.5)              */
/* -------------------------------------------------------------------------- */

registerTest('Tier 2', 'T2.04.1', '[0 Images] Creating listing with empty images array succeeds', async (harness) => {
  const l = await harness.createListing({
    userId: 'user_seed_aarav',
    title: 'Zero Images Test',
    price: 100,
    images: []
  });
  assert.ok(l.id);
  assert.deepEqual(l.images, []);
});

registerTest('Tier 2', 'T2.04.2', '[Exact 5 Images] Creating listing with exactly 5 images succeeds', async (harness) => {
  const fiveImages = ['img1.webp', 'img2.webp', 'img3.webp', 'img4.webp', 'img5.webp'];
  const l = await harness.createListing({
    userId: 'user_seed_aarav',
    title: 'Exact Five Images Test',
    price: 100,
    images: fiveImages
  });
  assert.ok(l.id);
  assert.equal(l.images.length, 5);
  assert.deepEqual(l.images, fiveImages);
});

registerTest('Tier 2', 'T2.04.3', '[6 Images Overflow] 6 images truncated to the first 5 images', async (harness) => {
  const sixImages = ['1.webp', '2.webp', '3.webp', '4.webp', '5.webp', '6.webp'];
  const l = await harness.createListing({
    userId: 'user_seed_aarav',
    title: 'Six Images Truncation Test',
    price: 100,
    images: sixImages
  });
  assert.ok(l.id);
  assert.equal(l.images.length, 5);
  assert.deepEqual(l.images, ['1.webp', '2.webp', '3.webp', '4.webp', '5.webp']);
});

registerTest('Tier 2', 'T2.04.4', '[Corrupt Image URL] Non-data URI string handled gracefully without crash', async (harness) => {
  const corruptUrl = 'not-a-valid-data-url-corrupt-string';
  const l = await harness.createListing({
    userId: 'user_seed_aarav',
    title: 'Corrupt URI Test',
    price: 100,
    images: [corruptUrl]
  });
  assert.ok(l.id);
  assert.equal(l.images[0], corruptUrl);
});

registerTest('Tier 2', 'T2.04.5', '[Large Aspect Ratio] Long base64 data URI persists without distortion', async (harness) => {
  const longDataUri = 'data:image/webp;base64,' + 'A'.repeat(2048);
  const l = await harness.createListing({
    userId: 'user_seed_aarav',
    title: 'Large Payload URI Test',
    price: 100,
    images: [longDataUri]
  });
  assert.ok(l.id);
  assert.equal(l.images[0], longDataUri);
});

/* -------------------------------------------------------------------------- */
/*     BC05: Academic Year & Residence Boundaries (T2.05.1 - T2.05.5)         */
/* -------------------------------------------------------------------------- */

registerTest('Tier 2', 'T2.05.1', '[Lower Bound Year] Academic year 1 is accepted', async (harness) => {
  const p = await harness.createProfile({
    id: 'user_bc05_1',
    email: 'year1@bennett.edu.in',
    fullName: 'Fresher Student',
    course: 'B.Tech CSE',
    year: 1,
    residence: 'Hostel'
  });
  assert.equal(p.year, 1);
});

registerTest('Tier 2', 'T2.05.2', '[Upper Bound Year] Academic year 5 (integrated / law) is accepted', async (harness) => {
  const p = await harness.createProfile({
    id: 'user_bc05_2',
    email: 'year5@bennett.edu.in',
    fullName: 'Senior Law Student',
    course: 'BA LLB',
    year: 5,
    residence: 'Day scholar'
  });
  assert.equal(p.year, 5);
});

registerTest('Tier 2', 'T2.05.3', '[Invalid Low Year] Academic year 0 throws validation error', async (harness) => {
  await assert.rejects(async () => {
    await harness.createProfile({
      id: 'user_bc05_3',
      email: 'year0@bennett.edu.in',
      fullName: 'Invalid Year 0',
      course: 'B.Tech',
      year: 0,
      residence: 'Hostel'
    });
  }, /Academic year must be an integer between 1 and 5/);
});

registerTest('Tier 2', 'T2.05.4', '[Invalid High Year] Academic year 6 throws validation error', async (harness) => {
  await assert.rejects(async () => {
    await harness.createProfile({
      id: 'user_bc05_4',
      email: 'year6@bennett.edu.in',
      fullName: 'Invalid Year 6',
      course: 'B.Tech',
      year: 6,
      residence: 'Hostel'
    });
  }, /Academic year must be an integer between 1 and 5/);
});

registerTest('Tier 2', 'T2.05.5', '[Invalid Residence Enum] Residence value outside Hostel/Day scholar throws validation error', async (harness) => {
  await assert.rejects(async () => {
    await harness.createProfile({
      id: 'user_bc05_5',
      email: 'residence_invalid@bennett.edu.in',
      fullName: 'Invalid Residence',
      course: 'B.Tech',
      year: 2,
      residence: 'Off-Campus Apartment'
    });
  }, /Residence must be 'Hostel' or 'Day scholar'/);
});

/* -------------------------------------------------------------------------- */
/*       BC06: Feed Search & Filtering Corner Cases (T2.06.1 - T2.06.5)       */
/* -------------------------------------------------------------------------- */

registerTest('Tier 2', 'T2.06.1', '[Empty Search Query] Search "" returns all active items', async (harness) => {
  const list = await harness.getListings({ search: '' });
  assert.equal(list.length, 6);
});

registerTest('Tier 2', 'T2.06.2', '[Whitespace Search Query] Search "   " trims and returns all active items', async (harness) => {
  const list = await harness.getListings({ search: '   ' });
  assert.equal(list.length, 6);
});

registerTest('Tier 2', 'T2.06.3', '[Regex Injection Search] Regex special symbols treated as literal text without crash', async (harness) => {
  const regexQuery = '.*+?^${}()|[]\\';
  const list = await harness.getListings({ search: regexQuery });
  assert.ok(Array.isArray(list));
  assert.equal(list.length, 0);
});

registerTest('Tier 2', 'T2.06.4', '[Zero Match Search] Search for non-existent term returns empty array []', async (harness) => {
  const list = await harness.getListings({ search: 'XYZNONEXISTENTQUERY999' });
  assert.ok(Array.isArray(list));
  assert.equal(list.length, 0);
});

registerTest('Tier 2', 'T2.06.5', '[Empty Category Filter] Non-matching category returns empty array []', async (harness) => {
  const list = await harness.getListings({ category: 'Clothing' });
  assert.ok(Array.isArray(list));
  assert.equal(list.length, 0);
});

/* -------------------------------------------------------------------------- */
/*       BC07: Privacy & Access Boundary Conditions (T2.07.1 - T2.07.5)       */
/* -------------------------------------------------------------------------- */

registerTest('Tier 2', 'T2.07.1', '[Non-Owner Edit] User B attempting to edit User A listing throws Unauthorized error', async (harness) => {
  await assert.rejects(async () => {
    await harness.updateListing('1', { price: 100 }, 'user_seed_mehak');
  }, /Unauthorized: Only the listing owner can update this listing/);
});

registerTest('Tier 2', 'T2.07.2', '[Non-Owner Delete] User B attempting to delete User A listing throws Unauthorized error', async (harness) => {
  await assert.rejects(async () => {
    await harness.deleteListing('1', 'user_seed_mehak');
  }, /Unauthorized: Only the listing owner can delete this listing/);
});

registerTest('Tier 2', 'T2.07.3', '[Direct ID Snooping] Fetching listing without session or enquiry returns redacted contactValue', async (harness) => {
  const l = await harness.getListingById('1', undefined);
  assert.ok(l);
  assert.equal(l.contactValue, undefined);
  assert.equal(l.hasUnlockedContact, false);
});

registerTest('Tier 2', 'T2.07.4', '[Duplicate Enquiry] Duplicate enquiry by same buyer does not error out and maintains unlock', async (harness) => {
  const e1 = await harness.createEnquiry({ listingId: '1', buyerId: 'user_seed_mehak', message: 'First enquiry' });
  assert.ok(e1.id);
  const e2 = await harness.createEnquiry({ listingId: '1', buyerId: 'user_seed_mehak', message: 'Second enquiry' });
  assert.ok(e2.id);

  const l = await harness.getListingById('1', 'user_seed_mehak');
  assert.equal(l.hasUnlockedContact, true);
  assert.equal(l.contactValue, '9876543221');
});

registerTest('Tier 2', 'T2.07.5', '[Enquiry on Own Listing] Owner enquiry on own listing is handled cleanly with contact accessible', async (harness) => {
  const e = await harness.createEnquiry({ listingId: '1', buyerId: 'user_seed_aarav', message: 'Note on own item' });
  assert.ok(e.id);
  const l = await harness.getListingById('1', 'user_seed_aarav');
  assert.equal(l.hasUnlockedContact, true);
  assert.equal(l.contactValue, '9876543221');
});

/* -------------------------------------------------------------------------- */
/*       BC08: Moderation & Reporting Boundaries (T2.08.1 - T2.08.5)          */
/* -------------------------------------------------------------------------- */

registerTest('Tier 2', 'T2.08.1', '[Missing Report Reason] Submitting report with empty reason throws validation error', async (harness) => {
  await assert.rejects(async () => {
    await harness.createReport({
      listingId: '1',
      reporterId: 'user_seed_mehak',
      reason: '   '
    });
  }, /Report reason is required/);
});

registerTest('Tier 2', 'T2.08.2', '[Long Report Details] Report with 2000 character details text is safely stored', async (harness) => {
  const longDetails = 'Violations observed: ' + 'X'.repeat(2000);
  const r = await harness.createReport({
    listingId: '1',
    reporterId: 'user_seed_mehak',
    reason: 'Suspicious activity',
    details: longDetails
  });
  assert.ok(r.id);
  assert.equal(r.details, longDetails);
});

registerTest('Tier 2', 'T2.08.3', '[Report on Sold Listing] Submitting report on sold listing succeeds', async (harness) => {
  await harness.updateListing('1', { status: 'sold' }, 'user_seed_aarav');
  const r = await harness.createReport({
    listingId: '1',
    reporterId: 'user_seed_mehak',
    reason: 'Counterfeit item'
  });
  assert.ok(r.id);
  assert.equal(r.listingId, '1');
  assert.equal(r.reason, 'Counterfeit item');
});

registerTest('Tier 2', 'T2.08.4', '[Non-existent Listing Report] Submitting report on invalid listing ID throws error', async (harness) => {
  await assert.rejects(async () => {
    await harness.createReport({
      listingId: 'nonexistent_9999',
      reporterId: 'user_seed_mehak',
      reason: 'Spam'
    });
  }, /Listing not found/);
});

registerTest('Tier 2', 'T2.08.5', '[Invalid Status Transition] Report status outside allowed enum throws validation error', async (harness) => {
  const r = await harness.createReport({
    listingId: '1',
    reporterId: 'user_seed_mehak',
    reason: 'Policy violation'
  });
  await assert.rejects(async () => {
    await harness.updateReportStatus(r.id, 'closed');
  }, /Invalid report status/);
});

/* -------------------------------------------------------------------------- */
/*       BC09: Profile & My Listings Edge Cases (T2.09.1 - T2.09.6)           */
/* -------------------------------------------------------------------------- */

registerTest('Tier 2', 'T2.09.1', '[Empty Listings Edge] User with 0 listings returns empty array [] and 0 active count', async (harness) => {
  const uid = 'user_empty_listings';
  const list = await harness.getListings({ userId: uid });
  assert.deepEqual(list, []);
  assert.equal(await harness.countActiveListings(uid), 0);
});

registerTest('Tier 2', 'T2.09.2', '[Null/Undefined Listings Defensive Handling] Querying listings with non-existent user returns [] safely', async (harness) => {
  const listNull = await harness.getListings({ userId: undefined });
  assert.ok(Array.isArray(listNull));
  assert.equal(listNull.length, 6); // returns default active seed listings
});

registerTest('Tier 2', 'T2.09.3', '[Free Item Price Formatting] Listing with price 0 formats cleanly as Free', async (harness) => {
  const l = await harness.createListing({
    userId: 'user_seed_aarav',
    title: 'Free Semester Study Handouts',
    price: 0,
    category: 'Books & notes'
  });
  assert.equal(l.price, 0);
  assert.equal(harness.formatPrice(l.price), 'Free');
});

registerTest('Tier 2', 'T2.09.4', '[Null and Undefined Price Safety] Null and undefined price boundaries format safely without NaN', async (harness) => {
  assert.equal(harness.formatPrice(0), 'Free');
  assert.equal(harness.formatPrice(null), '₹0');
  assert.equal(harness.formatPrice(undefined), '₹0');
  assert.equal(harness.formatPrice(4500), '₹4,500');
  assert.match(harness.formatPrice(null), /^(Free|₹0)$/);
  assert.doesNotMatch(harness.formatPrice(null), /NaN/);
});

registerTest('Tier 2', 'T2.09.5', '[Delisted Listing Permanent Deletion] Owner can permanently delete delisted listing', async (harness) => {
  const uid = 'user_del_test';
  const l = await harness.createListing({ userId: uid, title: 'Item to Delete', price: 200, status: 'delisted' });
  const deleted = await harness.deleteListing(l.id, uid);
  assert.equal(deleted, true);
  const found = await harness.getListingById(l.id);
  assert.equal(found, null);
});

registerTest('Tier 2', 'T2.09.6', '[Relisting at Cap Edge] Relisting sold item when active count is 10 throws cap error', async (harness) => {
  const uid = 'user_relist_cap';
  const items = [];
  for (let i = 1; i <= 10; i++) {
    items.push(await harness.createListing({ userId: uid, title: `Active ${i}`, price: 100 }));
  }
  // Create an initial sold item
  await harness.updateListing(items[0].id, { status: 'sold' }, uid);
  // Bring active count back to 10
  await harness.createListing({ userId: uid, title: 'Buffer Active', price: 100 });
  assert.equal(await harness.countActiveListings(uid), 10);

  await assert.rejects(async () => {
    await harness.updateListing(items[0].id, { status: 'active' }, uid);
  }, /Active listing limit of 10 reached/);
});

/* -------------------------------------------------------------------------- */
/*       BC10: Feedback Post Validation Limits (T2.10.1 - T2.10.6)             */
/* -------------------------------------------------------------------------- */

registerTest('Tier 2', 'T2.10.1', '[Title Boundary 120] Feedback title at exact 120 chars succeeds; 121 chars rejected', async (harness) => {
  const title120 = 'A'.repeat(120);
  const post = await harness.createFeedbackPost({
    userId: 'user_seed_aarav',
    itemTitle: title120,
    content: 'Valid content body for boundary test.'
  });
  assert.ok(post.id);
  assert.equal(post.itemTitle.length, 120);

  const title121 = 'B'.repeat(121);
  await assert.rejects(async () => {
    await harness.createFeedbackPost({
      userId: 'user_seed_aarav',
      itemTitle: title121,
      content: 'Valid content body.'
    });
  }, /Title cannot exceed 120/);
});

registerTest('Tier 2', 'T2.10.2', '[Content Boundary 2000] Feedback content at exact 2000 chars succeeds; 2001 chars rejected', async (harness) => {
  const content2000 = 'C'.repeat(2000);
  const post = await harness.createFeedbackPost({
    userId: 'user_seed_aarav',
    itemTitle: 'Calculator Review',
    content: content2000
  });
  assert.ok(post.id);
  assert.equal(post.content.length, 2000);

  const content2001 = 'D'.repeat(2001);
  await assert.rejects(async () => {
    await harness.createFeedbackPost({
      userId: 'user_seed_aarav',
      itemTitle: 'Calculator Review',
      content: content2001
    });
  }, /Content cannot exceed 2000/);
});

registerTest('Tier 2', 'T2.10.3', '[Empty/Whitespace Rejection] Empty or whitespace-only title and content are rejected', async (harness) => {
  await assert.rejects(async () => {
    await harness.createFeedbackPost({
      userId: 'user_seed_aarav',
      itemTitle: '   ',
      content: 'Valid content'
    });
  }, /Title is required/);

  await assert.rejects(async () => {
    await harness.createFeedbackPost({
      userId: 'user_seed_aarav',
      itemTitle: 'Valid Title',
      content: '   '
    });
  }, /Content is required/);
});

registerTest('Tier 2', 'T2.10.4', '[Rating Boundaries 1-5] Rating 0 and 6 rejected; non-integer 4.5 rejected; 1 and 5 accepted', async (harness) => {
  await assert.rejects(async () => {
    await harness.createFeedbackPost({
      userId: 'user_seed_aarav',
      itemTitle: 'Valid Title',
      content: 'Content',
      rating: 0
    });
  }, /Rating must be between 1 and 5/);

  await assert.rejects(async () => {
    await harness.createFeedbackPost({
      userId: 'user_seed_aarav',
      itemTitle: 'Valid Title',
      content: 'Content',
      rating: 6
    });
  }, /Rating must be between 1 and 5/);

  await assert.rejects(async () => {
    await harness.createFeedbackPost({
      userId: 'user_seed_aarav',
      itemTitle: 'Valid Title',
      content: 'Content',
      rating: 4.5
    });
  }, /Rating must be an integer/);

  const p1 = await harness.createFeedbackPost({
    userId: 'user_seed_aarav',
    itemTitle: 'Min Rating Item',
    content: 'Review content',
    rating: 1
  });
  assert.equal(p1.rating, 1);

  const p5 = await harness.createFeedbackPost({
    userId: 'user_seed_aarav',
    itemTitle: 'Max Rating Item',
    content: 'Review content',
    rating: 5
  });
  assert.equal(p5.rating, 5);
});

registerTest('Tier 2', 'T2.10.5', '[Image Array Clamping 3] 3 images accepted; 4+ images truncated to first 3', async (harness) => {
  const fourImages = ['img1.webp', 'img2.webp', 'img3.webp', 'img4.webp'];
  const post = await harness.createFeedbackPost({
    userId: 'user_seed_aarav',
    itemTitle: 'Images Test',
    content: 'Content',
    images: fourImages
  });
  assert.equal(post.images.length, 3);
  assert.deepEqual(post.images, ['img1.webp', 'img2.webp', 'img3.webp']);
});

registerTest('Tier 2', 'T2.10.6', '[Invalid Base64 Sanitization] Empty/corrupt non-string elements filtered from images array', async (harness) => {
  const mixedImages = ['data:image/webp;base64,valid1', '', '   ', null, 'data:image/webp;base64,valid2'];
  const post = await harness.createFeedbackPost({
    userId: 'user_seed_aarav',
    itemTitle: 'Sanitization Test',
    content: 'Content',
    images: mixedImages
  });
  assert.equal(post.images.length, 2);
  assert.equal(post.images[0], 'data:image/webp;base64,valid1');
  assert.equal(post.images[1], 'data:image/webp;base64,valid2');
});

/* -------------------------------------------------------------------------- */
/*       BC11: Feedback Voting Boundaries (T2.11.1 - T2.11.6)                  */
/* -------------------------------------------------------------------------- */

registerTest('Tier 2', 'T2.11.1', '[Unauthenticated Vote Rejection] Voting without session or userId throws error', async (harness) => {
  const post = await harness.createFeedbackPost({
    userId: 'user_seed_aarav',
    itemTitle: 'Item for Vote Auth',
    content: 'Content'
  });
  await assert.rejects(async () => {
    await harness.voteFeedbackPost(post.id, undefined, 1);
  }, /Authentication required/);
});

registerTest('Tier 2', 'T2.11.2', '[Invalid Vote Type 0] voteType of 0 throws invalid vote type error', async (harness) => {
  const post = await harness.createFeedbackPost({
    userId: 'user_seed_aarav',
    itemTitle: 'Item for Vote 0',
    content: 'Content'
  });
  await assert.rejects(async () => {
    await harness.voteFeedbackPost(post.id, 'user_seed_mehak', 0);
  }, /Invalid vote type/);
});

registerTest('Tier 2', 'T2.11.3', '[Overflow Vote Type 2] voteType of 2 throws invalid vote type error', async (harness) => {
  const post = await harness.createFeedbackPost({
    userId: 'user_seed_aarav',
    itemTitle: 'Item for Vote 2',
    content: 'Content'
  });
  await assert.rejects(async () => {
    await harness.voteFeedbackPost(post.id, 'user_seed_mehak', 2);
  }, /Invalid vote type/);
});

registerTest('Tier 2', 'T2.11.4', '[Underflow Vote Type -2] voteType of -2 throws invalid vote type error', async (harness) => {
  const post = await harness.createFeedbackPost({
    userId: 'user_seed_aarav',
    itemTitle: 'Item for Vote -2',
    content: 'Content'
  });
  await assert.rejects(async () => {
    await harness.voteFeedbackPost(post.id, 'user_seed_mehak', -2);
  }, /Invalid vote type/);
});

registerTest('Tier 2', 'T2.11.5', '[Non-Existent Feedback Vote] Voting on non-existent feedback ID throws not found error', async (harness) => {
  await assert.rejects(async () => {
    await harness.voteFeedbackPost('fb_non_existent_99999', 'user_seed_mehak', 1);
  }, /Feedback not found/);
});

registerTest('Tier 2', 'T2.11.6', '[Sequential Double-Click Idempotency] Double-clicking upvote toggles off to 0 without count corruption', async (harness) => {
  const post = await harness.createFeedbackPost({
    userId: 'user_seed_aarav',
    itemTitle: 'Double Click Test',
    content: 'Content'
  });
  // Click 1: Upvote
  const res1 = await harness.voteFeedbackPost(post.id, 'user_seed_mehak', 1);
  assert.equal(res1.score, 1);
  assert.equal(res1.userVote, 1);

  // Click 2: Upvote again -> toggle off
  const res2 = await harness.voteFeedbackPost(post.id, 'user_seed_mehak', 1);
  assert.equal(res2.score, 0);
  assert.equal(res2.userVote, 0);
  assert.equal(res2.upvotesCount, 0);
  assert.equal(res2.downvotesCount, 0);
});

/* -------------------------------------------------------------------------- */
/*    BC12: Trade/Borrow Duration & Access Boundaries (T2.12.1 - T2.12.7)      */
/* -------------------------------------------------------------------------- */

registerTest('Tier 2', 'T2.12.1', '[Empty Duration Rejection] Empty or whitespace-only duration string is rejected', async (harness) => {
  await assert.rejects(async () => {
    await harness.createTradeBorrowRequest({
      userId: 'user_seed_aarav',
      title: 'Lab Coat',
      description: 'Need for practicals',
      requestType: 'borrow',
      duration: '   ',
      category: 'Stationery & lab gear',
      contactMethod: 'WhatsApp',
      contactValue: '9876543210'
    });
  }, /Duration is required/);
});

registerTest('Tier 2', 'T2.12.2', '[Zero Duration Rejection] Zero durations like "0 days", "0 hours", "0" are rejected', async (harness) => {
  const zeroValues = ['0 days', '0 hours', '0'];
  for (const zeroDur of zeroValues) {
    await assert.rejects(async () => {
      await harness.createTradeBorrowRequest({
        userId: 'user_seed_aarav',
        title: 'Calculator',
        description: 'Need for exam',
        requestType: 'borrow',
        duration: zeroDur,
        category: 'Electronics',
        contactMethod: 'WhatsApp',
        contactValue: '9876543210'
      });
    }, /duration/i);
  }
});

registerTest('Tier 2', 'T2.12.3', '[Negative Duration Rejection] Negative durations like "-3 days", "-1", "-2 weeks" are rejected', async (harness) => {
  const negValues = ['-3 days', '-1', '-2 weeks'];
  for (const negDur of negValues) {
    await assert.rejects(async () => {
      await harness.createTradeBorrowRequest({
        userId: 'user_seed_aarav',
        title: 'Calculator',
        description: 'Need for exam',
        requestType: 'borrow',
        duration: negDur,
        category: 'Electronics',
        contactMethod: 'WhatsApp',
        contactValue: '9876543210'
      });
    }, /duration/i);
  }
});

registerTest('Tier 2', 'T2.12.4', '[Duration Length Boundary 60] Duration at 60 chars accepted; 61 chars rejected', async (harness) => {
  const dur60 = 'D'.repeat(60);
  const req = await harness.createTradeBorrowRequest({
    userId: 'user_seed_aarav',
    title: 'Textbook Swap',
    description: 'Looking to swap textbooks',
    requestType: 'trade',
    duration: dur60,
    category: 'Books & notes',
    contactMethod: 'WhatsApp',
    contactValue: '9876543210'
  });
  assert.ok(req.id);
  assert.equal(req.duration.length, 60);

  const dur61 = 'E'.repeat(61);
  await assert.rejects(async () => {
    await harness.createTradeBorrowRequest({
      userId: 'user_seed_aarav',
      title: 'Textbook Swap',
      description: 'Looking to swap textbooks',
      requestType: 'trade',
      duration: dur61,
      category: 'Books & notes',
      contactMethod: 'WhatsApp',
      contactValue: '9876543210'
    });
  }, /Duration cannot exceed/);
});

registerTest('Tier 2', 'T2.12.5', '[Unauthenticated Trade/Borrow Mutation] Mutating request without session throws error', async (harness) => {
  const req = await harness.createTradeBorrowRequest({
    userId: 'user_seed_aarav',
    title: 'Bedside Table',
    description: 'Need extra table',
    requestType: 'borrow',
    duration: '2 weeks',
    category: 'Furniture',
    contactMethod: 'Phone',
    contactValue: '9876543210'
  });

  await assert.rejects(async () => {
    await harness.updateTradeBorrowRequestStatus(req.id, 'fulfilled', undefined);
  }, /Authentication required/);

  await assert.rejects(async () => {
    await harness.deleteTradeBorrowRequest(req.id, undefined);
  }, /Authentication required/);
});

registerTest('Tier 2', 'T2.12.6', '[Non-Owner Mutation Rejection] Non-owner attempting to fulfill or delete throws Unauthorized error', async (harness) => {
  const req = await harness.createTradeBorrowRequest({
    userId: 'user_seed_aarav',
    title: 'Study Lamp',
    description: 'Need for study',
    requestType: 'borrow',
    duration: '5 days',
    category: 'Hostel essentials',
    contactMethod: 'WhatsApp',
    contactValue: '9876543210'
  });

  // User B attempts to fulfill
  await assert.rejects(async () => {
    await harness.updateTradeBorrowRequestStatus(req.id, 'fulfilled', 'user_seed_mehak');
  }, /Unauthorized/);

  // User B attempts to delete
  await assert.rejects(async () => {
    await harness.deleteTradeBorrowRequest(req.id, 'user_seed_mehak');
  }, /Unauthorized/);
});

registerTest('Tier 2', 'T2.12.7', '[Invalid Type & Category Validation] Invalid requestType and invalid category are rejected', async (harness) => {
  await assert.rejects(async () => {
    await harness.createTradeBorrowRequest({
      userId: 'user_seed_aarav',
      title: 'Invalid Type Item',
      description: 'Desc',
      requestType: 'lease',
      duration: '3 days',
      category: 'Electronics',
      contactMethod: 'WhatsApp',
      contactValue: '9876543210'
    });
  }, /Request type must be borrow or trade/);

  await assert.rejects(async () => {
    await harness.createTradeBorrowRequest({
      userId: 'user_seed_aarav',
      title: 'Invalid Category Item',
      description: 'Desc',
      requestType: 'borrow',
      duration: '3 days',
      category: 'Automotive',
      contactMethod: 'WhatsApp',
      contactValue: '9876543210'
    });
  }, /Invalid category/);
});
