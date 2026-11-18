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
  createProfile(profile: Omit<Profile, 'createdAt' | 'updatedAt'>): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>;

  // Listings
  getListings(options?: GetListingsOptions): Promise<Listing[]>;
  getListingById(id: string, viewerId?: string): Promise<Listing | null>;
  createListing(listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>): Promise<Listing>;
  updateListing(id: string, updates: Partial<Listing>, userId: string): Promise<Listing>;
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

  // Feedback
  createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback>;
}
