import { fireEvent, render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

import { signUp } from '@/lib/supabaseAuth';

import SignupForm from './SignupForm';

vi.mock('@/lib/supabaseAuth', () => ({
  signUp: vi.fn().mockResolvedValue({ success: true }),
}));

const correctValues = { email: 'a@a.nl', password: 'password123', passwordConfirm: 'password123' };

describe('SignupForm.tsx', () => {
  describe('Happy flow', () => {
    test('form renders labels and fields for email, password, repeat password and submit button', () => {
      setup();
      const submitButton = screen.getByRole('button', { name: /registreren/i });
      expect(submitButton).toBeInTheDocument();
    });

    test('form renders no error when passwords are identical', () => {
      const { form } = setupWithValues(correctValues);
      fireEvent.submit(form);
      expect(screen.queryByText(/wachtwoorden komen niet overeen/i)).not.toBeInTheDocument();
    });

    test('form calls signUp with correct values when form is submitted', () => {
      const { form } = setupWithValues(correctValues);
      fireEvent.submit(form);
      expect(signUp).toHaveBeenCalledWith(correctValues.email, correctValues.password);
    });

    test('submit button is disabled and shows busy text when form is submitting', () => {
      const { form } = setupWithValues(correctValues);
      const submitButton = screen.getByRole('button', { name: /registreren/i });
      fireEvent.submit(form);
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/bezig/i);
    });

    test('form shows success message and hides form when signUp is successful', async () => {
      const { form } = setupWithValues(correctValues);
      fireEvent.submit(form);
      expect(await screen.findByText(/account aangemaakt/i)).toBeInTheDocument();
      expect(form).not.toBeInTheDocument();
    });

    test('form has link to login page', () => {
      setup();
      const loginLink = screen.getByRole('link', { name: /inloggen/i });
      expect(loginLink).toBeInTheDocument();
    });
  });

  describe('Error flow', () => {
    // NOTE: we're using default browser validation for email, so we should test that in E2E tests, not here

    test('form renders error when passwords do not match', () => {
      const { form } = setupWithValues({ ...correctValues, passwordConfirm: 'not-password123' });
      fireEvent.submit(form);
      expect(screen.getByText(/wachtwoorden komen niet overeen/i)).toBeInTheDocument();
    });
  });
});

function setup() {
  render(<SignupForm />);
  const form = screen.getByRole('form');
  const emailInput = screen.getByLabelText(/e-mail/i);
  const passwordInputs = screen.getAllByLabelText(/wachtwoord/i);
  const passwordInput = passwordInputs[0];
  const passwordConfirmInput = passwordInputs[1];
  return { form, emailInput, passwordInput, passwordConfirmInput };
}

function setupWithValues({
  email,
  password,
  passwordConfirm,
}: {
  email: string;
  password: string;
  passwordConfirm: string;
}) {
  const { form, emailInput, passwordInput, passwordConfirmInput } = setup();
  fireEvent.change(emailInput, { target: { value: email } });
  fireEvent.change(passwordInput, { target: { value: password } });
  fireEvent.change(passwordConfirmInput, { target: { value: passwordConfirm } });
  return { form, emailInput, passwordInput, passwordConfirmInput };
}
