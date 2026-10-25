import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const replace = vi.fn();
const apiFetch = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));
vi.mock('next/link', () => ({
  default: ({ href, children }) => <a href={href}>{children}</a>,
}));
vi.mock('@/lib/api', () => ({
  apiFetch: (...args) => apiFetch(...args),
  tokenStore: { get: () => 'fake-token' },
}));

import NewInquiryPage from './page';

describe('New inquiry form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows field errors and does not call the API when the form is empty', async () => {
    const user = userEvent.setup();
    render(<NewInquiryPage />);

    await user.click(screen.getByRole('button', { name: /save inquiry/i }));

    expect(screen.getByText('Customer name is required')).toBeInTheDocument();
    expect(screen.getByText('Subject is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('shows the duplicate warning with a link when the API returns 409', async () => {
    const user = userEvent.setup();
    const error = Object.assign(new Error('An open inquiry with the same contact and subject already exists'), {
      status: 409,
      details: { existingId: 'abc-123' },
    });
    apiFetch.mockRejectedValueOnce(error);
    render(<NewInquiryPage />);

    await user.type(screen.getByLabelText(/customer name/i), 'Nimal Silva');
    await user.type(screen.getByLabelText(/contact/i), '0719876543');
    await user.type(screen.getByLabelText(/subject/i), 'Installation');
    await user.type(screen.getByLabelText(/description/i), 'Needs setup next week');
    await user.click(screen.getByRole('button', { name: /save inquiry/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('already exists'));
    expect(screen.getByRole('link', { name: /open the existing inquiry/i })).toHaveAttribute(
      'href',
      '/inquiries/abc-123'
    );
  });
});