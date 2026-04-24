type ErrorTranslation = {
  description: string; // what the error code means, just for dev reference
  message: string; // what we show to the user
};

// error codes overview: https://supabase.com/docs/guides/auth/debugging/error-codes#auth-error-codes-table
// I only implement the most common error codes; will return the code if not found.
export const authErrorTranslations: Record<string, ErrorTranslation> = {
  email_exists: {
    description: 'Email address already exists in the system.',
    message: 'Je hebt je al aangemeld met dit e-mailadres. Ga naar inloggen.',
  },
  email_not_confirmed: {
    description: 'Signing in is not allowed for this user as the email address is not confirmed.',
    message:
      'Je account is nog niet bevestigd. Klik op de link in de e-mail die je eerder hebt ontvangen om je account te bevestigen.',
  },
  invalid_credentials: {
    description: 'Login credentials or grant type not recognized.',
    message:
      'Je  e-mailadres of wachtwoord is onjuist. Controleer je inloggegevens en probeer het opnieuw.',
  },
  over_email_send_rate_limit: {
    // it looks like this does not apply to reset password links
    description:
      'Too many emails have been sent to this email address. Ask the user to wait a while before trying again.',
    message:
      'Ons systeem kan op dit moment even geen e-mails versturen (bijvoorbeeld voor het bevestigen van je account of het resetten van je wachtwoord). Probeer het over een uur opnieuw.',
  },
  same_password: {
    description:
      'A user that is updating their password must use a different password than the one currently used.',
    message: 'Je nieuwe wachtwoord moet anders zijn dan je huidige wachtwoord.',
  },
  weak_password: {
    description:
      'User is signing up or changing their password without meeting the password strength criteria.',
    message: 'Je wachtwoord moet moet minimaal 8 tekens lang zijn.',
  },
};

export function getErrorMessageByCode(errorCode: string) {
  const message = authErrorTranslations[errorCode]?.message;
  return message || `Er is een onbekende fout opgetreden. Foutcode: ${errorCode}`;
}
