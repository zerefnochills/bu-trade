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

/* -------------------------------------------------------------------------- */
/*                 TIER 4: NEW CANONICAL & CAMPUS SCENARIOS                   */
/* -------------------------------------------------------------------------- */

/**
 * T4.06: Scenario 6 (TEST_INFRA.md Canonical 1) — Student Reviews Bought Cycle & Receives Upvotes
 * Narrative:
 * 1. Aarav Singhal lists cycle; Kabir Thapar buys it and Aarav marks sold.
 * 2. Kabir navigates to /feedbacks and uploads a review post with an attached WebP image,
 *    linked to the cycle listing with a 5-star rating.
 * 3. Author metadata (Kabir Thapar, B.Des, Year 1) is automatically joined.
 * 4. Peer Ishita upvotes the post -> net score becomes +1.
 * 5. Peer Rohan upvotes the post -> net score becomes +2.
 * 6. Top feed ranking orders the cycle post first with score: 2.
 * 7. Invariant verified: score === upvotesCount - downvotesCount.
 */
registerTest(4, 'T4.06', 'Scenario 6: Student Reviews Bought Cycle & Receives Upvotes (Kabir feedback review, WebP image, peer upvotes, score +2)', async (harness) => {
  // 1. Onboard Aarav, Kabir, Ishita, and Rohan
  const aarav = await harness.createProfile({
    id: 'user_aarav_s6',
    email: 'aarav.s6@bennett.edu.in',
    fullName: 'Aarav Singhal',
    course: 'B.Tech CSE',
    year: 4,
    residence: 'Hostel'
  });

  const kabir = await harness.createProfile({
    id: 'user_kabir_s6',
    email: 'kabir.s6@bennett.edu.in',
    fullName: 'Kabir Thapar',
    course: 'B.Des',
    year: 1,
    residence: 'Hostel'
  });

  const ishita = await harness.createProfile({
    id: 'user_ishita_s6',
    email: 'ishita.s6@bennett.edu.in',
    fullName: 'Ishita Mishra',
    course: 'B.Tech CSE',
    year: 4,
    residence: 'Hostel'
  });

  const rohan = await harness.createProfile({
    id: 'user_rohan_s6',
    email: 'rohan.s6@bennett.edu.in',
    fullName: 'Rohan Verma',
    course: 'BBA',
    year: 2,
    residence: 'Day scholar'
  });

  // 2. Aarav lists cycle and marks as sold after Kabir enquiry
  const cycle = await harness.createListing({
    userId: aarav.id,
    title: 'Hero Sprint 21-Speed Mountain Cycle',
    price: 3600,
    category: 'Cycles & transport',
    contactMethod: 'WhatsApp',
    contactValue: '9876543210'
  });

  await harness.createEnquiry({
    listingId: cycle.id,
    buyerId: kabir.id,
    message: 'Can I test ride at the hostel pavilion?'
  });

  await harness.updateListing(cycle.id, { status: 'sold' }, aarav.id);

  // 3. Kabir uploads feedback post with WebP review photo
  const sampleWebpImage = 'data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAwCdASoQABAAPm0wkUckIiGhISgAoAkJaQAAu58...';
  const post = await harness.createFeedbackPost({
    userId: kabir.id,
    itemTitle: 'Hero Sprint 21-Speed Mountain Cycle',
    content: 'Bought this cycle from Aarav senior at Hostel 4. The 21-speed gears shift smoothly on campus inclines. Sturdy frame and great deal!',
    rating: 5,
    images: [sampleWebpImage],
    listingId: cycle.id
  });

  assert.ok(post.id, 'Feedback post must be assigned an ID');
  assert.equal(post.userId, kabir.id);
  assert.equal(post.rating, 5);
  assert.equal(post.images.length, 1);
  assert.equal(post.score, 0);
  assert.equal(post.upvotesCount, 0);
  assert.equal(post.downvotesCount, 0);
  assert.equal(post.authorName, 'Kabir Thapar');
  assert.equal(post.authorCourse, 'B.Des');
  assert.equal(post.authorYear, 1);

  // 4. Peer Ishita upvotes
  const vote1 = await harness.voteFeedbackPost(post.id, ishita.id, 1);
  assert.equal(vote1.score, 1);
  assert.equal(vote1.userVote, 1);
  assert.equal(vote1.upvotesCount, 1);
  assert.equal(vote1.downvotesCount, 0);

  // 5. Peer Rohan upvotes
  const vote2 = await harness.voteFeedbackPost(post.id, rohan.id, 1);
  assert.equal(vote2.score, 2);
  assert.equal(vote2.userVote, 1);
  assert.equal(vote2.upvotesCount, 2);
  assert.equal(vote2.downvotesCount, 0);

  // 6. Verify top ranking & invariant
  const topFeed = await harness.getFeedbackPosts({ sort: 'top' });
  assert.ok(topFeed.length > 0);
  const foundInFeed = topFeed.find(p => p.id === post.id);
  assert.ok(foundInFeed);
  assert.equal(foundInFeed.score, 2);
  assert.equal(foundInFeed.score, foundInFeed.upvotesCount - foundInFeed.downvotesCount);
});

/**
 * T4.07: Scenario 7 (TEST_INFRA.md Canonical 2) — Exam Prep Student Borrows Scientific Calculator for 3 Days
 * Narrative:
 * 1. Aarav Sharma prepares for engineering maths exams and posts a borrow request for a Casio fx-991CW.
 * 2. Duration specified as 3 days.
 * 3. Peers filter by category Stationery & lab gear and type borrow.
 * 4. Request is isolated from trade filter results.
 * 5. Peer Mehak coordinates calculator handover via WhatsApp.
 * 6. Exam finishes; Aarav marks request as 'fulfilled', removing it from active feeds.
 */
registerTest(4, 'T4.07', 'Scenario 7: Exam Prep Student Borrows Scientific Calculator for 3 Days (Aarav borrow request, duration 3 days, category filtering, fulfilled)', async (harness) => {
  // 1. Onboard Aarav & Mehak
  const aarav = await harness.createProfile({
    id: 'user_aarav_s7',
    email: 'aarav.s7@bennett.edu.in',
    fullName: 'Aarav Sharma',
    course: 'B.Tech CSE',
    year: 3,
    residence: 'Hostel'
  });

  const mehak = await harness.createProfile({
    id: 'user_mehak_s7',
    email: 'mehak.s7@bennett.edu.in',
    fullName: 'Mehak Kaur',
    course: 'B.Tech ECE',
    year: 2,
    residence: 'Hostel'
  });

  // 2. Aarav creates borrow request for 3 days
  const borrowReq = await harness.createTradeBorrowRequest({
    userId: aarav.id,
    title: 'Casio fx-991CW Scientific Calculator',
    description: 'Urgent need for mid-term engineering maths exam on Thursday. Handled with extreme care!',
    requestType: 'borrow',
    duration: '3 days',
    category: 'Stationery & lab gear',
    contactMethod: 'WhatsApp',
    contactValue: '9876543210'
  });

  assert.ok(borrowReq.id);
  assert.equal(borrowReq.requestType, 'borrow');
  assert.equal(borrowReq.duration, '3 days');
  assert.equal(borrowReq.status, 'active');
  assert.equal(borrowReq.requesterName, 'Aarav Sharma');

  // 3. Mehak searches and filters:
  // Must appear in 'borrow' type filter
  const borrowFilter = await harness.getTradeBorrowRequests({ type: 'borrow' });
  assert.ok(borrowFilter.some(r => r.id === borrowReq.id));

  // Must NOT appear in 'trade' type filter
  const tradeFilter = await harness.getTradeBorrowRequests({ type: 'trade' });
  assert.equal(tradeFilter.some(r => r.id === borrowReq.id), false);

  // Must appear in Stationery & lab gear filter
  const catFilter = await harness.getTradeBorrowRequests({ category: 'Stationery & lab gear' });
  const foundItem = catFilter.find(r => r.id === borrowReq.id);
  assert.ok(foundItem);
  assert.equal(foundItem.contactValue, '9876543210');
  assert.equal(foundItem.duration, '3 days');

  // 4. Aarav completes exams and marks fulfilled
  const fulfilled = await harness.updateTradeBorrowRequestStatus(borrowReq.id, 'fulfilled', aarav.id);
  assert.equal(fulfilled.status, 'fulfilled');

  // Active public feed no longer shows fulfilled request
  const activeFeedAfter = await harness.getTradeBorrowRequests({ status: 'active' });
  assert.equal(activeFeedAfter.some(r => r.id === borrowReq.id), false);

  // Requester profile history still shows request as fulfilled
  const profileRequests = await harness.getTradeBorrowRequests({ userId: aarav.id });
  const archived = profileRequests.find(r => r.id === borrowReq.id);
  assert.ok(archived);
  assert.equal(archived.status, 'fulfilled');
});

/**
 * T4.08: Scenario 8 (TEST_INFRA.md Canonical 3) — Novel Enthusiast Swaps Fiction Books with Peer
 * Narrative:
 * 1. Ananya Roy lists a trade request for a fiction book swap: Murakami Norwegian Wood for Kafka on the Shore.
 * 2. Duration specified as 2 weeks, requestType trade, contactMethod WhatsApp.
 * 3. Discoverable under Books & notes category and trade feed.
 * 4. Excluded from borrow feed.
 * 5. Peer Kabir contacts Ananya and completes physical swap.
 * 6. Ananya updates status to 'fulfilled'.
 */
registerTest(4, 'T4.08', 'Scenario 8: Novel Enthusiast Swaps Fiction Books with Peer (Ananya trade swap, duration 2 weeks, WhatsApp contact, fulfilled)', async (harness) => {
  // 1. Onboard Ananya and Kabir
  const ananya = await harness.createProfile({
    id: 'user_ananya_s8',
    email: 'ananya.s8@bennett.edu.in',
    fullName: 'Ananya Roy',
    course: 'B.Des',
    year: 3,
    residence: 'Hostel'
  });

  const kabir = await harness.createProfile({
    id: 'user_kabir_s8',
    email: 'kabir.s8@bennett.edu.in',
    fullName: 'Kabir Thapar',
    course: 'B.Des',
    year: 1,
    residence: 'Hostel'
  });

  // 2. Ananya posts trade request
  const tradeReq = await harness.createTradeBorrowRequest({
    userId: ananya.id,
    title: 'Haruki Murakami Fiction Swap (Norwegian Wood for Kafka on the Shore)',
    description: 'Looking to swap pristine condition Murakami novel for Kafka on the Shore or contemporary fiction.',
    requestType: 'trade',
    duration: '2 weeks',
    category: 'Books & notes',
    contactMethod: 'WhatsApp',
    contactValue: '9812345677'
  });

  assert.ok(tradeReq.id);
  assert.equal(tradeReq.requestType, 'trade');
  assert.equal(tradeReq.duration, '2 weeks');
  assert.equal(tradeReq.category, 'Books & notes');
  assert.equal(tradeReq.requesterName, 'Ananya Roy');

  // 3. Kabir discovers trade request under 'Books & notes' and 'trade' feed
  const booksTrade = await harness.getTradeBorrowRequests({ type: 'trade', category: 'Books & notes' });
  const found = booksTrade.find(r => r.id === tradeReq.id);
  assert.ok(found);
  assert.equal(found.contactMethod, 'WhatsApp');
  assert.equal(found.contactValue, '9812345677');

  // Verify segregation: borrow query has 0 matches for this request
  const borrowFeed = await harness.getTradeBorrowRequests({ type: 'borrow' });
  assert.equal(borrowFeed.some(r => r.id === tradeReq.id), false);

  // 4. Physical swap completed -> Ananya marks fulfilled
  const updated = await harness.updateTradeBorrowRequestStatus(tradeReq.id, 'fulfilled', ananya.id);
  assert.equal(updated.status, 'fulfilled');

  // Active trade feed no longer contains request
  const activeTrade = await harness.getTradeBorrowRequests({ type: 'trade', status: 'active' });
  assert.equal(activeTrade.some(r => r.id === tradeReq.id), false);
});

/**
 * T4.09: Scenario 9 (TEST_INFRA.md Canonical 4) — Double-Vote & Downvote Toggle Integrity
 * Narrative:
 * Comprehensive integrity testing of the Reddit-style voting state machine:
 * 1. Mehak upvotes (+1) -> score 1.
 * 2. Mehak upvotes again -> toggle off (score 0, userVote 0).
 * 3. Mehak downvotes (-1) -> score -1.
 * 4. Mehak downvotes again -> toggle off (score 0, userVote 0).
 * 5. Mehak upvotes (+1) -> score 1; then flips directly to downvote (-1) -> score -1 (delta -2).
 * 6. Mehak flips back to upvote (+1) -> score 1 (delta +2).
 * 7. Peer Kabir downvotes (-1) concurrently -> score 0 (1 upvote, 1 downvote).
 * 8. Unauthenticated vote attempt rejected without mutating score.
 * 9. Mathematical invariant strictly verified: score === upvotesCount - downvotesCount.
 */
registerTest(4, 'T4.09', 'Scenario 4: Double-Vote & Downvote Toggle Integrity (Reddit voting engine, toggle off, flip +2/-2, unauthenticated protection, invariant check)', async (harness) => {
  const aarav = await harness.createProfile({
    id: 'user_aarav_s9',
    email: 'aarav.s9@bennett.edu.in',
    fullName: 'Aarav Sharma',
    course: 'B.Tech CSE',
    year: 3
  });

  const mehak = await harness.createProfile({
    id: 'user_mehak_s9',
    email: 'mehak.s9@bennett.edu.in',
    fullName: 'Mehak Kaur',
    course: 'B.Tech ECE',
    year: 2
  });

  const kabir = await harness.createProfile({
    id: 'user_kabir_s9',
    email: 'kabir.s9@bennett.edu.in',
    fullName: 'Kabir Thapar',
    course: 'B.Des',
    year: 1
  });

  const post = await harness.createFeedbackPost({
    userId: aarav.id,
    itemTitle: 'Study Lamp with Flexible Neck',
    content: 'Warm light, works great for late night exam prep without waking up hostel roommates.',
    rating: 4
  });

  assert.equal(post.score, 0);
  assert.equal(post.upvotesCount, 0);
  assert.equal(post.downvotesCount, 0);

  // Step 1: Upvote (+1)
  const v1 = await harness.voteFeedbackPost(post.id, mehak.id, 1);
  assert.equal(v1.score, 1);
  assert.equal(v1.userVote, 1);
  assert.equal(v1.upvotesCount, 1);
  assert.equal(v1.downvotesCount, 0);

  // Step 2: Click upvote again -> Toggle off
  const v2 = await harness.voteFeedbackPost(post.id, mehak.id, 1);
  assert.equal(v2.score, 0);
  assert.equal(v2.userVote, 0);
  assert.equal(v2.upvotesCount, 0);
  assert.equal(v2.downvotesCount, 0);

  // Step 3: Downvote (-1)
  const v3 = await harness.voteFeedbackPost(post.id, mehak.id, -1);
  assert.equal(v3.score, -1);
  assert.equal(v3.userVote, -1);
  assert.equal(v3.upvotesCount, 0);
  assert.equal(v3.downvotesCount, 1);

  // Step 4: Click downvote again -> Toggle off
  const v4 = await harness.voteFeedbackPost(post.id, mehak.id, -1);
  assert.equal(v4.score, 0);
  assert.equal(v4.userVote, 0);
  assert.equal(v4.upvotesCount, 0);
  assert.equal(v4.downvotesCount, 0);

  // Step 5: Upvote (+1) then Flip to Downvote (-1) -> delta -2
  await harness.voteFeedbackPost(post.id, mehak.id, 1);
  const v5 = await harness.voteFeedbackPost(post.id, mehak.id, -1);
  assert.equal(v5.score, -1);
  assert.equal(v5.userVote, -1);
  assert.equal(v5.upvotesCount, 0);
  assert.equal(v5.downvotesCount, 1);

  // Step 6: Flip back from Downvote (-1) to Upvote (+1) -> delta +2
  const v6 = await harness.voteFeedbackPost(post.id, mehak.id, 1);
  assert.equal(v6.score, 1);
  assert.equal(v6.userVote, 1);
  assert.equal(v6.upvotesCount, 1);
  assert.equal(v6.downvotesCount, 0);

  // Step 7: Concurrent vote from Kabir (downvote -1)
  const v7 = await harness.voteFeedbackPost(post.id, kabir.id, -1);
  assert.equal(v7.score, 0); // 1 upvote - 1 downvote = 0
  assert.equal(v7.upvotesCount, 1);
  assert.equal(v7.downvotesCount, 1);

  // Step 8: View state per user
  const postMehak = await harness.getFeedbackPostById(post.id, mehak.id);
  assert.equal(postMehak.userVote, 1);

  const postKabir = await harness.getFeedbackPostById(post.id, kabir.id);
  assert.equal(postKabir.userVote, -1);

  const postAarav = await harness.getFeedbackPostById(post.id, aarav.id);
  assert.equal(postAarav.userVote, 0);

  // Step 9: Unauthenticated vote rejection
  await assert.rejects(
    async () => harness.voteFeedbackPost(post.id, undefined, 1),
    /Authentication required/
  );

  // Invariant verification: score === upvotesCount - downvotesCount
  const finalPost = await harness.getFeedbackPostById(post.id);
  assert.equal(finalPost.score, finalPost.upvotesCount - finalPost.downvotesCount);
});

/**
 * T4.10: Scenario 10 (Strengthening 1) — Connected Marketplace Lifecycle: Listing Purchase -> Photo Review -> Accessory Borrow
 * Narrative:
 * Cross-cutting lifecycle integrating R2, R3, and R4 in an authentic campus storyline:
 * 1. Ishita lists a badminton racket set under 'Other'.
 * 2. Rohan purchases the racket and Ishita marks sold.
 * 3. Rohan creates a feedback review with a WebP photo and 5 stars.
 * 4. Peers upvote the feedback review.
 * 5. Rohan now needs extra shuttlecocks and posts a 2-day borrow request under 'Other'.
 * 6. Ishita sees Rohan's borrow request and fulfills it.
 */
registerTest(4, 'T4.10', 'Scenario 10: Connected Marketplace Lifecycle (Listing Purchase -> Photo Feedback -> Accessory Borrow -> Fulfill)', async (harness) => {
  const ishita = await harness.createProfile({
    id: 'user_ishita_s10',
    email: 'ishita.s10@bennett.edu.in',
    fullName: 'Ishita Mishra',
    course: 'B.Tech CSE',
    year: 4
  });

  const rohan = await harness.createProfile({
    id: 'user_rohan_s10',
    email: 'rohan.s10@bennett.edu.in',
    fullName: 'Rohan Verma',
    course: 'BBA',
    year: 2
  });

  // 1. Ishita lists Yonex racket
  const racket = await harness.createListing({
    userId: ishita.id,
    title: 'Yonex Nanoray Badminton Racket',
    price: 950,
    category: 'Other',
    contactMethod: 'WhatsApp',
    contactValue: '9612345630'
  });

  // 2. Rohan enquires and purchases; marked sold
  await harness.createEnquiry({ listingId: racket.id, buyerId: rohan.id, message: 'Can meet at sports complex?' });
  await harness.updateListing(racket.id, { status: 'sold' }, ishita.id);

  // 3. Rohan writes feedback review with photo
  const feedback = await harness.createFeedbackPost({
    userId: rohan.id,
    itemTitle: 'Yonex Nanoray Badminton Racket',
    content: 'Excellent condition racket, great string tension! Played a tournament match at campus sports complex.',
    rating: 5,
    images: ['data:image/webp;base64,racket_review_test'],
    listingId: racket.id
  });
  assert.equal(feedback.rating, 5);

  // 4. Peer upvotes
  await harness.voteFeedbackPost(feedback.id, ishita.id, 1);
  const feedAfterVote = await harness.getFeedbackPostById(feedback.id);
  assert.equal(feedAfterVote.score, 1);

  // 5. Rohan posts borrow request for shuttlecocks
  const borrow = await harness.createTradeBorrowRequest({
    userId: rohan.id,
    title: 'Feather Shuttlecocks Tube (Need 3-4 shuttles)',
    description: 'Practicing for inter-hostel tournament this weekend. Will return unused shuttles or replace.',
    requestType: 'borrow',
    duration: '2 days',
    category: 'Other',
    contactMethod: 'WhatsApp',
    contactValue: '9912345608'
  });
  assert.ok(borrow.id);

  // 6. Ishita fulfills Rohan borrow request
  const fulfilledBorrow = await harness.updateTradeBorrowRequestStatus(borrow.id, 'fulfilled', rohan.id);
  assert.equal(fulfilledBorrow.status, 'fulfilled');
});

/**
 * T4.11: Scenario 11 (Strengthening 2) — Unauthenticated Visitor & External Email Intrusion Protection on Feedbacks and Trade/Borrow
 * Narrative:
 * Validates campus perimeter security across the new R3 and R4 surfaces:
 * 1. Outside hacker attempts to create feedback post with unauthenticated session -> rejected.
 * 2. Outside hacker attempts to vote on feedback post without session -> rejected.
 * 3. Outside hacker attempts to create trade/borrow request without session -> rejected.
 * 4. Outside hacker attempts to mutate another student's trade/borrow request -> rejected.
 * 5. Authenticated student attempting non-owner status mutation on peer's trade/borrow request -> rejected.
 * 6. Public read-only access for guests browsing /feedbacks and /trade-borrow works cleanly with userVote: 0.
 */
registerTest(4, 'T4.11', 'Scenario 11: Unauthenticated Visitor & External Intrusion Protection on Feedbacks & Trade/Borrow', async (harness) => {
  const legitStudent = await harness.createProfile({
    id: 'user_legit_s11',
    email: 'legit.student@bennett.edu.in',
    fullName: 'Legit Student',
    course: 'B.Tech CSE',
    year: 2
  });

  const hackerStudent = await harness.createProfile({
    id: 'user_hacker_s11',
    email: 'hacker.student@bennett.edu.in',
    fullName: 'Hacker Student',
    course: 'B.Tech CSE',
    year: 1
  });

  const post = await harness.createFeedbackPost({
    userId: legitStudent.id,
    itemTitle: 'Campus Study Chair',
    content: 'Comfortable mesh chair bought for hostel room study desk.',
    rating: 4
  });

  const borrow = await harness.createTradeBorrowRequest({
    userId: legitStudent.id,
    title: 'Engineering Mechanics Textbook',
    description: 'Need for 1 week study.',
    requestType: 'borrow',
    duration: '1 week',
    category: 'Books & notes',
    contactMethod: 'WhatsApp',
    contactValue: '9876543210'
  });

  // 1. Unauthenticated feedback post creation rejected
  await assert.rejects(
    async () => harness.createFeedbackPost({ userId: undefined, itemTitle: 'Spam', content: 'Spam' }),
    /userId is required/
  );

  // 2. Unauthenticated voting rejected
  await assert.rejects(
    async () => harness.voteFeedbackPost(post.id, undefined, 1),
    /Authentication required/
  );

  // 3. Unauthenticated trade/borrow creation rejected
  await assert.rejects(
    async () => harness.createTradeBorrowRequest({ userId: undefined, title: 'Spam', duration: '1 day', requestType: 'borrow' }),
    /userId is required/
  );

  // 4. Non-owner attempting to mutate request status rejected
  await assert.rejects(
    async () => harness.updateTradeBorrowRequestStatus(borrow.id, 'fulfilled', hackerStudent.id),
    /Unauthorized: Only requester can update request status/
  );

  // 5. Non-owner attempting to delete request rejected
  await assert.rejects(
    async () => harness.deleteTradeBorrowRequest(borrow.id, hackerStudent.id),
    /Unauthorized: Only requester can delete request/
  );

  // 6. Public guest browsing shows read-only feed with userVote: 0
  const guestPosts = await harness.getFeedbackPosts({ viewerId: undefined });
  assert.ok(guestPosts.length > 0);
  assert.equal(guestPosts[0].userVote, 0);

  const guestBorrow = await harness.getTradeBorrowRequests({});
  assert.ok(guestBorrow.length > 0);
  assert.equal(guestBorrow[0].status, 'active');
});
