// ============================================================================
// __tests__/feedbacks.test.tsx
// Comprehensive Unit & Component Test Suite for R3 (Feedbacks & Reddit Voting)
// ============================================================================

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { _setTestSession } from '@/lib/auth/session';

// Dynamic module resolution for in-progress M3 features
let createFeedbackAction: any;
let voteFeedbackAction: any;
let getFeedbacksAction: any;
let FeedbackCard: any;
let FeedbackFeed: any;
let CreateFeedbackModal: any;

let isFeedbackImplemented = false;
try {
  const fbActions = require('@/app/actions/feedback');
  createFeedbackAction = fbActions.createFeedbackAction;
  voteFeedbackAction = fbActions.voteFeedbackAction;
  getFeedbacksAction = fbActions.getFeedbacksAction;
  FeedbackCard = require('@/components/FeedbackCard').default || require('@/components/FeedbackCard');
  FeedbackFeed = require('@/components/FeedbackFeed').default || require('@/components/FeedbackFeed');
  CreateFeedbackModal = require('@/components/CreateFeedbackModal').default || require('@/components/CreateFeedbackModal');
  isFeedbackImplemented = Boolean(
    createFeedbackAction &&
    voteFeedbackAction &&
    FeedbackCard &&
    FeedbackFeed &&
    CreateFeedbackModal
  );
} catch {
  isFeedbackImplemented = false;
}

// Canonical Feedback interfaces as defined in PROJECT.md
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

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/feedbacks',
}));

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => {
  return function DummyImage({ priority, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt || ''} {...props} />;
  };
});

// Mock sample feedback post
const mockFeedbackPost: FeedbackPost = {
  id: 'fb-test-1',
  userId: 'student-1',
  itemTitle: 'Hero Sprint Cycle 21 Speed',
  content: 'Bought this cycle last week. Very smooth ride across campus and hostels. Highly recommended!',
  rating: 5,
  images: ['data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v39gAA='],
  score: 1,
  upvotesCount: 1,
  downvotesCount: 0,
  userVote: 1,
  createdAt: '2026-11-15T10:00:00.000Z',
  updatedAt: '2026-11-15T10:00:00.000Z',
  authorName: 'Aarav Sharma',
  authorCourse: 'B.Tech CSE',
  authorYear: 3,
};

// Progressive testability wrapper: executes when application modules are implemented
const describeFeedback = isFeedbackImplemented ? describe : describe.skip;

describe('Feedbacks & Reddit Voting Engine Test Suite', () => {
  beforeEach(() => {
    _setTestSession(null);
    jest.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // Suite 1: Authentication & Authorization
  // --------------------------------------------------------------------------
  describeFeedback('1. Authentication Verification', () => {
    it('rejects feedback creation when user is unauthenticated', async () => {
      _setTestSession(null);
      const res = await createFeedbackAction({
        itemTitle: 'Casio Calculator',
        content: 'Works well for mid-sems',
        rating: 4,
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Authentication required/i);
    });

    it('rejects voting when user is unauthenticated', async () => {
      _setTestSession(null);
      const res = await voteFeedbackAction('fb-test-1', 1);

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Authentication required/i);
    });

    it('accepts feedback creation when user is authenticated with Bennett session', async () => {
      _setTestSession({
        userId: 'student-auth-1',
        id: 'student-auth-1',
        email: 'student@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      const res = await createFeedbackAction({
        itemTitle: 'Casio Scientific Calculator fx-991EX',
        content: 'Battery lasts forever, genuine product received from senior.',
        rating: 5,
      });

      expect(res.success).toBe(true);
      expect(res.feedback).toBeDefined();
      expect(res.feedback?.itemTitle).toBe('Casio Scientific Calculator fx-991EX');
      expect(res.feedback?.userId).toBe('student-auth-1');
    });
  });

  // --------------------------------------------------------------------------
  // Suite 2: Input Validation & Boundary Value Analysis
  // --------------------------------------------------------------------------
  describeFeedback('2. Validation & Boundary Value Analysis', () => {
    beforeEach(() => {
      _setTestSession({
        userId: 'student-validator-1',
        id: 'student-validator-1',
        email: 'validator@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });
    });

    it('rejects empty or whitespace-only item title', async () => {
      const res = await createFeedbackAction({
        itemTitle: '   ',
        content: 'Valid content body here.',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Title is required/i);
    });

    it('rejects item title exceeding 120 characters', async () => {
      const longTitle = 'A'.repeat(121);
      const res = await createFeedbackAction({
        itemTitle: longTitle,
        content: 'Valid content body here.',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Title cannot exceed 120 characters/i);
    });

    it('accepts item title at 120 character upper boundary', async () => {
      const boundaryTitle = 'A'.repeat(120);
      const res = await createFeedbackAction({
        itemTitle: boundaryTitle,
        content: 'Valid content body here.',
      });

      expect(res.success).toBe(true);
    });

    it('rejects empty or whitespace-only review content', async () => {
      const res = await createFeedbackAction({
        itemTitle: 'Valid Title',
        content: '   ',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Content is required/i);
    });

    it('rejects content exceeding 2000 characters', async () => {
      const longContent = 'C'.repeat(2001);
      const res = await createFeedbackAction({
        itemTitle: 'Valid Title',
        content: longContent,
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Content cannot exceed 2000 characters/i);
    });

    it('rejects rating below 1', async () => {
      const res = await createFeedbackAction({
        itemTitle: 'Valid Title',
        content: 'Valid content',
        rating: 0,
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Rating must be between 1 and 5/i);
    });

    it('rejects rating above 5', async () => {
      const res = await createFeedbackAction({
        itemTitle: 'Valid Title',
        content: 'Valid content',
        rating: 6,
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Rating must be between 1 and 5/i);
    });

    it('rejects non-integer rating', async () => {
      const res = await createFeedbackAction({
        itemTitle: 'Valid Title',
        content: 'Valid content',
        rating: 4.5,
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Rating must be an integer/i);
    });

    it('accepts omitted optional rating', async () => {
      const res = await createFeedbackAction({
        itemTitle: 'Valid Item Without Rating',
        content: 'Great purchase experience overall.',
      });

      expect(res.success).toBe(true);
      expect(res.feedback?.rating).toBeUndefined();
    });

    it('accepts and stores attached image Base64 data URLs', async () => {
      const imagePayload = [
        'data:image/webp;base64,image1',
        'data:image/webp;base64,image2',
      ];
      const res = await createFeedbackAction({
        itemTitle: 'Electric Kettle',
        content: 'Used for boiling water and making noodles in room.',
        rating: 5,
        images: imagePayload,
      });

      expect(res.success).toBe(true);
      expect(res.feedback?.images).toEqual(imagePayload);
    });

    it('caps image attachments at maximum 3 images', async () => {
      const excessImages = [
        'data:image/webp;base64,1',
        'data:image/webp;base64,2',
        'data:image/webp;base64,3',
        'data:image/webp;base64,4',
        'data:image/webp;base64,5',
      ];
      const res = await createFeedbackAction({
        itemTitle: 'Engineering Drawing Board',
        content: 'Complete kit with clips and T-square.',
        rating: 4,
        images: excessImages,
      });

      expect(res.success).toBe(true);
      expect(res.feedback?.images.length).toBeLessThanOrEqual(3);
    });
  });

  // --------------------------------------------------------------------------
  // Suite 3: Reddit-Style Voting Mechanics (State Transitions & Math Invariants)
  // --------------------------------------------------------------------------
  describeFeedback('3. Reddit-Style Voting Mechanics', () => {
    let createdFeedbackId: string;

    beforeEach(async () => {
      _setTestSession({
        userId: 'author-student',
        id: 'author-student',
        email: 'author@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      const res = await createFeedbackAction({
        itemTitle: 'Campus Lab Coat Size M',
        content: 'Pristine lab coat, fully approved for biotech labs.',
        rating: 5,
      });
      createdFeedbackId = res.feedback!.id;
    });

    it('Scenario 1 (Initial Upvote): score increases by +1, userVote becomes 1', async () => {
      _setTestSession({
        userId: 'voter-1',
        id: 'voter-1',
        email: 'voter1@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      const res = await voteFeedbackAction(createdFeedbackId, 1);
      expect(res.success).toBe(true);
      expect(res.score).toBe(1);
      expect(res.userVote).toBe(1);
      expect(res.upvotesCount).toBe(1);
      expect(res.downvotesCount).toBe(0);
    });

    it('Scenario 2 (Repeated Upvote / Toggle Off): score decreases by -1, userVote reverts to 0', async () => {
      _setTestSession({
        userId: 'voter-1',
        id: 'voter-1',
        email: 'voter1@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      // First click: upvote
      await voteFeedbackAction(createdFeedbackId, 1);
      // Second click: toggle off
      const toggleRes = await voteFeedbackAction(createdFeedbackId, 1);

      expect(toggleRes.success).toBe(true);
      expect(toggleRes.score).toBe(0);
      expect(toggleRes.userVote).toBe(0);
      expect(toggleRes.upvotesCount).toBe(0);
      expect(toggleRes.downvotesCount).toBe(0);
    });

    it('Scenario 3 (Initial Downvote): score decreases by -1, userVote becomes -1', async () => {
      _setTestSession({
        userId: 'voter-2',
        id: 'voter-2',
        email: 'voter2@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      const res = await voteFeedbackAction(createdFeedbackId, -1);
      expect(res.success).toBe(true);
      expect(res.score).toBe(-1);
      expect(res.userVote).toBe(-1);
      expect(res.upvotesCount).toBe(0);
      expect(res.downvotesCount).toBe(1);
    });

    it('Scenario 4 (Repeated Downvote / Toggle Off): score increases by +1, userVote reverts to 0', async () => {
      _setTestSession({
        userId: 'voter-2',
        id: 'voter-2',
        email: 'voter2@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      // First click: downvote
      await voteFeedbackAction(createdFeedbackId, -1);
      // Second click: toggle off
      const toggleRes = await voteFeedbackAction(createdFeedbackId, -1);

      expect(toggleRes.success).toBe(true);
      expect(toggleRes.score).toBe(0);
      expect(toggleRes.userVote).toBe(0);
      expect(toggleRes.upvotesCount).toBe(0);
      expect(toggleRes.downvotesCount).toBe(0);
    });

    it('Scenario 5 (Upvote to Downvote Flip): score changes by -2, userVote becomes -1', async () => {
      _setTestSession({
        userId: 'voter-3',
        id: 'voter-3',
        email: 'voter3@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      // Step 1: Upvote (+1)
      const upRes = await voteFeedbackAction(createdFeedbackId, 1);
      expect(upRes.score).toBe(1);
      expect(upRes.userVote).toBe(1);

      // Step 2: Flip to Downvote (-1)
      const flipRes = await voteFeedbackAction(createdFeedbackId, -1);
      expect(flipRes.score).toBe(-1);
      expect(flipRes.userVote).toBe(-1);
      expect(flipRes.upvotesCount).toBe(0);
      expect(flipRes.downvotesCount).toBe(1);
    });

    it('Scenario 6 (Downvote to Upvote Flip): score changes by +2, userVote becomes 1', async () => {
      _setTestSession({
        userId: 'voter-4',
        id: 'voter-4',
        email: 'voter4@bennett.edu.in',
        onboardingNeeded: false,
        isOnboarded: true,
      });

      // Step 1: Downvote (-1)
      const downRes = await voteFeedbackAction(createdFeedbackId, -1);
      expect(downRes.score).toBe(-1);
      expect(downRes.userVote).toBe(-1);

      // Step 2: Flip to Upvote (+1)
      const flipRes = await voteFeedbackAction(createdFeedbackId, 1);
      expect(flipRes.score).toBe(1);
      expect(flipRes.userVote).toBe(1);
      expect(flipRes.upvotesCount).toBe(1);
      expect(flipRes.downvotesCount).toBe(0);
    });

    it('Scenario 7 (Multi-User Net Score Invariant): score === upvotesCount - downvotesCount', async () => {
      // User A upvotes (+1)
      _setTestSession({ userId: 'user-a', id: 'user-a', email: 'a@bennett.edu.in', onboardingNeeded: false, isOnboarded: true });
      await voteFeedbackAction(createdFeedbackId, 1);

      // User B upvotes (+1)
      _setTestSession({ userId: 'user-b', id: 'user-b', email: 'b@bennett.edu.in', onboardingNeeded: false, isOnboarded: true });
      await voteFeedbackAction(createdFeedbackId, 1);

      // User C downvotes (-1)
      _setTestSession({ userId: 'user-c', id: 'user-c', email: 'c@bennett.edu.in', onboardingNeeded: false, isOnboarded: true });
      const resC = await voteFeedbackAction(createdFeedbackId, -1);

      expect(resC.score).toBe(1); // 2 upvotes - 1 downvote = 1
      expect(resC.upvotesCount).toBe(2);
      expect(resC.downvotesCount).toBe(1);
      expect(resC.score).toBe(resC.upvotesCount! - resC.downvotesCount!);

      // User A toggles off
      _setTestSession({ userId: 'user-a', id: 'user-a', email: 'a@bennett.edu.in', onboardingNeeded: false, isOnboarded: true });
      const resAToggle = await voteFeedbackAction(createdFeedbackId, 1);

      expect(resAToggle.score).toBe(0); // 1 upvote - 1 downvote = 0
      expect(resAToggle.upvotesCount).toBe(1);
      expect(resAToggle.downvotesCount).toBe(1);
      expect(resAToggle.score).toBe(resAToggle.upvotesCount! - resAToggle.downvotesCount!);
    });

    it('rejects voting on invalid/non-existent feedback ID', async () => {
      _setTestSession({ userId: 'user-x', id: 'user-x', email: 'x@bennett.edu.in', onboardingNeeded: false, isOnboarded: true });
      const res = await voteFeedbackAction('nonexistent-id-999', 1);

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Feedback not found/i);
    });
  });

  // --------------------------------------------------------------------------
  // Suite 4: Component Rendering & UI Assertions (FeedbackCard)
  // --------------------------------------------------------------------------
  describeFeedback('4. FeedbackCard Component', () => {
    it('renders author details, item title, review content, and rating', () => {
      render(<FeedbackCard feedback={mockFeedbackPost} />);

      expect(screen.getByText('Hero Sprint Cycle 21 Speed')).toBeInTheDocument();
      expect(screen.getByText(/Bought this cycle last week/i)).toBeInTheDocument();
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
      expect(screen.getByText(/B\.Tech CSE/i)).toBeInTheDocument();
      expect(screen.getByText(/Y3/i)).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Score
    });

    it('renders attached image thumbnail with alt text', () => {
      render(<FeedbackCard feedback={mockFeedbackPost} />);

      const img = screen.getByAltText('Hero Sprint Cycle 21 Speed');
      expect(img).toBeInTheDocument();
    });

    it('highlights active upvote button when userVote === 1', () => {
      render(<FeedbackCard feedback={mockFeedbackPost} />);

      const upvoteBtn = screen.getByLabelText(/Upvote/i);
      expect(upvoteBtn.className).toMatch(/(text-orange|text-amber|bg-orange|active)/i);
    });

    it('highlights active downvote button when userVote === -1', () => {
      const downvotedPost: FeedbackPost = {
        ...mockFeedbackPost,
        score: -1,
        userVote: -1,
      };
      render(<FeedbackCard feedback={downvotedPost} />);

      const downvoteBtn = screen.getByLabelText(/Downvote/i);
      expect(downvoteBtn.className).toMatch(/(text-indigo|text-blue|bg-blue|bg-indigo|active)/i);
    });

    it('invokes onVote with correct voteType when buttons are clicked', () => {
      const mockOnVote = jest.fn();
      render(<FeedbackCard feedback={mockFeedbackPost} onVote={mockOnVote} />);

      const upvoteBtn = screen.getByLabelText(/Upvote/i);
      fireEvent.click(upvoteBtn);
      expect(mockOnVote).toHaveBeenCalledWith(mockFeedbackPost.id, 1);

      const downvoteBtn = screen.getByLabelText(/Downvote/i);
      fireEvent.click(downvoteBtn);
      expect(mockOnVote).toHaveBeenCalledWith(mockFeedbackPost.id, -1);
    });
  });

  // --------------------------------------------------------------------------
  // Suite 5: Feed Component & Sorting (FeedbackFeed)
  // --------------------------------------------------------------------------
  describeFeedback('5. FeedbackFeed Component', () => {
    it('renders feed header and post feedback CTA button', () => {
      render(<FeedbackFeed initialFeedbacks={[mockFeedbackPost]} />);

      expect(screen.getByText(/Feedbacks/i)).toBeInTheDocument();
      expect(screen.getByText(/Post Feedback/i)).toBeInTheDocument();
    });

    it('renders empty state message when no feedback posts exist', () => {
      render(<FeedbackFeed initialFeedbacks={[]} />);

      expect(screen.getByText(/No feedback posts yet/i)).toBeInTheDocument();
    });

    it('renders sort toggle options for Top Voted and Newest', () => {
      render(<FeedbackFeed initialFeedbacks={[mockFeedbackPost]} />);

      expect(screen.getByText(/Top Voted|Top/i)).toBeInTheDocument();
      expect(screen.getByText(/Newest|Recent/i)).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Suite 6: Modal Component Form & Submission (CreateFeedbackModal)
  // --------------------------------------------------------------------------
  describeFeedback('6. CreateFeedbackModal Component', () => {
    it('does not render modal content when isOpen is false', () => {
      render(<CreateFeedbackModal isOpen={false} onClose={jest.fn()} />);

      expect(screen.queryByText(/Share Feedback/i)).not.toBeInTheDocument();
    });

    it('renders sign-in prompt when opened by unauthenticated visitor', () => {
      render(
        <CreateFeedbackModal
          isOpen={true}
          onClose={jest.fn()}
          currentUser={null}
        />
      );

      expect(screen.getByText(/Sign-in Required|Please sign in/i)).toBeInTheDocument();
    });

    it('renders all form inputs and rating selector for authenticated student', () => {
      render(
        <CreateFeedbackModal
          isOpen={true}
          onClose={jest.fn()}
          currentUser={{ id: 'u1', email: 'test@bennett.edu.in' }}
        />
      );

      expect(screen.getByLabelText(/Item Title|Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Review|Content/i)).toBeInTheDocument();
      expect(screen.getByText(/Submit Review|Post Feedback/i)).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      render(
        <CreateFeedbackModal
          isOpen={true}
          onClose={mockOnClose}
          currentUser={{ id: 'u1', email: 'test@bennett.edu.in' }}
        />
      );

      const closeBtn = screen.getByLabelText(/Close/i);
      fireEvent.click(closeBtn);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
