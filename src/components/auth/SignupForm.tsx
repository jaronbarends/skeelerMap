'use client';

import Link from 'next/link';
import { type SubmitEvent, useState, useTransition } from 'react';

import SimpleContent from '@/components/SimpleContent';
import FormFeedback, { type Feedback } from '@/components/auth/FormFeedback';
import Button from '@/components/button/Button';
import { type AuthResult, signUp } from '@/lib/supabaseAuth';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);

  if (successMessageVisible) {
    return (
      <SimpleContent>
        <h1>Account aangemaakt</h1>
        <p>Je account is aangemaakt. Controleer je e-mail om je account te bevestigen.</p>
      </SimpleContent>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit} aria-label="Registreren">
      <SimpleContent>
        <h1>Registreren</h1>
        <p>Registreer je gratis om zelf segmenten aan te kunnen maken.</p>
      </SimpleContent>

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
        <div className="formItem">
          <label htmlFor="password">Wachtwoord</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <p className="formSecondaryText">Wachtwoord moet minimaal 8 tekens lang zijn.</p>
        </div>
        <div className="formItem">
          <label htmlFor="passwordConfirm">Wachtwoord bevestigen</label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      {feedback && <FormFeedback {...feedback} />}

      <Button
        label={isPending ? 'Bezig…' : 'Registreren'}
        variant="primary"
        type="submit"
        disabled={isPending}
      />

      <p className="formFooter">
        Al een account? <Link href="/inloggen">Inloggen</Link>
      </p>
    </form>
  );

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setFeedback(null);

    if (password !== passwordConfirm) {
      setFeedback({ message: 'Wachtwoorden komen niet overeen', type: 'error' });
      return;
    }

    startTransition(async () => {
      const result: AuthResult = await signUp(email, password);
      if (!result.success) {
        setFeedback(result.error.feedback);
        return;
      }
      setSuccessMessageVisible(true);
    });
  }
}
