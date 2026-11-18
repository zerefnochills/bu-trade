/**
 * BU Trade — Tier 4: Real-World Bennett University Campus Scenarios
 * 
 * Implements ALL 5 Real-World Bennett University Campus Scenarios from TEST_INFRA.md § 5.4:
 * - T4.01: Scenario 1 — End-of-Semester Hostel Clearance (Aarav Singhal 4th yr CSE Hostel 4 lists 4 items; Kabir fresher buys cycle; cycle marked sold; 3 items remain active)
 * - T4.02: Scenario 2 — Course Swap & Textbook Hustle (Mehak Kaur 2nd yr ECE lists Data Structures bundle ₹600 -> drops to ₹450 -> Rohan CSE sorts price_asc -> enquires -> buys -> feedback 5 stars)
 * - T4.03: Scenario 3 — Campus Power Seller & 10-Item Cap Enforcement (Ananya Roy 3rd yr Design lists 10 items -> 11th blocked -> marks hoodie sold -> 11th succeeds)
 * - T4.04: Scenario 4 — Outside Scammer Intrusion Rejection (Attacker @gmail.com rejected -> domain spoofing rejected -> direct API query returns redacted contact -> 0 contact leaks)
 * - T4.05: Scenario 5 — Prohibited Item Flagging & Moderation Intervention (Vape item listed -> Student reports -> Moderation queue retrieves -> Moderator resolves -> Item removed from feed)
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
/*                                  TIER 4                                    */
/* -------------------------------------------------------------------------- */

/**
 * T4.01: Scenario 1 — The End-of-Semester Hostel Clearance
 * Persona: Aarav Singhal, 4th-year B.Tech CSE graduating senior living in Hostel 4.
 * Narrative: Aarav needs to vacate within 48 hours. He lists 4 items.
 * Kabir (1st-year fresher) searches "cycle", enquires, unlocks WhatsApp, inspects at main gate.
 * Aarav marks cycle sold. Active listings drop to 3. The other 3 items remain active.
 */
registerTest(4, 'T4.01', 'Scenario 1: End-of-Semester Hostel Clearance (Aarav 4th yr CSE Hostel 4, Kabir fresher cycle trade)', async (harness) => {
  // 1. Aarav logs in and onboards as graduating senior
  const seniorEmail = 'aarav.singhal@bennett.edu.in';
  await harness.requestOTP(seniorEmail);
  const sessionSenior = await harness.verifyOTP(seniorEmail, '123456');

  const aarav = await harness.createProfile({
    id: sessionSenior.userId,
    email: seniorEmail,
    fullName: 'Aarav Singhal',
    course: 'B.Tech CSE',
    year: 4,
    residence: 'Hostel',
    whatsapp: '9876543210'
  });
  assert.equal(aarav.fullName, 'Aarav Singhal');
  assert.equal(aarav.residence, 'Hostel');

  // 2. Aarav lists 4 items before vacating hostel room
  const cycleItem = await harness.createListing({
    userId: aarav.id,
    title: 'Hero Sprint 21-Speed Cycle',
    price: 3800,
    category: 'Cycles & transport',
    age: '2 years',
    reason: 'Graduating this semester',
    description: 'Serviced Shimano gears, front suspension, comes with lock and bell.',
    contactMethod: 'WhatsApp',
    contactValue: '9876543210',
    images: ['cycle_front.webp', 'cycle_gears.webp']
  });

  const chairItem = await harness.createListing({
    userId: aarav.id,
    title: 'Ergonomic Study Chair',
    price: 900,
    category: 'Furniture',
    age: '1 year',
    reason: 'Hostel room clearance',
    description: 'Mesh back, height adjustable, clean condition.',
    contactMethod: 'WhatsApp',
    contactValue: '9876543210'
  });

  const calcItem = await harness.createListing({
    userId: aarav.id,
    title: 'Casio fx-991EX Scientific Calculator',
    price: 700,
    category: 'Stationery & lab gear',
    age: '1.5 years',
    reason: 'Completed engineering curriculum',
    description: 'ClassWiz solar + battery, original slide cover included.',
    contactMethod: 'WhatsApp',
    contactValue: '9876543210'
  });

  const extItem = await harness.createListing({
    userId: aarav.id,
    title: 'Extension Board with Surge Protector',
    price: 350,
    category: 'Hostel essentials',
    age: '6 months',
    reason: 'Moving out of hostel',
    description: '4 universal sockets with master switch and 3m heavy cable.',
    contactMethod: 'WhatsApp',
    contactValue: '9876543210'
  });

  // Verify Aarav has exactly 4 active listings
  assert.equal(await harness.countActiveListings(aarav.id), 4);

  // 3. Kabir (1st-year fresher, B.Des, Hostel) logs in
  const fresherEmail = 'kabir.thapar@bennett.edu.in';
  await harness.requestOTP(fresherEmail);
  const sessionFresher = await harness.verifyOTP(fresherEmail, '123456');

  const kabir = await harness.createProfile({
    id: sessionFresher.userId,
    email: fresherEmail,
    fullName: 'Kabir Thapar',
    course: 'B.Des',
    year: 1,
    residence: 'Hostel',
    whatsapp: '9712345615'
  });

  // 4. Kabir searches "cycle" on home feed
  const searchResults = await harness.getListings({
    search: 'cycle',
    viewerId: kabir.id
  });
  const foundCycle = searchResults.find(l => l.id === cycleItem.id);
  assert.ok(foundCycle, 'Aarav cycle listing must be discoverable');
  assert.equal(foundCycle.contactValue, undefined, 'Contact must be redacted in search results');

  // 5. Kabir views listing details; contact info is protected
  const cyclePreEnquiry = await harness.getListingById(cycleItem.id, kabir.id);
  assert.equal(cyclePreEnquiry.hasUnlockedContact, false);
  assert.equal(cyclePreEnquiry.contactValue, undefined);
  assert.equal(cyclePreEnquiry.sellerName, 'Aarav Singhal');
  assert.equal(cyclePreEnquiry.sellerCourse, 'B.Tech CSE');
  assert.equal(cyclePreEnquiry.sellerYear, 4);

  // 6. Kabir sends enquiry to coordinate physical handover
  const enquiry = await harness.createEnquiry({
    listingId: cycleItem.id,
    buyerId: kabir.id,
    message: 'Hi Aarav, is this still available? Can we meet at the campus main gate to test ride?'
  });
  assert.ok(enquiry.id);
  assert.equal(await harness.hasEnquired(cycleItem.id, kabir.id), true);

  // 7. Contact info unlocks immediately for Kabir
  const cyclePostEnquiry = await harness.getListingById(cycleItem.id, kabir.id);
  assert.equal(cyclePostEnquiry.hasUnlockedContact, true);
  assert.equal(cyclePostEnquiry.contactValue, '9876543210');

  const directContact = await harness.getListingContact(cycleItem.id, kabir.id);
  assert.equal(directContact.contactMethod, 'WhatsApp');
  assert.equal(directContact.contactValue, '9876543210');

  // 8. Physical inspection at main gate succeeds; Aarav marks cycle as 'sold'
  const soldCycle = await harness.updateListing(cycleItem.id, { status: 'sold' }, aarav.id);
  assert.equal(soldCycle.status, 'sold');

  // 9. Feed & active count verification
  // Active search query no longer includes the sold cycle
  const activeCycleQuery = await harness.getListings({ search: 'Hero Sprint 21-Speed Cycle' });
  assert.equal(activeCycleQuery.length, 0);

  // Aarav active listings drop from 4 to 3
  const activeCountAfter = await harness.countActiveListings(aarav.id);
  assert.equal(activeCountAfter, 3);

  // The remaining 3 items remain active and discoverable
  const chair = await harness.getListingById(chairItem.id);
  const calc = await harness.getListingById(calcItem.id);
  const ext = await harness.getListingById(extItem.id);
  assert.equal(chair.status, 'active');
  assert.equal(calc.status, 'active');
  assert.equal(ext.status, 'active');
});

/**
 * T4.02: Scenario 2 — The Course Swap & Textbook Hustle
 * Persona: Mehak Kaur, 2nd-year B.Tech ECE student.
 * Narrative: Semester classes start. Mehak completed Data Structures and lists note bundle for ₹600.
 * After 24 hrs, drops to ₹450. Rohan (2nd-year CSE) sorts price_asc, finds bundle, enquires, unlocks,
 * buys, Mehak marks sold, and Rohan submits 5-star feedback.
 */
registerTest(4, 'T4.02', 'Scenario 2: Course Swap & Textbook Hustle (Mehak 2nd yr ECE, Rohan CSE, price drop ₹600->₹450, 5-star feedback)', async (harness) => {
  // 1. Mehak onboards
  const mehakEmail = 'mehak.kaur@bennett.edu.in';
  await harness.requestOTP(mehakEmail);
  const sessionMehak = await harness.verifyOTP(mehakEmail, '123456');

  const mehak = await harness.createProfile({
    id: sessionMehak.userId,
    email: mehakEmail,
    fullName: 'Mehak Kaur',
    course: 'B.Tech ECE',
    year: 2,
    residence: 'Hostel',
    whatsapp: '9876543242'
  });

  // 2. Mehak lists Data Structures notes bundle under 'Books & notes' for ₹600
  const bundle = await harness.createListing({
    userId: mehak.id,
    title: 'Data Structures 3-Book Bundle & Handwritten Notes',
    price: 600,
    category: 'Books & notes',
    age: '1 year',
    reason: 'Course completed last semester',
    description: 'Includes Cormen algorithms, Weiss C++ DS book, and full lecture handwritten notes.',
    contactMethod: 'WhatsApp',
    contactValue: '9876543242'
  });
  assert.equal(bundle.price, 600);
  assert.equal(bundle.category, 'Books & notes');

  // 3. After 24 hours without enquiries, Mehak updates listing price to ₹450
  const updatedBundle = await harness.updateListing(bundle.id, { price: 450 }, mehak.id);
  assert.equal(updatedBundle.price, 450);

  // 4. Rohan (2nd-year CSE, day scholar) browses 'Books & notes', sorted price_asc
  const rohanEmail = 'rohan.verma@bennett.edu.in';
  await harness.requestOTP(rohanEmail);
  const sessionRohan = await harness.verifyOTP(rohanEmail, '123456');

  const rohan = await harness.createProfile({
    id: sessionRohan.userId,
    email: rohanEmail,
    fullName: 'Rohan Verma',
    course: 'B.Tech CSE',
    year: 2,
    residence: 'Day scholar'
  });

  const booksFeedAsc = await harness.getListings({
    category: 'Books & notes',
    sort: 'price_asc',
    viewerId: rohan.id
  });
  assert.ok(booksFeedAsc.length > 0);

  // Mehak's bundle at ₹450 is discovered
  const discoveredBundle = booksFeedAsc.find(b => b.id === bundle.id);
  assert.ok(discoveredBundle, 'Discounted book bundle must appear in Books feed');
  assert.equal(discoveredBundle.price, 450);

  // 5. Rohan views details: contact is initially hidden
  const detailPre = await harness.getListingById(bundle.id, rohan.id);
  assert.equal(detailPre.contactValue, undefined);
  assert.equal(detailPre.hasUnlockedContact, false);
  assert.equal(detailPre.sellerName, 'Mehak Kaur');
  assert.equal(detailPre.sellerCourse, 'B.Tech ECE');

  // 6. Rohan sends enquiry
  await harness.createEnquiry({
    listingId: bundle.id,
    buyerId: rohan.id,
    message: 'Can I collect this today near the library cafe?'
  });

  // 7. Mehak's contact unlocks for Rohan
  const detailPost = await harness.getListingById(bundle.id, rohan.id);
  assert.equal(detailPost.hasUnlockedContact, true);
  assert.equal(detailPost.contactValue, '9876543242');

  // 8. Transaction occurs; Mehak marks listing as 'sold'
  const soldBundle = await harness.updateListing(bundle.id, { status: 'sold' }, mehak.id);
  assert.equal(soldBundle.status, 'sold');

  // 9. Rohan leaves platform feedback rating BU Trade 5 stars
  const feedback = await harness.createFeedback({
    listingId: bundle.id,
    userId: rohan.id,
    rating: 5,
    comment: 'Saved money on semester books, great campus platform!'
  });
  assert.ok(feedback.id);
  assert.equal(feedback.rating, 5);
  assert.equal(feedback.userId, rohan.id);
  assert.equal(feedback.listingId, bundle.id);
  assert.equal(feedback.comment, 'Saved money on semester books, great campus platform!');
});

/**
 * T4.03: Scenario 3 — The Campus Power Seller & 10-Item Cap Enforcement
 * Persona: Ananya Roy, 3rd-year design student who is an active campus thrifter.
 * Narrative: Ananya lists 10 items consecutively -> 11th blocked with cap error ->
 * marks older hoodie sold -> active count drops to 9 -> 11th item succeeds.
 */
registerTest(4, 'T4.03', 'Scenario 3: Campus Power Seller & 10-Item Cap Enforcement (Ananya 3rd yr Design, 10-item cap, sold transition, replacement)', async (harness) => {
  // 1. Ananya onboards
  const ananyaEmail = 'ananya.roy@bennett.edu.in';
  await harness.requestOTP(ananyaEmail);
  const session = await harness.verifyOTP(ananyaEmail, '123456');

  const ananya = await harness.createProfile({
    id: session.userId,
    email: ananyaEmail,
    fullName: 'Ananya Roy',
    course: 'B.Des',
    year: 3,
    residence: 'Hostel'
  });

  // 2. Ananya lists 10 items consecutively across various campus categories
  const itemCatalog = [
    { title: 'Sketching Pencils Set 12 Grades', price: 250, category: 'Stationery & lab gear' },
    { title: 'Bennett University Oversized Hoodie M', price: 800, category: 'Clothing' },
    { title: 'A3 Drafting Board & T-Square', price: 1200, category: 'Stationery & lab gear' },
    { title: 'Desk Organizer & Pen Stand', price: 200, category: 'Hostel essentials' },
    { title: 'Wacom Intuos Drawing Tablet Small', price: 4500, category: 'Electronics' },
    { title: 'Typography & Layout Reference Book', price: 600, category: 'Books & notes' },
    { title: 'Warm LED Fairy Lights 10m', price: 150, category: 'Hostel essentials' },
    { title: 'Ergonomic Footrest for Desk', price: 500, category: 'Furniture' },
    { title: 'Canvas Tote Bag with Bennett Design', price: 350, category: 'Clothing' },
    { title: 'Bluetooth Portable Speaker 5W', price: 1100, category: 'Electronics' }
  ];

  const createdListings = [];
  for (const item of itemCatalog) {
    const l = await harness.createListing({
      userId: ananya.id,
      title: item.title,
      price: item.price,
      category: item.category,
      contactMethod: 'WhatsApp',
      contactValue: '9812345677'
    });
    createdListings.push(l);
  }

  // Verify all 10 listings succeed and active count is 10
  assert.equal(createdListings.length, 10);
  assert.equal(await harness.countActiveListings(ananya.id), 10);

  // 3. Ananya attempts to list an 11th item: "Logitech Silent Wireless Mouse"
  await assert.rejects(
    async () => {
      await harness.createListing({
        userId: ananya.id,
        title: 'Logitech Silent Wireless Mouse',
        price: 400,
        category: 'Electronics',
        contactMethod: 'WhatsApp',
        contactValue: '9812345677'
      });
    },
    /Active listing limit of 10 reached/
  );

  // Active listings count must remain capped at 10
  assert.equal(await harness.countActiveListings(ananya.id), 10);

  // 4. Ananya marks the Bennett Hoodie (item index 1) as 'sold'
  const hoodie = createdListings[1];
  const soldHoodie = await harness.updateListing(hoodie.id, { status: 'sold' }, ananya.id);
  assert.equal(soldHoodie.status, 'sold');

  // Active listings count drops to 9
  assert.equal(await harness.countActiveListings(ananya.id), 9);

  // 5. Ananya re-submits the "Logitech Silent Wireless Mouse" listing -> now succeeds cleanly
  const mouseListing = await harness.createListing({
    userId: ananya.id,
    title: 'Logitech Silent Wireless Mouse',
    price: 400,
    category: 'Electronics',
    contactMethod: 'WhatsApp',
    contactValue: '9812345677'
  });
  assert.ok(mouseListing.id);
  assert.equal(mouseListing.status, 'active');

  // Active count is back at 10
  assert.equal(await harness.countActiveListings(ananya.id), 10);

  // Verify mouse listing is discoverable on public feed
  const searchResults = await harness.getListings({ search: 'Logitech Silent Wireless Mouse' });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].title, 'Logitech Silent Wireless Mouse');
});

/**
 * T4.04: Scenario 4 — The Outside Scammer Intrusion Rejection
 * Persona: An external unauthorized party trying to scrape student contact numbers and sell fake concert tickets.
 * Narrative:
 * - Attacker @gmail.com rejected with HTTP 400
 * - Domain spoofing (subdomain, evil.com) rejected
 * - Direct unauthenticated API queries return redacted contactValue
 * - 0 student phone numbers or contact details leaked
 */
registerTest(4, 'T4.04', 'Scenario 4: Outside Scammer Intrusion Rejection (Strict @bennett.edu.in enforcement, zero contact leaks)', async (harness) => {
  // 1. Attacker attempts to login with external emails
  const outsideEmails = [
    'intruder@gmail.com',
    'scammer@yahoo.com',
    'hacker@outlook.com',
    'spammer@rediffmail.com',
    'bot@hotmail.co.in'
  ];

  for (const email of outsideEmails) {
    assert.equal(harness.isBennettEmail(email), false, `External email ${email} must be rejected`);
    await assert.rejects(
      async () => harness.requestOTP(email),
      /Only @bennett\.edu\.in emails permitted/
    );
    await assert.rejects(
      async () => harness.verifyOTP(email, '123456'),
      /Only @bennett\.edu\.in emails permitted/
    );
  }

  // 2. Attacker attempts domain spoofing and phishing variations
  const phishingEmails = [
    'scammer@bennett.edu.in.phishing.org',
    'attacker@bennett.edu.in@evil.com',
    'admin@fakebennett.edu.in',
    'student@bennett.edu.in.ru',
    'victim@bennett.edu',
    '@bennett.edu.in',
    'attacker@bennett.edu.in\x00evil.com'
  ];

  for (const email of phishingEmails) {
    assert.equal(harness.isBennettEmail(email), false, `Phishing email ${email} must be rejected`);
    await assert.rejects(
      async () => harness.requestOTP(email),
      /Only @bennett\.edu\.in emails permitted/
    );
  }

  // 3. Attacker attempts direct unauthenticated API queries to scrape contact numbers
  const unauthenticatedFeed = await harness.getListings({ viewerId: undefined });
  assert.ok(unauthenticatedFeed.length >= 6, 'Must inspect entire seed feed');

  for (const item of unauthenticatedFeed) {
    assert.equal(
      item.contactValue,
      undefined,
      `Listing ${item.id} (${item.title}) leaked contactValue to unauthenticated visitor!`
    );
    assert.equal(item.hasUnlockedContact, false);
  }

  // 4. Attacker attempts direct ID querying (getListingById) for all seed items
  for (let id = 1; id <= 6; id++) {
    const scrapedItem = await harness.getListingById(String(id), undefined);
    assert.ok(scrapedItem);
    assert.equal(
      scrapedItem.contactValue,
      undefined,
      `Direct getListingById(${id}) leaked contactValue to unauthenticated viewer!`
    );
    assert.equal(scrapedItem.hasUnlockedContact, false);

    const scrapedContact = await harness.getListingContact(String(id), undefined);
    assert.equal(scrapedContact, null, `getListingContact(${id}) leaked contact object!`);
  }

  // 5. Zero contact numbers leaked: Campus privacy barrier holds 100%
  assert.ok(true, 'Zero student contact details leaked to unauthenticated outsider');
});

/**
 * T4.05: Scenario 5 — Prohibited Item Flagging & Moderation Intervention
 * Persona: A reckless student tries to list an unauthorized contraband item (e.g. vape/e-cigarette).
 * Narrative:
 * - Listing submitted under 'Other'
 * - Student reports listing as 'Prohibited item'
 * - Report lands in moderation queue with status 'pending'
 * - Campus moderator reviews and marks 'resolved'
 * - Automatic delisting triggers
 * - Item vanishes from home feed immediately
 */
registerTest(4, 'T4.05', 'Scenario 5: Prohibited Item Flagging & Moderation Intervention (Vape listing -> Student report -> Moderator resolve -> Delist from feed)', async (harness) => {
  // 1. Reckless student lists prohibited contraband item
  const contrabandListing = await harness.createListing({
    userId: 'user_seed_ishita',
    title: 'Mint Flavored Disposable Vape Device 5000 Puffs',
    price: 1200,
    category: 'Other',
    age: 'Brand new',
    reason: 'Extra pod bought off-campus',
    description: 'Sealed nicotine vape device, rechargeable with Type-C cable.',
    contactMethod: 'Phone',
    contactValue: '9612345630'
  });
  assert.ok(contrabandListing.id);
  assert.equal(contrabandListing.status, 'active');

  // Verify contraband item appears in public feed initially
  const initialFeed = await harness.getListings({ search: 'vape' });
  assert.equal(initialFeed.length, 1);
  assert.equal(initialFeed[0].id, contrabandListing.id);

  // 2. Vigilant student browsing feed notices violation and files report
  const reporterId = 'user_seed_mehak';
  const report = await harness.createReport({
    listingId: contrabandListing.id,
    reporterId,
    reason: 'Prohibited item',
    details: 'Nicotine vape listed on campus platform - violates Bennett campus safety code of conduct.'
  });
  assert.ok(report.id);
  assert.equal(report.status, 'pending');
  assert.equal(report.listingId, contrabandListing.id);

  // 3. Report lands in moderation queue with status 'pending'
  const pendingReports = await harness.getReports();
  const foundInQueue = pendingReports.find(r => r.id === report.id);
  assert.ok(foundInQueue, 'Report must be logged in moderation queue');
  assert.equal(foundInQueue.status, 'pending');
  assert.equal(foundInQueue.reason, 'Prohibited item');
  assert.ok(foundInQueue.details.includes('Nicotine vape'));

  // 4. Campus moderator reviews and resolves report
  const resolvedReport = await harness.updateReportStatus(report.id, 'resolved');
  assert.equal(resolvedReport.status, 'resolved');

  // 5. Automatic delisting verified
  const delistedItem = await harness.getListingById(contrabandListing.id);
  assert.ok(delistedItem);
  assert.equal(delistedItem.status, 'delisted', 'Resolving prohibited report must automatically delist item');

  // 6. Contraband item vanishes from home feed and searches immediately
  const searchVapeAfter = await harness.getListings({ search: 'vape' });
  assert.equal(searchVapeAfter.length, 0, 'Delisted contraband item must not appear in search results');

  const otherCategoryAfter = await harness.getListings({ category: 'Other' });
  assert.equal(
    otherCategoryAfter.some(l => l.id === contrabandListing.id),
    false,
    'Delisted contraband item must not appear in category feed'
  );

  // Direct retrieval shows delisted status
  const directCheck = await harness.getListingById(contrabandListing.id);
  assert.equal(directCheck.status, 'delisted');
});
