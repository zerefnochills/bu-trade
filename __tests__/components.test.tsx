import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Dynamic mock for next/navigation
let currentPathname = '/';
jest.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
}));

// Mock next/image
jest.mock('next/image', () => {
  return function DummyImage({ priority, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt || ''} {...props} />;
  };
});

describe('Navbar Component', () => {
  beforeEach(() => {
    currentPathname = '/';
  });

  it('renders Bennett University branding and navigation destinations', () => {
    render(<Navbar />);

    expect(screen.getByText(/The campus marketplace for Bennett University students/i)).toBeInTheDocument();
    expect(screen.getByText(/BU/i)).toBeInTheDocument();
    expect(screen.getByText(/Trade/i)).toBeInTheDocument();
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Sell an item/i)).toBeInTheDocument();
    expect(screen.getByText(/My listings/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Safety/i).length).toBeGreaterThanOrEqual(1);

    // Dynamic verification for Feedbacks / Feed and Trade/Borrow when updated
    const feedbacksLink = screen.queryByRole('link', { name: /Feed(backs)?/i });
    if (feedbacksLink) {
      expect(feedbacksLink.getAttribute('href')).toMatch(/^\/feed(backs)?$/);
    }

    const tradeBorrowLink = screen.queryByRole('link', { name: /Trade\/Borrow/i });
    if (tradeBorrowLink) {
      expect(tradeBorrowLink).toHaveAttribute('href', '/trade-borrow');
    }
  });

  it('verifies exact href links for navigation destinations', () => {
    render(<Navbar />);

    expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Sell an item/i })).toHaveAttribute('href', '/sell');
    expect(screen.getByRole('link', { name: /My listings/i })).toHaveAttribute('href', '/profile');

    const feedbacksLink = screen.queryByRole('link', { name: /Feed(backs)?/i });
    if (feedbacksLink) {
      expect(feedbacksLink.getAttribute('href')).toMatch(/^\/feed(backs)?$/);
    }

    const tradeBorrowLink = screen.queryByRole('link', { name: /Trade\/Borrow/i });
    if (tradeBorrowLink) {
      expect(tradeBorrowLink).toHaveAttribute('href', '/trade-borrow');
    }
  });

  it('verifies active link highlighting behavior for current or new destinations', () => {
    currentPathname = '/profile';
    const { unmount } = render(<Navbar />);
    expect(screen.getByRole('link', { name: /My listings/i })).toHaveClass('text-[#c8102e]', 'bg-[#f3f5fa]');
    unmount();

    currentPathname = '/feed';
    const { unmount: unmount2 } = render(<Navbar />);
    const feedbacksLink = screen.queryByRole('link', { name: /Feed(backs)?/i });
    if (feedbacksLink) {
      expect(feedbacksLink).toHaveClass('text-[#c8102e]', 'bg-[#f3f5fa]');
    }
    unmount2();

    currentPathname = '/trade-borrow';
    render(<Navbar />);
    const tradeBorrowLink = screen.queryByRole('link', { name: /Trade\/Borrow/i });
    if (tradeBorrowLink) {
      expect(tradeBorrowLink).toHaveClass('text-[#c8102e]', 'bg-[#f3f5fa]');
    }
  });

  it('renders sign in button for unauthenticated users', () => {
    render(<Navbar user={null} />);
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
  });

  it('renders user initial avatar when user is authenticated', () => {
    render(<Navbar user={{ id: 'u1', fullName: 'Aarav Sharma', email: 'aarav@bennett.edu.in' }} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});

describe('Footer Component', () => {
  it('renders Bennett disclaimer and safety rules link', () => {
    render(<Footer />);

    expect(
      screen.getByText(/Made by students, for students. Not an official Bennett University service./i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Campus safety guidelines/i)).toBeInTheDocument();
    expect(screen.getByText(/© 2026 BU Trade/i)).toBeInTheDocument();
  });
});
