'use client';

import Link from 'next/link';
import { type SubmitEvent, useState } from 'react';

import Button from '@/components/button/Button';
import { type SimpleAuthResult, resendConfirmationEmail } from '@/lib/supabaseAuth';

import FormError from './FormError';

export default function ResendConfirmationForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);

  if (successMessageVisible) {
    return (
      <p>We hebben je een nieuwe link gestuurd om je account te bevestigen. Check je e-mail.</p>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h1>Link niet meer geldig</h1>

      <p>
        De link om je account te bevestigen is niet meer geldig. Vul je e-mailadres in, dan sturen
        we je een nieuwe link.
      </p>

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
        label={isPending ? 'Bezig…' : 'Opnieuw versturen'}
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

    const result: SimpleAuthResult = await resendConfirmationEmail(email);

    if (!result.success) {
      setError(result.error.message);
      setIsPending(false);
      return;
    }

    setSuccessMessageVisible(true);
  }
}
