'use client';

import Link from 'next/link';
import { type SubmitEvent, useState } from 'react';

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
      <div className={styles.page}>
        <div className={styles.form}>
          <p className={styles.successMessage}>Controleer je e-mail om je account te bevestigen</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.heading}>Aanmelden</h1>

        <div className={styles.fields}>
          <div className={styles.formItem}>
            <label className={styles.label} htmlFor="email">
              E-mailadres
            </label>
            <input
              id="email"
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className={styles.formItem}>
            <label className={styles.label} htmlFor="password">
              Wachtwoord
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className={styles.formItem}>
            <label className={styles.label} htmlFor="passwordConfirm">
              Wachtwoord bevestigen
            </label>
            <input
              id="passwordConfirm"
              className={styles.input}
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.submit} type="submit" disabled={isPending}>
          {isPending ? 'Bezig…' : 'Aanmelden'}
        </button>

        <p className={styles.loginLink}>
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
