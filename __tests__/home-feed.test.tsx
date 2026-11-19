import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryChips, { CATEGORY_ITEMS } from '@/components/CategoryChips';
import SearchAndSort from '@/components/SearchAndSort';
import ListingCard from '@/components/ListingCard';
import HomeFeed from '@/components/HomeFeed';
import { Listing } from '@/lib/db/types';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

const mockListings: Listing[] = [
  {
    id: 'l1',
    userId: 'u1',
    title: 'Hero Sprint Cycle 21 Speed',
    price: 3500,
    category: 'Cycles & transport',
    age: '1 year',
    reason: 'Graduating',
    description: 'Good condition cycle, serviced last month',
    contactMethod: 'WhatsApp',
    status: 'active',
    images: ['https://example.com/cycle.jpg'],
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
    sellerName: 'Aarav Sharma',
    sellerCourse: 'B.Tech CSE',
    sellerYear: 4,
  },
  {
    id: 'l2',
    userId: 'u2',
    title: 'Data Structures in C++ Cormen',
    price: 450,
    category: 'Books & notes',
    age: '6 months',
    reason: 'Course completed',
    description: 'Annotated textbook with mid-sem notes',
    contactMethod: 'Phone',
    status: 'active',
    images: [],
    createdAt: '2026-11-10T10:00:00Z',
    updatedAt: '2026-11-10T10:00:00Z',
    sellerName: 'Mehak Verma',
    sellerCourse: 'B.Tech ECE',
    sellerYear: 2,
  },
  {
    id: 'l3',
    userId: 'u3',
    title: 'Electric Kettle Pigeon 1.5L',
    price: 600,
    category: 'Hostel essentials',
    age: '3 months',
    reason: 'Leaving hostel',
    description: 'Works perfectly for late night noodles',
    contactMethod: 'WhatsApp',
    status: 'active',
    images: [],
    createdAt: '2026-11-15T10:00:00Z',
    updatedAt: '2026-11-15T10:00:00Z',
    sellerName: 'Rohan Gupta',
    sellerCourse: 'B.Tech CSE',
    sellerYear: 3,
  },
  {
    id: 'l4',
    userId: 'u4',
    title: 'Free Engineering Graphics Drafter',
    price: 0,
    category: 'Stationery & lab gear',
    age: '2 years',
    reason: 'Donation',
    description: 'Mini drafter free giveaway for freshers',
    contactMethod: 'Email',
    status: 'active',
    images: [],
    createdAt: '2026-11-18T10:00:00Z',
    updatedAt: '2026-11-18T10:00:00Z',
    sellerName: 'Kabir Singh',
    sellerCourse: 'B.Tech ME',
    sellerYear: 4,
  },
];

describe('CategoryChips Component', () => {
  it('renders all 8 canonical categories plus All', () => {
    const onSelect = jest.fn();
    render(<CategoryChips selectedCategory="All" onSelectCategory={onSelect} />);

    expect(CATEGORY_ITEMS).toHaveLength(9);
    for (const item of CATEGORY_ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('triggers onSelectCategory callback on click', () => {
    const onSelect = jest.fn();
    render(<CategoryChips selectedCategory="All" onSelectCategory={onSelect} />);

    fireEvent.click(screen.getByText('Cycles & transport'));
    expect(onSelect).toHaveBeenCalledWith('Cycles & transport');
  });
});

describe('SearchAndSort Component', () => {
  it('renders search input, verified item count, and 3-way sort dropdown', () => {
    const onSearchChange = jest.fn();
    const onSortChange = jest.fn();

    render(
      <SearchAndSort
        searchQuery=""
        onSearchChange={onSearchChange}
        sortBy="newest"
        onSortChange={onSortChange}
        totalCount={4}
      />
    );

    expect(screen.getByPlaceholderText(/Filter by title/i)).toBeInTheDocument();
    expect(screen.getByText(/4/)).toBeInTheDocument();
    expect(screen.getByText(/verified items/i)).toBeInTheDocument();

    const select = screen.getByLabelText('Sort listings') as HTMLSelectElement;
    expect(select.value).toBe('newest');

    fireEvent.change(select, { target: { value: 'price_asc' } });
    expect(onSortChange).toHaveBeenCalledWith('price_asc');
  });
});

describe('ListingCard Component', () => {
  it('renders card linking to /item/${id} with price, title, category, and seller', () => {
    render(<ListingCard listing={mockListings[0]} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/item/l1');
    expect(screen.getByText('₹3,500')).toBeInTheDocument();
    expect(screen.getByText('Hero Sprint Cycle 21 Speed')).toBeInTheDocument();
    expect(screen.getByText(/Cycles & transport/i)).toBeInTheDocument();
    expect(screen.getByText(/B.Tech CSE · Y4/i)).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders "Free" label for price of 0 giveaway item', () => {
    render(<ListingCard listing={mockListings[3]} />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});

describe('HomeFeed Coordinator Component', () => {
  it('renders initial listings and educational steps', () => {
    render(<HomeFeed initialListings={mockListings} />);

    expect(screen.getByText('Hero Sprint Cycle 21 Speed')).toBeInTheDocument();
    expect(screen.getByText('Data Structures in C++ Cormen')).toBeInTheDocument();
    expect(screen.getByText('Electric Kettle Pigeon 1.5L')).toBeInTheDocument();
    expect(screen.getByText('Campus commerce in 3 simple steps')).toBeInTheDocument();
  });

  it('live filters listings by search query across title or description', () => {
    render(<HomeFeed initialListings={mockListings} />);

    const searchInputs = screen.getAllByPlaceholderText(/search/i);
    // Hero search input
    fireEvent.change(searchInputs[0], { target: { value: 'Kettle' } });

    expect(screen.getByText('Electric Kettle Pigeon 1.5L')).toBeInTheDocument();
    expect(screen.queryByText('Hero Sprint Cycle 21 Speed')).not.toBeInTheDocument();
    expect(screen.queryByText('Data Structures in C++ Cormen')).not.toBeInTheDocument();
  });

  it('filters listings when a category chip is clicked', () => {
    render(<HomeFeed initialListings={mockListings} />);

    fireEvent.click(screen.getByRole('tab', { name: /Books & notes/i }));

    expect(screen.getByText('Data Structures in C++ Cormen')).toBeInTheDocument();
    expect(screen.queryByText('Hero Sprint Cycle 21 Speed')).not.toBeInTheDocument();
    expect(screen.queryByText('Electric Kettle Pigeon 1.5L')).not.toBeInTheDocument();
  });

  it('sorts listings by price low to high', () => {
    render(<HomeFeed initialListings={mockListings} />);

    const select = screen.getByLabelText('Sort listings') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'price_asc' } });

    // Free item (₹0) should be first
    const headings = screen.getAllByRole('heading', { level: 3 });
    const titles = headings.map((h) => h.textContent);
    expect(titles[0]).toBe('Free Engineering Graphics Drafter');
  });

  it('renders empty state when query returns 0 matches and resets on Clear filters', () => {
    render(<HomeFeed initialListings={mockListings} />);

    const searchInputs = screen.getAllByPlaceholderText(/search/i);
    fireEvent.change(searchInputs[0], { target: { value: 'NonexistentItemXYZ' } });

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear filters/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Clear filters/i }));
    expect(screen.getByText('Hero Sprint Cycle 21 Speed')).toBeInTheDocument();
  });
});
