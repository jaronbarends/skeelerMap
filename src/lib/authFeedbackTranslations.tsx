import Link from 'next/link';

import type { Feedback } from '@/components/auth/FormFeedback';

type FeedbackTranslation = Feedback & {
  description: string; // what the error code means, just for dev reference
};

// error codes overview: https://supabase.com/docs/guides/auth/debugging/error-codes#auth-error-codes-table
// I only implement the most common error codes; will return the code if not found.
export const authFeedbackTranslations: Record<string, FeedbackTranslation> = {
  email_exists: {
    description: 'Email address already exists in the system.',
    type: 'warning',
    messageNode: (
      <>
        Je hebt je al aangemeld met dit e-mailadres. Je kunt nu{' '}
        <Link href="/inloggen">Inloggen</Link>.
      </>
    ),
  },
  email_not_confirmed: {
    description: 'Signing in is not allowed for this user as the email address is not confirmed.',
    type: 'error',
    messageNode: (
      <>
        Je account is nog niet bevestigd. Klik op de link in de e-mail die je eerder hebt ontvangen
        om je account te bevestigen.{' '}
        <Link href="/bevestigings-link-opnieuw-aanvragen">Bevestigingslink opnieuw aanvragen</Link>
      </>
    ),
  },
  invalid_credentials: {
    description: 'Login credentials or grant type not recognized.',
    type: 'error',
    message:
      'Je e-mailadres of wachtwoord is onjuist. Controleer je inloggegevens en probeer het opnieuw.',
  },
  over_email_send_rate_limit: {
    // it looks like this does not apply to reset password links
    description:
      'Too many emails have been sent to this email address. Ask the user to wait a while before trying again.',
    type: 'error',
    message:
      'Ons systeem kan op dit moment even geen e-mails versturen (bijvoorbeeld voor het bevestigen van je account of het resetten van je wachtwoord). Probeer het over een uur opnieuw.',
  },
  same_password: {
    description:
      'A user that is updating their password must use a different password than the one currently used.',
    type: 'error',
    message: 'Je nieuwe wachtwoord moet anders zijn dan je huidige wachtwoord.',
  },
  weak_password: {
    description:
      'User is signing up or changing their password without meeting the password strength criteria.',
    type: 'error',
    message: 'Je wachtwoord moet moet minimaal 8 tekens lang zijn.',
  },
};

export function getFeedbackByCode(errorCode: string): Feedback {
  const translation = authFeedbackTranslations[errorCode];
  if (translation) {
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { description: _, ...feedback } = translation;
    return feedback;
  }
  return {
    message: `Er is een onbekende fout opgetreden. Foutcode: ${errorCode}`,
    type: 'error',
  };
}
