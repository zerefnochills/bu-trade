// ============================================================================
// BU Trade — In-Memory & LocalStorage Mock Database Service
// Pre-seeded with realistic Bennett University campus listings,
// enforcing 10 active listing limit, contact redaction & enquiry unlocking.
// ============================================================================

import {
  BorrowTradeStatus,
  BorrowTradeType,
  ContactMethod,
  Enquiry,
  Feedback,
  FeedbackPost,
  FeedbackVote,
  GetListingsOptions,
  GetTradeBorrowOptions,
  IDatabaseService,
  Listing,
  Profile,
  Report,
  TradeBorrowRequest,
} from './types';

const STORAGE_KEYS = {
  PROFILES: 'bu_trade_v2_profiles',
  LISTINGS: 'bu_trade_v2_listings',
  ENQUIRIES: 'bu_trade_v2_enquiries',
  REPORTS: 'bu_trade_v2_reports',
  FEEDBACK: 'bu_trade_v2_feedback',
  FEEDBACK_POSTS: 'bu_trade_v2_feedback_posts',
  FEEDBACK_VOTES: 'bu_trade_v2_feedback_votes',
  TRADE_BORROW: 'bu_trade_v2_trade_borrow',
};

// Realistic seed profiles
export const SEED_PROFILES: Profile[] = [
  {
    id: 'seed-user-1',
    email: 'aarav.sharma@bennett.edu.in',
    fullName: 'Aarav Sharma',
    course: 'B.Tech CSE',
    year: 3,
    residence: 'Hostel',
    whatsapp: '+91 98765 43210',
    isModerator: false,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'seed-user-2',
    email: 'mehak.kaur@bennett.edu.in',
    fullName: 'Mehak Kaur',
    course: 'B.Tech ECE',
    year: 2,
    residence: 'Hostel',
    whatsapp: '+91 98123 45678',
    isModerator: false,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'seed-user-3',
    email: 'rohan.verma@bennett.edu.in',
    fullName: 'Rohan Verma',
    course: 'BBA',
    year: 2,
    residence: 'Day scholar',
    whatsapp: '+91 99887 76655',
    isModerator: false,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'seed-user-4',
    email: 'ishita.mishra@bennett.edu.in',
    fullName: 'Ishita Mishra',
    course: 'B.Tech CSE',
    year: 4,
    residence: 'Hostel',
    whatsapp: '+91 96543 21098',
    isModerator: false,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'seed-user-5',
    email: 'kabir.tyagi@bennett.edu.in',
    fullName: 'Kabir Tyagi',
    course: 'B.Des',
    year: 1,
    residence: 'Hostel',
    whatsapp: '+91 97112 23344',
    isModerator: false,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'seed-user-6',
    email: 'ananya.roy@bennett.edu.in',
    fullName: 'Ananya Roy',
    course: 'B.Tech CSE',
    year: 2,
    residence: 'Day scholar',
    whatsapp: '+91 98990 01122',
    isModerator: false,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// Realistic seed listings adapted from HTML prototype & spec miner
export const SEED_LISTINGS: Listing[] = [
  {
    id: 'seed-listing-1',
    userId: 'seed-user-1',
    title: 'Hero Sprint cycle, 21-speed',
    price: 3800,
    category: 'Cycles & transport',
    age: '2 years',
    reason: 'Graduating this semester',
    description: 'Gears serviced last month. Smooth suspension, comes with cable lock and bell included.',
    contactMethod: 'WhatsApp',
    contactValue: '+91 98765 43210',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'seed-listing-2',
    userId: 'seed-user-2',
    title: 'Casio fx-991EX calculator',
    price: 700,
    category: 'Stationery & lab gear',
    age: '1 year',
    reason: 'Upgraded to a graphing one',
    description: 'Works perfectly, genuine Casio ClassWiz fx-991EX with hard sliding protective cover.',
    contactMethod: 'WhatsApp',
    contactValue: '+91 98123 45678',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'seed-listing-3',
    userId: 'seed-user-3',
    title: 'Study lamp and extension board',
    price: 450,
    category: 'Hostel essentials',
    age: '8 months',
    reason: 'Moving off campus',
    description: 'Warm LED lamp with flexible neck plus a 4-socket Spike Guard extension cord with surge protection.',
    contactMethod: 'Phone',
    contactValue: '+91 99887 76655',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'seed-listing-4',
    userId: 'seed-user-4',
    title: 'Dell Inspiron 15, 8GB/512GB SSD',
    price: 28500,
    category: 'Electronics',
    age: '2.5 years',
    reason: 'Bought a new laptop',
    description: 'Intel Core i5 11th Gen, 8GB RAM, 512GB NVMe SSD. Battery holds 3-4 hours charge. Original 65W charger included.',
    contactMethod: 'Phone',
    contactValue: '+91 96543 21098',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'seed-listing-5',
    userId: 'seed-user-5',
    title: 'Folding study chair',
    price: 900,
    category: 'Furniture',
    age: '1 year',
    reason: 'Leaving the hostel',
    description: 'Sturdy metal frame with cushioned seat and backrest. Easily folds flat for compact hostel storage.',
    contactMethod: 'WhatsApp',
    contactValue: '+91 97112 23344',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'seed-listing-6',
    userId: 'seed-user-6',
    title: 'Data Structures book bundle',
    price: 500,
    category: 'Books & notes',
    age: '1 year',
    reason: 'Course completed',
    description: 'Includes Tanenbaum Data Structures in C, plus two reference question banks and clean spiral-bound handwritten notes.',
    contactMethod: 'WhatsApp',
    contactValue: '+91 98990 01122',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'seed-listing-7',
    userId: 'seed-user-1',
    title: 'Bennett University Official Hoodie (Size L)',
    price: 650,
    category: 'Clothing',
    age: '6 months',
    reason: 'Wrong size ordered',
    description: 'Barely worn Navy Bennett hoodie, pure cotton, size L.',
    contactMethod: 'WhatsApp',
    contactValue: '+91 98765 43210',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'seed-listing-8',
    userId: 'seed-user-3',
    title: 'Pigeon Induction Cooktop 1800W',
    price: 1300,
    category: 'Hostel essentials',
    age: '1.5 years',
    reason: 'Shifting to flat with gas stove',
    description: 'Working flawlessly with 7 preset modes. Compatible stainless steel pan included.',
    contactMethod: 'Phone',
    contactValue: '+91 99887 76655',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'seed-listing-9',
    userId: 'seed-user-4',
    title: 'Sony WH-CH520 Wireless Headphones',
    price: 2400,
    category: 'Electronics',
    age: '4 months',
    reason: 'Upgraded to ANC headphones',
    description: '50hr battery life, beige color, type-C fast charge, pristine condition.',
    contactMethod: 'WhatsApp',
    contactValue: '+91 96543 21098',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'seed-listing-10',
    userId: 'seed-user-2',
    title: 'Yonex Nanoray 18i Badminton Racket with Cover',
    price: 1100,
    category: 'Other',
    age: '5 months',
    reason: 'No time to play campus tournaments',
    description: 'Strung at 26 lbs, BG65 strings, grip replaced last week.',
    contactMethod: 'Email',
    contactValue: 'mehak.kaur@bennett.edu.in',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

// Realistic seed feedbacks from Bennett University students
export const SEED_FEEDBACK_POSTS: FeedbackPost[] = [
  {
    id: 'seed-feedback-1',
    userId: 'seed-user-2',
    itemTitle: 'Hero Sprint cycle, 21-speed',
    content: 'Bought this cycle from Aarav senior last month. The gears shift smoothly and it has made traveling from Hostel 4 to the mechanical lab so convenient! Great condition as promised.',
    rating: 5,
    images: [],
    listingId: 'seed-listing-1',
    score: 12,
    upvotesCount: 12,
    downvotesCount: 0,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    authorName: 'Mehak Kaur',
    authorCourse: 'B.Tech ECE',
    authorYear: 2,
  },
  {
    id: 'seed-feedback-2',
    userId: 'seed-user-1',
    itemTitle: 'Casio fx-991EX ClassWiz Calculator',
    content: 'Essential calculator for engineering maths and matrix computations. Solar panel and battery both work without any hiccups. Very satisfied with the deal from Mehak.',
    rating: 5,
    images: [],
    listingId: 'seed-listing-2',
    score: 8,
    upvotesCount: 9,
    downvotesCount: 1,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    authorName: 'Aarav Sharma',
    authorCourse: 'B.Tech CSE',
    authorYear: 3,
  },
  {
    id: 'seed-feedback-3',
    userId: 'seed-user-4',
    itemTitle: 'Bennett University Lab Coat (Size M)',
    content: 'Purchased this lab coat for chemistry experiments. Stitching is intact, clean Bennett logo patch on pocket. Saved 400 rupees compared to the campus tuck shop!',
    rating: 4,
    images: [],
    score: 5,
    upvotesCount: 5,
    downvotesCount: 0,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    authorName: 'Ishita Mishra',
    authorCourse: 'B.Tech CSE',
    authorYear: 4,
  },
  {
    id: 'seed-feedback-4',
    userId: 'seed-user-3',
    itemTitle: 'CLRS Introduction to Algorithms 3rd Edition',
    content: 'Got this algorithms textbook in almost new condition, no pencil marks or torn pages. Perfect reference for data structures coursework.',
    rating: 5,
    images: [],
    score: 15,
    upvotesCount: 16,
    downvotesCount: 1,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    authorName: 'Rohan Verma',
    authorCourse: 'BBA',
    authorYear: 2,
  },
  {
    id: 'seed-feedback-5',
    userId: 'seed-user-5',
    itemTitle: 'Study lamp and extension board',
    content: 'Lamp provides ample warm light for late night design projects in room. The surge protector extension board is a lifesaver for multiple chargers.',
    rating: 4,
    images: [],
    listingId: 'seed-listing-3',
    score: 3,
    upvotesCount: 4,
    downvotesCount: 1,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    authorName: 'Kabir Tyagi',
    authorCourse: 'B.Des',
    authorYear: 1,
  },
];

// Realistic Bennett University student trade & borrow requests
export const SEED_TRADE_BORROW_REQUESTS: TradeBorrowRequest[] = [
  {
    id: 'seed-trade-borrow-1',
    userId: 'seed-user-1',
    title: 'Casio fx-991EX Scientific Calculator',
    description: 'Need for Calculus and Linear Algebra mid-term exams next week. Will handle with care!',
    requestType: 'borrow',
    duration: '3 days',
    category: 'Electronics',
    contactMethod: 'WhatsApp',
    contactValue: '+91 98765 43210',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    requesterName: 'Aarav Sharma',
    requesterCourse: 'B.Tech CSE',
    requesterYear: 3,
  },
  {
    id: 'seed-trade-borrow-2',
    userId: 'seed-user-2',
    title: 'Bennett Lab Coat & Safety Goggles (Size M)',
    description: 'Urgent borrow for Physics/Chemistry practicals this Thursday afternoon.',
    requestType: 'borrow',
    duration: '1 lab session / 3 hours',
    category: 'Stationery & lab gear',
    contactMethod: 'Phone',
    contactValue: '+91 98123 45678',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    requesterName: 'Mehak Kaur',
    requesterCourse: 'B.Tech ECE',
    requesterYear: 2,
  },
  {
    id: 'seed-trade-borrow-3',
    userId: 'seed-user-3',
    title: 'Data Structures and Algorithms in C++ (Cormen / CLRS)',
    description: 'Have CLRS 3rd Edition in excellent condition. Looking to swap with Computer Networks or Operating Systems textbook for the semester.',
    requestType: 'trade',
    duration: 'Full semester',
    category: 'Books & notes',
    contactMethod: 'WhatsApp',
    contactValue: '+91 99887 76655',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    requesterName: 'Rohan Verma',
    requesterCourse: 'BBA',
    requesterYear: 2,
  },
  {
    id: 'seed-trade-borrow-4',
    userId: 'seed-user-4',
    title: 'Bicycle for Greater Noida Market Grocery Run',
    description: 'Need geared cycle for a quick Saturday evening trip to Pari Chowk / Alpha 1 market.',
    requestType: 'borrow',
    duration: '1 weekend',
    category: 'Cycles & transport',
    contactMethod: 'WhatsApp',
    contactValue: '+91 97654 32109',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    requesterName: 'Ishita Mishra',
    requesterCourse: 'B.Tech CSE',
    requesterYear: 4,
  },
  {
    id: 'seed-trade-borrow-5',
    userId: 'seed-user-5',
    title: 'Stag Table Tennis Racket Pair',
    description: 'Have two TT bats with extra balls. Looking to trade for a badminton racket set or basketball for hostel court games.',
    requestType: 'trade',
    duration: '2 weeks',
    category: 'Hostel essentials',
    contactMethod: 'WhatsApp',
    contactValue: '+91 98234 56789',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    requesterName: 'Kabir Tyagi',
    requesterCourse: 'B.Des',
    requesterYear: 1,
  },
];

export class MockDatabaseService implements IDatabaseService {
  private profiles: Profile[] = [];
  private listings: Listing[] = [];
  private enquiries: Enquiry[] = [];
  private reports: Report[] = [];
  private feedback: Feedback[] = [];
  private feedbackPosts: FeedbackPost[] = [];
  private feedbackVotes: FeedbackVote[] = [];
  private tradeBorrowRequests: TradeBorrowRequest[] = [];
  private isLoaded = false;

  constructor() {
    this.init();
  }

  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private getServerStoragePath(): string | null {
    if (this.isClient()) return null;
    try {
      const path = require('path');
      if (process.env.NODE_ENV === 'test' || process.env.BU_TRADE_TEST === 'true') {
        return path.join(process.cwd(), '.mock_db_state.test.json');
      }
      return path.join(process.cwd(), '.mock_db_state.json');
    } catch {
      return null;
    }
  }

  private readServerStorage(): Record<string, unknown> | null {
    const filePath = this.getServerStoragePath();
    if (!filePath) return null;
    try {
      const fs = require('fs');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch {
      // Ignore read errors
    }
    return null;
  }

  private writeServerStorage(key: string, data: unknown): void {
    const filePath = this.getServerStoragePath();
    if (!filePath) return;
    try {
      const fs = require('fs');
      let state: Record<string, unknown> = {};
      if (fs.existsSync(filePath)) {
        try {
          state = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch {}
      }
      state[key] = data;
      fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
    } catch {
      // Ignore write errors
    }
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    if (!this.isClient()) {
      const serverState = this.readServerStorage();
      if (serverState && serverState[key] !== undefined) {
        return serverState[key] as T;
      }
      return fallback;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    if (!this.isClient()) {
      this.writeServerStorage(key, data);
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Storage quota or privacy mode handling
    }
  }

  public init(forceReset = false): void {
    if (this.isLoaded && !forceReset) return;

    if (forceReset) {
      this.profiles = [...SEED_PROFILES];
      this.listings = [...SEED_LISTINGS];
      this.enquiries = [];
      this.reports = [];
      this.feedback = [];
      this.feedbackPosts = SEED_FEEDBACK_POSTS.map((p) => ({ ...p, images: [...p.images] }));
      this.feedbackVotes = [];
      this.tradeBorrowRequests = SEED_TRADE_BORROW_REQUESTS.map((r) => ({
        ...r,
        images: [...r.images],
      }));

      this.saveToStorage(STORAGE_KEYS.PROFILES, this.profiles);
      this.saveToStorage(STORAGE_KEYS.LISTINGS, this.listings);
      this.saveToStorage(STORAGE_KEYS.ENQUIRIES, this.enquiries);
      this.saveToStorage(STORAGE_KEYS.REPORTS, this.reports);
      this.saveToStorage(STORAGE_KEYS.FEEDBACK, this.feedback);
      this.saveToStorage(STORAGE_KEYS.FEEDBACK_POSTS, this.feedbackPosts);
      this.saveToStorage(STORAGE_KEYS.FEEDBACK_VOTES, this.feedbackVotes);
      this.saveToStorage(STORAGE_KEYS.TRADE_BORROW, this.tradeBorrowRequests);
      this.isLoaded = true;
      return;
    }

    const storedProfiles = this.loadFromStorage<Profile[] | null>(STORAGE_KEYS.PROFILES, null);
    const storedListings = this.loadFromStorage<Listing[] | null>(STORAGE_KEYS.LISTINGS, null);
    const storedFeedbackPosts = this.loadFromStorage<FeedbackPost[] | null>(
      STORAGE_KEYS.FEEDBACK_POSTS,
      null
    );
    const storedTradeBorrow = this.loadFromStorage<TradeBorrowRequest[] | null>(
      STORAGE_KEYS.TRADE_BORROW,
      null
    );

    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.BU_TRADE_TEST === 'true';

    if (isTestEnv) {
      // Test environment: populate test seeds if not already stored in isolated test storage
      this.profiles = storedProfiles || [...SEED_PROFILES];
      this.listings = storedListings || [...SEED_LISTINGS];
      this.enquiries = this.loadFromStorage<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, []);
      this.reports = this.loadFromStorage<Report[]>(STORAGE_KEYS.REPORTS, []);
      this.feedback = this.loadFromStorage<Feedback[]>(STORAGE_KEYS.FEEDBACK, []);
      this.feedbackPosts =
        storedFeedbackPosts ||
        SEED_FEEDBACK_POSTS.map((p) => ({ ...p, images: [...p.images] }));
      this.feedbackVotes = this.loadFromStorage<FeedbackVote[]>(STORAGE_KEYS.FEEDBACK_VOTES, []);
      this.tradeBorrowRequests =
        storedTradeBorrow ||
        SEED_TRADE_BORROW_REQUESTS.map((r) => ({
          ...r,
          images: [...r.images],
        }));

      this.saveToStorage(STORAGE_KEYS.PROFILES, this.profiles);
      this.saveToStorage(STORAGE_KEYS.LISTINGS, this.listings);
      this.saveToStorage(STORAGE_KEYS.FEEDBACK_POSTS, this.feedbackPosts);
      this.saveToStorage(STORAGE_KEYS.TRADE_BORROW, this.tradeBorrowRequests);
      this.isLoaded = true;
      return;
    }

    // Live website runtime: strictly zero mock data!
    this.profiles = (storedProfiles || []).filter((p) => !p.id.startsWith('seed-'));
    this.listings = (storedListings || []).filter((l) => !l.id.startsWith('seed-'));
    this.enquiries = this.loadFromStorage<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, []).filter(
      (e) => !e.id.startsWith('seed-')
    );
    this.reports = this.loadFromStorage<Report[]>(STORAGE_KEYS.REPORTS, []).filter(
      (r) => !r.id.startsWith('seed-')
    );
    this.feedback = this.loadFromStorage<Feedback[]>(STORAGE_KEYS.FEEDBACK, []);
    this.feedbackPosts = (storedFeedbackPosts || []).filter((f) => !f.id.startsWith('seed-'));
    this.feedbackVotes = this.loadFromStorage<FeedbackVote[]>(STORAGE_KEYS.FEEDBACK_VOTES, []);
    this.tradeBorrowRequests = (storedTradeBorrow || []).filter((r) => !r.id.startsWith('seed-'));

    this.saveToStorage(STORAGE_KEYS.PROFILES, this.profiles);
    this.saveToStorage(STORAGE_KEYS.LISTINGS, this.listings);
    this.saveToStorage(STORAGE_KEYS.FEEDBACK_POSTS, this.feedbackPosts);
    this.saveToStorage(STORAGE_KEYS.TRADE_BORROW, this.tradeBorrowRequests);

    this.isLoaded = true;
  }

  // Helper: check if viewer has access to contact details
  private canViewContact(listing: Listing, viewerId?: string): boolean {
    if (!viewerId) return false;
    // Seller always has access
    if (listing.userId === viewerId) return true;
    // Moderator has access
    const viewerProfile = this.profiles.find((p) => p.id === viewerId);
    if (viewerProfile?.isModerator) return true;
    // Buyer who submitted an enquiry has access
    return this.enquiries.some((e) => e.listingId === listing.id && e.buyerId === viewerId);
  }

  // Helper: sanitize listing payload based on viewer permissions
  private sanitizeListing(listing: Listing, viewerId?: string): Listing {
    const seller = this.profiles.find((p) => p.id === listing.userId);
    const hasUnlocked = this.canViewContact(listing, viewerId);

    const sanitized: Listing = {
      ...listing,
      sellerName: seller?.fullName,
      sellerCourse: seller?.course,
      sellerYear: seller?.year,
      hasUnlockedContact: hasUnlocked,
    };

    if (!hasUnlocked) {
      delete sanitized.contactValue;
    }

    return sanitized;
  }

  // ==========================================================================
  // Profiles
  // ==========================================================================
  async getProfile(userId: string): Promise<Profile | null> {
    this.init();
    const profile = this.profiles.find((p) => p.id === userId);
    return profile ? { ...profile } : null;
  }

  async getProfileByEmail(email: string): Promise<Profile | null> {
    this.init();
    if (!email || typeof email !== 'string') return null;
    const target = email.trim().toLowerCase();
    const profile = this.profiles.find((p) => p.email.toLowerCase() === target);
    return profile ? { ...profile } : null;
  }

  async createProfile(profileData: Omit<Profile, 'createdAt' | 'updatedAt'>): Promise<Profile> {
    this.init();
    if (!profileData.fullName || !profileData.fullName.trim()) {
      throw new Error('Full name is required.');
    }
    if (!profileData.course || !profileData.course.trim()) {
      throw new Error('Course is required.');
    }
    if (
      profileData.year === undefined ||
      !Number.isInteger(profileData.year) ||
      profileData.year < 1 ||
      profileData.year > 5
    ) {
      throw new Error('Academic year must be an integer between 1 and 5');
    }
    if (profileData.residence !== 'Hostel' && profileData.residence !== 'Day scholar') {
      throw new Error("Residence must be 'Hostel' or 'Day scholar'");
    }

    const existing = this.profiles.find((p) => p.id === profileData.id);
    if (existing) {
      return this.updateProfile(profileData.id, profileData);
    }

    const now = new Date().toISOString();
    const newProfile: Profile = {
      ...profileData,
      createdAt: now,
      updatedAt: now,
    };

    this.profiles.push(newProfile);
    this.saveToStorage(STORAGE_KEYS.PROFILES, this.profiles);
    return { ...newProfile };
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    this.init();
    if (updates.year !== undefined && (!Number.isInteger(updates.year) || updates.year < 1 || updates.year > 5)) {
      throw new Error('Academic year must be an integer between 1 and 5');
    }
    if (updates.residence !== undefined && updates.residence !== 'Hostel' && updates.residence !== 'Day scholar') {
      throw new Error("Residence must be 'Hostel' or 'Day scholar'");
    }

    const index = this.profiles.findIndex((p) => p.id === userId);
    if (index === -1) {
      throw new Error(`Profile not found for userId: ${userId}`);
    }

    const updated: Profile = {
      ...this.profiles[index],
      ...updates,
      id: userId, // immutable id
      updatedAt: new Date().toISOString(),
    };

    this.profiles[index] = updated;
    this.saveToStorage(STORAGE_KEYS.PROFILES, this.profiles);
    return { ...updated };
  }

  // ==========================================================================
  // Listings
  // ==========================================================================
  async countActiveListings(userId: string): Promise<number> {
    this.init();
    return this.listings.filter((l) => l.userId === userId && l.status === 'active').length;
  }

  async getListings(options: GetListingsOptions = {}): Promise<Listing[]> {
    this.init();
    let result = [...this.listings];

    // Filter by status (default to 'active' if not querying specific user's listings)
    if (options.status) {
      result = result.filter((l) => l.status === options.status);
    } else if (!options.userId) {
      result = result.filter((l) => l.status === 'active');
    }

    // Filter by user
    if (options.userId) {
      result = result.filter((l) => l.userId === options.userId);
    }

    // Filter by category
    if (options.category && options.category !== 'All') {
      result = result.filter((l) => l.category === options.category);
    }

    // Filter by search query
    if (options.search && options.search.trim() !== '') {
      const q = options.search.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (options.sort === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (options.sort === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else {
      // Default: newest
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Sanitize contact values based on viewerId
    return result.map((l) => this.sanitizeListing(l, options.viewerId));
  }

  async getListingById(id: string, viewerId?: string): Promise<Listing | null> {
    this.init();
    const listing = this.listings.find((l) => l.id === id);
    if (!listing) return null;
    return this.sanitizeListing(listing, viewerId);
  }

  async createListing(
    listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Listing> {
    this.init();

    if (listingData.price !== undefined && listingData.price < 0) {
      throw new Error("Price cannot be negative");
    }
    if (
      !listingData.title ||
      typeof listingData.title !== 'string' ||
      listingData.title.trim().length === 0
    ) {
      throw new Error("Title is required and cannot be empty");
    }

    const status = listingData.status || 'active';
    if (status && !['active', 'sold', 'delisted'].includes(status)) {
      throw new Error("Invalid status: must be 'active', 'sold', or 'delisted'");
    }

    // 10 active listings limit check (synchronous atomic check against store array)
    if (status === 'active') {
      const currentActive = this.listings.filter(
        (l) =>
          (l.userId === listingData.userId ||
            l.userId.toLowerCase() === String(listingData.userId).toLowerCase()) &&
          l.status === 'active'
      ).length;
      if (currentActive >= 10) {
        throw new Error(
          'Active listing limit reached: Each student can have a maximum of 10 active listings. Active listing limit of 10 reached'
        );
      }
    }

    const now = new Date().toISOString();
    const id = `listing-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const images = Array.isArray(listingData.images) ? listingData.images.slice(0, 5) : [];

    const newListing: Listing = {
      ...listingData,
      id,
      title: listingData.title.trim(),
      status,
      images,
      createdAt: now,
      updatedAt: now,
    };

    this.listings.unshift(newListing);
    this.saveToStorage(STORAGE_KEYS.LISTINGS, this.listings);

    return this.sanitizeListing(newListing, listingData.userId);
  }

  async updateListing(
    id: string,
    updates: Partial<Listing>,
    userId: string
  ): Promise<Listing> {
    this.init();
    const index = this.listings.findIndex((l) => l.id === id);
    if (index === -1) {
      throw new Error(`Listing not found: ${id}`);
    }

    const current = this.listings[index];

    // Authorization check: owner or moderator
    const caller = this.profiles.find((p) => p.id === userId);
    if (
      current.userId !== userId &&
      current.userId.toLowerCase() !== String(userId).toLowerCase() &&
      !caller?.isModerator
    ) {
      throw new Error("Unauthorized: Only the listing owner can update this listing");
    }

    if (updates.price !== undefined && updates.price < 0) {
      throw new Error("Price cannot be negative");
    }
    if (
      updates.title !== undefined &&
      (typeof updates.title !== 'string' || updates.title.trim().length === 0)
    ) {
      throw new Error("Title is required and cannot be empty");
    }
    if (updates.status && !['active', 'sold', 'delisted'].includes(updates.status)) {
      throw new Error("Invalid status: must be 'active', 'sold', or 'delisted'");
    }

    // If changing status to active, re-check 10 active listings cap synchronously
    if (updates.status === 'active' && current.status !== 'active') {
      const currentActive = this.listings.filter(
        (l) =>
          (l.userId === current.userId ||
            l.userId.toLowerCase() === String(current.userId).toLowerCase()) &&
          l.status === 'active'
      ).length;
      if (currentActive >= 10) {
        throw new Error(
          'Active listing limit reached: Each student can have a maximum of 10 active listings. Active listing limit of 10 reached'
        );
      }
    }

    const updated: Listing = {
      ...current,
      ...updates,
      id, // immutable
      userId: current.userId, // immutable owner
      ...(updates.images !== undefined
        ? { images: Array.isArray(updates.images) ? updates.images.slice(0, 5) : [] }
        : {}),
      ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };

    this.listings[index] = updated;
    this.saveToStorage(STORAGE_KEYS.LISTINGS, this.listings);

    return this.sanitizeListing(updated, userId);
  }

  async deleteListing(id: string, userId: string): Promise<boolean> {
    this.init();
    const index = this.listings.findIndex((l) => l.id === id);
    if (index === -1) {
      throw new Error(`Listing not found: ${id}`);
    }

    const listing = this.listings[index];
    const caller = this.profiles.find((p) => p.id === userId);
    if (
      listing.userId !== userId &&
      listing.userId.toLowerCase() !== String(userId).toLowerCase() &&
      !caller?.isModerator
    ) {
      throw new Error("Unauthorized: Only the listing owner can delete this listing");
    }

    this.listings.splice(index, 1);
    this.saveToStorage(STORAGE_KEYS.LISTINGS, this.listings);
    return true;
  }

  // ==========================================================================
  // Enquiries & Protected Contact
  // ==========================================================================
  async hasEnquired(listingId: string, buyerId: string): Promise<boolean> {
    this.init();
    return this.enquiries.some((e) => e.listingId === listingId && e.buyerId === buyerId);
  }

  async createEnquiry(enquiryData: Omit<Enquiry, 'id' | 'createdAt'>): Promise<Enquiry> {
    this.init();
    const listing = this.listings.find((l) => l.id === enquiryData.listingId);
    if (!listing) {
      throw new Error(`Listing not found: ${enquiryData.listingId}`);
    }

    if (listing.userId === enquiryData.buyerId) {
      throw new Error('Invalid enquiry: You cannot enquire on your own listing.');
    }

    const now = new Date().toISOString();
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: `enq-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: now,
    };

    this.enquiries.push(newEnquiry);
    this.saveToStorage(STORAGE_KEYS.ENQUIRIES, this.enquiries);
    return { ...newEnquiry };
  }

  async getListingContact(
    listingId: string,
    viewerId: string
  ): Promise<{ contactMethod: ContactMethod; contactValue: string } | null> {
    this.init();
    if (!viewerId) {
      throw new Error('Authentication required to view contact details.');
    }

    const listing = this.listings.find((l) => l.id === listingId);
    if (!listing) return null;

    if (!this.canViewContact(listing, viewerId)) {
      throw new Error('Access denied: You must enquire on this listing before viewing seller contact details.');
    }

    return {
      contactMethod: listing.contactMethod,
      contactValue: listing.contactValue || '',
    };
  }

  // ==========================================================================
  // Reports
  // ==========================================================================
  async createReport(reportData: Omit<Report, 'id' | 'status' | 'createdAt'>): Promise<Report> {
    this.init();
    const listing = this.listings.find((l) => l.id === reportData.listingId);
    if (!listing) {
      throw new Error(`Listing not found: ${reportData.listingId}`);
    }

    const now = new Date().toISOString();
    const newReport: Report = {
      ...reportData,
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: 'pending',
      createdAt: now,
    };

    this.reports.push(newReport);
    this.saveToStorage(STORAGE_KEYS.REPORTS, this.reports);
    return { ...newReport };
  }

  async getReports(): Promise<Report[]> {
    this.init();
    return [...this.reports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateReportStatus(
    id: string,
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  ): Promise<Report> {
    this.init();
    const validStatuses: ('pending' | 'investigating' | 'resolved' | 'dismissed')[] = [
      'pending',
      'investigating',
      'resolved',
      'dismissed',
    ];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid report status: ${status}. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    const report = this.reports.find((r) => r.id === id);
    if (!report) {
      throw new Error(`Report not found: ${id}`);
    }

    report.status = status;
    if (status === 'resolved') {
      const listing = this.listings.find((l) => l.id === report.listingId);
      if (listing) {
        listing.status = 'delisted';
        listing.updatedAt = new Date().toISOString();
        this.saveToStorage(STORAGE_KEYS.LISTINGS, this.listings);
      }
    }

    this.saveToStorage(STORAGE_KEYS.REPORTS, this.reports);
    return { ...report };
  }

  // ==========================================================================
  // Feedback
  // ==========================================================================
  async createFeedback(feedbackData: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
    this.init();
    const now = new Date().toISOString();
    const newFeedback: Feedback = {
      ...feedbackData,
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: now,
    };

    this.feedback.push(newFeedback);
    this.saveToStorage(STORAGE_KEYS.FEEDBACK, this.feedback);
    return { ...newFeedback };
  }

  // ==========================================================================
  // Feedback Posts & Reddit Voting (R3)
  // ==========================================================================
  async getFeedbackPosts(options?: {
    sort?: 'top' | 'newest';
    viewerId?: string;
  }): Promise<FeedbackPost[]> {
    this.init();
    const { sort = 'top', viewerId } = options || {};

    const postsWithJoins: FeedbackPost[] = this.feedbackPosts.map((post) => {
      const author = this.profiles.find((p) => p.id === post.userId);
      let userVote: 1 | -1 | 0 = 0;
      if (viewerId) {
        const vote = this.feedbackVotes.find(
          (v) => v.feedbackId === post.id && v.userId === viewerId
        );
        if (vote) {
          userVote = vote.voteType;
        }
      }

      return {
        ...post,
        images: [...(post.images || [])],
        authorName: author?.fullName || post.authorName || 'Bennett Student',
        authorCourse: author?.course || post.authorCourse || 'B.Tech CSE',
        authorYear: author?.year || post.authorYear || 2,
        userVote,
      };
    });

    if (sort === 'newest') {
      postsWithJoins.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      // 'top': primary sort by score desc, secondary sort by newest
      postsWithJoins.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return postsWithJoins;
  }

  async getFeedbackPostById(id: string, viewerId?: string): Promise<FeedbackPost | null> {
    this.init();
    const post = this.feedbackPosts.find((p) => p.id === id);
    if (!post) return null;

    const author = this.profiles.find((p) => p.id === post.userId);
    let userVote: 1 | -1 | 0 = 0;
    if (viewerId) {
      const vote = this.feedbackVotes.find(
        (v) => v.feedbackId === post.id && v.userId === viewerId
      );
      if (vote) {
        userVote = vote.voteType;
      }
    }

    return {
      ...post,
      images: [...(post.images || [])],
      authorName: author?.fullName || post.authorName || 'Bennett Student',
      authorCourse: author?.course || post.authorCourse || 'B.Tech CSE',
      authorYear: author?.year || post.authorYear || 2,
      userVote,
    };
  }

  async createFeedbackPost(
    postData: Omit<
      FeedbackPost,
      | 'id'
      | 'score'
      | 'upvotesCount'
      | 'downvotesCount'
      | 'createdAt'
      | 'updatedAt'
      | 'authorName'
      | 'authorCourse'
      | 'authorYear'
      | 'userVote'
    >
  ): Promise<FeedbackPost> {
    this.init();
    const now = new Date().toISOString();
    const author = this.profiles.find((p) => p.id === postData.userId);

    const newPost: FeedbackPost = {
      ...postData,
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      images: Array.isArray(postData.images) ? [...postData.images].slice(0, 3) : [],
      score: 0,
      upvotesCount: 0,
      downvotesCount: 0,
      createdAt: now,
      updatedAt: now,
      authorName: author?.fullName || 'Bennett Student',
      authorCourse: author?.course || 'B.Tech CSE',
      authorYear: author?.year || 2,
      userVote: 0,
    };

    this.feedbackPosts.unshift(newPost);
    this.saveToStorage(STORAGE_KEYS.FEEDBACK_POSTS, this.feedbackPosts);
    return { ...newPost };
  }

  async voteFeedbackPost(
    feedbackId: string,
    userId: string,
    voteType: 1 | -1
  ): Promise<{
    score: number;
    userVote: 1 | -1 | 0;
    upvotesCount: number;
    downvotesCount: number;
  }> {
    this.init();
    const post = this.feedbackPosts.find((p) => p.id === feedbackId);
    if (!post) {
      throw new Error(`Feedback not found: ${feedbackId}`);
    }

    const voteIndex = this.feedbackVotes.findIndex(
      (v) => v.feedbackId === feedbackId && v.userId === userId
    );

    let resultingUserVote: 1 | -1 | 0 = 0;

    if (voteIndex === -1) {
      // Scenario 1 & 3: Unvoted -> cast vote
      const newVote: FeedbackVote = {
        id: `fbv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        feedbackId,
        userId,
        voteType,
        createdAt: new Date().toISOString(),
      };
      this.feedbackVotes.push(newVote);

      if (voteType === 1) {
        post.upvotesCount += 1;
        post.score += 1;
        resultingUserVote = 1;
      } else {
        post.downvotesCount += 1;
        post.score -= 1;
        resultingUserVote = -1;
      }
    } else {
      const existingVote = this.feedbackVotes[voteIndex];
      if (existingVote.voteType === voteType) {
        // Scenario 2 & 4: Toggle off (same vote clicked again)
        this.feedbackVotes.splice(voteIndex, 1);
        if (voteType === 1) {
          post.upvotesCount = Math.max(0, post.upvotesCount - 1);
          post.score -= 1;
        } else {
          post.downvotesCount = Math.max(0, post.downvotesCount - 1);
          post.score += 1;
        }
        resultingUserVote = 0;
      } else {
        // Scenario 5 & 6: Vote flipped (1 -> -1 or -1 -> 1)
        existingVote.voteType = voteType;
        if (voteType === 1) {
          // Downvote -> Upvote
          post.downvotesCount = Math.max(0, post.downvotesCount - 1);
          post.upvotesCount += 1;
          post.score += 2;
          resultingUserVote = 1;
        } else {
          // Upvote -> Downvote
          post.upvotesCount = Math.max(0, post.upvotesCount - 1);
          post.downvotesCount += 1;
          post.score -= 2;
          resultingUserVote = -1;
        }
      }
    }

    // Mathematical invariant: score === upvotesCount - downvotesCount
    post.score = post.upvotesCount - post.downvotesCount;
    post.updatedAt = new Date().toISOString();

    this.saveToStorage(STORAGE_KEYS.FEEDBACK_POSTS, this.feedbackPosts);
    this.saveToStorage(STORAGE_KEYS.FEEDBACK_VOTES, this.feedbackVotes);

    return {
      score: post.score,
      userVote: resultingUserVote,
      upvotesCount: post.upvotesCount,
      downvotesCount: post.downvotesCount,
    };
  }

  // ==========================================================================
  // Trade & Borrow Requests (R4)
  // ==========================================================================
  async getTradeBorrowRequests(options?: GetTradeBorrowOptions): Promise<TradeBorrowRequest[]> {
    this.init();
    let items = [...this.tradeBorrowRequests];

    if (options?.type && options.type !== 'all') {
      items = items.filter((r) => r.requestType === options.type);
    }

    if (options?.category && options.category !== 'All') {
      items = items.filter((r) => r.category === options.category);
    }

    if (options?.status) {
      items = items.filter((r) => r.status === options.status);
    }

    if (options?.userId) {
      items = items.filter((r) => r.userId === options.userId);
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      items = items.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.duration.toLowerCase().includes(q)
      );
    }

    const itemsWithProfiles = items.map((req) => {
      const requester = this.profiles.find((p) => p.id === req.userId);
      return {
        ...req,
        images: [...(req.images || [])],
        requesterName: requester?.fullName || req.requesterName || 'Bennett Student',
        requesterCourse: requester?.course || req.requesterCourse || 'B.Tech CSE',
        requesterYear: requester?.year || req.requesterYear || 2,
      };
    });

    return itemsWithProfiles.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTradeBorrowRequestById(id: string): Promise<TradeBorrowRequest | null> {
    this.init();
    const req = this.tradeBorrowRequests.find((r) => r.id === id);
    if (!req) return null;

    const requester = this.profiles.find((p) => p.id === req.userId);
    return {
      ...req,
      images: [...(req.images || [])],
      requesterName: requester?.fullName || req.requesterName || 'Bennett Student',
      requesterCourse: requester?.course || req.requesterCourse || 'B.Tech CSE',
      requesterYear: requester?.year || req.requesterYear || 2,
    };
  }

  async createTradeBorrowRequest(
    requestData: Omit<
      TradeBorrowRequest,
      'id' | 'createdAt' | 'updatedAt' | 'requesterName' | 'requesterCourse' | 'requesterYear'
    >
  ): Promise<TradeBorrowRequest> {
    this.init();
    const now = new Date().toISOString();
    const requester = this.profiles.find((p) => p.id === requestData.userId);

    const newRequest: TradeBorrowRequest = {
      ...requestData,
      id: `tbr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: requestData.status || 'active',
      images: Array.isArray(requestData.images) ? [...requestData.images].slice(0, 5) : [],
      createdAt: now,
      updatedAt: now,
      requesterName: requester?.fullName || 'Bennett Student',
      requesterCourse: requester?.course || 'B.Tech CSE',
      requesterYear: requester?.year || 2,
    };

    this.tradeBorrowRequests.unshift(newRequest);
    this.saveToStorage(STORAGE_KEYS.TRADE_BORROW, this.tradeBorrowRequests);
    return { ...newRequest };
  }

  async updateTradeBorrowRequestStatus(
    id: string,
    status: BorrowTradeStatus,
    userId: string
  ): Promise<TradeBorrowRequest> {
    this.init();
    const req = this.tradeBorrowRequests.find((r) => r.id === id);
    if (!req) {
      throw new Error(`Trade/Borrow request not found: ${id}`);
    }

    if (req.userId !== userId) {
      throw new Error('Unauthorized: only the request owner can update status');
    }

    req.status = status;
    req.updatedAt = new Date().toISOString();

    this.saveToStorage(STORAGE_KEYS.TRADE_BORROW, this.tradeBorrowRequests);

    const requester = this.profiles.find((p) => p.id === req.userId);
    return {
      ...req,
      images: [...(req.images || [])],
      requesterName: requester?.fullName || req.requesterName || 'Bennett Student',
      requesterCourse: requester?.course || req.requesterCourse || 'B.Tech CSE',
      requesterYear: requester?.year || req.requesterYear || 2,
    };
  }

  async deleteTradeBorrowRequest(id: string, userId: string): Promise<boolean> {
    this.init();
    const idx = this.tradeBorrowRequests.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error(`Trade/Borrow request not found: ${id}`);
    }

    const req = this.tradeBorrowRequests[idx];
    if (req.userId !== userId) {
      throw new Error('Unauthorized: only the request owner can delete request');
    }

    this.tradeBorrowRequests.splice(idx, 1);
    this.saveToStorage(STORAGE_KEYS.TRADE_BORROW, this.tradeBorrowRequests);
    return true;
  }
}
