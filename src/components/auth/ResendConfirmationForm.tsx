'use client';

import Link from 'next/link';
import { type SubmitEvent, useState, useTransition } from 'react';

import Button from '@/components/button/Button';
import { type SimpleAuthResult, resendConfirmationEmail } from '@/lib/supabaseAuth';

import FormFeedback, { type Feedback } from './FormFeedback';

export default function ResendConfirmationForm() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();
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

      {feedback && <FormFeedback message={feedback.message} type={feedback.type} />}

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

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result: SimpleAuthResult = await resendConfirmationEmail(email);
      if (!result.success) {
        setFeedback(result.error.feedback);
        return;
      }
      setSuccessMessageVisible(true);
    });
  }
}
