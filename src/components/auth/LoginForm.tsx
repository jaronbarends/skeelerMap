'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { signIn } from '@/lib/supabaseAuth';

import styles from './LoginForm.module.css';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.heading}>Inloggen</h1>

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
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.submit} type="submit" disabled={isPending}>
          {isPending ? 'Bezig…' : 'Inloggen'}
        </button>

        <p className={styles.signupLink}>
          Nog geen account? <Link href="/signup">Meld je aan</Link>
        </p>
      </form>
    </div>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError.message);
      setIsPending(false);
      return;
    }

    // no need to call setIsPending(false) here: the component unmounts via navigation, so resetting it would cause a state update on an unmounted component.
    router.push('/?toast=logged-in');
  }
}
