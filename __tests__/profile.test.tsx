import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileDashboard from '@/app/profile/ProfileDashboard';
import { Listing, Profile } from '@/lib/db/types';
import * as listingActions from '@/app/actions/listings';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('@/app/actions/listings', () => ({
  changeListingStatusAction: jest.fn(),
  deleteListingAction: jest.fn(),
}));

const mockProfile: Profile = {
  id: 'student-prof-1',
  email: 'student@bennett.edu.in',
  fullName: 'Ananya Roy',
  course: 'B.Tech Biotech',
  year: 3,
  residence: 'Hostel',
  whatsapp: '+91 9988776655',
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
};

const mockListings: Listing[] = [
  {
    id: 'l-act-1',
    userId: 'student-prof-1',
    title: 'Lab Coat & Safety Goggles',
    price: 350,
    category: 'Stationery & lab gear',
    age: '1 semester',
    reason: 'Lab completed',
    description: 'Standard size M white lab coat',
    contactMethod: 'WhatsApp',
    contactValue: '+91 9988776655',
    status: 'active',
    images: [],
    createdAt: '2026-11-10T10:00:00Z',
    updatedAt: '2026-11-10T10:00:00Z',
  },
  {
    id: 'l-sold-1',
    userId: 'student-prof-1',
    title: 'Microbiology Textbook',
    price: 500,
    category: 'Books & notes',
    age: '1 year',
    reason: 'Finished course',
    description: 'Pelczar microbiology book',
    contactMethod: 'Phone',
    contactValue: '9988776655',
    status: 'sold',
    images: [],
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-05T10:00:00Z',
  },
  {
    id: 'l-del-1',
    userId: 'student-prof-1',
    title: 'Old Bedside Table',
    price: 200,
    category: 'Furniture',
    age: '2 years',
    reason: 'Upgrading',
    description: 'Wooden side table',
    contactMethod: 'Email',
    contactValue: 'student@bennett.edu.in',
    status: 'delisted',
    images: [],
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-25T10:00:00Z',
  },
];

describe('Profile Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders active listings cap counter and status tabs', () => {
    render(
      <ProfileDashboard
        profile={mockProfile}
        initialListings={mockListings}
      />
    );

    expect(screen.getByText(/1 \/ 10 active/i)).toBeInTheDocument();
    expect(screen.getByText('Lab Coat & Safety Goggles')).toBeInTheDocument();
    expect(screen.getByText('Active Listings')).toBeInTheDocument();
    expect(screen.getByText('Sold Items')).toBeInTheDocument();
    expect(screen.getByText('Delisted')).toBeInTheDocument();
  });

  it('switches between Active, Sold, and Delisted tabs', () => {
    render(
      <ProfileDashboard
        profile={mockProfile}
        initialListings={mockListings}
      />
    );

    // Initial Active tab
    expect(screen.getByText('Lab Coat & Safety Goggles')).toBeInTheDocument();
    expect(screen.queryByText('Microbiology Textbook')).not.toBeInTheDocument();

    // Click Sold tab
    fireEvent.click(screen.getByText('Sold Items'));
    expect(screen.getByText('Microbiology Textbook')).toBeInTheDocument();
    expect(screen.queryByText('Lab Coat & Safety Goggles')).not.toBeInTheDocument();

    // Click Delisted tab
    fireEvent.click(screen.getByText('Delisted'));
    expect(screen.getByText('Old Bedside Table')).toBeInTheDocument();
    expect(screen.queryByText('Microbiology Textbook')).not.toBeInTheDocument();
  });

  it('calls changeListingStatusAction when Mark Sold is clicked', async () => {
    (listingActions.changeListingStatusAction as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(
      <ProfileDashboard
        profile={mockProfile}
        initialListings={mockListings}
      />
    );

    const markSoldBtn = screen.getByRole('button', { name: /Mark Sold/i });
    fireEvent.click(markSoldBtn);

    await waitFor(() => {
      expect(listingActions.changeListingStatusAction).toHaveBeenCalledWith(
        'l-act-1',
        'sold'
      );
    });
  });

  it('calls changeListingStatusAction when Relist is clicked from Sold tab', async () => {
    (listingActions.changeListingStatusAction as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(
      <ProfileDashboard
        profile={mockProfile}
        initialListings={mockListings}
      />
    );

    // Switch to Sold
    fireEvent.click(screen.getByText('Sold Items'));

    const relistBtn = screen.getByRole('button', { name: /Relist/i });
    fireEvent.click(relistBtn);

    await waitFor(() => {
      expect(listingActions.changeListingStatusAction).toHaveBeenCalledWith(
        'l-sold-1',
        'active'
      );
    });
  });

  it('shows cap reached alert when activeCount is 10', () => {
    const tenActiveListings: Listing[] = Array.from({ length: 10 }, (_, i) => ({
      id: `item-${i + 1}`,
      userId: 'student-prof-1',
      title: `Active Item ${i + 1}`,
      price: 100,
      category: 'Other',
      age: '1 year',
      reason: 'Selling',
      contactMethod: 'WhatsApp',
      status: 'active',
      images: [],
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
    }));

    render(
      <ProfileDashboard
        profile={mockProfile}
        initialListings={tenActiveListings}
      />
    );

    expect(screen.getByText(/10 \/ 10 active/i)).toBeInTheDocument();
    expect(screen.getByText(/Cap reached \(10\/10\)/i)).toBeInTheDocument();
  });
});
