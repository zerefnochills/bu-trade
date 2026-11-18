// ============================================================================
// BU Trade — In-Memory & LocalStorage Mock Database Service
// Pre-seeded with realistic Bennett University campus listings,
// enforcing 10 active listing limit, contact redaction & enquiry unlocking.
// ============================================================================

import {
  ContactMethod,
  Enquiry,
  Feedback,
  GetListingsOptions,
  IDatabaseService,
  Listing,
  Profile,
  Report,
} from './types';

const STORAGE_KEYS = {
  PROFILES: 'bu_trade_mock_profiles',
  LISTINGS: 'bu_trade_mock_listings',
  ENQUIRIES: 'bu_trade_mock_enquiries',
  REPORTS: 'bu_trade_mock_reports',
  FEEDBACK: 'bu_trade_mock_feedback',
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

export class MockDatabaseService implements IDatabaseService {
  private profiles: Profile[] = [];
  private listings: Listing[] = [];
  private enquiries: Enquiry[] = [];
  private reports: Report[] = [];
  private feedback: Feedback[] = [];
  private isLoaded = false;

  constructor() {
    this.init();
  }

  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    if (!this.isClient()) return fallback;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    if (!this.isClient()) return;
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

      this.saveToStorage(STORAGE_KEYS.PROFILES, this.profiles);
      this.saveToStorage(STORAGE_KEYS.LISTINGS, this.listings);
      this.saveToStorage(STORAGE_KEYS.ENQUIRIES, this.enquiries);
      this.saveToStorage(STORAGE_KEYS.REPORTS, this.reports);
      this.saveToStorage(STORAGE_KEYS.FEEDBACK, this.feedback);
      this.isLoaded = true;
      return;
    }

    const storedProfiles = this.loadFromStorage<Profile[] | null>(STORAGE_KEYS.PROFILES, null);
    const storedListings = this.loadFromStorage<Listing[] | null>(STORAGE_KEYS.LISTINGS, null);

    if (storedProfiles && storedProfiles.length > 0) {
      this.profiles = storedProfiles;
    } else {
      this.profiles = [...SEED_PROFILES];
      this.saveToStorage(STORAGE_KEYS.PROFILES, this.profiles);
    }

    if (storedListings && storedListings.length > 0) {
      this.listings = storedListings;
    } else {
      this.listings = [...SEED_LISTINGS];
      this.saveToStorage(STORAGE_KEYS.LISTINGS, this.listings);
    }

    this.enquiries = this.loadFromStorage<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, []);
    this.reports = this.loadFromStorage<Report[]>(STORAGE_KEYS.REPORTS, []);
    this.feedback = this.loadFromStorage<Feedback[]>(STORAGE_KEYS.FEEDBACK, []);
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

  async createProfile(profileData: Omit<Profile, 'createdAt' | 'updatedAt'>): Promise<Profile> {
    this.init();
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

    // 10 active listings limit check
    if (listingData.status === 'active') {
      const activeCount = await this.countActiveListings(listingData.userId);
      if (activeCount >= 10) {
        throw new Error(
          'Active listing limit reached: Each student can have a maximum of 10 active listings.'
        );
      }
    }

    const now = new Date().toISOString();
    const id = `listing-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newListing: Listing = {
      ...listingData,
      id,
      images: listingData.images || [],
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
    if (current.userId !== userId && !caller?.isModerator) {
      throw new Error('Unauthorized: You can only edit your own listings.');
    }

    // If changing status to active, re-check 10 active listings cap
    if (updates.status === 'active' && current.status !== 'active') {
      const activeCount = await this.countActiveListings(current.userId);
      if (activeCount >= 10) {
        throw new Error(
          'Active listing limit reached: Each student can have a maximum of 10 active listings.'
        );
      }
    }

    const updated: Listing = {
      ...current,
      ...updates,
      id, // immutable
      userId: current.userId, // immutable owner
      updatedAt: new Date().toISOString(),
    };

    this.listings[index] = updated;
    this.saveToStorage(STORAGE_KEYS.LISTINGS, this.listings);

    return this.sanitizeListing(updated, userId);
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
}
