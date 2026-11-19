// ============================================================================
// BU Trade — Canonical Database Types and Interfaces
// Conforming strictly to PROJECT.md § Interface Contracts
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  course: string;
  year: number; // 1 to 5
  residence: 'Hostel' | 'Day scholar';
  whatsapp?: string;
  isModerator?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ListingCategory =
  | 'Books & notes'
  | 'Electronics'
  | 'Cycles & transport'
  | 'Hostel essentials'
  | 'Furniture'
  | 'Clothing'
  | 'Stationery & lab gear'
  | 'Other';

export const CATEGORIES: readonly ListingCategory[] = [
  'Books & notes',
  'Electronics',
  'Cycles & transport',
  'Hostel essentials',
  'Furniture',
  'Clothing',
  'Stationery & lab gear',
  'Other',
] as const;

export type ListingStatus = 'active' | 'sold' | 'delisted';
export type ContactMethod = 'WhatsApp' | 'Phone' | 'Email';

export interface Listing {
  id: string;
  userId: string;
  title: string;
  price: number;
  category: ListingCategory;
  age: string;
  reason: string;
  description: string;
  contactMethod: ContactMethod;
  contactValue?: string; // REDACTED unless unlocked by enquiry or owner
  status: ListingStatus;
  images: string[];
  createdAt: string;
  updatedAt: string;
  // Join fields
  sellerName?: string;
  sellerCourse?: string;
  sellerYear?: number;
  hasUnlockedContact?: boolean;
}

export interface Enquiry {
  id: string;
  listingId: string;
  buyerId: string;
  message: string;
  createdAt: string;
}

export interface Report {
  id: string;
  listingId: string;
  reporterId: string;
  reason: string;
  details?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface Feedback {
  id: string;
  listingId?: string;
  userId: string;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: string;
}

export interface FeedbackPost {
  id: string;
  userId: string;
  itemTitle: string;
  content: string;
  rating?: number; // 1 to 5
  images: string[];
  listingId?: string;
  score: number;
  upvotesCount: number;
  downvotesCount: number;
  createdAt: string;
  updatedAt: string;
  // Joins
  authorName?: string;
  authorCourse?: string;
  authorYear?: number;
  userVote?: 1 | -1 | 0;
}

export interface FeedbackVote {
  id: string;
  feedbackId: string;
  userId: string;
  voteType: 1 | -1;
  createdAt: string;
}

export type BorrowTradeType = 'borrow' | 'trade';
export type BorrowTradeStatus = 'active' | 'fulfilled' | 'closed';

export interface TradeBorrowRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  requestType: BorrowTradeType;
  duration: string;
  category: ListingCategory;
  contactMethod: ContactMethod;
  contactValue: string;
  status: BorrowTradeStatus;
  images: string[];
  createdAt: string;
  updatedAt: string;
  // Joins
  requesterName?: string;
  requesterCourse?: string;
  requesterYear?: number;
}

export interface GetTradeBorrowOptions {
  type?: BorrowTradeType | 'all';
  category?: ListingCategory | 'All';
  search?: string;
  status?: BorrowTradeStatus;
  userId?: string;
}

export interface GetListingsOptions {
  category?: ListingCategory | 'All';
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  status?: ListingStatus;
  userId?: string;
  viewerId?: string;
}

export interface IDatabaseService {
  // Profiles
  getProfile(userId: string): Promise<Profile | null>;
  getProfileByEmail(email: string): Promise<Profile | null>;
  createProfile(profile: Omit<Profile, 'createdAt' | 'updatedAt'>): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>;

  // Listings
  getListings(options?: GetListingsOptions): Promise<Listing[]>;
  getListingById(id: string, viewerId?: string): Promise<Listing | null>;
  createListing(listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>): Promise<Listing>;
  updateListing(id: string, updates: Partial<Listing>, userId: string): Promise<Listing>;
  deleteListing(id: string, userId: string): Promise<boolean>;
  countActiveListings(userId: string): Promise<number>;

  // Enquiries
  createEnquiry(enquiry: Omit<Enquiry, 'id' | 'createdAt'>): Promise<Enquiry>;
  hasEnquired(listingId: string, buyerId: string): Promise<boolean>;
  getListingContact(
    listingId: string,
    viewerId: string
  ): Promise<{ contactMethod: ContactMethod; contactValue: string } | null>;

  // Reports
  createReport(report: Omit<Report, 'id' | 'status' | 'createdAt'>): Promise<Report>;
  getReports(): Promise<Report[]>;
  updateReportStatus(
    id: string,
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  ): Promise<Report>;

  // Feedback (Legacy)
  createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback>;

  // Feedback Posts & Reddit Voting (R3)
  getFeedbackPosts?(options?: {
    sort?: 'top' | 'newest';
    viewerId?: string;
  }): Promise<FeedbackPost[]>;
  getFeedbackPostById?(id: string, viewerId?: string): Promise<FeedbackPost | null>;
  createFeedbackPost?(
    post: Omit<
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
  ): Promise<FeedbackPost>;
  voteFeedbackPost?(
    feedbackId: string,
    userId: string,
    voteType: 1 | -1
  ): Promise<{
    score: number;
    userVote: 1 | -1 | 0;
    upvotesCount: number;
    downvotesCount: number;
  }>;

  // Trade / Borrow Requests (R4)
  getTradeBorrowRequests?(options?: GetTradeBorrowOptions): Promise<TradeBorrowRequest[]>;
  getTradeBorrowRequestById?(id: string): Promise<TradeBorrowRequest | null>;
  createTradeBorrowRequest?(
    request: Omit<
      TradeBorrowRequest,
      'id' | 'createdAt' | 'updatedAt' | 'requesterName' | 'requesterCourse' | 'requesterYear'
    >
  ): Promise<TradeBorrowRequest>;
  updateTradeBorrowRequestStatus?(
    id: string,
    status: BorrowTradeStatus,
    userId: string
  ): Promise<TradeBorrowRequest>;
  deleteTradeBorrowRequest?(id: string, userId: string): Promise<boolean>;
}
