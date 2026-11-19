import React from 'react';
import { render, screen } from '@testing-library/react';
import ItemPage from '@/app/item/[id]/page';
import ImageGallery from '@/components/ImageGallery';
import { _setTestSession } from '@/lib/auth/session';
import { getDatabaseService } from '@/lib/db';
import { Listing } from '@/lib/db/types';

describe('Product Detail Page & Image Gallery', () => {
  let testListing: Listing;

  beforeAll(async () => {
    const db = getDatabaseService();
    testListing = await db.createListing({
      userId: 'seller-user-abc',
      title: 'Study Lamp with Warm LED',
      price: 450,
      category: 'Hostel essentials',
      age: '4 months',
      reason: 'Room rearrangement',
      description: 'Rechargeable LED desk lamp with 3 brightness modes.',
      contactMethod: 'WhatsApp',
      contactValue: '+91 9876500000',
      status: 'active',
      images: ['https://example.com/lamp1.webp', 'https://example.com/lamp2.webp'],
    });

    // Also create profile for the seller
    await db.createProfile({
      id: 'seller-user-abc',
      email: 'seller@bennett.edu.in',
      fullName: 'Aarav Mehta',
      course: 'B.Tech CSE',
      year: 3,
      residence: 'Hostel',
      whatsapp: '+91 9876500000',
    });
  });

  beforeEach(() => {
    _setTestSession(null);
  });

  it('renders ImageGallery with primary image and thumbnails for multiple photos', () => {
    render(
      <ImageGallery
        images={['https://example.com/img1.webp', 'https://example.com/img2.webp']}
        title="Sample Item"
        category="Hostel essentials"
      />
    );

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    const imgs = screen.getAllByRole('img');
    expect(imgs.length).toBeGreaterThanOrEqual(2);
  });

  it('renders category emoji fallback when no images provided', () => {
    render(<ImageGallery images={[]} title="Sample Item" category="Cycles & transport" />);

    expect(screen.getByText('🚲')).toBeInTheDocument();
    expect(screen.getByText('Cycles & transport')).toBeInTheDocument();
  });

  it('renders unauthenticated state where seller contact is completely hidden', async () => {
    _setTestSession(null);

    const PageJSX = await ItemPage({ params: { id: testListing.id } });
    render(PageJSX);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Study Lamp with Warm LED' })
    ).toBeInTheDocument();
    expect(screen.getByText('₹450')).toBeInTheDocument();
    expect(screen.getByText('4 months')).toBeInTheDocument();
    expect(screen.getByText('Room rearrangement')).toBeInTheDocument();

    // Contact is protected
    expect(screen.getByText(/Seller Contact Protected/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in to Enquire/i)).toBeInTheDocument();
    expect(screen.queryByText('+91 9876500000')).not.toBeInTheDocument();
  });

  it('renders owner view when logged in as the seller', async () => {
    _setTestSession({
      userId: 'seller-user-abc',
      id: 'seller-user-abc',
      email: 'seller@bennett.edu.in',
      onboardingNeeded: false,
      isOnboarded: true,
    });

    const PageJSX = await ItemPage({ params: { id: testListing.id } });
    render(PageJSX);

    expect(screen.getByText(/This is your listing/i)).toBeInTheDocument();
    expect(screen.getByText(/Edit Listing/i)).toBeInTheDocument();
    expect(screen.getByText(/\+91 9876500000/)).toBeInTheDocument();
  });

  it('renders enquiry CTA when logged in as a non-enquiring buyer', async () => {
    _setTestSession({
      userId: 'buyer-user-xyz',
      id: 'buyer-user-xyz',
      email: 'buyer@bennett.edu.in',
      onboardingNeeded: false,
      isOnboarded: true,
    });

    const PageJSX = await ItemPage({ params: { id: testListing.id } });
    render(PageJSX);

    expect(screen.getByText(/Contact details protected/i)).toBeInTheDocument();
    expect(screen.getByText(/Is this still available\?/i)).toBeInTheDocument();
    expect(screen.queryByText('+91 9876500000')).not.toBeInTheDocument();
  });

  it('renders unlocked contact details when buyer has already enquired', async () => {
    const db = getDatabaseService();
    await db.createEnquiry({
      listingId: testListing.id,
      buyerId: 'buyer-user-xyz',
      message: 'Hi, can I check it out today?',
    });

    _setTestSession({
      userId: 'buyer-user-xyz',
      id: 'buyer-user-xyz',
      email: 'buyer@bennett.edu.in',
      onboardingNeeded: false,
      isOnboarded: true,
    });

    const PageJSX = await ItemPage({ params: { id: testListing.id } });
    render(PageJSX);

    expect(screen.getByText(/Seller Contact Unlocked/i)).toBeInTheDocument();
    expect(screen.getByText('+91 9876500000')).toBeInTheDocument();
    expect(screen.getByText(/Connect via WhatsApp/i)).toBeInTheDocument();
  });
});
