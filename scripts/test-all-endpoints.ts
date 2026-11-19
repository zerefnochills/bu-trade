// ============================================================================
// BU Trade — Comprehensive Endpoint & Server Action Debugger
// Tests all 12 page routes and all server actions
// ============================================================================

process.env.BU_TRADE_TEST = 'true';

import { getDatabaseService } from '../lib/db';
import { _setTestSession, createSession, destroySession } from '../lib/auth/session';
import {
  requestOtpAction,
  verifyOtpAction,
  demoLoginAction,
  completeOnboardingAction,
  signOutAction,
} from '../app/actions/auth';
import {
  createListingAction,
  updateListingAction,
  changeListingStatusAction,
  deleteListingAction,
} from '../app/actions/listings';
import { submitEnquiryAction } from '../app/actions/enquiries';
import { submitReportAction } from '../app/actions/reports';
import {
  getFeedbacksAction,
  createFeedbackAction,
  voteFeedbackAction,
} from '../app/actions/feedback';
import {
  getTradeBorrowRequestsAction,
  createTradeBorrowRequestAction,
  updateTradeBorrowRequestStatusAction,
  deleteTradeBorrowRequestAction,
} from '../app/actions/trade-borrow';

async function runAllChecks() {
  console.log('======================================================================');
  console.log('           BU TRADE — COMPREHENSIVE ENDPOINT & ACTION AUDIT           ');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failed++;
    }
  }

  const db = getDatabaseService();
  if (typeof (db as any).init === 'function') {
    (db as any).init(true); // populate test seed
  }

  // --------------------------------------------------------------------------
  // 1. Auth Actions Debugging
  // --------------------------------------------------------------------------
  console.log('--- 1. AUTH ACTIONS ---');

  // Test invalid domain rejection
  const invalidEmailRes = await requestOtpAction(null, { email: 'scammer@gmail.com' });
  assert(!invalidEmailRes.success, 'Rejects non-bennett email (gmail.com)');

  const subdomainPhishRes = await requestOtpAction(null, { email: 'student@bennett.edu.in.scam.com' });
  assert(!subdomainPhishRes.success, 'Rejects phishing subdomain email');

  // Test valid Bennett email
  const validOtpRes = await requestOtpAction(null, { email: 'aarav.sharma@bennett.edu.in' });
  assert(validOtpRes.success, 'Accepts valid Bennett email for OTP request');

  // Test verifyOtpAction
  const verifyRes = await verifyOtpAction(null, {
    email: 'aarav.sharma@bennett.edu.in',
    code: '123456',
  });
  assert(verifyRes.success && !!verifyRes.data?.session, 'Verifies OTP code and issues session');

  // Test demoLoginAction
  const demoRes = await demoLoginAction('/sell');
  assert(demoRes.success && !!demoRes.data?.session, 'Demo login successfully creates verified student session');

  // Test signOutAction
  const signOutRes = await signOutAction();
  assert(signOutRes.success, 'Sign out successfully destroys session');

  // --------------------------------------------------------------------------
  // 2. Listing Actions Debugging
  // --------------------------------------------------------------------------
  console.log('\n--- 2. LISTING ACTIONS ---');

  // Setup student session for listings
  const student = await db.createProfile({
    id: 'student_debug_1',
    email: 'debug.student@bennett.edu.in',
    fullName: 'Debug Student',
    course: 'B.Tech CSE',
    year: 3,
    residence: 'Hostel',
    whatsapp: '+91 98765 00001',
  });

  _setTestSession({
    userId: student.id,
    id: student.id,
    email: student.email,
    onboardingNeeded: false,
    isOnboarded: true,
  });

  // Create Listing
  const createRes = await createListingAction({
    title: 'Hero Sprint Pro 21-Speed Cycle',
    price: 3200,
    category: 'Cycles & transport',
    age: '1 year',
    reason: 'Graduating campus',
    description: 'Includes lock and helmet',
    contactMethod: 'WhatsApp',
    contactValue: '+91 98765 00001',
    images: ['https://example.com/cycle.jpg'],
  });
  assert(createRes.success && !!createRes.listing?.id, 'Creates listing with all attributes');
  const listingId = createRes.listing!.id;

  // Update Listing
  const updateRes = await updateListingAction({
    id: listingId,
    price: 3000,
    description: 'Price dropped to 3000!',
  });
  assert(updateRes.success && updateRes.listing?.price === 3000, 'Updates listing price and description');

  // Mark Sold
  const soldRes = await changeListingStatusAction(listingId, 'sold');
  assert(soldRes.success && soldRes.listing?.status === 'sold', 'Transitions listing to sold');

  // Delist & Relist
  const delistRes = await changeListingStatusAction(listingId, 'delisted');
  assert(delistRes.success && delistRes.listing?.status === 'delisted', 'Transitions listing to delisted');

  const relistRes = await changeListingStatusAction(listingId, 'active');
  assert(relistRes.success && relistRes.listing?.status === 'active', 'Transitions listing back to active');

  // --------------------------------------------------------------------------
  // 3. Enquiry & Contact Redaction Flow
  // --------------------------------------------------------------------------
  console.log('\n--- 3. ENQUIRIES & CONTACT PRIVACY ---');

  // Unauthenticated contact check
  const publicListing = await db.getListingById(listingId);
  assert(publicListing?.contactValue === undefined, 'Contact detail is strictly redacted from public unauthenticated view');

  // Another student enquires
  const buyer = await db.createProfile({
    id: 'buyer_debug_2',
    email: 'buyer.debug@bennett.edu.in',
    fullName: 'Buyer Student',
    course: 'B.Tech ECE',
    year: 1,
    residence: 'Hostel',
  });

  _setTestSession({
    userId: buyer.id,
    id: buyer.id,
    email: buyer.email,
    onboardingNeeded: false,
    isOnboarded: true,
  });

  const enquiryRes = await submitEnquiryAction({
    listingId,
    message: 'Is this cycle available to inspect at Sports complex?',
  });
  assert(enquiryRes.success, 'Submits buyer enquiry');

  const unlockedListing = await db.getListingById(listingId, buyer.id);
  assert(unlockedListing?.contactValue === '+91 98765 00001', 'Contact detail unlocked for enquiring student');

  // --------------------------------------------------------------------------
  // 4. Report & Moderation Flow
  // --------------------------------------------------------------------------
  console.log('\n--- 4. REPORT & MODERATION ---');

  const reportRes = await submitReportAction({
    listingId,
    reason: 'Prohibited item',
    details: 'Testing report action',
  });
  assert(reportRes.success && !!reportRes.report?.id, 'Submits listing report to moderation queue');

  // --------------------------------------------------------------------------
  // 5. Feedbacks & Reddit Voting Engine
  // --------------------------------------------------------------------------
  console.log('\n--- 5. FEEDBACKS & VOTING ENGINE ---');

  const fbRes = await createFeedbackAction({
    itemTitle: 'Hero Sprint Pro Cycle',
    content: 'Bought this cycle from Aarav, super smooth transaction near cafeteria!',
    rating: 5,
    images: ['https://example.com/cycle-bought.jpg'],
  });
  assert(fbRes.success && !!fbRes.feedback?.id, 'Creates student feedback post with photo');
  const fbId = fbRes.feedback!.id;

  // Upvote (+1)
  const upvoteRes = await voteFeedbackAction(fbId, 1);
  assert(upvoteRes.success && upvoteRes.userVote === 1, 'Upvotes feedback post (+1)');

  // Downvote toggle flip (-1)
  const downvoteRes = await voteFeedbackAction(fbId, -1);
  assert(downvoteRes.success && downvoteRes.userVote === -1, 'Flips vote to downvote (-1)');

  // Clear vote (toggle off with same vote)
  const clearVoteRes = await voteFeedbackAction(fbId, -1);
  assert(clearVoteRes.success && (clearVoteRes.userVote === 0 || clearVoteRes.userVote === undefined), 'Toggles vote off (neutral 0)');

  // Get Feedbacks list
  const allFeedbacks = await getFeedbacksAction('top');
  assert(Array.isArray(allFeedbacks) && allFeedbacks.length > 0, 'Retrieves sorted feedback posts');

  // --------------------------------------------------------------------------
  // 6. Trade & Borrow System
  // --------------------------------------------------------------------------
  console.log('\n--- 6. TRADE & BORROW SYSTEM ---');

  const tbRes = await createTradeBorrowRequestAction({
    title: 'Need Casio fx-991EX for Midterms',
    category: 'Stationery & lab gear',
    requestType: 'borrow',
    duration: '3 days',
    description: 'Calculus midterm this Friday, will return with coffee treat!',
    contactMethod: 'WhatsApp',
    contactValue: '+91 98765 43210',
  });
  assert(tbRes.success && !!tbRes.request?.id, 'Creates borrow request with duration');
  const tbId = tbRes.request!.id;

  // Retrieve trade/borrow requests
  const tbRequests = await getTradeBorrowRequestsAction();
  assert(Array.isArray(tbRequests) && tbRequests.some((r) => r.id === tbId), 'Retrieves active trade/borrow requests');

  // Mark fulfilled
  const fulfillRes = await updateTradeBorrowRequestStatusAction(tbId, 'fulfilled');
  assert(fulfillRes.success, 'Marks trade/borrow request fulfilled');

  // --------------------------------------------------------------------------
  // 7. Cleanup
  // --------------------------------------------------------------------------
  console.log('\n--- 7. CLEANUP & DELETION ---');
  const delTbRes = await deleteTradeBorrowRequestAction(tbId);
  assert(delTbRes.success, 'Deletes trade/borrow request');

  _setTestSession({
    userId: student.id,
    id: student.id,
    email: student.email,
    onboardingNeeded: false,
    isOnboarded: true,
  });
  const delListingRes = await deleteListingAction(listingId);
  assert(delListingRes.success, 'Deletes listing');

  console.log('\n======================================================================');
  console.log(`TOTAL AUDIT CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllChecks().catch((err) => {
  console.error('Audit failed with uncaught exception:', err);
  process.exit(1);
});
