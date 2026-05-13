import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

import { getFeedbackByCode } from './authFeedbackTranslations';

// vi.mock('next/link', () => ({
//   default: ({ href, children }: { href: string; children: ReactNode }) => (
//     <a href={href}>{children}</a>
//   ),
// }));

describe('getFeedbackByCode', () => {
  test('code returns correct feedback where message is string', () => {
    const feedback = getFeedbackByCode('invalid_credentials');
    const expectedFeedback = {
      type: 'error',
      message:
        'Je e-mailadres of wachtwoord is onjuist. Controleer je inloggegevens en probeer het opnieuw.',
    };
    expect(feedback).toEqual(expectedFeedback);
  });

  test('email already exists feedback is warning and contains link to login page', () => {
    const { type, message } = getFeedbackByCode('email_exists');
    expect(type).toBe('warning');

    render(<>{message}</>);
    const link = screen.getByRole('link', { name: /inloggen/i });
    expect(link).toHaveAttribute('href', '/inloggen');
  });

  test('email not confirmed feedback is type error and contains link to resend link', () => {
    const { type, message } = getFeedbackByCode('email_not_confirmed');
    expect(type).toBe('error');

    render(<>{message}</>);
    const link = screen.getByRole('link', { name: /aanvragen/i });
    expect(link).toHaveAttribute('href', '/bevestigings-link-opnieuw-aanvragen');
    console.log(link);
  });

  test('unknown error code returns error type and generic message with unknown code', () => {
    const nonExistingCode = 'non_existing_code';
    const feedback = getFeedbackByCode(nonExistingCode);
    const expectedFeedback = {
      type: 'error',
      message: `Er is een onbekende fout opgetreden. Foutcode: ${nonExistingCode}`,
    };
    expect(feedback).toEqual(expectedFeedback);
  });
});
