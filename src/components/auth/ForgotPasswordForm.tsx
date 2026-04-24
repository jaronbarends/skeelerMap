'use client';

import Link from 'next/link';
import { type SubmitEvent, useState } from 'react';

import Button from '@/components/button/Button';
import { type SimpleAuthResult, resetPasswordForEmail } from '@/lib/supabaseAuth';

import FormError from './FormError';

interface Props {
  linkExpired?: boolean;
}

export default function ForgotPasswordForm({ linkExpired }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);

  if (successMessageVisible) {
    return <p>Check je e-mail — we hebben je een link gestuurd.</p>;
  }

  const title = linkExpired ? 'Link niet meer geldig' : 'Wachtwoord vergeten?';
  const intro = linkExpired
    ? 'De link om je wachtwoord aan te passen is niet meer geldig. Vraag een nieuwe link aan.'
    : 'Dat gebeurt ons allemaal weleens. Wat is je e-mailadres? Dan zenden we je binnen enkele minuten een linkje om een nieuw wachtwoord in te stellen.';

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h1>{title}</h1>

      <p>{intro}</p>

      <div className="formGroup">
        <div className="formItem">
          <label htmlFor="email">E-mailadres</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
      </div>

      {error && <FormError message={error} />}

      <Button
        label={isPending ? 'Bezig…' : 'Verzenden'}
        variant="primary"
        type="submit"
        disabled={isPending}
      />

      <p className="formFooter">
        <Link href="/inloggen">Terug naar inloggen</Link>
      </p>
    </form>
  );

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const result: SimpleAuthResult = await resetPasswordForEmail(email);

    if (!result.success) {
      setError(result.error.message);
      setIsPending(false);
      return;
    }

    setSuccessMessageVisible(true);
  }
}
