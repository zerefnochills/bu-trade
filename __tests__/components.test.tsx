import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock next/image
jest.mock('next/image', () => {
  return function DummyImage({ priority, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt || ''} {...props} />;
  };
});

describe('Navbar Component', () => {
  it('renders Bennett University branding and navigation destinations', () => {
    render(<Navbar />);

    expect(screen.getByText(/The campus marketplace for Bennett University students/i)).toBeInTheDocument();
    expect(screen.getByText(/BU/i)).toBeInTheDocument();
    expect(screen.getByText(/Trade/i)).toBeInTheDocument();
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Sell an item/i)).toBeInTheDocument();
    expect(screen.getByText(/My listings/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Safety/i).length).toBeGreaterThanOrEqual(1);
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
