import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

import { getFeedbackByCode } from './authFeedbackTranslations';

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
    const feedback = getFeedbackByCode('email_exists');
    expect(feedback.type).toBe('warning');
    if (!('messageNode' in feedback)) {
      throw new Error('feedback has no messageNode');
    }
    render(<>{feedback.messageNode}</>);
    const link = screen.getByRole('link', { name: /inloggen/i });
    expect(link).toHaveAttribute('href', '/inloggen');
  });

  test('email not confirmed feedback is type error and contains link to resend link', () => {
    const feedback = getFeedbackByCode('email_not_confirmed');
    expect(feedback.type).toBe('error');
    if (!('messageNode' in feedback)) {
      throw new Error('feedback has no messageNode');
    }
    render(<>{feedback.messageNode}</>);
    const link = screen.getByRole('link', { name: /aanvragen/i });
    expect(link).toHaveAttribute('href', '/bevestigings-link-opnieuw-aanvragen');
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
