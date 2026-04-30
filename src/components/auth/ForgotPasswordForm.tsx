'use client';

import Link from 'next/link';
import { type SubmitEvent, useState, useTransition } from 'react';

import Button from '@/components/button/Button';
import { type SimpleAuthResult, resetPasswordForEmail } from '@/lib/supabaseAuth';

import SimpleContent from '../SimpleContent';
import FormFeedback, { type Feedback } from './FormFeedback';

interface Props {
  linkExpired?: boolean;
}

export default function ForgotPasswordForm({ linkExpired }: Props) {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);

  if (successMessageVisible) {
    return (
      <SimpleContent>
        <h1>Link verzonden</h1>
        <p>Check je e-mail — we hebben je een link gestuurd om je wachtwoord aan te passen.</p>
      </SimpleContent>
    );
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

      {feedback && <FormFeedback message={feedback.message} type={feedback.type} />}

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

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result: SimpleAuthResult = await resetPasswordForEmail(email);
      if (!result.success) {
        setFeedback(result.error.feedback);
        return;
      }
      setSuccessMessageVisible(true);
    });
  }
}
