'use client';

import Link from 'next/link';
import { type SubmitEvent, useState } from 'react';

import Button from '@/components/button/Button';
import { signUp } from '@/lib/supabaseAuth';

import styles from './SignupForm.module.css';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);

  if (successMessageVisible) {
    return (
      <div className="formPage">
        <div className="form">
          <h1>Account aangemaakt</h1>
          <p className={styles.successMessage}>
            Je account is aangemaakt. Controleer je e-mail om je account te bevestigen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="formPage">
      <form className="form" onSubmit={handleSubmit}>
        <h1>Aanmelden</h1>

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

        {error && <div className="formError">{error}</div>}

        <Button
          label={isPending ? 'Bezig…' : 'Aanmelden'}
          variant="primary"
          type="submit"
          disabled={isPending}
        />

        <p className="formFooter">
          Al een account? <Link href="/login">Inloggen</Link>
        </p>
      </form>
    </div>
  );

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    setIsPending(true);

    const { error: authError } = await signUp(email, password);

    if (authError) {
      setError(authError.message);
      setIsPending(false);
      return;
    }

    setSuccessMessageVisible(true);
  }
}
