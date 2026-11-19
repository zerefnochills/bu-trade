import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnquiryModal from '@/components/EnquiryModal';
import * as enquiryActions from '@/app/actions/enquiries';

// Mock submitEnquiryAction
jest.mock('@/app/actions/enquiries', () => ({
  submitEnquiryAction: jest.fn(),
}));

describe('EnquiryModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sign in prompt when user is not authenticated', () => {
    render(
      <EnquiryModal
        listingId="listing-1"
        listingTitle="Hero Sprint Cycle"
        isOpen={true}
        currentUser={null}
      />
    );

    expect(screen.getByText(/Bennett University Sign-in Required/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in with Bennett Email/i)).toBeInTheDocument();
  });

  it('renders quick question chips and prefilled textarea for authenticated student', () => {
    render(
      <EnquiryModal
        listingId="listing-1"
        listingTitle="Hero Sprint Cycle"
        sellerName="Aarav Sharma"
        isOpen={true}
        currentUser={{ id: 'u2', email: 'buyer@bennett.edu.in' }}
      />
    );

    expect(screen.getByText(/Enquire to Unlock Contact/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Can I inspect it at Student Center \/ CBC Cafeteria\?/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Is the price negotiable\?/i)).toBeInTheDocument();

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Hi, is this still available?');
  });

  it('updates message when quick question chip is clicked', () => {
    render(
      <EnquiryModal
        listingId="listing-1"
        listingTitle="Hero Sprint Cycle"
        isOpen={true}
        currentUser={{ id: 'u2', email: 'buyer@bennett.edu.in' }}
      />
    );

    const chip = screen.getByText(/Can I inspect it at Student Center \/ CBC Cafeteria\?/i);
    fireEvent.click(chip);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Can I inspect it at Student Center / CBC Cafeteria?');
  });

  it('submits enquiry and immediately displays unlocked contact info', async () => {
    (enquiryActions.submitEnquiryAction as jest.Mock).mockResolvedValue({
      success: true,
      contact: {
        contactMethod: 'WhatsApp',
        contactValue: '+91 9876543210',
      },
    });

    const onSuccess = jest.fn();

    render(
      <EnquiryModal
        listingId="listing-1"
        listingTitle="Hero Sprint Cycle"
        sellerName="Aarav Sharma"
        isOpen={true}
        currentUser={{ id: 'u2', email: 'buyer@bennett.edu.in' }}
        onSuccess={onSuccess}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Send & Unlock Contact/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(enquiryActions.submitEnquiryAction).toHaveBeenCalledWith({
        listingId: 'listing-1',
        message: 'Hi, is this still available?',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Enquiry Sent & Contact Unlocked!/i)).toBeInTheDocument();
      expect(screen.getByText('+91 9876543210')).toBeInTheDocument();
      expect(screen.getByText(/Open WhatsApp/i)).toBeInTheDocument();
    });

    expect(onSuccess).toHaveBeenCalledWith({
      contactMethod: 'WhatsApp',
      contactValue: '+91 9876543210',
    });
  });
});
