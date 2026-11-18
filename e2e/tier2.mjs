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
