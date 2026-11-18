// ============================================================================
// BU Trade — Supabase PostgreSQL Database Service Implementation
// Conforms to IDatabaseService, mapping snake_case SQL to camelCase TypeScript
// and utilizing RLS + Security Definer RPC for protected contact retrieval.
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

export class SupabaseDatabaseService implements IDatabaseService {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    if (client) {
      this.client = client;
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      this.client = createClient(supabaseUrl, supabaseAnonKey);
    }
  }

  // ==========================================================================
  // Profiles
  // ==========================================================================
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      course: data.course,
      year: data.year,
      residence: data.residence,
      whatsapp: data.whatsapp || undefined,
      isModerator: data.is_moderator,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getProfileByEmail(email: string): Promise<Profile | null> {
    if (!email || typeof email !== 'string') return null;
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      course: data.course,
      year: data.year,
      residence: data.residence,
      whatsapp: data.whatsapp || undefined,
      isModerator: data.is_moderator,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async createProfile(profileData: Omit<Profile, 'createdAt' | 'updatedAt'>): Promise<Profile> {
    const { data, error } = await this.client
      .from('profiles')
      .insert({
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.fullName,
        course: profileData.course,
        year: profileData.year,
        residence: profileData.residence,
        whatsapp: profileData.whatsapp || null,
        is_moderator: profileData.isModerator || false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      course: data.course,
      year: data.year,
      residence: data.residence,
      whatsapp: data.whatsapp || undefined,
      isModerator: data.is_moderator,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const payload: Record<string, unknown> = {};
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.course !== undefined) payload.course = updates.course;
    if (updates.year !== undefined) payload.year = updates.year;
    if (updates.residence !== undefined) payload.residence = updates.residence;
    if (updates.whatsapp !== undefined) payload.whatsapp = updates.whatsapp;
    if (updates.isModerator !== undefined) payload.is_moderator = updates.isModerator;

    const { data, error } = await this.client
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      course: data.course,
      year: data.year,
      residence: data.residence,
      whatsapp: data.whatsapp || undefined,
      isModerator: data.is_moderator,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  // ==========================================================================
  // Listings
  // ==========================================================================
  async countActiveListings(userId: string): Promise<number> {
    const { count, error } = await this.client
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      throw new Error(`Failed to count active listings: ${error.message}`);
    }

    return count || 0;
  }

  async getListings(options: GetListingsOptions = {}): Promise<Listing[]> {
    let query = this.client
      .from('listings')
      .select(`
        *,
        profiles:user_id (
          full_name,
          course,
          year
        )
      `);

    if (options.status) {
      query = query.eq('status', options.status);
    } else if (!options.userId) {
      query = query.eq('status', 'active');
    }

    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options.category && options.category !== 'All') {
      query = query.eq('category', options.category);
    }

    if (options.search && options.search.trim() !== '') {
      const q = options.search.trim();
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);
    }

    if (options.sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (options.sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch listings: ${error.message}`);
    }

    // Fetch unlocked listing IDs for viewer if viewerId is supplied
    const unlockedListingIds = new Set<string>();
    if (options.viewerId) {
      const { data: enqData } = await this.client
        .from('enquiries')
        .select('listing_id')
        .eq('buyer_id', options.viewerId);

      if (enqData) {
        enqData.forEach((e: { listing_id: string }) => unlockedListingIds.add(e.listing_id));
      }
    }

    return (data || []).map((row: any) => {
      const isOwner = options.viewerId && row.user_id === options.viewerId;
      const hasEnquired = options.viewerId && unlockedListingIds.has(row.id);
      const hasUnlocked = Boolean(isOwner || hasEnquired);

      const listing: Listing = {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        price: Number(row.price),
        category: row.category,
        age: row.age,
        reason: row.reason,
        description: row.description,
        contactMethod: row.contact_method,
        status: row.status,
        images: row.images || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        sellerName: row.profiles?.full_name,
        sellerCourse: row.profiles?.course,
        sellerYear: row.profiles?.year,
        hasUnlockedContact: hasUnlocked,
      };

      if (hasUnlocked) {
        listing.contactValue = row.contact_value;
      }

      return listing;
    });
  }

  async getListingById(id: string, viewerId?: string): Promise<Listing | null> {
    const { data, error } = await this.client
      .from('listings')
      .select(`
        *,
        profiles:user_id (
          full_name,
          course,
          year
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    let hasUnlocked = false;
    if (viewerId) {
      if (viewerId === data.user_id) {
        hasUnlocked = true;
      } else {
        const { data: enq } = await this.client
          .from('enquiries')
          .select('id')
          .eq('listing_id', id)
          .eq('buyer_id', viewerId)
          .maybeSingle();
        hasUnlocked = Boolean(enq);
      }
    }

    const listing: Listing = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      price: Number(data.price),
      category: data.category,
      age: data.age,
      reason: data.reason,
      description: data.description,
      contactMethod: data.contact_method,
      status: data.status,
      images: data.images || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      sellerName: data.profiles?.full_name,
      sellerCourse: data.profiles?.course,
      sellerYear: data.profiles?.year,
      hasUnlockedContact: hasUnlocked,
    };

    if (hasUnlocked) {
      listing.contactValue = data.contact_value;
    }

    return listing;
  }

  async createListing(
    listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Listing> {
    const { data, error } = await this.client
      .from('listings')
      .insert({
        user_id: listingData.userId,
        title: listingData.title,
        price: listingData.price,
        category: listingData.category,
        age: listingData.age,
        reason: listingData.reason,
        description: listingData.description || '',
        contact_method: listingData.contactMethod,
        contact_value: listingData.contactValue || '',
        status: listingData.status || 'active',
        images: listingData.images || [],
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23514' || error.message.includes('Active listing limit reached')) {
        throw new Error(
          'Active listing limit reached: Each student can have a maximum of 10 active listings.'
        );
      }
      throw new Error(`Failed to create listing: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      price: Number(data.price),
      category: data.category,
      age: data.age,
      reason: data.reason,
      description: data.description,
      contactMethod: data.contact_method,
      contactValue: data.contact_value,
      status: data.status,
      images: data.images || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      hasUnlockedContact: true,
    };
  }

  async updateListing(
    id: string,
    updates: Partial<Listing>,
    userId: string
  ): Promise<Listing> {
    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.age !== undefined) payload.age = updates.age;
    if (updates.reason !== undefined) payload.reason = updates.reason;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.contactMethod !== undefined) payload.contact_method = updates.contactMethod;
    if (updates.contactValue !== undefined) payload.contact_value = updates.contactValue;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.images !== undefined) payload.images = updates.images;

    const { data, error } = await this.client
      .from('listings')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === '23514' || error.message.includes('Active listing limit reached')) {
        throw new Error(
          'Active listing limit reached: Each student can have a maximum of 10 active listings.'
        );
      }
      throw new Error(`Failed to update listing: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      price: Number(data.price),
      category: data.category,
      age: data.age,
      reason: data.reason,
      description: data.description,
      contactMethod: data.contact_method,
      contactValue: data.contact_value,
      status: data.status,
      images: data.images || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      hasUnlockedContact: true,
    };
  }

  async deleteListing(id: string, userId: string): Promise<boolean> {
    const { data: listing, error: fetchError } = await this.client
      .from('listings')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !listing) {
      throw new Error(`Listing not found: ${id}`);
    }

    if (listing.user_id !== userId) {
      const { data: profile } = await this.client
        .from('profiles')
        .select('is_moderator')
        .eq('id', userId)
        .maybeSingle();

      if (!profile?.is_moderator) {
        throw new Error('Unauthorized: Only the listing owner can delete this listing');
      }
    }

    const { error: deleteError } = await this.client
      .from('listings')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Failed to delete listing: ${deleteError.message}`);
    }

    return true;
  }

  // ==========================================================================
  // Enquiries & Protected Contact RPC
  // ==========================================================================
  async hasEnquired(listingId: string, buyerId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('enquiries')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_id', buyerId)
      .maybeSingle();

    if (error || !data) return false;
    return true;
  }

  async createEnquiry(enquiryData: Omit<Enquiry, 'id' | 'createdAt'>): Promise<Enquiry> {
    const { data, error } = await this.client
      .from('enquiries')
      .insert({
        listing_id: enquiryData.listingId,
        buyer_id: enquiryData.buyerId,
        message: enquiryData.message,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create enquiry: ${error.message}`);
    }

    return {
      id: data.id,
      listingId: data.listing_id,
      buyerId: data.buyer_id,
      message: data.message,
      createdAt: data.created_at,
    };
  }

  async getListingContact(
    listingId: string,
    viewerId: string
  ): Promise<{ contactMethod: ContactMethod; contactValue: string } | null> {
    if (!viewerId) {
      throw new Error('Authentication required to view contact details.');
    }

    // Call the Security Definer RPC function
    const { data, error } = await this.client.rpc('get_protected_listing_contact', {
      target_listing_id: listingId,
    });

    if (error) {
      throw new Error(`Failed to retrieve contact details: ${error.message}`);
    }

    if (!data || data.length === 0) return null;

    return {
      contactMethod: data[0].contact_method as ContactMethod,
      contactValue: data[0].contact_value,
    };
  }

  // ==========================================================================
  // Reports
  // ==========================================================================
  async createReport(reportData: Omit<Report, 'id' | 'status' | 'createdAt'>): Promise<Report> {
    const { data, error } = await this.client
      .from('reports')
      .insert({
        listing_id: reportData.listingId,
        reporter_id: reportData.reporterId,
        reason: reportData.reason,
        details: reportData.details || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create report: ${error.message}`);
    }

    return {
      id: data.id,
      listingId: data.listing_id,
      reporterId: data.reporter_id,
      reason: data.reason,
      details: data.details || undefined,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  async getReports(): Promise<Report[]> {
    const { data, error } = await this.client
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      listingId: row.listing_id,
      reporterId: row.reporter_id,
      reason: row.reason,
      details: row.details || undefined,
      status: row.status,
      createdAt: row.created_at,
    }));
  }

  async updateReportStatus(
    id: string,
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  ): Promise<Report> {
    const validStatuses: ('pending' | 'investigating' | 'resolved' | 'dismissed')[] = [
      'pending',
      'investigating',
      'resolved',
      'dismissed',
    ];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid report status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const { data, error } = await this.client
      .from('reports')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update report status: ${error?.message || 'Report not found'}`);
    }

    if (status === 'resolved') {
      await this.client
        .from('listings')
        .update({ status: 'delisted' })
        .eq('id', data.listing_id);
    }

    return {
      id: data.id,
      listingId: data.listing_id,
      reporterId: data.reporter_id,
      reason: data.reason,
      details: data.details || undefined,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  // ==========================================================================
  // Feedback
  // ==========================================================================
  async createFeedback(feedbackData: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
    const { data, error } = await this.client
      .from('feedback')
      .insert({
        listing_id: feedbackData.listingId || null,
        user_id: feedbackData.userId,
        rating: feedbackData.rating,
        comment: feedbackData.comment || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create feedback: ${error.message}`);
    }

    return {
      id: data.id,
      listingId: data.listing_id || undefined,
      userId: data.user_id,
      rating: data.rating,
      comment: data.comment || undefined,
      createdAt: data.created_at,
    };
  }
}
