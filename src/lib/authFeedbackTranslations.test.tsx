import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

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

  test('code returns correct feedback where email already exists', () => {
    const feedback = getFeedbackByCode('email_exists');
    expect(feedback.type).toBe('warning');

    const message = feedback.message;
    render(<>{message}</>);
    expect(screen.getByText(/e-mailadres/)).toBeInTheDocument();
  });
});
