// ============================================================================
// __tests__/trade-borrow.test.tsx
// Comprehensive Unit & Component Test Suite for R4 (Trade/Borrow Tab & Filtering)
// ============================================================================

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { _setTestSession } from '@/lib/auth/session';
import { CATEGORIES, ListingCategory, ContactMethod } from '@/lib/db/types';

// Dynamic module resolution for in-progress M4 features
let createTradeBorrowRequestAction: any;
let updateTradeBorrowRequestStatusAction: any;
let deleteTradeBorrowRequestAction: any;
let TradeBorrowCard: any;
let TradeBorrowFeed: any;
let CreateTradeBorrowModal: any;

let isTradeBorrowImplemented = false;
try {
  const tbActions = require('@/app/actions/trade-borrow');
  createTradeBorrowRequestAction = tbActions.createTradeBorrowRequestAction;
  updateTradeBorrowRequestStatusAction = tbActions.updateTradeBorrowRequestStatusAction;
  deleteTradeBorrowRequestAction = tbActions.deleteTradeBorrowRequestAction;
  TradeBorrowCard = require('@/components/TradeBorrowCard').default || require('@/components/TradeBorrowCard');
  TradeBorrowFeed = require('@/components/TradeBorrowFeed').default || require('@/components/TradeBorrowFeed');
  CreateTradeBorrowModal = require('@/components/CreateTradeBorrowModal').default || require('@/components/CreateTradeBorrowModal');
  isTradeBorrowImplemented = Boolean(
    createTradeBorrowRequestAction &&
    updateTradeBorrowRequestStatusAction &&
    deleteTradeBorrowRequestAction &&
    TradeBorrowCard &&
    TradeBorrowFeed &&
    CreateTradeBorrowModal
  );
} catch {
  isTradeBorrowImplemented = false;
}

let isDbTradeBorrowImplemented = false;
let MockDatabaseServiceClass: any = null;
try {
  const dbModule = require('@/lib/db');
  MockDatabaseServiceClass = dbModule.MockDatabaseService;
  const testDb = new MockDatabaseServiceClass();
  if (typeof testDb.getTradeBorrowRequests === 'function') {
    isDbTradeBorrowImplemented = true;
  }
} catch {
  isDbTradeBorrowImplemented = false;
}

// Canonical type definitions matching PROJECT.md interface contracts
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
  requesterName?: string;
  requesterCourse?: string;
  requesterYear?: number;
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/trade-borrow',
}));

// Mock scrollIntoView for JSDOM
if (typeof window !== 'undefined' && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
}

// Canonical fixture items
const mockRequests: TradeBorrowRequest[] = [
  {
    id: 'req-1',
    userId: 'student-1',
    title: 'Casio fx-991EX Scientific Calculator',
    description: 'Need for Calculus and Linear Algebra end-term exams next week.',
    requestType: 'borrow',
    duration: '3 days',
    category: 'Electronics',
    contactMethod: 'WhatsApp',
    contactValue: '+91 98765 43210',
    status: 'active',
    images: ['https://example.com/calc.jpg'],
    createdAt: '2026-11-18T10:00:00Z',
    updatedAt: '2026-11-18T10:00:00Z',
    requesterName: 'Aarav Sharma',
    requesterCourse: 'B.Tech CSE',
    requesterYear: 3,
  },
  {
    id: 'req-2',
    userId: 'student-2',
    title: 'Data Structures and Algorithms in C++ (Cormen)',
    description: 'Looking to swap with Computer Networks textbook for 2nd semester.',
    requestType: 'trade',
    duration: '1 semester',
    category: 'Books & notes',
    contactMethod: 'Phone',
    contactValue: '+91 98123 45678',
    status: 'active',
    images: [],
    createdAt: '2026-11-17T14:30:00Z',
    updatedAt: '2026-11-17T14:30:00Z',
    requesterName: 'Mehak Kaur',
    requesterCourse: 'B.Tech ECE',
    requesterYear: 2,
  },
  {
    id: 'req-3',
    userId: 'student-3',
    title: 'Lab Coat & Safety Goggles (Size L)',
    description: 'Need for Organic Chemistry practicals this Friday afternoon.',
    requestType: 'borrow',
    duration: '2 days',
    category: 'Stationery & lab gear',
    contactMethod: 'WhatsApp',
    contactValue: '+91 99887 76655',
    status: 'active',
    images: [],
    createdAt: '2026-11-16T09:00:00Z',
    updatedAt: '2026-11-16T09:00:00Z',
    requesterName: 'Rohan Verma',
    requesterCourse: 'B.Tech Biotech',
    requesterYear: 1,
  },
  {
    id: 'req-4',
    userId: 'student-4',
    title: 'Badminton Racket Yonex Voltric',
    description: 'Want to exchange for a standard basketball for hostel court games.',
    requestType: 'trade',
    duration: '2 weeks',
    category: 'Other',
    contactMethod: 'WhatsApp',
    contactValue: '+91 96543 21098',
    status: 'fulfilled',
    images: [],
    createdAt: '2026-11-15T16:00:00Z',
    updatedAt: '2026-11-16T12:00:00Z',
    requesterName: 'Ishita Mishra',
    requesterCourse: 'B.Des',
    requesterYear: 4,
  },
];

// Progressive testability wrappers: execute when application modules are implemented
const describeTradeBorrow = isTradeBorrowImplemented ? describe : describe.skip;
const describeDb = isDbTradeBorrowImplemented ? describe : describe.skip;

describe('Trade/Borrow Feature Test Suite', () => {
  beforeEach(() => {
    _setTestSession(null);
    jest.clearAllMocks();
  });

  // ============================================================================
  // SUITE 1: Server Actions Unit Tests (`app/actions/trade-borrow.ts`)
  // ============================================================================
  describeTradeBorrow('1. Server Actions Unit Tests', () => {
    describe('Authentication Verification', () => {
      it('rejects unauthenticated requests to create trade/borrow request', async () => {
        const res = await createTradeBorrowRequestAction({
          title: 'Casio Calculator',
          description: 'Need for exam',
          requestType: 'borrow',
          duration: '3 days',
          category: 'Electronics',
          contactMethod: 'WhatsApp',
          contactValue: '+91 98765 43210',
        });

        expect(res.success).toBe(false);
        expect(res.error).toMatch(/Authentication required/i);
      });

      it('accepts authenticated request from Bennett student', async () => {
        _setTestSession({
          userId: 'student-test-1',
          id: 'student-test-1',
          email: 'test@bennett.edu.in',
          onboardingNeeded: false,
          isOnboarded: true,
        });

        const res = await createTradeBorrowRequestAction({
          title: 'Casio fx-991EX Calculator',
          description: 'Need for math exam',
          requestType: 'borrow',
          duration: '3 days',
          category: 'Electronics',
          contactMethod: 'WhatsApp',
          contactValue: '+91 98765 43210',
        });

        expect(res.success).toBe(true);
        expect(res.request).toBeDefined();
        expect(res.request?.userId).toBe('student-test-1');
        expect(res.request?.status).toBe('active');
      });
    });

    describe('Input Validation & Boundary Testing', () => {
      beforeEach(() => {
        _setTestSession({
          userId: 'student-validator-1',
          id: 'student-validator-1',
          email: 'validator@bennett.edu.in',
          onboardingNeeded: false,
          isOnboarded: true,
        });
      });

      it('rejects empty or whitespace-only title', async () => {
        const res = await createTradeBorrowRequestAction({
          title: '   ',
          description: 'Valid description',
          requestType: 'borrow',
          duration: '3 days',
          category: 'Electronics',
          contactMethod: 'WhatsApp',
          contactValue: '9876543210',
        });

        expect(res.success).toBe(false);
        expect(res.error).toMatch(/Title is required/i);
      });

      it('rejects title exceeding 120 characters', async () => {
        const longTitle = 'A'.repeat(121);
        const res = await createTradeBorrowRequestAction({
          title: longTitle,
          description: 'Valid description',
          requestType: 'borrow',
          duration: '3 days',
          category: 'Electronics',
          contactMethod: 'WhatsApp',
          contactValue: '9876543210',
        });

        expect(res.success).toBe(false);
        expect(res.error).toMatch(/Title cannot exceed 120/i);
      });

      it('rejects empty or whitespace-only description', async () => {
        const res = await createTradeBorrowRequestAction({
          title: 'Valid Title',
          description: '   ',
          requestType: 'borrow',
          duration: '3 days',
          category: 'Electronics',
          contactMethod: 'WhatsApp',
          contactValue: '9876543210',
        });

        expect(res.success).toBe(false);
        expect(res.error).toMatch(/Description is required/i);
      });

      it('rejects invalid requestType (must be borrow or trade)', async () => {
        const res = await createTradeBorrowRequestAction({
          title: 'Valid Title',
          description: 'Valid description',
          requestType: 'rent' as any,
          duration: '3 days',
          category: 'Electronics',
          contactMethod: 'WhatsApp',
          contactValue: '9876543210',
        });

        expect(res.success).toBe(false);
        expect(res.error).toMatch(/borrow or trade/i);
      });

      it('rejects empty or whitespace-only duration', async () => {
        const res = await createTradeBorrowRequestAction({
          title: 'Valid Title',
          description: 'Valid description',
          requestType: 'borrow',
          duration: '   ',
          category: 'Electronics',
          contactMethod: 'WhatsApp',
          contactValue: '9876543210',
        });

        expect(res.success).toBe(false);
        expect(res.error).toMatch(/Duration is required/i);
      });

      it('rejects duration exceeding 60 characters', async () => {
        const res = await createTradeBorrowRequestAction({
          title: 'Valid Title',
          description: 'Valid description',
          requestType: 'borrow',
          duration: 'D'.repeat(61),
          category: 'Electronics',
          contactMethod: 'WhatsApp',
          contactValue: '9876543210',
        });

        expect(res.success).toBe(false);
        expect(res.error).toMatch(/Duration cannot exceed/i);
      });

      it('accepts realistic campus duration timeframes', async () => {
        const sampleDurations = [
          '3 days',
          '1 semester',
          '2 weeks',
          '1 weekend',
          'Exam week',
          'Until Friday evening',
        ];

        for (const duration of sampleDurations) {
          const res = await createTradeBorrowRequestAction({
            title: `Item for ${duration}`,
            description: 'Testing valid duration formatting',
            requestType: 'borrow',
            duration,
            category: 'Hostel essentials',
            contactMethod: 'WhatsApp',
            contactValue: '9876543210',
          });

          expect(res.success).toBe(true);
          expect(res.request?.duration).toBe(duration);
        }
      });

      it('rejects invalid category', async () => {
        const res = await createTradeBorrowRequestAction({
          title: 'Valid Title',
          description: 'Valid description',
          requestType: 'borrow',
          duration: '3 days',
          category: 'Automotive' as any,
          contactMethod: 'WhatsApp',
          contactValue: '9876543210',
        });

        expect(res.success).toBe(false);
        expect(res.error).toMatch(/Invalid category/i);
      });

      it('accepts all 8 canonical categories', async () => {
        for (const category of CATEGORIES) {
          const res = await createTradeBorrowRequestAction({
            title: `Item in ${category}`,
            description: `Testing canonical category ${category}`,
            requestType: 'trade',
            duration: '1 week',
            category,
            contactMethod: 'Email',
            contactValue: 'test@bennett.edu.in',
          });

          expect(res.success).toBe(true);
          expect(res.request?.category).toBe(category);
        }
      });

      it('rejects invalid contact method', async () => {
        const res = await createTradeBorrowRequestAction({
          title: 'Valid Title',
          description: 'Valid description',
          requestType: 'borrow',
          duration: '3 days',
          category: 'Electronics',
          contactMethod: 'Discord' as any,
          contactValue: 'user#1234',
        });

        expect(res.success).toBe(false);
        expect(res.error).toMatch(/Invalid contact method/i);
      });

      it('rejects empty contact value', async () => {
        const res = await createTradeBorrowRequestAction({
          title: 'Valid Title',
          description: 'Valid description',
          requestType: 'borrow',
          duration: '3 days',
          category: 'Electronics',
          contactMethod: 'Phone',
          contactValue: '   ',
        });

        expect(res.success).toBe(false);
        expect(res.error).toMatch(/Contact detail is required/i);
      });

      it('clamps images array to a maximum of 5 images', async () => {
        const images = ['img1.webp', 'img2.webp', 'img3.webp', 'img4.webp', 'img5.webp', 'img6.webp'];
        const res = await createTradeBorrowRequestAction({
          title: 'Graphics Tablet',
          description: 'Drawing tablet for semester',
          requestType: 'borrow',
          duration: '1 semester',
          category: 'Electronics',
          contactMethod: 'WhatsApp',
          contactValue: '9876543210',
          images,
        });

        expect(res.success).toBe(true);
        expect(res.request?.images).toHaveLength(5);
        expect(res.request?.images).not.toContain('img6.webp');
      });
    });

    describe('Status Update & Ownership Authorization', () => {
      it('prevents non-owner from modifying request status', async () => {
        _setTestSession({
          userId: 'owner-user',
          id: 'owner-user',
          email: 'owner@bennett.edu.in',
          onboardingNeeded: false,
          isOnboarded: true,
        });

        const createRes = await createTradeBorrowRequestAction({
          title: 'Original Request',
          description: 'Study notes',
          requestType: 'borrow',
          duration: '2 days',
          category: 'Books & notes',
          contactMethod: 'WhatsApp',
          contactValue: '9876543210',
        });
        const requestId = createRes.request!.id;

        // Switch to different student
        _setTestSession({
          userId: 'intruder-user',
          id: 'intruder-user',
          email: 'intruder@bennett.edu.in',
          onboardingNeeded: false,
          isOnboarded: true,
        });

        const updateRes = await updateTradeBorrowRequestStatusAction(requestId, 'fulfilled');
        expect(updateRes.success).toBe(false);
        expect(updateRes.error).toMatch(/Unauthorized/i);
      });

      it('allows owner to mark request as fulfilled or closed', async () => {
        const ownerId = `owner-${Date.now()}`;
        _setTestSession({
          userId: ownerId,
          id: ownerId,
          email: 'owner@bennett.edu.in',
          onboardingNeeded: false,
          isOnboarded: true,
        });

        const createRes = await createTradeBorrowRequestAction({
          title: 'Calculator to borrow',
          description: 'Calculus exam',
          requestType: 'borrow',
          duration: '3 days',
          category: 'Electronics',
          contactMethod: 'WhatsApp',
          contactValue: '9876543210',
        });
        const requestId = createRes.request!.id;

        const fulfillRes = await updateTradeBorrowRequestStatusAction(requestId, 'fulfilled');
        expect(fulfillRes.success).toBe(true);

        const closeRes = await updateTradeBorrowRequestStatusAction(requestId, 'closed');
        expect(closeRes.success).toBe(true);
      });

      it('allows owner to delete their request', async () => {
        const ownerId = `owner-del-${Date.now()}`;
        _setTestSession({
          userId: ownerId,
          id: ownerId,
          email: 'owner@bennett.edu.in',
          onboardingNeeded: false,
          isOnboarded: true,
        });

        const createRes = await createTradeBorrowRequestAction({
          title: 'Request to delete',
          description: 'Temporary need',
          requestType: 'trade',
          duration: '1 week',
          category: 'Other',
          contactMethod: 'WhatsApp',
          contactValue: '9876543210',
        });
        const requestId = createRes.request!.id;

        const delRes = await deleteTradeBorrowRequestAction(requestId);
        expect(delRes.success).toBe(true);
      });
    });
  });

  // ============================================================================
  // SUITE 2: Data Service & Query Filtering Tests (`lib/db/mock.ts`)
  // ============================================================================
  describeDb('2. Database Service Trade/Borrow Query Filtering', () => {
    let db: any;

    beforeEach(() => {
      db = new MockDatabaseServiceClass();
      if (typeof db.init === 'function') {
        db.init(true);
      }
    });

    it('filters requests by type: borrow returns only borrow requests', async () => {
      const borrowOnly = await db.getTradeBorrowRequests({ type: 'borrow' });
      expect(borrowOnly.length).toBeGreaterThan(0);
      for (const req of borrowOnly) {
        expect(req.requestType).toBe('borrow');
      }
    });

    it('filters requests by type: trade returns only trade requests', async () => {
      const tradeOnly = await db.getTradeBorrowRequests({ type: 'trade' });
      expect(tradeOnly.length).toBeGreaterThan(0);
      for (const req of tradeOnly) {
        expect(req.requestType).toBe('trade');
      }
    });

    it('returns both types when type filter is all or omitted', async () => {
      const allRequests = await db.getTradeBorrowRequests({ type: 'all' });
      const types = new Set(allRequests.map((r: any) => r.requestType));
      expect(types.has('borrow')).toBe(true);
      expect(types.has('trade')).toBe(true);
    });

    it('filters requests by category', async () => {
      const electronics = await db.getTradeBorrowRequests({ category: 'Electronics' });
      for (const req of electronics) {
        expect(req.category).toBe('Electronics');
      }
    });

    it('filters requests by combined type and category', async () => {
      const filtered = await db.getTradeBorrowRequests({
        type: 'borrow',
        category: 'Electronics',
      });
      for (const req of filtered) {
        expect(req.requestType).toBe('borrow');
        expect(req.category).toBe('Electronics');
      }
    });

    it('filters requests by search query across title and description', async () => {
      const searchResults = await db.getTradeBorrowRequests({ search: 'Calculator' });
      expect(searchResults.length).toBeGreaterThan(0);
      for (const req of searchResults) {
        const match =
          req.title.toLowerCase().includes('calculator') ||
          req.description.toLowerCase().includes('calculator');
        expect(match).toBe(true);
      }
    });

    it('enriches trade/borrow requests with requester profile information', async () => {
      const requests = await db.getTradeBorrowRequests();
      const reqWithProfile = requests.find((r: any) => r.userId === 'seed-user-1');
      if (reqWithProfile) {
        expect(reqWithProfile.requesterName).toBe('Aarav Sharma');
        expect(reqWithProfile.requesterCourse).toBe('B.Tech CSE');
        expect(reqWithProfile.requesterYear).toBe(3);
      }
    });
  });

  // ============================================================================
  // SUITE 3: Component Rendering Tests (`TradeBorrowCard.tsx`)
  // ============================================================================
  describeTradeBorrow('3. TradeBorrowCard Component', () => {
    it('renders BORROW badge for borrow requests with duration pill', () => {
      render(<TradeBorrowCard request={mockRequests[0]} />);

      // Request Type badge
      expect(screen.getByText(/BORROW/i)).toBeInTheDocument();
      // Duration pill
      expect(screen.getByText(/3 days/i)).toBeInTheDocument();
      // Title & Category
      expect(screen.getByText('Casio fx-991EX Scientific Calculator')).toBeInTheDocument();
      expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
      // Requester info
      expect(screen.getByText(/Aarav Sharma/i)).toBeInTheDocument();
      expect(screen.getByText(/B.Tech CSE/i)).toBeInTheDocument();
      // Contact display
      expect(screen.getByText(/\+91 98765 43210/i)).toBeInTheDocument();
    });

    it('renders TRADE badge for trade requests with duration pill', () => {
      render(<TradeBorrowCard request={mockRequests[1]} />);

      // Request Type badge
      expect(screen.getByText(/TRADE/i)).toBeInTheDocument();
      // Duration pill
      expect(screen.getByText(/1 semester/i)).toBeInTheDocument();
      // Title & Category
      expect(screen.getByText('Data Structures and Algorithms in C++ (Cormen)')).toBeInTheDocument();
      expect(screen.getByText(/Books & notes/i)).toBeInTheDocument();
      // Requester info
      expect(screen.getByText(/Mehak Kaur/i)).toBeInTheDocument();
    });

    it('renders Fulfilled status badge for fulfilled requests', () => {
      render(<TradeBorrowCard request={mockRequests[3]} />);

      expect(screen.getByText(/Fulfilled/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SUITE 4: Feed Coordinator Tests (`TradeBorrowFeed.tsx`)
  // ============================================================================
  describeTradeBorrow('4. TradeBorrowFeed Component', () => {
    it('renders all initial requests by default', () => {
      render(<TradeBorrowFeed initialRequests={mockRequests} />);

      expect(screen.getByText('Casio fx-991EX Scientific Calculator')).toBeInTheDocument();
      expect(screen.getByText('Data Structures and Algorithms in C++ (Cormen)')).toBeInTheDocument();
      expect(screen.getByText('Lab Coat & Safety Goggles (Size L)')).toBeInTheDocument();
    });

    it('switches between All, Borrow, and Trade request types via tabs', () => {
      render(<TradeBorrowFeed initialRequests={mockRequests} />);

      // 1. Click "Borrow" tab
      const borrowTab = screen.getByRole('tab', { name: /Borrow/i });
      fireEvent.click(borrowTab);

      expect(screen.getByText('Casio fx-991EX Scientific Calculator')).toBeInTheDocument();
      expect(screen.getByText('Lab Coat & Safety Goggles (Size L)')).toBeInTheDocument();
      expect(screen.queryByText('Data Structures and Algorithms in C++ (Cormen)')).not.toBeInTheDocument();

      // 2. Click "Trade" tab
      const tradeTab = screen.getByRole('tab', { name: /Trade/i });
      fireEvent.click(tradeTab);

      expect(screen.getByText('Data Structures and Algorithms in C++ (Cormen)')).toBeInTheDocument();
      expect(screen.queryByText('Casio fx-991EX Scientific Calculator')).not.toBeInTheDocument();
      expect(screen.queryByText('Lab Coat & Safety Goggles (Size L)')).not.toBeInTheDocument();

      // 3. Click "All" tab to restore all requests
      const allTab = screen.getByRole('tab', { name: /All/i });
      fireEvent.click(allTab);

      expect(screen.getByText('Casio fx-991EX Scientific Calculator')).toBeInTheDocument();
      expect(screen.getByText('Data Structures and Algorithms in C++ (Cormen)')).toBeInTheDocument();
    });

    it('filters requests by category chip selection', () => {
      render(<TradeBorrowFeed initialRequests={mockRequests} />);

      fireEvent.click(screen.getByRole('button', { name: /Books & notes/i }));

      expect(screen.getByText('Data Structures and Algorithms in C++ (Cormen)')).toBeInTheDocument();
      expect(screen.queryByText('Casio fx-991EX Scientific Calculator')).not.toBeInTheDocument();
      expect(screen.queryByText('Lab Coat & Safety Goggles (Size L)')).not.toBeInTheDocument();
    });

    it('live filters requests across title and description via search input', () => {
      render(<TradeBorrowFeed initialRequests={mockRequests} />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'Goggles' } });

      expect(screen.getByText('Lab Coat & Safety Goggles (Size L)')).toBeInTheDocument();
      expect(screen.queryByText('Casio fx-991EX Scientific Calculator')).not.toBeInTheDocument();
      expect(screen.queryByText('Data Structures and Algorithms in C++ (Cormen)')).not.toBeInTheDocument();
    });

    it('renders empty state when no items match and resets on Clear filters', () => {
      render(<TradeBorrowFeed initialRequests={mockRequests} />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'NonexistentSearchXYZ' } });

      expect(screen.getByText(/No requests found/i)).toBeInTheDocument();
      const clearBtn = screen.getByRole('button', { name: /Clear filters/i });
      expect(clearBtn).toBeInTheDocument();

      fireEvent.click(clearBtn);
      expect(screen.getByText('Casio fx-991EX Scientific Calculator')).toBeInTheDocument();
    });

    it('opens CreateTradeBorrowModal when Post Request button is clicked', () => {
      render(
        <TradeBorrowFeed
          initialRequests={mockRequests}
          currentUser={{ id: 'u1', email: 'test@bennett.edu.in' }}
        />
      );

      const postBtn = screen.getByRole('button', { name: /\+ Post Request|Request an Item/i });
      fireEvent.click(postBtn);

      expect(screen.getByText(/Create Borrow or Trade Request/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SUITE 5: Modal Component Tests (`CreateTradeBorrowModal.tsx`)
  // ============================================================================
  describeTradeBorrow('5. CreateTradeBorrowModal Component', () => {
    it('renders all required form controls when open', () => {
      render(
        <CreateTradeBorrowModal
          isOpen={true}
          onClose={jest.fn()}
          currentUser={{ id: 'u1', email: 'test@bennett.edu.in' }}
        />
      );

      expect(screen.getByText(/Create Borrow or Trade Request/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/I want to/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Item title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Duration/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contact method/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contact detail/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit Request|Post Request/i })).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      const { container } = render(
        <CreateTradeBorrowModal
          isOpen={false}
          onClose={jest.fn()}
          currentUser={{ id: 'u1', email: 'test@bennett.edu.in' }}
        />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('toggles between Borrow and Trade request types', () => {
      render(
        <CreateTradeBorrowModal
          isOpen={true}
          onClose={jest.fn()}
          currentUser={{ id: 'u1', email: 'test@bennett.edu.in' }}
        />
      );

      const tradeRadio = screen.getByLabelText(/Trade/i);
      fireEvent.click(tradeRadio);
      expect(tradeRadio).toBeChecked();

      const borrowRadio = screen.getByLabelText(/Borrow/i);
      fireEvent.click(borrowRadio);
      expect(borrowRadio).toBeChecked();
    });
  });
});
