# BU Trade — E2E Testing Infrastructure & Test Specification

## 1. Overview & Architecture of E2E Test Suite

BU Trade is a verified campus-only marketplace for Bennett University students. To ensure absolute platform integrity, privacy protection, and adherence to campus safety constraints, the End-to-End (E2E) testing infrastructure is designed as an **opaque-box, zero-cloud test framework**.

### Architectural Principles
1. **Opaque-Box Testing**: Tests interact strictly through public interfaces—service interfaces (`IDatabaseService`), auth validation rules (`isBennettEmail`), server actions, and API endpoints. No private internal states or direct database bypasses are permitted.
2. **Zero External Cloud Dependencies**: Tests run 100% offline using `MockDatabaseService` and local in-memory session handlers. No live Supabase credentials, cloud instances, or external SMTP servers are required.
3. **Deterministic State Isolation**: Every test tier or test suite starts with a fresh or cleanly pre-seeded in-memory store. Tests do not produce state pollution or inter-test coupling.
4. **Fast Canonical Execution**: The entire test suite executes in seconds via a single canonical command: `npm run test:e2e` (or `npm test` for unit/integration suites).
5. **Strict Security & Privacy Verification**: Tests explicitly verify that seller contact info (phone/WhatsApp/email) is **never leaked** to unauthenticated or non-enquiring users, and active listing caps (max 10 items) are rigidly enforced.

---

## 2. Zero-Cloud Test Environment & Mock Harness

### 2.1 Harness Architecture
The testing harness operates in mock mode by setting `NEXT_PUBLIC_USE_MOCK_DB=true` and initializing `MockDatabaseService`.

```
+-------------------------------------------------------------+
|                     E2E Test Runner                         |
|                 (scripts/run-e2e.ts / Jest)                 |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    Public Service Layer                     |
|  - Auth Validation: isBennettEmail()                        |
|  - Server Actions: createListing, sendEnquiry, submitReport |
|  - Service Interface: IDatabaseService                      |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    MockDatabaseService                      |
|  - In-memory Profile, Listing, Enquiry, Report stores       |
|  - Trigger-like constraints (10-item cap, domain check)     |
|  - Contact redaction logic based on viewer ID & enquiries   |
|  - Pre-seeded Bennett University test listings              |
+-------------------------------------------------------------+
```

### 2.2 Canonical Runner Script (`scripts/run-e2e.ts`)
The canonical test runner script provides structured execution and reporting across all 4 tiers:

```typescript
// scripts/run-e2e.ts
import { getDatabaseService } from '../lib/db';
import { isBennettEmail } from '../lib/auth/validation';
import { MockDatabaseService } from '../lib/db/mock';

export interface TestCaseResult {
  tier: string;
  id: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

export class E2ERunner {
  private results: TestCaseResult[] = [];
  private db: MockDatabaseService;

  constructor() {
    process.env.NEXT_PUBLIC_USE_MOCK_DB = 'true';
    this.db = new MockDatabaseService();
  }

  async runTest(tier: string, id: string, name: string, fn: (db: MockDatabaseService) => Promise<void>) {
    const start = performance.now();
    try {
      await fn(this.db);
      this.results.push({ tier, id, name, passed: true, durationMs: performance.now() - start });
      console.log(`  âœ“ [${id}] ${name}`);
    } catch (err: any) {
      this.results.push({ tier, id, name, passed: false, durationMs: performance.now() - start, error: err.message });
      console.error(`  âœ— [${id}] ${name} -> ${err.message}`);
    }
  }

  summary(): boolean {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    console.log(`\n========================================`);
    console.log(`E2E TEST SUMMARY: ${passed}/${total} passed (${failed} failed)`);
    console.log(`========================================\n`);
    return failed === 0;
  }
}
```

### 2.3 Package Configuration (`package.json`)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "tsx scripts/run-e2e.ts"
  }
}
```

---

## 3. Test Directory & File Layout

```
BU Trade/
â”œâ”€â”€ __tests__/
â”‚   â”œâ”€â”€ auth.test.ts             # Tier 1 & 2 Auth & Domain validation
â”‚   â”œâ”€â”€ listings.test.ts         # Tier 1 & 2 Listings, limits & lifecycle
â”‚   â”œâ”€â”€ privacy.test.ts          # Tier 1 & 2 Contact redaction & enquiry unlocking
â”‚   â”œâ”€â”€ moderation.test.ts       # Tier 1 & 2 Reports & safety rules
â”‚   â””â”€â”€ components.test.tsx      # Component rendering & UI interaction tests
â”œâ”€â”€ scripts/
â”‚   â”œâ”€â”€ run-e2e.ts               # Standalone opaque-box E2E runner (Tiers 1-4)
â”‚   â””â”€â”€ seed.ts                  # Mock data seeder
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”œâ”€â”€ validation.ts        # isBennettEmail validation logic
â”‚   â”‚   â””â”€â”€ session.ts           # Session cookies and mock token handler
â”‚   â”œâ”€â”€ db/
â”‚   â”‚   â”œâ”€â”€ types.ts             # IDatabaseService interface contracts
â”‚   â”‚   â”œâ”€â”€ index.ts             # Service factory (isMockMode switcher)
â”‚   â”‚   â”œâ”€â”€ mock.ts              # In-memory MockDatabaseService implementation
â”‚   â”‚   â””â”€â”€ supabase.ts          # Supabase client wrapper
â”‚   â””â”€â”€ image/
â”‚       â””â”€â”€ compression.ts       # browser-image-compression wrapper
â””â”€â”€ TEST_INFRA.md               # This authoritative test infrastructure doc
```

---

## 4. Feature Inventory & Mapping to Requirements

| Feature ID | Category | Requirement | Feature Name | Test Equivalence Class |
|------------|----------|-------------|--------------|------------------------|
| F01 | Auth | R2 | Bennett Email Validation | EC01: Email Domain Enforcement |
| F02 | Auth | R2 | OTP Request & Verification | EC02: OTP Auth & Session Lifecycle |
| F03 | Onboarding | R2 | First-Time Profile Gateway | EC03: Profile Onboarding & Validation |
| F04 | Seller | R3 | Listing Creation & Validation | EC04: Listing Creation & Constraints |
| F05 | Seller | R3 | Active Listing Cap (10 Limit) | EC05: 10 Active Listing Limit |
| F06 | Seller | R3 | Seller Lifecycle (Edit/Sold/Delist) | EC06: Listing Lifecycle Management |
| F07 | Buyer | R4 | Home Feed Search, Filter & Sort | EC07: Feed Discovery, Query & Sort |
| F08 | Buyer | R4 | Product Detail & Gallery View | EC08: Listing Details & Presentation |
| F09 | Privacy | R4, R5 | Protected Contact Privacy | EC09: Contact Redaction & Access Control |
| F10 | Privacy | R4 | Enquiry Flow & Contact Unlocking | EC10: Protected Enquiry & Contact Reveal |
| F11 | Safety | R5 | Safety Rules & Guidelines | EC11: Campus Safety Page & Navigation |
| F12 | Moderation | R5 | Listing Report Submission | EC12: Moderation Queue & Report Ingestion |
| F13 | Feedback | R5 | Platform Feedback Collection | EC13: Student Feedback & Ratings |
| F14 | Image | R1 | Client-Side WebP Compression | EC14: Image Compression & Asset Guardrails |
| F15 | Data | R5 | Dual-Mode DB Abstraction | EC15: IDatabaseService & Mock Persistence |

---

## 5. 4-Tier Test Case Catalog

### 5.1 Tier 1: Feature Coverage Catalog
*(Quantitative rule: >=5 test cases per feature equivalence class. Total >= 75 test cases)*

#### EC01: Email Domain Enforcement (F01)
- **T1.01.1**: Standard student email format `username@bennett.edu.in` returns `true`.
- **T1.01.2**: Numbered student roll email `ab1234@bennett.edu.in` returns `true`.
- **T1.01.3**: Dot-separated staff/student email `first.last@bennett.edu.in` returns `true`.
- **T1.01.4**: Capitalized email `Student@BENNETT.EDU.IN` is recognized as valid.
- **T1.01.5**: Tagged email `student+trade@bennett.edu.in` returns `true`.

#### EC02: OTP Auth & Session Lifecycle (F02)
- **T1.02.1**: OTP generation generates and accepts valid 6-digit code for registered Bennett email.
- **T1.02.2**: Successful OTP verification returns session object with user identifier and email.
- **T1.02.3**: Session marks `onboardingNeeded: true` when profile does not exist.
- **T1.02.4**: Session marks `onboardingNeeded: false` when profile already completed.
- **T1.02.5**: Sign out invalidates active session and clears auth cookies.

#### EC03: Profile Onboarding & Validation (F03)
- **T1.03.1**: Create profile with complete valid data (name, course, year, residence, WhatsApp).
- **T1.03.2**: Create profile with Day scholar residence and no optional WhatsApp.
- **T1.03.3**: Retrieve profile by user ID returns exact persisted attributes.
- **T1.03.4**: Update profile allows modifying course, year, residence, and WhatsApp.
- **T1.03.5**: Profile creation records `createdAt` and `updatedAt` timestamps.

#### EC04: Listing Creation & Constraints (F04)
- **T1.04.1**: Create listing with valid Books & notes data, price â‚¹500, WhatsApp contact.
- **T1.04.2**: Create listing with Electronics data, price â‚¹25000, Phone contact, 3 images.
- **T1.04.3**: Create listing with Cycles & transport category, age "1 year", reason "Graduating".
- **T1.04.4**: Create listing with Hostel essentials category, price â‚¹450, Email contact method.
- **T1.04.5**: Create listing with zero price (free campus giveaway â‚¹0) successfully persists.

#### EC05: 10 Active Listing Limit (F05)
- **T1.05.1**: User with 0 active listings creates 1 listing; active count becomes 1.
- **T1.05.2**: User with 5 active listings creates 4 more; active count becomes 9.
- **T1.05.3**: User creates 10th active listing; succeeds and active count equals 10.
- **T1.05.4**: `countActiveListings(userId)` accurately returns 10 for that user.
- **T1.05.5**: Different user has independent active listing counter unaffected by other users.

#### EC06: Listing Lifecycle Management (F06)
- **T1.06.1**: Owner edits listing title, price, and description; changes reflect in database.
- **T1.06.2**: Owner marks active listing as 'sold'; status transitions to 'sold'.
- **T1.06.3**: Owner delists active listing; status transitions to 'delisted'.
- **T1.06.4**: Owner relists a delisted listing; status transitions back to 'active'.
- **T1.06.5**: Owner deletes listing; listing is permanently removed from active queries.

#### EC07: Feed Discovery, Query & Sort (F07)
- **T1.07.1**: `getListings()` without filters returns all active seed listings.
- **T1.07.2**: Category filter `category: 'Cycles & transport'` returns only cycle listings.
- **T1.07.3**: Live search `search: 'Casio'` returns matching calculator listing.
- **T1.07.4**: Sort `sort: 'price_asc'` returns listings ordered from lowest to highest price.
- **T1.07.5**: Sort `sort: 'price_desc'` returns listings ordered from highest to lowest price.

#### EC08: Listing Details & Presentation (F08)
- **T1.08.1**: `getListingById` returns title, price, category, age, reason, description.
- **T1.08.2**: Join metadata includes seller full name, course, and academic year.
- **T1.08.3**: Image array is returned in proper display order.
- **T1.08.4**: Inactive or sold listings show appropriate status tag.
- **T1.08.5**: Non-existent listing ID returns `null`.

#### EC09: Contact Redaction & Access Control (F09)
- **T1.09.1**: Unauthenticated request (`viewerId: undefined`) redacts `contactValue`.
- **T1.09.2**: Authenticated non-enquiring student request redacts `contactValue`.
- **T1.09.3**: Unauthenticated user `hasUnlockedContact` evaluates to `false`.
- **T1.09.4**: Authenticated non-enquiring student `hasUnlockedContact` evaluates to `false`.
- **T1.09.5**: Listing owner viewing own listing always sees unredacted `contactValue`.

#### EC10: Protected Enquiry & Contact Reveal (F10)
- **T1.10.1**: Authenticated student submits enquiry with message "Is this still available?".
- **T1.10.2**: Enquiry persists in `enquiries` table with listing ID and buyer ID.
- **T1.10.3**: `hasEnquired(listingId, buyerId)` returns `true` after submission.
- **T1.10.4**: Submitting enquiry unlocks seller contact value for the enquiring student.
- **T1.10.5**: Subsequent calls to `getListingById(listingId, buyerId)` return `hasUnlockedContact: true` and unredacted `contactValue`.

#### EC11: Campus Safety Page & Navigation (F11)
- **T1.11.1**: Campus safety rules page content specifies Bennett physical safe zones (Library, Food Court).
- **T1.11.2**: Safety guidelines emphasize in-person inspection before payment.
- **T1.11.3**: Safety rules state BU Trade does not handle payments or delivery.
- **T1.11.4**: Rules enumerate prohibited items (contraband, fake items).
- **T1.11.5**: Rules notify students of moderation queue and 10-item cap.

#### EC12: Moderation Queue & Report Ingestion (F12)
- **T1.12.1**: Student submits report with reason "Prohibited item" and optional details.
- **T1.12.2**: Report persists with status 'pending' in `reports` table.
- **T1.12.3**: Student submits report with reason "Misleading description".
- **T1.12.4**: Student submits report with reason "Suspected scam / outsider".
- **T1.12.5**: Moderation service retrieves pending reports for moderator review.

#### EC13: Student Feedback & Ratings (F13)
- **T1.13.1**: User submits 5-star feedback rating with comment.
- **T1.13.2**: User submits 4-star rating linked to a specific listing ID.
- **T1.13.3**: User submits 1-star feedback with bug description.
- **T1.13.4**: Feedback persists with timestamp in `feedback` table.
- **T1.13.5**: Feedback rating validation allows integer values from 1 to 5.

#### EC14: Image Compression & Asset Guardrails (F14)
- **T1.14.1**: Max 5 images per listing allowed.
- **T1.14.2**: Client image compression converts JPEG file to WebP data URL.
- **T1.14.3**: Client image compression converts PNG file to WebP data URL.
- **T1.14.4**: Quality parameter set to 0.8 and max dimension constrained to 1280px.
- **T1.14.5**: Missing images default to category emoji placeholder icon.

#### EC15: IDatabaseService & Mock Persistence (F15)
- **T1.15.1**: Service factory initializes `MockDatabaseService` when mock mode enabled.
- **T1.15.2**: Mock service pre-populates 6 realistic seed campus listings.
- **T1.15.3**: Mutations persist in memory across operations during test lifecycle.
- **T1.15.4**: `isMockMode()` correctly detects environment variable.
- **T1.15.5**: Service operations return standardized Promise types matching interface contracts.

---

### 5.2 Tier 2: Boundary & Corner Cases Catalog
*(Quantitative rule: >=5 test cases per boundary area. Total >= 40 test cases)*

#### BC01: Email Domain Boundary Conditions (isBennettEmail)
- **T2.01.1 [Invalid Domain]**: Rejects `user@gmail.com` -> returns `false`.
- **T2.01.2 [Invalid Domain]**: Rejects `user@yahoo.co.in` -> returns `false`.
- **T2.01.3 [Phishing/Subdomain]**: Rejects `user@bennett.edu.in.evil.com` -> returns `false`.
- **T2.01.4 [Incomplete Domain]**: Rejects `user@bennett.edu` -> returns `false`.
- **T2.01.5 [Missing TLD]**: Rejects `user@bennett` -> returns `false`.
- **T2.01.6 [Whitespace Infiltration]**: Rejects ` user@bennett.edu.in ` when untrimmed -> requires trimming.
- **T2.01.7 [Prefix-only]**: Rejects `@bennett.edu.in` (empty local part) -> returns `false`.

#### BC02: Active Listing Cap Boundary Conditions (10 Limit)
- **T2.02.1 [Exact 10]**: Student successfully creates exactly 10 active listings.
- **T2.02.2 [11th Attempt Rejection]**: Student attempts to create an 11th active listing -> throws "Active listing limit of 10 reached".
- **T2.02.3 [Sold Item Re-entry]**: Student at 10 active listings marks 1 as 'sold'; active count is now 9; 11th listing creation now succeeds.
- **T2.02.4 [Delisted Item Re-entry]**: Student at 10 active listings delists 1; active count is now 9; new listing succeeds.
- **T2.02.5 [Relist at Cap Rejection]**: Student at 10 active listings has 1 'delisted' listing; attempts to relist it -> throws "Active listing limit of 10 reached".

#### BC03: Price, Title & Content Boundaries
- **T2.03.1 [Negative Price]**: Attempting to create listing with price `-50` -> throws "Price cannot be negative".
- **T2.03.2 [Zero Price / Free]**: Attempting to create listing with price `0` -> succeeds (free donation).
- **T2.03.3 [Extreme Price]**: Attempting to create listing with price `10000000` (â‚¹1 Crore) -> accepted or capped at realistic upper bound (â‚¹10,00,000).
- **T2.03.4 [Title Length Max]**: Title of exactly 80 characters -> accepted.
- **T2.03.5 [Title Length Exceeded]**: Title of 81 characters -> trimmed or rejected with validation error.
- **T2.03.6 [Empty / Whitespace Title]**: Title containing only spaces `"   "` -> throws validation error.
- **T2.03.7 [XSS Infiltration in Description]**: Description containing `<script>alert(1)</script>` is sanitized or stored safely as escaped text.

#### BC04: Image Array Boundaries
- **T2.04.1 [0 Images]**: Creating listing with empty `images: []` array -> succeeds and renders placeholder.
- **T2.04.2 [Exact 5 Images]**: Creating listing with exactly 5 images -> succeeds.
- **T2.04.3 [6 Images Overflow]**: Uploading 6 images -> server/service truncates to first 5 or rejects.
- **T2.04.4 [Corrupt Image URL]**: Invalid data URI string handled gracefully without crash.
- **T2.04.5 [Large Aspect Ratio]**: Extreme panorama or tall portrait image URL persists without format distortion.

#### BC05: Onboarding Academic Year & Residence Boundaries
- **T2.05.1 [Lower Bound Year]**: Academic year `1` -> accepted.
- **T2.05.2 [Upper Bound Year]**: Academic year `5` (5th-year law/integrated) -> accepted.
- **T2.05.3 [Invalid Low Year]**: Academic year `0` -> throws validation error.
- **T2.05.4 [Invalid High Year]**: Academic year `6` -> throws validation error.
- **T2.05.5 [Invalid Residence Enum]**: Residence value `"Off-Campus Apartment"` outside enum `['Hostel', 'Day scholar']` -> throws validation error.

#### BC06: Feed Search & Filtering Corner Cases
- **T2.06.1 [Empty Search Query]**: Search `""` returns all active items.
- **T2.06.2 [Whitespace Search Query]**: Search `"   "` trims and returns all active items.
- **T2.06.3 [Regex Injection Search]**: Search with special regex symbols `".*+?^${}()|[]\\"` does not crash backend, treated as literal text.
- **T2.06.4 [Zero Match Search]**: Search `"XYZNONEXISTENTQUERY999"` returns empty array `[]` (not null or error).
- **T2.06.5 [Empty Category Filter]**: Filter on category with zero items returns empty array `[]`.

#### BC07: Privacy & Access Boundary Conditions
- **T2.07.1 [Non-Owner Edit]**: User B attempts to edit User A's listing -> throws HTTP 403 / "Unauthorized".
- **T2.07.2 [Non-Owner Delete]**: User B attempts to delete User A's listing -> throws HTTP 403 / "Unauthorized".
- **T2.07.3 [Direct ID Snooping]**: Fetching listing by ID without session or enquiry returns redacted `contactValue: undefined`.
- **T2.07.4 [Duplicate Enquiry]**: Buyer submitting a second enquiry to same listing does not duplicate unlock or error out.
- **T2.07.5 [Enquiry on Own Listing]**: Owner submitting enquiry on their own listing -> handled cleanly, contact already accessible.

#### BC08: Moderation & Reporting Boundaries
- **T2.08.1 [Missing Report Reason]**: Submitting report with empty reason -> throws validation error.
- **T2.08.2 [Long Report Details]**: Submitting report with 2,000 characters detail text -> safely stored.
- **T2.08.3 [Report on Sold Listing]**: Submitting report on an already sold item -> succeeds (item may have been fraudulent).
- **T2.08.4 [Non-existent Listing Report]**: Submitting report on invalid listing ID -> throws 404 / error.
- **T2.08.5 [Invalid Status Transition]**: Setting report status to invalid string `"closed"` outside `['pending', 'investigating', 'resolved', 'dismissed']` -> rejected.

---

### 5.3 Tier 3: Cross-Feature Combinations Catalog
*(Quantitative rule: >=10 multi-feature interaction flows)*

- **T3.01 [Full Trade Flow]**:
  1. Student A (`seller@bennett.edu.in`) verifies OTP and onboards as 3rd year CSE Hostel.
  2. Student A creates listing "Hero Sprint cycle" for â‚¹3,800 with WhatsApp contact "9876543210".
  3. Student B (`buyer@bennett.edu.in`) searches feed for "cycle".
  4. Student B views listing details; verifies contact info is REDACTED.
  5. Student B submits enquiry "Can we meet at the food court?".
  6. Verify contact info is UNLOCKED for Student B ("WhatsApp: 9876543210").
  7. Student A marks listing as 'sold'.
  8. Student B refreshes; listing status is 'sold' and enquiry submission is closed.

- **T3.02 [10-Cap Saturation & Recycling]**:
  1. Student A onboards and creates 10 distinct active listings.
  2. Student A attempts to create listing #11 -> fails with cap error.
  3. Student A marks listing #3 as 'sold'.
  4. Student A attempts to create listing #11 -> succeeds.
  5. Student A tries to relist listing #3 -> fails because active count is back at 10.

- **T3.03 [Search, Multi-Filter & Sort Composition]**:
  1. Seed database with electronics items at â‚¹5,000, â‚¹15,000, â‚¹28,000 and books at â‚¹500.
  2. Query with `category: 'Electronics'`, `search: 'laptop'`, `sort: 'price_asc'`.
  3. Verify results contain only matching electronics in strictly ascending price order.
  4. Change sort to `price_desc`; verify reverse ordering.

- **T3.04 [Unauthenticated Guest to Enquiring Buyer]**:
  1. Unauthenticated visitor browses home feed and views listing #1.
  2. Contact is hidden; "Sign in to contact" button is displayed.
  3. Visitor enters `guest@bennett.edu.in`, completes OTP and onboarding.
  4. Returned to listing #1; "Send enquiry" box is now displayed.
  5. Submits enquiry; contact is immediately revealed.

- **T3.05 [Moderation Escalation Flow]**:
  1. Malicious student lists prohibited item (e.g. "Exam answer keys").
  2. Student B spots listing and submits Report ("Academic dishonesty / prohibited").
  3. Moderation queue registers report with status 'pending'.
  4. Moderator inspects queue, transitions report status to 'resolved'.
  5. Listing status is updated to 'delisted'.
  6. Verified item is removed from public search feed.

- **T3.06 [Profile Update Propagation]**:
  1. Student A onboards with name "Aarav Sharma".
  2. Student A creates listing "Casio Calculator".
  3. Listing join displays "Aarav Sharma".
  4. Student A updates profile name to "Aarav S." and course to "B.Tech CSE".
  5. Viewing listing displays updated seller profile attributes.

- **T3.07 [Delist, Relist & Cap Interplay]**:
  1. Student has 9 active listings and 2 delisted listings.
  2. Student creates 1 new listing (now 10 active).
  3. Student attempts to relist one of the delisted listings -> rejected (at cap).
  4. Student delists another active listing (active count = 9).
  5. Relisting now succeeds (active count = 10).

- **T3.08 [Multi-Buyer Independent Privacy]**:
  1. Student A lists item with private phone number.
  2. Student B enquires on item -> Student B unlocks contact.
  3. Student C (different student) views same item -> Student C still receives redacted contact.
  4. Student C enquires -> Student C also unlocks contact.
  5. Unauthenticated visitor still sees redacted contact.

- **T3.09 [Image Compression to Feed Gallery Integration]**:
  1. User selects 3 raw photos (JPEG, PNG).
  2. Client-side compression converts all 3 to WebP format.
  3. Listing is published with the 3 WebP image URLs.
  4. Home feed renders the primary thumbnail (1st image).
  5. Detail page renders the complete 3-image slider gallery.

- **T3.10 [Post-Transaction Feedback Loop]**:
  1. Student B unlocks contact and completes physical purchase of item from Student A.
  2. Student A marks item as 'sold'.
  3. Student B accesses platform feedback form, selects 5 stars, and enters "Smooth transaction at library!".
  4. Feedback record is persisted in `feedback` table linked to user B.

---

### 5.4 Tier 4: Real-World Application Scenarios Catalog
*(Quantitative rule: Realistic Bennett University campus trade day-in-the-life scenarios)*

#### Scenario 1: The End-of-Semester Hostel Clearance
- **Persona**: Aarav Singhal, 4th-year B.Tech CSE graduating senior living in Hostel 4.
- **Narrative**: Aarav needs to vacate his hostel room within 48 hours. He lists 4 items:
  1. Hero Sprint 21-Speed Cycle (â‚¹3,800, Cycles & transport)
  2. Ergonomic Study Chair (â‚¹900, Furniture)
  3. Casio fx-991EX Scientific Calculator (â‚¹700, Stationery & lab gear)
  4. Extension Board with Surge Protector (â‚¹350, Hostel essentials)
- **Execution & Validation**:
  - Aarav logs in with `aarav.singhal@bennett.edu.in`.
  - All 4 listings are published with photos and WhatsApp contact method.
  - Kabir (1st-year fresher) searches "cycle", finds Aarav's listing, sends enquiry, gets WhatsApp number, and coordinates handover at the campus main gate.
  - Aarav marks the cycle as 'sold'.
  - Feed immediately updates: items count decreases by 1, cycle is marked sold.
  - Remaining 3 items remain active and discoverable.

#### Scenario 2: The Course Swap & Textbook Hustle
- **Persona**: Mehak Kaur, 2nd-year B.Tech ECE student.
- **Narrative**: Semester classes start; Mehak completed Data Structures and needs to sell her notes bundle to buy an Analog Electronics kit.
- **Execution & Validation**:
  - Mehak lists "Data Structures 3-Book Bundle & Handwritten Notes" under 'Books & notes' for â‚¹600.
  - After 24 hours without an enquiry, Mehak edits the listing to drop the price to â‚¹450.
  - Rohan (2nd-year CSE) browses 'Books & notes', sorts by `price_asc`, sees Mehak's listing at â‚¹450 at the top of results.
  - Rohan sends enquiry: "Can I collect this today near the library cafe?".
  - Mehak's contact unlocks; Rohan connects with Mehak and completes purchase.
  - Mehak marks item as 'sold' and leaves platform feedback rating BU Trade 5 stars.

#### Scenario 3: The Campus Power Seller & 10-Item Cap Enforcement
- **Persona**: Ananya Roy, 3rd-year design student who is an active campus thrifter.
- **Narrative**: Ananya clears out clutter, listing stationery, clothes, electronics, and books.
- **Execution & Validation**:
  - Ananya lists 10 items consecutively. All 10 succeed and her active count reaches 10.
  - Ananya attempts to list an 11th item: "Wireless Mouse".
  - The system catches the 11th attempt: UI displays a clear notification "You have reached the maximum limit of 10 active listings. Please mark an existing item as sold or delist it before creating a new one."
  - Ananya goes to her "My listings" dashboard, marks an older hoodie as 'sold'.
  - Active count drops to 9.
  - Ananya re-submits the "Wireless Mouse" listing, which now succeeds cleanly.

#### Scenario 4: The Outside Scammer Intrusion Rejection
- **Persona**: An external unauthorized party trying to scrape student contact numbers and sell fake concert tickets.
- **Narrative**:
  - Attacker attempts to sign in using `intruder@gmail.com` -> server rejects with HTTP 400 "Only @bennett.edu.in emails permitted".
  - Attacker attempts domain spoofing `scammer@bennett.edu.in.phishing.org` -> server rejects.
  - Attacker attempts direct unauthenticated API queries to `/api/listings` or `getListingById` to scrape seller phone numbers.
  - Server returns listings with sanitized payloads where `contactValue` is `undefined`.
  - Zero phone numbers or student contact emails are leaked. Campus privacy holds 100%.

#### Scenario 5: Prohibited Item Flagging & Moderation Intervention
- **Persona**: A reckless student tries to list an unauthorized contraband item (e.g. vape/e-cigarette).
- **Narrative**:
  - Listing is submitted under 'Other'.
  - A student browsing the feed notices the prohibited item and clicks "Report listing".
  - Modal prompts for violation category; student selects "Prohibited item" and notes "Nicotine vape listed on campus platform".
  - Report lands in the moderation queue with status 'pending'.
  - Campus moderator reviews reports via `getReports()`, verifies the violation, and changes status to 'resolved', triggering automatic delisting of the item.
  - Item vanishes from the home feed immediately.

---

## 6. Execution Matrix & Pass/Fail Criteria

| Tier | Category | Total Test Cases | Passing Criteria | Execution Target |
|------|----------|------------------|------------------|------------------|
| **Tier 1** | Feature Coverage | 75+ | 100% pass | < 2.5 seconds |
| **Tier 2** | Boundary & Corner Cases | 40+ | 100% pass | < 1.5 seconds |
| **Tier 3** | Cross-Feature Combinations | 10+ | 100% pass | < 2.0 seconds |
| **Tier 4** | Real-World Application Scenarios | 5 | 100% pass | < 1.5 seconds |
| **Total** | **Full E2E Suite** | **130+** | **100% Pass** | **< 7.5 seconds** |

### Absolute Verification Criteria
1. **0 Network Calls to Cloud**: Must execute with zero internet connectivity.
2. **0 Contact Leaks**: In no test case may `contactValue` be present in a payload delivered to an unauthenticated user or non-enquiring third-party student.
3. **0 Cap Bypass**: In no test case may a student exceed 10 concurrent active listings.
4. **0 Domain Bypass**: In no test case may an email outside `@bennett.edu.in` receive an OTP or create an authenticated session.

---

## 7. Maintenance & Extension Guidelines

1. **Adding New Categories**: When expanding beyond the initial 8 categories, add the category to `ListingCategory` in `lib/db/types.ts` and add corresponding test cases in Tier 1 (EC04) and Tier 2 (BC06).
2. **Adding New Contact Methods**: When adding a new contact method (e.g. Instagram handle), ensure `contactValue` redaction logic covers it by default.
3. **Database Migration Sync**: Every change in `supabase/migrations/001_initial_schema.sql` must have a matching behavioral rule updated in `lib/db/mock.ts` so mock and production environments stay 100% synchronized.
