import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileDashboard from '@/app/profile/ProfileDashboard';
import ProfileError from '@/app/profile/error';
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

  it('renders empty listings state when initialListings is an empty array', () => {
    render(
      <ProfileDashboard
        profile={mockProfile}
        initialListings={[]}
      />
    );

    // Active listings counter shows 0 / 10 active
    expect(screen.getByText(/0 \/ 10 active/i)).toBeInTheDocument();

    // Active tab empty state message
    expect(screen.getByText(/No active listings found/i)).toBeInTheDocument();

    // Call-to-action link to post first listing
    const postLink = screen.getByRole('link', { name: /Post your first listing/i });
    expect(postLink).toBeInTheDocument();
    expect(postLink).toHaveAttribute('href', '/sell');

    // Switch to Sold tab and verify empty state
    fireEvent.click(screen.getByText('Sold Items'));
    expect(screen.getByText(/No sold listings found/i)).toBeInTheDocument();

    // Switch to Delisted tab and verify empty state
    fireEvent.click(screen.getByText('Delisted'));
    expect(screen.getByText(/No delisted listings found/i)).toBeInTheDocument();
  });

  it('handles undefined and null initialListings defensively without crashing', () => {
    // Should not throw when initialListings is undefined
    const { unmount: unmountUndefined } = render(
      <ProfileDashboard
        profile={mockProfile}
        initialListings={undefined as any}
      />
    );

    expect(screen.getByText(/0 \/ 10 active/i)).toBeInTheDocument();
    expect(screen.getByText(/No active listings found/i)).toBeInTheDocument();

    // Clean unmount between renders to prevent duplicate DOM nodes
    unmountUndefined();

    // Should not throw when initialListings is null
    const { unmount: unmountNull } = render(
      <ProfileDashboard
        profile={mockProfile}
        initialListings={null as any}
      />
    );

    expect(screen.getByText(/0 \/ 10 active/i)).toBeInTheDocument();
    expect(screen.getByText(/No active listings found/i)).toBeInTheDocument();

    unmountNull();
  });

  it('renders placeholder emoji when listing has empty or missing images', () => {
    const listingWithoutImages: Listing = {
      ...mockListings[0],
      id: 'l-no-img',
      title: 'Lab Notebook',
      images: [],
    };

    render(
      <ProfileDashboard
        profile={mockProfile}
        initialListings={[listingWithoutImages]}
      />
    );

    expect(screen.getByText('Lab Notebook')).toBeInTheDocument();
    // Placeholder emoji displayed
    expect(screen.getByText('🏷️')).toBeInTheDocument();
    // No img element rendered
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders image thumbnail when listing has valid images', () => {
    const listingWithImage: Listing = {
      ...mockListings[0],
      id: 'l-with-img',
      title: 'Scientific Calculator',
      images: ['https://images.example.com/calc.webp'],
    };

    render(
      <ProfileDashboard
        profile={mockProfile}
        initialListings={[listingWithImage]}
      />
    );

    const img = screen.getByRole('img', { name: /Scientific Calculator/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://images.example.com/calc.webp');
    expect(img).toHaveClass('object-cover');
  });

  it('formats prices correctly for free and priced listings including null and undefined price boundaries', () => {
    const freeListing: Listing = {
      ...mockListings[0],
      id: 'l-free',
      title: 'Workshop Handout',
      price: 0,
    };
    const nullPriceListing: Listing = {
      ...mockListings[0],
      id: 'l-null',
      title: 'Campus Map',
      price: null as any,
    };
    const undefinedPriceListing: Listing = {
      ...mockListings[0],
      id: 'l-undef',
      title: 'Sticker Pack',
      price: undefined as any,
    };
    const expensiveListing: Listing = {
      ...mockListings[0],
      id: 'l-exp',
      title: 'Cycle Hero Sprint',
      price: 4500,
    };

    render(
      <ProfileDashboard
        profile={mockProfile}
        initialListings={[freeListing, nullPriceListing, undefinedPriceListing, expensiveListing]}
      />
    );

    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('₹4,500')).toBeInTheDocument();
    expect(screen.queryByText(/NaN/i)).not.toBeInTheDocument();
    // Verify safe price formatting for null and undefined: either 'Free' or safe '₹0', never throwing or NaN
    const safePriceElements = screen.getAllByText(/^(Free|₹0)$/);
    expect(safePriceElements.length).toBe(3);
  });

  it('handles permanent listing deletion in Delisted tab with confirm dialog', async () => {
    (listingActions.deleteListingAction as jest.Mock).mockResolvedValue({
      success: true,
    });

    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm');

    render(
      <ProfileDashboard
        profile={mockProfile}
        initialListings={mockListings}
      />
    );

    // Switch to Delisted tab
    fireEvent.click(screen.getByText('Delisted'));
    expect(screen.getByText('Old Bedside Table')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: /Delete listing/i });

    // Case 1: User cancels confirm
    confirmSpy.mockReturnValueOnce(false);
    fireEvent.click(deleteBtn);
    expect(listingActions.deleteListingAction).not.toHaveBeenCalled();

    // Case 2: User confirms
    confirmSpy.mockReturnValueOnce(true);
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(listingActions.deleteListingAction).toHaveBeenCalledWith('l-del-1');
    });

    confirmSpy.mockRestore();
  });
});

describe('Profile Error Boundary Component (app/profile/error.tsx)', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('renders error title, error message, and retry button', () => {
    const mockReset = jest.fn();
    const testError = new Error('Database connection failed on profile fetch');

    render(<ProfileError error={testError} reset={mockReset} />);

    expect(screen.getByText(/Unable to Load Listings/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Database connection failed on profile fetch/i)
    ).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Try Again/i });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(mockReset).toHaveBeenCalledTimes(1);

    const homeLink = screen.getByRole('link', { name: /Campus Feed/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders fallback error message when error has no message', () => {
    const mockReset = jest.fn();
    const emptyError = {} as Error;

    render(<ProfileError error={emptyError} reset={mockReset} />);

    expect(screen.getByText(/Unable to Load Listings/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Something went wrong while loading your campus profile/i)
    ).toBeInTheDocument();
  });
});
