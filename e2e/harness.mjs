/**
 * BU Trade — E2E Test Harness & Mock Database Service
 * 
 * Implements the opaque-box test harness, in-memory MockDatabaseService conforming
 * to the IDatabaseService interface contract from PROJECT.md, contact redaction,
 * active listing constraints, Bennett email domain validation, and test registry.
 */

import assert from 'node:assert/strict';

/**
 * Validates Bennett University student email domain strictly via regex.
 * Interface Contract: lib/auth/validation.ts -> isBennettEmail
 * Enforces /^[a-zA-Z0-9._%+-]+@bennett\.edu\.in$/i
 * 
 * @param {string} email 
 * @returns {boolean}
 */
export function isBennettEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[a-zA-Z0-9._%+-]+@bennett\.edu\.in$/i.test(email);
}

/**
 * Canonical 8 Marketplace Categories
 */
export const LISTING_CATEGORIES = [
  'Books & notes',
  'Electronics',
  'Cycles & transport',
  'Hostel essentials',
  'Furniture',
  'Clothing',
  'Stationery & lab gear',
  'Other'
];

/**
 * Category Normalizer to handle prototype variations
 */
export function normalizeCategory(cat) {
  if (!cat || typeof cat !== 'string') return 'Other';
  const clean = cat.trim().toLowerCase();
  const map = {
    'books & notes': 'Books & notes',
    'books & note': 'Books & notes',
    'electronics': 'Electronics',
    'cycles & transport': 'Cycles & transport',
    'hostel essentials': 'Hostel essentials',
    'furniture': 'Furniture',
    'clothing': 'Clothing',
    'stationery & lab gear': 'Stationery & lab gear',
    'stationery & lab': 'Stationery & lab gear',
    'other': 'Other'
  };
  return map[clean] || 'Other';
}

/**
 * Pre-seeded Profiles matching prototype listings
 */
export const SEED_PROFILES = [
  {
    id: 'user_seed_aarav',
    email: 'aarav.s@bennett.edu.in',
    fullName: 'Aarav S.',
    course: 'B.Tech CSE',
    year: 3,
    residence: 'Hostel',
    whatsapp: '9876543221',
    isModerator: false,
    createdAt: new Date(Date.now() - 30 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 864e5).toISOString()
  },
  {
    id: 'user_seed_mehak',
    email: 'mehak.k@bennett.edu.in',
    fullName: 'Mehak K.',
    course: 'B.Tech ECE',
    year: 2,
    residence: 'Hostel',
    whatsapp: '9876543242',
    isModerator: false,
    createdAt: new Date(Date.now() - 25 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 864e5).toISOString()
  },
  {
    id: 'user_seed_rohan',
    email: 'rohan.v@bennett.edu.in',
    fullName: 'Rohan V.',
    course: 'BBA',
    year: 2,
    residence: 'Day scholar',
    whatsapp: '9912345608',
    isModerator: false,
    createdAt: new Date(Date.now() - 20 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 864e5).toISOString()
  },
  {
    id: 'user_seed_ishita',
    email: 'ishita.m@bennett.edu.in',
    fullName: 'Ishita M.',
    course: 'B.Tech CSE',
    year: 4,
    residence: 'Hostel',
    whatsapp: '9612345630',
    isModerator: false,
    createdAt: new Date(Date.now() - 15 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 864e5).toISOString()
  },
  {
    id: 'user_seed_kabir',
    email: 'kabir.t@bennett.edu.in',
    fullName: 'Kabir T.',
    course: 'B.Des',
    year: 1,
    residence: 'Hostel',
    whatsapp: '9712345615',
    isModerator: false,
    createdAt: new Date(Date.now() - 10 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 864e5).toISOString()
  },
  {
    id: 'user_seed_ananya',
    email: 'ananya.r@bennett.edu.in',
    fullName: 'Ananya R.',
    course: 'B.Tech CSE',
    year: 2,
    residence: 'Hostel',
    whatsapp: '9812345677',
    isModerator: false,
    createdAt: new Date(Date.now() - 8 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 864e5).toISOString()
  }
];

/**
 * Pre-seeded Listings adapted from `BU Trade – Bennett University Campus Marketplace.html`
 */
export const SEED_LISTINGS = [
  {
    id: '1',
    userId: 'user_seed_aarav',
    title: 'Hero Sprint cycle, 21-speed',
    price: 3800,
    category: 'Cycles & transport',
    age: '2 years',
    reason: 'Graduating this semester',
    description: 'Gears serviced last month. Lock and bell included.',
    contactMethod: 'WhatsApp',
    contactValue: '9876543221',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 1 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 864e5).toISOString()
  },
  {
    id: '2',
    userId: 'user_seed_mehak',
    title: 'Casio fx-991EX calculator',
    price: 700,
    category: 'Stationery & lab gear',
    age: '1 year',
    reason: 'Upgraded to a graphing one',
    description: 'Works perfectly, cover included.',
    contactMethod: 'WhatsApp',
    contactValue: '9876543242',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 864e5).toISOString()
  },
  {
    id: '3',
    userId: 'user_seed_rohan',
    title: 'Study lamp and extension board',
    price: 450,
    category: 'Hostel essentials',
    age: '8 months',
    reason: 'Moving off campus',
    description: 'Both work fine.',
    contactMethod: 'Phone',
    contactValue: '9912345608',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 3 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 864e5).toISOString()
  },
  {
    id: '4',
    userId: 'user_seed_ishita',
    title: 'Dell Inspiron 15, 8GB/512GB',
    price: 28500,
    category: 'Electronics',
    age: '2.5 years',
    reason: 'Bought a new laptop',
    description: 'Battery lasts about 3 hours. Charger included.',
    contactMethod: 'Phone',
    contactValue: '9612345630',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 4 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 864e5).toISOString()
  },
  {
    id: '5',
    userId: 'user_seed_kabir',
    title: 'Folding study chair',
    price: 900,
    category: 'Furniture',
    age: '1 year',
    reason: 'Leaving the hostel',
    description: 'Sturdy, no damage.',
    contactMethod: 'WhatsApp',
    contactValue: '9712345615',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 6 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 864e5).toISOString()
  },
  {
    id: '6',
    userId: 'user_seed_ananya',
    title: 'Data Structures book bundle',
    price: 500,
    category: 'Books & notes',
    age: '1 year',
    reason: 'Course completed',
    description: '3 books plus handwritten notes.',
    contactMethod: 'WhatsApp',
    contactValue: '9812345677',
    status: 'active',
    images: [],
    createdAt: new Date(Date.now() - 7 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 864e5).toISOString()
  }
];

function matchesId(item, id) {
  if (!item || id === undefined || id === null) return false;
  const target = String(id).trim();
  const current = String(item.id).trim();
  return current === target ||
    `seed-listing-${current}` === target ||
    `item-${current}` === target;
}

/**
 * MockDatabaseService
 * In-memory implementation of IDatabaseService
 */
export class MockDatabaseService {
  constructor() {
    this.reset();
  }

  /**
   * Resets database state to pristine pre-seeded values.
   */
  reset() {
    this.profiles = structuredClone(SEED_PROFILES);
    this.rawListings = structuredClone(SEED_LISTINGS);
    this.enquiries = [];
    this.reports = [];
    this.feedback = [];
    this.activeSessions = new Map();
    this.pendingOtps = new Map();
  }

  /* -------------------------------------------------------------------------- */
  /*                            PROFILES IMPLEMENTATION                         */
  /* -------------------------------------------------------------------------- */

  async getProfile(userId) {
    if (!userId) return null;
    const target = String(userId).trim().toLowerCase();
    const profile = this.profiles.find(p =>
      p.id.toLowerCase() === target || p.email.toLowerCase() === target
    );
    return profile ? structuredClone(profile) : null;
  }

  async getProfileByEmail(email) {
    if (!email) return null;
    const target = String(email).trim().toLowerCase();
    const profile = this.profiles.find(p => p.email.toLowerCase() === target);
    return profile ? structuredClone(profile) : null;
  }

  async createProfile(profileData) {
    if (!profileData.id) throw new Error("id is required");
    if (!profileData.email) throw new Error("email is required");
    if (!profileData.fullName || !profileData.fullName.trim()) throw new Error("fullName is required");
    if (!profileData.course || !profileData.course.trim()) throw new Error("course is required");

    if (profileData.year !== undefined && (!Number.isInteger(profileData.year) || profileData.year < 1 || profileData.year > 5)) {
      throw new Error("Academic year must be an integer between 1 and 5");
    }
    if (profileData.residence !== undefined && !['Hostel', 'Day scholar'].includes(profileData.residence)) {
      throw new Error("Residence must be 'Hostel' or 'Day scholar'");
    }

    const existing = await this.getProfile(profileData.id);
    if (existing) {
      throw new Error(`Profile already exists for user: ${profileData.id}`);
    }

    const record = {
      id: profileData.id,
      email: profileData.email.toLowerCase().trim(),
      fullName: profileData.fullName.trim(),
      course: profileData.course.trim(),
      year: profileData.year ?? 1,
      residence: profileData.residence ?? 'Hostel',
      whatsapp: profileData.whatsapp ? profileData.whatsapp.trim() : undefined,
      isModerator: Boolean(profileData.isModerator),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.profiles.push(record);
    return structuredClone(record);
  }

  async updateProfile(userId, updates) {
    if (!userId) throw new Error("userId is required");
    const target = String(userId).trim().toLowerCase();
    const profile = this.profiles.find(p =>
      p.id.toLowerCase() === target || p.email.toLowerCase() === target
    );
    if (!profile) {
      throw new Error(`Profile not found: ${userId}`);
    }

    if (updates.year !== undefined && (!Number.isInteger(updates.year) || updates.year < 1 || updates.year > 5)) {
      throw new Error("Academic year must be an integer between 1 and 5");
    }
    if (updates.residence !== undefined && !['Hostel', 'Day scholar'].includes(updates.residence)) {
      throw new Error("Residence must be 'Hostel' or 'Day scholar'");
    }

    if (updates.fullName !== undefined) profile.fullName = updates.fullName.trim();
    if (updates.course !== undefined) profile.course = updates.course.trim();
    if (updates.year !== undefined) profile.year = updates.year;
    if (updates.residence !== undefined) profile.residence = updates.residence;
    if (updates.whatsapp !== undefined) profile.whatsapp = updates.whatsapp ? updates.whatsapp.trim() : undefined;
    if (updates.isModerator !== undefined) profile.isModerator = Boolean(updates.isModerator);
    profile.updatedAt = new Date().toISOString();

    return structuredClone(profile);
  }

  /* -------------------------------------------------------------------------- */
  /*                            LISTINGS IMPLEMENTATION                         */
  /* -------------------------------------------------------------------------- */

  async countActiveListings(userId) {
    if (!userId) return 0;
    const target = String(userId).trim();
    return this.rawListings.filter(l =>
      (l.userId === target || l.userId.toLowerCase() === target.toLowerCase()) &&
      l.status === 'active'
    ).length;
  }

  _sanitizeListing(rawListing, viewerId) {
    if (!rawListing) return null;
    const listing = structuredClone(rawListing);

    // Dynamic join: attach seller metadata from latest profile state
    const profile = this.profiles.find(p =>
      p.id === listing.userId || p.email.toLowerCase() === listing.userId.toLowerCase()
    );
    if (profile) {
      listing.sellerName = profile.fullName;
      listing.sellerCourse = profile.course;
      listing.sellerYear = profile.year;
    }

    // Contact redaction access check:
    // Unlocked ONLY if viewer is owner OR viewer has submitted an enquiry
    const isOwner = Boolean(
      viewerId && (
        listing.userId === viewerId ||
        listing.userId.toLowerCase() === String(viewerId).toLowerCase() ||
        (profile && profile.email.toLowerCase() === String(viewerId).toLowerCase())
      )
    );
    const hasEnquired = Boolean(viewerId && this._hasEnquiredSync(listing.id, viewerId));

    if (isOwner || hasEnquired) {
      listing.hasUnlockedContact = true;
      listing.contactValue = rawListing.contactValue;
    } else {
      listing.hasUnlockedContact = false;
      delete listing.contactValue;
    }

    return listing;
  }

  async getListings(options = {}) {
    let results = this.rawListings.map(l => structuredClone(l));

    // Filter by status
    if (options.status) {
      if (options.status !== 'all') {
        results = results.filter(l => l.status === options.status);
      }
    } else if (!options.userId) {
      // Default: active listings for public feed
      results = results.filter(l => l.status === 'active');
    }

    // Filter by userId
    if (options.userId) {
      const uid = String(options.userId).trim().toLowerCase();
      results = results.filter(l => l.userId.toLowerCase() === uid);
    }

    // Filter by category
    if (options.category && options.category !== 'All') {
      const targetCat = normalizeCategory(options.category).toLowerCase();
      results = results.filter(l => normalizeCategory(l.category).toLowerCase() === targetCat);
    }

    // Filter by search query
    if (options.search) {
      const q = String(options.search).trim().toLowerCase();
      if (q.length > 0) {
        results = results.filter(l => {
          const t = `${l.title} ${l.description || ''} ${l.category}`.toLowerCase();
          return t.includes(q);
        });
      }
    }

    // Sorting
    if (options.sort === 'price_asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (options.sort === 'price_desc') {
      results.sort((a, b) => b.price - a.price);
    } else {
      // 'newest' default
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return results.map(l => this._sanitizeListing(l, options.viewerId));
  }

  async getListingById(id, viewerId) {
    const raw = this.rawListings.find(l => matchesId(l, id));
    if (!raw) return null;
    return this._sanitizeListing(raw, viewerId);
  }

  async createListing(listingData) {
    if (!listingData.userId) throw new Error("userId is required");
    if (!listingData.title || typeof listingData.title !== 'string' || !listingData.title.trim()) {
      throw new Error("Title is required and cannot be empty");
    }
    if (listingData.price !== undefined && listingData.price < 0) {
      throw new Error("Price cannot be negative");
    }

    const status = listingData.status || 'active';
    if (status === 'active') {
      const activeCount = await this.countActiveListings(listingData.userId);
      if (activeCount >= 10) {
        throw new Error("Active listing limit of 10 reached");
      }
    }

    const id = `listing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const images = Array.isArray(listingData.images) ? listingData.images.slice(0, 5) : [];

    const raw = {
      id,
      userId: listingData.userId,
      title: listingData.title.trim(),
      price: Number(listingData.price) || 0,
      category: normalizeCategory(listingData.category),
      age: listingData.age ? String(listingData.age).trim() : '',
      reason: listingData.reason ? String(listingData.reason).trim() : '',
      description: listingData.description ? String(listingData.description).trim() : '',
      contactMethod: listingData.contactMethod || 'WhatsApp',
      contactValue: listingData.contactValue ? String(listingData.contactValue).trim() : '',
      status,
      images,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.rawListings.push(raw);
    return this._sanitizeListing(raw, listingData.userId);
  }

  async updateListing(id, updates, userId) {
    if (!userId) throw new Error("userId is required");
    const raw = this.rawListings.find(l => matchesId(l, id));
    if (!raw) {
      throw new Error(`Listing not found: ${id}`);
    }
    if (raw.userId !== userId && raw.userId.toLowerCase() !== String(userId).toLowerCase()) {
      throw new Error("Unauthorized: Only the listing owner can update this listing");
    }
    if (updates.price !== undefined && updates.price < 0) {
      throw new Error("Price cannot be negative");
    }
    if (updates.title !== undefined && (typeof updates.title !== 'string' || !updates.title.trim())) {
      throw new Error("Title is required and cannot be empty");
    }

    if (updates.status === 'active' && raw.status !== 'active') {
      const activeCount = await this.countActiveListings(userId);
      if (activeCount >= 10) {
        throw new Error("Active listing limit of 10 reached");
      }
    }

    if (updates.title !== undefined) raw.title = updates.title.trim();
    if (updates.price !== undefined) raw.price = Number(updates.price);
    if (updates.category !== undefined) raw.category = normalizeCategory(updates.category);
    if (updates.age !== undefined) raw.age = String(updates.age).trim();
    if (updates.reason !== undefined) raw.reason = String(updates.reason).trim();
    if (updates.description !== undefined) raw.description = String(updates.description).trim();
    if (updates.contactMethod !== undefined) raw.contactMethod = updates.contactMethod;
    if (updates.contactValue !== undefined) raw.contactValue = String(updates.contactValue).trim();
    if (updates.status !== undefined) raw.status = updates.status;
    if (updates.images !== undefined) {
      raw.images = Array.isArray(updates.images) ? updates.images.slice(0, 5) : [];
    }
    raw.updatedAt = new Date().toISOString();

    return this._sanitizeListing(raw, userId);
  }

  async deleteListing(id, userId) {
    const index = this.rawListings.findIndex(l => matchesId(l, id));
    if (index === -1) throw new Error(`Listing not found: ${id}`);
    const listing = this.rawListings[index];
    if (listing.userId !== userId && listing.userId.toLowerCase() !== String(userId).toLowerCase()) {
      throw new Error("Unauthorized: Only the listing owner can delete this listing");
    }
    this.rawListings.splice(index, 1);
    return true;
  }

  /* -------------------------------------------------------------------------- */
  /*                            ENQUIRIES IMPLEMENTATION                        */
  /* -------------------------------------------------------------------------- */

  _hasEnquiredSync(listingId, buyerId) {
    if (!listingId || !buyerId) return false;
    const bid = String(buyerId).trim().toLowerCase();
    return this.enquiries.some(e =>
      matchesId({ id: e.listingId }, listingId) &&
      e.buyerId.toLowerCase() === bid
    );
  }

  async hasEnquired(listingId, buyerId) {
    return this._hasEnquiredSync(listingId, buyerId);
  }

  async createEnquiry(enquiry) {
    if (!enquiry.listingId) throw new Error("listingId is required");
    if (!enquiry.buyerId) throw new Error("buyerId is required");

    const listing = this.rawListings.find(l => matchesId(l, enquiry.listingId));
    if (!listing) {
      throw new Error(`Listing not found: ${enquiry.listingId}`);
    }

    const id = `enquiry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record = {
      id,
      listingId: String(listing.id),
      buyerId: enquiry.buyerId,
      message: enquiry.message ? String(enquiry.message).trim() : "Hi, is this still available?",
      createdAt: new Date().toISOString()
    };

    this.enquiries.push(record);
    return structuredClone(record);
  }

  async getListingContact(listingId, viewerId) {
    if (!viewerId) return null;
    const listing = this.rawListings.find(l => matchesId(l, listingId));
    if (!listing) return null;

    const isOwner = listing.userId === viewerId || listing.userId.toLowerCase() === String(viewerId).toLowerCase();
    const hasEnquired = this._hasEnquiredSync(listing.id, viewerId);

    if (isOwner || hasEnquired) {
      return {
        contactMethod: listing.contactMethod,
        contactValue: listing.contactValue
      };
    }
    return null;
  }

  /* -------------------------------------------------------------------------- */
  /*                            REPORTS IMPLEMENTATION                          */
  /* -------------------------------------------------------------------------- */

  async createReport(report) {
    if (!report.reason || typeof report.reason !== 'string' || !report.reason.trim()) {
      throw new Error("Report reason is required");
    }
    const listing = this.rawListings.find(l => matchesId(l, report.listingId));
    if (!listing) {
      throw new Error(`Listing not found: ${report.listingId}`);
    }

    const id = `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record = {
      id,
      listingId: String(listing.id),
      reporterId: report.reporterId,
      reason: report.reason.trim(),
      details: report.details ? String(report.details).trim() : "",
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.reports.push(record);
    return structuredClone(record);
  }

  async getReports() {
    return structuredClone(this.reports);
  }

  async updateReportStatus(reportId, status) {
    const validStatuses = ['pending', 'investigating', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid report status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const report = this.reports.find(r => r.id === reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    report.status = status;
    if (status === 'resolved') {
      const listing = this.rawListings.find(l => matchesId(l, report.listingId));
      if (listing) {
        listing.status = 'delisted';
        listing.updatedAt = new Date().toISOString();
      }
    }

    return structuredClone(report);
  }

  /* -------------------------------------------------------------------------- */
  /*                            FEEDBACK IMPLEMENTATION                         */
  /* -------------------------------------------------------------------------- */

  async createFeedback(feedback) {
    if (!feedback.userId) throw new Error("userId is required");
    if (!Number.isInteger(feedback.rating) || feedback.rating < 1 || feedback.rating > 5) {
      throw new Error("Rating must be an integer between 1 and 5");
    }

    const id = `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record = {
      id,
      listingId: feedback.listingId ? String(feedback.listingId) : undefined,
      userId: feedback.userId,
      rating: feedback.rating,
      comment: feedback.comment ? String(feedback.comment).trim() : "",
      createdAt: new Date().toISOString()
    };

    this.feedback.push(record);
    return structuredClone(record);
  }

  /* -------------------------------------------------------------------------- */
  /*                            AUTH SIMULATION HELPERS                         */
  /* -------------------------------------------------------------------------- */

  async requestOTP(email) {
    if (!isBennettEmail(email)) {
      throw new Error("Only @bennett.edu.in emails permitted");
    }
    const normalized = email.toLowerCase().trim();
    const otp = "123456";
    this.pendingOtps.set(normalized, otp);
    return { success: true, email: normalized, message: "OTP sent" };
  }

  async verifyOTP(email, code) {
    const normalized = (email || '').toLowerCase().trim();
    if (!isBennettEmail(normalized)) {
      throw new Error("Only @bennett.edu.in emails permitted");
    }

    const storedOtp = this.pendingOtps.get(normalized) || "123456";
    if (code !== storedOtp && code !== "123456") {
      throw new Error("Invalid OTP code");
    }
    this.pendingOtps.delete(normalized);

    const profile = await this.getProfileByEmail(normalized);
    const userId = profile ? profile.id : `user_${normalized.split('@')[0]}_${Date.now()}`;
    const token = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const session = {
      userId,
      email: normalized,
      token,
      onboardingNeeded: !profile,
      createdAt: new Date().toISOString()
    };

    this.activeSessions.set(token, session);
    return session;
  }

  async getSession(token) {
    return this.activeSessions.get(token) || null;
  }

  async signOut(token) {
    this.activeSessions.delete(token);
    return { success: true };
  }
}

/**
 * E2EHarness
 * Orchestrating facade for zero-cloud E2E testing
 */
export class E2EHarness {
  constructor() {
    this.db = new MockDatabaseService();
  }

  reset() {
    this.db.reset();
  }

  isBennettEmail(email) {
    return isBennettEmail(email);
  }

  // Database Proxy Methods
  getProfile(userId) { return this.db.getProfile(userId); }
  getProfileByEmail(email) { return this.db.getProfileByEmail(email); }
  createProfile(profile) { return this.db.createProfile(profile); }
  updateProfile(userId, updates) { return this.db.updateProfile(userId, updates); }

  getListings(options) { return this.db.getListings(options); }
  getListingById(id, viewerId) { return this.db.getListingById(id, viewerId); }
  createListing(listing) { return this.db.createListing(listing); }
  updateListing(id, updates, userId) { return this.db.updateListing(id, updates, userId); }
  deleteListing(id, userId) { return this.db.deleteListing(id, userId); }
  countActiveListings(userId) { return this.db.countActiveListings(userId); }

  createEnquiry(enquiry) { return this.db.createEnquiry(enquiry); }
  hasEnquired(listingId, buyerId) { return this.db.hasEnquired(listingId, buyerId); }
  getListingContact(listingId, viewerId) { return this.db.getListingContact(listingId, viewerId); }

  createReport(report) { return this.db.createReport(report); }
  getReports() { return this.db.getReports(); }
  updateReportStatus(reportId, status) { return this.db.updateReportStatus(reportId, status); }

  createFeedback(feedback) { return this.db.createFeedback(feedback); }

  requestOTP(email) { return this.db.requestOTP(email); }
  verifyOTP(email, code) { return this.db.verifyOTP(email, code); }
  getSession(token) { return this.db.getSession(token); }
  signOut(token) { return this.db.signOut(token); }
}

/**
 * Test Registry
 * Backed by globalThis to guarantee single-instance registry across ESM and loader boundaries.
 */
if (!globalThis.__bu_trade_test_registry__) {
  globalThis.__bu_trade_test_registry__ = [];
}
const testRegistry = globalThis.__bu_trade_test_registry__;

/**
 * Registers an E2E test case.
 * 
 * @param {string} tier - e.g. "Tier 1", "Tier 2", "Tier 3", "Tier 4"
 * @param {string} id - e.g. "T1.01.1", "T2.01.1", "T3.01", "T4.01"
 * @param {string} name - Human readable description of the test
 * @param {Function} fn - async (harness) => { ... assertions ... }
 */
export function registerTest(tier, id, name, fn) {
  testRegistry.push({ tier, id, name, fn });
}

export function getRegisteredTests() {
  return [...testRegistry];
}

export function clearRegisteredTests() {
  testRegistry.length = 0;
}
