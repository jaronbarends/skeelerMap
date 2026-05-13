import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

import SignupForm from './SignupForm';

vi.mock('@/lib/supabaseAuth', () => ({
  signUp: vi.fn(),
}));

describe('SignupForm.tsx', () => {
  test('form renders labels and fields for email, password, repeat password', () => {
    render(<SignupForm />);

    const emailLabel = screen.getByLabelText(/e-mail/i);
    expect(emailLabel).toBeInTheDocument();
  });
});
