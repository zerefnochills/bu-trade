import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportModal from '@/components/ReportModal';
import * as reportActions from '@/app/actions/reports';

jest.mock('@/app/actions/reports', () => ({
  submitReportAction: jest.fn(),
}));

describe('ReportModal Component', () => {
  const dummyUser = {
    id: 'test-user-1',
    email: 'test@bennett.edu.in',
    fullName: 'Test Student',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with all 6 violation categories when open', () => {
    render(
      <ReportModal
        listingId="seed-listing-1"
        listingTitle="Hero Sprint Cycle"
        isOpen={true}
        onClose={jest.fn()}
        currentUser={dummyUser}
      />
    );

    expect(screen.getByText(/Report this listing/i)).toBeInTheDocument();
    expect(screen.getByText(/Hero Sprint Cycle/i)).toBeInTheDocument();
    expect(screen.getByText('Prohibited item')).toBeInTheDocument();
    expect(screen.getByText('Counterfeit/fake')).toBeInTheDocument();
    expect(screen.getByText('Inappropriate behavior/harassment')).toBeInTheDocument();
    expect(screen.getByText('Wrong category/spam')).toBeInTheDocument();
    expect(screen.getByText('Misleading price/condition')).toBeInTheDocument();
    expect(screen.getByText('Safety concern')).toBeInTheDocument();
  });

  it('disables submit button until a violation category is selected', () => {
    render(
      <ReportModal
        listingId="seed-listing-1"
        isOpen={true}
        onClose={jest.fn()}
        currentUser={dummyUser}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Submit report/i });
    expect(submitBtn).toBeDisabled();

    fireEvent.click(screen.getByText('Prohibited item'));
    expect(submitBtn).not.toBeDisabled();
  });

  it('shows sign-in prompt if user is not authenticated', () => {
    render(
      <ReportModal
        listingId="seed-listing-1"
        isOpen={true}
        onClose={jest.fn()}
        currentUser={null}
      />
    );

    expect(
      screen.getByText(/You must be signed in with your @bennett.edu.in email/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign in with Bennett email/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });

  it('submits report and displays confirmation message', async () => {
    (reportActions.submitReportAction as jest.Mock).mockResolvedValue({
      success: true,
      report: {
        id: 'rep-123',
        listingId: 'seed-listing-1',
        reporterId: 'test-user-1',
        reason: 'Safety concern',
        details: 'Suspicious meetup request.',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    });

    render(
      <ReportModal
        listingId="seed-listing-1"
        isOpen={true}
        onClose={jest.fn()}
        currentUser={dummyUser}
      />
    );

    fireEvent.click(screen.getByText('Safety concern'));
    const textarea = screen.getByPlaceholderText(/Please provide specifics/i);
    fireEvent.change(textarea, { target: { value: 'Suspicious meetup request.' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit report/i }));

    await waitFor(() => {
      expect(screen.getByText(/Report submitted to moderators/i)).toBeInTheDocument();
    });
  });
});
